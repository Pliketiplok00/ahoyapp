/**
 * Export Screen
 *
 * Export booking expenses to Excel.
 * Options for email or share sheet.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ShareNetwork, Envelope, Check } from 'phosphor-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SIZES } from '@/config/theme';
import { Screen } from '@/components/layout';
import { Button } from '@/components/ui';
import { useBooking } from '@/features/booking/hooks/useBooking';
import { useExpenses } from '@/features/expense/hooks/useExpenses';
import { useApa } from '@/features/apa/hooks/useApa';
import { useExport } from '@/features/export/hooks/useExport';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatCurrency } from '@/utils/formatting';

type ExportMethod = 'share' | 'email';

export default function ExportScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const { booking, isLoading: bookingLoading } = useBooking(bookingId || '');
  const { expenses, totalAmount: expenseTotal, isLoading: expensesLoading } = useExpenses(
    bookingId || '',
    booking?.seasonId || ''
  );
  const { entries: apaEntries, total: apaTotal } = useApa(bookingId || '', firebaseUser?.uid || '');

  const {
    isExporting,
    error,
    exportBooking,
    clearError,
  } = useExport({
    booking,
    expenses,
    apaEntries,
    reconciliation: booking?.reconciliation || null,
    seasonName: booking?.seasonId || 'Season',
  });

  const [exportMethod, setExportMethod] = useState<ExportMethod>('share');
  const [emailRecipient, setEmailRecipient] = useState('');

  const isLoading = bookingLoading || expensesLoading;
  const expectedCash = apaTotal - expenseTotal;

  const handleExport = async () => {
    clearError();

    if (exportMethod === 'email' && !emailRecipient.trim()) {
      Alert.alert('Email je obavezan', 'Molimo unesite email adresu za slanje izvještaja.');
      return;
    }

    const result = await exportBooking({
      includeReceipts: false, // TODO: Implement receipt bundling
      sendViaEmail: exportMethod === 'email',
      emailRecipient: exportMethod === 'email' ? emailRecipient.trim() : undefined,
    });

    if (result.success) {
      Alert.alert(
        'Izvoz uspješan',
        exportMethod === 'email'
          ? 'Otvoren email s privitkom.'
          : 'Otvoren izbornik dijeljenja.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      Alert.alert('Izvoz nije uspio', result.error || 'Nešto je pošlo po zlu.');
    }
  };

  if (!booking && !isLoading) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Izvoz' }} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Booking nije pronađen</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen noPadding>
      <Stack.Screen options={{ title: 'Izvoz izvještaja' }} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {booking?.notes || 'Booking Report'}
          </Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>APA Ukupno</Text>
              <Text style={styles.summaryValue}>{formatCurrency(apaTotal)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Troškovi</Text>
              <Text style={[styles.summaryValue, styles.negative]}>
                {formatCurrency(expenseTotal)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Očekivano</Text>
              <Text style={styles.summaryValue}>{formatCurrency(expectedCash)}</Text>
            </View>
          </View>
          <View style={styles.countRow}>
            <Text style={styles.countText}>{expenses.length} troškova</Text>
            <Text style={styles.countText}>{apaEntries.length} APA unosa</Text>
          </View>
        </View>

        {/* Export Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>METODA IZVOZA</Text>

          <Pressable
            style={[
              styles.methodOption,
              exportMethod === 'share' && styles.methodOptionSelected,
            ]}
            onPress={() => setExportMethod('share')}
          >
            <View style={styles.methodIcon}>
              <ShareNetwork size={SIZES.icon.md} color={COLORS.textPrimary} weight="regular" />
            </View>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>Podijeli</Text>
              <Text style={styles.methodDescription}>
                Otvori izbornik dijeljenja za spremanje ili slanje
              </Text>
            </View>
            {exportMethod === 'share' && (
              <Check size={SIZES.icon.md} color={COLORS.coral} weight="bold" />
            )}
          </Pressable>

          <Pressable
            style={[
              styles.methodOption,
              exportMethod === 'email' && styles.methodOptionSelected,
            ]}
            onPress={() => setExportMethod('email')}
          >
            <View style={styles.methodIcon}>
              <Envelope size={SIZES.icon.md} color={COLORS.textPrimary} weight="regular" />
            </View>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>Email</Text>
              <Text style={styles.methodDescription}>
                Pošalji direktno na email adresu
              </Text>
            </View>
            {exportMethod === 'email' && (
              <Check size={SIZES.icon.md} color={COLORS.coral} weight="bold" />
            )}
          </Pressable>

          {/* Email Input */}
          {exportMethod === 'email' && (
            <View style={styles.emailInputContainer}>
              <TextInput
                style={styles.emailInput}
                value={emailRecipient}
                onChangeText={setEmailRecipient}
                placeholder="recipient@example.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}
        </View>

        {/* Export Contents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IZVOZ UKLJUČUJE</Text>
          <View style={styles.includesList}>
            <View style={styles.includeItem}>
              <Check size={16} color={COLORS.success} weight="bold" />
              <Text style={styles.includeText}>Sažetak bookinga</Text>
            </View>
            <View style={styles.includeItem}>
              <Check size={16} color={COLORS.success} weight="bold" />
              <Text style={styles.includeText}>Svi troškovi s detaljima</Text>
            </View>
            <View style={styles.includeItem}>
              <Check size={16} color={COLORS.success} weight="bold" />
              <Text style={styles.includeText}>APA unosi</Text>
            </View>
            <View style={styles.includeItem}>
              <Check size={16} color={COLORS.success} weight="bold" />
              <Text style={styles.includeText}>Pregled po kategorijama</Text>
            </View>
            {booking?.reconciliation && (
              <View style={styles.includeItem}>
                <Check size={16} color={COLORS.success} weight="bold" />
                <Text style={styles.includeText}>Rezultat obračuna</Text>
              </View>
            )}
          </View>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Export Button */}
      <View style={styles.footer}>
        <Button
          onPress={handleExport}
          disabled={isExporting || isLoading}
          testID="export-button"
        >
          {isExporting ? (
            <View style={styles.loadingContent}>
              <ActivityIndicator size="small" color={COLORS.white} />
              <Text style={styles.buttonText}>Generiranje...</Text>
            </View>
          ) : (
            'Izvezi u Excel'
          )}
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  // Summary Card
  summaryCard: {
    backgroundColor: COLORS.steelBlue,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    opacity: 0.7,
    marginBottom: SPACING.xs,
  },
  summaryValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  negative: {
    color: '#ffaaaa',
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.overlayLight,
    paddingTop: SPACING.sm,
  },
  countText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.8,
  },
  // Section
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
  // Method Options
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodOptionSelected: {
    borderColor: COLORS.coral,
    backgroundColor: `${COLORS.coral}10`,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  methodDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // Email Input
  emailInputContainer: {
    marginTop: SPACING.sm,
  },
  emailInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  // Includes List
  includesList: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  includeCheck: {
    marginRight: SPACING.sm,
    width: 20,
  },
  includeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  // Error
  errorContainer: {
    backgroundColor: `${COLORS.error}15`,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  // Footer
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});
