import { NextResponse } from "next/server";

export const runtime = "nodejs";

type SummaryPayload = {
  title: string;
  action_items: string[];
  summary: string;
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY on server." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { transcript } = body as { transcript?: string };
  if (typeof transcript !== "string" || !transcript.trim()) {
    return NextResponse.json(
      { error: "Invalid transcript." },
      { status: 400 }
    );
  }

  const model = process.env.OPENAI_SUMMARY_MODEL || "gpt-4o-mini";
  const instructions = [
    "You are an assistant that turns meeting transcripts into notes.",
    "Return ONLY valid JSON with keys:",
    "title (string), action_items (array of short strings), summary (string).",
    "Action items must be imperative, concise, and belong at the top of the note.",
    "Keep the summary to 6-10 sentences.",
    "Do not add any extra keys or commentary.",
    "Respond in JSON.",
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      instructions,
      input: transcript,
      text: { format: { type: "json_object" } },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: "OpenAI request failed.", detail: errorText },
      { status: 500 }
    );
  }

  const data = await response.json();
  const raw = data?.output_text ?? "";

  if (!raw) {
    return NextResponse.json(
      { error: "No summary returned." },
      { status: 500 }
    );
  }

  try {
    const parsed = JSON.parse(raw) as SummaryPayload;
    if (
      !parsed ||
      typeof parsed.title !== "string" ||
      !Array.isArray(parsed.action_items) ||
      typeof parsed.summary !== "string"
    ) {
      throw new Error("Invalid summary shape.");
    }
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse summary response." },
      { status: 500 }
    );
  }
}
