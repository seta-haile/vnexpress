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
  scenic: { ipa: "/ˈsiːnɪk/", pos: "adj", vi: "đẹp mắt, danh lam thắng cảnh", en: "Providing or relating to views of impressive or beautiful natural scenery.", cefr: "B2", example: "Visitors enjoyed the scenic mountain passes in Ha Giang." },

  // Kids, Fables & Science Wonders
  tortoise: { ipa: "/ˈtɔːtəs/", pos: "noun", vi: "con rùa (cạn)", en: "A slow-moving reptile with a hard round shell.", cefr: "A1", example: "The patient tortoise won the race against the hare." },
  hare: { ipa: "/heə(r)/", pos: "noun", vi: "con thỏ rừng", en: "A fast-running animal like a large rabbit with long ears.", cefr: "A1", example: "The swift hare ran across the green field." },
  shepherd: { ipa: "/ˈʃepəd/", pos: "noun", vi: "người chăn cừu", en: "A person whose job is to take care of sheep.", cefr: "A2", example: "The young shepherd watched his flock on the hillside." },
  fable: { ipa: "/ˈfeɪbl/", pos: "noun", vi: "truyện ngụ ngôn", en: "A short story, typically with animals as characters, conveying a moral.", cefr: "A2", example: "Aesop's fables teach valuable life lessons." },
  creature: { ipa: "/ˈkriːtʃə(r)/", pos: "noun", vi: "sinh vật, con vật", en: "An animal or living being, as distinct from a human.", cefr: "A2", example: "The little mouse was a helpful creature." },
  kindness: { ipa: "/ˈkaɪndnəs/", pos: "noun", vi: "lòng tốt, sự tử tế", en: "The quality of being friendly, generous, and considerate.", cefr: "A1", example: "A small act of kindness can change a life." },
  patient: { ipa: "/ˈpeɪʃnt/", pos: "adj", vi: "kiên nhẫn, kiên trì", en: "Able to accept or tolerate delays or suffering without getting angry.", cefr: "A2", example: "Be patient and practice every day." },
  greedy: { ipa: "/ˈɡriːdi/", pos: "adj", vi: "tham lam", en: "Having an excessive desire for more food, money, or possessions.", cefr: "A2", example: "Do not be greedy with your toys." },
  clever: { ipa: "/ˈklevə(r)/", pos: "adj", vi: "thông minh, khéo léo", en: "Quick to understand, learn, and devise or apply ideas.", cefr: "A1", example: "The clever fox tried to reach the grapes." },
  whisper: { ipa: "/ˈwɪspə(r)/", pos: "verb/noun", vi: "thì thầm", en: "Speak very softly using one's breath without vibrating vocal cords.", cefr: "A2", example: "She whispered a secret in my ear." },
  breeze: { ipa: "/briːz/", pos: "noun", vi: "làn gió nhẹ, gió mát", en: "A gentle wind.", cefr: "A2", example: "A cool summer breeze blew through the garden." },
  atmosphere: { ipa: "/ˈætməsfɪə(r)/", pos: "noun", vi: "bầu khí quyển", en: "The envelope of gases surrounding the earth or another planet.", cefr: "B1", example: "The Earth's atmosphere protects us from harmful radiation." },
  scattering: { ipa: "/ˈskætərɪŋ/", pos: "noun", vi: "sự tán xạ (ánh sáng)", en: "The process in which particles or light rays are deflected in various directions.", cefr: "B1", example: "Rayleigh scattering makes the sky look blue." },
  nectar: { ipa: "/ˈnektə(r)/", pos: "noun", vi: "mật hoa", en: "A sugary fluid secreted within flowers to encourage pollination by insects.", cefr: "A2", example: "Honeybees sip sweet nectar from colorful blossoms." },
  predator: { ipa: "/ˈpredətə(r)/", pos: "noun", vi: "động vật ăn thịt, thú săn mồi", en: "An animal that naturally preys on others.", cefr: "B1", example: "The T-Rex was a mighty prehistoric predator." },
  enormous: { ipa: "/ɪˈnɔːməs/", pos: "adj", vi: "to lớn, khổng lồ", en: "Very large in size, quantity, or extent.", cefr: "A2", example: "Blue whales are enormous sea mammals." },
  magnificent: { ipa: "/mæɡˈnɪfɪsnt/", pos: "adj", vi: "tráng lệ, tuyệt vời", en: "Extremely beautiful, elaborate, or impressive.", cefr: "B1", example: "The solar eclipse was a magnificent view." },
  terrified: { ipa: "/ˈterɪfaɪd/", pos: "adj", vi: "kinh hãi, khiếp sợ", en: "Cause to feel extreme fear.", cefr: "A2", example: "The little mouse was terrified of the roaring lion." },
  shiver: { ipa: "/ˈʃɪvə(r)/", pos: "verb", vi: "run rẩy (vì lạnh hoặc sợ)", en: "Shake slightly and uncontrollably as a result of being cold or frightened.", cefr: "A2", example: "The poor grasshopper shivered in the winter snow." },

  // Gaming, Play & Tech for Kids
  minecraft: { ipa: "/ˈmaɪnkrɑːft/", pos: "noun", vi: "trò chơi thế giới khối vuông Minecraft", en: "A popular 3D sandbox video game about mining blocks and building structures.", cefr: "A1", example: "Kids love playing Minecraft to build creative castles." },
  roblox: { ipa: "/ˈroʊblɒks/", pos: "noun", vi: "vũ trụ game trực tuyến Roblox", en: "An online platform where users can program and play games created by others.", cefr: "A1", example: "Roblox allows players to design their own virtual worlds." },
  cube: { ipa: "/kjuːb/", pos: "noun", vi: "khối lập phương, khối vuông", en: "A symmetrical three-dimensional shape, either solid or hollow, contained by six equal squares.", cefr: "A1", example: "Minecraft is made of millions of 3D cubes." },
  pixel: { ipa: "/ˈpɪksl/", pos: "noun", vi: "điểm ảnh (pixel)", en: "A minute area of illumination on a display screen.", cefr: "A2", example: "Classic retro games used colorful 8-bit pixels." },
  crafting: { ipa: "/ˈkrɑːftɪŋ/", pos: "noun", vi: "chế tạo vật phẩm (trong game)", en: "The skill of making things, especially combining raw materials in video games.", cefr: "A2", example: "Crafting a diamond pickaxe requires sticks and diamonds." },
  avatar: { ipa: "/ˈævətɑː(r)/", pos: "noun", vi: "nhân vật đại diện (avatar)", en: "An icon or figure representing a particular person in video games and internet forums.", cefr: "A2", example: "You can dress up your avatar with cool hats and shoes." },
  multiplayer: { ipa: "/ˈmʌltipleɪə(r)/", pos: "adj", vi: "chơi nhiều người cùng lúc", en: "Denoting a video game designed for more than one player at the same time.", cefr: "A2", example: "Playing multiplayer games with classmates is super fun." },
  strategy: { ipa: "/ˈstrætədʒi/", pos: "noun", vi: "chiến thuật, chiến lược", en: "A plan of action designed to achieve a long-term or overall aim.", cefr: "B1", example: "Winning in chess requires patience and smart strategy." },
  puzzle: { ipa: "/ˈpʌzl/", pos: "noun", vi: "trò chơi giải đố, câu đố trí tuệ", en: "A game, toy, or problem designed to test ingenuity or knowledge.", cefr: "A2", example: "Solving jigsaw puzzles exercises the young mind." },
  obstacle: { ipa: "/ˈɒbstəkl/", pos: "noun", vi: "chướng ngại vật", en: "A thing that blocks one's way or prevents or hinders progress.", cefr: "B1", example: "Run through the obstacle course without falling!" },
  invincible: { ipa: "/ɪnˈvɪnsəbl/", pos: "adj", vi: "bất khả chiến bại, vô địch", en: "Too powerful to be defeated or overcome.", cefr: "B2", example: "Mario grabbed the Super Star and became invincible." },
  architect: { ipa: "/ˈɑːkɪtekt/", pos: "noun", vi: "kiến trúc sư", en: "A person who designs buildings and in many cases also supervises their construction.", cefr: "B1", example: "Building complex Lego models inspires future architects." },
  glitch: { ipa: "/ɡlɪtʃ/", pos: "noun", vi: "lỗi nhỏ trong phần mềm/game", en: "A sudden, usually temporary malfunction or fault in equipment.", cefr: "B1", example: "Game testers play levels repeatedly to fix visual glitches." },
  opponent: { ipa: "/əˈpəʊnənt/", pos: "noun", vi: "đối thủ", en: "Someone who competes with or opposes another in a contest, game, or argument.", cefr: "B1", example: "Shake hands with your opponent before a chess match." }
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
