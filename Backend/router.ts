import { IncomingMessage, ServerResponse } from "node:http";
import Routes from "./routes.js";

export default function Router(
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS",
  );
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    return response.end();
  }

  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathName = requestUrl.pathname.split("/").filter(Boolean);

  const matchedRoute = Routes().find(
    (route) => pathName[1]?.toLowerCase() === route.pathname,
  );

  if (matchedRoute) {
    matchedRoute.controller(request, response);
  } else {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Invalid route path" }));
  }
}
