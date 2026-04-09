import Docker from 'dockerode';
import { WebSocketServer, WebSocket } from 'ws';
import { Socket as NetSocket } from 'node:net';
import { IncomingMessage } from 'node:http';
import fs from 'fs/promises';
import path from 'path';

const docker = new Docker();

export const listContainer = async () => {
  const containers = await docker.listContainers();
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
        Memory: 2147483648,
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
    const port = await getContainerPort(projectId);
    
    if (port) {
      try {
        const projectPath = path.join(import.meta.dirname, `../../projects/${projectId}`);
        
        // Ensure the directory exists explicitly before attempting internal scans
        await fs.mkdir(projectPath, { recursive: true });

        // AWAIT PROJECT SCAFFOLDING (RACE CONDITION FIX)
        // Since projectService runs `npx create-vite` simultaneously, package.json may not exist yet.
        const packageJsonPath = path.join(projectPath, 'package.json');
        let attempts = 0;
        let packageJsonData = null;
        while (attempts < 20) {
          try {
            packageJsonData = await fs.readFile(packageJsonPath, 'utf-8');
            break; // Successfully located
          } catch (e) {
            attempts++;
            await new Promise((r) => setTimeout(r, 1000));
          }
        }

        if (packageJsonData) {
          // 1. Rewrite vite.config.js (Ensuring .js preference)
          const viteConfigPath = path.join(projectPath, 'vite.config.js');
          try { await fs.unlink(path.join(projectPath, 'vite.config.ts')); } catch (e) {} // Clean up old .ts config
          const viteConfigContent = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 100
    },
    hmr: {
      clientPort: ${port}
    }
  },
  optimizeDeps: {
    force: true
  }
})
`;
          await fs.writeFile(viteConfigPath, viteConfigContent, 'utf-8');

          // 2. Update package.json scripts (clean command)
          try {
            const packageJson = JSON.parse(packageJsonData);
            if (packageJson.scripts && packageJson.scripts.dev) {
              packageJson.scripts.dev = 'vite';
              await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
            }
          } catch(e) {
            console.error('Could not parse package.json:', e);
          }
        } else {
          console.error('[Error] Scaffolding timeout: package.json failed to generate.');
        }
      } catch (err) {
        console.error('Error injecting Vite config:', err);
      }
    }

    try {
      // 3. Clean up node_modules/.vite inside the container
      const exec = await container.exec({
        Cmd: ['bash', '-c', 'rm -rf node_modules/.vite'],
        AttachStdout: true,
        AttachStderr: true
      });
      await exec.start({});
      console.log('Cleaned .vite cache in container');
    } catch (e) {
      console.error('Failed to clean .vite cache', e);
    }

    socket.emit('getPortSuccess', { port });
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
