"use client";

import * as React from "react";
import { Plus, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { formatBaht } from "@/lib/format";
import {
  listTargets,
  targetCurrent,
  type Target,
  type TargetOwner,
} from "@/lib/momentum";
import { cn } from "@/lib/cn";

export function TargetsBoard({ agent, title = "เป้าหมายเดือนนี้" }: { agent: string; title?: string }) {
  // Local copy so manual +1 is interactive (activity-source targets stay auto).
  const [targets, setTargets] = React.useState<Target[]>(() => listTargets(agent));

  const bump = (id: string) =>
    setTargets((ts) =>
      ts.map((t) => (t.id === id ? { ...t, manualCurrent: t.manualCurrent + 1 } : t))
    );

  const official = targets.filter((t) => t.owner === "official");
  const stretch = targets.filter((t) => t.owner === "stretch");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="text-label text-text-subtle">ก.ค. 2569</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Group label="ทางการ (ตั้งโดยหัวหน้า)" targets={official} onBump={bump} />
        <Group
          label="เป้าหมายส่วนตัว"
          targets={stretch}
          onBump={bump}
          action={
            <Button variant="secondary" size="sm" disabled>
              <Plus size={13} strokeWidth={2} /> เพิ่ม
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
}

function Group({
  label,
  targets,
  onBump,
  action,
}: {
  label: string;
  targets: Target[];
  onBump: (id: string) => void;
  action?: React.ReactNode;
}) {
  if (targets.length === 0 && !action) return null;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-label uppercase text-text-subtle">{label}</div>
        {action}
      </div>
      <div className="flex flex-col gap-3">
        {targets.map((t) => (
          <TargetRow key={t.id} target={t} onBump={() => onBump(t.id)} />
        ))}
      </div>
    </div>
  );
}

function TargetRow({ target: t, onBump }: { target: Target; onBump: () => void }) {
  const cur = targetCurrent(t);
  const pct = t.target > 0 ? Math.min(100, Math.round((cur / t.target) * 100)) : 0;
  const auto = t.source === "activity";
  const fmt = (n: number) => (t.kind === "baht" ? formatBaht(n) : String(n));

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-body inline-flex items-center gap-1.5">
          {t.label}
          {auto && (
            <span className="inline-flex items-center gap-0.5 text-label text-green" title="อัปเดตอัตโนมัติจากกิจกรรม">
              <Zap size={10} strokeWidth={2} /> auto
            </span>
          )}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="num text-small text-text-muted">
            {fmt(cur)} <span className="text-text-subtle">/ {fmt(t.target)}</span>
          </span>
          {!auto && (
            <button
              onClick={onBump}
              className="num text-label font-semibold text-accent border border-accent rounded px-1.5 h-6 hover:bg-accent-wash transition-colors"
            >
              +1
            </button>
          )}
        </div>
      </div>
      <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", pct >= 100 ? "bg-green" : "bg-accent")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
