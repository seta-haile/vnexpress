export interface RssChannel {
  id: string;
  name: string;
  vietnameseName: string;
  url: string;
  badgeColor?: string;
  description: string;
}

export interface PublicationSource {
  id: string; // 'vnexpress' | 'hony'
  name: string;
  shortName: string;
  badge: string;
  tagline: string;
  description: string;
  logoText: string;
  badgeColor: string;
  gradient: string;
  rssUrl: string;
  websiteUrl: string;
  channels: RssChannel[];
  cefrRange: string;
  readingStyle: string;
  coverImage: string;
}

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  guid: string;
  pubDate: string;
  isoDate?: string;
  description: string; // Plain text description
  rawDescription?: string;
  thumbnail: string;
  category: string;
  channelId: string;
  sourceId?: string; // 'vnexpress' | 'hony'
  sourceName?: string; // 'VnExpress International' | 'Humans of New York'
  readingTimeMinutes: number;
  wordCount: number;
  cefrLevel: 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  difficultyScore: number; // 1 to 5
}

export interface ArticleParagraph {
  id: string;
  text: string;
  translation?: string;
}

export interface ArticleDetail {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  category: string;
  lead: string;
  leadTranslation?: string;
  thumbnail: string;
  caption?: string;
  paragraphs: ArticleParagraph[];
  author?: string;
  wordCount: number;
  cefrLevel: 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  keyVocabulary: KeyVocab[];
}

export interface KeyVocab {
  word: string;
  ipa?: string;
  partOfSpeech: string;
  vietnamese: string;
  englishDefinition?: string;
  exampleSentence?: string;
  cefr: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}

export interface WordDefinition {
  word: string;
  phonetic?: string;
  audio?: string;
  partOfSpeech?: string;
  vietnameseMeaning?: string;
  englishMeaning?: string;
  example?: string;
  synonyms?: string[];
  cefr?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}

export interface SavedWord {
  id: string;
  word: string;
  ipa?: string;
  partOfSpeech?: string;
  meaning: string;
  contextSentence: string;
  articleTitle: string;
  articleUrl: string;
  savedAt: string;
  mastery: 'new' | 'learning' | 'mastered';
  notes?: string;
}

export interface UserLearningStats {
  articlesRead: number;
  wordsLearned: number;
  streakDays: number;
  lastActiveDate: string;
  dailyGoal: number;
  readArticleIds: string[];
}
