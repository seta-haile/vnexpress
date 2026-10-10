import { PublicationSourceId, ActiveSourceFilter } from "@/types/news";

export interface SiteSettings {
  // 1. Quản lý danh sách nguồn báo được hiển thị
  enabledSources: PublicationSourceId[];
  // 2. Cài đặt chung giao diện & trang
  headerSubtitle: string;
  defaultSource: ActiveSourceFilter;
  defaultCefrLevel: string; // 'all' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  showThumbnails: boolean;
  articlesPerPage: number;
  autoPlayAudioKaraoke: boolean;
  allowUserSourceCustomization: boolean;
  updatedAt: string;
  updatedBy?: string;
}

export const ALL_PUBLICATION_SOURCE_IDS: PublicationSourceId[] = [
  "vnexpress",
  "bbc",
  "guardian",
  "theconversation",
  "propublica",
  "wikinews",
  "npr",
  "gutenberg",
  "hony",
  "globalvoices"
];

export const CURATED_ACTIVE_SOURCE_IDS: PublicationSourceId[] = [
  "bbc",
  "guardian",
  "theconversation",
  "propublica",
  "wikinews",
  "npr",
  "globalvoices"
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  enabledSources: [...CURATED_ACTIVE_SOURCE_IDS],
  headerSubtitle: "Đọc báo & học tiếng Anh đa nguồn thông minh",
  defaultSource: "all",
  defaultCefrLevel: "all",
  showThumbnails: true,
  articlesPerPage: 24,
  autoPlayAudioKaraoke: false,
  allowUserSourceCustomization: true,
  updatedAt: "2026-10-09T00:00:00.000Z",
  updatedBy: "System Default"
};

const SETTINGS_STORAGE_KEY = "vne_site_settings_v1";

export function getLocalSiteSettings(): SiteSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SITE_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SITE_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...parsed,
      enabledSources: Array.isArray(parsed.enabledSources) && parsed.enabledSources.length > 0
        ? parsed.enabledSources
        : DEFAULT_SITE_SETTINGS.enabledSources
    };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export function saveLocalSiteSettings(settings: SiteSettings): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("site-settings-changed", { detail: settings }));
  }
}

export async function fetchRemoteSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch("/api/admin/settings", { cache: "no-store" });
    if (!res.ok) return getLocalSiteSettings();
    const data = await res.json();
    if (data.success && data.settings) {
      saveLocalSiteSettings(data.settings);
      return data.settings;
    }
  } catch (err) {
    console.warn("Could not fetch remote settings:", err);
  }
  return getLocalSiteSettings();
}

export async function updateRemoteSiteSettings(settings: SiteSettings): Promise<{ success: boolean; settings?: SiteSettings; error?: string }> {
  try {
    saveLocalSiteSettings(settings); // Optimistic local save
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings })
    });
    const data = await res.json();
    if (data.success && data.settings) {
      saveLocalSiteSettings(data.settings);
      return { success: true, settings: data.settings };
    }
    return { success: false, error: data.error || "Failed to update settings" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}
