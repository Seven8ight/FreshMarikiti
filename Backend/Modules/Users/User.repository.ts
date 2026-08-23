import type { Client, QueryResult } from "pg";
import type {
  User,
  UserRepo,
  updateUserDTO,
  VendorRewardsSummary,
} from "./User.types.js";
import { errorMsg, warningMsg } from "./../../Utils/Logger.js";
import { hashPassword } from "./../../Utils/Password.js";
import { MarketService } from "../Market/Market.service.js";
import { MarketRepository } from "../Market/Market.repository.js";

export class UserRepository implements UserRepo {
  constructor(private pgClient: Client) {}

  async editUser(userId: string, newUserData: updateUserDTO): Promise<User> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex = 2;

      const { role, ...rest } = newUserData;

      for (let [key, value] of Object.entries(rest)) {
        // Skip undefined values
        if (value === undefined) continue;

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

      if (keys.length === 0) throw new Error("No fields provided for update");

      if ("market_id" in rest && rest.market_id) {
        const marketService = new MarketService(
          new MarketRepository(this.pgClient),
        );

        const marketIdIndex = Object.keys(rest).indexOf("market_id");
        const marketIdValue = values[marketIdIndex];

        let getMarket = await marketService.getMarket(marketIdValue);

        await marketService.editMarket({
          id: marketIdValue,
          vendors: getMarket.vendors + 1,
        });
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

  async getUserById(userId: string): Promise<User> {
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

  async getUserByEmail(email: string): Promise<User> {
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

  async getAllUsers(): Promise<User[]> {
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

  async deleteUser(userId: string): Promise<void> {
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

  // --- NEW METHOD FOR REWARDS ---
  async getVendorRewardsSummary(userId: string): Promise<VendorRewardsSummary> {
    try {
      // We use json_agg to bundle the related rewards directly in the SQL query
      const query = `
        SELECT 
          u.available_chillings,
          u.pending_chillings,
          u.total_chillings_earned,
          u.total_waste_submitted,
          u.total_waste_processed,
          u.co2_saved,
          u.trees_equivalent,
          (
            SELECT COALESCE(json_agg(
              json_build_object(
                'id', r.id,
                'amount', r.amount,
                'source', r.source,
                'date', r.date,
                'status', r.status
              ) ORDER BY r.date DESC
            ), '[]'::json)
            FROM rewards r
            WHERE r.user_id = u.id
          ) AS recent_rewards
        FROM users u
        WHERE u.id = $1;
      `;

      const result = await this.pgClient.query(query, [userId]);

      if (result.rowCount === 0) {
        throw new Error("User does not exist");
      }

      const row = result.rows[0];

      // pg maps NUMERIC/DECIMAL to strings by default to prevent float precision loss,
      // so we must cast them back to numbers for the TypeScript response.
      return {
        availableChillings: Number(row.available_chillings) || 0,
        pendingChillings: Number(row.pending_chillings) || 0,
        totalChillingsEarned: Number(row.total_chillings_earned) || 0,
        totalWasteSubmitted: Number(row.total_waste_submitted) || 0,
        totalWasteProcessed: Number(row.total_waste_processed) || 0,
        impact: {
          co2Saved: Number(row.co2_saved) || 0,
          treesEquivalent: Number(row.trees_equivalent) || 0,
        },
        recentRewards: row.recent_rewards,
      };
    } catch (error) {
      warningMsg("Get vendor rewards repo error occurred");
      throw error;
    }
  }
}
