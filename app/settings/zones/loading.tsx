import { Topbar } from "@/components/Topbar";
import { Skeleton, SkeletonTable } from "@/components/ui/Skeleton";

export default function ZonesLoading() {
  return (
    <>
      <Topbar title="โซน" subtitle="กำลังโหลด…" actions={false} />
      <div className="p-4 lg:p-6 space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <SkeletonTable
          minWidth="min-w-[560px]"
          columns={[
            { label: "รหัส", w: "w-12" },
            { label: "ชื่อโซน", w: "w-28" },
            { label: "ชื่ออังกฤษ", w: "w-28" },
            { label: "เซลส์ที่ดูแล", w: "w-16" },
            { label: "จัดการ", w: "w-8", align: "right" },
          ]}
        />
      </div>
    </>
  );
}
