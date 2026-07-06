# ESG Meteor — My Presentation Script

> **How to use this:** Read it out loud 3–4 times. Don't memorize word-for-word — memorize the **bold anchor lines** in each section. If you remember the anchors, the rest flows naturally. Pause cues are marked like *(pause)*.

---

## The story in one line (memorize this first)

> **"Data is entered by one person, certified by another, and leadership sees everything but can change nothing — that's why every number in this platform can be trusted."**

If you ever get lost during the demo, come back to this line. The whole project is this sentence.

---

## PART 1 — The Opening (the problem)

**Anchor: "Today ESG data lives in Excel sheets and email threads."**

Say:

"Hi, let me walk you through **ESG Meteor** — a centralized platform for capturing, validating, and reporting ESG data. ESG means Environmental, Social, and Governance — things like carbon emissions, water use, worker safety, and compliance incidents.

*(pause)*

Here's the problem we're solving. Today, in most companies, this data lives in **scattered Excel sheets and email threads**. Three problems come from that:

One — **no single source of truth**. The same metric shows different numbers in different teams' files.

Two — **no audit trail**. Nobody can prove who entered a number, or who changed it.

Three — **slow reporting**. Consolidating everything for a board report or a regulatory filing takes **weeks**.

*(pause)*

ESG Meteor fixes all three with one platform: structured data entry, a **draft → submit → approve → lock** workflow, live dashboards, and one-click audit-ready Excel exports."

---

## PART 2 — The three roles (the design idea)

**Anchor: "The person who enters the data is never the person who certifies it."**

Say:

"The platform has **three roles**, and the separation between them is the core design idea.

- A **Data Entry user** at the site level — they capture the readings.
- An **Auditor** — a different person — who reviews, approves, and locks the data.
- An **Admin** — leadership — who sees everything but can change nothing.

The key principle: **the person who enters the data is never the person who certifies it**. And this isn't just hidden buttons in the UI — every rule is enforced at the API level too. If a role tries a forbidden action, the server rejects it with a 403.

Let me walk through each role, in the same order the data flows."

---

## PART 3 — Role 1: Data Entry (Rahul)

**Anchors, in order: Dashboard → Wizard → Draft → Submit → Read-only.**

### 3.1 His dashboard

Say:

"First, the **Data Entry user** — think of an environment officer at a plant or a mine. I'm logged in as Rahul.

His dashboard is built for **daily work, not analytics**. At the top, four **status count cards** — Draft, Submitted, Approved, Locked — so the moment he logs in, he knows exactly how much work is still pending on his side. Below that, a big **New Entry** shortcut — because that's the action he does most — and a list of his **recent entries** for a quick sanity check."

### 3.2 The New Entry wizard

Say:

"Creating a reading is a **guided three-step wizard** — much safer than one long form.

**Step one** — pick the facility and the metric. The metrics come from a **controlled catalogue**, grouped into Environmental, Social, and Governance, each with its unit shown. So users can't invent random columns like in a spreadsheet — and because the unit is displayed, you avoid the classic mistake of entering litres where it expects kilolitres.

**Step two** — the period and the value. Dates are validated — the end date can't be before the start — and the value must be a positive number. There are also optional fields for the **data source** — like a utility bill number — which gives auditors evidence to trace back to.

**Step three** — review and confirm. And here's an important detail: the record is saved as a **draft**. It is *not* yet part of official reporting. Submitting is a deliberate, separate action."

### 3.3 My Entries — edit and submit

Say:

"On the **My Entries** page he can see the draft. While it's a draft, he can still **edit** it — say he typed the wrong value, he fixes it inline — and every change is written to an **audit log**: old value, new value, who changed it, and when.

When he's confident, he clicks **Submit**. *(pause)* And from that moment, the record is **read-only for him**. He cannot approve his own data. He cannot edit it anymore. That's the hand-off to the auditor."

**Transition line:** "So that's how data gets in. Now let's look at who certifies it."

---

## PART 4 — Role 2: Auditor (Shresht)

**Anchors, in order: Queue → Approve → Lock → Targets.**

### 4.1 His dashboard — the approval queue

Say:

"Now I'm the **Auditor** — typically corporate sustainability or internal audit. I'm logged in as Shresht.

His home page is not a data entry screen — it's an **approval queue**. At the top, two counts: how many entries are **awaiting approval**, and how many approved entries are **awaiting lock**. Below that, a two-column queue that separates those two jobs, so nothing gets missed."

### 4.2 Approve

Say:

"Here's the entry Rahul just submitted. The auditor sees the facility, the metric, the value, the period — and approves it.

Notice what he **cannot** do: he can't edit the value, and he can't create entries. If a number looks wrong, it goes **back through the workflow** — the auditor never silently 'fixes' data. That's deliberate. The reviewer must never be able to alter what they're reviewing."

### 4.3 Lock

Say:

"The final step is **Lock**. *(pause)* A locked record is **immutable** — nobody can change it. Not the data entry user, not the auditor, **not even the admin**. And this is enforced at the API, not just in the interface.

This is what makes the data defensible in front of an external auditor or a regulator: validated at entry, approved by a separate person, and sealed with a complete change history."

### 4.4 Targets & Compliance

Say:

"Auditors also get the **Targets page**, because certification isn't just 'is this number plausible?' — it's 'are we meeting our commitments?'

At the top, a **compliance score** — what percentage of targets are being met — plus counts of metrics that are **on track, at risk, or off track**. Below that, every metric breaks down **per facility**: actual versus target, a progress bar, and a **RAG status** — green means on or below target, amber means up to 10% over, red means more than 10% over.

So you don't just see that emissions are high — you see **which site missed which commitment**."

**Transition line:** "Now the role that sees everything — the Admin."

---

## PART 5 — Role 3: Admin (Hitesh)

**Anchors, in order: KPIs → Data Quality → Analytics → Benchmarks → People & Gov → Export.**

### 5.1 His dashboard

Say:

"Finally, the **Admin** — the head-office, leadership view. I'm logged in as Hitesh.

His dashboard opens with a **hero KPI row**: total emissions, energy, water, and waste for the period, each with the change versus the previous period. Headline numbers in ten seconds, without clicking anywhere.

Next to it — and this is something I really like — the **Data Quality panel**. It shows the percentage of entries submitted and approved, plus a list of **missing facility-and-metric combinations**. Why does that matter? Because a dashboard is **misleading if the underlying data is incomplete**. This surfaces the gaps *before* anyone exports a report — not in front of the board."

### 5.2 Analytics

Say:

"The **Analytics page** is the full picture. Everything on this page is driven by the **Report filters** at the top — change the period or the facility once, and every chart and KPI below updates together. No mismatched date ranges between panels.

Scrolling down:

- The **KPI cards** again — emissions, energy, water, waste.
- **Environmental performance** — CO₂e emissions trending over time. That's the number regulators and investors care about most, so it gets the most prominent chart.
- A **metric trend panel** — where you can pick *any* metric from the catalogue and see its trend.
- The **GHG stacked chart** next to a **facility comparison chart** — and that comparison answers the key management question: *which site is driving this number?*
- **Target status** with RAG badges, plus a quick compare panel of what's over and under target.
- And the **data quality panel** again at the bottom — the final check before exporting.

One thing I want to be upfront about: there is **no AI in this PoC**. Every number is a transparent, rule-based calculation — sums over approved entries, compared against configured targets. That's deliberate — it keeps the platform fully **explainable and auditable**."

### 5.3 Benchmarks (admin only)

Say:

"**Benchmarks** is admin-only. Pick any metric on the left — water, energy, emissions — and the platform **ranks all facilities against each other**, with a chart and ranking cards.

This is how leadership finds the best and worst performing sites for the same KPI. The use case is capital allocation and sharing best practices — if Plant A uses a third of the water Mine Site C uses, let's find out what they're doing right and transfer it."

### 5.4 People & Governance

Say:

"ESG isn't only environmental. The **People & Governance** page covers the S and the G: safety — that's **LTIFR**, lost-time injury frequency rate — training hours, workforce diversity, community spend, and then governance metrics like compliance incidents and audit findings.

Each card shows the period total, the month-over-month direction, and a mini trend chart. These metrics are lower volume but **high severity** — even one compliance incident matters — so they get their own dedicated page instead of being buried under environmental charts."

### 5.5 Export — the payoff

Say:

"And now the payoff. *(pause)* **Export Report.**

One click produces an Excel workbook for the selected period and facilities — a **Summary sheet** with the KPIs and the target RAG status, and a **Details sheet** with every single underlying entry.

This is the document that today takes teams **weeks** of consolidating spreadsheets. Here it's generated in **seconds** — from data that has already been validated, approved, and locked. So every number in this file is traceable back to **who entered it, who approved it, and when**."

---

## PART 6 — The Closing

**Anchor: recap the three roles in one breath, then the trust line.**

Say:

"So to recap the full journey:

A **Data Entry user** records a reading through a guided wizard — validated, saved as draft, then submitted.

An **Auditor** — a different person, by design — reviews, approves, and locks it. Locked data is immutable, with a complete audit trail.

And an **Admin** sees everything — KPIs, trends, benchmarks, data quality — and exports an audit-ready report in one click, but **cannot change a single number**. And honestly, that limitation is the feature — it's exactly why the report can be trusted.

*(pause)*

What you've seen is a working proof of concept — honest about its scope. No AI, manual entry today, with a clear roadmap: BRSR and GRI report templates, automatic emission-factor calculations, SAP and meter integrations, and anomaly detection.

But the foundation it solves first is the hard part: **one trusted source of ESG truth**. Thank you."

---

## CHEAT SHEET — for last-minute revision

### The skeleton (memorize this list and you can't get lost)

1. **Problem** — Excel + email → no truth, no trail, slow reports
2. **Idea** — 3 roles, entry ≠ certification, enforced at API
3. **Data Entry** — dashboard → 3-step wizard → draft → edit → submit → read-only
4. **Auditor** — queue → approve (can't edit!) → lock (immutable!) → targets/RAG
5. **Admin** — KPIs → data quality → analytics (filters drive everything) → benchmarks → people & gov → **export**
6. **Close** — recap 3 roles + "trusted source of ESG truth"

### Numbers to have ready

| Fact | Value |
| ---- | ----- |
| Workflow | draft → submitted → approved → locked |
| RAG rules | green = at/below target, amber = up to +10%, red = over +10% |
| Demo data | 3 facilities, 12+ metrics, 12 months of 2025 entries |
| Stack | React + Express + Prisma; SQLite for PoC, MySQL for production (one-line switch) |
| Export | Excel: Summary sheet + Details sheet |
| Best demo period | **Annual (2025)** — gives the best RAG variety |

### Login credentials (keep off-screen)

| Role | Email | Password |
| ---- | ----- | -------- |
| Data Entry | rahul.sharma@esgmeteor.in | entry123 |
| Auditor | shresht.gupta@esgmeteor.in | audit123 |
| Admin | hitesh.singh@esgmeteor.in | admin123 |

### If someone asks a hard question

- **"Is there AI?"** → "No — deliberately. Everything is rule-based and explainable. Anomaly detection and forecasting are on the roadmap."
- **"Is this BRSR/GRI certified output?"** → "Today it's an audit-ready Excel; regulatory templates are on the roadmap."
- **"Why SQLite?"** → "PoC convenience only. Production is MySQL — it's a one-line change in the Prisma config, same schema, same queries."
- **"Can the admin fix a wrong number?"** → "No — and that's intentional. Admins are read-only, and locked records are immutable for everyone. The workflow is the only path, and that's what makes the data defensible."
- **"Is this production-ready?"** → "It's a working proof of concept. The pilot is the ask."

### Phrases that make you sound confident (use them)

- "…and that's **deliberate**."
- "This isn't just hidden buttons — it's **enforced at the API level**."
- "A locked record is immutable — **not even the admin** can change it."
- "Every number is **traceable back to who entered it, who approved it, and when**."
- "The limitation **is** the feature."
