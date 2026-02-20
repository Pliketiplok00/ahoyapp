# Ahoy — Technical Specification

**Date:** 2026-02-18  
**Version:** 1.0  
**Related:** Product Brief v2

---

## 1. Locale & Formatting (CRITICAL)

**All dates, numbers, and currency MUST use Croatian (HR) formatting.**

### Date Format
```
DD.MM.YYYY.

Examples:
✓ 15.11.2026.
✗ 11/15/2026
✗ 2026-11-15
```

### Time Format
```
HH:MM (24-hour)

Examples:
✓ 14:30
✗ 2:30 PM
```

### Number Format
```
Decimal separator:    , (comma)
Thousands separator:  . (dot)

Examples:
✓ 10.000,00
✓ 1.234,56
✗ 10,000.00
✗ 1234.56
```

### Currency Format
```
Amount + space + symbol

Examples:
✓ 1.200,00 €
✓ 10.000 €
✗ €1,200.00
✗ EUR 1200
```

### Implementation

```typescript
// src/utils/formatting.ts

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('hr-HR');  // "15.11.2026."
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('hr-HR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });  // "14:30"
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString('hr-HR');  // "10.000,00"
};

export const formatCurrency = (amount: number, currency = 'EUR'): string => {
  return amount.toLocaleString('hr-HR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' €';  // "1.200,00 €"
};
```

### Export Files

Excel exports MUST:
- Use `;` as CSV delimiter (not `,`) for HR Excel compatibility
- Format numbers with HR locale before export
- OR export as .xlsx which preserves number formatting

**This is non-negotiable. US formatting breaks imports into Croatian accounting software.**

---

## 2. Stack Overview

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | React Native + Expo (managed) | Cross-platform, familiar, good tooling |
| **Language** | TypeScript (strict mode) | Type safety, better DX, fewer bugs |
| **Backend** | Firebase | Offline-first sync, Auth, Storage |
| **Database** | Firestore | Real-time, offline support, NoSQL flexibility |
| **Storage** | Firebase Storage | Receipt images |
| **Auth** | Firebase Auth (email link) | Magic link, no passwords |
| **State** | Zustand | Lightweight, simple, TypeScript-friendly |
| **Navigation** | Expo Router | File-based routing, simple |
| **Styling** | Nativewind (Tailwind) | Utility-first, consistent, config-driven |
| **Forms** | React Hook Form + Zod | Validation, type-safe |
| **i18n** | i18next + react-i18next | HR + EN, extensible to other languages |
| **Camera** | expo-camera | Receipt capture |
| **OCR** | Google ML Kit (on-device) | Text extraction, works offline |

---

## 3. Architecture Principles

### 2.1 Feature-Based Structure

Code is organized by **feature**, not by type. Each feature is self-contained.

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── screens/
│   │   ├── services/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── booking/
│   ├── expense/
│   ├── shopping/
│   ├── income/
│   └── insights/
```

### 2.2 Separation of Concerns

```
┌─────────────────────────────────────────────────────┐
│  SCREENS (UI)                                       │
│  - Render components                                │
│  - Handle navigation                                │
│  - No business logic                                │
└─────────────────┬───────────────────────────────────┘
                  │ uses
┌─────────────────▼───────────────────────────────────┐
│  HOOKS (Logic)                                      │
│  - Business logic                                   │
│  - State management                                 │
│  - Calls services                                   │
└─────────────────┬───────────────────────────────────┘
                  │ uses
┌─────────────────▼───────────────────────────────────┐
│  SERVICES (Data)                                    │
│  - Firebase calls                                   │
│  - Data transformation                              │
│  - No UI knowledge                                  │
└─────────────────────────────────────────────────────┘
```

### 2.3 Config-Driven Development

**Nothing hardcoded.** All configurable values live in `/src/config/`.

```typescript
// ❌ BAD - hardcoded
const categories = ['Food', 'Fuel', 'Mooring', 'Other'];

// ✅ GOOD - from config
import { EXPENSE_CATEGORIES } from '@/config/expenses';
```

### 2.4 Type Everything

```typescript
// ❌ BAD
const handleSubmit = (data: any) => { ... }

// ✅ GOOD
const handleSubmit = (data: ExpenseFormData) => { ... }
```

---

## 4. Folder Structure

```
ahoyapp/
├── app/                          # Expo Router screens
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── onboarding.tsx
│   ├── (main)/
│   │   ├── (tabs)/
│   │   │   ├── index.tsx         # Home (Booking Radar)
│   │   │   ├── bookings.tsx
│   │   │   ├── shopping.tsx
│   │   │   └── settings.tsx
│   │   ├── booking/
│   │   │   ├── [id].tsx
│   │   │   ├── new.tsx
│   │   │   └── expenses/
│   │   │       └── [bookingId].tsx
│   │   ├── expense/
│   │   │   ├── capture.tsx
│   │   │   └── manual.tsx
│   │   └── insights.tsx
│   ├── _layout.tsx
│   └── index.tsx                 # Entry redirect
│
├── src/
│   ├── components/               # Shared UI components
│   │   ├── ui/                   # Primitives (Button, Input, Card...)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   ├── layout/               # Layout components
│   │   │   ├── Screen.tsx
│   │   │   ├── Header.tsx
│   │   │   └── index.ts
│   │   └── common/               # Shared business components
│   │       ├── BookingCard.tsx
│   │       ├── ExpenseItem.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── SyncIndicator.tsx
│   │       └── index.ts
│   │
│   ├── features/                 # Feature modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── MagicLinkForm.tsx
│   │   │   │   └── OnboardingSteps.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useOnboarding.ts
│   │   │   ├── services/
│   │   │   │   └── authService.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── booking/
│   │   │   ├── components/
│   │   │   │   ├── BookingForm.tsx
│   │   │   │   ├── BookingList.tsx
│   │   │   │   ├── BookingDetails.tsx
│   │   │   │   ├── HorizonInfo.tsx
│   │   │   │   └── StatusBadge.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useBooking.ts
│   │   │   │   ├── useBookings.ts
│   │   │   │   └── useBookingStatus.ts
│   │   │   ├── services/
│   │   │   │   └── bookingService.ts
│   │   │   ├── utils/
│   │   │   │   ├── statusHelpers.ts
│   │   │   │   └── dateHelpers.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── expense/
│   │   │   ├── components/
│   │   │   │   ├── ExpenseForm.tsx
│   │   │   │   ├── ExpenseList.tsx
│   │   │   │   ├── ReceiptCapture.tsx
│   │   │   │   ├── NoReceiptForm.tsx
│   │   │   │   ├── CategoryPicker.tsx
│   │   │   │   └── ReconciliationView.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useExpense.ts
│   │   │   │   ├── useExpenses.ts
│   │   │   │   ├── useReceiptCapture.ts
│   │   │   │   ├── useOCR.ts
│   │   │   │   └── useReconciliation.ts
│   │   │   ├── services/
│   │   │   │   ├── expenseService.ts
│   │   │   │   ├── ocrService.ts
│   │   │   │   └── imageService.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── shopping/
│   │   │   ├── components/
│   │   │   │   ├── ShoppingList.tsx
│   │   │   │   ├── ShoppingItem.tsx
│   │   │   │   └── AddItemForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useShopping.ts
│   │   │   ├── services/
│   │   │   │   └── shoppingService.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── income/
│   │   │   ├── components/
│   │   │   │   ├── EarningsDashboard.tsx
│   │   │   │   ├── RateSettings.tsx
│   │   │   │   └── ManualWorkDayForm.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useIncome.ts
│   │   │   │   └── useEarningsCalc.ts
│   │   │   ├── services/
│   │   │   │   └── incomeService.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── insights/
│   │   │   ├── components/
│   │   │   │   ├── SeasonStats.tsx
│   │   │   │   ├── BookingComparison.tsx
│   │   │   │   └── TopMerchants.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useInsights.ts
│   │   │   ├── services/
│   │   │   │   └── insightsService.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   └── season/
│   │       ├── components/
│   │       │   ├── SeasonSettings.tsx
│   │       │   ├── TipSplitConfig.tsx
│   │       │   └── CrewManager.tsx
│   │       ├── hooks/
│   │       │   ├── useSeason.ts
│   │       │   └── useCrew.ts
│   │       ├── services/
│   │       │   └── seasonService.ts
│   │       ├── types.ts
│   │       └── index.ts
│   │
│   ├── config/                   # All configuration
│   │   ├── app.ts                # App-wide settings
│   │   ├── expenses.ts           # Categories, defaults
│   │   ├── theme.ts              # Colors, spacing, fonts
│   │   ├── notifications.ts      # Notification settings
│   │   ├── firebase.ts           # Firebase config
│   │   └── index.ts
│   │
│   ├── constants/                # Static values
│   │   ├── bookingStatus.ts
│   │   ├── userRoles.ts
│   │   ├── currencies.ts
│   │   └── index.ts
│   │
│   ├── hooks/                    # Shared hooks
│   │   ├── useOfflineSync.ts
│   │   ├── useNetworkStatus.ts
│   │   ├── usePermissions.ts
│   │   └── index.ts
│   │
│   ├── services/                 # Shared services
│   │   ├── firebase/
│   │   │   ├── db.ts
│   │   │   ├── auth.ts
│   │   │   ├── storage.ts
│   │   │   └── index.ts
│   │   ├── notifications.ts
│   │   └── index.ts
│   │
│   ├── stores/                   # Zustand stores
│   │   ├── authStore.ts
│   │   ├── seasonStore.ts
│   │   ├── syncStore.ts
│   │   └── index.ts
│   │
│   ├── types/                    # Shared types
│   │   ├── models.ts             # Data models
│   │   ├── api.ts                # API types
│   │   ├── navigation.ts         # Navigation types
│   │   └── index.ts
│   │
│   ├── utils/                    # Utility functions
│   │   ├── date.ts
│   │   ├── currency.ts
│   │   ├── validation.ts
│   │   └── index.ts
│   │
│   └── i18n/                     # Internationalization (future)
│       ├── en.ts
│       ├── hr.ts
│       └── index.ts
│
├── assets/                       # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── .env.development
├── .env.staging
├── .env.production
├── app.config.ts                 # Expo config
├── tsconfig.json
├── package.json
└── README.md
```

---

## 5. Configuration Files

### 3.1 App Config (`src/config/app.ts`)

```typescript
export const APP_CONFIG = {
  name: 'Crew Season',
  version: '1.0.0',
  
  // Feature flags
  features: {
    ocr: true,
    offlineMode: true,
    pushNotifications: true,
  },
  
  // Limits
  limits: {
    maxCrewMembers: 20,
    maxBookingsPerSeason: 50,
    maxExpensesPerBooking: 500,
    maxImageSizeMB: 10,
  },
  
  // Timeouts
  timeouts: {
    syncInterval: 30000,        // 30 seconds
    ocrTimeout: 10000,          // 10 seconds
    imageUploadTimeout: 60000,  // 60 seconds
  },
} as const;
```

### 3.2 Expense Config (`src/config/expenses.ts`)

```typescript
export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Beverage', icon: 'utensils' },
  { id: 'fuel', label: 'Fuel', icon: 'fuel' },
  { id: 'mooring', label: 'Mooring', icon: 'anchor' },
  { id: 'other', label: 'Other', icon: 'ellipsis' },
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]['id'];

export const EXPENSE_DEFAULTS = {
  category: 'other' as ExpenseCategory,
  currency: 'EUR',
} as const;
```

### 3.3 Theme Config (`src/config/theme.ts`)

```typescript
export const COLORS = {
  // Brand (Color Blocking)
  coral: '#E85D3B',
  warmYellow: '#F5B800',
  sageGreen: '#8CB369',
  steelBlue: '#7B9AAF',
  
  // Status
  statusActive: '#4CAF50',
  statusUpcoming: '#FF9800',
  statusCompleted: '#607D8B',
  statusCancelled: '#EF4444',
  
  // Neutral
  textPrimary: '#1A1A1A',
  textSecondary: '#4A4A4A',
  textMuted: '#7A7A7A',
} as const;

// 20 predefined colors for crew member assignment
export const USER_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
  '#F43F5E', '#78716C', '#57534E', '#44403C',
] as const;
```

### 3.4 Marina Config (`src/config/marinas.ts`)

```typescript
/**
 * Marina abbreviations for display on booking cards.
 * Default marina (Kaštela) is not shown - only non-default marinas get badges.
 */

export const DEFAULT_MARINA = 'Kaštela';

export const MARINA_ABBREVIATIONS: Record<string, string> = {
  'Kaštela': '',      // Default - don't show
  'Split': 'ST',
  'Dubrovnik': 'DBK',
  'Zadar': 'ZD',
  'Šibenik': 'ŠI',
  'Trogir': 'TG',
  'Hvar': 'HV',
  'Korčula': 'KČ',
  'Vis': 'VS',
  'Biograd': 'BG',
  'Sukošan': 'SK',
  'Murter': 'MU',
  'Primošten': 'PR',
  'Rogoznica': 'RG',
} as const;

/**
 * Get marina badge text for display.
 * Returns empty string if both marinas are default (Kaštela).
 * 
 * @example
 * getMarinaBadge('Kaštela', 'Kaštela')   // ''
 * getMarinaBadge('Kaštela', 'Dubrovnik') // 'DBK'
 * getMarinaBadge('Split', 'Dubrovnik')   // 'ST→DBK'
 */
export function getMarinaBadge(departure: string, arrival: string): string {
  const depAbbr = MARINA_ABBREVIATIONS[departure] || departure.slice(0, 2).toUpperCase();
  const arrAbbr = MARINA_ABBREVIATIONS[arrival] || arrival.slice(0, 2).toUpperCase();
  
  const isDepDefault = departure === DEFAULT_MARINA;
  const isArrDefault = arrival === DEFAULT_MARINA;
  
  if (isDepDefault && isArrDefault) return '';
  if (isDepDefault) return arrAbbr;
  if (isArrDefault) return depAbbr;
  return `${depAbbr}→${arrAbbr}`;
}
```

### 3.5 Constants (`src/constants/bookingStatus.ts`)

```typescript
export const BOOKING_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
  CANCELLED: 'cancelled',
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export const BOOKING_STATUS_CONFIG = {
  [BOOKING_STATUS.UPCOMING]: {
    label: 'Upcoming',
    color: 'statusUpcoming',
    canEdit: true,
    canDelete: true,
  },
  [BOOKING_STATUS.ACTIVE]: {
    label: 'Active',
    color: 'statusActive',
    canEdit: true,
    canDelete: false,
  },
  [BOOKING_STATUS.COMPLETED]: {
    label: 'Completed',
    color: 'statusCompleted',
    canEdit: false,
    canDelete: false,
    canEditTip: true,
  },
  [BOOKING_STATUS.ARCHIVED]: {
    label: 'Archived',
    color: 'statusCompleted',
    canEdit: false,
    canDelete: false,
  },
  [BOOKING_STATUS.CANCELLED]: {
    label: 'Cancelled',
    color: 'statusCancelled',
    canEdit: false,
    canDelete: false,
  },
} as const;
```

### 3.5 User Roles (`src/constants/userRoles.ts`)

```typescript
export const USER_ROLES = {
  CAPTAIN: 'captain',
  EDITOR: 'editor',
  CREW: 'crew',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

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
```

---

## 6. Type Definitions

### 4.1 Core Models (`src/types/models.ts`)

```typescript
import { Timestamp } from 'firebase/firestore';
import { BookingStatus } from '@/constants/bookingStatus';
import { UserRole } from '@/constants/userRoles';
import { ExpenseCategory } from '@/config/expenses';

// ============ Season ============

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

// ============ User ============

export interface User {
  id: string;
  email: string;
  name: string;
  color: string;
  roles: UserRole[];
  seasonId: string;
  createdAt: Timestamp;
}

export interface UserPrivateData {
  userId: string;
  guestDayRate?: number;
  nonGuestDayRate?: number;
  contractStart?: Timestamp;
  contractEnd?: Timestamp;
}

// ============ Booking ============

export interface Booking {
  id: string;
  seasonId: string;
  arrivalDate: Timestamp;
  departureDate: Timestamp;
  departureMarina: string;  // Default: "Kaštela"
  arrivalMarina: string;    // Default: "Kaštela"
  guestCount: number;
  notes?: string;           // Crew-private notes
  preferenceFileUrl?: string;
  preferenceFileName?: string;
  status: BookingStatus;
  apaTotal: number;
  tip?: number;
  reconciliation?: Reconciliation;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Reconciliation {
  expectedCash: number;
  actualCash: number;
  difference: number;
  reconciledAt: Timestamp;
  reconciledBy: string;
}

// ============ Crew Score Card ============

/**
 * Score entry for crew gamification.
 * Captain awards points to crew members during each booking.
 */
export interface ScoreEntry {
  id: string;
  bookingId: string;
  
  /** Crew member receiving points */
  toUserId: string;
  
  /** Fixed point values only */
  points: -3 | -2 | -1 | 1 | 2 | 3;
  
  /** Optional reason for the points */
  reason?: string;
  
  /** Always the captain (auto-filled) */
  fromUserId: string;
  
  createdAt: Timestamp;
}

/** Valid point values for score entries */
export const SCORE_POINTS = [-3, -2, -1, 1, 2, 3] as const;
export type ScorePoints = typeof SCORE_POINTS[number];

/** Score summary for a crew member per booking */
export interface BookingScoreSummary {
  userId: string;
  userName: string;
  userColor: string;
  totalPoints: number;
  entryCount: number;
}

/** Season-wide score statistics */
export interface SeasonScoreStats {
  /** Total points per crew member across all bookings */
  crewTotals: Array<{
    userId: string;
    userName: string;
    userColor: string;
    totalPoints: number;
    bookingWins: number;   // Times had highest score
    bookingLosses: number; // Times had lowest score
  }>;
  
  /** Who has the most wins */
  trophyHolder?: string;
  
  /** Who has the most losses */
  hornsHolder?: string;
}

// ============ APA Entry ============

export interface ApaEntry {
  id: string;
  bookingId: string;
  amount: number;
  note?: string;
  createdBy: string;
  createdAt: Timestamp;
}

// ============ Expense ============

export interface Expense {
  id: string;
  bookingId: string;
  seasonId: string;
  amount: number;
  date: Timestamp;
  category: ExpenseCategory;
  merchant: string;
  note?: string;
  receiptUrl?: string;
  receiptLocalPath?: string;  // For offline
  type: 'receipt' | 'no-receipt';
  location?: GeoPoint;
  ocrStatus?: 'pending' | 'completed' | 'failed';
  ocrData?: OCRResult;
  isComplete: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface OCRResult {
  extractedAmount?: number;
  extractedMerchant?: string;
  extractedDate?: string;
  confidence: number;
  rawText: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

// ============ Shopping ============

export interface ShoppingItem {
  id: string;
  bookingId: string;
  name: string;
  isPurchased: boolean;
  purchasedBy?: string;
  purchasedAt?: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
}

// ============ Manual Work Day ============

export interface ManualWorkDay {
  id: string;
  userId: string;
  seasonId: string;
  startDate: Timestamp;
  endDate: Timestamp;
  rateType: 'guest' | 'non-guest';
  note?: string;
  createdAt: Timestamp;
}

// ============ Notification ============

export interface NotificationSettings {
  userId: string;
  closingReminder: boolean;
  bookingStartReminder: boolean;
  dayOffReminder: boolean;
  prefListReminder: boolean;
}
```

---

## 7. Firebase Structure

### 5.1 Firestore Collections

```
seasons/
  {seasonId}/
    - boatName
    - name
    - startDate
    - endDate
    - currency
    - tipSplitType
    - tipSplitConfig
    - createdBy
    - createdAt
    - updatedAt
    
    users/
      {userId}/
        - email
        - name
        - color
        - roles[]
        - createdAt
    
    bookings/
      {bookingId}/
        - arrivalDate
        - departureDate
        - guestCount
        - notes
        - preferenceFileUrl
        - status
        - apaTotal
        - tip
        - reconciliation {}
        - createdBy
        - createdAt
        - updatedAt
        
        apaEntries/
          {entryId}/
            - amount
            - note
            - createdBy
            - createdAt
        
        expenses/
          {expenseId}/
            - amount
            - date
            - category
            - merchant
            - note
            - receiptUrl
            - type
            - location
            - ocrStatus
            - isComplete
            - createdBy
            - createdAt
            - syncStatus
        
        shoppingItems/
          {itemId}/
            - name
            - isPurchased
            - purchasedBy
            - purchasedAt
            - createdBy
            - createdAt

userPrivate/
  {userId}/
    - guestDayRate
    - nonGuestDayRate
    - contractStart
    - contractEnd
    
    manualWorkDays/
      {dayId}/
        - startDate
        - endDate
        - rateType
        - note
        - createdAt
```

### 5.2 Firebase Storage Structure

```
seasons/
  {seasonId}/
    bookings/
      {bookingId}/
        preferences/
          {filename}.pdf
        receipts/
          {expenseId}/
            original.jpg
            thumbnail.jpg
```

### 5.3 Security Rules (Overview)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Season access - must be a member
    match /seasons/{seasonId} {
      allow read, write: if isSeasonMember(seasonId);
      
      // Users subcollection
      match /users/{userId} {
        allow read: if isSeasonMember(seasonId);
        allow write: if isCaptain(seasonId) || request.auth.uid == userId;
      }
      
      // Bookings
      match /bookings/{bookingId} {
        allow read: if isSeasonMember(seasonId);
        allow create: if isSeasonMember(seasonId);
        allow update: if isSeasonMember(seasonId) && canEditBooking(resource);
        allow delete: if isSeasonMember(seasonId) && canDeleteBooking(resource);
        
        // Expenses
        match /expenses/{expenseId} {
          allow read: if isSeasonMember(seasonId);
          allow create: if isSeasonMember(seasonId);
          allow update: if isOwnerOrEditor(resource, seasonId);
          allow delete: if isOwnerOrEditor(resource, seasonId);
        }
      }
    }
    
    // Private user data - only owner
    match /userPrivate/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      match /manualWorkDays/{dayId} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    // Helper functions
    function isSeasonMember(seasonId) {
      return exists(/databases/$(database)/documents/seasons/$(seasonId)/users/$(request.auth.uid));
    }
    
    function isCaptain(seasonId) {
      let user = get(/databases/$(database)/documents/seasons/$(seasonId)/users/$(request.auth.uid));
      return 'captain' in user.data.roles;
    }
    
    function isEditor(seasonId) {
      let user = get(/databases/$(database)/documents/seasons/$(seasonId)/users/$(request.auth.uid));
      return 'editor' in user.data.roles;
    }
    
    function isOwnerOrEditor(resource, seasonId) {
      return resource.data.createdBy == request.auth.uid || isEditor(seasonId);
    }
  }
}
```

---

## 8. Hooks Architecture

### 6.1 Pattern

Each hook follows this pattern:

```typescript
// useExpenses.ts
export function useExpenses(bookingId: string) {
  // State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch
  useEffect(() => {
    const unsubscribe = expenseService.subscribe(bookingId, {
      onData: setExpenses,
      onError: setError,
    });
    return unsubscribe;
  }, [bookingId]);
  
  // Actions
  const addExpense = useCallback(async (data: CreateExpenseData) => {
    return expenseService.create(bookingId, data);
  }, [bookingId]);
  
  // Computed
  const totalSpent = useMemo(() => 
    expenses.reduce((sum, e) => sum + e.amount, 0),
  [expenses]);
  
  return {
    expenses,
    loading,
    error,
    addExpense,
    totalSpent,
  };
}
```

### 6.2 Key Hooks

| Hook | Purpose |
|------|---------|
| `useAuth` | Auth state, login, logout |
| `usePermissions` | Check user permissions |
| `useSeason` | Current season data |
| `useCrew` | Crew members list |
| `useBookings` | All bookings for season |
| `useBooking(id)` | Single booking |
| `useExpenses(bookingId)` | Expenses for booking |
| `useReceiptCapture` | Camera + OCR flow |
| `useReconciliation(bookingId)` | Reconciliation logic |
| `useShopping(bookingId)` | Shopping list |
| `useIncome` | Personal earnings calc |
| `useInsights` | Season statistics |
| `useOfflineSync` | Sync status, queue |

---

## 9. Offline Strategy

### 7.1 Overview

```
┌──────────────────────────────────────────────────────┐
│  LOCAL (Device)                                      │
│  ┌────────────────┐   ┌────────────────┐            │
│  │ Firestore      │   │ AsyncStorage   │            │
│  │ Offline Cache  │   │ (Images queue) │            │
│  └───────┬────────┘   └───────┬────────┘            │
│          │                    │                      │
│          └──────────┬─────────┘                      │
│                     │                                │
│          ┌──────────▼──────────┐                    │
│          │   Sync Manager      │                    │
│          └──────────┬──────────┘                    │
│                     │                                │
└─────────────────────┼────────────────────────────────┘
                      │ when online
                      ▼
┌──────────────────────────────────────────────────────┐
│  REMOTE (Firebase)                                   │
│  ┌────────────────┐   ┌────────────────┐            │
│  │   Firestore    │   │    Storage     │            │
│  └────────────────┘   └────────────────┘            │
└──────────────────────────────────────────────────────┘
```

### 7.2 Firestore Offline

Firestore has built-in offline support:

```typescript
// src/services/firebase/db.ts
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
```

### 7.3 Image Upload Queue

```typescript
// src/services/imageQueue.ts
interface QueuedImage {
  localPath: string;
  remotePath: string;
  expenseId: string;
  attempts: number;
  createdAt: number;
}

class ImageUploadQueue {
  private queue: QueuedImage[] = [];
  
  async add(image: QueuedImage) {
    this.queue.push(image);
    await AsyncStorage.setItem('imageQueue', JSON.stringify(this.queue));
  }
  
  async processQueue() {
    if (!navigator.onLine) return;
    
    for (const image of this.queue) {
      try {
        await this.uploadImage(image);
        await this.removeFromQueue(image);
      } catch (error) {
        image.attempts++;
        if (image.attempts >= 3) {
          // Mark as failed
        }
      }
    }
  }
}
```

### 7.4 Sync Status Store

```typescript
// src/stores/syncStore.ts
import { create } from 'zustand';

interface SyncState {
  isOnline: boolean;
  pendingExpenses: number;
  pendingImages: number;
  lastSyncAt: Date | null;
  setOnline: (online: boolean) => void;
  setPendingExpenses: (count: number) => void;
  setPendingImages: (count: number) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: true,
  pendingExpenses: 0,
  pendingImages: 0,
  lastSyncAt: null,
  setOnline: (online) => set({ isOnline: online }),
  setPendingExpenses: (count) => set({ pendingExpenses: count }),
  setPendingImages: (count) => set({ pendingImages: count }),
}));
```

---

## 10. OCR Flow

### 8.1 On-Device Processing

Using Google ML Kit for on-device OCR:

```typescript
// src/features/expense/services/ocrService.ts
import TextRecognition from '@react-native-ml-kit/text-recognition';

export async function extractReceiptData(imagePath: string): Promise<OCRResult> {
  const result = await TextRecognition.recognize(imagePath);
  
  return {
    rawText: result.text,
    extractedAmount: parseAmount(result.text),
    extractedMerchant: parseMerchant(result.text),
    extractedDate: parseDate(result.text),
    confidence: result.blocks.length > 0 ? 0.8 : 0.2,
  };
}

function parseAmount(text: string): number | undefined {
  // Regex patterns for common amount formats
  const patterns = [
    /(?:total|ukupno|suma)[:\s]*€?\s*(\d+[.,]\d{2})/i,
    /€\s*(\d+[.,]\d{2})/,
    /(\d+[.,]\d{2})\s*€/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1].replace(',', '.'));
    }
  }
  return undefined;
}
```

### 8.2 OCR Workflow

```
User takes photo
      │
      ▼
Save locally (immediate)
      │
      ▼
Run OCR (background)
      │
      ├─── Success ───▶ Pre-fill form fields
      │                     │
      │                     ▼
      │               User reviews & confirms
      │
      └─── Failure ───▶ User enters manually
```

---

## 11. Environment Configuration

### 9.1 Env Files

```bash
# .env.development
EXPO_PUBLIC_FIREBASE_API_KEY=xxx
EXPO_PUBLIC_FIREBASE_PROJECT_ID=crew-season-dev
EXPO_PUBLIC_ENV=development

# .env.production
EXPO_PUBLIC_FIREBASE_API_KEY=xxx
EXPO_PUBLIC_FIREBASE_PROJECT_ID=crew-season-prod
EXPO_PUBLIC_ENV=production
```

### 9.2 Typed Env Access

```typescript
// src/config/env.ts
const ENV = {
  FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  ENV: process.env.EXPO_PUBLIC_ENV as 'development' | 'staging' | 'production',
  
  isDev: process.env.EXPO_PUBLIC_ENV === 'development',
  isProd: process.env.EXPO_PUBLIC_ENV === 'production',
} as const;

export default ENV;
```

---

## 12. Testing Strategy

### 10.1 Test Types

| Type | Tool | Coverage |
|------|------|----------|
| Unit | Jest | Utils, hooks logic |
| Component | React Native Testing Library | UI components |
| Integration | Jest + Firebase Emulator | Services |
| E2E | Detox | Critical flows |

### 10.2 Test Structure

```
__tests__/
├── unit/
│   ├── utils/
│   │   └── currency.test.ts
│   └── hooks/
│       └── useEarningsCalc.test.ts
├── components/
│   └── ExpenseItem.test.tsx
├── integration/
│   └── expenseService.test.ts
└── e2e/
    └── expense-capture.e2e.ts
```

---

## 13. Libraries

### 11.1 Core Dependencies

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "expo-camera": "~15.0.0",
    "expo-image-picker": "~15.0.0",
    "expo-file-system": "~17.0.0",
    "expo-location": "~17.0.0",
    "expo-notifications": "~0.28.0",
    
    "firebase": "^10.12.0",
    "react-native-firebase": "^20.0.0",
    
    "@react-native-ml-kit/text-recognition": "^1.0.0",
    
    "zustand": "^4.5.0",
    "react-hook-form": "^7.52.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.6.0",
    
    "nativewind": "^4.0.0",
    "tailwindcss": "^3.4.0",
    
    "date-fns": "^3.6.0",
    "expo-document-picker": "~12.0.0",
    "expo-sharing": "~12.0.0",
    "expo-mail-composer": "~13.0.0"
  }
}
```

### 11.2 Dev Dependencies

```json
{
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/react": "~18.2.0",
    
    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.5.0",
    
    "eslint": "^8.57.0",
    "prettier": "^3.3.0",
    
    "firebase-tools": "^13.11.0"
  }
}
```

---

## 14. Development Workflow

### 12.1 Getting Started

```bash
# Clone
git clone <repo>
cd ahoyapp

# Install
npm install

# Setup Firebase
cp .env.example .env.development
# Edit with your Firebase config

# Start
npx expo start
```

### 12.2 Code Style

- **ESLint** + **Prettier** for formatting
- **Husky** + **lint-staged** for pre-commit hooks
- **Conventional Commits** for commit messages

### 12.3 Branch Strategy

```
main          ─────────────────────────────────
                    ↑           ↑
develop       ──────┼───────────┼──────────────
               ↑    │      ↑    │
feature/*     ─┴────┘      └────┘
```

---

## 15. Deployment

### 13.1 Expo Build

```bash
# Development build
npx expo prebuild
npx expo run:ios
npx expo run:android

# Production build
eas build --platform all --profile production
```

### 13.2 OTA Updates

```bash
# Push update without app store
eas update --branch production
```

---

## 16. Monitoring & Analytics

### 14.1 Error Tracking

- **Sentry** for crash reporting
- Firebase Crashlytics as backup

### 14.2 Analytics (Minimal)

Only essential metrics:
- Daily active users
- Expenses created
- Sync failures
- OCR success rate

**No tracking of:** Personal data, earnings, specific amounts.

---

## Appendix A: Component Examples

### A.1 UI Button

```typescript
// src/components/ui/Button.tsx
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { COLORS } from '@/config/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        'rounded-lg items-center justify-center',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50',
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : COLORS.primary} />
      ) : (
        <Text className={textVariants[variant]}>{title}</Text>
      )}
    </Pressable>
  );
}
```

### A.2 Feature Hook

```typescript
// src/features/expense/hooks/useExpenses.ts
import { useEffect, useState, useCallback, useMemo } from 'react';
import { expenseService } from '../services/expenseService';
import type { Expense, CreateExpenseData } from '../types';

export function useExpenses(bookingId: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = expenseService.subscribeToBookingExpenses(
      bookingId,
      (data) => {
        setExpenses(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [bookingId]);

  const createExpense = useCallback(
    async (data: CreateExpenseData) => {
      return expenseService.create(bookingId, data);
    },
    [bookingId]
  );

  const deleteExpense = useCallback(
    async (expenseId: string) => {
      return expenseService.delete(bookingId, expenseId);
    },
    [bookingId]
  );

  const totalSpent = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const byCategory = useMemo(
    () =>
      expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {} as Record<string, number>),
    [expenses]
  );

  return {
    expenses,
    loading,
    error,
    createExpense,
    deleteExpense,
    totalSpent,
    byCategory,
  };
}
```

---

## Appendix B: Checklist for New Features

When adding a new feature:

- [ ] Create feature folder in `src/features/`
- [ ] Define types in `types.ts`
- [ ] Create service for Firebase operations
- [ ] Create hooks for business logic
- [ ] Create components (dumb, receive props)
- [ ] Add screens in `app/`
- [ ] Add config if needed in `src/config/`
- [ ] Add constants if needed in `src/constants/`
- [ ] Write tests
- [ ] Update this spec if architecture changes
