import type { IncomingMessage, ServerResponse } from "node:http";
import type { UserRepo, Userservice } from "./User.types.js";
import { UserRepository } from "./User.repository.js";
import { pgClient } from "../../Config/Db.js";
import { UserService } from "./User.service.js";
import { verifyAccessToken } from "../../Utils/JWT.js";

export const UserController = (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames = requestUrl.pathname.split("/").filter(Boolean),
    { authorization } = request.headers;

  let unparsedRequestBody: string = "",
    userId: string = "";

  const userVerifier = verifyAccessToken(
    authorization?.split(" ")[1] as string,
  );

  if (!userVerifier) {
    response.writeHead(403);
    response.end(
      JSON.stringify({
        error: "Authentication failed, re-log in",
      }),
    );
    return;
  }

  userId = userVerifier.id;

  const UserRepo: UserRepo = new UserRepository(pgClient),
    Userservice: Userservice = new UserService(UserRepo);

  request.on(
    "data",
    (buffer: Buffer) => (unparsedRequestBody += buffer.toString()),
  );

  request.on("end", async () => {
    try {
      if (unparsedRequestBody.length == 0) unparsedRequestBody = "{}";

      const parsedRequestBody: any = JSON.parse(unparsedRequestBody);

      switch (pathNames[2]) {
        case "edit":
          if (request.method != "PATCH") {
            response.writeHead(405);
            response.end(
              JSON.stringify({
                error: "Use Patch instead",
              }),
            );
            return;
          }

          const newUpdatedUser = await Userservice.editUser(
            userId,
            parsedRequestBody,
          );

          response.writeHead(200);
          response.end(
            JSON.stringify({
              newUpdatedUser,
            }),
          );

          break;
        case "get":
          if (request.method != "GET") {
            response.writeHead(405);
            response.end(
              JSON.stringify({
                error: "Use GET instead",
              }),
            );
            return;
          }

          const searchParams = requestUrl.searchParams,
            type = searchParams.get("type");

          if (!type) {
            response.writeHead(400);
            response.end(
              JSON.stringify({
                error: "Provide type in search params (type=(email or id))",
              }),
            );
          }

          if (type == "id") {
            const userBody = await Userservice.getUserById(userId);

            response.writeHead(200);
            response.end(JSON.stringify(userBody));
          } else if (type == "email") {
            const userBody = await Userservice.getUserByEmail(
              userVerifier.email,
            );

            response.writeHead(200);
            response.end(JSON.stringify(userBody));
          }

          break;
        case "delete":
          if (request.method != "DELETE") {
            response.writeHead(405);
            response.end(
              JSON.stringify({
                error: "Use DELETE instead",
              }),
            );
            return;
          }

          await Userservice.deleteUser(userId);

          response.writeHead(204);
          response.end();
      }
    } catch (error) {
      response.writeHead(400);
      response.end(
        JSON.stringify({
          error: (error as Error).message,
        }),
      );
    }
  });
};
