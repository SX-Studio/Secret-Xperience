// Canonical roles. Mirrors the app_role enum in 0001_foundations.sql.
export const ROLES = ['user', 'creator', 'box_admin', 'platform_admin'] as const;
export type Role = (typeof ROLES)[number];

// Roles a person may choose at self-service signup. Admin roles are assigned
// by the platform only (enforced again in the DB trigger).
export const SIGNUP_ROLES = ['user', 'creator'] as const;
export type SignupRole = (typeof SIGNUP_ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

export type AccountStatus = 'active' | 'suspended' | 'pending';

export interface Profile {
  id: string;
  public_code: string;
  role: Role;
  status: AccountStatus;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}
