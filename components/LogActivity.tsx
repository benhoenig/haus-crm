"use client";

import * as React from "react";
import { Plus, X, Building2, UserRound, Check } from "lucide-react";
import {
  ACTION_GROUPS,
  NOTE_ACTION,
  actionAttach,
  type AttachMode,
  SAMPLE_LEAD_OPTIONS,
  SAMPLE_LISTING_OPTIONS,
} from "@/lib/actions";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

// UI-first: the FAB does NOT write yet. On submit it builds the activity row shape
// { created_by, action, related_lead_id?, related_listing_id?, date, count, remark }
// and shows a stubbed confirmation. Wiring appends it to the activities table later.
//
// Action-first flow: pick action → (by attach mode) optionally tag a lead OR a
// listing → date/count/note. Tagging an entity = a count-1 touch that lands in
// that entity's timeline; skipping = an aggregate KPI tally (count N).

const todayISO = "2026-07-13"; // stubbed "today" (no Date in this design build)

export function LogActivity({ agent = "Stone" }: { agent?: string }) {
  const [open, setOpen] = React.useState(false);
  const [action, setAction] = React.useState("");
  const [entityKind, setEntityKind] = React.useState<"lead" | "listing">("lead"); // for "either"
  const [leadId, setLeadId] = React.useState("");
  const [listingId, setListingId] = React.useState("");
  const [date, setDate] = React.useState(todayISO);
  const [count, setCount] = React.useState(1);
  const [remark, setRemark] = React.useState("");
  const [done, setDone] = React.useState<string | null>(null);

  const attach: AttachMode = actionAttach(action);
  const isNote = action === NOTE_ACTION;
  // In "either" mode the user picks which entity; otherwise it's fixed by the action.
  const activeKind = attach === "either" ? entityKind : attach;
  const showLead = activeKind === "lead";
  const showListing = activeKind === "listing";
  const attachedId = showLead ? leadId : showListing ? listingId : "";
  // A specific-entity touch is one event; an unattached action is a tally.
  const showCount = attach !== "none" ? !attachedId && !isNote : !isNote ? true : false;

  const reset = () => {
    setAction("");
    setEntityKind("lead");
    setLeadId("");
    setListingId("");
    setDate(todayISO);
    setCount(1);
    setRemark("");
    setDone(null);
  };
  const close = () => {
    setOpen(false);
    reset();
  };

  const onPickAction = (a: string) => {
    setAction(a);
    setLeadId("");
    setListingId("");
    setDone(null);
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!action) return;
    if (isNote && !attachedId) {
      setDone("err:เลือกลูกค้าหรือทรัพย์ที่จะบันทึกก่อน");
      return;
    }
    if (isNote && !remark.trim()) {
      setDone("err:พิมพ์ความคืบหน้าก่อน");
      return;
    }
    // Built here to document the shape; not persisted in the design build.
    const entry = {
      created_by: agent,
      action,
      related_lead_id: showLead ? leadId || null : null,
      related_listing_id: showListing ? listingId || null : null,
      date,
      count: attachedId || isNote ? 1 : Math.max(1, Math.min(50, Number(count) || 1)),
      remark: remark.trim() || null,
    };
    // eslint-disable-next-line no-console
    console.log("[stub] log activity (no write):", entry);
    setDone(attachedId ? "ok:บันทึกในไทม์ไลน์แล้ว (ตัวอย่าง)" : "ok:บันทึกแล้ว (ตัวอย่าง)");
    setCount(1);
    setRemark("");
  }

  const field =
    "w-full h-9 px-3 rounded-md border border-border-strong bg-surface text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="บันทึกกิจกรรม"
        className="fixed right-5 bottom-5 z-40 inline-flex items-center gap-2 rounded-full bg-accent text-text-onaccent h-12 pl-4 pr-5 shadow-pop hover:bg-accent-hover transition-colors font-medium"
      >
        <Plus size={18} strokeWidth={2.25} /> บันทึก
      </button>

      {open && (
        <div
          onClick={close}
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className="w-full sm:max-w-md bg-surface rounded-t-xl sm:rounded-xl border border-border shadow-pop p-5 flex flex-col gap-3.5 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Avatar name={agent} tone="crimson" />
                <div className="leading-tight">
                  <div className="text-label uppercase text-text-subtle">บันทึกในนาม</div>
                  <div className="text-body font-semibold">{agent}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="ปิด"
                className="size-8 grid place-items-center rounded-md text-text-subtle hover:bg-surface-hover hover:text-text transition-colors"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>

            {/* 1 — action */}
            <label className="text-small text-text-muted flex flex-col gap-1.5">
              กิจกรรม
              <select
                value={action}
                onChange={(e) => onPickAction(e.target.value)}
                className={field}
                required
              >
                <option value="" disabled>
                  — เลือกกิจกรรม —
                </option>
                {ACTION_GROUPS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.items.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            {/* 2 — attach: entity-kind toggle only in "either" mode */}
            {attach === "either" && (
              <div className="flex gap-1.5">
                {(["lead", "listing"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setEntityKind(k)}
                    className={cn(
                      "flex-1 h-8 rounded-md border text-small font-medium inline-flex items-center justify-center gap-1.5 transition-colors",
                      entityKind === k
                        ? "bg-text text-background border-text"
                        : "border-border-strong text-text-muted hover:bg-surface-2"
                    )}
                  >
                    {k === "lead" ? <UserRound size={14} /> : <Building2 size={14} />}
                    {k === "lead" ? "ลูกค้า" : "ทรัพย์"}
                  </button>
                ))}
              </div>
            )}

            {/* 2b — lead select */}
            {showLead && action && (
              <label className="text-small text-text-muted flex flex-col gap-1.5">
                {isNote ? "ลูกค้า" : "ลูกค้า (ถ้าทำกับรายใดรายหนึ่ง)"}
                <select
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className={field}
                  required={isNote}
                >
                  <option value="">{isNote ? "— เลือกลูกค้า —" : "— ไม่ระบุ (นับรวม KPI) —"}</option>
                  {SAMPLE_LEAD_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* 2c — listing select */}
            {showListing && action && (
              <label className="text-small text-text-muted flex flex-col gap-1.5">
                {isNote ? "ทรัพย์" : "ทรัพย์ (ถ้าทำกับหลังใดหลังหนึ่ง)"}
                <select
                  value={listingId}
                  onChange={(e) => setListingId(e.target.value)}
                  className={field}
                  required={isNote}
                >
                  <option value="">{isNote ? "— เลือกทรัพย์ —" : "— ไม่ระบุ (นับรวม KPI) —"}</option>
                  {SAMPLE_LISTING_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* 3 — date + count */}
            <div className="flex gap-3">
              <label className="flex-1 text-small text-text-muted flex flex-col gap-1.5">
                วันที่
                <input
                  type="date"
                  value={date}
                  max={todayISO}
                  onChange={(e) => setDate(e.target.value)}
                  className={field}
                />
              </label>
              {showCount && (
                <label className="w-24 text-small text-text-muted flex flex-col gap-1.5">
                  จำนวน
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className={cn(field, "num")}
                  />
                </label>
              )}
            </div>

            {/* 4 — note / remark */}
            <label className="text-small text-text-muted flex flex-col gap-1.5">
              {isNote ? "ความคืบหน้า" : "หมายเหตุ (ถ้ามี)"}
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder={isNote ? "อัปเดตว่าเกิดอะไรขึ้น…" : "—"}
                rows={isNote ? 3 : 2}
                className={cn(field, "h-auto py-2 resize-none")}
              />
            </label>

            {done && (
              <div
                className={cn(
                  "rounded-md px-3 py-2 text-small border inline-flex items-center gap-1.5",
                  done.startsWith("ok:")
                    ? "bg-green-bg text-green border-green/30"
                    : "bg-red-bg text-red border-red/30"
                )}
              >
                {done.startsWith("ok:") && <Check size={14} strokeWidth={2} />}
                {done.slice(done.indexOf(":") + 1)}
              </div>
            )}

            <button
              type="submit"
              className="h-10 rounded-md bg-accent text-text-onaccent font-medium hover:bg-accent-hover transition-colors mt-1"
            >
              บันทึก
            </button>
          </form>
        </div>
      )}
    </>
  );
}
