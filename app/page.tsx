import { Topbar } from "@/components/Topbar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { formatThaiDate } from "@/lib/format";

export const dynamic = "force-dynamic";

// Analytics dashboard — ported from the HAUS V2 sales dashboard (summary_* model).
// Team overview + per-agent profiles, driven by a month-range picker. Design-first:
// sample data in lib/dashboard.ts whose shapes mirror the eventual Supabase rollup —
// see DATA_MODEL.md → "Dashboard (analytics)". Real snapshot numbers (active leads /
// listings, per-agent v_sale_status) can be wired into the snapshot cards at integration.
export default function DashboardPage() {
  return (
    <>
      <Topbar title="แดชบอร์ด" subtitle={`ภาพรวมทีมและรายบุคคล · ${formatThaiDate(new Date())}`} actions={false} />
      <Dashboard />
    </>
  );
}
