import { fetchRssFeed } from "@/lib/rss";
import { NewsDashboard } from "@/components/news/NewsDashboard";


export default async function HomePage() {
  const initialArticles = await fetchRssFeed("home");

  return (
    <NewsDashboard
      initialArticles={initialArticles}
      initialChannel="home"
    />
  );
}
