export interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{
    reference: string;
    sanskrit: string;
    translation: string;
    commentary: string;
  }>;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "breathing-geeta-conversations";
const ACTIVE_CONVERSATION_KEY = "breathing-geeta-active-conversation";

export const conversationStorage = {
  getAll: (): Conversation[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading conversations:", error);
      return [];
    }
  },

  getById: (id: string): Conversation | null => {
    const conversations = conversationStorage.getAll();
    return conversations.find(c => c.id === id) || null;
  },

  save: (conversation: Conversation): void => {
    try {
      const conversations = conversationStorage.getAll();
      const index = conversations.findIndex(c => c.id === conversation.id);
      
      if (index >= 0) {
        conversations[index] = conversation;
      } else {
        conversations.unshift(conversation);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  },

  delete: (id: string): void => {
    try {
      const conversations = conversationStorage.getAll().filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  },

  getActiveId: (): string | null => {
    return localStorage.getItem(ACTIVE_CONVERSATION_KEY);
  },

  setActiveId: (id: string): void => {
    localStorage.setItem(ACTIVE_CONVERSATION_KEY, id);
  },

  createNew: (): Conversation => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: [{
        role: "assistant",
        content: "Greetings, seeker. I am here to share the timeless wisdom of the Gita. How may I guide you today?",
        sources: []
      }],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    conversationStorage.save(newConversation);
    return newConversation;
  },

  updateTitle: (id: string, title: string): void => {
    const conversation = conversationStorage.getById(id);
    if (conversation) {
      conversation.title = title;
      conversation.updatedAt = Date.now();
      conversationStorage.save(conversation);
    }
  }
};
