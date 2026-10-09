"use client";

import React, { useState } from "react";
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
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RSS_CHANNELS } from "@/lib/rss";
import { UserLearningStats } from "@/types/news";
import { UserMenu } from "@/components/auth/UserMenu";

interface HeaderProps {
  activeChannel: string;
  onSelectChannel: (channelId: string) => void;
  savedWordsCount: number;
  onOpenVocabulary: () => void;
  onOpenFlashcards: () => void;
  onOpenQuiz: () => void;
  userStats: UserLearningStats;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSettings: () => void;
}

export function Header({
  activeChannel,
  onSelectChannel,
  savedWordsCount,
  onOpenVocabulary,
  onOpenFlashcards,
  onOpenQuiz,
  userStats,
  searchQuery,
  onSearchChange,
  onOpenSettings
}: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-all">
      {/* Top Banner & Quick Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform duration-300">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-red-600 via-rose-600 to-slate-900 dark:to-white bg-clip-text text-transparent">
                    VnE Reader
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium tracking-wide bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800">
                    ENGLISH
                  </Badge>
                </div>
                <span className="text-[11px] text-muted-foreground hidden sm:inline-block">
                  Học tiếng Anh qua báo VnExpress International
                </span>
              </div>
            </Link>
          </div>

          {/* Search bar (desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm bài báo, chủ đề (AI, GDP, Travel...)..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full text-sm pl-9 pr-4 py-2 rounded-full border border-border bg-muted/40 hover:bg-muted/70 focus:bg-background focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {/* Learning Streak */}
            <div 
              title={`${userStats.streakDays} ngày học liên tiếp`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold"
            >
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
              <span>{userStats.streakDays}d Streak</span>
            </div>

            {/* Flashcard Practice */}
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenFlashcards}
              className="hidden lg:flex items-center gap-1.5 border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Flashcards</span>
            </Button>

            {/* Quick Quiz */}
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenQuiz}
              className="hidden sm:flex items-center gap-1.5 border-border hover:bg-muted font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
              <span>Quiz</span>
            </Button>

            {/* Sổ từ vựng */}
            <Button
              variant="default"
              size="sm"
              onClick={onOpenVocabulary}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30 flex items-center gap-1.5 font-medium"
            >
              <Bookmark className="w-4 h-4 fill-white/80" />
              <span className="hidden sm:inline">Sổ Từ Vựng</span>
              <Badge className="bg-white/20 text-white hover:bg-white/30 text-xs px-1.5 py-0 h-5 min-w-5 flex items-center justify-center rounded-full ml-0.5 border-none">
                {savedWordsCount}
              </Badge>
            </Button>

            {/* Nút Cài đặt Theme & Ẩn/Hiện ảnh */}
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSettings}
              className="h-8 w-8 p-0 rounded-full border-border/70 hover:bg-muted"
              title="Cài đặt giao diện & ẩn/hiện ảnh"
            >
              <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </Button>

            {/* Tài khoản & Đăng nhập */}
            <UserMenu onOpenVocabulary={onOpenVocabulary} />
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm bài báo theo tiêu đề hoặc từ khóa..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full text-sm pl-9 pr-4 py-2 rounded-lg border border-border bg-muted/40 focus:bg-background focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-2 no-scrollbar border-t border-border/30">
          {RSS_CHANNELS.map((ch) => {
            const isActive = activeChannel === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => onSelectChannel(ch.id)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-rose-600 text-white shadow-sm shadow-rose-600/25 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70 bg-transparent"
                }`}
              >
                {ch.name}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
