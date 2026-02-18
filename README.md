# DevPlayground (Local Docker Sandbox + Web IDE)

DevPlayground is a **local “cloud IDE” style playground**:

- Create a fresh React project workspace (backend scaffolds it on disk)
- Browse the project file tree in the browser
- Open files and edit them (writes go to disk via Socket.IO)
- Open an interactive terminal that attaches to an **isolated Docker container** with the project mounted inside

This repo is a monorepo:

- `frontend/`: Vite + React UI (file tree, Monaco editor, xterm terminal)
- `backend/`: Express API + Socket.IO “editor” channel + raw WebSocket “terminal” channel + Docker container orchestration

---

### What you can do today

- **Create a project**: `POST /api/v1/projects` → backend creates `backend/projects/<uuid>` and runs a scaffold command.
- **Load the file tree**: `GET /api/v1/projects/:projectId/tree`
- **Edit files**: Socket.IO namespace `/editor` supports `readFile`, `writeFile`, `createFile`, `renameFile`, `deleteFile`, `createFolder` (and `deleteFolder`, see Known Issues).
- **Use the terminal**: browser connects to `ws://<backend>/terminal?projectId=<uuid>` → backend starts a Docker container and bridges the container shell to the browser via WebSocket.

---

### High-level architecture (how data flows)

```text
Browser (React)
  |  HTTP (Axios)                 Socket.IO (Editor)                      WebSocket (Terminal)
  |                               (namespace: /editor)                    (path: /terminal?projectId=...)
  v
Backend (Express + Socket.IO + ws)
  |
  |  filesystem (projects live on host disk)
  v
backend/projects/<projectId>  <---- mounted into Docker container ---->  /home/sandbox/app
                                    (Image: "sandbox")
```

---

### Repo structure (important folders)

```text
.
├─ backend/
│  ├─ src/
│  │  ├─ index.ts                       # Express + Socket.IO + WebSocket upgrade handler
│  │  ├─ routes/v1/projects.ts           # REST API for project creation + tree
│  │  ├─ services/projectService.ts      # scaffolding + directory tree
│  │  ├─ socketHandlers/editorHandler.ts # Socket.IO events for file ops
│  │  └─ containers/
│  │     ├─ handleContainerCreate.ts     # Docker container create/start + WS upgrade
│  │     └─ handleTerminalCreation.ts    # docker exec + stream bridge to ws
│  ├─ Dockerfile                         # Docker image used for sandbox containers (tag: "sandbox")
│  └─ projects/                           # created workspaces (gitignored)
└─ frontend/
   ├─ src/
   │  ├─ pages/CreateProject.tsx          # "Create playground" UI
   │  ├─ pages/ProjectPlayground.tsx      # editor layout + socket setup
   │  ├─ apis/projects.ts                # HTTP API calls
   │  └─ components/.../TerminalComponent.tsx # xterm + AttachAddon (WebSocket)
   └─ ...
```

---

### Prerequisites

- **Node.js 20+** (backend + frontend)
- **Docker Desktop** (Windows/macOS) or Docker Engine (Linux)
  - On Windows: Docker Desktop with WSL2 backend is recommended

---

### Quickstart (local development)

#### 1) Build the sandbox Docker image (required for terminal)

The backend starts containers using Docker image name **`sandbox`**. Build it once:

```bash
docker build -t sandbox ./backend
```

What this image contains (today):
- Node 20 base image
- A `sandbox` Linux user
- Minimal tools (`nano`, `curl`)
- Working directory set to `/home/sandbox/app`

#### 2) Backend setup

Install dependencies:

```bash
cd backend
npm install
```

Create `backend/.env` (this file is **gitignored**) with at least:

```bash
PORT=3000

# This command is executed inside: backend/projects/<projectId>
# It MUST be non-interactive, because the backend runs it programmatically.
#
# Recommended:
REACT_PROJECT_COMMAND=npx --yes create-vite@latest . --template react-ts
```

Run the backend:

```bash
npm run dev
```

Backend will listen on `http://localhost:3000` by default.

#### 3) Frontend setup

Install dependencies:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```bash
VITE_BACKEND_URL=http://localhost:3000
```

Run the frontend:

```bash
npm run dev
```

Open the printed Vite URL (typically `http://localhost:5173`).

---

### End-to-end user flow (what happens when you click around)

#### Create Project page (`/`)

- You click **Create React Playground**
- Frontend calls:
  - `POST /api/v1/projects`
- Backend:
  - Generates a UUID
  - Creates folder `backend/projects/<uuid>`
  - Runs `REACT_PROJECT_COMMAND` with `cwd=backend/projects/<uuid>`
- Frontend navigates to:
  - `/projects/:projectId`

#### Project Playground page (`/projects/:projectId`)

On mount:

- **Editor Socket**: frontend connects to Socket.IO namespace:
  - Example:

```js
io(`${import.meta.env.VITE_BACKEND_URL}/editor`, { auth: { projectId } });
```
- **Terminal WebSocket**: frontend opens:
  - `ws://localhost:3000/terminal?projectId=<projectId>` (currently hardcoded; see Known Issues)
- **Tree fetch**: frontend loads the file tree via:
  - `GET /api/v1/projects/:projectId/tree`

When you click a file in the tree:

- Frontend emits Socket.IO event `readFile`
- Backend reads from disk and returns the contents
- Frontend loads the file into Monaco editor

When you type in Monaco:

- After 2 seconds of inactivity, frontend emits `writeFile`
- Backend writes to disk and broadcasts `writeFileSuccess`

When you open the terminal:

- Backend creates a Docker container and `exec`s `/bin/bash`
- Terminal I/O is bridged:
  - Browser keystrokes → WebSocket message → docker exec stdin
  - docker exec stdout → WebSocket message → rendered by xterm

---

## API Documentation

### REST (HTTP)

Base URL is the backend server (default `http://localhost:3000`).

#### `GET /health`

Response:

```json
{ "server": "ok" }
```

#### `GET /api/v1`

Response:

```json
{ "message": "You are at v1" }
```

#### `POST /api/v1/projects`

Creates a new project directory on the backend and runs the scaffold command.

Response:

```json
{
  "success": true,
  "message": "Project created",
  "data": "f48b5522-0ac5-4a24-8a90-2788083df1c7"
}
```

#### `GET /api/v1/projects/:projectId/tree`

Returns a normalized directory tree.

Response shape:

```json
{
  "success": true,
  "message": "Project Tree Fetched",
  "data": {
    "name": "f48b5522-0ac5-4a24-8a90-2788083df1c7",
    "relativePath": "",
    "children": [
      { "name": "src", "relativePath": "src", "children": [] }
    ]
  }
}
```

---

### Realtime Editor API (Socket.IO)

- **Namespace**: `/editor`
- **Auth**: pass `projectId` in `socket.handshake.auth`

#### Client → Server events

- **`readFile`**
  - Payload:
    - `projectId: string`
    - `pathToFileFolder: string` (relative to the project root, uses `/` separators in the UI)

- **`writeFile`**
  - Payload:
    - `projectId: string`
    - `pathToFileFolder: string`
    - `data: string`

- **`createFile`**
  - Payload:
    - `projectId: string`
    - `pathToFileFolder: string` (folder path)
    - `fileName: string`

- **`renameFile`**
  - Payload:
    - `projectId: string`
    - `pathToFileFolder: string` (existing file path)
    - `newFileName: string` (file name only; it is placed in the same folder)

- **`deleteFile`**
  - Payload:
    - `projectId: string`
    - `pathToFileFolder: string`

- **`createFolder`**
  - Payload:
    - `projectId: string`
    - `pathToFileFolder: string` (parent folder)
    - `folderName: string`

- **`deleteFolder`**
  - Payload (current backend handler only reads `pathToFileFolder`):
    - `pathToFileFolder: string`

- **`getPort`**
  - Payload: none
  - Current behavior: backend logs Docker container port mappings; no response is emitted yet.

#### Server → Client events

- **`readFileSuccess`**
  - Payload:
    - `value: string` (file contents)
    - `path: string` (same path you asked for)

- **`readFileError`**
  - Payload:
    - `data: string`

- **`writeFileSuccess`** (broadcast to the whole `/editor` namespace)
  - Payload:
    - `data: string`
    - `path: string`

- **`writeFileError`**
  - Payload:
    - `data: string`

- **`createFileSuccess`**, **`createFileError`**
- **`renameFileSuccess`**, **`renameFileError`**
- **`deleteFileSuccess`**, **`deleteFileError`**
- **`createFolderSuccess`**, **`createFolderError`**
- **`deleteFolderSuccess`**, **`deleteFolderError`**

---

### Terminal API (raw WebSocket)

- **Endpoint**: `GET /terminal?projectId=<uuid>` (upgrade to WebSocket)
- **Client (current implementation)**: `ws://localhost:3000/terminal?projectId=<uuid>`

What happens on connect:

- Backend creates and starts a Docker container:
  - Image: `sandbox`
  - Bind mount: `backend/projects/<projectId>` → `/home/sandbox/app`
  - Exposes port `5173/tcp` and binds it to a random host port (HostPort = `0`)
  - Environment variables include `HOST=0.0.0.0` and file watcher polling flags for containers
- Backend `exec`s `/bin/bash` inside the container (TTY enabled) and bridges the stream to the WebSocket.

On WebSocket close:

- Backend stops the container (it does **not** remove it yet).

---

## System design notes (why it’s built this way)

### Files are source-of-truth on the backend

Edits are persisted by writing directly to the host filesystem under `backend/projects/<projectId>`. The Docker container sees the same files via a bind mount, so terminal actions and editor edits stay in sync.

### Path safety (basic)

Most file operations use a safe resolver (`backend/src/utils/resolveSafePath.ts`) to prevent `../` escaping outside the project root.

### Container isolation

Each terminal session creates its own Docker container. This isolates terminal commands from your host machine while still giving access to the project via the mounted folder.

---

## Known issues / current limitations (accurate to the code)

- **Terminal backend URL is hardcoded in the frontend**
  - `frontend/src/store/terminalSocketStore.ts` uses `ws://localhost:3000/...` and does not use `VITE_BACKEND_URL`.
- **Preview panel is not wired up**
  - Backend binds container port `5173` to a random host port, but the app does not return that port to the frontend yet (there is a `getPort` event stub).
- **`deleteFolder` Socket.IO handler likely won’t work as expected**
  - Backend currently calls `fs.rmdir(pathToFileFolder)` without resolving it relative to the project root.
- **You must open a file before editing**
  - If `writeFile` is emitted with an undefined path, backend will throw (you’ll see `ERR_INVALID_ARG_TYPE: path must be string`).

---

## Troubleshooting

### Terminal doesn’t connect / container can’t start

- **Check Docker is running**
- **Make sure the image exists**:

```bash
docker images | findstr sandbox
```

Rebuild if needed:

```bash
docker build -t sandbox ./backend
```

### Project creation fails

- Ensure `backend/.env` has a valid `REACT_PROJECT_COMMAND`
- Make sure it is **non-interactive** and works when run inside an empty folder

---

## Roadmap ideas (if you want to take this to “real cloud IDE” level)

- Return the container’s assigned host port and render the running Vite preview in the right sidebar
- Reuse containers per project (or per user) instead of one per terminal connection
- Add auth + per-project access control
- Add file watcher events to live-refresh the tree (the backend already sets up `chokidar`)
- Fix folder delete and add recursive operations

