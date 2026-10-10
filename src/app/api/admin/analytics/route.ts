import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSummary } from "@/lib/activityTracker";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("userEmail") || undefined;
    const actionType = searchParams.get("actionType") || undefined;
    const sourceId = searchParams.get("sourceId") || undefined;
    const searchQuery = searchParams.get("q") || undefined;

    const summary = await getAnalyticsSummary({
      userEmail,
      actionType,
      sourceId,
      searchQuery
    });

    return NextResponse.json({
      success: true,
      summary
    });
  } catch (error: any) {
    console.error("API /api/admin/analytics error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load analytics" },
      { status: 500 }
    );
  }
}
