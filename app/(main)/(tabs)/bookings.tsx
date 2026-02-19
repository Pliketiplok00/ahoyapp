/**
 * Bookings Screen
 *
 * List of all bookings for the current season.
 * Allows creating, viewing, and managing bookings.
 */

import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { Screen } from '../../../src/components/layout';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../src/config/theme';
import { useBookings, BookingCard } from '../../../src/features/booking';

export default function BookingsScreen() {
  const router = useRouter();
  const {
    bookings,
    activeBooking,
    upcomingBookings,
    isLoading,
    error,
    refresh,
  } = useBookings();

  const [refreshing, setRefreshing] = useState(false);

  const handleAddBooking = () => {
    router.push('/booking/new');
  };

  const handleBookingPress = (bookingId: string) => {
    router.push(`/booking/${bookingId}`);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Loading state
  if (isLoading && bookings.length === 0) {
    return (
      <Screen noPadding edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Bookings</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.coral} />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      </Screen>
    );
  }

  // Error state
  if (error && bookings.length === 0) {
    return (
      <Screen noPadding edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Bookings</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  // Empty state
  if (bookings.length === 0) {
    return (
      <Screen noPadding edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Bookings</Text>
          <Pressable style={styles.addButton} onPress={handleAddBooking}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </Pressable>
        </View>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first booking to start tracking expenses
            </Text>
            <Pressable style={styles.createButton} onPress={handleAddBooking}>
              <Text style={styles.createButtonText}>Create Booking</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Screen>
    );
  }

  // Bookings list
  return (
    <Screen noPadding edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Pressable style={styles.addButton} onPress={handleAddBooking}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Active Booking */}
        {activeBooking && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACTIVE</Text>
            <BookingCard
              booking={activeBooking}
              variant="expanded"
              onPress={() => handleBookingPress(activeBooking.id)}
            />
          </View>
        )}

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>UPCOMING</Text>
            {upcomingBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPress={() => handleBookingPress(booking.id)}
              />
            ))}
          </View>
        )}

        {/* All Bookings (filtered view) */}
        {!activeBooking && upcomingBookings.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ALL BOOKINGS</Text>
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPress={() => handleBookingPress(booking.id)}
              />
            ))}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.coral,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingTop: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.coral,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  createButton: {
    backgroundColor: COLORS.coral,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  createButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONT_SIZES.lg,
  },
  bottomSpacer: {
    height: SPACING.xxl,
  },
});
