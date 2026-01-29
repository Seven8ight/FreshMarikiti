import Stripe from "stripe";
import {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
} from "../../../Config/Env.js";
import { PaymentRepository } from "../Payment.repository.js";
import { pgClient } from "../../../Config/Db.js";
import { PaymentService } from "../Payment.service.js";

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
          const intent = event.data.object as Stripe.PaymentIntent;
          console.log(intent.payment_method);

          break;
        }

        case "charge.succeeded": {
          const charge = event.data.object as Stripe.Charge,
            paymentIntentId = charge.payment_intent;

          paymentService.editReceipt({
            stripe_payment_intent_id: paymentIntentId as string,
            status: "Completed",
          });

          console.log(`💰 Charge Succeeded for ${paymentIntentId}!`);

          break;
        }

        case "charge.failed": {
          const charge = event.data.object as Stripe.Charge,
            paymentIntentId = charge.payment_intent;

          paymentService.editReceipt({
            stripe_payment_intent_id: paymentIntentId as string,
            status: "Rejected",
          });

          console.log(`💰 Charge Succeeded for ${paymentIntentId}!`);

          break;
        }

        case "payment_intent.payment_failed": {
          console.log("Charge succeeded body\n");
          const intent = event.data.object as Stripe.PaymentIntent;
          //   console.log(intent.payment_method);

          break;
        }

        case "payment_intent.created":
          console.log("Payment intent creation\n");
          //   console.log(event.data);

          break;
        case "charge.updated":
          console.log("Charge updated body\n");
          //   console.log(event.data);
          break;
        default:
          console.log("Unhandled Stripe event:", event.type);
      }
    } catch (error) {
      console.error("❌ Error processing Stripe webhook:", error);
    }
  };
