import { useState } from "react";
import { Volume2, BookOpen, ChevronDown, ChevronUp, Copy, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import lotusAvatar from "@/assets/lotus-avatar.png";

interface Source {
  reference: string;
  sanskrit: string;
  translation: string;
  commentary: string;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  onRegenerate?: () => void;
}

export const ChatMessage = ({ role, content, sources, onRegenerate }: ChatMessageProps) => {
  const [showSources, setShowSources] = useState(false);

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Message copied to clipboard");
  };

  if (role === "user") {
    return (
      <div className="flex justify-end mb-6 animate-fade-in group">
        <div className="bg-user-bubble text-foreground rounded-2xl rounded-tr-sm px-6 py-4 max-w-[70%] shadow-lg relative">
          <p className="text-sm leading-relaxed">{content}</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="absolute -left-10 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col mb-6 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <img 
            src={lotusAvatar} 
            alt="Lotus" 
            className="w-10 h-10 rounded-full ring-2 ring-primary/30"
          />
        </div>
        
        <div className="flex-1">
          <div className="bg-ai-bubble text-foreground rounded-2xl rounded-tl-sm px-6 py-4 shadow-lg">
            <p className="text-sm leading-relaxed mb-3">{content}</p>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 px-3 text-xs text-primary hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSpeak}
                className="h-8 px-3 text-xs text-primary hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Volume2 className="h-3.5 w-3.5 mr-1.5" />
                Speak
              </Button>
              
              {onRegenerate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRegenerate}
                  className="h-8 px-3 text-xs text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <RotateCw className="h-3.5 w-3.5 mr-1.5" />
                  Regenerate
                </Button>
              )}
              
              {sources && sources.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSources(!showSources)}
                  className="h-8 px-3 text-xs text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                  View Sources
                  {showSources ? (
                    <ChevronUp className="h-3.5 w-3.5 ml-1" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 ml-1" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {showSources && sources && sources.length > 0 && (
            <div className="mt-4 space-y-3 animate-slide-up">
              {sources.map((source, index) => (
                <div 
                  key={index}
                  className="bg-shloka-card border border-primary/20 rounded-xl p-5 shadow-soft"
                >
                  <h4 className="font-serif font-semibold text-primary text-sm mb-3">
                    Source: {source.reference}
                  </h4>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-accent font-medium italic">
                      {source.sanskrit}
                    </p>
                    
                    <p className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3">
                      {source.translation}
                    </p>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                      {source.commentary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
