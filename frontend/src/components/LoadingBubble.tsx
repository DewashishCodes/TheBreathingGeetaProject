// src/components/LoadingBubble.tsx

import { useState, useEffect } from 'react';
import lotusAvatar from "@/assets/lotus-avatar.png";

const contemplationTexts = [
  "Consulting the cosmos...",
  "Listening to the whispers of the universe...",
  "Finding harmony in the scriptures...",
  "Krishna is contemplating...",
  "Aligning the chakras of knowledge...",
];

export const LoadingBubble = () => {
  const [text, setText] = useState(contemplationTexts[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setText(prevText => {
        const currentIndex = contemplationTexts.indexOf(prevText);
        const nextIndex = (currentIndex + 1) % contemplationTexts.length;
        return contemplationTexts[nextIndex];
      });
    }, 2000); // Change text every 2 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="flex-shrink-0">
        <img 
          src={lotusAvatar} 
          alt="Lotus" 
          className="w-10 h-10 rounded-full ring-2 ring-primary/30"
        />
      </div>
      <div className="flex-1">
        <div className="bg-ai-bubble text-foreground rounded-2xl rounded-tl-sm px-6 py-4 shadow-lg flex items-center gap-3">
          <p className="text-sm italic text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  );
};