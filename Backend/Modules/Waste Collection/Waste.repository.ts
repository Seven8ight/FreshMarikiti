import { Client, QueryResult } from "pg";
import {
  createWasteDTO,
  editWasteDTO,
  Waste,
  WasteRepo,
} from "./Waste.types.js";
import { warningMsg } from "../../Utils/Logger.js";

export class WasteRepository implements WasteRepo {
  constructor(private DB: Client) {}

  async createWaste(
    userId: string,
    wasteDetails: createWasteDTO,
  ): Promise<Waste> {
    try {
      const createWaste = await this.DB.query(
        "INSERT INTO waste_collection(userid,location,weight) VALUES($1,$2,$3) RETURNING *",
        [userId, wasteDetails.location, wasteDetails.weight],
      );

      if (createWaste.rowCount && createWaste.rowCount > 0)
        return createWaste.rows[0];

      throw new Error("Error at creating waste, try again");
    } catch (error) {
      warningMsg("Error at creating waste");
      throw error;
    }
  }

  async editWaste(newWasteDetails: editWasteDTO): Promise<Waste> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex = 2;

      for (let [key, value] of Object.entries(newWasteDetails)) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const wasteUpdate: QueryResult<Waste> = await this.DB.query(
        `UPDATE waste_collection SET ${keys.join(",")} WHERE id=$1 RETURNING *`,
        [newWasteDetails.id, ...values],
      );

      if (wasteUpdate.rowCount && wasteUpdate.rowCount > 0)
        return wasteUpdate.rows[0]!;

      throw new Error(`Waste item does not exist of id, ${newWasteDetails.id}`);
    } catch (error) {
      warningMsg("Product todo repo error occurred");
      throw error;
    }
  }

  async getWaste(wasteId: string): Promise<Waste> {
    try {
      const getWaste: QueryResult<Waste> = await this.DB.query(
        "SELECT * FROM waste_collection WHERE id=$1",
        [wasteId],
      );
      if (getWaste.rowCount && getWaste.rowCount > 0) return getWaste.rows[0];

      throw new Error(`Waste of id, ${wasteId} not found`);
    } catch (error) {
      warningMsg("Error at waste getting ");
      throw error;
    }
  }

  async getUserWaste(userId: string): Promise<Waste[]> {
    try {
      const getWastes: QueryResult<Waste> = await this.DB.query(
        "SELECT * FROM waste_collection WHERE userid=$1",
        [userId],
      );

      if (getWastes.rowCount && getWastes.rowCount > 0) return getWastes.rows;

      throw new Error(`Waste of id, ${userId} not found`);
    } catch (error) {
      warningMsg("Error at waste getting ");
      throw error;
    }
  }

  async getAllWaste(): Promise<Waste[]> {
    try {
      const getWaste: QueryResult<Waste> = await this.DB.query(
        "SELECT * FROM waste_collection",
      );
      return getWaste.rows;
    } catch (error) {
      warningMsg("Error at waste getting all of them ");
      throw error;
    }
  }

  async deleteAllWaste(): Promise<void> {
    try {
      await this.DB.query("TRUNCATE TABLE waste_collection");
    } catch (error) {
      warningMsg("Error at deleting all waste");
      throw error;
    }
  }

  async deleteUserWaste(userId: string): Promise<void> {
    try {
      await this.DB.query("DELETE FROM waste_collection WHERE userid=$1", [
        userId,
      ]);
    } catch (error) {
      warningMsg("Error at deleting all waste");
      throw error;
    }
  }

  async deleteWaste(wasteId: string): Promise<void> {
    try {
      await this.DB.query("DELETE FROM waste_collection WHERE id=$1", [
        wasteId,
      ]);
    } catch (error) {
      warningMsg("Error at deleting all waste");
      throw error;
    }
  }
}
