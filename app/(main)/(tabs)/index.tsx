/**
 * Home Screen (Booking Radar)
 *
 * Main dashboard showing active booking, upcoming bookings.
 * Neo-brutalist design with offset shadows and sharp corners.
 *
 * @see docs/Ahoy_Screen_Map.md §2.1
 * @see docs/Ahoy_DESIGN_RULES.md
 */

import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

// Theme imports - SVE vrijednosti dolaze odavde!
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
  ANIMATION,
  SIZES,
} from '@/config/theme';
import { Warning, Sailboat } from 'phosphor-react-native';
import { useAppTranslation } from '@/i18n';

// Stores
import { useSeasonStore } from '@/stores/seasonStore';
import { useAuthStore } from '@/stores/authStore';

// Hooks
import { useBookings } from '@/features/booking/hooks/useBookings';

// Services
import { getBookingExpenseTotal } from '@/features/expense/services/expenseService';

// Utils
import { formatDateShort, formatCurrency } from '@/utils/formatting';

// Types
import type { Booking } from '@/types/models';

// UI Components
import { SectionBadge } from '@/components/ui/SectionBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';

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

function getMarinaInitials(marina: string): string {
  const abbrevs: Record<string, string> = {
    Kaštela: 'KAŠ',
    Dubrovnik: 'DBK',
    Split: 'SPL',
    Zadar: 'ZAD',
    Šibenik: 'ŠIB',
    Hvar: 'HVR',
    Korčula: 'KOR',
  };
  return abbrevs[marina] || marina.slice(0, 3).toUpperCase();
}

// ============================================
// COMPONENTS
// ============================================

// --------------------------------------------
// Active Booking Card
// --------------------------------------------
interface ActiveBookingCardProps {
  booking: Booking;
  expenseTotal?: number;
}

function ActiveBookingCard({ booking, expenseTotal = 0 }: ActiveBookingCardProps) {
  const router = useRouter();

  const arrivalDate = booking.arrivalDate.toDate();
  const departureDate = booking.departureDate.toDate();

  const apa = booking.apaTotal || 0;
  // Calculate spent: use expenseTotal prop, or derive from reconciliation if available
  const spent = expenseTotal > 0
    ? expenseTotal
    : booking.reconciliation
      ? apa - booking.reconciliation.expectedCash
      : 0;
  const remaining = apa - spent;
  const duration = getBookingDuration(arrivalDate, departureDate);
  const dayOf = getDayOfBooking(arrivalDate);
  const spentPct = apa > 0 ? Math.min((spent / apa) * 100, 100) : 0;

  // Display name (using notes or generic label)
  const displayName = booking.notes?.split('\n')[0]?.slice(0, 30) || 'Charter';

  return (
    <View style={styles.activeCard}>
      {/* Status + dates row */}
      <View style={styles.activeCardHeader}>
        <StatusBadge label="UŽIVO" variant="accent" />
        <Text style={styles.dateRangeText}>
          {formatDateShort(arrivalDate)} → {formatDateShort(departureDate)}
        </Text>
      </View>

      {/* Display name */}
      <Text style={styles.clientName}>{displayName}</Text>

      {/* Stat boxes */}
      <View style={styles.statBoxRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>GOSTI</Text>
          <Text style={styles.statValue}>{booking.guestCount}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>DAN</Text>
          <Text style={styles.statValue}>
            {dayOf}/{duration}
          </Text>
        </View>
      </View>

      {/* APA progress */}
      {apa > 0 && (
        <View style={styles.apaSection}>
          <View style={styles.apaLabels}>
            <Text style={styles.apaLabelText}>
              POTROŠENO: <Text style={styles.apaValueText}>{formatCurrency(spent)}</Text>
            </Text>
            <Text style={styles.apaLabelText}>
              PREOSTALO: <Text style={styles.apaValueText}>{formatCurrency(remaining)}</Text>
            </Text>
          </View>
          <ProgressBar progress={spentPct} />
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionButtonRow}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionButtonPrimary,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push(`/booking/expenses/${booking.id}`)}
        >
          <Text style={styles.actionButtonText}>APA</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionButtonPrimary,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push(`/booking/shopping/${booking.id}`)}
        >
          <Text style={styles.actionButtonText}>SHOP</Text>
        </Pressable>
      </View>

      {/* View details button */}
      <Pressable
        style={({ pressed }) => [
          styles.viewDetailsButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => router.push(`/booking/${booking.id}`)}
      >
        <Text style={styles.viewDetailsText}>PRIKAŽI DETALJE →</Text>
      </Pressable>
    </View>
  );
}

// --------------------------------------------
// Next Booking Card
// --------------------------------------------
function NextBookingCard({ booking }: { booking: Booking }) {
  const router = useRouter();

  const arrivalDate = booking.arrivalDate.toDate();
  const departureDate = booking.departureDate.toDate();
  const daysUntil = getDaysUntil(arrivalDate);

  // Show marina initials if not Kaštela
  const showMarina =
    booking.departureMarina !== 'Kaštela' || booking.arrivalMarina !== 'Kaštela';
  const marinaInitials = showMarina
    ? getMarinaInitials(booking.departureMarina || booking.arrivalMarina)
    : null;

  // Display name
  const displayName = booking.notes?.split('\n')[0]?.slice(0, 25) || 'Charter';

  return (
    <Pressable
      style={({ pressed }) => [styles.nextCard, pressed && styles.buttonPressed]}
      onPress={() => router.push(`/booking/${booking.id}`)}
    >
      <View style={styles.nextCardContent}>
        <Text style={styles.daysUntilText}>ZA {daysUntil} DANA</Text>
        <Text style={styles.nextClientName}>{displayName}</Text>
        <Text style={styles.nextDateText}>
          {formatDateShort(arrivalDate)} — {formatDateShort(departureDate)}
        </Text>
      </View>
      {marinaInitials && (
        <View style={styles.initialsBox}>
          <Text style={styles.initialsText}>{marinaInitials}</Text>
        </View>
      )}
    </Pressable>
  );
}


// ============================================
// MAIN SCREEN
// ============================================

export default function HomeScreen() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const { currentSeason, currentSeasonId, crewMembers } = useSeasonStore();
  const { firebaseUser } = useAuthStore();
  const { bookings, activeBooking, upcomingBookings, isLoading, error, refresh } = useBookings();

  // State for active booking expense total
  const [activeExpenseTotal, setActiveExpenseTotal] = useState(0);

  // Fetch expense total for active booking
  useEffect(() => {
    if (activeBooking?.id) {
      getBookingExpenseTotal(activeBooking.id).then((result) => {
        if (result.success && result.data !== undefined) {
          setActiveExpenseTotal(result.data);
        }
      });
    } else {
      setActiveExpenseTotal(0);
    }
  }, [activeBooking?.id]);

  // Refresh bookings when tab gets focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Get current user's first name for greeting
  const currentCrewMember = crewMembers.find((m) => m.id === firebaseUser?.uid);
  const firstName = currentCrewMember?.name?.split(' ')[0] || 'Crew';

  const hasNoBookings = bookings.length === 0 && !isLoading;

  const handleAddBooking = () => {
    router.push('/booking/new');
  };

  // No season selected
  if (!currentSeasonId) {
    return (
      <View style={styles.container}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroTitle}>AHOY!</Text>
          <Text style={styles.heroSubtitle}>{currentSeason?.boatName || t('home.defaultBoatName')}</Text>
          {currentSeason?.name ? <Text style={styles.heroSeasonName}>{currentSeason.name}</Text> : null}
        </View>
        <EmptyState
          icon={<Sailboat size={64} color={COLORS.foreground} weight="regular" />}
          title="Nije odabrana sezona"
          subtitle="Kreiraj ili se pridruži sezoni za početak"
        />
      </View>
    );
  }

  // Loading state
  if (isLoading && bookings.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroTitle}>AHOY!</Text>
          <Text style={styles.heroSubtitle}>
            {currentSeason?.boatName || 'S/Y CREW SEASON'}
          </Text>
          {currentSeason?.name ? (
            <Text style={styles.heroSeasonName}>{currentSeason.name}</Text>
          ) : null}
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Učitavanje...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && bookings.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroTitle}>AHOY!</Text>
          <Text style={styles.heroSubtitle}>
            {currentSeason?.boatName || 'S/Y CREW SEASON'}
          </Text>
          {currentSeason?.name ? (
            <Text style={styles.heroSeasonName}>{currentSeason.name}</Text>
          ) : null}
        </View>
        <View style={styles.errorContainer}>
          <Warning size={SIZES.icon.xl} color={COLORS.destructive} weight="fill" />
          <Text style={styles.errorText}>Greška pri učitavanju</Text>
          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}
            onPress={refresh}
          >
            <Text style={styles.retryButtonText}>POKUŠAJ PONOVO</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hero Header */}
      <View style={styles.heroHeader}>
        <Text style={styles.heroTitle}>AHOY!</Text>
        <Text style={styles.heroSubtitle}>
          {currentSeason?.boatName || 'S/Y CREW SEASON'}
        </Text>
        {currentSeason?.name ? (
          <Text style={styles.heroSeasonName}>{currentSeason.name}</Text>
        ) : null}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {hasNoBookings ? (
          <EmptyState
            icon={<Sailboat size={64} color={COLORS.foreground} weight="regular" />}
            title="Još nema bookinga"
            subtitle="Dodaj prvi booking za početak"
            actionLabel="+ Dodaj prvi booking"
            onAction={handleAddBooking}
          />
        ) : (
          <>
            {/* Active Booking Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <SectionBadge label="AKTIVNI CHARTER" variant="accent" />
              </View>
              {activeBooking ? (
                <ActiveBookingCard booking={activeBooking} expenseTotal={activeExpenseTotal} />
              ) : (
                <View style={styles.noActiveCard}>
                  <Text style={styles.noActiveText}>Nema aktivnog chartera</Text>
                  <Text style={styles.noActiveSubtext}>
                    {upcomingBookings.length > 0
                      ? 'Sljedeći booking uskoro'
                      : 'Dodaj booking za početak'}
                  </Text>
                </View>
              )}
            </View>

            {/* Upcoming Bookings Section */}
            {upcomingBookings.length > 0 && (
              <View style={styles.section}>
                <SectionBadge label="SLJEDEĆE" variant="pink" />
                <View style={styles.upcomingList}>
                  {upcomingBookings.slice(0, 3).map((booking) => (
                    <NextBookingCard key={booking.id} booking={booking} />
                  ))}
                  {upcomingBookings.length > 3 && (
                    <Text style={styles.moreText}>
                      +{upcomingBookings.length - 3} dodatnih bookinga
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Add Booking Button (when no active) */}
            {!activeBooking && upcomingBookings.length === 0 && (
              <Pressable
                style={({ pressed }) => [
                  styles.addBookingButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleAddBooking}
              >
                <Text style={styles.addBookingButtonText}>+ Dodaj booking</Text>
              </Pressable>
            )}
          </>
        )}
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

  // Hero Header
  heroHeader: {
    backgroundColor: COLORS.primary,
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.foreground,
    paddingTop: SPACING.xxl + SPACING.md, // Safe area + padding
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  heroTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.hero,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  heroSubtitle: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    marginTop: SPACING.xs,
  },
  heroSeasonName: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    opacity: 0.5,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginTop: SPACING.xs,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    gap: SPACING.lg,
  },

  // Loading
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

  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorIcon: {
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

  // Section
  section: {
    gap: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Active Card
  activeCard: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.brut,
  },
  activeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRangeText: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  clientName: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },

  // Stat Boxes
  statBoxRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.sm,
  },
  statLabel: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },

  // APA Progress
  apaSection: {
    gap: SPACING.sm,
  },
  apaLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  apaLabelText: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
  },
  apaValueText: {
    color: COLORS.foreground,
  },

  // Action Buttons
  actionButtonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    ...SHADOWS.brutSm,
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  viewDetailsButton: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    backgroundColor: COLORS.transparent,
  },
  viewDetailsText: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
  },

  // Next Card
  nextCard: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    ...SHADOWS.brutSm,
  },
  nextCardContent: {
    flex: 1,
  },
  daysUntilText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.pink,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginBottom: SPACING.xs,
  },
  nextClientName: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  nextDateText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    marginTop: SPACING.xs,
  },
  initialsBox: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brutSm,
  },
  initialsText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Upcoming List
  upcomingList: {
    gap: SPACING.sm,
  },

  // No Active Card
  noActiveCard: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.brut,
  },
  noActiveText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  noActiveSubtext: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    marginTop: SPACING.xs,
  },

  // Add Booking Button
  addBookingButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    ...SHADOWS.brut,
  },
  addBookingButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    textTransform: 'uppercase',
  },

  // More text
  moreText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    paddingVertical: SPACING.sm,
  },

  // Pressed State (shared)
  buttonPressed: {
    transform: ANIMATION.pressedTransform,
  },
});
