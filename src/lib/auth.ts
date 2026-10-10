"use client";

import { User, AuthSession } from "@/types/auth";

const AUTH_STORAGE_KEY = "vne_auth_session_v1";

export function getAuthSession(): AuthSession {
  if (typeof window === "undefined") {
    return { user: null, isAuthenticated: false };
  }
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { user: null, isAuthenticated: false };
    const user: User = JSON.parse(raw);
    return { user, isAuthenticated: true };
  } catch {
    return { user: null, isAuthenticated: false };
  }
}

export function saveAuthSession(user: User): AuthSession {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("auth-changed"));

    // Automatically synchronize user with server database in background
    try {
      fetch("/api/auth/social-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user }),
        keepalive: true
      }).catch((err) => console.warn("Background auth sync notice:", err));
    } catch (e) {
      // ignore
    }
  }
  return { user, isAuthenticated: true };
}

export function clearAuthSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new Event("auth-changed"));
  }
}

/**
 * Synchronize user session with PostgreSQL database to ensure role & permissions are always up-to-date
 */
export async function syncSessionWithServer(): Promise<User | null> {
  if (typeof window === "undefined") return null;
  const current = getAuthSession().user;
  if (!current || !current.email) return null;

  try {
    const res = await fetch(`/api/auth/me?email=${encodeURIComponent(current.email)}`);
    const data = await res.json();
    if (data.success && data.user) {
      const dbUser: User = data.user;
      // If role or profile changed in DB, update local storage immediately
      if (dbUser.role !== current.role || dbUser.name !== current.name || dbUser.avatar !== current.avatar) {
        const merged: User = { ...current, ...dbUser };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new Event("auth-changed"));
        return merged;
      }
      return dbUser;
    }
  } catch (err) {
    console.warn("Could not sync session with server:", err);
  }
  return current;
}

// Sample accounts for immediate local review & testing
export const DEMO_ACCOUNTS: Record<string, User> = {
  google: {
    id: "usr_google_demo_101",
    name: "Alex Nguyễn (Google)",
    email: "alex.nguyen@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    provider: "google",
    providerId: "google_oauth_123456789",
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  },
  facebook: {
    id: "usr_fb_demo_202",
    name: "Hải Lê (Facebook)",
    email: "haile.dev@facebook.com",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80",
    provider: "facebook",
    providerId: "fb_oauth_987654321",
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  }
};

// Admin Account Constants
import { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL, ADMIN_DEFAULT_USER } from "@/types/auth";
export { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL, ADMIN_DEFAULT_USER };

export function isAdminUser(user: User | null): boolean {
  if (!user) return false;
  const cleanEmail = user.email?.toLowerCase().trim() || "";
  return (
    user.role === "admin" ||
    cleanEmail === "admin" ||
    cleanEmail === "admin@vnexpress.vn" ||
    cleanEmail === "admin@admin.com" ||
    cleanEmail === "hai.le@vnereader.com" ||
    user.id === "usr_admin_master" ||
    user.id === "usr_admin_haile"
  );
}

export function loginWithAdminCredentials(username: string, password: string): { success: boolean; user?: User; error?: string } {
  const cleanUser = username.trim().toLowerCase();
  const cleanPass = password.trim();

  if (cleanUser === "hai.le@vnereader.com" && cleanPass === ADMIN_PASSWORD) {
    const adminUser: User = {
      id: "usr_admin_haile",
      name: "Hải Lê (Admin)",
      email: "hai.le@vnereader.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hai.le",
      provider: "credentials",
      role: "admin",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    saveAuthSession(adminUser);
    return { success: true, user: adminUser };
  }

  if ((cleanUser === "admin" || cleanUser === "admin@vnexpress.vn" || cleanUser === "admin@admin.com") && cleanPass === ADMIN_PASSWORD) {
    const adminUser: User = {
      ...ADMIN_DEFAULT_USER,
      lastLoginAt: new Date().toISOString()
    };
    saveAuthSession(adminUser);
    return { success: true, user: adminUser };
  }

  return { success: false, error: "Tên đăng nhập hoặc mật khẩu quản trị viên không chính xác" };
}

export function createOrInitAdminAccount(): User {
  const adminUser: User = {
    ...ADMIN_DEFAULT_USER,
    lastLoginAt: new Date().toISOString()
  };
  saveAuthSession(adminUser);
  return adminUser;
}
