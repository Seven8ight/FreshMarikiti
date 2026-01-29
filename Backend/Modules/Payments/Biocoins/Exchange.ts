import { QueryResult } from "pg";
import { pgClient } from "../../../Config/Db.js";
import { User } from "../../Users/User.types.js";
import { ReversalRequest } from "./Types.js";

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
  ReversalRequestForCash = async (phone_number: string, amount: number) => {
    try {
      const storeReveseRequest: QueryResult<ReversalRequest> =
        await pgClient.query(
          "INSERT INTO reverse_funds(phone_number,amount,status) VALUES($1,$2,$3) RETURNING *",
          [phone_number, amount, "Pending"],
        );

      if (storeReveseRequest.rowCount && storeReveseRequest.rowCount > 0)
        return storeReveseRequest.rows[0];

      throw new Error("Error occured in creating reversal request, try again");
    } catch (error) {
      throw error;
    }
  };
