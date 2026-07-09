"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { ListingRow } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Dot";
import { Pill } from "@/components/ui/Pill";
import { formatBaht, formatRent, formatNumber, daysOnMarketLabel } from "@/lib/format";
import { listingStatusDot, potentialTone } from "@/lib/status";
import { cn } from "@/lib/cn";

// Stable, sensible chip order — only statuses actually present get a chip.
const STATUS_ORDER = [
  "Posted",
  "Ready to Post",
  "Update",
  "Need Info",
  "Sold",
  "Sold Completed",
  "Cancel",
  "Cancel Completed",
];

export function ListingsBrowser({ listings }: { listings: ListingRow[] }) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState("all");

  const chips = [
    { key: "all", label: "ทั้งหมด" },
    ...STATUS_ORDER.filter((s) => listings.some((l) => l.listing_status === s)).map((s) => ({
      key: s,
      label: s,
    })),
  ];

  const query = q.trim().toLowerCase();
  const filtered = listings
    .filter((l) => filter === "all" || l.listing_status === filter)
    .filter(
      (l) =>
        !query ||
        [l.listing_name, l.project_name_eng, l.zone_name_thai, l.zone, l.listing_id].some((v) =>
          v?.toLowerCase().includes(query)
        )
    );

  return (
    <Card>
      {/* Toolbar: search + status filter chips */}
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
            placeholder="ค้นหาโครงการ / ทำเล / รหัส…"
            className="w-full sm:w-64 pl-8"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap ml-auto items-center">
          {chips.map((c) => {
            const n =
              c.key === "all"
                ? listings.length
                : listings.filter((l) => l.listing_status === c.key).length;
            return (
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
                {c.label} <span className="num">({n})</span>
              </button>
            );
          })}
        </div>
      </div>

      <CardContent className="p-0">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-small text-text-subtle">ไม่พบทรัพย์</div>
        ) : (
          <Table className="min-w-[920px]">
            <THead>
              <TR>
                <TH>Listing ID</TH>
                <TH>โครงการ</TH>
                <TH>โซน</TH>
                <TH>ประเภท</TH>
                <TH className="text-right">ห้อง</TH>
                <TH className="text-right">พื้นที่</TH>
                <TH>Potential</TH>
                <TH>สถานะ</TH>
                <TH className="text-right">ราคา</TH>
                <TH className="text-right">DOM</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((l) => (
                <TR
                  key={l.listing_id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/listings/${l.listing_id}`)}
                >
                  <TD className="num text-small text-accent font-medium">
                    <Link
                      href={`/listings/${l.listing_id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:underline"
                    >
                      {l.listing_id}
                    </Link>
                  </TD>
                  <TD>
                    <div className="font-medium">{l.listing_name ?? "—"}</div>
                    <div className="text-label text-text-subtle">{l.project_name_eng}</div>
                  </TD>
                  <TD className="text-small text-text-muted">
                    {l.zone_name_thai}
                    <span className="num text-text-subtle ml-1">{l.zone}</span>
                  </TD>
                  <TD className="text-small">{l.property_type}</TD>
                  <TD className="text-right num text-small">
                    {l.bed ?? "—"}<span className="text-text-subtle">น</span> {l.bath ?? "—"}
                    <span className="text-text-subtle">บ</span>
                  </TD>
                  <TD className="text-right num text-small">
                    {l.area_sqm ? `${formatNumber(l.area_sqm)}` : "—"}
                    <span className="text-text-subtle"> ตร.ม.</span>
                  </TD>
                  <TD>
                    <Pill tone={potentialTone(l.potential)}>{l.potential}</Pill>
                  </TD>
                  <TD>
                    <StatusBadge color={listingStatusDot(l.listing_status)}>
                      {l.listing_status}
                    </StatusBadge>
                  </TD>
                  <TD className="text-right num">
                    {l.asking_price == null && l.rental_price == null ? (
                      <span className="text-text-subtle">—</span>
                    ) : (
                      <div className="flex flex-col items-end leading-tight">
                        {l.asking_price != null && (
                          <span className="font-medium">
                            <span className="text-label text-text-subtle mr-1">ขาย</span>
                            {formatBaht(l.asking_price)}
                          </span>
                        )}
                        {l.rental_price != null && (
                          <span className="text-small text-text-muted">
                            <span className="text-label text-text-subtle mr-1">เช่า</span>
                            {formatRent(l.rental_price)}
                          </span>
                        )}
                      </div>
                    )}
                  </TD>
                  <TD className="text-right num text-small text-text-muted">
                    {daysOnMarketLabel(l.days_on_market)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
