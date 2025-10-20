import { useState, useEffect } from "react";
import { Plus, MessageSquare, Trash2, X, PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { conversationStorage, Conversation } from "@/utils/conversationStorage";
import { toast } from "sonner";

interface ConversationSidebarProps {
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

export const ConversationSidebar = ({
  currentConversationId,
  onSelectConversation,
  onNewConversation
}: ConversationSidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    loadConversations();
  }, [currentConversationId]);

  const loadConversations = () => {
    setConversations(conversationStorage.getAll());
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    conversationStorage.delete(id);
    loadConversations();
    toast.success("Conversation deleted");
    
    if (id === currentConversationId) {
      onNewConversation();
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isCollapsed) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(false)}
        className="fixed left-4 top-4 z-50 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card shadow-soft"
      >
        <PanelLeft className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <aside className="w-72 border-r border-border bg-card/30 backdrop-blur-sm flex flex-col h-screen">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold text-primary">Conversations</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
          className="h-8 w-8"
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3">
        <Button
          onClick={onNewConversation}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 pb-4">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`group relative p-3 rounded-lg cursor-pointer transition-all hover:bg-secondary/50 ${
                conversation.id === currentConversationId
                  ? "bg-secondary border border-primary/30"
                  : "border border-transparent"
              }`}
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {conversation.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(conversation.updatedAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {conversation.messages.length} messages
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDelete(conversation.id, e)}
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
};
