import { Container } from 'dockerode';
import { WebSocket } from 'ws';

export const handleTerminalCreation = ({
  ws,
  container,
}: {
  ws: WebSocket;
  container: Container;
}) => {
  container.exec(
    {
      Cmd: ['/bin/bash'],
      AttachStderr: true,
      AttachStdin: true,
      AttachStdout: true,
      Tty: true,
      User: 'sandbox',
    },
    (err, exec) => {
      if (err) {
        console.log('Error while preparing exec', err);
        return;
      }

      exec?.start(
        {
          hijack: true,
          Tty: true,
        },
        (err, stream) => {
          if (err) {
            console.log('Error occurred while executing container', err);
            return;
          }

          // pipe container output → WebSocket
          stream?.on('data', (data: Buffer) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(data);
            }
          });

          // pipe WebSocket input → container stdin
          const onMessage = (data: Buffer) => {
            stream?.write(data);
          };
          ws.on('message', onMessage);

          // cleanup on close
          ws.on('close', () => {
            stream?.end();
            ws.removeListener('message', onMessage);
          });

          stream?.on('end', () => {
            if (ws.readyState === WebSocket.OPEN) ws.close();
          });
        },
      );
    },
  );
};
