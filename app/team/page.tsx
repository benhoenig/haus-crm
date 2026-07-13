import { Topbar } from "@/components/Topbar";
import { TeamTable } from "@/components/TeamTable";

export const dynamic = "force-dynamic";

export default function TeamPage() {
  return (
    <>
      <Topbar title="ทีม / บุคคล" subtitle="พนักงาน บทบาท และผลงาน" actions={false} />
      <div className="p-4 lg:p-6">
        <TeamTable />
      </div>
    </>
  );
}
