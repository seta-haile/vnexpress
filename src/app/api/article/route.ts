import { NextRequest, NextResponse } from "next/server";
import { fetchArticleDetail } from "@/lib/article";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { success: false, error: "Missing 'url' query parameter" },
        { status: 400 }
      );
    }

    const article = await fetchArticleDetail(url);

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Failed to load article" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      article
    });
  } catch (error: any) {
    console.error("API /api/article error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to parse article" },
      { status: 500 }
    );
  }
}
