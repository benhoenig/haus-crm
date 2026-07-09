"use client";

import { Menu } from "lucide-react";
import { Button } from "./ui/Button";
import { useMobileNav } from "@/components/MobileNav";

export function Topbar({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  /** Right-side actions. Omit to render the default ส่งออก / เพิ่มรายการ buttons. */
  actions?: React.ReactNode;
}) {
  const { setOpen } = useMobileNav();
  return (
    <header className="h-14 shrink-0 border-b border-border bg-surface/80 backdrop-blur flex items-center gap-2 px-4 lg:px-6 sticky top-0 z-10">
      <button
        onClick={() => setOpen(true)}
        aria-label="เปิดเมนู"
        className="lg:hidden -ml-1 size-9 grid place-items-center rounded-md text-text-muted hover:bg-surface-hover hover:text-text transition-colors shrink-0"
      >
        <Menu size={20} strokeWidth={1.75} />
      </button>
      <div className="min-w-0">
        <h1 className="text-h1 truncate">{title}</h1>
        {subtitle && <p className="text-small text-text-muted -mt-0.5 truncate">{subtitle}</p>}
      </div>
      <div className="ml-auto flex items-center gap-2 shrink-0">
        {actions === undefined ? (
          <>
            <Button variant="secondary" size="sm">
              ส่งออก
            </Button>
            <Button size="sm">+ เพิ่มรายการ</Button>
          </>
        ) : (
          actions
        )}
      </div>
    </header>
  );
}
