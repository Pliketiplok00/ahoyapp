/**
 * Debug Crew Script
 *
 * Lists all crew members in a season and allows cleanup.
 * Import and run from app or React Native debugger.
 */

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../src/config/firebase';
import { USER_ROLES, UserRole } from '../src/constants/userRoles';
import { USER_COLORS } from '../src/config/theme';

interface TestCrewMember {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  color: string;
}

/**
 * List all crew members in a season
 */
export async function listCrewMembers(seasonId: string): Promise<void> {
  if (!seasonId) {
    console.log('ERROR: No seasonId provided');
    return;
  }

  console.log(`\n========== CREW MEMBERS IN SEASON: ${seasonId} ==========\n`);

  try {
    const usersRef = collection(db, 'seasons', seasonId, 'users');
    const snapshot = await getDocs(usersRef);

    if (snapshot.empty) {
      console.log('No crew members found.');
      return;
    }

    console.log(`Found ${snapshot.size} crew members:\n`);

    let index = 0;
    snapshot.forEach((docSnap) => {
      index++;
      const data = docSnap.data();
      console.log(`${index}. ID: ${docSnap.id}`);
      console.log(`   Name: ${data.name || 'N/A'}`);
      console.log(`   Email: ${data.email || 'N/A'}`);
      console.log(`   Roles: ${data.roles?.join(', ') || 'N/A'}`);
      console.log(`   Color: ${data.color || 'N/A'}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error listing crew:', error);
  }
}

/**
 * Delete ALL crew members from a season (DANGEROUS!)
 */
export async function deleteAllCrew(seasonId: string): Promise<{ success: boolean; deleted: string[] }> {
  if (!seasonId) {
    return { success: false, deleted: [] };
  }

  const deleted: string[] = [];

  try {
    const usersRef = collection(db, 'seasons', seasonId, 'users');
    const snapshot = await getDocs(usersRef);

    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'seasons', seasonId, 'users', docSnap.id));
      deleted.push(`${docSnap.data().name || docSnap.id}`);
      console.log(`Deleted: ${docSnap.id} (${docSnap.data().name})`);
    }

    console.log(`\nDeleted ${deleted.length} crew members.`);
    return { success: true, deleted };
  } catch (error) {
    console.error('Error deleting crew:', error);
    return { success: false, deleted };
  }
}

/**
 * The EXACT 3 crew members we want
 */
const CORRECT_CREW: TestCrewMember[] = [
  {
    id: 'test-bozo',
    email: 'bozo@test.com',
    name: 'Božo',
    roles: [USER_ROLES.CAPTAIN],
    color: USER_COLORS[0], // coral
  },
  {
    id: 'test-marina',
    email: 'marina@test.com',
    name: 'Marina',
    roles: [USER_ROLES.CREW],
    color: USER_COLORS[1], // sage green
  },
  {
    id: 'test-marko',
    email: 'marko@test.com',
    name: 'Marko',
    roles: [USER_ROLES.CREW],
    color: USER_COLORS[2], // steel blue
  },
];

/**
 * Add ONLY the correct 3 crew members
 */
export async function addCorrectCrew(seasonId: string): Promise<{ success: boolean; added: string[] }> {
  if (!seasonId) {
    return { success: false, added: [] };
  }

  const added: string[] = [];

  try {
    for (const crew of CORRECT_CREW) {
      const crewRef = doc(db, 'seasons', seasonId, 'users', crew.id);
      await setDoc(crewRef, {
        email: crew.email,
        name: crew.name,
        color: crew.color,
        roles: crew.roles,
        seasonId: seasonId,
        createdAt: serverTimestamp(),
      });
      added.push(crew.name);
      console.log(`Added: ${crew.name} (${crew.roles.join(', ')})`);
    }

    console.log(`\nAdded ${added.length} crew members.`);
    return { success: true, added };
  } catch (error) {
    console.error('Error adding crew:', error);
    return { success: false, added };
  }
}

/**
 * RESET: Delete all and add only correct 3
 */
export async function resetToCorrectCrew(seasonId: string): Promise<void> {
  console.log('\n========== RESETTING CREW ==========\n');

  console.log('Step 1: Listing current crew...');
  await listCrewMembers(seasonId);

  console.log('\nStep 2: Deleting ALL crew...');
  await deleteAllCrew(seasonId);

  console.log('\nStep 3: Adding correct 3 crew members...');
  await addCorrectCrew(seasonId);

  console.log('\nStep 4: Verifying...');
  await listCrewMembers(seasonId);

  console.log('\n========== RESET COMPLETE ==========\n');
}

/**
 * Make the currently logged-in user the captain
 * Uses their actual Firebase UID as the crew member ID
 */
export async function makeCurrentUserCaptain(seasonId: string): Promise<{ success: boolean; error?: string }> {
  if (!seasonId) {
    return { success: false, error: 'No seasonId provided' };
  }

  const currentUser = auth.currentUser;
  if (!currentUser) {
    return { success: false, error: 'No user logged in' };
  }

  console.log(`\n========== MAKING CURRENT USER CAPTAIN ==========`);
  console.log(`User UID: ${currentUser.uid}`);
  console.log(`User Email: ${currentUser.email}`);

  try {
    // First, remove captain role from anyone else
    const usersRef = collection(db, 'seasons', seasonId, 'users');
    const snapshot = await getDocs(usersRef);

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (data.roles?.includes(USER_ROLES.CAPTAIN) && docSnap.id !== currentUser.uid) {
        // Remove captain role, keep as crew
        const newRoles = data.roles.filter((r: string) => r !== USER_ROLES.CAPTAIN);
        if (!newRoles.includes(USER_ROLES.CREW)) {
          newRoles.push(USER_ROLES.CREW);
        }
        await setDoc(doc(db, 'seasons', seasonId, 'users', docSnap.id), {
          ...data,
          roles: newRoles,
        });
        console.log(`Removed captain from: ${data.name} (${docSnap.id})`);
      }
    }

    // Add/update current user as captain
    const userName = currentUser.email?.split('@')[0] || 'Captain';
    const crewRef = doc(db, 'seasons', seasonId, 'users', currentUser.uid);

    await setDoc(crewRef, {
      email: currentUser.email || '',
      name: userName,
      color: USER_COLORS[0], // coral - captain color
      roles: [USER_ROLES.CAPTAIN, USER_ROLES.EDITOR],
      seasonId: seasonId,
      createdAt: serverTimestamp(),
    });

    console.log(`\nAdded as Captain: ${userName} (${currentUser.uid})`);
    console.log(`\n========== DONE ==========\n`);

    return { success: true };
  } catch (error) {
    console.error('Error making user captain:', error);
    return { success: false, error: 'Failed to update crew' };
  }
}

/**
 * Reset crew to use REAL Firebase UIDs
 * Keeps 2 test crew members + makes current user captain
 */
export async function resetCrewWithCurrentUser(seasonId: string): Promise<void> {
  console.log('\n========== RESETTING CREW WITH CURRENT USER ==========\n');

  console.log('Step 1: Listing current crew...');
  await listCrewMembers(seasonId);

  console.log('\nStep 2: Deleting ALL crew...');
  await deleteAllCrew(seasonId);

  console.log('\nStep 3: Making current user captain...');
  await makeCurrentUserCaptain(seasonId);

  console.log('\nStep 4: Adding 2 test crew members...');
  // Add Marina and Marko as crew
  for (const crew of CORRECT_CREW.filter(c => !c.roles.includes(USER_ROLES.CAPTAIN))) {
    const crewRef = doc(db, 'seasons', seasonId, 'users', crew.id);
    await setDoc(crewRef, {
      email: crew.email,
      name: crew.name,
      color: crew.color,
      roles: crew.roles,
      seasonId: seasonId,
      createdAt: serverTimestamp(),
    });
    console.log(`Added: ${crew.name}`);
  }

  console.log('\nStep 5: Verifying...');
  await listCrewMembers(seasonId);

  console.log('\n========== RESET COMPLETE ==========\n');
}

export { CORRECT_CREW };
