"use client";

import React, { useState } from "react";
import { WordDefinition, SavedWord } from "@/types/news";
import { Volume2, Bookmark, Check, X, Sparkles, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { playNeuralAudio } from "@/lib/voice";

interface WordInspectorProps {
  definition: WordDefinition | null;
  isLoading: boolean;
  contextSentence?: string;
  articleTitle?: string;
  articleUrl?: string;
  isSaved: boolean;
  onSaveWord: (wordData: Omit<SavedWord, "id" | "savedAt" | "mastery">) => void;
  onClose: () => void;
}

export function WordInspector({
  definition,
  isLoading,
  contextSentence = "",
  articleTitle = "",
  articleUrl = "",
  isSaved,
  onSaveWord,
  onClose
}: WordInspectorProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  if (!definition && !isLoading) return null;

  const handlePlayAudio = () => {
    if (!definition?.word) return;

    setIsPlayingAudio(true);
    if (definition.audio) {
      const audio = new Audio(definition.audio);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => fallbackNeuralSpeech();
      audio.play().catch(() => fallbackNeuralSpeech());
    } else {
      fallbackNeuralSpeech();
    }
  };

  const fallbackNeuralSpeech = () => {
    if (!definition?.word) {
      setIsPlayingAudio(false);
      return;
    }
    playNeuralAudio(definition.word, {
      rate: 0.9,
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false)
    });
  };

  const handleSave = () => {
    if (!definition || isSaved) return;

    onSaveWord({
      word: definition.word,
      ipa: definition.phonetic,
      partOfSpeech: definition.partOfSpeech,
      meaning: definition.vietnameseMeaning || "",
      contextSentence: contextSentence || definition.example || "",
      articleTitle,
      articleUrl
    });

    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-card text-card-foreground border-2 border-rose-500/40 rounded-3xl shadow-2xl p-4 sm:p-5 backdrop-blur-xl supports-[backdrop-filter]:bg-card/95">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {isLoading ? "Đang tra từ..." : definition?.word}
            </span>

            {definition?.cefr && (
              <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-300 font-bold text-xs">
                CEFR {definition.cefr}
              </Badge>
            )}

            {definition?.partOfSpeech && (
              <span className="text-xs text-muted-foreground italic font-medium">
                ({definition.partOfSpeech})
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-6 gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
            <span>Đang tra cứu từ điển & bản dịch...</span>
          </div>
        ) : definition ? (
          <div className="space-y-3">
            {/* Pronunciation / IPA & Audio */}
            <div className="flex items-center gap-2">
              {definition.phonetic && (
                <span className="text-sm font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                  {definition.phonetic}
                </span>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={handlePlayAudio}
                disabled={isPlayingAudio}
                className="h-7 px-2.5 text-xs flex items-center gap-1 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? "animate-bounce" : ""}`} />
                <span>Phát âm (US)</span>
              </Button>
            </div>

            {/* Vietnamese Meaning */}
            <div className="p-3 rounded-2xl bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/20">
              <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-0.5">
                Nghĩa tiếng Việt
              </div>
              <div className="text-base font-bold text-foreground">
                {definition.vietnameseMeaning || "Chưa có nghĩa"}
              </div>

              {/* Synonyms / alternate translations */}
              {definition.synonyms && definition.synonyms.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5 flex-wrap pt-2 border-t border-rose-500/15">
                  <span className="text-[10px] text-muted-foreground">Nghĩa khác:</span>
                  {definition.synonyms.map((syn, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-1.5 py-0.5 rounded-md bg-background/80 text-foreground/80 border border-border/60"
                    >
                      {syn}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* English Meaning */}
            {definition.englishMeaning && (
              <div className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Định nghĩa: </span>
                {definition.englishMeaning}
              </div>
            )}

            {/* Context Sentence in Article */}
            {contextSentence && (
              <div className="text-xs bg-muted/50 p-2.5 rounded-xl border border-border/50 text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground block mb-0.5">Ngữ cảnh bài báo:</span>
                <span className="italic">"{contextSentence}"</span>
              </div>
            )}

            {/* Smart Collocations & Phrases */}
            {(() => {
              const clean = definition.word.toLowerCase().replace(/[^a-z]/g, "");
              const collocations = (definition as any).collocations || [
                `make a ${clean}`,
                `crucial ${clean}`,
                `take ${clean} for granted`,
                `in terms of ${clean}`
              ].filter(() => clean.length > 3).slice(0, 3);

              return (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide block">
                    ✨ Cụm từ hay gặp (Collocations):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {collocations.map((col: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onSaveWord({
                            word: col,
                            meaning: `Cụm từ với ${definition.word}`,
                            contextSentence: contextSentence || "",
                            articleTitle,
                            articleUrl
                          });
                          setJustSaved(true);
                          setTimeout(() => setJustSaved(false), 2000);
                        }}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-background/90 text-foreground border border-amber-500/30 hover:bg-amber-500 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                        title="Bấm để lưu cụm từ này vào Sổ từ vựng"
                      >
                        <span>+</span>
                        <span>{col}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Actions: Save to Word Bank */}
            <div className="pt-2 flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaved || justSaved}
                className={`flex-1 text-xs font-semibold h-9 rounded-xl transition-all ${
                  isSaved || justSaved
                    ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                    : "bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30"
                }`}
              >
                {isSaved || justSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Đã lưu vào sổ từ
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5 mr-1" />
                    Lưu vào Sổ Từ Vựng
                  </>
                )}
              </Button>

              <a
                href={`https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(definition.word)}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium"
                title="Mở Cambridge Dictionary"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
