# HAUS CRM — Source Data Model & Design Backlog

> **What this is.** The client's live source of truth is a Google Sheets workbook
> **"Stone Haus Living Listing"** (21 tabs). This file documents the schema of the
> tabs that map to CRM features, records the **real enum values**, and — importantly —
> flags the tabs whose CRM surfaces **we have not designed yet**, so they aren't
> forgotten when we plan the remaining design steps and the DB wiring.
>
> Source workbook ID: `1sxgoXeyJ-bG_3NYo64sKvo1PxrA6yV5RsbDNXigB65M`
> Documented: 2026-07-13 · Status: **design phase (DB not wired)**

---

## Build status at a glance

| Source tab | Rows | CRM surface | Status |
| :-- | --: | :-- | :-- |
| **Listings** | ~109 | `/listings` (ทรัพย์) | ✅ built (design-first) |
| **Buyer Focus** | ~176 | `/leads` (Lead) | ✅ built (design-first) |
| **Projects** | 39 | project knowledge base | ⛔ **not designed yet** |
| **Last Match** | 118 | market-comps ledger | ⛔ **not designed yet** |
| **Actions** | 289 | agent activity log → FAB logger + ผลงาน/KPI | ⛔ **not designed yet** ([approach decided](#design-decisions--2026-07-13)) |
| **Zone** | — | CEO-managed lookup (ตั้งค่า/admin) | ⛔ **not designed yet** |
| _Owner, New Lead, KPI Target, Spending, Comments, Dashboards…_ | — | various | ⛔ not yet reviewed |

> ⚠️ **Design-steps reminder:** three real, populated surfaces below (**Projects,
> Last Match, Actions**) exist in the source but have **no screen in the CRM**.
> Add them to the design plan before we call the UI phase "done." See
> [Design backlog](#design-backlog--surfaces-not-yet-built).

---

## Relationships

```
Projects (project knowledge base) ──Project Name(Eng), free-text──┐
                                                                  ▼
Listings (properties) ─────Listing ID──────►  Buyer Focus (leads / pipeline)
     ▲                                              (Buyer Focus.Listing Code → Listings.Listing ID)
     │ Owner's Name/Phone/LINE embedded inline (no separate contacts table)
     │
Last Match (market comps)  — standalone log; links only via project-name / remark text, no ID FK
Actions (activity log)     — standalone per-agent time/effort log; not row-linked to deals
```

Joins in the source are **name-based / weak** (Projects and Last Match have no
populated FK). Assigning real IDs + name-normalization is an import task — see
[Import must-fixes](#import--normalization-must-fixes).

---

## 1. `Listings` — properties  (cols A–BI, ~61 fields)  ✅ built

**Identity / status:** `A` Date Created (Excel serial) · `B` Listing Name · **`C` Listing ID (PK, e.g. HRP1001)** · `D` Listing Status · `P` Potential · `O` Hook · `Q` Owner Focus (0/1).

**Marketing / portal:** `E` Sign · `F` VDO · `G` Ddproperty · `H` Livinginsider · `I` Facebook (holds PropertyHub URLs in practice) · `BF` DD Boost · `BG` LV Boost · `BH` FB Repost · `BB` New Photo · `BC` Shorts/Reels · `BD` Hometour · `BE` Facebook Ad (doc) · `BI` Marketing Report.

**Pricing:** `J` Old Price · `K` New Price · `L` Update Remark · `M` Last Match Price · `N` Last Match Remark · **`AP` Asking Price** · **`AQ` Rental Price (separate col)** · `AR` Price Remark · **`S` Listing Type**.

**Specs:** `R` Project Name (Eng) · `T` Unit no. · `Z` Property Type · `AA` ใน/นอกโครงการ · `AB` ถนน/ซอย · `AC` Zone · `AD` Bed · `AE` Bath · `AF/AG/AH` ไร่/งาน/วา · `AI` ตรม.ใช้สอย · `AJ` ชั้น · `AK` ทิศ · `AL` ตำแหน่ง · `AM` อายุ · `AN` ส่วนกลาง · `AO` Parking · `AW` Unit Condition.

**Owner (inline):** `U` Owner's Name · `V` Owner's Phone (auto) · `W` Owner's LINE (auto) · `X` วันที่ Owner Talk ล่าสุด · `Y` Activity Comment.

**Media / meta:** `AS` Remark · `AT` Photo Album · `AU` Link Location (maps) · `AV` Link · `AX` Last Match · `AY` Last Match Type · `AZ` Created By · `BA` Days on Market (formula).

**Enums (observed):**
- `D` Listing Status → `Posted`(31) · `Sold Completed`(19) · `Need Info`(9) · `Cancel Completed`(4)
- `P` Potential → `Normal`(41) · `A List`(20) · `Exclusive`(1) · `A List + Fb add`(1)
- `S` Listing Type → `Sale`(52) · `Sale & Rent`(5) · `Co - Agent`(3) · `Rent`(2) · `Sale with Tenant`(1)
- `Z` Property Type → บ้านเดี่ยว(56) · บ้านแฝด · ที่ดิน · ทาวน์โฮม
- `AC` Zone → `Ratchaphruek (ต้น)`(60) · `Salaya`(1)
- `AA` → ในโครงการ(56) · นอกโครงการ(2)

---

## 2. `Buyer Focus` — leads / pipeline  (cols A–X, 24 fields)  ✅ built

`A` Date Received · **`B` Listing Code (FK → Listings.Listing ID)** · `C` Potential · `D` Lead Status · `E` สนใจ (interested project) · `F` Lead Name · `G` Phone · `H` Admin Remark · `I` LINE ID · `J` Budget (millions) · `K` Pipeline Stage · `L` Progress (**dead — all "None"**) · `M` วันที่ Follow ล่าสุด · `N` Activity Comment · `O` Commission · `P` Bank Loan · `Q` Closing Date · `R` Transfer Date · `S` Case Closing Remark · `T` Complete (0/1) · `U` Confirm (0/1) · `V` Created By · `W` Lead ID · `X` Lead Type.

**Enums (observed):**
- `C` Potential → `New Lead`(49) · `C`(45) · `B`(41) · `A`(24) · `Agent`(17)  ← **note `Agent`**
- `D` Lead Status → `Reject`(127) · `Active`(34) · `Lose`(10) · `Win`(5)
- `K` Pipeline Stage → `Lead → Call → Follow → Appoint → Show → Nego → Close/Win`
  (counts: Call 43 · Show 35 · Follow 28 · Lead 25 · Close 4 · Appoint 4 · Nego 2 · Win 2)
- `X` Lead Type → `Buyer - Buy`(149) · `Buyer - Rent`(16) · `Co-Agent`(10)

---

## 3. `Projects` — project knowledge base  (cols A–Y, 25 fields)  ⛔ not designed

One row per housing project; the deep local knowledge agents pitch with.

`A` Project ID (**mostly blank — only row 1 filled**) · **`B` Project Name (Eng) — de-facto join key** · `C` Project Name (Thai) · `D` Property Type · `E` Zone · `F` จำนวนยูนิต · `G` กี่เฟส · `H` ประเภท Type ยูนิต · `I` วัสดุ · `J` พื้นถึงฝ้า · `K` อายุโครงการ · `L` ส่วนกลาง · `M` ค่าส่วนกลาง · `N` นิติบุคคล (name+phone) · `O` นิติเก็บค่าส่วนกลางได้กี่ % · `P` จอดเกินเสียคันละเท่าไหร่ · `Q` ราคาปล่อยเช่าในโครงการ · `R` น้ำท่วมขังหรือไม่ · `S` อาชีพลูกบ้าน (persona) · `T` ราคาจบโครงการ · `U` ข้อดี · `V` ข้อเสีย · `W` Sales Created By · `X` Date Created · `Y` Date Updated.

⚠️ **Sparse:** only **10 of 39** rows have detail beyond name/type/zone. Design for
mostly-empty cards + easy inline editing so agents fill it over time.

---

## 4. `Last Match` — market-comps ledger  (cols A–L, 12 fields)  ⛔ not designed

"What sold nearby, for how much, who closed it" — used to price listings and coach buyers.
**Two tabs, identical schema:** `Last Match` (118 rows, team-wide) and
`Last Match กรอกข้อมูล` (118 rows, Stone's data-entry feed → same table, one `source`).

`A` By (agent) · `B` Type (how it closed) · `C` Projects Name (free-text) · `D` Property Type · `E` Zone · `F` Sq.wa / Sq.m (freeform, both in one cell) · `G` Bed/Bath (freeform) · `H` Last Match Price (mixed formats) · `I` Last Match Remark (often cites a Listing ID) · `J` Buyer Persona (mostly empty; sometimes a FB URL) · `K` Last Match ID (PK, `{By}-{nn}`) · `L` Date Created.

**Enums (observed):**
- `A` By → Mhow(24) · Q(16) · Stone(8) · Pup · Game · Stone+Pup · Test
- `B` Type → `เจ้าของขายเอง`(21) · `ปิดเอง`(18) · `เอเจ้นอื่นสอยไป`(13) · `ไม่รู้` · `มือ 1`
- `D` Property Type → **not normalized** (บ้าน · บ้านเดี่ยว · ที่ดิน · Condo · typos `บ้้าน`,`ที่ี่ดิน` …)
- `E` Zone → **14 free-text variants**, inconsistent with Listings' Zone enum

---

## 5. `Actions` — agent activity / effort log  (cols A–J, 10 fields)  ⛔ not designed

Per-agent daily log of activities + time spent; feeds KPI/effort dashboards.
289 rows, all `Sales = Stone` so far (single-agent to date).

`A` Date (serial) · `B` Sales (agent) · `C` Action (type) · `D` จำนวน (count) · `E` ชั่วโมง (hours, number) · `F` Remark (usually a project name) · `G` Recap (optional) · `H` เกิดอะไรขึ้น? · `I` เพราะอะไร? · `J` Improvement Plan.

- `H`,`I`,`J` (the recap/retro columns) are **defined but entirely empty** — a
  planned self-review feature the client hasn't used yet.
- `C` Action → **23 distinct**, Thai+English mixed and un-normalized:
  `Appoint`(47) · `Survey`(35) · `Showing`(32) · `Owner Visit`(30) · `Sourcing`(20) ·
  `Show`(19) · `ประชุม`(18) · `ทำงานหน้าคอม`(16) · `Visit`(16) · `ถ่าย Reels`(12) ·
  `อื่นๆ (ระบุ Remark)`(8) · `ประเมิน`(4) · `โอน`(4) · `Nego`(3) · `Closing`(2) ·
  `Reels`(2) · plus singletons (`New List`, `ติดป้าย`, `โอนกรรมสิทธิ์`, `เปลี่ยนน้ำ,ไฟ`, `เปิดประเมิน`, `Close`, `ถ่าย`).
  Note the **`Show`/`Showing` and `Reels`/`ถ่าย Reels` duplicates** — needs a canonical action list.

---

## Design backlog — surfaces not yet built

These come straight from the source workbook and must be planned into the remaining
**design steps** (then wired):

- [ ] **Projects screen** — project knowledge base / persona cards (pros/cons, common
      fees, flood risk, resident demographic, juristic contact). Feeds the sales pitch;
      link from each Listing's project. Design for sparse data + inline edit.
- [ ] **Last Match screen** — market-comparables ledger (searchable by zone/project/price),
      surfaced on Listing detail ("recent comparable sales nearby") and as a buyer-coaching tool.
- [ ] **Actions screen** — agent activity log + effort/KPI view (time per action type,
      per day/week), including the unused recap/retro fields (`เกิดอะไรขึ้น/เพราะอะไร/Improvement Plan`).
- [ ] Decide which of the **remaining unreviewed tabs** (Owner, New Lead, Zone, KPI Target,
      Spending, Comments, Dashboard*) become CRM surfaces vs. stay back-office.

---

## Design decisions — 2026-07-13

How the backlog surfaces get built into the CRM (decided with Ben):

- **Activity model = UNIFIED (resolved).** One `activities` table is *both* the KPI
  tally and the entity-timeline event. Reference: **`W Property`** (`~/Desktop/Ben/
  Business/Custom Dashboard Client/W Property` — `components/LogActivity.jsx`). Its FAB
  writes one row `{ created_by, action, related_lead_id?, date, count, remark }`:
  attaching an entity → a count-1 touch in that entity's history; skipping → an
  aggregate KPI tally (count N). **HAUS extension:** add `related_listing_id?`
  (+ optional project) so an action can tag a **lead OR a listing** (W Property tags
  leads only). Two views of the same rows: entity timeline (lead/listing detail) +
  ผลงาน/KPI aggregate.
- **FAB logger (agent-only).** Mirror W Property's stacked bottom-right FABs: primary
  solid **"บันทึก"** (action-first bottom-sheet: pick action → optionally attach
  lead/listing → date/count/note) + secondary outlined **"เพิ่มลีด"**. Mounted for the
  sales role only; CEO/admin see dashboards, not FABs. (New-listing stays on the ทรัพย์
  page to avoid a crowded FAB stack.)
- **Roles: CEO/admin vs agent (explicit now).** Agents log activity + own their
  leads/listings; the CEO **governs master data**. Role-gates the FABs and the ตั้งค่า area.
- **Master-data / admin area (ตั้งค่า, CEO-managed).** **Zone becomes a CEO-managed
  table** — and it's the first of several controlled vocabularies that belong here:
  canonical **Property Type**, the **Action-type list**, **KPI Target**. One place to
  govern the vocabularies everything else references.
- **Action taxonomy.** Canonicalize the 23 messy source values into W Property's groups
  (`ไปป์ไลน์` / `กิจกรรม` / `ธุรการ` / `ทั่วไป`), collapsing dupes (`Show`/`Showing`,
  `Reels`/`ถ่าย Reels`), and tag each action **lead-bound / listing-bound / general**.
- **Navigation (grouped sidebar).** `ภาพรวม`(แดชบอร์ด) · `ดีล`(ไปป์ไลน์, Lead) ·
  `คลังทรัพย์`(ทรัพย์, โครงการ, Last Match) · `ติดต่อ`(ผู้ติดต่อ) · `ผลงาน`(Actions/KPI) ·
  `ตั้งค่า`/CEO(Zone, Property Types, Action types, KPI Target). **Actions lives in ผลงาน,
  not with Projects/Last Match** — those are inventory (data agents *use*); Actions is
  performance; ตั้งค่า is data the CEO *governs*.

---

## Roles & access model — configurable RBAC (built UI-first)

**Decided:** NOT hardcoded roles — a **configurable permission system**. A role is an
editable *set* of permissions; a **user holds one or more roles** and effective access is
the **union**. The CEO creates/edits roles + assigns users on **`/settings/roles`**
(built: `components/RolesManager.tsx`, `lib/rbac.ts`). Design phase = interactive but
in-memory (not persisted). Wire later = tables `roles`, `role_permissions`, `user_roles`,
+ a `can(permission)` check fed by the session's union of role permissions.

**Why this shape (resolves the earlier open assumptions as *config*, not code):**
- **Player-coach transition** — a person is `[Agent + Sales Leader]` now; drop the Agent
  role later. Multi-role, no migration.
- **HR payroll later** — just toggle `financials.payroll` / `financials.view` on the HR
  role when the time comes.
- **Who logs (FAB)** — one permission `activity.log`, granted to whoever does sales work.
- **Contact privacy / master-data** — `contacts.view_own` vs `contacts.view_all`,
  `masterdata.govern`, etc. are toggles the CEO sets per role, not baked assumptions.

**Permission catalog** (the implemented gates — see `PERMISSION_GROUPS` in `lib/rbac.ts`):
Leads (view all/own, assign, edit) · Contacts (view all, view own/assigned, manage) ·
Inventory (view/edit listings, marketing, edit projects, add Last Match) · **Activity
(log — the FAB)** · Targets/KPI (view team/own, set targets, add stretch) · Financials
(view prices/commission, manage payroll) · People (manage employees) · Master data
(govern zones & vocabularies) · System (manage roles & permissions).

**Seed roles:** CEO (all permissions, system/locked) + Admin · Listing Support · Sales
Leader · Agent · HR — the latter five seeded **empty on purpose** (duties defined by
toggling in the UI, not assumed). Note: Listing Support's duties are **undefined** pending
the client — left blank.

**Still to build:** app-wide gating driven by `can()` + a **"view as" switcher** to preview
a role (the RolesManager defines access; wiring it into nav/FAB/pages is the next step);
plus a **Team/HR** page and an **Admin lead-assignment** view once those roles are defined.

---

## Momentum layer — Daily Plan + Targets (planned, from Solo Gang)

Adapt the **Solo Gang "Momentum"** model (`~/Desktop/Ben/Business/Consult/Client/Solo
Gang`) onto HAUS. Its core loop: **Daily Plan → Goal**, where completing a plan task
bumps a monthly target. HAUS already has the middle piece Solo Gang lacks — the
**unified Activity log** — so the bridge can be *automatic*:

```
แผนวันนี้ (daily plan task) → บันทึก FAB (log the CRM activity) → เป้าหมาย auto +1 (target)
```

**Three layers to add (design-first, sample data):**

- **เป้าหมาย / Targets** — monthly, per agent, per metric. `kind` = count / ฿ / check.
  `source` = `activity` (auto-tracked: `current` = count of matching activity rows this
  month, tied to an `activity_type` like Call/Show/Owner Visit) · `pipeline` (derived:
  Wins, commission) · `manual` (+1 button). Ties to the source **`KPI Target`** tab.
  **Owner = both:** manager sets the *official* target; agent adds *personal stretch*
  goals on top (visually distinguished).
- **แผนวันนี้ / Daily Plan** — per agent/day: task list + completion ring. Each task has
  a **type** (awareness split — real-estate cut of Solo Gang's building/working/personal,
  e.g. หาโอกาส / งานประจำ / ส่วนตัว), and optional links to a **target** + a **CRM
  activity type + entity** (lead/listing). Recurring rules + carry-tomorrow like Solo Gang.
- **Auto-bridge (hybrid, decided):** activity-linked targets auto-track from the activity
  log (no double entry); non-activity targets use a manual +1 on linked-task completion.
  Streak/"sprint" = consistency of daily-plan completion.

**New surfaces:** `แผนวันนี้ / Today` page (daily plan) · a **Targets** setter/among
`/performance` · `/performance` (ผลงาน) evolves from "what happened" → **"progress vs
target."** Optional later: streak/leaderboard momentum skin.

**Role ties (see role matrix — still to confirm):** *setting* official targets = CEO /
Sales Leader; *executing* the plan + adding stretch goals = Agent. Makes ผลงาน the
coaching surface (leader sees team vs target).

**New tables (wire later):** `targets` (agent, month, metric, kind, target, current,
source, activity_type?, owner) · `tasks` (agent, date, title, done, order, type,
target_id?, activity_type?, related_lead_id?, related_listing_id?, recurring). Auto-track
= an aggregation over `activities`, not a stored duplicate.

---

## Import / normalization must-fixes (DB-wiring phase)

- [ ] **Weak joins:** Projects (`Project ID` unpopulated) and Last Match link by
      free-text project name only. Assign real IDs; build a name→ID alias map on import.
- [ ] **Zone & Property Type are 3 different vocabularies** across Listings / Last Match /
      Projects (incl. typos `บ้้าน`, `ที่ี่ดิน`). Normalize to one canonical set + alias table.
- [ ] **Action types (23) and Last-Match Type need canonical enums** — collapse
      `Show`/`Showing`, `Reels`/`ถ่าย Reels`, etc.
- [ ] **Phones stored as numbers** in Buyer Focus (`9.92e8`) — leading `0` lost / scientific
      notation. Import as text, re-pad.
- [ ] **All dates are Excel serials** (base 1899-12-30) — convert on import.
- [ ] **Budget is in millions** (Buyer Focus `J`); **prices mix formats** (`1.7E7`, `11000000`).
- [ ] **Dead/unused columns:** Buyer Focus `Progress` (all "None"); Actions recap cols
      (all empty) — keep the feature, don't import as required data.
- [ ] Two `Last Match` tabs → one table with a `source`/`created_by`, not two.

---

_Update this file whenever we review another source tab or design one of the backlog
surfaces. Design rationale lives in the team's design-system notes; the pre-handover
test gate lives in [HANDOVER_CHECKLIST.md](./HANDOVER_CHECKLIST.md)._
