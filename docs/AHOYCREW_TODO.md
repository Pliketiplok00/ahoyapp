# AhoyCrew — Master TODO & Implementation Plan

**Datum:** 2026-03-14
**Status:** Active
**Verzija:** 2.1

---

## 📋 PREGLED

Ovaj dokument je ažurirani master plan koji pokriva sve — što je napravljeno, što je u tijeku, i što je novo. Služi kao single source of truth za daljnji razvoj.

---

## ✅ ZAVRŠENO (Originalni MVP + Blokovi 1-6)

### Core MVP (ranije završeno)
- Auth (Magic Link) via `ahoy.bdot.house`
- Onboarding (Create/Join Boat)
- Bookings CRUD + Edit
- APA Tracking
- Expense Capture + Edit
- OCR (Gemini AI)
- Receipt Upload (Firebase Storage)
- Reconciliation
- Excel Export
- Crew Management + Roles (kapetan vs crew)
- Tip Split
- Season Settings
- Crew Score (samo kapetan ocjenjuje)
- Stats Dashboard
- Offline Sync
- Shopping List

### Blok 1: Quick Wins ✅
- Privacy Policy screen (GDPR, HR)
- Help/FAQ screen (6 pitanja)
- Profile settings (view email, edit display name)
- Feedback email link

### Blok 2: Archive & Export ✅
- Archive tab (AKTIVNI | ARHIVIRANI filter)
- ZIP export s računima
- PDF export service (brutalist HTML template)

### Blok 3: Code Polish ✅
- Fix spent calculation
- Loading states (ActivityIndicator)
- Error states (retry button)
- Empty states
- HR locale formatting

### Blok 4: Personal Income ✅
- Types, Service, Hook, Store
- Income settings screen (dnevnice s/bez gostiju)
- Income dashboard
- Add work day screen
- Firestore rules (private per user)

### Blok 5: Advanced Features ✅
- Category breakdown chart u stats screen
- Calendar view (SeasonCalendar component)
- Notifications — odgođeno (prekompleksno za MVP)

### Blok 6: Low Priority ✅
- Preference PDF upload u booking detail
- Sentry/Crashlytics — UKLONJENO (Swift module conflicts s Expo)

---

## ✅ ZAVRŠENO (Ova sesija — Mart 2026)

### Infrastruktura ✅
- Firebase CLI setup (firebase.json, .firebaserc)
- Firestore rules deployed (income permissions fix)
- Firestore composite indexes synced (5 indexa lokalno = produkcija)
- expo-updates konfiguriran (OTA update support)
- Deploy scripts (deploy:rules u package.json)
- Pre-commit hook za hardcoded values

### Bug Fixes ✅
- **Income settings save** — RIJEŠENO (root cause: Firestore rules nikad deployane)
- **Income error handling** — poboljšano (prikazuje pravi Firebase error umjesto generic)
- **Booking form: guest count** — sada optional (ne blokira submit)
- **Booking form: keyboard overlap** — KeyboardAvoidingView dodan
- **Booking form: notes label** — uklonjeno "(privatno za posadu)"
- **Calendar refresh** — dodan useFocusEffect na stats tab
- **Season name u headeru** — dodan treći red s imenom sezone

### Stats Screen Improvements ✅
- Renamed "PRIHOD" → "UKUPNI APA"
- Dodan PRIHOD sekcija s radni/neradni dani breakdown
- Ostvareni/očekivani prihod kalkulacije
- "Postavi dnevnice" link ako nisu konfigurirane

### Navigation Reorganization ✅
- 5-tab structure: Bookings, Pantry, Statistika, Zapisnici, Postavke
- Home screen premješten u header
- Full i18n support za nav labels
- Extended header backgrounds into safe area

### Pantry Feature ✅ (Complete - 6 Phases)
- Phase 1: Types, Service, Hook, Firestore rules, i18n keys
- Phase 2-4: List screen, Add item form, Item detail with sell flow
- Phase 5: Financials dashboard with per-crew breakdown
- Phase 6: Season transfer for remaining stock
- Bug fixes: Sale creates expense, delete cascades to sales, custom store name

### Logs Feature ✅ (Complete - 5 Phases)
- Phase 1: Types, Services (TWO-QUERY pattern), Hooks, Firestore rules, i18n, photo upload utility
- Phase 2: Logs tab with sub-tabs (KVAROVI | ŽELJE | SKLADIŠTE)
- Phase 3: Defect Log UI (priority badges, photo capture, PDF export)
- Phase 4: Wish List UI (done toggle, category badges)
- Phase 5: Storage Map UI (visibility toggle, season transfer)

### Phosphor Icon Migration ✅
- Removed lucide-react-native entirely
- Replaced ALL emoji icons with Phosphor equivalents
- Consistent icon weight and sizing across app

### UI Consistency Fixes ✅
- FAB (Floating Action Button) reusable component
- SegmentedTabs reusable component
- Expense screen: FAB popup for scan/manual
- Bookings screen: FAB for add button
- FAB position fix (above OBRAČUN button)
- Manual expense form brutalist redesign

### Full Design Audit ✅ (8 Screens Fixed)
- **Batch 1:** AddApaModal, reconciliation, join-boat — full brutalist redesign + i18n
- **Batch 2:** capture, review screens — hardcoded strings → t(), emoji → Phosphor
- **Batch 3:** income/add-day, score, expense edit — i18n + icon cleanup
- All hardcoded fontSize values → SIZES constants
- All screens now pass pre-commit hook

### EAS Updates ✅
- Preview branch updated with all fixes
- OTA updates working

---

## 🟡 PREOSTALI TASKS

### i18n — Internacionalizacija (HR/EN)
- **Status:** Planirano (keys added, full translation later)
- Izbor jezika: onboarding + settings
- Default: HR
- Library: i18next + react-i18next (already configured)
- Sve hardcodirane HR stringove izvući u translation files
- Procjena: veliki task, 3-5 sati (400+ stringova)

### Notifications (Brief §17) — ODGOĐENO
- Push notifikacije kad netko doda expense
- Reminder za reconciliation
- Prekompleksno za trenutnu fazu

### Sentry/Crashlytics — ODGOĐENO
- Swift module conflicts s Expo
- Riješiti post-launch

### Firebase Emulator Tests — ODGOĐENO
- Integration tests
- CI/CD pipeline

---

## 🟢 INFRASTRUKTURA & DevOps

### OTA Updates (expo-updates) ✅
- Preview: `eas update --branch preview --message "opis"`
- Production: `eas update --branch production --message "opis"`

### Firebase CLI ✅
- Rules deploy: `npm run deploy:rules` ili `npx firebase-tools deploy --only firestore:rules`
- Indexes deploy: `npx firebase-tools deploy --only firestore:indexes`
- firebase.json + .firebaserc u gitu

### Build Profiles (EAS)
- development → development channel
- preview → preview channel
- production → production channel

---

## 📋 PRIORITETI & REDOSLIJED IMPLEMENTACIJE

### Faza 1: Stabilizacija ✅ COMPLETED
1. ~~Income bug fix~~ ✅
2. ~~Calendar refresh~~ ✅
3. ~~Stats improvements~~ ✅
4. ~~Stats cleanup~~ ✅
5. ~~Firestore index za workDays~~ ✅
6. ~~Verify OTA updates~~ ✅

### Faza 2: Navigacija + Pantry ✅ COMPLETED
1. ~~Reorganizacija bottom navigation (5 tabova)~~ ✅
2. ~~Home screen premješten u header~~ ✅
3. ~~Pantry — CRUD artikala~~ ✅
4. ~~Pantry — prodaja iz APE (auto expense entry)~~ ✅
5. ~~Pantry — financijski dashboard~~ ✅
6. ~~Pantry — prijenos zaliha u novu sezonu~~ ✅

### Faza 3: Zapisnici ✅ COMPLETED
1. ~~Tab s podtabovima (Defect/Wish/Storage)~~ ✅
2. ~~Defect Log (kapetan only, foto, status, PDF export)~~ ✅
3. ~~Wish List (svi crew, done toggle, export)~~ ✅
4. ~~Storage Map (per-user, visibility toggle, prijenos u novu sezonu)~~ ✅

### Faza 4: UI Polish ✅ COMPLETED
1. ~~UI consistency (FAB, SegmentedTabs)~~ ✅
2. ~~Full design audit (8 screens)~~ ✅
3. ~~Phosphor icon migration~~ ✅
4. ~~Pre-commit hook for quality~~ ✅

### Faza 5: Polish & Launch (NEXT)
1. i18n (HR/EN) — full translation
2. Final testing svih feature-a
3. Production build
4. App Store submission

---

## 🔧 RAZVOJNI PRINCIPI (NEMA IZNIMKI)

1. **Evidence-based**: Nikakvo pogađanje. Čitaj kod, pokaži dokaze, citiraj linije.
2. **Plan pa odobrenje**: Predloži plan → čekaj "POTVRĐENO ✅" → implementiraj.
3. **Git higijena**: Feature branch, atomic commits, opisni messagei na engleskom.
4. **Verifikacija**: Screenshots i direktna provjera. Ne vjeruj text outputu agenta.
5. **Deployed ≠ Local**: Firestore rules/indexes moraju se eksplicitno deployati.
6. **Brutalist design**: BORDERS.normal, BORDER_RADIUS.none, SHADOWS.brut, FONTS.mono/display.
7. **Privacy**: Income podaci strogo privatni (userId == auth.uid).
8. **HR formatting**: DD.MM.YYYY, €1.234,56, 24h.
9. **i18n**: All strings via t(), no hardcoded Croatian in JSX.
10. **Icons**: Phosphor only, use SIZES.icon.* constants.

---

*Zadnja izmjena: 2026-03-14 (47 commits today)*
