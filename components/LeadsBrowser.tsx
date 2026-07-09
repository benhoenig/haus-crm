"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { CrmRow } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { StatusBadge, Dot } from "@/components/ui/Dot";
import { Pill } from "@/components/ui/Pill";
import { Avatar } from "@/components/ui/Avatar";
import { GradeChip } from "@/components/ui/GradeChip";
import { STAGES, stageMeta } from "@/lib/pipeline";
import { formatBaht, formatThaiDate } from "@/lib/format";
import { leadStatusDot } from "@/lib/status";
import { cn } from "@/lib/cn";

export function LeadsBrowser({ crm }: { crm: CrmRow[] }) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [stage, setStage] = React.useState("all");

  const chips = [
    { key: "all", label: "ทั้งหมด" },
    ...STAGES.filter((s) => crm.some((c) => c.pipeline_stage === s.key)).map((s) => ({
      key: s.key,
      label: s.th,
    })),
  ];

  const query = q.trim().toLowerCase();
  const filtered = crm
    .filter((c) => stage === "all" || c.pipeline_stage === stage)
    .filter(
      (c) =>
        !query ||
        [c.lead_name, c.phone, c.lead_id].some((v) => v?.toLowerCase().includes(query))
    );

  return (
    <Card>
      {/* Toolbar: search + stage filter chips */}
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
            placeholder="ค้นหาชื่อ / เบอร์ / รหัส…"
            className="w-full sm:w-64 pl-8"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap ml-auto items-center">
          {chips.map((c) => {
            const n =
              c.key === "all"
                ? crm.length
                : crm.filter((x) => x.pipeline_stage === c.key).length;
            return (
              <button
                key={c.key}
                onClick={() => setStage(c.key)}
                className={cn(
                  "text-small font-medium rounded-md px-3 py-1.5 border transition-colors",
                  stage === c.key
                    ? "bg-text text-background border-text"
                    : "border-border-strong text-text-muted hover:bg-surface-2"
                )}
              >
                {c.label} <span className="num">({n})</span>
              </button>
            );
          })}
        </div>
      </div>

      <CardContent className="p-0">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-small text-text-subtle">ไม่พบรายการ</div>
        ) : (
          <Table className="min-w-[1040px]">
            <THead>
              <TR>
                <TH>Lead ID</TH>
                <TH>ลูกค้า</TH>
                <TH>เกรด</TH>
                <TH>สเตจ</TH>
                <TH>สถานะ</TH>
                <TH>ประเภท</TH>
                <TH>เซล</TH>
                <TH className="text-right">งบประมาณ</TH>
                <TH className="text-right">คอมมิชชั่น</TH>
                <TH className="text-right">ติดตามล่าสุด</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((c) => {
                const stg = stageMeta(c.pipeline_stage);
                return (
                  <TR
                    key={c.lead_id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/leads/${c.lead_id}`)}
                  >
                    <TD className="num text-small text-text-muted">
                      <Link
                        href={`/leads/${c.lead_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-accent hover:underline"
                      >
                        {c.lead_id}
                      </Link>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={c.lead_name} tone="crimson" />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{c.lead_name}</div>
                          <div className="text-label text-text-subtle num">{c.phone}</div>
                        </div>
                      </div>
                    </TD>
                    <TD>
                      <GradeChip grade={c.potential ?? ""} />
                    </TD>
                    <TD>
                      <span className="inline-flex items-center gap-1.5 text-body whitespace-nowrap">
                        <Dot className={stg.dot} />
                        {stg.th}
                      </span>
                    </TD>
                    <TD>
                      <StatusBadge color={leadStatusDot(c.lead_status)}>
                        {c.lead_status}
                      </StatusBadge>
                    </TD>
                    <TD>
                      <Pill>{c.lead_type ?? "—"}</Pill>
                    </TD>
                    <TD>
                      <span className="inline-flex items-center gap-1.5">
                        <Avatar name={c.sale_id ?? ""} tone="crimson" className="h-5 w-5" />
                        <span className="text-small num text-text-muted">{c.sale_id}</span>
                      </span>
                    </TD>
                    <TD className="text-right num">{formatBaht(c.budget)}</TD>
                    <TD className="text-right num text-green">
                      {c.commission ? formatBaht(c.commission) : "—"}
                    </TD>
                    <TD className="text-right text-small text-text-muted num">
                      {formatThaiDate(c.last_follow_date)}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
