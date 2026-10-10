"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Settings, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowLeft, 
  Globe, 
  RotateCcw, 
  Save, 
  Check, 
  SlidersHorizontal, 
  LogOut, 
  ExternalLink,
  BookOpen,
  Info,
  Layers,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PUBLICATION_SOURCES } from "@/lib/rss";
import { PublicationSourceId } from "@/types/news";
import { 
  getAuthSession, 
  saveAuthSession, 
  clearAuthSession, 
  isAdminUser, 
  loginWithAdminCredentials, 
  createOrInitAdminAccount, 
  ADMIN_USERNAME, 
  ADMIN_PASSWORD,
  ADMIN_DEFAULT_USER
} from "@/lib/auth";
import { 
  SiteSettings, 
  DEFAULT_SITE_SETTINGS, 
  ALL_PUBLICATION_SOURCE_IDS, 
  getLocalSiteSettings, 
  saveLocalSiteSettings, 
  updateRemoteSiteSettings, 
  fetchRemoteSiteSettings 
} from "@/lib/siteSettings";
import { User } from "@/types/auth";

export default function AdminSettingsPage() {
  const router = useRouter();

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Login Form State (If not admin)
  const [loginUsername, setLoginUsername] = useState("admin");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccessNotice, setLoginSuccessNotice] = useState<string | null>(null);

  // Settings State
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"sources" | "general">("sources");

  // Load Auth & Settings on mount
  useEffect(() => {
    const session = getAuthSession();
    setCurrentUser(session.user);
    setAuthLoading(false);

    // Load initial local settings
    const local = getLocalSiteSettings();
    setSettings(local);

    // Fetch remote settings in background
    fetchRemoteSiteSettings().then((remote) => {
      setSettings(remote);
    });

    const handleAuthChange = () => {
      setCurrentUser(getAuthSession().user);
    };
    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  const isAdmin = isAdminUser(currentUser);

  // Handler: Regular Admin Login
  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);

    const res = loginWithAdminCredentials(loginUsername, loginPassword);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setLoginSuccessNotice("Đăng nhập quyền quản trị viên thành công!");
    } else {
      setLoginError(res.error || "Tài khoản hoặc mật khẩu không đúng.");
    }
  };

  // Handler: 1-Click Init Admin Account (admin / 123123)
  const handleQuickCreateAdmin = () => {
    const adminUser = createOrInitAdminAccount();
    setCurrentUser(adminUser);
    setLoginSuccessNotice("Đã kích hoạt & đăng nhập tài khoản admin/123123 thành công!");
  };

  // Handler: Logout Admin
  const handleAdminLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setLoginSuccessNotice(null);
  };

  // Toggle single publication source
  const handleToggleSource = (sourceId: PublicationSourceId) => {
    setSettings((prev) => {
      const exists = prev.enabledSources.includes(sourceId);
      let updated: PublicationSourceId[];
      if (exists) {
        // Prevent disabling all sources
        if (prev.enabledSources.length <= 1) {
          alert("Hệ thống cần tối thiểu 1 nguồn báo hoạt động cho người dùng!");
          return prev;
        }
        updated = prev.enabledSources.filter((id) => id !== sourceId);
      } else {
        updated = [...prev.enabledSources, sourceId];
      }
      return { ...prev, enabledSources: updated };
    });
  };

  // Select all sources
  const handleSelectAllSources = () => {
    setSettings((prev) => ({
      ...prev,
      enabledSources: [...ALL_PUBLICATION_SOURCE_IDS]
    }));
  };

  // Select only international sources
  const handleSelectInternationalOnly = () => {
    setSettings((prev) => ({
      ...prev,
      enabledSources: ALL_PUBLICATION_SOURCE_IDS.filter((id) => id !== "vnexpress")
    }));
  };

  // Reset to default settings
  const handleResetDefaults = () => {
    if (confirm("Bạn có chắc chắn muốn khôi phục toàn bộ cài đặt về mặc định ban đầu không?")) {
      setSettings(DEFAULT_SITE_SETTINGS);
      saveLocalSiteSettings(DEFAULT_SITE_SETTINGS);
      updateRemoteSiteSettings(DEFAULT_SITE_SETTINGS);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Save changes
  const handleSaveChanges = async () => {
    setIsSaving(true);
    const updated = {
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.name || "Admin"
    };
    const res = await updateRemoteSiteSettings(updated);
    setIsSaving(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } else {
      alert("Lỗi khi lưu cài đặt: " + res.error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600" />
      </div>
    );
  }

  // ==========================================
  // CASE 1: NOT LOGGED IN AS ADMIN
  // ==========================================
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          {/* Header & Logo */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 text-white shadow-xl shadow-rose-500/25 mb-2">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              VnE Reader Admin Portal
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Khu vực quản trị cấu hình nguồn báo & cài đặt chung cho toàn website
            </p>
          </div>

          {/* Admin Credentials Helper Callout */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>Thông tin tài khoản Admin hệ thống:</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Bạn có thể đăng nhập hoặc tạo ngay tài khoản quản trị với thông số:
            </p>
            <div className="grid grid-cols-2 gap-2 bg-background/80 p-2.5 rounded-xl border border-amber-500/20 font-mono text-[11px]">
              <div>
                <span className="text-muted-foreground block text-[10px]">Tên đăng nhập:</span>
                <span className="font-bold text-foreground">admin</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Mật khẩu:</span>
                <span className="font-bold text-foreground">123123</span>
              </div>
            </div>
          </div>

          {/* Quick 1-Click Init Button */}
          <Button
            type="button"
            onClick={handleQuickCreateAdmin}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-2.5 shadow-md shadow-emerald-600/20 rounded-xl flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>⚡ Kích hoạt & Đăng nhập ngay (admin / 123123)</span>
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-background px-3 text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
              Hoặc nhập thủ công
            </span>
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4 bg-card p-6 rounded-3xl border border-border/80 shadow-lg">
            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Tài khoản Admin
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="admin"
                  required
                  className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-border bg-muted/30 focus:bg-background focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="123123"
                  required
                  className="w-full text-sm pl-9 pr-10 py-2.5 rounded-xl border border-border bg-muted/30 focus:bg-background focus:outline-none focus:ring-2 focus:ring-rose-500/30"
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

            <Button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl shadow-md shadow-rose-600/25"
            >
              Đăng nhập Quản trị viên
            </Button>
          </form>

          {/* Back Link */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại trang đọc báo VnE Reader</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE 2: LOGGED IN AS ADMIN (DASHBOARD)
  // ==========================================
  const enabledCount = settings.enabledSources.length;
  const totalCount = PUBLICATION_SOURCES.length;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-tight">
                  Admin Control Panel
                </span>
                <Badge className="bg-rose-600 text-white font-bold text-[10px] px-2 py-0 border-none">
                  ADMIN
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground hidden sm:block">
                Cài đặt hiển thị nguồn báo & cấu hình trang chung
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-1.5 border-border hover:bg-muted font-medium text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Xem Trang Chủ</span>
              </Button>
            </Link>

            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 border-border hover:bg-muted font-medium text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Về Website</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleAdminLogout}
              className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1"
              title="Đăng xuất quyền Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Admin Overview Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/30 p-6 sm:p-8 shadow-sm">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-bold px-2.5 py-0.5">
                ● Đang đăng nhập: {currentUser?.email || "admin@vnexpress.vn"}
              </Badge>
              <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-xs font-bold px-2.5 py-0.5">
                Toàn quyền quản trị
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Quản Lý Cấu Hình & Nguồn Báo Hiển Thị
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Bạn có thể chọn bất kỳ nguồn báo nào để cho phép độc giả thông thường xem. 
              <strong className="text-foreground font-semibold"> Đối với tài khoản Admin</strong>, bạn sẽ luôn thấy đầy đủ <span className="text-rose-600 dark:text-rose-400 font-bold">10/10 nguồn báo</span> trên toàn trang chủ để dễ dàng kiểm thử nội dung bất kỳ lúc nào.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="p-3.5 rounded-2xl bg-background/80 border border-border/80 backdrop-blur-sm">
                <span className="text-[11px] text-muted-foreground font-medium block">Tổng nguồn báo</span>
                <span className="text-xl font-black text-foreground">{totalCount} Báo</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-background/80 border border-border/80 backdrop-blur-sm">
                <span className="text-[11px] text-muted-foreground font-medium block">Đang bật cho khách</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{enabledCount} / {totalCount}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-background/80 border border-border/80 backdrop-blur-sm">
                <span className="text-[11px] text-muted-foreground font-medium block">Chế độ Admin</span>
                <span className="text-xl font-black text-rose-600 dark:text-rose-400">Hiện 100% (10/10)</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-background/80 border border-border/80 backdrop-blur-sm">
                <span className="text-[11px] text-muted-foreground font-medium block">Cập nhật lần cuối</span>
                <span className="text-xs font-bold text-foreground block truncate mt-1">
                  {new Date(settings.updatedAt).toLocaleTimeString("vi-VN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <button
            onClick={() => setActiveTab("sources")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "sources"
                ? "bg-rose-600 text-white shadow-sm shadow-rose-600/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Danh Sách 10 Nguồn Báo ({enabledCount}/{totalCount} Đang Bật)</span>
          </button>

          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "general"
                ? "bg-rose-600 text-white shadow-sm shadow-rose-600/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cài Đặt Chung Website</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: DANH SÁCH TẤT CẢ CÁC BÁO & BẬT/TẮT HIỂN THỊ */}
        {/* ========================================================= */}
        {activeTab === "sources" && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/20 p-4 rounded-2xl border border-border/60">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-rose-600" />
                  <span>Chọn nguồn báo hiển thị cho người dùng thông thường</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tích chọn báo bạn muốn xuất hiện trên thanh điều hướng và danh mục đọc báo
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllSources}
                  className="text-xs font-semibold h-8"
                >
                  ✓ Chọn Tất Cả (10 Báo)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectInternationalOnly}
                  className="text-xs font-semibold h-8"
                >
                  🌐 Chỉ Báo Quốc Tế (9 Báo)
                </Button>
              </div>
            </div>

            {/* Grid of 10 Publications */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {PUBLICATION_SOURCES.map((pub) => {
                const isEnabled = settings.enabledSources.includes(pub.id);

                return (
                  <div
                    key={pub.id}
                    onClick={() => handleToggleSource(pub.id)}
                    className={`group relative rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
                      isEnabled
                        ? "bg-card border-border hover:border-rose-500/50 shadow-sm"
                        : "bg-muted/30 border-border/40 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${pub.gradient} flex items-center justify-center text-white font-black text-sm shadow-md`}>
                            {pub.logoText}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm text-foreground group-hover:text-rose-600 transition-colors">
                              {pub.name}
                            </h3>
                            <span className="text-[11px] text-muted-foreground font-medium block">
                              {pub.shortName} • {pub.channels.length} chuyên mục con
                            </span>
                          </div>
                        </div>

                        {/* Toggle Checkbox Switch */}
                        <div className="flex-shrink-0 pt-0.5">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                            isEnabled
                              ? "bg-rose-600 border-rose-600 text-white shadow-sm shadow-rose-600/30"
                              : "bg-muted border-border text-transparent"
                          }`}>
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        </div>
                      </div>

                      {/* Tagline & Info */}
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {pub.tagline}
                      </p>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 font-bold border ${pub.badgeColor}`}>
                          {pub.badge}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] px-2 py-0 font-medium">
                          CEFR {pub.cefrRange}
                        </Badge>
                      </div>
                    </div>

                    {/* Footer Status */}
                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px]">
                      <span className={`font-bold flex items-center gap-1 ${
                        isEnabled ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                      }`}>
                        {isEnabled ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Hiển thị cho độc giả</span>
                          </>
                        ) : (
                          <>
                            <span>✕ Đã ẩn với người dùng</span>
                          </>
                        )}
                      </span>

                      <span className="text-[10px] text-muted-foreground">
                        Admin: Luôn xem được
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CÀI ĐẶT CHUNG WEBSITE */}
        {/* ========================================================= */}
        {activeTab === "general" && (
          <div className="max-w-2xl bg-card rounded-3xl border border-border/80 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">
                Cài Đặt Hiển Thị & Giao Diện Toàn Trang
              </h2>
              <p className="text-xs text-muted-foreground">
                Tùy chỉnh các thông số mặc định cho độc giả khi truy cập hệ thống
              </p>
            </div>

            {/* Subtitle Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">
                Dòng Tiêu Đề Phụ Header (Header Subtitle)
              </label>
              <input
                type="text"
                value={settings.headerSubtitle}
                onChange={(e) => setSettings({ ...settings, headerSubtitle: e.target.value })}
                placeholder="Đọc báo & học tiếng Anh đa nguồn thông minh"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-muted/30 focus:bg-background focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
              <span className="text-[11px] text-muted-foreground">
                Xuất hiện ngay dưới logo &quot;VnE Reader&quot; ở thanh điều hướng trên cùng.
              </span>
            </div>

            {/* Default Source Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">
                Nguồn Báo Mặc Định Khi Mở Trang Chủ
              </label>
              <select
                value={settings.defaultSource}
                onChange={(e) => setSettings({ ...settings, defaultSource: e.target.value as any })}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-muted/30 focus:bg-background focus:outline-none focus:ring-2 focus:ring-rose-500/30 cursor-pointer"
              >
                <option value="all">Tổng hợp (Tất cả nguồn báo đã bật)</option>
                {PUBLICATION_SOURCES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.shortName})
                  </option>
                ))}
              </select>
            </div>

            {/* Default CEFR Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">
                Cấp Độ Tiếng Anh Mặc Định (CEFR Level)
              </label>
              <select
                value={settings.defaultCefrLevel}
                onChange={(e) => setSettings({ ...settings, defaultCefrLevel: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-muted/30 focus:bg-background focus:outline-none focus:ring-2 focus:ring-rose-500/30 cursor-pointer"
              >
                <option value="all">Tất cả cấp độ (Mặc định)</option>
                <option value="A2">Cơ bản (A2)</option>
                <option value="B1">Trung cấp sơ cấp (B1)</option>
                <option value="B2">Trung cấp cao (B2)</option>
                <option value="C1">Nâng cao (C1)</option>
                <option value="C2">Bản xứ & Học thuật (C2)</option>
              </select>
            </div>

            {/* Show Thumbnails Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/60">
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Hiển thị ảnh bìa bài báo (Thumbnails)
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Bật để hiển thị ảnh minh họa từ RSS hoặc Unsplash
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.showThumbnails}
                onChange={(e) => setSettings({ ...settings, showThumbnails: e.target.checked })}
                className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Sticky Save Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border/80 py-3.5 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {saveSuccess && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã lưu cài đặt và áp dụng toàn hệ thống!</span>
                </div>
              )}
              {!saveSuccess && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Đang chọn <strong>{enabledCount} / {totalCount} nguồn báo</strong> cho độc giả.
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetDefaults}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground h-9"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                <span>Khôi phục mặc định</span>
              </Button>

              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 h-9 shadow-md shadow-rose-600/25 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
              </Button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
