import { Container } from 'dockerode';
import Stream, { Duplex } from 'node:stream';
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
        },
        (err, stream) => {
          if (err) {
            console.log('Error occured while executing container', err);
            return;
          }
          //process stream
          processStreamOutput(stream, ws);

          //writing stream
          ws.on('message', (data) => {
            stream?.write(data);
          });
        },
      );
    },
  );
};

function processStreamOutput(stream: Duplex | undefined, ws: WebSocket) {
  let nextDataType: number | null = null; // stores type of next data
  let nextDataLength: number | null = null; // stores length of next data
  let buffer: Buffer = Buffer.alloc(0);

  function bufferSlicer(end: number): Buffer {
    // slice buffer and update remaining buffer
    const output = buffer.subarray(0, end);
    buffer = buffer.subarray(end);
    return output;
  }

  function processStreamData(data?: Buffer) {
    if (data && data.length > 0) {
      buffer = Buffer.concat([buffer, data]);
    }

    if (nextDataType === null) {
      // Need header (8 bytes)
      if (buffer.length >= 8) {
        const header = bufferSlicer(8);
        nextDataType = header.readUInt32BE(0);
        nextDataLength = header.readUInt32BE(4);

        processStreamData(); // recursive continue
      }
    } else {
      if (nextDataLength !== null && buffer.length >= nextDataLength) {
        const content = bufferSlicer(nextDataLength);

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(content);
        }

        nextDataType = null;
        nextDataLength = null;

        processStreamData(); // recursive continue
      }
    }
  }

  stream?.on('data', processStreamData);
}
