// src/utils/chatStorage.ts

// We'll define the Message type in Index.tsx and import it there.
// For now, let's define it here and then remove it after updating Index.tsx.
// (This temporary definition prevents a TypeScript error in this file)
export interface SourceDocument {
  shloka_id: string;
  shloka_sanskrit: string;
  commentary: string;
  author: string;
}
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceDocument[];
}


const CHAT_STORAGE_PREFIX = 'gita-chat-';

export const chatStorage = {
  /**
   * Saves the message history for a specific user to the browser's local storage.
   * @param userId - The unique identifier for the user (e.g., their email).
   * @param messages - The array of messages to save.
   */
  saveMessages: (userId: string, messages: Message[]) => {
    if (!userId) return;
    try {
      const key = `${CHAT_STORAGE_PREFIX}${userId}`;
      const data = JSON.stringify(messages);
      localStorage.setItem(key, data);
    } catch (error) {
      console.error("Failed to save messages to local storage:", error);
    }
  },

  /**
   * Loads the message history for a specific user from local storage.
   * @param userId - The unique identifier for the user.
   * @returns The array of messages, or an empty array if none are found.
   */
  loadMessages: (userId: string): Message[] => {
    if (!userId) return [];
    try {
      const key = `${CHAT_STORAGE_PREFIX}${userId}`;
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data) as Message[];
      }
      return [];
    } catch (error) {
      console.error("Failed to load messages from local storage:", error);
      return [];
    }
  },
};