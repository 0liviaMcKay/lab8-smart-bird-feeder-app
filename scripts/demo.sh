#!/usr/bin/env bash
# Simple demo helper: starts the dev server and opens the browser

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Starting dev server..."
if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found. Install Node.js and npm first." >&2
  exit 1
fi

# Start the dev server in the background and capture PID
npm run dev &
DEV_PID=$!

echo "Dev server started (PID=$DEV_PID). Waiting 2s for server to boot..."
sleep 2

# Open default browser to the dev server (Vite default port)
URL="http://localhost:5173"
if command -v open >/dev/null 2>&1; then
  open "$URL"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL"
else
  echo "Dev server running at $URL"
fi

echo "To stop the dev server: kill $DEV_PID"
