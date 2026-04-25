# Casework.AI — Build Plan

**Hackathon:** c0mpiled-10/DC: AI for Government · 4hr sprint (5:30–9:30 PM)
**Builder:** Solo · **Stack:** Next.js 14 + TypeScript + Tailwind + Anthropic SDK

---

## Product in one sentence
The operating system for Congressional casework: triages constituent complaints, drafts agency inquiries, and uses pattern detection across thousands of cases to surface systemic fraud that no single caseworker could ever see.

## Why this wins

- **Hits all three YC RFS tracks in one product:**
  - Track A (AI for Government): constituent intake + Congressional inquiry forms
  - Track B (Fraud Hunters): cross-case pattern detection → auto-generated OIG referrals
  - Track C (LLMs vs. Consulting): replaces $40K/yr legacy CRM vendors + actual staff workflow
- **Invisible $1B market.** ~1,600 federal caseworkers × 535 Congressional offices + state AGs + Governors. No one is building here.
- **Fraud story is emergent.** A single Medicare complaint is a sad anecdote. 5 complaints about the same DME supplier is a federal investigation. That's the pitch.
- **Privacy built-in.** PII is regex-scrubbed before any model call. On-prem deployment path.

---

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

State: localStorage (persists triaged cases between pages, no DB)
Seed data: 20 synthetic emails in /data/seed_cases.json
```

## File layout

```
app/
  layout.tsx                     # shared shell, nav
  page.tsx                       # landing (three-pillar pitch)
  globals.css
  inbox/page.tsx                 # left: cases list, right: detail + inquiry draft
  patterns/page.tsx              # pattern clusters + fraud referrals
  api/triage/route.ts            # one case → triage (agency, issue, urgency, flags)
  api/draft-inquiry/route.ts     # one case → Congressional inquiry letter to agency
  api/detect-patterns/route.ts   # all cases → clustered patterns + fraud clusters
  api/oig-referral/route.ts      # fraud cluster → OIG referral document
lib/
  anthropic.ts                   # Claude client + JSON helper
  types.ts                       # shared TS types
  prompts.ts                     # 4 Claude prompts (one per route)
  agencies.ts                    # federal agency reference data
  pii.ts                         # regex-based PII scrubber
  seed.ts                        # loads seed_cases.json
data/
  seed_cases.json                # 20 synthetic constituent emails with planted patterns
```

---

## Hour-by-hour timeline

| Block | Time | What | Checkpoint |
|---|---|---|---|
| **H0** | 5:30–5:45 | `npx create-next-app`, install deps, wire env, copy seed data | `npm run dev` works, `/inbox` loads empty |
| **H1** | 5:45–6:45 | **Triage + draft inquiry end-to-end** — inbox UI, list + detail, /api/triage + /api/draft-inquiry | Click case → see triage tags + drafted letter |
| **H2** | 6:45–7:45 | **Pattern detection page** — /api/detect-patterns, render clusters, OIG referral button | "Find patterns" button returns 3+ clusters including a fraud cluster |
| **H3** | 7:45–8:30 | **Polish pass** — landing page, PII scrub visualization, confidence badges, clean typography | Looks like a real product |
| **H4** | 8:30–9:15 | **Demo video + README polish + push to GitHub** | Video uploaded, repo public |
| **Cutover** | 9:15–9:30 | Final checks: repo README, .env not committed, video accessible, submission form | Submitted before 9:30 |

**If behind at 7:45:** cut the OIG referral endpoint; keep patterns as read-only clusters.
**If behind at 8:30:** record demo from localhost, skip Vercel deploy.

---

## The four Claude prompts (pre-written — tune during build)

### 1. `triage` — classify one case
Takes a single PII-scrubbed email. Returns:
```json
{
  "agency": "Department of Veterans Affairs",
  "agency_code": "VA",
  "sub_office": "Atlanta Regional Office",
  "issue_category": "Benefits delay",
  "urgency": "high",
  "summary": "Veteran waiting 18 months for disability claim decision",
  "fraud_signal": false,
  "tags": ["backlog", "regional-office", "disability"]
}
```

### 2. `draft-inquiry` — draft the Congressional letter
Takes case + triage. Returns markdown-formatted Congressional inquiry letter addressed to the agency liaison.

### 3. `detect-patterns` — cluster all cases
Takes an array of triaged cases. Returns:
```json
{
  "operational_patterns": [
    {"title": "VA Atlanta RO disability backlog", "case_ids": [...], "severity": "high"}
  ],
  "process_patterns": [
    {"title": "SSA overpayment clawback via reason code 88", "case_ids": [...], ...}
  ],
  "fraud_clusters": [
    {"title": "Medicare DME billing fraud — Premier Mobility Solutions", "case_ids": [...], "estimated_loss": "$500K+", "recommended_referral": "HHS-OIG"}
  ]
}
```

### 4. `oig-referral` — generate the referral document
Takes a fraud cluster + relevant case details. Returns a formatted OIG referral letter with evidence bundle.

---

## Demo story (memorize this)

> "Every Congressional office in America is drowning in constituent casework. A veteran can't get their VA claim. A senior's Social Security stopped. They call their Congressman's office. 1,600 overworked caseworkers handle 500 cases each per year, in Outlook and spreadsheets, with no software. Casework.AI is their operating system. It triages intake in seconds. Drafts the agency inquiry letter. And — the magic — it uses pattern detection across thousands of cases to surface systemic fraud that no single caseworker would ever see. One Medicare complaint is a sad story. Five complaints about the same supplier is a federal investigation."

**Three beats in the video:**
1. **Inbox** — 20 cases loaded. Hit "Triage all" → watch them get categorized by agency, issue, urgency. Click one → see the case + drafted Congressional inquiry ready to send. (45s)
2. **Patterns** — Hit "Detect patterns" → 3 clusters surface: a VA regional backlog, an SSA systemic process issue, and a Medicare DME fraud cluster linking 4 cases to one supplier. (45s)
3. **OIG referral** — Click the fraud cluster → auto-generated referral to HHS-OIG with the evidence bundle. "That's the entire qui tam / fraud hunter pipeline, triggered automatically from constituent complaints." (20s)

---

## Submission checklist (9:30 hard stop)

- [ ] GitHub repo public
- [ ] `.env` in `.gitignore` — no keys committed
- [ ] README has tagline, pitch, architecture, run instructions, demo link
- [ ] Demo video <2 min, unlisted link
- [ ] `test-data/` and `data/seed_cases.json` in repo so judges can reproduce
- [ ] Submission form filled before 9:30

---

## What to cut if time collapses

In priority order (cut from the bottom first):
1. Vercel deploy — localhost is fine
2. OIG referral generation — keep patterns as read-only
3. PII scrub visualization in UI — keep scrubbing in code, just don't show it
4. Landing page polish
5. **NEVER CUT:** /api/triage + /api/detect-patterns working end-to-end with seed data. That's the demo.
