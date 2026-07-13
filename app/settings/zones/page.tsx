import { ShieldCheck } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/ui/Button";
import { ZonesAdmin } from "@/components/ZonesAdmin";
import { listZones } from "@/lib/zones";

export const dynamic = "force-dynamic";

export default function ZonesSettingsPage() {
  const zones = listZones();

  return (
    <>
      <Topbar
        title="โซน"
        subtitle="ข้อมูลอ้างอิงกลาง · จัดการโดย CEO"
        actions={
          <Button size="sm" disabled>
            + เพิ่มโซน
          </Button>
        }
      />
      <div className="p-4 lg:p-6 space-y-4">
        {/* CEO / master-data note */}
        <div className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-2 px-4 py-3">
          <ShieldCheck size={16} strokeWidth={1.75} className="text-accent mt-0.5 shrink-0" />
          <p className="text-small text-text-muted">
            โซนเป็น<span className="text-text">ข้อมูลอ้างอิงกลาง</span>ที่ทรัพย์ · Lead · Last
            Match อ้างอิงร่วมกัน จัดการโดย CEO เท่านั้น การเพิ่ม/แก้ไขจะเปิดใช้เมื่อเชื่อมต่อระบบสิทธิ์
          </p>
        </div>

        <ZonesAdmin zones={zones} />
      </div>
    </>
  );
}
