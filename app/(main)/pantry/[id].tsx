/**
 * Pantry Item Detail Screen
 *
 * Shows item details, investors, sales history, and sell flow.
 * @see docs/AHOYCREW_TODO.md - CREW PANTRY section
 */

import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
import { Check } from 'phosphor-react-native';
import { useAppTranslation } from '@/i18n';
import { usePantry, getStockColor } from '@/features/pantry';
import { useSeason } from '@/features/season/hooks/useSeason';
import { useBookings } from '@/features/booking';
import { formatCurrency, formatDate } from '@/utils/formatting';
import type { PantryItem, PantrySale } from '@/features/pantry';
import type { Booking } from '@/types/models';

// ============ Types ============

interface SellModalProps {
  visible: boolean;
  item: PantryItem;
  bookings: Booking[];
  onClose: () => void;
  onConfirm: (quantity: number, bookingId: string) => Promise<void>;
  isSubmitting: boolean;
  t: ReturnType<typeof useAppTranslation>['t'];
}

// ============ Components ============

function SellModal({
  visible,
  item,
  bookings,
  onClose,
  onConfirm,
  isSubmitting,
  t,
}: SellModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [showBookingPicker, setShowBookingPicker] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setQuantity(1);
      setSelectedBookingId(bookings.length > 0 ? bookings[0].id : null);
    }
  }, [visible, bookings]);

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);
  const total = quantity * item.sellingPrice;
  const canConfirm = quantity > 0 && quantity <= item.quantity && selectedBookingId;

  const handleIncrement = () => {
    if (quantity < item.quantity) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleConfirm = () => {
    if (canConfirm && selectedBookingId) {
      onConfirm(quantity, selectedBookingId);
    }
  };

  // Get booking display name
  const getBookingName = (booking: Booking) => {
    // Notes often contain client name as first line
    if (booking.notes) {
      const firstLine = booking.notes.split('\n')[0];
      if (firstLine && firstLine.length < 50) {
        return firstLine;
      }
    }
    return `${formatDate(booking.arrivalDate.toDate())} - ${formatDate(booking.departureDate.toDate())}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sellModalContent}>
          {/* Header */}
          <View style={styles.sellModalHeader}>
            <Text style={styles.sellModalTitle}>{t('pantry.sell')}</Text>
            <Pressable
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>

          {/* Item Name */}
          <Text style={styles.sellItemName}>{item.name}</Text>

          {/* No bookings message */}
          {bookings.length === 0 ? (
            <View style={styles.noBookingsContainer}>
              <Text style={styles.noBookingsText}>
                {t('pantry.sale.noActiveBookings')}
              </Text>
            </View>
          ) : (
            <>
              {/* Quantity Selector */}
              <View style={styles.quantitySection}>
                <Text style={styles.sectionLabel}>
                  {t('pantry.sale.selectQuantity')}
                </Text>
                <View style={styles.quantityControls}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.quantityButton,
                      quantity <= 1 && styles.quantityButtonDisabled,
                      pressed && quantity > 1 && styles.pressed,
                    ]}
                    onPress={handleDecrement}
                    disabled={quantity <= 1}
                  >
                    <Text style={styles.quantityButtonText}>−</Text>
                  </Pressable>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.quantityButton,
                      quantity >= item.quantity && styles.quantityButtonDisabled,
                      pressed && quantity < item.quantity && styles.pressed,
                    ]}
                    onPress={handleIncrement}
                    disabled={quantity >= item.quantity}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </Pressable>
                </View>
                <Text style={styles.stockReminder}>
                  {t('pantry.stock.inStock')}: {item.quantity}
                </Text>
              </View>

              {/* Booking Selector */}
              <View style={styles.bookingSection}>
                <Text style={styles.sectionLabel}>
                  {t('pantry.sale.selectBooking')}
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.bookingSelector,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setShowBookingPicker(true)}
                >
                  <Text style={styles.bookingSelectorText} numberOfLines={1}>
                    {selectedBooking ? getBookingName(selectedBooking) : t('pantry.sale.selectBooking')}
                  </Text>
                  <Text style={styles.selectArrow}>▼</Text>
                </Pressable>
              </View>

              {/* Total Preview */}
              <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>{t('pantry.sale.total')}:</Text>
                <Text style={styles.totalFormula}>
                  {quantity} × {formatCurrency(item.sellingPrice)} ={' '}
                </Text>
                <Text style={styles.totalAmount}>{formatCurrency(total)}</Text>
              </View>

              {/* Confirm Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.confirmButton,
                  (!canConfirm || isSubmitting) && styles.confirmButtonDisabled,
                  pressed && canConfirm && !isSubmitting && styles.pressed,
                ]}
                onPress={handleConfirm}
                disabled={!canConfirm || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    {t('pantry.sale.confirmSale')}
                  </Text>
                )}
              </Pressable>
            </>
          )}
        </View>
      </View>

      {/* Booking Picker Modal */}
      <Modal
        visible={showBookingPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBookingPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowBookingPicker(false)}
        >
          <View style={styles.pickerModalContent}>
            <Text style={styles.pickerTitle}>{t('pantry.sale.selectBooking')}</Text>
            <ScrollView style={styles.bookingList}>
              {bookings.map((booking) => (
                <Pressable
                  key={booking.id}
                  style={({ pressed }) => [
                    styles.bookingOption,
                    booking.id === selectedBookingId && styles.bookingOptionSelected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => {
                    setSelectedBookingId(booking.id);
                    setShowBookingPicker(false);
                  }}
                >
                  <View style={styles.bookingOptionContent}>
                    <Text
                      style={[
                        styles.bookingOptionName,
                        booking.id === selectedBookingId && styles.bookingOptionNameSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {getBookingName(booking)}
                    </Text>
                    <Text style={styles.bookingOptionDates}>
                      {formatDate(booking.arrivalDate.toDate())} - {formatDate(booking.departureDate.toDate())}
                    </Text>
                  </View>
                  {booking.id === selectedBookingId && (
                    <Check size={SIZES.icon.sm} color={COLORS.foreground} weight="bold" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              style={({ pressed }) => [
                styles.pickerCloseButton,
                pressed && styles.pressed,
              ]}
              onPress={() => setShowBookingPicker(false)}
            >
              <Text style={styles.pickerCloseText}>{t('common.close')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </Modal>
  );
}

// ============ Main Component ============

export default function PantryItemDetailScreen() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, createSale, deleteItem, getItemSales, canEdit, canDelete, refresh } = usePantry();
  const { crewMembers } = useSeason();
  const { activeBooking, upcomingBookings } = useBookings();

  // Find the item
  const item = items.find((i) => i.id === id);

  // State
  const [sales, setSales] = useState<PantrySale[]>([]);
  const [isLoadingSales, setIsLoadingSales] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Available bookings for sale (active + upcoming)
  const availableBookings = useMemo(() => {
    const bookings: Booking[] = [];
    if (activeBooking) bookings.push(activeBooking);
    bookings.push(...upcomingBookings);
    return bookings;
  }, [activeBooking, upcomingBookings]);

  // Load sales history
  useEffect(() => {
    async function loadSales() {
      if (!id) return;
      setIsLoadingSales(true);
      const result = await getItemSales(id);
      if (result.success && result.sales) {
        setSales(result.sales);
      }
      setIsLoadingSales(false);
    }
    loadSales();
  }, [id, getItemSales]);

  // Get investor name
  const getInvestorName = (userId: string) => {
    const crew = crewMembers.find((c) => c.id === userId);
    return crew?.name || userId;
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    if (id) {
      const result = await getItemSales(id);
      if (result.success && result.sales) {
        setSales(result.sales);
      }
    }
    setRefreshing(false);
  };

  // Handle sell
  const handleSell = async (quantity: number, bookingId: string) => {
    if (!item) return;

    setIsSelling(true);
    const result = await createSale({
      pantryItemId: item.id,
      bookingId,
      quantity,
    });
    setIsSelling(false);

    if (result.success) {
      setShowSellModal(false);
      // Refresh sales
      const salesResult = await getItemSales(item.id);
      if (salesResult.success && salesResult.sales) {
        setSales(salesResult.sales);
      }
      Alert.alert(t('pantry.sale.saleSuccess'));
    } else {
      Alert.alert(
        t('common.error'),
        result.error ? t(result.error) : t('pantry.errors.saleFailed')
      );
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (!item) return;

    Alert.alert(
      t('common.confirm'),
      t('pantry.confirmDelete'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            const result = await deleteItem(item.id);
            setIsDeleting(false);

            if (result.success) {
              router.back();
            } else {
              Alert.alert(
                t('common.error'),
                result.error ? t(result.error) : t('pantry.errors.deleteFailed')
              );
            }
          },
        },
      ]
    );
  };

  // Loading state
  if (!item) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{t('pantry.itemDetails')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  const stockColor = getStockColor(item.quantity);
  const isOutOfStock = item.quantity === 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('pantry.fields.category')}</Text>
            <Text style={styles.infoValue}>
              {t(`pantry.categories.${item.category}`)}
            </Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('pantry.fields.quantity')}</Text>
            <View style={styles.stockDisplay}>
              <View style={[styles.stockDot, { backgroundColor: stockColor }]} />
              <Text style={[styles.stockValue, { color: stockColor }]}>
                {item.quantity}
              </Text>
              <Text style={styles.stockUnit}>{t('pantry.stock.units')}</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('pantry.fields.purchasePrice')}</Text>
            <Text style={styles.infoValue}>{formatCurrency(item.purchasePrice)}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('pantry.fields.sellingPrice')}</Text>
            <Text style={styles.infoValueAccent}>{formatCurrency(item.sellingPrice)}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('pantry.fields.markup')}</Text>
            <Text style={styles.infoValueAccent}>+{item.markupPercent}%</Text>
          </View>
        </View>

        {/* Investors Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('pantry.fields.investors')}</Text>
          <View style={styles.investorsList}>
            {item.investors.map((investor, index) => (
              <View
                key={investor.userId}
                style={[
                  styles.investorRow,
                  index < item.investors.length - 1 && styles.investorRowBorder,
                ]}
              >
                <Text style={styles.investorName}>
                  {getInvestorName(investor.userId)}
                </Text>
                <Text style={styles.investorAmount}>
                  {formatCurrency(investor.amount)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Sales History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('pantry.salesHistory')}</Text>
          {isLoadingSales ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : sales.length === 0 ? (
            <Text style={styles.emptyText}>{t('pantry.noSales')}</Text>
          ) : (
            <View style={styles.salesList}>
              {sales.map((sale, index) => (
                <View
                  key={sale.id}
                  style={[
                    styles.saleRow,
                    index < sales.length - 1 && styles.saleRowBorder,
                  ]}
                >
                  <View style={styles.saleInfo}>
                    <Text style={styles.saleQuantity}>
                      {sale.quantity}× @ {formatCurrency(sale.sellingPrice)}
                    </Text>
                    <Text style={styles.saleDate}>
                      {formatDate(sale.createdAt.toDate())}
                    </Text>
                  </View>
                  <Text style={styles.saleTotal}>
                    {formatCurrency(sale.totalAmount)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {/* Sell Button */}
          <Pressable
            style={({ pressed }) => [
              styles.sellButton,
              isOutOfStock && styles.buttonDisabled,
              pressed && !isOutOfStock && styles.pressed,
            ]}
            onPress={() => setShowSellModal(true)}
            disabled={isOutOfStock}
          >
            <Text style={styles.sellButtonText}>
              {isOutOfStock ? t('pantry.stock.outOfStock') : t('pantry.sell')}
            </Text>
          </Pressable>

          {/* Delete Button */}
          {canDelete(item) && (
            <Pressable
              style={({ pressed }) => [
                styles.deleteButton,
                isDeleting && styles.buttonDisabled,
                pressed && !isDeleting && styles.pressed,
              ]}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator color={COLORS.destructive} />
              ) : (
                <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
              )}
            </Pressable>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sell Modal */}
      <SellModal
        visible={showSellModal}
        item={item}
        bookings={availableBookings}
        onClose={() => setShowSellModal(false)}
        onConfirm={handleSell}
        isSubmitting={isSelling}
        t={t}
      />
    </View>
  );
}

// ============ Styles ============

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.foreground,
    paddingTop: SPACING.xxl + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brutSm,
  },
  backButtonText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  headerSpacer: {
    width: 40,
  },

  // Center container
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },

  // Info Card
  infoCard: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    ...SHADOWS.brut,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  infoDivider: {
    height: BORDERS.thin,
    backgroundColor: COLORS.muted,
  },
  infoLabel: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
  },
  infoValue: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  infoValueAccent: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.accent,
  },
  stockDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.xs,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
  },
  stockValue: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
  },
  stockUnit: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    marginLeft: SPACING.xxs,
  },

  // Section
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },

  // Investors List
  investorsList: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
  },
  investorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  investorRowBorder: {
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.muted,
  },
  investorName: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  investorAmount: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Sales List
  salesList: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
  },
  saleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  saleRowBorder: {
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.muted,
  },
  saleInfo: {
    flex: 1,
  },
  saleQuantity: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  saleDate: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    marginTop: SPACING.xxs,
  },
  saleTotal: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.accent,
  },
  emptyText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
  },

  // Actions
  actions: {
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  sellButton: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.brut,
  },
  sellButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  deleteButton: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.destructive,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.destructive,
    textTransform: 'uppercase',
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  sellModalContent: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    width: '100%',
    ...SHADOWS.brutLg,
  },
  sellModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: BORDERS.normal,
    borderBottomColor: COLORS.foreground,
  },
  sellModalTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.mutedForeground,
  },
  sellItemName: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    padding: SPACING.md,
    textAlign: 'center',
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.muted,
  },

  // No bookings
  noBookingsContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  noBookingsText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },

  // Quantity section
  quantitySection: {
    padding: SPACING.md,
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.muted,
  },
  sectionLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  quantityButton: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brutSm,
  },
  quantityButtonDisabled: {
    opacity: 0.3,
  },
  quantityButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.white,
  },
  quantityValue: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.foreground,
    minWidth: 48,
    textAlign: 'center',
  },
  stockReminder: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  // Booking section
  bookingSection: {
    padding: SPACING.md,
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.muted,
  },
  bookingSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  bookingSelectorText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    flex: 1,
  },
  selectArrow: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
  },

  // Total section
  totalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.muted,
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.foreground,
  },
  totalLabel: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginRight: SPACING.xs,
  },
  totalFormula: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  totalAmount: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.accent,
  },

  // Confirm button
  confirmButton: {
    backgroundColor: COLORS.accent,
    borderTopWidth: BORDERS.normal,
    borderTopColor: COLORS.foreground,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },

  // Booking picker modal
  pickerModalContent: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    width: '100%',
    maxHeight: '70%',
    ...SHADOWS.brutLg,
  },
  pickerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
    padding: SPACING.md,
    borderBottomWidth: BORDERS.normal,
    borderBottomColor: COLORS.foreground,
  },
  bookingList: {
    maxHeight: 300,
  },
  bookingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.muted,
  },
  bookingOptionSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  bookingOptionContent: {
    flex: 1,
  },
  bookingOptionName: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  bookingOptionNameSelected: {
    fontFamily: FONTS.display,
    color: COLORS.primary,
  },
  bookingOptionDates: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    marginTop: SPACING.xxs,
  },
  optionCheck: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.primary,
  },
  pickerCloseButton: {
    backgroundColor: COLORS.muted,
    borderTopWidth: BORDERS.normal,
    borderTopColor: COLORS.foreground,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  pickerCloseText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },

  // Pressed state
  pressed: {
    transform: ANIMATION.pressedTransform,
  },

  // Bottom spacing
  bottomSpacer: {
    height: SPACING.xxl,
  },
});
