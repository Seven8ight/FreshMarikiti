import { Client, QueryResult } from "pg";
import {
  createFeedbackDTO,
  editFeedbackDTO,
  Feedback,
  FeedbackRepo,
} from "./Feedback.types";
import { warningMsg } from "../../Utils/Logger";

export class FeedbackRepository implements FeedbackRepo {
  constructor(private DB: Client) {}

  async createFeedback(
    userId: string,
    feedback: createFeedbackDTO,
  ): Promise<Feedback> {
    try {
      const feedbackCreation: QueryResult<Feedback> = await this.DB.query(
        "INSERT INTO feedback(userId,comment,productId,rating) VALUES($1,$2,$3,$4,$5)",
        [userId, feedback.comment, feedback.productid, feedback.rating],
      );

      if (feedbackCreation.rowCount && feedbackCreation.rowCount > 0)
        return feedbackCreation.rows[0];

      throw new Error("Error in feedback creation try again");
    } catch (error) {
      throw error;
    }
  }

  async editFeedback(newFeedbackDetails: editFeedbackDTO): Promise<Feedback> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex = 2;

      for (let [key, value] of Object.entries(newFeedbackDetails)) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const todoUpdate: QueryResult<Feedback> = await this.DB.query(
        `UPDATE feedback SET ${keys.join(",")} WHERE id=$1 RETURNING *`,
        [newFeedbackDetails.id, ...values],
      );

      if (todoUpdate.rowCount && todoUpdate.rowCount > 0)
        return todoUpdate.rows[0]!;

      throw new Error(
        `Feedback does not exist of id, ${newFeedbackDetails.id}`,
      );
    } catch (error) {
      warningMsg("Edit feedback repo error occurred");
      throw error;
    }
  }

  async getFeedbackById(feedbackId: string): Promise<Feedback> {
    try {
      const getFeedbackById: QueryResult<Feedback> = await this.DB.query(
        "SELECT * FROM feedback WHERE id=$1",
        [feedbackId],
      );

      if (getFeedbackById.rowCount && getFeedbackById.rowCount > 0)
        return getFeedbackById.rows[0];

      throw new Error(`Feedback of id, ${feedbackId} not found`);
    } catch (error) {
      warningMsg("Edit feedback repo error occurred");
      throw error;
    }
  }

  async getFeedbacksByProductId(productId: string): Promise<Feedback[]> {
    try {
      const getFeedbackByProductId: QueryResult<Feedback> = await this.DB.query(
        "SELECT * FROM feedback WHERE productid=$1",
        [productId],
      );

      return getFeedbackByProductId.rows;
    } catch (error) {
      warningMsg("Get feedback by product id repo error occurred");
      throw error;
    }
  }

  async deleteAllProductFeedback(productId: string): Promise<void> {
    try {
      await this.DB.query("DELETE FROM feedback WHERE productid=$1", [
        productId,
      ]);
    } catch (error) {
      warningMsg("delete all product id repo error occurred");
      throw error;
    }
  }

  async deleteFeedbackById(feedbackId: string): Promise<void> {
    try {
      await this.DB.query("DELETE FROM feedback WHERE id=$1", [feedbackId]);
    } catch (error) {
      warningMsg("delete feedback by id repo error occurred");
      throw error;
    }
  }

  async deleteUserFeedback(userId: string): Promise<void> {
    try {
      await this.DB.query("DELETE FROM feedback WHERE userid=$1", [userId]);
    } catch (error) {
      warningMsg("delete user feedback repo error occurred");
      throw error;
    }
  }
}
