/**
 * Firebase Connectivity Test
 *
 * Debug utility to test Firebase connection.
 * Run this to verify Firebase is properly configured.
 */

import { logger } from './logger';
import { db, auth } from '../config/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

export interface FirebaseTestResult {
  authStatus: 'OK' | 'NO_USER';
  userId: string | null;
  userEmail: string | null;
  firestoreRead: 'OK' | 'FAILED';
  firestoreWrite: 'OK' | 'FAILED';
  readError?: string;
  writeError?: string;
}

export async function testFirebaseConnection(): Promise<FirebaseTestResult> {
  logger.log('=== FIREBASE CONNECTION TEST ===');

  const result: FirebaseTestResult = {
    authStatus: 'NO_USER',
    userId: null,
    userEmail: null,
    firestoreRead: 'FAILED',
    firestoreWrite: 'FAILED',
  };

  // 1. Auth status
  const user = auth.currentUser;
  logger.log('Auth current user:', user?.uid || 'NO USER');
  logger.log('Auth user email:', user?.email || 'NO EMAIL');

  if (user) {
    result.authStatus = 'OK';
    result.userId = user.uid;
    result.userEmail = user.email;
  }

  // 2. Firestore read test
  try {
    const testRef = collection(db, '_test');
    const snapshot = await getDocs(testRef);
    logger.log('Firestore READ: OK (' + snapshot.size + ' docs in _test)');
    result.firestoreRead = 'OK';
  } catch (e) {
    const error = e as Error;
    logger.error('Firestore READ FAILED:', error.message);
    result.readError = error.message;
  }

  // 3. Firestore write test
  try {
    const testRef = collection(db, '_test');
    const docRef = await addDoc(testRef, {
      test: true,
      timestamp: new Date().toISOString(),
      userId: user?.uid || 'anonymous',
    });
    logger.log('Firestore WRITE: OK (doc: ' + docRef.id + ')');
    result.firestoreWrite = 'OK';

    // Clean up test doc
    await deleteDoc(doc(db, '_test', docRef.id));
    logger.log('Firestore DELETE: OK (cleaned up test doc)');
  } catch (e) {
    const error = e as Error;
    logger.error('Firestore WRITE FAILED:', error.message);
    result.writeError = error.message;
  }

  logger.log('=== TEST COMPLETE ===');
  logger.log(JSON.stringify(result, null, 2));

  return result;
}

/**
 * Quick test function that can be called from console
 */
export function runFirebaseTest() {
  testFirebaseConnection()
    .then((result) => {
      logger.log('\n📊 FIREBASE TEST RESULTS:');
      logger.log('  Auth:', result.authStatus, result.userId ? `(${result.userId})` : '');
      logger.log('  Read:', result.firestoreRead, result.readError || '');
      logger.log('  Write:', result.firestoreWrite, result.writeError || '');
    })
    .catch((err) => {
      logger.error('Test failed with error:', err);
    });
}
