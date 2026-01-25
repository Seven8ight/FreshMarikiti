import {
  generateTokens,
  refreshAccessToken,
  verifyRefreshToken,
} from "../../Utils/JWT.js";
import { warningMsg } from "../../Utils/Logger.js";
import type {
  createUserDTO,
  createUserType,
  loginType,
  PublicUser,
  User,
} from "../Users/User.types.js";
import type { AuthRepo, AuthServ, tokens } from "./Auth.types.js";

export class AuthService implements AuthServ {
  constructor(private authRepo: AuthRepo) {}

  private createPublicUser(userData: User): PublicUser {
    return {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      biocoins: userData.biocoins,
      goals: userData.goals,
      profileImage: userData.profileImage,
      role: userData.role,
      phone_number: userData.phone_number,
    };
  }

  async register(
    userData: createUserDTO,
    userType: createUserType,
  ): Promise<tokens> {
    try {
      const allowedFields: string[] = [
        "username",
        "email",
        "password",
        "profileimage",
        "oauth",
        "oauthprovider",
      ];

      let newUserObject: Record<string, any> = {};

      for (let [key, value] of Object.entries(userData)) {
        if (!allowedFields.includes(key.toLowerCase())) continue;
        if (typeof value == "string" && value.length < 0)
          throw new Error(`${key} has an empty value`);
        if (typeof value == "boolean" && (value == null || value == undefined))
          throw new Error(
            `Oauth is empty, provide a boolean value for checking`,
          );

        newUserObject[key] = value;
      }

      if (userType.type == "oAuth")
        newUserObject["oauthProvider"] = userType.provider;

      try {
        const newUser: User = await this.authRepo.register(
            newUserObject as any,
            userType,
          ),
          formatNewUser = this.createPublicUser(newUser),
          newUserTokens = generateTokens(formatNewUser);

        await this.authRepo.storeRefreshToken(
          formatNewUser.id,
          newUserTokens.refreshToken,
        );

        return newUserTokens;
      } catch (error) {
        warningMsg("Create user service error occurred");
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  async login(userData: createUserDTO, type: loginType): Promise<tokens> {
    try {
      const loginProcess = await this.authRepo.login(userData, type),
        publicUser = this.createPublicUser(loginProcess),
        userTokens = generateTokens(publicUser);

      await this.authRepo.storeRefreshToken(
        publicUser.id,
        userTokens.refreshToken,
      );

      return userTokens;
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<Omit<tokens, "refreshToken">> {
    try {
      const currentDate = new Date();

      const verifyToken = verifyRefreshToken(refreshToken),
        checkTokenInDatabase =
          await this.authRepo.findRefreshToken(refreshToken);

      if (!verifyToken) throw new Error("Token is invalid");

      if (checkTokenInDatabase) {
        const expiryDateForToken = new Date(checkTokenInDatabase.expires_at);

        if (currentDate.getDate() == expiryDateForToken.getDate())
          await this.authRepo.revokeRefreshToken(checkTokenInDatabase.token);
      }

      const newAccessToken = refreshAccessToken(refreshToken);

      return { accessToken: newAccessToken.accessToken };
    } catch (error) {
      const checkTokenInDatabase =
        await this.authRepo.findRefreshToken(refreshToken);

      if (checkTokenInDatabase)
        await this.authRepo.revokeRefreshToken(refreshToken);

      throw error;
    }
  }
}
