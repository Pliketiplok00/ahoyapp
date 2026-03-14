/**
 * Add Pantry Item Screen
 *
 * Form for adding new items to crew pantry with investor selection.
 * @see docs/AHOYCREW_TODO.md - CREW PANTRY section
 */

import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
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
import { BrutInput } from '@/components/ui/BrutInput';
import { usePantry, PANTRY_CATEGORIES } from '@/features/pantry';
import { useSeason } from '@/features/season/hooks/useSeason';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency } from '@/utils/formatting';
import type { PantryCategory, PantryInvestor } from '@/features/pantry';

// ============ Types ============

interface CategoryOption {
  value: PantryCategory;
  labelKey: string;
}

// ============ Constants ============

const DEFAULT_MARKUP = 25;

const CATEGORY_OPTIONS: CategoryOption[] = PANTRY_CATEGORIES.map((cat) => ({
  value: cat,
  labelKey: `pantry.categories.${cat}`,
}));

// ============ Components ============

interface CategorySelectorProps {
  label: string;
  value: PantryCategory;
  options: CategoryOption[];
  onSelect: (value: PantryCategory) => void;
  t: ReturnType<typeof useAppTranslation>['t'];
}

function CategorySelector({ label, value, options, onSelect, t }: CategorySelectorProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <View style={styles.selectorContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.selectButton,
          pressed && styles.pressed,
        ]}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.selectText}>{t(`pantry.categories.${value}`)}</Text>
        <Text style={styles.selectArrow}>▼</Text>
      </Pressable>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
            <ScrollView style={styles.optionsList}>
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  style={({ pressed }) => [
                    styles.optionItem,
                    option.value === value && styles.optionItemSelected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => {
                    onSelect(option.value);
                    setShowModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      option.value === value && styles.optionTextSelected,
                    ]}
                  >
                    {t(option.labelKey)}
                  </Text>
                  {option.value === value && (
                    <Check size={SIZES.icon.sm} color={COLORS.foreground} weight="bold" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              style={({ pressed }) => [
                styles.modalCloseButton,
                pressed && styles.pressed,
              ]}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalCloseText}>{t('common.close')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

interface InvestorSelectorProps {
  label: string;
  selectedIds: string[];
  crewMembers: { id: string; name: string; color: string }[];
  onToggle: (userId: string) => void;
  totalCost: number;
  t: ReturnType<typeof useAppTranslation>['t'];
}

function InvestorSelector({
  label,
  selectedIds,
  crewMembers,
  onToggle,
  totalCost,
  t,
}: InvestorSelectorProps) {
  const perPersonAmount = selectedIds.length > 0
    ? totalCost / selectedIds.length
    : 0;

  return (
    <View style={styles.investorContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.investorList}>
        {crewMembers.map((member) => {
          const isSelected = selectedIds.includes(member.id);
          return (
            <Pressable
              key={member.id}
              style={({ pressed }) => [
                styles.investorItem,
                isSelected && styles.investorItemSelected,
                pressed && styles.pressed,
              ]}
              onPress={() => onToggle(member.id)}
            >
              <View style={[styles.investorDot, { backgroundColor: member.color }]} />
              <Text
                style={[
                  styles.investorName,
                  isSelected && styles.investorNameSelected,
                ]}
                numberOfLines={1}
              >
                {member.name}
              </Text>
              {isSelected && <Check size={SIZES.icon.sm} color={COLORS.foreground} weight="bold" />}
            </Pressable>
          );
        })}
      </View>
      {selectedIds.length > 1 && totalCost > 0 && (
        <View style={styles.splitInfo}>
          <Text style={styles.splitLabel}>{t('pantry.fields.equalSplit')}:</Text>
          <Text style={styles.splitAmount}>
            {formatCurrency(perPersonAmount)}
          </Text>
        </View>
      )}
    </View>
  );
}

// ============ Main Component ============

export default function AddPantryItemScreen() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const { createItem } = usePantry();
  const { crewMembers } = useSeason();
  const { firebaseUser } = useAuthStore();

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PantryCategory>('wine');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [markupPercent, setMarkupPercent] = useState(DEFAULT_MARKUP.toString());
  const [selectedInvestorIds, setSelectedInvestorIds] = useState<string[]>(() => {
    // Pre-select current user
    return firebaseUser?.uid ? [firebaseUser.uid] : [];
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parsed values
  const quantityNum = parseInt(quantity) || 0;
  const purchasePriceNum = parseFloat(purchasePrice.replace(',', '.')) || 0;
  const markupNum = parseFloat(markupPercent) || 0;

  // Calculated values
  const totalCost = quantityNum * purchasePriceNum;
  const sellingPrice = purchasePriceNum * (1 + markupNum / 100);

  // Validation
  const isValid = useMemo(() => {
    if (!name.trim()) return false;
    if (quantityNum <= 0) return false;
    if (purchasePriceNum <= 0) return false;
    if (selectedInvestorIds.length === 0) return false;
    return true;
  }, [name, quantityNum, purchasePriceNum, selectedInvestorIds]);

  // Toggle investor selection
  const handleToggleInvestor = (userId: string) => {
    setSelectedInvestorIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }
      return [...prev, userId];
    });
  };

  // Build investors array with equal split
  const buildInvestors = (): PantryInvestor[] => {
    if (selectedInvestorIds.length === 0) return [];

    const amountPerPerson = totalCost / selectedInvestorIds.length;
    return selectedInvestorIds.map((userId) => ({
      userId,
      amount: amountPerPerson,
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);

    const result = await createItem({
      name: name.trim(),
      category,
      quantity: quantityNum,
      purchasePrice: purchasePriceNum,
      markupPercent: markupNum,
      investors: buildInvestors(),
    });

    setIsSubmitting(false);

    if (result.success) {
      router.back();
    } else {
      Alert.alert(
        t('common.error'),
        result.error ? t(result.error) : t('pantry.errors.createFailed')
      );
    }
  };

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
        <Text style={styles.headerTitle}>{t('pantry.addItem')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {/* Name */}
          <BrutInput
            label={`${t('pantry.fields.name')} *`}
            placeholder="Plavac Mali Zlatan"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          {/* Category */}
          <CategorySelector
            label={t('pantry.fields.category')}
            value={category}
            options={CATEGORY_OPTIONS}
            onSelect={setCategory}
            t={t}
          />

          {/* Quantity */}
          <BrutInput
            label={`${t('pantry.fields.quantity')} *`}
            placeholder="6"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
          />

          {/* Purchase Price */}
          <BrutInput
            label={`${t('pantry.fields.purchasePrice')} *`}
            placeholder="15,00"
            value={purchasePrice}
            onChangeText={setPurchasePrice}
            keyboardType="decimal-pad"
            helperText="€"
          />

          {/* Markup */}
          <BrutInput
            label={t('pantry.fields.markup')}
            placeholder="25"
            value={markupPercent}
            onChangeText={setMarkupPercent}
            keyboardType="number-pad"
            helperText="%"
          />

          {/* Calculated Selling Price */}
          {purchasePriceNum > 0 && (
            <View style={styles.calculatedPrice}>
              <Text style={styles.calculatedLabel}>
                {t('pantry.fields.sellingPrice')}:
              </Text>
              <Text style={styles.calculatedValue}>
                {formatCurrency(sellingPrice)}
              </Text>
            </View>
          )}

          {/* Investors */}
          <InvestorSelector
            label={t('pantry.fields.investors')}
            selectedIds={selectedInvestorIds}
            crewMembers={crewMembers.map((m) => ({
              id: m.id,
              name: m.name,
              color: m.color,
            }))}
            onToggle={handleToggleInvestor}
            totalCost={totalCost}
            t={t}
          />

          {/* Submit Button */}
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              (!isValid || isSubmitting) && styles.submitButtonDisabled,
              pressed && isValid && !isSubmitting && styles.pressed,
            ]}
            onPress={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>{t('common.save')}</Text>
            )}
          </Pressable>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  headerSpacer: {
    width: 40,
  },

  // KeyboardAvoidingView
  keyboardAvoid: {
    flex: 1,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },

  // Field Label
  fieldLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },

  // Selector (Category)
  selectorContainer: {
    marginBottom: SPACING.md,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  selectText: {
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

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    width: '100%',
    maxHeight: '70%',
    ...SHADOWS.brutLg,
  },
  modalTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
    padding: SPACING.md,
    borderBottomWidth: BORDERS.normal,
    borderBottomColor: COLORS.foreground,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.muted,
  },
  optionItemSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  optionText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  optionTextSelected: {
    fontFamily: FONTS.display,
    color: COLORS.primary,
  },
  optionCheck: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.primary,
  },
  modalCloseButton: {
    backgroundColor: COLORS.muted,
    borderTopWidth: BORDERS.normal,
    borderTopColor: COLORS.foreground,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  modalCloseText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },

  // Calculated Price
  calculatedPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  calculatedLabel: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
  },
  calculatedValue: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.accent,
  },

  // Investor Selector
  investorContainer: {
    marginBottom: SPACING.md,
  },
  investorList: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
  },
  investorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: COLORS.muted,
  },
  investorItemSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  investorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
  },
  investorName: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    flex: 1,
  },
  investorNameSelected: {
    fontFamily: FONTS.display,
    color: COLORS.primary,
  },
  investorCheck: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.primary,
  },
  splitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderTopWidth: 0,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.sm,
  },
  splitLabel: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
  },
  splitAmount: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Submit Button
  submitButton: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    ...SHADOWS.brut,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
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
