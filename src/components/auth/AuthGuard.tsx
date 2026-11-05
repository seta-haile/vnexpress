"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuthSession, syncSessionWithServer } from "@/lib/auth";
import { Loader2, GraduationCap } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [showManualBtn, setShowManualBtn] = useState(false);

  useEffect(() => {
    const currentPath = pathname || (typeof window !== "undefined" ? window.location.pathname : "");

    // If user is already on /login, no need to redirect to /login
    if (currentPath === "/login") {
      const session = getAuthSession();
      if (session.isAuthenticated) {
        // If already logged in and visiting /login, redirect to main page
        try {
          router.replace("/");
        } catch {
          window.location.replace("/");
        }
        const timer = setTimeout(() => {
          if (typeof window !== "undefined" && window.location.pathname === "/login") {
            window.location.replace("/");
          }
        }, 1200);
        return () => clearTimeout(timer);
      } else {
        setIsAuthorized(true);
      }
      return;
    }

    // Check authentication for protected pages
    const session = getAuthSession();
    if (!session.isAuthenticated) {
      setIsAuthorized(false);

      // 1. Try Next.js client router first
      try {
        router.replace("/login");
      } catch {
        window.location.replace("/login");
      }

      // 2. Safe timeout: If after 1.2s browser has not navigated, force native hard navigation
      const hardRedirectTimer = setTimeout(() => {
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.replace("/login");
        }
      }, 1200);

      // 3. Reveal manual button after 1.8s in case network is severely stalled
      const manualBtnTimer = setTimeout(() => {
        setShowManualBtn(true);
      }, 1800);

      return () => {
        clearTimeout(hardRedirectTimer);
        clearTimeout(manualBtnTimer);
      };
    } else {
      setIsAuthorized(true);
      syncSessionWithServer();
    }

    const handleAuthChange = () => {
      const s = getAuthSession();
      const p = window.location.pathname;
      if (!s.isAuthenticated && p !== "/login") {
        setIsAuthorized(false);
        try {
          router.replace("/login");
        } catch {
          window.location.replace("/login");
        }
      } else if (s.isAuthenticated && p === "/login") {
        try {
          router.replace("/");
        } catch {
          window.location.replace("/");
        }
      } else {
        setIsAuthorized(true);
      }
    };

    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, [pathname, router]);

  const currentPath = pathname || (typeof window !== "undefined" ? window.location.pathname : "");

  // While checking auth or redirecting away from protected page, display a clean splash screen
  if (isAuthorized === null || (isAuthorized === false && currentPath !== "/login")) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground gap-4 p-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/20 animate-pulse">
          <GraduationCap className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
          <span>Vui lòng đăng nhập để tiếp tục...</span>
        </div>

        {/* Fallback button if device or network is slow */}
        {showManualBtn && (
          <a
            href="/login"
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 rounded-full transition-all border border-rose-200 dark:border-rose-800 animate-in fade-in duration-300"
          >
            Bấm vào đây nếu trang không tự chuyển &rarr;
          </a>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
