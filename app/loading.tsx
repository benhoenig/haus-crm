import { Topbar } from "@/components/Topbar";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import {
  Skeleton,
  SkeletonStat,
  SkeletonTable,
  SkeletonBoard,
} from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <>
      <Topbar title="แดชบอร์ด" subtitle="กำลังโหลด…" />
      <div className="p-6 space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStat key={i} />
          ))}
        </div>

        {/* Pipeline */}
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent className="p-3">
            <SkeletonBoard />
          </CardContent>
        </Card>

        {/* Leaderboard + recent leads */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SkeletonTable
            title
            rows={6}
            columns={[
              { label: "เซล", w: "w-28" },
              { label: "โซน", w: "w-16" },
              { label: "ทรัพย์", w: "w-10", align: "right" },
              { label: "ปิดได้", w: "w-10", align: "right" },
              { label: "มูลค่า", w: "w-16", align: "right" },
            ]}
          />
          <SkeletonTable
            title
            rows={8}
            columns={[
              { label: "ลูกค้า", w: "w-28" },
              { label: "เกรด", w: "w-6" },
              { label: "สถานะ", w: "w-20" },
              { label: "งบ", w: "w-16", align: "right" },
              { label: "ติดตามล่าสุด", w: "w-16", align: "right" },
            ]}
          />
        </div>
      </div>
    </>
  );
}
