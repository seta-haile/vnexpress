"use client";

import React from "react";
import { AppSettings } from "@/lib/storage";
import { X, Sun, Moon, Image as ImageIcon, ImageOff, Settings, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card text-card-foreground rounded-3xl shadow-2xl border border-border/80 overflow-hidden p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Cài Đặt Hệ Thống</h3>
              <p className="text-xs text-muted-foreground">Tùy biến trải nghiệm đọc & học</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting 1: Theme (Sáng / Tối) */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Giao diện (Theme)
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onUpdateSettings({ theme: "light" })}
              className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                settings.theme === "light"
                  ? "border-rose-600 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 ring-2 ring-rose-500/20 font-bold"
                  : "border-border/80 hover:bg-muted/60 text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sun className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-semibold">Chế độ Sáng</span>
              </div>
              {settings.theme === "light" && <Check className="w-4 h-4 text-rose-600" />}
            </button>

            <button
              onClick={() => onUpdateSettings({ theme: "dark" })}
              className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                settings.theme === "dark"
                  ? "border-rose-600 bg-rose-950/30 text-rose-400 ring-2 ring-rose-500/20 font-bold"
                  : "border-border/80 hover:bg-muted/60 text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Moon className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-semibold">Chế độ Tối (Dark)</span>
              </div>
              {settings.theme === "dark" && <Check className="w-4 h-4 text-rose-400" />}
            </button>
          </div>
        </div>

        {/* Setting 2: Show/Hide Images (Hiện / Ẩn Ảnh) */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Hình ảnh bài báo (Images Mode)
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onUpdateSettings({ showImages: true })}
              className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                settings.showImages
                  ? "border-rose-600 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 ring-2 ring-rose-500/20 font-bold"
                  : "border-border/80 hover:bg-muted/60 text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-5 h-5 text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Hiện ảnh</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Trực quan đầy đủ</span>
                </div>
              </div>
              {settings.showImages && <Check className="w-4 h-4 text-rose-600" />}
            </button>

            <button
              onClick={() => onUpdateSettings({ showImages: false })}
              className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                !settings.showImages
                  ? "border-rose-600 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 ring-2 ring-rose-500/20 font-bold"
                  : "border-border/80 hover:bg-muted/60 text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ImageOff className="w-5 h-5 text-rose-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Ẩn ảnh</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Tập trung đọc chữ</span>
                </div>
              </div>
              {!settings.showImages && <Check className="w-4 h-4 text-rose-600" />}
            </button>
          </div>

          <p className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/40 leading-relaxed">
            💡 <strong>Mẹo học tập:</strong> Khi chọn <em>"Ẩn ảnh"</em>, bài báo sẽ ẩn toàn bộ hình ảnh thumbnail và hình minh họa, giúp bạn tải trang siêu tốc và tập trung 100% vào kỹ năng đọc hiểu văn bản tiếng Anh.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-2">
          <Button
            onClick={onClose}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-md shadow-rose-600/30"
          >
            Đã lưu cấu hình
          </Button>
        </div>
      </div>
    </div>
  );
}
