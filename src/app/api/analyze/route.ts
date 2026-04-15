import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildGroupAnalysisPrompt, buildStudentFeedbackPrompt } from "@/lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { type, ...payload } = await req.json();

    if (type === "group") {
      const { promptsList, subject, topic, grade } = payload;
      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        messages: [{ role: "user", content: buildGroupAnalysisPrompt(promptsList, subject, topic, grade) }],
      });
      const text = response.content[0]?.type === "text" ? response.content[0].text : "{}";
      try {
        return NextResponse.json({ analysis: JSON.parse(text.replace(/```json|```/g, "").trim()) });
      } catch {
        return NextResponse.json({ analysis: null });
      }
    }

    if (type === "student-feedback") {
      const { subject, topic, grade, task, ownThoughts, priorAnswers, prompts } = payload;
      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1200,
        messages: [{
          role: "user",
          content: buildStudentFeedbackPrompt(subject, topic, grade, task, ownThoughts, priorAnswers, prompts),
        }],
      });
      const text = response.content[0]?.type === "text" ? response.content[0].text : "{}";
      try {
        const feedback = JSON.parse(text.replace(/```json|```/g, "").trim());
        return NextResponse.json({ feedback });
      } catch {
        return NextResponse.json({ feedback: null, raw: text });
      }
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "Analyse fehlgeschlagen." }, { status: 500 });
  }
}
