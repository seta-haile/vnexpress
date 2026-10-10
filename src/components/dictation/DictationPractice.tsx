"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArticleDetail } from "@/types/news";
import { 
  buildDictationChunks, 
  DictationChunk, 
  DictationDifficulty, 
  isWordMatch,
  MaskedWord 
} from "@/lib/dictation";
import { 
  playNeuralAudio, 
  stopNeuralAudio, 
  VOICE_PRESETS, 
  VoicePreset 
} from "@/lib/voice";
import { translateSentence } from "@/lib/dictionary";
import { getAppSettings, getReaderSettings } from "@/lib/storage";
import confetti from "canvas-confetti";
import { 
  Volume2, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Lightbulb, 
  HelpCircle, 
  Eye, 
  Sliders, 
  Trophy, 
  Languages, 
  Flame, 
  Play, 
  Pause,
  Zap,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DictationPracticeProps {
  article: ArticleDetail;
  articleSlug: string;
  nextArticle?: { title: string; slug: string } | null;
}

export function DictationPractice({
  article,
  articleSlug,
  nextArticle
}: DictationPracticeProps) {
  const router = useRouter();

  // Difficulty & settings
  const [difficulty, setDifficulty] = useState<DictationDifficulty>("medium");
  const [speechRate, setSpeechRate] = useState<number>(0.9); // Default slightly relaxed for dictation
  const [voicePreset, setVoicePreset] = useState<VoicePreset>(() => {
    const app = getAppSettings();
    return app.voicePreset || "female-mature";
  });
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(true);
  const [showFirstLetterHint, setShowFirstLetterHint] = useState<boolean>(false);

  // Chunks & current index
  const [chunks, setChunks] = useState<DictationChunk[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // User input answers for the current chunk: { [wordId]: string }
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [correctWordIds, setCorrectWordIds] = useState<Set<string>>(new Set());
  const [revealedWordIds, setRevealedWordIds] = useState<Set<string>>(new Set());

  // Audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Vietnamese translation of current chunk
  const [currentTranslation, setCurrentTranslation] = useState<string>("");
  const [isLoadingTranslation, setIsLoadingTranslation] = useState<boolean>(false);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);

  // Overall session statistics
  const [completedChunks, setCompletedChunks] = useState<Set<number>>(new Set());
  const [totalCorrectWords, setTotalCorrectWords] = useState<number>(0);
  const [isFinishedAll, setIsFinishedAll] = useState<boolean>(false);

  // Input refs for auto-focusing
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Initialize chunks when difficulty changes
  useEffect(() => {
    const generated = buildDictationChunks(article, difficulty);
    setChunks(generated);
    setCurrentIndex(0);
    setCompletedChunks(new Set());
    setTotalCorrectWords(0);
    setIsFinishedAll(false);
  }, [article, difficulty]);

  const currentChunk = chunks[currentIndex];

  // Reset inputs & answers when switching chunk
  useEffect(() => {
    if (!currentChunk) return;
    setAnswers({});
    setCorrectWordIds(new Set());
    setRevealedWordIds(new Set());
    setShowTranslation(false);
    setCurrentTranslation("");

    // Auto play audio when entering new chunk
    if (autoPlayNext) {
      const timer = setTimeout(() => {
        playChunkAudio(currentChunk.text);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentChunk?.id]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopNeuralAudio();
    };
  }, []);

  // Fetch translation for current chunk on demand
  const handleToggleTranslation = async () => {
    if (!currentChunk) return;
    if (!showTranslation) {
      if (!currentTranslation) {
        setIsLoadingTranslation(true);
        try {
          const vi = await translateSentence(currentChunk.text);
          setCurrentTranslation(vi);
        } catch {
          setCurrentTranslation("Không thể tải bản dịch lúc này.");
        } finally {
          setIsLoadingTranslation(false);
        }
      }
      setShowTranslation(true);
    } else {
      setShowTranslation(false);
    }
  };

  // Play audio for given text
  const playChunkAudio = (text: string, rateOverride?: number) => {
    stopNeuralAudio();
    const rate = rateOverride !== undefined ? rateOverride : speechRate;
    setIsPlayingAudio(true);

    playNeuralAudio(text, {
      preset: voicePreset,
      rate: rate,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false)
    });
  };

  // Handle word input change
  const handleInputChange = (word: MaskedWord, value: string) => {
    setAnswers((prev) => ({ ...prev, [word.id]: value }));

    // Instant validation
    if (isWordMatch(value, word.cleanWord)) {
      setCorrectWordIds((prev) => {
        const next = new Set(prev);
        next.add(word.id);
        return next;
      });
      setTotalCorrectWords((c) => c + 1);

      // Focus next uncompleted input
      const maskedIds = currentChunk.maskedWordIds;
      const nextWordId = maskedIds.find(
        (id) => id !== word.id && !correctWordIds.has(id) && !revealedWordIds.has(id)
      );

      if (nextWordId && inputRefs.current[nextWordId]) {
        setTimeout(() => {
          inputRefs.current[nextWordId]?.focus();
        }, 80);
      }

      // Check if all blanks in this chunk are completed
      const remainingBlanks = maskedIds.filter(
        (id) => id !== word.id && !correctWordIds.has(id) && !revealedWordIds.has(id)
      );

      if (remainingBlanks.length === 0) {
        handleChunkCompleted();
      }
    }
  };

  // When all blanks in current chunk are solved
  const handleChunkCompleted = () => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });

    setCompletedChunks((prev) => {
      const next = new Set(prev);
      next.add(currentIndex);
      return next;
    });

    // Check if this was the last chunk
    if (currentIndex >= chunks.length - 1) {
      setTimeout(() => {
        setIsFinishedAll(true);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 }
        });
      }, 900);
    } else {
      // Auto move to next chunk after brief delay
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
      }, 1000);
    }
  };

  // Reveal all answers in current chunk
  const handleRevealCurrentChunk = () => {
    if (!currentChunk) return;
    const newRevealed = new Set(revealedWordIds);
    const newAnswers = { ...answers };

    currentChunk.words.forEach((w) => {
      if (w.isMasked && !correctWordIds.has(w.id)) {
        newRevealed.add(w.id);
        newAnswers[w.id] = w.displayWord;
      }
    });

    setRevealedWordIds(newRevealed);
    setAnswers(newAnswers);

    setCompletedChunks((prev) => {
      const next = new Set(prev);
      next.add(currentIndex);
      return next;
    });
  };

  // Give 1 hint (reveal first letter)
  const handleGiveHint = () => {
    setShowFirstLetterHint(true);
  };

  // Navigation handlers
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < chunks.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsFinishedAll(true);
    }
  };

  // Progress percentage
  const progressPercent = chunks.length > 0 ? Math.round(((currentIndex + 1) / chunks.length) * 100) : 0;

  if (chunks.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-rose-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">Đang chuẩn bị bài tập nghe điền từ...</p>
        </div>
      </div>
    );
  }

  // Final Summary Screen
  if (isFinishedAll) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-8">
        <div className="max-w-2xl mx-auto w-full pt-10 text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-rose-500/25 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-rose-600 dark:text-rose-400">
              Xuất sắc hoàn thành
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Bạn đã hoàn thành bài nghe chép chính tả!
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              {article.title}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-4">
            <div className="p-4 rounded-2xl bg-muted/50 border border-border">
              <div className="text-2xl sm:text-3xl font-black text-rose-600">{chunks.length}</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Đoạn đã nghe</div>
            </div>
            <div className="p-4 rounded-2xl bg-muted/50 border border-border">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">{totalCorrectWords}</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Từ gõ đúng</div>
            </div>
            <div className="p-4 rounded-2xl bg-muted/50 border border-border">
              <div className="text-2xl sm:text-3xl font-black text-amber-500 flex items-center justify-center gap-1">
                <Flame className="w-6 h-6 fill-current text-amber-500" />
                100%
              </div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Hoàn thành</div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const reloaded = buildDictationChunks(article, difficulty);
                setChunks(reloaded);
                setCurrentIndex(0);
                setIsFinishedAll(false);
              }}
              className="w-full sm:w-auto flex items-center gap-2 rounded-full"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Luyện tập lại</span>
            </Button>

            <Link href={`/article/${articleSlug}`} className="w-full sm:w-auto">
              <Button
                variant="default"
                size="lg"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center gap-2 shadow-lg shadow-rose-600/30"
              >
                <BookOpen className="w-4 h-4" />
                <span>Quay lại bài đọc</span>
              </Button>
            </Link>

            {nextArticle?.slug && (
              <Link href={`/dictation/${nextArticle.slug}`} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full flex items-center gap-2"
                >
                  <span>Bài báo tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isCurrentChunkDone = currentChunk.maskedWordIds.every(
    (id) => correctWordIds.has(id) || revealedWordIds.has(id)
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-muted/40 z-50">
        <div 
          className="h-full bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-md px-3 sm:px-6 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          {/* Back button */}
          <Link href={`/article/${articleSlug}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 sm:px-3 text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Trở lại bài đọc</span>
            </Button>
          </Link>

          {/* Center: Chunk Index & Progress badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border/50 text-xs font-bold text-foreground">
              <span>Đoạn {currentIndex + 1} / {chunks.length}</span>
              <span className="text-muted-foreground font-normal">({progressPercent}%)</span>
            </div>

            <Badge variant="outline" className="hidden md:inline-flex text-[10px] font-semibold border-rose-300/60 text-rose-600 dark:text-rose-400">
              🎧 Luyện nghe chép chính tả
            </Badge>
          </div>

          {/* Right: Difficulty & Audio Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Difficulty selector */}
            <div className="flex items-center rounded-full bg-muted/60 p-0.5 border border-border/50 text-xs">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                    difficulty === d
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d === "easy" ? "Dễ" : d === "medium" ? "Vừa" : "Khó"}
                </button>
              ))}
            </div>

            {/* Voice preset switch */}
            <button
              onClick={() => {
                const currentIdx = VOICE_PRESETS.findIndex((v) => v.id === voicePreset);
                const nextPreset = VOICE_PRESETS[(currentIdx + 1) % VOICE_PRESETS.length].id;
                setVoicePreset(nextPreset);
              }}
              className="h-8 w-8 rounded-full border border-border/50 hover:bg-muted/60 flex items-center justify-center text-xs"
              title="Đổi giọng đọc AI"
            >
              {VOICE_PRESETS.find((v) => v.id === voicePreset)?.icon || "🎙️"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Practice Container */}
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full flex flex-col justify-center space-y-6">
        
        {/* Audio Player Card */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-transparent border border-rose-500/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Play/Replay Button */}
            <button
              onClick={() => playChunkAudio(currentChunk.text)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                isPlayingAudio
                  ? "bg-amber-500 shadow-amber-500/30 animate-pulse"
                  : "bg-rose-600 shadow-rose-600/30 hover:bg-rose-700"
              }`}
              title="Nghe / Nghe lại đoạn này (Space)"
            >
              {isPlayingAudio ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-foreground">
                  {isPlayingAudio ? "Đang phát âm thanh..." : "Bấm để nghe đoạn này"}
                </span>
                {isPlayingAudio && (
                  <span className="flex gap-0.5 items-end h-3">
                    <span className="w-1 bg-rose-500 rounded-full h-full animate-pulse" />
                    <span className="w-1 bg-rose-500 rounded-full h-2/3 animate-pulse delay-75" />
                    <span className="w-1 bg-rose-500 rounded-full h-full animate-pulse delay-150" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Điền các chữ còn thiếu vào ô trống bên dưới
              </p>
            </div>
          </div>

          {/* Speed Controls & Slow Replay */}
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            {/* Slow button (0.75x) */}
            <button
              onClick={() => playChunkAudio(currentChunk.text, 0.75)}
              className="px-2.5 py-1 rounded-full text-xs font-semibold bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 transition-colors flex items-center gap-1"
              title="Nghe với tốc độ chậm (0.75x)"
            >
              <span>🐢 Chậm</span>
            </button>

            {/* Standard speeds */}
            {[0.9, 1.0, 1.25].map((rate) => (
              <button
                key={rate}
                onClick={() => {
                  setSpeechRate(rate);
                  playChunkAudio(currentChunk.text, rate);
                }}
                className={`px-2 py-1 rounded-full text-xs font-bold transition-colors ${
                  speechRate === rate
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-muted/60 hover:bg-muted text-muted-foreground border border-border/50"
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Fill-in-the-Blanks Sentence Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/70 shadow-lg relative min-h-[220px] flex flex-col justify-between space-y-6">
          
          {/* Sentence Display with Input Blanks */}
          <div className="text-lg sm:text-2xl leading-loose sm:leading-[2.4] font-medium text-foreground tracking-wide flex flex-wrap items-center gap-x-2 gap-y-3">
            {currentChunk.words.map((word) => {
              if (!word.isMasked) {
                return (
                  <span key={word.id} className="inline-block transition-colors">
                    {word.originalText}
                  </span>
                );
              }

              const isCorrect = correctWordIds.has(word.id);
              const isRevealed = revealedWordIds.has(word.id);
              const currentVal = answers[word.id] || "";
              const inputWidthCh = Math.max(word.displayWord.length + 1.5, 4.5);

              return (
                <span key={word.id} className="inline-flex items-center align-baseline">
                  {word.prefixPunct && <span className="mr-0.5">{word.prefixPunct}</span>}
                  
                  <span className="relative inline-block mx-0.5">
                    <input
                      ref={(el) => {
                        inputRefs.current[word.id] = el;
                      }}
                      type="text"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                      value={currentVal}
                      disabled={isCorrect || isRevealed}
                      onChange={(e) => handleInputChange(word, e.target.value)}
                      placeholder={showFirstLetterHint ? `${word.hintLetter}...` : "..."}
                      style={{ width: `${inputWidthCh}ch` }}
                      className={`text-center font-bold text-base sm:text-xl py-0.5 px-1.5 rounded-lg border-b-2 transition-all duration-200 outline-none ${
                        isCorrect
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold"
                          : isRevealed
                          ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400"
                          : "bg-muted/40 border-border hover:border-rose-400 focus:border-rose-600 focus:bg-background focus:ring-2 focus:ring-rose-500/20 text-foreground"
                      }`}
                    />

                    {/* Checkmark icon badge when correct */}
                    {isCorrect && (
                      <span className="absolute -top-2.5 -right-2 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm text-[10px] animate-in zoom-in-75">
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                    )}
                  </span>

                  {word.suffixPunct && <span className="ml-0.5">{word.suffixPunct}</span>}
                </span>
              );
            })}
          </div>

          {/* Vietnamese Translation Accordion */}
          {showTranslation && (
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-xs sm:text-sm text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-2">
              <span className="font-bold text-rose-600 dark:text-rose-400 mr-1.5">🇻🇳 Dịch nghĩa:</span>
              {isLoadingTranslation ? "Đang dịch..." : currentTranslation}
            </div>
          )}

          {/* Footer Action Toolbar */}
          <div className="pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Hint button */}
              {!showFirstLetterHint && !isCurrentChunkDone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGiveHint}
                  className="h-8 px-2.5 rounded-full text-xs font-semibold flex items-center gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Gợi ý</span>
                </Button>
              )}

              {/* Translation button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleTranslation}
                className="h-8 px-2.5 rounded-full text-xs font-semibold flex items-center gap-1 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <Languages className="w-3.5 h-3.5 text-blue-500" />
                <span>{showTranslation ? "Ẩn dịch" : "Dịch câu"}</span>
              </Button>

              {/* Reveal answer button */}
              {!isCurrentChunkDone && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRevealCurrentChunk}
                  className="h-8 px-2.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem đáp án</span>
                </Button>
              )}
            </div>

            {/* Navigation (Prev & Next chunk) */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="h-8 px-2.5 rounded-full text-xs font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đoạn trước</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={handleNext}
                className={`h-8 px-3 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
                  isCurrentChunkDone
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30"
                    : "bg-rose-600 hover:bg-rose-700 text-white"
                }`}
              >
                <span>{currentIndex >= chunks.length - 1 ? "Hoàn tất 🎉" : "Đoạn tiếp"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tip Banner */}
        <div className="text-center text-xs text-muted-foreground">
          <span>💡 Mẹo: Bấm <strong>Space</strong> để nghe lại âm thanh • Gõ đúng từ sẽ tự động nhảy sang ô tiếp theo!</span>
        </div>
      </main>
    </div>
  );
}
