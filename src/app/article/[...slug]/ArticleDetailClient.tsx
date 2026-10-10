"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArticleDetail } from "@/types/news";
import { InteractiveReader } from "@/components/reader/InteractiveReader";
import { getAppSettings, markArticleRead, detectSourceId, getUserStats, AppSettings, DEFAULT_APP_SETTINGS } from "@/lib/storage";

interface ArticleDetailClientProps {
  article: ArticleDetail;
  nextArticle?: { title: string; slug: string } | null;
}

export function ArticleDetailClient({ article, nextArticle }: ArticleDetailClientProps) {
  const router = useRouter();
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [isRead, setIsRead] = useState(false);

  useEffect(() => {
    const settings = getAppSettings();
    setAppSettings(settings);

    // Apply dark mode if set
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Check if article is read
    const stats = getUserStats();
    setIsRead(stats.readArticleIds.includes(article.id));
  }, [article.id]);

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleNextArticle = () => {
    if (nextArticle?.slug) {
      router.push(`/article/${nextArticle.slug}`);
    }
  };

  const handleMarkRead = (id: string) => {
    const sId = (article as any).sourceId || detectSourceId(id, article.link);
    markArticleRead(id, sId);
    setIsRead(true);
  };

  return (
    <InteractiveReader
      article={article}
      nextArticle={nextArticle}
      onNextArticle={nextArticle ? handleNextArticle : undefined}
      onBack={handleBack}
      onMarkRead={handleMarkRead}
      isRead={isRead}
      showImages={appSettings.showImages}
    />
  );
}
