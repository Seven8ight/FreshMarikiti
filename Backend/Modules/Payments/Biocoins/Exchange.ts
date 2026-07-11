import { QueryResult } from "pg";
import { pgClient } from "../../../Config/Db.js";
import { User } from "../../Users/User.types.js";
import { ReversalRequest } from "./Types.js";
import { ProductRepository } from "../../Products/Product.repository.js";
import { UserRepository } from "../../Users/User.repository.js";
import { OrderRepository } from "../../Orders/Order.repository.js";

const UserRepo = new UserRepository(pgClient),
  OrderRepo = new OrderRepository(pgClient),
  ProductRepo = new ProductRepository(pgClient);

export const EditUserFunds = async (
    amount: number,
    phone_number?: string,
    userId?: string,
  ) => {
    try {
      const updateUserFunds: QueryResult<User> = await pgClient.query(
        "UPDATE users SET biocoins = biocoins + $1 WHERE phone_number=$2 OR id=$3 RETURNING *",
        [amount, phone_number ?? null, userId ?? null],
      );

      if (updateUserFunds.rowCount && updateUserFunds.rowCount > 0)
        return updateUserFunds.rows[0];

      throw new Error("Error in updating funds");
    } catch (error) {
      throw error;
    }
  },
  Transact = async (OrderId: string, callerId?: string) => {
    const Order = await OrderRepo.getOrderById(OrderId);

    if (callerId && Order.buyerid !== callerId)
      throw new Error("You are not authorized to pay for this order");

    try {
      await pgClient.query("BEGIN");

      const buyerResult: QueryResult<User> = await pgClient.query(
        "SELECT * FROM users WHERE id=$1 FOR UPDATE",
        [Order.buyerid],
      );
      const buyer = buyerResult.rows[0];
      if (!buyer) throw new Error("Buyer not found");

      let remainingBalance = buyer.biocoins;

      for (const item of Order.products) {
        const product = await ProductRepo.getProductById(item.id),
          seller = await UserRepo.getUserById(product.sellerId);

        const totalAmount = product.amount * item.quantity;

        if (remainingBalance < totalAmount)
          throw new Error("Insufficient funds");

        remainingBalance -= totalAmount;

        await pgClient.query(
          "UPDATE users SET biocoins = biocoins + $1 WHERE id=$2",
          [totalAmount, seller.id],
        );
      }

      await pgClient.query("UPDATE users SET biocoins=$1 WHERE id=$2", [
        remainingBalance,
        buyer.id,
      ]);

      await pgClient.query("COMMIT");
    } catch (error) {
      await pgClient.query("ROLLBACK");
      throw error;
    }
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
