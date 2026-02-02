import { NotificationRepository } from "./Notifications.repository.js";
import {
  createNotificationDeliveryDTO,
  createNotificationDTO,
  DeviceData,
} from "./Notifications.types.js";

export class NotificationServ {
  constructor(private notificationRepo: NotificationRepository) {}

  async registerDevice(device: DeviceData) {
    try {
      const allowed_fields: string[] = ["user_id", "token", "platform"];

      let deviceData: Record<string, string> = {};

      for (let [key, value] of Object.entries(device)) {
        if (!allowed_fields.includes(key.toLowerCase())) continue;
        if (!value || value.length <= 0) throw new Error(`${key} has no value`);

        deviceData[key] = value;
      }

      await this.notificationRepo.registerDevice(deviceData as DeviceData);
    } catch (error) {
      throw error;
    }
  }

  async createNotification(notificationData: createNotificationDTO) {
    try {
      const allowed_fields: string[] = [
        "user_id",
        "title",
        "body",
        "data",
        "type",
      ];

      let notification: Record<string, string> = {};

      for (let [key, value] of Object.entries(notificationData)) {
        if (!allowed_fields.includes(key.toLowerCase())) continue;
        if (!value || value.length <= 0) throw new Error(`${key} has no value`);

        notification[key] = value;
      }

      await this.notificationRepo.createNotification(
        notification as createNotificationDTO,
      );
    } catch (error) {
      throw error;
    }
  }

  async createNotificationDelivery(
    notificationDeliveryData: createNotificationDeliveryDTO,
  ) {
    const allowed_fields: string[] = [
      "token",
      "status",
      "error",
      "notification_id",
    ];

    let notificationDelivery: Record<string, string> = {};

    for (let [key, value] of Object.entries(notificationDeliveryData)) {
      if (!allowed_fields.includes(key.toLowerCase())) continue;
      if (!value || value.length <= 0) throw new Error(`${key} has no value`);

      notificationDelivery[key] = value;
    }

    await this.notificationRepo.createNotificationDelivery(
      notificationDelivery as createNotificationDeliveryDTO,
    );
  }

  async updateDeviceStatus(token: string, status: string) {
    if (!token) throw new Error("Token must be provided");

    try {
      await this.notificationRepo.updateDeviceStatus(token, status);
    } catch (error) {
      throw error;
    }
  }

  async getUserNotifications(userId: string) {
    if (!userId) throw new Error("User id must be provided");
    try {
      const userNotifications =
        await this.notificationRepo.getUserNotifications(userId);

      return userNotifications;
    } catch (error) {
      throw error;
    }
  }

  async getUserTokens(userId: string) {
    if (!userId) throw new Error("User id must be provided");

    try {
      const userTokens = await this.notificationRepo.getUserTokens(userId);

      return userTokens.map((row) => row.token);
    } catch (error) {
      throw error;
    }
  }
}
