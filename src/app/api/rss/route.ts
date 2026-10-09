import { NextRequest, NextResponse } from "next/server";
import { fetchRssFeed, RSS_CHANNELS, HONY_CHANNELS, PUBLICATION_SOURCES } from "@/lib/rss";

export async function GET(request: NextRequest) {
  try {
    const sourceId = request.nextUrl.searchParams.get("source") || undefined;
    const defaultChannel = sourceId === "hony" ? "hony-all" : "home";
    const channelId = request.nextUrl.searchParams.get("channel") || defaultChannel;

    const items = await fetchRssFeed(channelId, sourceId);

    const allChannels = [...RSS_CHANNELS, ...HONY_CHANNELS];
    const currentChannel = allChannels.find(c => c.id === channelId) || (sourceId === "hony" ? HONY_CHANNELS[0] : RSS_CHANNELS[0]);
    const currentSource = PUBLICATION_SOURCES.find(s => s.id === sourceId) || (sourceId === "hony" ? PUBLICATION_SOURCES[1] : PUBLICATION_SOURCES[0]);

    return NextResponse.json({
      success: true,
      source: currentSource,
      channel: currentChannel,
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
