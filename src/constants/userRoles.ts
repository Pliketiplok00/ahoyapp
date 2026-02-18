/**
 * User Role Constants
 *
 * Role definitions and permission matrix.
 */

export const USER_ROLES = {
  CAPTAIN: 'captain',
  EDITOR: 'editor',
  CREW: 'crew',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Permission definitions.
 * Each permission maps to array of roles that have it.
 */
export const PERMISSIONS = {
  // Workspace
  editWorkspaceSettings: [USER_ROLES.CAPTAIN],
  inviteCrewMembers: [USER_ROLES.CAPTAIN, USER_ROLES.EDITOR, USER_ROLES.CREW],
  removeCrewMembers: [USER_ROLES.CAPTAIN],
  transferCaptainRole: [USER_ROLES.CAPTAIN],

  // Booking
  createBooking: [USER_ROLES.CAPTAIN, USER_ROLES.EDITOR, USER_ROLES.CREW],
  deleteBooking: [USER_ROLES.CAPTAIN, USER_ROLES.EDITOR, USER_ROLES.CREW],

  // Expenses
  editOwnExpenses: [USER_ROLES.CAPTAIN, USER_ROLES.EDITOR, USER_ROLES.CREW],
  editOthersExpenses: [USER_ROLES.EDITOR],
  deleteOthersExpenses: [USER_ROLES.EDITOR],
  performReconciliation: [USER_ROLES.EDITOR],

  // Tips
  configureTipSplit: [USER_ROLES.CAPTAIN],

  // Export
  exportData: [USER_ROLES.CAPTAIN, USER_ROLES.EDITOR, USER_ROLES.CREW],
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Check if a user with given roles has a specific permission.
 */
export function hasPermission(
  userRoles: UserRole[],
  permission: Permission
): boolean {
  const allowedRoles = PERMISSIONS[permission] as readonly UserRole[];
  return userRoles.some((role) => allowedRoles.includes(role));
}

/**
 * Get all permissions for a set of roles.
 */
export function getPermissions(userRoles: UserRole[]): Permission[] {
  return (Object.keys(PERMISSIONS) as Permission[]).filter((permission) =>
    hasPermission(userRoles, permission)
  );
}

/**
 * Role display configuration
 */
export const ROLE_CONFIG = {
  [USER_ROLES.CAPTAIN]: {
    label: 'Captain',
    labelHR: 'Kapetan',
    description: 'Full admin access, can transfer role',
  },
  [USER_ROLES.EDITOR]: {
    label: 'Editor',
    labelHR: 'Urednik',
    description: 'Can edit all expenses and perform reconciliation',
  },
  [USER_ROLES.CREW]: {
    label: 'Crew Member',
    labelHR: 'Član posade',
    description: 'Can add own expenses and view shared data',
  },
} as const;
