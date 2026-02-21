/**
 * Shopping List Screen (Brutalist)
 *
 * Track provisioning items for each booking.
 * Items persist in Firestore subcollection.
 *
 * @see docs/Ahoy_Screen_Map.md
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
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
import { useBooking } from '@/features/booking';
import { useAuthStore } from '@/stores/authStore';

// ============================================
// TYPES
// ============================================

interface ShoppingItem {
  id: string;
  name: string;
  purchased: boolean;
  createdAt: Timestamp | null;
  createdBy: string;
}

// ============================================
// COMPONENTS
// ============================================

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
}

function Checkbox({ checked, onPress }: CheckboxProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.checkbox,
        checked && styles.checkboxChecked,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {checked && <Text style={styles.checkmark}>✓</Text>}
    </Pressable>
  );
}

interface ShoppingItemRowProps {
  item: ShoppingItem;
  onToggle: () => void;
  onDelete: () => void;
  isPurchased: boolean;
}

function ShoppingItemRow({ item, onToggle, onDelete, isPurchased }: ShoppingItemRowProps) {
  return (
    <View style={styles.itemRow}>
      <Checkbox checked={isPurchased} onPress={onToggle} />
      <Text
        style={[
          styles.itemName,
          isPurchased && styles.itemNamePurchased,
        ]}
        numberOfLines={2}
      >
        {item.name}
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.actionButton,
          pressed && styles.pressed,
        ]}
        onPress={onDelete}
      >
        <Text style={styles.actionButtonText}>
          {isPurchased ? 'UNDO' : '🗑️'}
        </Text>
      </Pressable>
    </View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ShoppingListScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const { booking, isLoading: bookingLoading } = useBooking(bookingId || null);
  const { firebaseUser } = useAuthStore();

  // State
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Subscribe to shopping items
  useEffect(() => {
    if (!bookingId) return;

    const itemsRef = collection(db, 'bookings', bookingId, 'shoppingItems');
    const q = query(itemsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedItems: ShoppingItem[] = [];
        snapshot.forEach((doc) => {
          loadedItems.push({
            id: doc.id,
            ...doc.data(),
          } as ShoppingItem);
        });
        setItems(loadedItems);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error loading shopping items:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [bookingId]);

  // Add new item
  const handleAddItem = async () => {
    if (!newItemName.trim() || !bookingId || !firebaseUser) return;

    setIsAdding(true);

    try {
      const itemsRef = collection(db, 'bookings', bookingId, 'shoppingItems');
      await addDoc(itemsRef, {
        name: newItemName.trim(),
        purchased: false,
        createdAt: serverTimestamp(),
        createdBy: firebaseUser.uid,
      });
      setNewItemName('');
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Could not add item');
    }

    setIsAdding(false);
  };

  // Toggle purchased status
  const handleToggle = async (item: ShoppingItem) => {
    if (!bookingId) return;

    try {
      const itemRef = doc(db, 'bookings', bookingId, 'shoppingItems', item.id);
      await updateDoc(itemRef, {
        purchased: !item.purchased,
      });
    } catch (error) {
      console.error('Error toggling item:', error);
      Alert.alert('Error', 'Could not update item');
    }
  };

  // Delete item (or undo = set purchased to false)
  const handleDelete = async (item: ShoppingItem) => {
    if (!bookingId) return;

    if (item.purchased) {
      // UNDO - set back to not purchased
      handleToggle(item);
    } else {
      // DELETE
      Alert.alert(
        'Delete Item',
        `Remove "${item.name}" from the list?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                const itemRef = doc(db, 'bookings', bookingId, 'shoppingItems', item.id);
                await deleteDoc(itemRef);
              } catch (error) {
                console.error('Error deleting item:', error);
                Alert.alert('Error', 'Could not delete item');
              }
            },
          },
        ]
      );
    }
  };

  // Split items into TO BUY and PURCHASED
  const toBuyItems = items.filter((item) => !item.purchased);
  const purchasedItems = items.filter((item) => item.purchased);

  // Get client name from booking notes (first line)
  const clientName = booking?.notes?.split('\n')[0] || 'Guest';

  // Loading state
  if (isLoading || bookingLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>SHOPPING</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>LOADING...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>SHOPPING</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {clientName}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Add Item Section */}
        <View style={styles.addSection}>
          <Text style={styles.sectionLabel}>ADD ITEM</Text>
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              value={newItemName}
              onChangeText={setNewItemName}
              placeholder="Item name..."
              placeholderTextColor={COLORS.mutedForeground}
              editable={!isAdding}
              onSubmitEditing={handleAddItem}
              returnKeyType="done"
            />
            <Pressable
              style={({ pressed }) => [
                styles.addButton,
                (!newItemName.trim() || isAdding) && styles.addButtonDisabled,
                pressed && newItemName.trim() && !isAdding && styles.pressed,
              ]}
              onPress={handleAddItem}
              disabled={!newItemName.trim() || isAdding}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color={COLORS.foreground} />
              ) : (
                <Text style={styles.addButtonText}>+ ADD</Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Empty State */}
        {items.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyTitle}>NO ITEMS YET</Text>
            <Text style={styles.emptyText}>
              Add provisioning items for this booking
            </Text>
          </View>
        )}

        {/* TO BUY Section */}
        {toBuyItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              TO BUY ({toBuyItems.length})
            </Text>
            <View style={styles.itemsCard}>
              {toBuyItems.map((item, index) => (
                <View key={item.id}>
                  <ShoppingItemRow
                    item={item}
                    onToggle={() => handleToggle(item)}
                    onDelete={() => handleDelete(item)}
                    isPurchased={false}
                  />
                  {index < toBuyItems.length - 1 && (
                    <View style={styles.itemDivider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* PURCHASED Section */}
        {purchasedItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              PURCHASED ({purchasedItems.length})
            </Text>
            <View style={[styles.itemsCard, styles.purchasedCard]}>
              {purchasedItems.map((item, index) => (
                <View key={item.id}>
                  <ShoppingItemRow
                    item={item}
                    onToggle={() => handleToggle(item)}
                    onDelete={() => handleDelete(item)}
                    isPurchased={true}
                  />
                  {index < purchasedItems.length - 1 && (
                    <View style={styles.itemDivider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.foreground,
    paddingVertical: SPACING.md,
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.foreground,
    opacity: 0.8,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginTop: SPACING.md,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },

  // Add Section
  addSection: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    marginBottom: SPACING.sm,
  },
  addRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  addInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  addButton: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    ...SHADOWS.brutSm,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.foreground,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },

  // Section
  section: {
    marginBottom: SPACING.lg,
  },

  // Items Card
  itemsCard: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    ...SHADOWS.brut,
  },
  purchasedCard: {
    backgroundColor: COLORS.muted,
  },

  // Item Row
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  itemDivider: {
    height: BORDERS.thin,
    backgroundColor: COLORS.muted,
    marginHorizontal: SPACING.md,
  },
  itemName: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  itemNamePurchased: {
    textDecorationLine: 'line-through',
    color: COLORS.mutedForeground,
  },

  // Checkbox - SQUARE!
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none, // SQUARE!
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.accent,
  },
  checkmark: {
    fontFamily: FONTS.display,
    fontSize: 16,
    color: COLORS.foreground,
  },

  // Action Button
  actionButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  actionButtonText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
  },

  // Pressed state
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
