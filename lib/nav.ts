import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarCheck,
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
  /** Show only if the viewer has any of these permissions (omit = always visible). */
  perm?: string | string[];
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
    items: [
      { href: "/", label: "แดชบอร์ด", icon: LayoutDashboard },
      { href: "/today", label: "แผนวันนี้", icon: CalendarCheck, perm: ["performance.view_own", "performance.view_team"] },
    ],
  },
  {
    title: "ดีล",
    items: [
      { href: "/pipeline", label: "ไปป์ไลน์", icon: Columns3, perm: ["leads.view_all", "leads.view_own"] },
      { href: "/leads", label: "Lead", icon: Users, perm: ["leads.view_all", "leads.view_own"] },
    ],
  },
  {
    title: "คลังทรัพย์",
    items: [
      { href: "/listings", label: "ทรัพย์", icon: Building2, perm: "listings.view" },
      { href: "/projects", label: "โครงการ", icon: Landmark, perm: "listings.view" },
      { href: "/last-match", label: "Last Match", icon: Handshake, perm: ["listings.view", "lastmatch.add"] },
    ],
  },
  {
    title: "ติดต่อ",
    items: [
      { href: "/contacts", label: "ผู้ติดต่อ", icon: Contact, perm: ["contacts.view_all", "contacts.view_own"] },
    ],
  },
  {
    title: "ผลงาน",
    items: [
      { href: "/performance", label: "Actions / KPI", icon: Activity, perm: ["performance.view_team", "performance.view_own"] },
    ],
  },
  {
    // Single settings hub; sections (roles, zones, master-data) live inside the page.
    title: "",
    admin: true,
    bottom: true,
    items: [
      { href: "/settings", label: "ตั้งค่า", icon: Settings, perm: ["roles.manage", "masterdata.govern"] },
    ],
  },
];
