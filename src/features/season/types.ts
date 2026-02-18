/**
 * Season Feature Types
 *
 * Type definitions for seasons, crew members, and invites.
 */

import { Timestamp } from 'firebase/firestore';
import { UserRole } from '../../constants/userRoles';

/**
 * Season (boat workspace for a charter season)
 */
export interface Season {
  id: string;
  boatName: string;
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  currency: string;
  tipSplitType: 'equal' | 'custom';
  tipSplitConfig?: Record<string, number>; // userId -> percentage
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Data for creating a new season
 */
export interface CreateSeasonData {
  boatName: string;
  name: string;
  startDate: Date;
  endDate: Date;
  currency: string;
}

/**
 * Crew member in a season
 */
export interface CrewMember {
  id: string;
  email: string;
  name: string;
  color: string;
  roles: UserRole[];
  seasonId: string;
  createdAt: Timestamp;
}

/**
 * Data for creating a crew member
 */
export interface CreateCrewMemberData {
  email: string;
  name: string;
  color: string;
  roles: UserRole[];
}

/**
 * Invite status
 */
export type InviteStatus = 'pending' | 'accepted' | 'expired';

/**
 * Season invite
 */
export interface SeasonInvite {
  id: string;
  seasonId: string;
  email: string;
  inviteCode: string;
  status: InviteStatus;
  invitedBy: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

/**
 * Data for creating an invite
 */
export interface CreateInviteData {
  email: string;
}

/**
 * Season state for the store
 */
export interface SeasonState {
  currentSeason: Season | null;
  crewMembers: CrewMember[];
  pendingInvites: SeasonInvite[];
  isLoading: boolean;
  error: string | null;
}
