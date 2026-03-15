# AhoyCrew — Master TODO & Implementation Plan

**Datum:** 2026-03-14  
**Status:** Active  
**Verzija:** 2.0

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

### Infrastruktura
- Firebase CLI setup (firebase.json, .firebaserc)
- Firestore rules deployed (income permissions fix)
- Firestore composite indexes synced (5 indexa lokalno = produkcija)
- expo-updates konfiguriran (OTA update support)
- Deploy scripts (deploy:rules u package.json)

### Bug Fixes
- **Income settings save** — RIJEŠENO (root cause: Firestore rules nikad deployane)
- **Income error handling** — poboljšano (prikazuje pravi Firebase error umjesto generic)
- **Booking form: guest count** — sada optional (ne blokira submit)
- **Booking form: keyboard overlap** — KeyboardAvoidingView dodan
- **Booking form: notes label** — uklonjeno "(privatno za posadu)"
- **Calendar refresh** — dodan useFocusEffect na stats tab
- **Season name u headeru** — dodan treći red s imenom sezone

### Stats Screen Improvements
- Renamed "PRIHOD" → "UKUPNI APA"
- Dodan PRIHOD sekcija s:
  - Radni dani (s izračunom dana × dnevnica)
  - Neradni dani (s izračunom dana × dnevnica)
  - Ostvareni prihod (samo prošli dani)
  - Očekivani prihod (cijela sezona, projekcija)
  - "Postavi dnevnice" link ako nisu konfigurirane

### Git Log (najnovije)
```
4bf6d7c fix: refresh calendar on tab focus, add income stats to stats screen
edd4768 chore: add existing Firestore indexes to local config
ad9c191 chore: add Firestore composite index for workDays query
2efb486 fix: display season name in home screen header
a2fc5fb feat: add expo-updates for OTA update support
ab8d3b1 fix: make guest count optional, fix keyboard overlap, remove redundant notes text
cf33d54 chore: add deploy:rules script to package.json
e1c656c fix: deploy Firestore rules for income settings and work days
78e743f chore: add Firebase CLI config (firebase.json, .firebaserc)
49e8368 fix: improve error handling in income settings save flow
```

---

## 🔶 U TIJEKU / POZNATI ISSUES

### Firestore composite index za workDays
- **Status:** Deployed, čeka kreiranje na Firebase strani (1-2 min)
- **Index:** workDays: seasonId ASC, date DESC
- **Provjeri:** Firebase Console → Firestore → Indexes

### Stats screen cleanup (agent radi)
- Ukloniti UKUPNI APA i TROŠKOVI boxeve
- Zadržati samo NAPOJNICE box (full width)
- Dodati per-day breakdown na RADNI/NERADNI DANI boxeve (dani × iznos dnevnice)

### EAS Preview Build
- **Status:** Pokrenut s expo-updates, čekati da završi
- **Nakon builda:** OTA updates rade s `eas update --branch preview`

---

## 🔴 NOVI FEATURES — NAVIGACIJA (PRIORITET: HIGH)

### Reorganizacija Bottom Navigation

**Trenutno:** Početna | Popis | Statistika | Postavke

**Novo (5 tabova):**
| Tab | Ikona | Sadržaj |
|-----|-------|---------|
| Popis | 📋 | Bookings lista (aktivni/arhivirani) |
| Pantry | 🍷 | Crew inventory management |
| Statistika | 📊 | Stats + Calendar |
| Zapisnici | 📝 | Defect Log + Wish List + Storage Map |
| Postavke | ⚙️ | Settings, profil, income, jezik |

**Home screen:** Premješten iz bottom nav u header. "AHOY!" logo postaje klikabilan (vodi na home dashboard) ili mali home icon u headeru.

**Implementacija:**
- Ažurirati `app/(main)/(tabs)/_layout.tsx`
- Kreirati nove tab screenove za Pantry i Zapisnici
- Home screen ostaje ali navigacija je iz headera, ne iz tab bara
- Svi postojeći linkovi na home moraju raditi

---

## 🔴 NOVI FEATURE — CREW PANTRY (PRIORITET: HIGH)

### Koncept
Crew na početku sezone kupuje artikle (vino, alkohol, itd.) od svojih novaca. Kad gost želi nešto od toga, crew "proda" iz APE po nabavnoj + markup. Pantry prati inventory, financije, i automatski kreira APA entries.

### Ekrani

#### Pantry Lista (glavni screen)
- Popis svih artikala
- Svaki artikl: ime, preostala količina, nabavna/prodajna cijena
- Status indikator: zeleno (ima) / žuto (malo, npr. <3) / crveno (nema)
- Gumb za dodavanje novog artikla
- Financijski summary na vrhu ili dnu

#### Dodaj Artikl
- **Ime:** free text (npr. "Plavac Mali Zlatan")
- **Kategorija:** vino / žestica / pivo / ostalo
- **Količina:** broj komada/boca
- **Nabavna cijena:** po komadu (€)
- **Markup:** postotak (10-30%, default 25%) — auto-izračun prodajne cijene
- **Tko je uložio:** odabir jednog ili više crew membera
  - Ako više → dijeli se jednako
  - Ako jedan → samo ta osoba
- Prodajna cijena prikazana kao info (nabavna × (1 + markup))

#### Prodaj iz Pantryja
- Odaberi artikl iz liste
- Unesi količinu za prodaju
- Odaberi booking (gost/charter) — dropdown aktivnih bookinga
- Potvrdi → automatski:
  1. Smanji stock
  2. Kreira APA entry za taj booking (količina × prodajna cijena)
  3. Bilježi zaradu

#### Financijski Dashboard (dio pantry screena)
- Ukupno uloženo (svi artikli × nabavna)
- Ukupno uloženo po crew memberu
- Ukupno prodano
- Zarada (ukupno prodano - nabavna vrijednost prodanih artikala)
- Po crew memberu: ulog, povrat uloga, udio u zaradi
- Preostala vrijednost (neprodani artikli po nabavnoj)

### Logika podjele
- Zarada se dijeli proporcionalno ulogu
- Primjer: Ti i kolega uložili po 48€ (6 boca × 8€). Prodano 8 boca po 10€ = 80€.
  - Povrat uloga: 8 × 8€ = 64€ (po 32€ svaki)
  - Zarada: 80€ - 64€ = 16€ (po 8€ svaki)
  - Svaki dobiva: 40€

### Kraj sezone
- Gumb "Prenesi zalihe u novu sezonu"
- Kopira preostale artikle s cijenama i vlasništvom
- Neprodano — crew se sam dogovara (fizička podjela boca)

### Firestore struktura
```
seasons/{seasonId}/pantry/{itemId}
  - name: string
  - category: 'wine' | 'spirits' | 'beer' | 'other'
  - quantity: number (preostalo)
  - originalQuantity: number (ukupno kupljeno)
  - purchasePrice: number (nabavna po komadu)
  - markupPercent: number
  - sellingPrice: number (izračunato)
  - investors: [{ userId: string, amount: number }]
  - createdAt, updatedAt

seasons/{seasonId}/pantrySales/{saleId}
  - pantryItemId: string
  - bookingId: string
  - quantity: number
  - sellingPrice: number (po komadu u trenutku prodaje)
  - totalAmount: number
  - createdAt
```

### Firestore Rules
- Svi season memberi mogu čitati pantry
- Svi season memberi mogu dodavati artikle i prodavati
- Samo creator ili kapetan može brisati/editirati artikl

---

## 🔴 NOVI FEATURE — ZAPISNICI (PRIORITET: HIGH)

Tri tipa zapisa pod jednim tabom, s podtabovima ili listom.

### 1. Defect Log 🔧 (Kapetanov zapisnik)

**Tko:** Samo kapetan kreira i editira  
**Ostali:** Crew vidi read-only

**Stavka:**
- Opis kvara/greške (text)
- Lokacija na brodu (free text, npr. "Gostinjska kabina 2, kupaonica")
- Prioritet: Hitno (crveno) | Normalno (žuto) | Nisko (sivo)
- Datum (automatski pri unosu)
- Foto(i) — upload via Firebase Storage (isti pattern kao receipt upload)
- Status: Prijavljeno → U tijeku → Riješeno

**Export:**
- Share kao PDF na WhatsApp ili email
- PDF sadrži: tablicu svih stavki + fotke
- Isti share pattern kao APA tablica na kraju tjedna

**Firestore:**
```
seasons/{seasonId}/defectLog/{entryId}
  - description: string
  - location: string
  - priority: 'high' | 'normal' | 'low'
  - status: 'reported' | 'in_progress' | 'resolved'
  - photos: string[] (Firebase Storage URLs)
  - createdBy: string (userId — mora biti kapetan)
  - createdAt, updatedAt
```

### 2. Wish List ✨ (Crew prijedlozi)

**Tko:** Svi crew memberi mogu dodavati  
**Vidljivost:** Svi vide sve

**Stavka:**
- Opis (text, npr. "Nova tava za palačinke, 28cm")
- Kategorija: Kuhinja | Servis | Paluba | Kabine | Ostalo
- Tko predlaže (automatski)
- Datum (automatski)
- Done toggle — kad se nabavi, prekriži se (strikethrough)

**Export:**
- Share kao PDF/lista na WhatsApp ili email (za ownera/charter kompaniju)

**Firestore:**
```
seasons/{seasonId}/wishList/{itemId}
  - description: string
  - category: 'kitchen' | 'service' | 'deck' | 'cabins' | 'other'
  - isDone: boolean
  - createdBy: string (userId)
  - createdAt, updatedAt
```

### 3. Storage Map 📦 (Zimska evidencija)

**Tko:** Svaki crew member vodi svoju listu  
**Vidljivost:** Visibility toggle (privatno ili vidljivo ostalima)  
**Editiranje:** Samo autor

**Stavka:**
- Što je spremljeno (text, npr. "Stolnjaci za vanjski stol, bijeli")
- Gdje — lokacija na brodu (free text, npr. "Ladica ispod kreveta, kabina 3")
- Količina (broj)
- Foto (opcionalno)
- Visibility: privatno / vidljivo posadi

**Prenosi se iz sezone u sezonu** kao referenca (gumb "Prenesi u novu sezonu")

**Firestore:**
```
seasons/{seasonId}/storageMap/{entryId}
  - item: string
  - location: string
  - quantity: number
  - photos: string[] (opcionalno)
  - isPublic: boolean (visibility toggle)
  - createdBy: string (userId)
  - createdAt, updatedAt
```

### Zapisnici — Firestore Rules
- **Defect Log:** Samo kapetan (role === 'captain') create/update/delete. Svi season memberi read.
- **Wish List:** Svi season memberi CRUD na svoje stavke. Svi read.
- **Storage Map:** Samo autor CRUD. Ostali read AKO je isPublic === true.

---

## 🟡 PREOSTALI TASKS (IZ ORIGINALNOG PLANA)

### i18n — Internacionalizacija (HR/EN)
- **Status:** Planirano
- Izbor jezika: onboarding + settings
- Default: HR
- Library: i18next + react-i18next
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

### OTA Updates (expo-updates)
- **Status:** Konfiguriran, čeka prvi build
- Preview: `eas update --branch preview --message "opis"`
- Production: `eas update --branch production --message "opis"`

### Firebase CLI
- **Status:** Funkcionalan, auth aktivan
- Rules deploy: `npm run deploy:rules` ili `npx firebase-tools deploy --only firestore:rules`
- Indexes deploy: `npx firebase-tools deploy --only firestore:indexes`
- firebase.json + .firebaserc u gitu

### Build Profiles (EAS)
- development → development channel
- preview → preview channel
- production → production channel

---

## 📋 PRIORITETI & REDOSLIJED IMPLEMENTACIJE

### Faza 1: Stabilizacija (ODMAH)
1. ~~Income bug fix~~ ✅
2. ~~Calendar refresh~~ ✅
3. ~~Stats improvements~~ ✅
4. Stats cleanup (ukloni nepotrebne boxeve) — U TIJEKU
5. Firestore index za workDays — DEPLOYED, čeka aktivaciju
6. Verify OTA updates rade nakon builda

### Faza 2: Navigacija + Pantry
1. Reorganizacija bottom navigation (5 tabova)
2. Home screen premješten u header
3. Pantry — CRUD artikala
4. Pantry — prodaja iz APE (auto APA entry)
5. Pantry — financijski dashboard
6. Pantry — prijenos zaliha u novu sezonu

### Faza 3: Zapisnici
1. Tab s podtabovima (Defect/Wish/Storage)
2. Defect Log (kapetan only, foto, status, PDF export)
3. Wish List (svi crew, done toggle, export)
4. Storage Map (per-user, visibility toggle, prijenos u novu sezonu)

### Faza 4: Polish & Launch
1. i18n (HR/EN)
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

---

*Zadnja izmjena: 2026-03-14*
