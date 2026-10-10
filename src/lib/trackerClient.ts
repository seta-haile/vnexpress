import { ActivityActionType } from "@/types/analytics";
import { getAuthSession } from "./auth";

function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return "guest_ssr";
  try {
    let guestId = localStorage.getItem("vne_guest_tracker_id");
    if (!guestId) {
      guestId = `guest_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("vne_guest_tracker_id", guestId);
    }
    return guestId;
  } catch {
    return "guest_user";
  }
}

export function trackUserEvent(payload: {
  actionType: ActivityActionType;
  sourceId?: string | null;
  channelId?: string | null;
  articleTitle?: string | null;
  articleUrl?: string | null;
  articleSlug?: string | null;
  metadata?: Record<string, any>;
}): void {
  if (typeof window === "undefined") return;

  try {
    const session = getAuthSession();
    const user = session.user;
    const guestId = getOrCreateGuestId();

    const data = {
      userId: user?.id || guestId,
      userEmail: user?.email || `Khách (${guestId.substring(0, 10)})`,
      userName: user?.name || "Khách ẩn danh",
      actionType: payload.actionType,
      sourceId: payload.sourceId || null,
      channelId: payload.channelId || null,
      articleTitle: payload.articleTitle || null,
      articleUrl: payload.articleUrl || null,
      articleSlug: payload.articleSlug || null,
      metadata: payload.metadata || {},
      deviceInfo: typeof navigator !== "undefined" 
        ? `${/Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop"} • ${navigator.platform || "Web"}`
        : "Desktop"
    };

    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/track", blob);
    } else {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        keepalive: true
      }).catch(() => {});
    }
  } catch (err) {
    // Non-blocking silent catch
  }
}
