import { ChatRepository } from "./Chat.repository";
import { Chat, ChatMessage } from "./Chat.types";

export class ChatService {
  constructor(private repo: ChatRepository) {}

  async createOrGetChat(
    userId: string,
    contextType: string,
    contextId: string | null,
    participants: Array<{ userId: string; role: string }>,
  ): Promise<Chat> {
    const existing = await this.repo.findByContext(contextType, contextId);
    if (existing) return existing;

    const chat = await this.repo.createChat(contextType, contextId, userId);

    for (const p of participants) {
      await this.repo.addParticipant(chat.id, p.userId, p.role);
    }

    return chat;
  }

  async sendMessage(
    userId: string,
    chatId: string,
    content: string,
  ): Promise<ChatMessage> {
    const allowed = await this.repo.isParticipant(chatId, userId);
    if (!allowed) {
      throw new Error("User not allowed in this chat");
    }

    return this.repo.createMessage(chatId, userId, content);
  }

  async getMessages(
    userId: string,
    chatId: string,
    limit?: number,
    offset?: number,
  ): Promise<ChatMessage[]> {
    const allowed = await this.repo.isParticipant(chatId, userId);
    if (!allowed) {
      throw new Error("Access denied");
    }

    return this.repo.getMessages(chatId, limit, offset);
  }

  async canAccessChat(userId: string, chatId: string): Promise<boolean> {
    return this.repo.isParticipant(chatId, userId);
  }
}
