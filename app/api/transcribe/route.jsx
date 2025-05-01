import { OpenAI } from "openai";
import { NextResponse } from "next/server";

export const runtime = "edge"; // or 'nodejs' for large files

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const response = await openai.audio.transcriptions.create({
      file: buffer,
      model: "whisper-1",
      response_format: "json",
    });

    return NextResponse.json({ text: response.text });
  } catch (err) {
    console.error("Whisper Error:", err);
    return NextResponse.json(
      { error: err.message || "Transcription failed" },
      { status: 500 }
    );
  }
}
