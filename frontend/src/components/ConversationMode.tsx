import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import lotusAvatar from "@/assets/lotus-avatar.png";

interface ConversationModeProps {
  onClose: () => void;
  onMessage: (message: string) => void;
}

export const ConversationMode = ({ onClose, onMessage }: ConversationModeProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in your browser");
      onClose();
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      
      if (event.results[current].isFinal) {
        setTranscript(transcript);
        onMessage(transcript);
        setIsListening(false);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error !== 'no-speech') {
        toast.error("Voice recognition error. Please try again.");
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, [onMessage, onClose]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        setTranscript("");
      } catch (error) {
        console.error("Error starting recognition:", error);
        toast.error("Could not start voice recognition");
      }
    }
  };

  // Simulate speaking state (in real implementation, this would be triggered by AI response)
  useEffect(() => {
    if (transcript && !isListening) {
      setIsSpeaking(true);
      const timer = setTimeout(() => setIsSpeaking(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [transcript, isListening]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center mandala-pattern">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 h-10 w-10 rounded-full hover:bg-secondary"
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Main content area */}
      <div className="flex flex-col items-center gap-8 max-w-md mx-auto px-6">
        {/* Logo with animations */}
        <div className="relative">
          {/* Outer ripple effect */}
          <div 
            className={`absolute inset-0 rounded-full ${
              isListening ? 'animate-ping' : isSpeaking ? 'animate-pulse' : ''
            }`}
            style={{
              background: isListening 
                ? 'radial-gradient(circle, hsl(28 88% 62% / 0.3) 0%, transparent 70%)'
                : isSpeaking
                ? 'radial-gradient(circle, hsl(330 65% 65% / 0.3) 0%, transparent 70%)'
                : 'transparent',
              transform: 'scale(1.5)',
            }}
          />
          
          {/* Middle glow */}
          <div 
            className={`absolute inset-0 rounded-full transition-all duration-500 ${
              isListening || isSpeaking ? 'scale-125' : 'scale-100'
            }`}
            style={{
              boxShadow: isListening
                ? '0 0 60px 20px hsl(28 88% 62% / 0.4)'
                : isSpeaking
                ? '0 0 60px 20px hsl(330 65% 65% / 0.4)'
                : '0 0 30px 10px hsl(28 88% 62% / 0.2)',
            }}
          />
          
          {/* Logo image */}
          <img
            src={lotusAvatar}
            alt="The Breathing Geeta Project"
            className={`relative w-48 h-48 rounded-full ring-4 transition-all duration-300 ${
              isListening
                ? 'ring-primary scale-110'
                : isSpeaking
                ? 'ring-accent scale-110'
                : 'ring-primary/50 scale-100'
            }`}
          />
          
          {/* Breathing circle animation */}
          <div 
            className="absolute inset-0 rounded-full border-2 transition-all duration-1000"
            style={{
              borderColor: isListening 
                ? 'hsl(28 88% 62% / 0.5)' 
                : isSpeaking
                ? 'hsl(330 65% 65% / 0.5)'
                : 'transparent',
              animation: (isListening || isSpeaking) ? 'breathe 2s ease-in-out infinite' : 'none'
            }}
          />
        </div>

        {/* Status text */}
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl font-bold text-primary glow-gold">
            {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Conversation Mode'}
          </h2>
          <p className="text-muted-foreground">
            {isListening 
              ? 'Speak your question' 
              : isSpeaking 
              ? 'Receiving divine wisdom'
              : 'Tap the microphone to begin'}
          </p>
        </div>

        {/* Mic button */}
        <Button
          onClick={toggleListening}
          size="lg"
          className={`h-20 w-20 rounded-full transition-all ${
            isListening
              ? 'bg-destructive hover:bg-destructive/90'
              : 'bg-primary hover:bg-primary/90'
          } text-primary-foreground shadow-glow`}
        >
          {isListening ? (
            <MicOff className="h-10 w-10" />
          ) : (
            <Mic className="h-10 w-10" />
          )}
        </Button>

        {/* Live transcript */}
        {transcript && (
          <div className="w-full bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border">
            <p className="text-sm text-center text-muted-foreground italic">
              "{transcript}"
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};
