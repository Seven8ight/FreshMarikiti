import { warningMsg } from "../../Utils/Logger.js";
import {
  Identifier,
  Payment,
  PaymentRepo,
  PaymentSer,
  updatePaymentDTO,
} from "./Payment.types.js";

export class PaymentService implements PaymentSer {
  constructor(private paymentRepo: PaymentRepo) {}

  async createReceipt(paymentData: any): Promise<Payment> {
    const allowedFields: string[] = [
      "order_id",
      "amount",
      "phone_number",
      "means_of_payment",
      "status",
      "merchant_request_id",
      "checkout_request_id",
    ];

    let newPaymentData: Record<string, any> = {};

    for (let [key, value] of Object.entries(paymentData)) {
      if (!allowedFields.includes(key.toLowerCase())) continue;
      if (typeof value == "string" && value.length < 0)
        throw new Error(`${key} has an empty value`);

      newPaymentData[key] = value;
    }

    const newPayment: Payment =
      await this.paymentRepo.createReceipt(paymentData);

    return newPayment;
  }

  async editReceipt(newPaymentDetails: updatePaymentDTO): Promise<Payment> {
    try {
      const allowedFields: string[] = [
        "phone_number",
        "status",
        "merchant_request_id",
        "checkount_request_id",
      ];

      let newProductObject: Record<string, any> = {};

      for (let [key, value] of Object.entries(newPaymentDetails)) {
        if (!allowedFields.includes(key.toLowerCase())) continue;
        if (!value) throw new Error(`${key} has no value`);
        if (typeof value == "string" && value.length < 0)
          throw new Error(`${key} has an empty value`);

        newProductObject[key] = value;
      }

      const updatedPayment =
        await this.paymentRepo.editReceipt(newPaymentDetails);

      return updatedPayment;
    } catch (error) {
      warningMsg("Edit payment service error occurred");
      throw error;
    }
  }

  async getReceipt(receiptId: string): Promise<Payment> {
    if (!receiptId) throw new Error("Receipt id must be provided");

    const getReceipt: Payment = await this.paymentRepo.getReceipt(receiptId);

    return getReceipt;
  }

  async getUserReceipts(identifier: Identifier) {
    if (!identifier.id && !identifier.phone_number)
      throw new Error(
        "User id or user phone number must be provided must be provided",
      );

    try {
      const userReceipts = await this.paymentRepo.getUserReceipts(identifier),
        bankStatements = userReceipts.map((transaction) => {
          if (transaction.means_of_payment == "bank") {
            const { merchant_request_id, checkout_request_id, ...statement } =
              transaction;

            return statement;
          }
        }),
        mpesaStatements = userReceipts.map((transaction) => {
          if (transaction.means_of_payment == "mpesa") {
            const { stripe_payment_intent_id, ...statement } = transaction;

            return statement;
          }
        });

      return [...bankStatements, ...mpesaStatements];
    } catch (error) {
      throw error;
    }
  }

  async getAllReceipts(): Promise<Payment[]> {
    const getReceipts: Payment[] = await this.paymentRepo.getAllReceipts();

    return getReceipts;
  }

  async deleteReceipt(receiptId: string): Promise<void> {
    if (!receiptId) throw new Error("Receipt id must be provided");

    await this.paymentRepo.deleteReceipt(receiptId);
  }

  async deleteAllReceipts(): Promise<void> {
    await this.paymentRepo.deleteAllReceipts();
  }
}
