import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildGroupComparisonPrompt } from "@/lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { entries, task, subject, topic } = await req.json();

    if (!entries?.length) {
      return NextResponse.json({ comparison: null });
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: buildGroupComparisonPrompt(entries, task, subject, topic),
        },
      ],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "{}";
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      return NextResponse.json({ comparison: JSON.parse(clean) });
    } catch {
      return NextResponse.json({ comparison: null });
    }
  } catch (error) {
    console.error("Group compare API error:", error);
    return NextResponse.json({ error: "Gruppenvergleich fehlgeschlagen." }, { status: 500 });
  }
}
