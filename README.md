# DevPlayground

DevPlayground is a **local web-based playground** that lets you:

- Create a React project workspace
- Browse a file tree, open files, and edit them in the browser
- Use a terminal backed by a Docker container

This repo is a monorepo:

- `frontend/`: Vite + React UI (file tree, editor, terminal)
- `backend/`: Express API + realtime channels for editor + terminal, plus Docker integration

---

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
