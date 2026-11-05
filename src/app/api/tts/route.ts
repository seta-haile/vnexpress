import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export const dynamic = "force-dynamic";

const VALID_VOICES: Record<string, string> = {
  "female-mature": "en-US-JennyNeural",
  "female-young": "en-US-AriaNeural",
  "male-mature": "en-US-GuyNeural",
  "male-young": "en-US-ChristopherNeural",
  "female-uk": "en-GB-SoniaNeural",
  "male-uk": "en-GB-RyanNeural",
  "en-US-JennyNeural": "en-US-JennyNeural",
  "en-US-GuyNeural": "en-US-GuyNeural",
  "en-US-AriaNeural": "en-US-AriaNeural",
  "en-US-ChristopherNeural": "en-US-ChristopherNeural",
  "en-GB-SoniaNeural": "en-GB-SoniaNeural",
  "en-GB-RyanNeural": "en-GB-RyanNeural"
};

/**
 * Fallback TTS provider using Google Translate TTS service
 * Supports chunking text into <= 180 characters and concatenating MP3 chunks
 */
async function generateGoogleTTS(text: string, lang = "en"): Promise<Buffer> {
  const words = text.split(/\s+/);
  const textChunks: string[] = [];
  let cur = "";

  for (const w of words) {
    if ((cur + " " + w).length > 180) {
      if (cur) textChunks.push(cur.trim());
      cur = w;
    } else {
      cur += (cur ? " " : "") + w;
    }
  }
  if (cur.trim()) textChunks.push(cur.trim());

  const buffers = await Promise.all(
    textChunks.map(async (chunk) => {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        chunk
      )}&tl=${lang}&client=tw-ob`;
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://translate.google.com/"
        }
      });
      if (!res.ok) {
        throw new Error(`Google TTS failed with status ${res.status}`);
      }
      return Buffer.from(await res.arrayBuffer());
    })
  );

  return Buffer.concat(buffers);
}

/**
 * Synthesize speech audio using MsEdgeTTS (primary) and Google TTS (fallback)
 */
async function synthesizeSpeechAudio(
  text: string,
  voiceKey: string,
  rate = "0%",
  pitch = "0Hz"
): Promise<Buffer> {
  const cleanText = text.slice(0, 3000).trim();
  const selectedVoice = VALID_VOICES[voiceKey] || "en-US-JennyNeural";

  // Tier 1: Try Neural Edge TTS
  try {
    const tts = new MsEdgeTTS({
      connectionTimeoutMs: 3500,
      synthesisTimeoutMs: 12000
    });
    await tts.setMetadata(selectedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const readable = tts.toStream(cleanText, {
      rate: rate.startsWith("+") || rate.startsWith("-") ? rate : `${rate}`,
      pitch: pitch.startsWith("+") || pitch.startsWith("-") ? pitch : `${pitch}`
    });

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      readable.audioStream.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });
      readable.audioStream.on("end", () => {
        resolve();
      });
      readable.audioStream.on("error", (err: any) => {
        reject(err);
      });
    });

    if (chunks.length > 0) {
      return Buffer.concat(chunks);
    }
  } catch (edgeError: any) {
    console.warn("Neural Edge TTS failed, activating Google TTS fallback:", edgeError?.message || edgeError);
  }

  // Tier 2: Seamless fallback to Google TTS
  return await generateGoogleTTS(cleanText, "en");
}

export async function GET(req: NextRequest) {
  // TTS serverless route is disabled to prevent quota exhaustion.
  // Speech synthesis is handled completely on the client side using Web Speech API.
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Cache-Control": "public, max-age=604800, s-maxage=2592000"
    }
  });
}

export async function POST(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Cache-Control": "public, max-age=604800, s-maxage=2592000"
    }
  });
}
