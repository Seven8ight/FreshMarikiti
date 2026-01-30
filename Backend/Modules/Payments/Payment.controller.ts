import { IncomingMessage, ServerResponse } from "node:http";
import { makePayment } from "./M-Pesa/Setup.js";
import { PaymentRepository } from "./Payment.repository.js";
import { PaymentService } from "./Payment.service.js";
import { pgClient } from "../../Config/Db.js";
import { EditUserFunds, ReversalRequestForCash } from "./Biocoins/Exchange.js";
import { MakeBankPayment, StripeWebHookHandler } from "./Bank/Setup.js";

export const PaymentController = async (
  request: IncomingMessage,
  response: ServerResponse,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`);
  const pathName = requestUrl.pathname.split("/").filter(Boolean);

  let unparsedRequestBody = "";

  // 1. Collect Request Body
  request.on("data", (chunk) => {
    unparsedRequestBody += chunk.toString();
  });

  request.on("end", async () => {
    try {
      const parsedRequestBody = JSON.parse(unparsedRequestBody || "{}");

      const paymentRepo = new PaymentRepository(pgClient),
        paymentService = new PaymentService(paymentRepo);

      switch (pathName[2]) {
        case "mpesa":
          switch (pathName[3]) {
            case "initiate":
              try {
                const mpesaResponse = await makePayment(
                  parsedRequestBody.phone_number,
                  parsedRequestBody.amount,
                );

                await paymentService.createReceipt({
                  ...parsedRequestBody,
                  means_of_payment: "mpesa",
                  status: "Pending",
                  merchant_request_id: mpesaResponse.MerchantRequestID, // Store this to track the callback
                  checkout_request_id: mpesaResponse.CheckoutRequestID,
                });

                response.writeHead(200, { "Content-Type": "application/json" });
                response.end(
                  JSON.stringify({
                    message: "STK Push sent successfully",
                    data: mpesaResponse,
                  }),
                );
              } catch (mpesaError: any) {
                response.writeHead(400, { "Content-Type": "application/json" });
                response.end(
                  JSON.stringify({
                    error: "M-Pesa Initiation Failed",
                    details: mpesaError.errorMessage || mpesaError.message,
                  }),
                );
              }
              break;

            case "redirect":
              const { Body } = parsedRequestBody,
                { ResultCode, CheckoutRequestID } = Body.stkCallback;

              if (ResultCode === 0) {
                await paymentService.editReceipt({
                  checkout_request_id: CheckoutRequestID,
                  status: "Completed",
                });

                const user = await paymentService.getReceipt(CheckoutRequestID);

                EditUserFunds(user.phone_number, Number.parseInt(user.amount));

                response.writeHead(200);
                response.end(
                  JSON.stringify({ ResultCode: 0, ResultDesc: "Success" }),
                );
              } else {
                await paymentService.editReceipt({
                  checkout_request_id: CheckoutRequestID,
                  status: "Rejected",
                });

                response.writeHead(200); // Safaricom expects 200 even for failed payments
                response.end(
                  JSON.stringify({ ResultCode: 1, ResultDesc: "Acknowledged" }),
                );
              }
              break;

            default:
              response.writeHead(404);
              response.end(
                JSON.stringify({ error: "M-Pesa sub-route not found" }),
              );
          }
          break;

        case "bank":
          switch (pathName[3]) {
            case "initiate":
              const { phone_number, amount, order_id } = parsedRequestBody,
                newAmount = amount * 100;

              if (!phone_number || !amount) {
                response.writeHead(400);
                response.end(
                  JSON.stringify({
                    error:
                      "Ensure to provide phone number(phone_number) and amount",
                  }),
                );
                return;
              }

              const paymentIntent = await MakeBankPayment(newAmount);

              const paymentData: Record<string, any> = {
                phone_number: phone_number,
                amount: newAmount,
                order_id: order_id,
                means_of_payment: "Bank",
                stripe_payment_intent_id: paymentIntent.client_secret,
                status: "Pending",
              };

              paymentService.createReceipt(paymentData);

              response.writeHead(200);
              response.end(JSON.stringify(paymentIntent.client_secret));

              break;
            case "redirect":
              const stripeSignature = request.headers["stripe-signature"];

              StripeWebHookHandler(
                unparsedRequestBody,
                stripeSignature as string,
              );

              response.writeHead(200);
              response.end(
                JSON.stringify({
                  message: "Received successfully",
                }),
              );

              break;
          }
          break;

        case "reversal":
          switch (pathName[3]) {
            case "request":
              const makeRequest = await ReversalRequestForCash(
                parsedRequestBody.phone_number,
                parsedRequestBody.amount,
              );

              response.writeHead(201);
              response.end(JSON.stringify(makeRequest));
              break;
            case "update":
              break;
            default:
              break;
          }
          break;

        default:
          response.writeHead(404);
          response.end(JSON.stringify({ error: "Invalid payment method" }));
      }
    } catch (error: any) {
      console.error("Controller Error:", error);
      response.writeHead(500);
      response.end(
        JSON.stringify({
          error: "Internal Server Error",
          details: error.message,
        }),
      );
    }
  });
};
