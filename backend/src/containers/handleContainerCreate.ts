import Docker from 'dockerode';
import { WebSocketServer, WebSocket } from 'ws';
import { Socket as NetSocket } from 'node:net';
import { IncomingMessage } from 'node:http';

const docker = new Docker();

export const listContainer = async () => {
  const containers = await docker.listContainers();
  console.log('real', containers);
  containers?.forEach((container: any) => {
    console.log('ports: ', container.Ports, container.Names);
  });
};

export const handleContainerCreate = async ({
  projectId,
  webSocketTerminal,
  req,
  socket,
  head,
}: {
  projectId: string;
  webSocketTerminal: WebSocketServer;
  req: IncomingMessage;
  socket: NetSocket;
  head: Buffer;
}) => {
  try {
    // 1️⃣ Stop & remove old container if exists
    try {
      const containerFound = docker.getContainer(projectId);
      const info = await containerFound.inspect();

      if (info.State.Running) {
        await containerFound.stop();
        console.log('container stopped');
      }

      await containerFound.remove({ force: true });
      console.log('container removed');
    } catch {
      console.log('Container not found or already removed');
    }

    // 2️⃣ Create new container

    const container = await docker.createContainer({
      Image: 'sandbox',
      AttachStdin: true,
      AttachStdout: true,
      name: projectId,
      AttachStderr: true,
      Cmd: ['/bin/bash'],
      Tty: true,
      User: 'sandbox',
      HostConfig: {
        Binds: [`${import.meta.dirname}/../../projects/${projectId}:/home/sandbox/app`],
        PortBindings: { '5173/tcp': [{ HostPort: '0' }] },
      },
      ExposedPorts: { '5173/tcp': {} },
      Env: [
        'HOST=0.0.0.0',
        'CHOKIDAR_USEPOLLING=true',
        'WATCHPACK_POLLING=true',
        'VITE_FORCE_POLLING=true',
        'CHOKIDAR_INTERVAL=500',
      ],
    });

    await container.start();
    console.log('container created & started:', container.id);

    // 3️⃣ Upgrade the WS connection after container is ready
    webSocketTerminal.handleUpgrade(req, socket, head, (establisedWsConn: WebSocket) => {
      console.log('About to handle upgrade connection');
      webSocketTerminal.emit('connection', establisedWsConn, req, container);
      console.log('Emitted to connection');
    });
  } catch (err) {
    console.error(err);
  }
};

export const getContainerPort = async (containerName: string): Promise<string | null> => {
  const container = docker.getContainer(containerName);
  const info = await container.inspect();

  const ports = info?.NetworkSettings?.Ports?.['5173/tcp'];
  if (Array.isArray(ports) && ports.length > 0) {
    console.log(ports[0]?.HostPort ?? null);
    return ports[0]?.HostPort ?? null;
  }
  return null;
};
