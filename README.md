# Casework.AI

**The operating system for Congressional casework.**

> Triages constituent complaints in seconds. Drafts the Congressional inquiry letter.
> Surfaces the fraud patterns no single caseworker could ever see.

Built in 4 hours at [c0mpiled-10/DC: AI for Government](https://luma.com/bmabw4qr), Washington DC · April 24, 2026.

---

## The problem

When a regular American has a problem with a federal agency — a veteran whose VA claim has been stuck for 18 months, a senior whose Social Security check stopped arriving, a family fighting an IRS error — they call their Congressman's office. Every member of Congress has 2–4 "caseworkers" whose full-time job is to intervene with agencies on behalf of constituents. State AGs, Governors' offices, and state legislators have the same structure.

**It's a massive invisible industry:**
- ~1,600 federal caseworkers across 535 Congressional offices
- 200–500 cases per caseworker per year
- Thousands more at the state level
- Zero software built for this. All Outlook and spreadsheets. Existing vendors (Intranet Quorum, IQ4) charge $40K/yr per office for glorified CRM.

Meanwhile, **the same fraud patterns recur in caseloads across dozens of offices** — a Medicare supplier billing ghost claims, an SSA policy misfiring nationwide — but no one can see them because each caseworker only sees their own cases.

## What Casework.AI does

### One product, three jobs:

**1. Intake triage (Track A — AI for Government)**
Constituent emails are classified in seconds — which federal agency, which sub-office, what issue, how urgent, whether it's a fraud complaint. Before any inference call, PII is regex-scrubbed: SSN, phone, email, street address, DOB, credit card.

**2. Congressional inquiry drafting (Track C — LLMs vs. Consulting)**
For any case, one click drafts the official Congressional inquiry letter to the agency's liaison — with the correct statutory references, case numbers, and 30-day response demand. This is the work caseworkers currently do by copy-pasting from Word templates.

**3. Cross-case pattern detection → OIG fraud referrals (Track B — Fraud Hunters)**
The magic. The pattern engine sees the entire caseload at once and surfaces three kinds of clusters:

- **Operational patterns** — e.g., "VA Atlanta RO disability backlog — 7 cases." Escalation target: Regional Director.
- **Process patterns** — e.g., "SSA reason code 88 recoupment — 5 cases in 5 states." A systemic policy issue.
- **Fraud clusters** — e.g., "Premier Mobility Solutions billing Medicare for phantom DME — 4 cases in 4 states." This becomes a one-click **HHS-OIG referral under the False Claims Act** with a pre-built evidence bundle.

One Medicare complaint is a sad anecdote. Four complaints about the same supplier across four states is a federal investigation — and it would never be visible without a system that sees every case at once.

## Demo

Watch the 2-minute demo: **[paste link after recording]**

Or run it locally and point it at the 20 seed cases in [`data/seed_cases.json`](./app/data/seed_cases.json).

## Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                       Next.js 14 App Router                        │
│                                                                    │
│   /inbox  ──────────────────────  /patterns                       │
│   (case triage + draft inquiry)   (pattern detection + OIG refs)  │
│                                                                    │
│   ▼                    ▼                    ▼              ▼      │
│ /api/triage    /api/draft-inquiry    /api/detect-   /api/oig-     │
│                                         patterns       referral   │
│                                                                    │
│   Each route: PII scrub → Anthropic Claude (JSON) → response       │
└────────────────────────────────────────────────────────────────────┘
```

- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS
- **LLM:** GPT-4o via [GitHub Models](https://github.com/marketplace/models) (free, OpenAI-compatible endpoint) using the `openai` npm SDK, strict JSON responses
- **Privacy:** regex-based PII scrubber runs before every outbound inference call
- **State:** localStorage (so `/patterns` sees the same triage results as `/inbox`)
- **Seed data:** 20 synthetic constituent emails with 3 planted patterns

## Running locally

```bash
git clone <this-repo>
cd app
cp .env.example .env.local
# paste your GITHUB_TOKEN (fine-grained PAT — no scopes needed for GitHub Models)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

1. Go to **Inbox**, click **Triage all**. In ~30 seconds all 20 cases are classified.
2. Click any case to see the triage tags, the PII-scrubbed email (toggle), and drafted Congressional inquiry.
3. Go to **Patterns**, click **Detect patterns**. Three clusters appear — including a flagged Medicare DME fraud cluster.
4. Click **Generate HHS-OIG referral** on the fraud cluster → full referral letter with False Claims Act citation and evidence bundle.

## Privacy and security

**This is the product's moat, not an afterthought.**

1. **PII is scrubbed before inference.** Every email passes through `lib/pii.ts` — deterministic regex strips SSN, phone, email, street address, DOB, and card numbers, replacing them with token placeholders (`[EMAIL-1]`, `[PHONE-2]`). Toggle "Show PII-scrubbed view" on any case to see exactly what Claude sees.
2. **On-prem deployment path.** Every inference call is a single function in `lib/anthropic.ts`. Swap for a local Ollama/vLLM client and nothing about the UI changes — constituent data never leaves the Congressional office network.
3. **No persistence in the hackathon build.** Triage results live in localStorage; case bodies are hard-coded seed data. Production version adds an encrypted audit log with row-level access controls.
4. **Auditable referrals.** Every OIG referral includes the evidence bundle and recommended statute so the receiving IG can validate the chain of reasoning.

## Why this is a YC-scale business

- **Hits all three YC RFS tracks** simultaneously: forms (intake triage), fraud hunters (cross-case clustering), and LLMs-vs-consulting (replaces vendor CRMs + actual staff work).
- **~1,600 federal caseworkers + ~10,000 state caseworkers** — each office is a seat-based SaaS customer with existing budget allocated to legacy vendors charging $40K/yr.
- **Fraud recovery ROI is uncapped.** Under the False Claims Act, recoveries are 3x damages plus penalties. A single successful DME fraud referral can return $10M+ to the government. The federal government spends trillions annually and loses a commensurate amount to fraud — any system that accelerates qui tam referrals pays for itself 1000x over.
- **Adjacent markets:** state AG offices, inspectors general, ombudsman offices, consumer protection bureaus.

## Roadmap past the hackathon

- Real email intake (Outlook/Gmail integrations)
- Deadline tracking and auto-escalation
- Agency liaison directory (auto-route inquiries to the right contact)
- Constituent portal (self-service status checks)
- On-prem Ollama/vLLM deployment for offices handling classified material
- State-level expansion (state AG, Governor, state legislator workflows)

## Judging criteria — self-assessment

- **Execution:** Three fully-working Claude-backed endpoints, a working PII scrubber, and a loaded demo environment with planted patterns.
- **Novelty:** Nobody is building software for Congressional casework. The cross-case fraud-clustering angle is a real insight.
- **Difficulty:** Multi-prompt orchestration, privacy-aware preprocessing, and getting Claude to only surface clusters with 3+ supporting cases (not spurious noise) is non-trivial prompt engineering.

## License

MIT — go build something better.
