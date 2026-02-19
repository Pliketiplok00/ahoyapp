# CLAUDE.md — OBAVEZNA PRAVILA ZA AHOYAPP

**PROČITAJ CIJELI OVAJ FILE PRIJE BILO KAKVOG RADA.**
**AKO PREKRŠIŠ BILO KOJE PRAVILO → STOP → JAVI LJUDSKOM NADZORNIKU.**

---

## 🛑 STOP UVJETI

ODMAH ZAUSTAVI RAD ako:

1. `npm run precheck` NE PROLAZI
2. Nema session loga za danas (`docs/logs/YYYY-MM-DD.md`)
3. Nisi pročitao relevantnu dokumentaciju za trenutni task
4. Nemaš TEST PLAN napisan prije kodiranja
5. Pokušavaš commitati bez testova
6. Nisi siguran što radiš — PITAJ, ne pretpostavljaj

---

## 📚 OBAVEZNA DOKUMENTACIJA

Sva dokumentacija je u `/docs` folderu. **MORAŠ pročitati prije rada:**

| Dokument | Lokacija | Kada čitati |
|----------|----------|-------------|
| **Product Brief** | `docs/Ahoy_Brief_v2.md` | Prije SVAKE nove faze — ŠTO gradimo |
| **Tech Spec** | `docs/Ahoy_Tech_Spec.md` | Prije SVAKOG tehničkog taska — KAKO gradimo |
| **Screen Map** | `docs/Ahoy_Screen_Map.md` | Prije SVAKOG UI taska — kako izgleda |
| **Developer Guide** | `docs/Ahoy_Developer_Guide.md` | GOLDEN RULES, proces rada, standardi |
| **Project Plan** | `docs/Ahoy_Project_Plan.md` | Taskovi, faze, što je sljedeće |
| **Claude Instructions** | `docs/Ahoy_Claude_Instructions.md` | Detaljne upute po fazama |

### Ključne sekcije koje MORAŠ znati:

**Developer Guide:**
- §1 Work Session Structure — kako početi/završiti dan
- §2 Session Log Format — template za logove
- §3 Before Starting Any Task — audit checklist
- §4 Git Commit Standards — format poruka
- §5 Testing Standards — TDD ciklus
- §6 Code Documentation Standards — JSDoc, README

**Tech Spec:**
- §1 Locale & Formatting — **KRITIČNO** HR format za sve
- §2-4 Stack, Architecture, Folder Structure
- §5-6 Config Files, Type Definitions
- §8 Hooks Architecture — pattern za hookove
- §9 Offline Strategy — kako radi offline

**Product Brief:**
- §3-4 Roles, Data Model — tko što može
- §5-6 Expense Flow, Reconciliation — core flows
- §7 Booking Lifecycle — statusi
- §20 Export — HR formatiranje KRITIČNO

---

## ✅ POČETAK SVAKE SESIJE

Slijedi TOČNO ovim redoslijedom:

```
KORAK 1: PROVJERI PRETHODNU SESIJU
─────────────────────────────────
$ cat docs/logs/$(date -v-1d +%Y-%m-%d).md 2>/dev/null || echo "Nema jučerašnjeg loga"
→ Pročitaj što je napravljeno, što je ostalo

KORAK 2: PROVJERI STANJE PROJEKTA
─────────────────────────────────
$ git status
$ git log --oneline -5
$ npm run precheck

→ Ako precheck FAILA → STOP → popravi prvo

KORAK 3: KREIRAJ DANAŠNJI SESSION LOG
─────────────────────────────────────
$ npm run newday   (ili ručno kreiraj docs/logs/YYYY-MM-DD.md)

→ Upiši plan za danas PRIJE kodiranja

KORAK 4: PROČITAJ PROJECT PLAN
──────────────────────────────
$ cat docs/Ahoy_Project_Plan.md | head -100

→ Pronađi trenutnu fazu i sljedeći task

KORAK 5: AUDIT DOKUMENTACIJE
────────────────────────────
Za trenutni task, pročitaj:
- Relevantnu sekciju Product Brief
- Relevantnu sekciju Tech Spec
- Relevantne ekrane u Screen Map

→ Napiši u chat: "AUDIT COMPLETE: Pročitao [dokumenti]"

KORAK 6: NAPIŠI TEST PLAN
─────────────────────────
Prije BILO KAKVOG koda, napiši:
- Koje testove ćeš napisati
- Koje edge cases pokriti

→ Napiši u chat: "TEST PLAN: [testovi]"

KORAK 7: SADA MOŽEŠ KODIRATI
```

---

## 🧪 TESTIRANJE — NEMA IZUZETAKA

### Pravilo: Ako nema testa, ne postoji.

```
SVAKI novi file MORA imati test file:
  src/features/booking/hooks/useBooking.ts
  src/features/booking/hooks/useBooking.test.ts  ← OBAVEZNO

SVAKI commit MORA uključiti testove:
  ❌ "feat(booking): add date validation"
  ✅ "feat(booking): add date validation - 5 tests"

PRIJE SVAKOG COMMITA:
  $ npm test
  → Ako FAILA → NE COMMITAJ → popravi testove
```

### Što testirati (prema Developer Guide §5):

| Sloj | Što testirati | Primjer |
|------|---------------|---------|
| Utils | Pure funkcije | formatDate, formatCurrency |
| Hooks | State changes | useBookings, useAuth |
| Components | Renderiranje, interakcije | BookingCard, Button |
| Services | API pozivi, transformacije | bookingService |

---

## 📝 COMMIT STANDARDI

### Format (Developer Guide §4):

```
<type>(<scope>): <opis> - <broj testova> tests

Tipovi:
- feat     = nova funkcionalnost
- fix      = bug fix
- test     = dodavanje testova
- docs     = dokumentacija
- refactor = refaktoring bez promjene funkcionalnosti
- chore    = maintenance

Primjeri:
✅ feat(booking): add marina selection - 3 tests
✅ fix(auth): handle expired token - 2 tests
✅ test(utils): add formatting tests - 12 tests
✅ docs(booking): add README

❌ feat(booking): add marina selection  ← NEMA TESTOVA
❌ fix stuff                            ← NEJASAN OPIS
❌ update                               ← BEZNAČAJNO
```

### Frekvencija:
- COMMIT svakih 30-60 minuta
- COMMIT prije pauze
- COMMIT prije riskatne promjene
- NIKAD ne idi spavati s uncommitted promjenama

---

## 🇭🇷 HR FORMATIRANJE — KRITIČNO

**SVE VRIJEDNOSTI MORAJU KORISTITI HRVATSKI FORMAT:**

```typescript
// DATUMI
✅ "15.11.2026."
❌ "11/15/2026"
❌ "2026-11-15"

// BROJEVI
✅ "1.234,56"
❌ "1,234.56"

// VALUTA
✅ "1.234,56 €"
❌ "€1,234.56"

// VRIJEME
✅ "14:30"
❌ "2:30 PM"

// CSV DELIMITER
✅ točka-zarez (;)
❌ zarez (,)
```

**UVIJEK koristi utility funkcije iz `src/utils/formatting.ts`:**
- `formatDate(date)` → "15.11.2026."
- `formatNumber(num)` → "1.234,56"
- `formatCurrency(amount)` → "1.234,56 €"

**NIKAD hardkodiraj formate direktno u komponente!**

---

## 📁 STRUKTURA FEATURE FOLDERA

Svaki feature MORA imati ovu strukturu (Tech Spec §4):

```
src/features/[feature]/
├── README.md              ← OBAVEZNO — dokumentacija featurea
├── index.ts               ← Public exports
├── types.ts               ← TypeScript tipovi (ako nije u models.ts)
├── components/
│   ├── Component.tsx
│   └── Component.test.tsx ← TEST OBAVEZAN
├── hooks/
│   ├── useHook.ts
│   └── useHook.test.ts    ← TEST OBAVEZAN
└── services/
    ├── service.ts
    └── service.test.ts    ← TEST OBAVEZAN
```

### README template za feature:

```markdown
# [Feature Name]

## Overview
[Što ovaj feature radi]

## Components
| Component | Purpose |
|-----------|---------|

## Hooks
| Hook | Purpose |
|------|---------|

## Services
| Service | Purpose |
|---------|---------|

## Data Flow
[Opis kako podaci teku]

## Related Docs
- [Link na Product Brief sekciju]
- [Link na Tech Spec sekciju]
- [Link na Screen Map sekciju]
```

---

## 🔄 PRIJE SVAKE NOVE FAZE

**OBAVEZNI AUDIT CHECKLIST:**

```markdown
## Phase [X] Audit

### 1. Dokumentacija pročitana
- [ ] Product Brief: §[relevantne sekcije]
- [ ] Tech Spec: §[relevantne sekcije]
- [ ] Screen Map: §[relevantni ekrani]

### 2. Razumijem scope
- [ ] Mogu objasniti feature u jednoj rečenici: "________________"
- [ ] Znam koje ekrane trebam napraviti
- [ ] Znam koje komponente trebam
- [ ] Znam koje hookove trebam
- [ ] Znam koje servise trebam

### 3. Test plan
- [ ] Znam koje testove trebam napisati
- [ ] Znam koje edge cases pokriti

### 4. Pitanja
- [ ] Nemam pitanja ILI sam ih zapisao za ljudski review

### 5. Spreman
- [ ] Znam točno što prvo napraviti
```

---

## 📊 SESSION LOG FORMAT

Lokacija: `docs/logs/YYYY-MM-DD.md`

```markdown
# Session Log: YYYY-MM-DD

## Session Info
- **Developer:** Claude Code
- **Start time:** HH:MM
- **End time:** TBD
- **Branch:** [branch name]

## Precheck Status
- `npm run typecheck`: PASS/FAIL
- `npm run lint`: PASS/FAIL
- `npm test`: PASS/FAIL (X passing)
- App runs: YES/NO

## Plan for Today
- [ ] Task 1
- [ ] Task 2

## Audit
AUDIT COMPLETE: Pročitao [dokumenti]
TEST PLAN: [testovi koje ću napisati]

## Progress Log

### HH:MM - [Što radim]
- Detalji
- Commit: `abc1234` - "message"

## Commits Today
| Hash | Message |
|------|---------|
| abc1234 | feat(x): description - N tests |

## End of Day Status
- **Completed:** 
- **Not completed:** 
- **Blockers:** 
- **Next session:** 

## Test Summary
- Total tests: X
- Passing: X
- New tests added: X
```

---

## 🚫 ZABRANJENO

1. **Hardcoded vrijednosti** — koristi config iz `src/config/`
2. **Console.log u produkcijskom kodu** — samo za debugging, ukloni prije commita
3. **Any type** — uvijek definiraj TypeScript tipove
4. **Commit bez testova** — svaki commit MORA imati testove
5. **Rad bez session loga** — uvijek prvo log, pa kod
6. **Preskakanje faza** — slijedi Project Plan redoslijed
7. **Pretpostavljanje** — ako nisi siguran, PITAJ

---

## 🆘 KAD SI ZAPEO

Ako si zapeo više od 15 minuta:

```markdown
## STUCK: [Kratki opis]

**Što pokušavam:**
[Jedna rečenica]

**Što se događa:**
[Opis problema]

**Error message:**
```
[Točna greška]
```

**Što sam probao:**
1. [Pokušaj 1]
2. [Pokušaj 2]

**Moja hipoteza:**
[Što mislim da je problem]

**Sljedeći korak:**
[Što ću probati ili "čekam ljudski review"]
```

Zapiši ovo u session log i nastavi s drugim taskom.

---

## ✔️ DEFINITION OF DONE

Task je ZAVRŠEN tek kad:

```
KOD
[ ] Prati strukturu projekta (Tech Spec §4)
[ ] Ima TypeScript tipove (nema `any`)
[ ] Nema console.log
[ ] Ima JSDoc komentare
[ ] Koristi HR formatiranje za datume/brojeve

TESTOVI
[ ] Test file postoji
[ ] Svi testovi PROLAZE
[ ] Edge cases pokriveni

DOKUMENTACIJA
[ ] README.md za feature (ako novi feature)
[ ] Session log ažuriran

GIT
[ ] Commit s pravilnom porukom
[ ] Poruka uključuje broj testova
[ ] Push na remote
```

---

## 🔧 NPM SCRIPTS

```bash
# OBAVEZNO prije SVAKOG rada
npm run precheck      # typecheck + lint + test

# Pomoćni
npm run newday        # kreira današnji session log
npm run typecheck     # samo TypeScript provjera
npm run lint          # samo lint
npm test              # samo testovi
npm test -- --watch   # testovi u watch modu
npm start             # pokreni app
```

---

## 📋 QUICK REFERENCE

### Početak dana:
1. `cat docs/logs/YYYY-MM-DD.md` (jučerašnji)
2. `npm run precheck`
3. `npm run newday`
4. Pročitaj Project Plan
5. Audit dokumentacije
6. TEST PLAN
7. Kodiraj

### Tijekom rada:
- Commit svakih 30-60 min
- `npm test` prije svakog commita
- Update session log

### Kraj dana:
1. `npm run precheck` — MORA prolaziti
2. Commit sve promjene
3. Push na remote
4. Update session log s progressom
5. Update Project Plan checkboxes

---

## 🎯 ZLATNA PRAVILA (Developer Guide §1)

1. **Ako nije dokumentirano, ne postoji.**
2. **Ako nije testirano, ne radi.**
3. **Ako nije ucommitano, nije se dogodilo.**
4. **Kodiraj za developera koji dolazi poslije tebe — pretpostavi da ne zna ništa.**

---

**SADA PROČITAJ `docs/Ahoy_Project_Plan.md` I PRONAĐI TRENUTNI TASK.**
