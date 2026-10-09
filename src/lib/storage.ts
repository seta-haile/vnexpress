import { SavedWord, UserLearningStats } from "@/types/news";
import { VoicePreset } from "./voice";

const STORAGE_KEYS = {
  SAVED_WORDS: "vne_learning_saved_words_v1",
  STATS: "vne_learning_stats_v1",
  READER_SETTINGS: "vne_learning_reader_settings_v1",
  BOOKMARKS: "vne_learning_bookmarks_v1"
};

export interface AppSettings {
  theme: 'light' | 'dark';
  showImages: boolean;
  voicePreset: VoicePreset;
  voiceURI?: string;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'light',
  showImages: true,
  voicePreset: 'female-mature',
  voiceURI: ''
};

export function getAppSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_APP_SETTINGS;
  try {
    const raw = localStorage.getItem("vne_app_settings_v1");
    return raw ? { ...DEFAULT_APP_SETTINGS, ...JSON.parse(raw) } : DEFAULT_APP_SETTINGS;
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export function saveAppSettings(settings: Partial<AppSettings>): AppSettings {
  const current = getAppSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem("vne_app_settings_v1", JSON.stringify(updated));
  return updated;
}

export interface ReaderSettings {
  fontSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  fontFamily: 'serif' | 'sans';
  readerTheme: 'light' | 'sepia' | 'dark';
  highlightCefr: boolean;
  highlightLevel: 'all' | 'B1' | 'B2' | 'C1';
  speechRate: number; // 0.75, 1.0, 1.25
  autoTranslateSentence: boolean;
  voicePreset?: VoicePreset;
  voiceURI?: string;
}

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 'lg',
  fontFamily: 'serif',
  readerTheme: 'light',
  highlightCefr: true,
  highlightLevel: 'all',
  speechRate: 1.0,
  autoTranslateSentence: false,
  voicePreset: 'female-mature',
  voiceURI: ''
};

export function getSavedWords(): SavedWord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_WORDS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveWord(word: Omit<SavedWord, "id" | "savedAt" | "mastery">): SavedWord {
  const words = getSavedWords();
  const existingIdx = words.findIndex(w => w.word.toLowerCase() === word.word.toLowerCase());
  
  if (existingIdx >= 0) {
    // Already saved, return existing
    return words[existingIdx];
  }

  const newSaved: SavedWord = {
    ...word,
    id: `word-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    savedAt: new Date().toISOString(),
    mastery: 'new'
  };

  words.unshift(newSaved);
  localStorage.setItem(STORAGE_KEYS.SAVED_WORDS, JSON.stringify(words));
  
  // Update words learned stat
  incrementWordsCount();

  return newSaved;
}

export function removeSavedWord(id: string): void {
  const words = getSavedWords().filter(w => w.id !== id);
  localStorage.setItem(STORAGE_KEYS.SAVED_WORDS, JSON.stringify(words));
}

export function updateWordMastery(id: string, mastery: 'new' | 'learning' | 'mastered'): void {
  const words = getSavedWords().map(w => w.id === id ? { ...w, mastery } : w);
  localStorage.setItem(STORAGE_KEYS.SAVED_WORDS, JSON.stringify(words));
}

export function isWordSaved(rawWord: string): boolean {
  const words = getSavedWords();
  const clean = rawWord.toLowerCase().trim();
  return words.some(w => w.word.toLowerCase() === clean);
}

// User Stats & Daily Streak
export function getUserStats(): UserLearningStats {
  if (typeof window === "undefined") {
    return {
      articlesRead: 0,
      wordsLearned: 0,
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split("T")[0],
      dailyGoal: 5,
      readArticleIds: []
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    const today = new Date().toISOString().split("T")[0];
    
    if (!raw) {
      const initial: UserLearningStats = {
        articlesRead: 0,
        wordsLearned: getSavedWords().length,
        streakDays: 1,
        lastActiveDate: today,
        dailyGoal: 5,
        readArticleIds: []
      };
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(initial));
      return initial;
    }

    const stats: UserLearningStats = JSON.parse(raw);
    
    // Check streak
    if (stats.lastActiveDate !== today) {
      const last = new Date(stats.lastActiveDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        stats.streakDays += 1;
      } else if (diffDays > 1) {
        stats.streakDays = 1;
      }
      stats.lastActiveDate = today;
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    }

    return stats;
  } catch (e) {
    return {
      articlesRead: 0,
      wordsLearned: 0,
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split("T")[0],
      dailyGoal: 5,
      readArticleIds: []
    };
  }
}

export function markArticleRead(articleId: string): void {
  const stats = getUserStats();
  if (!stats.readArticleIds.includes(articleId)) {
    stats.readArticleIds.push(articleId);
    stats.articlesRead += 1;
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }
}

function incrementWordsCount(): void {
  const stats = getUserStats();
  stats.wordsLearned = getSavedWords().length;
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
}

// Reader Settings
export function getReaderSettings(): ReaderSettings {
  if (typeof window === "undefined") return DEFAULT_READER_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.READER_SETTINGS);
    return raw ? { ...DEFAULT_READER_SETTINGS, ...JSON.parse(raw) } : DEFAULT_READER_SETTINGS;
  } catch (e) {
    return DEFAULT_READER_SETTINGS;
  }
}

export function saveReaderSettings(settings: Partial<ReaderSettings>): ReaderSettings {
  const current = getReaderSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEYS.READER_SETTINGS, JSON.stringify(updated));
  return updated;
}
