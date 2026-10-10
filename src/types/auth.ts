export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "google" | "facebook" | "credentials";
  providerId?: string;
  role?: "admin" | "user" | "learner";
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthSession {
  user: User | null;
  token?: string;
  isAuthenticated: boolean;
}

export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "123123";
export const ADMIN_EMAIL = "admin@vnexpress.vn";

export const ADMIN_DEFAULT_USER: User = {
  id: "usr_admin_master",
  name: "Quản Trị Viên (Admin)",
  email: "admin@vnexpress.vn",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  provider: "credentials",
  role: "admin",
  createdAt: "2026-01-01T00:00:00.000Z",
  lastLoginAt: "2026-10-09T00:00:00.000Z"
};
