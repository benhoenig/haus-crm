// SAMPLE DATA — the people/HR surface. Aligns with the RBAC users (same ids) but adds
// HR fields (zone, status, joined, commission). Wire later = an `employees` table joined
// to user_roles. Effort is derived live from the activity log.

import { listActivities } from "@/lib/actions";

export interface Employee {
  id: string; // matches rbac OrgUser id
  name: string;
  managerId?: string; // reports-to (for Sales Leader team scoping)
  zoneId?: string;
  active: boolean;
  joined: string; // YYYY-MM
  commissionMonth: number; // ฿ this month
}

const EMPLOYEES: Employee[] = [
  { id: "u_boss", name: "Haus Boss", active: true, joined: "2024-01", commissionMonth: 0 },
  { id: "u_stone", name: "Stone", managerId: "u_boss", zoneId: "CYP", active: true, joined: "2024-03", commissionMonth: 180000 },
  { id: "u_q", name: "Q", managerId: "u_stone", zoneId: "RM2", active: true, joined: "2024-06", commissionMonth: 95000 },
  { id: "u_mhow", name: "Mhow", managerId: "u_stone", zoneId: "PTM", active: true, joined: "2025-01", commissionMonth: 60000 },
  { id: "u_pup", name: "Pup", managerId: "u_boss", zoneId: "BGY", active: true, joined: "2025-02", commissionMonth: 0 },
  { id: "u_nan", name: "Nan", managerId: "u_boss", active: true, joined: "2024-09", commissionMonth: 0 },
  { id: "u_ploy", name: "Ploy", managerId: "u_boss", active: false, joined: "2024-11", commissionMonth: 0 },
];

export function listEmployees(): Employee[] {
  return EMPLOYEES;
}

/** Activity count this month for an employee — the "effort" figure, from the log. */
export function effortThisMonth(name: string, month = "2026-07"): number {
  return listActivities()
    .filter((a) => a.created_by === name && a.date.startsWith(month))
    .reduce((sum, a) => sum + a.count, 0);
}
