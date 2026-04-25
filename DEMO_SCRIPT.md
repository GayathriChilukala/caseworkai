# Casework.AI — 2-minute demo video script

**Length:** 1:45–2:00 max. Judges skim. Keep it tight.
**Tool:** Loom or QuickTime screen capture. Export 1080p. Upload unlisted.
**Record at:** ~8:45 PM with the app warmed up. Close all other tabs.

## Before recording
- App running at `localhost:3000`
- Warm the Claude API with one dry run of triage + pattern detection
- Browser zoom at 110%, bookmarks bar hidden, no notifications visible
- Have the landing page open in the active tab

---

## Shot list (with voiceover)

### [0:00–0:10] COLD OPEN — title card on landing page

> "Every Congressional office in America is drowning in constituent casework. 1,600 overworked staffers. 500 cases a year each. In Outlook and spreadsheets. Casework.AI is their operating system."

*Show:* Landing page with the three-pillar pitch visible.

### [0:10–0:18] OPEN THE INBOX

> "Twenty constituent emails just came in. A veteran waiting on a VA claim. A senior whose Social Security stopped. A family reporting a suspicious Medicare charge. All uncategorized, all urgent to somebody."

*Show:* Click "Inbox". Scroll the list briefly so all 20 rows are visible.

### [0:18–0:35] TRIAGE ALL

> "One click. Triage all. Every case is classified in seconds — which federal agency, which sub-office, how urgent, whether there's a fraud signal. And before any inference call, PII is scrubbed — SSN, phone, email, address — so constituent data is never exposed."

*Show:*
1. Click **Triage all** button (top right)
2. Watch the list populate with colored agency tags (VA blue, SSA green, CMS red), urgency badges, and one or two `fraud` red tags appear
3. (~20 seconds of processing — the 20 cases run through triage)

### [0:35–0:55] OPEN ONE CASE + DRAFT INQUIRY

> "Click any case. Here's a Marine Corps veteran, 19 months waiting on a disability decision at the Atlanta VA Regional Office. Toggle the scrubbed view — this is what Claude actually sees. No SSN. No address. No phone. And one click drafts the Congressional inquiry to the VA liaison, ready to send."

*Show:*
1. Click the first VA case (c-001, Thomas Whitaker)
2. Point to the triage panel: agency, sub-office, urgency, tags
3. Toggle **Show PII-scrubbed view** — highlight the yellow `[SSN-1]` `[PHONE-2]` tokens
4. Click **Draft inquiry to agency** — let it render the letter

### [0:55–1:15] PIVOT TO PATTERNS

> "But the magic is across cases. A single Medicare complaint is a sad story. What happens when you cluster 20 of them at once?"

*Show:* Click **Patterns** in the top nav. Click **Detect patterns**. (~10–15 seconds processing.)

### [1:15–1:35] THE PATTERNS EMERGE

> "Three clusters surface. First — a VA Atlanta Regional Office backlog, seven cases, high severity. Escalation target is the Regional Director. Second — an SSA policy misfiring nationally, five states, reason code 88. That's a letter to the SSA Commissioner. And the third — this is the money shot — four constituents in four different states reporting Medicare was billed by the same supplier for equipment that was never delivered. Premier Mobility Solutions."

*Show:* As each cluster renders, let the camera linger for 2–3 seconds on each one. The fraud cluster has the red border — make that visible.

### [1:35–1:55] GENERATE THE REFERRAL

> "Click one button. Casework.AI generates a fraud referral to HHS-OIG — addressed correctly, citing the False Claims Act, with the evidence bundle attached. That's the entire qui tam pipeline — triggered automatically from constituent complaints no single caseworker would ever have connected."

*Show:*
1. Click **Generate HHS-OIG referral** on the Premier Mobility Solutions fraud card
2. Watch the referral letter render
3. Scroll to show the evidence bundle list

### [1:55–2:00] THE CLOSE

> "Intake triage. Inquiry drafting. Cross-case fraud detection. Every Congressional office. That's Casework.AI."

*Show:* Cut back to landing page. Fade out.

---

## If something breaks mid-recording

- **Triage hangs or 500s** — have a browser tab with cases already triaged (thanks to localStorage). Cut to it and continue.
- **Pattern detection returns only 2 clusters** — still demo-able. Adjust voiceover to "two clusters surface" and move on.
- **Fraud cluster doesn't name Premier Mobility Solutions** — edit the voiceover to "a Medicare DME supplier" and keep moving.
- **Bad take** — don't re-record the whole thing. Splice just the broken segment.

## Final checklist before upload
- [ ] No personal info visible (tabs, notifications, terminal)
- [ ] Audio clean, no AC hum
- [ ] Unlisted visibility (not Private — judges can't log in)
- [ ] Link pasted into README.md under "Demo"
- [ ] Link pasted into submission form
