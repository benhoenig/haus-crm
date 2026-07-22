"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  Target as TargetIcon,
  UserRound,
  Building2,
  Clock,
  Repeat,
  StickyNote,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { RingProgress } from "@/components/ui/RingProgress";
import { Input } from "@/components/ui/Input";
import { TaskDetailSheet, type TaskDraft } from "@/components/TaskDetailSheet";
import { formatThaiDate } from "@/lib/format";
import {
  listTasks,
  getTarget,
  TASK_TYPES,
  TASK_TYPE_ORDER,
  TODAY,
  type Task,
  type TaskType,
} from "@/lib/momentum";
import { cn } from "@/lib/cn";

function addDays(iso: string, n: number): string {
  // Parse + format in UTC so the date never shifts across timezones.
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function relLabel(iso: string): string | null {
  if (iso === TODAY) return "วันนี้";
  if (iso === addDays(TODAY, 1)) return "พรุ่งนี้";
  if (iso === addDays(TODAY, -1)) return "เมื่อวาน";
  return null;
}

export function DailyPlan({ agent }: { agent: string }) {
  const [tasks, setTasks] = React.useState<Task[]>(() => listTasks(agent));
  const [date, setDate] = React.useState(TODAY);
  const [draft, setDraft] = React.useState("");
  const [draftType, setDraftType] = React.useState<TaskType>("work");
  const [sheet, setSheet] = React.useState<{ open: boolean; task: Task | null }>({
    open: false,
    task: null,
  });

  const dayTasks = tasks
    .filter((t) => t.date === date)
    .sort((a, b) => a.order - b.order);
  const doneCount = dayTasks.filter((t) => t.done).length;
  const pct = dayTasks.length ? Math.round((doneCount / dayTasks.length) * 100) : 0;

  const toggle = (id: string) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const cycleType = (id: string) =>
    setTasks((ts) =>
      ts.map((t) =>
        t.id === id
          ? { ...t, type: TASK_TYPE_ORDER[(TASK_TYPE_ORDER.indexOf(t.type) + 1) % TASK_TYPE_ORDER.length] }
          : t
      )
    );

  const add = () => {
    const title = draft.trim();
    if (!title) return;
    // TODO (wiring): smart time parse — if the quick-add text starts with a time
    // (e.g. "10.00 นั่งสมาธิ" / "10:00 นั่งสมาธิ"), extract HH:MM into startTime and
    // strip it from the title. Quick-add only. See HANDOVER_CHECKLIST → Momentum.
    const order = Math.max(-1, ...dayTasks.map((t) => t.order)) + 1;
    setTasks((ts) => [
      ...ts,
      { id: `new_${ts.length}_${order}`, agent, date, title, done: false, order, type: draftType },
    ]);
    setDraft("");
  };

  const cycleDraftType = () =>
    setDraftType((t) => TASK_TYPE_ORDER[(TASK_TYPE_ORDER.indexOf(t) + 1) % TASK_TYPE_ORDER.length]);

  // Advanced add / edit via the detail sheet.
  const applyDraft = (d: TaskDraft) => {
    if (sheet.task) {
      const id = sheet.task.id;
      setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...d } : t)));
    } else {
      const order = Math.max(-1, ...dayTasks.map((t) => t.order)) + 1;
      setTasks((ts) => [
        ...ts,
        { id: `new_${ts.length}_${order}`, agent, date, done: false, order, ...d },
      ]);
    }
  };
  const deleteTask = () => {
    if (!sheet.task) return;
    const id = sheet.task.id;
    setTasks((ts) => ts.filter((t) => t.id !== id));
  };

  const rel = relLabel(date);

  return (
    <Card>
      {/* Header: date nav + ring */}
      <div className="flex items-center justify-between gap-3 p-4 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setDate((d) => addDays(d, -1))}
            aria-label="วันก่อนหน้า"
            className="size-8 grid place-items-center rounded-md border border-border text-text-muted hover:bg-surface-hover transition-colors shrink-0"
          >
            <ChevronLeft size={16} strokeWidth={1.75} />
          </button>
          <div className="min-w-0">
            <div className="text-label text-text-subtle">แผนประจำวัน{rel ? ` · ${rel}` : ""}</div>
            <div className="text-h3 num">{formatThaiDate(date)}</div>
          </div>
          <button
            onClick={() => setDate((d) => addDays(d, 1))}
            aria-label="วันถัดไป"
            className="size-8 grid place-items-center rounded-md border border-border text-text-muted hover:bg-surface-hover transition-colors shrink-0"
          >
            <ChevronRight size={16} strokeWidth={1.75} />
          </button>
          {date !== TODAY && (
            <button
              onClick={() => setDate(TODAY)}
              className="text-small font-medium text-accent border border-accent rounded-md px-2.5 h-8 shrink-0 hover:bg-accent-wash transition-colors"
            >
              วันนี้
            </button>
          )}
        </div>
        <RingProgress pct={pct} size={56} stroke={6} />
      </div>

      <CardContent className="p-0">
        <div className="px-4 py-2.5 text-small text-text-muted border-b border-border">
          {dayTasks.length ? `เสร็จ ${doneCount} จาก ${dayTasks.length}` : "ยังไม่มีแผนสำหรับวันนี้"}
        </div>

        <TaskRatioBar tasks={dayTasks} />

        <ul className="divide-y divide-border">
          {dayTasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onToggle={() => toggle(t.id)}
              onEdit={() => setSheet({ open: true, task: t })}
              onCycleType={() => cycleType(t.id)}
            />
          ))}
        </ul>

        {/* Add task — quick inline + advanced sheet */}
        <div className="flex items-center gap-2 p-3 border-t border-border">
          <button
            onClick={cycleDraftType}
            className="shrink-0"
            title="ประเภทงาน (แตะเพื่อเปลี่ยน)"
            aria-label="ประเภทงาน"
          >
            <Pill tone={TASK_TYPES[draftType].tone}>{TASK_TYPES[draftType].label}</Pill>
          </button>
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="เพิ่มงานสำหรับวันนี้…"
            className="flex-1"
          />
          <button
            onClick={() => setSheet({ open: true, task: null })}
            aria-label="เพิ่มแบบละเอียด"
            title="ตั้งค่าเพิ่มเติม (เป้าหมาย เวลา ทำซ้ำ)"
            className="size-8 grid place-items-center rounded-md border border-border-strong text-text-muted hover:bg-surface-2 transition-colors shrink-0"
          >
            <SlidersHorizontal size={15} strokeWidth={1.75} />
          </button>
          <button
            onClick={add}
            aria-label="เพิ่มงาน"
            className="size-8 grid place-items-center rounded-md bg-accent text-text-onaccent hover:bg-accent-hover transition-colors shrink-0"
          >
            <Plus size={16} strokeWidth={2} />
          </button>
        </div>
      </CardContent>

      <TaskDetailSheet
        open={sheet.open}
        mode={sheet.task ? "edit" : "add"}
        agent={agent}
        initial={sheet.task}
        onSubmit={applyDraft}
        onDelete={deleteTask}
        onClose={() => setSheet({ open: false, task: null })}
      />
    </Card>
  );
}

function TaskRow({
  task: t,
  onToggle,
  onEdit,
  onCycleType,
}: {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onCycleType: () => void;
}) {
  const target = getTarget(t.targetId);
  const repeats = t.repeat && t.repeat.freq !== "none";
  const hasMeta = !!(target || t.relatedLeadName || t.relatedListingId);
  return (
    <li className="flex items-start gap-3 px-4 py-2.5">
      <button
        onClick={onToggle}
        aria-label={t.done ? "ทำเครื่องหมายยังไม่เสร็จ" : "ทำเครื่องหมายเสร็จ"}
        className={cn(
          "mt-0.5 size-5 rounded-md border grid place-items-center shrink-0 transition-colors",
          t.done ? "bg-accent border-accent text-text-onaccent" : "border-border-strong hover:border-accent"
        )}
      >
        {t.done && (
          <svg viewBox="0 0 12 12" className="size-3" fill="none">
            <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <div
        onClick={onEdit}
        className="min-w-0 flex-1 cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onEdit()}
      >
        <div className="flex items-center gap-2">
          <span className={cn("text-body", t.done && "line-through text-text-subtle")}>{t.title}</span>
          {t.startTime && (
            <span className="inline-flex items-center gap-0.5 text-label text-text-subtle num shrink-0">
              <Clock size={11} strokeWidth={1.75} />
              {t.startTime}
              {t.endTime ? `–${t.endTime}` : ""}
            </span>
          )}
          {repeats && <Repeat size={11} strokeWidth={1.75} className="text-text-subtle shrink-0" />}
          {t.notes && <StickyNote size={11} strokeWidth={1.75} className="text-text-subtle shrink-0" />}
        </div>
        {hasMeta && (
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {target && (
              <span className="inline-flex items-center gap-1 text-label text-text-subtle">
                <TargetIcon size={11} strokeWidth={1.75} /> {target.label}
              </span>
            )}
            {t.relatedLeadName && (
              <span className="inline-flex items-center gap-1 text-label text-violet">
                <UserRound size={11} strokeWidth={1.75} /> {t.relatedLeadName}
              </span>
            )}
            {t.relatedListingId && (
              <Link
                href={`/listings/${t.relatedListingId}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-label text-accent hover:underline"
              >
                <Building2 size={11} strokeWidth={1.75} /> {t.relatedListingName ?? t.relatedListingId}
              </Link>
            )}
          </div>
        )}
      </div>
      {/* Work-type badge — right-aligned, tap to cycle (สร้างยอด / พื้นฐาน / ส่วนตัว). */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCycleType();
        }}
        title="ประเภทงาน (แตะเพื่อเปลี่ยน)"
        aria-label="ประเภทงาน"
        className="shrink-0 mt-0.5"
      >
        <Pill tone={TASK_TYPES[t.type].tone}>{TASK_TYPES[t.type].label}</Pill>
      </button>
    </li>
  );
}

// Awareness ratio: the split between สร้างยอด (accent) and พื้นฐาน (blue). ส่วนตัว is excluded
// from the ratio entirely (per design) — the bar answers "how much of my real work moves the
// number vs. keeps things running." Hidden when there are no build/พื้นฐาน tasks.
function TaskRatioBar({ tasks }: { tasks: Task[] }) {
  const b = tasks.filter((t) => t.type === "build").length;
  const w = tasks.filter((t) => t.type === "work").length;
  const denom = b + w;
  if (denom === 0) return null;
  const bPct = Math.round((b / denom) * 100);
  return (
    <div className="px-4 py-3 border-b border-border">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-small text-text-muted">สัดส่วนงาน</span>
        <span className="text-small text-text-muted">
          <span className="num font-bold text-accent">{bPct}%</span> สร้างยอด
        </span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-surface-2">
        {b > 0 && <div className="bg-accent transition-all" style={{ width: `${(b / denom) * 100}%` }} />}
        {w > 0 && <div className="bg-blue transition-all" style={{ width: `${(w / denom) * 100}%` }} />}
      </div>
      <div className="flex gap-4 mt-2 text-small">
        <RatioLegend dot="bg-accent" label="สร้างยอด" n={b} />
        <RatioLegend dot="bg-blue" label="พื้นฐาน" n={w} />
      </div>
    </div>
  );
}

function RatioLegend({ dot, label, n }: { dot: string; label: string; n: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-text-muted">
      <span className={cn("size-2 rounded-full shrink-0", dot)} />
      {label} <span className="num text-text font-semibold">{n}</span>
    </span>
  );
}
