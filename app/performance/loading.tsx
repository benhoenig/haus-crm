import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/ui/Card";
import { Skeleton, SkeletonStat } from "@/components/ui/Skeleton";

export default function PerformanceLoading() {
  return (
    <>
      <Topbar title="Actions / KPI" subtitle="กำลังโหลด…" actions={false} />
      <div className="p-4 lg:p-6 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStat key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">
          <Card className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </Card>
          <Card className="p-4 space-y-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
