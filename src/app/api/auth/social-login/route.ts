import { NextRequest, NextResponse } from "next/server";
import { upsertUserInDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user } = body;

    if (!user || !user.email) {
      return NextResponse.json(
        { success: false, error: "Dữ liệu người dùng không hợp lệ hoặc thiếu email" },
        { status: 400 }
      );
    }

    const dbResult = await upsertUserInDb(user);

    const effectiveUser = (dbResult.success && dbResult.dbUser)
      ? { ...user, role: dbResult.dbUser.role || user.role }
      : user;

    return NextResponse.json({
      success: true,
      user: effectiveUser,
      persistedToDb: dbResult.success,
      dbStatus: dbResult.success
        ? "Đã lưu thành công vào PostgreSQL"
        : dbResult.reason === "NO_DATABASE_URL"
        ? "Chưa cấu hình DATABASE_URL trong .env.local (đang lưu tạm trên Session)"
        : `Lỗi kết nối DB: ${dbResult.error}`
    });
  } catch (error) {
    console.error("API /api/auth/social-login error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
