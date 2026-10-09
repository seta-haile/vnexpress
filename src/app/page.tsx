import { fetchAllSourcesLatest } from "@/lib/rss";
import { NewsDashboard } from "@/components/news/NewsDashboard";

export default async function HomePage() {
  const { vnexpress, combined } = await fetchAllSourcesLatest();

  return (
    <NewsDashboard
      initialArticles={vnexpress}
      initialChannel="home"
      initialSource="all"
      allLatestArticles={combined}
    />
  );
}

