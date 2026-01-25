import type { Client, QueryResult } from "pg";
import type { User, UserRepo } from "./User.types.js";
import { warningMsg } from "./../../Utils/Logger.js";
import { hashPassword } from "./../../Utils/Password.js";
import { MarketService } from "../Market/Market.service.js";
import { MarketRepository } from "../Market/Market.repository.js";

export class UserRepository implements UserRepo {
  constructor(private pgClient: Client) {}

  async editUser(userId: string, newUserData: any) {
    try {
      let keys: string[] = [];
      let values: any[] = [];
      let paramIndex = 2;

      const { role, action = "add", ...rest } = newUserData;

      // Normal fields
      for (let [key, value] of Object.entries(rest)) {
        if (key === "password") value = hashPassword(value as string);
        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      // Role handling (SPECIAL CASE)
      if (role) {
        if (
          !["customer", "vendor", "rider", "connector", "admin"].includes(role)
        ) {
          throw new Error("Invalid role");
        }

        if (action === "remove")
          keys.push(`roles = array_remove(roles, $${paramIndex++})`);
        else keys.push(`roles = array_append(roles, $${paramIndex++})`);

        values.push(role);
      }

      if (keys.length === 0) {
        throw new Error("No fields provided for update");
      }

      if (keys.includes("marketid")) {
        if (action == "add") {
          const marketService = new MarketService(
              new MarketRepository(this.pgClient),
            ),
            marketId = keys.findIndex((value) => value == "marketid");

          let getMarket = await marketService.getMarket(values[marketId]);

          marketService.editMarket({
            id: values[marketId],
            vendors: getMarket.vendors++,
          });
        }
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

  async deleteUser(userId: string) {
    try {
      await this.pgClient.query(`DELETE FROM users WHERE id=$1`, [userId]);
    } catch (error) {
      warningMsg("Delete user repo error occurred");
      throw error;
    }
  }
}
