"use client";

import React, { useState, useEffect } from "react";
import { SavedWord } from "@/types/news";
import { CURATED_VOCAB } from "@/lib/dictionary";
import { X, HelpCircle, CheckCircle, XCircle, Trophy, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";

interface QuickQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedWords: SavedWord[];
}

interface QuizQuestion {
  word: string;
  ipa?: string;
  correctAnswer: string;
  options: string[];
}

export function QuickQuizModal({ isOpen, onClose, savedWords }: QuickQuizModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Generate quiz questions
  useEffect(() => {
    if (!isOpen) return;

    // Source words: use saved words if >= 4, otherwise mix in curated vocab
    let pool: { word: string; ipa?: string; vi: string }[] = [];

    if (savedWords.length >= 4) {
      pool = savedWords.map((w) => ({
        word: w.word,
        ipa: w.ipa,
        vi: w.meaning
      }));
    } else {
      // Use curated vocab
      const curatedList = Object.entries(CURATED_VOCAB).map(([w, data]) => ({
        word: w,
        ipa: data.ipa,
        vi: data.vi
      }));
      pool = curatedList;
    }

    // Shuffle pool
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
    const selectedWords = shuffledPool.slice(0, 5); // 5 questions

    const allMeanings = pool.map((p) => p.vi);

    const generated: QuizQuestion[] = selectedWords.map((item) => {
      const distractors = allMeanings
        .filter((m) => m !== item.vi)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const options = [item.vi, ...distractors].sort(() => 0.5 - Math.random());

      return {
        word: item.word,
        ipa: item.ipa,
        correctAnswer: item.vi,
        options
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  }, [isOpen, savedWords]);

  if (!isOpen || questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;

    setSelectedOption(opt);
    setIsAnswered(true);

    if (opt === currentQ.correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handlePlayAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQ.word);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card text-card-foreground rounded-3xl shadow-2xl border border-border/80 overflow-hidden flex flex-col p-6 sm:p-8">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-base sm:text-lg">Trắc Nghiệm Từ Vựng (Mini-Quiz)</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isFinished ? (
          /* Finished Result */
          <div className="py-8 text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-amber-500/15 text-amber-500">
              <Trophy className="w-12 h-12" />
            </div>

            <h4 className="text-2xl font-extrabold text-foreground">
              Hoàn thành bài kiểm tra!
            </h4>

            <div className="text-4xl font-black text-rose-600 dark:text-rose-400">
              {score} / {questions.length}
            </div>

            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {score === questions.length
                ? "Xuất sắc! Bạn nhớ rất chuẩn các từ vựng này."
                : score >= 3
                ? "Khá tốt! Hãy tiếp tục đọc thêm các bài báo để khắc sâu từ mới."
                : "Đừng nản lòng, hãy mở flashcard để ôn lại những từ chưa vững nhé!"}
            </p>

            <div className="pt-4 flex items-center justify-center gap-3">
              <Button
                onClick={() => {
                  setCurrentIndex(0);
                  setSelectedOption(null);
                  setIsAnswered(false);
                  setScore(0);
                  setIsFinished(false);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md font-semibold"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Làm lại quiz mới
              </Button>

              <Button variant="outline" onClick={onClose} className="rounded-xl font-medium">
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          /* Question Form */
          <div className="space-y-6">
            {/* Step & Score info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>
                Câu hỏi {currentIndex + 1} / {questions.length}
              </span>
              <span>Điểm: {score}</span>
            </div>

            {/* Word Display Box */}
            <div className="p-6 rounded-2xl bg-muted/30 border border-border/60 text-center space-y-2">
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                Từ vựng tiếng Anh
              </div>

              <div className="flex items-center justify-center gap-2">
                <h2 className="text-3xl font-extrabold capitalize text-foreground">
                  {currentQ.word}
                </h2>

                <button
                  onClick={handlePlayAudio}
                  className="p-1.5 rounded-full hover:bg-muted text-rose-600 transition-colors"
                  title="Phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {currentQ.ipa && (
                <div className="text-xs font-mono text-muted-foreground">
                  {currentQ.ipa}
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-1">
                Hãy chọn nghĩa tiếng Việt chính xác nhất:
              </div>
            </div>

            {/* Options List */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentQ.correctAnswer;

                let optClass = "border-border/80 hover:border-border hover:bg-muted/50";
                if (isAnswered) {
                  if (isCorrect) {
                    optClass = "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold";
                  } else if (isSelected && !isCorrect) {
                    optClass = "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold";
                  } else {
                    optClass = "opacity-50 border-border/40";
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(opt)}
                    disabled={isAnswered}
                    className={`w-full p-3.5 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between ${optClass}`}
                  >
                    <span>{opt}</span>

                    {isAnswered && isCorrect && (
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            {isAnswered && (
              <div className="pt-2 animate-in fade-in duration-150">
                <Button
                  onClick={handleNext}
                  className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-600/30"
                >
                  {currentIndex < questions.length - 1 ? "Câu tiếp theo →" : "Xem kết quả bài làm"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
