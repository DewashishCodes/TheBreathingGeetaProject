import { Settings, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import lotusAvatar from "@/assets/lotus-avatar.png";

interface ChatHeaderProps {
  onOpenSettings: () => void;
  onToggleConversationMode: () => void;
}

export const ChatHeader = ({ onOpenSettings, onToggleConversationMode }: ChatHeaderProps) => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={lotusAvatar} 
              alt="The Breathing Geeta" 
              className="w-12 h-12 rounded-full ring-2 ring-primary/40 shadow-glow"
            />
            <div>
              <h1 className="font-serif text-2xl font-bold text-primary glow-gold">
                The Breathing Geeta Project
              </h1>
              <p className="text-xs text-muted-foreground">
                Timeless wisdom, divine guidance
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleConversationMode}
              className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary"
              title="Conversation Mode"
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSettings}
              className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
