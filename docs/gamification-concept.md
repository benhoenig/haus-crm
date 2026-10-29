# HAUS CRM — Gamification Concept (ภารกิจ · XP · เลเวล · สตรีค)

**สถานะ:** Concept / ร่างเพื่อคุยกับ Ben · **อัปเดต:** 2026-10-29 · **Demo:** 12 พ.ย. 2026
**ขอบเขต:** เอกสารออกแบบเท่านั้น ยังไม่มีโค้ด ไม่มี DB · ใช้ quest engine ตัวเดียวกับ ticket **#82** (production metrics monitoring + ความคืบหน้างาน back-office ที่เซลล์มองเห็น)

> **TL;DR** — ให้ทุกการกระทำจริงใน CRM (ติ๊กงานในแผนวันนี้, ขยับสเตจลีด, ปิดดีล, ทำ checklist A-List, คลิปได้ saves) ไหลเข้า **event log เดียว** แล้วให้ **quest engine ตัวเดียว** แปลงเป็นความคืบหน้า ฝั่ง gamification แสดงผลเป็น XP/เควส/แบดจ์ ส่วน #82 แสดงผลเป็นหน้า monitor ตัวเลขและความคืบหน้า เป็น engine เดียวกันแต่มีสองหน้าจอ

---

## 1. เป้าหมาย และใครเป็นผู้เล่น

| ผู้เล่น | คนจริงวันนี้ | อยากให้เกิดพฤติกรรมอะไร | สิ่งที่เขาได้เห็น |
|---|---|---|---|
| **เซลล์** | Pup, Game (หัวหน้าทีม), Q, Mhow, Golf, Stone (CEO + ขายเอง) | ทำ 4 KPI หลักให้สม่ำเสมอ (Owner Talk, Sourcing, Survey, Buyer Follow) · ดันลีดไปถึงสเตจถัดไป · หาทรัพย์ใหม่ | เควสวันนี้/สัปดาห์นี้, XP, สตรีค, อันดับ |
| **Back-office** | Benz (Listing Support), Pui (Marketing), Content Creator (ยังไม่จ้าง) | ทำ checklist A-List/Exclusive ตรงเวลา · โพสต์ซ้ำตามรอบ 6 วัน · recheck ลีดที่ assign แล้ว · คอนเทนต์ได้ saves+shares | เควสฝั่งงานสนับสนุน และเห็นว่างานตัวเองช่วยดีลของเซลล์ไปแค่ไหน |
| **ผู้จัดการ** | Stone (CEO), Pup/Game (Sales Leader) | **ดูภาพรวม**ได้ว่าใครเดิน ใครติด โดยไม่ต้องไล่ถาม · ใช้เป็นเครื่องมือ coaching | team quest board, หน้า monitor ของ #82, สรุปรายสัปดาห์ทาง LINE |

**หลักคิด 4 ข้อ**
1. **ให้แต้มกับพฤติกรรมที่บริษัทวัดอยู่แล้ว** ใช้ action vocabulary ชุดเดียวกับ KPI/probation (`ACTION_GROUPS`, Settings → ประเภทกิจกรรม) ไม่สร้างหน่วยวัดใหม่ขึ้นมาแข่ง
2. **ทีมเล็กมาก** (เซลล์ 6 คน) อันดับดิบจะทำให้คนท้ายตารางท้อ จึงเน้น **เควสส่วนตัว + เควสทีม + personal best** โดยมีอันดับเป็นแค่ส่วนเสริม
3. **ผลลัพธ์ต้องได้แต้มมากกว่าปริมาณ** Show 1 ครั้งต้องคุ้มกว่าโทร 10 สาย และการปิดดีลต้องคุ้มที่สุด
4. **ไม่ยุ่งกับเงินที่เป็นสัญญา** คอมมิชชั่นและโบนัส Content Creator (content-kpi) เป็นข้อตกลงจ้างงาน gamification อ่านค่าเหล่านี้ได้ แต่ห้ามเปลี่ยน

---

## 2. Action ไหนได้แต้ม (XP table ร่างแรก)

แหล่งข้อมูลทั้งหมด**มีอยู่แล้ว หรืออยู่ในแผน wiring แล้ว** ไม่ต้องให้ใครกรอกเพิ่ม

| กลุ่ม | Action / Event | XP | แหล่งข้อมูล | เพดาน/กติกา |
|---|---|--:|---|---|
| ลูกค้า | Call · Follow | 1 | `activities` (ติ๊กงานในแผนวันนี้) | สูงสุด 20 XP/วัน |
| ลูกค้า | Appoint | 3 | `activities` + ต้องผูก lead | – |
| ลูกค้า | Show | 8 | `activities` + ต้องผูก lead | – |
| ลูกค้า | Nego | 10 | stage change ใน `main_6_buyer_crm` | 1 ครั้ง/ลีด/สเตจ |
| ลูกค้า | Close (เซ็นสัญญา) | 50 | `Close-Case` วันที่ปิด | – |
| ลูกค้า | Win (โอนจริง) | 100 | `Close-Case` Status=`Success` + วันที่โอน | – |
| ทรัพย์ | Owner Visit · Survey · ประเมิน | 4 | `activities` + ต้องผูก listing | 1 ครั้ง/ทรัพย์/วัน |
| ทรัพย์ | New List (ทรัพย์ใหม่ status Posted) | 15 | `v_main_listing` (`created_by`) | นับเมื่อข้อมูลครบ ไม่ใช่ตอนเป็น `Need Info` |
| ทรัพย์ | ทรัพย์ขึ้น A-List / Exclusive | 20 / 40 | `potential` เปลี่ยน | – |
| ทรัพย์ | Update Price (หลัง Owner Talk) | 3 | `activities` | 1 ครั้ง/ทรัพย์/สัปดาห์ |
| วินัย | ทำแผนวันนี้ครบ ≥ 80% | 5 | `tasks` | 1 ครั้ง/วัน |
| วินัย | KPI weekly-focus ของสัปดาห์นี้ถึงเป้า | 25 | `summary_kpi` / targets | 1 ครั้ง/KPI/เดือน |
| Back-office | checklist item เสร็จก่อน due | 3 | listing checklist (CHECKLIST_FEATURE) | – |
| Back-office | re-post ตามรอบ (cadence ไม่แดง) | 2 | checklist `cadence` | 1 ครั้ง/ทรัพย์/รอบ |
| Back-office | lead recheck เสร็จภายใน 24 ชม. | 3 | `recheck_status` (LeadAdminPanel) | – |
| Back-office | lead ที่ assign ให้เซลล์ไปถึง Show | +5 แบ่งให้คน intake | stage change | ได้แต้มจากผลงานร่วม |
| Content | คลิปเข้า band ตาม saves+shares | 10–40 | **content-kpi (Neon) อ่านอย่างเดียว** | ใช้ค่าจาก round ที่ lock แล้วเท่านั้น |
| Content | qualified lead จาก TikTok | 10 | content-kpi `leads.is_qualified` | – |

> ตัวเลขทั้งหมดเป็น **ค่าตั้งต้นสำหรับ calibration** CEO ปรับได้ใน Settings และควรเก็บเป็นเวอร์ชันตามวันที่ (แบบเดียวกับ `tier_schedules` ใน content-kpi) เพื่อไม่ให้การแก้ตารางแต้มย้อนไปเปลี่ยน XP ที่ได้ไปแล้ว

---

## 3. กลไกเกม

### 3.1 เควส (Quest)
เควสคือ **กลุ่มเงื่อนไข "action × เป้า × ช่วงเวลา"** ซึ่งเป็นโครงเดียวกับ `RankCriterion` ใน `lib/probation.ts` engine นี้จึงเป็นการขยายของเดิม ไม่ได้เขียนใหม่

| ประเภท | ตัวอย่าง | ใครตั้ง |
|---|---|---|
| **รายวัน** (3 ข้อ หมุนเวียน) | "โทรตามลีด 5 สาย" · "Owner Talk 2 ทรัพย์" · "ทำแผนวันนี้ครบ" | ระบบสุ่มจาก pool ตาม KPI ที่เป็น focus ของสัปดาห์นี้ |
| **รายสัปดาห์** | สัปดาห์ 2–3: "Sourcing 5 + Survey 3" | ผูกกับ **weekly-focus** ที่มีอยู่แล้ว (Owner Talk wk1 · Sourcing/Survey wk2–3 · Buyer Follow wk4) |
| **รายเดือน / เป้าทางการ** | 4 KPI ทางการถึง 100% | ดึงจาก Targets ที่หัวหน้าตั้ง ไม่ต้องตั้งซ้ำ |
| **เควสทีม** | "ทีม A พาชมรวม 15 ครั้งเดือนนี้" · "ทุก A-List ไม่มี cadence แดงทั้งสัปดาห์" (sales + back-office ร่วมกัน) | CEO / Sales Leader |
| **เควสต่อเนื่อง (chain)** | **บันไดเซลล์ใหม่ = quest chain** ย้าย probation ranks มาอยู่บน engine นี้ | CEO (มีอยู่แล้ว) |
| **เควสพิเศษ** | "ทรัพย์โซนศาลายาใหม่ 3 รายการภายในสิ้นเดือน" | CEO ตั้งเป็นครั้งคราว |

### 3.2 XP และเลเวล
- XP สะสมตลอดชีพจาก **XP ledger แบบ append-only** มีไว้ใช้จัดเลเวลอย่างเดียว ไม่ได้ใช้แลกของรางวัล
- ตั้ง 10 เลเวล ใช้ชื่อสายอสังหาฯ เช่น ฝึกหัด → นักสำรวจ → นักล่าทรัพย์ → ที่ปรึกษา → … → ตำนาน HAUS โดยเส้นโค้ง XP ทำให้คนที่เข้ามาใหม่ขึ้นเลเวล 2–3 ได้ในเดือนแรก
- **เลเวลกับ rank เซลล์ใหม่เป็นคนละเรื่องกัน** rank คือสถานะ probation ที่ CEO กำหนดและผูกกับการผ่านงาน ส่วนเลเวลเป็นของทุกคนและมีไว้เพื่อแรงจูงใจเท่านั้น

### 3.3 สตรีค (Streak)
- 1 วันสตรีค = **วันทำงานที่มี KPI action ≥ 1 หรือทำแผนวันนี้ ≥ 50%**
- **วันลาที่อนุมัติแล้ว, วันหยุด และเสาร์–อาทิตย์ไม่ทำให้สตรีคขาด** อ่านจาก `leave_requests` ได้เลยเพราะระบบลามีอยู่แล้ว เพื่อไม่ให้ใครรู้สึกว่าต้องทำงานในวันลา
- ให้ "freeze" 1 ครั้ง/เดือน ไว้ใช้ตอนป่วยกะทันหัน · หลักไมล์ที่ 5 / 20 / 60 วันได้แบดจ์
- ปัจจุบันแดชบอร์ดมี award "ดาวเด่นความสม่ำเสมอ" (`consistencyTop`) อยู่แล้ว สตรีคจึงควรใช้นิยามเดียวกันเพื่อให้สองระบบให้ตัวเลขตรงกัน

### 3.4 แบดจ์ (Badges)
ตั้งเป็น 3 ชั้น (ทองแดง/เงิน/ทอง) ได้แล้วถือไว้ถาวร (monotonic เหมือน `rank_achievement`) ตัวอย่าง:
- **นักล่าทรัพย์** — New List 5/15/40 · **มือปิด** — Win 1/5/15 · **Owner Talk ครบเดือน** 1/3/6 เดือนติด
- **คู่หูหลังบ้าน** (back-office) — A-List ที่ดูแลปิดดีลได้ · **ไม่มีแดง** — cadence ตรงรอบ 4 สัปดาห์ติด
- **ไวรัล** (content) — คลิปเข้า band สูงสุด · **ผ่านโปร** — ผ่านบันไดเซลล์ใหม่ครบ
- แบดจ์ award ของแดชบอร์ดเดิม (สุดยอดนักขาย, เป้าแน่น, มาแรง ฯลฯ) ย้ายมาเป็น **แบดจ์รายเดือน** บน engine เดียวกัน

### 3.5 Leaderboard
- **ซีซัน = รายเดือน** ใช้ XP ของซีซัน (reset ทุกเดือน) ไม่ใช่ XP สะสม คนที่ตามหลังจึงยังมีโอกาสแซงทุกเดือน
- มี 3 มุมมอง ได้แก่ **รายบุคคล** · **ทีม A vs ทีม B** (XP เฉลี่ยต่อหัว) · **มาแรง** (% เทียบเดือนก่อน)
- **แยกดิวิชัน**: เซลล์ใหม่ (มี `probationStart`) ไม่ต้องแข่งกับรุ่นพี่ และ back-office มีบอร์ดของตัวเอง
- คนอันดับ 4–6 เห็นแค่ "อีก 35 XP แซงอันดับถัดไป" และไม่เห็นว่าตัวเองอยู่ท้ายตาราง
- การมองเห็นใช้ RBAC เดิม (`performance.view_team`) แสดงแค่ XP กับแบดจ์ ไม่แสดงยอดเงินคอมมิชชั่น

### 3.6 กติกากันโกง (Anti-gaming)
| ความเสี่ยง | กติกา |
|---|---|
| กดบันทึก Call รัว ๆ | เพดาน XP/วันต่อ action · ให้น้ำหนักกับ outcome สูงกว่า volume |
| Show/Appoint แบบไม่มีลูกค้าจริง | ต้องผูก lead/listing ที่มีอยู่จริงถึงจะได้แต้ม · 1 ครั้ง/ลีด/สเตจ |
| ดันสเตจขึ้น-ลงซ้ำเพื่อเก็บแต้ม | ให้แต้มเฉพาะ**ครั้งแรก**ที่ลีดไปถึงสเตจนั้น และถ้าถอยสเตจก็ไม่ได้คืน |
| บันทึกย้อนหลังเป็นกอง | ลงย้อนหลังได้ไม่เกิน 48 ชม. ถ้าเกินจะได้ 0 XP แต่ยังนับเป็น KPI ตามปกติ |
| ปิดดีลแล้วล่ม | Close ได้แต้มเมื่อเซ็น ถ้า `Fail` ภายหลังจะ**ลงรายการหักใน ledger** (ไม่ลบประวัติ) · Win นับเฉพาะ `Success` |
| สร้างทรัพย์/ลีดปลอม | New List นับเมื่อ status `Posted` และข้อมูลครบ · หัวหน้าสุ่มตรวจได้จาก audit view |
| แก้ตารางแต้มแล้วกระทบ XP ย้อนหลัง | ตารางแต้มมีเวอร์ชันตามวันที่ และ ledger ห้ามแก้ |
| ยังไม่มี auth (สลับ view-as ได้) | **ห้ามเปิดใช้รางวัลจริงก่อนมี login + RLS** ตามลำดับงานใน DATA_MODEL |
| คนที่ตัวเลขดีโดยธรรมชาติกวาดหมด (เช่น CEO ขายเอง) | Stone ไม่อยู่ในบอร์ดชิงรางวัล (หรือแยกดิวิชัน) ซึ่งต้องให้ Ben ตัดสิน |

---

## 4. ข้อเสนอรางวัล

แบ่งเป็นสามชั้น และ**ไม่ผูกกับคอมมิชชั่น**
1. **การยอมรับ (ไม่มีค่าใช้จ่าย):** แบดจ์บนโปรไฟล์ · ชื่อขึ้นในสรุป LINE ประจำสัปดาห์ (ใช้ LINE push เดียวกับ CEO report ใน haus-dashboard) · Recognition card บนแดชบอร์ด
2. **รางวัลที่ช่วยธุรกิจไปด้วย (แนะนำ):** **งบ DD/LV Boost** ให้ทรัพย์ของผู้ชนะ · ได้ให้ Content Creator ถ่าย Reels ให้ทรัพย์ตัวเองก่อน · ป้ายติดทรัพย์ชุดใหม่
3. **รางวัลส่วนตัว (มีเพดานรายเดือน):** มื้อกลางวันกับ CEO · ครึ่งวันหยุดพิเศษ (ลงระบบลาเป็นประเภทใหม่) · voucher ไม่เกิน ฿500–1,000/คน/เดือน
- ผู้ชนะของซีซันได้รางวัลชั้น 2 · ทุกคนที่ทำ**เควสรายเดือนครบ**ได้รางวัลชั้น 1 (ไม่ใช่ winner-takes-all)
- **เดือนแรกไม่มีรางวัล** ใช้เป็นช่วง calibration ดูว่าแต้มกระจายตัวอย่างไรก่อน

---

## 5. หน้าจอสำหรับ Demo 12 พ.ย.

ทำแบบ design-first เหมือนส่วนอื่นของ CRM: seed ข้อมูลใน `lib/*.ts` + React context store, เก็บใน memory, reset เมื่อ reload และใช้ design system เดิม (token เท่านั้น, ตัวเลข `.num`, สถานะเป็นจุดสี)

| # | หน้าจอ | อยู่ตรงไหน | สิ่งที่โชว์ |
|---|---|---|---|
| 1 | **การ์ดเควสบนแผนวันนี้** | `/today` ด้านบน | เควสวันนี้ 3 ข้อ + แถบ XP + 🔥 สตรีค · ติ๊กงานแล้วเห็น XP ขึ้นทันที (**ช็อตหลักของ demo**) |
| 2 | **หน้า ภารกิจ** (`/quests`) | เมนู ภาพรวม | แท็บ วันนี้ / สัปดาห์ / เดือน / ทีม · progress bar ต่อเงื่อนไข |
| 3 | **โปรไฟล์ + ตู้แบดจ์** | แท็บใน `/team/[id]` | เลเวล, แบดจ์ (ได้แล้ว / ยังล็อก), สถิติสตรีค |
| 4 | **Leaderboard ซีซัน** | `/quests` หรือการ์ดบนแดชบอร์ด | บุคคล / ทีม / มาแรง · แยกดิวิชันเซลล์ใหม่ |
| 5 | **Team monitor (ผู้จัดการ = หน้าของ #82)** | `/performance` หรือ `/monitor` | ตารางคน × เควส/เมตริก, สีบอกว่าตามแผน/เสี่ยง/ตก · progress งาน back-office ต่อทรัพย์ A-List |
| 6 | **Quest builder** | ตั้งค่า → ภารกิจ (`masterdata.govern`) | สร้างเควสจาก action × เป้า × ช่วงเวลา (UI เดียวกับ SalesRankManager) |
| 7 | **ภาพ mock LINE สรุปรายสัปดาห์** | สไลด์/ภาพ (ยังไม่ส่งจริง) | Flex message: Top 3, เควสทีม, ใครสตรีคยาวสุด |

**ลำดับ demo (5 นาที):** Golf (เซลล์ใหม่) เปิดแผนวันนี้ → ติ๊ก Show แล้ว XP ขึ้นและเควสครบ → แบดจ์ปลดล็อก → สลับ view-as เป็น Benz แล้วทำ checklist A-List → สลับเป็น Stone เพื่อดู team monitor ว่าทั้งสองงานเข้าแล้ว → เปิด quest builder แล้วสร้างเควสใหม่สด

---

## 6. Data model (ร่าง)

```
                 ┌─────────────── แหล่ง event (มีอยู่แล้ว / อยู่ในแผน) ───────────────┐
 activities ─┐   main_6_buyer_crm (stage) · Close-Case · v_main_listing · tasks
             ├─► listing_checklist_state · leads recheck · leave_requests (สำหรับสตรีค)
             │   content-kpi (Neon): measurement_rounds (locked) · leads.is_qualified
             ▼
      game_event  (ปกติเป็น VIEW/union ไม่ใช่สำเนา · content metrics ใช้ nightly import)
             │
             ▼
   ┌──────── QUEST ENGINE (shared กับ #82) ────────┐
   │ quest_def ─< quest_criterion                   │
   │ evaluate(person, quest, window) → progress     │
   └───────┬───────────────────────────┬────────────┘
           ▼                           ▼
   xp_ledger · badge_award ·     metric_snapshot (#82 monitor,
   streak_day · season_score     daily per person × metric)
```

| ตาราง | คอลัมน์หลัก | หมายเหตุ |
|---|---|---|
| `game_event` (view) | `employee_id, event_type, entity_type, entity_id, occurred_at, qty, source` | union จากแหล่งด้านบน ใช้ `employees.code` เป็น key (ระวัง trap เรื่อง nickname ↔ `sale_id`) |
| `quest_def` | `id, name, kind (daily/weekly/monthly/team/chain/special), audience (role/team/person), starts_on, ends_on, xp_reward, badge_id?, is_active` | chain = probation ladder |
| `quest_criterion` | `quest_id, metric_key, target, window (day/week/month/total/custom), aggregation (count/sum/ratio)` | ขยายจาก `rank_criterion` |
| `metric_def` | `key, label, source, filter, unit, owner_role` | **คลังเมตริกกลาง** ที่ใช้ร่วมกับ #82 |
| `xp_rule` | `event_type, xp, daily_cap, requires_entity, effective_from` | มีเวอร์ชันตามวันที่ ห้ามแก้แถวเดิม |
| `xp_ledger` | `id, employee_id, event_ref, rule_id, xp, reason, created_at` | **append-only** แก้ไขด้วยการลงรายการหัก |
| `quest_progress` | `quest_id, employee_id/team_id, period, value, completed_at?` | derived cache (คำนวณใหม่ได้ทุกเมื่อ) |
| `badge_def` / `badge_award` | `badge_id, employee_id, tier, awarded_at` | ถาวร |
| `streak_day` | `employee_id, date, status (active/leave/holiday/freeze/miss)` | |
| `season` / `season_score` | `month, employee_id, xp, rank, division` | lock สิ้นเดือน |
| `reward_def` / `reward_grant` | `reward_id, employee_id, season, granted_by, granted_at` | CEO อนุมัติ ไม่จ่ายอัตโนมัติ |
| `metric_snapshot` (#82) | `date, employee_id, metric_key, value, target` | แบบเดียวกับ `kpi_history` ใน haus-dashboard |

**ข้อมูลจาก content-kpi:** อยู่คนละ DB (Neon) ให้ทำ **nightly job ฝั่ง CRM ที่อ่านแบบ read-only** (role ที่อ่านได้อย่างเดียว) แล้ว upsert ลง `external_metric_daily` ใน Supabase · ใช้เฉพาะค่าของ round ที่ `locked_at` แล้ว เพื่อให้ XP ตรงกับเงินที่จ่ายจริง · ห้ามเขียนกลับไปที่ Neon

---

## 7. Quest engine ที่ใช้ร่วมกับ #82

> ⚠️ ไม่พบรายละเอียด #82 ใน repo ส่วนนี้จึงอิงจากชื่อ ticket ("production metrics monitoring + back-office progress for sales") ต้องให้ Ben ยืนยันขอบเขต

**แนวคิด: engine เดียว, consumer สองตัว**
- **Engine** = `metric_def` (นิยามว่าเมตริกนับจากอะไร) + `quest_def/criterion` (เป้า × ช่วงเวลา) + `evaluate()` ที่เป็น pure function (แบบเดียวกับ `evaluateLadder` ใน `lib/probation.ts`)
- **Consumer A — Gamification:** progress ที่ครบเงื่อนไข → XP / แบดจ์ / สตรีค
- **Consumer B — #82 Monitoring:** progress เดียวกันแสดงเป็นตัวเลขเทียบเป้า สถานะ ตามแผน/เสี่ยง/ตก และ snapshot รายวัน ไม่มี XP
- **Back-office progress ที่เซลล์มองเห็น** = เควสระดับ **listing** (ไม่ใช่ระดับคน) เช่น "A-List HRP1001: เอกสารครบ · โพสต์ DD/LV แล้ว · re-post ตรงรอบ" เซลล์เจ้าของทรัพย์เห็นความคืบหน้า ส่วน Benz/Pui ได้ XP จากงานชุดเดียวกัน

**สิ่งที่ต้องตกลงร่วมกันให้ได้ก่อน** (ถ้าไม่ตกลง สองฝั่งจะนับไม่ตรงกัน)
1. `metric_def` เป็นที่เดียวที่นิยามว่า "Show 1 ครั้ง" คืออะไร ใช้ร่วมกับ KPI Targets, probation, แดชบอร์ด และ #82
2. ช่วงเวลานับตาม **เวลากรุงเทพ** (ปัญหาเดียวกับ `captured_month` ใน content-kpi และ `dayBucket` ใน notifications)
3. ใช้ `employees.code` เป็น key เดียว ไม่ใช้ nickname
4. FLOW vs SNAPSHOT ตามกติกาของแดชบอร์ด: เควสนับเฉพาะ FLOW

---

## 8. Phased rollout

| เฟส | ช่วงเวลา | ขอบเขต | เงื่อนไขก่อนเริ่ม |
|---|---|---|---|
| **0 · Demo** | ถึง 12 พ.ย. | หน้าจอ 1–7 แบบ design-first, seed data, ไม่มี DB | – |
| **1 · Pilot เซลล์** | ธ.ค. | XP ledger, เควสรายวัน/สัปดาห์, สตรีค, แบดจ์ชุดแรก · **ยังไม่มีรางวัล** · calibration ตารางแต้ม | auth + RLS + `activities`/`tasks` เขียนลง DB จริง |
| **2 · Back-office + #82** | ม.ค. | เควส checklist/recheck, listing-level progress, team monitor, snapshot รายวัน, LINE สรุปรายสัปดาห์ | checklist (CHECKLIST_FEATURE เฟส 2) ต่อ DB แล้ว |
| **3 · ซีซัน + รางวัล + Content** | ก.พ. | leaderboard ซีซัน, reward catalog, import จาก content-kpi | จ้าง Content Creator แล้ว · CEO อนุมัติงบรางวัล |
| **4 · ปรับจูน** | รายไตรมาส | ทบทวนแต้ม/เพดาน, ดูว่าเควสไหนไม่มีใครทำ, ถามความเห็นทีม | – |

**ตัวชี้วัดว่าได้ผล:** % วันที่ทำแผนวันนี้ครบ · ค่าเฉลี่ย 4 KPI · จำนวนลีดที่ค้างเกินกำหนด (overdue) ลดลง · cadence แดงลดลง · ทีมรู้สึกว่า "แฟร์" (แบบสอบถามสั้นหลังเฟส 1)

---

## 9. คำถามเปิดสำหรับ Ben

1. **ขอบเขต #82** ตรงกับที่ตีความในข้อ 7 ไหม และใครเป็นคนดูหน้า monitor (CEO อย่างเดียว หรือหัวหน้าทีมด้วย)
2. **Stone อยู่ในบอร์ดไหม** ในเมื่อเป็นทั้ง CEO และเซลล์ จะให้แข่งด้วย แยกดิวิชัน หรือไม่นับ
3. **งบรางวัล** ต่อเดือนเท่าไร และ CEO โอเคกับรางวัลแบบ "งบ Boost ให้ทรัพย์" ไหม
4. **ความโปร่งใส:** เซลล์เห็น XP ของเพื่อนทุกคน หรือเห็นแค่ Top 3 + ตัวเอง
5. **Back-office แข่งกันเองไหม** (ตอนนี้มีแค่ Benz กับ Pui) หรือมีแค่เควสทีมที่ทำร่วมกับเซลล์
6. **Content Creator** อยู่ใน gamification ด้วยไหม ในเมื่อมีโบนัสตามสัญญาอยู่แล้ว (เสี่ยงเป็นแรงจูงใจซ้อน)
7. **ช่องทางบันทึกจาก LINE (n8n bot)** ยังใช้อยู่หลังเลิกใช้ชีต หรือย้ายมาบันทึกใน CRM 100% ถ้ายังใช้ ต้องให้ event จาก bot เข้า `activities` ด้วย
8. **LINE push รายบุคคล** (แจ้งเควสใหม่/สตรีคใกล้ขาด) ก่อนหน้านี้เคยตัดสินใจไม่ทำ (DATA_MODEL, 2026-07-15) จะเปิดเฉพาะสรุปรายสัปดาห์ของทีมก่อนได้ไหม
9. **Demo 12 พ.ย. ใครดู** (CEO อย่างเดียว หรือทั้งทีม) เพราะมีผลกับว่าจะใช้ชื่อจริงหรือชื่อสมมติใน seed
10. หน้าเควสจะอยู่บน **CRM อย่างเดียว** หรือให้ haus-dashboard (แดชบอร์ดเดิมที่ยังรันบนชีต) แสดงด้วย
