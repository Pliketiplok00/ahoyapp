/**
 * AHOY - HomeScreen Reference Implementation
 * ==========================================
 * Ovo je VIZUALNA REFERENCA za brutalist dizajn.
 * 
 * PRAVILA:
 * - SVE boje dolaze iz COLORS (nikad hardcoded)
 * - SVE shadows dolaze iz SHADOWS (nikad hardcoded)
 * - SVE spacing dolazi iz SPACING (nikad hardcoded brojevi)
 * - SVE font sizes dolaze iz TYPOGRAPHY.sizes
 * - SVE fontovi dolaze iz FONTS
 * - Border radius je UVIJEK 0
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, TrendingUp } from 'lucide-react-native';

// Theme imports - SVE vrijednosti dolaze odavde!
import { 
  COLORS, 
  SHADOWS, 
  BORDERS, 
  SPACING, 
  TYPOGRAPHY, 
  FONTS,
  BORDER_RADIUS,
} from '../config/theme';

// App hooks
import { useBookings } from '../features/booking/hooks/useBookings';
import { useSeason } from '../features/season/hooks/useSeason';
import { useAuth } from '../features/auth/hooks/useAuth';

// Utils
import { formatDate, formatCurrency } from '../utils/format';

// ============================================
// HELPER FUNCTIONS
// ============================================

function getDaysUntil(date: Date): number {
  const now = new Date();
  const diff = new Date(date).getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getDayOfBooking(arrivalDate: Date): number {
  const now = new Date();
  const arrival = new Date(arrivalDate);
  const diff = now.getTime() - arrival.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
}

function getBookingDuration(arrivalDate: Date, departureDate: Date): number {
  const arrival = new Date(arrivalDate);
  const departure = new Date(departureDate);
  return Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24));
}

// ============================================
// COMPONENTS
// ============================================

interface Booking {
  id: string;
  clientName: string;
  arrivalDate: Date;
  departureDate: Date;
  guestCount: number;
  status: 'Active' | 'Upcoming' | 'Completed' | 'Cancelled';
  departureMarina?: string;
  apaTotal?: number;
  expensesTotal?: number;
}

// --------------------------------------------
// Section Badge Component
// --------------------------------------------
function SectionBadge({ 
  label, 
  variant = 'accent' 
}: { 
  label: string; 
  variant?: 'accent' | 'pink';
}) {
  const bgColor = variant === 'pink' ? COLORS.pink : COLORS.accent;
  
  return (
    <View style={[styles.sectionBadge, { backgroundColor: bgColor }]}>
      <Text style={styles.sectionBadgeText}>{label}</Text>
    </View>
  );
}

// --------------------------------------------
// Active Booking Card
// --------------------------------------------
function ActiveBookingCard({ booking }: { booking: Booking }) {
  const router = useRouter();
  
  const apa = booking.apaTotal || 0;
  const spent = booking.expensesTotal || 0;
  const remaining = apa - spent;
  const duration = getBookingDuration(booking.arrivalDate, booking.departureDate);
  const dayOf = getDayOfBooking(booking.arrivalDate);
  const spentPct = apa > 0 ? Math.min((spent / apa) * 100, 100) : 0;

  return (
    <View style={styles.activeCard}>
      {/* Status + dates row */}
      <View style={styles.activeCardHeader}>
        <View style={styles.liveNowBadge}>
          <Text style={styles.liveNowText}>LIVE NOW</Text>
        </View>
        <Text style={styles.dateRangeText}>
          {formatDate(booking.arrivalDate)} → {formatDate(booking.departureDate)}
        </Text>
      </View>

      {/* Client name */}
      <Text style={styles.clientName}>{booking.clientName}</Text>

      {/* Stat boxes */}
      <View style={styles.statBoxRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>GUESTS</Text>
          <Text style={styles.statValue}>{booking.guestCount}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>DAY</Text>
          <Text style={styles.statValue}>{dayOf}/{duration}</Text>
        </View>
      </View>

      {/* APA progress */}
      {apa > 0 && (
        <View style={styles.apaSection}>
          <View style={styles.apaLabels}>
            <Text style={styles.apaLabelText}>
              SPENT: <Text style={styles.apaValueText}>{formatCurrency(spent)}</Text>
            </Text>
            <Text style={styles.apaLabelText}>
              SAFE: <Text style={styles.apaValueText}>{formatCurrency(remaining)}</Text>
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${spentPct}%` }]} />
          </View>
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
          onPress={() => router.push(`/booking/apa/${booking.id}`)}
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
        <Text style={styles.viewDetailsText}>VIEW DETAILS →</Text>
      </Pressable>
    </View>
  );
}

// --------------------------------------------
// Next Booking Card
// --------------------------------------------
function NextBookingCard({ booking }: { booking: Booking }) {
  const router = useRouter();
  const daysUntil = getDaysUntil(booking.arrivalDate);
  const initials = booking.departureMarina 
    ? booking.departureMarina.slice(0, 3).toUpperCase() 
    : booking.clientName.slice(0, 3).toUpperCase();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.nextCard,
        pressed && styles.buttonPressed,
      ]}
      onPress={() => router.push(`/booking/${booking.id}`)}
    >
      <View style={styles.nextCardContent}>
        <Text style={styles.daysUntilText}>IN {daysUntil} DAYS</Text>
        <Text style={styles.nextClientName}>{booking.clientName}</Text>
        <Text style={styles.nextDateText}>
          {formatDate(booking.arrivalDate)} — {formatDate(booking.departureDate)}
        </Text>
      </View>
      <View style={styles.initialsBox}>
        <Text style={styles.initialsText}>{initials}</Text>
      </View>
    </Pressable>
  );
}

// --------------------------------------------
// Empty State
// --------------------------------------------
function EmptyState({ onAddBooking }: { onAddBooking: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>⛵</Text>
      <Text style={styles.emptyTitle}>No bookings yet</Text>
      <Text style={styles.emptySubtitle}>Add your first booking to get started</Text>
      <Pressable
        style={({ pressed }) => [
          styles.addBookingButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={onAddBooking}
      >
        <Plus size={18} color={COLORS.white} />
        <Text style={styles.addBookingButtonText}>Add First Booking</Text>
      </Pressable>
    </View>
  );
}

// --------------------------------------------
// Earnings Widget
// --------------------------------------------
function EarningsWidget({ 
  totalEarnings, 
  onPress 
}: { 
  totalEarnings: number; 
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.earningsWidget,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
    >
      <View>
        <Text style={styles.earningsLabel}>MY EARNINGS</Text>
        <Text style={styles.earningsValue}>{formatCurrency(totalEarnings)}</Text>
      </View>
      <TrendingUp size={24} color={COLORS.foreground} />
    </Pressable>
  );
}

// --------------------------------------------
// FAB (Floating Action Button)
// --------------------------------------------
function FAB({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.fab,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.fabIcon}>+</Text>
    </Pressable>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function HomeScreen() {
  const router = useRouter();
  const { bookings } = useBookings();
  const { season } = useSeason();
  const { user } = useAuth();

  // Filter bookings
  const activeBookings = bookings.filter(b => b.status === 'Active');
  const upcomingBookings = bookings
    .filter(b => b.status === 'Upcoming')
    .sort((a, b) => new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime());

  const activeBooking = activeBookings[0];
  const hasNoBookings = bookings.length === 0;

  // TODO: Calculate earnings from real data
  const totalEarnings = 0;

  const handleAddBooking = () => {
    router.push('/booking/new');
  };

  return (
    <View style={styles.container}>
      {/* Hero Header */}
      <View style={styles.heroHeader}>
        <Text style={styles.heroTitle}>AHOY!</Text>
        <Text style={styles.heroSubtitle}>
          {season?.boatName || 'S/Y CREW SEASON'}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {hasNoBookings ? (
          <EmptyState onAddBooking={handleAddBooking} />
        ) : (
          <>
            {/* Active Booking Section */}
            {activeBooking && (
              <View style={styles.section}>
                <SectionBadge label="ACTIVE CHARTER" variant="accent" />
                <ActiveBookingCard booking={activeBooking} />
              </View>
            )}

            {/* Upcoming Bookings Section */}
            {upcomingBookings.length > 0 && (
              <View style={styles.section}>
                <SectionBadge label="UP NEXT" variant="pink" />
                <View style={styles.upcomingList}>
                  {upcomingBookings.map(booking => (
                    <NextBookingCard key={booking.id} booking={booking} />
                  ))}
                </View>
              </View>
            )}

            {/* Earnings Widget */}
            {totalEarnings > 0 && (
              <EarningsWidget 
                totalEarnings={totalEarnings} 
                onPress={() => router.push('/settings')} 
              />
            )}

            {/* Add Booking Button (when no active) */}
            {!activeBooking && (
              <Pressable
                style={({ pressed }) => [
                  styles.addBookingButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleAddBooking}
              >
                <Plus size={18} color={COLORS.white} />
                <Text style={styles.addBookingButtonText}>Add Booking</Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <FAB onPress={handleAddBooking} />
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

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    gap: SPACING.lg,
  },

  // Section
  section: {
    gap: SPACING.sm,
  },

  // Section Badge
  sectionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    ...SHADOWS.brutSm,
  },
  sectionBadgeText: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
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
  liveNowBadge: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    ...SHADOWS.brutSm,
  },
  liveNowText: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
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
  progressBarTrack: {
    height: SPACING.md,
    backgroundColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.none,
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
    color: COLORS.accent,
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

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
    gap: SPACING.lg,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  emptySubtitle: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
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

  // Earnings Widget
  earningsWidget: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.brutSm,
  },
  earningsLabel: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  earningsValue: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
    marginTop: SPACING.xs,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: SPACING.xxl + SPACING.md, // Above tab bar
    right: SPACING.md,
    width: 56,
    height: 56,
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brut,
  },
  fabIcon: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.foreground,
  },

  // Pressed State (shared)
  buttonPressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
  },
});
