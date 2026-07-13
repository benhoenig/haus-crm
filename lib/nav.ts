import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Columns3, Users, Building2, Contact } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV: NavItem[] = [
  { href: "/",           label: "แดชบอร์ด",   icon: LayoutDashboard },
  { href: "/pipeline",   label: "ไปป์ไลน์",    icon: Columns3 },
  { href: "/leads",      label: "Lead",       icon: Users },
  { href: "/listings",   label: "ทรัพย์",      icon: Building2 },
  { href: "/contacts",   label: "ผู้ติดต่อ",    icon: Contact },
];
