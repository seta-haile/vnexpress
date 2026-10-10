import { notFound } from "next/navigation";
import { reconstructArticleUrl, fetchRssFeed, getArticleSlug } from "@/lib/rss";
import { fetchArticleDetail } from "@/lib/article";
import { detectSourceId } from "@/lib/storage";
import { ArticleDetailClient } from "./ArticleDetailClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface ArticlePageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const originalUrl = reconstructArticleUrl(slug);
  const article = await fetchArticleDetail(originalUrl);

  if (!article) {
    return {
      title: "Bài báo - VnE Reader"
    };
  }

  return {
    title: `${article.title} | VnE Reader`,
    description: article.lead || "Học tiếng Anh qua tin tức báo chí quốc tế VnExpress.",
    openGraph: {
      title: article.title,
      description: article.lead,
      images: article.thumbnail ? [article.thumbnail] : []
    }
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const originalUrl = reconstructArticleUrl(slug);
  const article = await fetchArticleDetail(originalUrl);

  if (!article) {
    notFound();
  }

  // Find next article candidate from the same publication feed
  let nextArticle: { title: string; slug: string } | null = null;
  try {
    const sourceId = (article as any).sourceId || detectSourceId(article.id, originalUrl);
    const feedItems = await fetchRssFeed("home", sourceId);
    if (feedItems && feedItems.length > 0) {
      const currentSlug = slug.join("/");
      const currentIndex = feedItems.findIndex((it) => {
        const itSlug = getArticleSlug(it.link);
        return itSlug === currentSlug || it.link === originalUrl || it.id === article.id;
      });

      let candidate = null;
      if (currentIndex !== -1 && currentIndex + 1 < feedItems.length) {
        candidate = feedItems[currentIndex + 1];
      } else if (feedItems.length > 1) {
        candidate = feedItems.find((it) => {
          const itSlug = getArticleSlug(it.link);
          return itSlug !== currentSlug && it.link !== originalUrl;
        }) || feedItems[0];
      } else if (feedItems.length === 1 && feedItems[0].link !== originalUrl) {
        candidate = feedItems[0];
      }

      if (candidate) {
        nextArticle = {
          title: candidate.title,
          slug: getArticleSlug(candidate.link)
        };
      }
    }
  } catch (err) {
    console.error("Error finding next article:", err);
  }

  return <ArticleDetailClient article={article} nextArticle={nextArticle} />;
}

