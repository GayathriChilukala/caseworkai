"use client";

import { useEffect, useMemo, useState } from "react";
import { getSeedCases } from "@/lib/seed";
import { getAgency } from "@/lib/agencies";
import { scrubPII } from "@/lib/pii";
import type {
  ConstituentCase,
  TriageResult,
  TriagedCase,
  Urgency,
} from "@/lib/types";

const STORAGE_KEY = "caseworkai.triaged";

export default function InboxPage() {
  const [cases] = useState<ConstituentCase[]>(() => getSeedCases());
  const [triageMap, setTriageMap] = useState<Record<string, TriageResult>>({});
  const [selectedId, setSelectedId] = useState<string>(cases[0]?.id ?? "");
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [bulkBusy, setBulkBusy] = useState(false);
  const [inquiry, setInquiry] = useState<Record<string, string>>({});
  const [inquiryBusy, setInquiryBusy] = useState(false);
  // Default to PII-scrubbed view — this is what the LLM actually sees.
  // Caseworkers toggle to the raw view only when they need the real numbers/addresses.
  const [showScrubbed, setShowScrubbed] = useState(true);

  // Hydrate triage map from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setTriageMap(JSON.parse(stored));
    } catch {}
  }, []);

  // Persist triage map
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(triageMap));
    } catch {}
  }, [triageMap]);

  async function triageOne(c: ConstituentCase) {
    setBusy((b) => ({ ...b, [c.id]: true }));
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case: c }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTriageMap((m) => ({ ...m, [c.id]: data.triage }));
    } catch (e) {
      console.error(e);
    } finally {
      setBusy((b) => ({ ...b, [c.id]: false }));
    }
  }

  async function triageAll() {
    setBulkBusy(true);
    // GitHub Models free tier enforces a UserConcurrentRequests cap.
    // Fully sequential is the safest; the server helper also retries on 429.
    const queue = cases.filter((c) => !triageMap[c.id]);
    for (const c of queue) {
      await triageOne(c);
    }
    setBulkBusy(false);
  }

  async function draftInquiry(c: ConstituentCase) {
    const triage = triageMap[c.id];
    if (!triage) return;
    setInquiryBusy(true);
    try {
      const res = await fetch("/api/draft-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case: c, triage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInquiry((m) => ({ ...m, [c.id]: data.letter }));
    } catch (e) {
      console.error(e);
    } finally {
      setInquiryBusy(false);
    }
  }

  const selected = useMemo(
    () => cases.find((c) => c.id === selectedId) ?? null,
    [cases, selectedId]
  );

  const triagedCount = Object.keys(triageMap).length;

  return (
    <div className="grid md:grid-cols-[380px_1fr] gap-6 h-[calc(100vh-200px)]">
      <aside className="border border-black/15 bg-white flex flex-col">
        <div className="p-4 border-b border-black/10 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-black/50">Inbox</p>
            <p className="text-sm text-black/70">
              {triagedCount} of {cases.length} triaged
            </p>
          </div>
          <button
            onClick={triageAll}
            disabled={bulkBusy || triagedCount === cases.length}
            className="text-xs uppercase tracking-widest bg-ink text-paper px-3 py-2 disabled:opacity-40"
          >
            {bulkBusy ? "Triaging…" : "Triage all"}
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto divide-y divide-black/5">
          {cases.map((c) => (
            <CaseRow
              key={c.id}
              c={c}
              triage={triageMap[c.id]}
              busy={busy[c.id]}
              selected={c.id === selectedId}
              onClick={() => setSelectedId(c.id)}
            />
          ))}
        </ul>
      </aside>

      <section className="border border-black/15 bg-white overflow-y-auto">
        {selected ? (
          <Detail
            c={selected}
            triage={triageMap[selected.id]}
            busy={busy[selected.id]}
            inquiryLetter={inquiry[selected.id]}
            inquiryBusy={inquiryBusy}
            showScrubbed={showScrubbed}
            onToggleScrubbed={() => setShowScrubbed((s) => !s)}
            onTriage={() => triageOne(selected)}
            onDraft={() => draftInquiry(selected)}
          />
        ) : (
          <div className="p-10 text-center text-black/50">Select a case</div>
        )}
      </section>
    </div>
  );
}

function CaseRow({
  c,
  triage,
  busy,
  selected,
  onClick,
}: {
  c: ConstituentCase;
  triage?: TriageResult;
  busy?: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  const agency = triage ? getAgency(triage.agency_code) : null;
  return (
    <li
      onClick={onClick}
      className={`p-3 cursor-pointer hover:bg-paper ${
        selected ? "bg-paper" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {agency ? (
              <span
                className={`${agency.color} text-white text-[10px] px-1.5 py-0.5 font-mono uppercase tracking-wider`}
              >
                {agency.code}
              </span>
            ) : (
              <span className="bg-zinc-300 text-zinc-700 text-[10px] px-1.5 py-0.5 font-mono uppercase tracking-wider">
                {busy ? "…" : "New"}
              </span>
            )}
            {triage && <UrgencyBadge urgency={triage.urgency} />}
            {triage?.fraud_signal && (
              <span className="text-[10px] uppercase tracking-wider bg-danger text-white px-1.5 py-0.5">
                fraud
              </span>
            )}
          </div>
          <p className="text-sm font-medium truncate">{c.subject}</p>
          <p className="text-xs text-black/50 truncate">
            {c.constituent_name} · {c.state} ·{" "}
            {new Date(c.received_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </li>
  );
}

function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const map: Record<Urgency, string> = {
    low: "bg-zinc-200 text-zinc-700",
    medium: "bg-amber-200 text-amber-900",
    high: "bg-orange-200 text-orange-900",
    critical: "bg-red-200 text-red-900",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 ${map[urgency]}`}
    >
      {urgency}
    </span>
  );
}

function Detail({
  c,
  triage,
  busy,
  inquiryLetter,
  inquiryBusy,
  showScrubbed,
  onToggleScrubbed,
  onTriage,
  onDraft,
}: {
  c: ConstituentCase;
  triage?: TriageResult;
  busy?: boolean;
  inquiryLetter?: string;
  inquiryBusy: boolean;
  showScrubbed: boolean;
  onToggleScrubbed: () => void;
  onTriage: () => void;
  onDraft: () => void;
}) {
  const scrubbed = useMemo(() => scrubPII(c.body), [c.body]);

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-widest text-black/50">
          Case #{c.id} · received {new Date(c.received_at).toLocaleString()}
        </p>
        <h1 className="font-serif text-2xl">{c.subject}</h1>
        <p className="text-sm text-black/60">
          {c.constituent_name} · {c.state} {c.zip} · {c.constituent_email}
        </p>
      </header>

      {triage ? (
        <TriagePanel triage={triage} />
      ) : (
        <button
          onClick={onTriage}
          disabled={busy}
          className="bg-ink text-paper px-4 py-2 text-xs uppercase tracking-widest disabled:opacity-40"
        >
          {busy ? "Triaging…" : "Triage this case"}
        </button>
      )}

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs uppercase tracking-widest text-black/50">
            Constituent email
          </h2>
          <label className="flex items-center gap-2 text-xs text-black/60">
            <input
              type="checkbox"
              checked={showScrubbed}
              onChange={onToggleScrubbed}
            />
            {showScrubbed
              ? `PII-scrubbed (what the LLM sees · ${scrubbed.scrubs.length} tokens)`
              : `Raw view — PII visible (click to re-scrub, ${scrubbed.scrubs.length} tokens stripped)`}
          </label>
        </div>
        {showScrubbed ? (
          <pre
            className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed bg-paper border border-black/10 p-5"
            dangerouslySetInnerHTML={{ __html: highlightTokens(scrubbed.text) }}
          />
        ) : (
          <pre className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed bg-paper border border-black/10 p-5">
            {c.body}
          </pre>
        )}
      </section>

      {triage && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs uppercase tracking-widest text-black/50">
              Congressional inquiry letter
            </h2>
            {!inquiryLetter && (
              <button
                onClick={onDraft}
                disabled={inquiryBusy}
                className="text-xs uppercase tracking-widest border border-ink px-3 py-2 disabled:opacity-40"
              >
                {inquiryBusy ? "Drafting…" : "Draft inquiry to agency"}
              </button>
            )}
          </div>
          {inquiryLetter ? (
            <div className="bg-paper border border-black/10 p-6">
              <div
                className="letter text-[15px]"
                dangerouslySetInnerHTML={{ __html: simpleMd(inquiryLetter) }}
              />
            </div>
          ) : (
            <div className="text-sm text-black/50 italic">
              No inquiry drafted yet.
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function TriagePanel({ triage }: { triage: TriageResult }) {
  const agency = getAgency(triage.agency_code);
  return (
    <div className="bg-paper border border-black/15 p-4">
      <div className="flex items-start gap-3 flex-wrap">
        <span className={`${agency.color} text-white text-xs px-2 py-1 font-mono uppercase`}>
          {agency.short}
        </span>
        {triage.sub_office && (
          <span className="text-xs text-black/70 border border-black/20 px-2 py-1">
            {triage.sub_office}
          </span>
        )}
        <UrgencyBadge urgency={triage.urgency} />
        {triage.fraud_signal && (
          <span className="text-xs uppercase tracking-wider bg-danger text-white px-2 py-1">
            Fraud signal
          </span>
        )}
      </div>
      <p className="mt-3 text-sm">
        <strong>{triage.issue_category}</strong> — {triage.summary}
      </p>
      {triage.tags.length > 0 && (
        <div className="mt-2 flex gap-1 flex-wrap">
          {triage.tags.map((t) => (
            <span key={t} className="text-[11px] text-black/60 bg-white border border-black/10 px-2 py-0.5">
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Very light markdown → HTML (paragraphs, bold, bullets) — good enough for letters
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

function highlightTokens(text: string): string {
  const esc = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return esc.replace(/\[(SSN|PHONE|EMAIL|ADDRESS|DOB|CARD)-\d+\]/g, (m) =>
    `<span class="pii-token">${m}</span>`
  );
}
