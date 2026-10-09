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

export function playVoiceSample(
  preset: VoicePreset,
  preferredURI?: string,
  rate = 1.0,
  onEnd?: () => void
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
  const { voice, pitch } = findBestVoiceForPreset(voices, preset, preferredURI);

  const samplePhrases = {
    "female-young": "Hello! I am your reading companion. Let's practice English together with daily news!",
    "female-mature": "Good morning. Here is the latest English report from VnExpress International.",
    "male-young": "Hey there! Ready to explore breaking news and master new vocabulary today?",
    "male-mature": "Welcome. In today's economic analysis, we examine market trends and global growth.",
    "auto": "Hello! This is how I will read news articles for you."
  };

  const sampleText = samplePhrases[preset] || samplePhrases["auto"];
  const utterance = new SpeechSynthesisUtterance(sampleText);
  utterance.lang = "en-US";
  if (voice) utterance.voice = voice;
  utterance.pitch = pitch;
  utterance.rate = rate;

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}
