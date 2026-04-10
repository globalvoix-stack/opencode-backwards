import { Hono } from "hono"
import { createBunWebSocket } from "hono/bun"
import { Server } from "./src/server/server"

const port = parseInt(process.env.OPENCODE_PORT || "3000")
const hostname = process.env.OPENCODE_HOST || "0.0.0.0"

const app = new Hono()
const { upgradeWebSocket, websocket } = createBunWebSocket()

const routes = Server.ControlPlaneRoutes(upgradeWebSocket, app)

const server = Bun.serve({
  port,
  hostname,
  fetch: routes.fetch,
  websocket,
})

Server.url = new URL(`http://${hostname}:${server.port}`)

console.log(`OpenCode server started on http://${hostname}:${server.port}`)

process.on("SIGTERM", () => {
  server.stop()
  process.exit(0)
})
process.on("SIGINT", () => {
  server.stop()
  process.exit(0)
})
