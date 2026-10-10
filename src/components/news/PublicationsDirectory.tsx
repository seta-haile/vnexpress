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
    const local = getLocalSiteSettings();
    if (local) setSettings(local);

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
  const displaySources = PUBLICATION_SOURCES.filter((s) =>
    settings.enabledSources.includes(s.id)
  );

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
                {displaySources.length} Nguồn chọn lọc
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

      {/* Publications Showcase Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-rose-600" />
              <span>Nguồn báo đang hoạt động</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Chọn tờ báo bạn muốn khám phá và bắt đầu buổi học
            </p>
          </div>
          <Badge variant="outline" className="font-semibold text-xs border-border">
            {displaySources.length} Báo đang mở
          </Badge>
        </div>

        {filteredSources.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-xs">
            Không có nguồn báo nào khớp với tìm kiếm & cài đặt.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSources.map((source) => {
              return (
                <div
                  key={source.id}
                  className="group relative rounded-3xl border border-border/80 bg-card hover:bg-card/95 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 overflow-hidden flex flex-col justify-between"
                >
                  {/* Top Image Banner */}
                  <div className="relative h-36 w-full overflow-hidden bg-muted">
                    <Image
                      src={source.coverImage}
                      alt={source.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                    
                    {/* Source Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-sm backdrop-blur-md ${source.badgeColor}`}>
                        {source.badge}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-md">
                        CEFR {source.cefrRange}
                      </span>
                    </div>

                    {/* Logo Indicator */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${source.gradient} flex items-center justify-center text-white font-black text-xs shadow-lg`}>
                        {source.logoText}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-foreground drop-shadow-sm line-clamp-1">
                          {source.name}
                        </h3>
                        <p className="text-[10px] text-muted-foreground">
                          {source.channels.length} chuyên mục
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <p className="text-xs text-foreground/85 font-medium leading-relaxed line-clamp-2">
                        {source.tagline}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {source.description}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <Button
                        onClick={() => onSelectSource(source.id as any)}
                        className="w-full py-2 rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25"
                      >
                        <span>Vào đọc {source.shortName}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Unified Feed: Latest Stories from All Publications */}
      <div className="space-y-4 pt-4 border-t border-border/60">
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
