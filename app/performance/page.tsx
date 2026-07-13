import Link from "next/link";
import { UserRound, Building2, CircleDot } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { Pill } from "@/components/ui/Pill";
import { formatThaiDate } from "@/lib/format";
import {
  listActivities,
  tallyByAction,
  summarize,
  type Activity,
  type AttachMode,
} from "@/lib/actions";

export const dynamic = "force-dynamic";

export default function PerformancePage() {
  const activities = listActivities();
  const tallies = tallyByAction(activities);
  const s = summarize(activities);
  const maxCount = Math.max(...tallies.map((t) => t.count), 1);

  return (
    <>
      <Topbar
        title="Actions / KPI"
        subtitle="บันทึกกิจกรรมของทีม · การลงมือทำ (effort) และผลลัพธ์"
        actions={false}
      />
      <div className="p-4 lg:p-6 space-y-4">
        {/* KPI stats — aggregated from the SAME rows the timelines use */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="กิจกรรมทั้งหมด" value={s.total} hint={`${s.events} รายการที่บันทึก`} />
          <Stat label="แท็กลูกค้า" value={s.leadTagged} hint="ลงในไทม์ไลน์ลูกค้า" />
          <Stat label="แท็กทรัพย์" value={s.listingTagged} hint="ลงในไทม์ไลน์ทรัพย์" />
          <Stat label="ไม่ระบุ (KPI รวม)" value={s.untagged} hint="งานทั่วไป / ยอดรวม" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">
          {/* Recent activity feed — the unified log */}
          <Card>
            <CardHeader>
              <CardTitle>กิจกรรมล่าสุด</CardTitle>
              <span className="text-small text-text-subtle">
                <span className="num">{activities.length}</span> รายการ
              </span>
            </CardHeader>
            <div className="divide-y divide-border">
              {activities.map((a) => (
                <ActivityRow key={a.id} activity={a} />
              ))}
            </div>
          </Card>

          {/* By-type tally */}
          <Card>
            <CardHeader>
              <CardTitle>ตามประเภทกิจกรรม</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {tallies.map((t) => (
                <div key={t.action} className="flex items-center gap-2.5">
                  <div className="w-24 shrink-0 text-small truncate">{t.action}</div>
                  <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                    <div
                      className={barTone(t.attach)}
                      style={{ width: `${(t.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <div className="num text-small text-text-muted w-6 text-right">{t.count}</div>
                </div>
              ))}
            </CardContent>
            <div className="px-4 pb-4 pt-1 text-label text-text-subtle leading-relaxed">
              กิจกรรมเดียวกันนี้แสดงทั้งในหน้า KPI นี้ และในไทม์ไลน์ของลูกค้า/ทรัพย์ที่ถูกแท็ก
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function ActivityRow({ activity: a }: { activity: Activity }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <AttachIcon mode={a.attach} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-body font-medium">{a.action}</span>
          {a.count > 1 && <span className="num text-label text-text-subtle">×{a.count}</span>}
          <EntityTag activity={a} />
        </div>
        {a.remark && <p className="text-small text-text-muted mt-0.5 line-clamp-1">{a.remark}</p>}
      </div>
      <div className="text-right shrink-0">
        <div className="num text-label text-text-subtle whitespace-nowrap">
          {formatThaiDate(a.date)}
        </div>
        <div className="num text-label text-text-subtle">{a.created_by}</div>
      </div>
    </div>
  );
}

function EntityTag({ activity: a }: { activity: Activity }) {
  if (a.related_listing_id) {
    return (
      <Link
        href={`/listings/${a.related_listing_id}`}
        className="inline-flex items-center gap-1 text-small text-accent hover:underline"
      >
        <Building2 size={12} strokeWidth={1.75} />
        {a.related_listing_name ?? a.related_listing_id}
      </Link>
    );
  }
  if (a.related_lead_id) {
    // Sample lead IDs aren't in the live table yet → show as a tag, link once wired.
    return (
      <span className="inline-flex items-center gap-1 text-small text-violet">
        <UserRound size={12} strokeWidth={1.75} />
        {a.related_lead_name ?? a.related_lead_id}
      </span>
    );
  }
  return <Pill tone="neutral">งานทั่วไป</Pill>;
}

function AttachIcon({ mode }: { mode: AttachMode }) {
  const cls = "size-8 rounded-md grid place-items-center shrink-0";
  if (mode === "lead")
    return (
      <span className={`${cls} bg-violet-bg text-violet`}>
        <UserRound size={15} strokeWidth={1.75} />
      </span>
    );
  if (mode === "listing")
    return (
      <span className={`${cls} bg-accent-wash text-accent`}>
        <Building2 size={15} strokeWidth={1.75} />
      </span>
    );
  return (
    <span className={`${cls} bg-surface-2 text-text-subtle`}>
      <CircleDot size={15} strokeWidth={1.75} />
    </span>
  );
}

function barTone(mode: AttachMode): string {
  const base = "h-full rounded-full ";
  if (mode === "lead") return base + "bg-violet";
  if (mode === "listing") return base + "bg-accent";
  return base + "bg-text-subtle";
}
