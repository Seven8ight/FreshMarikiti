import type { IncomingMessage, ServerResponse } from "node:http";
import Routes from "./routes.js";
import { sendResponseMessage } from "./Utils/HttpFunctions.js";

const Router = (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  try {
    const requestUrl: URL = new URL(
        request.url!,
        `http://${request.headers.host}`,
      ),
      pathnames: string[] = requestUrl.pathname.split("/").filter(Boolean);

    response.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,OPTIONS,DELETE",
    );
    response.setHeader("Access-Control-Allow-Origins", "*");
    response.setHeader(
      "Access-Control-Allow-Headers",
      "accept,content-type,content-length",
    );

    if (request.method == "OPTIONS")
      return sendResponseMessage(204, false, "", response);

    const matchedRoute = Routes().find(
      (route) => route.pathname.toLowerCase() == pathnames.at(1),
    );

    if (!matchedRoute)
      return sendResponseMessage(
        404,
        true,
        `API Error: unknown route /${pathnames.join("/")}`,
        response,
      );

    return matchedRoute.controller(request, response);
  } catch (error) {
    return sendResponseMessage(
      404,
      true,
      `API Error: ${(error as Error).message}`,
      response,
    );
  }
};

export default Router;
