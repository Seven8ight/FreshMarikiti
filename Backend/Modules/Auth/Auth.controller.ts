import type { IncomingMessage, ServerResponse } from "node:http";
import https from "https";
import { AuthRepository } from "./Auth.repository.js";
import { pgClient } from "../../Config/Db.js";
import type { AuthServ } from "./Auth.types.js";
import { AuthService } from "./Auth.service.js";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_SIGNUP_REDIRECT_URI,
  GOOGLE_LOGIN_REDIRECT_URI,
} from "../../Config/Env.js";
import type { createUserDTO } from "../Users/User.types.js";

export const AuthController = (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames = requestUrl.pathname.split("/").filter(Boolean);

  let unParsedRequestBody: string = "";

  const authRepo: AuthRepository = new AuthRepository(pgClient),
    authService: AuthServ = new AuthService(authRepo);

  request.on(
    "data",
    (data: Buffer) => (unParsedRequestBody += data.toString()),
  );

  request.on("end", async () => {
    try {
      if (unParsedRequestBody.length == 0) unParsedRequestBody = "{}";
      const parsedRequestBody = JSON.parse(unParsedRequestBody);

      switch (pathNames[2]) {
        case "register":
          if (pathNames[3] == "legacy") {
            const registerLegacyUser = await authService.register(
              parsedRequestBody,
              {
                type: "legacy",
              },
            );

            response.writeHead(201);
            response.end(JSON.stringify(registerLegacyUser));
          } else if (pathNames[3] == "google") {
            if (pathNames[4] == "signup") {
              const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_SIGNUP_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`;

              response.writeHead(301, { location: authUrl });
              return response.end();
            } else if (pathNames[4] == "callback") {
              const googleCode = requestUrl.searchParams.get("code");

              const postData = new URLSearchParams({
                code: googleCode!,
                client_id: GOOGLE_CLIENT_ID!,
                client_secret: GOOGLE_CLIENT_SECRET!,
                redirect_uri: GOOGLE_SIGNUP_REDIRECT_URI!,
                grant_type: "authorization_code",
              }).toString();

              const googleTokenRequest = https.request(
                "https://oauth2.googleapis.com/token",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": Buffer.byteLength(postData),
                  },
                },
                (tokenRes: IncomingMessage) => {
                  let body = "";

                  tokenRes.on("data", (d) => (body += d));
                  tokenRes.on("end", async () => {
                    const tokens = JSON.parse(body);

                    if (tokens.id_token) {
                      const payload = JSON.parse(
                        Buffer.from(
                          tokens.id_token.split(".")[1],
                          "base64",
                        ).toString(),
                      );

                      const googleUserPayload: createUserDTO = {
                          username: payload.name,
                          email: payload.email,
                          profileImage: payload.picture,
                          oAuthProvider: "google",
                        },
                        encryptedGoogleUser = await authService.register(
                          googleUserPayload,
                          {
                            type: "oAuth",
                            provider: "google",
                          },
                        );

                      response.writeHead(302, {
                        location:
                          "http://localhost:3000/dashboard?oauth=google",
                        "set-cookie": `tokens=${JSON.stringify(encryptedGoogleUser)}; HttpOnly; SameSite=Lax; Path=/`,
                      });
                      response.end();
                    }
                  });
                },
              );

              googleTokenRequest.write(postData);
              googleTokenRequest.end();
            }
          } else {
            response.writeHead(400);
            response.end(
              JSON.stringify({
                error: "Ensure to pass in the correct path segment ",
              }),
            );
          }

          break;
        case "login":
          if (pathNames[3] == "legacy") {
            const loginLegacyUser = await authService.login(
              parsedRequestBody,
              "legacy",
            );

            response.writeHead(201);
            return response.end(JSON.stringify(loginLegacyUser));
          } else if (pathNames[3] == "google") {
            if (pathNames[4] == "login") {
              response.writeHead(301, {
                location: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_LOGIN_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`,
              });
              return response.end();
            } else if (pathNames[4] == "callback") {
              const googleCode = requestUrl.searchParams.get("code");

              const postData = new URLSearchParams({
                code: googleCode!,
                client_id: GOOGLE_CLIENT_ID!,
                client_secret: GOOGLE_CLIENT_SECRET!,
                redirect_uri: GOOGLE_LOGIN_REDIRECT_URI!,
                grant_type: "authorization_code",
              }).toString();

              const googleTokenRequest = https.request(
                "https://oauth2.googleapis.com/token",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": Buffer.byteLength(postData),
                  },
                },
                (tokenRes: IncomingMessage) => {
                  let body = "";

                  tokenRes.on("data", (d) => (body += d));
                  tokenRes.on("end", async () => {
                    const tokens = JSON.parse(body);

                    if (tokens.id_token) {
                      const payload = JSON.parse(
                        Buffer.from(
                          tokens.id_token.split(".")[1],
                          "base64",
                        ).toString(),
                      );

                      const googleUserPayload: createUserDTO = {
                          username: payload.name,
                          email: payload.email,
                          profileImage: payload.picture,
                          oAuthProvider: "google",
                        },
                        encryptedGoogleUser = await authService.login(
                          googleUserPayload,
                          "google",
                        );

                      response.writeHead(302, {
                        location:
                          "http://localhost:3000/dashboard?oauth=google",
                        "set-cookie": `tokens=${JSON.stringify(encryptedGoogleUser)}; HttpOnly; SameSite=Lax; Path=/`,
                      });
                      response.end();
                    }
                  });
                },
              );

              googleTokenRequest.write(postData);
              googleTokenRequest.end();
            }
          } else {
            response.writeHead(400);
            response.end(
              JSON.stringify({
                error: "Ensure to pass in the correct path segment ",
              }),
            );
          }

          break;
        case "refresh":
          if (request.method != "POST") {
            response.writeHead(405);
            response.end(
              JSON.stringify({
                error: "Use Post instead",
              }),
            );
            return;
          }

          const refreshUserToken = await authService.refreshToken(
            parsedRequestBody.refreshToken,
          );

          response.writeHead(200);
          response.end(
            JSON.stringify({
              accessToken: refreshUserToken.accessToken,
            }),
          );

          break;
        default:
          response.writeHead(400);
          response.end(
            JSON.stringify({
              message: "Auth route use specified routes",
            }),
          );

          break;
      }
    } catch (error) {
      if (response.headersSent) return;

      response.writeHead(400);
      return response.end(JSON.stringify({ error: (error as Error).message }));
    }
  });
};
