"use client";

import React, { useState, useEffect } from "react";
import { AppSettings } from "@/lib/storage";
import { 
  VOICE_PRESETS, 
  VoicePreset, 
  playVoiceSample, 
  getEnglishVoices 
} from "@/lib/voice";
import { 
  X, 
  Sun, 
  Moon, 
  Image as ImageIcon, 
  ImageOff, 
  Settings, 
  Check, 
  Volume2, 
  Square,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const [isPlayingSample, setIsPlayingSample] = useState<VoicePreset | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showAdvancedVoices, setShowAdvancedVoices] = useState(false);

  // Load browser installed English voices
  useEffect(() => {
    if (isOpen) {
      getEnglishVoices().then((voices) => {
        setAvailableVoices(voices);
      });
    } else {
      // Stop sample preview if modal closed
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingSample(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestVoice = (preset: VoicePreset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (isPlayingSample === preset) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingSample(null);
      return;
    }

    setIsPlayingSample(preset);
    playVoiceSample(preset, settings.voiceURI, 1.0, () => {
      setIsPlayingSample(null);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-card text-card-foreground rounded-3xl shadow-2xl border border-border/80 p-5 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Cài Đặt Hệ Thống</h3>
              <p className="text-xs text-muted-foreground">Tùy biến giao diện & giọng đọc AI</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
              }
              onClose();
            }}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting 1: Giọng đọc (Voice TTS) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Giọng Đọc Tiếng Anh (TTS Voices)
            </label>
            <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              100% Miễn phí & Offline
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {VOICE_PRESETS.map((vp) => {
              const isSelected = settings.voicePreset === vp.id;
              const isSpeakingThis = isPlayingSample === vp.id;

              return (
                <div
                  key={vp.id}
                  onClick={() => onUpdateSettings({ voicePreset: vp.id })}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? "border-rose-600 bg-rose-50/50 dark:bg-rose-950/20 text-foreground ring-2 ring-rose-500/20 font-medium shadow-sm"
                      : "border-border/80 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{vp.icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-foreground">
                            {vp.title}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-rose-600 stroke-[3]" />}
                        </div>
                        <Badge className="text-[9px] py-0 px-1 font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border-none">
                          {vp.badge}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {vp.description}
                  </p>

                  {/* Test voice sample button */}
                  <button
                    onClick={(e) => handleTestVoice(vp.id, e)}
                    className={`mt-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      isSpeakingThis
                        ? "bg-rose-600 text-white animate-pulse shadow"
                        : "bg-muted/80 hover:bg-muted text-foreground border border-border/60"
                    }`}
                  >
                    {isSpeakingThis ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        <span>Đang đọc thử...</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Nghe thử giọng</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Advanced: Device specific voices */}
          {availableVoices.length > 0 && (
            <div className="pt-1">
              <button
                onClick={() => setShowAdvancedVoices(!showAdvancedVoices)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors"
              >
                <span>Tùy chọn: Chọn giọng cài đặt trên máy ({availableVoices.length} giọng có sẵn)</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvancedVoices ? "rotate-180" : ""}`} />
              </button>

              {showAdvancedVoices && (
                <div className="mt-2.5 p-3 rounded-2xl bg-muted/40 border border-border/50 space-y-2 animate-in fade-in duration-150">
                  <label className="text-[11px] font-semibold text-muted-foreground block">
                    Giọng đọc hệ thống (System Installed Voices):
                  </label>
                  <select
                    value={settings.voiceURI || ""}
                    onChange={(e) => onUpdateSettings({ voiceURI: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">-- Mặc định tự động theo nhóm giọng đã chọn --</option>
                    {availableVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Setting 2: Theme (Sáng / Tối) */}
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

        {/* Setting 3: Show/Hide Images (Hiện / Ẩn Ảnh) */}
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
        </div>

        {/* Footer */}
        <div className="pt-2">
          <Button
            onClick={() => {
              if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
              }
              onClose();
            }}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-md shadow-rose-600/30"
          >
            Đã lưu cấu hình
          </Button>
        </div>
      </div>
    </div>
  );
}
