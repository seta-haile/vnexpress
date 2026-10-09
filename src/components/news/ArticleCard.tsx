"use client";

import React from "react";
import Link from "next/link";
import { NewsItem } from "@/types/news";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { getArticleSlug } from "@/lib/rss";

interface ArticleCardProps {
  article: NewsItem;
  isRead?: boolean;
  showImages?: boolean;
}

const CEFR_CONFIG: Record<string, { label: string; color: string; desc: string }> = {
  A2: { label: "A2 Elementary", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300", desc: "Dễ đọc, câu đơn giản" },
  B1: { label: "B1 Intermediate", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300", desc: "Trung cấp, từ vựng thông dụng" },
  B2: { label: "B2 Upper-Int", color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300", desc: "Khá, nhiều cấu trúc phức" },
  C1: { label: "C1 Advanced", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-300", desc: "Nâng cao, từ vựng học thuật/IELTS" },
  C2: { label: "C2 Mastery", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-300", desc: "Chuyên sâu bản ngữ" }
};

export function ArticleCard({
  article,
  isRead = false,
  showImages = true
}: ArticleCardProps) {
  const cefr = CEFR_CONFIG[article.cefrLevel] || CEFR_CONFIG.B1;
  const slug = getArticleSlug(article.link);

  // Format date cleanly
  const formattedDate = (() => {
    try {
      const d = new Date(article.pubDate);
      return d.toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return article.pubDate;
    }
  })();

  return (
    <Link 
      href={`/article/${slug}`}
      className="group relative flex flex-col bg-card rounded-2xl border border-border/70 hover:border-rose-500/40 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1 block"
    >
      {/* Thumbnail Container (Only rendered when showImages is true) */}
      {showImages ? (
        <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-muted">
          <img
            src={article.thumbnail}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badges on Thumbnail */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
            {article.sourceId === "hony" ? (
              <Badge className="bg-amber-600/90 backdrop-blur-md text-white border-none text-[10px] font-bold">
                HONY
              </Badge>
            ) : article.sourceId === "vnexpress" ? (
              <Badge className="bg-rose-600/90 backdrop-blur-md text-white border-none text-[10px] font-bold">
                VnExpress
              </Badge>
            ) : null}
            <Badge className="bg-black/60 backdrop-blur-md text-white border-white/20 text-[11px] font-medium">
              {article.category}
            </Badge>
            <Badge className={`${cefr.color} border text-[11px] backdrop-blur-md font-semibold`}>
              {cefr.label}
            </Badge>
          </div>

          {/* Read status indicator */}
          {isRead && (
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-semibold flex items-center gap-1 backdrop-blur-sm">
              ✓ Đã đọc
            </div>
          )}

          {/* Reading Time & Word Count at bottom of image */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white/90 text-xs font-medium">
            <span className="flex items-center gap-1 drop-shadow-sm">
              <Clock className="w-3.5 h-3.5" />
              {article.readingTimeMinutes} phút đọc
            </span>
            <span className="flex items-center gap-1 drop-shadow-sm text-white/80">
              <BookOpen className="w-3.5 h-3.5" />
              ~{article.wordCount} từ
            </span>
          </div>
        </div>
      ) : (
        /* Text-Only Header Mode (When showImages is false) */
        <div className="p-4 pb-0 flex items-center justify-between gap-2 border-b border-border/30 bg-muted/20">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className="text-[11px] font-medium">
              {article.category}
            </Badge>
            <Badge className={`${cefr.color} border text-[11px] font-semibold`}>
              {cefr.label}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readingTimeMinutes}m
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              ~{article.wordCount}w
            </span>
            {isRead && (
              <span className="text-emerald-600 font-semibold text-[11px]">✓ Đã đọc</span>
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex flex-col flex-1 p-5">
        <div className="text-[11px] text-muted-foreground mb-2 flex items-center gap-2">
          <span>{formattedDate}</span>
          <span>•</span>
          <span className="text-rose-600 dark:text-rose-400 font-medium">VnExpress Int</span>
        </div>

        <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug mb-2.5">
          {article.title}
        </h3>

        <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4 flex-1">
          {article.description}
        </p>

        {/* Card Footer Button */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-medium text-rose-600 dark:text-rose-400">
          <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <Sparkles className="w-3.5 h-3.5" />
            Bấm để đọc & tra từ tương tác
          </span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
