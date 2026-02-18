# AhoyApp — Documentation Package

**Created:** 2026-02-18

---

## What's In This Package

| # | Document | Purpose |
|---|----------|---------|
| 1 | `Ahoy_Brief_v2.md` | What we're building (features, rules, flows) |
| 2 | `Ahoy_Tech_Spec.md` | How to build it (stack, architecture, types) |
| 3 | `Ahoy_Screen_Map.md` | All screens with ASCII wireframes |
| 4 | `Ahoy_Developer_Guide.md` | How to work (process, commits, testing, docs) |
| 5 | `Ahoy_Project_Plan.md` | Phases, tasks, timeline |
| 6 | `Ahoy_Claude_Instructions.md` | Specific instructions for Claude Code |
| 7 | `Ahoy_Pre_Dev_Checklist.md` | Setup tasks before coding starts |
| 8 | This README | Overview of everything |

---

## How To Use These Documents

### For Human (Product Owner)

1. **Complete Pre-Dev Checklist** — Setup Firebase, verify accounts
2. **Give docs to Claude Code** — All files in /docs folder
3. **Monitor progress** — Check session logs in /docs/logs
4. **Answer questions** — Claude will flag blockers in logs

### For Claude Code

1. **Read claude-instructions.md FIRST** — Your working instructions
2. **Read all other docs** — Understand the full picture
3. **Follow project-plan.md** — Phase by phase, task by task
4. **Use developer-guide.md** — For process and standards
5. **Log everything** — Daily session logs in /docs/logs

---

## Project Summary

**App:** Ahoy  
**Purpose:** Expense tracking and APA management for yacht crew  
**Platforms:** iOS + Android  
**Stack:** React Native + Expo + Firebase + TypeScript
**Firebase Project:** `ahoyapp-24b36`

**Core Problem Solved:**
> End-of-week chaos where one person reconstructs a week of expenses from scattered receipts. App makes everyone responsible for their own receipts, captured instantly.

**MVP Features:**
- Auth (magic link)
- Boat workspace + crew invite
- Booking management
- Expense capture (camera + OCR)
- APA tracking
- Reconciliation
- Export (Excel + images via email)

**Not in MVP:**
- Shopping list
- Personal income tracking
- Season statistics
- Notifications

---

## Estimated Timeline

~26-35 working days for MVP

| Phase | Duration |
|-------|----------|
| Setup | 1 day |
| Auth | 2-3 days |
| Onboarding | 2-3 days |
| Navigation | 1-2 days |
| Booking | 3-4 days |
| Home | 2 days |
| Expense | 4-5 days |
| Reconciliation | 2-3 days |
| Export | 2 days |
| Offline | 2-3 days |
| Settings | 2-3 days |
| Polish | 3-4 days |

---

## Critical Rules

1. **HR Locale** — All dates as `DD.MM.YYYY.`, numbers as `1.234,56`
2. **Offline First** — App must work without internet
3. **Test Everything** — No code without tests
4. **Document Everything** — Session logs, code comments, READMEs
5. **Commit Often** — Every 30-60 minutes

---

## Folder Structure (After Setup)

```
ahoyapp/
├── docs/                    ← All documentation
│   ├── logs/               ← Daily session logs
│   ├── product-brief.md
│   ├── tech-spec.md
│   ├── screen-map.md
│   ├── developer-guide.md
│   ├── project-plan.md
│   └── claude-instructions.md
├── src/                     ← Source code
│   ├── features/           ← Feature modules
│   ├── components/         ← Shared components
│   ├── config/             ← Configuration
│   ├── hooks/              ← Shared hooks
│   ├── services/           ← Shared services
│   ├── stores/             ← Zustand stores
│   ├── types/              ← Shared types
│   └── utils/              ← Utility functions
├── app/                     ← Expo Router screens
└── assets/                  ← Images, fonts
```

---

## Getting Started

1. Human completes `pre-dev-checklist.md`
2. Human shares Firebase config with Claude Code
3. Claude Code reads `claude-instructions.md`
4. Claude Code starts Phase 0 from `project-plan.md`
5. Work proceeds phase by phase

---

## Questions or Issues?

- Check relevant document first
- If unclear, flag in session log
- Human reviews logs and responds

---

Good luck! 🚀
