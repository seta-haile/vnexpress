"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Gamepad2, 
  Sparkles, 
  Trophy, 
  RotateCcw, 
  Volume2, 
  Star, 
  Timer, 
  Flame, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Puzzle,
  Zap,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Sound effects generator using Web Audio API
function playSound(type: "flip" | "match" | "wrong" | "win") {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "flip") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === "match") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === "wrong") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(250, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else if (type === "win") {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.25);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
      });
    }
  } catch {}
}

// Speak word aloud using browser synthesis
function speakWord(word: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const clean = word.replace(/[^a-zA-Z\s]/g, "").trim();
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = "en-US";
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  } catch {}
}

// Topics for Memory Game
const MEMORY_TOPICS = {
  gaming: {
    name: "🎮 Game & Minecraft",
    pairs: [
      { id: "p1", en: "Minecraft", vi: "Thế giới khối hộp", icon: "⛏️" },
      { id: "p2", en: "Diamond", vi: "Kim cương", icon: "💎" },
      { id: "p3", en: "Castle", vi: "Lâu đài", icon: "🏰" },
      { id: "p4", en: "Robot", vi: "Người máy", icon: "🤖" },
      { id: "p5", en: "Spaceship", vi: "Tàu vũ trụ", icon: "🚀" },
      { id: "p6", en: "Dragon", vi: "Rồng lửa", icon: "🐉" },
    ]
  },
  animals: {
    name: "🦁 Động Vật Kỳ Thú",
    pairs: [
      { id: "p1", en: "Lion", vi: "Sư tử dũng mãnh", icon: "🦁" },
      { id: "p2", en: "Rabbit", vi: "Chú thỏ nhanh nhẹn", icon: "🐰" },
      { id: "p3", en: "Dolphin", vi: "Cá heo thông minh", icon: "🐬" },
      { id: "p4", en: "Elephant", vi: "Chú voi khổng lồ", icon: "🐘" },
      { id: "p5", en: "Monkey", vi: "Chú khỉ tinh nghịch", icon: "🐒" },
      { id: "p6", en: "Panda", vi: "Gấu trúc dễ thương", icon: "🐼" },
    ]
  },
  fruits: {
    name: "🍎 Trái Cây & Đồ Ăn",
    pairs: [
      { id: "p1", en: "Apple", vi: "Quả táo đỏ", icon: "🍎" },
      { id: "p2", en: "Banana", vi: "Quả chuối ngọt", icon: "🍌" },
      { id: "p3", en: "Pizza", vi: "Bánh pizza", icon: "🍕" },
      { id: "p4", en: "Cookie", vi: "Bánh quy giòn", icon: "🍪" },
      { id: "p5", en: "Ice Cream", vi: "Kem mát lạnh", icon: "🍦" },
      { id: "p6", en: "Watermelon", vi: "Quả dưa hấu", icon: "🍉" },
    ]
  }
};

// Word Scramble Questions
const SCRAMBLE_WORDS = [
  { word: "GAME", hint: "Trò chơi điện tử", icon: "🎮" },
  { word: "ROBOT", hint: "Người máy thông minh", icon: "🤖" },
  { word: "BLOCK", hint: "Khối vuông trong Minecraft", icon: "🧱" },
  { word: "PIKACHU", hint: "Quái vật bỏ túi màu vàng", icon: "⚡" },
  { word: "APPLE", hint: "Quả táo ngọt giòn", icon: "🍎" },
  { word: "ROCKET", hint: "Tên lửa bay vào vũ trụ", icon: "🚀" }
];

// Speed Quiz Questions
const QUIZ_QUESTIONS = [
  {
    q: "In Minecraft, which precious stone is bright blue and makes the strongest tools?",
    options: ["Diamond", "Wood", "Dirt", "Coal"],
    correct: 0,
    hint: "💎 Kim cương màu xanh lấp lánh",
    icon: "⛏️"
  },
  {
    q: "What is the yellow electric Pokémon that says 'Pika Pika'?",
    options: ["Charizard", "Pikachu", "Snorlax", "Bulbasaur"],
    correct: 1,
    hint: "⚡ Chú chuột điện vàng nổi tiếng",
    icon: "⚡"
  },
  {
    q: "In the famous fable, who won the race between the Tortoise and the Hare?",
    options: ["The Hare", "The Wolf", "The Tortoise", "The Fox"],
    correct: 2,
    hint: "🐢 Chú rùa chậm mà chắc!",
    icon: "🐢"
  },
  {
    q: "What is the name of the Italian plumber in a red cap who saves Princess Peach?",
    options: ["Sonic", "Mario", "Luigi", "Pacman"],
    correct: 1,
    hint: "🍄 Chú thợ sửa ống nước Super Mario!",
    icon: "🍄"
  },
  {
    q: "Why do worker bees visit hundreds of flowers every day?",
    options: ["To play games", "To take naps", "To make sweet honey", "To hide from bears"],
    correct: 2,
    hint: "🍯 Để thu thập mật hoa và làm mật ngọt",
    icon: "🐝"
  }
];

export function KidsGameArena() {
  const [activeTab, setActiveTab] = useState<"memory" | "scramble" | "quiz">("memory");

  // --- 1. MEMORY MATCH GAME STATE ---
  const [currentTopic, setCurrentTopic] = useState<keyof typeof MEMORY_TOPICS>("gaming");
  interface MemoryCard {
    uid: string;
    pairId: string;
    type: "en" | "vi";
    text: string;
    icon: string;
    isFlipped: boolean;
    isMatched: boolean;
  }
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<MemoryCard[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Initialize Memory Game
  const initMemoryGame = (topicKey: keyof typeof MEMORY_TOPICS = currentTopic) => {
    const topic = MEMORY_TOPICS[topicKey];
    const deck: MemoryCard[] = [];
    topic.pairs.forEach((p, idx) => {
      deck.push({
        uid: `${p.id}-en-${idx}`,
        pairId: p.id,
        type: "en",
        text: p.en,
        icon: p.icon,
        isFlipped: false,
        isMatched: false
      });
      deck.push({
        uid: `${p.id}-vi-${idx}`,
        pairId: p.id,
        type: "vi",
        text: p.vi,
        icon: p.icon,
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setSelectedCards([]);
    setMoves(0);
    setScore(0);
    setIsWon(false);
    setTimerSeconds(0);
    setIsTimerRunning(true);
  };

  useEffect(() => {
    if (activeTab === "memory") {
      initMemoryGame(currentTopic);
    }
  }, [activeTab, currentTopic]);

  // Timer tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && !isWon) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isWon]);

  // Card Flip Handler
  const handleCardClick = (card: MemoryCard) => {
    if (card.isFlipped || card.isMatched || selectedCards.length >= 2) return;

    playSound("flip");
    if (card.type === "en") {
      speakWord(card.text);
    }

    const newCards = cards.map((c) =>
      c.uid === card.uid ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newSelected;
      if (first.pairId === second.pairId && first.type !== second.type) {
        // Matched!
        playSound("match");
        setScore((s) => s + 100);
        setTimeout(() => {
          setCards((prev) => {
            const updated = prev.map((c) =>
              c.pairId === first.pairId ? { ...c, isMatched: true } : c
            );
            if (updated.every((c) => c.isMatched)) {
              setIsWon(true);
              setIsTimerRunning(false);
              playSound("win");
            }
            return updated;
          });
          setSelectedCards([]);
        }, 500);
      } else {
        // Not matched
        playSound("wrong");
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.uid === first.uid || c.uid === second.uid
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setSelectedCards([]);
        }, 900);
      }
    }
  };

  // --- 2. WORD SCRAMBLE GAME STATE ---
  const [scrambleIndex, setScrambleIndex] = useState(0);
  const currentScramble = SCRAMBLE_WORDS[scrambleIndex];
  const [scrambledLetters, setScrambledLetters] = useState<{ id: string; char: string; used: boolean }[]>([]);
  const [placedLetters, setPlacedLetters] = useState<{ id: string; char: string }[]>([]);
  const [scrambleStatus, setScrambleStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [scrambleScore, setScrambleScore] = useState(0);

  const initScrambleWord = (idx: number) => {
    const item = SCRAMBLE_WORDS[idx % SCRAMBLE_WORDS.length];
    const letters = item.word.split("").map((char, i) => ({
      id: `${char}-${i}-${Math.random()}`,
      char,
      used: false
    }));
    // Shuffle letters
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    setScrambledLetters(letters);
    setPlacedLetters([]);
    setScrambleStatus("idle");
  };

  useEffect(() => {
    if (activeTab === "scramble") {
      initScrambleWord(scrambleIndex);
    }
  }, [activeTab, scrambleIndex]);

  const handlePickLetter = (item: { id: string; char: string; used: boolean }) => {
    if (item.used) return;
    playSound("flip");
    setScrambledLetters((prev) =>
      prev.map((l) => (l.id === item.id ? { ...l, used: true } : l))
    );
    const newPlaced = [...placedLetters, { id: item.id, char: item.char }];
    setPlacedLetters(newPlaced);

    // Auto-check if all letters placed
    if (newPlaced.length === currentScramble.word.length) {
      const spelled = newPlaced.map((l) => l.char).join("");
      if (spelled === currentScramble.word) {
        playSound("match");
        setScrambleStatus("correct");
        setScrambleScore((s) => s + 50);
        speakWord(currentScramble.word);
        setTimeout(() => {
          if (scrambleIndex + 1 < SCRAMBLE_WORDS.length) {
            setScrambleIndex((i) => i + 1);
          } else {
            playSound("win");
            setScrambleStatus("correct");
          }
        }, 1500);
      } else {
        playSound("wrong");
        setScrambleStatus("wrong");
      }
    }
  };

  const handleRemoveLetter = (placedItem: { id: string; char: string }) => {
    playSound("flip");
    setPlacedLetters((prev) => prev.filter((p) => p.id !== placedItem.id));
    setScrambledLetters((prev) =>
      prev.map((l) => (l.id === placedItem.id ? { ...l, used: false } : l))
    );
    setScrambleStatus("idle");
  };

  // --- 3. SPEED QUIZ GAME STATE ---
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const currentQuiz = QUIZ_QUESTIONS[quizIndex];

  const handleSelectQuizOption = (optionIdx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIdx);

    if (optionIdx === currentQuiz.correct) {
      playSound("match");
      setQuizScore((s) => s + 20);
    } else {
      playSound("wrong");
    }

    setTimeout(() => {
      if (quizIndex + 1 < QUIZ_QUESTIONS.length) {
        setQuizIndex((i) => i + 1);
        setSelectedOption(null);
      } else {
        setIsQuizFinished(true);
        playSound("win");
      }
    }, 1400);
  };

  const restartQuiz = () => {
    setQuizIndex(0);
    setSelectedOption(null);
    setQuizScore(0);
    setIsQuizFinished(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Game Center Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 p-5 sm:p-8 text-white shadow-xl shadow-purple-500/20 border border-white/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide">
              <Gamepad2 className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>KHU VUI CHƠI GAME TIẾNG ANH CHO BÉ</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight">
              🎮 Vừa Chơi Game — Vừa Giỏi Tiếng Anh!
            </h2>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
              Bé thỏa sức lật thẻ trí nhớ, ghép khối chữ cái Minecraft và đố vui nhận điểm thưởng ⭐ cùng hiệu ứng âm thanh siêu vui nhộn!
            </p>
          </div>

          {/* Quick Game Switcher */}
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 flex-wrap">
            <button
              onClick={() => setActiveTab("memory")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "memory"
                  ? "bg-white text-purple-700 shadow-md scale-105"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Puzzle className="w-4 h-4" />
              <span>🃏 Lật Thẻ Ghép Từ</span>
            </button>
            <button
              onClick={() => setActiveTab("scramble")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "scramble"
                  ? "bg-white text-purple-700 shadow-md scale-105"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>🔤 Thợ Săn Chữ</span>
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "quiz"
                  ? "bg-white text-purple-700 shadow-md scale-105"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>⚡ Đố Vui Nhanh</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- TAB 1: MEMORY MATCH GAME --- */}
      {activeTab === "memory" && (
        <div className="bg-card border border-border/70 rounded-3xl p-4 sm:p-6 shadow-sm space-y-6">
          {/* Top Controls & Topics */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
            {/* Topic Switcher */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Chủ đề:</span>
              {(Object.keys(MEMORY_TOPICS) as Array<keyof typeof MEMORY_TOPICS>).map((key) => (
                <button
                  key={key}
                  onClick={() => setCurrentTopic(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    currentTopic === key
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {MEMORY_TOPICS[key].name}
                </button>
              ))}
            </div>

            {/* Score & Moves */}
            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{score} Điểm</span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Timer className="w-4 h-4" />
                <span>{timerSeconds}s</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => initMemoryGame(currentTopic)}
                className="h-8 gap-1 text-xs font-semibold rounded-full hover:bg-muted"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Chơi lại</span>
              </Button>
            </div>
          </div>

          {/* Victory Modal Overlay */}
          {isWon && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/15 via-rose-500/15 to-purple-500/15 border-2 border-amber-500/30 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30 animate-bounce">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-foreground">🎉 XUẤT SẮC! BÉ ĐÃ CHIẾN THẮNG!</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Bé đã ghép đúng toàn bộ 6 cặp từ vựng trong <strong>{timerSeconds} giây</strong> với <strong>{moves} lượt lật</strong>. Thật đáng tự hào!
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  onClick={() => initMemoryGame(currentTopic)}
                  className="bg-gradient-to-r from-purple-600 to-rose-600 text-white font-bold px-6 py-2 rounded-full shadow-lg hover:scale-105 transition-all"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Chơi Ván Mới
                </Button>
              </div>
            </div>
          )}

          {/* Cards Grid: 3 cols on mobile, 4 on tablet/desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {cards.map((card) => {
              const isRevealed = card.isFlipped || card.isMatched;
              return (
                <div
                  key={card.uid}
                  onClick={() => handleCardClick(card)}
                  className={`relative h-28 sm:h-32 rounded-2xl cursor-pointer select-none transition-all duration-300 transform perspective-1000 ${
                    card.isMatched
                      ? "bg-emerald-500/15 border-2 border-emerald-500/60 shadow-md scale-95"
                      : isRevealed
                      ? "bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-500 shadow-md scale-100"
                      : "bg-gradient-to-tr from-purple-600 via-indigo-600 to-rose-500 border-2 border-white/20 shadow-md hover:scale-105 active:scale-95"
                  }`}
                >
                  {isRevealed ? (
                    <div className="h-full flex flex-col items-center justify-center p-2 text-center space-y-1">
                      <span className="text-2xl sm:text-3xl">{card.icon}</span>
                      <span className={`font-black text-xs sm:text-sm ${
                        card.type === "en" ? "text-purple-700 dark:text-purple-300" : "text-emerald-700 dark:text-emerald-300"
                      }`}>
                        {card.text}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {card.type === "en" ? "🇬🇧 English" : "🇻🇳 Tiếng Việt"}
                      </span>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-white space-y-1">
                      <Gamepad2 className="w-7 h-7 sm:w-8 sm:h-8 opacity-80" />
                      <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-80">Lật Thẻ</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 2: WORD SCRAMBLE GAME --- */}
      {activeTab === "scramble" && (
        <div className="bg-card border border-border/70 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 text-center">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <span className="text-xs font-bold text-muted-foreground">
              Từ vựng {scrambleIndex + 1} / {SCRAMBLE_WORDS.length}
            </span>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{scrambleScore} Điểm</span>
            </div>
          </div>

          {/* Hint & Image Icon */}
          <div className="space-y-2">
            <div className="text-6xl animate-bounce">{currentScramble.icon}</div>
            <h3 className="text-lg font-bold text-foreground">
              💡 Gợi ý: {currentScramble.hint}
            </h3>
            <p className="text-xs text-muted-foreground">
              Bé hãy bấm vào các khối chữ cái bên dưới để xếp thành từ tiếng Anh đúng nhé!
            </p>
          </div>

          {/* Placed Answer Slots */}
          <div className="flex items-center justify-center gap-2 min-h-[64px] py-2 flex-wrap">
            {currentScramble.word.split("").map((_, idx) => {
              const placed = placedLetters[idx];
              return (
                <div
                  key={idx}
                  onClick={() => placed && handleRemoveLetter(placed)}
                  className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black transition-all cursor-pointer border-2 ${
                    scrambleStatus === "correct"
                      ? "bg-emerald-500 text-white border-emerald-400 scale-105 shadow-lg"
                      : scrambleStatus === "wrong"
                      ? "bg-rose-500 text-white border-rose-400 animate-shake"
                      : placed
                      ? "bg-purple-600 text-white border-purple-400 shadow-md"
                      : "bg-muted/50 border-dashed border-border/80 text-muted-foreground"
                  }`}
                >
                  {placed?.char || ""}
                </div>
              );
            })}
          </div>

          {/* Status Message */}
          {scrambleStatus === "correct" && (
            <div className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 bg-emerald-500/10 px-4 py-1.5 rounded-full animate-bounce">
              <CheckCircle2 className="w-4 h-4" />
              <span>Chính xác tuyệt vời! +50 Điểm</span>
            </div>
          )}
          {scrambleStatus === "wrong" && (
            <div className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-600 bg-rose-500/10 px-4 py-1.5 rounded-full">
              <XCircle className="w-4 h-4" />
              <span>Chưa đúng rồi, bé hãy bấm vào chữ để xếp lại nhé!</span>
            </div>
          )}

          {/* Letter Blocks to Pick (Minecraft style 3D cubes) */}
          <div className="flex items-center justify-center gap-2 pt-4 flex-wrap max-w-md mx-auto">
            {scrambledLetters.map((l) => (
              <button
                key={l.id}
                disabled={l.used}
                onClick={() => handlePickLetter(l)}
                className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl text-xl sm:text-2xl font-black transition-all transform ${
                  l.used
                    ? "opacity-20 scale-90 bg-muted cursor-not-allowed border border-border"
                    : "bg-gradient-to-b from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30 hover:scale-110 active:scale-95 border-b-4 border-orange-600 cursor-pointer"
                }`}
              >
                {l.char}
              </button>
            ))}
          </div>

          {/* Audio helper */}
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => speakWord(currentScramble.word)}
              className="gap-1.5 rounded-full text-xs hover:bg-muted"
            >
              <Volume2 className="w-4 h-4 text-purple-600" />
              <span>Nghe phát âm từ</span>
            </Button>
          </div>
        </div>
      )}

      {/* --- TAB 3: SPEED QUIZ GAME --- */}
      {activeTab === "quiz" && (
        <div className="bg-card border border-border/70 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <span className="text-xs font-bold text-muted-foreground">
              Câu hỏi {quizIndex + 1} / {QUIZ_QUESTIONS.length}
            </span>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{quizScore} Điểm</span>
            </div>
          </div>

          {!isQuizFinished ? (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="text-center space-y-2">
                <span className="text-5xl">{currentQuiz.icon}</span>
                <h3 className="text-lg sm:text-xl font-black text-foreground leading-snug">
                  {currentQuiz.q}
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  {currentQuiz.hint}
                </p>
              </div>

              {/* 4 Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuiz.options.map((opt, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const isCorrect = optIdx === currentQuiz.correct;
                  let btnStyle = "bg-muted/70 hover:bg-muted text-foreground border border-border/70";

                  if (selectedOption !== null) {
                    if (isCorrect) {
                      btnStyle = "bg-emerald-500 text-white border-emerald-600 font-bold shadow-md animate-pulse";
                    } else if (isSelected) {
                      btnStyle = "bg-rose-500 text-white border-rose-600 font-bold";
                    } else {
                      btnStyle = "opacity-40 bg-muted";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={selectedOption !== null}
                      onClick={() => handleSelectQuizOption(optIdx)}
                      className={`p-4 rounded-2xl text-sm font-bold text-left transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {selectedOption !== null && isCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
                      {selectedOption !== null && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-600/30">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-foreground">🎉 HOÀN THÀNH BÀI THỬ THÁCH!</h3>
              <p className="text-sm text-muted-foreground">
                Bé đạt được <strong>{quizScore} / 100 điểm</strong> đố vui tiếng Anh!
              </p>
              <Button
                onClick={restartQuiz}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 font-bold"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Chơi Lại Từ Đầu
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
