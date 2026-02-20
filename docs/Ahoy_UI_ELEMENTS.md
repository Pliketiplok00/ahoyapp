# AHOY — UI Elements & Screen Inventory
> All screens, sections, and components with design specs

---

## Screens

| Screen Key | File | Entry Point |
|------------|------|-------------|
| `home` | `HomeScreen.tsx` | Tab bar — Anchor icon |
| `bookings` | `BookingsScreen.tsx` | Tab bar — Calendar icon |
| `bookingDetail` | `BookingDetailScreen.tsx` | Booking card → INFO |
| `newBooking` | `NewBookingScreen.tsx` | FAB / + ADD button |
| `apa` | `APAScreen.tsx` | BookingDetail → APA & Expenses |
| `shopping` | `ShoppingScreen.tsx` | BookingDetail → Shopping |
| `crew-score` | `CrewScoreScreen.tsx` | BookingDetail → Crew Score Card |
| `stats` | `StatsScreen.tsx` | Tab bar — Chart icon |
| `settings` | `SettingsScreen.tsx` | Tab bar — Person icon |
| `onboarding` | `OnboardingScreen.tsx` | First launch (no season) |
| `login` | `LoginScreen.tsx` | Logged out state |

---

## Global Shell Elements

### App Shell
```
class: app-shell
max-width: 430px
margin: 0 auto
background: hsl(var(--background))  [warm cream]
min-height: 100dvh
```

### Tab Bar
```
class: tab-bar
position: fixed bottom
height: 72px (--tab-bar-height)
background: white
border-top: 3px solid hsl(var(--foreground))
icons: Anchor, Calendar, BarChart2, User  [lucide-react]
active icon: color = primary blue, filled
inactive icon: color = muted-foreground
```

### Page Header (shared component)
```
component: <PageHeader />
props: title, backScreen?, rightElement?, variant?
height: ~56px
background (default): hsl(var(--background))
background (primary): hsl(var(--primary))
border-bottom: 3px solid hsl(var(--foreground))
title: font-display, bold, lg, uppercase
back button: 36×36px square, bg=card, border 2px, shadow brut-sm
```

---

## HomeScreen

### Hero Header Strip
```
background: hsl(var(--primary))  [sky blue]
border-bottom: 3px solid hsl(var(--foreground))
padding: px-5 pt-14 pb-5
content: "AHOY!" — font-display bold 5xl uppercase + boat name mono xs
```

### Active Charter Card
```
class: white-card equivalent (inline styles)
background: hsl(var(--card))
border: 2px solid foreground
box-shadow: 4px 4px 0px foreground
padding: p-5
elements:
  - "LIVE NOW" badge — accent bg, border, shadow brut-sm
  - Client name — font-display bold 2xl uppercase
  - Date range — font-mono sm
  - Stat boxes (GUESTS / DAY) — muted bg, border 1.5px
  - APA progress bar — dark track, primary fill
  - APA / SHOP buttons — primary bg, border, shadow brut
  - "VIEW DETAILS →" ghost button — border 1.5px, muted text
```

### Next Booking Card
```
background: hsl(var(--card))
border: 2px solid foreground
box-shadow: 3px 3px 0 foreground
layout: flex row — text left, initials box right
initials box: 56×56px, primary bg, border 2px, shadow brut-sm
"IN X DAYS" label: color = accent (lime)
```

### My Earnings Widget
```
background: hsl(var(--accent))  [lime green]
border: 2px solid foreground
box-shadow: 3px 3px 0 foreground
content: "MY EARNINGS" label + total amount + TrendingUp icon
```

### FAB (Floating Action Button)
```
position: fixed bottom-24 right-4
size: 56×56px (w-14 h-14)
background: hsl(var(--accent))
border: 2px solid foreground
box-shadow: 4px 4px 0 foreground
content: "+" font-display bold 2xl
```

---

## BookingsScreen

### Add Button (header right)
```
background: hsl(var(--accent))
border: 2px solid foreground
box-shadow: 2px 2px 0 foreground
text: "+ ADD" font-mono bold xs uppercase
```

### Booking Card
```
background: hsl(var(--card))
border: 2px solid foreground
box-shadow: 4px 4px 0 foreground

Top color strip:
  background: status color (Active=blue / Upcoming=lime / Completed=muted / Cancelled=red)
  border-bottom: 2px solid foreground
  content: status label (DAY X OF Y / IN XD / status)

Body:
  Client name — font-display bold 2xl uppercase
  Marina + dates — font-mono xs with Anchor icon
  APA row — font-mono xs (APA / SPENT / LEFT)

Action buttons (grid 3 cols):
  INFO — muted bg, border 1.5px, shadow brut-sm
  SHOP — muted bg, border 1.5px, shadow brut-sm
  APA  — status color bg, border 1.5px, shadow brut-sm
```

### Section Labels (Active / Upcoming / Completed)
```
class: section-label
font-mono bold xs uppercase tracking-widest
color: muted-foreground
```

---

## BookingDetailScreen

### Hero Block
```
background: primary (Active) or secondary/dark (other statuses)
border: 2px solid foreground
box-shadow: 4px 4px 0 foreground
padding: p-5
elements:
  - Status badge — white/20 bg, white text, border
  - Client name — font-display bold 2xl white
  - Dates + duration — font-mono sm white/70 + Calendar icon
  - "Day X of Y" line (Active only)
```

### Notes Card
```
class: white-card
padding: px-4 py-3.5
text: sm, leading-relaxed
```

### Preference List Card
```
class: white-card
layout: flex row — icon box + label + Upload button
icon box: 36×36px, primary-light bg, border 1.5px
```

### APA Overview Card
```
class: white-card
grid 3 cols: Received / Spent / Left
Left value: color = active (blue)
progress bar: dark track, primary fill
expandable APA history: border-t dividers
```

### Recent Expenses Preview
```
class: white-card
row: emoji icon + merchant name + category·author + amount
dividers: divide-y divide-border
"See all X expenses →" link: text-primary
```

### Tip Card
```
class: white-card
if tip exists: amber/gold amount + Edit link
if no tip: Plus icon box (muted bg) + placeholder text
```

### Action Buttons Grid (2-col + 1 full-width)
```
APA & Expenses:  primary bg, border 2px, shadow brut
Shopping:        card bg, border 2px, shadow brut
Crew Score Card: full-width, border 2px, shadow 3px
```

### Tip Modal (bottom sheet)
```
border: 3px solid foreground (top + sides only)
background: hsl(var(--card))
close button: 32×32px square, muted bg, border 2px
```

---

## APAScreen

### Custom Header
```
left: back arrow button — accent bg, 36×36px square, border 2px
center: status badge (LIVE/etc) + client name italic
right: ··· options button — muted bg, 36×36px square, border 2px
border-bottom: 3px solid foreground
```

### Tab Switcher (EXP / SHOP / INFO)
```
grid 3 cols
active tab: primary bg
inactive tab: card bg
border-right between tabs: 2px foreground
border-bottom: 3px foreground
text: font-mono bold xs uppercase
```

### APA Summary Hero
```
background: hsl(var(--primary))
border: 2px solid foreground
box-shadow: 4px 4px 0 foreground
SPENT: font-display bold 4xl
SAFE: font-display bold 2xl
progress bar: dark fill (foreground color)
+ ADD APA button: secondary/dark bg, white text
HISTORY toggle: semi-transparent bg
```

### Expense List Rows
```
background: hsl(var(--card))
border: 2px solid foreground
box-shadow: 3px 3px 0 foreground
category badge: 48×48px square, category bg color, border 1.5px
  FD = accent (lime)
  FL = accent (lime)
  PT = amber
  OT = muted
merchant: font-display bold uppercase
meta: font-mono xs uppercase (author · date)
amount: font-mono bold
```

### Bottom Action Bar
```
position: fixed bottom
background: hsl(var(--background))
border-top: 3px solid foreground
buttons: CAPTURE (secondary/dark) + MANUAL (card bg)
RECONCILIATION button: full-width, accent (lime) bg
```

### Bottom Sheets (Add APA / Manual Entry / Reconciliation)
```
border: 3px solid foreground (no bottom)
background: hsl(var(--background))
warning banner (Manual): amber bg, border 1.5px
```

---

## ShoppingScreen

### Summary Card
```
class: white-card
layout: client name + item count left / done + pending right
```

### Pending Item Row
```
class: white-card
checkbox: 24×24px square, border 2px foreground
item name: font-medium sm
delete: Trash2 icon, muted-foreground color
```

### Purchased Item Row
```
class: white-card, opacity-60
checkbox: 24×24px square, crew color bg, border 2px, Check icon
item name: line-through muted
buyer name + CrewDot
```

### Add Item Modal
```
border: 3px solid foreground (no bottom)
close button: 32×32px square, muted bg, border 2px
```

---

## CrewScoreScreen

### Leaderboard
```
border: 2px solid foreground
box-shadow: 3px 3px 0 foreground
rows divided by: border-top 1.5px
avatar: 32×32px square, crew color, border 2px
name: font-mono bold sm uppercase
🏆 winner badge (emoji, if total > 0)
😈 loser badge (emoji, if total < 0 and multiple crew)
score: font-display bold xl
  positive: hsl(142, 60%, 42%) [forest green]
  negative: hsl(0, 75%, 52%)   [red]
  zero: muted-foreground
```

### Score Log
```
border: 2px solid foreground
box-shadow: 3px 3px 0 foreground
rows divided by: border-top 1.5px
avatar: 28×28px square, crew color, border 1.5px
member name: font-mono bold xs uppercase
reason: text-xs muted-foreground
date: 10px mono muted
points value: font-display bold lg, color per value
```

### Award Points Modal
```
border: 3px solid foreground (no bottom)
close button: 32×32px square, border 2px
Crew Member grid (3 cols):
  unselected: card bg, border 2px, no shadow
  selected: crew color bg, border 2px, shadow 3px
Points grid (3 cols, −3 to +3):
  unselected: card bg, colored text
  selected: value color bg, white text, shadow 3px
  colors: +3 forest / +2 teal / +1 blue / −1 amber / −2 orange / −3 red
Submit button: dark/secondary bg, white text, primary color shadow
```

---

## StatsScreen

### Season Header
```
background: hsl(var(--primary))
border-bottom: 3px solid foreground
Season name: font-display bold 3xl uppercase
STATS/CAL toggle: border 2px, shadow brut-sm
  active: foreground bg, white text
  inactive: transparent bg, foreground text
```

### Stat Cards Row (APA / SPENT / TIPS)
```
grid 3 cols
APA:   primary blue bg
SPENT: pink bg, white text
TIPS:  accent lime bg
border: 2px solid foreground
box-shadow: 3px 3px 0 foreground
label: 10px mono bold uppercase opacity-75
value: font-display bold sm
```

### Season Progress
```
background: hsl(var(--card))
border: 2px solid foreground
box-shadow: 3px 3px 0 foreground
progress bar: dark track, primary fill
```

### Highlights Cards (Best Tip / Lowest Spend)
```
grid 2 cols
background: hsl(var(--card))
border: 2px solid foreground
box-shadow: 3px 3px 0 foreground
emoji + label + value (active color) + booking name
```

### Crew Score — Trophy / Horns Badges
```
grid 2 cols
🏆 Most Wins: forest green bg (hsl 142 60% 42%), white text
😈 Most Losses: red bg (hsl 0 75% 52%), white text
border: 2px solid foreground
box-shadow: 3px 3px 0 foreground
```

### Crew Score — Pie Chart Card
```
background: hsl(var(--card))
border: 2px solid foreground
box-shadow: 3px 3px 0 foreground
chart: donut (innerRadius 28, outerRadius 50)
stroke: 2px foreground on slices
tooltip: foreground bg, white text, font-mono bold
legend: colored squares (3×3px, border 1.5px) + name + score
```

### Season Totals Table
```
background: hsl(var(--card))
border: 2px solid foreground
box-shadow: 3px 3px 0 foreground
rows: flex justify-between, border-top 1.5px dividers
labels: font-mono xs muted uppercase
values: font-display bold foreground
```

### Spending by Category
```
background: hsl(var(--card))
border: 2px solid foreground
box-shadow: 3px 3px 0 foreground
category row: emoji + name + amount
progress bar per category: primary fill
```

### Top Merchants
```
background: hsl(var(--card))
border: 2px solid foreground
box-shadow: 3px 3px 0 foreground
rank badge: 28×28px square, primary bg, border 1.5px, number
merchant name: font-mono sm
amount: font-display bold
```

### Calendar View
```
month header: font-display bold lg uppercase
weekday labels: font-mono xs bold muted uppercase
day cells: 36×36px square grid
  booking day: colored by status (primary/accent/muted)
  today: foreground bg white text
  normal: transparent
dot: crew-dot style (square) if partial overlap
```

---

## SettingsScreen

### Profile Header
```
padding: px-5 pt-14 pb-6
avatar: CrewAvatar lg (40×40px square, crew color, border 2px)
online dot: 16×16px square, active color, border 2px background
name: font-display bold 2xl
email: text-sm muted
role badges: xs, primary-light bg, primary text, border 1px primary
```

### Settings Menu Groups
```
section-label per group
white-card with divide-y rows
each row: icon box (40×40px square, group color bg light, border 1.5px) + label + desc + ChevronRight
```

### Log Out Row
```
class: white-card
LogOut icon: destructive red
label: font-semibold destructive red
```

### Sub-screens (Earnings / Crew / Tip Split / Season)
All use PageHeader with backScreen="settings"

### My Earnings Hero
```
background: hsl(var(--active-bg))
border: 2px solid foreground
box-shadow: 4px 4px 0 foreground
total: font-display bold 4xl active color
progress bar: active color fill
projected: font-mono xs
```

### Rate Type Toggle (guest/non-guest)
```
2 buttons side by side
selected: primary bg, white text, border 2px foreground
unselected: muted bg, muted-foreground text, border 2px foreground
```

### Tip Split — Option Buttons
```
2 options (equal / custom)
white-card rows
selection indicator: 20×20px square checkbox
  selected: primary border + filled square inside
  unselected: border color
```

---

## OnboardingScreen

### Header Hero
```
background: hsl(var(--primary))
border-bottom: 3px solid foreground
icon box: 40×40px square, white/20 bg, white/40 border 2px
step indicator: "Step 1 of 2" font-mono xs white/60
```

### Form Fields
All use `input-field` class (see Design Rules)

### Invite Add Button
```
background: hsl(var(--secondary))  [dark]
color: white
border: 2px solid foreground
box-shadow: 2px 2px 0 foreground
font: font-display bold
```

---

## LoginScreen

### Hero
```
background: hsl(var(--primary))
border-bottom: 3px solid foreground
logo box: 80×80px square, white/20 bg, white/40 border 3px
title: "Crew Season" font-display bold 4xl white
```

### Form
```
email input: input-field with Mail icon left (pl-10)
send button: btn-primary class
```

---

## Shared Components

### `<PageHeader />`
See Global Shell → Page Header

### `<CrewAvatar />`
```
sizes: sm=24px / md=32px / lg=40px (all squares)
background: hsl(var(--crew-N))
border: 2px solid foreground
text: white bold initials (2 chars max)
```

### `<CrewDot />`
```
size: 10×10px square
background: hsl(var(--crew-N))
border: 1px solid foreground
display: inline-block
```

### `<NavLink />` (tab bar items)
```
flex col: icon + label
active: icon color = primary, label color = primary
inactive: icon color = muted-foreground, label color = muted-foreground
font: font-mono text-[10px] uppercase
```

---

## Data Entities → UI Mapping

| Entity | Key Fields Shown | Where |
|--------|-----------------|-------|
| Booking | clientName, dates, marina, guestCount, status | BookingCard, BookingDetail |
| APAEntry | amount, date, note | APAScreen history |
| Expense | merchant, amount, category, author, date | APAScreen list |
| ShoppingItem | name, purchased, purchasedBy | ShoppingScreen |
| ScoreEntry | toUser, points, reason, date | CrewScoreScreen |
| CrewMember | name, role, colorIndex | Avatars, selectors |
| Season | boatName, seasonName, dates, currency | Stats header, Settings |
| PersonalSettings | rates, manualWorkDays | Earnings sub-screen |
