import { NextRequest, NextResponse } from "next/server";
import { lookupWord, translateSentence } from "@/lib/dictionary";

export async function GET(request: NextRequest) {
  try {
    const word = request.nextUrl.searchParams.get("word");

    if (!word) {
      return NextResponse.json(
        { success: false, error: "Missing 'word' parameter" },
        { status: 400 }
      );
    }

    const definition = await lookupWord(word);
    return NextResponse.json({ success: true, definition });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to lookup word" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sentence } = body;

    if (!sentence) {
      return NextResponse.json(
        { success: false, error: "Missing 'sentence' in body" },
        { status: 400 }
      );
    }

    const translation = await translateSentence(sentence);
    return NextResponse.json({ success: true, translation });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to translate sentence" },
      { status: 500 }
    );
  }
}
