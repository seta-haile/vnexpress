import { DEFAULT_SITE_SETTINGS, SiteSettings } from "./siteSettings";
import { getDbPool } from "./db";
import fs from "fs";
import path from "path";

const FALLBACK_FILE_PATH = path.join("/tmp", "vne_site_settings.json");

// In-memory cache for fast response
let inMemorySettings: SiteSettings | null = null;

export async function getGlobalSiteSettings(): Promise<SiteSettings> {
  // 1. Try DB first
  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS site_settings (
          key VARCHAR(64) PRIMARY KEY,
          value JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      const res = await pool.query(`SELECT value FROM site_settings WHERE key = 'global' LIMIT 1;`);
      if (res.rows.length > 0 && res.rows[0].value) {
        const val = res.rows[0].value as Partial<SiteSettings>;
        inMemorySettings = {
          ...DEFAULT_SITE_SETTINGS,
          ...val,
          enabledSources: Array.isArray(val.enabledSources) && val.enabledSources.length > 0
            ? val.enabledSources
            : DEFAULT_SITE_SETTINGS.enabledSources
        };
        return inMemorySettings;
      }
    } catch (err) {
      console.warn("DB getGlobalSiteSettings error:", err);
    }
  }

  // 2. Try in-memory cache
  if (inMemorySettings) {
    return inMemorySettings;
  }

  // 3. Try fallback file
  try {
    if (fs.existsSync(FALLBACK_FILE_PATH)) {
      const raw = fs.readFileSync(FALLBACK_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      const fileSettings: SiteSettings = {
        ...DEFAULT_SITE_SETTINGS,
        ...parsed,
        enabledSources: Array.isArray(parsed.enabledSources) && parsed.enabledSources.length > 0
          ? parsed.enabledSources
          : DEFAULT_SITE_SETTINGS.enabledSources
      };
      inMemorySettings = fileSettings;
      return fileSettings;
    }
  } catch (e) {
    // ignore
  }

  return DEFAULT_SITE_SETTINGS;
}

export async function saveGlobalSiteSettings(settings: SiteSettings): Promise<boolean> {
  inMemorySettings = settings;

  // Save to file fallback
  try {
    fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(settings), "utf-8");
  } catch (e) {
    // Ignore filesystem error
  }

  // Save to DB
  const pool = getDbPool();
  if (!pool) return false;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key VARCHAR(64) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(
      `
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ('global', $1, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value,
          updated_at = CURRENT_TIMESTAMP;
      `,
      [JSON.stringify(settings)]
    );
    return true;
  } catch (err) {
    console.warn("DB saveGlobalSiteSettings error:", err);
    return false;
  }
}
