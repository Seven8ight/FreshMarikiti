import { Server } from "socket.io";
import http from "http";
import { verifyAccessToken } from "../../Utils/JWT.js";

export const createSocketServer = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  // store active users
  const userSocketMap = new Map<string, string>();

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // 1. Authenticate user
    const token = socket.handshake.auth?.token;

    if (!token) {
      socket.disconnect();
      return;
    }

    let user;

    try {
      user = verifyAccessToken(token);
    } catch {
      socket.disconnect();
      return;
    }

    const userId = user.id;

    // 2. Register user socket
    userSocketMap.set(userId, socket.id);

    // attach userId to socket
    socket.data.userId = userId;

    // 3. Handle disconnect
    socket.on("disconnect", () => {
      userSocketMap.delete(userId);
      console.log("Socket disconnected:", socket.id);
    });
  });

  return {
    io,
    userSocketMap,
  };
};
