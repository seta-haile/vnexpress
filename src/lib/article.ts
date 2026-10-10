import * as cheerio from "cheerio";
import { ArticleDetail, ArticleParagraph, KeyVocab } from "@/types/news";
import { estimateCEFR } from "@/lib/rss";
import { CURATED_VOCAB, cleanWord } from "@/lib/dictionary";
import { XMLParser } from "fast-xml-parser";
import { getClassicStoryDetail } from "@/lib/classicStories";

async function fetchHonyArticleDetail(url: string): Promise<ArticleDetail | null> {
  const idMatch = url.match(/\/post\/(\d+)|(\d{8,})/);
  const postId = idMatch ? (idMatch[1] || idMatch[2]) : null;

  // 1. Try direct fetch from Tumblr archive JSON API by ID
  if (postId) {
    try {
      const res = await fetch(`https://humansofnyarchive.com/api/read/json?id=${postId}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Accept": "application/json, text/javascript, */*"
        },
        next: { revalidate: 3600 }
      });
      if (res.ok) {
        const raw = await res.text();
        const jsonStr = raw.replace(/^var tumblr_api_read =\s*/, "").replace(/;\s*$/, "");
        const data = JSON.parse(jsonStr);
        const post = data.posts && data.posts[0];
        if (post) {
          const rawCaption = post["photo-caption"] || post["regular-body"] || "";
          const thumbnail = post["photo-url-1280"] || post["photo-url-500"] || "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&auto=format&fit=crop&q=80";

          const bodyHtml = rawCaption.replace(/<img[^>]*>/gi, "");
          const pMatches = bodyHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
          let rawParagraphs: string[] = [];
          if (pMatches && pMatches.length > 0) {
            rawParagraphs = pMatches.map((p: string) => 
              p.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&ldquo;|&rdquo;/g, '"').replace(/&rsquo;/g, "'").replace(/\s+/g, " ").trim()
            ).filter((t: string) => t.length > 0);
          } else {
            rawParagraphs = bodyHtml.split(/<br\s*\/?>/i)
              .map((t: string) => t.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&ldquo;|&rdquo;/g, '"').replace(/&rsquo;/g, "'").replace(/\s+/g, " ").trim())
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

          const firstSentence = paragraphs[0]?.text || "A story from Humans of New York.";
          let cleanTitle = firstSentence.slice(0, 85).trim();
          if (cleanTitle && !cleanTitle.endsWith("...")) {
            cleanTitle += "...";
          }
          if (!cleanTitle.startsWith('"') && !cleanTitle.startsWith('“')) {
            cleanTitle = `"${cleanTitle}`;
          }

          return {
            id: String(post.id),
            title: cleanTitle,
            link: post["url-with-slug"] || post.url || url,
            pubDate: post.date || new Date().toISOString(),
            category: "Humans of NY",
            lead: firstSentence,
            thumbnail,
            caption: "Photo by Brandon Stanton • Humans of New York",
            author: "Brandon Stanton",
            paragraphs: paragraphs.slice(1).length > 0 ? paragraphs.slice(1) : paragraphs,
            wordCount,
            cefrLevel,
            keyVocabulary
          };
        }
      }
    } catch (apiErr) {
      console.warn("fetchHonyArticleDetail by ID failed, falling back to RSS:", apiErr);
    }
  }

  // 2. Fallback to RSS search
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
      if (postId && (link.includes(postId) || guid.includes(postId))) return true;
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
      paragraphs.push({ id: `p-${paragraphs.length}`, text: rawP });
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

async function fetchWikinewsArticleDetail(url: string): Promise<ArticleDetail | null> {
  try {
    let title = "";
    try {
      const u = new URL(url);
      title = decodeURIComponent(u.pathname.replace(/^\/wiki\//, "").replace(/^\//, "").replace(/_/g, " "));
    } catch {
      title = decodeURIComponent(url.replace(/.*wikinews\//, "").replace(/_/g, " "));
    }

    const res = await fetch(`https://en.wikinews.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&format=json&prop=text`, {
      headers: { "User-Agent": "VnEReader/1.0 (studyenglish@vnexpress.reader)" },
      next: { revalidate: 600 }
    });
    if (!res.ok) return null;

    const data = await res.json();
    const rawHtml = data.parse?.text?.["*"] || "";
    if (!rawHtml) return null;

    const $ = cheerio.load(rawHtml);
    $(".toc, .infobox, .navbox, .mw-editsection, .catlinks, .sister-project, script, style").remove();

    const paragraphs: ArticleParagraph[] = [];
    $("p").each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 25 && !text.includes("Have an opinion on this story?") && !text.includes("Wikinews is an open content")) {
        paragraphs.push({ id: `p-${paragraphs.length}`, text });
      }
    });

    if (paragraphs.length === 0) return null;

    const lead = paragraphs[0].text;
    const bodyParagraphs = paragraphs.slice(1).length > 0 ? paragraphs.slice(1) : paragraphs;

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

    return {
      id: url,
      title: title || "Wikinews Story",
      link: url,
      pubDate: new Date().toLocaleDateString("en-US"),
      category: "Wikinews (Wikimedia)",
      lead,
      thumbnail: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&auto=format&fit=crop&q=80",
      caption: "Wikimedia Foundation • Báo chí tự do trung lập (CC BY 2.5)",
      author: "Wikinews Community",
      paragraphs: bodyParagraphs,
      wordCount,
      cefrLevel,
      keyVocabulary: keyVocabulary.slice(0, 10)
    };
  } catch (err) {
    console.error("fetchWikinewsArticleDetail error:", err);
    return null;
  }
}

async function fetchArticleDetailViaProxy(url: string): Promise<ArticleDetail | null> {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(jinaUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/plain"
      },
      signal: controller.signal,
      next: { revalidate: 600 }
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const text = await res.text();

    // Title
    const titleMatch = text.match(/^Title:\s*(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : "Article Detail";

    // Published date
    const dateMatch = text.match(/^Published Time:\s*(.+)$/m);
    const pubDate = dateMatch ? new Date(dateMatch[1].trim()).toLocaleDateString("en-US") : new Date().toLocaleDateString("en-US");

    // Image & Caption
    const allImages = Array.from(text.matchAll(/!\[(.*?)\]\((https:\/\/[^\s)]+)\)/g));
    let thumbnail = "";
    let caption = "";
    for (const m of allImages) {
      const imgUrl = m[2];
      const cap = m[1];
      if (!imgUrl.includes("placeholder") && !imgUrl.includes("logo") && !imgUrl.includes("icon")) {
        thumbnail = imgUrl;
        caption = cap.replace(/^Image\s*\d*:\s*/i, "").trim();
        break;
      }
    }

    // Parse paragraphs from Markdown Content
    const lines = text.split("\n");
    const rawParagraphs: string[] = [];
    let inContent = false;
    let currentP = "";

    for (let line of lines) {
      line = line.trim();
      if (!line) {
        if (currentP.length > 25) {
          rawParagraphs.push(currentP);
        }
        currentP = "";
        continue;
      }
      if (line.startsWith("Markdown Content:")) {
        inContent = true;
        continue;
      }
      if (!inContent) continue;
      if (
        line.startsWith("![") ||
        line.startsWith("URL Source:") ||
        line.startsWith("Published Time:") ||
        line.startsWith("Title:")
      ) {
        continue;
      }
      if (
        line.includes("BBC is not responsible") ||
        line.includes("Sign up for") ||
        line.includes("Copyright") ||
        line.startsWith("Related Topics") ||
        line.includes("Share this article")
      ) {
        continue;
      }
      if ((line.includes("reporter") || line.includes("correspondent")) && line.length < 50) {
        continue;
      }

      currentP = currentP ? `${currentP} ${line}` : line;
    }
    if (currentP.length > 25) rawParagraphs.push(currentP);

    const paragraphs: ArticleParagraph[] = rawParagraphs
      .filter(p => p.length > 30 && !p.startsWith("Image caption") && !p.startsWith("Media caption"))
      .map((p, idx) => ({ id: `p-${idx}`, text: p }));

    if (paragraphs.length === 0) return null;

    const lead = paragraphs[0]?.text || "";

    // Determine category
    let category = "News";
    if (url.includes("theguardian.com")) category = "The Guardian World";
    else if (url.includes("theconversation.com")) category = "The Conversation";
    else if (url.includes("propublica.org")) category = "ProPublica";
    else if (url.includes("globalvoices.org")) category = "Global Voices";
    else if (url.includes("npr.org")) category = "NPR Stories";
    else if (url.includes("bbc.co.uk") || url.includes("bbc.com")) category = "BBC News World";
    else category = "International News";

    // CEFR & Vocab
    const fullText = [lead, ...paragraphs.map(p => p.text)].join(" ");
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
      category,
      lead,
      thumbnail: thumbnail || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80",
      caption: caption || `${category} • Reader Intelligence`,
      paragraphs,
      wordCount,
      cefrLevel,
      keyVocabulary: keyVocabulary.slice(0, 10)
    };
  } catch (err) {
    console.error("fetchArticleDetailViaProxy error:", err);
    return null;
  }
}

export async function fetchArticleDetail(url: string): Promise<ArticleDetail | null> {
  // 1. Classic Stories (Project Gutenberg / Standard Ebooks)
  if (url.includes("gutenberg.org") || url.includes("/gutenberg/") || url.startsWith("gutenberg")) {
    return getClassicStoryDetail(url);
  }

  // 2. Wikinews Open Journalism
  if (url.includes("wikinews.org") || url.includes("/wikinews/")) {
    return fetchWikinewsArticleDetail(url);
  }

  // 3. Humans of New York
  if (url.includes("humansofnyarchive.com") || url.includes("/hony/")) {
    return fetchHonyArticleDetail(url);
  }

  // 4. BBC News (Use fast proxy reader directly because BBC direct connection is restricted by domestic ISPs)
  if (url.includes("bbc.co.uk") || url.includes("bbc.com")) {
    const proxyResult = await fetchArticleDetailViaProxy(url);
    if (proxyResult) return proxyResult;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      signal: controller.signal,
      next: { revalidate: 600 }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Direct fetch failed for ${url} (${res.statusText}), attempting proxy reader fallback...`);
      return await fetchArticleDetailViaProxy(url);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Extract title
    let title = $("h1").first().text().trim() ||
                $("h1.title_post").text().trim() ||
                $("meta[property='og:title']").attr("content") ||
                $("title").text().trim();
    if (url.includes("globalvoices.org")) {
      title = title.replace(/\s*·\s*Global Voices$/, "").trim();
    }

    // Extract lead/summary
    const lead = $("span.lead_post_detail").text().trim() ||
                 $("meta[property='og:description']").attr("content") || 
                 $("meta[name='description']").attr("content") || "";

    // Extract thumbnail image
    let thumbnail = $("meta[property='og:image']").attr("content") || "";
    if (!thumbnail) {
      const firstImg = $(".fck_detail img, article img, .post img").first().attr("src");
      if (firstImg) thumbnail = firstImg;
    }

    // Extract caption
    let caption = $(".caption_thumb_detail_top").text().trim() || 
                  $("figcaption").first().text().trim() || "";
    if (url.includes("globalvoices.org") && !caption) {
      caption = "Global Voices • CC BY 3.0 Open Journalism";
    }

    // Extract pubDate
    const pubDate = $(".date").text().trim() ||
                    $("time").first().text().trim() ||
                    $("meta[name='pubdate']").attr("content") ||
                    new Date().toLocaleDateString("en-US");

    // Extract paragraphs based on source
    const paragraphs: ArticleParagraph[] = [];

    if (url.includes("theguardian.com")) {
      $('div[data-gu-name="body"] p, article p, #maincontent p').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 25 && !text.includes("Explore more on these topics") && !text.includes("First Edition")) {
          paragraphs.push({ id: `p-${paragraphs.length}`, text });
        }
      });
    } else if (url.includes("theconversation.com")) {
      $('div[itemprop="articleBody"] p, .content-body p, article p').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 25 && !text.includes("The Conversation is a nonprofit") && !text.includes("Sign up for our free newsletter")) {
          paragraphs.push({ id: `p-${paragraphs.length}`, text });
        }
      });
    } else if (url.includes("propublica.org")) {
      $('article p, .article-body p, main p').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 25 && !text.includes("ProPublica is a nonprofit") && !text.includes("Sign up for")) {
          paragraphs.push({ id: `p-${paragraphs.length}`, text });
        }
      });
    } else if (url.includes("globalvoices.org")) {
      $('.post p, article p, main p').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 25 && !text.includes("Without the support of readers") && !text.includes("Donate now") && !text.includes("creative commons")) {
          paragraphs.push({ id: `p-${paragraphs.length}`, text });
        }
      });
    } else if (url.includes("npr.org")) {
      $('#storytext p, article p, .storytext p').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 25 && !text.includes("NPR's") && !text.includes("Subscribe to")) {
          paragraphs.push({ id: `p-${paragraphs.length}`, text });
        }
      });
    } else if (url.includes("bbc.co.uk") || url.includes("bbc.com")) {
      $('article p, main p').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 25 && !text.includes("BBC is not responsible") && !text.includes("Sign up for")) {
          paragraphs.push({ id: `p-${paragraphs.length}`, text });
        }
      });
    } else {
      // Default: VnExpress
      $(".fck_detail p.Normal").each((i, el) => {
        const text = $(el).text().trim();
        if (text && !text.startsWith("Related news:") && !text.includes("VnExpress on Google Search")) {
          paragraphs.push({ id: `p-${paragraphs.length}`, text });
        }
      });

      if (paragraphs.length === 0) {
        $(".fck_detail p, article p").each((i, el) => {
          const text = $(el).text().trim();
          if (text && text.length > 20) {
            paragraphs.push({ id: `p-${paragraphs.length}`, text });
          }
        });
      }
    }

    if (paragraphs.length === 0) {
      const fallbackProxy = await fetchArticleDetailViaProxy(url);
      if (fallbackProxy) return fallbackProxy;
    }

    // Determine category / source name
    let category = "News";
    if (url.includes("theguardian.com")) category = "The Guardian World";
    else if (url.includes("theconversation.com")) category = "The Conversation";
    else if (url.includes("propublica.org")) category = "ProPublica";
    else if (url.includes("globalvoices.org")) category = "Global Voices";
    else if (url.includes("npr.org")) category = "NPR Stories";
    else if (url.includes("bbc.co.uk") || url.includes("bbc.com")) category = "BBC News World";
    else category = "VnExpress International";

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

    // Fallback vocabulary
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
      category,
      lead,
      thumbnail,
      caption,
      paragraphs,
      wordCount,
      cefrLevel,
      keyVocabulary: keyVocabulary.slice(0, 10)
    };
  } catch (error) {
    console.warn(`Direct fetch failed for ${url}, fallback to proxy reader...`);
    return await fetchArticleDetailViaProxy(url);
  }
}
