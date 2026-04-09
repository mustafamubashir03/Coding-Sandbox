# DevPlayground: System Design & Architecture Documentation

## 1. High-Level System Overview
**DevPlayground** is a full-stack, monorepo cloud-IDE application designed to emulate the VS Code experience entirely within the browser. It allows users to dynamically generate React (Vite) project environments, securely browse and edit filesystem structures in real-time, execute live terminal commands within a fully isolated execution environment, and view hot-reloaded outputs in a live iframe.

### Core Tech Stack
- **Frontend Layer**: React 19, Vite, TypeScript, Monaco Editor, Xterm.js, Allotment (resizable panes), Zustand (atomic state).
- **Backend / Orchestration Layer**: Node.js, Express, Socket.IO, Raw WebSockets (`ws`), Dockerode (Docker Engine API binding), Chokidar (File Watcher).
- **Execution Environment**: Docker (`sandbox` base image), Alpine/Ubuntu Linux.

---

## 2. Core Subsystems & App Flows (Deep Dive)

### A. Dynamic Project Provisioning Flow
When a user requests a new project:
1. **REST Initiation**: The frontend hits the `POST /api/v1/projects` API route.
2. **UUID Allocation & Scaffolding**: The `projectController` generates a unique V4 UUID. A directory under `backend/projects/<uuid>` is dynamically created via `fs/promises`.
3. **Child Process Execution**: The `projectService` awaits a `npx create-vite@latest . --template react-ts` command directly within the isolated `<uuid>` directory. 
4. **Resolution**: The client receives the `projectId` and navigates to the dedicated IDE playground route.

### B. The Virtual File System & Editor Synchronization Flow
Filesystem manipulations avoid standard slow HTTP paths, replacing them with a persistent, low-latency Socket.IO namespace (`/editor`).

1. **Mapping and Path Resolution**: Every emitted event (`readFile`, `writeFile`, `createFile`, `deleteFile`) passes the `projectId` and `pathToFileFolder`. The backend intercepts these via `socketHandlers/editorHandler.ts`, sanitizing the paths to prevent deep traversal attacks outside the designated `projects/<uuid>` boundary.
2. **Read/Write Execution**: The frontend's `TreeStructure` emits `readFile`, pulling the payload into `activeFileTabStore`. 
3. **Monaco Debounce Mechanics**: The Monaco Editor instance does not stream every keystroke immediately to the backend, which would crash the event loop and filesystem. Instead, changes are captured and **debounced via a 2-second timeout window**. After stability, the string payload emits a `writeFile` command, physically rewriting the underlying OS block.

### C. Dockerized PTY & Raw WebSocket Bridging Flow (The Terminal)
This is the most complex layer of the system. In order to grant root-level CLI access securely without compromising the host OS, terminals must be containerized.

1. **Connection Upgrade**: The frontend `TerminalComponent` attempts to open a raw WS connection to `ws://localhost:4000/terminal?projectId=<uuid>`.
2. **TCP Hijacking**: The Node HTTP server intercepts the `upgrade` event directly in `terminalApp.ts`. It prevents standard HTTP fallback.
3. **Container Orchestration**: `handleContainerCreate.ts` utilizes `dockerode` to spin up a Docker container based on the precompiled `sandbox` image. 
   - **Crucial Step**: It creates a volume bind mount (`Binds`) tying the specific `backend/projects/<uuid>` path to the container's `/home/sandbox/app` working directory.
   - It exposes internal container port `5173` to an inherently dynamic Host Port mapping for the live viewer.
4. **Attaching a Pseudo-Terminal (PTY)**: Using `container.exec()`, the backend launches a `/bin/bash` shell requesting attached `Stdin`, `Stdout`, `Stderr`, and `Tty` options. 
5. **Bidirectional Stream Piping**: Once the execution stream yields, the initial raw WebSocket upgrade is fully completed. The backend natively pipes the raw buffer chunks emitted from Docker `stdout` securely into the `ws` pipe, and pipes `ws` messages back into the container's `stdin`. 
6. **Xterm.js Rendering**: Back on the frontend, `@xterm/addon-attach` attaches to the native browser socket, parsing raw ANSI escape sequences directly onto the web canvas.

### D. The Live Preview & Hot Module Replacement (HMR) Flow
1. While the PTY is active, the user typically executes `npm run dev` to start Vite.
2. Inside the Docker environment, Vite is running. However, because the directory is a mapped Docker Volume, Linux `inotify` file-watching events are strictly suppressed at the hypervisor bridge.
3. To resolve this, the Docker configuration injects environment variables: `CHOKIDAR_USEPOLLING=true` and `VITE_FORCE_POLLING=true`. This forces the Vite HMR system to statically poll internal file inodes every 500ms to detect changes written by the host OS `EditorComponent`.
4. As `EditorComponent` overwrites a file on the host OS, the Docker's Vite Server registers it, recompiles, and pushes HMR payloads across port `5173` to the frontend `Iframe`, reloading the browser pane without latency.

---

## 3. High-Performance State Management (`Zustand`)
Since the application layout leverages `Allotment` grid resizers and incorporates immense React sub-trees (Monaco, Xterm config, complex Tree DOMs), global Context API contexts or Redux reducers would induce catastrophic unneeded sibling re-renders on every keystroke. 
DevPlayground utilizes micro-level atomic pattern stores in Zustand.
- **`activeFileTabStore`**: Exposes isolated array states powering dynamic tab mounting and mapping.
- **`editorSocketStore` & `terminalSocketStore`**: Safely caches class instance bindings (`Socket` classes), enabling non-parental nested elements to fetch references sequentially without prop-drilling or component hydration issues.

---

## 4. Potential Technical Interview Questions

### Architecture & Security

**Q1: How do you prevent Path Traversal attacks when manipulating files based on user socket input?**
> *Expected Answer:* All requested relative paths emitted by the frontend must be safely resolved using `path.join` and verified against the absolute base directory string (`projects/<projectId>`). If the resolved path falls outside or executes escapes (`../../`), the request must throw an unauthorized execution exception to prevent fetching system host modules.

**Q2: Why does DevPlayground use dual networking protocols (Socket.io vs Native WebSockets) across the Editor and Terminal?**
> *Expected Answer:* Socket.IO guarantees extensive abstraction wrapping (multiplexing namespaces like `/editor`, fallback polling, automatic reconnections, and structured JSON payload handling), which makes FS mapping exceptionally stable. However, the Terminal stream demands maximum throughput and relies heavily on transmitting unformatted OS stream Buffers directly to `xterm.js`. Multiplexing terminal buffer packets over Socket.IO introduces massive serialization overhead and payload bloat. The solution assigns `.exec()` piping exclusively to a lightweight, raw, native WS handshake.

**Q3: Describe the container's lifecycle and garbage collection strategy. How is resource leakage mitigated if a user closes the browser?**
> *Expected Answer:* The web socket maps directly to active container classes via an in-memory `wsContainerMap`. By explicitly listening to the WS `'close'` event on the `terminalApp.ts` server, an immediate `.stop()` or `.remove()` signal is fired against the correlating dockerode instance. This efficiently cascades cleanup protocols against the Docker Daemon directly upon TCP loss.

### Framework specific

**Q4: In your `EditorComponent`, you use a `setTimeout` to debounce file submissions. Since you use React, why is the `setTimeout` reference held in a global/file-level `let timerId` variable instead of a `useRef`? What are the tradeoffs?**
> *Expected Answer:* Using a file-level global `let timerId` achieves the debounce safely *only if* there is ever strictly one active instance of the `EditorComponent` mounted across the application. If multiple editors mounted (e.g. split pane editing), the global timer would incorrectly block siblings from saving as they'd overwrite each other's debouncer. Migrating `timerId` into a React `useRef` binds the debounce execution logic to the specific component instance lifecycle, making it substantially safer for future scalability.

**Q5: How does the Vite Dev server inside the Docker container communicate HMR with the browser if the application is bound to randomized host ports?**
> *Expected Answer:* When the Docker container starts, it creates a HostPort boundary dynamically. The `socketHandlers` listen to the event, query `.inspect()` against `dockerode`, establish precisely what dynamic host port was mapped to internal port `5173`, and emit it down to the frontend `portStore`. The Frontend then maps the `/Browser` Iframe `src` specifically to that queried port to permit HMR and UI navigation.
