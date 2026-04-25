# Expected patterns — demo cheat sheet

This is the "what should surface when you hit Detect Patterns" list for `seed_cases.json`.
20 cases total. 16 belong to 3 planted clusters; 4 are noise.

## Operational pattern — VA Atlanta Regional Office backlog
**Cases:** c-001, c-002, c-003, c-004, c-005, c-006, c-007 (7 cases)
**Signal:** All 7 are VA disability or DIC claims, all pending >11 months, all explicitly name the Atlanta Regional Office, all from GA/AL/SC (the states served by Atlanta RO).
**Severity:** high
**What the model should recommend:** Escalation to the VBA Regional Director and a joint Congressional letter from the GA delegation.

## Process pattern — SSA "reason code 88" overpayment recoupment
**Cases:** c-008, c-009, c-010, c-011, c-012 (5 cases)
**Signal:** All 5 are SSA benefits stopped/reduced, all cite "reason code 88", constituents are in different states (CA, TX, NY, FL, IL) — so this is systemic, not a local office failure.
**Severity:** high
**What the model should recommend:** Member letter to SSA Commissioner / subcommittee oversight hearing; bipartisan because it affects all states.

## Fraud cluster — Medicare DME billing fraud / Premier Mobility Solutions
**Cases:** c-013, c-014, c-015, c-016 (4 cases)
**Signal:** All 4 describe Medicare being billed by the same named supplier ("Premier Mobility Solutions") for equipment that was never delivered or never ordered. Deceased beneficiary still being billed (c-016). Different states — interstate pattern suggesting a schemed operation.
**Severity:** high
**Recommended referral:** HHS-OIG
**Estimated loss:** very roughly $15–30K across these 4 complaints alone; if pattern generalizes, potentially hundreds of thousands or more
**Statute:** False Claims Act (31 USC § 3729-3733)
**Why this is the demo money shot:** 4 separate constituents in 4 states each experienced what felt like an isolated billing error. Only by clustering across the whole caseload does the pattern emerge — and only then does it become actionable fraud evidence.

## Noise cases (should NOT cluster)
- **c-017** USCIS I-90 delay — one-off, different agency, no pattern
- **c-018** IRS paper return lost — one-off, different agency
- **c-019** HUD Section 8 voucher delay — local PHA issue, one case
- **c-020** USPS mail theft — one-off

If the model surfaces a cluster from these, it's over-clustering. Acceptable answer: they're listed as "untriaged individually" — no cluster.

## Quality bar for the demo
- 3 clusters should appear (not more, not fewer)
- Fraud cluster should name "Premier Mobility Solutions" by name
- HHS-OIG should be the recommended referral target (not generic "OIG")
- Severity should be "high" on all 3
- The 4 noise cases should not appear in any cluster's case_ids

If any of these fail, re-run or tune the `DETECT_PATTERNS_SYSTEM` prompt in `lib/prompts.ts`.
