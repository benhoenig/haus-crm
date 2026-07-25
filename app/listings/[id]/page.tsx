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
  Users,
  History,
  Landmark,
  ChevronRight,
  Handshake,
} from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Dot";
import { Pill } from "@/components/ui/Pill";
import { ListingOwnerCard } from "@/components/ListingOwnerCard";
import { ExclusiveAgreementCard } from "@/components/ExclusiveAgreementCard";
import { ListingChecklist } from "@/components/ListingChecklist";
import { ListingCopyButton } from "@/components/ListingCopyButton";
import { getListing } from "@/lib/queries";
import { listingGallery } from "@/lib/placeholderImages"; // PREVIEW ONLY — fake listing photos
import { getProjectByName } from "@/lib/projects";
import { getComparables, closeTypeTone, sizeSummary } from "@/lib/lastMatch";
import { getActivitiesForListing } from "@/lib/actions";
import { formatBaht, formatRent, formatNumber, formatThaiDate, daysOnMarketLabel, dealType } from "@/lib/format";
import { listingStatusDot, potentialTone } from "@/lib/status";
import { cn } from "@/lib/cn";

export const revalidate = 30;

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
  const project = getProjectByName(listing.project_name_eng);
  const comps = getComparables(listing.zone);
  const activities = getActivitiesForListing(listing.listing_id);

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
            {/* Gallery — PREVIEW ONLY fake photos until real storage is wired */}
            <Card className="overflow-hidden">
              {(() => {
                const gallery = listingGallery(listing.listing_id);
                return (
                  <>
                    <div className="h-64 bg-surface-2 border-b border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={gallery[0]} alt="" className="size-full object-cover" />
                    </div>
                    <CardContent className="flex items-center gap-2">
                      {gallery.slice(1).map((src) => (
                        <span
                          key={src}
                          className="h-14 w-20 shrink-0 rounded-md overflow-hidden bg-surface-2 border border-border"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="size-full object-cover" />
                        </span>
                      ))}
                    </CardContent>
                  </>
                );
              })()}
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

            {/* Comparable closes nearby (Last Match) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Handshake size={16} strokeWidth={1.75} className="text-text-muted" />
                  ทรัพย์เทียบเคียง
                </CardTitle>
                <Link href="/last-match" className="text-small text-accent hover:underline">
                  ดูทั้งหมด
                </Link>
              </CardHeader>
              {comps.length > 0 ? (
                <div className="divide-y divide-border">
                  {comps.map((m) => (
                    <div key={m.last_match_id} className="flex items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-body font-medium truncate">{m.project_name ?? "—"}</div>
                        <div className="text-label text-text-subtle num">
                          {sizeSummary(m)}
                          {m.date_created && <span className="ml-2">{formatThaiDate(m.date_created)}</span>}
                        </div>
                      </div>
                      {m.close_type && (
                        <Pill tone={closeTypeTone(m.close_type)}>{m.close_type}</Pill>
                      )}
                      <div className="num text-body font-semibold whitespace-nowrap w-20 text-right">
                        {formatBaht(m.last_match_price)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <CardContent>
                  <Empty icon={Handshake}>ยังไม่มีทรัพย์เทียบเคียงในโซนนี้</Empty>
                </CardContent>
              )}
            </Card>

            {/* Activity timeline — the entity view of the unified activity log */}
            <Card>
              <CardHeader>
                <CardTitle>กิจกรรมล่าสุด</CardTitle>
                <Link href="/performance" className="text-small text-accent hover:underline">
                  ดูทั้งหมด
                </Link>
              </CardHeader>
              {activities.length > 0 ? (
                <div className="divide-y divide-border">
                  {activities.map((a) => (
                    <div key={a.id} className="flex items-start gap-3 px-4 py-3">
                      <span className="mt-1.5 size-2 rounded-full bg-accent shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-body font-medium">{a.action}</span>
                          {a.count > 1 && (
                            <span className="num text-label text-text-subtle">×{a.count}</span>
                          )}
                        </div>
                        {a.remark && (
                          <p className="text-small text-text-muted mt-0.5">{a.remark}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="num text-label text-text-subtle whitespace-nowrap">
                          {formatThaiDate(a.date)}
                        </div>
                        <div className="num text-label text-text-subtle">{a.created_by}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <CardContent>
                  <Empty icon={History}>ยังไม่มีกิจกรรมสำหรับทรัพย์นี้</Empty>
                </CardContent>
              )}
            </Card>

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

            {/* Exclusive agreement window — renders only for Exclusive listings (null otherwise) */}
            <ExclusiveAgreementCard listingId={listing.listing_id} potential={listing.potential} />

            {/* Project knowledge — links to the full project page */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Landmark size={16} strokeWidth={1.75} className="text-text-muted" />
                  โครงการ
                </CardTitle>
              </CardHeader>
              {project ? (
                <Link href={`/projects/${project.id}`} className="block group">
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-body font-medium truncate group-hover:text-accent transition-colors">
                          {project.name_thai}
                        </div>
                        <div className="text-small text-text-subtle truncate">{project.name_eng}</div>
                      </div>
                      <ChevronRight
                        size={16}
                        strokeWidth={1.75}
                        className="text-text-subtle group-hover:text-accent transition-colors shrink-0"
                      />
                    </div>
                    {(project.pros || project.cons) && (
                      <div className="flex flex-col gap-1 text-small border-t border-border pt-2.5">
                        {project.pros && (
                          <span className="text-text-muted line-clamp-1">
                            <span className="text-green">+</span> {project.pros}
                          </span>
                        )}
                        {project.cons && (
                          <span className="text-text-muted line-clamp-1">
                            <span className="text-red">−</span> {project.cons}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="p-4 text-small text-text-subtle">
                  {listing.project_name_eng ?? "ไม่ระบุโครงการ"}
                </div>
              )}
            </Card>

            {/* Owner (real data) — contact is PRIVATE: gated to contacts.view_all or the
                managing agent; everyone else sees the managing agent's contact for Co-Agent. */}
            <ListingOwnerCard
              ownerName={listing.owner_name}
              ownerPhone={listing.owner_phone}
              listingId={listing.listing_id}
            />

            {/* Marketing */}
            <Card>
              <CardHeader>
                <CardTitle>การตลาด</CardTitle>
                <Pill>เร็ว ๆ นี้</Pill>
              </CardHeader>
              <CardContent className="flex flex-col gap-2.5 text-small">
                {/* Ad-copy generator (คำประกาศโฆษณา) — live template fill */}
                <ListingCopyButton listing={listing} />
                <div className="border-t border-border pt-2.5 flex flex-col gap-2.5">
                  {["DDproperty", "Livinginsider", "PropertyHub"].map((n) => (
                    <div key={n} className="flex items-center justify-between text-text-subtle">
                      <span>{n}</span>
                      <span>—</span>
                    </div>
                  ))}
                </div>
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

        {/* Value-add checklist — full-width, last block. A-List / Exclusive only (null otherwise). */}
        <ListingChecklist listingId={listing.listing_id} potential={listing.potential} />
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
