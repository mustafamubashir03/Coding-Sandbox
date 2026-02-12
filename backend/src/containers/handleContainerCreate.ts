import Docker from 'dockerode';
import { Socket } from 'socket.io';

const docker = new Docker();

export const handleContainerCreate = async ({
  projectId,
  socket,
}: {
  projectId: string;
  socket: Socket;
}) => {
  try {
    console.log('project id ', projectId);
    const container = await docker.createContainer({
      Image: 'sandbox',
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Cmd: ['/bin/bash'],
      Tty: true,
      User: 'sandbox',
      HostConfig: {
        Binds: [`${import.meta.dirname}/projects/${projectId}:/home/sandbox/app`],
        PortBindings: {
          '5173/tcp': [
            {
              HostPort: '0',
            },
          ],
        },
      },
      ExposedPorts: {
        '5173/tcp': {},
      },
      Env: ['HOST=0.0.0.0'],
    });
    console.log('container created', container.id);
    await container.start();
    console.log('container started successfully');
  } catch (err) {
    console.log(err);
  }
};
