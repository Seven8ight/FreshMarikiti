export type Payment = {
  orderId: string;
  amount: string;
  created_at: string;
  means_of_payment: string;
  phone_number: string;
  status: "Completed" | "Rejected" | "Pending";
};

export type createPaymentDTO = Omit<Payment, "created_at">;

export type updatePaymentDTO = Pick<Payment, "phone_number"> & Partial<Payment>;

export interface PaymentRepo {
  createReceipt: (paymentData: createPaymentDTO) => Promise<Payment>;
  editReceipt: (newPaymentDetails: updatePaymentDTO) => Promise<Payment>;
  getReceipt: (receiptId: string) => Promise<Payment>;
  getAllReceipts: () => Promise<Payment[]>;
  deleteReceipt: (receiptId: string) => Promise<void>;
  deleteAllReceipts: () => Promise<void>;
}

export interface PaymentSer extends PaymentRepo {}
