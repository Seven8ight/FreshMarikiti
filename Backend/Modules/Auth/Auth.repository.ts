import type { Client, QueryResult } from "pg";
import { pgClient } from "../../Config/Db.js";
import type { AuthRepo, RefreshToken,OTP,createOtpDTO } from "./Auth.types.js";

import type {
  createUserDTO,
  createUserType,
  loginType,
  User,
} from "../Users/User.types.js";
import { comparePasswordAndHash, hashPassword } from "../../Utils/Password.js";
import { errorMsg, warningMsg } from "../../Utils/Logger.js";

export class AuthRepository implements AuthRepo {
  constructor(private pgClient: Client) {}

  async register(userData: createUserDTO, userType: createUserType) {
    try {
      let newUser: QueryResult<User>;

      if (userType.type == "legacy") {
        const hashedPassword = hashPassword(userData.password as string);
        newUser = await this.pgClient.query(
          `INSERT INTO users(username,email,password,phone_number,profile_image,oauth,role,on_shift) VALUES($1,$2,$3,$4,$5,$6,$7::text[],$8) RETURNING *`,
          [
            userData.username,
            userData.email,
            hashedPassword,
            userData.phone_number,
            userData.profileImage,
            false,
            ["customer"],
            false,
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
      console.log(error);
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

  async deleteUserTokens(userId: string) {
    try {
      await pgClient.query("DELETE FROM refresh_tokens WHERE user_id=$1", [
        userId,
      ]);
    } catch (error) {
      throw error;
    }
  }
  async findUserByEmail(email: string): Promise<User> {
  try {
    const result = await this.pgClient.query(
      `SELECT * FROM users WHERE email=$1`,
      [email]
    );
    if (result.rowCount && result.rowCount > 0) return result.rows[0];
    throw new Error("No account found with this email");
  } catch (error) {
    throw error;
  }
}

  async saveOtp(data: createOtpDTO):Promise<OTP>{
  try{
    const result =await this.pgClient.query(
      'INSERT INTO otps (email, code ,expires_at) VALUES($1, $2, $3) RETURNING *',
      [data.email, data.code ,data.expires_at]
    );
    if (result.rowCount && result.rowCount>0)return result.rows[0];
    throw new Error("otp was not saved , try again");
  }catch(error){
    throw error;
  }
}
async findOtp(email: string): Promise<OTP> {
  try {
    const result = await this.pgClient.query(
      `SELECT * FROM otps WHERE email=$1 AND used=false ORDER BY created_at DESC LIMIT 1`,
      [email]
    );

    if (result.rowCount && result.rowCount > 0) return result.rows[0];

    throw new Error("OTP not found");
  } catch (error) {
    throw error;
  }
}
async markOtpUsed(id: string): Promise<void> {
  try {
    await this.pgClient.query(
      `UPDATE otps SET used=true WHERE id=$1`,
      [id]
    );
  } catch (error) {
    throw error;
  }
}
async updatePassword(email: string, password:string): Promise<void>{
  try{
    await this.pgClient.query(
      'UPDATE users SET password=$1 WHERE email=$2',
      [password,email]
    );
  }catch (error){
    throw error;
  }
}
}

