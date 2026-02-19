# Insights Feature

Season analytics and statistics for reflective mode.

**Status:** Scaffold only - Implementation in Post-MVP

## Planned Structure

```
src/features/insights/
├── README.md           ← This file
├── index.ts            ← Public exports
├── components/
│   ├── SeasonStats.tsx      ← Season overview
│   ├── BookingComparison.tsx ← Side-by-side stats
│   ├── MerchantBreakdown.tsx ← Top merchants
│   └── CalendarView.tsx     ← Visual booking calendar
├── hooks/
│   └── useInsights.ts       ← Stats calculations
└── services/
    └── insightsService.ts   ← Aggregation queries
```

## Planned Stats (Shared - visible to all crew)

| Stat | Description |
|------|-------------|
| Total APA received | Sum across all bookings |
| Total spent | Sum of all expenses |
| Total tips | Sum across all bookings |
| Best tip booking | Highest single tip |
| Lowest spend booking | Most efficient charter |
| Average tip per guest | Total tips ÷ total guests |
| Top merchants | Most frequent expense destinations |

## Design Philosophy

These are **insights, not judgments**.

- "Fuel heavy season" is an observation, not criticism
- No comparisons to other crews/boats
- No performance pressure

## Related Docs

- [Product Brief: §16 Season Insights](/docs/Ahoy_Brief_v2.md)
