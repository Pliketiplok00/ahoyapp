/**
 * Calendar Utilities
 *
 * Helper functions for generating calendar data.
 */

import type { Season, Booking, Timestamp } from '../../../types/models';

// Croatian day names (starting Monday)
export const DAY_NAMES = ['PON', 'UTO', 'SRI', 'ČET', 'PET', 'SUB', 'NED'] as const;

// Croatian month names
export const MONTH_NAMES = [
  'SIJEČANJ',
  'VELJAČA',
  'OŽUJAK',
  'TRAVANJ',
  'SVIBANJ',
  'LIPANJ',
  'SRPANJ',
  'KOLOVOZ',
  'RUJAN',
  'LISTOPAD',
  'STUDENI',
  'PROSINAC',
] as const;

export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  bookings: Booking[];
}

export interface CalendarMonth {
  year: number;
  month: number; // 0-indexed
  days: CalendarDay[];
  isCurrentMonth: boolean;
}

/**
 * Convert Timestamp to Date
 */
export function timestampToDate(ts: Timestamp): Date {
  if (ts.toDate) {
    return ts.toDate();
  }
  return new Date(ts.seconds * 1000);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Check if a date falls within a booking range (inclusive)
 */
export function isDateInBooking(date: Date, booking: Booking): boolean {
  const arrival = timestampToDate(booking.arrivalDate);
  const departure = timestampToDate(booking.departureDate);

  // Normalize to start of day for comparison
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const arrivalStart = new Date(arrival.getFullYear(), arrival.getMonth(), arrival.getDate());
  const departureStart = new Date(departure.getFullYear(), departure.getMonth(), departure.getDate());

  return dateStart >= arrivalStart && dateStart <= departureStart;
}

/**
 * Check if date is first day of booking
 */
export function isFirstDayOfBooking(date: Date, booking: Booking): boolean {
  const arrival = timestampToDate(booking.arrivalDate);
  return isSameDay(date, arrival);
}

/**
 * Check if date is last day of booking
 */
export function isLastDayOfBooking(date: Date, booking: Booking): boolean {
  const departure = timestampToDate(booking.departureDate);
  return isSameDay(date, departure);
}

/**
 * Generate calendar months for the season
 */
export function generateCalendarMonths(season: Season, bookings: Booking[]): CalendarMonth[] {
  const startDate = timestampToDate(season.startDate);
  const endDate = timestampToDate(season.endDate);
  const today = new Date();
  const months: CalendarMonth[] = [];

  // Start from season start month
  let currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (currentMonth <= endMonth) {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days: CalendarDay[] = [];

    // Get first day of month and last day of month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Get the day of week for first day (0 = Sunday, convert to Monday = 0)
    let startDayOfWeek = firstDayOfMonth.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Convert to Monday-based

    // Add empty days for alignment (previous month)
    for (let i = 0; i < startDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startDayOfWeek + i + 1);
      days.push({
        date: prevDate,
        dayOfMonth: prevDate.getDate(),
        isCurrentMonth: false,
        isToday: isSameDay(prevDate, today),
        isPast: prevDate < today,
        bookings: bookings.filter((b) => isDateInBooking(prevDate, b)),
      });
    }

    // Add days of the month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        dayOfMonth: day,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        isPast: date < today && !isSameDay(date, today),
        bookings: bookings.filter((b) => isDateInBooking(date, b)),
      });
    }

    // Fill remaining days to complete the grid (next month)
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        const nextDate = new Date(year, month + 1, i);
        days.push({
          date: nextDate,
          dayOfMonth: i,
          isCurrentMonth: false,
          isToday: isSameDay(nextDate, today),
          isPast: nextDate < today,
          bookings: bookings.filter((b) => isDateInBooking(nextDate, b)),
        });
      }
    }

    months.push({
      year,
      month,
      days,
      isCurrentMonth: year === today.getFullYear() && month === today.getMonth(),
    });

    // Move to next month
    currentMonth = new Date(year, month + 1, 1);
  }

  return months;
}
