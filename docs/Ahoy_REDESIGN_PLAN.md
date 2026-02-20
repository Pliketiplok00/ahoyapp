# AHOY — Redesign Plan
> Neo-brutalist redesign implementation guide

**Datum:** 2026-02-20
**Status:** U tijeku

---

## 📚 REFERENTNI DOKUMENTI

| Dokument | Lokacija | Svrha |
|----------|----------|-------|
| Design Rules | `docs/Ahoy_DESIGN_RULES.md` | Sistemska pravila (boje, shadows, tipografija) |
| UI Elements | `docs/Ahoy_UI_ELEMENTS.md` | Specifikacije po ekranima |
| Screen Map | `docs/Ahoy_Screen_Map.md` | **IZVOR ISTINE** za strukturu ekrana |
| Shared Components | `docs/ahoy-example-SHARED_COMPONENTS.md` | Gdje se koje komponente koriste |
| HomeScreen Example | `docs/ahoy-example-HomeScreen-RN.tsx` | **REFERENTNA IMPLEMENTACIJA** |
| Theme Config | `src/config/theme.ts` | Sve vrijednosti (COLORS, SHADOWS, SPACING...) |

---

## ⛔ APSOLUTNA PRAVILA

### 1. SKIN-BASED DIZAJN
```typescript
// ❌ ZABRANJENO - hardcoded vrijednosti
backgroundColor: '#4A90D9'
padding: 16
fontSize: 14
borderRadius: 8

// ✅ OBAVEZNO - iz theme.ts
backgroundColor: COLORS.primary
padding: SPACING.md
fontSize: TYPOGRAPHY.sizes.body
borderRadius: BORDER_RADIUS.none  // UVIJEK 0!
```

### 2. BRUTALIST PRAVILA
- **Border radius:** UVIJEK 0 — nikad zaobljeno
- **Shadows:** UVIJEK offset (4px 4px), NIKAD blur
- **Press state:** UVIJEK translate(1,1), NIKAD scale
- **Fonts:** Space Grotesk (display), Space Mono (mono)
- **Headings:** UVIJEK UPPERCASE

### 3. PROVJERA PRIJE COMMITA
```bash
# Ne smije vratiti rezultate:
grep -rn "#[0-9A-Fa-f]\{3,6\}" src/components/ --include="*.tsx" | grep -v theme
grep -rn "borderRadius: [1-9]" src/components/ --include="*.tsx"
grep -rn "shadowRadius: [1-9]" src/components/ --include="*.tsx"
```

### 4. HIJERARHIJA IZVORA ISTINE
```
Screen_Map.md (struktura)
       ↓
UI_ELEMENTS.md (vizualni detalji)
       ↓
ahoy-example-HomeScreen-RN.tsx (kod pattern)
       ↓
theme.ts (vrijednosti)
```

Ako postoji konflikt → Screen_Map.md POBJEĐUJE.

---

## FAZA B: Shell (Globalni Layout)

**Cilj:** Globalni elementi koje koriste SVI screenovi.
**Vrijeme:** ~2h

### TASK-B1: TabBar
**Output:** `src/components/layout/TabBar.tsx`
**Referenca:** UI_ELEMENTS.md → Global Shell → Tab Bar

**Specifikacija:**
```
position: fixed bottom
height: 72px (LAYOUT.tabBarHeight)
background: COLORS.card (white)
border-top: 3px solid COLORS.foreground
```

**Tabovi:**
| Icon | Label | Route |
|------|-------|-------|
| Anchor | HOME | /(tabs)/ |
| Calendar | LIST | /(tabs)/bookings |
| BarChart2 | DATA | /(tabs)/stats |
| User | USER | /(tabs)/settings |

**Active state:** Icon + label color = COLORS.primary
**Inactive state:** Icon + label color = COLORS.mutedForeground
**Icon style:** SQUARE (ne rounded) — lucide-react-native

**Commit:** `feat(layout): add brutalist TabBar - TASK-B1`

---

### TASK-B2: PageHeader
**Output:** `src/components/layout/PageHeader.tsx`
**Referenca:** UI_ELEMENTS.md → Global Shell → Page Header

**Props:**
```typescript
interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  variant?: 'default' | 'primary';
}
```

**Specifikacija:**
```
height: ~56px (LAYOUT.headerHeight)
background: COLORS.background (default) | COLORS.primary (variant)
border-bottom: 3px solid COLORS.foreground
padding: SPACING.md horizontal
```

**Back button (ako onBack postoji):**
```
size: 36×36px
background: COLORS.card
border: 2px solid COLORS.foreground
shadow: SHADOWS.brutSm
icon: ArrowLeft, size=18
```

**Title:**
```
font: FONTS.display
size: TYPOGRAPHY.sizes.large (18)
transform: uppercase
color: COLORS.foreground
```

**Commit:** `feat(layout): add brutalist PageHeader - TASK-B2`

---

### TASK-B3: Screen Wrapper
**Output:** `src/components/layout/Screen.tsx`

**Props:**
```typescript
interface ScreenProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  scrollable?: boolean;
  padded?: boolean;
}
```

**Specifikacija:**
```
flex: 1
background: COLORS.background
SafeAreaView wrapping
Optional ScrollView
Optional padding: SPACING.md
```

**Commit:** `feat(layout): add Screen wrapper component - TASK-B3`

---

### TASK-B4: Export & Integration
**Output:** `src/components/layout/index.ts`

Exportaj sve layout komponente i integriraj TabBar u app layout.

**Commit:** `feat(layout): export layout components and integrate TabBar - TASK-B4`

---

## FAZA C: HomeScreen + Core Components

**Cilj:** Integrirati referentni HomeScreen i izvući ponavljajuće komponente.
**Vrijeme:** ~3h

### TASK-C1: Integriraj HomeScreen
**Output:** `app/(main)/(tabs)/index.tsx`
**Referenca:** `docs/ahoy-example-HomeScreen-RN.tsx`

Zamijeni postojeći HomeScreen s referentnom implementacijom.
Prilagodi import paths prema projektu.

**Provjeri:**
- [ ] Hero header (AHOY! + boat name)
- [ ] Active Charter card
- [ ] Up Next cards
- [ ] FAB
- [ ] Empty state

**Commit:** `feat(home): integrate brutalist HomeScreen - TASK-C1`

---

### TASK-C2: SectionBadge Component
**Output:** `src/components/ui/SectionBadge.tsx`

Izvuci iz HomeScreen kao shared component.

**Props:**
```typescript
interface SectionBadgeProps {
  label: string;
  variant?: 'accent' | 'pink' | 'primary' | 'muted';
}
```

**Koristi se u:** Home, Bookings

**Commit:** `feat(ui): extract SectionBadge component - TASK-C2`

---

### TASK-C3: StatusBadge Component
**Output:** `src/components/ui/StatusBadge.tsx`

**Props:**
```typescript
interface StatusBadgeProps {
  status: 'active' | 'upcoming' | 'completed' | 'cancelled' | 'live';
  label?: string; // override default label
}
```

**Default labels:**
- active → "U TOKU"
- upcoming → "ZA X D."
- completed → "ZAVRŠENO"
- cancelled → "OTKAZANO"
- live → "LIVE NOW"

**Koristi se u:** Home, Bookings, BookingDetail, APA

**Commit:** `feat(ui): add StatusBadge component - TASK-C3`

---

### TASK-C4: ProgressBar Component
**Output:** `src/components/ui/ProgressBar.tsx`

**Props:**
```typescript
interface ProgressBarProps {
  progress: number; // 0-100
  variant?: 'default' | 'dark';
  size?: 'sm' | 'md';
}
```

**Specifikacija:**
```
track: COLORS.foreground (dark)
fill: COLORS.primary (default) | COLORS.foreground (dark variant)
height: SPACING.sm (sm) | SPACING.md (md)
borderRadius: 0
```

**Koristi se u:** Home, BookingDetail, APA, Stats

**Commit:** `feat(ui): add ProgressBar component - TASK-C4`

---

### TASK-C5: FAB Component
**Output:** `src/components/ui/FAB.tsx`

**Props:**
```typescript
interface FABProps {
  onPress: () => void;
  icon?: React.ReactNode;
  variant?: 'accent' | 'pink';
}
```

**Specifikacija:**
```
position: absolute
bottom: LAYOUT.tabBarHeight + SPACING.md
right: SPACING.md
size: 56×56px
background: COLORS.accent | COLORS.pink
border: BORDERS.normal
shadow: SHADOWS.brut
content: "+" (default) or custom icon
```

**Koristi se u:** Home, Bookings, APA

**Commit:** `feat(ui): add FAB component - TASK-C5`

---

### TASK-C6: EmptyState Component
**Output:** `src/components/ui/EmptyState.tsx`

**Props:**
```typescript
interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

**Koristi se u:** Home, Bookings, APA, Shopping

**Commit:** `feat(ui): add EmptyState component - TASK-C6`

---

### TASK-C7: Update Exports
**Output:** `src/components/ui/index.ts`

Dodaj sve nove komponente u export.

**Commit:** `feat(ui): export all new brutalist components - TASK-C7`

---

## FAZA D: Screen Redesign

**Cilj:** Redesign svih screenova prema Screen Map specifikaciji.
**Vrijeme:** ~2 dana

### TASK-D1: BookingsScreen 🔴
**Output:** `app/(main)/(tabs)/bookings.tsx`
**Referenca:** Screen_Map.md sekcija 2.3, UI_ELEMENTS.md → BookingsScreen

**Struktura:**
```
PageHeader (title="BOOKINGS", right="+ADD" button + Archive icon)
│
├── Section: ACTIVE
│   └── BookingCard (blue top strip, DAY X OF Y)
│
├── Section: UPCOMING  
│   └── BookingCard[] (green top strip, IN XD)
│
└── Section: COMPLETED
    └── BookingCard[] (grey top strip)
```

**BookingCard elementi:**
- Color strip na vrhu (status color)
- Client name (display, bold, uppercase)
- Marina + dates
- APA row (APA / SPENT / LEFT)
- 3 action buttons: INFO | SHOP | APA

**Commit:** `feat(bookings): redesign BookingsScreen - TASK-D1`

---

### TASK-D2: BookingDetailScreen 🔴
**Output:** `app/(main)/booking/[id].tsx`
**Referenca:** Screen_Map.md sekcija 3.2, UI_ELEMENTS.md → BookingDetailScreen

**Struktura:**
```
Hero Block (status color background)
├── Status badge
├── Client name
├── Dates + "Day X of Y"
│
Notes Card
│
Preference List Card (placeholder)
│
APA Overview Card
├── Received / Spent / Left
├── Progress bar
│
Action Buttons Grid
├── [APA & EXPENSES] [SHOPPING]
└── [CREW SCORE CARD] (full width)
```

**Commit:** `feat(booking): redesign BookingDetailScreen - TASK-D2`

---

### TASK-D3: APAScreen 🔴
**Output:** `app/(main)/booking/apa/[bookingId].tsx` ili `expenses/[bookingId].tsx`
**Referenca:** Screen_Map.md sekcija 4.1, UI_ELEMENTS.md → APAScreen

**Struktura:**
```
Custom Header (back, status badge, client name, options)
│
TabSwitcher (EXP / SHOP / INFO)
│
APA Summary Hero (primary bg)
├── SPENT (large)
├── SAFE (large)
├── Progress bar
├── + ADD APA button
├── HISTORY toggle
│
Expense List (grouped by date)
├── Today
│   └── ExpenseRow[]
├── Yesterday
│   └── ExpenseRow[]
│
Bottom Action Bar (fixed)
├── [CAPTURE] [MANUAL]
└── [RECONCILIATION] (full width, accent)
```

**BottomSheet modals:**
- Add APA
- Manual Entry
- Reconciliation

**Commit:** `feat(apa): redesign APAScreen - TASK-D3`

---

### TASK-D4: StatsScreen 🟡
**Output:** `app/(main)/(tabs)/stats.tsx`
**Referenca:** Screen_Map.md sekcija 2.4, UI_ELEMENTS.md → StatsScreen

**Struktura:**
```
Season Header (primary bg)
├── "SEASON" label
├── Season name (large)
├── STATS/CAL toggle
│
Stat Cards Row (3 cols)
├── APA IN (blue)
├── SPENT (pink)
└── TIPS (lime)
│
Season Progress Card
│
Highlights (2 cols)
├── Best Tip
└── Lowest Spend
│
Crew Score Section
├── Trophy / Horns badges
└── Pie chart (optional)
│
Top Merchants
│
Spending by Category
```

**Commit:** `feat(stats): redesign StatsScreen - TASK-D4`

---

### TASK-D5: SettingsScreen 🟡
**Output:** `app/(main)/(tabs)/settings.tsx`
**Referenca:** Screen_Map.md sekcija 2.6, UI_ELEMENTS.md → SettingsScreen

**Struktura:**
```
Profile Header
├── CrewAvatar (square, large)
├── Name + email
├── Role badges
│
Section: PERSONAL (ako ima)
├── My Earnings (POST-MVP - hidden)
├── Notifications (POST-MVP - hidden)
│
Section: BOAT
├── Season Settings
├── Crew Management
└── Tip Split
│
Log Out button (destructive)
```

**Commit:** `feat(settings): redesign SettingsScreen - TASK-D5`

---

### TASK-D6: NewBookingScreen 🟡
**Output:** `app/(main)/booking/new.tsx`
**Referenca:** Screen_Map.md sekcija 3.1

**Forma:**
- Arrival date (BrutInput date picker)
- Departure date
- Departure marina (dropdown)
- Arrival marina (dropdown)
- Guest count
- Notes (textarea)
- Preference list (upload placeholder)
- Save button

**Commit:** `feat(booking): redesign NewBookingScreen - TASK-D6`

---

### TASK-D7: Auth Screens 🟢
**Output:** `app/(auth)/login.tsx`, `app/(auth)/create-boat.tsx`, etc.
**Referenca:** UI_ELEMENTS.md → LoginScreen, OnboardingScreen

**Login:**
- Hero header (primary bg, logo box, "CREW SEASON")
- Email input
- Send Magic Link button

**Onboarding:**
- Step indicator
- Form fields per step
- Continue button

**Commit:** `feat(auth): redesign auth screens - TASK-D7`

---

### TASK-D8: Sub-screens 🟢
**Output:** Various settings sub-screens

- Crew Management
- Season Settings  
- Tip Split
- Score Card screens

**Commit:** `feat(settings): redesign sub-screens - TASK-D8`

---

## FAZA E: Remaining Shared Components

**Cilj:** Komponente potrebne za FAZU D koje još nemamo.
**Vrijeme:** ~2h

### TASK-E1: CrewAvatar
**Output:** `src/components/ui/CrewAvatar.tsx`

```typescript
interface CrewAvatarProps {
  name: string;
  colorIndex: number;
  size?: 'sm' | 'md' | 'lg'; // 24, 32, 40px
}
```

**VAŽNO:** Shape je SQUARE (borderRadius: 0), NE krug!

**Koristi se u:** Settings, CrewScore

---

### TASK-E2: CrewDot
**Output:** `src/components/ui/CrewDot.tsx`

```typescript
interface CrewDotProps {
  colorIndex: number;
}
```

10×10px square indicator.

**Koristi se u:** Shopping, TipSplit

---

### TASK-E3: BottomSheet
**Output:** `src/components/ui/BottomSheet.tsx`

```typescript
interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
```

**Koristi se u:** APA, Shopping, BookingDetail, Settings, CrewScore

---

### TASK-E4: TabSwitcher
**Output:** `src/components/ui/TabSwitcher.tsx`

```typescript
interface TabSwitcherProps {
  tabs: { key: string; label: string }[];
  activeTab: string;
  onTabChange: (key: string) => void;
}
```

**Koristi se u:** APA (EXP/SHOP/INFO), Stats (STATS/CAL)

---

### TASK-E5: ExpenseRow
**Output:** `src/components/ui/ExpenseRow.tsx`

**Koristi se u:** APA screen expense list

---

**Commit:** `feat(ui): add remaining shared components - PHASE-E`

---

## FAZA F: QA & Polish

**Cilj:** Provjera kvalitete i usklađenosti s dizajnom.
**Vrijeme:** ~2h

### TASK-F1: Hardcode Check
```bash
# Pokreni i provjeri da nema rezultata:
grep -rn "#[0-9A-Fa-f]\{3,6\}" src/ app/ --include="*.tsx" | grep -v theme | grep -v node_modules
grep -rn "borderRadius: [1-9]" src/ app/ --include="*.tsx"
grep -rn "padding: [0-9]" src/components/ --include="*.tsx"
```

---

### TASK-F2: Visual Comparison
Za svaki screen usporedi s mockupom:
- [ ] HomeScreen vs mockup 1
- [ ] BookingsScreen vs mockup 2
- [ ] StatsScreen vs mockup 3
- [ ] SettingsScreen vs mockup 4

---

### TASK-F3: Interaction Check
- [ ] Svi pressed states koriste translate(1,1)
- [ ] Navigacija radi ispravno
- [ ] TabBar highlighting

---

### TASK-F4: Edge Cases
- [ ] Empty states prikazuju se ispravno
- [ ] Loading states
- [ ] Error handling

---

## 📊 PROGRESS TRACKING

### FAZA B: Shell
| Task | Status | Commit |
|------|--------|--------|
| B1: TabBar | ⬜ | |
| B2: PageHeader | ⬜ | |
| B3: Screen | ⬜ | |
| B4: Export | ⬜ | |

### FAZA C: Home + Core
| Task | Status | Commit |
|------|--------|--------|
| C1: HomeScreen | ⬜ | |
| C2: SectionBadge | ⬜ | |
| C3: StatusBadge | ⬜ | |
| C4: ProgressBar | ⬜ | |
| C5: FAB | ⬜ | |
| C6: EmptyState | ⬜ | |
| C7: Exports | ⬜ | |

### FAZA D: Screens
| Task | Status | Commit |
|------|--------|--------|
| D1: BookingsScreen | ⬜ | |
| D2: BookingDetailScreen | ⬜ | |
| D3: APAScreen | ⬜ | |
| D4: StatsScreen | ⬜ | |
| D5: SettingsScreen | ⬜ | |
| D6: NewBookingScreen | ⬜ | |
| D7: Auth Screens | ⬜ | |
| D8: Sub-screens | ⬜ | |

### FAZA E: Shared Components
| Task | Status | Commit |
|------|--------|--------|
| E1: CrewAvatar | ⬜ | |
| E2: CrewDot | ⬜ | |
| E3: BottomSheet | ⬜ | |
| E4: TabSwitcher | ⬜ | |
| E5: ExpenseRow | ⬜ | |

### FAZA F: QA
| Task | Status |
|------|--------|
| F1: Hardcode Check | ⬜ |
| F2: Visual Comparison | ⬜ |
| F3: Interaction Check | ⬜ |
| F4: Edge Cases | ⬜ |

---

## 📅 PROCJENA VREMENA

| Faza | Vrijeme | Kumulativno |
|------|---------|-------------|
| B: Shell | 2h | 2h |
| C: Home + Core | 3h | 5h |
| D1-D3: Critical | 4h | 9h |
| D4-D6: High | 3h | 12h |
| D7-D8: Medium | 2h | 14h |
| E: Shared | 2h | 16h |
| F: QA | 2h | 18h |
| **UKUPNO** | **~18h** | **~3 dana** |

---

## ✅ DEFINITION OF DONE

Screen je "DONE" kada:
1. ✅ Vizualno odgovara Screen_Map.md wireframeu
2. ✅ Koristi SAMO theme.ts vrijednosti (no hardcode)
3. ✅ Border radius je 0 SVUGDJE
4. ✅ Shadows su offset-only (no blur)
5. ✅ Press states koriste translate
6. ✅ TypeScript PASS
7. ✅ Testovi PASS (ako postoje)
