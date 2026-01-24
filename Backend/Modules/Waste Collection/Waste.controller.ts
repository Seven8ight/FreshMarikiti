import { IncomingMessage, ServerResponse } from "node:http";
import { pgClient } from "../../Config/Db";
import { verifyAccessToken } from "../../Utils/JWT";
import { Waste } from "./Waste.types";
import { WasteRepository } from "./Waste.repository";
import { WasteService } from "./Waste.service";

export const WasteController = (
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

  const userId = userVerifier.id;

  let unparsedRequestBody: string = "";

  const wasteRepo = new WasteRepository(pgClient),
    wasteService = new WasteService(wasteRepo);

  request.on(
    "data",
    (buffer: Buffer) => (unparsedRequestBody += buffer.toString()),
  );

  request.on("end", async () => {
    try {
      if (unparsedRequestBody.length <= 0) unparsedRequestBody = "{}";
      let parsedRequestBody: any;

      if (unparsedRequestBody.length > 0)
        parsedRequestBody = JSON.parse(unparsedRequestBody);

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

          const createOperation: Waste =
            await wasteService.createWaste(parsedRequestBody);

          response.writeHead(201);
          response.end(JSON.stringify(createOperation));
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

          const editOperation = await wasteService.editWaste(parsedRequestBody);

          response.writeHead(201);
          response.end(JSON.stringify(editOperation));
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
            response.writeHead(404);
            response.end(
              JSON.stringify({
                error: "Provide type in the search params",
              }),
            );
            return;
          }

          if (type == "all") {
            const retrieveAllProducts = await wasteService.getAllWaste();

            response.writeHead(200);
            response.end(JSON.stringify(retrieveAllProducts));
          } else if (type == "user") {
            const retrieveProductsByCategory =
              await wasteService.getUserWaste(userId);

            response.writeHead(200);
            response.end(JSON.stringify(retrieveProductsByCategory));
          } else if (type == "one") {
            const wasteId = searchParams.get("wasteid");

            if (!wasteId)
              throw new Error("Provide the product id in search params");

            const retrieveProductById = await wasteService.getWaste(wasteId);

            response.writeHead(200);
            response.end(JSON.stringify(retrieveProductById));
          } else throw new Error("Type should be either id,category or all");

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

          const searchDeletionParams = requestUrl.searchParams,
            typeDeletion = searchDeletionParams.get("type");

          if (!typeDeletion) {
            response.writeHead(400);
            response.end(
              JSON.stringify({
                error: "Provide type in search params",
              }),
            );
            return;
          }

          if (typeDeletion == "one") {
            const wasteId = searchDeletionParams.get("wasteid");

            if (!wasteId) {
              response.writeHead(404);
              response.end(
                JSON.stringify({
                  error: "Provide product id in the search params",
                }),
              );
              return;
            }

            await wasteService.deleteWaste(wasteId);

            response.writeHead(204);
            response.end();
          } else if (typeDeletion == "all") {
            await wasteService.deleteAllWaste();

            response.writeHead(204);
            response.end();
          } else if (typeDeletion == "user") {
            await wasteService.deleteUserWaste(userId);

            response.writeHead(204);
            response.end();
          } else {
            response.writeHead(400);
            response.end(
              JSON.stringify({
                error: "Invalid type value specify all or one",
              }),
            );
          }
          break;
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
