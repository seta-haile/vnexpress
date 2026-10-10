import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_SITE_SETTINGS, SiteSettings } from "@/lib/siteSettings";
import { getGlobalSiteSettings, saveGlobalSiteSettings } from "@/lib/serverSettings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getGlobalSiteSettings();
    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      settings: DEFAULT_SITE_SETTINGS
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = await getGlobalSiteSettings();
    const newSettings: SiteSettings = {
      ...current,
      ...body.settings,
      updatedAt: new Date().toISOString()
    };

    await saveGlobalSiteSettings(newSettings);

    return NextResponse.json({
      success: true,
      settings: newSettings
    });
  } catch (error: any) {
    console.error("API /api/admin/settings error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
