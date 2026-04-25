import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-14">
      <section className="max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-black/50 mb-3">
          The operating system for Congressional casework
        </p>
        <h1 className="font-serif text-5xl leading-tight mb-5">
          Triage intake. Draft agency inquiries. Surface systemic fraud.
        </h1>
        <p className="text-lg text-black/70">
          Every Congressional office in America is drowning in constituent casework —
          1,600 overworked staffers handling 500 cases each per year, in Outlook and
          spreadsheets. Casework.AI turns that workflow into three seconds of AI —
          and uses pattern detection across thousands of cases to surface fraud no
          single caseworker could ever see.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Pillar
          label="Track A · AI for Government"
          title="Triage the intake"
          body="Constituent emails arrive. Casework.AI identifies the agency, the issue, the urgency, and drafts the official Congressional inquiry letter in seconds."
        />
        <Pillar
          label="Track B · Fraud Hunters"
          title="See the patterns"
          body="One Medicare complaint is an anecdote. Five complaints about the same supplier is a federal investigation. Cross-case clustering surfaces the clusters you couldn't see one-at-a-time."
        />
        <Pillar
          label="Track C · LLMs vs. Consulting"
          title="Replace the workflow"
          body="Vendors charge $40K/yr per office for glorified CRM; consultants bill $200+/hour to configure it. Casework.AI replaces both — the software and the hours."
        />
      </section>

      <section className="flex gap-4">
        <Link
          href="/inbox"
          className="inline-block bg-ink text-paper px-6 py-3 text-sm uppercase tracking-widest hover:opacity-90"
        >
          Open the inbox →
        </Link>
        <Link
          href="/patterns"
          className="inline-block border border-ink px-6 py-3 text-sm uppercase tracking-widest hover:bg-ink hover:text-paper"
        >
          See pattern detection →
        </Link>
      </section>

      <section className="max-w-3xl text-sm text-black/60 border-t border-black/10 pt-6">
        <p>
          <strong>Privacy note:</strong> Before any inference call, every constituent
          email is scrubbed of PII — SSN, phone, email, street address, DOB, card
          numbers — via deterministic regex, so the model never sees raw
          constituent data. This build uses the Anthropic API; on-prem deployment
          (swap Claude for a local Ollama/vLLM model — a single-file change in{" "}
          <code className="font-mono text-black/80">lib/anthropic.ts</code>) is
          the roadmap item for offices handling classified material.
        </p>
      </section>
    </div>
  );
}

function Pillar({ label, title, body }: { label: string; title: string; body: string }) {
  return (
    <div className="border border-black/15 bg-white p-6">
      <div className="text-xs uppercase tracking-widest text-black/50 mb-3">
        {label}
      </div>
      <h2 className="font-serif text-2xl mb-2">{title}</h2>
      <p className="text-sm text-black/70">{body}</p>
    </div>
  );
}
