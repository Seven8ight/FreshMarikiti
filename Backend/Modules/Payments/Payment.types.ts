export type Payment = {
  orderId: string;
  amount: string;
  created_at: string;
  means_of_payment: string;
  phone_number: string;
  merchant_request_id: string;
  checkout_request_id: string;
  stripe_payment_intent_id: string;
  status: "Completed" | "Rejected" | "Pending";
};

export type createPaymentDTO = Omit<Payment, "created_at">;

export type updatePaymentDTO = Partial<Payment>;

export interface PaymentRepo {
  createReceipt: (paymentData: createPaymentDTO) => Promise<Payment>;
  editReceipt: (newPaymentDetails: updatePaymentDTO) => Promise<Payment>;
  getReceipt: (receiptId: string) => Promise<Payment>;
  getAllReceipts: () => Promise<Payment[]>;
  deleteReceipt: (receiptId: string) => Promise<void>;
  deleteAllReceipts: () => Promise<void>;
}

export interface PaymentSer extends PaymentRepo {}
