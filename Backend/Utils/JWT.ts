import { JWT_ACCESS_TOKEN, JWT_REFRESH_TOKEN } from "./../Config/Env.js";
import JWT from "jsonwebtoken";

export const generateTokens = (payload: Object) => {
    const accessToken = JWT.sign(payload, JWT_ACCESS_TOKEN!, {
        expiresIn: "3600s",
      }),
      refreshToken = JWT.sign(payload, JWT_REFRESH_TOKEN!, {
        expiresIn: "30d",
      });

    return {
      accessToken,
      refreshToken,
    };
  },
  refreshAccessToken = (refreshToken: string): { accessToken: string } => {
    const userData = verifyRefreshToken(refreshToken);

    if (!userData) {
      throw new Error("Invalid refresh token");
    }

    delete userData.exp;
    delete userData.iat;

    const newAccessToken = JWT.sign(userData, JWT_ACCESS_TOKEN!, {
      expiresIn: "3600s",
    });

    return { accessToken: newAccessToken };
  },
  verifyAccessToken = (accessToken: string): boolean | any => {
    try {
      const userData = JWT.verify(accessToken, JWT_ACCESS_TOKEN!);

      return userData;
    } catch (error) {
      return false;
    }
  },
  verifyRefreshToken = (refreshToken: string): boolean | any => {
    try {
      const userData = JWT.verify(refreshToken, JWT_REFRESH_TOKEN!);
      return userData;
    } catch (error) {
      return false;
    }
  };
