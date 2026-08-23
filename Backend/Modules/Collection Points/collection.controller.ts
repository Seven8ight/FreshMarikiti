import { IncomingMessage, ServerResponse } from "http";
import { verifyAccessToken } from "../../Utils/JWT.js";
import { CollectionPointRepo } from "./collection.repository.js";
import { pgClient } from "../../Config/Db.js";
import { CollectionPointServ } from "./collection.service.js";

export const CollectionPointController = (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  try {
    const url = new URL(request.url!, `http://${request.headers.host}`);
    const pathNames = url.pathname.split("/").filter(Boolean);
    const token = request.headers.authorization?.split(" ")[1];

    const user = token ? verifyAccessToken(token) : null;

    if (!user) {
      response.writeHead(403, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }

    const repo = new CollectionPointRepo(pgClient);
    const service = new CollectionPointServ(repo);

    let unparsedRequestBody: any = "";

    request.on(
      "data",
      (data: Buffer) => (unparsedRequestBody += data.toString()),
    );

    request.on("end", async () => {
      try {
        switch (request.method) {
          case "GET":
            let resourceType = pathNames[2];

            let responseBody: any;
            if (!resourceType)
              responseBody = await service.getCollectionPoints();
            else responseBody = await service.getCollectionPoint(resourceType);

            response.writeHead(200, {
              "content-type": "application/json",
            });
            response.end(JSON.stringify(responseBody));

            break;
          case "POST":
            const postParsedRequestBody = JSON.parse(unparsedRequestBody || {}),
              location = postParsedRequestBody.name;

            if (!location) {
              response.writeHead(400, {
                "content-type": "application/json",
              });
              return response.end(
                JSON.stringify({
                  error: "Invalid location name",
                }),
              );
            }

            const newCollectionPoint = service.createCollectionPoint(location);

            response.writeHead(201, {
              "content-type": "application/json",
            });
            response.end(JSON.stringify(newCollectionPoint));

            break;
          case "PATCH":
            const locationId: string = pathNames[2];

            if (!locationId) {
              response.writeHead(400, {
                "content-type": "application/json",
              });
              return response.end(
                JSON.stringify({
                  error: "Invalid location name",
                }),
              );
            }

            const patchedParsedRequestBody = JSON.parse(
              unparsedRequestBody || {},
            );

            const patchCollectionPoint = await service.editCollectionPoint(
              locationId,
              patchedParsedRequestBody.name,
            );

            response.writeHead(200, {
              "content-type": "application/json",
            });
            response.end(JSON.stringify(patchCollectionPoint));

            break;
          case "DELETE":
            const deleteLocationId: string = pathNames[2];

            if (!deleteLocationId) {
              response.writeHead(400, {
                "content-type": "application/json",
              });
              return response.end(
                JSON.stringify({
                  error: "Invalid location name",
                }),
              );
            }

            await service.deleteCollectionPoint(deleteLocationId);

            response.writeHead(204);
            response.end();

            break;
          default:
            response.writeHead(405, {
              "content-type": "application/json",
            });
            response.end(
              JSON.stringify({
                error: "Invalid HTTP header method",
              }),
            );

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
  } catch (error) {
    response.writeHead(500, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        error: "Internal Server Error",
        details: (error as Error).message,
      }),
    );
  }
};
