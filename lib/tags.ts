// SAMPLE DATA + logic — free-form lead tags (design-first). Leads come from LIVE Supabase
// (main_6_buyer_crm) with NO tags column, so tags are a new concept modeled here and shaped
// to mirror the eventual wiring:
//   tags(id, label, tone?)              — the pool (free-form: grows as users create tags)
//   lead_tags(lead_id, tag_id)          — per-lead assignments (many-to-many)
// Add/remove is local state in the browser for now (not persisted) — wire to lead_tags.
// Free-form was the chosen model: any user can create a tag on the fly; the pool is the
// union of the seed below + everything users add. Colours are derived (stable per label).

const TAG_TONES = ["accent", "blue", "violet", "amber", "green", "neutral"] as const;
export type TagTone = (typeof TAG_TONES)[number];

// Tone → chip classes (uses the app's *-bg pill tokens).
export const TAG_TONE_CLASS: Record<TagTone, string> = {
  accent: "bg-accent-wash text-accent",
  blue: "bg-blue-bg text-blue",
  violet: "bg-violet-bg text-violet",
  amber: "bg-amber-bg text-amber",
  green: "bg-green-bg text-green",
  neutral: "bg-surface-2 text-text-muted",
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Stable colour for a tag label (so the same tag is always the same colour). */
export function tagTone(label: string): TagTone {
  return TAG_TONES[hash(label) % TAG_TONES.length];
}

// Initial free-form pool — realistic buyer tags a Bangkok property team would use.
export const SEED_TAGS = [
  "ร้อน",
  "นักลงทุน",
  "เร่งด่วน",
  "บอกต่อ",
  "ต่างชาติ",
  "VIP",
  "รอเงินกู้",
  "อยู่ต่างจังหวัด",
  "ซื้ออยู่เอง",
  "เย็น",
];

/** Deterministic seeded tags for a lead (0–3), so the demo shows tag data on real rows. */
export function seedTagsForLead(leadId: string): string[] {
  const h = hash(leadId);
  const count = h % 10 < 2 ? 0 : (h >> 3) % 3 === 0 ? 1 : ((h >> 5) % 3) + 1; // ~20% untagged
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const t = SEED_TAGS[(h >> (i * 4 + 1)) % SEED_TAGS.length];
    if (!out.includes(t)) out.push(t);
  }
  return out;
}

/** Build the initial per-lead tag map + pool from a set of lead ids. */
export function seedTagState(leadIds: string[]): { byLead: Record<string, string[]>; pool: string[] } {
  const byLead: Record<string, string[]> = {};
  const pool = new Set<string>(SEED_TAGS);
  for (const id of leadIds) {
    const tags = seedTagsForLead(id);
    byLead[id] = tags;
    tags.forEach((t) => pool.add(t));
  }
  return { byLead, pool: [...pool] };
}
