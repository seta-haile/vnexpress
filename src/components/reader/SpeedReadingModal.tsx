"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  X, 
  Sliders, 
  FastForward, 
  Rewind,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SpeedReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  articleTitle?: string;
}

export function SpeedReadingModal({
  isOpen,
  onClose,
  text,
  articleTitle = "Bài báo"
}: SpeedReadingModalProps) {
  const [wpm, setWpm] = useState<number>(300);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);

  const words = React.useMemo(() => {
    return text.split(/\s+/).filter((w) => w.trim().length > 0);
  }, [text]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentWordIndex(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const currentWord = words[currentWordIndex] || "";
    // Calculate interval based on WPM (words per minute)
    let intervalMs = (60 / wpm) * 1000;
    // Add extra pause for punctuation
    if (/[.!?,;:]$/.test(currentWord)) {
      intervalMs *= 1.6;
    }

    timerRef.current = setTimeout(() => {
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentWordIndex, wpm, words]);

  if (!isOpen) return null;

  const currentWord = words[currentWordIndex] || "";
  const progressPercent = words.length > 0 ? Math.round(((currentWordIndex + 1) / words.length) * 100) : 0;

  // Split word to highlight Optimal Recognition Point (middle character)
  const midPoint = Math.floor(currentWord.length / 2);
  const prefix = currentWord.slice(0, midPoint);
  const centerChar = currentWord[midPoint] || "";
  const suffix = currentWord.slice(midPoint + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-card border border-border/80 text-card-foreground rounded-3xl shadow-2xl p-6 sm:p-10 space-y-8 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-foreground">
                Luyện đọc nhanh (Speed Reading RSVP)
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-sm">
                {articleTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>Tiến độ: {currentWordIndex + 1} / {words.length} từ</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Big RSVP Word Display Container */}
        <div className="h-44 sm:h-52 rounded-3xl bg-muted/40 border border-border flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          {/* Central Target Reticle */}
          <div className="absolute top-3 bottom-3 w-px border-r-2 border-dashed border-rose-500/30 pointer-events-none" />
          <div className="absolute top-2 w-3 h-3 border-t-2 border-l-2 border-rose-500/60 -rotate-45" />
          <div className="absolute bottom-2 w-3 h-3 border-b-2 border-r-2 border-rose-500/60 -rotate-45" />

          {/* Focal Word Typography */}
          <div className="text-4xl sm:text-6xl font-extrabold tracking-wide text-foreground select-none flex items-center">
            <span className="opacity-90">{prefix}</span>
            <span className="text-rose-600 dark:text-rose-400 underline decoration-rose-500/50 underline-offset-8">
              {centerChar}
            </span>
            <span className="opacity-90">{suffix}</span>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* WPM Speed Selector */}
          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-full border border-border/60">
            <span className="text-xs font-bold text-muted-foreground px-2">Tốc độ:</span>
            {[200, 250, 300, 350, 400].map((speed) => (
              <button
                key={speed}
                onClick={() => setWpm(speed)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                  wpm === speed
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {speed} wpm
              </button>
            ))}
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWordIndex(Math.max(0, currentWordIndex - 20))}
              className="h-9 w-9 p-0 rounded-full"
              title="Lùi 20 từ"
            >
              <Rewind className="w-4 h-4" />
            </Button>

            <Button
              variant="default"
              size="default"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-10 px-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? "Tạm dừng" : "Bắt đầu đọc"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWordIndex(Math.min(words.length - 1, currentWordIndex + 20))}
              className="h-9 w-9 p-0 rounded-full"
              title="Tua tới 20 từ"
            >
              <FastForward className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsPlaying(false);
                setCurrentWordIndex(0);
              }}
              className="h-9 w-9 p-0 rounded-full"
              title="Đọc lại từ đầu"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center">
          💡 Mẹo: Tập trung mắt vào ký tự màu đỏ ở giữa để rèn luyện kỹ năng đọc lướt không cần dịch thầm trong đầu.
        </p>

      </div>
    </div>
  );
}
