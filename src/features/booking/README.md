# Booking Feature

Handles all booking-related functionality for the Ahoy app.

## Structure

```
src/features/booking/
├── README.md           ← This file
├── index.ts            ← Public exports
├── components/
│   └── BookingCard.tsx ← Booking card with 3 variants
├── hooks/
│   ├── useBookings.ts  ← List management for season
│   └── useBooking.ts   ← Single booking operations
└── services/
    └── bookingService.ts ← Firestore CRUD operations
```

## Usage

### Display Bookings List

```tsx
import { useBookings, BookingCard } from '../features/booking';

function BookingsScreen() {
  const { bookings, activeBooking, upcomingBookings, isLoading } = useBookings();

  return (
    <>
      {activeBooking && (
        <BookingCard booking={activeBooking} variant="expanded" />
      )}
      {upcomingBookings.map(b => (
        <BookingCard key={b.id} booking={b} onPress={() => handlePress(b.id)} />
      ))}
    </>
  );
}
```

### Create a Booking

```tsx
import { useBookings } from '../features/booking';

function NewBookingScreen() {
  const { createBooking } = useBookings();

  const handleSubmit = async () => {
    const result = await createBooking({
      seasonId,
      arrivalDate,
      departureDate,
      departureMarina,
      arrivalMarina,
      guestCount,
      notes,
      createdBy: userId,
    });

    if (result.success) {
      router.back();
    }
  };
}
```

### Single Booking Operations

```tsx
import { useBooking } from '../features/booking';

function BookingDetailScreen({ id }: { id: string }) {
  const { booking, isLoading, cancel, update, refresh } = useBooking(id);

  const handleCancel = async () => {
    const result = await cancel();
    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };
}
```

## BookingCard Variants

- `default` - Standard card with date, marina route, status badge
- `compact` - Minimal row with status indicator
- `expanded` - Full card with stats row (guests, APA, tip) and notes

## Booking Status

Status is calculated automatically based on dates:

| Status | Condition |
|--------|-----------|
| `upcoming` | arrivalDate > today |
| `active` | arrivalDate <= today <= departureDate |
| `completed` | departureDate < today (set manually) |
| `cancelled` | Manually cancelled |
| `archived` | Manually archived after completion |

## Service Methods

| Method | Description |
|--------|-------------|
| `createBooking(input)` | Create new booking |
| `getBooking(id)` | Get single booking |
| `getSeasonBookings(seasonId)` | Get all bookings for season |
| `updateBooking(id, updates)` | Update booking fields |
| `deleteBooking(id)` | Delete booking permanently |
| `cancelBooking(id)` | Set status to cancelled |
| `completeBooking(id, tip?)` | Set status to completed |
| `archiveBooking(id)` | Set status to archived |
| `updateApaTotal(id, amount)` | Update APA total |
| `checkDateOverlap(...)` | Check for overlapping bookings |
| `getSeasonBookingStats(seasonId)` | Get season statistics |

## Notes

- All dates use HR locale formatting (DD.MM.YYYY.)
- Currency uses HR format (1.234,56 €)
- Status badge shows countdown for upcoming ("za 3 d.") and remaining for active ("3 d. preostalo")
