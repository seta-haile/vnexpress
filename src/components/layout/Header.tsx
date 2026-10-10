"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Flame, 
  Bookmark, 
  Sparkles, 
  HelpCircle, 
  Search, 
  SlidersHorizontal, 
  GraduationCap,
  Settings,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PUBLICATION_SOURCES } from "@/lib/rss";
import { UserLearningStats, ActiveSourceFilter } from "@/types/news";
import { UserMenu } from "@/components/auth/UserMenu";
import { getAuthSession, isAdminUser } from "@/lib/auth";
import { getLocalSiteSettings, fetchRemoteSiteSettings, DEFAULT_SITE_SETTINGS, SiteSettings } from "@/lib/siteSettings";
import { User } from "@/types/auth";

const SOURCE_TABS_CONFIG: Record<string, { label: string; activeClass: string }> = {
  vnexpress: { label: "📰 VnExpress", activeClass: "bg-[#9A1B43] text-white shadow-sm shadow-[#9A1B43]/30" },
  bbc: { label: "🇬🇧 BBC News", activeClass: "bg-red-700 text-white shadow-sm shadow-red-700/25" },
  guardian: { label: "🌐 The Guardian", activeClass: "bg-blue-800 text-white shadow-sm shadow-blue-800/25" },
  theconversation: { label: "🎓 The Conversation", activeClass: "bg-rose-800 text-white shadow-sm shadow-rose-800/25" },
  propublica: { label: "🔍 ProPublica", activeClass: "bg-amber-700 text-white shadow-sm shadow-amber-700/25" },
  wikinews: { label: "🕊️ Wikinews", activeClass: "bg-slate-700 text-white shadow-sm shadow-slate-700/25" },
  npr: { label: "🎙️ NPR Stories", activeClass: "bg-emerald-700 text-white shadow-sm shadow-emerald-700/25" },
  gutenberg: { label: "📚 Truyện Kinh Điển", activeClass: "bg-purple-700 text-white shadow-sm shadow-purple-700/25" },
  hony: { label: "🗽 Humans of NY", activeClass: "bg-amber-600 text-white shadow-sm shadow-amber-600/25" },
  globalvoices: { label: "🌍 Global Voices", activeClass: "bg-teal-700 text-white shadow-sm shadow-teal-700/25" }
};

interface HeaderProps {
  activeChannel: string;
  onSelectChannel: (channelId: string) => void;
  activeSource?: ActiveSourceFilter;
  onSelectSource?: (source: ActiveSourceFilter) => void;
  savedWordsCount: number;
  onOpenVocabulary: () => void;
  onOpenFlashcards: () => void;
  onOpenQuiz: () => void;
  userStats: UserLearningStats;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSettings: () => void;
  siteSettings?: SiteSettings;
  currentUser?: User | null;
}

export function Header({
  activeChannel,
  onSelectChannel,
  activeSource = "all",
  onSelectSource,
  savedWordsCount,
  onOpenVocabulary,
  onOpenFlashcards,
  onOpenQuiz,
  userStats,
  searchQuery,
  onSearchChange,
  onOpenSettings,
  siteSettings: initialSettings,
  currentUser: initialUser
}: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser !== undefined ? initialUser : null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSettings || DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    if (initialSettings) setSiteSettings(initialSettings);
  }, [initialSettings]);

  useEffect(() => {
    if (initialUser !== undefined) setCurrentUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    setCurrentUser(getAuthSession().user);
    if (!initialSettings) {
      setSiteSettings(getLocalSiteSettings());
    }

    // Always fetch latest settings from server to ensure accuracy
    fetchRemoteSiteSettings().then((remote) => {
      setSiteSettings(remote);
    });

    const handleAuth = () => {
      setCurrentUser(getAuthSession().user);
      fetchRemoteSiteSettings().then((remote) => setSiteSettings(remote));
    };
    const handleSettings = (e: any) => {
      setSiteSettings(e.detail || getLocalSiteSettings());
    };

    window.addEventListener("auth-changed", handleAuth);
    window.addEventListener("site-settings-changed", handleSettings);
    return () => {
      window.removeEventListener("auth-changed", handleAuth);
      window.removeEventListener("site-settings-changed", handleSettings);
    };
  }, []);

  const isUserAdmin = isAdminUser(currentUser);
  const visiblePublications = isUserAdmin
    ? PUBLICATION_SOURCES
    : PUBLICATION_SOURCES.filter((p) => siteSettings.enabledSources.includes(p.id));

  const currentPub = PUBLICATION_SOURCES.find((p) => p.id === activeSource);
  const currentChannels = currentPub?.channels || [];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-all">
      {/* Top Banner & Quick Controls */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-3">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link 
              href="/" 
              onClick={() => onSelectSource && onSelectSource("all")}
              className="flex items-center gap-2 group focus:outline-none"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="font-extrabold text-base sm:text-xl tracking-tight bg-gradient-to-r from-red-600 via-rose-600 to-slate-900 dark:to-white bg-clip-text text-transparent">
                    VnE Reader
                  </span>
                  <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 font-bold tracking-wide bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800">
                    {isUserAdmin ? "10 NGUỒN (ADMIN)" : `${visiblePublications.length} NGUỒN`}
                  </Badge>
                </div>
                <span className="text-[10px] sm:text-[11px] text-muted-foreground hidden md:inline-block font-medium">
                  {siteSettings.headerSubtitle || "Đọc báo & học tiếng Anh đa nguồn thông minh"}
                </span>
              </div>
            </Link>
          </div>

          {/* Search bar (visible on tablet and desktop, placed below on small screens) */}
          <div className="hidden sm:flex items-center flex-1 max-w-xs md:max-w-sm mx-2 sm:mx-4">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm bài báo, chủ đề..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full text-xs sm:text-sm pl-7 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 rounded-full border border-border bg-muted/40 hover:bg-muted/70 focus:bg-background focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all placeholder:text-muted-foreground/70"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-0.5"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Learning Streak */}
            <div 
              title={`${userStats.streakDays} ngày học liên tiếp`}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] sm:text-xs font-semibold flex-shrink-0"
            >
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-500 text-amber-500 animate-pulse" />
              <span>{userStats.streakDays}d<span className="hidden xs:inline"> Streak</span></span>
            </div>

            {/* Flashcard Practice */}
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenFlashcards}
              className="hidden lg:flex items-center gap-1.5 border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium text-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Flashcards</span>
            </Button>

            {/* Quick Quiz */}
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenQuiz}
              className="hidden md:flex items-center gap-1.5 border-border hover:bg-muted font-medium text-xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
              <span>Quiz</span>
            </Button>

            {/* Sổ từ vựng */}
            <Button
              variant="default"
              size="sm"
              onClick={onOpenVocabulary}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30 flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 h-8 sm:h-9 font-medium text-xs flex-shrink-0"
            >
              <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white/80" />
              <span className="hidden md:inline">Sổ Từ Vựng</span>
              <Badge className="bg-white/20 text-white hover:bg-white/30 text-[10px] sm:text-xs px-1 sm:px-1.5 py-0 h-4 sm:h-5 min-w-4 sm:min-w-5 flex items-center justify-center rounded-full ml-0.5 border-none">
                {savedWordsCount}
              </Badge>
            </Button>

            {/* Nút Cài đặt Theme & Ẩn/Hiện ảnh */}
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSettings}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full border-border/70 hover:bg-muted flex-shrink-0"
              title="Cài đặt giao diện & ẩn/hiện ảnh"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground hover:text-foreground" />
            </Button>

            {/* Tài khoản & Đăng nhập */}
            <UserMenu onOpenVocabulary={onOpenVocabulary} />
          </div>
        </div>

        {/* Mobile Search Input (full-width cleanly below header row on < sm) */}
        <div className="sm:hidden pb-2.5 pt-0.5">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm bài báo theo tiêu đề hoặc từ khóa..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full text-xs pl-8 pr-7 py-1.5 rounded-full border border-border bg-muted/40 focus:bg-background focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-0.5"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Row 1: Multi-Source Newspapers List */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto py-2 no-scrollbar border-t border-border/30 w-full max-w-full flex-nowrap scroll-smooth">
          {/* Danh sách các báo Hub */}
          <button
            onClick={() => onSelectSource && onSelectSource("all")}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              activeSource === "all"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/70 bg-transparent"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Tất cả nguồn</span>
          </button>

          {/* Dynamic Visible Publication Tabs */}
          {visiblePublications.map((pub) => {
            const conf = SOURCE_TABS_CONFIG[pub.id] || { 
              label: pub.shortName, 
              activeClass: "bg-rose-600 text-white shadow-sm shadow-rose-600/25" 
            };
            const isActive = activeSource === pub.id;
            return (
              <button
                key={pub.id}
                onClick={() => onSelectSource && onSelectSource(pub.id)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? conf.activeClass
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70 bg-transparent"
                }`}
              >
                <span>{conf.label}</span>
              </button>
            );
          })}

          {/* Quick Admin Settings Link when logged in as Admin */}
          {isUserAdmin && (
            <Link
              href="/admin/settings"
              className="flex-shrink-0 ml-auto px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 transition-colors"
              title="Quản lý cài đặt & nguồn báo (Dành riêng cho Admin)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>⚙️ Admin Settings</span>
            </Link>
          )}
        </div>

        {/* Row 2: Dedicated Sub-channels row (English sub-category titles) */}
        {currentChannels.length > 1 && (
          <div className="flex items-center space-x-2 overflow-x-auto py-2 no-scrollbar border-t border-border/20 bg-muted/20 px-2 rounded-xl mb-1 transition-all animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="text-[11px] font-bold text-muted-foreground flex-shrink-0 flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-rose-500" />
              <span>Sections:</span>
            </div>
            {currentChannels.map((ch) => {
              const isActive = activeChannel === ch.id;
              const activeBg = activeSource === "vnexpress" ? "bg-[#9A1B43]" : "bg-rose-600";
              return (
                <button
                  key={ch.id}
                  onClick={() => onSelectChannel(ch.id)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? `${activeBg} text-white shadow-sm font-bold`
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80 bg-background/80 border border-border/50"
                  }`}
                >
                  {ch.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}

