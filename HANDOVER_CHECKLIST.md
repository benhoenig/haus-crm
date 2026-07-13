# HAUS CRM — Pre-Handover QA Checklist

> **Purpose.** The app is being built **design-first** — UI and flows first, real
> logic + database wired later. Before we hand the app over, every function and
> feature below must be **re-tested against real data** (not the current
> mock/placeholder state) and confirmed working.
>
> **How to use this file:**
> 1. Keep it **living** — whenever a feature is added, add a line here.
> 2. When the DB/logic is wired, walk this list **top to bottom** and tick each
>    item only after verifying it works with real data on **desktop AND mobile**.
> 3. Clear every ⚠️ *Data-wiring must-fix* before ticking the related feature.
> 4. Don't hand over with unchecked boxes.

Last updated: 2026-07-10 · Status: **design phase (DB not wired)**

---

## ⚠️ Data-wiring must-fixes (do these first)

- [ ] **`asking_price` vs `rental_price`** — the **source separates them cleanly**
      (Listings `AP` Asking, `AQ` Rental — see [DATA_MODEL.md](./DATA_MODEL.md)). Where
      HAUS shows a rent value under "ขาย", the bug is in the **DB view mapping**, not the
      source — fix the view to read AP→asking, AQ→rental.
- [ ] **Contacts have no real table** — `/contacts` runs on hardcoded sample data
      (`lib/contacts.ts`). Build a unified Supabase contacts table (owner/buyer/
      tenant/landlord roles + owned listings + demand) and swap `listContacts()` /
      `getContact()` to query it. Re-point owned-listing links to real IDs.
- [ ] **`listing_type` is a real authored field, NOT vestigial** — the source authors
      Listings `S` explicitly: `Sale` / `Rent` / `Sale & Rent` / `Sale with Tenant` /
      `Co - Agent`. Preserve it as the source of deal type (don't derive purely from price).
- [ ] Confirm every detail route's ID matches its source key (listing_id, lead_id,
      contact id, and lead `listing_code` → real listing IDs) so cross-links resolve.

---

## Feature checklist

### Shell / navigation
- [ ] Sidebar nav — all links route correctly, active state highlights right item
- [ ] Mobile drawer — hamburger opens; backdrop, Escape, and route-change all close it; body scroll locks while open
- [ ] Topbar per page — title/subtitle correct; `+ เพิ่มรายการ` / `ส่งออก` actions wired (currently placeholders)
- [ ] Skeleton loading shows on every data route during fetch, then swaps to content
- [ ] Invalid detail IDs render the not-found page (listings, leads, contacts)
- [ ] Responsive: every screen usable at phone width (locked project rule)

### Dashboard (`/`)
- [ ] KPI stats compute correctly from real data (listings count, active leads, pipeline value, commission)
- [ ] Pipeline board groups active deals by stage with correct sums
- [ ] Sales leaderboard table — real figures, correct ordering
- [ ] Recent leads table — correct latest ordering

### Pipeline (`/pipeline`)
- [ ] Stats (active deals, value, wins, win rate) correct
- [ ] Kanban board columns per stage with correct cards + per-column totals

### Listings (`/listings`)
- [ ] Search (project / zone / code) filters correctly
- [ ] Status filter-chips with correct counts
- [ ] **Column sorting** works by meaning (Potential tier, status order) + numeric/text; nulls last
- [ ] Cover thumbnail — shows real photo when wired, icon fallback otherwise
- [ ] Row click → correct detail page
- [ ] Detail: identity header, specs (bed/bath/area), **dual sale/rent price** (correct dimming), owner (name/phone/tel:), status + potential
- [ ] Detail placeholders replaced/removed once wired: **photo gallery**, **marketing/portal boosts** (DDproperty/Livinginsider/PropertyHub), **interested buyers**, **edit history**
- [ ] `แก้ไข` (edit) button wired

### Leads (`/leads`)
- [ ] Search (name / phone / id) filters correctly
- [ ] Stage filter-chips with correct counts
- [ ] **Column sorting** works (grade A→C, pipeline stage order, budget/commission/date)
- [ ] Row click → correct detail page
- [ ] Detail: identity header (name/phone/tel:), info sidebar (stage/status/potential/budget/type/agent/dates all correct)
- [ ] Detail: interested listing links to the real listing; **closing card** shows only for won deals with correct commission/date
- [ ] Detail placeholders replaced/removed once wired: **activity timeline** (+ logging), **edit history**
- [ ] `แก้ไข`, `นัดชม` (schedule viewing) buttons wired

### Contacts (`/contacts`)  ⚠️ *currently sample data*
- [ ] Backed by a real contacts table (see must-fix above)
- [ ] Search (name / phone / LINE) filters correctly
- [ ] Role filter-chips (เจ้าของ/ผู้ซื้อ/ผู้เช่า/ปล่อยเช่า) with correct counts
- [ ] Desktop table + mobile cards both render; row click → correct detail
- [ ] Detail: contact info (phone tel:, LINE, email, note), demand list, owned-listings list links to real listings
- [ ] **Contact privacy**: `createdBy`/`assignedTo` enforced (own/assigned unless `contacts.view_all`) — wire to RLS + real created_by/assigned_to
- [ ] `แก้ไข`, `LINE`, `เพิ่มผู้ติดต่อ` actions wired

### Projects (`/projects`)  ⚠️ *sample data (`lib/projects.ts`)*
- [ ] Backed by a real projects table; swap `listProjects`/`getProject`/`getProjectByName`
- [ ] Search + zone filter chips with correct counts
- [ ] Card grid + completeness % render; row click → detail
- [ ] Detail: specs, unit types, pros/cons, persona, fees & juristic, flood
- [ ] Project panel on **listing detail** resolves by project name (fix name→ID join)
- [ ] `แก้ไข` / “ทรัพย์ในโครงการ” filtered link wired

### Last Match (`/last-match`)  ⚠️ *sample data (`lib/lastMatch.ts` → `main_7_last_match`)*
- [ ] Wire to `main_7_last_match`; swap `listMatches`/`getComparables`
- [ ] Search + close-type filter chips; **column sorting** (date/project/zone/price/close/agent)
- [ ] Comps panel on **listing detail** filters by zone correctly
- [ ] Size (sq_wa/sq_m) + price format across mixed source formats

### Actions / KPI (`/performance`)  ⚠️ *sample data + stubbed logging (`lib/actions.ts`)*
- [ ] **Unified activity table** wired; FAB `LogActivity` actually writes a row
- [ ] Action taxonomy canonicalized (23 source values → groups; Show/Showing, Reels dupes collapsed)
- [ ] FAB tags **lead OR listing**; tagged = count-1 timeline touch, untagged = KPI tally
- [ ] Same rows appear in listing/lead **detail timelines** AND the KPI aggregate

### แผนวันนี้ / Targets — Momentum (`/today`, `/performance`)  ⚠️ *sample data (`lib/momentum.ts`)*
- [ ] Wire `tasks` + `targets` tables (per agent, per month); key to the session user (not fixed "Stone")
- [ ] Daily plan: date nav, completion ring, add/toggle/reorder persist; task type + linked target + entity
- [ ] **Auto-bridge**: activity-source targets compute from the real activities table; manual/pipeline +1 persists
- [ ] Targets: official (manager-set) vs stretch (agent) write paths; ties to KPI-target templates

### Team / บุคคล (`/team`)  ⚠️ *sample data (`lib/team.ts`)*
- [ ] Wire `employees` table (roles via user_roles, zone, status, joined, commission); effort from activities
- [ ] **Commission column gated on `financials.view`** (HR without it, incl. payroll-later)

### มอบหมาย Lead (`/assign`)  ⚠️ *stubbed assign*
- [ ] Assign writes `sale_id` on the lead; unassigned filter correct; gate on `leads.assign`

### Settings hub (`/settings`, Shelter-style single page)  ⚠️ *sample data + in-memory*
- [ ] **Roles & Permissions** (`lib/rbac.ts`): persist roles/permissions/user-roles; replace the in-memory `RbacProvider` + view-as with the auth session; enforce `can()` at the **page/server** level too (nav + FAB gating already client-side)
- [ ] **Zones** (`lib/zones.ts` → `zone`): wire table; `+ เพิ่มโซน` / row edit write (CEO)
- [ ] **Master-data** (Property Types, Action types, KPI Targets): persist edits as CEO-governed vocabularies

### ⛔ Still not designed
- [ ] Decide back-office vs. CRM for remaining unreviewed tabs (New Lead, Spending, Comments, Dashboards)

### Cross-cutting
- [ ] Money formatting (฿X ล้าน / ฿X,XXX / ฿X/ด.) correct across all views
- [ ] Thai Buddhist-era dates correct everywhere
- [ ] Numerals use the mono/tabular treatment
- [ ] Empty states show sensible copy (no rows / no results / no data)
- [ ] `ส่งออก` (export) wired or removed
- [ ] Auth / access control (if any) enforced before handover

---

## Notes
- This list reflects features as of the date above; **update it as the app grows.**
- Design decisions and rationale live in the team's design-system notes; this file
  is strictly the **"does it work with real data"** gate for handover.
