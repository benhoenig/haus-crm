"use client";

import * as React from "react";
import { Search, Check } from "lucide-react";
import type { CrmRow } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Pill } from "@/components/ui/Pill";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { listEmployees } from "@/lib/team";
import { formatBaht } from "@/lib/format";
import { cn } from "@/lib/cn";

export function LeadAssignment({ leads }: { leads: CrmRow[] }) {
  const agents = listEmployees().filter((e) => e.active);
  // Local assignment overrides (design stub — not persisted).
  const [assigned, setAssigned] = React.useState<Record<string, string>>({});
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "unassigned">("all");

  const currentAgent = (l: CrmRow) => assigned[l.lead_id] ?? l.sale_id ?? "";

  const query = q.trim().toLowerCase();
  const list = leads
    .filter((l) => (filter === "all" ? true : !currentAgent(l)))
    .filter(
      (l) =>
        !query ||
        (l.lead_name ?? "").toLowerCase().includes(query) ||
        (l.listing_code ?? "").toLowerCase().includes(query)
    );

  const unassignedCount = leads.filter((l) => !currentAgent(l)).length;

  return (
    <Card>
      <div className="flex items-center gap-2.5 p-3 border-b border-border flex-wrap">
        <div className="relative w-full sm:w-auto">
          <Search
            size={14}
            strokeWidth={1.75}
            className="text-text-subtle absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาลูกค้า / รหัสทรัพย์…"
            className="w-full sm:w-64 pl-8"
          />
        </div>
        <div className="flex gap-1.5 ml-auto">
          {([
            { key: "all", label: `ทั้งหมด (${leads.length})` },
            { key: "unassigned", label: `ยังไม่มอบหมาย (${unassignedCount})` },
          ] as const).map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={cn(
                "text-small font-medium rounded-md px-3 py-1.5 border transition-colors",
                filter === c.key
                  ? "bg-text text-background border-text"
                  : "border-border-strong text-text-muted hover:bg-surface-2"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="p-10 text-center text-small text-text-subtle">ไม่พบลีด</div>
      ) : (
        <CardContent className="p-0">
          <Table className="min-w-[820px]">
            <THead>
              <TR>
                <TH>ลูกค้า</TH>
                <TH>สเตจ</TH>
                <TH>Potential</TH>
                <TH className="text-right">งบ</TH>
                <TH>ทรัพย์</TH>
                <TH>มอบหมายให้</TH>
              </TR>
            </THead>
            <TBody>
              {list.map((l) => {
                const cur = currentAgent(l);
                const justSet = assigned[l.lead_id] != null;
                return (
                  <TR key={l.lead_id}>
                    <TD className="font-medium">{l.lead_name ?? l.lead_id}</TD>
                    <TD className="text-small text-text-muted">{l.pipeline_stage ?? "—"}</TD>
                    <TD>
                      {l.potential ? <Pill tone="neutral">{l.potential}</Pill> : <span className="text-text-subtle">—</span>}
                    </TD>
                    <TD className="num text-right text-text-muted">
                      {l.budget != null ? formatBaht(l.budget * 1_000_000) : "—"}
                    </TD>
                    <TD className="num text-small text-text-muted">{l.listing_code ?? "—"}</TD>
                    <TD>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={cur}
                          onChange={(e) =>
                            setAssigned((a) => ({ ...a, [l.lead_id]: e.target.value }))
                          }
                          className="h-8 px-2 rounded-md border border-border-strong bg-surface text-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                          <option value="">— ยังไม่มอบหมาย —</option>
                          {cur && !agents.some((a) => a.name === cur || a.id === cur) && (
                            <option value={cur}>{cur}</option>
                          )}
                          {agents.map((a) => (
                            <option key={a.id} value={a.name}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                        {justSet && <Check size={14} strokeWidth={2.5} className="text-green shrink-0" />}
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </CardContent>
      )}
    </Card>
  );
}
