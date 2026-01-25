import type { IncomingMessage, ServerResponse } from "node:http";
import { UserController } from "./Modules/Users/User.controller.js";
import { PaymentController } from "./Modules/Payments/Payment.controller.js";
import { ProductController } from "./Modules/Products/Product.controller.js";
import { AuthController } from "./Modules/Auth/Auth.controller.js";
import { FeedbackController } from "./Modules/Feedback/Feedback.controller.js";
import { OrderController } from "./Modules/Orders/Order.controller.js";
import { WasteController } from "./Modules/Waste Collection/Waste.controller.js";
import { MarketController } from "./Modules/Market/Market.controller.js";
import { ChatController } from "./Modules/Chats/Chat.controller.js";

type Route = {
  pathname: string;
  controller: (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>,
  ) => void;
};

export default function Routes(): Route[] {
  return [
    {
      pathname: "users",
      controller: UserController,
    },
    {
      pathname: "payments",
      controller: PaymentController,
    },
    {
      pathname: "auth",
      controller: AuthController,
    },
    {
      pathname: "products",
      controller: ProductController,
    },
    {
      pathname: "feedback",
      controller: FeedbackController,
    },
    {
      pathname: "orders",
      controller: OrderController,
    },
    {
      pathname: "waste",
      controller: WasteController,
    },
    {
      pathname: "market",
      controller: MarketController,
    },
    {
      pathname: "chats",
      controller: ChatController,
    },
  ];
}
