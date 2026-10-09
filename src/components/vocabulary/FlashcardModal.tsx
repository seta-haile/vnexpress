"use client";

import React, { useState } from "react";
import { SavedWord } from "@/types/news";
import { 
  X, 
  RotateCw, 
  Volume2, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Trophy 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateWordMastery } from "@/lib/storage";
import confetti from "canvas-confetti";

interface FlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: SavedWord[];
  onWordsUpdated: () => void;
}

export function FlashcardModal({
  isOpen,
  onClose,
  words,
  onWordsUpdated
}: FlashcardModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen || words.length === 0) return null;

  const currentWord = words[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompleted(true);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleMarkMastered = () => {
    updateWordMastery(currentWord.id, "mastered");
    onWordsUpdated();
    handleNext();
  };

  const handleMarkLearning = () => {
    updateWordMastery(currentWord.id, "learning");
    onWordsUpdated();
    handleNext();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card text-card-foreground rounded-3xl shadow-2xl border border-border/80 overflow-hidden flex flex-col p-6 sm:p-8">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base sm:text-lg">Ôn Tập Flashcards</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completed ? (
          /* Completion Screen */
          <div className="py-10 text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-amber-500/15 text-amber-500">
              <Trophy className="w-12 h-12" />
            </div>

            <h4 className="text-2xl font-extrabold text-foreground">
              Tuyệt vời! Bạn đã hoàn thành bộ thẻ!
            </h4>

            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Bạn đã ôn tập {words.length} từ vựng tiếng Anh. Sự kiên trì mỗi ngày là chìa khóa để làm chủ ngôn ngữ!
            </p>

            <div className="pt-4 flex items-center justify-center gap-3">
              <Button
                onClick={handleRestart}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md font-semibold"
              >
                Ôn tập lại từ đầu
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-xl font-medium"
              >
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          /* Flashcard Interactive Deck */
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>
                Thẻ {currentIndex + 1} / {words.length}
              </span>
              <span>Bấm vào thẻ để lật mặt</span>
            </div>

            {/* 3D Flip Card Container */}
            <div
              onClick={handleFlip}
              className="relative w-full h-72 rounded-3xl border-2 border-border/80 bg-gradient-to-b from-card via-muted/20 to-card shadow-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:border-rose-500/50 hover:shadow-xl group"
            >
              {!isFlipped ? (
                /* Card Front (English) */
                <div className="space-y-3">
                  <Badge className="bg-rose-500/10 text-rose-600 border-none font-semibold text-xs">
                    ENGLISH
                  </Badge>

                  <h2 className="text-3xl sm:text-4xl font-extrabold capitalize text-foreground tracking-tight">
                    {currentWord.word}
                  </h2>

                  {currentWord.ipa && (
                    <div className="text-sm font-mono text-muted-foreground">
                      {currentWord.ipa}
                    </div>
                  )}

                  <button
                    onClick={handlePlayAudio}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-semibold transition-colors mt-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Phát âm</span>
                  </button>

                  {currentWord.contextSentence && (
                    <div className="text-xs text-muted-foreground italic max-w-sm mt-3 border-t border-border/40 pt-3">
                      "{currentWord.contextSentence}"
                    </div>
                  )}
                </div>
              ) : (
                /* Card Back (Vietnamese Meaning) */
                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-semibold text-xs">
                    TIẾNG VIỆT
                  </Badge>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                    {currentWord.meaning}
                  </h2>

                  {currentWord.partOfSpeech && (
                    <div className="text-xs text-muted-foreground italic">
                      Từ loại: {currentWord.partOfSpeech}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground max-w-xs mt-2">
                    Từ gốc: <strong className="capitalize text-foreground">{currentWord.word}</strong>
                  </div>
                </div>
              )}

              {/* Flip prompt icon */}
              <div className="absolute bottom-3 right-4 flex items-center gap-1 text-[11px] text-muted-foreground opacity-60 group-hover:opacity-100">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Lật</span>
              </div>
            </div>

            {/* Answer & Navigation Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleMarkLearning}
                  className="rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-xs font-bold h-11"
                >
                  ⏳ Cần ôn thêm
                </Button>

                <Button
                  onClick={handleMarkMastered}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md text-xs font-bold h-11 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  ✓ Đã thuộc từ này
                </Button>
              </div>

              {/* Step Navigation */}
              <div className="flex items-center justify-between pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="text-xs text-muted-foreground"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Từ trước
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  className="text-xs text-muted-foreground"
                >
                  Từ tiếp theo
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
