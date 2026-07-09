import { Topbar } from "@/components/Topbar";
import { SkeletonStat, SkeletonBoard } from "@/components/ui/Skeleton";

export default function PipelineLoading() {
  return (
    <>
      <Topbar title="ไปป์ไลน์" subtitle="กำลังโหลด…" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStat key={i} />
          ))}
        </div>
        <SkeletonBoard />
      </div>
    </>
  );
}
