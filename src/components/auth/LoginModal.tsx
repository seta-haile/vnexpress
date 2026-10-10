"use client";

import React, { useState } from "react";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Database,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveAuthSession, DEMO_ACCOUNTS, createOrInitAdminAccount } from "@/lib/auth";
import { loginWithRealGoogle, loginWithRealFacebook } from "@/lib/oauth-sdk";
import { User } from "@/types/auth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: User) => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
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

  if (!isOpen) return null;

  // Real Social Login Handler
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
      if (onSuccess) onSuccess(loggedInUser);
      onClose();
    } catch (err: any) {
      console.error(`${provider} login error:`, err);
      setErrorMsg(err.message || `Lỗi đăng nhập ${provider}`);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  // Email login / signup handler
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
      // Check for Admin Account: admin@admin.com / 123123
      const cleanEmail = email.trim().toLowerCase();
      if ((cleanEmail === "admin@admin.com" || cleanEmail === "admin" || cleanEmail === "admin@vnexpress.vn") && password === "123123") {
        const adminUser = createOrInitAdminAccount();
        if (onSuccess) onSuccess(adminUser);
        onClose();
        return;
      }

      const isHaiLe = cleanEmail === "hai.le@vnereader.com";
      const user: User = {
        id: isHaiLe ? "usr_admin_haile" : `usr_${Date.now()}`,
        name: name.trim() || (isHaiLe ? "Hải Lê" : email.split("@")[0]),
        email: email.trim(),
        avatar: isHaiLe
          ? "https://api.dicebear.com/7.x/avataaars/svg?seed=hai.le"
          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        provider: "credentials",
        role: isHaiLe ? "admin" : "user",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      // Lưu vào PostgreSQL Database qua API backend
      let finalUser = user;
      try {
        const res = await fetch("/api/auth/social-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user })
        });
        const data = await res.json();
        if (data?.user) {
          finalUser = data.user;
        }
      } catch (e) {
        console.warn("Could not sync to DB:", e);
      }

      saveAuthSession(finalUser);
      if (onSuccess) onSuccess(finalUser);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi đăng nhập email");
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card text-card-foreground rounded-3xl shadow-2xl border border-border/80 overflow-hidden p-6 sm:p-7 space-y-5">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex p-3 rounded-2xl bg-rose-500/10 text-rose-600 mb-1">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            {tab === "signin" ? "Chào mừng trở lại!" : "Tạo tài khoản mới"}
          </h2>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Đăng nhập để lưu từ vựng và đồng bộ tiến độ học tập trên mọi thiết bị
          </p>
        </div>

        {/* Tab Toggle: Sign In / Sign Up */}
        <div className="flex p-1 bg-muted/60 rounded-xl border border-border/50">
          <button
            type="button"
            onClick={() => {
              setTab("signin");
              setErrorMsg(null);
              setConfirmPassword("");
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tab === "signin"
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
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tab === "signup"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Đăng ký tài khoản
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

        {/* Email Form */}
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
                  <span className={`text-[11px] font-medium flex items-center gap-1 ${password === confirmPassword ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
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
                  className={`w-full text-sm pl-9 pr-10 py-2 rounded-xl border bg-muted/40 focus:bg-background focus:outline-none focus:ring-2 ${confirmPassword && password !== confirmPassword
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

        {/* Database Benefits Callout */}
        <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 text-xs text-muted-foreground space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Đặc quyền tài khoản học tập:</span>
          </div>
          <ul className="space-y-1 text-[11px] pl-4 list-disc marker:text-rose-500">
            <li>Lưu vĩnh viễn sổ từ vựng và cấp độ CEFR của riêng bạn.</li>
            <li>Giữ nguyên chuỗi ngày học Streak liên tục trên điện thoại và máy tính.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
