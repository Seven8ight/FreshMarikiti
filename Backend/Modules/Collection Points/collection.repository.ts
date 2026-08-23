import { Client, QueryResult } from "pg";
import {
  CollectionPoint,
  CollectionPointRepository,
} from "./collection.types.js";

export class CollectionPointRepo implements CollectionPointRepository {
  constructor(private pgClient: Client) {}

  async createCollectionPoint(locationName: string): Promise<CollectionPoint> {
    try {
      const sqlString =
          "INSERT INTO collection_points(name) VALUES($1) RETURNING *",
        sqlQuery = await this.pgClient.query(sqlString, [locationName]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const collectionQuery = sqlQuery as QueryResult<CollectionPoint>,
        newCollection = collectionQuery.rows[0];

      return newCollection;
    } catch (error) {
      throw error;
    }
  }

  async editCollectionPoint(
    locationId: string,
    newLocationName: string,
  ): Promise<CollectionPoint> {
    try {
      const sqlString = "UPDATE collection_points SET name=$2 WHERE id=$1",
        sqlQuery = await this.pgClient.query(sqlString, [
          locationId,
          newLocationName,
        ]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const collectionQuery = sqlQuery as QueryResult<CollectionPoint>,
        updatedCollection = collectionQuery.rows[0];

      return updatedCollection;
    } catch (error) {
      throw error;
    }
  }

  async getCollectionPoint(id: string): Promise<CollectionPoint> {
    try {
      const sqlString = "SELECT * FROM collection_points WHERE id=$1",
        sqlQuery = await this.pgClient.query(sqlString, [id]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const collectionQuery = sqlQuery as QueryResult<CollectionPoint>,
        retreivedCollectionPoint = collectionQuery.rows[0];

      return retreivedCollectionPoint;
    } catch (error) {
      throw error;
    }
  }

  async getCollectionPoints(): Promise<CollectionPoint[]> {
    try {
      const sqlString = "SELECT * FROM collection_points",
        sqlQuery = await this.pgClient.query(sqlString);

      if (!sqlQuery) throw new Error("SQL Query error");

      const collectionQuery = sqlQuery as QueryResult<CollectionPoint>,
        retreivedCollectionPoints = collectionQuery.rows;

      return retreivedCollectionPoints;
    } catch (error) {
      throw error;
    }
  }

  async deleteCollectionPoint(locationId: string): Promise<void> {
    try {
      const sqlString: string = "DELETE FROM collection_points WHERE id=$1",
        sqlQuery = await this.pgClient.query(sqlString, [locationId]);

      if (!sqlQuery) throw new Error("SQL Query error");
    } catch (error) {
      throw error;
    }
  }
}
