import { notFound } from "next/navigation";
import { fetchAllSourcesLatest, fetchRssFeed, PUBLICATION_SOURCES } from "@/lib/rss";
import { NewsDashboard } from "@/components/news/NewsDashboard";
import { getGlobalSiteSettings } from "@/lib/serverSettings";
import { PublicationSourceId } from "@/types/news";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SourcePageProps {
  params: Promise<{
    source: string;
  }>;
}

const VALID_SOURCES = new Set<string>(PUBLICATION_SOURCES.map((p) => p.id));

export async function generateMetadata({ params }: SourcePageProps): Promise<Metadata> {
  const { source } = await params;
  const pub = PUBLICATION_SOURCES.find((p) => p.id === source);
  if (!pub) {
    return { title: "VnE Reader - Đọc Báo Tiếng Anh Đa Nguồn" };
  }
  return {
    title: `${pub.name} | VnE Reader`,
    description: pub.tagline || pub.description
  };
}

export default async function SourcePage({ params }: SourcePageProps) {
  const { source } = await params;

  if (!VALID_SOURCES.has(source)) {
    notFound();
  }

  const sourceId = source as PublicationSourceId;

  let defaultChannel = "home";
  if (source === "hony") defaultChannel = "hony-all";
  else if (source === "bbc") defaultChannel = "bbc-world";
  else if (source === "guardian") defaultChannel = "guardian-world";
  else if (source === "npr") defaultChannel = "npr-all";
  else if (source === "theconversation") defaultChannel = "theconversation-all";
  else if (source === "propublica") defaultChannel = "propublica-all";
  else if (source === "wikinews") defaultChannel = "wikinews-all";
  else if (source === "gutenberg") defaultChannel = "gutenberg-all";
  else if (source === "globalvoices") defaultChannel = "globalvoices-all";

  const [articles, { combined }, initialSiteSettings] = await Promise.all([
    fetchRssFeed(defaultChannel, sourceId),
    fetchAllSourcesLatest(),
    getGlobalSiteSettings()
  ]);

  return (
    <NewsDashboard
      initialArticles={articles}
      initialChannel={defaultChannel}
      initialSource={source as any}
      allLatestArticles={combined}
      initialSiteSettings={initialSiteSettings}
    />
  );
}
