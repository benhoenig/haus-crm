import { cn } from "@/lib/cn";
import { Card, CardContent, CardHeader } from "./Card";
import { Table, THead, TBody, TR, TH, TD } from "./Table";
import { STAGES } from "@/lib/pipeline";
import { Dot } from "./Dot";

/* Base shimmer block. Pulse is disabled automatically under
   prefers-reduced-motion (see globals.css). */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded bg-border-strong", className)}
      {...props}
    />
  );
}

export interface SkeletonCol {
  label: string;
  /** Tailwind width class for the placeholder bar, e.g. "w-20". */
  w?: string;
  align?: "right";
}

/* Table placeholder that reuses the real Card + Table chrome so the skeleton
   lines up pixel-for-pixel with the loaded state. Headers are real (static);
   only the data rows shimmer. */
export function SkeletonTable({
  columns,
  rows = 8,
  minWidth,
  title,
  toolbar,
}: {
  columns: SkeletonCol[];
  rows?: number;
  minWidth?: string;
  /** When set, renders a CardHeader (for dashboard cards that have titles). */
  title?: boolean;
  /** When set, renders a search + filter-chip toolbar row (listings index). */
  toolbar?: boolean;
}) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
        </CardHeader>
      )}
      {toolbar && (
        <div className="flex items-center gap-2.5 p-3 border-b border-border flex-wrap">
          <Skeleton className="h-8 w-full sm:w-64" />
          <div className="flex gap-1.5 ml-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-16" />
            ))}
          </div>
        </div>
      )}
      <CardContent className="p-0">
        <Table className={minWidth}>
          <THead>
            <TR>
              {columns.map((c, i) => (
                <TH key={i} className={c.align === "right" ? "text-right" : undefined}>
                  {c.label}
                </TH>
              ))}
            </TR>
          </THead>
          <TBody>
            {Array.from({ length: rows }).map((_, r) => (
              <TR key={r}>
                {columns.map((c, i) => (
                  <TD key={i}>
                    <Skeleton
                      className={cn("h-3.5", c.w ?? "w-20", c.align === "right" && "ml-auto")}
                    />
                  </TD>
                ))}
              </TR>
            ))}
          </TBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* KPI card placeholder — mirrors <Stat />. */
export function SkeletonStat() {
  return (
    <Card className="p-4">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-6 w-28" />
      <Skeleton className="mt-2.5 h-3 w-24" />
    </Card>
  );
}

/* Listing detail placeholder — mirrors the two-column detail layout. */
export function SkeletonDetail() {
  return (
    <div className="p-4 lg:p-6 space-y-4">
      <Skeleton className="h-3.5 w-28" />
      {/* Identity header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-2.5 w-40" />
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-7 w-14" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-56 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-44 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-36 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/* Pipeline board placeholder — mirrors <PipelineBoard /> (real stage headers,
   shimmer deal cards). */
export function SkeletonBoard() {
  const stages = STAGES.filter((s) => s.key !== "Close" && s.key !== "Win");
  return (
    <div className="w-full overflow-x-auto scroll-thin">
      <div className="flex min-w-max border border-border rounded-lg bg-surface divide-x divide-border">
        {stages.map((stage) => (
          <div key={stage.key} className="w-[220px] shrink-0">
            <div className="flex items-center justify-between gap-2 px-3 h-11 border-b border-border">
              <span className="inline-flex items-center gap-1.5 text-h3">
                <Dot className={stage.dot} />
                {stage.th}
              </span>
              <Skeleton className="h-3 w-4" />
            </div>
            <div className="p-2 space-y-2 min-h-[120px]">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="rounded-md border border-border bg-surface p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-4 w-4 rounded-sm" />
                  </div>
                  <Skeleton className="mt-2 h-4 w-20" />
                  <div className="mt-2 flex items-center justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
            <div className="px-3 h-9 flex items-center border-t border-border">
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
