"use client";

import React from "react";
import Image from "next/image";
import { PublicationSource, NewsItem } from "@/types/news";
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
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PublicationsDirectoryProps {
  onSelectSource: (sourceId: "vnexpress" | "hony") => void;
  latestArticles: NewsItem[];
  onOpenArticle?: (article: NewsItem) => void;
  isArticleRead?: (id: string) => boolean;
}

export function PublicationsDirectory({
  onSelectSource,
  latestArticles,
  onOpenArticle,
  isArticleRead
}: PublicationsDirectoryProps) {
  return (
    <div className="space-y-10 py-2 animate-in fade-in duration-300">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-purple-500/10 border border-rose-500/20 p-6 sm:p-10 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25 text-xs font-bold tracking-wide">
            <Compass className="w-3.5 h-3.5" />
            <span>NỀN TẢNG ĐỌC BÁO TIẾNG ANH ĐA NGUỒN</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
            Học tiếng Anh qua <span className="bg-gradient-to-r from-rose-600 via-amber-500 to-rose-500 bg-clip-text text-transparent">nhiều nguồn báo chất lượng</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Thay vì giới hạn trong một tờ báo, bạn có thể tự do lựa chọn phong cách đọc: từ tin tức thời sự chính luận chuẩn mực cho đến những câu chuyện đời thực chân phương, giàu xúc cảm từ New York.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/60">
              <span className="text-[11px] text-muted-foreground font-medium block">Nguồn báo</span>
              <span className="text-lg font-black text-foreground">2 Nguồn chọn lọc</span>
            </div>
            <div className="p-3 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/60">
              <span className="text-[11px] text-muted-foreground font-medium block">Cấp độ CEFR</span>
              <span className="text-lg font-black text-rose-600 dark:text-rose-400">A2 → C1</span>
            </div>
            <div className="p-3 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/60">
              <span className="text-[11px] text-muted-foreground font-medium block">Tra từ vựng</span>
              <span className="text-lg font-black text-foreground">1 Chạm tức thì</span>
            </div>
            <div className="p-3 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/60">
              <span className="text-[11px] text-muted-foreground font-medium block">Giọng đọc AI</span>
              <span className="text-lg font-black text-foreground">Karaoke Sync</span>
            </div>
          </div>
        </div>

        {/* Ambient Decorative Shapes */}
        <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 translate-y-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Publications Showcase Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-rose-600" />
              <span>Danh sách các báo hiện có</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Chọn tờ báo bạn muốn khám phá và bắt đầu buổi học
            </p>
          </div>
          <Badge variant="outline" className="font-semibold text-xs border-border">
            2 / 2 Báo đã kết nối
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PUBLICATION_SOURCES.map((source) => {
            const isVnExpress = source.id === "vnexpress";

            return (
              <div
                key={source.id}
                className="group relative rounded-3xl border border-border/80 bg-card hover:bg-card/95 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 overflow-hidden flex flex-col justify-between"
              >
                {/* Top Image Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-muted">
                  <Image
                    src={source.coverImage}
                    alt={source.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                  
                  {/* Source Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${source.badgeColor}`}>
                      {source.badge}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 text-white backdrop-blur-md">
                      CEFR {source.cefrRange}
                    </span>
                  </div>

                  {/* Logo Indicator */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${source.gradient} flex items-center justify-center text-white font-black text-sm shadow-lg`}>
                      {source.logoText}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-foreground drop-shadow-sm">
                        {source.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {isVnExpress ? "e.vnexpress.net" : "humansofnyarchive.com"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-xs text-foreground/85 font-medium leading-relaxed">
                      {source.tagline}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {source.description}
                    </p>

                    {/* Features list */}
                    <div className="pt-2 space-y-2 border-t border-border/50 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>
                          <strong className="text-foreground font-semibold">Phong cách: </strong>
                          {source.readingStyle}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>
                          <strong className="text-foreground font-semibold">Chuyên mục: </strong>
                          {isVnExpress ? "9 chuyên mục tin nóng 24/7" : "Hàng trăm câu chuyện chân dung đời thực"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-3">
                    <Button
                      onClick={() => onSelectSource(source.id as "vnexpress" | "hony")}
                      className={`w-full py-2.5 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isVnExpress
                          ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25"
                          : "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25"
                      }`}
                    >
                      <span>Vào đọc {source.shortName}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unified Feed: Latest Stories from Both Publications */}
      <div className="space-y-4 pt-6 border-t border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Bài viết mới nhất từ tất cả nguồn</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Bấm vào bài viết bất kỳ để bắt đầu luyện đọc với hỗ trợ tra từ & karaoke audio
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectSource("vnexpress")}
              className="text-xs rounded-xl"
            >
              Chỉ xem VnExpress
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectSource("hony")}
              className="text-xs rounded-xl"
            >
              Chỉ xem Humans of NY
            </Button>
          </div>
        </div>

        {/* Article Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestArticles.slice(0, 9).map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              isRead={isArticleRead ? isArticleRead(article.id) : false}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
