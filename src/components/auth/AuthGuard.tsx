"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { Loader2, GraduationCap } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // If user is already on /login, no need to redirect to /login
    if (pathname === "/login") {
      const session = getAuthSession();
      if (session.isAuthenticated) {
        // If already logged in and visiting /login, redirect to main page
        router.replace("/");
      } else {
        setIsAuthorized(true);
      }
      return;
    }

    // Check authentication for protected pages
    const session = getAuthSession();
    if (!session.isAuthenticated) {
      setIsAuthorized(false);
      router.replace("/login");
    } else {
      setIsAuthorized(true);
    }

    const handleAuthChange = () => {
      const s = getAuthSession();
      if (!s.isAuthenticated && pathname !== "/login") {
        setIsAuthorized(false);
        router.replace("/login");
      } else if (s.isAuthenticated && pathname === "/login") {
        router.replace("/");
      } else {
        setIsAuthorized(true);
      }
    };

    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, [pathname, router]);

  // While checking auth or redirecting away from protected page, display a clean splash screen
  if (isAuthorized === null || (isAuthorized === false && pathname !== "/login")) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/20 animate-pulse">
          <GraduationCap className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
          <span>Vui lòng đăng nhập để tiếp tục...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
