"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { useMobileNav } from "@/components/MobileNav";

/** Desktop: static rail in the layout grid. Mobile: off-canvas drawer overlay. */
export function Sidebar() {
  const { open, setOpen } = useMobileNav();
  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden lg:flex w-[228px] shrink-0 h-screen sticky top-0 bg-surface border-r border-border flex-col">
        <SidebarBody />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn("lg:hidden fixed inset-0 z-40", open ? "" : "pointer-events-none")}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity",
            open ? "opacity-100" : "opacity-0"
          )}
        />
        <aside
          className={cn(
            "absolute left-0 top-0 h-full w-[270px] max-w-[82%] flex flex-col bg-surface border-r border-border shadow-pop transition-transform duration-200",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarBody />
        </aside>
      </div>
    </>
  );
}

function SidebarBody() {
  const pathname = usePathname();
  return (
    <>
      {/* Brand */}
      <div className="h-14 flex items-center px-4 border-b border-border">
        <div className="leading-none">
          <div
            className="text-h1 font-bold tracking-tight"
            style={{ color: "var(--maroon-900)" }}
          >
            HAUS
          </div>
          <div className="text-label uppercase text-text-subtle mt-0.5">Living Estate</div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <div className="flex items-center gap-2 h-8 px-2.5 rounded-md border border-border bg-surface-2 text-text-subtle text-small">
          <Search size={14} strokeWidth={1.75} />
          <span className="flex-1">ค้นหา…</span>
          <kbd className="num text-label border border-border rounded px-1 bg-surface">⌘K</kbd>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-2 pt-3 pb-2 flex-1 overflow-y-auto">
        {NAV.map((group) => (
          <div key={group.title || group.items[0]?.href} className="mb-3 last:mb-0">
            {group.title && (
              <div className="px-2 text-label uppercase text-text-subtle mb-1">{group.title}</div>
            )}
            {group.items.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 h-9 px-2 rounded-md text-body transition-colors",
                    active
                      ? "bg-accent-wash text-text font-medium"
                      : "text-text-muted hover:bg-surface-hover hover:text-text"
                  )}
                >
                  <Icon size={17} strokeWidth={1.75} className={active ? "text-accent" : ""} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer user */}
      <div className="px-3 py-3 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-wash text-accent text-label">
            HB
          </span>
          <div className="leading-tight">
            <div className="text-small text-text">Haus Boss</div>
            <div className="text-label text-text-subtle">CEO</div>
          </div>
        </div>
      </div>
    </>
  );
}
