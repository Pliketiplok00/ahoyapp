# Shopping Feature

Crew provisioning list for before and during charter.

**Status:** Scaffold only - Implementation in Post-MVP

## Planned Structure

```
src/features/shopping/
├── README.md           ← This file
├── index.ts            ← Public exports
├── types.ts            ← Shopping item types (in models.ts)
├── components/
│   ├── ShoppingList.tsx     ← Full list view
│   ├── ShoppingItem.tsx     ← Single item row
│   └── AddItemForm.tsx      ← Quick add form
├── hooks/
│   └── useShopping.ts       ← CRUD operations
└── services/
    └── shoppingService.ts   ← Firestore CRUD
```

## Planned Features

### Basic Operations

- Any crew member can add items
- Any crew member can delete items
- Any crew member can mark as purchased
- Purchased items show strikethrough + purchaser's color

### Display

```
☐ 6L mineral water
☐ Fresh bread (daily)
☑ Olive oil 2L ████ (Marko)
☑ Prosecco x6 ████ (Ana)
```

## Data Model

See `src/types/models.ts` for `ShoppingItem` interface:

| Field | Type | Required |
|-------|------|----------|
| name | string | Yes |
| isPurchased | boolean | No (default: false) |
| purchasedBy | string | Auto (when marked) |
| purchasedAt | Timestamp | Auto |

## Notes

- Separate from expenses (no automatic linking in V1)
- Per-booking list
- Real-time sync across devices

## Related Docs

- [Product Brief: §10 Shopping List](/docs/Ahoy_Brief_v2.md)
