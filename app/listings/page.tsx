import { Topbar } from "@/components/Topbar";
import { ListingsBrowser } from "@/components/ListingsBrowser";
import { getListings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ListingsPage() {
  const listings = await getListings();

  return (
    <>
      <Topbar title="ทรัพย์" subtitle={`ประกาศทั้งหมด · ${listings.length} รายการ`} />
      <div className="p-4 lg:p-6">
        <ListingsBrowser listings={listings} />
      </div>
    </>
  );
}
