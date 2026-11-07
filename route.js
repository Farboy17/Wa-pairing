import { NextResponse } from "next/server";

// Rate limit rahisi (kwa instance moja). Kwa uhakika zaidi tumia Upstash Ratelimit.
const hits = new Map();
const LIMIT = 3, WINDOW = 60_000;

export async function POST(req) {
  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  if (recent.length >= LIMIT)
    return NextResponse.json({ error: "Maombi mengi. Subiri dakika moja ujaribu tena." }, { status: 429 });
  hits.set(ip, [...recent, now]);

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Ombi si sahihi." }, { status: 400 }); }

  const number = String(body.number || "").replace(/\D/g, "");
  if (number.length < 10 || number.length > 15)
    return NextResponse.json({ error: "Namba si sahihi. Tumia country code, mfano 255712345678." }, { status: 400 });

  try {
    const r = await fetch(`${process.env.BOT_SERVER_URL}/pair`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-pair-secret": process.env.PAIR_SECRET },
      body: JSON.stringify({ number }),
      signal: AbortSignal.timeout(25_000),
    });
    const data = await r.json();
    if (!r.ok) return NextResponse.json({ error: data.error || "Imeshindikana kupata code." }, { status: 502 });
    return NextResponse.json({ code: data.code });
  } catch {
    return NextResponse.json({ error: "Server ya bot haipatikani sasa. Jaribu tena baadaye." }, { status: 503 });
  }
}
