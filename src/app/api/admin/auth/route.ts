import { NextRequest, NextResponse } from "next/server";
import { ADMIN_DEFAULT_USER, ADMIN_PASSWORD } from "@/types/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password, action } = body;

    // Handle 1-click init or verify
    if (action === "init") {
      const adminUser = {
        ...ADMIN_DEFAULT_USER,
        lastLoginAt: new Date().toISOString()
      };
      return NextResponse.json({
        success: true,
        user: adminUser,
        message: "Tài khoản admin/123123 đã được kích hoạt thành công!"
      });
    }

    const cleanUser = (username || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    if ((cleanUser === "admin" || cleanUser === "admin@vnexpress.vn") && cleanPass === ADMIN_PASSWORD) {
      const adminUser = {
        ...ADMIN_DEFAULT_USER,
        lastLoginAt: new Date().toISOString()
      };
      return NextResponse.json({
        success: true,
        user: adminUser
      });
    }

    return NextResponse.json(
      { success: false, error: "Tên đăng nhập hoặc mật khẩu quản trị viên không chính xác" },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi xác thực quản trị viên" },
      { status: 500 }
    );
  }
}
