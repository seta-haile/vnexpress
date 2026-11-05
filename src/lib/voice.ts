"use client";

export type VoicePreset = 'female-young' | 'female-mature' | 'male-young' | 'male-mature' | 'auto';

export interface VoicePresetOption {
  id: VoicePreset;
  title: string;
  badge: string;
  icon: string;
  description: string;
  pitch: number;
}

export const VOICE_PRESETS: VoicePresetOption[] = [
  {
    id: "female-mature",
    title: "Nữ phát thanh viên",
    badge: "Tin tức chuẩn",
    icon: "👩‍💼",
    description: "Giọng nữ đĩnh đạc, ấm áp, chuẩn phong cách bản tin quốc tế",
    pitch: 1.0
  },
  {
    id: "female-young",
    title: "Nữ trẻ",
    badge: "Trong trẻo",
    icon: "👩",
    description: "Giọng nữ thanh thoát, tươi vui, tốc độ đọc tự nhiên",
    pitch: 1.15
  },
  {
    id: "male-mature",
    title: "Nam trung niên",
    badge: "Trầm ấm",
    icon: "👨‍💼",
    description: "Giọng nam trầm ấm, đĩnh đạc, phát âm rõ ràng, dễ nghe",
    pitch: 0.85
  },
  {
    id: "male-young",
    title: "Nam trẻ",
    badge: "Năng động",
    icon: "👨",
    description: "Giọng nam dứt khoát, hiện đại, phong cách tự tin",
    pitch: 1.05
  }
];

export function getEnglishVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve([]);
      return;
    }
    const current = window.speechSynthesis.getVoices();
    if (current.length > 0) {
      resolve(current.filter((v) => v.lang.startsWith("en")));
      return;
    }

    const handleChanged = () => {
      const v = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = null;
      resolve(v.filter((item) => item.lang.startsWith("en")));
    };

    window.speechSynthesis.onvoiceschanged = handleChanged;

    // Fallback if event does not trigger
    setTimeout(() => {
      window.speechSynthesis.onvoiceschanged = null;
      resolve(window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en")));
    }, 500);
  });
}

export function findBestVoiceForPreset(
  voices: SpeechSynthesisVoice[],
  preset: VoicePreset,
  preferredURI?: string
): { voice: SpeechSynthesisVoice | null; pitch: number } {
  if (!voices || voices.length === 0) {
    return { voice: null, pitch: 1.0 };
  }

  const femaleKeywords = [
    "female", "samantha", "victoria", "karen", "jenny", "zira", 
    "serena", "moira", "fiona", "tessa", "veena", "catherine"
  ];
  const maleKeywords = [
    "male", "alex", "daniel", "david", "guy", "mark", 
    "george", "oliver", "fred", "rishi", "tom"
  ];

  // Specific voice chosen by user
  if (preferredURI) {
    const matched = voices.find((v) => v.voiceURI === preferredURI);
    if (matched) {
      const pitch =
        preset === "female-young"
          ? 1.15
          : preset === "male-mature"
          ? 0.85
          : preset === "male-young"
          ? 1.05
          : 1.0;
      return { voice: matched, pitch };
    }
  }

  let candidate: SpeechSynthesisVoice | null = null;
  let pitch = 1.0;

  switch (preset) {
    case "female-young": {
      pitch = 1.15;
      candidate =
        voices.find((v) => femaleKeywords.some((k) => v.name.toLowerCase().includes(k))) ||
        voices[0];
      break;
    }

    case "female-mature": {
      pitch = 1.0;
      candidate =
        voices.find((v) => femaleKeywords.some((k) => v.name.toLowerCase().includes(k))) ||
        voices[0];
      break;
    }

    case "male-young": {
      pitch = 1.05;
      candidate =
        voices.find((v) => maleKeywords.some((k) => v.name.toLowerCase().includes(k))) ||
        voices.find((v) => !femaleKeywords.some((k) => v.name.toLowerCase().includes(k))) ||
        voices[0];
      break;
    }

    case "male-mature": {
      pitch = 0.85;
      candidate =
        voices.find((v) => maleKeywords.some((k) => v.name.toLowerCase().includes(k))) ||
        voices.find((v) => !femaleKeywords.some((k) => v.name.toLowerCase().includes(k))) ||
        voices[0];
      break;
    }

    default: {
      pitch = 1.0;
      candidate = voices[0] || null;
      break;
    }
  }

  return { voice: candidate || null, pitch };
}

function computeWordTimeline(text: string) {
  const regex = /\S+|\s+/g;
  const tokens: { start: number; end: number; text: string; weight: number }[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (!/^\s+$/.test(match[0])) {
      const w = match[0];
      let weight = Math.max(2, w.length);
      if (/[,;:]$/.test(w)) weight += 4;
      else if (/[.!?]$/.test(w)) weight += 8;
      else if (w.length > 8) weight += 2;
      tokens.push({
        start: match.index,
        end: match.index + w.length,
        text: w,
        weight
      });
    }
  }
  const totalWeight = Math.max(1, tokens.reduce((acc, t) => acc + t.weight, 0));
  let accumulated = 0;
  const timeline = tokens.map((t) => {
    const startFrac = accumulated / totalWeight;
    accumulated += t.weight;
    const endFrac = accumulated / totalWeight;
    return {
      ...t,
      startFrac,
      endFrac
    };
  });
  return timeline;
}

let globalNeuralAudio: HTMLAudioElement | null = null;
let activeAnimFrameId: number | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;

export function stopNeuralAudio() {
  if (activeAnimFrameId && typeof window !== "undefined") {
    cancelAnimationFrame(activeAnimFrameId);
    activeAnimFrameId = null;
  }
  if (globalNeuralAudio) {
    globalNeuralAudio.pause();
    globalNeuralAudio.currentTime = 0;
    globalNeuralAudio.src = "";
    globalNeuralAudio = null;
  }
  activeUtterance = null;
  if (typeof window !== "undefined") {
    try {
      (window as any).__activeUtterance = null;
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      console.warn("Error cancelling speech synthesis:", e);
    }
  }
}

export function pauseNeuralAudio() {
  if (activeAnimFrameId && typeof window !== "undefined") {
    cancelAnimationFrame(activeAnimFrameId);
    activeAnimFrameId = null;
  }
  if (globalNeuralAudio) {
    globalNeuralAudio.pause();
  } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.pause();
  }
}

export function resumeNeuralAudio() {
  if (globalNeuralAudio) {
    globalNeuralAudio.play().catch(console.error);
  } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.resume();
  }
}

export async function playNeuralAudio(
  text: string,
  options?: {
    preset?: VoicePreset;
    voiceKey?: string;
    rate?: number;
    onStart?: () => void;
    onBoundary?: (charIndex: number) => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): Promise<HTMLAudioElement | null> {
  const { preset = "female-mature", voiceKey, rate = 1.0, onStart, onBoundary, onEnd, onError } = options || {};

  stopNeuralAudio();

  // Directly use browser native speech synthesis (Web Speech API):
  // 100% Free, instant response, 0 serverless costs, no API limits.
  fallbackToBrowserSpeech(text, preset, voiceKey, rate, onStart, onBoundary, onEnd, onError);
  return null;
}

function fallbackToBrowserSpeech(
  text: string, 
  preset: VoicePreset, 
  voiceKey?: string,
  rate = 1.0, 
  onStart?: () => void,
  onBoundary?: (charIndex: number) => void,
  onEnd?: () => void,
  onError?: (err: any) => void
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onError?.(new Error("Speech synthesis not supported in this environment"));
    onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    activeUtterance = utterance;
    (window as any).__activeUtterance = utterance;

    utterance.lang = "en-US";
    utterance.rate = rate;

    // Pick best available voice matching preset
    const voices = window.speechSynthesis.getVoices();
    const { voice, pitch } = findBestVoiceForPreset(voices, preset, voiceKey);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.pitch = pitch;

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onboundary = (event) => {
      if (event.name === "word" || !event.name || typeof event.charIndex === "number") {
        onBoundary?.(event.charIndex);
      }
    };

    utterance.onend = () => {
      activeUtterance = null;
      (window as any).__activeUtterance = null;
      onBoundary?.(-1);
      onEnd?.();
    };

    utterance.onerror = (e) => {
      activeUtterance = null;
      (window as any).__activeUtterance = null;
      onBoundary?.(-1);
      onError?.(e);
      onEnd?.();
    };

    onStart?.();
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error("Browser speech synthesis error:", e);
    onError?.(e);
    onEnd?.();
  }
}

export function playVoiceSample(
  preset: VoicePreset,
  preferredURI?: string,
  rate = 1.0,
  onEnd?: () => void
) {
  const samplePhrases: Record<string, string> = {
    "female-young": "Hello! I am your reading companion. Let's practice English together with daily news!",
    "female-mature": "Good morning. Here is the latest English report from VnExpress International.",
    "male-young": "Hey there! Ready to explore breaking news and master new vocabulary today?",
    "male-mature": "Welcome. In today's economic analysis, we examine market trends and global growth.",
    "auto": "Hello! This is how I will read news articles for you."
  };

  const sampleText = samplePhrases[preset] || samplePhrases["auto"];

  playNeuralAudio(sampleText, {
    preset,
    voiceKey: preferredURI,
    rate,
    onEnd
  });
}

