import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_MODEL = "gpt-4o-mini-transcribe";
const MAX_BYTES = 24 * 1024 * 1024; // 24MB, below OpenAI 25MB limit

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = (formData.get("file") ?? formData.get("audio")) as File | null;
  if (!file) {
    return NextResponse.json({ error: "Missing audio file." }, { status: 400 });
  }

  if (typeof file.size === "number" && file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Audio file too large. Max 24MB." },
      { status: 413 }
    );
  }

  const whisperUrl = process.env.WHISPER_SERVER_URL;
  if (whisperUrl) {
    const whisperForm = new FormData();
    whisperForm.append("file", file, file.name || "meeting.webm");
    whisperForm.append("response_format", "json");

    const baseUrl = whisperUrl.endsWith("/")
      ? whisperUrl.slice(0, -1)
      : whisperUrl;
    const inferenceUrl = `${baseUrl}/inference`;
    const response = await fetch(inferenceUrl, {
      method: "POST",
      body: whisperForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Local transcription failed.", detail: errorText },
        { status: 500 }
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    let text = "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      text =
        data?.text ??
        data?.transcription ??
        data?.result?.text ??
        data?.results?.[0]?.text ??
        "";
    } else {
      text = await response.text();
    }

    if (!text) {
      return NextResponse.json(
        { error: "No transcript returned by local Whisper server." },
        { status: 500 }
      );
    }

    return NextResponse.json({ text });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY on server." },
      { status: 500 }
    );
  }

  const model =
    (formData.get("model") as string | null) ??
    process.env.OPENAI_TRANSCRIBE_MODEL ??
    DEFAULT_MODEL;

  const openaiForm = new FormData();
  openaiForm.append("file", file, file.name || "meeting.webm");
  openaiForm.append("model", model);
  openaiForm.append("response_format", "json");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: openaiForm,
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: "Transcription failed.", detail: errorText },
      { status: 500 }
    );
  }

  const data = await response.json();
  const text = data?.text;
  if (!text) {
    return NextResponse.json(
      { error: "No transcript returned." },
      { status: 500 }
    );
  }

  return NextResponse.json({ text });
}
