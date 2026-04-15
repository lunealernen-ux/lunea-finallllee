import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildChatSystemPrompt } from "@/lib/prompts";
import { AIMode, ChatMessage } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages, mode, subject, topic, grade, task, imageData } = await req.json();

    if (!messages || !subject || !topic || !grade || !task) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = buildChatSystemPrompt(mode as AIMode, subject, topic, grade, task);

    // Build messages with optional image in last user message
    const anthropicMessages = (messages as ChatMessage[]).map((msg, idx) => {
      const isLast = idx === messages.length - 1;
      if (isLast && imageData && msg.role === "user") {
        return {
          role: msg.role as "user" | "assistant",
          content: [
            {
              type: "image" as const,
              source: {
                type: "base64" as const,
                media_type: imageData.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: imageData.data,
              },
            },
            { type: "text" as const, text: msg.content },
          ],
        };
      }
      return {
        role: msg.role as "user" | "assistant",
        content: msg.content,
      };
    });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "";

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "KI-Verbindung fehlgeschlagen." }, { status: 500 });
  }
}
