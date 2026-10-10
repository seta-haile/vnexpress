import { NextRequest, NextResponse } from "next/server";
import { 
  fetchRssFeed, 
  RSS_CHANNELS, 
  NPR_CHANNELS, 
  HONY_CHANNELS, 
  GUARDIAN_CHANNELS, 
  BBC_CHANNELS, 
  THE_CONVERSATION_CHANNELS,
  PROPUBLICA_CHANNELS,
  WIKINEWS_CHANNELS,
  GUTENBERG_CHANNELS,
  GLOBAL_VOICES_CHANNELS,
  PUBLICATION_SOURCES 
} from "@/lib/rss";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const sourceId = request.nextUrl.searchParams.get("source") || undefined;
    let defaultChannel = "home";
    if (sourceId === "hony") defaultChannel = "hony-all";
    else if (sourceId === "npr") defaultChannel = "npr-all";
    else if (sourceId === "bbc") defaultChannel = "bbc-world";
    else if (sourceId === "guardian") defaultChannel = "guardian-world";
    else if (sourceId === "theconversation") defaultChannel = "theconversation-all";
    else if (sourceId === "propublica") defaultChannel = "propublica-all";
    else if (sourceId === "wikinews") defaultChannel = "wikinews-all";
    else if (sourceId === "gutenberg") defaultChannel = "gutenberg-all";
    else if (sourceId === "globalvoices") defaultChannel = "globalvoices-all";

    const channelId = request.nextUrl.searchParams.get("channel") || defaultChannel;

    const items = await fetchRssFeed(channelId, sourceId);

    const allChannels = [
      ...RSS_CHANNELS, 
      ...NPR_CHANNELS, 
      ...HONY_CHANNELS, 
      ...GUARDIAN_CHANNELS, 
      ...BBC_CHANNELS,
      ...THE_CONVERSATION_CHANNELS,
      ...PROPUBLICA_CHANNELS,
      ...WIKINEWS_CHANNELS,
      ...GUTENBERG_CHANNELS,
      ...GLOBAL_VOICES_CHANNELS
    ];
    const currentChannel = allChannels.find(c => c.id === channelId) || allChannels[0];
    const currentSource = PUBLICATION_SOURCES.find(s => s.id === sourceId) || PUBLICATION_SOURCES[0];

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

