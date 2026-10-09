import { notFound } from "next/navigation";
import { reconstructArticleUrl } from "@/lib/rss";
import { fetchArticleDetail } from "@/lib/article";
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

  return <ArticleDetailClient article={article} />;
}
