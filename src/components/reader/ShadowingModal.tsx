"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  X, 
  Trophy,
  Play,
  Pause,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { playNeuralAudio, stopNeuralAudio, VoicePreset } from "@/lib/voice";
import confetti from "canvas-confetti";

interface ShadowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sentenceText: string;
  voicePreset?: VoicePreset;
}

function cleanToken(token: string): string {
  return token.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

export function ShadowingModal({
  isOpen,
  onClose,
  sentenceText,
  voicePreset = "female-mature"
}: ShadowingModalProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [score, setScore] = useState<number | null>(null);
  const [evaluatedWords, setEvaluatedWords] = useState<{ original: string; clean: string; matched: boolean }[]>([]);
  const [browserSupport, setBrowserSupport] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestTranscriptRef = useRef<string>("");

  // Split sentence into words for comparison
  const targetWords = React.useMemo(() => {
    return sentenceText.split(/\s+/).filter((w) => w.trim().length > 0);
  }, [sentenceText]);

  useEffect(() => {
    if (!isOpen) {
      stopNeuralAudio();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsPlayingAudio(false);
      setIsRecording(false);
      setTranscript("");
      latestTranscriptRef.current = "";
      setScore(null);
      setEvaluatedWords([]);
      setIsEvaluating(false);
      return;
    }

    // Check Speech Recognition support
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setBrowserSupport(false);
      }
    }
  }, [isOpen, sentenceText]);

  const handlePlaySample = () => {
    stopNeuralAudio();
    setIsPlayingAudio(true);
    playNeuralAudio(sentenceText, {
      preset: voicePreset,
      rate: 0.9,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false)
    });
  };

  const handleStartRecording = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt hiện tại chưa hỗ trợ nhận diện giọng nói. Bạn hãy thử mở trên Chrome, Edge hoặc Safari nhé!");
      return;
    }

    stopNeuralAudio();
    setIsPlayingAudio(false);
    setTranscript("");
    latestTranscriptRef.current = "";
    setScore(null);
    setEvaluatedWords([]);
    setIsEvaluating(false);

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = true; // Continuous mode prevents abrupt cuts on slight pauses
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; ++i) {
          fullTranscript += event.results[i][0].transcript + " ";
        }
        const trimmed = fullTranscript.trim();
        setTranscript(trimmed);
        latestTranscriptRef.current = trimmed;

        // Reset silence timer on any speech detected
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        // Auto evaluate only after 2.8 seconds of complete silence (comfortable, relaxed pacing)
        silenceTimerRef.current = setTimeout(() => {
          if (latestTranscriptRef.current.trim().length > 0) {
            handleFinishAndEvaluate();
          }
        }, 2800);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        // If recording is still active and user hasn't explicitly stopped, only finalize if we have speech
        if (latestTranscriptRef.current.trim().length > 0 && !isEvaluating) {
          evaluateSpeaking(latestTranscriptRef.current);
        }
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setIsRecording(false);
    }
  };

  const handleFinishAndEvaluate = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setIsEvaluating(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);

    const textToEvaluate = latestTranscriptRef.current || transcript;
    if (textToEvaluate.trim().length > 0) {
      evaluateSpeaking(textToEvaluate);
    }
  };

  const evaluateSpeaking = (userSpeech: string) => {
    const spokenTokens = userSpeech.split(/\s+/).map(cleanToken).filter(Boolean);
    const spokenSet = new Set(spokenTokens);

    let matchCount = 0;
    const results = targetWords.map((original) => {
      const clean = cleanToken(original);
      const matched = spokenTokens.includes(clean);
      if (matched) matchCount++;
      return { original, clean, matched };
    });

    const calculatedScore = targetWords.length > 0 ? Math.round((matchCount / targetWords.length) * 100) : 0;
    setScore(calculatedScore);
    setEvaluatedWords(results);

    if (calculatedScore >= 80) {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-card border border-border/80 text-card-foreground rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-foreground">
                Luyện nói & Chấm điểm phát âm
              </h3>
              <p className="text-xs text-muted-foreground">
                Nghe câu mẫu rồi đọc lại thong thả theo tốc độ của bạn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Sentence Box */}
        <div className="p-5 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>CÂU MẪU CẦN ĐỌC:</span>
            <button
              onClick={handlePlaySample}
              className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlayingAudio ? "Đang phát..." : "Nghe mẫu (AI Voice)"}</span>
            </button>
          </div>

          <div className="text-base sm:text-lg font-medium leading-relaxed text-foreground flex flex-wrap gap-1.5">
            {evaluatedWords.length > 0
              ? evaluatedWords.map((item, idx) => (
                  <span
                    key={idx}
                    className={`px-1.5 py-0.5 rounded-md font-bold transition-all ${
                      item.matched
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/20 text-rose-600 dark:text-rose-400 line-through decoration-2"
                    }`}
                  >
                    {item.original}
                  </span>
                ))
              : targetWords.map((w, idx) => (
                  <span key={idx} className="inline-block">
                    {w}
                  </span>
                ))}
          </div>
        </div>

        {/* Score & Evaluation Feedback */}
        {score !== null && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 animate-in fade-in ${
            score >= 80
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : score >= 50
              ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
          }`}>
            <div className="flex items-center gap-3">
              <div className="text-2xl sm:text-3xl font-black">
                {score}%
              </div>
              <div className="text-xs font-semibold">
                {score >= 80 ? "🎉 Phát âm rất xuất sắc!" : score >= 50 ? "👍 Khá tốt, hãy chú ý các từ màu đỏ!" : "💪 Hãy nghe lại mẫu và đọc lại nhé!"}
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handlePlaySample}
              className="h-8 rounded-full text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>Nghe lại</span>
            </Button>
          </div>
        )}

        {/* Real-time Spoken Transcript Preview */}
        {transcript && (
          <div className="p-3.5 rounded-2xl bg-background border border-border/80 text-xs text-muted-foreground space-y-1 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">Lời bạn đọc được ghi nhận:</span>
              {isRecording && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Đang ghi nhận...
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-foreground italic">
              "{transcript}"
            </p>
          </div>
        )}

        {/* Action Button: Recording Controls */}
        <div className="flex flex-col items-center justify-center gap-3.5 pt-2">
          {isRecording ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              {/* Finish & Evaluate Button */}
              <Button
                size="lg"
                onClick={handleFinishAndEvaluate}
                className="w-full sm:w-auto px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                <Check className="w-4 h-4" />
                <span>Xong & Chấm điểm</span>
              </Button>

              {/* Stop Button */}
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                  if (recognitionRef.current) {
                    try { recognitionRef.current.stop(); } catch {}
                  }
                  setIsRecording(false);
                }}
                className="w-full sm:w-auto px-5 rounded-full border-rose-300 text-rose-600 dark:text-rose-400 hover:bg-rose-50"
              >
                <MicOff className="w-4 h-4 mr-1.5" />
                <span>Hủy ghi âm</span>
              </Button>
            </div>
          ) : (
            <button
              onClick={handleStartRecording}
              className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer bg-gradient-to-tr from-rose-600 to-amber-500 shadow-rose-500/30 hover:brightness-110"
              title="Bấm để bắt đầu đọc"
            >
              <Mic className="w-8 h-8" />
            </button>
          )}

          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-foreground block">
              {isRecording
                ? "🎙️ Đang lắng nghe... (Hãy đọc chậm rãi, hệ thống đợi 2.8s sau khi bạn dừng)"
                : "Bấm vào Micro để bắt đầu đọc"}
            </span>
            <p className="text-[11px] text-muted-foreground">
              💡 Bạn có thể ngắt nghỉ tự nhiên giữa câu mà không sợ bị chấm điểm vội vàng!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
