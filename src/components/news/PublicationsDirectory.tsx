"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { PublicationSource, NewsItem, ActiveSourceFilter } from "@/types/news";
import { PUBLICATION_SOURCES } from "@/lib/rss";
import { ArticleCard } from "./ArticleCard";
import { 
  Newspaper, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  GraduationCap, 
  Heart, 
  Globe2, 
  CheckCircle2, 
  TrendingUp, 
  Compass, 
  Users,
  ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAuthSession, isAdminUser } from "@/lib/auth";
import { getLocalSiteSettings, fetchRemoteSiteSettings, DEFAULT_SITE_SETTINGS, SiteSettings } from "@/lib/siteSettings";
import { User } from "@/types/auth";

interface PublicationsDirectoryProps {
  onSelectSource: (sourceId: ActiveSourceFilter) => void;
  latestArticles: NewsItem[];
  searchQuery?: string;
  onOpenArticle?: (article: NewsItem) => void;
  isArticleRead?: (id: string) => boolean;
  settings?: SiteSettings;
  currentUser?: User | null;
}

export function PublicationsDirectory({
  onSelectSource,
  latestArticles,
  searchQuery = "",
  onOpenArticle,
  isArticleRead,
  settings: initialSettings,
  currentUser: initialUser
}: PublicationsDirectoryProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser !== undefined ? initialUser : null);
  const [settings, setSettings] = useState<SiteSettings>(initialSettings || DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    if (initialSettings) setSettings(initialSettings);
  }, [initialSettings]);

  useEffect(() => {
    if (initialUser !== undefined) setCurrentUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    setCurrentUser(getAuthSession().user);
    if (!initialSettings) {
      setSettings(getLocalSiteSettings());
    }

    // Always fetch latest settings from server to ensure accuracy
    fetchRemoteSiteSettings().then((remote) => {
      setSettings(remote);
    });

    const handleAuth = () => {
      setCurrentUser(getAuthSession().user);
      fetchRemoteSiteSettings().then((remote) => setSettings(remote));
    };
    const handleSettings = (e: any) => setSettings(e.detail || getLocalSiteSettings());

    window.addEventListener("auth-changed", handleAuth);
    window.addEventListener("site-settings-changed", handleSettings);
    return () => {
      window.removeEventListener("auth-changed", handleAuth);
      window.removeEventListener("site-settings-changed", handleSettings);
    };
  }, []);

  const isUserAdmin = isAdminUser(currentUser);
  const displaySources = isUserAdmin 
    ? PUBLICATION_SOURCES 
    : PUBLICATION_SOURCES.filter((s) => settings.enabledSources.includes(s.id));

  const cleanQuery = (searchQuery || "").toLowerCase().trim();

  const filteredSources = React.useMemo(() => {
    if (!cleanQuery) return displaySources;
    return displaySources.filter(
      (s) =>
        s.name.toLowerCase().includes(cleanQuery) ||
        s.shortName.toLowerCase().includes(cleanQuery) ||
        s.tagline.toLowerCase().includes(cleanQuery) ||
        s.description.toLowerCase().includes(cleanQuery)
    );
  }, [displaySources, cleanQuery]);

  const filteredLatestArticles = React.useMemo(() => {
    if (!cleanQuery) return latestArticles;
    return latestArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(cleanQuery) ||
        a.description.toLowerCase().includes(cleanQuery) ||
        (a.category && a.category.toLowerCase().includes(cleanQuery)) ||
        (a.sourceName && a.sourceName.toLowerCase().includes(cleanQuery))
    );
  }, [latestArticles, cleanQuery]);

  return (
    <div className="space-y-6 sm:space-y-10 py-1 sm:py-2 animate-in fade-in duration-300 w-full max-w-full overflow-x-hidden">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-purple-500/10 border border-rose-500/20 p-4 sm:p-8 md:p-10 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25 text-[10px] sm:text-xs font-bold tracking-wide">
            <Compass className="w-3.5 h-3.5" />
            <span>NỀN TẢNG ĐỌC BÁO TIẾNG ANH ĐA NGUỒN</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.2]">
            Học tiếng Anh qua <span className="bg-gradient-to-r from-rose-600 via-amber-500 to-rose-500 bg-clip-text text-transparent">nhiều nguồn báo chất lượng</span>
          </h1>

          <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
            Nền tảng đọc tiếng Anh đa nguồn toàn diện: từ thời sự quốc tế chính luận (VnExpress, BBC, The Guardian), phân tích học thuật hàn lâm (The Conversation), phóng sự điều tra đoạt giải Pulitzer (ProPublica), tin tức mở trung lập (Wikinews), podcast & đời sống Hoa Kỳ (NPR), văn hóa & nhân quyền toàn cầu (Global Voices), kiệt tác truyện ngắn kinh điển (Project Gutenberg), đến hơn 8.200 câu chuyện chân dung đời thực (Humans of NY).
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-1 sm:pt-2">
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-background/80 backdrop-blur-sm border border-border/60">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium block">Nguồn báo</span>
              <span className="text-base sm:text-lg font-black text-foreground">
                {displaySources.length} Nguồn {isUserAdmin ? "(Admin)" : "chọn lọc"}
              </span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-background/80 backdrop-blur-sm border border-border/60">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium block">Cấp độ CEFR</span>
              <span className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400">A2 → C2</span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-background/80 backdrop-blur-sm border border-border/60">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium block">Tra từ vựng</span>
              <span className="text-base sm:text-lg font-black text-foreground">1 Chạm tức thì</span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-background/80 backdrop-blur-sm border border-border/60">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium block">Giọng đọc AI</span>
              <span className="text-base sm:text-lg font-black text-foreground">Karaoke Sync</span>
            </div>
          </div>
        </div>

        {/* Ambient Decorative Shapes */}
        <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 translate-y-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Unified Feed: Latest Stories from All Publications */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Bài viết mới nhất từ tất cả nguồn</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {cleanQuery ? `Kết quả tìm kiếm cho "${searchQuery}": ${filteredLatestArticles.length} bài` : "Tổng hợp các bài báo và câu chuyện mới nhất từ tất cả các tòa soạn uy tín trên thế giới"}
            </p>
          </div>
        </div>

        {/* Article Cards Grid */}
        {filteredLatestArticles.length === 0 ? (
          <div className="text-center py-16 space-y-2 text-muted-foreground">
            <Compass className="w-10 h-10 mx-auto opacity-40" />
            <p className="font-semibold text-foreground text-sm">Không tìm thấy bài viết nào phù hợp</p>
            <p className="text-xs">Hãy thử đổi từ khóa tìm kiếm khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLatestArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                isRead={isArticleRead ? isArticleRead(article.id) : false}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
