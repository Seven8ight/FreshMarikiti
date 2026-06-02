import type { IncomingMessage, ServerResponse } from "node:http";

type Response = {
  success: boolean;
  error: number;
  response: { message: any };
};

export async function getRequestBody(request: IncomingMessage) {
  return new Promise((resolve, reject) => {
    let unparsedReqBody: string = "";

    request.on("data", (data: Buffer) => {
      unparsedReqBody += data.toString();
    });

    request.on("end", () => {
      try {
        if (unparsedReqBody.length <= 0)
          return reject(new Error("Empty request body"));

        resolve(JSON.parse(unparsedReqBody));
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", (error) => reject(error));
  });
}

export const sendResponseMessage = (
  statusCode: number,
  error: boolean,
  message: any,
  response: ServerResponse<IncomingMessage>,
) => {
  let responseMsg: Response = {
    success: true,
    error: error == true ? 1 : 0,
    response: { message: message },
  };

  if (!response.headersSent)
    response.writeHead(statusCode, {
      "content-type": "application/json",
    });

  response.end(JSON.stringify(responseMsg));
};

export const PathnameValidator = (pathnames: string[]): string => {
  if (!pathnames[2]) throw new Error("Specify extra argument in url segment");

  return pathnames[2];
};
