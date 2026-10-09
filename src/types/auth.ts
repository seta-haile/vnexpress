export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "google" | "facebook" | "credentials";
  providerId?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthSession {
  user: User | null;
  token?: string;
  isAuthenticated: boolean;
}
