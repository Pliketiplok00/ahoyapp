/**
 * Bookings Screen (Brutalist)
 *
 * Neo-brutalist list of all bookings for the current season.
 * Groups by status: Active, Upcoming, Completed.
 *
 * @see docs/Ahoy_Screen_Map.md §2.3
 * @see docs/Ahoy_UI_ELEMENTS.md → BookingsScreen
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';

// Theme imports - SVE vrijednosti odavde!
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
  ANIMATION,
} from '@/config/theme';

// Hooks
import { useBookings } from '@/features/booking/hooks/useBookings';

// Utils
import { formatDateShort, formatCurrency } from '@/utils/formatting';

// UI Components
import { EmptyState } from '@/components/ui/EmptyState';

// Types
import type { Booking } from '@/types/models';

// Tab type for active/archived filter
type BookingTab = 'active' | 'archived';

// ============================================
// HELPER FUNCTIONS
// ============================================

function getDaysUntil(date: Date): number {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getDayOfBooking(arrivalDate: Date): number {
  const now = new Date();
  const diff = now.getTime() - arrivalDate.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
}

function getBookingDuration(arrivalDate: Date, departureDate: Date): number {
  return Math.ceil(
    (departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return COLORS.primary;
    case 'upcoming':
      return COLORS.accent;
    case 'completed':
    case 'archived':
      return COLORS.muted;
    case 'cancelled':
      return COLORS.destructive;
    default:
      return COLORS.muted;
  }
}

// ============================================
// COMPONENTS
// ============================================

// --------------------------------------------
// Booking Card (Brutalist)
// --------------------------------------------
interface BookingCardProps {
  booking: Booking;
  onInfo: () => void;
  onShop: () => void;
  onAPA: () => void;
}

function BrutalistBookingCard({ booking, onInfo, onShop, onAPA }: BookingCardProps) {
  const arrivalDate = booking.arrivalDate.toDate();
  const departureDate = booking.departureDate.toDate();

  const isActive = booking.status === 'active';
  const isUpcoming = booking.status === 'upcoming';
  const isCompleted = booking.status === 'completed' || booking.status === 'archived';

  const statusColor = getStatusColor(booking.status);

  // Status text
  let statusText = '';
  if (isActive) {
    const dayOf = getDayOfBooking(arrivalDate);
    const duration = getBookingDuration(arrivalDate, departureDate);
    statusText = `⚡ DAN ${dayOf} OD ${duration}`;
  } else if (isUpcoming) {
    const daysUntil = getDaysUntil(arrivalDate);
    statusText = `⏱ ZA ${daysUntil}D`;
  } else if (isCompleted) {
    statusText = '✓ ZAVRŠENO';
  }

  // APA calculations
  const apa = booking.apaTotal || 0;
  // TODO: Calculate spent from expenses when available
  const spent = 0;
  const left = apa - spent;

  // Display name
  const displayName = booking.notes?.split('\n')[0]?.slice(0, 25) || 'Charter';

  // Marina display
  const marina = booking.departureMarina || booking.arrivalMarina || 'Kaštela';

  return (
    <View style={styles.card}>
      {/* Color strip */}
      <View style={[styles.cardStrip, { backgroundColor: statusColor }]} />

      {/* Card content */}
      <View style={styles.cardContent}>
        {/* Status row */}
        <View style={styles.statusRow}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          <View style={styles.guestBadge}>
            <Text style={styles.guestIcon}>👥</Text>
            <Text style={styles.guestCount}>{booking.guestCount}</Text>
          </View>
        </View>

        {/* Client name */}
        <Text style={styles.clientName}>{displayName}</Text>

        {/* Marina + dates */}
        <View style={styles.marinaRow}>
          <Text style={styles.marinaText}>
            ⚓ {marina} · {formatDateShort(arrivalDate)} → {formatDateShort(departureDate)}
          </Text>
        </View>

        {/* APA row (only for active/completed with APA) */}
        {apa > 0 && (isActive || isCompleted) && (
          <View style={styles.apaRow}>
            <Text style={styles.apaItem}>
              APA: <Text style={styles.apaValue}>{formatCurrency(apa)}</Text>
            </Text>
            <Text style={styles.apaItem}>
              SPENT: <Text style={styles.apaValue}>{formatCurrency(spent)}</Text>
            </Text>
            <Text style={styles.apaItem}>
              LEFT: <Text style={[styles.apaValue, styles.apaLeft]}>{formatCurrency(left)}</Text>
            </Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.actionButtonSecondary,
              pressed && styles.buttonPressed,
            ]}
            onPress={onInfo}
          >
            <Text style={styles.actionButtonText}>INFO</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.actionButtonSecondary,
              pressed && styles.buttonPressed,
            ]}
            onPress={onShop}
          >
            <Text style={styles.actionButtonText}>SHOP</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.actionButtonPrimary,
              pressed && styles.buttonPressed,
            ]}
            onPress={onAPA}
          >
            <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>APA</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function BookingsScreen() {
  const router = useRouter();
  const {
    bookings,
    activeBooking,
    upcomingBookings,
    completedBookings,
    isLoading,
    error,
    refresh,
  } = useBookings();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<BookingTab>('active');

  // Filter bookings based on active tab
  const filteredBookings = useMemo(() => {
    if (activeTab === 'active') {
      // Active tab: show active and upcoming bookings
      return {
        activeBooking,
        upcomingBookings,
        completedBookings: [], // Don't show completed in active tab
      };
    } else {
      // Archived tab: show completed and cancelled bookings
      return {
        activeBooking: null,
        upcomingBookings: [],
        completedBookings, // Show completed in archive tab
      };
    }
  }, [activeTab, activeBooking, upcomingBookings, completedBookings]);

  const handleAddBooking = () => {
    router.push('/booking/new');
  };

  const handleInfo = (bookingId: string) => {
    router.push(`/booking/${bookingId}`);
  };

  const handleShop = (bookingId: string) => {
    router.push(`/booking/shopping/${bookingId}`);
  };

  const handleAPA = (bookingId: string) => {
    router.push(`/booking/expenses/${bookingId}`);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Check if there are bookings for the current tab
  const hasNoActiveBookings = !filteredBookings.activeBooking &&
    filteredBookings.upcomingBookings.length === 0 &&
    filteredBookings.completedBookings.length === 0;
  const hasNoBookings = bookings.length === 0 && !isLoading;

  // Loading state
  if (isLoading && bookings.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>BOOKINGS</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.foreground} />
          <Text style={styles.loadingText}>Učitavanje...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && bookings.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>BOOKINGS</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}
            onPress={refresh}
          >
            <Text style={styles.retryButtonText}>PONOVI</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BOOKINGS</Text>
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.buttonPressed]}
          onPress={handleAddBooking}
        >
          <Text style={styles.addButtonText}>+ DODAJ</Text>
        </Pressable>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <Pressable
          style={({ pressed }) => [
            styles.tab,
            activeTab === 'active' && styles.tabActive,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'active' && styles.tabTextActive,
          ]}>
            AKTIVNI
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.tab,
            activeTab === 'archived' && styles.tabActive,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => setActiveTab('archived')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'archived' && styles.tabTextActive,
          ]}>
            ARHIVIRANI
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {hasNoBookings ? (
          <EmptyState
            icon="📋"
            title="Još nema bookinga"
            subtitle="Kreiraj prvi booking za praćenje troškova"
            actionLabel="+ Dodaj booking"
            onAction={handleAddBooking}
          />
        ) : hasNoActiveBookings ? (
          <EmptyState
            icon={activeTab === 'active' ? '⛵' : '📁'}
            title={activeTab === 'active' ? 'Nema aktivnih bookinga' : 'Nema arhiviranih bookinga'}
            subtitle={activeTab === 'active'
              ? 'Svi bookings su završeni ili otkazani'
              : 'Završeni i otkazani bookings će se pojaviti ovdje'
            }
          />
        ) : (
          <>
            {/* Active Section */}
            {filteredBookings.activeBooking && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>AKTIVNO</Text>
                <BrutalistBookingCard
                  booking={filteredBookings.activeBooking}
                  onInfo={() => handleInfo(filteredBookings.activeBooking!.id)}
                  onShop={() => handleShop(filteredBookings.activeBooking!.id)}
                  onAPA={() => handleAPA(filteredBookings.activeBooking!.id)}
                />
              </View>
            )}

            {/* Upcoming Section */}
            {filteredBookings.upcomingBookings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>NADOLAZEĆE</Text>
                {filteredBookings.upcomingBookings.map((booking) => (
                  <BrutalistBookingCard
                    key={booking.id}
                    booking={booking}
                    onInfo={() => handleInfo(booking.id)}
                    onShop={() => handleShop(booking.id)}
                    onAPA={() => handleAPA(booking.id)}
                  />
                ))}
              </View>
            )}

            {/* Completed/Archived Section */}
            {filteredBookings.completedBookings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  {activeTab === 'archived' ? 'ARHIVIRANO' : 'ZAVRŠENO'}
                </Text>
                {filteredBookings.completedBookings.map((booking) => (
                  <BrutalistBookingCard
                    key={booking.id}
                    booking={booking}
                    onInfo={() => handleInfo(booking.id)}
                    onShop={() => handleShop(booking.id)}
                    onAPA={() => handleAPA(booking.id)}
                  />
                ))}
              </View>
            )}
          </>
        )}

        {/* Bottom spacing for tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.foreground,
    paddingTop: SPACING.xxl + SPACING.md, // Safe area + padding
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  addButton: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    ...SHADOWS.brutSm,
  },
  addButtonText: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderBottomWidth: BORDERS.normal,
    borderBottomColor: COLORS.foreground,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: BORDERS.thin,
    borderRightColor: COLORS.foreground,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  tabTextActive: {
    color: COLORS.foreground,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },

  // Sections
  section: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    marginBottom: SPACING.sm,
  },

  // Card
  card: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.brut,
  },
  cardStrip: {
    height: 4,
    width: '100%',
  },
  cardContent: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },

  // Status row
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.label,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  guestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  guestIcon: {
    fontSize: TYPOGRAPHY.sizes.body,
  },
  guestCount: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Client name
  clientName: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },

  // Marina row
  marinaRow: {
    marginTop: SPACING.xs,
  },
  marinaText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
  },

  // APA row
  apaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
  },
  apaItem: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
  },
  apaValue: {
    fontFamily: FONTS.monoBold,
    color: COLORS.foreground,
  },
  apaLeft: {
    color: COLORS.accent,
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    ...SHADOWS.brutSm,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.muted,
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  actionButtonTextPrimary: {
    color: COLORS.foreground,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginTop: SPACING.md,
  },

  // Error state
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
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.destructive,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.brut,
  },
  retryButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },

  // Press state
  buttonPressed: {
    transform: ANIMATION.pressedTransform,
  },

  // Bottom spacer
  bottomSpacer: {
    height: SPACING.xxl,
  },
});
