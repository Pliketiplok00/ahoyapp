# Ahoy — Product Brief v2

**Date:** 2026-02-18  
**Status:** Ready for development handoff

---

## 1. Vision & Problem Statement

### What This App Is

Ahoy is a **private, season-based operational tool for yacht crew**. It helps crew members survive the chaos of charter season by solving one core problem:

**The end-of-week nightmare:** Currently, one person (usually the stew) sits down the evening before guests depart, tries to reconstruct an entire week of expenses from scattered receipts, and inevitably discovers that €1,000 is missing because someone forgot to log the oyster excursion in Ston that was paid cash with no receipt.

### The Core Equation

```
Starting APA − All Receipts = Cash in Safe
```

If this equation balances at the end of the week, everyone sleeps well. The app exists to make this happen.

### What This App Is NOT

- ❌ Fleet management software
- ❌ Charter CRM
- ❌ Enterprise reporting tool
- ❌ Fiscalization system

---

## 2. Psychological Framework

The app operates on three levels:

| Level | Purpose | User State |
|-------|---------|------------|
| **Operational** | Survival | "I need to capture this receipt NOW" |
| **Financial** | Control | "Do the numbers add up?" |
| **Psychological** | Reflection & motivation | "How's the season going? When's my next day off?" |

### Three App Modes

The app should feel different depending on context:

- 🔥 **During booking** → Operational, minimal, fast
- 🌤 **Between bookings** → Contextual, overview-focused
- 🌅 **End of season** → Reflective, analytical

### Anti-Gamification Rules

This is NOT a fitness app. Crew already has enough pressure.

- ❌ No streaks
- ❌ No "You haven't added expenses today" notifications
- ❌ No leaderboards
- ❌ No achievement badges
- ❌ No push pressure

The app helps. It does not nag.

---

## 3. Roles & Permissions

### Role Definitions

| Role | Description |
|------|-------------|
| **Captain** | First onboarder. Admin privileges. Can be transferred. |
| **Editor** | Financial oversight. Can edit anyone's entries. Performs reconciliation. |
| **Crew Member** | Standard user. Can enter own expenses. |

One person can hold multiple roles (e.g., Captain + Editor).

### Permission Matrix

| Action | Captain | Editor | Crew Member |
|--------|---------|--------|-------------|
| Create workspace | ✓ (first) | ✗ | ✗ |
| Edit workspace settings | ✓ | ✗ | ✗ |
| Invite crew members | ✓ | ✓ | ✓ |
| Remove crew members | ✓ | ✗ | ✗ |
| Transfer Captain role | ✓ | ✗ | ✗ |
| Create booking | ✓ | ✓ | ✓ |
| Delete booking | ✓ | ✓ | ✓ |
| Enter APA amount | ✓ | ✓ | ✓ |
| Modify APA amount | ✓ | ✓ | ✓ |
| Enter own expenses | ✓ | ✓ | ✓ |
| Delete own expenses | ✓ | ✓ | ✓ |
| Edit others' expenses | ✗ | ✓ | ✗ |
| Delete others' expenses | ✗ | ✓ | ✗ |
| Perform reconciliation | ✗ | ✓ | ✗ |
| Upload preference PDF | ✓ | ✓ | ✓ |
| Edit shopping list | ✓ | ✓ | ✓ |
| Enter tip | ✓ | ✓ | ✓ |
| Configure tip split | ✓ | ✗ | ✗ |
| Export data | ✓ | ✓ | ✓ |

---

## 4. Data Model

### Season

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Name | String | Yes | e.g., "Summer 2026" |
| Start date | Date | Yes | |
| End date | Date | Yes | System warns if booking exceeds this |
| Currency | Enum | Yes | One currency per season |
| Boat name | String | Yes | |
| Tip split type | Enum | Yes | "equal" or "custom" |
| Tip split config | JSON | If custom | e.g., {"user1": 25, "user2": 50, "user3": 25} |

### Booking

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Arrival date | Date | Yes | |
| Departure date | Date | Yes | Min 24h after previous booking (warning if overlap) |
| Departure marina | String | Yes | Default: "Kaštela" |
| Arrival marina | String | Yes | Default: "Kaštela" |
| Guest count | Integer | Yes | |
| Notes | Text | No | **Crew-private** — never visible to guests |
| Preference PDF | File | No | Status: has / doesn't have / waiting |
| Status | Enum | Auto | Upcoming → Active → Completed → Archived / Cancelled |
| APA received | Decimal | Yes | Can be increased or decreased |
| Tip | Decimal | No | Editable until season end |

### Crew Score Card

Internal gamification system for crew. Captain awards points to crew members during each booking.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Booking ID | Reference | Yes | One score card per booking |
| To User | Reference | Yes | Which crew member receives points |
| Points | Enum | Yes | -3, -2, -1, +1, +2, +3 |
| Reason | Text | No | Short description (e.g., "Late to dock", "Saved the day") |
| Created At | Timestamp | Auto | When entry was made |

**Rules:**
- **Only Captain** can add score entries
- Points are **fixed values**: -3, -2, -1, +1, +2, +3
- **No editing or deleting** — compensate with opposite points if needed
- Captain can give points to **any crew member including themselves**
- Score visible to **all crew** (transparency)

**Point Guidelines (crew decides, examples):**

| Points | Meaning | Example |
|--------|---------|---------|
| +3 | Major achievement | Prevented serious incident, exceptional guest feedback |
| +2 | Good job | Fixed something important, went above and beyond |
| +1 | Small win | Helpful, positive attitude, minor good deed |
| -1 | Minor issue | Small mistake, forgot something minor |
| -2 | Notable problem | Repeated mistake, caused delay |
| -3 | Major issue | Serious mistake, guest complaint |

**End of Booking:**
- App shows **leaderboard** for that booking
- "Winner" = highest score, "Loser" = lowest score
- Crew decides consequences (e.g., loser buys dinner) — app doesn't enforce

**Season Statistics:**
- **Pie chart** — total points per crew member across all bookings
- **🏆 Trophy badge** — crew member with most booking wins
- **😈 Horns badge** — crew member with most booking losses
- **Average score** — per booking trend

### Marina Abbreviations

When displaying route on booking cards, use abbreviations:

| Marina | Abbreviation |
|--------|--------------|
| Kaštela | (don't show — it's default) |
| Split | ST |
| Dubrovnik | DBK |
| Zadar | ZD |
| Šibenik | ŠI |
| Trogir | TG |
| Hvar | HV |
| Other | First 2-3 letters |

**Display logic:**
- If both marinas = Kaštela → no badge
- If one marina ≠ Kaštela → show that marina's abbreviation
- If both ≠ Kaštela → show "DBK→ST" format

### Booking Card Display Priority

When showing booking card (home screen, list), display in this order:

1. **Status badge** — "u toku" (green) or "za X d." (orange)
2. **Guest count** — "X guests"
3. **Marina badge** — only if not Kaštela
4. **Pref list icon** — 📎 (has) or ⚠️ (missing)
5. **Dates** — "DD.MM. → DD.MM." format
6. **Notes** — truncated if too long, shows full text

### Expense

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Amount | Decimal | Yes | OCR attempts extraction; user confirms |
| Date | Date | Yes | Auto-captured; user can modify |
| Category | Enum | Yes | See Categories section |
| Merchant | String | Yes | OCR attempts extraction; user confirms |
| Note | Text | No | |
| Receipt photo | Image | Conditional | Required for standard entry |
| Type | Enum | Auto | "receipt" or "no-receipt" |
| Author | User ref | Auto | Person who created entry |
| Location | Coordinates | Auto | Captured at creation |
| Timestamp | DateTime | Auto | Captured at creation |

### Shopping List Item

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Name | String | Yes | |
| Purchased | Boolean | No | Default: false |
| Purchased by | User ref | Auto | Set when marked purchased |

### Manual Work Day (Private)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Start date | Date | Yes | |
| End date | Date | Yes | Can be same as start for single day |
| Rate type | Enum | Yes | "guest" or "non-guest" |
| Note | Text | No | e.g., "Transfer Palma → Split" |
| Owner | User ref | Auto | Private to this user |

### User

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Email | String | Yes | Used for magic link auth |
| Name | String | Yes | |
| Color | Enum | Auto | Assigned from 20 predefined colors |
| Role(s) | Enum[] | Yes | Captain / Editor / Crew Member |
| Guest day rate | Decimal | No | Private - for personal income calc |
| Non-guest day rate | Decimal | No | Private - for personal income calc |
| Contract start | Date | No | Private - when user's contract begins |
| Contract end | Date | No | Private - when user's contract ends |

---

## 5. Expense Flow

### The Core Insight

The problem isn't budgets or allocations. The problem is **capturing receipts in the moment** so nothing is forgotten.

### Two Entry Types

**1. Quick Capture (with receipt)**
```
Open app → Tap [+] → 📸 Photo → Done (5 seconds)

Later (optional):
Review → Confirm/edit OCR results → Add category, merchant, note
```

**2. No-Receipt Entry**
```
Open app → Tap [+] → "No receipt" → Enter amount + description → Done (10 seconds)

App generates digital paragon with:
- User name
- Timestamp
- Amount
- Description
```

### Visibility

- All expenses are visible to all crew members immediately
- Your name is attached to your entry = your responsibility
- No draft/submit/approve workflow needed

### Mandatory Fields

Before an expense is considered "complete":
- Amount ✓
- Date ✓
- Category ✓
- Merchant ✓

If OCR fails to extract any of these, user must manually input.

---

## 6. Reconciliation Flow

### When It Happens

Evening before guest departure, after final expenses (usually fuel).

### The Process

```
1. Editor opens Reconciliation screen for current booking

2. App displays:
   ┌─────────────────────────────────┐
   │ Starting APA:        €10,000   │
   │ Total expenses:       €8,547   │
   │ ─────────────────────────────  │
   │ Expected cash in safe: €1,453  │
   └─────────────────────────────────┘

3. Editor counts physical cash, enters actual amount

4. App shows result:
   
   If match:    ✓ Balanced
   If mismatch: ⚠ Difference: €XX
   
5. If mismatch → Crew resolves (not app's problem)
   
6. Guests receive expense summary + cash return

7. Next morning: guests depart → booking auto-completes
```

### Rules

- Editor can re-enter cash amount if mistake was made
- Reconciliation must happen BEFORE booking completes
- Tip is NOT part of reconciliation (entered separately, often after)

---

## 7. Booking Lifecycle

```
                    ┌─────────────┐
                    │   UPCOMING  │
                    └──────┬──────┘
                           │ arrival date reached
                           ▼
                    ┌─────────────┐
                    │   ACTIVE    │
                    └──────┬──────┘
                           │ departure date passed
                           ▼
                    ┌─────────────┐
        ┌───────────│  COMPLETED  │
        │           └──────┬──────┘
        │                  │ season ends
        │                  ▼
        │           ┌─────────────┐
        │           │  ARCHIVED   │
        │           └─────────────┘
        │
        │ cancelled before/during
        ▼
  ┌─────────────┐
  │  CANCELLED  │
  └─────────────┘
```

### Status Rules

| Status | APA | Expenses | Tip | Shopping | Notes |
|--------|-----|----------|-----|----------|-------|
| Upcoming | Editable | Editable | Editable | Editable | Pre-provisioning allowed |
| Active | Editable | Editable | Editable | Editable | |
| Completed | Locked | Locked | **Editable** | Read-only | Tip often comes after checkout |
| Archived | Locked | Locked | Locked | Read-only | Season ended |
| Cancelled | N/A | Deleted | N/A | Deleted | Everything removed |

### Booking Deletion Rules

- **Can delete:** Before booking starts, or on first day
- **Cannot delete:** After first day
- **Deletion removes:** All associated expenses, shopping list items
- **Alternative:** Mark as Cancelled (preserves history that booking existed)

### Overlap Handling

- Minimum 24 hours between bookings (recommended)
- If user creates overlapping booking → warning dialog → user confirms → allowed
- Both bookings show as Active during overlap period

---

## 8. Season Lifecycle

### Creation

First onboarder creates workspace:
1. Boat name
2. Season name
3. Start date
4. End date
5. Currency

### End of Season

When end date passes:
- All bookings → Archived
- All data → read-only
- Export available
- New season = new entity

### Season Extension Warning

If user creates booking that exceeds season end date:
> "This booking extends past the season end date (Oct 31). Continue anyway?"

---

## 9. APA Management

### Initial Entry

- Anyone can enter starting APA
- Usually whoever picks up cash from charter office

### Modifications

| Action | Allowed | Example |
|--------|---------|---------|
| Increase | ✓ | Guests give additional cash mid-charter |
| Decrease | ✓ | Correction of entry error |

App tracks total as sum of all APA entries for the booking.

---

## 10. Shopping List

### Purpose

Crew provisioning before and during charter. Separate from expenses.

### Functionality

- Any crew member can add items
- Any crew member can delete items
- Any crew member can mark as purchased
- Purchased items show strikethrough + purchaser's color
- No automatic link to expenses (manual for now)

### Display

```
☐ 6L mineral water
☐ Fresh bread (daily)
̶☑̶ ̶O̶l̶i̶v̶e̶ ̶o̶i̶l̶ ̶2̶L̶ ████ (Marko)
̶☑̶ ̶P̶r̶o̶s̶e̶c̶c̶o̶ ̶x̶6̶ ████ (Ana)
```

---

## 11. Preference List

### What It Is

PDF document from charter company containing guest preferences:
- Dietary requirements & allergies
- Activity preferences
- Special requests
- Restaurant reservations

### In App

- Attached to booking as PDF file
- Status indicator: Has / Doesn't have / Waiting
- Anyone can upload
- Can be replaced with updated version
- Opens in native PDF viewer

### Why It Matters

Without pref list, crew cannot:
- Plan provisioning
- Make reservations
- Prepare for guest needs

Status visibility helps crew know if they're ready or still waiting.

---

## 12. Tip

### Basic Entry

- One numeric field per booking
- Anyone can enter/edit
- Visible to all crew

### Timing

- Usually given at checkout or last evening
- Often entered AFTER booking is Completed
- Locked only when season ends (Archived)

### Tip Split (Captain only)

Captain defines how tips are divided among crew. This is set once for the entire season.

**Two options:**

| Option | Behavior |
|--------|----------|
| **Equally** | App auto-calculates equal shares (e.g., 3 crew = 33.33% each) |
| **Custom %** | Captain enters percentage for each crew member |

**Custom % form:**
```
┌─────────────────────────────────┐
│  TIP SPLIT SETTINGS             │
│  ─────────────────────────────  │
│  Ana (Captain):     25%         │
│  Marko (Chef):      50%         │
│  Petra (Stew):      25%         │
│  ─────────────────────────────  │
│  Total:            100% ✓       │
│                                 │
│  [Save]                         │
└─────────────────────────────────┘
```

**Rules:**
- Percentages must sum to exactly 100% (block save if not)
- If crew member added mid-season → Captain must update split
- If crew member removed → Captain must update split
- Each crew member's calculated share feeds into their Personal Income

**Visibility:**
- All crew can see the split configuration
- All crew can see calculated amounts per person after tip is entered

---

## 13. Personal Income (Private Module)

### Purpose

Let crew members track their own earnings privately. Everything in this module is visible ONLY to the owner.

### Rate Settings (per user)

| Field | Description | Example |
|-------|-------------|---------|
| Guest day rate | Earnings per charter day | €210 |
| Non-guest day rate | Earnings per off day (within contract) | €105 |
| Contract start | When user's season contract begins | Apr 1 |
| Contract end | When user's season contract ends | Oct 31 |

### Automatic Calculations

**Guest Days:**
- App counts all days where a booking is Active
- Multiplied by guest day rate
- Example: 35 booking days × €210 = €7,350

**Non-Guest Days:**
- App counts all "gaps" between bookings within contract period
- Multiplied by non-guest day rate
- Example: Booking ends Jun 15, next starts Jun 20 = 4 days × €105 = €420

**Tip Share:**
- Based on tip split configured by Captain
- Calculated automatically when tip is entered
- Example: €2,000 tip × 25% share = €500

### Manual Work Days

For days worked outside of bookings (transfers, prep, etc.):

```
┌─────────────────────────────────┐
│  [+ Add work days]              │
│  ─────────────────────────────  │
│  Date(s): Jun 10 - Jun 12       │
│  Type: ○ Guest rate  ● Non-guest│
│  Note: Transfer Palma → Split   │
│                                 │
│  [Save]                         │
└─────────────────────────────────┘
```

**Fields:**
- Date or date range
- Rate type (guest rate or non-guest rate)
- Note (optional, e.g., "Boat prep", "Transfer")

### Earnings Dashboard

```
┌─────────────────────────────────────┐
│  MY EARNINGS                        │
│  ─────────────────────────────────  │
│  Guest days:        €7,350 (35 days)│
│  Non-guest days:    €1,260 (12 days)│
│  Manual work days:  €630 (3 days)   │
│  Tips:              €1,875          │
│  ─────────────────────────────────  │
│  TOTAL:             €11,115         │
│                                     │
│  Season progress:   ████████░░ 78%  │
│  Projected total:   €14,250         │
└─────────────────────────────────────┘
```

### Calculated Stats

| Stat | Calculation |
|------|-------------|
| Total earned | Sum of all categories |
| Days worked | Guest + non-guest + manual |
| Average daily | Total ÷ days worked |
| Projected total | Based on season progress |

### Privacy

- **Completely private** — no other crew member can see
- Not visible to Captain or Editor
- Not part of shared data layer
- Not included in any exports

---

## 14. Categories

### V1 Categories (Fixed)

| Category | Examples |
|----------|----------|
| Food & Beverage | Groceries, restaurants, provisions |
| Fuel | Boat fuel, tender fuel |
| Mooring | Marina fees, buoy fees |
| Other | Everything else |

### Future

Structure should allow custom categories in later versions.

---

## 15. Home Screen (Booking Radar)

### Philosophy

Home is not analytics. Home is **operational awareness**.

### Layout

```
┌─────────────────────────────────────┐
│         ACTIVE BOOKING              │
│  ┌─────────────────────────────┐    │
│  │ Day 4 of 7                  │    │
│  │ 3 days left                 │    │
│  │ Guests: 8                   │    │
│  │ APA: €10,000 | Spent: €6,234│    │
│  └─────────────────────────────┘    │
│                                     │
│         NEXT BOOKING                │
│  ┌─────────────────────────────┐    │
│  │ Johnson Family | Jun 15-22  │    │
│  │ Pref list: ✓                │    │
│  └─────────────────────────────┘    │
│                                     │
│  ─────────────────────────────────  │
│  🟢 2 days off after this booking   │
│  📊 Season 62% complete             │
│  🧭 4 bookings left                 │
└─────────────────────────────────────┘
```

### Horizon Info

One-line contextual information:
- `🟢 X days off after this booking` — if gap exists
- `🔁 Back-to-back booking` — if no gap
- `🧭 X bookings left this season`
- `📊 Season X% complete`

These are **psychological stabilizers**, not features.

### Empty States

| Scenario | Display |
|----------|---------|
| No bookings | "No bookings yet" + Create button |
| All completed, none upcoming | "No upcoming bookings" |
| Between bookings | Next booking becomes primary |

---

## 16. Season Insights

### Purpose

Reflective mode for when crew has downtime. "How's the season going?"

### Shared Stats (visible to all)

| Stat | Description |
|------|-------------|
| Total APA received | Sum across all bookings |
| Total spent | Sum of all expenses |
| Total tips | Sum across all bookings |
| Best tip booking | Highest single tip |
| Lowest spend booking | Most efficient charter |
| Average tip per guest | Total tips ÷ total guests |
| Top merchants | Most frequent expense destinations |
| Booking comparison | Side-by-side stats |

### Tone

These are **insights, not judgments**. "Fuel heavy season" is an observation, not criticism.

---

## 17. Notifications

### Philosophy

Minimal. Non-aggressive. Helpful.

### Implemented

| Notification | Trigger | Message |
|--------------|---------|---------|
| Closing reminder | 1 day before departure | "Checkout tomorrow — is everything logged?" |
| Booking starts | 1 day before arrival | "New booking starts tomorrow" |
| Day off coming | Day before gap | "Day off tomorrow! 🎉" |
| Pref list received | Upload detected | "Preference list uploaded for [booking]" |

### NOT Implemented (Anti-Patterns)

- ❌ "You haven't logged expenses today"
- ❌ "Marko added an expense"
- ❌ Daily summaries
- ❌ Achievement notifications

---

## 18. Offline Behavior

### Core Requirement

App must work on boats with poor/no connectivity.

### Offline Capabilities

| Action | Offline Support |
|--------|-----------------|
| Create booking | ✓ Queued |
| Capture expense (photo) | ✓ Saved locally |
| No-receipt entry | ✓ Saved locally |
| View own data | ✓ Cached |
| Shopping list | ✓ Local changes queued |
| OCR processing | Queued for sync |

### Sync Behavior

When connection restored:
1. Upload queued photos
2. Process OCR queue
3. Sync all local changes
4. Pull remote changes

### UI Requirement

Clear sync status indicator:
- 🟢 Synced
- 🟡 Pending sync (X items)
- 🔴 Offline

---

## 19. Onboarding Flow

### New User (First Onboarder)

```
1. Download app
2. Email magic link login
3. Create Workspace:
   - Boat name
   - Season name
   - Season dates
   - Currency
4. Auto-assigned: Captain role
5. Invite crew members (email)
```

### Joining User

```
1. Receive email invite
2. Download app
3. Email magic link login
4. Auto-joined to workspace
5. Assigned color from palette
6. Default role: Crew Member
```

### User Colors

- 20 predefined colors
- Assigned automatically at onboarding
- Used for shopping list "purchased by" indicator

---

## 20. Export

### Purpose

Export data for charter company accounting and record-keeping.

### Availability

- Any crew member can export
- Available per booking

### Format

| Export Type | Format | Contents |
|-------------|--------|----------|
| Expense table | Excel (.xlsx) preferred, CSV fallback | All expenses with full details |
| Receipt images | ZIP | All photos for booking |
| Combined | ZIP | Excel + images folder |

### CRITICAL: Croatian Formatting

All exports MUST use HR locale:
- Dates: `DD.MM.YYYY.` (e.g., 15.11.2026.)
- Numbers: comma decimal, dot thousands (e.g., 1.234,56)
- Currency: `1.200,00 €`
- CSV delimiter: semicolon `;` (not comma)

**US formatting breaks Croatian accounting software imports.**

### Send via Email

User can send export directly via email:
1. Tap "Export" on booking
2. Choose what to include (table, receipts, or both)
3. Tap "Send via Email"
4. Native mail app opens with attachments ready
5. User enters recipient email and sends

This uses the device's default mail client (Gmail, Apple Mail, etc.).

### Ideal

Google Docs integration for direct upload (future consideration).

---

## 21. Edge Cases & Rules Summary

### Booking Rules

| Rule | Behavior |
|------|----------|
| Overlapping dates | Warning → user confirms → allowed |
| Booking extends past season | Warning → user confirms → allowed |
| Delete booking with expenses | All expenses deleted with booking |
| Delete after day 1 | Not allowed |

### Expense Rules

| Rule | Behavior |
|------|----------|
| Missing mandatory field | Expense marked incomplete, prompt to finish |
| OCR fails | User manually enters |
| Edit others' expenses | Editor only |
| Delete own expense | Allowed |
| Delete others' expense | Editor only |

### APA Rules

| Rule | Behavior |
|------|----------|
| Multiple entries | Summed together |
| Negative entry | Allowed (for corrections) |
| Edit after Completed | Not allowed |

### Role Rules

| Rule | Behavior |
|------|----------|
| Transfer Captain | Only current Captain can do this |
| Remove Editor from crew | Must assign new Editor first |
| Last crew member | Cannot leave (must delete workspace) |

---

## 22. Future Considerations (Out of Scope for V1)

- Custom expense categories
- Shopping list → expense auto-link
- Multi-currency support within season
- Guest communication features
- Integration with charter management systems
- Crew scheduling
- Inventory management

---

## Appendix: Glossary

| Term | Definition |
|------|------------|
| APA | Advance Provisioning Allowance — cash given by guests for expenses |
| Booking | One charter period (guest arrival to departure) |
| Charter | The rental of the yacht by guests |
| Crew | Staff working on the yacht |
| Pref list | Preference list — guest requirements document |
| Provisioning | Purchasing supplies before/during charter |
| Reconciliation | Matching expenses to cash at end of booking |
| Season | Working period (typically May–October in Med) |
| Stew | Stewardess — crew member handling interior/service |
| Tip | Gratuity from guests at end of charter |
