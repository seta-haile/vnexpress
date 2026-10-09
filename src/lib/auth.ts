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
  }
  return { user, isAuthenticated: true };
}

export function clearAuthSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new Event("auth-changed"));
  }
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
