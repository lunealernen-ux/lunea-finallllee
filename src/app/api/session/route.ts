import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getCollection() {
  const { getMongoClient } = await import("@/lib/mongodb");
  const client = await getMongoClient();
  return client.db("lunea").collection("sessions");
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "No code" }, { status: 400 });
  try {
    const col = await getCollection();
    const doc = await col.findOne({ code: code.toUpperCase() });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ session: doc.session });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { code, session } = await req.json();
    if (!code || !session) return NextResponse.json({ error: "Missing data" }, { status: 400 });
    const col = await getCollection();
    await col.updateOne(
      { code: code.toUpperCase() },
      { $set: { code: code.toUpperCase(), session, updatedAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
