import { Client, QueryResult } from "pg";
import { Payment, PaymentRepo, updatePaymentDTO } from "./Payment.types.js";
import { warningMsg } from "../../Utils/Logger.js";

export class PaymentRepository implements PaymentRepo {
  constructor(private DB: Client) {}

  async createReceipt(paymentData: any): Promise<Payment> {
    try {
      const create: QueryResult<Payment> = await this.DB.query(
        "INSERT INTO payments(order_id,amount,means_of_payment,status) VALUES($1,$2,$3,$4 RETURNING *",
        [
          paymentData.order_id,
          paymentData.amount,
          paymentData.means_of_payment,
          paymentData.status,
        ],
      );

      if (create.rowCount && create.rowCount >= 0) return create.rows[0];
      throw new Error("Error in creating transaction");
    } catch (error) {
      warningMsg("Error at payment repo, creating receipt");
      throw error;
    }
  }

  async editReceipt(newPaymentDetails: updatePaymentDTO) {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex = 3;

      for (let [key, value] of Object.entries(newPaymentDetails)) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const paymentUpdate: QueryResult<Payment> = await this.DB.query(
        `UPDATE payments SET ${keys.join(",")} WHERE phone_number=$1 RETURNING *`,
        [newPaymentDetails.phone_number],
      );

      if (paymentUpdate.rowCount && paymentUpdate.rowCount > 0)
        return paymentUpdate.rows[0]!;

      throw new Error(
        `Payment item does not exist from phone number, ${newPaymentDetails.phone_number}.`,
      );
    } catch (error) {
      warningMsg("Product todo repo error occurred");
      throw error;
    }
  }

  async getReceipt(receiptId: string): Promise<Payment> {
    try {
      const getReceipt: QueryResult<Payment> = await this.DB.query(
        "SELECT * FROM payments WHERE id=$1",
        [receiptId],
      );

      if (getReceipt.rowCount && getReceipt.rowCount > 0)
        return getReceipt.rows[0];
      throw new Error(`Payment of receipt, ${receiptId} does not exist`);
    } catch (error) {
      warningMsg("Error at payment repo, getting receipt");
      throw error;
    }
  }

  async getAllReceipts(): Promise<Payment[]> {
    try {
      const getAllReceipts: QueryResult<Payment> = await this.DB.query(
        "SELECT * FROM payments",
      );

      return getAllReceipts.rows;
    } catch (error) {
      warningMsg("Error at payment repo, getting all receipts");
      throw error;
    }
  }

  async deleteReceipt(receiptId: string): Promise<void> {
    try {
      await this.DB.query("DELETE FROM payments WHERE id=$1", [receiptId]);
    } catch (error) {
      warningMsg("Error at payment repo, deleting receipts");
      throw error;
    }
  }

  async deleteAllReceipts(): Promise<void> {
    try {
      await this.DB.query("TRUNCATE payments");
    } catch (error) {
      warningMsg("Error at payment repo, deleting all receipts");
      throw error;
    }
  }
}
