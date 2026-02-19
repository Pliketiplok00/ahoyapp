# Ahoy — Project Plan

**Date:** 2026-02-18
**Updated:** 2026-02-19
**Status:** Phase 4 Complete - Booking CRUD

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

## Phase 5: Home Screen
**Duration:** 2 days

### Tasks

| # | Task | Description | Done |
|---|------|-------------|------|
| 5.1 | Create Home screen | Booking Radar layout | ☐ |
| 5.2 | Create ActiveBookingCard | Expanded view | ☐ |
| 5.3 | Create NextBookingCard | Compact view | ☐ |
| 5.4 | Create HorizonInfo component | Days off, back-to-back | ☐ |
| 5.5 | Create SeasonProgress component | Progress bar | ☐ |
| 5.6 | Calculate horizon data | Logic for gaps | ☐ |
| 5.7 | Handle empty state | No bookings view | ☐ |
| 5.8 | Write tests | Home screen | ☐ |

### Screens
- Home (Booking Radar)

### Deliverable
- Home shows current booking status
- Horizon info displays correctly

---

## Phase 6: Expense Capture
**Duration:** 4-5 days

### Tasks

| # | Task | Description | Done |
|---|------|-------------|------|
| 6.1 | Create Expense types | Full interface | ☐ |
| 6.2 | Create expenseService | Firestore CRUD | ☐ |
| 6.3 | Create useExpenses hook | List for booking | ☐ |
| 6.4 | Create useExpense hook | Single expense | ☐ |
| 6.5 | Create APA Overview screen | List + summary | ☐ |
| 6.6 | Create ExpenseItem component | Row in list | ☐ |
| 6.7 | Create CategoryPicker | Modal picker | ☐ |
| 6.8 | Setup expo-camera | Permissions | ☐ |
| 6.9 | Create Quick Capture screen | Camera view | ☐ |
| 6.10 | Create useReceiptCapture hook | Camera + save | ☐ |
| 6.11 | Save image locally | File system | ☐ |
| 6.12 | Setup ML Kit | OCR integration | ☐ |
| 6.13 | Create ocrService | Text extraction | ☐ |
| 6.14 | Parse amount from OCR | Regex patterns | ☐ |
| 6.15 | Parse merchant from OCR | Logic | ☐ |
| 6.16 | Create Review screen | Confirm OCR data | ☐ |
| 6.17 | Create Manual Entry screen | No-receipt form | ☐ |
| 6.18 | Generate digital paragon | For no-receipt | ☐ |
| 6.19 | Create Add APA modal | Amount input | ☐ |
| 6.20 | Implement edit expense | Edit form | ☐ |
| 6.21 | Implement delete expense | With confirmation | ☐ |
| 6.22 | Verify HR formatting | All numbers/dates | ☐ |
| 6.23 | Write tests | Expense capture | ☐ |

### Screens
- APA Overview (Expense List)
- Quick Capture
- Review (OCR confirm)
- Manual Entry
- Add APA (modal)

### Deliverable
- Camera captures receipts
- OCR extracts data
- Manual entry works
- All amounts in HR format

---

## Phase 7: APA & Reconciliation
**Duration:** 2-3 days

### Tasks

| # | Task | Description | Done |
|---|------|-------------|------|
| 7.1 | Create APA Entry types | Interface | ☐ |
| 7.2 | Create apaService | CRUD for APA entries | ☐ |
| 7.3 | Create useApa hook | Total, entries | ☐ |
| 7.4 | Track APA total | Sum of entries | ☐ |
| 7.5 | Create useReconciliation hook | Calculation logic | ☐ |
| 7.6 | Create Reconciliation screen | Input actual cash | ☐ |
| 7.7 | Create Reconciliation Result | Balanced / difference | ☐ |
| 7.8 | Lock expenses after reconcile | Status change | ☐ |
| 7.9 | Write tests | Reconciliation | ☐ |

### Screens
- Reconciliation
- Reconciliation Result

### Deliverable
- APA tracking works
- Reconciliation calculates correctly
- Shows balanced or difference

---

## Phase 8: Export
**Duration:** 2 days

### Tasks

| # | Task | Description | Done |
|---|------|-------------|------|
| 8.1 | Create Export screen | Options UI | ☐ |
| 8.2 | Generate Excel file | Using xlsx library | ☐ |
| 8.3 | HR number formatting | In Excel | ☐ |
| 8.4 | Zip receipt images | Create archive | ☐ |
| 8.5 | Create combined export | Excel + ZIP | ☐ |
| 8.6 | Integrate mail composer | Send via email | ☐ |
| 8.7 | Save to device | Local save option | ☐ |
| 8.8 | Write tests | Export | ☐ |

### Screens
- Export

### Deliverable
- Export to Excel works
- HR formatting correct
- Can send via email

---

## Phase 9: Offline Support
**Duration:** 2-3 days

### Tasks

| # | Task | Description | Done |
|---|------|-------------|------|
| 9.1 | Configure Firestore offline | Persistence | ☐ |
| 9.2 | Create image upload queue | Local queue | ☐ |
| 9.3 | Create syncStore | Sync state | ☐ |
| 9.4 | Create useOfflineSync hook | Queue management | ☐ |
| 9.5 | Create SyncIndicator | UI component | ☐ |
| 9.6 | Process queue on reconnect | Auto upload | ☐ |
| 9.7 | Test offline scenarios | Full testing | ☐ |
| 9.8 | Write tests | Offline behavior | ☐ |

### Deliverable
- App works offline
- Data syncs when online
- User sees sync status

---

## Phase 10: Settings & Crew
**Duration:** 2-3 days

### Tasks

| # | Task | Description | Done |
|---|------|-------------|------|
| 10.1 | Create Settings screen | Main settings | ☐ |
| 10.2 | Create Crew Management screen | List crew | ☐ |
| 10.3 | Implement add crew member | Invite flow | ☐ |
| 10.4 | Implement remove crew member | Captain only | ☐ |
| 10.5 | Implement role change | Assign Editor | ☐ |
| 10.6 | Create Season Settings screen | Edit season | ☐ |
| 10.7 | Create Tip Split screen | Configure split | ☐ |
| 10.8 | Implement equal split | Auto-calculate | ☐ |
| 10.9 | Implement custom split | Percentage input | ☐ |
| 10.10 | Validate 100% total | Block if not 100% | ☐ |
| 10.11 | Implement logout | Clear state | ☐ |
| 10.12 | Write tests | Settings | ☐ |

### Screens
- Settings
- Crew Management
- Season Settings
- Tip Split

### Deliverable
- Crew management works
- Tip split configurable
- Settings complete

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
| Phase 5: Home | 2 days |
| Phase 6: Expense | 4-5 days |
| Phase 7: Reconciliation | 2-3 days |
| Phase 8: Export | 2 days |
| Phase 9: Offline | 2-3 days |
| Phase 10: Settings | 2-3 days |
| Phase 11: Polish | 3-4 days |
| **TOTAL** | **~26-35 days** |

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
