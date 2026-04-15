import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

// GET /api/session?code=ABC123
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "No code" }, { status: 400 });
  try {
    const session = await kv.get(`session:${code.toUpperCase()}`);
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ error: "KV error" }, { status: 500 });
  }
}

// POST /api/session — create or update session
export async function POST(req: NextRequest) {
  try {
    const { code, session } = await req.json();
    if (!code || !session) return NextResponse.json({ error: "Missing data" }, { status: 400 });
    // Store for 24 hours
    await kv.set(`session:${code.toUpperCase()}`, session, { ex: 86400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "KV error" }, { status: 500 });
  }
}

// PATCH /api/session — partial update (student joins, prompt added, etc.)
export async function PATCH(req: NextRequest) {
  try {
    const { code, update } = await req.json();
    if (!code || !update) return NextResponse.json({ error: "Missing data" }, { status: 400 });
    const existing = await kv.get(`session:${code.toUpperCase()}`) as Record<string, unknown> | null;
    if (!existing) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    const merged = deepMerge(existing, update);
    await kv.set(`session:${code.toUpperCase()}`, merged, { ex: 86400 });
    return NextResponse.json({ session: merged });
  } catch {
    return NextResponse.json({ error: "KV error" }, { status: 500 });
  }
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])
        && target[key] && typeof target[key] === "object" && !Array.isArray(target[key])) {
      result[key] = deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
