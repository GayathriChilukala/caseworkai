import { NextRequest, NextResponse } from "next/server";
import { callClaudeJSON } from "@/lib/anthropic";
import { DETECT_PATTERNS_SYSTEM, DETECT_PATTERNS_USER } from "@/lib/prompts";
import { scrubPII } from "@/lib/pii";
import type { PatternDetectionResult, TriagedCase } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { cases: TriagedCase[] };
    if (!Array.isArray(body.cases) || body.cases.length === 0) {
      return NextResponse.json({ error: "No triaged cases provided" }, { status: 400 });
    }

    // Compact representation to fit in the context. Only send what's needed.
    // Privacy: both body AND subject are PII-scrubbed before inference.
    const compact = body.cases.map((c) => ({
      id: c.id,
      received_at: c.received_at,
      state: c.state,
      subject: scrubPII(c.subject).text,
      triage: c.triage,
      body_scrubbed: scrubPII(c.body).text.slice(0, 1200),
    }));

    const result = await callClaudeJSON<PatternDetectionResult>({
      system: DETECT_PATTERNS_SYSTEM,
      user: DETECT_PATTERNS_USER(JSON.stringify(compact, null, 2)),
      maxTokens: 3000,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[detect-patterns] error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Pattern detection failed" },
      { status: 500 }
    );
  }
}
