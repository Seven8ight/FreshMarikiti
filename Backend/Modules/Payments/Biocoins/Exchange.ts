import { QueryResult } from "pg";
import { pgClient } from "../../../Config/Db.js";
import { User } from "../../Users/User.types.js";
import { ReversalRequest, Transaction } from "./Types.js";
import { Product } from "../../Products/Product.types.js";
import { ProductRepository } from "../../Products/Product.repository.js";
import { UserRepository } from "../../Users/User.repository.js";
import { Order } from "../../Orders/Order.types.js";
import { privateDecrypt } from "crypto";
import { OrderRepository } from "../../Orders/Order.repository.js";

const UserRepo = new UserRepository(pgClient),
  OrderRepo = new OrderRepository(pgClient),
  ProductRepo = new ProductRepository(pgClient);

export const EditUserFunds = async (phone_number: string, amount: number) => {
    try {
      const updateUserFunds: QueryResult<User> = await pgClient.query(
        "UPDATE users SET biocoins=$1 where phone_number=$2 RETURNING *",
        [phone_number, amount],
      );

      if (updateUserFunds.rowCount && updateUserFunds.rowCount > 0)
        return updateUserFunds.rows[0];

      throw new Error("Error in updating funds");
    } catch (error) {
      throw error;
    }
  },
  Transact = async (OrderId: string) => {
    const Order = await OrderRepo.getOrderById(OrderId),
      buyer = await UserRepo.getUserById(Order.buyerid);

    Order.products.map(async (item) => {
      try {
        const product = await ProductRepo.getProductById(item.id),
          seller = await UserRepo.getUserById(product.sellerId);

        const totalAmount = product.amount * item.quantity;

        if (buyer.biocoins < totalAmount) throw new Error("Insufficient funds");

        const buyerBioCoins = buyer.biocoins - totalAmount,
          sellerBioCoins = seller.biocoins + totalAmount;

        await pgClient.query("UPDATE users SET biocoins=$1 WHERE id=$2", [
          buyerBioCoins,
          buyer.id,
        ]);

        await pgClient.query("UPDATE users SET biocoins=$1 WHERE id=$2", [
          sellerBioCoins,
          seller.id,
        ]);
      } catch (error) {
        throw error;
      }
    });
  },
  ReversalRequestForCash = async (phone_number: string, amount: number) => {
    try {
      const storeReverseRequest: QueryResult<ReversalRequest> =
        await pgClient.query(
          "INSERT INTO reverse_funds(phone_number,amount,status) VALUES($1,$2,$3) RETURNING *",
          [phone_number, amount, "Pending"],
        );

      if (storeReverseRequest.rowCount && storeReverseRequest.rowCount > 0)
        return storeReverseRequest.rows[0];

      throw new Error("Error occured in creating reversal request, try again");
    } catch (error) {
      throw error;
    }
  },
  UpdateReversalRequest = async (id: string, status: string) => {
    try {
      const updateReverseStatus: QueryResult<ReversalRequest> =
        await pgClient.query(
          "UPDATE reverse_funds SET status=$1 WHERE id=$2 RETURNING *",
          [status, id],
        );

      if (updateReverseStatus.rowCount && updateReverseStatus.rowCount > 0)
        return updateReverseStatus.rows[0];

      throw new Error("Error in updating status");
    } catch (error) {
      throw error;
    }
  };
