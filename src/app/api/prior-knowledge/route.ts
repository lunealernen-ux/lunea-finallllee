import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildPriorKnowledgePrompt } from "@/lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { subject, grade, topic, task } = await req.json();

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: buildPriorKnowledgePrompt(subject, grade, topic, task),
        },
      ],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "[]";

    try {
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed) && parsed.length === 3) {
        return NextResponse.json({ questions: parsed });
      }
    } catch {}

    return NextResponse.json({
      questions: [
        `Was weißt du bereits über ${topic}?`,
        `Wo bist du diesem Thema schon begegnet?`,
        `Was möchtest du über ${topic} herausfinden?`,
      ],
    });
  } catch (error) {
    console.error("Prior knowledge API error:", error);
    return NextResponse.json({ error: "Fehler beim Generieren der Vorwissensfragen." }, { status: 500 });
  }
}
