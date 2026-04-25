"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSeedCases } from "@/lib/seed";
import { getAgency } from "@/lib/agencies";
import type {
  FraudCluster,
  PatternCluster,
  PatternDetectionResult,
  TriageResult,
  TriagedCase,
} from "@/lib/types";

const STORAGE_KEY = "caseworkai.triaged";

export default function PatternsPage() {
  const cases = useMemo(() => getSeedCases(), []);
  const [triageMap, setTriageMap] = useState<Record<string, TriageResult>>({});
  const [result, setResult] = useState<PatternDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setTriageMap(JSON.parse(stored));
    } catch {}
  }, []);

  const triagedCases: TriagedCase[] = useMemo(
    () =>
      cases
        .filter((c) => triageMap[c.id])
        .map((c) => ({ ...c, triage: triageMap[c.id]! })),
    [cases, triageMap]
  );

  async function detect() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/detect-patterns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cases: triagedCases }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-black/50 mb-2">
            Pattern detection
          </p>
          <h1 className="font-serif text-3xl leading-tight">
            Across {triagedCases.length} triaged cases.
          </h1>
          <p className="text-sm text-black/60 mt-2">
            The patterns no single caseworker would see from their own caseload.
          </p>
        </div>
        <div className="flex gap-3">
          {triagedCases.length === 0 && (
            <Link
              href="/inbox"
              className="text-xs uppercase tracking-widest border border-ink px-4 py-3"
            >
              Triage cases first →
            </Link>
          )}
          <button
            onClick={detect}
            disabled={loading || triagedCases.length === 0}
            className="bg-ink text-paper px-4 py-3 text-xs uppercase tracking-widest disabled:opacity-40"
          >
            {loading ? "Clustering…" : "Detect patterns"}
          </button>
        </div>
      </section>

      {error && (
        <div className="text-sm text-red-700 border border-red-200 bg-red-50 p-3">
          {error}
        </div>
      )}

      {!result && !loading && triagedCases.length > 0 && (
        <div className="border border-dashed border-black/20 p-10 text-center text-black/50">
          <p className="font-serif italic">
            Click "Detect patterns" to cluster the caseload.
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-10">
          <PatternSection
            label="Operational patterns"
            subtitle="A specific office, region, or process failing many constituents at once."
            items={result.operational_patterns}
            cases={triagedCases}
          />
          <PatternSection
            label="Process patterns"
            subtitle="A systemic policy or rule misfiring across the country."
            items={result.process_patterns}
            cases={triagedCases}
          />
          <FraudSection clusters={result.fraud_clusters} cases={triagedCases} />
        </div>
      )}
    </div>
  );
}

function PatternSection({
  label,
  subtitle,
  items,
  cases,
}: {
  label: string;
  subtitle: string;
  items: PatternCluster[];
  cases: TriagedCase[];
}) {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xs uppercase tracking-widest text-black/50">{label}</h2>
        <p className="text-sm text-black/60">{subtitle}</p>
      </div>
      <div className="space-y-3">
        {items.map((p) => (
          <ClusterCard key={p.id} p={p} cases={cases} />
        ))}
      </div>
    </section>
  );
}

function ClusterCard({ p, cases }: { p: PatternCluster; cases: TriagedCase[] }) {
  const [open, setOpen] = useState(false);
  const relevant = cases.filter((c) => p.case_ids.includes(c.id));
  return (
    <div className="border border-black/15 bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-paper"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <SeverityBadge severity={p.severity} />
            <span className="text-xs text-black/50">
              {p.case_ids.length} cases
            </span>
          </div>
          <h3 className="font-serif text-xl">{p.title}</h3>
          <p className="text-sm text-black/70 mt-1">{p.description}</p>
        </div>
        <span className="text-black/40 text-lg">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-black/10 pt-3">
          <p className="text-xs uppercase tracking-widest text-black/50 mb-2">
            Contributing cases
          </p>
          <ul className="text-sm space-y-1">
            {relevant.map((c) => (
              <li key={c.id} className="flex gap-2">
                <span className="font-mono text-xs text-black/40">{c.id}</span>
                <span className="text-black/70">{c.subject}</span>
                <span className="text-black/40 text-xs">· {c.state}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function FraudSection({
  clusters,
  cases,
}: {
  clusters: FraudCluster[];
  cases: TriagedCase[];
}) {
  if (!clusters || clusters.length === 0) return null;
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xs uppercase tracking-widest text-danger">
          Fraud clusters
        </h2>
        <p className="text-sm text-black/60">
          Multiple constituents, same third party, consistent fraud signal. Each of
          these is a candidate OIG referral.
        </p>
      </div>
      <div className="space-y-3">
        {clusters.map((f) => (
          <FraudCard key={f.id} f={f} cases={cases} />
        ))}
      </div>
    </section>
  );
}

function FraudCard({ f, cases }: { f: FraudCluster; cases: TriagedCase[] }) {
  const [open, setOpen] = useState(true);
  const [referral, setReferral] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<string[]>([]);
  const [statute, setStatute] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const relevant = cases.filter((c) => f.case_ids.includes(c.id));

  async function generateReferral() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/oig-referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cluster: f, cases: relevant }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReferral(data.referral_letter);
      setEvidence(data.evidence_bundle ?? []);
      setStatute(data.recommended_statute ?? "");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-2 border-danger bg-white">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xs uppercase tracking-wider bg-danger text-white px-2 py-1">
            {f.recommended_referral}
          </span>
          <SeverityBadge severity={f.severity} />
          <span className="text-xs text-black/50">{f.case_ids.length} cases</span>
          <span className="text-xs font-mono text-black/70">
            Est. loss: {f.estimated_loss}
          </span>
        </div>
        <h3 className="font-serif text-2xl">{f.title}</h3>
        <p className="text-sm text-black/70 mt-1">{f.description}</p>
        <p className="text-sm italic text-black/60 mt-2">
          Evidence pattern: {f.evidence_pattern}
        </p>
        <button
          onClick={() => setOpen((o) => !o)}
          className="mt-3 text-xs uppercase tracking-widest text-black/60 hover:text-ink"
        >
          {open ? "Hide cases" : "Show cases"}
        </button>
        {open && (
          <ul className="mt-3 text-sm space-y-1">
            {relevant.map((c) => (
              <li key={c.id} className="flex gap-2">
                <span className="font-mono text-xs text-black/40">{c.id}</span>
                <span className="text-black/70">{c.subject}</span>
                <span className="text-black/40 text-xs">· {c.state}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-danger/50 p-5 bg-red-50">
        {!referral && (
          <button
            onClick={generateReferral}
            disabled={busy}
            className="bg-danger text-white px-4 py-3 text-xs uppercase tracking-widest disabled:opacity-40"
          >
            {busy ? "Drafting referral…" : `Generate ${f.recommended_referral} referral`}
          </button>
        )}
        {err && <div className="text-sm text-red-700 mt-2">{err}</div>}
        {referral && (
          <div className="space-y-4">
            <div className="bg-white border border-black/15 p-6">
              <p className="text-xs uppercase tracking-widest text-black/50 mb-3">
                Referral letter · {statute}
              </p>
              <div
                className="letter text-[15px]"
                dangerouslySetInnerHTML={{ __html: simpleMd(referral) }}
              />
            </div>
            {evidence.length > 0 && (
              <div className="bg-white border border-black/15 p-6">
                <p className="text-xs uppercase tracking-widest text-black/50 mb-3">
                  Evidence bundle
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {evidence.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: "low" | "medium" | "high" }) {
  const map = {
    low: "bg-zinc-200 text-zinc-700",
    medium: "bg-amber-200 text-amber-900",
    high: "bg-red-200 text-red-900",
  } as const;
  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 ${map[severity]}`}
    >
      {severity}
    </span>
  );
}

function simpleMd(md: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push("<li>" + inlineFmt(esc(line.replace(/^\s*[-*]\s+/, ""))) + "</li>");
      continue;
    }
    if (inList) { out.push("</ul>"); inList = false; }
    if (line.trim() === "") { out.push(""); continue; }
    out.push("<p>" + inlineFmt(esc(line)) + "</p>");
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}

function inlineFmt(s: string): string {
  return s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
