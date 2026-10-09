"use client";

import React, { useState, useEffect } from "react";
import { NewsItem, ArticleDetail, SavedWord, UserLearningStats } from "@/types/news";
import { Header } from "@/components/layout/Header";
import { ArticleCard } from "./ArticleCard";
import { InteractiveReader } from "@/components/reader/InteractiveReader";
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
  GraduationCap 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NewsDashboardProps {
  initialArticles: NewsItem[];
  initialChannel: string;
}

export function NewsDashboard({ initialArticles, initialChannel }: NewsDashboardProps) {
  // Navigation & Channels
  const [activeChannel, setActiveChannel] = useState(initialChannel);
  const [articles, setArticles] = useState<NewsItem[]>(initialArticles);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cefrFilter, setCefrFilter] = useState<string>("all");

  // App Settings: Dark Theme & Show Images
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Reader state
  const [currentArticle, setCurrentArticle] = useState<ArticleDetail | null>(null);
  const [isLoadingArticleDetail, setIsLoadingArticleDetail] = useState(false);

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

  // Change RSS channel
  const handleSelectChannel = async (channelId: string) => {
    setActiveChannel(channelId);
    setIsLoadingArticles(true);
    try {
      const res = await fetch(`/api/rss?channel=${channelId}`);
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

  // Open an article to read
  const handleReadArticle = async (newsItem: NewsItem) => {
    setIsLoadingArticleDetail(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const res = await fetch(`/api/article?url=${encodeURIComponent(newsItem.link)}`);
      const data = await res.json();
      if (data.success && data.article) {
        setCurrentArticle(data.article);
      } else {
        setCurrentArticle({
          id: newsItem.link,
          title: newsItem.title,
          link: newsItem.link,
          pubDate: newsItem.pubDate,
          category: newsItem.category,
          lead: newsItem.description,
          thumbnail: newsItem.thumbnail,
          paragraphs: [
            { id: "p-0", text: newsItem.description },
            { id: "p-1", text: "Vui lòng xem bài viết gốc trên VnExpress hoặc thử lại với bài báo khác." }
          ],
          wordCount: newsItem.wordCount,
          cefrLevel: newsItem.cefrLevel,
          keyVocabulary: []
        });
      }
    } catch (e) {
      console.error("Failed to fetch full article:", e);
    } finally {
      setIsLoadingArticleDetail(false);
    }
  };

  // Mark article read
  const handleMarkArticleRead = (articleId: string) => {
    markArticleRead(articleId);
    refreshData();
  };

  // Filter articles
  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCefr = cefrFilter === "all" || a.cefrLevel === cefrFilter;
    return matchesSearch && matchesCefr;
  });

  // If reading an article, show InteractiveReader
  if (currentArticle) {
    return (
      <InteractiveReader
        article={currentArticle}
        onBack={() => setCurrentArticle(null)}
        onMarkRead={handleMarkArticleRead}
        isRead={userStats.readArticleIds.includes(currentArticle.id)}
        showImages={appSettings.showImages}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      {/* Top Header */}
      <Header
        activeChannel={activeChannel}
        onSelectChannel={handleSelectChannel}
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
        {/* Hero Interactive Learning Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950 via-slate-900 to-zinc-950 text-white p-6 sm:p-10 shadow-2xl border border-white/10">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-rose-300 text-xs font-semibold border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phương Pháp Học Tiếng Anh Qua Báo Chí Tương Tác</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Đọc báo quốc tế VnExpress, <br />
              <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-rose-300 bg-clip-text text-transparent">
                làm chủ từ vựng IELTS & giao tiếp
              </span>
            </h1>

            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              Chạm vào bất kỳ từ nào để tra từ điển & nghe phát âm ngay tức thì. Lưu vào sổ từ vựng và củng cố trí nhớ với 3D Flashcards & Mini-Quiz mỗi ngày.
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

        {/* Loading Spinner for full article click */}
        {isLoadingArticleDetail && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white gap-3 animate-in fade-in">
            <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
            <p className="text-sm font-semibold">Đang tải và phân tích từ vựng bài báo...</p>
          </div>
        )}

        {/* Articles Grid */}
        {isLoadingArticles ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            <p className="text-sm">Đang nạp luồng tin RSS từ VnExpress International...</p>
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
                onReadArticle={handleReadArticle}
                isRead={userStats.readArticleIds.includes(article.id)}
                showImages={appSettings.showImages}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-xs text-muted-foreground bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-foreground">
            VnE Reader - English Learning Portal
          </p>
          <p>
            Dữ liệu tin tức cập nhật tự động từ RSS nguồn{" "}
            <a
              href="https://e.vnexpress.net"
              target="_blank"
              rel="noreferrer"
              className="text-rose-600 hover:underline"
            >
              VnExpress International
            </a>
            . Phục vụ mục đích học tập và rèn luyện kỹ năng đọc tiếng Anh.
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
