export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  data: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export type NotificationDelivery = {
  id: string;
  notification_id: string;
  token: string;
  status: string;
  error: string;
  created_at: string;
};

export type createNotificationDTO = Omit<
  Notification,
  "is_read" | "created_at" | "id"
>;

export type createNotificationDeliveryDTO = Omit<
  NotificationDelivery,
  "id" | "created_at"
>;
export type sendNotificationDTO = Omit<
  Notification,
  "id" | "is_read" | "created_at"
>;

export type DeviceData = {
  user_id: string;
  token: string;
  platform: string;
};
