"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { ConfirmDelete, usageWarning } from "@/components/ui/ConfirmDelete";
import { useMasterData, type RefItem } from "@/components/MasterDataProvider";
import { listActivities, ACTION_GROUPS, type AttachMode } from "@/lib/actions";
import { KPI_TEMPLATES, KIND_LABEL, SOURCE_LABEL, type KpiTemplate } from "@/lib/masterdata";

// ---- Controlled vocabulary list ---------------------------------------------
// Edits the LIVE list (MasterDataProvider) — so deleting a value here really removes it
// from the intake form's dropdowns, while rows already storing it keep their old value
// (display falls back to the raw value). Seed items keep their ids across label renames;
// new custom items use id = label so raw-value fallbacks render cleanly.
function VocabList({
  items,
  onChange,
  placeholder,
  warnFor,
}: {
  items: RefItem[];
  onChange: (next: RefItem[]) => void;
  placeholder: string;
  warnFor?: (label: string) => React.ReactNode;
}) {
  const [draft, setDraft] = React.useState("");

  const add = () => {
    const v = draft.trim();
    if (!v || items.some((x) => x.label === v)) return;
    onChange([...items, { id: v, label: v }]);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((it) => (
        <div key={it.id} className="flex items-center gap-2">
          <Input
            value={it.label}
            onChange={(e) => onChange(items.map((x) => (x.id === it.id ? { ...x, label: e.target.value } : x)))}
            className="flex-1"
          />
          <ConfirmDelete
            onDelete={() => onChange(items.filter((x) => x.id !== it.id))}
            confirmLabel={`ลบ “${it.label}”?`}
            warning={warnFor?.(it.label)}
          />
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

// Uncontrolled variant for lists that are NOT provider-backed yet (action types).
function EditableList({
  seed,
  placeholder,
  warnFor,
}: {
  seed: string[];
  placeholder: string;
  warnFor?: (label: string) => React.ReactNode;
}) {
  const [items, setItems] = React.useState<RefItem[]>(() => seed.map((s) => ({ id: s, label: s })));
  return <VocabList items={items} onChange={setItems} placeholder={placeholder} warnFor={warnFor} />;
}

// ---- Titled reference-list card (one controlled vocabulary) -----------------
function RefListCard({
  title,
  note,
  items,
  onChange,
  placeholder,
  warnFor,
}: {
  title: string;
  note?: string;
  items: RefItem[];
  onChange: (next: RefItem[]) => void;
  placeholder: string;
  warnFor?: (label: string) => React.ReactNode;
}) {
  return (
    <Card>
      <div className="px-4 h-11 flex items-center gap-2 border-b border-border">
        <span className="text-h3">{title}</span>
        {note && <span className="text-label text-text-subtle">· {note}</span>}
      </div>
      <CardContent>
        <VocabList items={items} onChange={onChange} placeholder={placeholder} warnFor={warnFor} />
      </CardContent>
    </Card>
  );
}

// ---- Property types ---------------------------------------------------------
// Live list (provider) — the intake form's ประเภททรัพย์ selects read the same list.
// `usage` = live count of listings per property type (from v_main_listing, computed
// server-side on /settings) so the delete confirm states the real impact.
export function PropertyTypesManager({ usage }: { usage?: Record<string, number> }) {
  const { propertyTypes, setPropertyTypes } = useMasterData();
  return (
    <Card>
      <CardContent>
        <VocabList
          items={propertyTypes}
          onChange={setPropertyTypes}
          placeholder="เพิ่มประเภททรัพย์…"
          warnFor={(label) => usageWarning(usage ? (usage[label] ?? 0) : null, "ทรัพย์")}
        />
      </CardContent>
    </Card>
  );
}

// ---- Lead reference fields (Marketing Channel / Contact By / Gender / Nationality) ----
// Live lists (provider) — the intake form (LeadForm) reads the same lists, so removing a
// channel here immediately removes it from the form. main_6_buyer_crm has no matching
// columns yet → usage isn't countable; the confirm warns to check manually (wire the real
// count once the columns land).
export function LeadReferenceManager() {
  const { sources, setSources, contactBys, setContactBys, genders, setGenders, nationalities, setNationalities } =
    useMasterData();
  const unknownLeadUsage = () => usageWarning(null, "ลีด");
  return (
    <div className="flex flex-col gap-4">
      <RefListCard title="Marketing Channel" note="ช่องทางที่ลีดเข้ามา" items={sources} onChange={setSources} placeholder="เพิ่มช่องทาง…" warnFor={unknownLeadUsage} />
      <RefListCard title="Contact By" note="วิธี/กล่องที่ติดต่อเข้ามา" items={contactBys} onChange={setContactBys} placeholder="เพิ่มวิธีติดต่อ…" warnFor={unknownLeadUsage} />
      <RefListCard title="เพศ" items={genders} onChange={setGenders} placeholder="เพิ่ม…" warnFor={unknownLeadUsage} />
      <RefListCard title="สัญชาติ" items={nationalities} onChange={setNationalities} placeholder="เพิ่มสัญชาติ…" warnFor={unknownLeadUsage} />
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
  // Impact = how many logged activities use each action type (sample log; wire to the real
  // activities table count). Not provider-backed yet — local edit only.
  const usedBy = (name: string) => listActivities().filter((a) => a.action === name).length;
  return (
    <div className="flex flex-col gap-4">
      {ACTION_GROUPS.map((g) => (
        <Card key={g.group}>
          <div className="px-4 h-11 flex items-center justify-between border-b border-border">
            <span className="text-h3">{g.group}</span>
            <Pill tone={ATTACH_LABEL[g.attach].tone}>{ATTACH_LABEL[g.attach].label}</Pill>
          </div>
          <CardContent>
            <EditableList seed={g.items} placeholder="เพิ่มกิจกรรม…" warnFor={(it) => usageWarning(usedBy(it), "กิจกรรมที่บันทึกไว้")} />
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
            <ConfirmDelete
              onDelete={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}
              confirmLabel={`ลบ “${r.label}”?`}
              warning="เป้าหมายที่ตั้งจากเทมเพลตนี้ไว้แล้วจะไม่ถูกลบ แต่หัวหน้าจะตั้งเป้าจากเทมเพลตนี้ใหม่ไม่ได้อีก"
            />
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
