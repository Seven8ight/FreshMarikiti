import { Server, Socket } from "socket.io";
import { ChatRepository } from "./Chat.repository.js";
import { ChatService } from "./Chat.service.js";
import { pgClient } from "../../Config/Db.js";
import { verifyAccessToken } from "../../Utils/JWT.js";

export const registerChatSocket = (io: Server) => {
  const repo = new ChatRepository(pgClient);
  const service = new ChatService(repo);

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    const user = verifyAccessToken(token);

    if (!user) return next(new Error("Unauthorized"));

    socket.data.userId = user.id;
    next();
  });

  io.on("connection", (socket: Socket) => {
    socket.on("join_chat", async (chatId: string) => {
      const allowed = await service.canAccessChat(socket.data.userId, chatId);

      if (!allowed) {
        socket.emit("error", "Access denied");
        return;
      }

      socket.join(`chat:${chatId}`);
    });

    socket.on("send_message", async ({ chatId, content }) => {
      const message = await service.sendMessage(
        socket.data.userId,
        chatId,
        content,
      );

      io.to(`chat:${chatId}`).emit("new_message", message);
    });
  });
};
