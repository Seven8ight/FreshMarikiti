import { IncomingMessage, ServerResponse } from "node:http";
import { verifyAccessToken } from "../../Utils/JWT.js";
import { FeedbackRepository } from "./Feedback.repository.js";
import { FeedbackService } from "./Feedback.service.js";
import { pgClient } from "../../Config/Db.js";
import { Feedback } from "./Feedback.types.js";

export const FeedbackController = (
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

  const feedbackRepo = new FeedbackRepository(pgClient),
    feedbackService = new FeedbackService(feedbackRepo);

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

          const createOperation: Feedback =
            await feedbackService.createFeedback(userId, parsedRequestBody);

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

          const editOperation =
            await feedbackService.editFeedback(parsedRequestBody);

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
            const productId = searchParams.get("productid");

            if (!productId) throw new Error("Product id not provided");

            const retrieveProductFeedback =
              await feedbackService.getFeedbacksByProductId(productId);

            response.writeHead(200);
            response.end(JSON.stringify(retrieveProductFeedback));
          } else if (type == "id") {
            const feedbackId = searchParams.get("feedbackid");

            if (!feedbackId)
              throw new Error("Provide the category in search params");

            const retrieveFeedbackById =
              await feedbackService.getFeedbackById(feedbackId);

            response.writeHead(200);
            response.end(JSON.stringify(retrieveFeedbackById));
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
            const feedbackId = searchDeletionParams.get("feedbackid");

            if (!feedbackId) {
              response.writeHead(404);
              response.end(
                JSON.stringify({
                  error: "Provide product id in the search params",
                }),
              );
              return;
            }

            await feedbackService.deleteFeedbackById(feedbackId);

            response.writeHead(204);
            response.end();
          } else if (typeDeletion == "all") {
            const productId = searchDeletionParams.get("productid");

            if (!productId) throw new Error("Product id not provided");

            await feedbackService.deleteAllProductFeedback(productId);

            response.writeHead(204);
            response.end();
          } else if (typeDeletion == "user") {
            if (!userId) throw new Error("User id not provided");

            await feedbackService.deleteAllProductFeedback(userId);

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
        default:
          response.writeHead(404);
          response.end(
            JSON.stringify({
              error: "Route path incomplete try create, edit, get and delete",
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
};
