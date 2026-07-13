import { Topbar } from "@/components/Topbar";
import { LastMatchBrowser } from "@/components/LastMatchBrowser";
import { listMatches } from "@/lib/lastMatch";

export const dynamic = "force-dynamic";

export default function LastMatchPage() {
  const matches = listMatches();

  return (
    <>
      <Topbar
        title="Last Match"
        subtitle={`ทรัพย์เทียบเคียงในตลาด · ${matches.length} รายการ`}
        actions={false}
      />
      <div className="p-4 lg:p-6">
        <LastMatchBrowser matches={matches} />
      </div>
    </>
  );
}
