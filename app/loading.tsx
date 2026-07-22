import { Topbar } from "@/components/Topbar";
import { Skeleton } from "@/components/ui/Skeleton";

// Loading skeleton for the analytics dashboard (/) — mirrors the new HAUS layout:
// sub-tab bar → range picker → hero → two-col → wide blocks.
export default function DashboardLoading() {
  return (
    <>
      <Topbar title="แดชบอร์ด" subtitle="กำลังโหลด…" actions={false} />
      <div style={{ background: "#f8f8f8" }}>
        {/* sub-tab bar */}
        <div className="flex gap-4 px-4 lg:px-6 h-11 items-center border-b border-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
        {/* range picker */}
        <div className="flex justify-end px-4 lg:px-6 py-3 border-b border-border">
          <Skeleton className="h-7 w-56" />
        </div>
        <div className="max-w-[1240px] mx-auto p-4 lg:p-8 flex flex-col gap-7">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    </>
  );
}
