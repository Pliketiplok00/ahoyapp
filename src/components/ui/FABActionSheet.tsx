/**
 * FABActionSheet Component
 *
 * Modal action sheet triggered by FAB press.
 * Shows a list of action options in brutalist style.
 *
 * @example
 * <FABActionSheet
 *   visible={showSheet}
 *   onClose={() => setShowSheet(false)}
 *   actions={[
 *     { key: 'scan', label: t('scan'), icon: <Camera />, onPress: handleScan },
 *     { key: 'manual', label: t('manual'), icon: <PencilSimple />, onPress: handleManual },
 *   ]}
 * />
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { X } from 'phosphor-react-native';
import {
  COLORS,
  SPACING,
  FONTS,
  TYPOGRAPHY,
  BORDERS,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATION,
  SIZES,
} from '../../config/theme';

export interface FABAction {
  /** Unique key for the action */
  key: string;
  /** Display label */
  label: string;
  /** Icon element */
  icon: React.ReactNode;
  /** Press handler */
  onPress: () => void;
}

export interface FABActionSheetProps {
  /** Whether the sheet is visible */
  visible: boolean;
  /** Close handler */
  onClose: () => void;
  /** List of actions to display */
  actions: FABAction[];
  /** Test ID for testing */
  testID?: string;
}

/**
 * Action sheet modal for FAB.
 * Displays action options with icons.
 */
export function FABActionSheet({
  visible,
  onClose,
  actions,
  testID,
}: FABActionSheetProps) {
  const handleAction = (action: FABAction) => {
    onClose();
    action.onPress();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      testID={testID}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* Close button */}
              <Pressable
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.pressed,
                ]}
                onPress={onClose}
              >
                <X size={SIZES.icon.md} color={COLORS.foreground} weight="bold" />
              </Pressable>

              {/* Actions */}
              <View style={styles.actionList}>
                {actions.map((action) => (
                  <Pressable
                    key={action.key}
                    style={({ pressed }) => [
                      styles.actionButton,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => handleAction(action)}
                  >
                    <View style={styles.actionIcon}>{action.icon}</View>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlayDark,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: SPACING.xxl * 2,
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.lg,
    minWidth: 280,
    ...SHADOWS.brut,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  actionList: {
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    ...SHADOWS.brutSm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    flex: 1,
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
