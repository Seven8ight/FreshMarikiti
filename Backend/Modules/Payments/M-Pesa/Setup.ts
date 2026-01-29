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
): Promise<any> => {
  // 1. Format Phone Number (Ensure 2547XXXXXXXX)
  const formattedPhone = phoneNumber.startsWith("254")
    ? phoneNumber
    : "254" + phoneNumber.slice(-9);

  // 2. Generate strictly formatted 14-digit Timestamp: YYYYMMDDHHmmss
  const date = new Date();
  const timeStamp = [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, "0"),
    date.getDate().toString().padStart(2, "0"),
    date.getHours().toString().padStart(2, "0"),
    date.getMinutes().toString().padStart(2, "0"),
    date.getSeconds().toString().padStart(2, "0"),
  ].join("");

  // 3. Get Token and Credentials
  const tokenRaw = await generateMpesaToken();
  const accessToken = JSON.parse(tokenRaw).access_token;
  const shortCode = "174379"; // Standard Sandbox Shortcode

  // 4. Generate Password
  const password = Buffer.from(shortCode + MPESA_PASSKEY + timeStamp).toString(
    "base64",
  );

  const postData = JSON.stringify({
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timeStamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.round(amount), // Sandbox prefers integers
    PartyA: formattedPhone,
    PartyB: shortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: MPESA_CALLBACK_URL,
    AccountReference: "Fresh Marikiti",
    TransactionDesc: "Payment for services",
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "sandbox.safaricom.co.ke",
      path: "/mpesa/stkpush/v1/processrequest",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const request = https.request(options, (response) => {
      let responseBody = "";

      response.on("data", (chunk) => (responseBody += chunk));

      response.on("end", () => {
        try {
          const parsed = JSON.parse(responseBody);

          if (parsed.errorMessage || parsed.errorCode) {
            reject(parsed);
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error("Failed to parse M-Pesa response"));
        }
      });
    });

    request.on("error", (err) => reject(err));
    request.write(postData);
    request.end();
  });
};
