import admin from "firebase-admin";
import {
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_PROJECT_ID,
} from "../../Config/Env.js";
import { Notification } from "./Notifications.types.js";
import { NotificationRepository } from "./Notifications.repository.js";
import { pgClient } from "../../Config/Db.js";

if (!admin.app.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const notificationRepo = new NotificationRepository(pgClient);

export const messaging = admin.messaging(),
  sendNotification = async (notification: Notification, tokens: any) => {
    if (!tokens.length) return;

    try {
      const response = await messaging.sendEachForMulticast({
          tokens,
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: {
            notificationId: notification.id,
            type: notification.type ?? " ",
          },
        }),
        newNotification =
          await notificationRepo.createNotification(notification);

      await Promise.all(
        response.responses.map(async (response, index) => {
          const notificationStatus = response.success
            ? "sent"
            : response.error?.code ===
                "messaging/registration-token-not-registered"
              ? "invalid"
              : "failed";

          await notificationRepo.createNotificationDelivery({
            notification_id: notification.id,
            token: tokens[index],
            status: notificationStatus,
            error: response.error?.message ?? "",
          });

          if (notificationStatus === "invalid") {
            await notificationRepo.updateDeviceStatus(tokens[index], "invalid");
          }
        }),
      );
    } catch (error) {
      throw error;
    }
  };
