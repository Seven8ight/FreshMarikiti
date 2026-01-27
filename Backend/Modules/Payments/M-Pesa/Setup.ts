import { IncomingMessage } from "http";
import * as https from "https";
import {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY,
  MPESA_CALLBACK_URL,
} from "./../../../Config/Env.js";

export const generateMpesaToken = async (): Promise<any | Error> => {
  return new Promise((resolve, reject) => {
    let returnToken: any = "",
      basicAuthToken = Buffer.from(
        `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`,
      ).toString("base64"),
      requestToken = https.request(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        {
          method: "GET",
          headers: {
            authorization: `Basic ${basicAuthToken}`,
          },
        },
        (response: IncomingMessage) => {
          response.on("data", (token: Buffer) => {
            returnToken += token.toString();
          });
          response.on("error", (error) => {
            reject(error);
          });
        },
      );

    requestToken.on("error", (error) => {
      reject(error);
    });
    requestToken.on(
      "end",
      () => (returnToken = JSON.parse(JSON.stringify(returnToken))),
    );
    requestToken.on("close", () => {
      returnToken && resolve(returnToken);
    });

    requestToken.end();
  });
};

export const makePayment = async (
  phoneNumber: string,
  amount: number,
): Promise<any | Error> => {
  const phonenumber = phoneNumber.includes("254")
      ? phoneNumber
      : "254" + phoneNumber.slice(1),
    token = await generateMpesaToken(),
    currentDate = new Date(),
    timeStamp =
      currentDate.getFullYear().toString() +
      (currentDate.getMonth() + 1).toString().padStart(2, "0") +
      currentDate.getDate().toString().padStart(2, "0") +
      currentDate.getHours().toString().padStart(2, "0") +
      currentDate.getMinutes().toString().padStart(2, "0") +
      currentDate.getSeconds().toString().padStart(2, "0"),
    password = Buffer.from(
      (((MPESA_SHORTCODE as string) + MPESA_PASSKEY) as string) + timeStamp,
    ).toString("base64");

  return new Promise((resolve, reject) => {
    try {
      if (token instanceof Error == false) {
        let paymentRequest = https.request(
          "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
          {
            method: "POST",
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              authorization: ` Bearer ${
                (JSON.parse(token) as any).access_token
              }`,
            },
          },
          (response: IncomingMessage) => {
            response.on("error", (error) => {
              reject(error);
            });
            response.on("data", (data: Buffer) => {
              console.log(JSON.parse(data.toString()));
              resolve(data.toString());
            });
          },
        );

        paymentRequest.write(
          JSON.stringify({
            BusinessShortCode: MPESA_SHORTCODE,
            Password: password,
            Timestamp: timeStamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phonenumber,
            PartyB: MPESA_SHORTCODE,
            PhoneNumber: phonenumber,
            CallBackURL: MPESA_CALLBACK_URL,
            AccountReference: "Test",
            TransactionDesc: "Test",
          }),
        );

        paymentRequest.on("error", (error) => reject(error));
        paymentRequest.end();
      } else return "Error occured in creating token";
    } catch (error) {
      reject(error);
    }
  });
};
