# Claude Code Instructions — Ahoy

**READ THIS ENTIRE DOCUMENT BEFORE WRITING ANY CODE.**

---

## Who You Are

You are the primary developer on this project. You work alongside a human product owner who understands the business requirements but is not a professional developer. 

Your job is to:
1. Build the app according to the specifications
2. Write clean, documented, tested code
3. Keep detailed logs of your work
4. Make sure another developer could take over at any time

---

## Project Documents

You have access to these documents. **Read them before starting any work:**

| Document | Location | Purpose |
|----------|----------|---------|
| Product Brief | `/docs/Ahoy_Brief_v2.md` | WHAT we're building |
| Tech Spec | `/docs/Ahoy_Tech_Spec.md` | HOW to build it technically |
| Screen Map | `/docs/Ahoy_Screen_Map.md` | UI screens and flow |
| Developer Guide | `/docs/Ahoy_Developer_Guide.md` | HOW to work |
| Project Plan | `/docs/Ahoy_Project_Plan.md` | Tasks and phases |
| This file | `/docs/Ahoy_Claude_Instructions.md` | Your instructions |

---

## Your Working Process

### Starting a New Session

Every time you start working:

```
1. READ the previous session log (if exists)
   Location: /docs/logs/YYYY-MM-DD.md

2. CHECK project state
   - Run: git log --oneline -10
   - Run: npm test
   - Run: npm start (verify app runs)

3. READ the Project Plan
   - Find current phase
   - Find next incomplete task

4. CREATE today's session log
   - Use template from Developer Guide
   - Write your plan for the session

5. NOW you may code
```

### Before Starting Any Task

For any task that touches multiple files:

```
1. RE-READ relevant section of Product Brief
2. RE-READ relevant section of Tech Spec  
3. RE-READ relevant screens in Screen Map
4. WRITE a mini-plan:
   - What files will I create/modify?
   - What's the order of operations?
   - What tests will I write?
5. NOW code the task
```

### While Coding

```
EVERY file you create:
- Add file header comment explaining purpose
- Add JSDoc to functions
- Follow naming conventions from Developer Guide

EVERY 30 minutes:
- Commit your work (even WIP)
- Run tests
- Note progress in session log

WHEN you complete a task:
- Run tests
- Verify it works manually
- Check off task in Project Plan
- Commit with proper message
```

### Ending a Session

```
1. COMMIT all changes
2. RUN full test suite
3. UPDATE session log:
   - What you completed
   - What you didn't finish
   - Any blockers
   - All commits made
4. PUSH to remote
5. UPDATE Project Plan checkboxes
```

---

## Code Standards (Summary)

Full details in Developer Guide. Key points:

### File Structure
```
src/features/[feature]/
├── README.md           ← Always create this
├── index.ts            ← Public exports
├── types.ts            ← TypeScript types
├── components/
│   ├── Component.tsx
│   └── Component.test.tsx
├── hooks/
│   ├── useHook.ts
│   └── useHook.test.ts
└── services/
    ├── service.ts
    └── service.test.ts
```

### Testing
- Write test BEFORE or WHILE writing code
- Never commit without running tests
- Test file lives next to source file

### Commits
```
feat(scope): description
fix(scope): description
test(scope): description
docs(scope): description
```

Commit frequently. Every 30-60 minutes minimum.

### HR Locale (CRITICAL)
All dates and numbers MUST use Croatian formatting:
- Date: `15.11.2026.`
- Number: `1.234,56`
- Currency: `1.234,56 €`

Use utility functions from `/src/utils/formatting.ts`

---

## What To Do When Stuck

If stuck for more than 15 minutes:

```
1. DOCUMENT the problem in session log:
   - What you're trying to do
   - What's happening
   - What you've tried

2. TRY these things:
   - Read the error message carefully
   - Google the exact error
   - Check if similar code exists elsewhere in project
   - Simplify the problem

3. IF still stuck:
   - Note it in session log
   - Move to a different task
   - Flag for human review
```

---

## Communication With Human

When you need human input:

```markdown
## QUESTION FOR REVIEW

**Context:** [What you're working on]

**Question:** [Specific question]

**Options I see:**
1. [Option A] — [pros/cons]
2. [Option B] — [pros/cons]

**My recommendation:** [What you'd choose and why]
```

Put this in the session log and flag it clearly.

---

## Quality Checklist

Before marking ANY task as done:

```
CODE
[ ] Follows project structure
[ ] Has proper TypeScript types
[ ] No any types (unless justified)
[ ] No console.log (except errors)
[ ] Has file header comment
[ ] Functions have JSDoc

TESTS
[ ] Test file exists
[ ] Tests pass
[ ] Edge cases covered

FORMATTING
[ ] HR locale for dates/numbers
[ ] Consistent naming
[ ] No linting errors

GIT  
[ ] Committed with proper message
[ ] Pushed to remote
```

---

## Phase-Specific Instructions

### Phase 0: Setup

```
GOAL: Empty app that runs

DO:
- Create Firebase project (human will do this)
- Create Expo project
- Install all dependencies from Tech Spec §13
- Create folder structure from Tech Spec §4
- Create config files from Tech Spec §5
- Setup .env files
- Verify app runs on iOS and Android

VERIFY:
- npm start works
- App opens on both platforms
- No console errors
```

### Phase 1: Auth

```
GOAL: User can log in via magic link

READ FIRST:
- Tech Spec §6 (Firebase Structure)
- Tech Spec §7.3 (Security Rules)
- Screen Map §1.1 (Login)

KEY POINTS:
- Use Firebase Auth email link
- Handle deep link when user clicks email
- Store auth state in Zustand
- Persist auth across app restarts

TEST:
- Login flow works
- Invalid email shows error
- Auth persists after app restart
```

### Phase 4: Booking

```
GOAL: Full booking CRUD

READ FIRST:
- Product Brief §7 (Booking Lifecycle)
- Tech Spec §5 (Type Definitions - Booking)
- Screen Map §2.3, §3.1, §3.2

KEY POINTS:
- Status auto-updates based on dates
- Validate no date overlap (warn, don't block)
- Route fields: departure marina, arrival marina
- Preference PDF upload to Firebase Storage

TEST:
- Create booking works
- Edit booking works
- Status changes correctly
- Date validation works
- PDF upload works
```

### Phase 6: Expense Capture

```
GOAL: Camera captures receipts, OCR works

READ FIRST:
- Product Brief §5 (Expense Flow)
- Tech Spec §10 (OCR Flow)
- Screen Map §4.1-4.5

KEY POINTS:
- Two entry types: quick capture, manual entry
- OCR runs on-device (ML Kit)
- Parse amount, merchant, date from OCR
- User confirms/edits OCR results
- Save image locally, upload when online

CRITICAL:
- All amounts in HR format (1.234,56 €)
- Test OCR with real Croatian receipts

TEST:
- Camera opens and captures
- Image saves locally
- OCR extracts data
- Manual entry works
- HR formatting correct
```

### Phase 7: Reconciliation

```
GOAL: End-of-booking balance check

READ FIRST:
- Product Brief §6 (Reconciliation Flow)
- Screen Map §4.5, §4.6

KEY POINTS:
- Formula: APA - Expenses = Expected Cash
- Editor enters actual cash
- Show balanced or difference
- Don't lock - that's crew's problem to solve

TEST:
- Calculation is correct
- Shows balanced when equal
- Shows difference when not
- HR formatting on all numbers
```

### Phase 8: Export

```
GOAL: Export to Excel, send via email

READ FIRST:
- Product Brief §20 (Export)
- Screen Map §4.7

KEY POINTS:
- Excel with HR number formatting
- CSV delimiter: semicolon (;)
- ZIP of receipt images
- Open native mail app with attachments

CRITICAL:
- Test Excel import into Google Sheets
- Verify numbers don't break

TEST:
- Excel generates correctly
- Numbers are HR formatted
- ZIP contains all images
- Mail opens with attachments
```

---

## File Creation Checklist

When creating a new file, include:

### Component File
```typescript
/**
 * ComponentName
 * 
 * [One-line description]
 * 
 * @example
 * <ComponentName prop={value} />
 */

import React from 'react';
// ... imports

interface ComponentNameProps {
  // typed props
}

export function ComponentName({ prop }: ComponentNameProps) {
  // implementation
}
```

### Hook File
```typescript
/**
 * useHookName
 * 
 * [One-line description]
 * 
 * @returns { data, loading, error, actions }
 * 
 * @example
 * const { data, loading } = useHookName(param);
 */

import { useState, useEffect } from 'react';
// ... imports

export function useHookName(param: ParamType) {
  // implementation
  
  return {
    // return object
  };
}
```

### Service File
```typescript
/**
 * serviceName
 * 
 * [One-line description]
 * Handles [what data/operations]
 */

// ... imports

export const serviceName = {
  async create(data: CreateData): Promise<Result> {
    // implementation
  },
  
  async getById(id: string): Promise<Item | null> {
    // implementation
  },
  
  // ... other methods
};
```

---

## Remember

1. **Read before you code.** Always.
2. **Test as you go.** Not after.
3. **Commit often.** Every 30-60 minutes.
4. **Document everything.** Code, logs, decisions.
5. **HR formatting is non-negotiable.** Check it everywhere.
6. **When in doubt, ask.** Don't assume.

---

## Session Log Location

Create daily logs at:
```
/docs/logs/YYYY-MM-DD.md
```

Use the template from Developer Guide §2.

---

**Now go read the Project Plan and start with Phase 0.**
