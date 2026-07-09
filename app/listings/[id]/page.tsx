import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bed,
  Bath,
  Maximize,
  MapPin,
  Tag,
  KeyRound,
  Phone,
  Image as ImageIcon,
  Users,
  History,
} from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Dot";
import { Pill } from "@/components/ui/Pill";
import { Avatar } from "@/components/ui/Avatar";
import { getListing } from "@/lib/queries";
import { formatBaht, formatRent, formatNumber, daysOnMarketLabel, dealType } from "@/lib/format";
import { listingStatusDot, potentialTone } from "@/lib/status";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

const DEAL_LABEL: Record<string, string> = {
  sale: "ขาย",
  rent: "เช่า",
  both: "ขาย + เช่า",
  none: "—",
};

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const deal = dealType(listing.asking_price, listing.rental_price);

  return (
    <>
      <Topbar title="ทรัพย์" actions={false} />

      <div className="p-4 lg:p-6 space-y-4">
        <Link
          href="/listings"
          className="inline-flex items-center gap-1.5 text-small text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={1.75} /> กลับไปทรัพย์
        </Link>

        {/* Identity header — inline block (Shelter-style). Stacks on mobile. */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <div className="num text-[11px] text-text-subtle">
              {listing.listing_id} · {listing.property_type ?? "—"} · {DEAL_LABEL[deal]}
            </div>
            <h1 className="text-h1">{listing.listing_name ?? listing.listing_id}</h1>
            <p className="text-small text-text-muted mt-0.5 inline-flex items-center gap-1">
              <MapPin size={12} strokeWidth={1.75} />
              {listing.zone_name_thai ?? "—"}
              {listing.zone && <span className="num text-text-subtle ml-1">{listing.zone}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
            {listing.potential && (
              <Pill tone={potentialTone(listing.potential)}>{listing.potential}</Pill>
            )}
            <StatusBadge color={listingStatusDot(listing.listing_status)}>
              {listing.listing_status ?? "—"}
            </StatusBadge>
            <Button variant="secondary" size="sm" disabled>
              แก้ไข
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
          {/* Main column */}
          <div className="flex flex-col gap-4 min-w-0">
            {/* Gallery — placeholder until photo storage is wired */}
            <Card className="overflow-hidden">
              <div className="h-44 bg-surface-2 grid place-items-center border-b border-border">
                <div className="flex flex-col items-center gap-2 text-text-subtle">
                  <ImageIcon size={28} strokeWidth={1.5} />
                  <span className="text-small">ยังไม่มีรูปภาพ</span>
                </div>
              </div>
              <CardContent className="flex items-center justify-between">
                <span className="text-small text-text-subtle">แกลเลอรีรูปภาพ</span>
                <Pill>เร็ว ๆ นี้</Pill>
              </CardContent>
            </Card>

            {/* Spec strip */}
            <Card>
              <CardContent className="flex items-center gap-6">
                <Spec icon={Bed} label="นอน" value={listing.bed != null ? String(listing.bed) : "—"} />
                <Spec icon={Bath} label="น้ำ" value={listing.bath != null ? String(listing.bath) : "—"} />
                <Spec
                  icon={Maximize}
                  label="พื้นที่"
                  value={listing.area_sqm ? `${formatNumber(listing.area_sqm)} ตร.ม.` : "—"}
                />
              </CardContent>
            </Card>

            {/* Price cards — the absent deal type is dimmed */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className={cn(listing.asking_price == null && "opacity-50")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag size={16} strokeWidth={1.75} className="text-accent" />
                    ราคาขาย
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {listing.asking_price != null ? (
                    <div className="num text-h1 text-accent">{formatBaht(listing.asking_price)}</div>
                  ) : (
                    <div className="text-small text-text-subtle">ไม่ได้ลงขาย</div>
                  )}
                </CardContent>
              </Card>
              <Card className={cn(listing.rental_price == null && "opacity-50")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound size={16} strokeWidth={1.75} className="text-violet" />
                    ค่าเช่า
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {listing.rental_price != null ? (
                    <div className="num text-h1 text-violet">{formatRent(listing.rental_price)}</div>
                  ) : (
                    <div className="text-small text-text-subtle">ไม่ได้ลงเช่า</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Interested buyers — placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>ผู้สนใจ</CardTitle>
                <Pill>เร็ว ๆ นี้</Pill>
              </CardHeader>
              <CardContent>
                <Empty icon={Users}>ยังไม่มีข้อมูลผู้สนใจ</Empty>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* At-a-glance details (real data) */}
            <Card>
              <CardHeader>
                <CardTitle>รายละเอียด</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-small">
                <Row label="สถานะประกาศ">
                  <StatusBadge color={listingStatusDot(listing.listing_status)}>
                    {listing.listing_status ?? "—"}
                  </StatusBadge>
                </Row>
                <Row label="Potential">
                  {listing.potential ? (
                    <Pill tone={potentialTone(listing.potential)}>{listing.potential}</Pill>
                  ) : (
                    <span className="text-text-subtle">—</span>
                  )}
                </Row>
                <Row label="ทำเล">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} strokeWidth={1.75} className="text-text-subtle" />
                    {listing.zone_name_thai ?? "—"}
                    {listing.zone && <span className="num text-text-subtle">{listing.zone}</span>}
                  </span>
                </Row>
                <Row label="ลงประกาศ">
                  <span className="num">{daysOnMarketLabel(listing.days_on_market)}</span>
                </Row>
              </CardContent>
            </Card>

            {/* Owner (real data) */}
            <Card>
              <CardHeader>
                <CardTitle>เจ้าของทรัพย์</CardTitle>
              </CardHeader>
              {listing.owner_name ? (
                <div className="p-4 flex items-center gap-3">
                  <Avatar name={listing.owner_name} tone="crimson" className="h-10 w-10" />
                  <div className="min-w-0">
                    <div className="text-body font-medium truncate">{listing.owner_name}</div>
                    {listing.owner_phone && (
                      <a
                        href={`tel:${listing.owner_phone}`}
                        className="num text-small text-text-muted hover:text-accent inline-flex items-center gap-1 transition-colors"
                      >
                        <Phone size={12} strokeWidth={1.75} />
                        {listing.owner_phone}
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-small text-text-subtle">ไม่ระบุเจ้าของ</div>
              )}
            </Card>

            {/* Marketing — placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>การตลาด</CardTitle>
                <Pill>เร็ว ๆ นี้</Pill>
              </CardHeader>
              <CardContent className="flex flex-col gap-2.5 text-small">
                {["DDproperty", "Livinginsider", "PropertyHub"].map((n) => (
                  <div key={n} className="flex items-center justify-between text-text-subtle">
                    <span>{n}</span>
                    <span>—</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Edit history — placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>ประวัติการแก้ไข</CardTitle>
                <Pill>เร็ว ๆ นี้</Pill>
              </CardHeader>
              <CardContent>
                <Empty icon={History}>ยังไม่มีประวัติการแก้ไข</Empty>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="size-9 rounded-md bg-surface-2 grid place-items-center">
        <Icon size={16} strokeWidth={1.75} className="text-text-muted" />
      </div>
      <div>
        <div className="text-body font-semibold num">{value}</div>
        <div className="text-label text-text-subtle">{label}</div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-text-subtle">{label}</span>
      {children}
    </div>
  );
}

function Empty({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
      <Icon size={22} strokeWidth={1.5} className="text-text-subtle" />
      <p className="text-small text-text-subtle">{children}</p>
    </div>
  );
}
