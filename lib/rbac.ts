// SAMPLE DATA + permission catalog — UI-first, configurable RBAC.
//
// Roles are NOT hardcoded capabilities: a role is an editable SET of permissions, and a
// user holds one or more roles (effective access = the UNION). The CEO edits roles +
// assigns users on /settings/roles. Only CEO is seeded with permissions; the other five
// roles start EMPTY on purpose — their duties are defined by toggling, not assumed.
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
      { key: "financials.view", label: "ดูข้อมูลการเงิน (ราคา/คอมมิชชั่น)" },
      { key: "financials.payroll", label: "จัดการเงินเดือน" },
    ],
  },
  {
    key: "people",
    label: "บุคคล",
    perms: [{ key: "people.manage", label: "จัดการพนักงาน (HR)" }],
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

// CEO seeded with everything; the other five start EMPTY (define via toggles).
export const SEED_ROLES: Role[] = [
  {
    id: "ceo",
    name: "CEO",
    description: "ผู้บริหารสูงสุด — เข้าถึงทุกอย่าง กำหนดบทบาทและสิทธิ์",
    permissions: [...ALL_PERMISSIONS],
    system: true,
  },
  { id: "admin", name: "Admin", description: "งานธุรการ / จัดการดีลและผู้ติดต่อ", permissions: [] },
  { id: "listing_support", name: "Listing Support", description: "ยังไม่กำหนดหน้าที่", permissions: [] },
  { id: "sales_leader", name: "Sales Leader", description: "หัวหน้าทีมขาย", permissions: [] },
  { id: "agent", name: "Agent", description: "เซลส์ / ดูแลดีลของตัวเอง", permissions: [] },
  { id: "hr", name: "HR", description: "งานบุคคล", permissions: [] },
];

// Sample users — includes a player-coach (Stone = Agent + Sales Leader) to exercise multi-role.
export const SEED_USERS: OrgUser[] = [
  { id: "u_boss", name: "Haus Boss", roleIds: ["ceo"] },
  { id: "u_stone", name: "Stone", roleIds: ["agent", "sales_leader"] },
  { id: "u_q", name: "Q", roleIds: ["agent"] },
  { id: "u_mhow", name: "Mhow", roleIds: ["agent"] },
  { id: "u_pup", name: "Pup", roleIds: ["listing_support"] },
  { id: "u_nan", name: "Nan", roleIds: ["admin"] },
  { id: "u_ploy", name: "Ploy", roleIds: ["hr"] },
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
