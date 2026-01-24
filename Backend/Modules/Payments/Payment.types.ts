type TokenData = {
  access_token: string;
  expires_in: string;
};

type ItemData = {
  Name: string;
  Value: number;
};

interface PaymentResponse {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number | string;
      ResultDesc: string;
      CallbackMetadata: {
        Item: ItemData[];
      };
    };
  };
}

interface PaymentRepo {
  createReceipt: () => Promise<void>;
  getReceipt: () => Promise<void>;
  deleteReceipt: (receiptId: string) => Promise<void>;
}
