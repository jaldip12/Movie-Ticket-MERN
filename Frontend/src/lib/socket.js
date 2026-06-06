import { io as ioClient } from "socket.io-client";

/**
 * Socket.io client singleton.
 *
 * Derives the bare server URL from VITE_API_BASE_URL (which points at
 * `http://host:port/api/v1`) by stripping the `/api/v1` suffix, since
 * socket.io is mounted at the server root, not under the REST prefix.
 *
 * Auto-connect is disabled — call `connectIfNeeded()` before the first
 * `emit` to keep idle pages from holding open a websocket.
 */

const apiBase =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3100/api/v1";

const serverUrl = apiBase.replace(/\/api\/v1\/?$/, "");

export const socket = ioClient(serverUrl, {
  withCredentials: true,
  autoConnect: false,
  transports: ["websocket", "polling"],
});

export const connectIfNeeded = () => {
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};
