// src/components/ConversationMode.tsx

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import lotusAvatar from "@/assets/lotus-avatar.png";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AudioPlayer } from './AudioPlayer'; // Import the new player component

interface ConversationModeProps {
  onClose: () => void;
  onVoiceMessage: (message: string) => Promise<string | null>;
}

export const ConversationMode = ({ onClose, onVoiceMessage }: ConversationModeProps) => {
  const [status, setStatus] = useState<'idle' | 'listening' | 'confirming' | 'thinking' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input is not supported by your browser.");
      onClose();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      const finalTranscript = event.results[0][0].transcript;
      setTranscript(finalTranscript);
      setStatus('confirming'); // Move to confirmation step
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (status === 'listening') {
        toast.error("Could not capture audio. Please try again.");
      }
      setStatus('idle');
    };

    recognition.onend = () => {
      if (status === 'listening') {
        setStatus('idle'); // If listening stops unexpectedly, go back to idle
      }
    };

    // Cleanup function to stop everything when the component unmounts
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [status, onClose]);

  const handleMicClick = () => {
    if (status === 'listening') {
      recognitionRef.current?.stop();
      setStatus('idle');
    } else if (status === 'idle') {
      try {
        recognitionRef.current?.start();
        setStatus('listening');
      } catch (error) {
        toast.error("Could not start voice recognition. Please check microphone permissions.");
      }
    }
  };

  const handleConfirm = async () => {
    setStatus('thinking');
    setAudioUrl(null); // Clear any previous audio URL
    const url = await onVoiceMessage(transcript);
    if (url) {
      setAudioUrl(url); // Set the new audio URL
      setStatus('speaking'); // The AudioPlayer will auto-play
    } else {
      toast.error("Could not retrieve a response from the divine source.");
      setStatus('idle');
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening': return 'Listening...';
      case 'confirming': return 'Confirm your query';
      case 'thinking': return 'Krishna is contemplating...';
      case 'speaking': return 'Receiving divine wisdom...';
      default: return 'Tap the microphone to begin';
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-lg flex flex-col items-center justify-center mandala-pattern animate-fade-in">
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 h-10 w-10 rounded-full hover:bg-secondary">
          <X className="h-5 w-5" />
        </Button>
        <div className="flex flex-col items-center gap-8 max-w-md mx-auto px-6">
          <div className="relative">
             <div className={`absolute inset-0 rounded-full ${status === 'listening' ? 'animate-ping' : ''}`} style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)', transform: 'scale(1.5)' }} />
             <img src={lotusAvatar} alt="The Breathing Geeta" className="relative w-48 h-48 rounded-full ring-4 ring-primary/50" />
          </div>
          <div className="text-center space-y-2 min-h-[10rem]">
            <h2 className="font-serif text-3xl font-bold text-primary glow-gold">{getStatusText()}</h2>
            {status === 'thinking' && <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin mt-4" />}
            {status === 'speaking' && audioUrl && (
              <div className="w-full max-w-sm mx-auto pt-4 animate-fade-in">
                <AudioPlayer audioUrl={audioUrl} />
              </div>
            )}
          </div>
          <Button onClick={handleMicClick} disabled={status !== 'idle' && status !== 'listening'} size="lg" className={`h-20 w-20 rounded-full transition-all ${status === 'listening' ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'} text-primary-foreground shadow-glow`}>
            {status === 'listening' ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
          </Button>
        </div>
      </div>
      <AlertDialog open={status === 'confirming'} onOpenChange={(open) => !open && setStatus('idle')}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Did I hear you correctly?</AlertDialogTitle>
            <AlertDialogDescription className="py-4 text-lg italic">"{transcript}"</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStatus('idle')}>Retry</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Yes, ask this</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};