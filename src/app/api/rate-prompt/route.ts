import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildPromptRatingPrompt } from "@/lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { promptText, subject, topic, grade } = await req.json();

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: buildPromptRatingPrompt(promptText, subject, topic, grade),
        },
      ],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "{}";

    try {
      const clean = text.replace(/```json|```/g, "").trim();
      return NextResponse.json({ rating: JSON.parse(clean) });
    } catch {
      return NextResponse.json({ rating: null });
    }
  } catch (error) {
    console.error("Rate prompt API error:", error);
    return NextResponse.json({ error: "Bewertung fehlgeschlagen." }, { status: 500 });
  }
}
