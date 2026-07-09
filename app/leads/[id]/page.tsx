import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  CalendarPlus,
  Building2,
  Activity,
  History,
  Banknote,
} from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatusBadge, Dot } from "@/components/ui/Dot";
import { Pill } from "@/components/ui/Pill";
import { Avatar } from "@/components/ui/Avatar";
import { GradeChip } from "@/components/ui/GradeChip";
import { getLead } from "@/lib/queries";
import { formatBaht, formatThaiDate } from "@/lib/format";
import { leadStatusDot } from "@/lib/status";
import { stageMeta } from "@/lib/pipeline";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  const stg = stageMeta(lead.pipeline_stage);
  const showClosing =
    lead.lead_status === "Win" || lead.commission != null || lead.closing_date != null;

  return (
    <>
      <Topbar title="Lead" actions={false} />

      <div className="p-4 lg:p-6 space-y-4">
        <Link
          href="/leads"
          className="inline-flex items-center gap-1.5 text-small text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={1.75} /> กลับไป Lead
        </Link>

        {/* Identity header — inline block (Shelter-style). Stacks on mobile. */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={lead.lead_name} tone="crimson" className="h-10 w-10 shrink-0" />
            <div className="min-w-0">
              <div className="num text-[11px] text-text-subtle">{lead.lead_id}</div>
              <h1 className="text-h1 truncate">{lead.lead_name ?? lead.lead_id}</h1>
              {lead.phone && (
                <p className="text-small text-text-muted mt-0.5 inline-flex items-center gap-1 num">
                  <Phone size={12} strokeWidth={1.75} />
                  {lead.phone}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
            <Button variant="secondary" size="sm" disabled>
              แก้ไข
            </Button>
            <Button variant="secondary" size="sm" disabled>
              <CalendarPlus size={15} strokeWidth={1.75} /> นัดชม
            </Button>
            {lead.phone ? (
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex items-center justify-center gap-1.5 h-7 px-2.5 text-small font-medium rounded-md bg-accent text-text-onaccent hover:bg-accent-hover transition-colors whitespace-nowrap"
              >
                <Phone size={15} strokeWidth={1.75} /> ติดต่อ
              </a>
            ) : (
              <Button size="sm" disabled>
                <Phone size={15} strokeWidth={1.75} /> ติดต่อ
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
          {/* Main column */}
          <div className="flex flex-col gap-4 min-w-0">
            {/* Activity — placeholder until activity logging is wired */}
            <Card>
              <CardHeader>
                <CardTitle>กิจกรรม</CardTitle>
                <Pill>เร็ว ๆ นี้</Pill>
              </CardHeader>
              <CardContent>
                <Empty icon={Activity}>ยังไม่มีกิจกรรม</Empty>
              </CardContent>
            </Card>

            {/* Interested listing (real) */}
            <Card>
              <CardHeader>
                <CardTitle>ทรัพย์ที่สนใจ</CardTitle>
              </CardHeader>
              {lead.listing_code ? (
                <CardContent className="p-0">
                  <Link
                    href={`/listings/${lead.listing_code}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors"
                  >
                    <div className="size-9 rounded-md bg-surface-2 grid place-items-center shrink-0">
                      <Building2 size={16} strokeWidth={1.75} className="text-text-muted" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-body font-medium num">{lead.listing_code}</div>
                      <div className="text-label text-text-subtle">ดูรายละเอียดทรัพย์</div>
                    </div>
                    <ArrowLeft
                      size={14}
                      strokeWidth={1.75}
                      className="ml-auto rotate-180 text-text-subtle"
                    />
                  </Link>
                </CardContent>
              ) : (
                <CardContent>
                  <span className="text-small text-text-subtle">ยังไม่ระบุทรัพย์ที่สนใจ</span>
                </CardContent>
              )}
            </Card>

            {/* Closing (real) — only for won / closed deals */}
            {showClosing && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Banknote size={16} strokeWidth={1.75} className="text-green" />
                    การปิดการขาย
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-body">
                  <Row label="คอมมิชชั่น">
                    {lead.commission != null ? (
                      <span className="num font-semibold text-green">{formatBaht(lead.commission)}</span>
                    ) : (
                      <span className="text-text-subtle">—</span>
                    )}
                  </Row>
                  <Row label="วันที่ปิด">
                    <span className="num">{formatThaiDate(lead.closing_date)}</span>
                  </Row>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar (real data) */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูล Lead</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-body">
                <Row label="ขั้นตอน">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <Dot className={stg.dot} />
                    {stg.th}
                  </span>
                </Row>
                <Row label="สถานะ">
                  <StatusBadge color={leadStatusDot(lead.lead_status)}>
                    {lead.lead_status ?? "—"}
                  </StatusBadge>
                </Row>
                <Row label="Potential">
                  {lead.potential ? (
                    <GradeChip grade={lead.potential} />
                  ) : (
                    <span className="text-text-subtle">—</span>
                  )}
                </Row>
                <Row label="งบประมาณ">
                  <span className="num font-semibold">{formatBaht(lead.budget)}</span>
                </Row>
                <Row label="ประเภท">
                  {lead.lead_type ? <Pill>{lead.lead_type}</Pill> : <span className="text-text-subtle">—</span>}
                </Row>
                <Row label="ผู้ดูแล">
                  {lead.sale_id ? (
                    <span className="inline-flex items-center gap-2">
                      <Avatar name={lead.sale_id} tone="crimson" className="h-5 w-5" />
                      <span className="num text-text-muted">{lead.sale_id}</span>
                    </span>
                  ) : (
                    <span className="text-text-subtle">—</span>
                  )}
                </Row>
                <Row label="วันที่รับ">
                  <span className="num text-text-muted">{formatThaiDate(lead.date_received)}</span>
                </Row>
                <Row label="ติดตามล่าสุด">
                  <span className="num text-text-muted">{formatThaiDate(lead.last_follow_date)}</span>
                </Row>
              </CardContent>
            </Card>

            {/* Edit history — placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>ประวัติการแก้ไข</CardTitle>
                <Pill>เร็ว ๆ นี้</Pill>
              </CardHeader>
              <CardContent>
                <Empty icon={History}>ยังไม่มีประวัติการแก้ไข</Empty>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-text-subtle">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

function Empty({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
      <Icon size={22} strokeWidth={1.5} className="text-text-subtle" />
      <p className="text-small text-text-subtle">{children}</p>
    </div>
  );
}
