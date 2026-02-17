import express from 'express';
import cors from 'cors';
import { PORT } from './config/serverConfig.js';
import apiRouter from './routes/index.js';
import { createServer, IncomingMessage } from 'node:http';
import chokidar from 'chokidar';
import { Server } from 'socket.io';
import { handleEditorSocketEvents } from './socketHandlers/editorHandler.js';
import { handleContainerCreate } from './containers/handleContainerCreate.js';
import { WebSocketServer } from 'ws';
import { WebSocket } from 'ws';
import { Container } from 'dockerode';
import { Socket as NetSocket } from 'node:net';
import { handleTerminalCreation } from './containers/handleTerminalCreation.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.get('/health', (req, res) => {
  res.json({ server: 'ok' });
});

app.use('/api', apiRouter);
io.on('connection', (socket) => {
  console.log('a user connected', socket.id);
});
let watcher: any = null;
const editorNamespace = io.of('/editor');
// const terminalNamespace = io.of('/terminal');
editorNamespace.on('connection', (socket) => {
  const { projectId } = socket.handshake.auth;
  if (projectId) {
    watcher = chokidar.watch(`./projects/${projectId}`, {
      ignored: (path) => path.includes('node_modules'),
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
      },
      ignoreInitial: true,
    });

    watcher.on('all', (event: any, path: any) => {
      console.log(event, path);
    });
  }
  handleEditorSocketEvents(socket, editorNamespace);
  socket.on('disconnect', async () => {
    if (watcher) {
      await watcher.close();
      console.log('editor disconnected');
    }
  });
});

// terminalNamespace.on('connection', (socket) => {
//   const { projectId } = socket.handshake.auth;
//   console.log('terminal connected', socket.id);
//   socket.on('shell-input', (data) => {
//     console.log(data);
//     terminalNamespace.emit('shell-output', data);
//   });
//   socket.on('disconnect', () => {
//     console.log('terminal disconnected');
//   });
//   handleContainerCreate({ projectId, socket });
// });

server.listen(PORT, () => {
  console.log('Server has been started at port', PORT);
});

const webSocketTerminal = new WebSocketServer({
  noServer: true,
});

server.on('upgrade', (req: IncomingMessage, tcpSocket: NetSocket, head: Buffer) => {
  /**
   * req: incoming http request
   * tcpSocket: TCP socket..not to confuse with web socket ...this is just a tcp connection
   * head: Buffer containing first packet of the upgraded stream
   *
   */
  const isTerminal = req.url?.includes('/terminal');

  if (isTerminal) {
    console.log('url', req.url);

    const projectId = req.url?.split('=')[1];
    console.log(projectId);

    if (projectId) {
      handleContainerCreate({ projectId, webSocketTerminal, req, tcpSocket, head });
    }
  }
});

/**
 * this ws connection is interacting with frontend client after the http request via
 * tcp connection has been upgraded to Tcp using the handlContainerCreate() function.
 * We are making sure that the raw ws connection with terminal first initialized the docker container
 * and then set the ws connection with that docker container. Then it would emit and event "connection"
 * indicating the client the form connecion  with this container to further execute the container.
 */
webSocketTerminal.on('connection', (ws: WebSocket, req: IncomingMessage, container: Container) => {
  console.log('Terminal connected', ws, req, container);
  handleTerminalCreation({ ws, container });
  ws.on('close', () => {
    container.remove({ force: true }, (err, data) => {
      if (err) {
        console.log('Error while removing container', err);
      }
      console.log('Container removed', data);
    });
  });
});
