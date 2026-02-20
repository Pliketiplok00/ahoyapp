/**
 * SeasonCalendar Component
 *
 * Calendar view showing booking ranges across the season.
 * Brutalist design: square cells, no rounded corners.
 */

import { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  COLORS,
  SPACING,
  BORDERS,
  BORDER_RADIUS,
  FONTS,
  TYPOGRAPHY,
  SHADOWS,
  ANIMATION,
} from '../../../config/theme';
import type { Season, Booking } from '../../../types/models';
import {
  generateCalendarMonths,
  isFirstDayOfBooking,
  isLastDayOfBooking,
  DAY_NAMES,
  MONTH_NAMES,
  type CalendarDay,
} from '../utils/calendarUtils';

interface SeasonCalendarProps {
  season: Season;
  bookings: Booking[];
  testID?: string;
}

/**
 * Get booking color (use primary if no custom color)
 */
function getBookingColor(booking: Booking): string {
  // Bookings don't have color field, use status-based colors
  switch (booking.status) {
    case 'active':
      return COLORS.status.active;
    case 'upcoming':
      return COLORS.status.upcoming;
    case 'completed':
      return COLORS.status.completed;
    default:
      return COLORS.primary;
  }
}

export function SeasonCalendar({ season, bookings, testID }: SeasonCalendarProps) {
  const router = useRouter();

  // Generate calendar data
  const calendarMonths = useMemo(
    () => generateCalendarMonths(season, bookings),
    [season, bookings]
  );

  // Handle day press - navigate to first booking on that day
  const handleDayPress = useCallback(
    (day: CalendarDay) => {
      if (day.bookings.length > 0) {
        const booking = day.bookings[0];
        router.push(`/booking/${booking.id}`);
      }
    },
    [router]
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      testID={testID}
    >
      {calendarMonths.map((monthData) => (
        <View key={`${monthData.year}-${monthData.month}`} style={styles.monthContainer}>
          {/* Month Header */}
          <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>
              {MONTH_NAMES[monthData.month]} {monthData.year}
            </Text>
            {monthData.isCurrentMonth && (
              <View style={styles.nowBadge}>
                <Text style={styles.nowBadgeText}>NOW</Text>
              </View>
            )}
          </View>

          {/* Day Names Header */}
          <View style={styles.dayNamesRow}>
            {DAY_NAMES.map((dayName) => (
              <View key={dayName} style={styles.dayNameCell}>
                <Text style={styles.dayNameText}>{dayName}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {monthData.days.map((day, index) => {
              const hasBooking = day.bookings.length > 0;
              const booking = day.bookings[0]; // Show first booking for styling
              const isFirstDay = hasBooking && isFirstDayOfBooking(day.date, booking);
              const isLastDay = hasBooking && isLastDayOfBooking(day.date, booking);
              const bookingColor = hasBooking ? getBookingColor(booking) : undefined;

              return (
                <Pressable
                  key={index}
                  style={({ pressed }) => [
                    styles.dayCell,
                    !day.isCurrentMonth && styles.dayCellOtherMonth,
                    day.isToday && styles.dayCellToday,
                    day.isPast && day.isCurrentMonth && styles.dayCellPast,
                    hasBooking && styles.dayCellWithBooking,
                    hasBooking && { backgroundColor: bookingColor },
                    isFirstDay && styles.dayCellFirstDay,
                    isLastDay && styles.dayCellLastDay,
                    pressed && hasBooking && styles.dayCellPressed,
                  ]}
                  onPress={() => handleDayPress(day)}
                  disabled={!hasBooking}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !day.isCurrentMonth && styles.dayTextOtherMonth,
                      day.isToday && styles.dayTextToday,
                      day.isPast && day.isCurrentMonth && styles.dayTextPast,
                      hasBooking && styles.dayTextWithBooking,
                    ]}
                  >
                    {day.dayOfMonth}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      {/* Bottom spacing */}
      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Month Container
  monthContainer: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    margin: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.brut,
  },

  // Month Header
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  monthTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  nowBadge: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    ...SHADOWS.brutSm,
  },
  nowBadgeText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.foreground,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
  },

  // Day Names Row
  dayNamesRow: {
    flexDirection: 'row',
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.foreground,
    paddingBottom: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  dayNameText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },

  // Calendar Grid
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // Day Cell
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: BORDERS.thin,
    borderColor: COLORS.muted,
    borderRadius: BORDER_RADIUS.none, // SQUARE!
    backgroundColor: COLORS.card,
  },
  dayCellOtherMonth: {
    backgroundColor: COLORS.muted,
    opacity: 0.4,
  },
  dayCellToday: {
    borderColor: COLORS.accent,
    borderWidth: BORDERS.normal,
  },
  dayCellPast: {
    opacity: 0.5,
  },
  dayCellWithBooking: {
    borderColor: COLORS.foreground,
  },
  dayCellFirstDay: {
    borderLeftWidth: BORDERS.heavy,
    borderLeftColor: COLORS.foreground,
  },
  dayCellLastDay: {
    borderRightWidth: BORDERS.heavy,
    borderRightColor: COLORS.foreground,
  },
  dayCellPressed: {
    transform: ANIMATION.pressedTransform,
  },

  // Day Text
  dayText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  dayTextOtherMonth: {
    color: COLORS.mutedForeground,
  },
  dayTextToday: {
    fontFamily: FONTS.display,
    color: COLORS.foreground,
  },
  dayTextPast: {
    color: COLORS.mutedForeground,
  },
  dayTextWithBooking: {
    color: COLORS.white,
    fontFamily: FONTS.display,
  },
});
