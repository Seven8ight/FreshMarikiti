import type { IncomingMessage, ServerResponse } from "node:http";
import { ChatRepository } from "./Chat.repository";
import { ChatService } from "./Chat.service";
import { pgClient } from "../../Config/Db";
import { verifyAccessToken } from "../../Utils/JWT";

export const ChatController = async (
  request: IncomingMessage,
  response: ServerResponse,
) => {
  try {
    // Parse URL and authorization token
    const url = new URL(request.url!, `http://${request.headers.host}`);
    const token = request.headers.authorization?.split(" ")[1];

    const user = token ? verifyAccessToken(token) : null;

    if (!user) {
      response.writeHead(403, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }

    const repo = new ChatRepository(pgClient);
    const service = new ChatService(repo);

    // === GET Messages ===
    if (request.method === "GET") {
      const chatId = url.searchParams.get("chatId");
      if (!chatId) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: "chatId is required" }));
        return;
      }

      const messages = await service.getMessages(user.id, chatId);

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(messages));
      return;
    }

    // === POST Message ===
    if (request.method === "POST") {
      let body = "";
      request.on("data", (chunk) => {
        body += chunk;
      });

      request.on("end", async () => {
        try {
          const { chatId, content } = JSON.parse(body);

          if (!chatId || !content) {
            response.writeHead(400, { "Content-Type": "application/json" });
            response.end(
              JSON.stringify({ error: "chatId and content are required" }),
            );
            return;
          }

          const message = await service.sendMessage(user.id, chatId, content);

          response.writeHead(201, { "Content-Type": "application/json" });
          response.end(JSON.stringify(message));
        } catch (err: any) {
          response.writeHead(500, { "Content-Type": "application/json" });
          response.end(
            JSON.stringify({
              error: "Internal Server Error",
              details: err.message,
            }),
          );
        }
      });
      return;
    }

    // Method Not Allowed
    response.writeHead(405, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Method Not Allowed" }));
  } catch (err: any) {
    response.writeHead(500, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({ error: "Internal Server Error", details: err.message }),
    );
  }
};
