import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { ArticleDetail, ArticleParagraph, KeyVocab } from "@/types/news";
import { estimateCEFR } from "@/lib/rss";
import { CURATED_VOCAB, cleanWord } from "@/lib/dictionary";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { success: false, error: "Missing 'url' query parameter" },
        { status: 400 }
      );
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      next: { revalidate: 600 }
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to load article: ${res.statusText}` },
        { status: res.status }
      );
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

    const articleDetail: ArticleDetail = {
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

    return NextResponse.json({
      success: true,
      article: articleDetail
    });
  } catch (error: any) {
    console.error("API /api/article error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to parse article" },
      { status: 500 }
    );
  }
}
