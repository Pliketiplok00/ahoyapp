/**
 * Home Screen (Booking Radar)
 *
 * Main dashboard showing active booking, upcoming bookings,
 * and horizon information (days off, season progress).
 */

import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../src/config/theme';
import { Screen } from '../../../src/components/layout';
import { useSeasonStore } from '../../../src/stores/seasonStore';
import { useAuthStore } from '../../../src/stores/authStore';
import { useBookings } from '../../../src/features/booking/hooks/useBookings';
import {
  ActiveBookingCard,
  NextBookingCard,
  HorizonInfo,
  SeasonProgress,
  EmptyState,
} from '../../../src/features/home';

export default function HomeScreen() {
  const { currentSeason, currentSeasonId, crewMembers } = useSeasonStore();
  const { firebaseUser } = useAuthStore();
  const {
    activeBooking,
    upcomingBookings,
    completedBookings,
    bookings,
    isLoading,
    refresh,
  } = useBookings();

  // Get current user's first name for personalized greeting
  const currentCrewMember = crewMembers.find((m) => m.id === firebaseUser?.uid);
  const firstName = currentCrewMember?.name?.split(' ')[0] || 'Crew';

  // Get next booking (first upcoming after active)
  const nextBooking = upcomingBookings[0] || null;

  // Calculate season progress
  const totalBookings = bookings.length;
  const completedCount = completedBookings.length;
  const bookingsRemaining = totalBookings - completedCount - (activeBooking ? 1 : 0);
  const seasonProgress = totalBookings > 0 ? (completedCount / totalBookings) * 100 : 0;

  // Handle no season
  if (!currentSeasonId) {
    return (
      <Screen noPadding edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Ahoy!</Text>
          <Text style={styles.boatName}>Welcome to Ahoy</Text>
        </View>
        <EmptyState type="no-season" testID="empty-state" />
      </Screen>
    );
  }

  // Handle no bookings
  const hasBookings = bookings.length > 0;

  return (
    <Screen noPadding edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Ahoy, {firstName}!</Text>
        <Text style={styles.boatName}>
          {currentSeason?.boatName || 'Your Boat'}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={COLORS.coral}
          />
        }
      >
        {!hasBookings && !isLoading ? (
          <EmptyState type="no-bookings" testID="empty-state-no-bookings" />
        ) : (
          <>
            {/* Active Booking Card */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ACTIVE BOOKING</Text>
              {activeBooking ? (
                <ActiveBookingCard
                  booking={activeBooking}
                  totalSpent={0}
                  testID="active-booking-card"
                />
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyIcon}>{'\u{26F5}'}</Text>
                  <Text style={styles.emptyTitle}>No active booking</Text>
                  <Text style={styles.emptySubtitle}>
                    {upcomingBookings.length > 0
                      ? 'Next booking coming up soon'
                      : 'Add a booking to get started'}
                  </Text>
                </View>
              )}
            </View>

            {/* Horizon Info */}
            <View style={styles.horizonSection}>
              <HorizonInfo
                activeBooking={activeBooking}
                nextBooking={nextBooking}
                seasonProgress={seasonProgress}
                bookingsRemaining={bookingsRemaining}
                testID="horizon-info"
              />
            </View>

            {/* Next Up */}
            {upcomingBookings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>NEXT UP</Text>
                {upcomingBookings.slice(0, 3).map((booking) => (
                  <NextBookingCard
                    key={booking.id}
                    booking={booking}
                    testID={`next-booking-${booking.id}`}
                  />
                ))}
                {upcomingBookings.length > 3 && (
                  <Text style={styles.moreText}>
                    +{upcomingBookings.length - 3} more bookings
                  </Text>
                )}
              </View>
            )}

            {/* Season Progress */}
            {totalBookings > 0 && (
              <View style={styles.section}>
                <SeasonProgress
                  completedBookings={completedCount}
                  totalBookings={totalBookings}
                  testID="season-progress"
                />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.coral,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingTop: SPACING.md,
  },
  greeting: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  boatName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.xs,
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
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
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
  },
  horizonSection: {
    marginBottom: SPACING.lg,
  },
  moreText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.sm,
  },
});
