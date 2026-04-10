import { defineConfig } from "vite"
import desktopPlugin from "./vite"

const backendPort = process.env.OPENCODE_PORT || "3000"
const backendTarget = `http://localhost:${backendPort}`

const apiPaths = [
  "/global",
  "/project",
  "/pty",
  "/config",
  "/experimental",
  "/session",
  "/permission",
  "/question",
  "/provider",
  "/file",
  "/event",
  "/mcp",
  "/tui",
  "/instance",
  "/snapshot",
  "/skill",
  "/command",
  "/agent",
  "/path",
  "/vcs",
  "/lsp",
  "/auth",
  "/log",
  "/doc",
]

const proxyConfig: Record<string, any> = {}
for (const path of apiPaths) {
  proxyConfig[path] = {
    target: backendTarget,
    changeOrigin: true,
    ws: true,
  }
}

export default defineConfig({
  plugins: [desktopPlugin] as any,
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    port: 5000,
    proxy: proxyConfig,
  },
  build: {
    target: "esnext",
  },
})
