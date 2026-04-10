#!/bin/bash

cleanup() {
  echo "Shutting down..."
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  wait
  exit 0
}

trap cleanup SIGTERM SIGINT

echo "Starting OpenCode backend..."
bun --cwd packages/opencode --conditions=browser start-server.ts &
BACKEND_PID=$!

echo "Waiting for backend to be ready..."
for i in $(seq 1 30); do
  if curl -s http://localhost:3000/global/health > /dev/null 2>&1; then
    echo "Backend ready on port 3000 (attempt $i)"
    break
  fi
  if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "Backend process died, restarting..."
    bun --cwd packages/opencode --conditions=browser start-server.ts &
    BACKEND_PID=$!
  fi
  sleep 1
done

echo "Starting frontend..."
bun --cwd packages/app dev &
FRONTEND_PID=$!

wait
