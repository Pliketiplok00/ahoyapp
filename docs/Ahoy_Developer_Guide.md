# Ahoy — Developer Guide

**Date:** 2026-02-18  
**Purpose:** How we work. Read this before writing a single line of code.

---

## Golden Rules

1. **If it's not documented, it doesn't exist.**
2. **If it's not tested, it doesn't work.**
3. **If it's not committed, it didn't happen.**
4. **Code for the developer who comes after you — assume they know nothing.**

---

## 1. Work Session Structure

Every coding session follows this structure. No exceptions.

### 1.1 Starting a Session

Before you write ANY code:

```
┌─────────────────────────────────────────────────────────┐
│  1. OPEN SESSION LOG                                    │
│     Create entry in /docs/logs/YYYY-MM-DD.md            │
│                                                         │
│  2. READ THE PLAN                                       │
│     - Product Brief                                     │
│     - Tech Spec                                         │
│     - Screen Map                                        │
│     - Current sprint/task list                          │
│                                                         │
│  3. CHECK WHERE WE LEFT OFF                             │
│     - Read previous session log                         │
│     - Check git log (last 10 commits)                   │
│     - Run tests — are they passing?                     │
│     - Run app — does it start?                          │
│                                                         │
│  4. DEFINE TODAY'S GOAL                                 │
│     Write in session log:                               │
│     - What I will accomplish today                      │
│     - Which files I expect to touch                     │
│     - Any blockers or questions                         │
│                                                         │
│  5. NOW YOU MAY CODE                                    │
└─────────────────────────────────────────────────────────┘
```

### 1.2 During a Session

```
EVERY 30-60 MINUTES:
├── Commit your work (even if incomplete — use WIP commits)
├── Run tests
├── Update session log with progress
└── Take a break, look away from screen

WHEN STUCK FOR >15 MINUTES:
├── Document the problem in session log
├── Describe what you tried
├── Ask for help OR move to different task
└── Do NOT spin wheels silently
```

### 1.3 Ending a Session

Before you close your laptop:

```
┌─────────────────────────────────────────────────────────┐
│  1. COMMIT EVERYTHING                                   │
│     No uncommitted changes overnight                    │
│                                                         │
│  2. RUN FULL TEST SUITE                                 │
│     Document result in session log                      │
│                                                         │
│  3. UPDATE SESSION LOG                                  │
│     - What I accomplished                               │
│     - What I didn't finish (and why)                    │
│     - What should happen next                           │
│     - Any blockers for tomorrow                         │
│     - List all commits made today                       │
│                                                         │
│  4. PUSH TO REMOTE                                      │
│     Your work must exist outside your machine           │
│                                                         │
│  5. UPDATE TASK STATUS                                  │
│     Mark tasks as done/in-progress/blocked              │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Session Log Format

Location: `/docs/logs/YYYY-MM-DD.md`

```markdown
# Session Log: 2026-02-18

## Session Info
- **Developer:** [Name]
- **Start time:** 09:00
- **End time:** 17:30
- **Branch:** feature/expense-capture

## Plan for Today
- [ ] Implement camera capture screen
- [ ] Add OCR integration
- [ ] Write tests for image upload

## Progress Log

### 09:00 - Session Start
- Read previous log from 2026-02-17
- Ran tests: 47 passing, 0 failing
- App starts correctly
- Continuing from: camera permissions setup

### 10:30 - Camera Capture
- Implemented basic camera view
- Commit: `abc1234` - "feat(expense): add camera capture screen"
- Issue: preview is stretched on some devices
- TODO: investigate aspect ratio handling

### 12:00 - Lunch Break

### 13:00 - Resume
- Fixed aspect ratio issue
- Commit: `def5678` - "fix(expense): camera preview aspect ratio"

### 15:00 - OCR Integration
- Integrated ML Kit
- Tests written: 3 new tests
- Commit: `ghi9012` - "feat(expense): add OCR text extraction"

### 17:00 - Session Wrap-up
- Ran full test suite: 50 passing, 0 failing
- App tested on iOS simulator and Android emulator

## Commits Today
| Hash | Message |
|------|---------|
| abc1234 | feat(expense): add camera capture screen |
| def5678 | fix(expense): camera preview aspect ratio |
| ghi9012 | feat(expense): add OCR text extraction |

## End of Day Status
- **Completed:** Camera capture, OCR integration
- **Not completed:** Image upload tests (moved to tomorrow)
- **Blockers:** None
- **Next session:** Write image upload tests, start manual entry screen

## Notes
- ML Kit works offline but first load is slow (~3s)
- Consider adding loading indicator
```

---

## 3. Before Starting Any Task

### 3.1 Task Audit Checklist

Before coding a new feature, complete this audit:

```markdown
## Task Audit: [Feature Name]

### 1. Understanding
- [ ] I have read the relevant section in Product Brief
- [ ] I have read the relevant section in Tech Spec
- [ ] I have reviewed the Screen Map for this feature
- [ ] I can explain this feature in one sentence:
      "[Write it here]"

### 2. Scope
- [ ] I have listed all screens involved
- [ ] I have listed all components needed
- [ ] I have listed all hooks needed
- [ ] I have listed all services/API calls needed
- [ ] I have identified dependencies on other features

### 3. Questions
- [ ] All ambiguities are resolved OR documented as questions
- Questions:
  1. [Question 1]
  2. [Question 2]

### 4. Plan
- [ ] I have broken this into tasks ≤2 hours each
- [ ] I have identified what to test
- [ ] I have estimated total time

### 5. Ready
- [ ] I know exactly what to do first
```

### 3.2 Extract Detailed Plan

Turn audit into actionable steps:

```markdown
## Implementation Plan: Expense Capture

### Phase 1: Camera Screen (2h)
1. Create screen file: `app/(main)/expense/capture.tsx`
2. Create component: `src/features/expense/components/ReceiptCapture.tsx`
3. Implement camera preview
4. Add capture button
5. Test: camera opens, button works
6. Commit

### Phase 2: Image Handling (1.5h)
1. Create hook: `src/features/expense/hooks/useReceiptCapture.ts`
2. Save image to local filesystem
3. Generate thumbnail
4. Test: image saves correctly
5. Commit

### Phase 3: OCR (2h)
1. Create service: `src/features/expense/services/ocrService.ts`
2. Integrate ML Kit
3. Parse amount, merchant, date
4. Test: OCR extracts data from sample receipts
5. Commit

### Phase 4: Review Screen (2h)
...
```

---

## 4. Git Commit Standards

### 4.1 Commit Message Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types:**
- `feat` — new feature
- `fix` — bug fix
- `refactor` — code change that neither fixes nor adds
- `test` — adding or updating tests
- `docs` — documentation only
- `style` — formatting, missing semicolons, etc.
- `chore` — maintenance, dependencies, config

**Scope:** feature name (expense, booking, auth, etc.)

**Examples:**
```
feat(expense): add camera capture screen
fix(booking): date overlap validation
test(auth): add magic link flow tests
docs(readme): update setup instructions
refactor(hooks): extract common logic to useForm
```

### 4.2 Commit Frequency

```
COMMIT OFTEN:
✓ After completing a logical unit of work
✓ Before switching to a different task
✓ Before taking a break
✓ Before any risky change
✓ Every 30-60 minutes at minimum

DO NOT:
✗ Commit broken code to main branch
✗ Commit with message "fix" or "update"
✗ Go hours without committing
✗ Bundle unrelated changes in one commit
```

### 4.3 WIP Commits

If you need to commit incomplete work:

```
git commit -m "WIP(expense): camera capture - preview working, button TODO"
```

Before PR/merge, squash WIP commits into meaningful ones.

### 4.4 Branch Strategy

```
main
  └── develop
        ├── feature/expense-capture
        ├── feature/booking-form
        └── fix/date-formatting

Branch naming:
- feature/[feature-name]
- fix/[bug-description]
- refactor/[what-you-refactored]
```

---

## 5. Testing Standards

### 5.1 Test-Driven Development (TDD)

```
┌─────────────────────────────────────────────────────────┐
│                    TDD CYCLE                            │
│                                                         │
│     ┌─────────┐                                         │
│     │  RED    │  Write a failing test                   │
│     └────┬────┘                                         │
│          │                                              │
│          ▼                                              │
│     ┌─────────┐                                         │
│     │  GREEN  │  Write minimum code to pass             │
│     └────┬────┘                                         │
│          │                                              │
│          ▼                                              │
│     ┌─────────┐                                         │
│     │REFACTOR │  Clean up, then run tests again         │
│     └────┬────┘                                         │
│          │                                              │
│          └──────────► Repeat                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.2 What to Test

| Layer | What to Test | Tool |
|-------|--------------|------|
| **Utils** | Pure functions, formatting, validation | Jest |
| **Hooks** | State changes, side effects | React Testing Library |
| **Components** | Renders correctly, user interactions | React Native Testing Library |
| **Services** | API calls, data transformation | Jest + mocks |
| **Screens** | Integration of components | React Native Testing Library |

### 5.3 Test File Location

```
src/
├── features/
│   └── expense/
│       ├── components/
│       │   ├── ExpenseItem.tsx
│       │   └── ExpenseItem.test.tsx    ← Same folder
│       ├── hooks/
│       │   ├── useExpenses.ts
│       │   └── useExpenses.test.ts     ← Same folder
│       └── services/
│           ├── expenseService.ts
│           └── expenseService.test.ts  ← Same folder
```

### 5.4 Test Template

```typescript
// ExpenseItem.test.tsx

import { render, screen, fireEvent } from '@testing-library/react-native';
import { ExpenseItem } from './ExpenseItem';

describe('ExpenseItem', () => {
  // Setup
  const mockExpense = {
    id: '1',
    amount: 47.50,
    merchant: 'Konzum',
    category: 'food',
    date: new Date('2026-02-18'),
  };

  // Test: renders correctly
  it('renders expense details', () => {
    render(<ExpenseItem expense={mockExpense} />);
    
    expect(screen.getByText('47,50 €')).toBeTruthy();  // HR format!
    expect(screen.getByText('Konzum')).toBeTruthy();
  });

  // Test: user interaction
  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<ExpenseItem expense={mockExpense} onPress={onPress} />);
    
    fireEvent.press(screen.getByText('Konzum'));
    
    expect(onPress).toHaveBeenCalledWith(mockExpense);
  });

  // Test: edge case
  it('handles missing merchant gracefully', () => {
    const incomplete = { ...mockExpense, merchant: undefined };
    render(<ExpenseItem expense={incomplete} />);
    
    expect(screen.getByText('Unknown merchant')).toBeTruthy();
  });
});
```

### 5.5 Running Tests

```bash
# Run all tests
npm test

# Run tests for specific feature
npm test -- --testPathPattern=expense

# Run tests in watch mode (during development)
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### 5.6 Test Checklist Before Commit

```
Before every commit:
[ ] All existing tests pass
[ ] New code has tests
[ ] Edge cases are covered
[ ] No console.log statements in tests
```

---

## 6. Code Documentation Standards

### 6.1 File Headers

Every file starts with a header comment:

```typescript
/**
 * ExpenseItem Component
 * 
 * Displays a single expense entry in a list.
 * Shows amount, merchant, category icon, and author color.
 * 
 * @example
 * <ExpenseItem 
 *   expense={expense} 
 *   onPress={handlePress}
 * />
 * 
 * @see /docs/screens/expense-list.md for design specs
 */
```

### 6.2 Function Documentation

```typescript
/**
 * Formats a number according to Croatian locale.
 * Uses comma for decimal, dot for thousands.
 * 
 * @param amount - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string, e.g., "1.234,56"
 * 
 * @example
 * formatNumber(1234.5)     // "1.234,50"
 * formatNumber(1234.5, 0)  // "1.235"
 */
export function formatNumber(amount: number, decimals = 2): string {
  return amount.toLocaleString('hr-HR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
```

### 6.3 Complex Logic Comments

```typescript
// Calculate expected cash in safe
// Formula: Total APA received - Sum of all expenses
// This is the amount that should physically be in the safe
const expectedCash = apaTotal - expenses.reduce((sum, e) => sum + e.amount, 0);

// Handle edge case: negative expected cash means overspending
// This shouldn't happen but we show warning instead of crashing
if (expectedCash < 0) {
  console.warn('Overspending detected:', { apaTotal, spent: apaTotal - expectedCash });
}
```

### 6.4 TODO Comments

```typescript
// TODO: Add loading state for slow connections
// TODO(2026-03-01): Remove this workaround after Expo SDK 52
// FIXME: This breaks on Android 12, see issue #42
// HACK: Temporary fix until we refactor auth flow
```

### 6.5 README per Feature

Each feature folder has a README:

```
src/features/expense/README.md
```

```markdown
# Expense Feature

## Overview
Handles all expense-related functionality: capture, list, edit, delete.

## Components
| Component | Purpose |
|-----------|---------|
| ExpenseList | Displays all expenses for a booking |
| ExpenseItem | Single expense row |
| ReceiptCapture | Camera capture screen |
| NoReceiptForm | Manual entry without photo |

## Hooks
| Hook | Purpose |
|------|---------|
| useExpenses | CRUD operations for expenses |
| useReceiptCapture | Camera + OCR flow |
| useReconciliation | End-of-booking balance check |

## Data Flow
```
User takes photo
    ↓
useReceiptCapture saves locally
    ↓
OCR extracts data
    ↓
User confirms/edits in form
    ↓
useExpenses.create() saves to Firestore
    ↓
Syncs to other devices
```

## Key Decisions
- OCR runs on-device (works offline)
- Images stored locally first, uploaded when online
- All amounts use HR locale formatting

## Related Docs
- [Product Brief: Expense Flow](/docs/brief.md#expense-flow)
- [Tech Spec: OCR](/docs/tech-spec.md#ocr)
- [Screen Map: Expense Screens](/docs/screen-map.md#expense)
```

---

## 7. Code Style & Readability

### 7.1 Naming Conventions

```typescript
// Components: PascalCase
ExpenseItem.tsx
BookingCard.tsx

// Hooks: camelCase, start with "use"
useExpenses.ts
useAuth.ts

// Services: camelCase, end with "Service"
expenseService.ts
authService.ts

// Utils: camelCase, descriptive verb
formatCurrency.ts
validateDate.ts

// Constants: SCREAMING_SNAKE_CASE
BOOKING_STATUS.ts
USER_ROLES.ts

// Types/Interfaces: PascalCase
interface Expense { }
type BookingStatus = ...
```

### 7.2 Self-Documenting Code

```typescript
// ❌ BAD - What does this do?
const x = arr.filter(i => i.s === 'a' && i.d > n);

// ✅ GOOD - Clear intent
const activeBookings = bookings.filter(booking => 
  booking.status === 'active' && 
  booking.departureDate > today
);
```

```typescript
// ❌ BAD - Magic numbers
if (crew.length > 20) { ... }

// ✅ GOOD - Named constant
const MAX_CREW_MEMBERS = 20;
if (crew.length > MAX_CREW_MEMBERS) { ... }
```

```typescript
// ❌ BAD - Nested ternaries
const label = a ? (b ? 'X' : 'Y') : (c ? 'Z' : 'W');

// ✅ GOOD - Clear conditionals
function getLabel(a: boolean, b: boolean, c: boolean): string {
  if (a && b) return 'X';
  if (a && !b) return 'Y';
  if (!a && c) return 'Z';
  return 'W';
}
```

### 7.3 Function Length

```
RULE: If a function doesn't fit on one screen (~30 lines), split it.

Exception: Test files can have longer functions.
```

### 7.4 Early Returns

```typescript
// ❌ BAD - Deep nesting
function processExpense(expense) {
  if (expense) {
    if (expense.amount > 0) {
      if (expense.category) {
        // actual logic here
      }
    }
  }
}

// ✅ GOOD - Early returns
function processExpense(expense) {
  if (!expense) return;
  if (expense.amount <= 0) return;
  if (!expense.category) return;
  
  // actual logic here
}
```

---

## 8. Handling Errors

### 8.1 Error Boundaries

Wrap major sections in error boundaries:

```typescript
// App.tsx
<ErrorBoundary fallback={<ErrorScreen />}>
  <Navigation />
</ErrorBoundary>
```

### 8.2 Service Errors

```typescript
// ❌ BAD - Silent failures
async function saveExpense(data) {
  try {
    await db.collection('expenses').add(data);
  } catch (e) {
    // nothing
  }
}

// ✅ GOOD - Handle and report
async function saveExpense(data): Promise<Result<Expense>> {
  try {
    const doc = await db.collection('expenses').add(data);
    return { success: true, data: { id: doc.id, ...data } };
  } catch (error) {
    console.error('Failed to save expense:', error);
    return { success: false, error: 'Failed to save. Please try again.' };
  }
}
```

### 8.3 User-Facing Errors

```typescript
// Always provide actionable error messages
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'No internet connection. Your changes will sync when online.',
  SAVE_FAILED: 'Could not save. Please try again.',
  CAMERA_DENIED: 'Camera access needed to capture receipts. Enable in Settings.',
};
```

---

## 9. When You're Stuck

### 9.1 Debug Checklist

```
□ Read the error message carefully — what does it actually say?
□ Check the line number — is the error where you think it is?
□ console.log the variables — are they what you expect?
□ Check recent changes — did you break something that worked?
□ Google the exact error message
□ Check if tests pass — did you break something?
□ Take a 5-minute break, then look again
```

### 9.2 Document Your Stuck

If stuck >15 minutes, add to session log:

```markdown
### 14:30 - STUCK: Camera not opening on Android

**Problem:** 
Camera preview shows black screen on Android emulator.

**What I tried:**
1. Checked permissions — granted
2. Checked expo-camera version — latest
3. Tried different emulator — same issue
4. Searched GitHub issues — found similar report

**Hypothesis:**
May be emulator-specific. Need to test on physical device.

**Next step:**
Will test on physical Android device tomorrow.
Moving to different task for now.
```

### 9.3 Ask for Help

When asking for help, provide:

```markdown
## Help Needed: [Short description]

**What I'm trying to do:**
[One sentence]

**What's happening:**
[Describe the problem]

**Error message:**
```
[Paste exact error]
```

**What I've tried:**
1. [Thing 1]
2. [Thing 2]

**Relevant code:**
```typescript
[Minimal code snippet]
```

**Environment:**
- OS: macOS 14.1
- Node: 18.17
- Expo: 51.0
```

---

## 10. Definition of Done

A task is DONE when:

```
CODE
[ ] Feature works as specified
[ ] Code follows style guide
[ ] No TypeScript errors
[ ] No console warnings
[ ] No commented-out code (unless explained)

TESTS
[ ] All existing tests pass
[ ] New tests written for new code
[ ] Edge cases covered

DOCUMENTATION
[ ] Code has JSDoc comments
[ ] README updated if needed
[ ] Session log updated

GIT
[ ] Committed with proper message
[ ] Pushed to remote
[ ] PR created (if applicable)

VERIFICATION
[ ] Tested on iOS
[ ] Tested on Android
[ ] Tested offline behavior (if applicable)
```

---

## 11. File Checklist for New Features

When creating a new feature, you need:

```
src/features/[feature-name]/
├── README.md                 ← Overview of the feature
├── index.ts                  ← Public exports
├── types.ts                  ← TypeScript types
├── components/
│   ├── index.ts              ← Export all components
│   ├── Component.tsx
│   └── Component.test.tsx
├── hooks/
│   ├── index.ts
│   ├── useHook.ts
│   └── useHook.test.ts
└── services/
    ├── index.ts
    ├── service.ts
    └── service.test.ts
```

---

## 12. Daily Standup (Self)

Even working alone, answer these daily:

```
1. What did I complete yesterday?
2. What will I do today?
3. Any blockers?
```

Write this at the top of your session log.

---

## 13. Weekly Review

Every Friday (or end of week):

```markdown
# Weekly Review: Week of 2026-02-17

## Completed
- [ ] Expense capture flow
- [ ] OCR integration
- [ ] Basic booking CRUD

## Not Completed
- [ ] Shopping list (moved to next week)

## Blockers Encountered
- Android camera issue (resolved)
- Firebase rules confusion (still unclear)

## Lessons Learned
- Test on physical devices earlier
- Read Firebase docs more carefully

## Next Week Goals
1. Shopping list
2. Reconciliation flow
3. Export feature

## Hours Logged
- Monday: 6h
- Tuesday: 7h
- Wednesday: 5h
- Thursday: 7h
- Friday: 6h
- Total: 31h
```

---

## Appendix: Quick Reference

### Commands

```bash
# Start dev server
npm start

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Type check
npm run typecheck

# Lint
npm run lint

# Build
npm run build
```

### File Locations

| What | Where |
|------|-------|
| Session logs | `/docs/logs/YYYY-MM-DD.md` |
| Product Brief | `/docs/product-brief.md` |
| Tech Spec | `/docs/tech-spec.md` |
| Screen Map | `/docs/screen-map.md` |
| Feature README | `/src/features/[name]/README.md` |

### Emergency Contacts

If everything is on fire:
1. `git stash` your changes
2. `git checkout main`
3. `npm install`
4. `npm start`
5. Breathe
6. Read the error message again

---

**Remember:** The goal is not to write code fast. The goal is to write code that works, that you understand, and that the next person can understand. Speed comes from clarity.
