import http, { IncomingMessage, ServerResponse } from "http";
import { SERVER_PORT } from "./Config/Env.js";
import { errorMsg, info, warningMsg } from "./Utils/Logger.js";
import { connectToDatabase } from "./Config/Db.js";
import Router from "./router.js";
import { Server } from "socket.io";
import { registerChatSocket } from "./Modules/Chats/Chat.socket.js";
import { createSocketServer } from "./Modules/Sockets/Socket.setup.js";
import { SocketService } from "./Modules/Sockets/Socket.service.js";

export const server = http.createServer(
    (request: IncomingMessage, response: ServerResponse<IncomingMessage>) => {
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, DELETE, OPTIONS",
      );
      response.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With",
      );
      response.setHeader("Access-Control-Max-Age", "86400");

      if (request.method === "OPTIONS") {
        response.writeHead(204, {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With",
        });
        return response.end();
      }

      Router(request, response);
    },
  ),
  { io, userSocketMap } = createSocketServer(server),
  socketService = new SocketService(io, userSocketMap);

server.listen(SERVER_PORT, async () => {
  try {
    await connectToDatabase();

    info(
      `Server and database are live, server is up and running at port ${SERVER_PORT}`,
    );
  } catch (error) {
    warningMsg(`Server is live, database is down, server at ${SERVER_PORT}`);
    errorMsg(`${(error as Error).message}`);
  }
});

process.on("uncaughtException", (error) => errorMsg(`${error.message}`));
process.on("unhandledRejection", (error) => errorMsg(`${error}`));
