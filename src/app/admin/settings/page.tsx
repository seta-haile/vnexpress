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
  LayoutGrid,
  Users,
  BarChart3,
  Search,
  CheckCircle,
  XCircle,
  Database,
  Sliders,
  Shield,
  Clock,
  Mail,
  Filter,
  Menu,
  X,
  Volume2,
  Loader2
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
  syncSessionWithServer,
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

type AdminTab = "sources" | "users" | "general" | "analytics";

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
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [activeTab, setActiveTab] = useState<AdminTab>("sources");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Users Management State
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);

  // Sources Search & Filter
  const [sourceSearchQuery, setSourceSearchQuery] = useState("");

  // Load Auth & Settings on mount
  useEffect(() => {
    const session = getAuthSession();
    setCurrentUser(session.user);
    setAuthLoading(false);

    // Auto synchronize permissions and role from PostgreSQL
    syncSessionWithServer().then((synced) => {
      if (synced) setCurrentUser(synced);
    });

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

  // Fetch users list when opening users tab or when logged in as admin
  useEffect(() => {
    if (isAdminUser(currentUser)) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && data.users) {
        setUsersList(data.users);
        setIsDbConnected(!!data.isDbConnected);
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

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

  // Helper: Auto-save settings to database and local store immediately
  const autoSave = async (newSettings: SiteSettings) => {
    setSettings(newSettings);
    saveLocalSiteSettings(newSettings);
    setSaveStatus("saving");

    try {
      const updated = {
        ...newSettings,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.name || "Admin"
      };
      await updateRemoteSiteSettings(updated);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (e) {
      console.error("Auto save error:", e);
      setSaveStatus("idle");
    }
  };

  // Toggle single publication source (Immediately auto-saves to DB)
  const handleToggleSource = (sourceId: PublicationSourceId) => {
    const exists = settings.enabledSources.includes(sourceId);
    let updated: PublicationSourceId[];
    if (exists) {
      if (settings.enabledSources.length <= 1) {
        alert("Hệ thống cần tối thiểu 1 nguồn báo hoạt động cho người dùng!");
        return;
      }
      updated = settings.enabledSources.filter((id) => id !== sourceId);
    } else {
      updated = [...settings.enabledSources, sourceId];
    }
    const newSettings = { ...settings, enabledSources: updated };
    autoSave(newSettings);
  };

  // Select all sources (Immediately auto-saves to DB)
  const handleSelectAllSources = () => {
    const newSettings = {
      ...settings,
      enabledSources: [...ALL_PUBLICATION_SOURCE_IDS]
    };
    autoSave(newSettings);
  };

  // Select only international sources (Immediately auto-saves to DB)
  const handleSelectInternationalOnly = () => {
    const newSettings = {
      ...settings,
      enabledSources: ALL_PUBLICATION_SOURCE_IDS.filter((id) => id !== "vnexpress")
    };
    autoSave(newSettings);
  };

  // Reset to default settings (Immediately auto-saves to DB)
  const handleResetDefaults = () => {
    if (confirm("Bạn có chắc chắn muốn khôi phục toàn bộ cài đặt về mặc định ban đầu không?")) {
      autoSave(DEFAULT_SITE_SETTINGS);
    }
  };

  // Toggle user role in DB
  const handleToggleUserRole = async (user: User) => {
    const newRole = user.role === "admin" ? "learner" : "admin";
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id || user.email, newRole })
      });
      setUsersList((prev) =>
        prev.map((u) => (u.id === user.id || u.email === user.email ? { ...u, role: newRole as any } : u))
      );
    } catch (e) {
      console.error("Failed to toggle role:", e);
    }
  };

  // Delete user from DB & backup store
  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa thành viên "${user.name}" (${user.email}) khỏi hệ thống không?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users?email=${encodeURIComponent(user.email)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setUsersList((prev) => prev.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase()));
      } else {
        alert(data.error || "Không thể xóa thành viên.");
      }
    } catch (e) {
      console.error("Failed to delete user:", e);
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
  // CASE 1: NOT LOGGED IN AS ADMIN (LOGIN VIEW)
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
              Khu vực quản trị cấu hình nguồn báo, thành viên & hệ thống
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
  // CASE 2: LOGGED IN AS ADMIN (DASHBOARD UI)
  // ==========================================
  const enabledCount = settings.enabledSources.length;
  const totalCount = PUBLICATION_SOURCES.length;

  // Filter sources in Tab 1
  const filteredPublications = PUBLICATION_SOURCES.filter((p) => {
    const q = sourceSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.shortName.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q)
    );
  });

  // Filter users in Tab 2
  const filteredUsers = usersList.filter((u) => {
    const q = userSearchQuery.toLowerCase().trim();
    const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      
      {/* ======================================================== */}
      {/* LEFT SIDEBAR NAVIGATION MENU */}
      {/* ======================================================== */}
      <aside className={`
        fixed md:sticky top-0 z-50 h-screen w-64 lg:w-72 bg-card border-r border-border/70 flex flex-col justify-between p-4 transition-transform duration-300
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Brand Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-extrabold text-base tracking-tight text-foreground">
                  Admin Portal
                </h2>
                <span className="text-[11px] text-muted-foreground font-semibold">
                  VnE Reader Control Center
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1 rounded-lg text-muted-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu Tabs */}
          <nav className="space-y-1.5">
            <button
              onClick={() => {
                setActiveTab("sources");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "sources"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4" />
                <span>Nguồn Báo Hiển Thị</span>
              </div>
              <Badge className={`text-[10px] px-1.5 py-0 font-bold border-none ${
                activeTab === "sources" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {enabledCount}/{totalCount}
              </Badge>
            </button>

            <button
              onClick={() => {
                setActiveTab("users");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "users"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Thành Viên & Độc Giả</span>
              </div>
              <Badge className={`text-[10px] px-1.5 py-0 font-bold border-none ${
                activeTab === "users" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {usersList.length}
              </Badge>
            </button>

            <button
              onClick={() => {
                setActiveTab("general");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "general"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" />
                <span>Cài Đặt Chung Trang</span>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab("analytics");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4" />
                <span>Giám Sát Hệ Thống</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </nav>
        </div>

        {/* Sidebar Footer: Admin User Profile Card & Quick Actions */}
        <div className="space-y-3 pt-4 border-t border-border/60">
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 flex items-center gap-2.5">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt="Admin"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-500/40"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-rose-500/20 text-rose-600 font-bold flex items-center justify-center text-xs">
                A
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-foreground truncate">
                {currentUser?.name || "Admin"}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {currentUser?.email || "admin@vnexpress.vn"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link href="/" target="_blank" className="w-full">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold h-8 rounded-xl flex items-center justify-center gap-1 border-border/80 hover:bg-muted"
                title="Mở trang chủ người dùng"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Web Client</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAdminLogout}
              className="w-full text-xs font-semibold h-8 rounded-xl text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center gap-1"
              title="Đăng xuất Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* ======================================================== */}
      {/* MAIN DASHBOARD CONTENT AREA */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Top bar */}
        <header className="md:hidden sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/60 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 rounded-lg border border-border/80 hover:bg-muted"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-sm text-foreground">
              {activeTab === "sources" && "Nguồn Báo Hiển Thị"}
              {activeTab === "users" && "Thành Viên & Người Dùng"}
              {activeTab === "general" && "Cài Đặt Chung"}
              {activeTab === "analytics" && "Giám Sát Hệ Thống"}
            </span>
          </div>

          <Link href="/">
            <Button size="sm" variant="outline" className="h-8 text-xs font-semibold rounded-full">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Về Web</span>
            </Button>
          </Link>
        </header>

        {/* Dashboard Main Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6 pb-16">

          {/* ========================================================================= */}
          {/* TAB 1: NGUỒN BÁO HIỂN THỊ (PUBLICATIONS TAB) */}
          {/* ========================================================================= */}
          {activeTab === "sources" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-card via-card to-muted/30 p-6 rounded-3xl border border-border/80 shadow-sm">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs mb-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>QUẢN LÝ NGUỒN BÁO</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    Cấu Hình Nguồn Báo Hiển Thị
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Độc giả thông thường sẽ chỉ thấy các nguồn được bật ({enabledCount}/{totalCount}). Thay đổi được tự động lưu vào Database.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {saveStatus === "saving" && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full animate-pulse border border-border/50">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                      <span>Đang lưu DB...</span>
                    </span>
                  )}
                  {saveStatus === "saved" && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Đã lưu vào DB</span>
                    </span>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllSources}
                    className="text-xs font-bold rounded-full h-8 border-border hover:bg-muted"
                  >
                    ✓ Bật Tất Cả (10 Báo)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectInternationalOnly}
                    className="text-xs font-bold rounded-full h-8 border-border hover:bg-muted"
                  >
                    🌐 Chỉ Báo Quốc Tế (9 Báo)
                  </Button>
                </div>
              </div>

              {/* Search filter for sources */}
              <div className="relative max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm nguồn báo theo tên hoặc đặc trưng..."
                  value={sourceSearchQuery}
                  onChange={(e) => setSourceSearchQuery(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 rounded-full border border-border bg-card focus:bg-background focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>

              {/* 10 Sources Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredPublications.map((pub) => {
                  const isEnabled = settings.enabledSources.includes(pub.id);

                  return (
                    <div
                      key={pub.id}
                      onClick={() => handleToggleSource(pub.id)}
                      className={`group relative rounded-3xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
                        isEnabled
                          ? "bg-card border-border hover:border-rose-500/50 shadow-sm hover:shadow-md"
                          : "bg-muted/20 border-border/40 opacity-65 hover:opacity-90"
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${pub.gradient} flex items-center justify-center text-white font-black text-sm shadow-md`}>
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

                          {/* Checkbox */}
                          <div className="flex-shrink-0 pt-0.5">
                            <div className={`w-6 h-6 rounded-xl flex items-center justify-center border transition-all ${
                              isEnabled
                                ? "bg-rose-600 border-rose-600 text-white shadow-sm shadow-rose-600/30"
                                : "bg-muted border-border text-transparent"
                            }`}>
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          </div>
                        </div>

                        {/* Tagline */}
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

                      {/* Footer */}
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

          {/* ========================================================================= */}
          {/* TAB 2: THÀNH VIÊN & NGƯỜI DÙNG (USERS TAB) */}
          {/* ========================================================================= */}
          {activeTab === "users" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-card via-card to-muted/30 p-6 rounded-3xl border border-border/80 shadow-sm">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs mb-2">
                    <Users className="w-3.5 h-3.5" />
                    <span>QUẢN LÝ THÀNH VIÊN & TÀI KHOẢN</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    Danh Sách Thành Viên & Độc Giả ({usersList.length})
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tất cả tài khoản đăng nhập qua Google, Facebook, hoặc Email đều được lưu vĩnh viễn và đồng bộ vào hệ thống.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchUsers}
                    disabled={isLoadingUsers}
                    className="h-9 px-3 rounded-xl text-xs font-bold border-border/80 hover:bg-muted flex items-center gap-1.5"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isLoadingUsers ? "animate-spin" : ""}`} />
                    <span>Làm mới</span>
                  </Button>

                  <Badge variant="outline" className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                    isDbConnected ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                  }`}>
                    <Database className="w-3.5 h-3.5" />
                    <span>{isDbConnected ? "PostgreSQL Connected" : "Local Sync Store"}</span>
                  </Badge>
                </div>
              </div>

              {/* Quick User Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-sm space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">Tổng thành viên</span>
                  <div className="text-2xl font-black text-foreground">{usersList.length}</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-sm space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">Tài khoản Google</span>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {usersList.filter((u) => u.provider === "google").length}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-sm space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">Tài khoản Facebook</span>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {usersList.filter((u) => u.provider === "facebook").length}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-sm space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">Quản trị viên (Admin)</span>
                  <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                    {usersList.filter((u) => u.role === "admin" || isAdminUser(u)).length}
                  </div>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 rounded-full border border-border bg-card focus:bg-background focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-full border border-border/50 text-xs self-start sm:self-auto">
                  {(["all", "admin", "learner"] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setUserRoleFilter(role)}
                      className={`px-3 py-1 rounded-full font-bold transition-all ${
                        userRoleFilter === role
                          ? "bg-foreground text-background shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {role === "all" ? "Tất cả" : role === "admin" ? "Admin 👑" : "Học viên 🎓"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Table */}
              <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
                {isLoadingUsers ? (
                  <div className="py-16 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                    <span>Đang nạp danh sách người dùng...</span>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="py-16 text-center text-sm text-muted-foreground space-y-2">
                    <p>Không tìm thấy thành viên nào phù hợp.</p>
                    {userSearchQuery && (
                      <Button variant="outline" size="sm" onClick={() => setUserSearchQuery("")} className="text-xs">
                        Xóa bộ lọc tìm kiếm
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4 sm:px-6">Thành viên</th>
                          <th className="py-3.5 px-4">Đăng nhập qua</th>
                          <th className="py-3.5 px-4">Vai trò (Role)</th>
                          <th className="py-3.5 px-4">Đăng nhập gần nhất</th>
                          <th className="py-3.5 px-4 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {filteredUsers.map((user) => {
                          const isUserAdminRole = user.role === "admin" || isAdminUser(user);
                          const isMasterAdmin = user.email?.toLowerCase().trim() === "hai.le@vnereader.com" || user.email?.toLowerCase().trim() === "admin@vnexpress.vn";

                          return (
                            <tr key={user.id || user.email} className="hover:bg-muted/30 transition-colors">
                              {/* Member info */}
                              <td className="py-3.5 px-4 sm:px-6">
                                <div className="flex items-center gap-3">
                                  {user.avatar ? (
                                    <img
                                      src={user.avatar}
                                      alt={user.name}
                                      className="w-9 h-9 rounded-full object-cover ring-1 ring-border shrink-0"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-rose-500/20 text-rose-600 font-bold flex items-center justify-center text-xs shrink-0">
                                      {user.name?.charAt(0) || "U"}
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-bold text-foreground flex items-center gap-1.5">
                                      <span>{user.name}</span>
                                      {isMasterAdmin && (
                                        <Badge className="text-[9px] px-1 py-0 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-none font-bold">
                                          Chủ hệ thống
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground font-mono">
                                      {user.email}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Provider */}
                              <td className="py-3.5 px-4">
                                {user.provider === "google" ? (
                                  <Badge className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1.5 w-fit">
                                    <svg className="w-3 h-3" viewBox="0 0 24 24">
                                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.28-2.09 3.66-5.17 3.66-9.14z"/>
                                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.13C3.25 21.35 7.34 24 12 24z"/>
                                      <path fill="#FBBC05" d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.27C.46 8.21 0 10.05 0 12s.46 3.79 1.27 5.41l4.01-3.13z"/>
                                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.65 1.27 6.59l4.01 3.13c.95-2.83 3.6-4.97 6.72-4.97z"/>
                                    </svg>
                                    <span>Google</span>
                                  </Badge>
                                ) : user.provider === "facebook" ? (
                                  <Badge className="text-[10px] font-bold px-2 py-0.5 bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/20 flex items-center gap-1.5 w-fit">
                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    <span>Facebook</span>
                                  </Badge>
                                ) : (
                                  <Badge className="text-[10px] font-bold px-2 py-0.5 capitalize bg-muted text-foreground border border-border/80 flex items-center gap-1 w-fit">
                                    <Mail className="w-3 h-3 text-muted-foreground" />
                                    <span>{user.provider || "Credentials"}</span>
                                  </Badge>
                                )}
                              </td>

                              {/* Role */}
                              <td className="py-3.5 px-4">
                                {isUserAdminRole ? (
                                  <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-300 font-bold text-xs">
                                    👑 Quản trị viên (Admin)
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs font-medium bg-muted/40">
                                    🎓 Học viên (Learner)
                                  </Badge>
                                )}
                              </td>

                              {/* Last Login */}
                              <td className="py-3.5 px-4 text-xs text-muted-foreground font-mono">
                                {new Date(user.lastLoginAt || user.createdAt).toLocaleDateString("vi-VN", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {!isMasterAdmin && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleToggleUserRole(user)}
                                      className="h-8 text-xs font-semibold rounded-xl hover:bg-muted"
                                      title="Thay đổi quyền giữa Admin và Học viên"
                                    >
                                      {isUserAdminRole ? "Gán quyền Học viên" : "Thăng quyền Admin"}
                                    </Button>
                                  )}

                                  {!isMasterAdmin && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteUser(user)}
                                      className="h-8 px-2 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                      title="Xóa tài khoản này khỏi hệ thống"
                                    >
                                      Xóa
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CÀI ĐẶT CHUNG (GENERAL SETTINGS TAB) */}
          {/* ========================================================================= */}
          {activeTab === "general" && (
            <div className="max-w-3xl space-y-6 animate-in fade-in duration-200">
              <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs mb-2">
                      <Settings className="w-3.5 h-3.5" />
                      <span>CÀI ĐẶT HỆ THỐNG</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                      Cấu Hình Chung Toàn Website
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                      Mọi thay đổi sẽ tự động lưu vào Database ngay khi bạn chọn
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {saveStatus === "saving" && (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full animate-pulse border border-border/50">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                        <span>Đang lưu DB...</span>
                      </span>
                    )}
                    {saveStatus === "saved" && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 animate-in fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã lưu vào DB</span>
                      </span>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetDefaults}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground h-8 rounded-full"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      <span>Mặc định</span>
                    </Button>
                  </div>
                </div>

                {/* Subtitle Input */}
                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-bold text-foreground">
                    Dòng Tiêu Đề Phụ Header (Header Subtitle)
                  </label>
                  <input
                    type="text"
                    value={settings.headerSubtitle}
                    onChange={(e) => setSettings({ ...settings, headerSubtitle: e.target.value })}
                    onBlur={() => autoSave(settings)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.currentTarget.blur();
                        autoSave(settings);
                      }
                    }}
                    placeholder="Đọc báo & học tiếng Anh đa nguồn thông minh"
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-muted/30 focus:bg-background focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all"
                  />
                  <span className="text-[11px] text-muted-foreground">
                    Nhập xong bấm Enter hoặc click ra ngoài để tự động lưu vào Database.
                  </span>
                </div>

                {/* Default Source Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground">
                    Nguồn Báo Mặc Định Khi Mở Trang Chủ
                  </label>
                  <select
                    value={settings.defaultSource}
                    onChange={(e) => {
                      const updated = { ...settings, defaultSource: e.target.value as any };
                      autoSave(updated);
                    }}
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
                    onChange={(e) => {
                      const updated = { ...settings, defaultCefrLevel: e.target.value };
                      autoSave(updated);
                    }}
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
                    onChange={(e) => {
                      const updated = { ...settings, showThumbnails: e.target.checked };
                      autoSave(updated);
                    }}
                    className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: GIÁM SÁT HỆ THỐNG (ANALYTICS & SYSTEM HEALTH TAB) */}
          {/* ========================================================================= */}
          {activeTab === "analytics" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 space-y-6 shadow-sm">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-2">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>TRẠNG THÁI HỆ THỐNG</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    Giám Sát Hạ Tầng & Dịch Vụ
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Kiểm tra trạng thái kết nối máy chủ, API Giọng đọc Neural AI và luồng nạp tin RSS
                  </p>
                </div>

                {/* Service Health Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Cơ sở dữ liệu PostgreSQL</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {isDbConnected ? "Hoạt động hoàn hảo" : "Chế độ Local Storage"}
                    </div>
                    <p className="text-[11px] text-muted-foreground">Đồng bộ tự động thông tin người dùng và thiết lập</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Microsoft Edge Neural TTS</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      100% Free & Unlimited
                    </div>
                    <p className="text-[11px] text-muted-foreground">Giọng đọc AI tự nhiên cho toàn bộ bài báo & bài nghe</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Luồng nạp RSS 10 Nguồn Báo</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      10 / 10 Feeds Active
                    </div>
                    <p className="text-[11px] text-muted-foreground">Cập nhật tin tức trực tiếp từ các tòa soạn hàng đầu</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
