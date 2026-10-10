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

export function stopNeuralAudio() {
  if (activeAnimFrameId && typeof window !== "undefined") {
    cancelAnimationFrame(activeAnimFrameId);
    activeAnimFrameId = null;
  }
  if (globalNeuralAudio) {
    globalNeuralAudio.pause();
    globalNeuralAudio.currentTime = 0;
    globalNeuralAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
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

  // Convert rate multiplier (0.8 - 1.5) to percentage (-20% to +50%)
  let rateParam = "0%";
  if (rate !== 1.0) {
    const pct = Math.round((rate - 1.0) * 100);
    rateParam = pct > 0 ? `+${pct}%` : `${pct}%`;
  }

  const selectedVoice = voiceKey || preset;
  const ttsUrl = `/api/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(selectedVoice)}&rate=${encodeURIComponent(rateParam)}`;

  const timeline = computeWordTimeline(text);

  try {
    const audio = new Audio(ttsUrl);
    globalNeuralAudio = audio;

    const trackProgress = () => {
      if (!audio || audio.paused || audio.ended) return;
      const duration = audio.duration;
      const currentTime = audio.currentTime;
      if (duration > 0 && timeline.length > 0) {
        const progressFrac = Math.min(0.999, Math.max(0, currentTime / duration));
        const matched = timeline.find((t) => progressFrac >= t.startFrac && progressFrac < t.endFrac);
        if (matched) {
          onBoundary?.(matched.start);
        }
      }
      activeAnimFrameId = requestAnimationFrame(trackProgress);
    };

    audio.onplay = () => {
      onStart?.();
      if (typeof window !== "undefined") {
        activeAnimFrameId = requestAnimationFrame(trackProgress);
      }
    };

    audio.onpause = () => {
      if (activeAnimFrameId && typeof window !== "undefined") {
        cancelAnimationFrame(activeAnimFrameId);
        activeAnimFrameId = null;
      }
    };

    audio.onended = () => {
      if (activeAnimFrameId && typeof window !== "undefined") {
        cancelAnimationFrame(activeAnimFrameId);
        activeAnimFrameId = null;
      }
      if (globalNeuralAudio === audio) {
        globalNeuralAudio = null;
      }
      onBoundary?.(-1);
      onEnd?.();
    };

    audio.onerror = () => {
      console.warn("Neural TTS playback failed, falling back to local speech synthesis...");
      if (activeAnimFrameId && typeof window !== "undefined") {
        cancelAnimationFrame(activeAnimFrameId);
        activeAnimFrameId = null;
      }
      if (globalNeuralAudio === audio) {
        globalNeuralAudio = null;
      }
      // Seamless fallback to browser SpeechSynthesis
      fallbackToBrowserSpeech(text, preset, rate, onBoundary, onEnd);
    };

    await audio.play();
    return audio;
  } catch (err) {
    console.warn("Audio play() interrupted or failed, using fallback:", err);
    fallbackToBrowserSpeech(text, preset, rate, onBoundary, onEnd);
    return null;
  }
}

function fallbackToBrowserSpeech(
  text: string, 
  preset: VoicePreset, 
  rate = 1.0, 
  onBoundary?: (charIndex: number) => void,
  onEnd?: () => void
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  utterance.onboundary = (event) => {
    if (event.name === "word" || !event.name || typeof event.charIndex === "number") {
      onBoundary?.(event.charIndex);
    }
  };
  if (onEnd) {
    utterance.onend = () => {
      onBoundary?.(-1);
      onEnd();
    };
    utterance.onerror = () => {
      onBoundary?.(-1);
      onEnd();
    };
  }
  window.speechSynthesis.speak(utterance);
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

