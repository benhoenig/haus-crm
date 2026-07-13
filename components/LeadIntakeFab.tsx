"use client";

import * as React from "react";
import { UserPlus, X, Check } from "lucide-react";
import { SAMPLE_LISTING_OPTIONS } from "@/lib/actions";
import { cn } from "@/lib/cn";

// Secondary FAB — "add a lead", stacked above the บันทึก logger. Outlined + person-plus
// so "create a record" never reads the same as "log a touch". UI-first: stubbed (no write).

const POTENTIALS = ["A", "B", "C", "New Lead"] as const;

export function LeadIntakeFab({ agent = "Stone" }: { agent?: string }) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [budget, setBudget] = React.useState("");
  const [listingId, setListingId] = React.useState("");
  const [potential, setPotential] = React.useState<string>("New Lead");
  const [remark, setRemark] = React.useState("");
  const [done, setDone] = React.useState<string | null>(null);

  const reset = () => {
    setName("");
    setPhone("");
    setBudget("");
    setListingId("");
    setPotential("New Lead");
    setRemark("");
    setDone(null);
  };
  const close = () => {
    setOpen(false);
    reset();
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setDone("err:ใส่ชื่อลูกค้าก่อน");
      return;
    }
    const entry = {
      created_by: agent,
      lead_name: name.trim(),
      phone: phone.trim() || null,
      budget: budget ? Number(budget) : null,
      listing_code: listingId || null,
      potential,
      remark: remark.trim() || null,
    };
    // eslint-disable-next-line no-console
    console.log("[stub] new lead (no write):", entry);
    setDone("ok:เพิ่มลีดแล้ว (ตัวอย่าง)");
  }

  const field =
    "w-full h-9 px-3 rounded-md border border-border-strong bg-surface text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="เพิ่มลีด"
        className="fixed right-5 bottom-[76px] z-40 inline-flex items-center gap-2 rounded-full bg-surface text-accent border border-accent h-10 pl-3.5 pr-4 shadow-pop hover:bg-accent-wash transition-colors text-small font-semibold"
      >
        <UserPlus size={17} strokeWidth={2} /> เพิ่มลีด
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
            <div className="flex items-center justify-between">
              <div className="text-h2">เพิ่มลีดใหม่</div>
              <button
                type="button"
                onClick={close}
                aria-label="ปิด"
                className="size-8 grid place-items-center rounded-md text-text-subtle hover:bg-surface-hover hover:text-text transition-colors"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>

            <label className="text-small text-text-muted flex flex-col gap-1.5">
              ชื่อลูกค้า
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น คุณเอ"
                className={field}
                required
              />
            </label>

            <div className="flex gap-3">
              <label className="flex-1 text-small text-text-muted flex flex-col gap-1.5">
                เบอร์โทร
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  placeholder="08x-xxx-xxxx"
                  className={cn(field, "num")}
                />
              </label>
              <label className="w-32 text-small text-text-muted flex flex-col gap-1.5">
                งบ (ล้าน)
                <input
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  inputMode="decimal"
                  placeholder="5.5"
                  className={cn(field, "num")}
                />
              </label>
            </div>

            <label className="text-small text-text-muted flex flex-col gap-1.5">
              สนใจทรัพย์
              <select value={listingId} onChange={(e) => setListingId(e.target.value)} className={field}>
                <option value="">— ไม่ระบุ —</option>
                {SAMPLE_LISTING_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-small text-text-muted flex flex-col gap-1.5">
              Potential
              <div className="flex gap-1.5">
                {POTENTIALS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPotential(p)}
                    className={cn(
                      "flex-1 h-8 rounded-md border text-small font-medium transition-colors",
                      potential === p
                        ? "bg-text text-background border-text"
                        : "border-border-strong text-text-muted hover:bg-surface-2"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </label>

            <label className="text-small text-text-muted flex flex-col gap-1.5">
              หมายเหตุ
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={2}
                placeholder="—"
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
              เพิ่มลีด
            </button>
          </form>
        </div>
      )}
    </>
  );
}
