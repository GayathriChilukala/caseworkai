import { NextRequest, NextResponse } from "next/server";
import { callClaudeText } from "@/lib/anthropic";
import { DRAFT_INQUIRY_SYSTEM, DRAFT_INQUIRY_USER } from "@/lib/prompts";
import { scrubPII } from "@/lib/pii";
import type { ConstituentCase, TriageResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      case: ConstituentCase;
      triage: TriageResult;
    };
    if (!body.case?.body || !body.triage) {
      return NextResponse.json(
        { error: "Missing case or triage" },
        { status: 400 }
      );
    }

    // Privacy: scrub PII BEFORE any inference call — body AND subject.
    const scrubbedBody = scrubPII(body.case.body).text;
    const scrubbedSubject = scrubPII(body.case.subject).text;

    const letter = await callClaudeText({
      system: DRAFT_INQUIRY_SYSTEM,
      user: DRAFT_INQUIRY_USER(
        scrubbedBody,
        scrubbedSubject,
        body.triage.summary,
        body.triage.agency
      ),
      maxTokens: 1500,
    });

    return NextResponse.json({ letter });
  } catch (err: any) {
    console.error("[draft-inquiry] error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Draft failed" },
      { status: 500 }
    );
  }
}
