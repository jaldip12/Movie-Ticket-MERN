import { Server } from "socket.io";

let io = null;

/**
 * Attach a socket.io server to the existing HTTP server. Should be called once
 * during application boot. Configures CORS to allow CLIENT_URL with cookies and
 * sets up per-show subscription handlers.
 */
const attachRealtime = (httpServer) => {
  if (io) return io;

  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("subscribe:show", (showId) => {
      if (typeof showId === "string" && showId.length > 0) {
        socket.join(`show:${showId}`);
      }
    });

    socket.on("unsubscribe:show", (showId) => {
      if (typeof showId === "string" && showId.length > 0) {
        socket.leave(`show:${showId}`);
      }
    });
  });

  console.log("[realtime] socket.io attached");
  return io;
};

const getIO = () => io;

const emitSeatsLocked = (showId, seats, lockedUntil) => {
  if (!io || !showId) return;
  try {
    io.to(`show:${showId}`).emit("seats:locked", {
      showId: String(showId),
      seats,
      lockedUntil,
    });
  } catch (err) {
    console.error("[realtime] emitSeatsLocked failed:", err.message);
  }
};

const emitSeatsReleased = (showId, seats) => {
  if (!io || !showId) return;
  try {
    io.to(`show:${showId}`).emit("seats:released", {
      showId: String(showId),
      seats,
    });
  } catch (err) {
    console.error("[realtime] emitSeatsReleased failed:", err.message);
  }
};

const emitSeatsBooked = (showId, seats) => {
  if (!io || !showId) return;
  try {
    io.to(`show:${showId}`).emit("seats:booked", {
      showId: String(showId),
      seats,
    });
  } catch (err) {
    console.error("[realtime] emitSeatsBooked failed:", err.message);
  }
};

export {
  attachRealtime,
  getIO,
  emitSeatsLocked,
  emitSeatsReleased,
  emitSeatsBooked,
};
