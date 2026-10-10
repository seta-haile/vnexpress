import { fetchAllSourcesLatest } from "@/lib/rss";
import { NewsDashboard } from "@/components/news/NewsDashboard";
import { getGlobalSiteSettings } from "@/lib/serverSettings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [{ vnexpress, combined }, initialSiteSettings] = await Promise.all([
    fetchAllSourcesLatest(),
    getGlobalSiteSettings()
  ]);

  return (
    <NewsDashboard
      initialArticles={vnexpress}
      initialChannel="home"
      initialSource="all"
      allLatestArticles={combined}
      initialSiteSettings={initialSiteSettings}
    />
  );
}
