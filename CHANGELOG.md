# Changelog

All notable changes to Ahoy App will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] - 2026-02-20

### Brutalist Redesign (FAZA A-E)

Complete visual overhaul with neo-brutalist design system.

#### Theme & Foundation (FAZA A)
- New brutalist theme system (`src/config/theme.ts`)
- COLORS: warm cream background, sky blue primary, coral accent
- SHADOWS: offset shadows with no blur (brutSm, brut, brutLg)
- BORDERS: thin (1px), normal (2px), heavy (3px)
- TYPOGRAPHY: Space Grotesk display, JetBrains Mono
- BORDER_RADIUS: 0 everywhere (square corners)

#### Layout Components (FAZA B)
- TabBar: brutalist tabs with lucide icons
- PageHeader: multiple variants (default, booking, apa)
- Screen: updated wrapper with theme values

#### Core Components (FAZA C)
- SectionBadge: header badges (ACTIVE CHARTER, UP NEXT)
- StatusBadge: inline status indicators (LIVE NOW, IN 7 DAYS)
- ProgressBar: APA spending, season progress
- FAB: floating action button
- EmptyState: empty state displays
- BrutInput: minimal rewrite fixing keystroke issues

#### Screen Redesigns (FAZA D)
- HomeScreen (D1)
- BookingsScreen (D1)
- BookingDetailScreen (D2)
- APAScreen with date grouping (D3)
- StatsScreen (D4)
- SettingsScreen (D5)
- NewBookingScreen (D6)
- LoginScreen (D7)
- Crew Management (D8a)
- Tip Split (D8b)
- Season Settings (D8c)
- Edit Booking (D8d)
- Shopping List - NEW full implementation with Firestore (D8e)
- Crew Score (D8f)
- ScoreCardPreview component fix

#### Shared Components (FAZA E)
- Button: brutalist styling with SHADOWS.brutSm
- Card: no border radius, offset shadows
- Input: brutalist borders and colors
- Modal: square corners, heavy borders
- Header: updated colors and fonts
- BookingStatusBadge: renamed from common/StatusBadge
- SyncIndicator: square dots

### Bug Fixes

- **Firebase persistence**: Fixed dev login race condition
- **BrutInput keystroke issues**: Minimal rewrite using useCallback
- **Date picker modal**: Was blocking form input

### Developer Infrastructure

- 3 test users: dev1@ahoy.test, dev2@ahoy.test, dev3@ahoy.test (password: test123)
- Quick login buttons on LoginScreen (DEV mode only)
- Seed data script (`npm run seed:dev`)
- Auto-join dev season on login
- Debug Auth State button in Settings
- Precheck script (`npm run precheck`)

### Test Coverage

- 959 tests passing
- Full coverage for:
  - Theme values and constants
  - Layout components (TabBar, PageHeader, Screen)
  - UI components (all Brut* components)
  - Services (booking, season, score, apa, auth)
  - Utility functions (formatting, dates)

---

## [0.1.0] - 2026-02-01

### Added

- Initial project setup with Expo
- Firebase integration (Auth, Firestore)
- Basic booking management
- Season and crew management
- APA expense tracking
- Offline-first architecture with Zustand stores
