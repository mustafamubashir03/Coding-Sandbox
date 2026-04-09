# DevPlayground IDE

DevPlayground is a highly resilient **local web-based IDE** powered by robust container virtualization. It allows you to provision entire React workspaces on the fly, edit your files dynamically in the browser, and natively access a Dockerized shell attached seamlessly to your project environment via isolated `.bash` sub-instances.

---

## 🏗️ Monorepo Architecture

The ecosystem relies on an explicitly decoupled Monorepo structure containing resilient cross-talk bridging:

### `frontend/` (Vite, React, TypeScript)
- **Monaco Editor**: Provides a VSCode-caliber native editing experience inside the browser.
- **Xterm.js**: Replicates a genuine Linux terminal interface fully piped via generic WebSocket.
- **Dynamic IDE Grid**: Built using `allotment` split-panes to resize Project Files, Code Viewer, local CLI, and the Dev Server Iframe preview.
- **Zustand State Engine**: Stores Atomic states for active tabs natively without causing aggressive rendering bottlenecks.

### `backend/` (Express, Node, Dockerode, Sockets)
- **RESTful Orchestrator**: Provisions distinct workspaces natively on the disk structure.
- **Socket.io Editor Stream**: High-throughput file tracking. Reads and writes directly over an established namespace avoiding HTTP bottlenecks. Native `chokidar` polling runs safely on the user's host volumes.
- **Dockerode VM Orchestrator**: Spins up isolated virtual Linux boxes bound strictly dynamically to allocated `ports`. It enforces heavy 2GB runtime buffers preventing Windows/Docker memory limits.
- **Raw WebSockets IPC**: Avoids Socket.io latency on standard IO `/terminal` logs, giving immediate multiplexed `stream` access from the Virtual Sandbox.

---

## 🚀 Setup & Initialization (Local Dev)

### Prerequisites
- **Node.js 20+**
- **Docker Desktop / Docker Engine** (Ensure WSL2 backend is running securely on Windows systems).

### 1️⃣ Build the Sandbox Virtual Environment
The backend orchestration scripts clone specific environments out of a base image called **`sandbox`**. This image explicitly exposes `5173` locally.

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

Create `backend/.env` (gitignored):
```bash
PORT=3000
TERMINAL_PORT=4000
# Command used to natively scaffold the initial React directory inside dynamically created projects.
# Must be strictly non-interactive.
REACT_PROJECT_COMMAND=npx --yes create-vite@latest . --template react-ts
```

Start the `tsx` live compiler:
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
# Explicitly sync to Express Port
VITE_BACKEND_URL=http://localhost:3000
```

Start Vite:
```bash
npm run dev
```
Open your deployment browser URL (typically `http://localhost:5173`).

---

## 🎮 The Deployment Workflow Context

DevPlayground behaves identically to modern cloud solutions (such as Replit). Once you create your project:
1. The backend triggers a raw folder generation securely tracked against `backend/projects/<uuid>`.
2. A generic CLI terminal will instantly connect, resting statically in an isolated `/bin/bash` root session.  
3. A native UI button `▶ Start Browser` pushes an automation script via generic web sockets into your CLI dynamically formatting dependencies (`npm install && npm run dev -- --host 0.0.0.0`).
4. The backend dynamically intercepts runtime boundaries on `vite.config` routing it specifically for Windows polling capabilities preventing stale node chunk issues.

---

## 📡 API Reference Overview

### REST (HTTP) Defaults
- **Health**: `GET /health` → `{ "server": "ok" }`
- **Creation Endpoint**: `POST /api/v1/projects` → Triggers the heavy `create-vite` CLI scaffold natively asynchronously. Returns a `projectId`.
- **VFS (Virtual File System) Sync**: `GET /api/v1/projects/:projectId/tree` → Generates directory traversals cleanly normalizing POSIX separators.

### IPC Core Channels
- **Editor Synapse (Socket.IO)**: Tracks over the `/editor` namespace performing heavy file manipulations securely.
- **Terminal WebSockets**: Native `/terminal?projectId=<id>` attachment bridging uncorrupted shell buffers securely allowing visual package installations!
