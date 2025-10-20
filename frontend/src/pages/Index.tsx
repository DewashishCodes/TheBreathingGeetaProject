// src/pages/Index.tsx

import { useState, useEffect } from "react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import axios from 'axios'; // <-- Import axios
import { v4 as uuidv4 } from 'uuid'; // <-- Import uuid to generate unique keys

// --- START OF NEW LOGIC ---

// 1. Define the types for our data structures
type Author =
  | 'Swami Sivananda'
  | 'Swami Ramsukhdas'
  | 'A.C. Bhaktivedanta Swami Prabhupada'
  | 'Swami Tejomayananda'
  | 'Swami Chinmayananda';

type Language = 'english' | 'hindi';

interface SourceDocument {
  shloka_id: string;
  shloka_sanskrit: string;
  commentary: string;
  author: string;
}

interface Message {
  id: string; // Use string for unique ID
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceDocument[];
}

// Type for the API response from our backend
interface ApiResponse {
  answer: string;
  sources: SourceDocument[];
}

// --- END OF NEW LOGIC ---

const Index = () => {
  // --- START OF NEW LOGIC ---

  // 2. State management for the entire application
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      role: 'assistant',
      content: "Greetings, seeker. I am here to share the timeless wisdom of the Gita. How may I guide you today?",
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Settings state
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [responseStyle, setResponseStyle] = useState<Author>('Swami Sivananda');
  const [language, setLanguage] = useState<Language>('english');
  
  // --- END OF NEW LOGIC ---

  // --- START OF NEW LOGIC ---

  // 3. The powerful API handling function
  const handleSendMessage = async (query: string) => {
    if (!query.trim()) return;

    // Add user's message to the chat
    const userMessage: Message = { id: uuidv4(), role: 'user', content: query };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    setIsLoading(true);

    try {
      const API_URL = 'http://127.0.0.1:8000/ask';

      const response = await axios.post<ApiResponse>(API_URL, {
        query: query,
        author: responseStyle,
        output_language: language,
      });

      // Add AI's response to the chat
      const aiMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.data.answer,
        sources: response.data.sources,
      };
      setMessages(prevMessages => [...prevMessages, aiMessage]);

    } catch (error) {
      console.error("API Error:", error);
      toast.error("An error occurred while seeking guidance. Please try again.");
      // Optional: Add an error message to the chat
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: "My apologies, seeker. I encountered a disturbance and could not process your request. Please try again."
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- END OF NEW LOGIC ---

  return (
    <div className="flex flex-col h-screen bg-background text-foreground mandala-pattern">
      <ChatHeader 
        onOpenSettings={() => setSettingsOpen(true)}
        // We will ignore conversation mode for now, it's a more advanced feature
        onToggleConversationMode={() => toast.info("Conversation mode coming soon!")}
      />
      
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="container max-w-4xl mx-auto px-4 py-8">
            <div className="space-y-6">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  // We need to remap the source format slightly for the ChatMessage component
                  sources={msg.sources?.map(s => ({
                    reference: s.shloka_id,
                    sanskrit: s.shloka_sanskrit,
                    translation: '', // The component expects this, we can leave it blank
                    commentary: s.commentary,
                  }))}
                />
              ))}
              {isLoading && (
                 <ChatMessage
                  role="assistant"
                  content="Krishna is contemplating your query..." // A placeholder for loading
                />
              )}
            </div>
          </div>
        </ScrollArea>
      </main>

      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      
      <SettingsPanel
        open={isSettingsOpen}
        onOpenChange={setSettingsOpen}
        responseStyle={responseStyle}
        onResponseStyleChange={(value) => setResponseStyle(value as Author)}
        language={language}
        onLanguageChange={(value) => setLanguage(value as Language)}
      />
    </div>
  );
};

export default Index;