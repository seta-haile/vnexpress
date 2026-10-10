import { NextRequest, NextResponse } from "next/server";
import { logUserActivity } from "@/lib/activityTracker";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    if (!text) {
      return NextResponse.json({ success: false, error: "Empty body" }, { status: 400 });
    }
    const body = JSON.parse(text);
    
    // Extract IP address if available
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    await logUserActivity({
      ...body,
      ipAddress
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
