import { Info } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { RolesManager } from "@/components/RolesManager";

export const dynamic = "force-dynamic";

export default function RolesSettingsPage() {
  return (
    <>
      <Topbar title="บทบาท & สิทธิ์" subtitle="กำหนดบทบาทและสิทธิ์การใช้งาน · จัดการโดย CEO" actions={false} />
      <div className="p-4 lg:p-6 space-y-4">
        {/* Design-mode note */}
        <div className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-2 px-4 py-3">
          <Info size={16} strokeWidth={1.75} className="text-accent mt-0.5 shrink-0" />
          <p className="text-small text-text-muted">
            สร้างบทบาท เปิด/ปิดสิทธิ์ และกำหนดผู้ใช้ได้ที่นี่ — ผู้ใช้หนึ่งคนถือได้หลายบทบาท (สิทธิ์รวมกัน)
            เช่น หัวหน้าทีมที่ยังขายอยู่ = Agent + Sales Leader.{" "}
            <span className="text-text">โหมดออกแบบ: การเปลี่ยนแปลงยังไม่ถูกบันทึก</span>
          </p>
        </div>

        <RolesManager />
      </div>
    </>
  );
}
