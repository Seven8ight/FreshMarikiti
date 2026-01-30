import { IncomingMessage, ServerResponse } from "http";
import { verifyAccessToken } from "../../Utils/JWT.js";
import { MarketRepository } from "./Market.repository.js";
import { MarketService } from "./Market.service.js";
import { pgClient } from "../../Config/Db.js";
import { Market } from "./Market.types.js";
import { PublicUser } from "../Users/User.types.js";

export const MarketController = async (
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

  const userVerifier = verifyAccessToken(authorization.split(" ")[1] as string);

  if (!userVerifier) {
    response.writeHead(403);
    response.end(
      JSON.stringify({
        error: "Authentication failed, re-log in",
      }),
    );
    return;
  }

  if (!userVerifier.roles.includes("admin")) {
    response.writeHead(400);
    response.end(
      JSON.stringify({
        error: "User does not have priviledged permissions",
      }),
    );

    return;
  }

  let unparsedRequestBody: string = "";

  const marketRepo = new MarketRepository(pgClient),
    marketService = new MarketService(marketRepo);

  request.on(
    "data",
    (buffer: Buffer) => (unparsedRequestBody += buffer.toString()),
  );

  request.on("end", async () => {
    const parsedRequestBody = JSON.parse(unparsedRequestBody || "{}");

    switch (pathNames[2]) {
      case "create":
        if (request.method != "POST") {
          response.writeHead(405);
          response.end(
            JSON.stringify({
              error: "Use POST instead",
            }),
          );
          return;
        }

        const createMarket: Market =
          await marketService.createMarket(parsedRequestBody);

        response.writeHead(201);
        response.end(JSON.stringify(createMarket));
        break;
      case "edit":
        if (request.method != "PATCH") {
          response.writeHead(405);
          response.end(
            JSON.stringify({
              error: "Use PATCH instead",
            }),
          );
          return;
        }

        const editMarket: Market =
          await marketService.editMarket(parsedRequestBody);

        response.writeHead(200);
        response.end(JSON.stringify(editMarket));
        break;
      case "get":
        if (request.method == "GET") {
          response.writeHead(405);
          response.end(
            JSON.stringify({
              error: "Use GET instead",
            }),
          );
          return;
        }

        const getMarketVendors: PublicUser[] =
          await marketService.getMarketVendors(parsedRequestBody.id);

        response.writeHead(200);
        response.end(JSON.stringify(getMarketVendors));
      case "delete":
        if (request.method == "DELETE") {
          response.writeHead(405);
          response.end(
            JSON.stringify({
              error: "Use DELETE instead",
            }),
          );
          return;
        }

        await marketService.deleteMarket(parsedRequestBody.id);

        response.writeHead(204);
        response.end();
        break;
      default:
        response.writeHead(404);
        response.end(
          JSON.stringify({
            error: "Invalid route passed on market route",
          }),
        );
    }
  });
};
