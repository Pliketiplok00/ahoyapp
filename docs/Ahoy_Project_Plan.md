# Ahoy — Project Plan

**Date:** 2026-02-18
**Updated:** 2026-02-19
**Status:** Phase 11 Ready - Polish & Testing

---

## Overview

| Item | Value |
|------|-------|
| **Goal** | MVP ready for internal testing |
| **Team** | Developer + Claude Code |
| **Stack** | React Native + Expo + Firebase |
| **Platforms** | iOS + Android |

---

## Phase 0: Project Setup ✅ COMPLETE
**Duration:** 1 day
**Completed:** 2026-02-18

### Tasks

| # | Task | Description | Done |
|---|------|-------------|------|
| 0.1 | Create Firebase project | Name: `ahoyapp` (ahoyapp-24b36) | ✅ |
| 0.2 | Enable Firebase Auth | Email link (magic link) + Anonymous | ✅ |
| 0.3 | Create Firestore database | Start in test mode | ✅ |
| 0.4 | Enable Firebase Storage | For receipt images | ✅ |
| 0.5 | Create Expo project | `npx create-expo-app ahoyapp` | ✅ |
| 0.6 | Initialize Git repo | + .gitignore (with .env patterns) | ✅ |
| 0.7 | Install core dependencies | See Tech Spec §13 | ✅ |
| 0.8 | Setup folder structure | See Tech Spec §4 | ✅ |
| 0.9 | Create config files | theme, constants, env | ✅ |
| 0.10 | Setup ESLint + Prettier | Code formatting | ✅ |
| 0.11 | Copy docs to /docs folder | All 4 documents | ✅ |
| 0.12 | Verify app runs | iOS simulator (tested) | ✅ |

### Deliverable
- ✅ Empty app that runs on both platforms
- ✅ All config in place
- ✅ Ready to build features

---

## Phase 1: Authentication ✅ COMPLETE
**Duration:** 2-3 days
**Completed:** 2026-02-19

### Tasks

| # | Task | Description | Done |
|---|------|-------------|------|
| 1.1 | Create auth types | User, AuthState, FirebaseUserData | ✅ |
| 1.2 | Create authService | Firebase Auth + dev bypass | ✅ |
| 1.3 | Create useAuth hook | Login, logout, state, devSignIn | ✅ |
| 1.4 | Create authStore | Zustand store with AsyncStorage | ✅ |
| 1.5 | Create Login screen | Email input, send link, dev hints | ✅ |
| 1.6 | Handle magic link deep link | useDeepLinkAuth hook | ✅ |
| 1.7 | Create auth navigation | AuthGuard with protected routes | ✅ |
| 1.8 | Write tests | Auth flow tests | ☐ (deferred) |
| 1.9 | Dev bypass | test@test.com auto-signin | ✅ |

### Screens
- Login ✅

### Deliverable
- ✅ User can log in via magic link
- ✅ Dev bypass for testing (test@test.com, dev@test.com, admin@test.com)
- ✅ Auth state persists across app restarts

---

## Phase 2: Onboarding ✅ COMPLETE
**Duration:** 2-3 days
**Completed:** 2026-02-19

### Tasks

| # | Task | Description | Done |
|---|------|-------------|------|
| 2.1 | Create Season types | Season, CrewMember, SeasonInvite | ✅ |
| 2.2 | Create seasonService | Firestore CRUD + invite codes | ✅ |
| 2.3 | Create useSeason hook | Current season state | ✅ |
| 2.4 | Create Create Boat screen | Form: boat name, season, dates, currency | ✅ |
| 2.5 | Create Join Boat screen | 8-character invite code input | ✅ |
| 2.6 | Create Invite Crew screen | Add emails with skip option | ✅ |
| 2.7 | Implement invite flow | Firestore-based invites | ✅ |
| 2.8 | Assign user colors | From USER_COLORS 20-color palette | ✅ |
| 2.9 | Assign default roles | Captain for creator | ✅ |
| 2.10 | Write tests | Onboarding flow | ☐ (deferred) |

### Screens
- Create Boat ✅
- Join Boat ✅
- Invite Crew ✅
- Onboarding (choice screen) ✅

### Deliverable
- ✅ New user can create a boat workspace
- ✅ User can invite crew via email/code
- ✅ Invited user can join workspace via invite code

---

## Phase 3: Navigation & Layout ✅ COMPLETE
**Duration:** 1-2 days
**Completed:** 2026-02-19

### Tasks

| # | Task | Description | Done |
|---|------|-------------|------|
| 3.1 | Setup Expo Router | File-based routing | ✅ (Phase 0) |
| 3.2 | Create tab navigation | Home, Bookings, Stats, Settings | ✅ |
| 3.3 | Create Screen wrapper | Common layout component | ✅ |
| 3.4 | Create Header component | Back button, title, actions | ✅ |
| 3.5 | Create bottom tab bar | Custom styled TabBar | ✅ |
| 3.6 | Setup navigation types | TypeScript navigation | ✅ |

### Components Created
- `src/components/layout/Screen.tsx` - Safe area wrapper with scroll support
- `src/components/layout/Header.tsx` - Header with back button and actions
- `src/components/layout/TabBar.tsx` - Custom styled bottom tab bar
- `src/types/navigation.ts` - TypeScript navigation types

### Deliverable
- ✅ App has working tab navigation
- ✅ Consistent layout across screens
- ✅ Reusable Screen, Header, TabBar components

---

## Phase 4: Booking CRUD ✅ COMPLETE
**Duration:** 3-4 days
**Completed:** 2026-02-19

### Tasks

| # | Task | Description | Done |
|---|------|-------------|------|
| 4.1 | Create Booking types | Full interface (in models.ts) | ✅ |
| 4.2 | Create bookingService | Firestore CRUD | ✅ |
| 4.3 | Create useBookings hook | List, filter, sort | ✅ |
| 4.4 | Create useBooking hook | Single booking | ✅ |
| 4.5 | Create BookingCard component | 3 variants (default/compact/expanded) | ✅ |
| 4.6 | Create Bookings List screen | With sections (active/upcoming) | ✅ |
| 4.7 | Create New Booking screen | Date pickers, marina selection | ✅ |
| 4.8 | Create Booking Detail screen | View + cancel/delete actions | ✅ |
| 4.9 | Create Edit Booking screen | Edit form | ☐ (deferred) |
| 4.10 | Implement date validation | Overlap check in service | ✅ |
| 4.11 | Implement status logic | Auto-update based on dates | ✅ |
| 4.12 | Create Archive screen | Past bookings | ☐ (deferred) |
| 4.13 | Implement delete booking | With confirmation | ✅ |
| 4.14 | Implement cancel booking | Status change | ✅ |
| 4.15 | Upload preference PDF | File picker + storage | ☐ (deferred) |
| 4.16 | Write tests | Booking CRUD | ☐ (deferred) |

### Files Created
- `src/features/booking/services/bookingService.ts` - Full CRUD operations
- `src/features/booking/hooks/useBookings.ts` - List management
- `src/features/booking/hooks/useBooking.ts` - Single booking
- `src/features/booking/components/BookingCard.tsx` - Card with 3 variants
- `src/features/booking/index.ts` - Feature exports

### Screens
- Bookings List ✅
- New Booking ✅
- Booking Detail ✅
- Edit Booking ☐
- Archive ☐

### Deliverable
- ✅ Booking CRUD works (create, read, delete, cancel)
- ✅ Status auto-updates based on dates
- ☐ Preference PDF upload (deferred)
- ☐ Edit booking (deferred)
- ☐ Archive screen (deferred)

---

## Phase 4.5: Crew Score Card ✅ COMPLETE
**Duration:** 1 day
**Completed:** 2026-02-19

### Tasks

| # | Task | Description | Done |
|---|------|-------------|------|
| 4.5.1 | Create ScoreEntry types | Interface in models.ts | ✅ |
| 4.5.2 | Create scoreService | Firestore CRUD | ✅ |
| 4.5.3 | Create useScoreCard hook | Entries, leaderboard | ✅ |
| 4.5.4 | Create ScoreLeaderboard component | Ranked list | ✅ |
| 4.5.5 | Create ScoreHistory component | Entry list | ✅ |
| 4.5.6 | Create AddScoreEntry form | Captain only | ✅ |
| 4.5.7 | Add Score Card to Booking Detail | Mini preview | ✅ |
| 4.5.8 | Create Score Card screen | Full view | ✅ |
| 4.5.9 | Add Score Stats to Stats screen | Bar chart, badges | ✅ |
| 4.5.10 | Write tests | Score card (66 tests) | ✅ |

### Files Created
- `src/types/models.ts` - Added ScoreEntry, SCORE_POINTS, BookingScoreSummary, SeasonScoreStats
- `src/features/score/services/scoreService.ts` - Full CRUD operations
- `src/features/score/hooks/useScoreCard.ts` - Score card state management
- `src/features/score/components/ScoreLeaderboard.tsx` - Ranked crew display
- `src/features/score/components/ScoreHistory.tsx` - Chronological entries
- `src/features/score/components/AddScoreEntry.tsx` - Captain form
- `src/features/score/components/ScoreCardPreview.tsx` - Compact preview
- `src/features/score/components/ScoreStatsCard.tsx` - Season statistics
- `app/(main)/booking/score/[bookingId].tsx` - Score Card screen
- `app/(main)/booking/score/add/[bookingId].tsx` - Add Score screen

### Screens
- Score Card (linked from Booking Detail) ✅
- Add Score Entry (captain only) ✅

### Deliverable
- ✅ Captain can add score entries to crew members
- ✅ Leaderboard shows per-booking ranking
- ✅ Season stats show bar chart, trophy holder, horns holder
- ✅ 66 tests covering all functionality

---

## Phase 5: Home Screen ✅ COMPLETE
**Duration:** 1 day
**Completed:** 2026-02-19

### Tasks

| # | Task | Description | Done |
|---|------|-------------|------|
| 5.1 | Create Home screen | Booking Radar layout | ✅ |
| 5.2 | Create ActiveBookingCard | Expanded view | ✅ |
| 5.3 | Create NextBookingCard | Compact view | ✅ |
| 5.4 | Create HorizonInfo component | Days off, back-to-back | ✅ |
| 5.5 | Create SeasonProgress component | Progress bar | ✅ |
| 5.6 | Calculate horizon data | Logic for gaps | ✅ |
| 5.7 | Handle empty state | No bookings view | ✅ |
| 5.8 | Write tests | Home screen (69 tests) | ✅ |

### Files Created
- `src/features/home/components/ActiveBookingCard.tsx` - Expanded active booking with APA progress
- `src/features/home/components/NextBookingCard.tsx` - Compact upcoming booking cards
- `src/features/home/components/HorizonInfo.tsx` - Days off and back-to-back indicators
- `src/features/home/components/SeasonProgress.tsx` - Season progress bar
- `src/features/home/components/EmptyState.tsx` - No season/bookings/complete states
- `src/features/home/components/index.ts` - Component exports
- `src/features/home/index.ts` - Feature exports
- `app/(main)/(tabs)/index.tsx` - Updated Home screen with Booking Radar

### Screens
- Home (Booking Radar) ✅

### Deliverable
- ✅ Home shows current booking status with day progress
- ✅ Horizon info displays days off, back-to-back warnings
- ✅ Season progress bar shows completion percentage
- ✅ Empty states for no season, no bookings, season complete
- ✅ 69 tests covering all calculations and logic

---

## Phase 6: Expense Capture (Core Complete)
**Duration:** 4-5 days
**Progress:** Core features complete, OCR deferred

### Tasks

| # | Task | Description | Done |
|---|------|-------------|------|
| 6.1 | Create Expense types | Full interface | ✅ (existed) |
| 6.2 | Create expenseService | Firestore CRUD | ✅ |
| 6.3 | Create useExpenses hook | List for booking | ✅ |
| 6.4 | Create useExpense hook | Single expense | ☐ (deferred) |
| 6.5 | Create APA Overview screen | List + summary | ✅ |
| 6.6 | Create ExpenseItem component | Row in list | ✅ |
| 6.7 | Create CategoryPicker | Modal picker | ✅ |
| 6.8 | Setup expo-camera | Permissions | ✅ (image-picker) |
| 6.9 | Create Quick Capture screen | Camera view | ✅ |
| 6.10 | Create useReceiptCapture hook | Camera + save | ☐ (deferred) |
| 6.11 | Save image locally | File system | ✅ (local path) |
| 6.12 | Setup ML Kit | OCR integration | ☐ (deferred) |
| 6.13 | Create ocrService | Text extraction | ☐ (deferred) |
| 6.14 | Parse amount from OCR | Regex patterns | ☐ (deferred) |
| 6.15 | Parse merchant from OCR | Logic | ☐ (deferred) |
| 6.16 | Create Review screen | Confirm OCR data | ☐ (deferred) |
| 6.17 | Create Manual Entry screen | No-receipt form | ✅ |
| 6.18 | Generate digital paragon | For no-receipt | ✅ (type flag) |
| 6.19 | Create Add APA modal | Amount input | ☐ (deferred) |
| 6.20 | Implement edit expense | Edit form | ☐ (deferred) |
| 6.21 | Implement delete expense | With confirmation | ✅ (service) |
| 6.22 | Verify HR formatting | All numbers/dates | ✅ |
| 6.23 | Write tests | Expense capture (31 tests) | ✅ |

### Files Created
- `src/features/expense/services/expenseService.ts` - Full CRUD operations
- `src/features/expense/hooks/useExpenses.ts` - List management
- `src/features/expense/components/ExpenseItem.tsx` - Row display
- `src/features/expense/components/CategoryPicker.tsx` - Category selection
- `src/features/expense/components/ExpenseSummary.tsx` - APA progress card
- `src/features/expense/components/index.ts` - Component exports
- `src/features/expense/index.ts` - Feature exports
- `app/(main)/booking/expenses/[bookingId].tsx` - APA Overview screen
- `app/(main)/booking/expenses/manual/[bookingId].tsx` - Manual Entry screen
- `app/(main)/booking/expenses/capture/[bookingId].tsx` - Quick Capture screen

### Screens
- APA Overview (Expense List) ✅
- Quick Capture ✅
- Review (OCR confirm) ☐
- Manual Entry ✅
- Add APA (modal) ☐

### Deliverable
- ✅ Camera captures receipts via expo-image-picker
- ☐ OCR extracts data (deferred - requires ML Kit setup)
- ✅ Manual entry works
- ✅ All amounts in HR format (EUR currency)
- ✅ 31 tests covering service and components

---

## Phase 7: APA & Reconciliation ✅ COMPLETE
**Duration:** 2-3 days
**Completed:** 2026-02-19

### Tasks

| # | Task | Description | Done |
|---|------|-------------|------|
| 7.1 | Create APA Entry types | Interface | ✅ |
| 7.2 | Create apaService | CRUD for APA entries | ✅ |
| 7.3 | Create useApa hook | Total, entries | ✅ |
| 7.4 | Track APA total | Sum of entries | ✅ |
| 7.5 | Create useReconciliation hook | Calculation logic | ✅ |
| 7.6 | Create Reconciliation screen | Input actual cash | ✅ |
| 7.7 | Create Reconciliation Result | Balanced / difference | ✅ |
| 7.8 | Lock expenses after reconcile | Status change | ✅ |
| 7.9 | Write tests | Reconciliation (47 tests) | ✅ |

### Files Created
- `src/features/apa/services/apaService.ts` - Full CRUD operations
- `src/features/apa/hooks/useApa.ts` - APA state management
- `src/features/apa/hooks/useReconciliation.ts` - Reconciliation logic
- `src/features/apa/components/ReconciliationResult.tsx` - Result display
- `src/features/apa/components/ApaEntryItem.tsx` - Entry row
- `src/features/apa/components/AddApaModal.tsx` - APA deposit form
- `app/(main)/booking/reconciliation/[bookingId].tsx` - Reconciliation screen

### Screens
- Reconciliation ✅
- Reconciliation Result ✅

### Deliverable
- ✅ APA tracking works
- ✅ Reconciliation calculates correctly
- ✅ Shows balanced or difference
- ✅ 47 tests covering service, components, validation

---

## Phase 8: Export ✅ COMPLETE
**Duration:** 2 days
**Completed:** 2026-02-19

### Tasks

| # | Task | Description | Done |
|---|------|-------------|------|
| 8.1 | Create Export screen | Options UI | ✅ |
| 8.2 | Generate Excel file | Using xlsx library | ✅ |
| 8.3 | HR number formatting | In Excel | ✅ |
| 8.4 | Zip receipt images | Create archive | ☐ (deferred) |
| 8.5 | Create combined export | Excel + ZIP | ☐ (deferred) |
| 8.6 | Integrate mail composer | Send via email | ✅ |
| 8.7 | Save to device | Share option | ✅ |
| 8.8 | Write tests | Export (20 tests) | ✅ |

### Files Created
- `src/features/export/services/exportService.ts` - Excel generation with xlsx
- `src/features/export/hooks/useExport.ts` - Export state management
- `app/(main)/booking/export/[bookingId].tsx` - Export screen with share/email

### Screens
- Export ✅

### Deliverable
- ✅ Export to Excel works
- ✅ HR formatting correct (dates, numbers, currency)
- ✅ Can share via email or system share
- ✅ 20 tests covering export functionality

---

## Phase 9: Offline Support ✅ COMPLETE
**Duration:** 2-3 days
**Completed:** 2026-02-19

### Tasks

| # | Task | Description | Done |
|---|------|-------------|------|
| 9.1 | Configure Firestore offline | Persistence with persistentLocalCache | ✅ |
| 9.2 | Create image upload queue | Local queue in syncStore | ✅ |
| 9.3 | Create syncStore | Zustand with AsyncStorage | ✅ |
| 9.4 | Create useOfflineSync hook | NetInfo + queue management | ✅ |
| 9.5 | Create SyncIndicator | Dot/pill/icon-only variants | ✅ |
| 9.6 | Process queue on reconnect | Auto upload when online | ✅ |
| 9.7 | Test offline scenarios | Full testing | ✅ |
| 9.8 | Write tests | Offline behavior (27 tests) | ✅ |

### Files Created
- `src/config/firebase.ts` - Updated with persistentLocalCache
- `src/stores/syncStore.ts` - Zustand sync state management
- `src/hooks/useOfflineSync.ts` - Network monitoring, upload queue
- `src/components/common/SyncIndicator.tsx` - Status indicator variants

### Deliverable
- ✅ Firestore works offline with unlimited cache
- ✅ Image uploads queue when offline
- ✅ Auto-process queue when coming online
- ✅ SyncIndicator shows pending/syncing/error status
- ✅ 27 tests covering sync store and indicator

---

## Phase 10: Settings & Crew ✅ COMPLETE
**Duration:** 2-3 days
**Completed:** 2026-02-19

### Tasks

| # | Task | Description | Done |
|---|------|-------------|------|
| 10.1 | Create Settings screen | Main settings with real data | ✅ |
| 10.2 | Create Crew Management screen | List crew + invites | ✅ |
| 10.3 | Implement add crew member | Invite modal with code | ✅ |
| 10.4 | Implement remove crew member | Captain only with confirm | ✅ |
| 10.5 | Implement role change | Toggle Editor role | ✅ |
| 10.6 | Create Season Settings screen | Edit boat name, season name | ✅ |
| 10.7 | Create Tip Split screen | Configure split UI | ✅ |
| 10.8 | Implement equal split | Auto-calculate | ✅ |
| 10.9 | Implement custom split | Percentage input per member | ✅ |
| 10.10 | Validate 100% total | Error when not 100% | ✅ |
| 10.11 | Implement logout | With confirmation | ✅ |
| 10.12 | Write tests | Settings (67 tests) | ✅ |

### Files Created
- `app/(main)/(tabs)/settings.tsx` - Updated with real season/crew data
- `app/(main)/settings/crew.tsx` - Crew management with invite modal
- `app/(main)/settings/season.tsx` - Season settings form
- `app/(main)/settings/tip-split.tsx` - Tip split configuration
- `src/features/settings/tipSplit.test.ts` - 32 tip split tests
- `src/features/settings/crewManagement.test.ts` - 35 crew management tests

### Screens
- Settings ✅ (updated with real data)
- Crew Management ✅
- Season Settings ✅
- Tip Split ✅

### Deliverable
- ✅ Crew management works (view, invite, remove, role change)
- ✅ Tip split configurable (equal or custom percentages)
- ✅ Settings complete with Croatian UI
- ✅ 67 tests covering tip split and crew logic

---

## Phase 11: Polish & Testing
**Duration:** 3-4 days

### Tasks

| # | Task | Description | Done |
|---|------|-------------|------|
| 11.1 | Full test pass | Run all tests | ☐ |
| 11.2 | Test on iOS device | Physical device | ☐ |
| 11.3 | Test on Android device | Physical device | ☐ |
| 11.4 | Test offline mode | Airplane mode | ☐ |
| 11.5 | Fix visual bugs | UI polish | ☐ |
| 11.6 | Fix edge cases | Error handling | ☐ |
| 11.7 | Performance check | Loading times | ☐ |
| 11.8 | Add loading states | Skeletons | ☐ |
| 11.9 | Add error states | Error UI | ☐ |
| 11.10 | Add empty states | No data UI | ☐ |
| 11.11 | Review HR formatting | All screens | ☐ |
| 11.12 | Code cleanup | Remove console.logs | ☐ |

### Deliverable
- App is polished
- All tests pass
- Ready for internal testing

---

## Post-MVP (v1.1)

These features are NOT part of MVP:

| Feature | Priority |
|---------|----------|
| Shopping List | High |
| Personal Income | High |
| Season Insights / Stats | Medium |
| Calendar View | Medium |
| Notifications | Medium |
| i18n (HR/EN switch) | Low |

---

## Estimated Timeline

| Phase | Duration |
|-------|----------|
| Phase 0: Setup | 1 day |
| Phase 1: Auth | 2-3 days |
| Phase 2: Onboarding | 2-3 days |
| Phase 3: Navigation | 1-2 days |
| Phase 4: Booking | 3-4 days |
| Phase 4.5: Score Card | 1 day |
| Phase 5: Home | 2 days |
| Phase 6: Expense | 4-5 days |
| Phase 7: Reconciliation | 2-3 days |
| Phase 8: Export | 2 days |
| Phase 9: Offline | 2-3 days |
| Phase 10: Settings | 2-3 days |
| Phase 11: Polish | 3-4 days |
| **TOTAL** | **~27-36 days** |

---

## How to Use This Plan

1. **Start each day** by checking this plan
2. **Work phase by phase** — don't skip ahead
3. **Check off tasks** as you complete them
4. **Update session log** daily
5. **When phase is done**, verify all deliverables before moving on

---

## Risk Factors

| Risk | Mitigation |
|------|------------|
| OCR accuracy | Have robust manual entry fallback |
| Firebase costs | Start with free tier, monitor usage |
| Offline complexity | Test early and often |
| Camera issues | Test on physical devices early |
| Export formatting | Test Excel import into HR software |
