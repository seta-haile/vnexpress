"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  Headphones, 
  Bookmark, 
  Sparkles, 
  Globe,
  EyeOff,
  TrendingUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { saveAuthSession, DEMO_ACCOUNTS, isAdminUser } from "@/lib/auth";
import { loginWithRealGoogle, loginWithRealFacebook } from "@/lib/oauth-sdk";
import { User } from "@/types/auth";

const BENEFITS = [
  {
    icon: Globe,
    title: "Mở rộng kiến thức xã hội",
    desc: "Cập nhật nhịp sống, kinh tế & xu hướng thế giới mỗi ngày.",
    badge: "Thời sự 24/7",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
  },
  {
    icon: Headphones,
    title: "Lên trình Nghe - Nói - Đọc - Viết",
    desc: "Luyện phát âm AI, karaoke chữ chạy và chép chính tả Dictation.",
    badge: "4-in-1 Skills",
    color: "from-rose-500 to-amber-500",
    bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
  },
  {
    icon: Sparkles,
    title: "Bùng nổ vốn từ vựng",
    desc: "Bấm là tra nghĩa tức thì, lọc từ chuẩn CEFR và ôn qua Flashcard.",
    badge: "X3 Từ vựng",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
  },
  {
    icon: EyeOff,
    title: "Chế độ đọc tàng hình công sở",
    desc: "Nền tối + ẩn ảnh 100%, thoải mái nâng band mà không sợ sếp dòm ngó.",
    badge: "Stealth Mode",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
  }
];

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setLoadingProvider(provider);
    setIsLoading(true);
    setErrorMsg(null);

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const fbAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

    try {
      let loggedInUser: User;

      if (provider === "google") {
        if (!googleClientId) {
          const useDemo = confirm(
            "⚠️ Bạn chưa cấu hình NEXT_PUBLIC_GOOGLE_CLIENT_ID trong môi trường!\n\n" +
            "👉 Bạn có muốn đăng nhập bằng tài khoản Demo để trải nghiệm ngay không?"
          );
          if (useDemo) {
            loggedInUser = DEMO_ACCOUNTS.google;
          } else {
            setIsLoading(false);
            setLoadingProvider(null);
            return;
          }
        } else {
          loggedInUser = await loginWithRealGoogle(googleClientId);
        }
      } else {
        if (!fbAppId) {
          const useDemo = confirm(
            "⚠️ Bạn chưa cấu hình NEXT_PUBLIC_FACEBOOK_APP_ID trong môi trường!\n\n" +
            "👉 Bạn có muốn đăng nhập bằng tài khoản Demo để trải nghiệm ngay không?"
          );
          if (useDemo) {
            loggedInUser = DEMO_ACCOUNTS.facebook;
          } else {
            setIsLoading(false);
            setLoadingProvider(null);
            return;
          }
        } else {
          loggedInUser = await loginWithRealFacebook(fbAppId);
        }
      }

      // Lưu / đồng bộ vào PostgreSQL Database qua API backend
      let finalUser = loggedInUser;
      try {
        const res = await fetch("/api/auth/social-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: loggedInUser })
        });
        const data = await res.json();
        if (data && data.success && data.user) {
          finalUser = data.user;
        }
      } catch (e) {
        console.warn("Could not sync to DB:", e);
      }

      saveAuthSession(finalUser);
      if (isAdminUser(finalUser)) {
        router.push("/admin/settings");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      console.error(`${provider} login error:`, err);
      setErrorMsg(err.message || `Lỗi đăng nhập ${provider}`);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden flex flex-col justify-between selection:bg-rose-500/20">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-rose-500/10 via-amber-500/10 to-red-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-bl from-blue-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top spacer */}
      <div className="h-4 sm:h-8" />

      {/* Main Split Layout Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 my-auto py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT SIDE: Fresh & Punchy Value Highlights */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold shadow-sm backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>Học tiếng Anh kiểu mới • Tràn đầy cảm hứng</span>
            </div>

            {/* Bold Headline */}
            <div className="space-y-2.5">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
                Đọc báo mỗi ngày, <br />
                <span className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                  trình tiếng Anh lên mây!
                </span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
                Tạm biệt sách vở khô khan. Biến 15 phút đọc tin tức thành thói quen nâng trình ngoại ngữ tự nhiên và thực chiến nhất.
              </p>
            </div>

            {/* 4 Punchy Benefit Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 pt-1">
              {BENEFITS.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="group p-3.5 sm:p-4 rounded-2xl bg-card/70 hover:bg-card/95 backdrop-blur-md border border-border/70 hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-rose-950/5 dark:hover:shadow-black/20 flex flex-col justify-between space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${item.bg}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0.5 border-border/60 text-muted-foreground group-hover:text-foreground transition-colors">
                        {item.badge}
                      </Badge>
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        {item.title}
                      </h2>
                      <p className="text-xs text-muted-foreground/90 font-medium leading-relaxed mt-1">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Micro stats banner */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>10+ nguồn báo uy tín</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Không quảng cáo làm phiền</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Miễn phí 100%</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Centered Premium Login Card */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
            <div className="bg-card/90 backdrop-blur-xl border border-border/80 shadow-2xl shadow-rose-950/10 dark:shadow-black/50 rounded-3xl p-6 sm:p-9 space-y-6 sm:space-y-7 transition-all">
              
              {/* Logo Brand Header */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/25 ring-4 ring-rose-500/10 mb-1">
                  <GraduationCap className="w-7 h-7" />
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-red-600 via-rose-600 to-slate-900 dark:to-white bg-clip-text text-transparent">
                      VnE Reader
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-300/30">
                      ENGLISH
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Bắt đầu hành trình đọc báo thông minh ngay hôm nay
                  </p>
                </div>
              </div>

              {/* Error Alert Banner */}
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-rose-600 dark:text-rose-400 text-xs animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
                  <span className="leading-relaxed font-medium">{errorMsg}</span>
                </div>
              )}

              {/* Primary Action Buttons */}
              <div className="space-y-3">
                {/* Google OAuth Button */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSocialLogin("google")}
                  className="w-full h-12 flex items-center justify-center gap-3 px-4 rounded-2xl border border-border/90 bg-background hover:bg-muted/70 active:scale-[0.99] text-foreground font-bold text-sm shadow-sm hover:shadow transition-all duration-200 cursor-pointer disabled:opacity-60"
                >
                  {loadingProvider === "google" ? (
                    <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.28-2.09 3.66-5.17 3.66-9.14z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.13C3.25 21.35 7.34 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.27C.46 8.21 0 10.05 0 12s.46 3.79 1.27 5.41l4.01-3.13z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.65 1.27 6.59l4.01 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
                      />
                    </svg>
                  )}
                  <span>Tiếp tục với Google</span>
                </button>

                {/* Facebook OAuth Button */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSocialLogin("facebook")}
                  className="w-full h-12 flex items-center justify-center gap-3 px-4 rounded-2xl border border-border/90 bg-background hover:bg-muted/70 active:scale-[0.99] text-foreground font-bold text-sm shadow-sm hover:shadow transition-all duration-200 cursor-pointer disabled:opacity-60"
                >
                  {loadingProvider === "facebook" ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#1877F2]" />
                  ) : (
                    <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                  <span>Tiếp tục với Facebook</span>
                </button>
              </div>

              {/* Micro trust info */}
              <div className="pt-2 text-center">
                <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                  Bằng việc đăng nhập, bạn đồng ý với mục tiêu rèn luyện và chính sách bảo mật dữ liệu học tập cá nhân.
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground relative z-10">
        © 2026 VnE Reader. Nền tảng học tiếng Anh qua dữ liệu báo chí quốc tế.
      </footer>
    </div>
  );
}
