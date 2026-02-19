# Income Feature (Personal)

Private module for crew members to track their personal earnings.

**Status:** Scaffold only - Implementation in Post-MVP

## Planned Structure

```
src/features/income/
├── README.md           ← This file
├── index.ts            ← Public exports
├── types.ts            ← Income types
├── components/
│   ├── EarningsDashboard.tsx  ← Summary view
│   ├── ManualWorkDayForm.tsx  ← Add work days
│   └── IncomeBreakdown.tsx    ← Category breakdown
├── hooks/
│   └── useIncome.ts           ← Income calculations
└── services/
    └── incomeService.ts       ← Private data CRUD
```

## Privacy

**All data in this module is PRIVATE to the user.**

- Not visible to Captain, Editor, or other crew
- Not part of shared data layer
- Not included in any exports

## Planned Features

### Rate Settings (per user)

| Field | Description |
|-------|-------------|
| Guest day rate | Earnings per charter day (e.g., €210) |
| Non-guest day rate | Earnings per off day (e.g., €105) |
| Contract start | When user's season begins |
| Contract end | When user's season ends |

### Automatic Calculations

- **Guest Days:** Count booking days × guest rate
- **Non-Guest Days:** Count gaps × non-guest rate
- **Tip Share:** Based on Captain's tip split config

### Manual Work Days

For days worked outside bookings (transfers, prep, etc.):
- Date range
- Rate type (guest/non-guest)
- Note (optional)

## Related Docs

- [Product Brief: §13 Personal Income](/docs/Ahoy_Brief_v2.md)
