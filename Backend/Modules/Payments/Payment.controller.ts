import { IncomingMessage, ServerResponse } from "node:http";
import { makePayment } from "./M-Pesa/Setup.js";
import { PaymentRepository } from "./Payment.repository.js";
import { PaymentService } from "./Payment.service.js";
import { pgClient } from "../../Config/Db.js";

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

      // Initialize Services
      const paymentRepo = new PaymentRepository(pgClient);
      const paymentService = new PaymentService(paymentRepo);

      // Routing Logic
      switch (pathName[2]) {
        case "mpesa":
          switch (pathName[3]) {
            case "initiate":
              try {
                // IMPORTANT: You must await the M-Pesa API call
                const mpesaResponse = await makePayment(
                  parsedRequestBody.phone_number,
                  parsedRequestBody.amount,
                );

                // If makePayment succeeded, create the record in your DB
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
              console.log("M-Pesa Callback Received:", parsedRequestBody);

              const { Body } = parsedRequestBody;
              const { ResultCode, CheckoutRequestID, CallbackMetadata } =
                Body.stkCallback;

              if (ResultCode === 0) {
                const items = CallbackMetadata.Item;

                await paymentService.editReceipt({
                  checkout_request_id: CheckoutRequestID,
                  status: "Completed",
                  phone_number: CallbackMetadata[4].Value,
                });

                response.writeHead(200);
                response.end(
                  JSON.stringify({ ResultCode: 0, ResultDesc: "Success" }),
                );
              } else {
                // Payment failed or cancelled by user
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
          response.writeHead(501);
          response.end(
            JSON.stringify({ message: "Bank integration not implemented" }),
          );
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
