"use client";

import * as React from "react";
import {
  SEED_ROLES,
  SEED_USERS,
  effectivePermissions,
  type Role,
  type OrgUser,
} from "@/lib/rbac";

// Shared RBAC store — single source for BOTH the Settings role editor and app-wide
// gating, so editing a role's permissions live-changes what that persona sees. Plus a
// "view as" viewer (design stand-in for the auth session). In-memory (design phase);
// the chosen viewer persists to localStorage so it survives a reload. Wiring replaces
// `viewerId`/`can` with the authenticated session's union of role permissions.

interface RbacValue {
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  users: OrgUser[];
  setUsers: React.Dispatch<React.SetStateAction<OrgUser[]>>;
  viewerId: string;
  setViewerId: (id: string) => void;
  currentUser: OrgUser;
  perms: Set<string>;
  /** True if any of the given permission keys is granted (or none required). */
  can: (keys?: string | string[]) => boolean;
}

const RbacCtx = React.createContext<RbacValue | null>(null);
const STORAGE_KEY = "haus.viewAs";

export function RbacProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = React.useState<Role[]>(() =>
    SEED_ROLES.map((r) => ({ ...r, permissions: [...r.permissions] }))
  );
  const [users, setUsers] = React.useState<OrgUser[]>(() =>
    SEED_USERS.map((u) => ({ ...u, roleIds: [...u.roleIds] }))
  );
  // Default to the CEO so the app renders full before the client hydrates a saved choice.
  const [viewerId, setViewerIdState] = React.useState<string>("u_boss");

  React.useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (saved) setViewerIdState(saved);
  }, []);

  const setViewerId = React.useCallback((id: string) => {
    setViewerIdState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const currentUser = React.useMemo(
    () => users.find((u) => u.id === viewerId) ?? users[0],
    [users, viewerId]
  );

  const perms = React.useMemo(
    () => effectivePermissions(currentUser, roles),
    [currentUser, roles]
  );

  const can = React.useCallback(
    (keys?: string | string[]) => {
      if (!keys) return true;
      const list = Array.isArray(keys) ? keys : [keys];
      if (list.length === 0) return true;
      return list.some((k) => perms.has(k));
    },
    [perms]
  );

  const value: RbacValue = {
    roles,
    setRoles,
    users,
    setUsers,
    viewerId,
    setViewerId,
    currentUser,
    perms,
    can,
  };

  return <RbacCtx.Provider value={value}>{children}</RbacCtx.Provider>;
}

export function useRbac(): RbacValue {
  const ctx = React.useContext(RbacCtx);
  if (!ctx) throw new Error("useRbac must be used within RbacProvider");
  return ctx;
}
