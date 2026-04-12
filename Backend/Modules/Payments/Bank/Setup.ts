import Stripe from "stripe";
import {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
} from "../../../Config/Env.js";
import { PaymentRepository } from "../Payment.repository.js";
import { pgClient } from "../../../Config/Db.js";
import { PaymentService } from "../Payment.service.js";
import { EditUserFunds } from "../Biocoins/Exchange.js";

const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

const paymentRepo = new PaymentRepository(pgClient),
  paymentService = new PaymentService(paymentRepo);

export const MakeBankPayment = async (amount: number) =>
    await stripe.paymentIntents.create({
      amount: amount,
      currency: "KES",
      automatic_payment_methods: {
        enabled: true,
      },
    }),
  StripeWebHookHandler = async (
    stripeWebhook: string,
    stripeSignature: string,
  ) => {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        stripeWebhook,
        stripeSignature!,
        STRIPE_WEBHOOK_SECRET!,
      );
    } catch (error: any) {
      console.error("❌ Stripe webhook signature verification failed:");
      console.log(error.message);
      return;
    }

    try {
      switch (event.type) {
        case "payment_intent.succeeded": {
          const intent = event.data.object as Stripe.PaymentIntent,
            payment = await paymentService.editReceipt({
              stripe_payment_intent_id: intent.id,
              status: "Completed",
            });

          const existing = await paymentService.getReceipt(intent.id);

          if (existing.status === "Completed") return existing;

          await EditUserFunds(intent.amount_received, payment.phone_number);

          return payment;
        }

        case "payment_intent.payment_failed": {
          const intent = event.data.object as Stripe.PaymentIntent;

          const payment = await paymentService.editReceipt({
            stripe_payment_intent_id: intent.id,
            status: "Rejected",
          });

          return payment;
        }

        default:
          console.log("Ignored event:", event.type);

          break;
      }
    } catch (error) {
      console.error("❌ Error processing Stripe webhook:", error);
      return error;
    }
  };
