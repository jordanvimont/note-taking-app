import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL = "gemini-2.5-flash";

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY on server." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { mode, text, title } = body as {
    mode?: "expand" | "cleanup";
    text?: string;
    title?: string;
  };

  if (!mode || (mode !== "expand" && mode !== "cleanup")) {
    return NextResponse.json({ error: "Invalid mode." }, { status: 400 });
  }

  if (typeof text !== "string" || typeof title !== "string") {
    return NextResponse.json(
      { error: "Invalid text or title." },
      { status: 400 }
    );
  }

  const systemPrompt =
    mode === "expand"
      ? "You are a writing assistant. Expand and elaborate the note while preserving its original meaning and tone. Keep it concise and structured."
      : "You are a writing assistant. Clean up and improve clarity and grammar of the note without changing the meaning. Keep it concise.";

  const userPrompt = `Title: ${title}\n\nNote:\n${text}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 800,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: "Gemini request failed.", detail: errorText },
      { status: 500 }
    );
  }

  const data = await response.json();
  const suggestion =
    data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("") ?? "";

  if (!suggestion) {
    return NextResponse.json(
      { error: "No suggestion returned." },
      { status: 500 }
    );
  }

  return NextResponse.json({ suggestion });
}
