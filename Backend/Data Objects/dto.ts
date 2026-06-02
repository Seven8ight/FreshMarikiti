import { pgClient } from "../Config/Db.js";
import { AuthRepository } from "../Modules/Auth/Auth.repository.js";
import { AuthService } from "../Modules/Auth/Auth.service.js";
import { ChatRepository } from "../Modules/Chats/Chat.repository.js";
import { ChatService } from "../Modules/Chats/Chat.service.js";
import { FeedbackRepository } from "../Modules/Feedback/Feedback.repository.js";
import { FeedbackService } from "../Modules/Feedback/Feedback.service.js";
import { MarketRepository } from "../Modules/Market/Market.repository.js";
import { MarketService } from "../Modules/Market/Market.service.js";
import { NotificationRepository } from "../Modules/Notifications/Notifications.repository.js";
import { NotificationServ } from "../Modules/Notifications/Notifications.service.js";
import { OrderRepository } from "../Modules/Orders/Order.repository.js";
import { OrderService } from "../Modules/Orders/Order.service.js";
import { PaymentRepository } from "../Modules/Payments/Payment.repository.js";
import { PaymentService } from "../Modules/Payments/Payment.service.js";
import { ProductRepository } from "../Modules/Products/Product.repository.js";
import { ProductService } from "../Modules/Products/Product.service.js";
import { UserRepository } from "../Modules/Users/User.repository.js";
import { UserService } from "../Modules/Users/User.service.js";
import { WasteRepository } from "../Modules/Waste Collection/Waste.repository.js";
import { WasteService } from "../Modules/Waste Collection/Waste.service.js";

export const authRepo = new AuthRepository(pgClient),
  usersRepo = new UserRepository(pgClient),
  productsRepo = new ProductRepository(pgClient),
  wasteCollectionRepo = new WasteRepository(pgClient),
  marketRepo = new MarketRepository(pgClient),
  feedbackRepo = new FeedbackRepository(pgClient),
  orderRepo = new OrderRepository(pgClient),
  notificationsRepo = new NotificationRepository(pgClient),
  chatRepo = new ChatRepository(pgClient),
  paymentsRepo = new PaymentRepository(pgClient);

export const authService = new AuthService(authRepo),
  usersService = new UserService(usersRepo),
  productsService = new ProductService(productsRepo),
  wasteCollectionService = new WasteService(wasteCollectionRepo),
  marketService = new MarketService(marketRepo),
  feedbackService = new FeedbackService(feedbackRepo),
  orderService = new OrderService(orderRepo),
  notificationsService = new NotificationServ(notificationsRepo),
  chatService = new ChatService(chatRepo),
  paymentsService = new PaymentService(paymentsRepo);
