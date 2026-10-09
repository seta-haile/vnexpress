import { NextRequest, NextResponse } from "next/server";
import { fetchRssFeed, RSS_CHANNELS } from "@/lib/rss";

export async function GET(request: NextRequest) {
  try {
    const channelId = request.nextUrl.searchParams.get("channel") || "home";
    const items = await fetchRssFeed(channelId);

    return NextResponse.json({
      success: true,
      channel: RSS_CHANNELS.find(c => c.id === channelId) || RSS_CHANNELS[0],
      items,
      count: items.length
    });
  } catch (error: any) {
    console.error("API /api/rss error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch RSS" },
      { status: 500 }
    );
  }
}
