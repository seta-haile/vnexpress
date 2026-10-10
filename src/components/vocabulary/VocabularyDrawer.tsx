"use client";

import React, { useState } from "react";
import { SavedWord } from "@/types/news";
import { 
  X, 
  Search, 
  Volume2, 
  Trash2, 
  Sparkles, 
  HelpCircle, 
  Download, 
  Bookmark, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { removeSavedWord, updateWordMastery } from "@/lib/storage";
import { playNeuralAudio } from "@/lib/voice";

interface VocabularyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedWords: SavedWord[];
  onWordsChange: () => void;
  onStartFlashcards: () => void;
  onStartQuiz: () => void;
}

export function VocabularyDrawer({
  isOpen,
  onClose,
  savedWords,
  onWordsChange,
  onStartFlashcards,
  onStartQuiz
}: VocabularyDrawerProps) {
  const [search, setSearch] = useState("");
  const [filterMastery, setFilterMastery] = useState<string>("all");
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter words
  const filteredWords = savedWords.filter((w) => {
    const matchesSearch =
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      w.meaning.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterMastery === "all" || w.mastery === filterMastery;
    return matchesSearch && matchesFilter;
  });

  const handlePlayAudio = (word: string) => {
    setPlayingWord(word);
    playNeuralAudio(word, {
      rate: 0.9,
      onEnd: () => setPlayingWord(null),
      onError: () => setPlayingWord(null)
    });
  };

  const handleDelete = (id: string) => {
    removeSavedWord(id);
    onWordsChange();
  };

  const handleToggleMastery = (id: string, current: SavedWord["mastery"]) => {
    const next: SavedWord["mastery"] =
      current === "new" ? "learning" : current === "learning" ? "mastered" : "new";
    updateWordMastery(id, next);
    onWordsChange();
  };

  const handleExportCSV = () => {
    if (savedWords.length === 0) return;
    const header = "Word,IPA,Part of Speech,Meaning,Context Sentence,Article\n";
    const rows = savedWords
      .map(
        (w) =>
          `"${w.word}","${w.ipa || ""}","${w.partOfSpeech || ""}","${w.meaning.replace(/"/g, '""')}","${w.contextSentence.replace(/"/g, '""')}","${w.articleTitle.replace(/"/g, '""')}"`
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `VnExpress_Vocabulary_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-card text-card-foreground shadow-2xl flex flex-col border-l border-border/60">
          {/* Header */}
          <div className="p-5 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                <Bookmark className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Sổ Từ Vựng Cá Nhân</h2>
                <p className="text-xs text-muted-foreground">
                  {savedWords.length} từ đã tích lũy từ VnExpress
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Learning Actions */}
          <div className="p-4 bg-muted/30 border-b border-border/40 grid grid-cols-2 gap-2">
            <Button
              onClick={() => {
                onClose();
                onStartFlashcards();
              }}
              disabled={savedWords.length === 0}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold h-10 shadow-sm shadow-rose-600/30 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              Ôn tập Flashcards ({savedWords.length})
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                onClose();
                onStartQuiz();
              }}
              disabled={savedWords.length === 0}
              className="rounded-xl text-xs font-semibold h-10 flex items-center justify-center gap-1.5 border-border hover:bg-muted"
            >
              <HelpCircle className="w-4 h-4 text-blue-500" />
              Làm Mini-Quiz
            </Button>
          </div>

          {/* Search & Filters */}
          <div className="p-4 border-b border-border/40 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm từ vựng hoặc nghĩa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                {(["all", "new", "learning", "mastered"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setFilterMastery(m)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors ${
                      filterMastery === m
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {m === "all" ? "Tất cả" : m}
                  </button>
                ))}
              </div>

              <button
                onClick={handleExportCSV}
                disabled={savedWords.length === 0}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-[11px] font-medium"
                title="Xuất sang file CSV để import Anki"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất Anki (CSV)</span>
              </button>
            </div>
          </div>

          {/* Word List Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredWords.length === 0 ? (
              <div className="text-center py-16 space-y-3 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto stroke-1 opacity-50" />
                <p className="text-sm">Chưa có từ vựng nào trong danh sách này.</p>
                <p className="text-xs max-w-xs mx-auto">
                  Hãy bấm vào các từ vựng trong bất kỳ bài báo nào để tra từ và bấm "Lưu vào Sổ Từ"!
                </p>
              </div>
            ) : (
              filteredWords.map((word) => (
                <div
                  key={word.id}
                  className="p-3.5 rounded-2xl bg-card border border-border/70 hover:border-border hover:shadow-sm transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-base capitalize text-foreground">
                          {word.word}
                        </span>
                        {word.ipa && (
                          <span className="text-xs font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                            {word.ipa}
                          </span>
                        )}
                        {word.partOfSpeech && (
                          <span className="text-xs text-muted-foreground italic">
                            ({word.partOfSpeech})
                          </span>
                        )}
                      </div>

                      <div className="text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 mt-1">
                        {word.meaning}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Play audio */}
                      <button
                        onClick={() => handlePlayAudio(word.word)}
                        className={`p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-muted ${
                          playingWord === word.word ? "text-rose-600 animate-pulse" : ""
                        }`}
                        title="Phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(word.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-muted"
                        title="Xóa từ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Context sentence */}
                  {word.contextSentence && (
                    <div className="text-xs text-muted-foreground italic bg-muted/40 p-2 rounded-xl border border-border/40">
                      "{word.contextSentence}"
                    </div>
                  )}

                  {/* Card bottom: status & article source */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-muted-foreground line-clamp-1 max-w-[200px]" title={word.articleTitle}>
                      Nguồn: {word.articleTitle || "VnExpress"}
                    </span>

                    <button
                      onClick={() => handleToggleMastery(word.id, word.mastery)}
                      className={`px-2 py-0.5 rounded-full font-medium transition-colors ${
                        word.mastery === "mastered"
                          ? "bg-emerald-500/15 text-emerald-600"
                          : word.mastery === "learning"
                          ? "bg-amber-500/15 text-amber-600"
                          : "bg-blue-500/15 text-blue-600"
                      }`}
                    >
                      {word.mastery === "mastered" && "✓ Đã thuộc"}
                      {word.mastery === "learning" && "⏳ Đang học"}
                      {word.mastery === "new" && "🌱 Từ mới"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
