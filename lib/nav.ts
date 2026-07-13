import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Columns3,
  Users,
  Building2,
  Contact,
  Landmark,
  Handshake,
  Activity,
  Settings,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  /** Section header. Empty string renders the items with no header. */
  title: string;
  items: NavItem[];
  /** CEO/admin-only section (role-gated once auth is wired). */
  admin?: boolean;
  /** Pin this group to the bottom of the sidebar (e.g. Settings). */
  bottom?: boolean;
}

// Grouped by what the user is *doing*, not 1:1 with source tabs:
//   ดีล = active deals · คลังทรัพย์ = inventory agents use · ผลงาน = performance ·
//   ตั้งค่า = master data the CEO governs (role-gated later).
export const NAV: NavGroup[] = [
  {
    title: "ภาพรวม",
    items: [{ href: "/", label: "แดชบอร์ด", icon: LayoutDashboard }],
  },
  {
    title: "ดีล",
    items: [
      { href: "/pipeline", label: "ไปป์ไลน์", icon: Columns3 },
      { href: "/leads", label: "Lead", icon: Users },
    ],
  },
  {
    title: "คลังทรัพย์",
    items: [
      { href: "/listings", label: "ทรัพย์", icon: Building2 },
      { href: "/projects", label: "โครงการ", icon: Landmark },
      { href: "/last-match", label: "Last Match", icon: Handshake },
    ],
  },
  {
    title: "ติดต่อ",
    items: [{ href: "/contacts", label: "ผู้ติดต่อ", icon: Contact }],
  },
  {
    title: "ผลงาน",
    items: [{ href: "/performance", label: "Actions / KPI", icon: Activity }],
  },
  {
    // Single settings hub; sections (roles, zones, master-data) live inside the page.
    title: "",
    admin: true,
    bottom: true,
    items: [{ href: "/settings", label: "ตั้งค่า", icon: Settings }],
  },
];
