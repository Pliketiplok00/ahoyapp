# Expense Feature

Handles expense capture, OCR processing, and expense management.

**Status:** Scaffold only - Implementation in Phase 6

## Planned Structure

```
src/features/expense/
├── README.md           ← This file
├── index.ts            ← Public exports
├── types.ts            ← Expense types (in models.ts)
├── components/
│   ├── ExpenseItem.tsx     ← Single expense row
│   ├── ExpenseList.tsx     ← Expense list for booking
│   └── ReceiptPreview.tsx  ← Receipt image preview
├── hooks/
│   ├── useExpenses.ts      ← CRUD for expenses
│   ├── useReceiptCapture.ts ← Camera + OCR flow
│   └── useReconciliation.ts ← End-of-booking balance
└── services/
    ├── expenseService.ts   ← Firestore CRUD
    ├── ocrService.ts       ← ML Kit text extraction
    └── imageService.ts     ← Image storage
```

## Planned Features

### Quick Capture (with receipt)
```
Open app → Tap [+] → Camera → Done (5 seconds)
Later: Review → Confirm OCR → Add category
```

### No-Receipt Entry
```
Open app → Tap [+] → "No receipt" → Enter amount + description → Done
```

## Data Model

See `src/types/models.ts` for `Expense` interface:

| Field | Type | Required |
|-------|------|----------|
| amount | number | Yes |
| date | Timestamp | Yes |
| category | ExpenseCategory | Yes |
| merchant | string | Yes |
| receiptUrl | string | If has receipt |
| type | 'receipt' \| 'no-receipt' | Auto |

## Categories (V1 Fixed)

| ID | Label | Icon |
|----|-------|------|
| food | Food & Beverage | 🍕 |
| fuel | Fuel | ⛽ |
| mooring | Mooring | ⚓ |
| other | Other | 📦 |

## Related Docs

- [Product Brief: §5 Expense Flow](/docs/Ahoy_Brief_v2.md)
- [Tech Spec: §6.4 Expense Type](/docs/Ahoy_Tech_Spec.md)
