import { Topbar } from "@/components/Topbar";
import { LeadsBrowser } from "@/components/LeadsBrowser";
import { getCrm } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const crm = await getCrm();

  return (
    <>
      <Topbar title="Lead" subtitle={`CRM ฝั่งผู้ซื้อ · ${crm.length} รายการ`} />
      <div className="p-4 lg:p-6">
        <LeadsBrowser crm={crm} />
      </div>
    </>
  );
}
