import express from 'express';
import cors from 'cors';
import { PORT } from './config/serverConfig.js';
import apiRouter from './routes/index.js';
import { createServer } from 'node:http';
import chokidar from 'chokidar';
import { Server } from 'socket.io';
import { handleEditorSocketEvents } from './socketHandlers/editorHandler.js';

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
editorNamespace.on('connection', (socket) => {
  const { projectId } = socket.handshake.auth;
  console.log('Project id recievedd from client', projectId);
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

server.listen(PORT, () => {
  console.log('Server has been started at port', PORT);
});
