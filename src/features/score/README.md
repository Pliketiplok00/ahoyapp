# Score Feature

Crew Score Card - gamification feature for tracking crew performance during bookings.

## Overview

The Score Card feature allows the captain to award points to crew members during each booking. Points are fixed values: -3, -2, -1, +1, +2, +3.

## Key Rules

- **Captain Only**: Only captains can add score entries
- **No Edit/Delete**: Scores cannot be edited or deleted. Add opposite points to compensate
- **Visible to All**: All crew members can view the score card
- **Per-Booking Leaderboard**: Shows ranked crew scores for each booking
- **Season Statistics**: Tracks trophy holder (most wins) and horns holder (most losses)

## Components

### ScoreLeaderboard
Displays ranked list of crew members by score.
- Trophy icon for top scorer (if positive)
- Horns/devil icon for lowest scorer (if negative)
- Color-coded points (green/red)

### ScoreHistory
Chronological list of score entries grouped by date.
- Shows crew member, points, reason, and timestamp
- Uses "Today", "Yesterday", or formatted date labels

### ScoreCardPreview
Compact preview for booking detail screen.
- Shows top 4 crew members
- "View All" link to full score card
- "Add" button for captain

### AddScoreEntry
Form for captain to add score entries.
- Crew member selection
- Point value buttons (-3 to +3)
- Optional reason text
- Informational note about non-deletable scores

### ScoreStatsCard
Season-wide statistics display.
- Bar chart of crew point distribution
- Trophy holder (most booking wins)
- Horns holder (most booking losses)

## Data Model

```typescript
interface ScoreEntry {
  id: string;
  bookingId: string;
  toUserId: string;
  points: -3 | -2 | -1 | 1 | 2 | 3;
  reason?: string;
  fromUserId: string;
  createdAt: Timestamp;
}
```

## Usage

```typescript
import { useScoreCard } from './hooks/useScoreCard';

const { leaderboard, entries, addScore, canAddScore } = useScoreCard({
  bookingId: 'booking-123',
  crewMembers,
  currentUserId,
  isCaptain: true,
});

// Add a score (captain only)
await addScore('crew-member-id', 2, 'Great job!');
```

## Tests

Run tests with:
```bash
npm test -- --testPathPattern="features/score"
```
