import { Client, QueryResult } from "pg";
import { Chat, ChatMessage } from "./Chat.types.js";

export class ChatRepository {
  constructor(private pgClient: Client) {}

  // ===== Chats =====

  async findByContext(
    contextType: string,
    contextId: string | null,
  ): Promise<Chat | null> {
    const res: QueryResult<Chat> = await this.pgClient.query(
      `
      SELECT *
      FROM chats
      WHERE context_type = $1
        AND context_id IS NOT DISTINCT FROM $2
      LIMIT 1
      `,
      [contextType, contextId],
    );

    return res.rowCount ? res.rows[0]! : null;
  }

  async createChat(
    contextType: string,
    contextId: string | null,
    createdBy: string,
  ): Promise<Chat> {
    const res: QueryResult<Chat> = await this.pgClient.query(
      `
      INSERT INTO chats (context_type, context_id, created_by)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [contextType, contextId, createdBy],
    );

    return res.rows[0]!;
  }

  // ===== Participants =====

  async addParticipant(
    chatId: string,
    userId: string,
    role: string,
  ): Promise<void> {
    await this.pgClient.query(
      `
      INSERT INTO chat_participants (chat_id, user_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING
      `,
      [chatId, userId, role],
    );
  }

  async isParticipant(chatId: string, userId: string): Promise<boolean> {
    const res = await this.pgClient.query(
      `
      SELECT 1
      FROM chat_participants
      WHERE chat_id = $1 AND user_id = $2
      `,
      [chatId, userId],
    );

    return (res.rowCount as number) > 0;
  }

  // ===== Messages =====

  async createMessage(
    chatId: string,
    senderId: string,
    content: string,
  ): Promise<ChatMessage> {
    const res: QueryResult<ChatMessage> = await this.pgClient.query(
      `
      INSERT INTO chat_messages (chat_id, sender_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [chatId, senderId, content],
    );

    return res.rows[0]!;
  }

  async getMessages(
    chatId: string,
    limit = 50,
    offset = 0,
  ): Promise<ChatMessage[]> {
    const res: QueryResult<ChatMessage> = await this.pgClient.query(
      `
      SELECT *
      FROM chat_messages
      WHERE chat_id = $1
      ORDER BY created_at ASC
      LIMIT $2 OFFSET $3
      `,
      [chatId, limit, offset],
    );

    return res.rows;
  }
}
