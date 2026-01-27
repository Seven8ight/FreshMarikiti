import http, { IncomingMessage, ServerResponse } from "http";
import {
  MPESA_CALLBACK_URL,
  MPESA_CONSUMER_KEY,
  SERVER_PORT,
} from "./Config/Env.js";
import { errorMsg, info, warningMsg } from "./Utils/Logger.js";
import { connectToDatabase } from "./Config/Db.js";
import Router from "./router.js";
import { Server } from "socket.io";
import { registerChatSocket } from "./Modules/Chats/Chat.socket.js";

const server = http.createServer(
    (request: IncomingMessage, response: ServerResponse<IncomingMessage>) =>
      Router(request, response),
  ),
  socketIo = new Server({
    cors: { origin: "*" },
  });

registerChatSocket(socketIo);

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
