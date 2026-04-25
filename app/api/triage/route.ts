import { NextRequest, NextResponse } from "next/server";
import { callClaudeJSON } from "@/lib/anthropic";
import { TRIAGE_SYSTEM, TRIAGE_USER } from "@/lib/prompts";
import { scrubPII } from "@/lib/pii";
import type { ConstituentCase, TriageResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { case: ConstituentCase };
    const c = body.case;
    if (!c?.body) {
      return NextResponse.json({ error: "Missing case body" }, { status: 400 });
    }

    // Privacy: scrub PII BEFORE any inference call
    const scrubbedBody = scrubPII(c.body);
    const scrubbedSubject = scrubPII(c.subject);

    const triage = await callClaudeJSON<TriageResult>({
      system: TRIAGE_SYSTEM,
      user: TRIAGE_USER(scrubbedBody.text, scrubbedSubject.text, c.state),
      maxTokens: 800,
    });

    return NextResponse.json({
      triage,
      scrubbed_body: scrubbedBody.text,
      scrub_count: scrubbedBody.scrubs.length,
    });
  } catch (err: any) {
    console.error("[triage] error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Triage failed" },
      { status: 500 }
    );
  }
}
