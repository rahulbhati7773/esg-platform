# ESG Meteor — Video Demo Walkthrough Script

**Format:** Screen recording with voice-over, walking through the app **role by role**
**Total runtime target:** ~10–12 minutes
**App:** ESG Meteor PoC (Problem statement #25 — Centralized ESG data platform)

---

## Before you hit record (prep checklist)

- [ ] API running on `:5000` (`cd api && npm run dev`) — verify `curl http://localhost:5000/health` returns `{"status":"ok"}`
- [ ] Web running on `:5173` (`cd web && npm run dev`)
- [ ] Database freshly seeded (`npm run prisma:seed`) so all charts are populated
- [ ] Browser zoomed to a readable level (110–125%), bookmarks bar hidden, no extra tabs
- [ ] Log out of any existing session (or use a fresh incognito window)
- [ ] Keep this credentials cheat-sheet off-screen:


| Role       | Email                        | Password   |
| ---------- | ---------------------------- | ---------- |
| Data entry | `rahul.sharma@esgmeteor.in`  | `entry123` |
| Auditor    | `shresht.gupta@esgmeteor.in` | `audit123` |
| Admin      | `hitesh.singh@esgmeteor.in`  | `admin123` |


> **Demo tip:** When you reach any analytics view, set the period to **Annual (2025)** — the seed data covers 2025, and annual targets give the best RAG (red/amber/green) variety.

---

## Scene 0 — Opening (≈ 45 seconds)

**On screen:** Login page of ESG Meteor (don't log in yet).

**Say:**

> "Hi, this is a walkthrough of **ESG Meteor** — a centralized platform for capturing, validating, and reporting ESG data: Environmental, Social, and Governance metrics.
>
> Today, this data usually lives in scattered Excel sheets and email threads. There's no audit trail, no approval process, and consolidating it for board or BRSR reporting takes weeks.
>
> ESG Meteor solves that with one platform: structured data entry, a **draft → submit → approve → lock** workflow, live dashboards, and one-click audit-ready Excel exports.
>
> The platform has **three roles** — a **Data Entry user** at the site level, an **Auditor** who reviews and certifies data, and an **Admin** with full leadership visibility. I'll walk through each role one by one, in the same order data flows through the system."

---

## Scene 1 — Login page & roles (≈ 30 seconds)

**On screen:** Hover over the three role cards on the login screen (Data Entry / Auditor / Administrator).

**Say:**

> "This is the login screen. For the demo, we have three personas — one per role. Clicking a role card auto-fills the demo credentials.
>
> Notice the separation: the person who **enters** the data is never the same person who **certifies** it. That segregation of duties is enforced everywhere — in the UI and at the API level.
>
> Let's start where the data starts — with the Data Entry user."

**Action:** Click the **Data Entry** role card → sign in as Rahul Sharma.

---

## Scene 2 — ROLE 1: Data Entry user (≈ 3 minutes)

### 2.1 Data Entry Dashboard (`/dashboard`)

**On screen:** Data Entry home page after login.

**Say:**

> "I'm now logged in as **Rahul**, a site-level data entry specialist — think of an environment or EHS officer at a plant or mine.
>
> His dashboard is built for daily work, not analytics. At the top, status count cards show how many of his entries are in **Draft**, **Submitted**, **Approved**, and **Locked** — so he instantly knows what's still pending on his side.
>
> Below that is a **New Entry** shortcut — the most common action for this role — and a list of his recent entries for a quick sanity check."

### 2.2 New Entry Wizard (`/entries/new`)

**Action:** Click **New Entry** to open the 3-step wizard.

**Say:**

> "Creating a new reading is a guided three-step wizard, which reduces errors compared to one long form.
>
> **Step one** — pick the facility and the metric. Notice the metrics come from a **controlled catalogue**, grouped into Environmental, Social, and Governance, each with its unit. Users can't invent random columns like in a spreadsheet."

**Action:** Select a facility (e.g. Plant A) and a metric (e.g. Water – kL). Click Next.

> "**Step two** — the reporting period and the value. Dates are validated — the end date can't be before the start — and the value must be numeric. There are optional fields for the data source and who recorded it."

**Action:** Enter a period (a month in 2025) and a plausible value. Click Next.

> "**Step three** — review and confirm. The record is saved as a **draft** — it is *not* yet part of official reporting. Submitting is a deliberate, separate action."

**Action:** Confirm → entry created as draft.

### 2.3 My Entries (`/entries`) — edit & submit

**Action:** Go to **My Entries**. Point to the new draft row.

**Say:**

> "Here's the entry we just created, in **draft** status. While it's a draft, Rahul can still **edit** the value — say he typed it wrong, he fixes it here, and every change is written to an **audit log** with the old and new value, who changed it, and when.
>
> When he's confident, he clicks **Submit**."

**Action:** (Optionally edit the value once to show the inline form.) Click **Submit** on the draft → status badge changes to **submitted**.

> "Once submitted, the record becomes **read-only for him**. He cannot approve his own data — that's the auditor's job. And these aren't just hidden buttons: if his role tries a forbidden action against the API directly, it's rejected with a 403.
>
> That's the data entry role. Let's switch to the person who reviews this data."

**Action:** Log out.

---

## Scene 3 — ROLE 2: Auditor (≈ 3 minutes)

### 3.1 Auditor Dashboard — the approval queue

**Action:** Log in as **Shresht Gupta** (Auditor).

**Say:**

> "Now I'm logged in as **Shresht**, the auditor — typically corporate sustainability or internal audit.
>
> His home page is an **approval queue**, not a data entry screen. At the top: how many entries are **awaiting approval** and how many approved entries are **awaiting lock**. The two-column queue below separates those two jobs so nothing is missed."

### 3.2 Approve

**Action:** In the **Needs Approval** column, find the entry Rahul just submitted. Click **Approve**.

**Say:**

> "Here's the entry Rahul submitted a minute ago. The auditor reviews the facility, metric, value, and period — and approves it. Status moves to **approved**.
>
> Important: the auditor **cannot edit the value** and **cannot create entries**. If the number looks wrong, the process is to reject it back through the workflow — the auditor never silently 'fixes' data. Every status change is also recorded in the audit trail."

### 3.3 Lock

**Action:** In the **Needs Lock** column, click **Lock** on an approved entry.

**Say:**

> "The final step is **Lock**. A locked record is **immutable** — nobody can edit it, not even an admin, and this is enforced at the API, not just in the interface. This is what makes the data defensible in front of an external auditor or regulator: validated at entry, approved by a separate person, and sealed with a full change history."

### 3.4 Targets & Analytics (auditor view)

**Action:** Open **Targets** from the sidebar. Set period to **Annual (2025)**.

**Say:**

> "Auditors also get the **Targets & Compliance** page. At the top, a compliance score — what percentage of targets are being met — and counts of metrics that are **on track**, **at risk**, or **off track**.
>
> Below, each metric breaks down per facility: actual vs target, a progress bar, and a **RAG status** — green means on target, amber means up to 10% over, red means more than 10% over. So leadership sees not just the numbers, but which site missed which commitment.
>
> Now let's look at the role that sees everything — the Admin."

**Action:** Log out.

---

## Scene 4 — ROLE 3: Admin (≈ 4 minutes)

### 4.1 Admin Dashboard

**Action:** Log in as **Hitesh Singh** (Admin).

**Say:**

> "Finally, **Hitesh**, the platform administrator — the head-office or leadership view.
>
> His dashboard opens with a **hero KPI row**: total emissions, energy, water, and waste for the period, each with the change versus the previous period. Headline numbers without clicking anywhere.
>
> Next to the quick links is the **Data Quality panel** — the percentage of entries submitted and approved, plus a list of **missing facility-and-metric combinations**. This is critical: a dashboard is misleading if the underlying data is incomplete, and this surfaces gaps *before* anyone exports a report."

### 4.2 Analytics (`/analytics`)

**Action:** Go to **Analytics**. In **Report filters**, set period to **Annual (2025)**. Scroll slowly through the page as you narrate.

**Say:**

> "The Analytics page is the full picture. Everything here is driven by the **Report filters** at the top — change the period or facility once, and every panel updates together.
>
> - The **KPI cards** again — emissions, energy, water, waste with period-over-period change.
> - **Environmental performance** — CO₂e emissions trending over time, the number regulators and investors care about most.
> - The **metric trend panel** — pick *any* metric from the catalogue and see its trend.
> - The **GHG stacked chart** alongside **facility comparison** — which answers the key management question: *which site is driving this number?*
> - **Target status** with RAG badges, and a quick **compare metrics** scan of what's over and under target.
> - And the **data quality panel** again at the bottom.
>
> One thing I want to be upfront about: there is **no AI in this PoC**. Every number here is a transparent, rule-based calculation — sums over approved entries, compared against configured targets. That's deliberate: it keeps the platform fully **explainable and auditable**."

### 4.3 Facility Benchmarks (`/benchmarks`) — admin only

**Action:** Open **Benchmarks**. Click through 2–3 metrics in the left selector.

**Say:**

> "**Benchmarks** is admin-only. Pick any metric on the left — water, energy, emissions — and the platform ranks all facilities against each other, with a chart and ranking cards.
>
> This is how leadership finds the best and worst performing sites for the same KPI — useful for capital allocation and sharing best practices between sites."

### 4.4 People & Governance (`/social`)

**Action:** Open **People & Gov**.

**Say:**

> "ESG isn't only environmental. The **People & Governance** page covers the S and the G: safety — that's LTIFR, lost-time injury frequency — training hours, workforce diversity, and community spend; then governance metrics like compliance incidents and audit findings. Each card shows the period total, the month-over-month direction, and a mini trend."

### 4.5 Export Report (the payoff)

**Action:** Go back to **Analytics** (or Dashboard), confirm period is **Annual (2025)**, click **Export Report**. Open the downloaded Excel and show both sheets briefly.

**Say:**

> "And the payoff: **Export Report**. One click produces an Excel workbook for the selected period and facilities — a **Summary sheet** with the KPIs and target RAG status, and a **Details sheet** with every underlying entry.
>
> This is the document that today takes teams **weeks** of consolidating spreadsheets. Here, it's generated in seconds from data that has already been validated, approved, and locked — so every number in this file is traceable back to who entered it, who approved it, and when."

---

## Scene 5 — Closing (≈ 1 minute)

**On screen:** Return to the app dashboard (or a slide with the workflow diagram).

**Say:**

> "To recap the full journey:
>
> 1. A **Data Entry user** at the site records a reading through a guided wizard — validated, saved as draft, then submitted.
> 2. An **Auditor** — a different person, by design — reviews, approves, and locks it. Locked data is immutable, with a complete audit trail.
> 3. An **Admin** sees everything: KPIs, trends, facility benchmarks, social and governance metrics, data quality — and exports an audit-ready Excel report in one click.
>
> What you saw is a **working proof of concept**: honest about its scope — no AI, manual entry today — with a clear roadmap: BRSR and GRI report templates, emission-factor calculations, SAP and meter integrations, and anomaly detection on readings.
>
> The foundation it solves first is the hard part: **one trusted source of ESG truth**. Thanks for watching."

---

## Timing summary


| Scene | Content                                                     | Target time |
| ----- | ----------------------------------------------------------- | ----------- |
| 0     | Opening — problem & solution                                | 0:45        |
| 1     | Login & three roles                                         | 0:30        |
| 2     | Data Entry: dashboard → wizard → submit                     | 3:00        |
| 3     | Auditor: queue → approve → lock → targets                   | 3:00        |
| 4     | Admin: dashboard → analytics → benchmarks → social → export | 4:00        |
| 5     | Closing recap                                               | 1:00        |
|       | **Total**                                                   | **~12:15**  |


**To cut to ~8 minutes:** trim Scene 4 — show Analytics and Export only; mention Benchmarks and People & Gov in one sentence each while briefly flashing the pages.

---

## Things NOT to say on camera (consistency with Q&A prep)

- Don't claim AI/ML — all calculations are rule-based (if asked: anomaly detection and forecasting are roadmap).
- Don't claim BRSR/GRI/CDP certified output — say "audit-ready Excel today, regulatory templates on the roadmap."
- Don't claim production deployment — this is a PoC; the pilot is the ask.
- Don't defend SQLite — it's PoC convenience; production is MySQL via a one-line Prisma switch.
- Don't say admins can edit data — admins are read-only on entries in this demo, and locked records are immutable for everyone.

