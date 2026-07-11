import type { Client, QueryResult } from "pg";
import type { User, UserRepo } from "./User.types.js";
import { errorMsg, warningMsg } from "./../../Utils/Logger.js";
import { hashPassword } from "./../../Utils/Password.js";
import { MarketService } from "../Market/Market.service.js";
import { MarketRepository } from "../Market/Market.repository.js";

export class UserRepository implements UserRepo {
  constructor(private pgClient: Client) {}

  async editUser(userId: string, newUserData: any) {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex = 2;

      const { role, ...rest } = newUserData;

      for (let [key, value] of Object.entries(rest)) {
        keys.push(`${key}=$${paramIndex++}`);
        if (key === "password") value = hashPassword(value as string);
        values.push(value);
      }

      if (role && role.role) {
        if (
          !["customer", "vendor", "rider", "connector", "admin"].includes(
            role.role[0],
          )
        ) {
          throw new Error("Invalid role");
        }

        if (role.action === "remove")
          keys.push(`role = array_remove(role, $${paramIndex++})`);
        else keys.push(`role = array_append(role, $${paramIndex++})`);

        values.push(role.role[0]);
      }

      // CRITICAL FIX: Ensure we actually have fields to update before continuing
      if (keys.length === 0) throw new Error("No fields provided for update");

      // FIX: Check the raw incoming payload 'rest' for market_id, not the 'keys' SQL array
      if ("market_id" in rest) {
        const marketService = new MarketService(
          new MarketRepository(this.pgClient),
        );

        // Find where market_id sits in the values array
        const marketIdIndex = Object.keys(rest).indexOf("market_id");
        const marketIdValue = values[marketIdIndex];

        let getMarket = await marketService.getMarket(marketIdValue);

        await marketService.editMarket({
          id: marketIdValue,
          vendors: getMarket.vendors + 1, // Fix: Use + 1 instead of postfix ++ to avoid mutation bugs
        });
        console.log("Here after after");
      }

      const userUpdate = await this.pgClient.query(
        `UPDATE users SET ${keys.join(", ")} WHERE id=$1 RETURNING *`,
        [userId, ...values],
      );
      if (userUpdate.rowCount && userUpdate.rowCount > 0)
        return userUpdate.rows[0];

      throw new Error(`User does not exist with id ${userId}`);
    } catch (error) {
      warningMsg("Edit user repo error occurred");
      throw error;
    }
  }

  async getUserById(userId: string) {
    try {
      const userRetrieval: QueryResult<User> = await this.pgClient.query(
        "SELECT * FROM users WHERE id=$1",
        [userId],
      );

      if (userRetrieval.rowCount && userRetrieval.rowCount > 0)
        return userRetrieval.rows[0]!;
      throw new Error("User does not exist");
    } catch (error) {
      warningMsg("Get user repo error occurred");
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    try {
      const userRetrieval: QueryResult<User> = await this.pgClient.query(
        "SELECT * FROM users WHERE email=$1",
        [email],
      );

      if (userRetrieval.rowCount && userRetrieval.rowCount > 0)
        return userRetrieval.rows[0]!;
      throw new Error("User does not exist");
    } catch (error) {
      warningMsg("Get user repo error occurred");
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const users: QueryResult<User> = await this.pgClient.query(
        `SELECT id, username, email, profile_image AS "profileImage", biocoins,
                goals, role, market_id, stall_number AS "stallNumber",
                phone_number, on_shift, created_at
         FROM users
         WHERE deleted_at IS NULL`,
      );

      return users.rows;
    } catch (error) {
      errorMsg(`Error at users: ${(error as Error).message}`);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      const date = new Date();

      await this.pgClient.query(`UPDATE users SET deleted_at=$1 WHERE id=$2`, [
        date.toUTCString(),
        userId,
      ]);
    } catch (error) {
      warningMsg("Delete user repo error occurred");
      throw error;
    }
  }
}
