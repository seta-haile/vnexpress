import { DEFAULT_SITE_SETTINGS, SiteSettings } from "./siteSettings";
import { getDbPool } from "./db";
import fs from "fs";
import path from "path";

const BACKUP_SETTINGS_FILE = path.join(process.cwd(), "data", "site_settings_backup.json");
const TMP_SETTINGS_FILE = path.join("/tmp", "vne_site_settings.json");

function ensureDataDir() {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (err) {
    console.warn("Failed to ensure data directory for settings:", err);
  }
}

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
        const dbSettings: SiteSettings = {
          ...DEFAULT_SITE_SETTINGS,
          ...val,
          enabledSources: Array.isArray(val.enabledSources) && val.enabledSources.length > 0
            ? val.enabledSources
            : DEFAULT_SITE_SETTINGS.enabledSources
        };
        inMemorySettings = dbSettings;
        return dbSettings;
      }
    } catch (err) {
      console.warn("DB getGlobalSiteSettings error:", err);
    }
  }

  // 2. Try file backup in data/ or /tmp
  try {
    const targetFile = fs.existsSync(BACKUP_SETTINGS_FILE) 
      ? BACKUP_SETTINGS_FILE 
      : fs.existsSync(TMP_SETTINGS_FILE) 
      ? TMP_SETTINGS_FILE 
      : null;

    if (targetFile) {
      const raw = fs.readFileSync(targetFile, "utf-8");
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
    console.warn("Failed to read backup settings file:", e);
  }

  // 3. Try in-memory cache
  if (inMemorySettings) {
    return inMemorySettings;
  }

  return DEFAULT_SITE_SETTINGS;
}

export async function saveGlobalSiteSettings(settings: SiteSettings): Promise<boolean> {
  inMemorySettings = settings;

  // 1. Save to backup files
  try {
    ensureDataDir();
    fs.writeFileSync(BACKUP_SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
  } catch (e) {
    // ignore
  }
  try {
    fs.writeFileSync(TMP_SETTINGS_FILE, JSON.stringify(settings), "utf-8");
  } catch (e) {
    // ignore
  }

  // 2. Save to DB
  const pool = getDbPool();
  if (!pool) return true;
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
