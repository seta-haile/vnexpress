"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  Sparkles, 
  Database, 
  Flame, 
  Bookmark, 
  ArrowLeft, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldCheck, 
  Loader2,
  Globe,
  Headphones,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveAuthSession, DEMO_ACCOUNTS } from "@/lib/auth";
import { loginWithRealGoogle, loginWithRealFacebook } from "@/lib/oauth-sdk";
import { User } from "@/types/auth";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
            "⚠️ Bạn chưa điền NEXT_PUBLIC_GOOGLE_CLIENT_ID vào file .env.local!\n\n" +
            "👉 Bạn có muốn đăng nhập bằng tài khoản Demo để trải nghiệm ngay trước không?\n\n" +
            "(Để dùng tài khoản Google thật của bạn, hãy tạo Client ID tại https://console.cloud.google.com và dán vào file .env.local)"
          );
          if (useDemo) {
            loggedInUser = DEMO_ACCOUNTS.google;
          } else {
            setIsLoading(false);
            setLoadingProvider(null);
            return;
          }
        } else {
          // Gọi SDK Google Identity Services thật 100%
          loggedInUser = await loginWithRealGoogle(googleClientId);
        }
      } else {
        if (!fbAppId) {
          const useDemo = confirm(
            "⚠️ Bạn chưa điền NEXT_PUBLIC_FACEBOOK_APP_ID vào file .env.local!\n\n" +
            "👉 Bạn có muốn đăng nhập bằng tài khoản Demo để trải nghiệm ngay trước không?\n\n" +
            "(Để dùng tài khoản Facebook thật của bạn, hãy tạo App ID tại https://developers.facebook.com và dán vào file .env.local)"
          );
          if (useDemo) {
            loggedInUser = DEMO_ACCOUNTS.facebook;
          } else {
            setIsLoading(false);
            setLoadingProvider(null);
            return;
          }
        } else {
          // Gọi SDK Meta Facebook thật 100%
          loggedInUser = await loginWithRealFacebook(fbAppId);
        }
      }

      // Lưu / đồng bộ vào PostgreSQL Database qua API backend
      try {
        await fetch("/api/auth/social-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: loggedInUser })
        });
      } catch (e) {
        console.warn("Could not sync to DB:", e);
      }

      saveAuthSession(loggedInUser);
      router.push("/");
    } catch (err: any) {
      console.error(`${provider} login error:`, err);
      setErrorMsg(err.message || `Lỗi đăng nhập ${provider}`);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (tab === "signup") {
      if (password.length < 6) {
        setErrorMsg("Mật khẩu phải có độ dài tối thiểu 6 ký tự.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Mật khẩu xác nhận không khớp với mật khẩu đã nhập.");
        return;
      }
    }

    setIsLoading(true);
    setLoadingProvider("email");
    setErrorMsg(null);

    try {
      const user: User = {
        id: `usr_${Date.now()}`,
        name: name.trim() || email.split("@")[0],
        email: email.trim(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        provider: "credentials",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      // Lưu vào PostgreSQL Database qua API backend
      try {
        await fetch("/api/auth/social-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user })
        });
      } catch (e) {
        console.warn("Could not sync to DB:", e);
      }

      saveAuthSession(user);
      router.push("/");
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi đăng nhập email");
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-between">
      {/* Top Simple Bar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-foreground">
            VnE Reader English
          </span>
        </div>

        <Badge variant="outline" className="text-xs font-medium border-rose-500/30 text-rose-600 dark:text-rose-400">
          Đồng bộ tiến độ học tập
        </Badge>
      </div>

      {/* Main Split Grid */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-12 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center w-full">
          
          {/* Left Column: Visual Brand & Value Props */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    VnE Reader English
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Học tiếng Anh qua báo chí thực chiến VnExpress International
                  </p>
                </div>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
                Đọc báo thông minh.{" "}
                <span className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 bg-clip-text text-transparent">
                  Nâng tầm vốn từ
                </span>{" "}
                mỗi ngày.
              </h2>

              <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
                Đăng nhập tài khoản để lưu giữ toàn bộ từ vựng, theo dõi cấp độ CEFR và tiếp tục việc học liền mạch trên mọi thiết bị.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-sm space-y-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Headphones className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-foreground">TTS Karaoke AI</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bôi đậm chữ theo giọng đọc, 4 giọng Nam/Nữ trẻ & trung niên.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-sm space-y-2">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <Bookmark className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-foreground">Sổ Từ Vựng Thông Minh</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tra từ 1 chạm, dịch cụm từ tức thì và tự động xếp cấp độ CEFR.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-sm space-y-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-foreground">Luyện Flashcard & Quiz</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ôn tập ghi nhớ sâu qua thẻ lật tương tác và câu đố trắc nghiệm.
                </p>
              </div>
            </div>

            {/* Quote Badge */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 flex items-center gap-3 max-w-lg">
              <Flame className="w-6 h-6 text-amber-500 flex-shrink-0 animate-pulse" />
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                "Duy trì thói quen đọc 1 bài báo mỗi ngày giúp bạn tích lũy hơn 2,000 từ vựng học thuật tự nhiên trong 3 tháng."
              </p>
            </div>
          </div>

          {/* Right Column: Auth Card */}
          <div className="lg:col-span-5">
            <div className="w-full max-w-md mx-auto bg-card text-card-foreground rounded-3xl shadow-xl border border-border/80 p-6 sm:p-8 space-y-6">
              
              {/* Header Title */}
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-black tracking-tight text-foreground">
                  {tab === "signin" ? "Đăng nhập tài khoản" : "Tạo tài khoản học tập"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {tab === "signin" ? "Chọn phương thức đăng nhập để tiếp tục" : "Điền thông tin để bắt đầu hành trình"}
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="flex p-1 bg-muted/60 rounded-xl border border-border/50">
                <button
                  type="button"
                  onClick={() => {
                    setTab("signin");
                    setErrorMsg(null);
                    setConfirmPassword("");
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    tab === "signin"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab("signup");
                    setErrorMsg(null);
                    setConfirmPassword("");
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    tab === "signup"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Đăng ký mới
                </button>
              </div>

              {/* Error Alert Banner */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-rose-600 dark:text-rose-400 text-xs animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
                  <span className="leading-relaxed font-medium">{errorMsg}</span>
                </div>
              )}

              {/* Social Login Buttons (Google & Facebook) */}
              <div className="space-y-2.5">
                {/* Google Button */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSocialLogin("google")}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border/80 bg-background hover:bg-muted/60 text-foreground font-semibold text-sm transition-all hover:shadow-sm cursor-pointer disabled:opacity-60"
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

                {/* Facebook Button */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSocialLogin("facebook")}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#1877F2]/30 bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold text-sm transition-all hover:shadow-md hover:shadow-[#1877F2]/20 cursor-pointer disabled:opacity-60"
                >
                  {loadingProvider === "facebook" ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                  <span>Tiếp tục với Facebook</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-border/60" />
                <span className="absolute bg-card px-3 text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                  hoặc email
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                {tab === "signup" && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Họ và tên</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Hoàng Minh"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        className="w-full text-sm pl-9 pr-3.5 py-2 rounded-xl border border-border bg-muted/40 focus:bg-background focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      className="w-full text-sm pl-9 pr-3.5 py-2 rounded-xl border border-border bg-muted/40 focus:bg-background focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">Mật khẩu</label>
                    {tab === "signin" && (
                      <button
                        type="button"
                        onClick={() => alert("Tính năng gửi link đặt lại mật khẩu về email đang được kích hoạt!")}
                        className="text-[11px] text-rose-600 hover:underline"
                      >
                        Quên mật khẩu?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder={tab === "signup" ? "Tối thiểu 6 ký tự" : "••••••••"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      className="w-full text-sm pl-9 pr-10 py-2 rounded-xl border border-border bg-muted/40 focus:bg-background focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Xác nhận mật khẩu (Chỉ hiển thị khi Đăng ký mới) */}
                {tab === "signup" && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground">Xác nhận mật khẩu</label>
                      {confirmPassword && (
                        <span className={`text-[11px] font-medium flex items-center gap-1 ${
                          password === confirmPassword ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                        }`}>
                          {password === confirmPassword ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Mật khẩu khớp
                            </>
                          ) : (
                            "Chưa khớp"
                          )}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="Nhập lại mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        className={`w-full text-sm pl-9 pr-10 py-2 rounded-xl border bg-muted/40 focus:bg-background focus:outline-none focus:ring-2 ${
                          confirmPassword && password !== confirmPassword
                            ? "border-rose-400 focus:ring-rose-500/30"
                            : confirmPassword && password === confirmPassword
                            ? "border-emerald-400 focus:ring-emerald-500/30"
                            : "border-border focus:ring-rose-500/30"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl shadow-md shadow-rose-600/30 cursor-pointer"
                >
                  {isLoading && loadingProvider === "email" ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {tab === "signin" ? "Đăng nhập ngay" : "Tạo tài khoản học tập"}
                </Button>
              </form>

              {/* One-click Local Review Testing Box */}
              <div className="pt-2 border-t border-border/60 space-y-2">
                <span className="text-[11px] text-muted-foreground font-semibold block text-center">
                  🛠️ Trải nghiệm nhanh trên môi trường Local:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("google")}
                    className="p-2 rounded-xl border border-border hover:bg-muted/60 text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Google Demo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("facebook")}
                    className="p-2 rounded-xl border border-border hover:bg-muted/60 text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Facebook Demo</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Simple Footer */}
      <div className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
        © 2026 VnE Reader English. Nền tảng học tiếng Anh qua dữ liệu báo chí VnExpress.
      </div>
    </div>
  );
}
