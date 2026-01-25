export type OrderItem = {
  id: string;
  quantity: number;
};

export type Order = {
  id: string;
  buyerid: string;
  products: OrderItem[];
  status: "Rejected" | "Pending" | "Complete";
};

export type createOrderDTO = Omit<Order, "id">;
export type updateOrderDTO = Pick<Order, "id"> & Partial<Order>;

export interface OrderRepo {
  createOrder: (userId: string, orderDetails: createOrderDTO) => Promise<Order>;
  updateOrder: (newOrderDetails: updateOrderDTO) => Promise<Order>;
  getOrderById: (orderId: string) => Promise<Order>;
  getOrdersByUser: (userId: string) => Promise<Order[]>;
  deleteOrder: (orderId: string) => Promise<void>;
  deleteUserOrders: (userId: string) => Promise<void>;
}

export interface OrderServ {
  createOrder: (userId: string, orderDetails: createOrderDTO) => Promise<Order>;
  updateOrder: (newOrderDetails: updateOrderDTO) => Promise<Order>;
  getOrderById: (orderId: string) => Promise<Order>;
  getOrdersByUser: (userId: string) => Promise<Order[]>;
  deleteOrder: (orderId: string) => Promise<void>;
  deleteUserOrders: (userId: string) => Promise<void>;
}
