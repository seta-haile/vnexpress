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
  detectSourceId,
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

import { PUBLICATION_SOURCES } from "@/lib/rss";
import { ActiveSourceFilter } from "@/types/news";
import { getAuthSession, isAdminUser } from "@/lib/auth";
import { getLocalSiteSettings, fetchRemoteSiteSettings, DEFAULT_SITE_SETTINGS, SiteSettings } from "@/lib/siteSettings";
import { User } from "@/types/auth";
import { trackUserEvent } from "@/lib/trackerClient";

interface NewsDashboardProps {
  initialArticles: NewsItem[];
  initialChannel: string;
  initialSource?: ActiveSourceFilter;
  allLatestArticles?: NewsItem[];
  initialSiteSettings?: SiteSettings;
}

export function NewsDashboard({ 
  initialArticles, 
  initialChannel,
  initialSource = "all",
  allLatestArticles = [],
  initialSiteSettings
}: NewsDashboardProps) {
  // Navigation & Channels
  const [activeSource, setActiveSource] = useState<ActiveSourceFilter>(initialSource);
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

  // Auth and Site Settings for publication visibility
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSiteSettings || DEFAULT_SITE_SETTINGS);

  // Load local storage on mount
  useEffect(() => {
    refreshData();
    const loadedSettings = getAppSettings();
    setAppSettings(loadedSettings);
    applyTheme(loadedSettings.theme);

    setCurrentUser(getAuthSession().user);
    const local = getLocalSiteSettings();
    if (local) setSiteSettings(local);

    // Always fetch latest settings directly from PostgreSQL / server
    fetchRemoteSiteSettings().then((remote) => {
      if (remote) setSiteSettings(remote);
    });

    const handleAuth = () => {
      setCurrentUser(getAuthSession().user);
      fetchRemoteSiteSettings().then((remote) => {
        if (remote) setSiteSettings(remote);
      });
    };
    const handleSiteSettings = (e: any) => {
      setSiteSettings(e.detail || getLocalSiteSettings());
    };

    window.addEventListener("auth-changed", handleAuth);
    window.addEventListener("site-settings-changed", handleSiteSettings);
    return () => {
      window.removeEventListener("auth-changed", handleAuth);
      window.removeEventListener("site-settings-changed", handleSiteSettings);
    };
  }, []);

  const isUserAdmin = isAdminUser(currentUser);

  // If active source is disabled in siteSettings, auto fallback to 'all'
  useEffect(() => {
    if (activeSource !== "all" && !siteSettings.enabledSources.includes(activeSource)) {
      setActiveSource("all");
    }
  }, [siteSettings.enabledSources, activeSource]);

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

  // Switch between Newspaper sources: "all" (directory) and 9 publication sources
  const handleSelectSource = async (source: ActiveSourceFilter, updateUrl: boolean = true) => {
    setActiveSource(source);
    trackUserEvent({
      actionType: source === "all" ? "PAGE_VIEW" : "VIEW_SOURCE",
      sourceId: source === "all" ? null : source
    });

    if (updateUrl && typeof window !== "undefined") {
      const newPath = source === "all" ? "/" : `/${source}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState(null, "", newPath);
      }
    }
    if (source === "all") {
      return;
    }

    let channelId = "home";
    if (source === "hony") channelId = "hony-all";
    else if (source === "bbc") channelId = "bbc-world";
    else if (source === "guardian") channelId = "guardian-world";
    else if (source === "npr") channelId = "npr-all";
    else if (source === "theconversation") channelId = "theconversation-all";
    else if (source === "propublica") channelId = "propublica-all";
    else if (source === "wikinews") channelId = "wikinews-all";
    else if (source === "gutenberg") channelId = "gutenberg-all";
    else if (source === "globalvoices") channelId = "globalvoices-all";

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

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, "").split("/")[0];
      if (!path || path === "") {
        handleSelectSource("all", false);
      } else if (PUBLICATION_SOURCES.some((p) => p.id === path)) {
        handleSelectSource(path as any, false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Change RSS channel within selected newspaper
  const handleSelectChannel = async (channelId: string) => {
    setActiveChannel(channelId);
    trackUserEvent({
      actionType: "VIEW_CHANNEL",
      sourceId: activeSource === "all" ? "vnexpress" : activeSource,
      channelId
    });

    setIsLoadingArticles(true);
    const sourceParam = activeSource === "all" ? "vnexpress" : activeSource;
    try {
      const res = await fetch(`/api/rss?source=${sourceParam}&channel=${channelId}&_t=${Date.now()}`, {
        cache: "no-store"
      });
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

  // Filter articles by search query & CEFR difficulty
  const filteredArticles = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return articles.filter((a) => {
      const matchesSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        (a.category && a.category.toLowerCase().includes(q)) ||
        (a.sourceName && a.sourceName.toLowerCase().includes(q));
      const matchesCefr = cefrFilter === "all" || a.cefrLevel === cefrFilter;
      return matchesSearch && matchesCefr;
    });
  }, [articles, searchQuery, cefrFilter]);

  // Source-specific learning stats: tính riêng số bài đã đọc, từ vựng đã lưu và ngày đọc liên tiếp của từng tờ báo
  const sourceStats = React.useMemo(() => {
    if (activeSource === "all") {
      return {
        articlesRead: userStats.articlesRead,
        wordsSaved: savedWords.length,
        streakDays: userStats.streakDays
      };
    }

    // 1. Số bài đã đọc của riêng tờ báo này
    const readIdsForSource = userStats.readArticleIds.filter((id) => {
      const art = articles.find((a) => a.id === id) || allLatestArticles.find((a) => a.id === id);
      if (art && art.sourceId) {
        return art.sourceId === activeSource;
      }
      return detectSourceId(id) === activeSource;
    });

    const perSourceStat = userStats.perSource?.[activeSource];
    const articlesReadCount = Math.max(
      readIdsForSource.length,
      perSourceStat?.articlesRead || 0
    );

    // 2. Số từ vựng đã lưu của riêng tờ báo này
    const wordsSavedCount = savedWords.filter((w) => {
      if (w.sourceId) return w.sourceId === activeSource;
      return detectSourceId(undefined, w.articleUrl) === activeSource;
    }).length;

    // 3. Số ngày học liên tiếp của riêng tờ báo này
    let streak = 0;
    if (perSourceStat?.streakDays) {
      streak = perSourceStat.streakDays;
    } else if (articlesReadCount > 0 || wordsSavedCount > 0) {
      streak = userStats.streakDays || 1;
    }

    return {
      articlesRead: articlesReadCount,
      wordsSaved: wordsSavedCount,
      streakDays: streak
    };
  }, [activeSource, userStats, savedWords, articles, allLatestArticles]);

  const currentPublication = PUBLICATION_SOURCES.find((s) => s.id === activeSource);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col w-full max-w-full overflow-x-hidden transition-colors duration-200">
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
        siteSettings={siteSettings}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 w-full max-w-full overflow-x-hidden space-y-6 sm:space-y-8">
        {activeSource === "all" ? (
          /* Newspaper List / Publications Directory Screen */
          <PublicationsDirectory
            onSelectSource={handleSelectSource}
            searchQuery={searchQuery}
            latestArticles={
              (allLatestArticles.length > 0 ? allLatestArticles : articles).filter(
                (a) => !a.sourceId || siteSettings.enabledSources.includes(a.sourceId as any)
              )
            }
            isArticleRead={(id) => userStats.readArticleIds.includes(id)}
            settings={siteSettings}
            currentUser={currentUser}
          />
        ) : (
          /* Individual Newspaper Feed View */
          <>
            {/* Compact & Streamlined Hero Interactive Learning Banner */}
            <section className={`relative overflow-hidden rounded-2xl p-3.5 sm:p-5 shadow-lg border text-white bg-gradient-to-r ${
              currentPublication?.gradient || "from-slate-900 via-zinc-900 to-black"
            } border-white/10`}>
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                {/* Left Info */}
                <div className="space-y-1 sm:space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-semibold border border-white/10">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>{currentPublication?.readingStyle || "Luyện đọc tiếng Anh chuẩn báo chí"}</span>
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-white/75 font-medium">
                      • CEFR {currentPublication?.cefrRange || "B1 - C1"}
                    </span>
                  </div>

                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-snug">
                    {currentPublication?.name}{" "}
                    <span className="font-normal opacity-90 text-xs sm:text-sm text-zinc-100 block sm:inline">
                      — {currentPublication?.tagline}
                    </span>
                  </h1>

                  <p className="text-zinc-200/90 text-xs leading-relaxed max-w-xl line-clamp-2">
                    {currentPublication?.description}
                  </p>
                </div>

                {/* Right Stats Grid */}
                <div className="grid grid-cols-3 gap-2 w-full md:w-auto md:flex md:items-center flex-shrink-0">
                  <div className="bg-white/10 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/15 text-center min-w-0 md:min-w-[76px]">
                    <div className="text-sm sm:text-lg font-black text-white leading-tight">
                      {sourceStats.articlesRead}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-zinc-300 font-medium">Đã đọc</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/15 text-center min-w-0 md:min-w-[76px]">
                    <div className="text-sm sm:text-lg font-black text-rose-200 leading-tight">
                      {sourceStats.wordsSaved}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-zinc-300 font-medium">Từ vựng</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/15 text-center min-w-0 md:min-w-[76px]">
                    <div className="text-sm sm:text-lg font-black text-amber-300 leading-tight flex items-center justify-center gap-0.5">
                      <Flame className="w-3.5 h-3.5 fill-current text-amber-300" />
                      {sourceStats.streakDays}d
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-zinc-300 font-medium">Chuỗi ngày</div>
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
