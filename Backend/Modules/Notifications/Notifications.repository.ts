import { Client, QueryResult } from "pg";
import {
  createNotificationDeliveryDTO,
  createNotificationDTO,
  DeviceData,
} from "./Notifications.types.js";

export class NotificationRepository {
  constructor(private DB: Client) {}

  async registerDevice(device: DeviceData) {
    try {
      let deviceRegistration = await this.DB.query(
        "INSERT INTO device_tokens(user_id,token,platform) VALUES($1,$2,$3) RETURNING *",
        [device.user_id, device.token, device.platform],
      );

      if (deviceRegistration.rowCount && deviceRegistration.rowCount > 0)
        return deviceRegistration.rows[0];

      throw new Error("Database error in device storage, try again");
    } catch (error) {
      throw error;
    }
  }

  async createNotification(notificationData: createNotificationDTO) {
    try {
      let notification = await this.DB.query(
        "INSERT INTO notifications(user_id, title, body, data, type) VALUES($1,$2,$3,$4,$5) RETURNING *",
        [
          notificationData.user_id,
          notificationData.title,
          notificationData.body,
          notificationData.data,
          notificationData.type,
        ],
      );

      if (notification.rowCount && notification.rowCount > 0)
        return notification.rows[0];

      throw new Error("Error in creating notification");
    } catch (error) {
      throw error;
    }
  }

  async createNotificationDelivery(
    notificationDeliveryData: createNotificationDeliveryDTO,
  ) {
    try {
      const notificationDelivery = await this.DB.query(
        "INSERT INTO notification_deliveries(notification_id,token,status,error) VALUES($1,$2,$3,$4)",
        [
          notificationDeliveryData.notification_id,
          notificationDeliveryData.token,
          notificationDeliveryData.status,
          notificationDeliveryData.error,
        ],
      );

      if (notificationDelivery.rowCount && notificationDelivery.rowCount > 0)
        return notificationDelivery.rows[0];

      throw new Error("Error in creating notification delivery");
    } catch (error) {
      throw error;
    }
  }

  async updateDeviceStatus(token: string, status: string = "invalid") {
    try {
      const update = await this.DB.query(
        `
        UPDATE device_tokens
        SET is_active = $1
        WHERE token = $2 RETURNING *
        `,
        [status, token],
      );

      if (update.rowCount && update.rowCount > 0) return update.rows[0];

      throw new Error("On update device status");
    } catch (error) {
      throw error;
    }
  }

  async getUserNotifications(userId: string) {
    try {
      const userNotifications: QueryResult<Notification> = await this.DB.query(
        "SELECT * FROM notifications WHERE user_id=$1",
        [userId],
      );

      return userNotifications.rows;
    } catch (error) {
      throw error;
    }
  }

  async getUserTokens(userId: string) {
    try {
      const userTokenRetrieval: QueryResult<DeviceData> = await this.DB.query(
        "SELECT * FROM device_tokens WHERE user_id=$1",
        [userId],
      );

      return userTokenRetrieval.rows;
    } catch (error) {
      throw error;
    }
  }
}
