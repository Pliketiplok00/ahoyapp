/**
 * Crew Management Tests
 *
 * Tests for crew management logic and validation.
 */

import { USER_ROLES, type UserRole } from '../../constants/userRoles';

// Test utility functions for crew management

/**
 * Check if user can modify crew (is captain)
 */
export function canModifyCrew(userRoles: UserRole[]): boolean {
  return userRoles.includes(USER_ROLES.CAPTAIN);
}

/**
 * Check if user can be removed (not captain)
 */
export function canBeRemoved(memberRoles: UserRole[]): boolean {
  return !memberRoles.includes(USER_ROLES.CAPTAIN);
}

/**
 * Check if role can be assigned
 */
export function canAssignRole(
  assignerRoles: UserRole[],
  targetRoles: UserRole[],
  newRole: UserRole
): boolean {
  // Only captains can assign roles
  if (!assignerRoles.includes(USER_ROLES.CAPTAIN)) {
    return false;
  }
  // Cannot modify captain's roles
  if (targetRoles.includes(USER_ROLES.CAPTAIN)) {
    return false;
  }
  // Editor role can be toggled
  if (newRole === USER_ROLES.EDITOR) {
    return true;
  }
  // Captain role cannot be assigned (only transferred, not implemented yet)
  if (newRole === USER_ROLES.CAPTAIN) {
    return false;
  }
  return true;
}

/**
 * Toggle editor role for a crew member
 */
export function toggleEditorRole(currentRoles: UserRole[]): UserRole[] {
  if (currentRoles.includes(USER_ROLES.EDITOR)) {
    return currentRoles.filter((r) => r !== USER_ROLES.EDITOR);
  }
  return [...currentRoles, USER_ROLES.EDITOR];
}

/**
 * Get display label for role
 */
export function getRoleLabel(role: UserRole, useCroatian: boolean): string {
  const labels: Record<UserRole, { hr: string; en: string }> = {
    [USER_ROLES.CAPTAIN]: { hr: 'Kapetan', en: 'Captain' },
    [USER_ROLES.EDITOR]: { hr: 'Urednik', en: 'Editor' },
    [USER_ROLES.CREW]: { hr: 'Posada', en: 'Crew' },
  };
  return useCroatian ? labels[role].hr : labels[role].en;
}

/**
 * Check if email is valid for invite
 */
export function isValidInviteEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

/**
 * Format invite code for display
 */
export function formatInviteCode(code: string): string {
  // Add dash after 4 characters for readability
  if (code.length === 8) {
    return `${code.slice(0, 4)}-${code.slice(4)}`;
  }
  return code;
}

describe('Crew Management', () => {
  describe('canModifyCrew', () => {
    it('returns true for captain', () => {
      expect(canModifyCrew([USER_ROLES.CAPTAIN, USER_ROLES.EDITOR])).toBe(true);
    });

    it('returns true for captain with just captain role', () => {
      expect(canModifyCrew([USER_ROLES.CAPTAIN])).toBe(true);
    });

    it('returns false for editor only', () => {
      expect(canModifyCrew([USER_ROLES.EDITOR])).toBe(false);
    });

    it('returns false for crew only', () => {
      expect(canModifyCrew([USER_ROLES.CREW])).toBe(false);
    });

    it('returns false for editor and crew', () => {
      expect(canModifyCrew([USER_ROLES.EDITOR, USER_ROLES.CREW])).toBe(false);
    });

    it('returns false for empty roles', () => {
      expect(canModifyCrew([])).toBe(false);
    });
  });

  describe('canBeRemoved', () => {
    it('returns true for crew member', () => {
      expect(canBeRemoved([USER_ROLES.CREW])).toBe(true);
    });

    it('returns true for editor', () => {
      expect(canBeRemoved([USER_ROLES.EDITOR])).toBe(true);
    });

    it('returns true for editor and crew', () => {
      expect(canBeRemoved([USER_ROLES.EDITOR, USER_ROLES.CREW])).toBe(true);
    });

    it('returns false for captain', () => {
      expect(canBeRemoved([USER_ROLES.CAPTAIN])).toBe(false);
    });

    it('returns false for captain with other roles', () => {
      expect(canBeRemoved([USER_ROLES.CAPTAIN, USER_ROLES.EDITOR])).toBe(false);
    });
  });

  describe('canAssignRole', () => {
    const captainRoles = [USER_ROLES.CAPTAIN, USER_ROLES.EDITOR];
    const crewRoles = [USER_ROLES.CREW];

    it('captain can assign editor to crew', () => {
      expect(canAssignRole(captainRoles, crewRoles, USER_ROLES.EDITOR)).toBe(true);
    });

    it('captain cannot assign captain role', () => {
      expect(canAssignRole(captainRoles, crewRoles, USER_ROLES.CAPTAIN)).toBe(false);
    });

    it('captain cannot modify other captain', () => {
      const otherCaptain = [USER_ROLES.CAPTAIN];
      expect(canAssignRole(captainRoles, otherCaptain, USER_ROLES.EDITOR)).toBe(false);
    });

    it('editor cannot assign roles', () => {
      const editorRoles = [USER_ROLES.EDITOR];
      expect(canAssignRole(editorRoles, crewRoles, USER_ROLES.EDITOR)).toBe(false);
    });

    it('crew cannot assign roles', () => {
      expect(canAssignRole(crewRoles, crewRoles, USER_ROLES.EDITOR)).toBe(false);
    });
  });

  describe('toggleEditorRole', () => {
    it('adds editor role when not present', () => {
      const roles = [USER_ROLES.CREW];
      const result = toggleEditorRole(roles);
      expect(result).toContain(USER_ROLES.EDITOR);
      expect(result).toContain(USER_ROLES.CREW);
    });

    it('removes editor role when present', () => {
      const roles = [USER_ROLES.CREW, USER_ROLES.EDITOR];
      const result = toggleEditorRole(roles);
      expect(result).not.toContain(USER_ROLES.EDITOR);
      expect(result).toContain(USER_ROLES.CREW);
    });

    it('preserves other roles when adding editor', () => {
      const roles = [USER_ROLES.CREW];
      const result = toggleEditorRole(roles);
      expect(result.length).toBe(2);
    });

    it('preserves other roles when removing editor', () => {
      const roles = [USER_ROLES.CAPTAIN, USER_ROLES.EDITOR];
      const result = toggleEditorRole(roles);
      expect(result).toContain(USER_ROLES.CAPTAIN);
      expect(result.length).toBe(1);
    });
  });

  describe('getRoleLabel', () => {
    describe('Croatian labels', () => {
      it('returns Kapetan for captain', () => {
        expect(getRoleLabel(USER_ROLES.CAPTAIN, true)).toBe('Kapetan');
      });

      it('returns Urednik for editor', () => {
        expect(getRoleLabel(USER_ROLES.EDITOR, true)).toBe('Urednik');
      });

      it('returns Posada for crew', () => {
        expect(getRoleLabel(USER_ROLES.CREW, true)).toBe('Posada');
      });
    });

    describe('English labels', () => {
      it('returns Captain for captain', () => {
        expect(getRoleLabel(USER_ROLES.CAPTAIN, false)).toBe('Captain');
      });

      it('returns Editor for editor', () => {
        expect(getRoleLabel(USER_ROLES.EDITOR, false)).toBe('Editor');
      });

      it('returns Crew for crew', () => {
        expect(getRoleLabel(USER_ROLES.CREW, false)).toBe('Crew');
      });
    });
  });
});

describe('Invite Validation', () => {
  describe('isValidInviteEmail', () => {
    it('accepts valid email', () => {
      expect(isValidInviteEmail('test@example.com')).toBe(true);
    });

    it('accepts email with subdomain', () => {
      expect(isValidInviteEmail('user@mail.example.co.uk')).toBe(true);
    });

    it('accepts email with plus sign', () => {
      expect(isValidInviteEmail('user+tag@example.com')).toBe(true);
    });

    it('rejects empty string', () => {
      expect(isValidInviteEmail('')).toBe(false);
    });

    it('rejects email without @', () => {
      expect(isValidInviteEmail('invalid')).toBe(false);
    });

    it('rejects email without domain', () => {
      expect(isValidInviteEmail('user@')).toBe(false);
    });

    it('rejects email with spaces', () => {
      expect(isValidInviteEmail('user @example.com')).toBe(false);
    });

    it('handles email with leading/trailing spaces', () => {
      expect(isValidInviteEmail('  test@example.com  ')).toBe(true);
    });
  });

  describe('formatInviteCode', () => {
    it('formats 8-character code with dash', () => {
      expect(formatInviteCode('ABCD1234')).toBe('ABCD-1234');
    });

    it('returns original for non-8-character code', () => {
      expect(formatInviteCode('ABC123')).toBe('ABC123');
    });

    it('handles empty string', () => {
      expect(formatInviteCode('')).toBe('');
    });
  });
});

describe('Permission Scenarios', () => {
  describe('typical yacht crew hierarchy', () => {
    const captain = { id: 'cap', roles: [USER_ROLES.CAPTAIN, USER_ROLES.EDITOR] };
    const chef = { id: 'chef', roles: [USER_ROLES.EDITOR, USER_ROLES.CREW] };
    const deckhand = { id: 'deck', roles: [USER_ROLES.CREW] };

    it('captain can remove chef', () => {
      expect(canModifyCrew(captain.roles)).toBe(true);
      expect(canBeRemoved(chef.roles)).toBe(true);
    });

    it('captain can remove deckhand', () => {
      expect(canModifyCrew(captain.roles)).toBe(true);
      expect(canBeRemoved(deckhand.roles)).toBe(true);
    });

    it('captain can toggle editor for deckhand', () => {
      expect(canAssignRole(captain.roles, deckhand.roles, USER_ROLES.EDITOR)).toBe(true);
    });

    it('chef cannot remove deckhand', () => {
      expect(canModifyCrew(chef.roles)).toBe(false);
    });

    it('deckhand cannot modify anyone', () => {
      expect(canModifyCrew(deckhand.roles)).toBe(false);
    });
  });
});
