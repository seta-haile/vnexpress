import { WordDefinition } from "@/types/news";

// High-frequency curated vocabulary bank for news & academic English with Vietnamese meanings & CEFR levels
export const CURATED_VOCAB: Record<string, {
  ipa: string;
  pos: string;
  vi: string;
  en: string;
  cefr: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  example?: string;
}> = {
  // Business & Economy
  inflation: { ipa: "/ɪnˈfleɪʃn/", pos: "noun", vi: "lạm phát", en: "A general increase in prices and fall in the purchasing value of money.", cefr: "B2", example: "Inflation slowed down significantly last quarter." },
  economy: { ipa: "/ɪˈkɒnəmi/", pos: "noun", vi: "nền kinh tế", en: "The state of a country or region in terms of the production and consumption of goods.", cefr: "B1", example: "Vietnam's economy grew rapidly this year." },
  economic: { ipa: "/ˌiːkəˈnɒmɪk/", pos: "adj", vi: "thuộc về kinh tế", en: "Relating to economics or the economy.", cefr: "B1", example: "Economic policies are driving growth." },
  billionaire: { ipa: "/ˌbɪljəˈneə(r)/", pos: "noun", vi: "tỷ phú", en: "A person possessing assets worth at least a billion dollars.", cefr: "B1", example: "He is one of the richest billionaires in Southeast Asia." },
  investment: { ipa: "/ɪnˈvestmənt/", pos: "noun", vi: "sự đầu tư, khoản đầu tư", en: "The action or process of investing money for profit.", cefr: "B1", example: "Foreign investment poured into tech companies." },
  investor: { ipa: "/ɪnˈvestə(r)/", pos: "noun", vi: "nhà đầu tư", en: "A person or organization that puts money into financial schemes or property.", cefr: "B1", example: "Investors welcomed the government's tax cuts." },
  export: { ipa: "/ˈekspɔːt/", pos: "noun/verb", vi: "xuất khẩu", en: "Send goods or services to another country for sale.", cefr: "B1", example: "Exports of electronics reached record levels." },
  import: { ipa: "/ˈɪmpɔːt/", pos: "noun/verb", vi: "nhập khẩu", en: "Bring goods or services into a country from abroad.", cefr: "B1", example: "Vietnam reduced tariffs on agricultural imports." },
  revenue: { ipa: "/ˈrevənjuː/", pos: "noun", vi: "doanh thu", en: "Income, especially when of a company or organization and of a substantial nature.", cefr: "B2", example: "Total revenue surged by 25% year-on-year." },
  profit: { ipa: "/ˈprɒfɪt/", pos: "noun", vi: "lợi nhuận", en: "A financial gain, especially the difference between the amount earned and spent.", cefr: "B1", example: "Net profit hit a historic high." },
  acquisition: { ipa: "/ˌækwɪˈzɪʃn/", pos: "noun", vi: "thương vụ mua lại, sự tiếp quản", en: "An asset or object bought or obtained, or the act of acquiring.", cefr: "C1", example: "The corporate acquisition will reshape the retail market." },
  subsidiary: { ipa: "/səbˈsɪdiəri/", pos: "noun", vi: "công ty con", en: "A company controlled by a holding company.", cefr: "B2", example: "The subsidiary reported strong third-quarter profits." },
  reit: { ipa: "/riːt/", pos: "noun", vi: "quỹ đầu tư bất động sản (Real Estate Investment Trust)", en: "A company that owns, operates, or finances income-generating real estate.", cefr: "B2", example: "The REIT announced dividend distributions for investors." },
  property: { ipa: "/ˈprɒpəti/", pos: "noun", vi: "bất động sản, tài sản", en: "A building or buildings and the surrounding land.", cefr: "B1", example: "Prices in the prime property segment remained stable." },
  diligence: { ipa: "/ˈdɪlɪdʒəns/", pos: "noun", vi: "sự thẩm định, sự cẩn trọng", en: "Careful and persistent work or effort.", cefr: "C1", example: "Due diligence was conducted prior to signing the agreement." },
  infrastructure: { ipa: "/ˈɪnfrəstrʌktʃə(r)/", pos: "noun", vi: "cơ sở hạ tầng", en: "The basic physical and organizational structures needed for the operation of a society.", cefr: "B2", example: "Significant funding is directed towards metro infrastructure." },
  currency: { ipa: "/ˈkʌrənsi/", pos: "noun", vi: "tiền tệ", en: "A system of money in general use in a particular country.", cefr: "B1", example: "The domestic currency remained stable." },
  forecast: { ipa: "/ˈfɔːkɑːst/", pos: "noun/verb", vi: "dự báo", en: "Predict or estimate a future event or trend.", cefr: "B1", example: "Analysts forecast strong fourth-quarter performance." },

  // Tech & Innovation
  artificial: { ipa: "/ˌɑːtɪˈfɪʃl/", pos: "adj", vi: "nhân tạo", en: "Made or produced by human beings rather than occurring naturally.", cefr: "B1", example: "Artificial intelligence is revolutionizing daily workflow." },
  intelligence: { ipa: "/ɪnˈtelɪdʒəns/", pos: "noun", vi: "trí thông minh, trí tuệ", en: "The ability to acquire and apply knowledge and skills.", cefr: "B1", example: "Machine learning relies on pattern intelligence." },
  innovation: { ipa: "/ˌɪnəˈveɪʃn/", pos: "noun", vi: "đổi mới sáng tạo", en: "A new method, idea, or product.", cefr: "B2", example: "Technological innovation fuels business success." },
  semiconductor: { ipa: "/ˌsemikənˈdʌktə(r)/", pos: "noun", vi: "chất bán dẫn, vi mạch", en: "A solid substance that conducts electricity under some conditions.", cefr: "C1", example: "Vietnam is emerging as a global semiconductor hub." },
  automated: { ipa: "/ˈɔːtəmeɪtɪd/", pos: "adj", vi: "tự động hóa", en: "Operated by largely automatic equipment.", cefr: "B2", example: "The city plans to introduce driverless, automated trains." },
  revolution: { ipa: "/ˌrevəˈluːʃn/", pos: "noun", vi: "cuộc cách mạng", en: "A dramatic and wide-reaching change in conditions, attitudes, or operation.", cefr: "B2", example: "The digital revolution touched every industry." },
  sustainable: { ipa: "/səˈsteɪnəbl/", pos: "adj", vi: "bền vững", en: "Able to be maintained at a certain rate or level without exhausting natural resources.", cefr: "B2", example: "Sustainable green development is our top priority." },

  // News & Environment
  pollute: { ipa: "/pəˈluːt/", pos: "verb", vi: "làm ô nhiễm", en: "Contaminate water, the air, or a place with harmful substances.", cefr: "B1", example: "Emissions continue to pollute urban air." },
  pollution: { ipa: "/pəˈluːʃn/", pos: "noun", vi: "sự ô nhiễm", en: "The presence in or introduction into the environment of a substance with harmful effects.", cefr: "B1", example: "Air pollution spiked during the dry season." },
  wildfire: { ipa: "/ˈwaɪldfaɪə(r)/", pos: "noun", vi: "cháy rừng", en: "A large, destructive fire that spreads quickly over woodland or brush.", cefr: "B2", example: "Haze from regional wildfires covered neighboring cities." },
  flood: { ipa: "/flʌd/", pos: "noun/verb", vi: "lũ lụt, ngập úng", en: "An overflow of a large amount of water beyond its normal limits.", cefr: "B1", example: "Heavy tides caused flooding across low-lying districts." },
  tide: { ipa: "/taɪd/", pos: "noun", vi: "thủy triều", en: "The alternate rising and falling of the sea.", cefr: "B1", example: "High tides exacerbated street waterlogging." },
  crisis: { ipa: "/ˈkraɪsɪs/", pos: "noun", vi: "cuộc khủng hoảng", en: "A time of intense difficulty, trouble, or danger.", cefr: "B2", example: "The housing crisis has prompted nationwide protests." },
  struggle: { ipa: "/ˈstrʌɡl/", pos: "verb/noun", vi: "vật lộn, chật vật", en: "Make forceful or violent efforts to get free of restraint or overcome difficulty.", cefr: "B1", example: "Municipal authorities struggle to upgrade old drains." },
  intensify: { ipa: "/ɪnˈtensɪfaɪ/", pos: "verb", vi: "gia tăng, làm mạnh thêm", en: "Become or make more intense.", cefr: "C1", example: "Tropical storms intensify rapidly over warm oceans." },

  // Travel & Lifestyle
  destination: { ipa: "/ˌdestɪˈneɪʃn/", pos: "noun", vi: "điểm đến", en: "The place to which someone or something is going or being sent.", cefr: "B1", example: "Da Nang was voted the most hospitable travel destination." },
  heritage: { ipa: "/ˈherɪtɪdʒ/", pos: "noun", vi: "di sản", en: "Property or culture that is or may be inherited.", cefr: "B2", example: "Hoi An ancient town is a UNESCO world heritage site." },
  hospitality: { ipa: "/ˌhɒspɪˈtæləti/", pos: "noun", vi: "sự hiếu khách, ngành khách sạn", en: "The friendly and generous reception and entertainment of guests or visitors.", cefr: "B2", example: "Vietnam is renowned for its warm hospitality." },
  cuisine: { ipa: "/kwɪˈziːn/", pos: "noun", vi: "ẩm thực", en: "A style or method of cooking, especially as characteristic of a particular country or region.", cefr: "B2", example: "Traditional Vietnamese cuisine balances fresh herbs and savory broths." },
  scenic: { ipa: "/ˈsiːnɪk/", pos: "adj", vi: "đẹp mắt, danh lam thắng cảnh", en: "Providing or relating to views of impressive or beautiful natural scenery.", cefr: "B2", example: "Visitors enjoyed the scenic mountain passes in Ha Giang." }
};

export function cleanWord(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, "")
    .trim();
}

export function detectCEFRLevel(word: string): 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' {
  const cleaned = cleanWord(word);
  if (CURATED_VOCAB[cleaned]) {
    return CURATED_VOCAB[cleaned].cefr;
  }
  
  if (cleaned.length <= 4) return 'A1';
  if (cleaned.length <= 6) return 'A2';
  if (cleaned.length <= 8) return 'B1';
  if (cleaned.length <= 10) return 'B2';
  return 'C1';
}

export async function lookupWord(rawText: string): Promise<WordDefinition> {
  const query = rawText.trim().replace(/^[^\w]+|[^\w]+$/g, "");
  if (!query) {
    return { word: rawText, vietnameseMeaning: "Không có dữ liệu" };
  }

  const cleanedWord = cleanWord(query);

  // 1. Check curated vocab first for instant response
  const curated = CURATED_VOCAB[cleanedWord];
  if (curated) {
    return {
      word: query,
      phonetic: curated.ipa,
      partOfSpeech: curated.pos,
      vietnameseMeaning: curated.vi,
      englishMeaning: curated.en,
      example: curated.example,
      cefr: curated.cefr
    };
  }

  let result: WordDefinition = {
    word: query,
    cefr: detectCEFRLevel(query)
  };

  // 2. Fetch Vietnamese meaning via Google Translate API with browser User-Agent
  try {
    const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&dt=md&q=${encodeURIComponent(query)}`;
    const gRes = await fetch(gUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/javascript, */*"
      },
      signal: AbortSignal.timeout(3500)
    });

    if (gRes.ok) {
      const rawText = await gRes.text();
      if (rawText.startsWith("[")) {
        const gData = JSON.parse(rawText);
        // Extract Vietnamese meaning
        if (Array.isArray(gData[0])) {
          const translatedParts = gData[0].map((part: any) => part[0]).filter(Boolean);
          if (translatedParts.length > 0) {
            result.vietnameseMeaning = translatedParts.join(" ").trim();
          }
        }

        // Extract Part of Speech and additional meanings
        if (Array.isArray(gData[1]) && gData[1].length > 0) {
          const firstEntry = gData[1][0];
          result.partOfSpeech = firstEntry[0]; // e.g. "noun", "verb", "adjective"
          if (Array.isArray(firstEntry[1]) && firstEntry[1].length > 0) {
            result.synonyms = firstEntry[1].slice(0, 4);
          }
        }
      }
    }
  } catch (err) {
    console.warn("Google Translate lookup failed:", err);
  }

  // 3. Fallback to MyMemory if Vietnamese meaning is still missing
  if (!result.vietnameseMeaning) {
    try {
      const mUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=en|vi`;
      const mRes = await fetch(mUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        },
        signal: AbortSignal.timeout(3000)
      });
      if (mRes.ok) {
        const mData = await mRes.json();
        if (mData.responseData?.translatedText && mData.responseData.translatedText !== query) {
          result.vietnameseMeaning = mData.responseData.translatedText.trim();
        }
      }
    } catch (err) {
      console.warn("MyMemory fallback failed:", err);
    }
  }

  // 4. Concurrently fetch dictionaryapi.dev (for IPA & Audio)
  if (!query.includes(" ")) {
    try {
      const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanedWord)}`, {
        signal: AbortSignal.timeout(1500)
      });

      if (dictRes.ok) {
        const data = await dictRes.json();
        if (Array.isArray(data) && data[0]) {
          const item = data[0];
          const audioObj = item.phonetics?.find((p: any) => p.audio && p.audio.length > 0);
          const phoneticText = item.phonetic || item.phonetics?.find((p: any) => p.text)?.text;
          const meaningObj = item.meanings?.[0];
          const defObj = meaningObj?.definitions?.[0];

          if (audioObj?.audio) result.audio = audioObj.audio;
          if (phoneticText) result.phonetic = phoneticText;
          if (meaningObj?.partOfSpeech && !result.partOfSpeech) result.partOfSpeech = meaningObj.partOfSpeech;
          if (defObj?.definition) result.englishMeaning = defObj.definition;
          if (defObj?.example) result.example = defObj.example;
        }
      }
    } catch {
      // dictionaryapi timeout/failure ignored smoothly
    }
  }

  // Final fallback
  if (!result.vietnameseMeaning) {
    result.vietnameseMeaning = query;
  }

  return result;
}

export async function translateSentence(sentence: string): Promise<string> {
  const trimmed = sentence.trim();
  if (!trimmed) return "";

  // 1. Google Translate
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/javascript, */*"
      },
      signal: AbortSignal.timeout(4000)
    });

    if (res.ok) {
      const rawText = await res.text();
      if (rawText.startsWith("[")) {
        const data = JSON.parse(rawText);
        if (Array.isArray(data[0])) {
          return data[0].map((item: any) => item[0]).filter(Boolean).join("").trim();
        }
      }
    }
  } catch (e) {
    console.error("Google Translation error:", e);
  }

  // 2. Fallback to MyMemory if Google Translate fails
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|vi`,
      { 
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
        signal: AbortSignal.timeout(3000) 
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.responseData?.translatedText) {
        return data.responseData.translatedText.trim();
      }
    }
  } catch (e) {
    console.error("MyMemory Translation error:", e);
  }

  return "Bản dịch đang được cập nhật.";
}
