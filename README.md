# DevPlayground

DevPlayground is a **local web-based playground** that lets you:

- Create a React project workspace
- Browse a file tree, open files, and edit them in the browser
- Use a terminal backed by a Docker container
  
<img width="1920" height="868" alt="coding-sandbox" src="https://github.com/user-attachments/assets/dc8fd361-b9ca-4864-a2f1-b6f51327edc0" />

This repo is a monorepo:

- `frontend/`: Vite + React UI (file tree, editor, terminal)
- `backend/`: Express API + realtime channels for editor + terminal, plus Docker integration

---

### System Design

<img width="723" height="1055" alt="CodingSanbox drawio" src="https://github.com/user-attachments/assets/7c92ad24-2f26-43b1-a996-f5e87e50e8ec" />

---

### Prerequisites

- **Node.js 20+**
- **Docker Desktop / Docker Engine**

---

### Setup (local dev)

#### 1) Build the sandbox Docker image

The backend starts containers from an image named **`sandbox`**:

```bash
docker build -t sandbox ./backend
```

#### 2) Backend

```bash
cd backend
npm install
```

Create `backend/.env` (gitignored):

```bash
PORT=3000

# Command used to scaffold a new React project inside a new project folder.
# Must be non-interactive.
REACT_PROJECT_COMMAND=npx --yes create-vite@latest . --template react-ts
```

Run:

```bash
npm run dev
```

#### 3) Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```bash
VITE_BACKEND_URL=http://localhost:3000
```

Run:

```bash
npm run dev
```

Open the printed Vite URL (typically `http://localhost:5173`).

---

## Minimal API reference

### REST (HTTP)

- **Health**: `GET /health` → `{ "server": "ok" }`
- **Create project**: `POST /api/v1/projects` → returns a `projectId`
- **Project tree**: `GET /api/v1/projects/:projectId/tree` → returns the project directory tree

### Realtime channels

- **Editor (Socket.IO)**: namespace `/editor` (used for file read/write and basic file operations)
- **Terminal (WebSocket)**: `/terminal?projectId=<id>` (interactive terminal backed by Docker)


