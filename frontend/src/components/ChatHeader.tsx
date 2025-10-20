// src/components/ChatHeader.tsx

import { Settings, LogOut, Phone } from "lucide-react"; // Make sure Phone is imported
import { Button } from "@/components/ui/button";
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

// Define a type for the user profile, matching Index.tsx
interface UserProfile {
  name: string;
  picture: string;
}

// Define the full set of props the header expects
interface ChatHeaderProps {
  user: UserProfile | null;
  onLoginSuccess: (credentialResponse: CredentialResponse) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onToggleConversationMode: () => void; // This was the missing/incorrect prop
}

export const ChatHeader = ({
  user,
  onLoginSuccess,
  onLogout,
  onOpenSettings,
  onToggleConversationMode,
}: ChatHeaderProps) => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-10 h-10 rounded-full ring-2 ring-primary/40"
                />
                <div>
                  <h1 className="font-serif text-xl font-bold text-primary glow-gold">
                    The Breathing Geeta
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Welcome, {user.name}
                  </p>
                </div>
              </>
            ) : (
               <h1 className="font-serif text-xl font-bold text-primary glow-gold">
                The Breathing Geeta
              </h1>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {user ? (
              // This is the view for a LOGGED-IN user
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleConversationMode}
                  title="Conversation Mode"
                  className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary"
                >
                  <Phone className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onOpenSettings}
                  title="Settings"
                  className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary"
                >
                  <Settings className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogout}
                  title="Logout"
                  className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              // This is the view for a LOGGED-OUT user
              <GoogleLogin
                onSuccess={onLoginSuccess}
                onError={() => console.log('Login Failed')}
                theme="filled_black"
                size="medium"
                shape="pill"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};