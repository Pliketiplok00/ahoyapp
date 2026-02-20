/**
 * Seed Dev Data Script
 *
 * Creates test data for development:
 * - 1 season (S/Y Ahalya, Ljeto 2026)
 * - 3 crew members (all as 'crew' - roles assigned in app)
 * - 2 bookings with APA
 * - Several expenses
 *
 * Uses fixed IDs for idempotency (safe to run multiple times).
 *
 * Run from app: Import and call seedDevData()
 * Or via Settings > DEV TOOLS
 */

import {
  doc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../src/config/firebase';
import { USER_COLORS } from '../src/config/theme';
import type { ExpenseCategory } from '../src/config/expenses';

// ============ Fixed IDs (idempotent) ============

const DEV_SEASON_ID = 'dev-season-2026';
const DEV_BOOKING_IDS = ['dev-booking-001', 'dev-booking-002'];
const DEV_CREW_IDS = ['test-marina', 'test-marko', 'test-ivan'];
const DEV_EXPENSE_IDS = [
  'dev-expense-001',
  'dev-expense-002',
  'dev-expense-003',
  'dev-expense-004',
  'dev-expense-005',
];
const DEV_APA_IDS = ['dev-apa-001', 'dev-apa-002'];

// ============ Helper Functions ============

function daysFromNow(days: number): Timestamp {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return Timestamp.fromDate(date);
}

function now(): Timestamp {
  return Timestamp.fromDate(new Date());
}

// ============ Seed Functions ============

/**
 * Create the dev season
 */
async function seedSeason(): Promise<void> {
  console.log('Creating dev season...');

  const seasonRef = doc(db, 'seasons', DEV_SEASON_ID);
  await setDoc(seasonRef, {
    boatName: 'S/Y Ahalya',
    name: 'Ljeto 2026',
    startDate: daysFromNow(-30),
    endDate: daysFromNow(180),
    currency: 'EUR',
    tipSplitType: 'equal',
    tipSplitConfig: null,
    createdBy: 'seed-script',
    createdAt: now(),
    updatedAt: now(),
  });

  console.log(`  Season created: ${DEV_SEASON_ID}`);
}

/**
 * Create test crew members (all as 'crew' - no hardcoded roles)
 */
async function seedCrew(): Promise<void> {
  console.log('Creating test crew members...');

  const crewData = [
    { id: DEV_CREW_IDS[0], name: 'Marina', email: 'marina@test.com', color: USER_COLORS[1] },
    { id: DEV_CREW_IDS[1], name: 'Marko', email: 'marko@test.com', color: USER_COLORS[2] },
    { id: DEV_CREW_IDS[2], name: 'Ivan', email: 'ivan@test.com', color: USER_COLORS[3] },
  ];

  for (const crew of crewData) {
    const crewRef = doc(db, 'seasons', DEV_SEASON_ID, 'users', crew.id);
    await setDoc(crewRef, {
      name: crew.name,
      email: crew.email,
      color: crew.color,
      roles: ['crew'], // All start as crew - captain/editor assigned in app
      seasonId: DEV_SEASON_ID,
      joinedAt: now(),
    });
    console.log(`  Crew: ${crew.name} (${crew.id})`);
  }
}

/**
 * Create test bookings with APA
 */
async function seedBookings(): Promise<void> {
  console.log('Creating test bookings...');

  const bookingsData = [
    {
      id: DEV_BOOKING_IDS[0],
      arrivalDate: daysFromNow(-7),
      departureDate: daysFromNow(-1),
      departureMarina: 'Kaštela',
      arrivalMarina: 'Kaštela',
      guestCount: 8,
      notes: 'VIP gosti - priprema za večeru na brodu',
      status: 'completed',
      apaTotal: 5000,
      tip: 500,
    },
    {
      id: DEV_BOOKING_IDS[1],
      arrivalDate: daysFromNow(7),
      departureDate: daysFromNow(14),
      departureMarina: 'Kaštela',
      arrivalMarina: 'Dubrovnik',
      guestCount: 6,
      notes: 'One-way charter - drop-off u Dubrovniku',
      status: 'confirmed',
      apaTotal: 4000,
      tip: null,
    },
  ];

  for (const booking of bookingsData) {
    const bookingRef = doc(db, 'bookings', booking.id);
    await setDoc(bookingRef, {
      seasonId: DEV_SEASON_ID,
      arrivalDate: booking.arrivalDate,
      departureDate: booking.departureDate,
      departureMarina: booking.departureMarina,
      arrivalMarina: booking.arrivalMarina,
      guestCount: booking.guestCount,
      notes: booking.notes,
      status: booking.status,
      apaTotal: booking.apaTotal,
      tip: booking.tip,
      reconciliation: null,
      createdBy: 'seed-script',
      createdAt: now(),
      updatedAt: now(),
    });
    console.log(`  Booking: ${booking.id} (${booking.status})`);
  }

  // Add APA entries
  console.log('Creating APA entries...');
  const apaData = [
    { id: DEV_APA_IDS[0], bookingId: DEV_BOOKING_IDS[0], amount: 5000, note: 'Inicijalni APA' },
    { id: DEV_APA_IDS[1], bookingId: DEV_BOOKING_IDS[1], amount: 4000, note: 'Inicijalni APA' },
  ];

  for (const apa of apaData) {
    const apaRef = doc(db, 'bookings', apa.bookingId, 'apaEntries', apa.id);
    await setDoc(apaRef, {
      bookingId: apa.bookingId,
      amount: apa.amount,
      note: apa.note,
      createdBy: 'seed-script',
      createdAt: now(),
    });
    console.log(`  APA: ${apa.amount}€ for ${apa.bookingId}`);
  }
}

/**
 * Create test expenses
 */
async function seedExpenses(): Promise<void> {
  console.log('Creating test expenses...');

  const expensesData: Array<{
    id: string;
    bookingId: string;
    amount: number;
    category: ExpenseCategory;
    merchant: string;
    note: string;
    type: 'receipt' | 'no-receipt';
  }> = [
    {
      id: DEV_EXPENSE_IDS[0],
      bookingId: DEV_BOOKING_IDS[0],
      amount: 450.50,
      category: 'food',
      merchant: 'Konzum',
      note: 'Namirnice za doručak',
      type: 'receipt',
    },
    {
      id: DEV_EXPENSE_IDS[1],
      bookingId: DEV_BOOKING_IDS[0],
      amount: 1200.00,
      category: 'fuel',
      merchant: 'INA Marina Kaštela',
      note: 'Dizel - pun tank',
      type: 'receipt',
    },
    {
      id: DEV_EXPENSE_IDS[2],
      bookingId: DEV_BOOKING_IDS[0],
      amount: 350.00,
      category: 'mooring',
      merchant: 'ACI Marina Split',
      note: 'Vez 1 noć',
      type: 'no-receipt',
    },
    {
      id: DEV_EXPENSE_IDS[3],
      bookingId: DEV_BOOKING_IDS[0],
      amount: 85.00,
      category: 'other',
      merchant: 'Brodogradilište',
      note: 'Popravak tender gumenjaka',
      type: 'receipt',
    },
    {
      id: DEV_EXPENSE_IDS[4],
      bookingId: DEV_BOOKING_IDS[1],
      amount: 280.00,
      category: 'food',
      merchant: 'Lidl',
      note: 'Pripreme za charter',
      type: 'receipt',
    },
  ];

  for (const expense of expensesData) {
    const expenseRef = doc(db, 'expenses', expense.id);
    await setDoc(expenseRef, {
      bookingId: expense.bookingId,
      seasonId: DEV_SEASON_ID,
      amount: expense.amount,
      date: daysFromNow(-5),
      category: expense.category,
      merchant: expense.merchant,
      note: expense.note,
      receiptUrl: null,
      receiptLocalPath: null,
      type: expense.type,
      location: null,
      ocrStatus: null,
      ocrData: null,
      isComplete: true,
      createdBy: 'seed-script',
      createdAt: now(),
      updatedAt: now(),
      syncStatus: 'synced',
    });
    console.log(`  Expense: ${expense.amount}€ - ${expense.merchant} (${expense.category})`);
  }
}

// ============ Main Seed Function ============

/**
 * Seed all dev data.
 * Safe to run multiple times (uses fixed IDs with setDoc).
 */
export async function seedDevData(): Promise<{ success: boolean; error?: string }> {
  console.log('\n========== SEEDING DEV DATA ==========\n');

  try {
    await seedSeason();
    await seedCrew();
    await seedBookings();
    await seedExpenses();

    console.log('\n========== SEED COMPLETE ==========\n');
    console.log('Summary:');
    console.log('  - 1 season: S/Y Ahalya, Ljeto 2026');
    console.log('  - 3 test crew members (all as crew)');
    console.log('  - 2 bookings with APA');
    console.log('  - 5 expenses');
    console.log('\nDev users (dev1, dev2, dev3) will auto-join on first login.');
    console.log('');

    return { success: true };
  } catch (error) {
    console.error('Seed error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Delete all dev data (for cleanup)
 */
export async function clearDevData(): Promise<{ success: boolean; error?: string }> {
  console.log('\n========== CLEARING DEV DATA ==========\n');

  try {
    // Note: This doesn't actually delete documents.
    // In development, you can manually delete from Firebase Console
    // or implement proper batch delete if needed.
    console.log('To fully clear dev data, delete from Firebase Console:');
    console.log(`  - Season: seasons/${DEV_SEASON_ID}`);
    console.log(`  - Bookings: bookings/${DEV_BOOKING_IDS.join(', ')}`);
    console.log(`  - Expenses: expenses/${DEV_EXPENSE_IDS.join(', ')}`);

    return { success: true };
  } catch (error) {
    console.error('Clear error:', error);
    return { success: false, error: String(error) };
  }
}

export { DEV_SEASON_ID, DEV_BOOKING_IDS, DEV_CREW_IDS };
