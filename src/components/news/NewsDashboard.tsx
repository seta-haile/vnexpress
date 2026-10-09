"use client";

import React, { useState, useEffect } from "react";
import { NewsItem, ArticleDetail, SavedWord, UserLearningStats } from "@/types/news";
import { Header } from "@/components/layout/Header";
import { ArticleCard } from "./ArticleCard";
import { VocabularyDrawer } from "@/components/vocabulary/VocabularyDrawer";
import { FlashcardModal } from "@/components/vocabulary/FlashcardModal";
import { QuickQuizModal } from "@/components/vocabulary/QuickQuizModal";
import { SettingsModal } from "@/components/layout/SettingsModal";
import { 
  getSavedWords, 
  getUserStats, 
  markArticleRead, 
  getAppSettings,
  saveAppSettings,
  AppSettings,
  DEFAULT_APP_SETTINGS
} from "@/lib/storage";
import { 
  Sparkles, 
  Flame, 
  BookOpen, 
  Bookmark, 
  CheckCircle, 
  Filter, 
  Loader2, 
  Compass, 
  TrendingUp, 
  GraduationCap,
  ArrowLeft,
  Newspaper
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicationsDirectory } from "./PublicationsDirectory";

interface NewsDashboardProps {
  initialArticles: NewsItem[];
  initialChannel: string;
  initialSource?: "all" | "vnexpress" | "hony";
  allLatestArticles?: NewsItem[];
}

export function NewsDashboard({ 
  initialArticles, 
  initialChannel,
  initialSource = "all",
  allLatestArticles = []
}: NewsDashboardProps) {
  // Navigation & Channels
  const [activeSource, setActiveSource] = useState<"all" | "vnexpress" | "hony">(initialSource);
  const [activeChannel, setActiveChannel] = useState(initialChannel);
  const [articles, setArticles] = useState<NewsItem[]>(initialArticles);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cefrFilter, setCefrFilter] = useState<string>("all");

  // App Settings: Dark Theme & Show Images
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Vocabulary & Modal states
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [userStats, setUserStats] = useState<UserLearningStats>({
    articlesRead: 0,
    wordsLearned: 0,
    streakDays: 1,
    lastActiveDate: "",
    dailyGoal: 5,
    readArticleIds: []
  });
  const [isVocabOpen, setIsVocabOpen] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Load local storage on mount
  useEffect(() => {
    refreshData();
    const loadedSettings = getAppSettings();
    setAppSettings(loadedSettings);
    applyTheme(loadedSettings.theme);
  }, []);

  const applyTheme = (theme: "light" | "dark") => {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const handleUpdateSettings = (newVal: Partial<AppSettings>) => {
    const updated = saveAppSettings(newVal);
    setAppSettings(updated);
    if (newVal.theme) {
      applyTheme(newVal.theme);
    }
  };

  const refreshData = () => {
    setSavedWords(getSavedWords());
    setUserStats(getUserStats());
  };

  // Switch between Newspaper sources: "all" (directory), "vnexpress", "hony"
  const handleSelectSource = async (source: "all" | "vnexpress" | "hony") => {
    setActiveSource(source);
    if (source === "all") {
      return;
    }

    const channelId = source === "hony" ? "hony-all" : "home";
    setActiveChannel(channelId);
    setIsLoadingArticles(true);
    try {
      const res = await fetch(`/api/rss?source=${source}&channel=${channelId}`);
      const data = await res.json();
      if (data.success && data.items) {
        setArticles(data.items);
      }
    } catch (e) {
      console.error("Failed to load channel RSS:", e);
    } finally {
      setIsLoadingArticles(false);
    }
  };

  // Change RSS channel within selected newspaper
  const handleSelectChannel = async (channelId: string) => {
    setActiveChannel(channelId);
    setIsLoadingArticles(true);
    const sourceParam = activeSource === "hony" ? "hony" : "vnexpress";
    try {
      const res = await fetch(`/api/rss?source=${sourceParam}&channel=${channelId}`);
      const data = await res.json();
      if (data.success && data.items) {
        setArticles(data.items);
      }
    } catch (e) {
      console.error("Failed to load channel RSS:", e);
    } finally {
      setIsLoadingArticles(false);
    }
  };

  // Filter articles
  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCefr = cefrFilter === "all" || a.cefrLevel === cefrFilter;
    return matchesSearch && matchesCefr;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      {/* Top Header */}
      <Header
        activeChannel={activeChannel}
        onSelectChannel={handleSelectChannel}
        activeSource={activeSource}
        onSelectSource={handleSelectSource}
        savedWordsCount={savedWords.length}
        onOpenVocabulary={() => setIsVocabOpen(true)}
        onOpenFlashcards={() => setIsFlashcardsOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        userStats={userStats}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {activeSource === "all" ? (
          /* Newspaper List / Publications Directory Screen */
          <PublicationsDirectory
            onSelectSource={handleSelectSource}
            latestArticles={allLatestArticles.length > 0 ? allLatestArticles : articles}
            isArticleRead={(id) => userStats.readArticleIds.includes(id)}
          />
        ) : (
          /* Individual Newspaper Feed View */
          <>
            {/* Top Source Breadcrumb & Switcher Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveSource("all")}
                  className="rounded-xl font-bold text-xs flex items-center gap-1.5 border-border hover:bg-muted"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Danh sách các báo</span>
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-foreground flex items-center gap-1.5">
                    {activeSource === "vnexpress" ? (
                      <>
                        <span className="text-rose-600">📰</span> VnExpress International
                      </>
                    ) : (
                      <>
                        <span className="text-amber-500">🗽</span> Humans of New York
                      </>
                    )}
                  </span>
                  <Badge variant="secondary" className="text-[11px] font-semibold hidden sm:inline-flex">
                    {activeSource === "vnexpress" ? "Thời sự & Học thuật" : "Chuyện đời thực & Chân dung"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeSource === "vnexpress" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectSource("hony")}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-medium"
                  >
                    Chuyển sang Humans of NY ➔
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectSource("vnexpress")}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-medium"
                  >
                    Chuyển sang VnExpress ➔
                  </Button>
                )}
              </div>
            </div>
        {/* Hero Interactive Learning Banner */}
        <section className={`relative overflow-hidden rounded-3xl p-6 sm:p-10 shadow-2xl border text-white ${
          activeSource === "hony"
            ? "bg-gradient-to-br from-amber-950 via-stone-900 to-zinc-950 border-amber-500/20"
            : "bg-gradient-to-br from-rose-950 via-slate-900 to-zinc-950 border-white/10"
        }`}>
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-rose-300 text-xs font-semibold border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {activeSource === "hony" 
                  ? "Kể Chuyện Đời Thực • Ngôn Ngữ Tự Nhiên Bản Xứ" 
                  : "Phương Pháp Học Tiếng Anh Qua Báo Chí Tương Tác"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {activeSource === "hony" ? (
                <>
                  Humans of New York, <br />
                  <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent">
                    học tiếng Anh qua chuyện đời thực
                  </span>
                </>
              ) : (
                <>
                  Đọc báo quốc tế VnExpress, <br />
                  <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-rose-300 bg-clip-text text-transparent">
                    làm chủ từ vựng IELTS & giao tiếp
                  </span>
                </>
              )}
            </h1>

            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              {activeSource === "hony"
                ? "Luyện đọc những lát cắt cuộc đời sâu sắc từ New York. Chạm vào bất kỳ từ nào để tra nghĩa, nghe phát âm với AI và đồng bộ tiến độ học tập."
                : "Chạm vào bất kỳ từ nào để tra từ điển & nghe phát âm ngay tức thì. Lưu vào sổ từ vựng và củng cố trí nhớ với 3D Flashcards & Mini-Quiz mỗi ngày."}
            </p>

            {/* Quick Stats Grid */}
            <div className="pt-2 grid grid-cols-3 gap-3 max-w-md">
              <div className="bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/10 text-center">
                <div className="text-xl sm:text-2xl font-black text-white">
                  {userStats.articlesRead}
                </div>
                <div className="text-[11px] text-zinc-400">Bài đã đọc</div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/10 text-center">
                <div className="text-xl sm:text-2xl font-black text-rose-400">
                  {savedWords.length}
                </div>
                <div className="text-[11px] text-zinc-400">Từ vựng đã lưu</div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/10 text-center">
                <div className="text-xl sm:text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-current text-amber-400" />
                  {userStats.streakDays}d
                </div>
                <div className="text-[11px] text-zinc-400">Ngày học liên tiếp</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Toolbar: CEFR levels & Article Counts */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">Lọc theo độ khó (CEFR):</span>
            
            <div className="flex items-center gap-1.5 flex-wrap">
              {(["all", "A2", "B1", "B2", "C1"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setCefrFilter(level)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    cefrFilter === level
                      ? "bg-foreground text-background shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {level === "all" ? "Tất cả" : `Cấp ${level}`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
            {!appSettings.showImages && (
              <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                🚫 Đang ẩn hình ảnh
              </span>
            )}
            <span>
              Hiển thị <strong>{filteredArticles.length}</strong> bài báo
            </span>
          </div>
        </section>

        {/* Articles Grid */}
        {isLoadingArticles ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            <p className="text-sm">
              {activeSource === "hony" 
                ? "Đang nạp câu chuyện từ Humans of New York..." 
                : "Đang nạp luồng tin RSS từ VnExpress International..."}
            </p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20 space-y-3 text-muted-foreground">
            <Compass className="w-12 h-12 mx-auto opacity-40" />
            <h4 className="text-base font-bold text-foreground">Không tìm thấy bài báo nào</h4>
            <p className="text-xs">Hãy thử đổi từ khóa tìm kiếm hoặc chọn cấp độ CEFR khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                isRead={userStats.readArticleIds.includes(article.id)}
                showImages={appSettings.showImages}
              />
            ))}
          </div>
        )}
        </>
      )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-xs text-muted-foreground bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-foreground">
            VnE Reader - Nền tảng luyện đọc tiếng Anh đa nguồn
          </p>
          <p>
            Dữ liệu được cập nhật tự động từ RSS của{" "}
            <a
              href="https://e.vnexpress.net"
              target="_blank"
              rel="noreferrer"
              className="text-rose-600 hover:underline font-medium"
            >
              VnExpress International
            </a>{" "}
            và{" "}
            <a
              href="https://humansofnyarchive.com"
              target="_blank"
              rel="noreferrer"
              className="text-amber-600 hover:underline font-medium"
            >
              Humans of New York
            </a>
            . Phục vụ mục đích học tập và trau dồi tiếng Anh.
          </p>
        </div>
      </footer>

      {/* Slide-out Vocabulary Drawer */}
      <VocabularyDrawer
        isOpen={isVocabOpen}
        onClose={() => setIsVocabOpen(false)}
        savedWords={savedWords}
        onWordsChange={refreshData}
        onStartFlashcards={() => {
          setIsVocabOpen(false);
          setIsFlashcardsOpen(true);
        }}
        onStartQuiz={() => {
          setIsVocabOpen(false);
          setIsQuizOpen(true);
        }}
      />

      {/* Flashcard Practice Modal */}
      <FlashcardModal
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
        words={savedWords}
        onWordsUpdated={refreshData}
      />

      {/* Quick Quiz Modal */}
      <QuickQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        savedWords={savedWords}
      />

      {/* Settings Modal (Theme Dark/Light & Show/Hide Images) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={appSettings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
