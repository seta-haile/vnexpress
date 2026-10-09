"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  User as UserIcon, 
  LogOut, 
  Database, 
  Bookmark, 
  Sparkles, 
  ChevronDown,
  CheckCircle2,
  LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAuthSession, clearAuthSession } from "@/lib/auth";
import { User } from "@/types/auth";
import { LoginModal } from "./LoginModal";

interface UserMenuProps {
  onOpenVocabulary?: () => void;
}

export function UserMenu({ onOpenVocabulary }: UserMenuProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync auth state
  useEffect(() => {
    const update = () => {
      setUser(getAuthSession().user);
    };
    update();

    window.addEventListener("auth-changed", update);
    return () => window.removeEventListener("auth-changed", update);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setIsOpenDropdown(false);
    window.location.href = "/login";
  };

  // If not logged in: show Login button
  if (!user) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLoginModalOpen(true)}
          className="flex items-center gap-1.5 border-rose-300 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Đăng nhập</span>
        </Button>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={(u) => setUser(u)}
        />
      </>
    );
  }

  // If logged in: show User Avatar & dropdown
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpenDropdown(!isOpenDropdown)}
        className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full border border-border/80 hover:bg-muted/60 transition-all cursor-pointer"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-rose-500/30"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-600 flex items-center justify-center text-xs font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}

        <span className="text-xs font-semibold text-foreground max-w-[90px] truncate hidden sm:inline">
          {user.name}
        </span>

        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isOpenDropdown ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpenDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-card text-card-foreground rounded-2xl shadow-2xl border border-border/80 p-3.5 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User info header */}
          <div className="flex items-center gap-3 pb-3 border-b border-border/60">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-500/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-600 flex items-center justify-center font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-foreground truncate">
                {user.name}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {user.email}
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <Badge className="text-[9px] py-0 px-1.5 font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border-none capitalize">
                  {user.provider}
                </Badge>
              </div>
            </div>
          </div>

          {/* Cloud Sync status banner */}
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-[11px]">Đồng bộ tiến độ học tập</span>
              <span className="text-[10px] text-muted-foreground">Từ vựng & Streak đã lưu an toàn</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-1">
            {onOpenVocabulary && (
              <button
                onClick={() => {
                  setIsOpenDropdown(false);
                  onOpenVocabulary();
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-medium hover:bg-muted/80 text-foreground transition-colors text-left cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-rose-600" />
                <span>Sổ từ vựng đã lưu</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
