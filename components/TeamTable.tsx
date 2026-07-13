"use client";

import * as React from "react";
import { Search, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Pill } from "@/components/ui/Pill";
import { Avatar } from "@/components/ui/Avatar";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { useRbac } from "@/components/RbacProvider";
import { listEmployees, effortThisMonth } from "@/lib/team";
import { listZones } from "@/lib/zones";
import { formatBaht } from "@/lib/format";
import { cn } from "@/lib/cn";

export function TeamTable() {
  const { roles, users, can } = useRbac();
  const [q, setQ] = React.useState("");
  const showMoney = can("financials.view");

  const zones = listZones();
  const zoneName = (id?: string) => zones.find((z) => z.zone_id === id)?.name_thai ?? "—";
  const roleNames = (uid: string) => {
    const u = users.find((x) => x.id === uid);
    if (!u || u.roleIds.length === 0) return [] as string[];
    return u.roleIds.map((rid) => roles.find((r) => r.id === rid)?.name ?? rid);
  };

  const query = q.trim().toLowerCase();
  const list = listEmployees().filter((e) => !query || e.name.toLowerCase().includes(query));

  return (
    <Card>
      <div className="flex items-center gap-2.5 p-3 border-b border-border">
        <div className="relative w-full sm:w-auto">
          <Search
            size={14}
            strokeWidth={1.75}
            className="text-text-subtle absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาพนักงาน…"
            className="w-full sm:w-56 pl-8"
          />
        </div>
        <span className="text-small text-text-subtle ml-auto num">{list.length} คน</span>
      </div>

      <CardContent className="p-0">
        <Table className="min-w-[720px]">
          <THead>
            <TR>
              <TH>พนักงาน</TH>
              <TH>บทบาท</TH>
              <TH>โซน</TH>
              <TH>สถานะ</TH>
              <TH className="text-right">กิจกรรมเดือนนี้</TH>
              {showMoney && <TH className="text-right">คอมมิชชั่น</TH>}
              <TH className="text-right">จัดการ</TH>
            </TR>
          </THead>
          <TBody>
            {list.map((e) => {
              const rnames = roleNames(e.id);
              return (
                <TR key={e.id}>
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={e.name} tone="crimson" />
                      <span className="font-medium">{e.name}</span>
                    </div>
                  </TD>
                  <TD>
                    <div className="flex flex-wrap gap-1">
                      {rnames.length ? (
                        rnames.map((n) => (
                          <Pill key={n} tone="neutral">
                            {n}
                          </Pill>
                        ))
                      ) : (
                        <span className="text-text-subtle">—</span>
                      )}
                    </div>
                  </TD>
                  <TD className="text-small text-text-muted">{zoneName(e.zoneId)}</TD>
                  <TD>
                    {e.active ? (
                      <Pill tone="green">ทำงานอยู่</Pill>
                    ) : (
                      <Pill tone="neutral">พักงาน</Pill>
                    )}
                  </TD>
                  <TD className="num text-right text-text-muted">{effortThisMonth(e.name)}</TD>
                  {showMoney && (
                    <TD className="num text-right font-medium">
                      {e.commissionMonth ? formatBaht(e.commissionMonth) : "—"}
                    </TD>
                  )}
                  <TD className="text-right">
                    <button
                      disabled
                      aria-label="จัดการพนักงาน"
                      className={cn(
                        "inline-grid place-items-center size-7 rounded-md text-text-subtle opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Pencil size={14} strokeWidth={1.75} />
                    </button>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </CardContent>
    </Card>
  );
}
