import admin from "firebase-admin";
import {
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_PROJECT_ID,
} from "../../Config/Env.js";
import { createNotificationDTO, Notification } from "./Notifications.types.js";
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

const notificationChunk = <T>(array: T[], size: number) => {
  const result: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
};

export const messaging = admin.messaging(),
  sendNotification = async (
    notification: createNotificationDTO,
    tokens: string[],
  ) => {
    if (!tokens.length) return;

    try {
      const newNotification =
        await notificationRepo.createNotification(notification);

      const chunks = notificationChunk(tokens, 500);

      for (const chunk of chunks) {
        const response = await messaging.sendEachForMulticast({
          tokens: chunk,
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: {
            notificationId: newNotification.id,
            type: notification.type ?? " ",
          },
        });

        await Promise.all(
          response.responses.map(async (response, index) => {
            const notificationStatus = response.success
              ? "sent"
              : response.error?.code ===
                  "messaging/registration-token-not-registered"
                ? "invalid"
                : "failed";

            await notificationRepo.createNotificationDelivery({
              notification_id: newNotification.id,
              token: chunk[index],
              status: notificationStatus,
              error: response.error?.message ?? "",
            });

            if (notificationStatus === "invalid") {
              await notificationRepo.updateDeviceStatus(
                chunk[index],
                "invalid",
              );
            }
          }),
        );
      }
    } catch (error) {
      throw error;
    }
  };
