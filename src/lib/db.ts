import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { User, ADMIN_DEFAULT_USER } from "@/types/auth";

let pool: Pool | null = null;

// Fallback file storage path for local / serverless sync
const USERS_BACKUP_FILE = path.join(process.cwd(), "data", "users_backup.json");

// In-memory fallback cache
let memoryUsersCache: Map<string, User> = new Map();

function ensureDataDir() {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (err) {
    console.warn("Failed to ensure data directory:", err);
  }
}

export function loadBackupUsers(): User[] {
  try {
    if (fs.existsSync(USERS_BACKUP_FILE)) {
      const raw = fs.readFileSync(USERS_BACKUP_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read users backup file:", err);
  }

  // If file doesn't exist yet, initialize with default admin + demo accounts
  const defaults: User[] = [
    {
      id: "usr_admin_haile",
      name: "Hải Lê",
      email: "hai.le@vnereader.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      provider: "credentials",
      role: "admin",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    },
    {
      ...ADMIN_DEFAULT_USER,
      id: "usr_admin_master",
      name: "Admin Quản Trị",
      email: "admin@vnexpress.vn",
      role: "admin",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }
  ];
  saveBackupUsers(defaults);
  return defaults;
}

export function saveBackupUsers(users: User[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_BACKUP_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write users backup file:", err);
  }
}

export function getDbPool(): Pool | null {
  const connectionString = 
    process.env.DATABASE_URL || 
    process.env.POSTGRES_URL || 
    process.env.NEON_DATABASE_URL ||
    process.env.STORAGE_URL ||
    process.env.STORAGE_POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!connectionString) {
    return null;
  }

  if (!pool) {
    const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
    pool = new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false }
    });
  }

  return pool;
}

export async function upsertUserInDb(user: {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: string;
  providerId?: string;
  role?: string;
}) {
  const cleanEmail = user.email.toLowerCase().trim();
  const isAdminEmail = cleanEmail === "hai.le@vnereader.com" || cleanEmail === "admin@vnexpress.vn" || cleanEmail === "admin@admin.com";
  const assignedRole: "admin" | "learner" | "user" = isAdminEmail ? "admin" : ((user.role as any) || "learner");

  const normalizedUser: User = {
    id: user.id || `usr_${Date.now()}`,
    name: user.name || (isAdminEmail ? "Hải Lê" : cleanEmail.split("@")[0]),
    email: cleanEmail,
    avatar: user.avatar || (isAdminEmail ? "https://api.dicebear.com/7.x/avataaars/svg?seed=hai.le" : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`),
    provider: (user.provider as any) || "credentials",
    providerId: user.providerId,
    role: assignedRole,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  // 1. Always update file / memory backup first
  const existingBackup = loadBackupUsers();
  const idx = existingBackup.findIndex((u) => u.email.toLowerCase() === cleanEmail);
  if (idx >= 0) {
    existingBackup[idx] = {
      ...existingBackup[idx],
      name: normalizedUser.name,
      avatar: normalizedUser.avatar || existingBackup[idx].avatar,
      provider: normalizedUser.provider,
      providerId: normalizedUser.providerId || existingBackup[idx].providerId,
      role: isAdminEmail ? "admin" : (existingBackup[idx].role || assignedRole),
      lastLoginAt: new Date().toISOString()
    };
  } else {
    existingBackup.unshift(normalizedUser);
  }
  saveBackupUsers(existingBackup);

  // 2. Upsert into PostgreSQL if pool is available
  const p = getDbPool();
  if (!p) {
    return { success: true, dbUser: normalizedUser, reason: "SAVED_TO_FALLBACK_STORE" };
  }

  try {
    // Automatically ensure table exists
    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        avatar TEXT,
        provider VARCHAR(32) NOT NULL,
        provider_id VARCHAR(255),
        role VARCHAR(32) DEFAULT 'learner',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const res = await p.query(
      `
      INSERT INTO users (id, name, email, avatar, provider, provider_id, role, last_login_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (email) DO UPDATE
      SET name = EXCLUDED.name,
          avatar = COALESCE(EXCLUDED.avatar, users.avatar),
          provider = EXCLUDED.provider,
          provider_id = EXCLUDED.provider_id,
          role = CASE 
            WHEN LOWER(EXCLUDED.email) IN ('hai.le@vnereader.com', 'admin@vnexpress.vn', 'admin@admin.com') THEN 'admin' 
            ELSE COALESCE(users.role, EXCLUDED.role) 
          END,
          last_login_at = CURRENT_TIMESTAMP
      RETURNING *;
      `,
      [
        normalizedUser.id,
        normalizedUser.name,
        normalizedUser.email,
        normalizedUser.avatar || null,
        normalizedUser.provider,
        normalizedUser.providerId || null,
        assignedRole
      ]
    );

    return { success: true, dbUser: res.rows[0] };
  } catch (error) {
    console.error("PostgreSQL upsert error:", error);
    return { success: true, dbUser: normalizedUser, fallback: true, error: (error as Error).message };
  }
}

export async function ensureAdminInDb(): Promise<void> {
  const p = getDbPool();
  if (!p) return;
  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        avatar TEXT,
        provider VARCHAR(32) NOT NULL,
        provider_id VARCHAR(255),
        role VARCHAR(32) DEFAULT 'learner',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await p.query(`
      INSERT INTO users (id, name, email, avatar, provider, role)
      VALUES ('usr_admin_haile', 'Hải Lê', 'hai.le@vnereader.com', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', 'credentials', 'admin')
      ON CONFLICT (email) DO UPDATE SET role = 'admin';
    `);
  } catch (err) {
    console.warn("ensureAdminInDb notice:", err);
  }
}
