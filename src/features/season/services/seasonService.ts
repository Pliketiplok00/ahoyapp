/**
 * Season Service
 *
 * Firebase Firestore operations for seasons, crew members, and invites.
 */

import { logger } from '../../../utils/logger';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db, auth } from '../../../config/firebase';
import { USER_COLORS } from '../../../config/theme';
import { USER_ROLES, UserRole } from '../../../constants/userRoles';
import type {
  Season,
  CreateSeasonData,
  CrewMember,
  CreateCrewMemberData,
  SeasonInvite,
  CreateInviteData,
} from '../types';

/**
 * Generate a random invite code
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Check if a captain already exists in the season
 * @returns The captain's user ID if exists, null otherwise
 */
async function getExistingCaptain(seasonId: string): Promise<string | null> {
  try {
    const usersRef = collection(db, 'seasons', seasonId, 'users');
    const snapshot = await getDocs(usersRef);

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (data.roles && data.roles.includes(USER_ROLES.CAPTAIN)) {
        return docSnap.id;
      }
    }
    return null;
  } catch (error) {
    logger.error('Error checking for existing captain:', error);
    return null;
  }
}

/**
 * Get next available color for a crew member
 */
function getNextAvailableColor(usedColors: string[]): string {
  const available = USER_COLORS.filter((c) => !usedColors.includes(c));
  if (available.length === 0) {
    // All colors used, return first color
    return USER_COLORS[0];
  }
  return available[0];
}

// ============ Season Operations ============

/**
 * Create a new season (boat workspace)
 */
export async function createSeason(data: CreateSeasonData): Promise<{ success: boolean; seasonId?: string; error?: string }> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Create season document
    const seasonRef = doc(collection(db, 'seasons'));
    const seasonData: Omit<Season, 'id'> = {
      boatName: data.boatName,
      name: data.name,
      startDate: Timestamp.fromDate(data.startDate),
      endDate: Timestamp.fromDate(data.endDate),
      currency: data.currency,
      tipSplitType: 'equal',
      createdBy: user.uid,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(seasonRef, seasonData);

    // Add creator as captain with first color
    const crewRef = doc(collection(db, 'seasons', seasonRef.id, 'users'), user.uid);
    const crewData: Omit<CrewMember, 'id'> = {
      email: user.email || '',
      name: user.email?.split('@')[0] || 'Captain',
      color: USER_COLORS[0],
      roles: [USER_ROLES.CAPTAIN, USER_ROLES.EDITOR],
      seasonId: seasonRef.id,
      createdAt: serverTimestamp() as Timestamp,
    };

    await setDoc(crewRef, crewData);

    return { success: true, seasonId: seasonRef.id };
  } catch (error) {
    logger.error('Create season error:', error);
    return { success: false, error: 'Failed to create season' };
  }
}

/**
 * Get a season by ID
 */
export async function getSeason(seasonId: string): Promise<Season | null> {
  try {
    const seasonDoc = await getDoc(doc(db, 'seasons', seasonId));
    if (!seasonDoc.exists()) {
      return null;
    }
    return { id: seasonDoc.id, ...seasonDoc.data() } as Season;
  } catch (error) {
    logger.error('Get season error:', error);
    return null;
  }
}

/**
 * Update a season
 */
export async function updateSeason(
  seasonId: string,
  data: Partial<CreateSeasonData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (data.boatName) updateData.boatName = data.boatName;
    if (data.name) updateData.name = data.name;
    if (data.startDate) updateData.startDate = Timestamp.fromDate(data.startDate);
    if (data.endDate) updateData.endDate = Timestamp.fromDate(data.endDate);
    if (data.currency) updateData.currency = data.currency;

    await updateDoc(doc(db, 'seasons', seasonId), updateData);
    return { success: true };
  } catch (error) {
    logger.error('Update season error:', error);
    return { success: false, error: 'Failed to update season' };
  }
}

/**
 * Subscribe to season changes
 */
export function subscribeToSeason(
  seasonId: string,
  onData: (season: Season | null) => void,
  onError: (error: Error) => void
): () => void {
  return onSnapshot(
    doc(db, 'seasons', seasonId),
    (snapshot) => {
      if (snapshot.exists()) {
        onData({ id: snapshot.id, ...snapshot.data() } as Season);
      } else {
        onData(null);
      }
    },
    onError
  );
}

/**
 * Get all seasons for current user
 */
export async function getUserSeasons(): Promise<Season[]> {
  try {
    const user = auth.currentUser;
    if (!user) return [];

    // Get all seasons where user is a member
    const seasonsRef = collection(db, 'seasons');
    const seasonsSnap = await getDocs(seasonsRef);

    const userSeasons: Season[] = [];

    for (const seasonDoc of seasonsSnap.docs) {
      const userRef = doc(db, 'seasons', seasonDoc.id, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        userSeasons.push({ id: seasonDoc.id, ...seasonDoc.data() } as Season);
      }
    }

    return userSeasons;
  } catch (error) {
    logger.error('Get user seasons error:', error);
    return [];
  }
}

// ============ Crew Operations ============

/**
 * Get all crew members for a season
 */
export async function getCrewMembers(seasonId: string): Promise<CrewMember[]> {
  try {
    const crewRef = collection(db, 'seasons', seasonId, 'users');
    const crewSnap = await getDocs(crewRef);
    return crewSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CrewMember));
  } catch (error) {
    logger.error('Get crew members error:', error);
    return [];
  }
}

/**
 * Subscribe to crew member changes
 */
export function subscribeToCrewMembers(
  seasonId: string,
  onData: (crew: CrewMember[]) => void,
  onError: (error: Error) => void
): () => void {
  return onSnapshot(
    collection(db, 'seasons', seasonId, 'users'),
    (snapshot) => {
      const crew = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CrewMember));
      onData(crew);
    },
    onError
  );
}

/**
 * Add a crew member to a season
 * Validates that only one captain can exist per season
 */
export async function addCrewMember(
  seasonId: string,
  userId: string,
  data: CreateCrewMemberData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if trying to add a captain when one already exists
    if (data.roles.includes(USER_ROLES.CAPTAIN)) {
      const existingCaptain = await getExistingCaptain(seasonId);
      if (existingCaptain && existingCaptain !== userId) {
        return {
          success: false,
          error: 'Sezona već ima kapetana. Samo jedan kapetan je dozvoljen.',
        };
      }
    }

    const crewRef = doc(db, 'seasons', seasonId, 'users', userId);
    const crewData: Omit<CrewMember, 'id'> = {
      ...data,
      seasonId,
      createdAt: serverTimestamp() as Timestamp,
    };
    await setDoc(crewRef, crewData);
    return { success: true };
  } catch (error) {
    logger.error('Add crew member error:', error);
    return { success: false, error: 'Failed to add crew member' };
  }
}

/**
 * Update crew member roles
 * Validates that only one captain can exist per season
 */
export async function updateCrewMemberRoles(
  seasonId: string,
  userId: string,
  roles: UserRole[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if trying to make someone captain when one already exists
    if (roles.includes(USER_ROLES.CAPTAIN)) {
      const existingCaptain = await getExistingCaptain(seasonId);
      if (existingCaptain && existingCaptain !== userId) {
        return {
          success: false,
          error: 'Sezona već ima kapetana. Prvo ukloni ulogu kapetana postojećem kapetanu.',
        };
      }
    }

    await updateDoc(doc(db, 'seasons', seasonId, 'users', userId), { roles });
    return { success: true };
  } catch (error) {
    logger.error('Update crew roles error:', error);
    return { success: false, error: 'Failed to update roles' };
  }
}

/**
 * Remove a crew member from a season
 */
export async function removeCrewMember(
  seasonId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, 'seasons', seasonId, 'users', userId));
    return { success: true };
  } catch (error) {
    logger.error('Remove crew member error:', error);
    return { success: false, error: 'Failed to remove crew member' };
  }
}

// ============ Invite Operations ============

/**
 * Create an invite for a season
 */
export async function createInvite(
  seasonId: string,
  data: CreateInviteData
): Promise<{ success: boolean; inviteCode?: string; error?: string }> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const inviteCode = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const inviteRef = doc(collection(db, 'seasons', seasonId, 'invites'));
    const inviteData: Omit<SeasonInvite, 'id'> = {
      seasonId,
      email: data.email.toLowerCase(),
      inviteCode,
      status: 'pending',
      invitedBy: user.uid,
      createdAt: serverTimestamp() as Timestamp,
      expiresAt: Timestamp.fromDate(expiresAt),
    };

    await setDoc(inviteRef, inviteData);
    return { success: true, inviteCode };
  } catch (error) {
    logger.error('Create invite error:', error);
    return { success: false, error: 'Failed to create invite' };
  }
}

/**
 * Get all pending invites for a season
 */
export async function getPendingInvites(seasonId: string): Promise<SeasonInvite[]> {
  try {
    const invitesRef = collection(db, 'seasons', seasonId, 'invites');
    const q = query(invitesRef, where('status', '==', 'pending'));
    const invitesSnap = await getDocs(q);
    return invitesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SeasonInvite));
  } catch (error) {
    logger.error('Get pending invites error:', error);
    return [];
  }
}

/**
 * Subscribe to pending invites
 */
export function subscribeToPendingInvites(
  seasonId: string,
  onData: (invites: SeasonInvite[]) => void,
  onError: (error: Error) => void
): () => void {
  const invitesRef = collection(db, 'seasons', seasonId, 'invites');
  const q = query(invitesRef, where('status', '==', 'pending'));

  return onSnapshot(
    q,
    (snapshot) => {
      const invites = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SeasonInvite));
      onData(invites);
    },
    onError
  );
}

/**
 * Accept an invite using invite code
 */
export async function acceptInvite(
  inviteCode: string
): Promise<{ success: boolean; seasonId?: string; error?: string }> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Find the invite by code across all seasons
    const seasonsRef = collection(db, 'seasons');
    const seasonsSnap = await getDocs(seasonsRef);

    for (const seasonDoc of seasonsSnap.docs) {
      const invitesRef = collection(db, 'seasons', seasonDoc.id, 'invites');
      const q = query(
        invitesRef,
        where('inviteCode', '==', inviteCode),
        where('status', '==', 'pending')
      );
      const invitesSnap = await getDocs(q);

      if (!invitesSnap.empty) {
        const inviteDoc = invitesSnap.docs[0];
        const invite = { id: inviteDoc.id, ...inviteDoc.data() } as SeasonInvite;

        // Check if expired
        if (invite.expiresAt.toDate() < new Date()) {
          await updateDoc(doc(db, 'seasons', seasonDoc.id, 'invites', invite.id), {
            status: 'expired',
          });
          return { success: false, error: 'Invite has expired' };
        }

        // Get existing crew to determine color
        const crew = await getCrewMembers(seasonDoc.id);
        const usedColors = crew.map((c) => c.color);
        const color = getNextAvailableColor(usedColors);

        // Add user as crew member
        await addCrewMember(seasonDoc.id, user.uid, {
          email: user.email || invite.email,
          name: user.email?.split('@')[0] || 'Crew',
          color,
          roles: [USER_ROLES.CREW],
        });

        // Mark invite as accepted
        await updateDoc(doc(db, 'seasons', seasonDoc.id, 'invites', invite.id), {
          status: 'accepted',
        });

        return { success: true, seasonId: seasonDoc.id };
      }
    }

    return { success: false, error: 'Invalid invite code' };
  } catch (error) {
    logger.error('Accept invite error:', error);
    return { success: false, error: 'Failed to accept invite' };
  }
}

/**
 * Delete an invite
 */
export async function deleteInvite(
  seasonId: string,
  inviteId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, 'seasons', seasonId, 'invites', inviteId));
    return { success: true };
  } catch (error) {
    logger.error('Delete invite error:', error);
    return { success: false, error: 'Failed to delete invite' };
  }
}

export const seasonService = {
  // Season
  createSeason,
  getSeason,
  updateSeason,
  subscribeToSeason,
  getUserSeasons,
  // Crew
  getCrewMembers,
  subscribeToCrewMembers,
  addCrewMember,
  updateCrewMemberRoles,
  removeCrewMember,
  // Invites
  createInvite,
  getPendingInvites,
  subscribeToPendingInvites,
  acceptInvite,
  deleteInvite,
};
