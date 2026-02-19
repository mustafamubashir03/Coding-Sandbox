import express from 'express';
import { createServer, IncomingMessage } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { Container } from 'dockerode';
import { Socket as NetSocket } from 'node:net';
import { handleTerminalCreation } from './containers/handleTerminalCreation.js';
import { TERMINAL_PORT } from './config/serverConfig.js';
import { handleContainerCreate } from './containers/handleContainerCreate.js';

const app = express();
const server = createServer(app);

server.listen(TERMINAL_PORT, () => {
  console.log('Terminal Server has been started at port', TERMINAL_PORT);
});

// Use noServer: true since we handle upgrade manually
const webSocketTerminal = new WebSocketServer({ noServer: true });

// Map to track which container belongs to which WS connection
const wsContainerMap = new Map<WebSocket, Container>();

// Handle raw upgrade requests
server.on('upgrade', async (req: IncomingMessage, socket: NetSocket, head: Buffer) => {
  const isTerminal = req.url?.includes('/terminal');
  if (!isTerminal) return;

  const projectId = req.url?.split('=')[1];
  if (!projectId) return;

  try {
    // Create/start the container AND upgrade the WS
    await handleContainerCreate({
      projectId,
      webSocketTerminal,
      req,
      socket, // only one socket, updated signature
      head,
    });

    console.log('Container ready and WS upgrade handled');
  } catch (err) {
    console.error('Error creating container or handling upgrade:', err);
    socket.destroy();
  }
});

// Handle WS connection after upgrade
webSocketTerminal.on('connection', (ws: WebSocket, req: IncomingMessage, container: Container) => {
  console.log('Terminal WS connected');

  // Store container reference for this WS
  wsContainerMap.set(ws, container);

  handleTerminalCreation({ ws, container });

  ws.on('getPort', () => {
    console.log('get port event received');
  });

  ws.on('close', async () => {
    try {
      console.log('WS closed → stopping container');

      const containerToStop = wsContainerMap.get(ws);
      if (containerToStop) {
        await containerToStop.stop();
        console.log('Container stopped (not removed)');
        wsContainerMap.delete(ws);
      }
    } catch (err) {
      console.error('Stop error', err);
    }
  });
});
