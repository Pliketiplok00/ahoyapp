# AhoyCrew — Implementation Plan (Post-MVP Completion)

**Datum:** 2026-03-07  
**Status:** Active  
**Verzija:** 1.0

---

## 📋 PREGLED

Ovaj dokument definira sve preostale feature-e koje treba implementirati prije produkcijskog releasa. Plan je podijeljen u 6 logičnih blokova, od najjednostavnijih do najkompleksnijih.

**Ukupna procjena:** ~15-18 sati rada

---

## ✅ VEĆ IMPLEMENTIRANO (Reference)

Sljedeće funkcionalnosti su ZAVRŠENE i ne trebaju dodatni rad:

- Auth (Magic Link)
- Onboarding (Create/Join Boat)
- Bookings CRUD + Edit
- APA Tracking
- Expense Capture + Edit
- OCR (Gemini AI)
- Receipt Upload (Firebase Storage)
- Reconciliation
- Excel Export
- Crew Management
- Tip Split
- Season Settings
- Crew Score
- Stats Dashboard
- Offline Sync
- Shopping List

---

## 🔴 BLOK 1: Quick Wins (Placeholders → Real)

**Procjena:** ~1-2 sata  
**Prioritet:** CRITICAL — potrebno za App Store review

### 1.1 Privacy Policy Screen

**Status:** ❌ Placeholder (Alert "dolaze uskoro")  
**File:** Kreirati `app/(main)/settings/privacy.tsx`  
**Update:** `app/(main)/settings.tsx` — zamijeniti Alert s navigacijom

**Sadržaj privacy policy-ja:**
- Koje podatke prikupljamo (email, expense data, receipt images)
- Gdje se podaci čuvaju (Firebase/Google Cloud, EU regija)
- Tko ima pristup (samo članovi posade na istom brodu)
- Koliko dugo čuvamo podatke
- Kako zatražiti brisanje (kontakt email)
- GDPR compliance izjava
- Kontakt za pitanja o privatnosti

**Styling:** Brutalist (ScrollView, FONTS.mono za tekst)

---

### 1.2 Help/Manual Screen

**Status:** ❌ Placeholder (Alert "dolazi uskoro")  
**File:** Kreirati `app/(main)/settings/help.tsx`  
**Update:** `app/(main)/settings.tsx` — zamijeniti Alert s navigacijom

**Sadržaj (FAQ format):**

1. **Kako dodati trošak?**
   - Slikaj račun kamerom ili unesi ručno
   - AI automatski prepoznaje iznos, trgovinu i datum

2. **Kako pozvati člana posade?**
   - Settings > Posada > Unesi email
   - Pošalji generirani kod članu putem SMS/WhatsApp

3. **Kako exportati izvještaj?**
   - Otvori booking > Export > Excel
   - Izvještaj se šalje na email ili dijeli

4. **Što je APA?**
   - Advance Provisioning Allowance
   - Predujam koji gosti daju za troškove tijekom chartere

5. **Kako radi podjela napojnice?**
   - Settings > Tip Split
   - Jednaka podjela ili custom postoci

6. **Kontakt za pomoć**
   - Email link: support@ahoycrew.app

**Styling:** Brutalist, Accordion ili jednostavne sekcije s headerima

---

### 1.3 Feedback

**Status:** ❌ Placeholder (Alert "dolazi uskoro")  
**File:** Update `app/(main)/settings.tsx`

**Implementacija:**
```tsx
import { Linking } from 'react-native';

const handleFeedback = () => {
  const email = 'feedback@ahoycrew.app';
  const subject = encodeURIComponent('AhoyCrew Feedback');
  const body = encodeURIComponent('Verzija: 1.0.0\nUređaj: \n\nMoj feedback:\n');
  Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
};
```

**Alternativa (kompleksnija):** In-app forma s text inputom koja šalje na Firebase/email API

---

### 1.4 Profile Settings

**Status:** ❌ Placeholder (Alert "dolaze uskoro")  
**File:** Kreirati `app/(main)/settings/profile.tsx`  
**Update:** `app/(main)/settings.tsx` — zamijeniti Alert s navigacijom

**Funkcionalnosti:**
- Prikaz email adrese (read-only, iz Firebase Auth)
- Edit display name
- Avatar placeholder (inicijal iz imena)
- Save button

**Firestore:** Update `users/{userId}` dokumenta

---

## 🟠 BLOK 2: Archive & Export

**Procjena:** ~2-3 sata  
**Prioritet:** HIGH

### 2.1 Archive Screen

**Status:** ❌ Placeholder (Alert "Arhivirani bookings uskoro")  
**Location:** `app/(main)/(tabs)/bookings.tsx:240`

**Implementacija opcije:**

**Opcija A: Tab unutar bookings screena**
- Dodaj tab bar: "Aktivni" | "Arhivirani"
- Filter bookinge po statusu

**Opcija B: Zasebni screen**
- `app/(main)/bookings/archive.tsx`
- Lista svih završenih/cancelled bookinga

**Funkcionalnosti:**
- Lista završenih bookinga (status: 'completed' | 'cancelled')
- Klik otvara booking detail (read-only ili s mogućnošću exporta)
- Search/filter po klijentu, datumu

---

### 2.2 ZIP with Receipts

**Status:** ❌ Deferred (TODO u kodu)  
**Location:** `app/(main)/booking/export/[bookingId].tsx:71`

**Trenutno:** `includeReceipts: false // TODO`

**Implementacija:**
1. Dohvati sve expense-e za booking
2. Za svaki expense s receiptUrl, downloadaj sliku
3. Kreiraj ZIP file (koristiti `jszip` library)
4. ZIP sadrži: Excel file + /receipts/ folder sa slikama
5. Share/download ZIP

**Libraries:** `jszip`, `expo-file-system`

---

### 2.3 PDF Export

**Status:** ❌ Placeholder  
**Location:** `app/(main)/(tabs)/stats.tsx:337`

**Implementacija:**
1. Generiraj HTML template s booking/season podacima
2. Konvertiraj u PDF (koristiti `expo-print` ili `react-native-html-to-pdf`)
3. Share PDF

**Sadržaj PDF-a:**
- Header s logom i nazivom broda
- Booking info (klijent, datumi, APA)
- Tablica troškova po kategorijama
- Summary (ukupno, povrat/dodatno)
- Footer s datumom generiranja

---

## 🟡 BLOK 3: Code Polish

**Procjena:** ~2 sata  
**Prioritet:** MEDIUM

### 3.1 Calculate Spent from Expenses

**Status:** ❌ TODO na 2 mjesta  
**Locations:**
- `app/(main)/(tabs)/index.tsx:96`
- `app/(main)/(tabs)/bookings.tsx:126`

**Fix:** Umjesto hardkodirane vrijednosti, izračunaj:
```tsx
const spent = booking.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
```

Ili dohvati iz APA balance ako je već izračunato.

---

### 3.2 Loading States Audit

**Task:** Provjeri sve screenove da imaju proper loading indicator dok se podaci učitavaju.

**Checklist:**
- [ ] Home screen (bookings loading)
- [ ] Booking detail
- [ ] Expenses list
- [ ] Stats screen
- [ ] Crew list
- [ ] Export screen

**Pattern:**
```tsx
if (isLoading) {
  return <LoadingSpinner />;
}
```

---

### 3.3 Error States Audit

**Task:** Provjeri da sve async operacije imaju error handling s user-friendly porukama.

**Pattern:**
```tsx
if (error) {
  return <ErrorMessage message="Nije moguće učitati podatke" onRetry={refetch} />;
}
```

---

### 3.4 Empty States Audit

**Task:** Provjeri da prazne liste imaju smislene empty state poruke.

**Primjeri:**
- Nema bookinga → "Kreiraj svoj prvi booking"
- Nema troškova → "Dodaj prvi trošak"
- Nema članova posade → "Pozovi posadu"

---

### 3.5 HR Formatting Review

**Task:** Provjeri da su svi datumi i valute ispravno formatirani za HR locale.

**Checklist:**
- [ ] Datumi: DD. MM. YYYY.
- [ ] Valuta: €1.234,56 (točka za tisućice, zarez za decimale)
- [ ] Vrijeme: 24h format

---

## 🔵 BLOK 4: Personal Income

**Procjena:** ~4-5 sati  
**Prioritet:** HIGH (Brief §13)  
**Napomena:** Ovo je PRIVATNA funkcionalnost — svaki član vidi SAMO svoje podatke!

### 4.1 Types & Data Model

**File:** `src/features/income/types/index.ts`

```typescript
export interface IncomeSettings {
  id: string;
  seasonId: string;
  userId: string;
  guestDayRate: number;      // € po danu s gostima
  nonGuestDayRate: number;   // € po danu bez gostiju
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkDay {
  id: string;
  date: Date;
  type: 'guest' | 'non-guest';
  bookingId?: string;        // Ako je povezan s bookingom
  earnings: number;          // Izračunato: rate × 1
  note?: string;
}

export interface IncomeSummary {
  totalEarnings: number;
  guestDays: number;
  nonGuestDays: number;
  totalDays: number;
}
```

**Firestore struktura:**
```
users/{userId}/incomeSettings/{seasonId}
users/{userId}/workDays/{workDayId}
```

---

### 4.2 Service & Hook

**Files:**
- `src/features/income/services/incomeService.ts`
- `src/features/income/hooks/useIncome.ts`
- `src/features/income/stores/incomeStore.ts`

**Funkcionalnosti:**
- getIncomeSettings(userId, seasonId)
- updateIncomeSettings(settings)
- getWorkDays(userId, seasonId)
- addWorkDay(workDay)
- deleteWorkDay(workDayId)
- calculateEarnings(workDays, settings)

---

### 4.3 Rate Settings Screen

**File:** `app/(main)/settings/income.tsx`

**UI:**
- Input: "Dnevnica s gostima" (€)
- Input: "Dnevnica bez gostiju" (€)
- Save button
- Info text: "Ovi podaci su privatni i vidljivi samo tebi"

---

### 4.4 Earnings Dashboard

**File:** `app/(main)/income/index.tsx` ili nova tab

**UI:**
- Total earnings this season (veliki broj)
- Breakdown:
  - Guest days: X dana × €Y = €Z
  - Non-guest days: X dana × €Y = €Z
- Lista radnih dana (kalendar ili lista)
- "Dodaj radni dan" button

---

### 4.5 Work Days Tracking

**Auto-tracking:**
- Kad postoji aktivan booking → automatski guest day
- Izračunaj iz booking datuma

**Manual entry:**
- Modal/screen za ručno dodavanje dana
- Date picker + type (guest/non-guest)

---

### 4.6 Firestore Rules

**KRITIČNO:** Osigurati privatnost!

```javascript
// firestore.rules
match /users/{userId}/incomeSettings/{document=**} {
  allow read, write: if request.auth.uid == userId;
}
match /users/{userId}/workDays/{document=**} {
  allow read, write: if request.auth.uid == userId;
}
```

---

## 🟣 BLOK 5: Advanced Features

**Procjena:** ~3-4 sata  
**Prioritet:** LOW (nice-to-have)

### 5.1 Season Insights (Brief §16)

**Status:** Scaffold only  
**Location:** `src/features/insights/README.md`

**Funkcionalnosti:**
- Expense breakdown po kategorijama (pie chart)
- Top merchants
- Spending trend over time (line chart)
- Comparison between bookings

---

### 5.2 Calendar View

**Funkcionalnosti:**
- Visual timeline bookinga
- Drag & drop (optional)
- Quick booking create iz kalendara

**Library:** `react-native-calendars`

---

### 5.3 Notifications (Brief §17)

**Funkcionalnosti:**
- Push notification kad netko doda expense
- Reminder za reconciliation
- Novi član se pridružio

**Setup:**
- Firebase Cloud Messaging (FCM)
- Expo Notifications
- Cloud Functions za triggere

---

## ⚪ BLOK 6: Low Priority (Optional)

**Procjena:** ~2 sata  
**Prioritet:** LOWEST

### 6.1 i18n (HR/EN)

- Language switch u settings
- Koristiti `i18next` ili `expo-localization`

### 6.2 Preference PDF Upload

- Upload guest preference lista
- Prikaži u booking detailu

### 6.3 Sentry Integration

- Crash reporting
- Error tracking
- Performance monitoring

### 6.4 Firebase Emulator Tests

- Integration tests s emulatorom
- CI/CD pipeline

---

## 🚀 EXECUTION CHECKLIST

### BLOK 1: Quick Wins
- [ ] 1.1 Privacy Policy screen
- [ ] 1.2 Help/Manual screen
- [ ] 1.3 Feedback email link
- [ ] 1.4 Profile settings screen
- [ ] Commit & push
- [ ] Test on device

### BLOK 2: Archive & Export
- [ ] 2.1 Archive screen/tab
- [ ] 2.2 ZIP with receipts
- [ ] 2.3 PDF export
- [ ] Commit & push
- [ ] Test on device

### BLOK 3: Code Polish
- [ ] 3.1 Calculate spent from expenses
- [ ] 3.2 Loading states audit
- [ ] 3.3 Error states audit
- [ ] 3.4 Empty states audit
- [ ] 3.5 HR formatting review
- [ ] Commit & push
- [ ] Test on device

### BLOK 4: Personal Income
- [ ] 4.1 Types & data model
- [ ] 4.2 Service & hook
- [ ] 4.3 Rate settings screen
- [ ] 4.4 Earnings dashboard
- [ ] 4.5 Work days tracking
- [ ] 4.6 Firestore rules
- [ ] Commit & push
- [ ] Test on device

### BLOK 5: Advanced Features
- [ ] 5.1 Season insights
- [ ] 5.2 Calendar view
- [ ] 5.3 Notifications
- [ ] Commit & push
- [ ] Test on device

### BLOK 6: Low Priority
- [ ] 6.1 i18n
- [ ] 6.2 Preference PDF upload
- [ ] 6.3 Sentry integration
- [ ] 6.4 Firebase emulator tests

---

## 📝 NAPOMENE ZA IMPLEMENTACIJU

1. **Uvijek koristi brutalist styling** — BORDERS.normal, BORDER_RADIUS.none, SHADOWS.brut, FONTS.mono/display

2. **Typecheck prije commita** — `npm run typecheck`

3. **Lint check** — `npm run lint`

4. **Test na uređaju** nakon svakog bloka

5. **NE COMMITAJ bez potvrde** — pokaži diff i čekaj odobrenje

6. **Privacy je kritična** — Personal Income podaci moraju biti strogo privatni

---

## 🔗 REFERENCE

- Brief dokument: `docs/BRIEF.md`
- Project plan: `docs/PROJECT_PLAN.md`
- Firestore rules: `firestore.rules`
- Theme config: `src/config/theme.ts`

---

*Zadnja izmjena: 2026-03-07*
