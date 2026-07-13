import { Topbar } from "@/components/Topbar";
import { LeadAssignment } from "@/components/LeadAssignment";
import { getCrm } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AssignPage() {
  const leads = await getCrm();

  return (
    <>
      <Topbar title="มอบหมาย Lead" subtitle="กระจายลีดให้ทีมขาย" actions={false} />
      <div className="p-4 lg:p-6">
        <LeadAssignment leads={leads} />
      </div>
    </>
  );
}
