import { NextRequest, NextResponse } from "next/server";
import { getDbPool, loadBackupUsers, saveBackupUsers } from "@/lib/db";
import { DEMO_ACCOUNTS, ADMIN_DEFAULT_USER } from "@/lib/auth";
import { User } from "@/types/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const pool = getDbPool();
  const backupUsers = loadBackupUsers();

  if (!pool) {
    return NextResponse.json({
      success: true,
      users: backupUsers,
      isDbConnected: false,
      total: backupUsers.length,
      storageType: "Local / Serverless Sync File"
    });
  }

  try {
    // Ensure table exists
    await pool.query(`
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

    const res = await pool.query(`
      SELECT id, name, email, avatar, provider, provider_id as "providerId", role, created_at as "createdAt", last_login_at as "lastLoginAt"
      FROM users
      ORDER BY last_login_at DESC
    `);

    let dbUsers: User[] = res.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      avatar: row.avatar,
      provider: row.provider,
      providerId: row.providerId,
      role: row.role || "learner",
      createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
      lastLoginAt: row.lastLoginAt ? new Date(row.lastLoginAt).toISOString() : new Date().toISOString()
    }));

    // Merge any users that might be in backup store but not yet in DB
    const emailMap = new Map<string, User>();
    for (const u of dbUsers) {
      emailMap.set(u.email.toLowerCase(), u);
    }
    for (const u of backupUsers) {
      const lower = u.email.toLowerCase();
      if (!emailMap.has(lower)) {
        emailMap.set(lower, u);
        // Also insert into PostgreSQL
        try {
          await pool.query(
            `INSERT INTO users (id, name, email, avatar, provider, provider_id, role, last_login_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
             ON CONFLICT (email) DO NOTHING`,
            [u.id, u.name, u.email, u.avatar || null, u.provider, u.providerId || null, u.role || "learner"]
          );
        } catch (e) {
          console.warn("Failed to backfill user into DB:", e);
        }
      }
    }

    const mergedUsers = Array.from(emailMap.values()).sort(
      (a, b) => new Date(b.lastLoginAt || 0).getTime() - new Date(a.lastLoginAt || 0).getTime()
    );

    // Keep backup file synchronized
    saveBackupUsers(mergedUsers);

    return NextResponse.json({
      success: true,
      users: mergedUsers,
      isDbConnected: true,
      total: mergedUsers.length,
      storageType: "PostgreSQL Database"
    });
  } catch (error: any) {
    console.error("Failed to fetch users from database:", error);
    return NextResponse.json({
      success: true,
      users: backupUsers,
      isDbConnected: false,
      total: backupUsers.length,
      storageType: "Local Backup Store (DB Reconnect Pending)",
      error: error.message
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, newRole } = await req.json();

    // 1. Update backup store
    const backupUsers = loadBackupUsers();
    const updatedBackup = backupUsers.map((u) => {
      if (u.id === userId || u.email === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });
    saveBackupUsers(updatedBackup);

    // 2. Update PostgreSQL
    const pool = getDbPool();
    if (pool) {
      await pool.query(
        `UPDATE users SET role = $1 WHERE id = $2 OR email = $2`,
        [newRole, userId]
      );
    }

    return NextResponse.json({ success: true, updatedRole: newRole });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ success: false, error: "Missing email parameter" }, { status: 400 });
    }

    // Do not allow deleting main admin
    if (email.toLowerCase() === "hai.le@vnereader.com" || email.toLowerCase() === "admin@vnexpress.vn") {
      return NextResponse.json({ success: false, error: "Không thể xóa tài khoản Quản trị viên tối cao" }, { status: 403 });
    }

    // 1. Remove from backup store
    const backupUsers = loadBackupUsers();
    const filtered = backupUsers.filter((u) => u.email.toLowerCase() !== email.toLowerCase());
    saveBackupUsers(filtered);

    // 2. Remove from PostgreSQL
    const pool = getDbPool();
    if (pool) {
      await pool.query(`DELETE FROM users WHERE LOWER(email) = $1`, [email.toLowerCase()]);
    }

    return NextResponse.json({ success: true, message: `Đã xóa thành viên ${email}` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
