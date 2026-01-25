import {
  createOrderDTO,
  Order,
  OrderServ,
  updateOrderDTO,
} from "./Order.types.js";
import { OrderRepository } from "./Order.repository.js";
import { warningMsg } from "../../Utils/Logger.js";

export class OrderService implements OrderServ {
  constructor(private orderRepo: OrderRepository) {}

  async createOrder(userId: string, orderDetails: createOrderDTO) {
    if (!userId)
      throw new Error("User id should be provided for product creation");
    const allowedFields: string[] = [
      "name",
      "sellerid",
      "description",
      "quantity",
      "image",
      "amount",
      "category",
    ];

    let newOrderData: Record<string, any> = {};

    for (let [key, value] of Object.entries(orderDetails)) {
      if (!allowedFields.includes(key.toLowerCase())) continue;
      if (typeof value == "string" && value.length < 0)
        throw new Error(`${key} has an empty value`);

      newOrderData[key] = value;
    }

    const newOrder: Order = await this.orderRepo.createOrder(
      userId,
      newOrderData as createOrderDTO,
    );

    return newOrder;
  }

  async updateOrder(newOrderDetails: updateOrderDTO) {
    if (!newOrderDetails.id) throw new Error("Order id not provided");

    try {
      const allowedFields: string[] = [
        "name",
        "description",
        "quantity",
        "image",
        "amount",
        "category",
      ];

      let newOrderObject: Record<string, any> = {};

      for (let [key, value] of Object.entries(newOrderDetails)) {
        if (!allowedFields.includes(key.toLowerCase())) continue;
        if (!value) throw new Error(`${key} has no value`);
        if (typeof value == "string" && value.length < 0)
          throw new Error(`${key} has an empty value`);

        newOrderObject[key] = value;
      }

      newOrderObject["id"] = newOrderDetails.id;

      const updatedOrder = await this.orderRepo.updateOrder(
        newOrderObject as updateOrderDTO,
      );

      return updatedOrder;
    } catch (error) {
      warningMsg("Edit user service error occurred");
      throw error;
    }
  }

  async getOrderById(orderId: string) {
    if (!orderId) throw new Error("Product id not provided for retrieval");

    try {
      const retrieveProductsById = await this.orderRepo.getOrderById(orderId);

      return retrieveProductsById;
    } catch (error) {
      warningMsg("Get todo service error occurred");
      throw error;
    }
  }

  async getOrdersByUser(userId: string) {
    if (!userId) throw new Error("Product id not provided for retrieval");

    try {
      const retrieveProductsById = await this.orderRepo.getOrdersByUser(userId);

      return retrieveProductsById;
    } catch (error) {
      warningMsg("Get todo service error occurred");
      throw error;
    }
  }

  async deleteOrder(orderId: string) {
    if (!orderId) throw new Error("Product id not provided for deletion");

    try {
      await this.orderRepo.deleteOrder(orderId);
    } catch (error) {
      warningMsg("Delete user service error occurred");
      throw error;
    }
  }

  async deleteUserOrders(userId: string) {
    if (!userId) throw new Error("Product id not provided for deletion");

    try {
      await this.orderRepo.deleteUserOrders(userId);
    } catch (error) {
      warningMsg("Delete user service error occurred");
      throw error;
    }
  }
}
