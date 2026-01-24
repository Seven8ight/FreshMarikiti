export type ChatContext = "ride" | "order" | "vendor" | "support";

export interface Chat {
  id: string;
  context_type: ChatContext;
  context_id: string | null;
  created_by: string;
  created_at: Date;
}

export interface ChatParticipant {
  chat_id: string;
  user_id: string;
  role: "customer" | "vendor" | "rider" | "support" | "admin";
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: Date;
}
