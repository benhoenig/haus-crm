import { Topbar } from "@/components/Topbar";
import { SettingsView } from "@/components/SettingsView";
import { listZones } from "@/lib/zones";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const zones = listZones();

  return (
    <>
      <Topbar title="ตั้งค่า" subtitle="ผู้ใช้ · สิทธิ์ · ข้อมูลอ้างอิงกลาง" actions={false} />
      <div className="p-4 lg:p-6">
        <SettingsView zones={zones} />
      </div>
    </>
  );
}
