export type ActivityActionType = 
  | "PAGE_VIEW"
  | "VIEW_SOURCE"
  | "VIEW_CHANNEL"
  | "READ_ARTICLE"
  | "LOOKUP_WORD"
  | "PRACTICE_DICTATION"
  | "PRACTICE_QUIZ"
  | "PRACTICE_FLASHCARDS"
  | "SPEED_READING"
  | "GRAMMAR_BREAKDOWN";

export interface UserActivityLog {
  id: string | number;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  actionType: ActivityActionType;
  sourceId?: string | null;
  channelId?: string | null;
  articleTitle?: string | null;
  articleUrl?: string | null;
  articleSlug?: string | null;
  metadata?: Record<string, any>;
  deviceInfo?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface ActivityFilter {
  userEmail?: string;
  actionType?: string;
  sourceId?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export interface AnalyticsSummary {
  totalEvents: number;
  totalReads: number;
  totalLookups: number;
  totalPractices: number;
  uniqueUsersCount: number;
  topSources: { sourceId: string; count: number; percentage: number }[];
  topArticles: { title: string; url?: string; sourceId?: string; readCount: number }[];
  recentActivities: UserActivityLog[];
  userJourneys: {
    userEmail: string;
    userName: string;
    eventCount: number;
    lastActive: string;
    topSource?: string;
    events: UserActivityLog[];
  }[];
}
