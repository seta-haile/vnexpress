import { NextRequest, NextResponse } from "next/server";
import { getDbPool, loadBackupUsers, saveBackupUsers } from "@/lib/db";
import { DEMO_ACCOUNTS, ADMIN_DEFAULT_USER } from "@/lib/auth";
import { User } from "@/types/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const pool = getDbPool();

  if (!pool) {
    const backupUsers = loadBackupUsers();
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

    // Ensure master admin exists
    await pool.query(`
      INSERT INTO users (id, name, email, avatar, provider, role, last_login_at)
      VALUES 
        ('usr_admin_haile', 'Hải Lê', 'hai.le@vnereader.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=hai.le', 'credentials', 'admin', CURRENT_TIMESTAMP)
      ON CONFLICT (email) DO NOTHING
    `);

    const res = await pool.query(`
      SELECT id, name, email, avatar, provider, provider_id as "providerId", role, created_at as "createdAt", last_login_at as "lastLoginAt"
      FROM users
      ORDER BY last_login_at DESC
    `);

    const dbUsers: User[] = res.rows.map((row: any) => ({
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

    return NextResponse.json({
      success: true,
      users: dbUsers,
      isDbConnected: true,
      total: dbUsers.length,
      storageType: "PostgreSQL Database"
    });
  } catch (error: any) {
    console.error("Failed to fetch users from database:", error);
    const backupUsers = loadBackupUsers();
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
        `UPDATE users SET role = $1 WHERE id = $2 OR LOWER(email) = LOWER($2)`,
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

    const cleanEmail = email.toLowerCase().trim();

    // Do not allow deleting main admin
    if (cleanEmail === "hai.le@vnereader.com" || cleanEmail === "admin@vnexpress.vn") {
      return NextResponse.json({ success: false, error: "Không thể xóa tài khoản Quản trị viên tối cao" }, { status: 403 });
    }

    // 1. Remove from backup store
    const backupUsers = loadBackupUsers();
    const filtered = backupUsers.filter((u) => u.email.toLowerCase().trim() !== cleanEmail);
    saveBackupUsers(filtered);

    // 2. Remove from PostgreSQL
    const pool = getDbPool();
    if (pool) {
      try {
        await pool.query(`DELETE FROM saved_words WHERE user_id IN (SELECT id FROM users WHERE LOWER(email) = $1)`, [cleanEmail]);
        await pool.query(`DELETE FROM learning_progress WHERE user_id IN (SELECT id FROM users WHERE LOWER(email) = $1)`, [cleanEmail]);
      } catch (cascadeErr) {
        // Child tables may not exist yet
      }
      const deleteResult = await pool.query(`DELETE FROM users WHERE LOWER(email) = $1`, [cleanEmail]);
      console.log(`Successfully deleted user ${cleanEmail} from PostgreSQL (${deleteResult.rowCount} rows affected)`);
    }

    return NextResponse.json({ success: true, message: `Đã xóa thành viên ${email}` });
  } catch (error: any) {
    console.error("DELETE user error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
