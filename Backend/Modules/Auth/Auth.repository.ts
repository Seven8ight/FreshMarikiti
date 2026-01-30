import type { Client, QueryResult } from "pg";
import { pgClient } from "../../Config/Db.js";

import type {
  createUserDTO,
  createUserType,
  loginType,
  User,
} from "../Users/User.types.js";
import { comparePasswordAndHash, hashPassword } from "../../Utils/Password.js";
import { errorMsg, warningMsg } from "../../Utils/Logger.js";
import type { AuthRepo, RefreshToken } from "./Auth.types.js";

export class AuthRepository implements AuthRepo {
  constructor(private pgClient: Client) {}

  async register(userData: createUserDTO, userType: createUserType) {
    try {
      let newUser: QueryResult<User>;

      if (userType.type == "legacy") {
        const hashedPassword = hashPassword(userData.password as string);

        newUser = await this.pgClient.query(
          `INSERT INTO users(username,email,password,phone_number,profile_image,oauth,role) VALUES($1,$2,$3,$4,$5,$6::text[]) RETURNING *`,
          [
            userData.username,
            userData.email,
            hashedPassword,
            userData.phone_number,
            userData.profileImage,
            false,
            ["customer"],
          ],
        );
      } else {
        newUser = await this.pgClient.query(
          `INSERT INTO users(username,email,profile_image,oauth,oauthprovider,role) VALUES($1,$2,$3,$4,$5,$6::text[]) RETURNING *`,
          [
            userData.username,
            userData.email,
            userData.profileImage,
            true,
            userData.oAuthProvider,
            ["customer"],
          ],
        );
      }

      if (newUser.rowCount && newUser.rowCount > 0) return newUser.rows[0]!;

      throw new Error("New user not created, try again");
    } catch (error) {
      errorMsg(`${(error as Error).message}`);
      warningMsg(`Error at creating auth repo`);
      throw error;
    }
  }

  async login(userData: createUserDTO, type: loginType) {
    try {
      const findUser: QueryResult<User> = await this.pgClient.query(
        "SELECT * FROM users WHERE email=$1 or username=$2",
        [userData.email, userData.username],
      );

      if (findUser.rowCount && findUser.rowCount > 0) {
        if (type == "legacy") {
          if (
            !comparePasswordAndHash(
              userData.password as string,
              findUser.rows[0]?.password as string,
            )
          )
            throw new Error("Invalid password");
        }

        return findUser.rows[0] as User;
      }

      throw new Error("No user exists of such username or email");
    } catch (error) {
      warningMsg("Error at login repo");
      errorMsg(`${(error as Error).message}`);
      throw error;
    }
  }

  async storeRefreshToken(userId: string, refreshToken: string) {
    try {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 7);

      const store = await pgClient.query(
        "INSERT INTO refresh_tokens(token, user_id, expires_at) VALUES($1,$2,$3) RETURNING *",
        [refreshToken, userId, currentDate.toUTCString()],
      );

      if (store.rowCount && store.rowCount <= 0)
        throw new Error("Refresh token was not stored");
    } catch (error) {
      throw error;
    }
  }

  async findRefreshToken(token: string): Promise<RefreshToken> {
    try {
      const findToken = await pgClient.query(
        "SELECT * FROM refresh_tokens WHERE token=$1",
        [token],
      );

      if (findToken.rowCount && findToken.rowCount > 0)
        return findToken.rows[0];

      throw new Error("Refresh token not found");
    } catch (error) {
      throw error;
    }
  }

  async revokeRefreshToken(refreshToken: string) {
    try {
      const findToken = await this.findRefreshToken(refreshToken);
      await pgClient.query("DELETE FROM refresh_tokens WHERE token=$1", [
        findToken.token,
      ]);
    } catch (error) {
      throw error;
    }
  }
}
