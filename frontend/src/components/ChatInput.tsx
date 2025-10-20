import { useState } from "react";
import { Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in your browser");
      return;
    }

    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
      toast.info("Listening...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      toast.error("Could not capture voice input");
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  return (
    <div className="border-t border-border bg-card/50 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="container max-w-4xl mx-auto p-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleVoiceInput}
            disabled={isRecording || isLoading}
            className="flex-shrink-0 h-11 w-11 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Mic className={`h-5 w-5 ${isRecording ? 'text-destructive animate-pulse' : ''}`} />
          </Button>

          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1 h-11 bg-input border-border focus-visible:ring-primary rounded-full px-5"
          />

          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || isLoading}
            className="flex-shrink-0 h-11 w-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow transition-all disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};
