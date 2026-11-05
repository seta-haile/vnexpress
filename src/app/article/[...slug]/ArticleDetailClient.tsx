"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArticleDetail } from "@/types/news";
import { InteractiveReader } from "@/components/reader/InteractiveReader";
import { getAppSettings, markArticleRead, detectSourceId, getUserStats, AppSettings, DEFAULT_APP_SETTINGS } from "@/lib/storage";
import { trackUserEvent } from "@/lib/trackerClient";
import { stopNeuralAudio } from "@/lib/voice";

interface ArticleDetailClientProps {
  article: ArticleDetail;
  nextArticle?: { title: string; slug: string } | null;
}

export function ArticleDetailClient({ article, nextArticle }: ArticleDetailClientProps) {
  const router = useRouter();
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [isRead, setIsRead] = useState(false);
  const [backHref, setBackHref] = useState<string>("/");

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

    // Determine backHref and prefetch it immediately for zero-delay navigation
    let target = "/";
    const saved = sessionStorage.getItem("lastArticleListUrl");
    if (saved && !saved.startsWith("/dictation") && !saved.startsWith("/article")) {
      target = saved;
    }
    setBackHref(target);
    router.prefetch(target);

    // Track user reading event
    const sourceId = (article as any).sourceId || detectSourceId(article.id, article.link);
    trackUserEvent({
      actionType: "READ_ARTICLE",
      sourceId,
      articleTitle: article.title,
      articleUrl: article.link,
      articleSlug: article.id
    });
  }, [article.id, article.title, article.link, router]);

  const handleBack = () => {
    stopNeuralAudio();
    let target = backHref;
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("lastArticleListUrl");
      if (saved && !saved.startsWith("/dictation") && !saved.startsWith("/article")) {
        target = saved;
      }
    }
    router.push(target);
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
      backHref={backHref}
      onMarkRead={handleMarkRead}
      isRead={isRead}
      showImages={appSettings.showImages}
    />
  );
}
