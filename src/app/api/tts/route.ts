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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text") || searchParams.get("q");
    const voiceKey = searchParams.get("voice") || "female-mature";
    const rate = searchParams.get("rate") || "0%";
    const pitch = searchParams.get("pitch") || "0Hz";

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Limit text length per request to 2000 chars for optimal streaming
    const cleanText = text.slice(0, 2000).trim();
    const selectedVoice = VALID_VOICES[voiceKey] || "en-US-JennyNeural";

    const tts = new MsEdgeTTS();
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

    const audioBuffer = Buffer.concat(chunks);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400"
      }
    });
  } catch (error: any) {
    console.error("TTS API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI speech", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice = "female-mature", rate = "0%", pitch = "0Hz" } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const cleanText = text.slice(0, 4000).trim();
    const selectedVoice = VALID_VOICES[voice] || "en-US-JennyNeural";

    const tts = new MsEdgeTTS();
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

    const audioBuffer = Buffer.concat(chunks);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400"
      }
    });
  } catch (error: any) {
    console.error("TTS POST API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI speech", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
