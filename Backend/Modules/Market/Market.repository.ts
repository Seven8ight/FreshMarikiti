import { Client, QueryResult } from "pg";
import {
  createMarkeDTO,
  editMarketDTO,
  Market,
  MarketRepo,
} from "./Market.types";
import { warningMsg } from "../../Utils/Logger";
import { User } from "../Users/User.types";

export class MarketRepository implements MarketRepo {
  constructor(private DB: Client) {}

  async createMarket(marketDetails: createMarkeDTO): Promise<Market> {
    try {
      const createOperation: QueryResult<Market> = await this.DB.query(
        "INSERT INTO market(name,location) VALUES($1,$2) RETURNING *",
        [marketDetails.name, marketDetails.location],
      );
      if (createOperation.rowCount && createOperation.rowCount > 0)
        return createOperation.rows[0];

      throw new Error("Market creation failed. Database error try again");
    } catch (error) {
      warningMsg("Create market error occured");
      throw error;
    }
  }

  async editMarket(
    marketId: string,
    newMarketDetails: editMarketDTO,
  ): Promise<Market> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex = 2;

      for (let [key, value] of Object.entries(newMarketDetails)) {
        if (value.toString().trim().length <= 0)
          throw new Error(`${key} has an empty value`);

        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const editOperation = await this.DB.query(
        `UPDATE market SET ${keys.join(", ")} WHERE id=$1`,
        [marketId, ...values],
      );

      if (editOperation.rowCount && editOperation.rowCount <= 0)
        throw new Error(`No market of such id ${marketId}`);

      return editOperation.rows[0];
    } catch (error) {
      warningMsg("Create market error occured");
      throw error;
    }
  }

  async getMarketVendors(marketId: string): Promise<User[]> {
    try {
      const getOperation: QueryResult<User> = await this.DB.query(
        "SELECT * FROM users WHERE market_id=$1 and 'vendor'=ANY(roles)",
        [marketId],
      );
      return getOperation.rows;
    } catch (error) {
      warningMsg("Error at get market vendors");
      throw error;
    }
  }

  async getMarket(marketId: string): Promise<Market> {
    try {
      const getMarket = await this.DB.query(
        "SELECT * FROM market where id=$1",
        [marketId],
      );

      if (getMarket.rowCount && getMarket.rowCount > 0)
        return getMarket.rows[0];

      throw new Error(`Market of id, ${marketId} does not exist`);
    } catch (error) {
      warningMsg("Error at getting market");
      throw error;
    }
  }

  async getMarkets(): Promise<Market[]> {
    try {
      const getMarkets: QueryResult<Market> = await this.DB.query(
        "SELECT * FROM markets",
      );

      return getMarkets.rows;
    } catch (error) {
      warningMsg("Error at get markets");
      throw error;
    }
  }

  async deleteMarket(marketId: string): Promise<void> {
    try {
      await this.DB.query("UPDATE USERS set market_id='' WHERE market_id=$1", [
        marketId,
      ]);

      await this.DB.query("DELETE FROM markets WHERE id=$1", [marketId]);
    } catch (error) {
      warningMsg("Error at market deletion");
      throw error;
    }
  }
}
