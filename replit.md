# OpenCode

## Overview
OpenCode is an open-source, AI-powered development tool and coding agent. It is a provider-agnostic alternative to tools like Claude Code, featuring a web UI, TUI (terminal UI), LSP support, and a flexible client/server architecture.

## Tech Stack
- **Runtime & Package Manager:** Bun (1.3.6)
- **Monorepo:** Turborepo
- **Frontend:** SolidJS + Tailwind CSS + Vite (packages/app)
- **Backend/Core:** Effect ecosystem, Hono server, Drizzle ORM (packages/opencode)
- **Desktop:** Tauri (packages/desktop), Electron (packages/desktop-electron)
- **AI:** Vercel AI SDK with multiple providers (Anthropic, OpenAI, Google, AWS Bedrock, etc.)
- **Database:** SQLite via Drizzle ORM
- **Language:** TypeScript (primary), Rust (Tauri desktop)

## Project Structure
```
packages/
  app/           - SolidJS web application (frontend, port 5000)
  opencode/      - Core AI agent logic, CLI/TUI, and Hono web server (backend, port 3000)
  desktop/       - Tauri desktop application
  desktop-electron/ - Electron desktop application
  console/       - Web-based management console
  ui/            - Shared UI component library
  sdk/           - SDK for extending OpenCode
  web/           - Public marketing website
start.sh         - Startup script for both backend and frontend
```

## Architecture (Replit)
- **Backend** (`packages/opencode/start-server.ts`): Runs on port 3000 using Bun.serve() with Hono routes. Uses Bun's native HTTP server (NOT @hono/node-server, which is unreliable under Bun in this environment).
- **Frontend** (`packages/app`): Vite dev server on port 5000, with proxy config in `vite.config.ts` to route all API paths (`/global`, `/project`, `/session`, `/provider`, etc.) to the backend on port 3000.
- **Entry point change** (`packages/app/src/entry.tsx`): Modified `getCurrentUrl()` to use `location.origin` by default in dev mode, so API calls go through Vite's proxy instead of directly to `localhost:4096`.

## Development Setup
- Install dependencies: `bun install --ignore-scripts`
- Run postinstall: `bun run --cwd packages/opencode fix-node-pty`
- Start full stack: `bash start.sh` (starts backend on 3000, then frontend on 5000)

## Workflow
- **Start application**: `bash start.sh` — starts backend (port 3000) + frontend (port 5000)

## Deployment
- Target: static site
- Build: `bun --cwd packages/app run build`
- Public dir: `packages/app/dist`

## Notes
- The web app connects to the backend via Vite proxy (all API paths forwarded from port 5000 to port 3000)
- The vite config is in `packages/app/vite.config.ts` (port 5000, host 0.0.0.0, allowedHosts: true, proxy to backend)
- System dependency `nodejs` is needed for native module builds (node-gyp)
- File watcher warning (`OPENCODE_LIBC is not defined`) is a known non-critical error in this environment
