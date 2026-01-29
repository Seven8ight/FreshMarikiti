import { Client, QueryResult } from "pg";
import { Payment, PaymentRepo, updatePaymentDTO } from "./Payment.types.js";
import { warningMsg } from "../../Utils/Logger.js";

export class PaymentRepository implements PaymentRepo {
  constructor(private DB: Client) {}

  async createReceipt(paymentData: any): Promise<Payment> {
    try {
      if (paymentData.means_of_payment == "mpesa") {
        const create: QueryResult<Payment> = await this.DB.query(
          "INSERT INTO payments(order_id,phone_number,amount,means_of_payment,status,merchant_request_id,checkout_request_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *",
          [
            paymentData.order_id,
            paymentData.phone_number,
            paymentData.amount,
            paymentData.means_of_payment,
            paymentData.status,
            paymentData.merchant_request_id,
            paymentData.checkout_request_id,
          ],
        );

        if (create.rowCount && create.rowCount >= 0) return create.rows[0];
        throw new Error("Error in creating transaction");
      } else {
        const create: QueryResult<Payment> = await this.DB.query(
          "INSERT INTO payments(order_id,phone_number,amount,means_of_payment,status,stripe_payment_intent_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
          [
            paymentData.order_id,
            paymentData.phone_number,
            paymentData.amount,
            paymentData.means_of_payment,
            paymentData.status,
            paymentData.stripe_payment_intent_id,
          ],
        );

        if (create.rowCount && create.rowCount >= 0) return create.rows[0];
        throw new Error("Error in creating transaction");
      }
    } catch (error) {
      warningMsg("Error at payment repo, creating receipt");
      throw error;
    }
  }

  async editReceipt(newPaymentDetails: updatePaymentDTO) {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex = 2;

      let paymentUpdate: QueryResult<Payment>;

      for (let [key, value] of Object.entries(newPaymentDetails)) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      if (keys.includes("checkout_request_id")) {
        paymentUpdate = await this.DB.query(
          `UPDATE payments SET ${keys.join(",")} WHERE checkout_request_id=$1 RETURNING *`,
          [newPaymentDetails.checkout_request_id, ...values],
        );
      } else {
        paymentUpdate = await this.DB.query(
          `UPDATE payments SET ${keys.join(",")} WHERE stripe_payment_intent_id=$1 RETURNING *`,
          [newPaymentDetails.stripe_payment_intent_id, ...values],
        );
      }

      if (paymentUpdate.rowCount && paymentUpdate.rowCount > 0)
        return paymentUpdate.rows[0]!;

      throw new Error(
        `Payment item does not exist from checkout request id/stripe_payment_intent_id, ${newPaymentDetails.checkout_request_id || newPaymentDetails.stripe_payment_intent_id}.`,
      );
    } catch (error) {
      warningMsg("Payment edit repo error occurred");
      throw error;
    }
  }

  async getReceipt(receiptId: string): Promise<Payment> {
    try {
      const getReceipt: QueryResult<Payment> = await this.DB.query(
        "SELECT * FROM payments WHERE checkout_request_id=$1 or stripe_payment_intent_id=$1",
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
