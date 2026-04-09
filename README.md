# DevPlayground

DevPlayground is a **local web-based playground** that lets you:

- Create a React project workspace
- Browse a file tree, open files, and edit them in the browser
- Use a terminal backed by a Docker container

This repo is a monorepo heavily utilizing isolated virtualization and bidirectional websocket bridging:

- **`frontend/`**: Vite + React UI ecosystem. Features an embedded Monaco Editor mapping dynamically mounted VFS directories, Xterm.js for authentic proxying to raw Docker `/bin/bash` TCP shells, and resilient Atomic Zustand states to orchestrate split-pane IDE layouts gracefully. 
- **`backend/`**: Express API + real-time IPC multiplexer (Socket.io namespace `/editor`, native `ws` `/terminal`). Integrates deeply with Dockerode to spin up unprivileged `container` silos mapped directly to host ports strictly bypassing `localhost` CORS friction.

---

### Prerequisites
- **Node.js 20+**
- **Docker Desktop / Docker Engine** (Ensure your Windows Subsystem for Linux (WSL2) or Docker Virtual Machine is configured smoothly as DevPlayground mounts memory-mapped polling directly into these environments!).

---

## 🚀 Setup & Initialization (Local Dev)

### 1️⃣ Build the Sandbox Virtual Environment
The backend orchestration scripts spin up projects explicitly out of a base system image called **`sandbox`**. This image natively configures `bash`, defines proper `app` WorkDirs, and exposes `5173` routing parameters for proxy forwarding. 

To construct this image the first time:
```bash
cd backend
docker build -t sandbox .
```

### 2️⃣ Start Backend Orchestrator
```bash
cd backend
npm install
```

Create `backend/.env` (gitignored). Note the critical `TERMINAL_PORT` mapping for Docker IPC!
```bash
PORT=3000
TERMINAL_PORT=4000

# Command used natively to execute Vite React initializations rapidly without interactive prompts. 
REACT_PROJECT_COMMAND=npx --yes create-vite@latest . --template react-ts
```

Start the live Typescript watch compiler:
```bash
npm run dev
```

### 3️⃣ Start Frontend UI
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```bash
# Explicitly synchronizing REST schemas to backend routing.
VITE_BACKEND_URL=http://localhost:3000
```

Start Vite local host:
```bash
npm run dev
```
Open your deployment browser URL (typically `http://localhost:5173`).

---

## 🎮 The Deployment Workflow Context

DevPlayground mitigates caching and compilation bottlenecks by behaving predictably in sequential orchestration mappings. Once you create your project:
1. The backend triggers a raw folder generation securely tracked against `backend/projects/<uuid>`.
2. A generic CLI terminal will instantly connect via TCP sockets, resting statically in an isolated `/bin/bash` root Docker session safely sandboxed.
3. A native UI button `▶ Start Browser` pushes an automation script explicitly formatted over websockets into your CLI parsing heavily optimized container dependencies (`npm install && npm run dev -- --host 0.0.0.0`).
4. The backend cleanly intercepts startup and overwrites `vite.config.js` natively configuring `.css` caching skips via `optimizeDeps` bounds and Windows standard polling sequences to ensure filesystem events map flawlessly across WSL2.

---

## 📡 API Reference Overview

### HTTP Handlers API (Express/REST)
- **Health Check**: `GET /health` → `{ "server": "ok" }`
- **Provision Container**: `POST /api/v1/projects` → Spawns the internal directory scaffolds dynamically returning a bound `projectId` context ID constraint.
- **VFS (Virtual File System) Crawl**: `GET /api/v1/projects/:projectId/tree` → Recursively generates directory traversals masking filesystem data behind `chokidar`.

### Inter-Process Communication Streams (IPC/Sockets)
- **File System Synchronizer (Socket.IO)**: Hosted strictly over the `/editor` namespace parsing explicit file read/write I/O securely without HTTP blocking.
- **Docker Multiplexer (Raw WS)**: Attached via the `/terminal?projectId=<id>` connection upgrading the port streams. Bypasses standard REST handling rendering uncorrupted Linux shell capabilities securely inside the Host IDE!
