// src/pages/Index.tsx

import { useState, useEffect, useRef } from "react";
import { CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";

import { ChatHeader } from "@/components/ChatHeader";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatStorage } from "@/utils/chatStorage";
import { LoadingBubble } from "@/components/LoadingBubble";
import { ConversationMode } from "@/components/ConversationMode";

// --- TYPE DEFINITIONS ---
interface UserProfile {
  name: string;
  picture: string;
  email: string;
}

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
  audioUrl?: string;
}

type Author =
  | 'Swami Sivananda'
  | 'Swami Ramsukhdas'
  | 'A.C. Bhaktivedanta Swami Prabhupada'
  | 'Swami Tejomayananda'
  | 'Swami Chinmayananda';

type Language = 'english' | 'hindi';

interface ApiResponse {
  answer: string;
  sources: SourceDocument[];
  audio_url?: string;
}

const WELCOME_MESSAGE: Message = {
  id: uuidv4(),
  role: 'assistant',
  content: "Greetings, seeker. Please sign in to begin your journey and save your conversations.",
};

const Index = () => {
  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isConversationMode, setIsConversationMode] = useState(false);
  const [responseStyle, setResponseStyle] = useState<Author>('Swami Sivananda');
  const [language, setLanguage] = useState<Language>('english');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // --- HOOKS for Persistence & UX ---
  useEffect(() => {
    const storedUser = localStorage.getItem('gita-user-profile');
    if (storedUser) {
      try {
        const userData: UserProfile = JSON.parse(storedUser);
        setUser(userData);
        const userChats = chatStorage.loadMessages(userData.email);
        setMessages(userChats.length > 0 ? userChats : [
          { id: uuidv4(), role: 'assistant', content: `Welcome back, ${userData.name}. How may I guide you?` }
        ]);
      } catch (error) {
        console.error("Failed to parse user data from storage", error);
        localStorage.removeItem('gita-user-profile');
      }
    }
  }, []);

  useEffect(() => {
    if (user && messages.length > 1) {
      chatStorage.saveMessages(user.email, messages);
    }
  }, [messages, user]);

  useEffect(() => {
    const scrollViewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (scrollViewport) {
      scrollViewport.scrollTo({ top: scrollViewport.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // --- HANDLERS for Login, Logout, and API calls ---
  const handleLoginSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      const decoded: UserProfile = jwtDecode(credentialResponse.credential);
      setUser(decoded);
      localStorage.setItem('gita-user-profile', JSON.stringify(decoded));
      const userChats = chatStorage.loadMessages(decoded.email);
      setMessages(userChats.length > 0 ? userChats : [
        { id: uuidv4(), role: 'assistant', content: `Welcome, ${decoded.name}. How may I guide you?` }
      ]);
      toast.success("Login successful!");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gita-user-profile');
    setMessages([WELCOME_MESSAGE]);
    toast.info("You have been logged out.");
  };
  
  const callApiAndHandleResponse = async (query: string, generateAudio: boolean) => {
    try {
      const API_URL = 'http://127.0.0.1:8000/ask';
      const response = await axios.post<ApiResponse>(API_URL, {
        query,
        author: responseStyle,
        output_language: language,
        generate_audio: generateAudio,
      });
      
      const aiMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.data.answer,
        sources: response.data.sources,
        audioUrl: response.data.audio_url,
      };
      setMessages(prev => [...prev, aiMessage]);
      return response.data.audio_url || null;
    } catch (error) {
      console.error("API Error:", error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: "My apologies, seeker. I encountered a disturbance and could not process your request. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
      return null;
    }
  };

  const handleSendMessage = async (query: string) => { // For TEXT chat
    if (!user || !query.trim() || isLoading) return;
    const userMessage: Message = { id: uuidv4(), role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    await callApiAndHandleResponse(query, false); // Audio is FALSE for text chat
    setIsLoading(false);
  };

  const handleVoiceMessage = async (query: string): Promise<string | null> => { // For VOICE chat
    if (!user) { toast.error("Please log in first."); return null; }
    const userMessage: Message = { id: uuidv4(), role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    // Audio is TRUE for voice chat
    return await callApiAndHandleResponse(query, true);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground mandala-pattern">
      <ChatHeader 
        user={user}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onOpenSettings={() => user ? setSettingsOpen(true) : toast.error("Please log in to change settings.")}
        onToggleConversationMode={() => user ? setIsConversationMode(true) : toast.error("Please log in to use Conversation Mode.")}
      />
      
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="container max-w-4xl mx-auto px-4 py-8">
            <div className="space-y-6">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  sources={msg.sources?.map(s => ({
                    reference: s.shloka_id,
                    sanskrit: s.shloka_sanskrit,
                    translation: '',
                    commentary: s.commentary,
                  }))}
                  audioUrl={msg.audioUrl}
                />
              ))}
              {isLoading && <LoadingBubble />}
            </div>
          </div>
        </ScrollArea>
      </main>

      {user && <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />}
      
      <SettingsPanel
        open={isSettingsOpen}
        onOpenChange={setSettingsOpen}
        responseStyle={responseStyle}
        onResponseStyleChange={(value) => setResponseStyle(value as Author)}
        language={language}
        onLanguageChange={(value) => setLanguage(value as Language)}
      />

      {isConversationMode && (
        <ConversationMode
          onClose={() => setIsConversationMode(false)}
          onVoiceMessage={handleVoiceMessage}
        />
      )}
    </div>
  );
};

export default Index;