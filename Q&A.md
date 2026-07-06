# ESG Meteor — Meeting Q&A Prep

**Meeting:** Video conference  
**Date & time:** 10 June 2026, 6:00 PM  
**Duration:** ~30 minutes  
**Attendees (expected):** RSP team, NMDC officers (problem statement aligns with NMDC ESG / sustainability reporting needs)

**Purpose of this document:** Questions you should ask, questions they are likely to ask (business-level, PSU context), and ready answers grounded in the current **ESG Meteor** PoC.

---

## Client Grill-Mode — Hostile evaluation prep (ESG Meteor #25)

*Adapted from the portfolio-wide Client Grill-Mode Questionnaire. These are the hard, probing questions a sharp client / technical panel uses to find weak spots. Each entry: what they're really testing → our answer → trap to avoid.*

### Golden rules before you walk in

1. **Never quote accuracy or compliance you haven't measured on their data.** Commit to pilot-measured data quality and reporting cycle time — not invented “98% accuracy” or “BRSR-certified.”
2. **Admit the limit, then show the path.** “Today the PoC does X; production adds Y in phase 2” beats pretending there are no gaps.
3. **Turn gotchas into pilot scope.** Every “but what about edge case Z?” → “exactly what the pilot measures.”
4. **Separate what's built from what's designed.** Be precise: **PoC-complete** vs **roadmap**. Mixing them destroys credibility.
5. **Know your weakest point** — and have the honest answer ready before they ask (see below).

### Weakest point to pre-empt

**“Where’s the AI?”** — This is a **data and workflow platform**, not an ML model. It is only as trustworthy as the data entered. Own both upfront.

---

### Cross-cutting killer questions (expect these — ESG answers)

#### Q. Where is this running in production today?

| | |
| - | - |
| **Probing** | Are you selling vapourware or proven software? |
| **Answer** | ESG Meteor is a **working PoC**, demoable end-to-end, engineered for a **pilot** (e.g. one site, one reporting cycle). We are **not** claiming a live production rollout at RSP/NMDC today — the pilot is the ask, and it produces the baseline (data quality %, time-to-report, audit trail) you take upstairs. |
| **Avoid** | Implying a deployment already exists at a mine or corporate HQ. |

#### Q. What's your model's accuracy and false-positive rate?

| | |
| - | - |
| **Probing** | Will you over-claim AI performance? |
| **Answer** | **There is no AI model in this PoC.** KPIs, trends, and RAG (red/amber/green) are **rule-based** (sums over entries, compare to configured targets). What we *do* measure in a pilot is **data quality**: % submitted, % approved, missing facility×metric gaps, and time to produce an audit-ready export — against your current Excel/manual baseline. |
| **Avoid** | Dressing up dashboards as “AI accuracy” or quoting a fake precision %. |

#### Q. What data was the model trained on, and who owns it?

| | |
| - | - |
| **Probing** | Data provenance, IP, and lock-in. |
| **Answer** | **No model training** in this PoC. **You own** all ESG data entered into the platform. Demo seed data is synthetic; pilot/production data stays in **your database** under your infrastructure policy. We do not send your readings to a third-party AI vendor. |
| **Avoid** | Vagueness — or implying we train on your data. |

#### Q. How many cameras / sensors / assets can it handle?

| | |
| - | - |
| **Probing** | Scale realism. |
| **Answer** | ESG Meteor is built for **multi-facility** (mines, plants, offices) and **many metrics** (environmental, social, governance). PoC demo: 3 facilities, 12 metrics, 12 months of entries. Production scales on standard **MySQL** + app servers — sized in pilot based on your site count and entry volume. **Meter/SCADA/SAP ingest** is roadmap; today is manual entry + optional bulk import in pilot. |
| **Avoid** | “Unlimited” with no sizing discussion. |

#### Q. How many of our problem statements can one platform cover?

| | |
| - | - |
| **Probing** | Value density across the portfolio. |
| **Answer** | ESG Meteor directly addresses **#25** (centralized ESG capture). The same **data shell** can extend to **~12 related sustainability / reporting statements** by adding metric catalogues, targets, and integrations — without rebuilding from scratch. We can show the reuse map if the panel asks about the wider portfolio. |
| **Avoid** | Claiming it solves unrelated CV/GPS problems without clarification. |

#### Q. What happens when the AI is wrong?

| | |
| - | - |
| **Probing** | Operational safety and trust. |
| **Answer** | **No autonomous AI decisions.** Humans enter data; **auditors approve and lock** records. Wrong numbers are caught by validation (bad dates, missing fields), workflow (review before lock), and the **audit log** (who changed what). Locked records cannot be edited via the API — not just hidden in the UI. |
| **Avoid** | Suggesting the system certifies data without human approval. |

#### Q. Who maintains the models, and what about drift?

| | |
| - | - |
| **Probing** | Lifecycle, not just demo. |
| **Answer** | **No ML models to maintain** in PoC. Ongoing ownership is **master data** (facilities, metrics, targets, emission factors when added) and **access roles** — typically your sustainability/IT team with our support. **Roadmap:** anomaly detection on readings would include a defined retrain/monitor cadence in a future SOW — not part of today’s build. |
| **Avoid** | Promising “AI drift monitoring” for a non-AI product. |

#### Q. Why you, not an off-the-shelf product?

| | |
| - | - |
| **Probing** | Differentiation. |
| **Answer** | **Reuse** across PSU problem statements on one stack; **on-prem / hybrid** data control (site entry + corporate aggregation); **India-context** metric catalogues and workflows (BRSR-oriented roadmap); **you get the codebase and schema**, not a black-box SaaS lock-in. Built for mining-style multi-site reporting, not a generic spreadsheet replacement. |
| **Avoid** | Trash-talking vendors without naming what you do better concretely. |

---

### ESG Meteor — Grill-mode questions (#25)

#### The “where’s the AI” challenge

**Q. This is just forms and dashboards. What's the AI here?**

| | |
| - | - |
| **Probing** | Don't oversell. |
| **Answer** | **Correct** — the PoC’s value is a **single source of truth**, validation, workflow, and **audit-ready reporting**; it intentionally has **no ML**, which is why it’s **low-risk and fast to pilot**. AI enters on the **roadmap**: auto emission-factor calculation, **anomaly detection** on readings, and intensity-metric forecasting. We won’t dress up CRUD as AI. |
| **Avoid** | Inventing an “AI” angle that isn’t there. |

#### Data integrity & audit

**Q. If humans type the numbers, how do I trust the data?**

| | |
| - | - |
| **Probing** | Garbage in, garbage out. |
| **Answer** | **Structured validation** (Zod, shared front/back) rejects bad input; **draft → submitted → approved → locked** workflow with **role separation** (data-entry can’t approve; auditor can’t enter values); and a full **audit log** of every create/edit/status change with old/new values. Locked records are **immutable** at the API. |
| **Avoid** | Claiming the platform “guarantees” correct readings without process. |

**Q. Who can change an approved/locked number, and is it traceable?**

| | |
| - | - |
| **Probing** | Audit defensibility. |
| **Answer** | **No one edits a locked record** — blocked at the API (**403**), not just the UI. Every prior change is in the **audit trail** with user and timestamp. Formal unlock/restatement policy is defined in pilot SOW if regulators require it. |
| **Avoid** | “Admins can silently edit anything.” |

**Q. How do you prevent double-counting across sites/periods?**

| | |
| - | - |
| **Probing** | Classic ESG reporting failure. |
| **Answer** | Data is keyed by **facility × metric × period** with a defined period model; the **data-quality panel** surfaces missing and overlapping combinations before reporting. Consolidation rules for group reporting are agreed in pilot with your sustainability team. |
| **Avoid** | Hand-waving “the database prevents duplicates” without explaining period overlap logic. |

#### Methodology & compliance

**Q. Emission factors and Scope 1/2/3 methodology — whose standard?**

| | |
| - | - |
| **Probing** | Regulatory credibility. |
| **Answer** | PoC stores **measured values** you enter. **Roadmap:** configurable **emission-factor tables** (fuel/electricity → CO₂e). **Methodology is set with your sustainability team**, not hard-coded by us. |
| **Avoid** | Claiming we implement IPCC/BRSR methodology inside the PoC today. |

**Q. Does it produce BRSR / GRI / CDP-compliant output?**

| | |
| - | - |
| **Probing** | Regulatory fit. |
| **Answer** | Today it exports **audit-ready Excel** (summary KPIs + RAG vs targets + detailed entries). **Mapping to BRSR/GRI/CDP templates** is a **roadmap** item — straightforward because the data model already captures underlying metrics. |
| **Avoid** | Claiming certified regulatory compliance now. |

#### Scale, integration, security

**Q. SQLite in the demo? That won't scale.**

| | |
| - | - |
| **Probing** | Production readiness. |
| **Answer** | SQLite is **PoC convenience only** — Prisma switches to **MySQL** for production with a **one-line datasource change**, no query rewrites. **Hybrid deployment:** sites enter locally, cloud aggregates for group reporting. |
| **Avoid** | Defending SQLite as the production database. |

**Q. Can it pull from SAP / meters / SCADA instead of manual entry?**

| | |
| - | - |
| **Probing** | Operational realism at mines. |
| **Answer** | **Yes — roadmap ingestion adapters**; manual forms are the **floor**, not the ceiling. ERP/meter ingest is **designed into the architecture**; pilot usually starts manual + Excel import, then automates high-volume streams. |
| **Avoid** | Implying live SAP/SCADA feeds exist in the demo. |

**Q. Multi-site, role-based access, SSO?**

| | |
| - | - |
| **Probing** | Enterprise IT bar. |
| **Answer** | **Role-based access enforced server-side today** (`X-App-Role` + `entryPermissions`); production swaps demo auth for **JWT + RBAC/SSO** (LDAP/AD). **Multi-facility** is already in the data model and UI. |
| **Avoid** | Saying “SSO is done” when only demo login exists. |

---

### Five answers you must nail (memorize — ESG Meteor)

| # | If they ask… | Say this |
| - | ------------ | -------- |
| 1 | **Accuracy / AI** | “No AI in this PoC — we measure **data quality and reporting time** in the pilot against your baseline, not a fake accuracy %.” |
| 2 | **Trust in numbers** | “**Validation + workflow + audit log + lock** — auditors approve; locked data can’t be edited at the API.” |
| 3 | **Your data / training** | “**No model training** — you own the data in your DB; we don’t send it to third-party AI.” |
| 4 | **Scale** | “**Multi-facility MySQL** in production; PoC uses SQLite locally — sizing validated in pilot.” |
| 5 | **Scope honesty** | “**Built:** capture, workflow, dashboards, Excel export. **Roadmap:** BRSR templates, SAP/SCADA, emission factors, anomaly detection.” |

> **Whoever holds the line on honesty wins the technical evaluation. Over-claiming loses it.**

*Portfolio context: same grill-mode framework applies to PlateWatch (#19), PPE (#23), and Rake GPS — see portfolio master doc. This file is **ESG Meteor only**.*

---

## How to use this in 30 minutes

| Block | Time | Focus |
| ----- | ---- | ----- |
| Opening | 3 min | Problem (#25), one-line solution, demo offer |
| Their questions | 12–15 min | **Grill-Mode** (top) if technical/hostile; **Section 3** below for business-friendly answers |
| Your questions | 10–12 min | Pick **5–7** from **Section 2** (prioritized list at top) |
| Next steps | 3 min | Pilot scope, data owners, timeline |

**Tip:** Lead with *business outcomes* (single source of truth, audit trail, faster reporting). Mention technology only when asked.

---

## Section 1 — Quick pitch (memorize)

> **Problem:** ESG data is scattered in spreadsheets and emails — no central platform, weak audit trail, slow consolidation for BRSR / board / investor reporting.  
> **Solution:** ESG Meteor captures facility-level Environmental, Social, and Governance metrics in one place, validates input, runs **draft → submit → approve → lock** workflow, shows dashboards (KPIs, trends, target RAG), and exports **Excel** reports.  
> **For mining / PSU context:** Same platform covers emissions, energy, water, waste, safety (LTIFR), training, community spend, and governance incidents — per mine/plant/site.  
> **Today’s build:** Working proof-of-concept (PoC), not production-hardened. **No AI/ML in the current demo** — calculations are rule-based (sums, targets, RAG thresholds).

---

## Section 2 — Questions YOU should prepare to ask

### Priority (ask these if time is short)

| # | Question | Why you ask |
| - | -------- | ----------- |
| 1 | **Which ESG metrics are mandatory for you today** (BRSR, MoEFCC, SEBI, internal board)? | Ensures catalogue matches RSP/NMDC reporting, not generic demo metrics |
| 2 | **How many sites/facilities** need to report (mines, plants, offices)? | Sizes rollout, hybrid sync, and facility model |
| 3 | **Who enters data vs who approves** at each site? | Maps to data-entry / auditor roles and workflow |
| 4 | **What do you use today** (Excel, SAP, EMS, manual forms)? | Defines integration and change-management |
| 5 | **What is your reporting calendar** (monthly ops, quarterly management, annual BRSR)? | Drives period presets and export timing |
| 6 | **Must data stay on-premise / air-gapped**, or is cloud aggregation acceptable for group reporting? | Architecture doc assumes **hybrid** — confirm with NMDC |
| 7 | **What would success look like in a 3-month pilot** — one site, one reporting cycle, one export? | Keeps scope realistic for PoC → pilot |

### Data & operations

| # | Question |
| - | -------- |
| 8 | Do you already have **annual targets** per metric per site (e.g. water use, emissions)? |
| 9 | Do you need **supporting documents** (bills, meter readings) attached to each entry? *(PoC: optional text “source” field only; file upload is roadmap.)* |
| 10 | Are **emission factors** (fuel → CO₂e) maintained centrally, or entered as final tonnes only? |
| 11 | How do you handle **restatements** when a prior month’s number was wrong? *(PoC: edit draft only; locked = sealed.)* |
| 12 | Is **multi-company / group consolidation** needed (RSP + subsidiaries + NMDC group view)? |

### Governance & compliance

| # | Question |
| - | -------- |
| 13 | Who are the **auditors** — internal sustainability, corporate audit, third-party assurance? |
| 14 | Do you need **role-based access** aligned to LDAP/Active Directory or government SSO? *(PoC: demo login only.)* |
| 15 | Any **data retention / legal hold** requirements for locked records? |
| 16 | Should exports map to a **specific BRSR / GRI template**, or is summary + detail sheet enough for now? |

### NMDC alignment (since they are on the call)

| # | Question |
| - | -------- |
| 17 | Which **NMDC metrics** overlap with RSP so we can use one catalogue where possible? |
| 18 | Is the goal a **shared PSU pattern** (one platform, many enterprises) or RSP-specific customization? |
| 19 | Are there **existing NMDC standards** for mine-level water, tailings, rehabilitation, or community CSR we must encode? |

### Commercial & rollout

| # | Question |
| - | -------- |
| 20 | After PoC, is the path **pilot at one mine → roll out to all sites**, or big-bang? |
| 21 | Who will be the **product owner** on your side for metric definitions and target updates? |
| 22 | Training: do site users need **Hindi/regional language** UI or English-only is acceptable? |

---

## Section 3 — Questions they may ask YOU (with answers)

### A. AI / ML (asked in previous meeting)

#### Q1. What AI model do you use?

**Answer:**  
The **current PoC does not use any AI or machine-learning model**. ESG Meteor is a **structured data platform**: forms, database, business rules, dashboards, and exports. KPIs, trends, and red/amber/green (RAG) status are calculated with **fixed formulas** (for example: sum entries for a period; compare actual to target; green if on target, amber if slightly over, red if far over).

**If they want “AI” later:** We can add optional modules on the roadmap — anomaly detection (unusual readings), smart data quality hints, or assisted mapping to BRSR/GRI — but those are **not in today’s demo** and would need their data and approval as a separate phase.

---

#### Q2. Do you train AI on our data?

**Answer:**  
**No.** We are **not training** any model on your data in this solution. Your ESG numbers stay in **your database** (on your servers or your chosen cloud). Nothing is sent to a third-party AI vendor for training in the current design.

If AI features are added in future, we would propose **on-premise or private deployment** options and a clear data-processing agreement — especially important for PSUs.

---

#### Q3. Is this an AI product?

**Answer:**  
It is an **ESG data management and reporting product**. AI is **not required** to solve the core problem (#25): centralized capture, validation, audit trail, and dashboards. That keeps the solution **explainable and auditable** — which regulators and internal audit teams prefer.

---

### B. Data storage & security

#### Q4. How do you store data?

**Answer (simple):**  
Data is stored in a **relational database** — like a structured enterprise system, not in Excel files on the app server.

| Layer | PoC (demo) | Production (planned) |
| ----- | ---------- | -------------------- |
| Database | SQLite file on server | **MySQL** (industry-standard, reporting-friendly) |
| Structure | Tables for facilities, metrics, entries, targets, **audit log** | Same schema |
| Access | REST API between web UI and database | Same, with proper login in production |

Every entry stores: **which site, which metric, value, period, who entered it, status** (draft/submitted/approved/locked). Every change can be recorded in an **audit table** (who changed what and when).

---

#### Q5. Where does data physically sit — cloud or our premises?

**Answer:**  
Architecture supports **hybrid deployment**, which suits mining PSUs:

- **Site level:** Users enter data at mine/plant (can be on-premise server or local network).
- **Corporate level:** Aggregated data syncs to a **central reporting** database for group dashboards and annual reports.

For the PoC, everything runs on a **single machine** for demo. Production location (NMDC data centre, RSP DC, or private cloud) is a **deployment decision**, not a product limitation.

---

#### Q6. Can other companies or vendors see our data?

**Answer:**  
**Not by design.** In production, the database and application run under **your infrastructure and access controls**. The PoC uses demo logins only; production would use **organization login (SSO/LDAP)** and role-based permissions (data entry, auditor, admin).

---

#### Q7. What happens if someone changes a number after approval?

**Answer:**  
Workflow is: **Draft → Submitted → Approved → Locked**.

- Data-entry users edit only **draft** records.
- After submit, **auditors** approve, then **lock**.
- **Locked** records should not be edited without a formal **reopening process** (to be defined in pilot — e.g. admin-only unlock with audit reason).

The system keeps an **audit trail** of creates, updates, and status changes.

---

### C. How the platform helps RSP / NMDC

#### Q8. How does this help us? What problem does it solve?

**Answer:**

| Pain today | How ESG Meteor helps |
| ---------- | -------------------- |
| Data in many Excel files | **One platform** per facility and metric |
| No standard approval process | **Workflow**: submit → approve → lock |
| Hard to prove data lineage | **Audit log** + entered-by + timestamps |
| Slow board / BRSR preparation | **Dashboards** + one-click **Excel export** |
| Don’t know if targets are met | **Target vs actual** with **RAG** (green/amber/red) |
| Missing data discovered late | **Data quality panel** (% submitted/approved, gaps) |

For **mining**, typical metrics already in the demo catalogue include: CO₂e, energy, water, waste, safety (LTIFR), training, community spend, compliance incidents — aligned with environmental and social reporting expectations.

---

#### Q9. How is this different from Excel?

**Answer:**  
Excel is flexible but **not a system of record** for regulated ESG data: weak access control, easy accidental edits, no enforced workflow, hard multi-site consolidation. ESG Meteor adds **validation at entry**, **role-based actions**, **locked approved data**, and **live dashboards** without manual pivot tables.

---

#### Q10. Can leadership see all mines in one view?

**Answer:**  
**Yes.** Admin/analytics views support **all facilities** or filter by site. Charts include **facility comparison** (which mine is driving emissions/water/etc.) and **period filters** (month, quarter, year, custom range).

---

#### Q11. Does it support BRSR / GRI / CDP?

**Answer:**  
The PoC provides **structured metrics, periods, and Excel export** (summary + detail). **Auto-filled regulatory templates** (BRSR sections, GRI index) are **roadmap** — we need your exact disclosure format in a pilot to map fields. The hard part — **trusted underlying data** — is what the platform solves first.

---

### D. New data, metrics, and scale

#### Q12. How can we handle new data (new metrics, new sites, new months)?

**Answer:**

| Need | How it works |
| ---- | ------------ |
| **New monthly readings** | Data-entry user: **New entry** wizard → pick facility, metric, period, value → save draft → submit |
| **New facility (mine/plant)** | Add to **facility master** (admin/IT); then appears in all forms and reports |
| **New metric** | Add to **metric catalogue** with unit and E/S/G category (e.g. new water parameter) |
| **New targets** | Configure target value per metric/facility/year for RAG comparison |
| **Bulk historical load** | Pilot phase: import script or Excel template (not self-service in PoC UI yet) |

**Business rule:** Only **approved catalogue metrics** appear in forms — prevents “random columns” like uncontrolled spreadsheets.

---

#### Q13. Can we connect to SAP / SCADA / meters automatically?

**Answer:**  
**Not in the current PoC** — data is **manual entry** through the web form. **Auto-ingest** from meters, SCADA, or ERP is on the **roadmap** (architecture doc lists SAP/SCADA integration as production enhancement). Pilot usually starts with **manual + Excel import**, then automates high-volume streams.

---

#### Q14. How many users and sites can it handle?

**Answer:**  
The stack (React + Node + MySQL) is standard for **hundreds of sites and thousands of entries per month**. Exact sizing depends on deployment and reporting load; not a concern for PoC scale (3 demo facilities, 12 metrics, 12 months seeded).

---

### E. Roles, process, and demo

#### Q15. Who does what in the system?

**Answer:**

| Role | Typical person | Can do |
| ---- | -------------- | ------ |
| **Data entry** | Site EHS / environment officer | Create entries, edit drafts, **submit** for review |
| **Auditor** | Corporate sustainability / internal audit | **Approve** submitted data, **lock** approved records |
| **Admin** | Platform owner / head office | Full visibility, analytics, benchmarks, exports (read-only on entries in demo) |

This mirrors **segregation of duties**: the person who enters data is not the same as the person who certifies it.

---

#### Q16. Can we see a demo in the meeting?

**Answer (suggested flow — ~8 min):**

1. Login as **data entry** → show **New entry** and **My entries** → submit a draft.  
2. Login as **auditor** → dashboard queue → **Approve** / **Lock**.  
3. **Analytics** → change period to **Annual 2025** → KPIs, trend chart, target RAG.  
4. **Export report** → Excel download.  
5. Optional: **?** glossary in top bar for ESG terms.

---

#### Q17. Is it ready for production?

**Answer (honest):**  
This is a **PoC / demo** for Problem #25. Ready for production **after**: real authentication (SSO), hosting decision, metric catalogue sign-off, backup/DR, UAT with one site, and any integration scope. Timeline should be agreed in pilot planning — not claimed as “production tomorrow.”

---

#### Q18. What does it cost / licensing?

**Answer:**  
*[Fill in your commercial model before the meeting.]*  
Technical note: stack is **open-source friendly** (Node, React, MySQL); cost drivers are **hosting, support, customization, and integration** — not per-user AI API fees.

---

### F. Technical (only if they push)

#### Q19. What technology stack?

**Answer (one sentence):**  
Web application: **React** frontend, **Node.js** API, **MySQL** database (SQLite in local demo), **Excel** export — common enterprise stack, easy to maintain by IT teams.

---

#### Q20. Do we need internet at the mine?

**Answer:**  
For **on-premise deployment**, site users can work on **local network** without public internet; sync to corporate can be scheduled. For **cloud-hosted** UI, mine needs connectivity or a VPN — part of the hybrid question in Section 2.

---

## Section 4 — Tough questions (be ready)

| Question | Suggested response |
| -------- | ------------------ |
| “Why no AI if everyone talks about AI?” | Core ESG problem is **data discipline**, not prediction. AI is optional later; auditable rules first. |
| “We already have an EMS vendor.” | EMS is often **operational monitoring**; this platform is **ESG reporting workflow + consolidation + targets** — can complement EMS via import. |
| “Excel works fine.” | Ask: *How many days to close annual BRSR? Can audit trace who changed cell C14?* |
| “NMDC has different mines than RSP.” | Same **metric catalogue pattern**; facilities and targets differ per org — configurable master data. |
| “What if targets change mid-year?” | Update target master for that metric/facility/period; RAG recalculates from stored entries. |

---

## Section 5 — One-page cheat sheet (print or second screen)

**Not AI today** → Rule-based ESG database + dashboards + workflow + Excel.

**Data** → MySQL (prod), relational tables, audit log, hybrid site + corporate.

**Helps** → One source of truth, approve/lock, RAG vs targets, faster reporting.

**New data** → Forms + master catalogue (facility/metric/target); bulk import in pilot.

**Roles** → Site enters → auditor approves/locks → leadership dashboards/export.

**Ask them** → Metrics list, # sites, on-prem vs cloud, BRSR timeline, pilot scope, NMDC overlap.

**Demo logins** → See `README.md` (Rahul / Shresht / Hitesh demo accounts).

---

## Section 6 — Suggested next steps (close the meeting)

1. Share **metric list** and **facility list** from RSP/NMDC within 1 week.  
2. Agree **pilot site** (one mine/plant) and **one reporting period**.  
3. Workshop (60 min): map their Excel/BRSR fields → platform catalogue.  
4. Schedule **hands-on UAT** with real data-entry and auditor users.  
5. Document **deployment preference** (on-prem / hybrid / cloud) for IT.

---

*Document version: aligned with ESG Meteor PoC as of June 2026. For product behaviour details see `ESG-PLATFORM-GUIDE.md`; for architecture see `esg-platform-architecture.md`.*
