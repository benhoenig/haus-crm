"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { ACTION_GROUPS, type AttachMode } from "@/lib/actions";
import {
  PROPERTY_TYPES,
  KPI_TEMPLATES,
  KIND_LABEL,
  SOURCE_LABEL,
  type KpiTemplate,
} from "@/lib/masterdata";
import { LEAD_SOURCES, CONTACT_BYS, GENDERS, NATIONALITIES } from "@/lib/leads";

// ---- Generic editable label list (in-memory) --------------------------------
function EditableList({ seed, placeholder }: { seed: string[]; placeholder: string }) {
  const [items, setItems] = React.useState<string[]>(seed);
  const [draft, setDraft] = React.useState("");

  const add = () => {
    const v = draft.trim();
    if (!v || items.includes(v)) return;
    setItems((xs) => [...xs, v]);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={it}
            onChange={(e) => setItems((xs) => xs.map((x, j) => (j === i ? e.target.value : x)))}
            className="flex-1"
          />
          <button
            onClick={() => setItems((xs) => xs.filter((_, j) => j !== i))}
            aria-label="ลบ"
            className="size-8 grid place-items-center rounded-md text-red hover:bg-red-bg transition-colors shrink-0"
          >
            <Trash2 size={14} strokeWidth={1.75} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={placeholder}
          className="flex-1"
        />
        <button
          onClick={add}
          aria-label="เพิ่ม"
          className="size-8 grid place-items-center rounded-md bg-accent text-text-onaccent hover:bg-accent-hover transition-colors shrink-0"
        >
          <Plus size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// ---- Titled reference-list card (one controlled vocabulary) -----------------
function RefListCard({
  title,
  note,
  seed,
  placeholder,
}: {
  title: string;
  note?: string;
  seed: string[];
  placeholder: string;
}) {
  return (
    <Card>
      <div className="px-4 h-11 flex items-center gap-2 border-b border-border">
        <span className="text-h3">{title}</span>
        {note && <span className="text-label text-text-subtle">· {note}</span>}
      </div>
      <CardContent>
        <EditableList seed={seed} placeholder={placeholder} />
      </CardContent>
    </Card>
  );
}

// ---- Property types ---------------------------------------------------------
export function PropertyTypesManager() {
  return (
    <Card>
      <CardContent>
        <EditableList seed={PROPERTY_TYPES} placeholder="เพิ่มประเภททรัพย์…" />
      </CardContent>
    </Card>
  );
}

// ---- Lead reference fields (Marketing Channel / Contact By / Gender / Nationality) ----
// The controlled vocabularies the lead-intake form uses. Design-first: these seed from the
// hardcoded enums in lib/leads.ts and edit label-only in memory. Wiring: promote to governed
// tables (id + label) so the intake form + reports read the same source (see DATA_MODEL).
export function LeadReferenceManager() {
  return (
    <div className="flex flex-col gap-4">
      <RefListCard title="Marketing Channel" note="ช่องทางที่ลีดเข้ามา" seed={LEAD_SOURCES.map((s) => s.label)} placeholder="เพิ่มช่องทาง…" />
      <RefListCard title="Contact By" note="วิธี/กล่องที่ติดต่อเข้ามา" seed={CONTACT_BYS.map((s) => s.label)} placeholder="เพิ่มวิธีติดต่อ…" />
      <RefListCard title="เพศ" seed={GENDERS.map((g) => g.label)} placeholder="เพิ่ม…" />
      <RefListCard title="สัญชาติ" seed={NATIONALITIES} placeholder="เพิ่มสัญชาติ…" />
    </div>
  );
}

// ---- Action types (grouped, with attach mode) -------------------------------
const ATTACH_LABEL: Record<AttachMode, { label: string; tone: "violet" | "accent" | "blue" | "neutral" }> = {
  lead: { label: "ผูกกับลูกค้า", tone: "violet" },
  listing: { label: "ผูกกับทรัพย์", tone: "accent" },
  either: { label: "ลูกค้า/ทรัพย์", tone: "blue" },
  none: { label: "ทั่วไป", tone: "neutral" },
};

export function ActionTypesManager() {
  return (
    <div className="flex flex-col gap-4">
      {ACTION_GROUPS.map((g) => (
        <Card key={g.group}>
          <div className="px-4 h-11 flex items-center justify-between border-b border-border">
            <span className="text-h3">{g.group}</span>
            <Pill tone={ATTACH_LABEL[g.attach].tone}>{ATTACH_LABEL[g.attach].label}</Pill>
          </div>
          <CardContent>
            <EditableList seed={g.items} placeholder="เพิ่มกิจกรรม…" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---- KPI target templates ---------------------------------------------------
export function KpiTemplatesManager() {
  const [rows, setRows] = React.useState<KpiTemplate[]>(KPI_TEMPLATES);

  const addRow = () =>
    setRows((rs) => [
      ...rs,
      {
        id: `kt_new_${rs.length}`,
        label: "เป้าหมายใหม่",
        kind: "count",
        source: "manual",
        defaultTarget: 0,
      },
    ]);

  const patch = (id: string, p: Partial<KpiTemplate>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));

  return (
    <Card>
      <CardContent className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center gap-2 flex-wrap">
            <Input
              value={r.label}
              onChange={(e) => patch(r.id, { label: e.target.value })}
              className="flex-1 min-w-[140px]"
            />
            <Pill tone="neutral">{KIND_LABEL[r.kind]}</Pill>
            <Pill tone={r.source === "activity" ? "green" : "neutral"}>
              {SOURCE_LABEL[r.source]}
              {r.activityType ? ` · ${r.activityType}` : ""}
            </Pill>
            <Input
              value={String(r.defaultTarget)}
              onChange={(e) => patch(r.id, { defaultTarget: Number(e.target.value) || 0 })}
              className="w-24 num text-right"
              inputMode="numeric"
            />
            <button
              onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}
              aria-label="ลบ"
              className="size-8 grid place-items-center rounded-md text-red hover:bg-red-bg transition-colors shrink-0"
            >
              <Trash2 size={14} strokeWidth={1.75} />
            </button>
          </div>
        ))}
        <div className="pt-1">
          <Button variant="secondary" size="sm" onClick={addRow}>
            <Plus size={13} strokeWidth={2} /> เพิ่มเทมเพลตเป้าหมาย
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
