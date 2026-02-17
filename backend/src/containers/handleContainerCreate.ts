import Docker from 'dockerode';
import { WebSocketServer } from 'ws';
import { Socket as NetSocket } from 'node:net';
import { IncomingMessage } from 'node:http';
import { WebSocket } from 'ws';

const docker = new Docker();

export const handleContainerCreate = async ({
  projectId,
  tcpSocket,
  webSocketTerminal,
  head,
  req,
}: {
  projectId: string;
  webSocketTerminal: WebSocketServer;
  tcpSocket: NetSocket;
  head: Buffer;
  req: IncomingMessage;
}) => {
  try {
    console.log('project id ', projectId);
    console.log(import.meta.dirname);
    const container = await docker.createContainer({
      Image: 'sandbox',
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Cmd: ['/bin/bash'],
      Tty: true,
      User: 'sandbox',
      Volumes: {
        '/home/sandbox/app': {},
      },
      HostConfig: {
        Binds: [`${import.meta.dirname}/../../projects/${projectId}:/home/sandbox/app`],
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
    webSocketTerminal.handleUpgrade(req, tcpSocket, head, (establisedWsConn: WebSocket) => {
      webSocketTerminal.emit('connection', establisedWsConn, req, container);
    });
    // container.exec({
    //     Cmd:['/bin/bash'],
    //     User:"sandbox",
    //     AttachStderr:true,
    //     AttachStdin:true,
    //     AttachStdout:true
    // },(err,exec)=>{
    //     if(err){
    //         console.log("error while creating exec")
    //         return
    //     }
    //     exec?.start({
    //         hijack:true
    //     },(err,stream)=>{
    //         if(err){
    //             console.log("Error while creating exec")
    //             return
    //         }
    //         // processStream(stream,socket)
    //         // socket.on('shell-input',(data)=>{
    //         //     console.log("stream data",data)
    //         //     stream?.write('pwd\n')
    //         // })
    //     })
    // })
  } catch (err) {
    console.log(err);
  }
};

// function processStream(stream:Duplex | undefined,socket:Socket){
//     let buffer = Buffer.from("");
//     stream?.on("data",(data)=>{
//         buffer = Buffer.concat([buffer,data]);
//         socket.emit('shell-output',buffer.toString())
//         buffer = Buffer.from("");
//     })

//     stream?.on("end",()=>{
//         console.log("Stream ended")
//         socket.emit("shell-output","Stream ended")
//     })

//     stream?.on("error",(err)=>{
//         console.log("stream error",err)
//         socket.emit("shell-output","stream err")
//     })
// }
