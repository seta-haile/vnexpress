import { Pool } from "pg";

let pool: Pool | null = null;

export function getDbPool(): Pool | null {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    const isLocal = process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("127.0.0.1");
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
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
  const p = getDbPool();
  if (!p) {
    return { success: false, reason: "NO_DATABASE_URL" };
  }

  const assignedRole = user.email.toLowerCase().trim() === "hai.le@vnereader.com"
    ? "admin"
    : (user.role || "learner");

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
            WHEN LOWER(EXCLUDED.email) = 'hai.le@vnereader.com' THEN 'admin' 
            ELSE COALESCE(users.role, EXCLUDED.role) 
          END,
          last_login_at = CURRENT_TIMESTAMP
      RETURNING *;
      `,
      [
        user.id,
        user.name,
        user.email,
        user.avatar || null,
        user.provider,
        user.providerId || null,
        assignedRole
      ]
    );

    return { success: true, dbUser: res.rows[0] };
  } catch (error) {
    console.error("PostgreSQL upsert error:", error);
    return { success: false, error: (error as Error).message };
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
