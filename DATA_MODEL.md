# HAUS CRM — Source Data Model & Design Backlog

> **What this is.** The client's live source of truth is a Google Sheets workbook
> **"Stone Haus Living Listing"** (21 tabs). This file documents the schema of the
> tabs that map to CRM features, records the **real enum values**, and — importantly —
> flags the tabs whose CRM surfaces **we have not designed yet**, so they aren't
> forgotten when we plan the remaining design steps and the DB wiring.
>
> Source workbook ID: `1sxgoXeyJ-bG_3NYo64sKvo1PxrA6yV5RsbDNXigB65M`
> Documented: 2026-07-13 · Status: **design phase (DB not wired)**
>
> **Second source workbook: "HR Sheet"** (ID `1oJTQhWXUNj1ft78WY9aNvXLoTr5w1ApyN4mWMyQP0eY`,
> 4 tabs) — the people/HR source of truth, separate from the listing workbook. Documented
> 2026-07-14; drives `/team`. See [HR Sheet](#hr-sheet--people--zones--leave-2026-07-14).

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
| **HR Sheet → Employee Lists** | ~10 | `/team` (ทีม/บุคคล) + employee create/edit | ✅ built (design-first) |
| **HR Sheet → Zone** | 519 | zone master (assigned sales + sheet links) | ⚠️ richer than current `zone` |
| **HR Sheet → Day off** | ~1000 | leave management | ⛔ not designed (candidate surface) |
| **HR Sheet → User Pass** | ~1000 | portal/ad logins (back-office secrets) | ❌ not a CRM surface |
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

**Company listings + owner privacy (new, design-first 2026-07-22).** A second listings
surface — **`/company-listings`** (`components/CompanyListings.tsx`, under คลังข้อมูล, gated
`listings.view`) — shows **every** listing with its **managing sales agent** (avatar +
contact) and a per-agent inventory count strip, so any sale can find Co-Agent opportunities.
It deliberately shows **NO owner contact**. The managing agent = source `AZ Created By` /
per-agent listing sheet (HR Sheet col U); the live view doesn't expose it and the source is
still single-agent (all Stone), so `lib/listings.ts` **seeds** a deterministic agent per
listing purely for the demo — **delete at wiring** and read the real column.
**Owner contact is now PRIVATE** on the listing detail (`components/ListingOwnerCard.tsx`):
visible only to `contacts.view_all` holders (Listing Support / leadership — owners *are*
contacts) **or** the listing's managing agent; everyone else sees the managing agent's
contact instead (Co-Agent card). Wire this to a real owner-contact RLS + the real
creating-agent, and prefer a **view without owner PII** for `/company-listings` so owner
contact never reaches the client on that surface.

---

## 2. `Buyer Focus` — leads / pipeline  (cols A–X, 24 fields)  ✅ built

`A` Date Received · **`B` Listing Code (FK → Listings.Listing ID)** · `C` Potential · `D` Lead Status · `E` สนใจ (interested project) · `F` Lead Name · `G` Phone · `H` Admin Remark · `I` LINE ID · `J` Budget (millions) · `K` Pipeline Stage · `L` Progress (**dead — all "None"**) · `M` วันที่ Follow ล่าสุด · `N` Activity Comment · `O` Commission · `P` Bank Loan · `Q` Closing Date · `R` Transfer Date · `S` Case Closing Remark · `T` Complete (0/1) · `U` Confirm (0/1) · `V` Created By · `W` Lead ID · `X` Lead Type.

**Enums (observed):**
- `C` Potential → `New Lead`(49) · `C`(45) · `B`(41) · `A`(24) · `Agent`(17)  ← **note `Agent`**
- `D` Lead Status → `Reject`(127) · `Active`(34) · `Lose`(10) · `Win`(5)
- `K` Pipeline Stage → `Lead → Call → Follow → Appoint → Show → Nego → Close/Win`
  (counts: Call 43 · Show 35 · Follow 28 · Lead 25 · Close 4 · Appoint 4 · Nego 2 · Win 2)
- `X` Lead Type → `Buyer - Buy`(149) · `Buyer - Rent`(16) · `Co-Agent`(10)

**Lead tags (new, design-first 2026-07-18).** `/leads` gained **free-form tags** on the
table — add/create via an inline per-row popover, remove via chip ×, plus a **group-by-tag**
view (a lead shows under each of its tags + an "ไม่มีแท็ก" group). The source Buyer Focus
sheet has **no tag column**, so this is a new concept: `lib/tags.ts` (sample + local state).
**Wire to two new tables:** `tags(id, label)` (the pool — grows as users create tags) +
`lead_tags(lead_id, tag_id)` (many-to-many assignments). Tag colour is **derived from the
label** (stable hash → tone), so no colour column is needed. Also removed `/pipeline` this
date (redundant with the leads stage filter) — `lib/pipeline.ts` STAGES stays (leads uses it).

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

## HR Sheet — people / zones / leave  (2026-07-14)

Separate workbook **"HR Sheet"** (`1oJTQhWXUNj1ft78WY9aNvXLoTr5w1ApyN4mWMyQP0eY`), 4 tabs.
It is the real source for the **Team / บุคคล** surface — `/team` (list) + the employee
**record page with in-place edit** (`/team/[id]`, `/team/new`) are built design-first against
this schema (`lib/team.ts`, `components/EmployeeRecord.tsx`). This detail-page + edit-mode
pattern is the **app-wide CRUD template** for the other record entities (listing/lead/
contact/project), whose edit buttons are still dead. Quick-capture (activity log, daily task)
stays as modals — different intent.

### Tab 1 — `Employee Lists` (cols A–AE, 31 fields) ✅ built → `/team`

**Placement:** `A` Employee Code (PK) · `B` Status · `C` Division · `D` Position · `E` 2nd Position · `F` Zone (Sales).
**Identity:** `G/H` First/Last (Eng) · `I/J` First/Last (Thai) · `K` Nickname · `L` Gender · `M` Nationality.
**Contact:** `N` Phone · `O` Additional Phone · `S` Email · `T` Assigned Work Email · `AD` Line (UserId).
**Employment:** `V` Birthday · `W` Date Started · `U` Sheet ID (Sales, per-agent listing sheets) · `AB` Remark · `X` Employee Agreement Files.
**Emergency:** `Y` Contact · `Z` Contact Phone · `AA` Contact Relationship.
**💰 Financial (sensitive):** `P` Salary · `Q` Commission.
**🔒 PII / legal (sensitive):** `R` ID Card no. · `AC` KBANK Account · `AE` PaySlip Drive.

**Real enum values:** `Status` = `Active` / `Terminate`. `Division` = `C-Level` (only). `Position` =
`CEO` / `Listing Support` / `Marketing`. `2nd Position` = `Sales` / `Support`.

**Key facts that corrected earlier guesses (were fictional in the seed):**
- **`Employee Code` prefixes carry meaning:** `C-` C-level · `S-` Sales · `SP-` Support.
- **`2nd Position` is really the department** (Sales / Support); `Division` only marks C-Level.
- **The real team:** Stone (`C-001`, **CEO who also carries Sales** — genuine player-coach),
  Pup/Game/Q/Mhow/Golf (Sales), Benz (Listing Support), Pui (**Marketing**), + Nut & Pai (terminated).
  **No Admin, HR, or Sales-Leader person exists today.**
- **`Commission` is a RATE, not baht** — `0.6` = 60% split (sales), `0.5`, `0.006` (support).
  A monthly commission ฿ figure is a *performance/pipeline* number, NOT an HR field. The old
  `team.ts` `commissionMonth: ฿` was wrong and has been removed.

**Applied to the CRM (2026-07-14):**
- `lib/team.ts` `Employee` now mirrors A–AE (commission as `commissionRate` fraction);
  seeded with the real people. `listSalesAgents()` = active + department `sales` (lead
  assignment must not offer support/marketing/management).
- RBAC seed aligned to reality (`lib/rbac.ts`): **added `Marketing` role**; users are the real
  staff; **Stone = `[ceo, agent]`**. `Admin` / `Sales Leader` / `HR` kept as **unstaffed palette
  roles** for the org's stated future (delete if never used). Default view-as = Stone.
- **New permission gate `people.view_sensitive`** — PII/legal docs (ID card, bank, payslip,
  agreement). Money (salary + commission) stays under `financials.view_comp`. Both enforced in
  `EmployeeRecord` (whole sections hidden + a locked note) and the `/team` commission column.
  Wiring must mirror these two gates in RLS.

### Tab 2 — `Zone` (cols A–I, 519 rows) ⚠️ richer than current `lib/zones.ts`

`A` Zone ID · `B` Zone Code · `C/D` Name (Eng/Thai) · **`E` Current Sales Assigned** ·
`F` Sales Sheet (per-zone Google Sheet link) · `G` Location (My Maps) · `H/I` Date Updated/Created.
The **zone↔sales assignment** is the inverse of `Employee.zoneCodes` (HR sheet's `Zone (Sales)`) —
wire as **one join table**, not two. Current `lib/zones.ts` is thinner (no sheet/location/dates).

### Tab 3 — `Day off` (cols A–G, ~1000 rows) ⛔ candidate surface

`A` Date Submit · `B` Name · `C/D` Start/End Date · `E` Condition (`ลาพักร้อน`/`ลากิจ`…) ·
`F` Remark · `G` submission link. A **leave-management** surface if the client wants it in the CRM.

### Tab 4 — `User  Pass` (~1000 rows) ❌ not a CRM surface

Portal/ad-account logins (DDproperty, Living Insider, PropertyHub, FB/IG…) + free-form notes.
Shared secrets / back-office — keep out of the CRM (or a locked CEO-only vault at most).

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
the **union**. The CEO creates/edits roles + assigns users in the single **`/settings`**
hub → บทบาท & สิทธิ์ section (Shelter-style one-page settings: `SettingsView.tsx` +
`RolesManager.tsx`, `lib/rbac.ts`). Design phase = interactive but
in-memory (not persisted). Wire later = tables `roles`, `role_permissions`, `user_roles`,
+ a `can(permission)` check fed by the session's union of role permissions.

**Why this shape (resolves the earlier open assumptions as *config*, not code):**
- **Player-coach transition** — a person is `[Agent + Sales Leader]` now; drop the Agent
  role later. Multi-role, no migration.
- **HR payroll later** — just toggle `financials.payroll` / `financials.view_comp` on the HR
  role when the time comes.
- **Who logs (FAB)** — one permission `activity.log`, granted to whoever does sales work.
- **Contact privacy / master-data** — `contacts.view_own` vs `contacts.view_all`,
  `masterdata.govern`, etc. are toggles the CEO sets per role, not baked assumptions.

**Permission catalog** (the implemented gates — see `PERMISSION_GROUPS` in `lib/rbac.ts`):
Leads (view all/own, assign, edit) · Contacts (view all, view own/assigned, manage) ·
Inventory (view/edit listings, marketing, edit projects, add Last Match) · **Activity
(log — the FAB)** · Website (**`website.manage`** = customer-facing portal content —
menu/banners; `/website` is a coming-soon placeholder until the portal is designed) ·
Targets/KPI (view team/own, set targets, add stretch) · Financials
(**`financials.view_comp`** = team compensation, manage payroll) · People (manage
employees, view sensitive PII) · Master data (govern zones & vocabularies) · System
(manage roles & permissions).

> ⚠️ **`financials.view_comp` does NOT gate listing prices.** It was renamed from
> `financials.view` (label used to read "ราคา/คอมมิชชั่น") on 2026-07-15 because that name
> invited over-granting: it only ever hid **employee salary + commission rate**. Asking /
> rental price is visible to anyone with `listings.view` — a listing without a price is
> useless. Don't reintroduce a price gate unless a real rule demands one.

### Seeded role matrix — this IS the access policy (2026-07-15)

Previously every non-CEO role shipped **empty** ("define by toggling"). That left the
wiring phase with no policy to enforce, so the roles are now seeded with the client-agreed
matrix below. **This table is the spec RLS must reproduce** — the client-side `can()` is
convenience, not enforcement.

| | CEO | Agent | Listing Support | Marketing | Sales Leader\* | Admin\* | HR\* |
|---|---|---|---|---|---|---|---|
| leads view | all | **own** | – | – | all | all | – |
| leads edit / assign | ✓ / ✓ | ✓ / – | – | – | ✓ / ✓ | ✓ / ✓ | – |
| contacts | all | **own** + manage | all | – | all + manage | all + manage | – |
| listings view / edit | ✓ / ✓ | ✓ / ✓ | ✓ / ✓ | ✓ / – | ✓ / ✓ | ✓ / – | – |
| listings.marketing / projects.edit | ✓ / ✓ | – | ✓ / ✓ | ✓ / – | – | – | – |
| lastmatch.add | ✓ | ✓ | ✓ | – | ✓ | – | – |
| activity.log | ✓ | ✓ | ✓ | ✓ | ✓ | – | – |
| website.manage | ✓ | – | – | **✓** | – | – | – |
| performance own / team | ✓ / ✓ | ✓ / ✓ | ✓ / – | ✓ / – | ✓ / ✓ | – / – | – / ✓ |
| targets set / stretch | ✓ / ✓ | – / ✓ | – / ✓ | – / ✓ | ✓ / ✓ | – | – |
| financials view_comp / payroll | ✓ / ✓ | – | – | – | – | – | ✓ / ✓ |
| people manage / view_sensitive | ✓ / ✓ | – | – | – | – | – | ✓ / ✓ |
| masterdata.govern · roles.manage | ✓ | – | – | – | – | – | – |
| reference.manage | ✓ | – | **✓** | – | – | – | – |
| teams.manage | ✓ | – | – | – | – | – | – |

\***Sales Leader is now staffed** — Pup & Game are `[agent, sales_leader]`, the two seeded
team leads (see *Sales teams* below). Admin & HR remain **unstaffed** (0 users = 0 real
access), documenting the org's stated future (lead dispatch, payroll); testable via view-as.
CEO deletes any that never get used.

**Sales teams (new, design-first 2026-07-22).** `lib/teams.ts` adds a `Team { id, name,
leaderId, memberIds, revenueGoal }` held in the shared org store (`RbacProvider`, alongside
roles/users) so Settings edits live-update every surface. **Settings ▸ ทีม**
(`components/TeamsManager.tsx`, gated **`teams.manage`** — CEO only) creates teams, sets a
leader + monthly revenue goal, and assigns members (**one team per person** — adding pulls
them off any other team; removing a leader reassigns leadership). Seeds = 2 teams
(A: Pup·Q·Mhow, B: Game·Golf·Stone). **Scoping** via `visibleMemberIds(teams, viewerId,
isOrgWide)`: org-wide viewers (CEO/HR) see everyone; a team leader who isn't org-wide sees
only their team — already applied to the **`/team` roster** (`TeamTable`, team column + scope
banner). **Wire:** `teams` table + membership (`employees.team_id` or a `team_members` join);
apply the same `visibleMemberIds()` scope to the **dashboard leaderboard**, **/performance**,
and the **Lead Database**, and feed `revenueGoal` into team-level targets.

**Rules encoded in the matrix:**
- `view_all` beats `view_own` — grant only one per surface.
- **Agents are own-scoped** for leads + contacts (matches the `created_by`/`assigned_to`
  contact privacy already built) but **do** get `performance.view_team` — the leaderboard is
  intentionally public, and it's what makes `/team` (roster only, no money) visible to them.
- **Compensation and PII are two separate gates**, both CEO/HR only.
- `activity.log` goes to everyone carrying a commission rate — including **Benz** (Listing
  Support) and **Pui** (Marketing), whose work counts toward KPI.
- Listing Support gets `contacts.view_all` (needs every owner's contact to coordinate
  listings), resolving the earlier "duties undefined" note.
- **Master data is two gates, not one.** `masterdata.govern` = structural/leadership data
  (zones — the listing↔lead↔match join key, action types, KPI templates), CEO-only.
  `reference.manage` = the light lead/listing vocabularies (property type, marketing channel,
  contact-by, gender, nationality), **delegated to Listing Support** (they live in listings +
  do lead intake, so they own these lists). `/settings` shows only the sections a viewer can
  govern — Listing Support sees ประเภททรัพย์ + ช่องทาง & ฟิลด์ Lead, nothing else.

**Built (design-first):** app-wide **gating** via `can()` (`RbacProvider` — shared store
so RolesManager edits live-change access) + a **"view as" switcher** in the sidebar;
nav items + the FAB carry permission keys. **Team/HR** (`/team`, commission column gated
on `financials.view_comp`) and **Admin lead-assignment** (`/assign`) surfaces. **Contact
privacy** enforced: `contacts.createdBy/assignedTo` + `visibleContacts()` scope the list to
the viewer unless `contacts.view_all`. Wiring replaces the in-memory store + view-as with
the authenticated session and real RLS.

**Momentum layer built:** `/today` (Daily Plan) + Targets (`lib/momentum.ts`), with the
activity-log **auto-bridge** live (activity-source targets compute from the log; manual/
pipeline use +1). Surfaced on `/today` and `/performance`. New tables to wire: `targets`,
`tasks`, `employees` (+ `contacts.created_by/assigned_to`).

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

- **เป้าหมาย / Targets** — monthly, per agent, per metric. `kind` = count / ฿ / check /
  **ratio**. `source` = `activity` (auto-tracked: `current` = count of matching activity
  rows this month, tied to an `activity_type`) · `pipeline` (derived: Wins, commission) ·
  `manual` (+1 button) · **`kpi`** (aggregated from the `summary_kpi` tab). **Owner =
  both:** manager sets the *official* target; agent adds *personal stretch* goals on top
  (visually distinguished).
  - **Official = the 4 leadership KPIs (locked 2026-07-17).** The ทางการ (ตั้งโดยหัวหน้า)
    section now *is* the sales-process KPI set from the HAUS dashboard (`summary_kpi`):
    **Owner Talk** (ratio), **Sourcing** (count), **Survey** (count), **Buyer Follow**
    (ratio) — replacing the old ad-hoc Call/Show/Owner-Visit/Win/Commission list
    (commission + deals still live on `/performance`). Each carries a **weekly-focus
    window** (`focusWeekStart..focusWeekEnd` + `focusLabel`): Owner Talk = wk1, Sourcing +
    Survey = wk2–3, Buyer Follow = wk4. The KPI whose window contains the current week is
    highlighted (accent border + dot + brighter bar) — the leadership pacing rhythm.
  - **`ratio` kind = a %-of-a-universe KPI** (Owner Talk, Buyer Follow): `manualCurrent`
    holds the numerator (done), **`denominator`** holds the total; `pct = current ÷
    denominator`, goal always 100%. `target` stores the % goal (100). **Wiring:** ratio
    KPIs cannot come from a raw activity count — they need the denominator, so `source =
    kpi` reads both numerator + denominator from `summary_kpi` (columns `ownertalk_done` /
    `ownertalk_total`, `buyerfollow_done` / `buyerfollow_total`, `sourcing_done` /
    `sourcing_target`, `survey_done` / `survey_target`). `activityType` on a `kpi` target
    is **informational only** (documents the driving behaviour), not the value source.
  - KPI targets are **auto** (no manual +1), same as `activity`-source. Personal stretch
    goals added via the **+เพิ่ม** sheet are `count`/`฿`, auto (if linked to an activity)
    or `manual` (+1).
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
**denominator?** (ratio), source, activity_type?, owner, **focus_week_start?**,
**focus_week_end?**, **focus_label?**) · `tasks` (agent, date, title, done, order, type,
target_id?, activity_type?, related_lead_id?, related_listing_id?, recurring). Auto-track
= an aggregation over `activities`, not a stored duplicate; `source=kpi` targets aggregate
over `summary_kpi` (numerator + denominator), not `activities`.

---

## Notifications — Topbar bell (built design-first, 2026-07-15)

**Decided:** a lean, **per-recipient in-app feed**. Bell + unread badge in the `Topbar`
(always rendered, deliberately outside the `actions` slot so pages passing their own
actions still get it) → right-anchored dropdown panel (`NotificationBell.tsx`), grouped
วันนี้ / เมื่อวาน / ก่อนหน้า. `NotificationsProvider` holds the feed and follows the
**view-as switcher**, so switching persona switches the bell. Sample data + model live in
`lib/notifications.ts`; entity ids are **real** (`main_6_buyer_crm` / `v_main_listing`) so
deep links resolve today.

**Model** (`AppNotification`): `id · userId · type · title · body? · entity? · entityId? ·
actor? · createdAt · readAt?`. Named `AppNotification` on purpose — a bare `Notification`
shadows the DOM global.

**`type` enum** (agreed with the client — adding one = a union member + `NOTIFICATION_META`):
`lead_assigned` · `lead_stage_changed` · `deal_won` · `task_due` · `target_milestone` ·
`listing_new_in_zone` · `listing_price_changed`.

**Wiring notes — the traps:**
- ⚠️ **`userId` is the LOGIN id (`u_pup`), not `Employee.code`.** Source rows address agents
  by `sale_id` = `S-001`, so producing a notification means joining
  `sale_id → employees.code → employees.id`. Getting this wrong silently sends every
  notification to nobody.
- **RLS is the whole security model here** — a notification is private to its recipient:
  `user_id = auth.uid()`. There is no permission gate on the bell (everyone has a feed);
  scoping *is* the gate. Note `deal_won` bodies carry deal values, so a mis-scoped row
  leaks money that `financials.view_comp` would otherwise hide.
- **Stored rendered text is a deliberate tradeoff.** Copy edits do **not** retro-apply, and
  values freeze as written ("งบ 6 ล้าน" stays after the budget changes). Good for an
  audit-ish feed and keeps rows readable without joins — but re-wording later needs a
  backfill. Swap to `type` + a params payload only if that becomes a real problem.
- **Read state is in-memory only** — survives client-side navigation, resets on reload.
  `markRead`/`markAllRead` must write `read_at`.
- `NOW` (stubbed clock) mirrors `momentum.TODAY` — one stubbed "today" across the app.
  `dayBucket` compares the **+07:00 calendar date** anchored at noon UTC; using the raw
  `Date` would bucket by the UTC day and mis-group anything before 07:00 Thai.
- Relative time is `เมื่อสักครู่` / `N นาที` / `N ชม.` under a day, then an absolute
  `12 ก.ค.`. **Not "N วัน"** — elapsed-hours flooring makes a 47h item read "1 วัน" while
  the panel groups it under ก่อนหน้า, so the row would contradict its own header.

**NOT built — LINE push (decided against, 2026-07-15).** `Employee.lineUserId` exists in
the HR Sheet and Thai teams live on LINE, so this is the obvious next channel. Chosen to
stay lean: **there are no `channel` / `delivered_at` columns.** Adding LINE later = a
migration + a LINE Messaging API worker keyed on `lineUserId`.

**Nothing produces notifications yet.** The feed is seeded sample data — no trigger,
job, or realtime subscription exists. See the checklist for the producer list.

---

## Lead intake & assignment — admin surface (built design-first, 2026-07-20)

The **Admin / Listing Support** role receives leads across every channel (calls, LINE, FB,
walk-in…), logs the customer + requirements, and assigns to a sales rep. Built from the
Custom Dashboard `LeadForm/CompanyLeads` + Shelter `ai-paste-box` references.

**Files:** `lib/leads.ts` (intake model) · `lib/ai/parseLead.ts` (paste-parse stub) ·
`components/{AiPasteBox,LeadForm,LeadIntakeFab,NewLeadsProvider,LeadAssignment,LeadTimeline}.tsx` ·
`lib/leadTimeline.ts`.

**Flow:** a **`+ เพิ่มลีด` FAB** (gated to the new **`leads.create`** perm — Admin / Listing
Support / Sales Leader / CEO) opens a shared `LeadForm` (two modes: `admin` adds an assign-to
picker; `rep` files to self). **Buyer vs owner** is one axis that swaps labels + the
requirements block. A **paste-to-parse** box pre-fills the form from freeform text. Submit is
optimistic → the lead appears in the rebuilt **`/assign`** management table; **`/leads/[id]`**
now shows a real **activity + assignment-history timeline** so admin has reassign context.

**Aligned to the real "Lead Submission" form** (Google Sheet `1uzSiHqZ…`, tab *Lead Submission*,
checked 2026-07-20). That form's columns: Lead Type · Listing Code · Listing Name/Project ·
Lead Name · Phone · **LINE ID** · Gender · Nationality · Remark · **Sales Assigned** (nickname
— incl. **Stone**, so Stone is assignable) · วันที่/ช่วงเวลาติดต่อ · **Marketing Channel** (+ อื่นๆ
specify) · **Contact By** · Status · complaint-tracking cols · Lead-Id. It has **no Potential and
no Bedrooms** (dropped from the form) and keeps budget/requirements in free-text **Remark**.

**Captured at intake** (`LeadForm`): name · phone · **LINE ID** · **Marketing Channel** ·
**Contact By** · **Gender** · **Nationality** · **contact date+time** · searchable listing
(code/name) · assign-to (default = owner-sale) · buyer/owner + role requirements (zone/type/
purpose) · budget · remark. `lead_type` set by *who files* (rep→Lead, admin→Company).

**Admin follow-up process** (`LeadAdminPanel` on `/leads/[id]`, gated to `leads.assign`) —
tracks the lead AFTER intake, mirroring the sheet's Recheck / Customer Complain columns:
**recheck** (did the assigned sale contact the customer? pending/contacted) + **complaint**
(toggle → status เปิด/กำลังแก้ไข/ปิด + remark). State lives in `NewLeadsProvider.process`
(per lead) — wire to the lead row / an `audit_log` update.

**New columns vs `main_6_buyer_crm` (add at wiring):** `source` (Marketing Channel), `contact_by`,
`line_id`, `gender`, `nationality`, `contact_date`/`contact_time`, `recheck_status`, complaint
fields (`has_complaint`/`complaint_status`/`complaint_remark`), and a `requirements`/remark block.

**Default assignment = the interested listing's owner-sale** (`defaultAssignee`: listing →
zone → employees), overridable by admin/CEO. Sample listing→sale lives in `lib/leads.ts`;
wire to the real listing/zone join. **Assignable = `listSalesAgents()`** (sales dept). Note the
existing **sale_id↔nickname** mismatch: real `sale_id` is a code (S-001), the assign UI uses
nicknames — the join must be resolved at wiring (a fallback option shows the raw value meanwhile).

**⚠️ All of this is design-first / not persisted.** Intake writes are stubbed (`console.log` +
optimistic `NewLeadsProvider` state); assignment overrides + the reassign audit trail live in
that provider; the timeline is seeded sample activity. **AI paste is a heuristic STUB** matching
the real Shelter contract (`{ ok, note, draft }` · nullable-everything · enum-locked · "return
null, never guess") — swap `parseLeadText`'s body for the OpenAI call (gpt-4.1 server action +
`OPENAI_API_KEY`) and the UI/handlers don't change. Wire: intake → Supabase insert; assign →
update + `audit_log` row; timeline → real activities (`related_lead_id`) + audit_log.

---

## Dashboard (analytics) — ported from HAUS V2 (built design-first, 2026-07-18)

The home page (`/`, `แดชบอร์ด`) is now the analytics dashboard, ported from the **HAUS V2
sales dashboard** (the Google-Sheets `summary_*` model). Structure mirrors it exactly:
a sub-tab bar of **ภาพรวม (team)** + **one tab per selling agent** (Stone/Pup/Game/Q/Mhow/
Golf), driven by a **month-range picker** (เดือนนี้ / 3 เดือน / 6 เดือน / ปีนี้).

**Files:** `lib/dashboard.ts` (data + helpers) · `components/dashboard/*` (Dashboard entry,
DashboardOverview, DashboardAgent, parts, **theme**) · `components/ui/AreaChart.tsx`
(hand-built SVG area chart — **no chart dependency**).

**Visual system = HAUS V2's, not the CRM shell's (2026-07-18).** `components/dashboard/theme.ts`
ports HAUS V2's `tokens.js` verbatim: deep **burgundy `#63041c`** accent, champagne **gold
`#c9a96e`** for #1, **green** activity heatmap ramp, 16px card radius, `#f8f8f8` canvas,
amber-brown (never red) negative deltas. This is the ONE surface using the burgundy — the
CRM's own maroon-reserved-for-logo rule — because the client wanted the dashboard to match
the HAUS V2 look; the rest of the CRM keeps its brighter crimson. Components are inline-styled
from `theme.ts` (mirroring how HAUS V2 keeps a single token source) rather than Tailwind
tokens, so the port stays pixel-faithful. If brand consistency later wins over fidelity,
swap `theme.ts`'s `accent` to the CRM crimson and it re-themes in one place. Signature pieces
ported: editorial `SectionHead` ([ n / 07 ] + big display title), champagne `Recognition`
spotlight, green day×agent heatmap grid.

**The core metric split (same as HAUS V2), enforced in `lib/dashboard.ts`:**
- **FLOW** (revenue, closed_count, new_leads, new_listings, actions) — summed across the
  selected months (`sumFlow`) → **obeys the picker**.
- **SNAPSHOT** (active buyers/listings, A-list, overdue leads) — "as of now" → **ignores
  the picker**.
- The revenue **trend chart** always shows the full data year with the monthly goal line
  (picker-independent), like HAUS's "รายได้ปีนี้" card.
- Everything **reconciles**: trend Σ = leaderboard Σ = hero total, because one sample
  dataset drives all of it.

**Components ported:** HeroProgress (revenue vs CEO goal + **MTD pace projection** + today
marker) · RevenueTrend (SVG area + goal line) · RevenueLeaderboard (bronze #1) · TeamKpi
Tracker (the 4 process KPIs, agents ranked, **weekly-focus** highlight) · per-agent
Period/Annual cards · InputCards (buyers/listings snapshots) · AgentKpiRows · ActionBreak
down (owner/buyer/other) · Activity heatmap (day×agent intensity).

**⚠️ All dashboard data is SAMPLE** (`lib/dashboard.ts`), deterministic (seeded, SSR-stable).
Shapes mirror the eventual Supabase rollup so wiring is a source swap. **Wiring map:**

| Dashboard data | Supabase source (build these) |
|---|---|
| `MONTHLY_FLOW` (agent, month, revenue, closed_count, new_leads, new_listings) | `v_summary_overview_monthly` — a monthly rollup materialized view |
| `SNAP` (active_buyers/listings, A-list, overdue) | live counts over `main_6_buyer_crm` + `v_main_listing`, or `v_sale_status` |
| `KPI` (the 4 KPIs, done/total) | `v_summary_kpi` — same contract as the momentum ratio KPIs |
| action breakdown / daily heatmap | `v_summary_activity_monthly` / `v_summary_heatmap_daily` (aggregate `Actions`) |
| `TEAM_GOAL_MONTHLY` | CEO targets tab (`summary_targets.team` per month) |

**Join key trap (same as everywhere):** dashboard rows key agents by **nickname**; real
rows key by **`sale_id`/`code`** — join `sale_id → employees.code → employees.nickname` at
wiring. **Stubbed clock:** `DASH_MONTH="2026-07"`, `DASH_DAY=18` drive the pace projection
and KPI weekly-focus — swap for a real clock. The old real-data dashboard (live `getCrm`/
`getListings`/`v_sale_status` cards) is **superseded**; those live numbers can feed the
snapshot cards at integration.

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
