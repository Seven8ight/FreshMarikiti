import { Client, QueryResult } from "pg";
import {
  createOrderDTO,
  Order,
  OrderRepo,
  updateOrderDTO,
} from "./Order.types.js";
import { warningMsg } from "../../Utils/Logger.js";

export class OrderRepository implements OrderRepo {
  constructor(private DB: Client) {}

  async createOrder(
    userId: string,
    orderDetails: createOrderDTO,
  ): Promise<Order> {
    try {
      const orderItem: QueryResult<Order> = await this.DB.query(
        "INSERT INTO orders(buyerid,products,status) VALUES($1,$2,$3) RETURNING *",
        [userId, JSON.stringify(orderDetails.products), "Pending"],
      );

      if (orderItem.rowCount && orderItem.rowCount > 0)
        return orderItem.rows[0];

      throw new Error("Order creation failed, try again");
    } catch (error) {
      warningMsg(`Error at creating order repo`);
      throw error;
    }
  }

  async updateOrder(
    userId: string,
    newOrderDetails: updateOrderDTO,
  ): Promise<Order> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex = 2;

      for (let [key, value] of Object.entries(newOrderDetails)) {
        if (key == "id") continue;

        keys.push(`${key}=$${paramIndex++}`);

        if (key == "products") values.push(JSON.stringify(value));
        else values.push(value);
      }

      const orderUpdate: QueryResult<Order> = await this.DB.query(
        `UPDATE orders SET ${keys.join(",")} WHERE id=$1 RETURNING *`,
        [newOrderDetails.id, ...values],
      );

      if (orderUpdate.rowCount && orderUpdate.rowCount > 0)
        return orderUpdate.rows[0]!;

      throw new Error(`Order item does not exist of id, ${newOrderDetails.id}`);
    } catch (error) {
      warningMsg("Edit order repo error occurred");
      throw error;
    }
  }

  async getOrderById(orderId: string): Promise<Order> {
    try {
      const orderRetrieval: QueryResult<Order> = await this.DB.query(
        "SELECT * FROM orders WHERE id=$1",
        [orderId],
      );

      if (orderRetrieval.rowCount && orderRetrieval.rowCount > 0)
        return orderRetrieval.rows[0]!;
      throw new Error("Order does not exist");
    } catch (error) {
      warningMsg("Get order repo error occurred");
      throw error;
    }
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    try {
      const retrievalOrderByUser: QueryResult<Order> = await this.DB.query(
        "SELECT * FROM orders WHERE buyerid=$1",
        [userId],
      );

      if (retrievalOrderByUser.rowCount && retrievalOrderByUser.rowCount > 0)
        return retrievalOrderByUser.rows;
      throw new Error("Order does not exist");
    } catch (error) {
      warningMsg("Get order repo error occurred");
      throw error;
    }
  }

  async deleteOrder(orderId: string): Promise<void> {
    try {
      await this.DB.query(`DELETE FROM orders WHERE id=$1`, [orderId]);
    } catch (error) {
      warningMsg("Delete order repo error occurred");
      throw error;
    }
  }

  async deleteUserOrders(userId: string): Promise<void> {
    try {
      await this.DB.query(`DELETE FROM orders WHERE buyerid=$1`, [userId]);
    } catch (error) {
      warningMsg("Delete user order repo error occurred");
      throw error;
    }
  }
}
