export type ReversalRequest = {
  id: string;
  phone_number: string;
  status: string;
  amount: number;
  created_at: string;
};

export type Transaction = {
  buyerid: string;
  productid: string;
  quantity: number;
};
