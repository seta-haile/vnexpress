import { notFound } from "next/navigation";
import { reconstructArticleUrl, fetchRssFeed, getArticleSlug } from "@/lib/rss";
import { fetchArticleDetail } from "@/lib/article";
import { detectSourceId } from "@/lib/storage";
import { DictationPractice } from "@/components/dictation/DictationPractice";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface DictationPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateMetadata({ params }: DictationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const originalUrl = reconstructArticleUrl(slug);
  const article = await fetchArticleDetail(originalUrl);

  if (!article) {
    return {
      title: "Luyện nghe chép chính tả - VnE Reader"
    };
  }

  return {
    title: `🎧 Luyện nghe: ${article.title} | VnE Reader`,
    description: `Luyện nghe chép chính tả tiếng Anh qua bài báo ${article.title}.`
  };
}

export default async function DictationPage({ params }: DictationPageProps) {
  const { slug } = await params;
  const originalUrl = reconstructArticleUrl(slug);
  const article = await fetchArticleDetail(originalUrl);

  if (!article) {
    notFound();
  }

  // Find next article candidate
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
      }

      if (candidate) {
        nextArticle = {
          title: candidate.title,
          slug: getArticleSlug(candidate.link)
        };
      }
    }
  } catch (err) {
    console.error("Error finding next article for dictation:", err);
  }

  return (
    <DictationPractice
      article={article}
      articleSlug={slug.join("/")}
      nextArticle={nextArticle}
    />
  );
}
