// src/components/AudioPlayer.tsx

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface AudioPlayerProps {
  audioUrl: string;
  onEnded: () => void; // Function to call when audio finishes
}

const formatTime = (time: number) => {
  if (isNaN(time)) return '00:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const AudioPlayer = ({ audioUrl, onEnded }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded();
    };

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);

    // Autoplay when component is ready
    audio.play().catch(() => setIsPlaying(false)); // Handle autoplay block
    setIsPlaying(true);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, onEnded]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const seek = (value: number) => {
    if (audioRef.current) {
        audioRef.current.currentTime = value;
        setCurrentTime(value);
    }
  };

  const skip = (amount: number) => {
    if (audioRef.current) {
        seek(Math.max(0, Math.min(duration, audioRef.current.currentTime + amount)));
    }
  };

  return (
    <div className="w-full bg-shloka-card/50 p-3 rounded-lg flex items-center gap-3 mt-2">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <Button onClick={togglePlayPause} variant="ghost" size="icon" className="h-8 w-8 text-primary">
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
      <Slider
        value={[currentTime]}
        max={duration || 1}
        step={1}
        onValueChange={(value) => seek(value[0])}
        className="flex-1"
      />
      <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
      <Button onClick={() => skip(-5)} variant="ghost" size="icon" className="h-8 w-8 text-primary">
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button onClick={() => skip(5)} variant="ghost" size="icon" className="h-8 w-8 text-primary">
        <FastForward className="h-4 w-4" />
      </Button>
    </div>
  );
};