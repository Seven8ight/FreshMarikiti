import { Client, QueryResult } from "pg";
import {
  createOrderDTO,
  Order,
  OrderRepo,
  updateOrderDTO,
} from "./Order.types";
import { warningMsg } from "../../Utils/Logger";

export class OrderRepository implements OrderRepo {
  constructor(private DB: Client) {}

  async createOrder(
    userId: string,
    orderDetails: createOrderDTO,
  ): Promise<Order> {
    try {
      const orderItem: QueryResult<Order> = await this.DB.query(
        "INSERT INTO orders(buyerId,products,quantity,status) VALUES($1,$2,$3,$4) RETURNING *",
        [
          userId,
          JSON.stringify(orderDetails.products),
          orderDetails.quantity,
          orderDetails.status,
        ],
      );

      if (orderItem.rowCount && orderItem.rowCount > 0)
        return orderItem.rows[0];

      throw new Error("Order creation failed, try again");
    } catch (error) {
      warningMsg(`Error at creating todo repo`);
      throw error;
    }
  }

  async updateOrder(newOrderDetails: updateOrderDTO): Promise<Order> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex = 2;

      for (let [key, value] of Object.entries(newOrderDetails)) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const todoUpdate: QueryResult<Order> = await this.DB.query(
        `UPDATE todos SET ${keys.join(",")} WHERE id=$1 RETURNING *`,
        [newOrderDetails.id, ...values],
      );

      if (todoUpdate.rowCount && todoUpdate.rowCount > 0)
        return todoUpdate.rows[0]!;

      throw new Error(`Todo item does not exist of id, ${newOrderDetails.id}`);
    } catch (error) {
      warningMsg("Edit todo repo error occurred");
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
      throw new Error("Todo does not exist");
    } catch (error) {
      warningMsg("Get todo repo error occurred");
      throw error;
    }
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    try {
      const retrievalOrderByUser: QueryResult<Order> = await this.DB.query(
        "SELECT * FROM orders WHERE userId=$2",
        [userId],
      );

      if (retrievalOrderByUser.rowCount && retrievalOrderByUser.rowCount > 0)
        return retrievalOrderByUser.rows;
      throw new Error("Todo does not exist");
    } catch (error) {
      warningMsg("Get todo repo error occurred");
      throw error;
    }
  }

  async deleteOrder(orderId: string): Promise<void> {
    try {
      await this.DB.query(`DELETE FROM orders WHERE id=$1`, [orderId]);
    } catch (error) {
      warningMsg("Delete user repo error occurred");
      throw error;
    }
  }

  async deleteUserOrders(userId: string): Promise<void> {
    try {
      await this.DB.query(`DELETE FROM orders WHERE userId=$2`, [userId]);
    } catch (error) {
      warningMsg("Delete user repo error occurred");
      throw error;
    }
  }
}
