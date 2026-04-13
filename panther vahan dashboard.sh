#!/bin/bash

# --- Configuration ---

BACKEND_CMD="node src/server.ts"
FRONTEND_CMD="pnpm run dev"
APP_NAME="Vehicle Analytics"

cd "Server Path"
# --- 1. Start Backend ---
echo "Starting Backend..."
$BACKEND_CMD &
BACKEND_PID=$!

cd "Frontend Path"
# --- 2. Start Frontend ---
echo "Starting Frontend..."
$FRONTEND_CMD &
FRONTEND_PID=$!

# Function to send notifications
send_alert() {
    notify-send -u critical -i dialog-error "$APP_NAME" "$1"
}

echo "Monitoring Backend (PID: $BACKEND_PID)..."

# --- 3. Monitor Loop ---
while true; do
    # Check if backend PID is still alive
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "[ERROR] Backend crashed!"
        send_alert "The Backend server has crashed. Shutting down Frontend..."

        # Kill the frontend since backend is gone
        kill $FRONTEND_PID 2>/dev/null
        exit 1
    fi

    # Check every 3 seconds to save CPU
    sleep 3
done
