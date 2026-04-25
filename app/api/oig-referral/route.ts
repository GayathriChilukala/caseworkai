import { NextRequest, NextResponse } from "next/server";
import { callClaudeJSON } from "@/lib/anthropic";
import { OIG_REFERRAL_SYSTEM, OIG_REFERRAL_USER } from "@/lib/prompts";
import { scrubPII } from "@/lib/pii";
import type {
  FraudCluster,
  OIGReferralResult,
  TriagedCase,
} from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      cluster: FraudCluster;
      cases: TriagedCase[];
    };
    if (!body.cluster || !Array.isArray(body.cases)) {
      return NextResponse.json({ error: "Missing cluster or cases" }, { status: 400 });
    }

    const relevant = body.cases.filter((c) => body.cluster.case_ids.includes(c.id));
    // Privacy: both body AND subject are PII-scrubbed before inference.
    const compact = relevant.map((c) => ({
      id: c.id,
      received_at: c.received_at,
      state: c.state,
      subject: scrubPII(c.subject).text,
      triage: c.triage,
      body_scrubbed: scrubPII(c.body).text.slice(0, 1500),
    }));

    const result = await callClaudeJSON<OIGReferralResult>({
      system: OIG_REFERRAL_SYSTEM,
      user: OIG_REFERRAL_USER(
        JSON.stringify(body.cluster, null, 2),
        JSON.stringify(compact, null, 2)
      ),
      maxTokens: 2500,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[oig-referral] error:", err);
    return NextResponse.json(
      { error: err?.message ?? "OIG referral failed" },
      { status: 500 }
    );
  }
}
