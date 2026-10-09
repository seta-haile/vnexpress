import * as cheerio from "cheerio";
import { ArticleDetail, ArticleParagraph, KeyVocab } from "@/types/news";
import { estimateCEFR } from "@/lib/rss";
import { CURATED_VOCAB, cleanWord } from "@/lib/dictionary";
import { XMLParser } from "fast-xml-parser";

async function fetchHonyArticleDetail(url: string): Promise<ArticleDetail | null> {
  try {
    const res = await fetch("https://humansofnyarchive.com/rss", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*"
      },
      next: { revalidate: 300 }
    });
    if (!res.ok) return null;

    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, cdataPropName: "__cdata" });
    const parsed = parser.parse(xml);
    const items = parsed?.rss?.channel?.item || [];
    const list = Array.isArray(items) ? items : [items];

    const matched = list.find((it: any) => {
      const link = it.link?.__cdata || it.link || "";
      const guid = it.guid?.__cdata || it.guid || "";
      if (link === url || guid === url) return true;
      const idMatch = url.match(/\/post\/(\d+)/);
      if (idMatch && (link.includes(idMatch[1]) || guid.includes(idMatch[1]))) return true;
      return false;
    }) || list[0];

    if (!matched) return null;

    const rawDesc = matched.description?.__cdata || matched.description || "";
    const imgMatch = rawDesc.match(/<img[^>]+src=["']([^"']+)["']/i);
    const thumbnail = imgMatch ? imgMatch[1] : "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&auto=format&fit=crop&q=80";

    const bodyHtml = rawDesc.replace(/<img[^>]*>/gi, "");
    const pMatches = bodyHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
    let rawParagraphs: string[] = [];
    if (pMatches && pMatches.length > 0) {
      rawParagraphs = pMatches.map((p: string) => 
        p.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim()
      ).filter((t: string) => t.length > 0);
    } else {
      rawParagraphs = bodyHtml.split(/<br\s*\/?>/i)
        .map((t: string) => t.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim())
        .filter((t: string) => t.length > 0);
    }

    const paragraphs: ArticleParagraph[] = [];
    rawParagraphs.forEach((rawP: string) => {
      if (rawP.length > 350) {
        const sentences = rawP.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) || [rawP];
        let currentChunk = "";
        sentences.forEach((s: string) => {
          if ((currentChunk + " " + s).trim().length > 300) {
            if (currentChunk) paragraphs.push({ id: `p-${paragraphs.length}`, text: currentChunk.trim() });
            currentChunk = s;
          } else {
            currentChunk = (currentChunk + " " + s).trim();
          }
        });
        if (currentChunk) paragraphs.push({ id: `p-${paragraphs.length}`, text: currentChunk.trim() });
      } else {
        paragraphs.push({ id: `p-${paragraphs.length}`, text: rawP });
      }
    });

    const fullText = paragraphs.map(p => p.text).join(" ");
    const { wordCount, cefrLevel } = estimateCEFR(fullText);

    const extractedWords = new Set<string>();
    const keyVocabulary: KeyVocab[] = [];
    const tokens = fullText.split(/[\s,.;:!?()"“”']+/).map(cleanWord);

    for (const token of tokens) {
      if (token && CURATED_VOCAB[token] && !extractedWords.has(token)) {
        extractedWords.add(token);
        const item = CURATED_VOCAB[token];
        keyVocabulary.push({
          word: token,
          ipa: item.ipa,
          partOfSpeech: item.pos,
          vietnamese: item.vi,
          englishDefinition: item.en,
          exampleSentence: item.example,
          cefr: item.cefr
        });
      }
    }

    const rawTitle = matched.title?.__cdata || matched.title || "Humans of New York Story";
    const lead = paragraphs[0]?.text || "A story from Humans of New York.";

    return {
      id: matched.guid || `hony-story-${Date.now()}`,
      title: rawTitle.replace(/^“/, '"').replace(/”$/, '"'),
      link: matched.link || url,
      pubDate: matched.pubDate || new Date().toISOString(),
      category: "Humans of NY",
      lead,
      thumbnail,
      caption: "Photo by Brandon Stanton • Humans of New York",
      author: "Brandon Stanton",
      paragraphs: paragraphs.slice(1).length > 0 ? paragraphs.slice(1) : paragraphs,
      wordCount,
      cefrLevel,
      keyVocabulary
    };
  } catch (e) {
    console.error("fetchHonyArticleDetail error:", e);
    return null;
  }
}

export async function fetchArticleDetail(url: string): Promise<ArticleDetail | null> {
  if (url.includes("humansofnyarchive.com") || url.includes("/hony/")) {
    return fetchHonyArticleDetail(url);
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      next: { revalidate: 600 }
    });

    if (!res.ok) {
      console.error(`Failed to fetch article from ${url}:`, res.statusText);
      return null;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Extract title
    const title = $("h1.title_post").text().trim() ||
                  $("meta[property='og:title']").attr("content") ||
                  $("title").text().trim();

    // Extract lead/summary
    const lead = $("span.lead_post_detail").text().trim() ||
                 $("meta[property='og:description']").attr("content") || "";

    // Extract thumbnail image
    let thumbnail = $("meta[property='og:image']").attr("content") || "";
    if (!thumbnail) {
      const firstImg = $(".fck_detail img").first().attr("src");
      if (firstImg) thumbnail = firstImg;
    }

    // Extract caption
    const caption = $(".caption_thumb_detail_top").text().trim() || "";

    // Extract pubDate
    const pubDate = $(".date").text().trim() ||
                    $("meta[name='pubdate']").attr("content") ||
                    new Date().toLocaleDateString("en-US");

    // Extract paragraphs from .fck_detail
    const paragraphs: ArticleParagraph[] = [];
    $(".fck_detail p.Normal").each((i, el) => {
      const text = $(el).text().trim();
      if (text && !text.startsWith("Related news:") && !text.includes("VnExpress on Google Search")) {
        paragraphs.push({
          id: `p-${i}`,
          text
        });
      }
    });

    // If no .fck_detail p.Normal found, try general p in article
    if (paragraphs.length === 0) {
      $(".fck_detail p, article p").each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 20) {
          paragraphs.push({
            id: `p-${i}`,
            text
          });
        }
      });
    }

    // Compute full article text for CEFR & Vocabulary analysis
    const fullText = [lead, ...paragraphs.map(p => p.text)].join(" ");
    const { wordCount, cefrLevel } = estimateCEFR(fullText);

    // Extract Key Vocabulary from article text
    const extractedWords = new Set<string>();
    const keyVocabulary: KeyVocab[] = [];
    const tokens = fullText.split(/[\s,.;:!?()"“”']+/).map(cleanWord);

    for (const token of tokens) {
      if (token && CURATED_VOCAB[token] && !extractedWords.has(token)) {
        extractedWords.add(token);
        const item = CURATED_VOCAB[token];
        keyVocabulary.push({
          word: token,
          ipa: item.ipa,
          partOfSpeech: item.pos,
          vietnamese: item.vi,
          englishDefinition: item.en,
          exampleSentence: item.example,
          cefr: item.cefr
        });
      }
    }

    // Fallback: If no curated words match, select interesting words >= 7 chars
    if (keyVocabulary.length < 3) {
      const candidates = Array.from(new Set(tokens.filter(t => t.length >= 7))).slice(0, 5);
      for (const cand of candidates) {
        if (!extractedWords.has(cand)) {
          extractedWords.add(cand);
          keyVocabulary.push({
            word: cand,
            partOfSpeech: "term",
            vietnamese: `Thuật ngữ: ${cand}`,
            cefr: "B2"
          });
        }
      }
    }

    return {
      id: url,
      title,
      link: url,
      pubDate,
      category: "VnExpress International",
      lead,
      thumbnail,
      caption,
      paragraphs,
      wordCount,
      cefrLevel,
      keyVocabulary: keyVocabulary.slice(0, 10)
    };
  } catch (error) {
    console.error(`Error parsing article ${url}:`, error);
    return null;
  }
}
