/**
 * User Roles Tests
 *
 * Tests for permission checking utilities.
 */

import {
  USER_ROLES,
  PERMISSIONS,
  hasPermission,
  getPermissions,
  ROLE_CONFIG,
  type UserRole,
  type Permission,
} from './userRoles';

describe('USER_ROLES', () => {
  it('defines captain role', () => {
    expect(USER_ROLES.CAPTAIN).toBe('captain');
  });

  it('defines editor role', () => {
    expect(USER_ROLES.EDITOR).toBe('editor');
  });

  it('defines crew role', () => {
    expect(USER_ROLES.CREW).toBe('crew');
  });

  it('has exactly 3 roles', () => {
    expect(Object.keys(USER_ROLES)).toHaveLength(3);
  });
});

describe('PERMISSIONS', () => {
  it('defines workspace permissions', () => {
    expect(PERMISSIONS.editWorkspaceSettings).toBeDefined();
    expect(PERMISSIONS.inviteCrewMembers).toBeDefined();
    expect(PERMISSIONS.removeCrewMembers).toBeDefined();
    expect(PERMISSIONS.transferCaptainRole).toBeDefined();
  });

  it('defines booking permissions', () => {
    expect(PERMISSIONS.createBooking).toBeDefined();
    expect(PERMISSIONS.deleteBooking).toBeDefined();
  });

  it('defines expense permissions', () => {
    expect(PERMISSIONS.editOwnExpenses).toBeDefined();
    expect(PERMISSIONS.editOthersExpenses).toBeDefined();
    expect(PERMISSIONS.deleteOthersExpenses).toBeDefined();
    expect(PERMISSIONS.performReconciliation).toBeDefined();
  });

  it('defines tip permissions', () => {
    expect(PERMISSIONS.configureTipSplit).toBeDefined();
  });

  it('defines export permissions', () => {
    expect(PERMISSIONS.exportData).toBeDefined();
  });

  it('captain-only permissions', () => {
    // These should only include captain
    expect(PERMISSIONS.editWorkspaceSettings).toEqual([USER_ROLES.CAPTAIN]);
    expect(PERMISSIONS.removeCrewMembers).toEqual([USER_ROLES.CAPTAIN]);
    expect(PERMISSIONS.transferCaptainRole).toEqual([USER_ROLES.CAPTAIN]);
    expect(PERMISSIONS.configureTipSplit).toEqual([USER_ROLES.CAPTAIN]);
  });

  it('editor-only permissions', () => {
    expect(PERMISSIONS.editOthersExpenses).toEqual([USER_ROLES.EDITOR]);
    expect(PERMISSIONS.deleteOthersExpenses).toEqual([USER_ROLES.EDITOR]);
    expect(PERMISSIONS.performReconciliation).toEqual([USER_ROLES.EDITOR]);
  });

  it('all-roles permissions', () => {
    const allRoles = [USER_ROLES.CAPTAIN, USER_ROLES.EDITOR, USER_ROLES.CREW];
    expect(PERMISSIONS.inviteCrewMembers).toEqual(allRoles);
    expect(PERMISSIONS.createBooking).toEqual(allRoles);
    expect(PERMISSIONS.deleteBooking).toEqual(allRoles);
    expect(PERMISSIONS.editOwnExpenses).toEqual(allRoles);
    expect(PERMISSIONS.exportData).toEqual(allRoles);
  });
});

describe('hasPermission', () => {
  describe('captain permissions', () => {
    const captainRoles: UserRole[] = ['captain'];

    it('can edit workspace settings', () => {
      expect(hasPermission(captainRoles, 'editWorkspaceSettings')).toBe(true);
    });

    it('can invite crew members', () => {
      expect(hasPermission(captainRoles, 'inviteCrewMembers')).toBe(true);
    });

    it('can remove crew members', () => {
      expect(hasPermission(captainRoles, 'removeCrewMembers')).toBe(true);
    });

    it('can transfer captain role', () => {
      expect(hasPermission(captainRoles, 'transferCaptainRole')).toBe(true);
    });

    it('can create booking', () => {
      expect(hasPermission(captainRoles, 'createBooking')).toBe(true);
    });

    it('can configure tip split', () => {
      expect(hasPermission(captainRoles, 'configureTipSplit')).toBe(true);
    });

    it('cannot edit others expenses (captain-only without editor)', () => {
      expect(hasPermission(captainRoles, 'editOthersExpenses')).toBe(false);
    });
  });

  describe('editor permissions', () => {
    const editorRoles: UserRole[] = ['editor'];

    it('cannot edit workspace settings', () => {
      expect(hasPermission(editorRoles, 'editWorkspaceSettings')).toBe(false);
    });

    it('can invite crew members', () => {
      expect(hasPermission(editorRoles, 'inviteCrewMembers')).toBe(true);
    });

    it('cannot remove crew members', () => {
      expect(hasPermission(editorRoles, 'removeCrewMembers')).toBe(false);
    });

    it('can edit others expenses', () => {
      expect(hasPermission(editorRoles, 'editOthersExpenses')).toBe(true);
    });

    it('can delete others expenses', () => {
      expect(hasPermission(editorRoles, 'deleteOthersExpenses')).toBe(true);
    });

    it('can perform reconciliation', () => {
      expect(hasPermission(editorRoles, 'performReconciliation')).toBe(true);
    });

    it('cannot configure tip split', () => {
      expect(hasPermission(editorRoles, 'configureTipSplit')).toBe(false);
    });
  });

  describe('crew permissions', () => {
    const crewRoles: UserRole[] = ['crew'];

    it('cannot edit workspace settings', () => {
      expect(hasPermission(crewRoles, 'editWorkspaceSettings')).toBe(false);
    });

    it('can invite crew members', () => {
      expect(hasPermission(crewRoles, 'inviteCrewMembers')).toBe(true);
    });

    it('cannot remove crew members', () => {
      expect(hasPermission(crewRoles, 'removeCrewMembers')).toBe(false);
    });

    it('can create booking', () => {
      expect(hasPermission(crewRoles, 'createBooking')).toBe(true);
    });

    it('can edit own expenses', () => {
      expect(hasPermission(crewRoles, 'editOwnExpenses')).toBe(true);
    });

    it('cannot edit others expenses', () => {
      expect(hasPermission(crewRoles, 'editOthersExpenses')).toBe(false);
    });

    it('cannot perform reconciliation', () => {
      expect(hasPermission(crewRoles, 'performReconciliation')).toBe(false);
    });

    it('can export data', () => {
      expect(hasPermission(crewRoles, 'exportData')).toBe(true);
    });
  });

  describe('combined roles', () => {
    it('captain + editor has all permissions', () => {
      const roles: UserRole[] = ['captain', 'editor'];

      expect(hasPermission(roles, 'editWorkspaceSettings')).toBe(true);
      expect(hasPermission(roles, 'editOthersExpenses')).toBe(true);
      expect(hasPermission(roles, 'configureTipSplit')).toBe(true);
      expect(hasPermission(roles, 'performReconciliation')).toBe(true);
    });

    it('editor + crew same as editor only', () => {
      const roles: UserRole[] = ['editor', 'crew'];

      expect(hasPermission(roles, 'editOthersExpenses')).toBe(true);
      expect(hasPermission(roles, 'editWorkspaceSettings')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('returns false for empty roles array', () => {
      expect(hasPermission([], 'createBooking')).toBe(false);
    });

    it('handles duplicate roles', () => {
      const roles: UserRole[] = ['captain', 'captain'];
      expect(hasPermission(roles, 'editWorkspaceSettings')).toBe(true);
    });
  });
});

describe('getPermissions', () => {
  it('returns all permissions for captain + editor', () => {
    const roles: UserRole[] = ['captain', 'editor'];
    const perms = getPermissions(roles);

    // Should have all permissions
    expect(perms).toContain('editWorkspaceSettings');
    expect(perms).toContain('inviteCrewMembers');
    expect(perms).toContain('removeCrewMembers');
    expect(perms).toContain('editOthersExpenses');
    expect(perms).toContain('performReconciliation');
    expect(perms).toContain('configureTipSplit');
    expect(perms).toHaveLength(Object.keys(PERMISSIONS).length);
  });

  it('returns limited permissions for crew only', () => {
    const roles: UserRole[] = ['crew'];
    const perms = getPermissions(roles);

    expect(perms).toContain('inviteCrewMembers');
    expect(perms).toContain('createBooking');
    expect(perms).toContain('deleteBooking');
    expect(perms).toContain('editOwnExpenses');
    expect(perms).toContain('exportData');
    expect(perms).not.toContain('editWorkspaceSettings');
    expect(perms).not.toContain('removeCrewMembers');
    expect(perms).not.toContain('editOthersExpenses');
  });

  it('returns empty array for no roles', () => {
    const perms = getPermissions([]);
    expect(perms).toEqual([]);
  });

  it('returns correct count for editor', () => {
    const roles: UserRole[] = ['editor'];
    const perms = getPermissions(roles);

    // Editor has: inviteCrewMembers, createBooking, deleteBooking, editOwnExpenses,
    // editOthersExpenses, deleteOthersExpenses, performReconciliation, exportData
    expect(perms).toHaveLength(8);
  });

  it('returns correct count for captain', () => {
    const roles: UserRole[] = ['captain'];
    const perms = getPermissions(roles);

    // Captain has: editWorkspaceSettings, inviteCrewMembers, removeCrewMembers,
    // transferCaptainRole, createBooking, deleteBooking, editOwnExpenses,
    // configureTipSplit, exportData
    expect(perms).toHaveLength(9);
  });
});

describe('ROLE_CONFIG', () => {
  it('has configuration for all roles', () => {
    expect(ROLE_CONFIG[USER_ROLES.CAPTAIN]).toBeDefined();
    expect(ROLE_CONFIG[USER_ROLES.EDITOR]).toBeDefined();
    expect(ROLE_CONFIG[USER_ROLES.CREW]).toBeDefined();
  });

  it('has English labels', () => {
    expect(ROLE_CONFIG.captain.label).toBe('Captain');
    expect(ROLE_CONFIG.editor.label).toBe('Editor');
    expect(ROLE_CONFIG.crew.label).toBe('Crew Member');
  });

  it('has Croatian labels', () => {
    expect(ROLE_CONFIG.captain.labelHR).toBe('Kapetan');
    expect(ROLE_CONFIG.editor.labelHR).toBe('Urednik');
    expect(ROLE_CONFIG.crew.labelHR).toBe('Član posade');
  });

  it('has descriptions', () => {
    expect(ROLE_CONFIG.captain.description).toBeDefined();
    expect(ROLE_CONFIG.editor.description).toBeDefined();
    expect(ROLE_CONFIG.crew.description).toBeDefined();
  });
});
