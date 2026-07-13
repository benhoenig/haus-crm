import { Topbar } from "@/components/Topbar";
import { DailyPlan } from "@/components/DailyPlan";
import { TargetsBoard } from "@/components/TargetsBoard";
import { currentAgent } from "@/lib/momentum";

export const dynamic = "force-dynamic";

export default function TodayPage() {
  const agent = currentAgent();

  return (
    <>
      <Topbar title="แผนวันนี้" subtitle={`แผนงานและเป้าหมายของ ${agent}`} actions={false} />
      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
          <DailyPlan agent={agent} />
          <TargetsBoard agent={agent} />
        </div>
      </div>
    </>
  );
}
