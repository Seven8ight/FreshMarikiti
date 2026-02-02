import { IncomingMessage, ServerResponse } from "http";
import { verifyAccessToken } from "../../Utils/JWT.js";
import { NotificationRepository } from "./Notifications.repository.js";
import { NotificationServ } from "./Notifications.service.js";
import { pgClient } from "../../Config/Db.js";
import { PublicUser } from "../Users/User.types.js";

export const NotificationController = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames = requestUrl.pathname.split("/").filter(Boolean),
    { authorization } = request.headers;

  if (!authorization) {
    response.writeHead(401);
    response.end(
      JSON.stringify({
        error: "Authorization tokens must be provided",
      }),
    );
    return;
  }

  const user: PublicUser = verifyAccessToken(
    authorization.split(" ")[1] as string,
  );

  const notificationsRepo = new NotificationRepository(pgClient),
    notificationsService = new NotificationServ(notificationsRepo);

  if (!user) {
    response.writeHead(403);
    response.end(
      JSON.stringify({
        error: "Authentication failed, re-log in",
      }),
    );
    return;
  }

  let unparsedRequestBody: string = "";

  request.on(
    "data",
    (data: Buffer) => (unparsedRequestBody += data.toString()),
  );

  request.on("end", async () => {
    try {
      const parsedRequestBody = JSON.parse(unparsedRequestBody || "{}");

      switch (pathNames[2]) {
        case "deviceregister": {
          if (request.method != "POST") {
            response.writeHead(405);
            response.end(
              JSON.stringify({
                error: "Use POST instead",
              }),
            );
            return;
          }

          if (!parsedRequestBody.platform || !parsedRequestBody.token)
            throw new Error(
              "Platform and firebase client token must be provided in request body",
            );

          await notificationsService.registerDevice({
            user_id: user.id,
            platform: parsedRequestBody.platform,
            token: parsedRequestBody.token,
          });

          response.writeHead(200);
          response.end(
            JSON.stringify({
              message: "Device stored and created for notifications",
            }),
          );

          break;
        }

        default:
          if (request.method != "GET") {
            response.writeHead(405);
            response.end(
              JSON.stringify({
                error: "Use GET instead",
              }),
            );
            return;
          }

          const userNotifications = notificationsService.getUserNotifications(
            user.id,
          );

          response.writeHead(200);
          response.end(JSON.stringify(userNotifications));
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
