import { XMLParser } from "fast-xml-parser";
import { RssChannel, NewsItem, PublicationSource } from "@/types/news";

export const RSS_CHANNELS: RssChannel[] = [
  {
    id: "home",
    name: "Latest News",
    vietnameseName: "Tin Mới Nhất",
    url: "https://e.vnexpress.net/rss/home.rss",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    description: "Tổng hợp các tin tức nóng hổi, cập nhật liên tục từ VnExpress International."
  },
  {
    id: "business",
    name: "Business & Economy",
    vietnameseName: "Kinh Doanh & Kinh Tế",
    url: "https://e.vnexpress.net/rss/business.rss",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    description: "Từ vựng chuyên ngành tài chính, kinh doanh, thị trường và đầu tư."
  },
  {
    id: "tech",
    name: "Technology & AI",
    vietnameseName: "Công Nghệ & AI",
    url: "https://e.vnexpress.net/rss/tech.rss",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    description: "Cập nhật xu hướng công nghệ số, trí tuệ nhân tạo và khởi nghiệp đổi mới sáng tạo."
  },
  {
    id: "life",
    name: "Life & Culture",
    vietnameseName: "Đời Sống & Văn Hóa",
    url: "https://e.vnexpress.net/rss/life.rss",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    description: "Từ vựng đời sống thường nhật, lối sống, sức khỏe và văn hóa gia đình."
  },
  {
    id: "travel",
    name: "Travel & Places",
    vietnameseName: "Du Lịch & Ẩm Thực",
    url: "https://e.vnexpress.net/rss/travel.rss",
    badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
    description: "Khám phá danh lam thắng cảnh, ẩm thực Việt Nam và quốc tế bằng tiếng Anh chuẩn."
  },
  {
    id: "news",
    name: "Society & Politics",
    vietnameseName: "Thời Sự & Xã Hội",
    url: "https://e.vnexpress.net/rss/news.rss",
    badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    description: "Tin thời sự xã hội, chính sách, giáo dục và môi trường tại Việt Nam."
  },
  {
    id: "world",
    name: "World News",
    vietnameseName: "Thế Giới",
    url: "https://e.vnexpress.net/rss/world.rss",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
    description: "Tin tức toàn cầu, sự kiện quốc tế phục vụ luyện thi IELTS/TOEFL."
  },
  {
    id: "sports",
    name: "Sports",
    vietnameseName: "Thể Thao",
    url: "https://e.vnexpress.net/rss/sports.rss",
    badgeColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    description: "Bóng đá, thể thao trong nước và quốc tế với nhiều thuật ngữ sinh động."
  },
  {
    id: "perspectives",
    name: "Perspectives",
    vietnameseName: "Góc Nhìn & Ý Kiến",
    url: "https://e.vnexpress.net/rss/perspectives.rss",
    badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800",
    description: "Các bài luận, bình luận và quan điểm chuyên sâu để học văn phong học thuật."
  }
];

export const HONY_CHANNELS: RssChannel[] = [
  {
    id: "hony-all",
    name: "Stories",
    vietnameseName: "Tất Cả Câu Chuyện",
    url: "https://humansofnyarchive.com/rss",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    description: "Những câu chuyện chân dung đời thực giàu xúc cảm từ người dân New York."
  }
];

export const PUBLICATION_SOURCES: PublicationSource[] = [
  {
    id: "vnexpress",
    name: "VnExpress International",
    shortName: "VnExpress",
    badge: "Thời sự & Học thuật",
    tagline: "Báo tiếng Anh hàng đầu Việt Nam - Tin thời sự, kinh tế, công nghệ & đời sống",
    description: "Cung cấp tin tức thời sự chính luận, kinh tế, xã hội với văn phong báo chí chuẩn mực quốc tế. Lý tưởng để rèn luyện kỹ năng đọc hiểu chuyên sâu và chuẩn bị cho các kỳ thi IELTS, TOEFL.",
    logoText: "VnE",
    badgeColor: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60",
    gradient: "from-red-600 via-rose-500 to-amber-500",
    rssUrl: "https://e.vnexpress.net/rss/home.rss",
    websiteUrl: "https://e.vnexpress.net",
    channels: RSS_CHANNELS,
    cefrRange: "B1 - C1",
    readingStyle: "Tin tức chính luận, kinh tế, xã hội chuẩn báo chí",
    coverImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop&q=80"
  },
  {
    id: "hony",
    name: "Humans of New York",
    shortName: "HONY Archive",
    badge: "Chuyện đời thực & Chân dung",
    tagline: "Kho lưu trữ câu chuyện người thật việc thật từ đường phố New York",
    description: "Dự án nhiếp ảnh và phỏng vấn nổi tiếng thế giới của Brandon Stanton. Mỗi bài viết là một lát cắt cuộc đời đầy cảm xúc, ngôn từ tự nhiên, giàu thành ngữ và cảm xúc chân thật của người bản xứ.",
    logoText: "HONY",
    badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/60",
    gradient: "from-amber-600 via-orange-600 to-stone-800",
    rssUrl: "https://humansofnyarchive.com/rss",
    websiteUrl: "https://humansofnyarchive.com",
    channels: HONY_CHANNELS,
    cefrRange: "A2 - B2",
    readingStyle: "Kể chuyện tâm sự, hội thoại đời thường chân thật",
    coverImage: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&auto=format&fit=crop&q=80"
  }
];

export function extractImageAndText(rawDescription: string): { thumbnail: string; text: string } {
  if (!rawDescription) return { thumbnail: "", text: "" };

  let thumbnail = "";
  // Match <img src="..."
  const imgMatch = rawDescription.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    thumbnail = imgMatch[1];
  }

  // Strip all HTML tags & br tags
  let text = rawDescription
    .replace(/<[^>]*>?/gm, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  return { thumbnail, text };
}

export function estimateCEFR(text: string): {
  cefrLevel: 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  difficultyScore: number;
  wordCount: number;
  readingTimeMinutes: number;
} {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180)); // ~180 wpm average reading speed

  if (wordCount === 0) {
    return { cefrLevel: 'B1', difficultyScore: 2, wordCount: 0, readingTimeMinutes: 1 };
  }

  // Count average word length & complex words (length >= 7)
  const totalLength = words.reduce((acc, w) => acc + w.length, 0);
  const avgWordLength = totalLength / wordCount;
  const complexWords = words.filter(w => w.length >= 7).length;
  const complexWordRatio = complexWords / wordCount;

  // Estimate CEFR
  let cefrLevel: 'A2' | 'B1' | 'B2' | 'C1' | 'C2' = 'B1';
  let difficultyScore = 2;

  if (avgWordLength > 5.8 || complexWordRatio > 0.28) {
    cefrLevel = 'C1';
    difficultyScore = 4;
  } else if (avgWordLength > 5.2 || complexWordRatio > 0.20) {
    cefrLevel = 'B2';
    difficultyScore = 3;
  } else if (avgWordLength < 4.4 && complexWordRatio < 0.12) {
    cefrLevel = 'A2';
    difficultyScore = 1;
  } else {
    cefrLevel = 'B1';
    difficultyScore = 2;
  }

  return { cefrLevel, difficultyScore, wordCount, readingTimeMinutes };
}

export async function fetchHonyFeed(): Promise<NewsItem[]> {
  try {
    const res = await fetch("https://humansofnyarchive.com/rss", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*"
      },
      next: { revalidate: 300 }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch HONY RSS: ${res.statusText}`);
    }

    const xmlData = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      cdataPropName: "__cdata"
    });

    const parsed = parser.parse(xmlData);
    const items = parsed?.rss?.channel?.item;

    if (!items || (!Array.isArray(items) && typeof items !== "object")) {
      return [];
    }

    const rawList = Array.isArray(items) ? items : [items];

    return rawList.map((item: any, idx: number) => {
      const rawTitle = item.title?.__cdata || item.title || "";
      const link = item.link?.__cdata || item.link || "";
      const guid = item.guid?.__cdata || item.guid || link || `hony-${idx}`;
      const pubDate = item.pubDate || new Date().toISOString();
      const rawDesc = item.description?.__cdata || item.description || "";
      const { thumbnail, text } = extractImageAndText(rawDesc);

      // Clean title or create thoughtful title from first sentence
      let cleanTitle = rawTitle.replace(/^“/, '"').replace(/”$/, '"').trim();
      if (!cleanTitle || cleanTitle.length < 5) {
        const firstSentence = text.split(/[.!?]+/)[0] || "Story from New York";
        cleanTitle = firstSentence.slice(0, 80) + (firstSentence.length > 80 ? "..." : "");
      }

      const metrics = estimateCEFR(cleanTitle + " " + text);

      return {
        id: guid || `hony-${idx}`,
        title: cleanTitle,
        link,
        guid,
        pubDate,
        description: text,
        rawDescription: rawDesc,
        thumbnail: thumbnail || "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&auto=format&fit=crop&q=80",
        category: "Humans of NY",
        channelId: "hony-all",
        sourceId: "hony",
        sourceName: "Humans of New York",
        readingTimeMinutes: metrics.readingTimeMinutes,
        wordCount: metrics.wordCount,
        cefrLevel: metrics.cefrLevel,
        difficultyScore: metrics.difficultyScore
      };
    });
  } catch (error) {
    console.error("Error fetching HONY RSS feed:", error);
    return [];
  }
}

export async function fetchRssFeed(channelId: string = "home", sourceId?: string): Promise<NewsItem[]> {
  if (sourceId === "hony" || channelId === "hony" || channelId === "hony-all") {
    return fetchHonyFeed();
  }

  const channel = RSS_CHANNELS.find(c => c.id === channelId) || RSS_CHANNELS[0];

  try {
    const res = await fetch(channel.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*"
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch RSS from ${channel.url}: ${res.statusText}`);
    }

    const xmlData = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      cdataPropName: "__cdata"
    });

    const parsed = parser.parse(xmlData);
    const items = parsed?.rss?.channel?.item;

    if (!items || !Array.isArray(items) && typeof items !== "object") {
      return [];
    }

    const rawList = Array.isArray(items) ? items : [items];

    return rawList.map((item: any, idx: number) => {
      const title = item.title?.__cdata || item.title || "Untitled";
      const link = item.link?.__cdata || item.link || "";
      const guid = item.guid?.__cdata || item.guid || link || `news-${idx}`;
      const pubDate = item.pubDate || new Date().toISOString();
      const rawDesc = item.description?.__cdata || item.description || "";
      const { thumbnail, text } = extractImageAndText(rawDesc);
      
      const metrics = estimateCEFR(title + " " + text);

      // Determine category name
      let category = channel.name;
      if (link.includes("/business/")) category = "Business";
      else if (link.includes("/tech/")) category = "Tech";
      else if (link.includes("/travel/")) category = "Travel";
      else if (link.includes("/life/")) category = "Life";
      else if (link.includes("/world/")) category = "World";
      else if (link.includes("/sports/")) category = "Sports";
      else if (link.includes("/perspectives/")) category = "Perspectives";

      return {
        id: guid || `art-${idx}`,
        title,
        link,
        guid,
        pubDate,
        description: text,
        rawDescription: rawDesc,
        thumbnail: thumbnail || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80",
        category,
        channelId: channel.id,
        sourceId: "vnexpress",
        sourceName: "VnExpress International",
        readingTimeMinutes: metrics.readingTimeMinutes,
        wordCount: metrics.wordCount,
        cefrLevel: metrics.cefrLevel,
        difficultyScore: metrics.difficultyScore
      };
    });
  } catch (error) {
    console.error(`Error fetching RSS feed for ${channelId}:`, error);
    return [];
  }
}

export async function fetchAllSourcesLatest(): Promise<{
  vnexpress: NewsItem[];
  hony: NewsItem[];
  combined: NewsItem[];
}> {
  const [vnexpress, hony] = await Promise.all([
    fetchRssFeed("home"),
    fetchHonyFeed()
  ]);

  const combined = [...vnexpress, ...hony].sort((a, b) => {
    const timeA = new Date(a.pubDate).getTime();
    const timeB = new Date(b.pubDate).getTime();
    return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
  });

  return { vnexpress, hony, combined };
}

export function getArticleSlug(articleUrl: string): string {
  try {
    const u = new URL(articleUrl);
    if (u.hostname.includes("humansofnyarchive")) {
      const match = u.pathname.match(/\/post\/(\d+)/);
      if (match) return `hony/post/${match[1]}`;
      return `hony/${u.pathname.replace(/^\//, "")}`;
    }
    return u.pathname.replace(/^\//, "").replace(/\.html$/, "");
  } catch {
    return encodeURIComponent(articleUrl);
  }
}

export function reconstructArticleUrl(slug: string[] | string): string {
  if (Array.isArray(slug)) {
    if (slug[0] === "hony") {
      const rest = slug.slice(1).join("/");
      return `https://humansofnyarchive.com/${rest}`;
    }
    const path = slug.join("/").replace(/\.html$/, "") + ".html";
    return `https://e.vnexpress.net/${path}`;
  }
  if (slug.startsWith("hony/")) {
    return `https://humansofnyarchive.com/${slug.replace(/^hony\//, "")}`;
  }
  const clean = slug.replace(/\.html$/, "") + ".html";
  return `https://e.vnexpress.net/${clean}`;
}

