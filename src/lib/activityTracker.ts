import { getDbPool } from "./db";
import { UserActivityLog, ActivityFilter, AnalyticsSummary } from "@/types/analytics";
import fs from "fs";
import path from "path";

const ACTIVITIES_BACKUP_FILE = path.join(process.cwd(), "data", "activities_backup.json");
const MAX_FALLBACK_ENTRIES = 1000;

function ensureDataDir() {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (err) {
    console.warn("Failed to ensure data directory for activities:", err);
  }
}

export function loadFallbackActivities(): UserActivityLog[] {
  try {
    if (fs.existsSync(ACTIVITIES_BACKUP_FILE)) {
      const raw = fs.readFileSync(ACTIVITIES_BACKUP_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("Could not read activities backup file:", err);
  }
  return [];
}

export function saveFallbackActivities(list: UserActivityLog[]): void {
  try {
    ensureDataDir();
    const trimmed = list.slice(0, MAX_FALLBACK_ENTRIES);
    fs.writeFileSync(ACTIVITIES_BACKUP_FILE, JSON.stringify(trimmed, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write activities backup file:", err);
  }
}

// Ensure database table and indexes exist
let isTableInitialized = false;
export async function ensureActivityTable(): Promise<void> {
  if (isTableInitialized) return;
  const pool = getDbPool();
  if (!pool) return;

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_activities (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(64),
        user_email VARCHAR(255),
        user_name VARCHAR(255),
        action_type VARCHAR(64) NOT NULL,
        source_id VARCHAR(64),
        channel_id VARCHAR(64),
        article_title TEXT,
        article_url TEXT,
        article_slug TEXT,
        metadata JSONB DEFAULT '{}'::jsonb,
        device_info VARCHAR(255),
        ip_address VARCHAR(64),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_user_activities_user_email ON user_activities(user_email);
      CREATE INDEX IF NOT EXISTS idx_user_activities_action_type ON user_activities(action_type);
      CREATE INDEX IF NOT EXISTS idx_user_activities_source_id ON user_activities(source_id);
    `);
    isTableInitialized = true;
  } catch (err) {
    console.warn("ensureActivityTable error:", err);
  }
}

export async function logUserActivity(payload: {
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  actionType: string;
  sourceId?: string | null;
  channelId?: string | null;
  articleTitle?: string | null;
  articleUrl?: string | null;
  articleSlug?: string | null;
  metadata?: Record<string, any>;
  deviceInfo?: string | null;
  ipAddress?: string | null;
}): Promise<boolean> {
  const normalizedLog: UserActivityLog = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: payload.userId || null,
    userEmail: payload.userEmail || "guest@anonymous.io",
    userName: payload.userName || "Khách ẩn danh",
    actionType: payload.actionType as any,
    sourceId: payload.sourceId || null,
    channelId: payload.channelId || null,
    articleTitle: payload.articleTitle || null,
    articleUrl: payload.articleUrl || null,
    articleSlug: payload.articleSlug || null,
    metadata: payload.metadata || {},
    deviceInfo: payload.deviceInfo || null,
    ipAddress: payload.ipAddress || null,
    createdAt: new Date().toISOString()
  };

  // 1. Save to local fallback file / memory
  const localList = loadFallbackActivities();
  localList.unshift(normalizedLog);
  saveFallbackActivities(localList);

  // 2. Save to PostgreSQL if connected
  const pool = getDbPool();
  if (pool) {
    try {
      await ensureActivityTable();
      await pool.query(
        `
        INSERT INTO user_activities (
          user_id, user_email, user_name, action_type, source_id, channel_id,
          article_title, article_url, article_slug, metadata, device_info, ip_address, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
        `,
        [
          normalizedLog.userId,
          normalizedLog.userEmail,
          normalizedLog.userName,
          normalizedLog.actionType,
          normalizedLog.sourceId,
          normalizedLog.channelId,
          normalizedLog.articleTitle,
          normalizedLog.articleUrl,
          normalizedLog.articleSlug,
          JSON.stringify(normalizedLog.metadata),
          normalizedLog.deviceInfo,
          normalizedLog.ipAddress
        ]
      );
      return true;
    } catch (err) {
      console.warn("DB logUserActivity error:", err);
    }
  }

  return true;
}

export async function getAnalyticsSummary(filter?: ActivityFilter): Promise<AnalyticsSummary> {
  const pool = getDbPool();
  let activities: UserActivityLog[] = [];

  if (pool) {
    try {
      await ensureActivityTable();
      let query = `SELECT * FROM user_activities`;
      const whereClauses: string[] = [];
      const values: any[] = [];

      if (filter?.userEmail) {
        values.push(`%${filter.userEmail.toLowerCase()}%`);
        whereClauses.push(`LOWER(user_email) LIKE $${values.length}`);
      }
      if (filter?.actionType && filter.actionType !== "ALL") {
        values.push(filter.actionType);
        whereClauses.push(`action_type = $${values.length}`);
      }
      if (filter?.sourceId && filter.sourceId !== "all") {
        values.push(filter.sourceId);
        whereClauses.push(`source_id = $${values.length}`);
      }
      if (filter?.searchQuery) {
        values.push(`%${filter.searchQuery.toLowerCase()}%`);
        whereClauses.push(`(LOWER(article_title) LIKE $${values.length} OR LOWER(user_name) LIKE $${values.length} OR LOWER(user_email) LIKE $${values.length})`);
      }

      if (whereClauses.length > 0) {
        query += ` WHERE ` + whereClauses.join(" AND ");
      }

      query += ` ORDER BY created_at DESC LIMIT 500;`;

      const res = await pool.query(query, values);
      activities = res.rows.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        userEmail: r.user_email,
        userName: r.user_name,
        actionType: r.action_type,
        sourceId: r.source_id,
        channelId: r.channel_id,
        articleTitle: r.article_title,
        articleUrl: r.article_url,
        articleSlug: r.article_slug,
        metadata: r.metadata || {},
        deviceInfo: r.device_info,
        ipAddress: r.ip_address,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
      }));
    } catch (err) {
      console.warn("DB getAnalyticsSummary error:", err);
      activities = loadFallbackActivities();
    }
  } else {
    activities = loadFallbackActivities();
  }

  // Filter fallback list if DB was not used
  if (!pool && filter) {
    if (filter.userEmail) {
      activities = activities.filter((a) => a.userEmail?.toLowerCase().includes(filter.userEmail!.toLowerCase()));
    }
    if (filter.actionType && filter.actionType !== "ALL") {
      activities = activities.filter((a) => a.actionType === filter.actionType);
    }
    if (filter.sourceId && filter.sourceId !== "all") {
      activities = activities.filter((a) => a.sourceId === filter.sourceId);
    }
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      activities = activities.filter((a) => 
        (a.articleTitle && a.articleTitle.toLowerCase().includes(q)) ||
        (a.userEmail && a.userEmail.toLowerCase().includes(q)) ||
        (a.userName && a.userName.toLowerCase().includes(q))
      );
    }
  }

  // Aggregate Metrics
  const totalEvents = activities.length;
  const totalReads = activities.filter((a) => a.actionType === "READ_ARTICLE").length;
  const totalLookups = activities.filter((a) => a.actionType === "LOOKUP_WORD").length;
  const totalPractices = activities.filter((a) => 
    ["PRACTICE_DICTATION", "PRACTICE_QUIZ", "PRACTICE_FLASHCARDS", "SPEED_READING"].includes(a.actionType)
  ).length;

  const uniqueEmails = new Set(activities.map((a) => a.userEmail || "guest@anonymous.io"));
  const uniqueUsersCount = uniqueEmails.size;

  // Top Sources Aggregation
  const sourceCountMap: Record<string, number> = {};
  activities.forEach((a) => {
    if (a.sourceId) {
      sourceCountMap[a.sourceId] = (sourceCountMap[a.sourceId] || 0) + 1;
    }
  });
  const totalSourceEvents = Object.values(sourceCountMap).reduce((acc, c) => acc + c, 0) || 1;
  const topSources = Object.entries(sourceCountMap)
    .map(([sourceId, count]) => ({
      sourceId,
      count,
      percentage: Math.round((count / totalSourceEvents) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  // Top Articles Aggregation
  const articleMap: Record<string, { title: string; url?: string; sourceId?: string; readCount: number }> = {};
  activities.forEach((a) => {
    if (a.actionType === "READ_ARTICLE" && a.articleTitle) {
      const key = a.articleTitle.trim();
      if (!articleMap[key]) {
        articleMap[key] = {
          title: a.articleTitle,
          url: a.articleUrl || undefined,
          sourceId: a.sourceId || undefined,
          readCount: 0
        };
      }
      articleMap[key].readCount += 1;
    }
  });
  const topArticles = Object.values(articleMap)
    .sort((a, b) => b.readCount - a.readCount)
    .slice(0, 10);

  // Group User Journeys
  const userJourneyMap: Record<string, {
    userEmail: string;
    userName: string;
    eventCount: number;
    lastActive: string;
    sourceCounts: Record<string, number>;
    events: UserActivityLog[];
  }> = {};

  activities.forEach((a) => {
    const email = a.userEmail || "guest@anonymous.io";
    if (!userJourneyMap[email]) {
      userJourneyMap[email] = {
        userEmail: email,
        userName: a.userName || "Khách ẩn danh",
        eventCount: 0,
        lastActive: a.createdAt,
        sourceCounts: {},
        events: []
      };
    }
    userJourneyMap[email].eventCount += 1;
    if (userJourneyMap[email].events.length < 50) {
      userJourneyMap[email].events.push(a);
    }
    if (a.sourceId) {
      userJourneyMap[email].sourceCounts[a.sourceId] = (userJourneyMap[email].sourceCounts[a.sourceId] || 0) + 1;
    }
  });

  const userJourneys = Object.values(userJourneyMap).map((u) => {
    let topSource: string | undefined;
    let maxCount = 0;
    Object.entries(u.sourceCounts).forEach(([src, cnt]) => {
      if (cnt > maxCount) {
        maxCount = cnt;
        topSource = src;
      }
    });
    return {
      userEmail: u.userEmail,
      userName: u.userName,
      eventCount: u.eventCount,
      lastActive: u.lastActive,
      topSource,
      events: u.events
    };
  }).sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());

  return {
    totalEvents,
    totalReads,
    totalLookups,
    totalPractices,
    uniqueUsersCount,
    topSources,
    topArticles,
    recentActivities: activities.slice(0, 100),
    userJourneys
  };
}
