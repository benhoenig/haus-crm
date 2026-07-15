// SAMPLE DATA + permission catalog — UI-first, configurable RBAC.
//
// Roles are NOT hardcoded capabilities: a role is an editable SET of permissions, and a
// user holds one or more roles (effective access = the UNION). The CEO edits roles +
// assigns users on /settings/roles. Every role ships with a seeded default matrix (see
// SEED_ROLES) — that matrix IS the access policy, so the wiring phase has a spec to
// enforce rather than an empty grid. CEO is locked to all permissions (superadmin).
//
// Design phase: changes live in component state only (not persisted). Wire later =
// tables `permissions` (fixed catalog), `roles`, `role_permissions`, `user_roles`, and
// a `can()` check fed by the authenticated session's union of role permissions.

export interface Permission {
  key: string;
  label: string;
  hint?: string;
}
export interface PermissionGroup {
  key: string;
  label: string;
  perms: Permission[];
}

// The catalog = the actual gates we implement in the app. Roles combine these freely.
export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: "leads",
    label: "Lead / ดีล",
    perms: [
      { key: "leads.view_all", label: "ดู Lead ทั้งหมด" },
      { key: "leads.view_own", label: "ดู Lead ของตัวเอง", hint: "เฉพาะที่ได้รับมอบหมาย" },
      { key: "leads.assign", label: "มอบหมาย Lead" },
      { key: "leads.edit", label: "แก้ไข Lead" },
    ],
  },
  {
    key: "contacts",
    label: "ผู้ติดต่อ",
    perms: [
      { key: "contacts.view_all", label: "ดูผู้ติดต่อทั้งหมด" },
      { key: "contacts.view_own", label: "ดูเฉพาะที่สร้าง/ได้รับมอบหมาย" },
      { key: "contacts.manage", label: "จัดการผู้ติดต่อ" },
    ],
  },
  {
    key: "inventory",
    label: "คลังทรัพย์",
    perms: [
      { key: "listings.view", label: "ดูทรัพย์" },
      { key: "listings.edit", label: "แก้ไขทรัพย์" },
      { key: "listings.marketing", label: "การตลาด / ลงพอร์ทัล" },
      { key: "projects.edit", label: "แก้ไขโครงการ" },
      { key: "lastmatch.add", label: "เพิ่ม Last Match" },
    ],
  },
  {
    key: "activity",
    label: "กิจกรรม",
    perms: [{ key: "activity.log", label: "บันทึกกิจกรรม (ปุ่มลอย)", hint: "สำหรับคนที่ทำงานขาย" }],
  },
  {
    key: "performance",
    label: "เป้าหมาย / KPI",
    perms: [
      { key: "performance.view_team", label: "ดูผลงานทีม" },
      { key: "performance.view_own", label: "ดูผลงานตัวเอง" },
      { key: "targets.set", label: "ตั้งเป้าหมายให้ทีม" },
      { key: "targets.stretch", label: "ตั้งเป้าหมายส่วนตัวเพิ่ม" },
    ],
  },
  {
    key: "financials",
    label: "การเงิน",
    perms: [
      // Compensation ONLY — this does NOT gate listing prices. Anyone with
      // `listings.view` sees asking/rental price (a listing without a price is useless).
      {
        key: "financials.view_comp",
        label: "ดูค่าตอบแทนของทีม (เงินเดือน/คอมมิชชั่น)",
        hint: "เงินเดือน + เรตคอมของพนักงาน — CEO/HR เท่านั้น",
      },
      { key: "financials.payroll", label: "จัดการเงินเดือน" },
    ],
  },
  {
    key: "people",
    label: "บุคคล",
    perms: [
      { key: "people.manage", label: "จัดการพนักงาน (HR)" },
      {
        key: "people.view_sensitive",
        label: "ดูข้อมูลอ่อนไหว (บัตร ปชช./บัญชี/สลิป)",
        hint: "PII และเอกสารพนักงาน — CEO/HR เท่านั้น",
      },
    ],
  },
  {
    key: "masterdata",
    label: "ข้อมูลหลัก",
    perms: [{ key: "masterdata.govern", label: "จัดการโซน & ชุดข้อมูลอ้างอิง" }],
  },
  {
    key: "system",
    label: "ระบบ",
    perms: [{ key: "roles.manage", label: "จัดการบทบาท & สิทธิ์" }],
  },
];

export const ALL_PERMISSIONS: string[] = PERMISSION_GROUPS.flatMap((g) =>
  g.perms.map((p) => p.key)
);

export function permissionLabel(key: string): string {
  for (const g of PERMISSION_GROUPS) {
    const p = g.perms.find((x) => x.key === key);
    if (p) return p.label;
  }
  return key;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  /** Permission keys granted. */
  permissions: string[];
  /** System role: cannot be deleted; CEO is locked to all permissions. */
  system?: boolean;
}

export interface OrgUser {
  id: string;
  name: string;
  /** One or more role ids — effective access is the union of their permissions. */
  roleIds: string[];
}

// Roles reflect the real org (HR Sheet → Position / 2nd Position): CEO, Agent (Sales),
// Listing Support, Marketing are staffed today. Sales Leader / Admin / HR are seeded but
// UNSTAFFED (0 users = 0 real access) — they document the org's stated future (lead
// dispatch, player-coach transition, payroll) and are testable via view-as. CEO can
// delete any that never get used.
//
// This matrix is the **intended access policy** and the spec the wiring phase must
// reproduce in RLS — the client-side `can()` is convenience, not enforcement.
// Rules encoded here:
//   • view_all beats view_own — grant only one per surface.
//   • Agents are own-scoped (matches the created_by/assigned_to contact privacy already
//     built) but DO see team performance — the leaderboard is intentionally public.
//   • Compensation + PII are CEO/HR only, and are two SEPARATE gates.
//   • activity.log goes to everyone who carries a commission rate (incl. Benz + Pui).
export const SEED_ROLES: Role[] = [
  {
    id: "ceo",
    name: "CEO",
    description: "ผู้บริหารสูงสุด — เข้าถึงทุกอย่าง กำหนดบทบาทและสิทธิ์",
    permissions: [...ALL_PERMISSIONS],
    system: true,
  },
  {
    id: "agent",
    name: "Agent (Sales)",
    description: "เซลส์ / ดูแลดีลของตัวเอง",
    permissions: [
      "leads.view_own",
      "leads.edit",
      "contacts.view_own",
      "contacts.manage",
      "listings.view",
      "listings.edit",
      "lastmatch.add",
      "activity.log",
      "performance.view_own",
      "performance.view_team",
      "targets.stretch",
    ],
  },
  {
    id: "listing_support",
    name: "Listing Support",
    description: "งานสนับสนุนการลงประกาศ/คลังทรัพย์",
    permissions: [
      // Needs every owner's contact to coordinate listings — not own-scoped.
      "contacts.view_all",
      "listings.view",
      "listings.edit",
      "listings.marketing",
      "projects.edit",
      "lastmatch.add",
      "activity.log",
      "performance.view_own",
      "targets.stretch",
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "การตลาด / โซเชียล / ลงโฆษณา",
    permissions: [
      "listings.view",
      "listings.marketing",
      "activity.log",
      "performance.view_own",
      "targets.stretch",
    ],
  },
  {
    id: "sales_leader",
    name: "Sales Leader",
    description: "หัวหน้าทีมขาย (ยังไม่มีผู้ดำรงตำแหน่ง)",
    permissions: [
      "leads.view_all",
      "leads.edit",
      "leads.assign",
      "contacts.view_all",
      "contacts.manage",
      "listings.view",
      "listings.edit",
      "lastmatch.add",
      "activity.log",
      "performance.view_own",
      "performance.view_team",
      "targets.set",
      "targets.stretch",
    ],
  },
  {
    id: "admin",
    name: "Admin",
    description: "งานธุรการ / มอบหมายดีล (ยังไม่มีผู้ดำรงตำแหน่ง)",
    permissions: [
      "leads.view_all",
      "leads.edit",
      "leads.assign",
      "contacts.view_all",
      "contacts.manage",
      "listings.view",
    ],
  },
  {
    id: "hr",
    name: "HR",
    description: "งานบุคคล / เงินเดือน (ยังไม่มีผู้ดำรงตำแหน่ง)",
    permissions: [
      "people.manage",
      "people.view_sensitive",
      "financials.view_comp",
      "financials.payroll",
      "performance.view_team",
    ],
  },
];

// Real staff (HR Sheet → Employee Lists, Active only). Stone is a genuine player-coach:
// CEO who also carries a Sales role. Login ids mirror lib/team.ts Employee.id.
export const SEED_USERS: OrgUser[] = [
  { id: "u_stone", name: "Stone", roleIds: ["ceo", "agent"] },
  { id: "u_pup", name: "Pup", roleIds: ["agent"] },
  { id: "u_game", name: "Game", roleIds: ["agent"] },
  { id: "u_q", name: "Q", roleIds: ["agent"] },
  { id: "u_mhow", name: "Mhow", roleIds: ["agent"] },
  { id: "u_golf", name: "Golf", roleIds: ["agent"] },
  { id: "u_benz", name: "Benz", roleIds: ["listing_support"] },
  { id: "u_pui", name: "Pui", roleIds: ["marketing"] },
];

/** Effective permission set for a user = union across their roles. */
export function effectivePermissions(user: OrgUser, roles: Role[]): Set<string> {
  const out = new Set<string>();
  for (const rid of user.roleIds) {
    const r = roles.find((x) => x.id === rid);
    r?.permissions.forEach((p) => out.add(p));
  }
  return out;
}

export function can(perms: Set<string>, key: string): boolean {
  return perms.has(key);
}

export function roleUserCount(roleId: string, users: OrgUser[]): number {
  return users.filter((u) => u.roleIds.includes(roleId)).length;
}
