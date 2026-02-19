# Season Feature

Handles season (workspace) management - creation, joining, and crew invites.

## Structure

```
src/features/season/
├── README.md           ← This file
├── index.ts            ← Public exports
├── types.ts            ← Season types
├── components/         ← (empty - no UI components yet)
├── hooks/
│   ├── index.ts
│   └── useSeason.ts    ← Season operations hook
└── services/
    ├── index.ts
    └── seasonService.ts ← Firestore CRUD for seasons
```

## Usage

### Create a Season (First Onboarder)

```tsx
import { useSeason } from '../features/season';

function CreateBoatScreen() {
  const { createSeason, isLoading } = useSeason();

  const handleCreate = async () => {
    const result = await createSeason({
      boatName: 'M/Y Serenity',
      name: 'Summer 2026',
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-10-31'),
      currency: 'EUR',
    });

    if (result.success) {
      // Navigate to main app
    }
  };
}
```

### Join Existing Season

```tsx
const { joinSeason } = useSeason();

const handleJoin = async (inviteCode: string) => {
  const result = await joinSeason(inviteCode);
  if (result.success) {
    // Navigate to main app
  }
};
```

### Generate Invite Link

```tsx
const { generateInviteLink, currentSeason } = useSeason();

const handleInvite = async () => {
  if (!currentSeason) return;

  const result = await generateInviteLink(currentSeason.id);
  if (result.success) {
    // Share result.data.inviteLink
  }
};
```

## Season Store

Season state is managed in `src/stores/seasonStore.ts` using Zustand.

| State | Type | Description |
|-------|------|-------------|
| `currentSeasonId` | `string \| null` | Active season ID |
| `hasCompletedOnboarding` | `boolean` | Onboarding status |

## Service Methods

| Method | Description |
|--------|-------------|
| `createSeason(input)` | Create new season (workspace) |
| `getSeason(id)` | Get season by ID |
| `joinSeason(inviteCode)` | Join existing season |
| `generateInviteLink(seasonId)` | Create shareable invite link |

## Season Lifecycle

```
Create Season
     │
     ▼
Season Active (May 1 - Oct 31)
     │
     ▼ (end date passes)
Season Archived
     │
     ▼
All bookings → Archived
Data → Read-only
```

## Related Docs

- [Product Brief: §8 Season Lifecycle](/docs/Ahoy_Brief_v2.md)
- [Tech Spec: §6.1 Season Type](/docs/Ahoy_Tech_Spec.md)
