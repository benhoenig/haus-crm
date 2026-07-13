// SAMPLE DATA — UI-first. Shape mirrors the source table `main_7_last_match`
// (see DATA_MODEL.md §4): a market-comparables ledger. Zone codes match the live
// listings (ASK/RP1/CYP/PKS/RM2/BGY…) so the comps panel on listing detail
// populates. Wire later = swap listMatches/getComparables for Supabase queries.

export type CloseType =
  | "ปิดเอง" // we closed it
  | "เจ้าของขายเอง" // owner sold direct
  | "เอเจ้นอื่นสอยไป" // another agent took it
  | "มือ 1" // developer / new
  | "ไม่รู้";

export interface LastMatch {
  last_match_id: string;
  sale_id: string | null;
  close_type: CloseType | null;
  project_name: string | null;
  property_type: string | null;
  zone: string | null; // zone code, e.g. "CYP"
  zone_name_thai: string | null;
  sq_wa: number | null;
  sq_m: number | null;
  bed: number | null;
  bath: number | null;
  last_match_price: number | null;
  last_match_remark: string | null;
  buyer_persona: string | null;
  date_created: string | null; // ISO date
}

const SAMPLE: LastMatch[] = [
  { last_match_id: "S-003-001", sale_id: "S-003", close_type: "ปิดเอง", project_name: "ชัยพฤกษ์ ปาร์ค", property_type: "ทาวน์เฮ้าส์", zone: "CYP", zone_name_thai: "ชัยพฤกษ์", sq_wa: null, sq_m: 165, bed: 3, bath: 3, last_match_price: 3650000, last_match_remark: "ปิดในซอย ลูกค้าเก่าแนะนำต่อ", buyer_persona: "ครอบครัวเริ่มต้น", date_created: "2026-07-06" },
  { last_match_id: "S-001-004", sale_id: "S-001", close_type: "เอเจ้นอื่นสอยไป", project_name: "ชัยพฤกษ์ ปาร์ค", property_type: "ทาวน์เฮ้าส์", zone: "CYP", zone_name_thai: "ชัยพฤกษ์", sq_wa: 24, sq_m: 172, bed: 3, bath: 3, last_match_price: 3900000, last_match_remark: "เอเจนท์ผู้หญิงปิดไป ราคาสูงกว่าที่เราเสนอ", buyer_persona: null, date_created: "2026-06-28" },
  { last_match_id: "S-002-002", sale_id: "S-002", close_type: "เจ้าของขายเอง", project_name: "พระราม 2 แกรนด์ วิลล่า", property_type: "บ้านเดี่ยว", zone: "RM2", zone_name_thai: "พระราม 2", sq_wa: 62, sq_m: 245, bed: 4, bath: 4, last_match_price: 11500000, last_match_remark: "เจ้าของปิดเอง แปลงมุม", buyer_persona: "เจ้าของธุรกิจฝั่งธน", date_created: "2026-06-20" },
  { last_match_id: "S-002-005", sale_id: "S-002", close_type: "ปิดเอง", project_name: "พระราม 2 แกรนด์ วิลล่า", property_type: "บ้านเดี่ยว", zone: "RM2", zone_name_thai: "พระราม 2", sq_wa: 80, sq_m: 310, bed: 5, bath: 5, last_match_price: 14200000, last_match_remark: "Prestige type ปิดได้ตามราคาตั้ง", buyer_persona: "แพทย์", date_created: "2026-05-30" },
  { last_match_id: "S-001-007", sale_id: "S-001", close_type: "ปิดเอง", project_name: "เดอะ เนิน บาย แสนสิริ", property_type: "คอนโด", zone: "BGY", zone_name_thai: "บางใหญ่", sq_wa: null, sq_m: 30, bed: 1, bath: 1, last_match_price: 2350000, last_match_remark: "1 Bed ปล่อยลงทุน ติด MRT", buyer_persona: "นักลงทุนปล่อยเช่า", date_created: "2026-07-01" },
  { last_match_id: "S-001-008", sale_id: "S-001", close_type: "มือ 1", project_name: "เดอะ เนิน บาย แสนสิริ", property_type: "คอนโด", zone: "BGY", zone_name_thai: "บางใหญ่", sq_wa: null, sq_m: 55, bed: 2, bath: 2, last_match_price: 4100000, last_match_remark: "ห้อง 2 นอน ซื้อจากโครงการโดยตรง", buyer_persona: null, date_created: "2026-06-10" },
  { last_match_id: "S-004-001", sale_id: "S-004", close_type: "ปิดเอง", project_name: "อโศก สกาย เรสซิเดนซ์", property_type: "คอนโด", zone: "ASK", zone_name_thai: "อโศก", sq_wa: null, sq_m: 62, bed: 2, bath: 2, last_match_price: 8900000, last_match_remark: "ขายให้ Expat ปล่อยเช่าต่อ yield 5%", buyer_persona: "Expat", date_created: "2026-06-25" },
  { last_match_id: "S-004-003", sale_id: "S-004", close_type: "เจ้าของขายเอง", project_name: "อโศก สกาย เรสซิเดนซ์", property_type: "คอนโด", zone: "ASK", zone_name_thai: "อโศก", sq_wa: null, sq_m: 34, bed: 1, bath: 1, last_match_price: 5200000, last_match_remark: null, buyer_persona: null, date_created: "2026-05-18" },
  { last_match_id: "S-003-006", sale_id: "S-003", close_type: "ปิดเอง", project_name: "บ้านกลางเมือง ราชพฤกษ์", property_type: "ทาวน์โฮม", zone: "RP1", zone_name_thai: "ราชพฤกษ์ต้น", sq_wa: 20, sq_m: 150, bed: 3, bath: 2, last_match_price: 4300000, last_match_remark: "รีเซลสภาพดี", buyer_persona: "First jobber", date_created: "2026-06-15" },
  { last_match_id: "S-002-009", sale_id: "S-002", close_type: "เอเจ้นอื่นสอยไป", project_name: "เพชรเกษม โฮม เพลส", property_type: "บ้านแฝด", zone: "PKS", zone_name_thai: "เพชรเกษม", sq_wa: 35, sq_m: 140, bed: 3, bath: 3, last_match_price: 5100000, last_match_remark: "ไม่จบเพราะลูกค้าต่อราคาเยอะ", buyer_persona: null, date_created: "2026-06-02" },
  { last_match_id: "S-001-011", sale_id: "S-001", close_type: "ไม่รู้", project_name: "ที่ดินพุทธมณฑลสาย 2", property_type: "ที่ดิน", zone: "PTM", zone_name_thai: "พุทธมณฑลสาย 2", sq_wa: 100, sq_m: null, bed: null, bath: null, last_match_price: 4000000, last_match_remark: "ตร.วา ละ 40K ถมแล้ว", buyer_persona: null, date_created: "2026-05-10" },
  { last_match_id: "S-003-012", sale_id: "S-003", close_type: "ปิดเอง", project_name: "ชัยพฤกษ์ ปาร์ค", property_type: "ทาวน์เฮ้าส์", zone: "CYP", zone_name_thai: "ชัยพฤกษ์", sq_wa: 21, sq_m: 158, bed: 3, bath: 2, last_match_price: 3480000, last_match_remark: "Type A ปิดไว 2 สัปดาห์", buyer_persona: "ครอบครัวเริ่มต้น", date_created: "2026-07-09" },
];

export function listMatches(): LastMatch[] {
  return [...SAMPLE].sort((a, b) => (b.date_created ?? "").localeCompare(a.date_created ?? ""));
}

/** Comparable closes in the same zone — powers the listing-detail comps panel. */
export function getComparables(zone: string | null | undefined, limit = 4): LastMatch[] {
  if (!zone) return [];
  return listMatches()
    .filter((m) => m.zone === zone)
    .slice(0, limit);
}

const CLOSE_TONE: Record<string, "green" | "neutral" | "amber" | "blue"> = {
  ปิดเอง: "green",
  เจ้าของขายเอง: "neutral",
  เอเจ้นอื่นสอยไป: "amber",
  "มือ 1": "blue",
  ไม่รู้: "neutral",
};

export function closeTypeTone(t: string | null | undefined): "green" | "neutral" | "amber" | "blue" {
  return (t && CLOSE_TONE[t]) || "neutral";
}

/** "62 ตร.วา · 245 ตร.ม." style size summary from the split columns. */
export function sizeSummary(m: LastMatch): string {
  const parts: string[] = [];
  if (m.sq_wa != null) parts.push(`${m.sq_wa} ตร.วา`);
  if (m.sq_m != null) parts.push(`${m.sq_m} ตร.ม.`);
  return parts.join(" · ") || "—";
}
