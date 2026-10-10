"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
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
  ArrowRight, 
  CheckCircle2, 
  Share2, 
  BookOpen, 
  Highlighter, 
  Sliders, 
  RotateCcw,
  Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cleanWord, CURATED_VOCAB, detectCEFRLevel } from "@/lib/dictionary";
import { getArticleSlug } from "@/lib/rss";
import { isWordSaved, saveWord, detectSourceId, ReaderSettings, getReaderSettings, saveReaderSettings, getAppSettings } from "@/lib/storage";
import { getEnglishVoices, findBestVoiceForPreset, VOICE_PRESETS, VoicePreset, playNeuralAudio, stopNeuralAudio, pauseNeuralAudio, resumeNeuralAudio } from "@/lib/voice";
import confetti from "canvas-confetti";

interface InteractiveReaderProps {
  article: ArticleDetail;
  nextArticle?: { title: string; slug: string } | null;
  onNextArticle?: () => void;
  onBack: () => void;
  onMarkRead: (articleId: string, sourceId?: string) => void;
  isRead?: boolean;
  showImages?: boolean;
}

export function InteractiveReader({
  article,
  nextArticle,
  onNextArticle,
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
  const [speakingCharIndex, setSpeakingCharIndex] = useState<number | null>(null);
  const [speechSpeed, setSpeechSpeed] = useState<number>(settings.speechRate || 1.0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicePreset, setVoicePreset] = useState<VoicePreset>(() => {
    const app = getAppSettings();
    return settings.voicePreset || app.voicePreset || "female-mature";
  });

  useEffect(() => {
    getEnglishVoices().then(setAvailableVoices);
  }, []);

  const currentSectionIndexRef = useRef<number | null>(null);
  const isFullArticleModeRef = useRef<boolean>(false);
  const isCancelledRef = useRef<boolean>(false);

  // Sections queue for sequential reading (Title -> Lead -> Paragraphs)
  const speechSections = useMemo<{ index: number; text: string }[]>(() => {
    const sections: { index: number; text: string }[] = [];
    if (article.title && article.title.trim().length > 0) {
      sections.push({ index: -2, text: article.title.trim() });
    }
    if (article.lead && article.lead.trim().length > 0) {
      sections.push({ index: -1, text: article.lead.trim() });
    }
    article.paragraphs.forEach((p, idx) => {
      if (p.text && p.text.trim().length > 0) {
        sections.push({ index: idx, text: p.text.trim() });
      }
    });
    return sections;
  }, [article.title, article.lead, article.paragraphs]);

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

  // Text-to-Speech handler with Neural AI Voice
  const playSectionByIndex = (secIdx: number) => {
    if (secIdx < 0 || secIdx >= speechSections.length) {
      handleStopTTS();
      return;
    }

    stopNeuralAudio();
    isCancelledRef.current = false;
    currentSectionIndexRef.current = secIdx;

    const section = speechSections[secIdx];
    setActiveSpeechParagraph(section.index);
    setIsPlayingAudio(true);
    setSpeakingCharIndex(null);

    // Scroll active reading section to top of viewport with smooth animation and header offset
    const elId =
      section.index === -2
        ? "article-title-section"
        : section.index === -1
        ? "article-lead-section"
        : `article-p-${section.index}`;
    const el = document.getElementById(elId);
    if (el) {
      const headerOffset = 75; // 75px offset below sticky navigation header
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth"
      });
    }

    playNeuralAudio(section.text, {
      preset: voicePreset,
      voiceKey: settings.voiceURI,
      rate: speechSpeed,
      onStart: () => {
        setIsPlayingAudio(true);
      },
      onBoundary: (charIdx) => {
        if (!isCancelledRef.current) {
          setSpeakingCharIndex(charIdx >= 0 ? charIdx : null);
        }
      },
      onEnd: () => {
        if (isCancelledRef.current) return;

        if (isFullArticleModeRef.current) {
          const nextIdx = secIdx + 1;
          if (nextIdx < speechSections.length) {
            // Pause briefly between sections for natural cadence
            setTimeout(() => {
              if (!isCancelledRef.current && isFullArticleModeRef.current) {
                playSectionByIndex(nextIdx);
              }
            }, 300);
            return;
          }
        }

        // Playback finished
        setIsPlayingAudio(false);
        setActiveSpeechParagraph(null);
        setSpeakingCharIndex(null);
        currentSectionIndexRef.current = null;
        isFullArticleModeRef.current = false;
      },
      onError: () => {
        setIsPlayingAudio(false);
        setActiveSpeechParagraph(null);
        setSpeakingCharIndex(null);
        currentSectionIndexRef.current = null;
        isFullArticleModeRef.current = false;
      }
    });
  };

  const handleStartFullTTS = () => {
    if (isPlayingAudio) {
      handleStopTTS();
      return;
    }
    if (speechSections.length === 0) return;

    isCancelledRef.current = false;
    isFullArticleModeRef.current = true;
    playSectionByIndex(0);
  };

  const handlePlayParagraphTTS = (paragraphIndex: number, text: string) => {
    if (isPlayingAudio && activeSpeechParagraph === paragraphIndex) {
      handleStopTTS();
      return;
    }

    isCancelledRef.current = false;
    isFullArticleModeRef.current = false;

    const secIdx = speechSections.findIndex((s) => s.index === paragraphIndex);
    if (secIdx !== -1) {
      playSectionByIndex(secIdx);
    } else {
      stopNeuralAudio();
      setSpeakingCharIndex(null);

      const el = document.getElementById(`article-p-${paragraphIndex}`);
      if (el) {
        const headerOffset = 75;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: "smooth"
        });
      }

      playNeuralAudio(text, {
        preset: voicePreset,
        voiceKey: settings.voiceURI,
        rate: speechSpeed,
        onBoundary: (charIdx) => {
          if (!isCancelledRef.current) {
            setSpeakingCharIndex(charIdx >= 0 ? charIdx : null);
          }
        },
        onEnd: () => {
          setIsPlayingAudio(false);
          setActiveSpeechParagraph(null);
          setSpeakingCharIndex(null);
        }
      });
    }
  };

  const handleStopTTS = () => {
    isCancelledRef.current = true;
    isFullArticleModeRef.current = false;
    currentSectionIndexRef.current = null;
    stopNeuralAudio();
    setIsPlayingAudio(false);
    setActiveSpeechParagraph(null);
    setSpeakingCharIndex(null);
  };

  const handleSpeedToggle = () => {
    const nextSpeed = speechSpeed === 1.0 ? 1.25 : speechSpeed === 1.25 ? 0.8 : 1.0;
    setSpeechSpeed(nextSpeed);
    updateSetting("speechRate", nextSpeed);
    if (isPlayingAudio && currentSectionIndexRef.current !== null) {
      const curIdx = currentSectionIndexRef.current;
      playSectionByIndex(curIdx);
    }
  };

  const handleCycleVoice = () => {
    const currentIdx = VOICE_PRESETS.findIndex((v) => v.id === voicePreset);
    const nextIdx = (currentIdx + 1) % VOICE_PRESETS.length;
    const nextPreset = VOICE_PRESETS[nextIdx].id;
    setVoicePreset(nextPreset);
    updateSetting("voicePreset", nextPreset);

    if (isPlayingAudio && currentSectionIndexRef.current !== null) {
      const curIdx = currentSectionIndexRef.current;
      playSectionByIndex(curIdx);
    }
  };

  const handleSaveWordToStorage = (wordData: Omit<SavedWord, "id" | "savedAt" | "mastery">) => {
    const sId = (wordData as any).sourceId || (article as any).sourceId || detectSourceId(article.id, article.link);
    saveWord({ ...wordData, sourceId: sId });
    setSavedWordsState(prev => ({ ...prev, [wordData.word.toLowerCase()]: true }));
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.85 } });
  };

  const handleCelebrationFinish = () => {
    setHasFinished(true);
    const sId = (article as any).sourceId || detectSourceId(article.id, article.link);
    onMarkRead(article.id, sId);
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
      className={`min-h-screen w-full max-w-full overflow-x-hidden ${themeClasses} transition-colors duration-200 select-text`}
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
        <div className="max-w-4xl mx-auto px-2 sm:px-4 h-14 flex items-center justify-between gap-1 sm:gap-2">
          {/* Back & Next Article buttons & Dictation */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 px-2 sm:px-2.5 flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              title="Quay lại danh sách bài báo"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">Quay lại</span>
            </Button>

            {/* Nút Luyện nghe điền từ */}
            <Link href={`/dictation/${getArticleSlug(article.link)}`}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 sm:px-2.5 flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-300/40 transition-all rounded-full"
                title="Luyện nghe chép chính tả điền từ theo từng đoạn"
              >
                <Headphones className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Luyện nghe</span>
              </Button>
            </Link>

            {onNextArticle && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNextArticle}
                className="h-8 px-2 sm:px-2.5 flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border-rose-300/40 transition-all"
                title={nextArticle?.title ? `Bài kế tiếp: ${nextArticle.title}` : "Chuyển sang bài báo tiếp theo"}
              >
                <span className="hidden sm:inline">Bài tiếp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Center: TTS Audio player controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-muted/60 p-1 rounded-full border border-border/50 shrink-0">
            <Button
              size="sm"
              variant={isPlayingAudio ? "default" : "ghost"}
              onClick={handleStartFullTTS}
              className={`h-7 px-2.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                isPlayingAudio ? "bg-rose-600 text-white hover:bg-rose-700 shadow-sm" : ""
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Dừng</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-rose-600" />
                  <span>Nghe</span>
                </>
              )}
            </Button>

            {/* Speed toggle */}
            <button
              onClick={handleSpeedToggle}
              className="text-[11px] font-bold px-1.5 py-0.5 rounded-full hover:bg-background/80 text-muted-foreground transition-colors"
              title="Tốc độ đọc"
            >
              {speechSpeed}x
            </button>

            {/* Quick Voice cycle button */}
            {(() => {
              const currentVoiceObj = VOICE_PRESETS.find((v) => v.id === voicePreset) || VOICE_PRESETS[0];
              return (
                <button
                  onClick={handleCycleVoice}
                  className="text-xs px-1.5 sm:px-2 py-0.5 rounded-full hover:bg-background/80 text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors border border-border/40"
                  title={`Đổi giọng đọc AI (Hiện tại: ${currentVoiceObj.title} - ${currentVoiceObj.badge})`}
                >
                  <span>{currentVoiceObj.icon}</span>
                  <span className="hidden md:inline font-semibold text-[11px]">{currentVoiceObj.title}</span>
                </button>
              );
            })()}
          </div>

          {/* Right: Reading Appearance Settings */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            {/* Font Family Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("fontFamily", settings.fontFamily === "serif" ? "sans" : "serif")}
              className="h-8 w-7 sm:w-8 p-0 text-xs font-bold"
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
              className="h-8 w-7 sm:w-8 p-0"
              title="Cỡ chữ"
            >
              <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
              className="h-8 w-7 sm:w-8 p-0 text-sm"
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
              className="h-8 w-7 sm:w-8 p-0"
              title={settings.highlightCefr ? "Tắt highlight từ vựng" : "Bật highlight từ vựng theo CEFR"}
            >
              <Highlighter className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${settings.highlightCefr ? "text-rose-600" : ""}`} />
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

          <h1 id="article-title-section" className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-foreground">
            {renderClickableSentence(article.title, article.title, -2)}
          </h1>

          {/* Lead Paragraph */}
          {article.lead && (
            <div
              id="article-lead-section"
              className={`group relative p-4 rounded-2xl border border-border/50 transition-all ${
                isPlayingAudio && activeSpeechParagraph === -1
                  ? "bg-rose-500/10 ring-2 ring-rose-500/30 shadow-sm"
                  : "bg-muted/40"
              }`}
            >
              <div className="text-base sm:text-lg font-medium leading-relaxed italic text-foreground/90">
                {renderClickableSentence(article.lead, article.lead, -1)}
              </div>
              <div className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground opacity-70 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handlePlayParagraphTTS(-1, article.lead)}
                  className="flex items-center gap-1 hover:text-rose-600 px-2 py-1 rounded-md hover:bg-muted/60 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPlayingAudio && activeSpeechParagraph === -1 ? "Dừng nghe" : "Nghe tóm tắt này"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Banner Luyện Nghe Điền Từ (Dictation Practice CTA) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/5 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    Luyện nghe chép chính tả bài này
                  </span>
                  <Badge className="bg-amber-500 text-white text-[9px] px-1.5 py-0 font-bold border-none">
                    MỚI
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Chia bài báo thành các đoạn ngắn ~20 từ và điền từ còn thiếu
                </p>
              </div>
            </div>

            <Link href={`/dictation/${getArticleSlug(article.link)}`} className="shrink-0">
              <Button
                size="sm"
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-full shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 px-3.5 py-1.5"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Bắt đầu luyện nghe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

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
            const isPlayingThis = isPlayingAudio && activeSpeechParagraph === pIdx;
            const isTranslated = showTranslations[p.id];
            const translatedText = translatedParagraphs[p.id];
            const isLoadingTrans = loadingTranslations[p.id];

            return (
              <div 
                id={`article-p-${pIdx}`}
                key={p.id}
                className={`group relative p-3 sm:p-4 rounded-2xl transition-all ${
                  isPlayingThis ? "bg-rose-500/10 ring-2 ring-rose-500/30 shadow-sm" : "hover:bg-muted/30"
                }`}
              >
                {/* Paragraph Text with clickable words */}
                <p className="leading-relaxed text-foreground">
                  {renderClickableSentence(p.text, p.text, pIdx)}
                </p>

                {/* Paragraph Toolbar on hover */}
                <div className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground opacity-70 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handlePlayParagraphTTS(pIdx, p.text)}
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

          <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
            <Button
              onClick={handleCelebrationFinish}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-semibold"
            >
              ✓ Đánh dấu đã đọc & Tăng Streak
            </Button>

            {onNextArticle && (
              <Button
                onClick={onNextArticle}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md font-semibold flex items-center gap-1.5"
              >
                <span>Bài tiếp theo</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}

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

  // Helper to split text into words while keeping punctuation, CEFR highlight & real-time TTS karaoke bolding
  function renderClickableSentence(sentenceText: string, fullContext: string, paragraphIdx: number) {
    const regex = /\S+|\s+/g;
    const tokens: { text: string; start: number; end: number; isSpace: boolean }[] = [];
    let match;
    while ((match = regex.exec(sentenceText)) !== null) {
      tokens.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
        isSpace: /^\s+$/.test(match[0])
      });
    }

    const isThisSectionSpeaking = isPlayingAudio && activeSpeechParagraph === paragraphIdx;

    return tokens.map((tokenObj, idx) => {
      if (tokenObj.isSpace) {
        return <span key={idx}>{tokenObj.text}</span>;
      }

      const { text: token, start, end } = tokenObj;
      const clean = cleanWord(token);
      const curated = clean ? CURATED_VOCAB[clean] : undefined;
      const cefr = clean ? (curated?.cefr || detectCEFRLevel(clean)) : null;

      // Real-time Karaoke word-by-word tracking via Web Speech API charIndex
      const isCurrentlySpoken =
        isThisSectionSpeaking &&
        speakingCharIndex !== null &&
        speakingCharIndex >= start &&
        speakingCharIndex < end;

      let highlightClass = "";
      if (isCurrentlySpoken) {
        // High visibility glowing karaoke highlight (stands out in both light & dark mode)
        highlightClass =
          "bg-amber-400 text-zinc-950 dark:bg-amber-400 dark:text-zinc-950 font-black px-1.5 py-0.5 rounded shadow scale-105 inline-block ring-2 ring-amber-500/70 z-10 transition-transform duration-75";
      } else if (settings.highlightCefr && cefr) {
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
            if (clean) {
              handleWordClick(token, fullContext);
            }
          }}
          className={`${clean ? "cursor-pointer hover:bg-rose-500/20 hover:text-rose-600 dark:hover:text-rose-400" : ""} rounded px-0.5 transition-colors duration-100 ${highlightClass}`}
          title={clean ? `Bấm để tra từ: ${clean}${cefr ? ` (${cefr})` : ""}` : undefined}
        >
          {token}
        </span>
      );
    });
  }
}
