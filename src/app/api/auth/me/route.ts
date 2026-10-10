import { NextRequest, NextResponse } from "next/server";
import { getDbPool, loadBackupUsers } from "@/lib/db";
import { User } from "@/types/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ success: false, error: "Missing email parameter" }, { status: 400 });
    }

    // 1. Check PostgreSQL first
    const pool = getDbPool();
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT id, name, email, avatar, provider, provider_id as "providerId", role, created_at as "createdAt", last_login_at as "lastLoginAt"
           FROM users
           WHERE LOWER(email) = $1
           LIMIT 1`,
          [email]
        );

        if (res.rows.length > 0) {
          const row = res.rows[0];
          const user: User = {
            id: row.id,
            name: row.name,
            email: row.email,
            avatar: row.avatar,
            provider: row.provider,
            providerId: row.providerId,
            role: row.role || "learner",
            createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
            lastLoginAt: row.lastLoginAt ? new Date(row.lastLoginAt).toISOString() : new Date().toISOString()
          };

          return NextResponse.json({ success: true, user, source: "database" });
        }
      } catch (dbErr) {
        console.warn("Error querying me from db:", dbErr);
      }
    }

    // 2. Check backup users store
    const backupUsers = loadBackupUsers();
    const found = backupUsers.find((u) => u.email.toLowerCase() === email);

    if (found) {
      return NextResponse.json({ success: true, user: found, source: "backup_store" });
    }

    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
