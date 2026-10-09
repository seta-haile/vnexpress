"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArticleDetail, KeyVocab, SavedWord, WordDefinition } from "@/types/news";
import { WordInspector } from "./WordInspector";
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Languages, 
  Type, 
  Sparkles, 
  Bookmark, 
  ArrowLeft, 
  CheckCircle2, 
  Share2, 
  BookOpen, 
  Highlighter,
  Sliders,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cleanWord, CURATED_VOCAB, detectCEFRLevel } from "@/lib/dictionary";
import { isWordSaved, saveWord, ReaderSettings, getReaderSettings, saveReaderSettings } from "@/lib/storage";
import confetti from "canvas-confetti";

interface InteractiveReaderProps {
  article: ArticleDetail;
  onBack: () => void;
  onMarkRead: (articleId: string) => void;
  isRead?: boolean;
  showImages?: boolean;
}

export function InteractiveReader({
  article,
  onBack,
  onMarkRead,
  isRead = false,
  showImages = true
}: InteractiveReaderProps) {
  // Reader display settings
  const [settings, setSettings] = useState<ReaderSettings>(getReaderSettings());
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({});
  const [translatedParagraphs, setTranslatedParagraphs] = useState<Record<string, string>>({});
  const [loadingTranslations, setLoadingTranslations] = useState<Record<string, boolean>>({});

  // Word & Text selection state
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedContext, setSelectedContext] = useState<string>("");
  const [wordDef, setWordDef] = useState<WordDefinition | null>(null);
  const [isLoadingWord, setIsLoadingWord] = useState(false);
  const [savedWordsState, setSavedWordsState] = useState<Record<string, boolean>>({});

  // Floating selection tooltip state
  const [selectedRangeText, setSelectedRangeText] = useState<string>("");
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);

  // Audio / Text to speech state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeSpeechParagraph, setActiveSpeechParagraph] = useState<number | null>(null);
  const [speechSpeed, setSpeechSpeed] = useState<number>(settings.speechRate || 1.0);

  // Reading progress
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasFinished, setHasFinished] = useState(isRead);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        const current = (window.scrollY / total) * 100;
        setScrollProgress(Math.min(100, Math.max(0, current)));
        if (current > 85 && !hasFinished) {
          setHasFinished(true);
          onMarkRead(article.id);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [article.id, hasFinished, onMarkRead]);

  // Listen to text selection (bôi đen đoạn văn hoặc cụm từ)
  const handleMouseUp = () => {
    if (typeof window === "undefined") return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedRangeText("");
      setSelectionPosition(null);
      return;
    }
    const text = selection.toString().trim();
    if (text.length > 1 && text.length < 300) {
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedRangeText(text);
        setSelectionPosition({
          x: rect.left + rect.width / 2,
          y: Math.max(10, rect.top - 8)
        });
      } catch {
        setSelectedRangeText("");
        setSelectionPosition(null);
      }
    } else {
      setSelectedRangeText("");
      setSelectionPosition(null);
    }
  };

  // Handle word or phrase click
  const handleWordClick = async (rawWord: string, contextSentence: string) => {
    const trimmed = rawWord.trim().replace(/^[^\w]+|[^\w]+$/g, "");
    if (!trimmed || trimmed.length < 2) return;

    setSelectedWord(trimmed);
    setSelectedContext(contextSentence);
    setIsLoadingWord(true);
    setWordDef(null); // Clear previous

    try {
      const res = await fetch(`/api/translate?word=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (data.success && data.definition) {
        setWordDef(data.definition);
      } else {
        setWordDef({
          word: trimmed,
          vietnameseMeaning: `Nghĩa: ${trimmed}`,
          cefr: detectCEFRLevel(trimmed)
        });
      }
    } catch (e) {
      console.error("Word lookup error:", e);
      setWordDef({
        word: trimmed,
        vietnameseMeaning: `Nghĩa: ${trimmed}`,
        cefr: detectCEFRLevel(trimmed)
      });
    } finally {
      setIsLoadingWord(false);
    }
  };

  // Translate a specific paragraph
  const handleTranslateParagraph = async (pId: string, text: string) => {
    if (showTranslations[pId]) {
      setShowTranslations(prev => ({ ...prev, [pId]: false }));
      return;
    }

    if (translatedParagraphs[pId]) {
      setShowTranslations(prev => ({ ...prev, [pId]: true }));
      return;
    }

    setLoadingTranslations(prev => ({ ...prev, [pId]: true }));
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: text })
      });
      const data = await res.json();
      if (data.success && data.translation) {
        setTranslatedParagraphs(prev => ({ ...prev, [pId]: data.translation }));
        setShowTranslations(prev => ({ ...prev, [pId]: true }));
      }
    } catch (e) {
      console.error("Translation error:", e);
    } finally {
      setLoadingTranslations(prev => ({ ...prev, [pId]: false }));
    }
  };

  // Text to speech for article or paragraph
  const handlePlayTTS = (textToRead: string, paragraphIndex: number | null = null) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Trình duyệt của bạn không hỗ trợ Text-to-Speech.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setActiveSpeechParagraph(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = "en-US";
    utterance.rate = speechSpeed;

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setActiveSpeechParagraph(paragraphIndex);
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setActiveSpeechParagraph(null);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setActiveSpeechParagraph(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopTTS = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setActiveSpeechParagraph(null);
  };

  const handleSaveWordToStorage = (wordData: Omit<SavedWord, "id" | "savedAt" | "mastery">) => {
    saveWord(wordData);
    setSavedWordsState(prev => ({ ...prev, [wordData.word.toLowerCase()]: true }));
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.85 } });
  };

  const handleCelebrationFinish = () => {
    setHasFinished(true);
    onMarkRead(article.id);
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
  };

  const updateSetting = <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => {
    const next = saveReaderSettings({ [key]: value });
    setSettings(next);
  };

  // Styling based on theme - uses background and foreground tokens to automatically inherit global Dark mode
  const themeClasses = {
    light: "bg-background text-foreground",
    sepia: "bg-[#f5ebd7] text-[#3d2e1e] dark:bg-[#282119] dark:text-[#f2e4d4] selection:bg-[#dfc49c]",
    dark: "bg-zinc-950 text-zinc-100 dark selection:bg-rose-900"
  }[settings.readerTheme];

  const fontClasses = {
    serif: "font-serif",
    sans: "font-sans"
  }[settings.fontFamily];

  const fontSizeClasses = {
    sm: "text-base leading-relaxed",
    base: "text-lg leading-relaxed",
    lg: "text-xl leading-loose",
    xl: "text-2xl leading-loose",
    "2xl": "text-3xl leading-loose"
  }[settings.fontSize];

  return (
    <div 
      onMouseUp={handleMouseUp}
      className={`min-h-screen ${themeClasses} transition-colors duration-200 select-text`}
    >
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-muted/30 z-50">
        <div
          className="h-full bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Reader Navigation & Controls Bar */}
      <div className="sticky top-0 z-40 w-full border-b border-border/40 backdrop-blur-md bg-background/90 supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại danh sách</span>
          </Button>

          {/* Center: TTS Audio player controls */}
          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-full border border-border/50">
            <Button
              size="sm"
              variant={isPlayingAudio ? "default" : "ghost"}
              onClick={() => {
                if (isPlayingAudio) {
                  handleStopTTS();
                } else {
                  const fullText = [article.lead, ...article.paragraphs.map(p => p.text)].join(". ");
                  handlePlayTTS(fullText);
                }
              }}
              className={`h-7 px-2.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                isPlayingAudio ? "bg-rose-600 text-white hover:bg-rose-700 animate-pulse" : ""
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Dừng đọc</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-rose-600" />
                  <span>Nghe bài đọc (TTS)</span>
                </>
              )}
            </Button>

            {/* Speed toggle */}
            <button
              onClick={() => {
                const nextSpeed = speechSpeed === 1.0 ? 1.25 : speechSpeed === 1.25 ? 0.8 : 1.0;
                setSpeechSpeed(nextSpeed);
                updateSetting("speechRate", nextSpeed);
              }}
              className="text-[11px] font-bold px-2 py-0.5 rounded-full hover:bg-background/80 text-muted-foreground transition-colors"
              title="Tốc độ đọc"
            >
              {speechSpeed}x
            </button>
          </div>

          {/* Right: Reading Appearance Settings */}
          <div className="flex items-center gap-1">
            {/* Font Family Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("fontFamily", settings.fontFamily === "serif" ? "sans" : "serif")}
              className="h-8 w-8 p-0 text-xs font-bold"
              title={settings.fontFamily === "serif" ? "Đổi sang Font Sans" : "Đổi sang Font Báo Chí (Serif)"}
            >
              {settings.fontFamily === "serif" ? "Serif" : "Sans"}
            </Button>

            {/* Font Size Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const sizes: ReaderSettings["fontSize"][] = ["sm", "base", "lg", "xl"];
                const nextIdx = (sizes.indexOf(settings.fontSize) + 1) % sizes.length;
                updateSetting("fontSize", sizes[nextIdx]);
              }}
              className="h-8 w-8 p-0"
              title="Cỡ chữ"
            >
              <Type className="w-4 h-4" />
            </Button>

            {/* Theme switcher */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const themes: ReaderSettings["readerTheme"][] = ["light", "sepia", "dark"];
                const nextIdx = (themes.indexOf(settings.readerTheme) + 1) % themes.length;
                updateSetting("readerTheme", themes[nextIdx]);
              }}
              className="h-8 w-8 p-0 text-sm"
              title="Đổi màu nền đọc"
            >
              {settings.readerTheme === "light" && "☀️"}
              {settings.readerTheme === "sepia" && "📜"}
              {settings.readerTheme === "dark" && "🌙"}
            </Button>

            {/* Highlight CEFR toggle */}
            <Button
              variant={settings.highlightCefr ? "secondary" : "ghost"}
              size="sm"
              onClick={() => updateSetting("highlightCefr", !settings.highlightCefr)}
              className="h-8 w-8 p-0"
              title={settings.highlightCefr ? "Tắt highlight từ vựng" : "Bật highlight từ vựng theo CEFR"}
            >
              <Highlighter className={`w-4 h-4 ${settings.highlightCefr ? "text-rose-600" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Selected Text (Bôi đen để dịch) */}
      {selectionPosition && selectedRangeText && (
        <div
          style={{
            position: "fixed",
            left: `${selectionPosition.x}px`,
            top: `${selectionPosition.y}px`,
            transform: "translate(-50%, -100%)"
          }}
          className="z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleWordClick(selectedRangeText, selectedRangeText);
              setSelectedRangeText("");
              setSelectionPosition(null);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xl border border-white/20 transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Dịch: "{selectedRangeText.length > 20 ? selectedRangeText.slice(0, 20) + "..." : selectedRangeText}"</span>
          </button>
        </div>
      )}

      {/* Main Reading Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Article Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-300 font-semibold text-xs">
              {article.category}
            </Badge>
            <Badge variant="outline" className="text-xs font-medium">
              CEFR {article.cefrLevel}
            </Badge>
            <span className="text-xs text-muted-foreground">{article.pubDate}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-foreground">
            {article.title}
          </h1>

          {/* Lead Paragraph */}
          {article.lead && (
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 text-base sm:text-lg font-medium leading-relaxed italic text-foreground/90">
              {renderClickableSentence(article.lead, article.lead)}
            </div>
          )}

          {/* Featured Image */}
          {showImages && article.thumbnail && (
            <div className="my-6 rounded-2xl overflow-hidden border border-border/40 shadow-md">
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full h-auto max-h-[460px] object-cover"
              />
              {article.caption && (
                <div className="p-3 text-xs text-muted-foreground bg-muted/30 italic">
                  {article.caption}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Superpower: Key Vocabulary Card for this Article */}
        {article.keyVocabulary && article.keyVocabulary.length > 0 && (
          <div className="my-8 p-5 rounded-2xl bg-card border border-rose-500/20 shadow-sm text-card-foreground">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h3 className="font-bold text-base text-foreground">
                  Từ vựng trọng tâm trong bài (Key Vocabulary)
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {article.keyVocabulary.length} từ chọn lọc
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {article.keyVocabulary.map((kv, i) => {
                const isSaved = isWordSaved(kv.word) || savedWordsState[kv.word.toLowerCase()];
                return (
                  <div
                    key={i}
                    onClick={() => handleWordClick(kv.word, kv.exampleSentence || "")}
                    className="p-3 rounded-xl bg-card/90 border border-border/60 hover:border-rose-500/50 hover:shadow-md transition-all cursor-pointer flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm capitalize text-foreground">
                          {kv.word}
                        </span>
                        {kv.ipa && (
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {kv.ipa}
                          </span>
                        )}
                        <Badge className="text-[10px] py-0 px-1 font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border-none">
                          {kv.cefr}
                        </Badge>
                      </div>
                      <div className="text-xs text-foreground/90 font-medium mt-1">
                        {kv.vietnamese}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveWordToStorage({
                          word: kv.word,
                          ipa: kv.ipa,
                          partOfSpeech: kv.partOfSpeech,
                          meaning: kv.vietnamese,
                          contextSentence: kv.exampleSentence || "",
                          articleTitle: article.title,
                          articleUrl: article.link
                        });
                      }}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${
                        isSaved
                          ? "text-emerald-600 bg-emerald-500/10"
                          : "text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      }`}
                      title={isSaved ? "Đã lưu" : "Lưu vào sổ từ"}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Article Body Paragraphs */}
        <article className={`space-y-6 ${fontClasses} ${fontSizeClasses}`}>
          {article.paragraphs.map((p, pIdx) => {
            const isPlayingThis = activeSpeechParagraph === pIdx;
            const isTranslated = showTranslations[p.id];
            const translatedText = translatedParagraphs[p.id];
            const isLoadingTrans = loadingTranslations[p.id];

            return (
              <div 
                key={p.id}
                className={`group relative p-3 sm:p-4 rounded-2xl transition-all ${
                  isPlayingThis ? "bg-rose-500/10 ring-2 ring-rose-500/30" : "hover:bg-muted/30"
                }`}
              >
                {/* Paragraph Text with clickable words */}
                <p className="leading-relaxed text-foreground">
                  {renderClickableSentence(p.text, p.text)}
                </p>

                {/* Paragraph Toolbar on hover */}
                <div className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground opacity-70 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handlePlayTTS(p.text, pIdx)}
                    className="flex items-center gap-1 hover:text-rose-600 px-2 py-1 rounded-md hover:bg-muted/60 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPlayingThis ? "Dừng nghe" : "Nghe đoạn này"}</span>
                  </button>

                  <span>•</span>

                  <button
                    onClick={() => handleTranslateParagraph(p.id, p.text)}
                    disabled={isLoadingTrans}
                    className="flex items-center gap-1 hover:text-blue-500 px-2 py-1 rounded-md hover:bg-muted/60 transition-colors"
                  >
                    <Languages className="w-3.5 h-3.5" />
                    <span>
                      {isLoadingTrans
                        ? "Đang dịch..."
                        : isTranslated
                        ? "Ẩn bản dịch"
                        : "Dịch đoạn sang tiếng Việt"}
                    </span>
                  </button>
                </div>

                {/* Inline Paragraph Translation */}
                {isTranslated && translatedText && (
                  <div className="mt-3 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs sm:text-sm font-sans text-foreground leading-relaxed animate-in fade-in duration-200">
                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">
                      Bản dịch tiếng Việt
                    </div>
                    {translatedText}
                  </div>
                )}
              </div>
            );
          })}
        </article>

        {/* Finished Article Celebration Card */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-card border-2 border-border/80 shadow-xl text-center space-y-4 text-card-foreground">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/15 text-emerald-500">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-foreground">
            Chúc mừng bạn đã hoàn thành bài báo!
          </h3>

          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Bạn vừa nạp thêm ~{article.wordCount} từ vựng tiếng Anh thực tế về chủ đề {article.category}.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              onClick={handleCelebrationFinish}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-semibold"
            >
              ✓ Đánh dấu đã đọc & Tăng Streak
            </Button>

            <Button
              variant="outline"
              onClick={onBack}
              className="rounded-xl font-medium"
            >
              Đọc bài báo khác
            </Button>
          </div>
        </div>
      </main>

      {/* Floating Word Inspector Popup */}
      <WordInspector
        definition={wordDef}
        isLoading={isLoadingWord}
        contextSentence={selectedContext}
        articleTitle={article.title}
        articleUrl={article.link}
        isSaved={selectedWord ? isWordSaved(selectedWord) || savedWordsState[selectedWord.toLowerCase()] : false}
        onSaveWord={handleSaveWordToStorage}
        onClose={() => {
          setSelectedWord(null);
          setWordDef(null);
        }}
      />
    </div>
  );

  // Helper to split text into words while keeping punctuation and CEFR highlight
  function renderClickableSentence(sentenceText: string, fullContext: string) {
    const tokens = sentenceText.split(/(\s+)/);

    return tokens.map((token, idx) => {
      // If whitespace, return plain
      if (/^\s+$/.test(token)) {
        return <span key={idx}>{token}</span>;
      }

      const clean = cleanWord(token);
      if (!clean) return <span key={idx}>{token}</span>;

      const curated = CURATED_VOCAB[clean];
      const cefr = curated?.cefr || detectCEFRLevel(clean);

      let highlightClass = "";
      if (settings.highlightCefr) {
        if (cefr === "C1" || cefr === "C2") {
          highlightClass = "border-b-2 border-purple-500/70 bg-purple-500/15 text-purple-700 dark:text-purple-300 font-medium";
        } else if (cefr === "B2") {
          highlightClass = "border-b-2 border-amber-500/70 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium";
        } else if (cefr === "B1") {
          highlightClass = "border-b border-blue-400/60 text-foreground";
        }
      }

      return (
        <span
          key={idx}
          onClick={(e) => {
            e.stopPropagation();
            handleWordClick(token, fullContext);
          }}
          className={`cursor-pointer rounded px-0.5 transition-colors duration-150 hover:bg-rose-500/20 hover:text-rose-600 dark:hover:text-rose-400 ${highlightClass}`}
          title={`Bấm để tra từ: ${clean} (${cefr})`}
        >
          {token}
        </span>
      );
    });
  }
}
