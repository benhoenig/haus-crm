import { Topbar } from "@/components/Topbar";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function RolesLoading() {
  return (
    <>
      <Topbar title="บทบาท & สิทธิ์" subtitle="กำลังโหลด…" actions={false} />
      <div className="p-4 lg:p-6 space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-[248px_1fr] gap-4 items-start">
          <Card className="p-3 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </Card>
          <div className="space-y-4">
            <Card className="p-4">
              <Skeleton className="h-8 w-48" />
            </Card>
            <Card className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
