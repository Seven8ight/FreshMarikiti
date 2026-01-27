import { IncomingMessage, ServerResponse } from "node:http";
import { makePayment } from "./M-Pesa/Setup.js";
import { PaymentRepository } from "./Payment.repository.js";
import { PaymentService } from "./Payment.service.js";
import { pgClient } from "../../Config/Db.js";

export const PaymentController = (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathName = requestUrl.pathname,
    { authorization } = request.headers;

  let unparsedRequestBody = "";

  const paymentRepo = new PaymentRepository(pgClient),
    paymentService = new PaymentService(paymentRepo);

  request.on(
    "data",
    (data: Buffer) => (unparsedRequestBody += data.toString()),
  );

  request.on("end", () => {
    if (unparsedRequestBody.length == 0) unparsedRequestBody = "{}";
    let parsedRequestBody = JSON.parse(unparsedRequestBody);

    switch (pathName[2]) {
      case "mpesa":
        switch (pathName[3]) {
          case "initiate":
            const paymentProcess = makePayment(
              parsedRequestBody.phoneNumber,
              parsedRequestBody.amount,
            );
            //parsedRequestbody contains order_id,amount and phone number and means of payment
            parsedRequestBody["means_of_payment"] = "mpesa";
            parsedRequestBody["status"] = "Pending";

            paymentService.createReceipt(parsedRequestBody);
            break;
          case "redirect":
            const paymentResponse = parsedRequestBody;
            let { Body } = paymentResponse,
              { ResultCode, CallbackMetadata } = Body.stkCallback,
              amount =
                CallbackMetadata.Item[
                  CallbackMetadata.Item.findIndex(
                    (item: any) => item.Name == "Amount",
                  )
                ].Value;

            if (ResultCode == "0") {
              paymentService.editReceipt({
                phone_number: paymentResponse.phoneNumber,
                status: "Completed",
              });

              response.writeHead(200);
              response.end(
                JSON.stringify({
                  message: "Payment successful",
                }),
              );
              return;
            } else {
              response.writeHead(402);
              response.end(
                JSON.stringify({
                  message: "Payment not successful",
                }),
              );
              return;
            }
        }

        break;
      case "bank":
        switch (pathName[3]) {
          case "initiate":
            break;
          case "redirect":
            break;
        }
        break;
      case "biocoins":
        break;
    }
  });
};
