// SAMPLE DATA + logic — the Momentum layer (Daily Plan + Targets), adapted from Solo Gang.
// The bridge to the CRM is the activity log: activity-source targets auto-track from it
// (hybrid — non-activity targets use a manual +1). Decided owners: manager sets the
// "official" target, agent adds "stretch" goals. Wire later = `targets` + `tasks` tables;
// activity-source `current` becomes an aggregation over the real activities table.

import { listActivities, type Activity } from "@/lib/actions";

export const TODAY = "2026-07-13"; // stubbed "today" for the design build
const MONTH = "2026-07";
const SAMPLE_AGENT = "Stone"; // the representative agent whose plan/targets we show

// Awareness split (Solo Gang's building/working/personal, cut for sales).
export type TaskType = "build" | "work" | "personal";
export const TASK_TYPES: Record<TaskType, { label: string; tone: "accent" | "blue" | "neutral" }> = {
  build: { label: "สร้างยอด", tone: "accent" },
  work: { label: "งานประจำ", tone: "blue" },
  personal: { label: "ส่วนตัว", tone: "neutral" },
};
export const TASK_TYPE_ORDER: TaskType[] = ["build", "work", "personal"];

export type TargetKind = "count" | "baht" | "check";
export type TargetSource = "activity" | "pipeline" | "manual";
export type TargetOwner = "official" | "stretch";

export interface Target {
  id: string;
  agent: string;
  month: string;
  label: string;
  kind: TargetKind;
  target: number;
  /** Stored progress for pipeline/manual sources (activity source is computed live). */
  manualCurrent: number;
  source: TargetSource;
  /** For source="activity": the CRM action whose logged count feeds this target. */
  activityType?: string;
  owner: TargetOwner;
}

export interface Task {
  id: string;
  agent: string;
  date: string;
  title: string;
  done: boolean;
  order: number;
  type: TaskType;
  /** Links this task to a monthly target. */
  targetId?: string;
  /** CRM activity logged on completion (drives the auto-bridge). */
  activityType?: string;
  relatedLeadId?: string;
  relatedLeadName?: string;
  relatedListingId?: string;
  relatedListingName?: string;
}

const TARGETS: Target[] = [
  // Official — set by the manager.
  { id: "t_call", agent: SAMPLE_AGENT, month: MONTH, label: "โทรหาลูกค้า", kind: "count", target: 30, manualCurrent: 0, source: "activity", activityType: "Call", owner: "official" },
  { id: "t_show", agent: SAMPLE_AGENT, month: MONTH, label: "พาชม", kind: "count", target: 10, manualCurrent: 0, source: "activity", activityType: "Show", owner: "official" },
  { id: "t_owner", agent: SAMPLE_AGENT, month: MONTH, label: "เยี่ยมเจ้าของ", kind: "count", target: 12, manualCurrent: 0, source: "activity", activityType: "Owner Visit", owner: "official" },
  { id: "t_win", agent: SAMPLE_AGENT, month: MONTH, label: "ปิดการขาย", kind: "count", target: 3, manualCurrent: 1, source: "pipeline", owner: "official" },
  { id: "t_comm", agent: SAMPLE_AGENT, month: MONTH, label: "คอมมิชชั่น", kind: "baht", target: 500000, manualCurrent: 180000, source: "pipeline", owner: "official" },
  // Stretch — added by the agent.
  { id: "t_reels", agent: SAMPLE_AGENT, month: MONTH, label: "ถ่าย Reels", kind: "count", target: 6, manualCurrent: 0, source: "activity", activityType: "Reels", owner: "stretch" },
  { id: "t_source", agent: SAMPLE_AGENT, month: MONTH, label: "หาทรัพย์ใหม่", kind: "count", target: 10, manualCurrent: 0, source: "activity", activityType: "Sourcing", owner: "stretch" },
];

const TASKS: Task[] = [
  // Today
  { id: "k1", agent: SAMPLE_AGENT, date: TODAY, title: "โทรหา คุณเบิร์ด ตามเรื่องต่อรอง", done: false, order: 0, type: "build", targetId: "t_call", activityType: "Call", relatedLeadId: "L-0011", relatedLeadName: "คุณเบิร์ด" },
  { id: "k2", agent: SAMPLE_AGENT, date: TODAY, title: "พาชม ชัยพฤกษ์ กับ คุณมีน", done: false, order: 1, type: "build", targetId: "t_show", activityType: "Show", relatedLeadId: "L-0007", relatedLeadName: "คุณมีน" },
  { id: "k3", agent: SAMPLE_AGENT, date: TODAY, title: "เยี่ยมเจ้าของ อโศก คุยราคาใหม่", done: true, order: 2, type: "build", targetId: "t_owner", activityType: "Owner Visit", relatedListingId: "CASK001", relatedListingName: "Asoke Sky Residence" },
  { id: "k4", agent: SAMPLE_AGENT, date: TODAY, title: "อัพเดทพอร์ทัล Rama 2", done: false, order: 3, type: "work" },
  { id: "k5", agent: SAMPLE_AGENT, date: TODAY, title: "ออกกำลังกาย", done: false, order: 4, type: "personal" },
  // Yesterday
  { id: "k6", agent: SAMPLE_AGENT, date: "2026-07-12", title: "ถ่าย Reels เดอะ เนิน", done: true, order: 0, type: "build", targetId: "t_reels", activityType: "Reels", relatedListingId: "CBGY001", relatedListingName: "The Nern by Sansiri" },
  { id: "k7", agent: SAMPLE_AGENT, date: "2026-07-12", title: "ประชุมทีมเช้า", done: true, order: 1, type: "work" },
  // Tomorrow
  { id: "k8", agent: SAMPLE_AGENT, date: "2026-07-14", title: "หาทรัพย์ใหม่ ย่านราชพฤกษ์", done: false, order: 0, type: "build", targetId: "t_source", activityType: "Sourcing" },
];

export function currentAgent(): string {
  return SAMPLE_AGENT;
}

/** Activity-source targets read their `current` live from the activity log. */
export function targetCurrent(t: Target, activities: Activity[] = listActivities()): number {
  if (t.source !== "activity" || !t.activityType) return t.manualCurrent;
  return activities
    .filter((a) => a.created_by === t.agent && a.action === t.activityType && a.date.startsWith(t.month))
    .reduce((sum, a) => sum + a.count, 0);
}

export function targetPct(t: Target, current?: number): number {
  const cur = current ?? targetCurrent(t);
  if (t.target <= 0) return 0;
  return Math.min(100, Math.round((cur / t.target) * 100));
}

export function listTargets(agent: string = SAMPLE_AGENT): Target[] {
  return TARGETS.filter((t) => t.agent === agent && t.month === MONTH);
}

export function listTasks(agent: string = SAMPLE_AGENT): Task[] {
  return TASKS.filter((t) => t.agent === agent);
}

export function getTasksForDate(date: string, agent: string = SAMPLE_AGENT): Task[] {
  return TASKS.filter((t) => t.agent === agent && t.date === date).sort((a, b) => a.order - b.order);
}

export function getTarget(id: string | undefined): Target | undefined {
  return id ? TARGETS.find((t) => t.id === id) : undefined;
}

/** Dates (this design month) that have at least one task — for the mini date strip. */
export function taskDates(agent: string = SAMPLE_AGENT): string[] {
  return Array.from(new Set(TASKS.filter((t) => t.agent === agent).map((t) => t.date))).sort();
}

export function donePct(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100);
}
