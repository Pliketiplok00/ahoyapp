/**
 * Modal Component
 *
 * Reusable modal with customizable content and animations.
 */

import { ReactNode } from 'react';
import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, BORDERS, SHADOWS } from '../../config/theme';

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';
export type ModalPosition = 'center' | 'bottom';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: ModalSize;
  position?: ModalPosition;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  style?: ViewStyle;
  testID?: string;
}

/**
 * Get modal content styles based on size
 */
export function getModalSizeStyles(size: ModalSize): ViewStyle {
  switch (size) {
    case 'sm':
      return {
        width: '80%',
        maxWidth: 320,
      };
    case 'md':
      return {
        width: '90%',
        maxWidth: 480,
      };
    case 'lg':
      return {
        width: '95%',
        maxWidth: 640,
      };
    case 'full':
      return {
        width: '100%',
        height: '100%',
      };
    default:
      return {};
  }
}

/**
 * Get modal position styles
 */
export function getModalPositionStyles(position: ModalPosition): ViewStyle {
  switch (position) {
    case 'center':
      return {
        justifyContent: 'center',
        alignItems: 'center',
      };
    case 'bottom':
      return {
        justifyContent: 'flex-end',
        alignItems: 'center',
      };
    default:
      return {};
  }
}

/**
 * Get content border radius based on position
 */
export function getContentBorderRadius(_position: ModalPosition, _size: ModalSize): ViewStyle {
  // Brutalist: NO border radius anywhere
  return { borderRadius: BORDER_RADIUS.none };
}

export function Modal({
  visible,
  onClose,
  children,
  size = 'md',
  position = 'center',
  closeOnBackdrop = true,
  showCloseButton = false,
  style,
  testID,
}: ModalProps) {
  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={position === 'bottom' ? 'slide' : 'fade'}
      onRequestClose={onClose}
      testID={testID}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          style={[styles.backdrop, getModalPositionStyles(position)]}
          onPress={handleBackdropPress}
        >
          <Pressable
            style={[
              styles.content,
              getModalSizeStyles(size),
              getContentBorderRadius(position, size),
              style,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {showCloseButton && (
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <View style={styles.closeIcon} />
              </TouchableOpacity>
            )}
            {children}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  content: {
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    maxHeight: '90%',
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.foreground,
    ...SHADOWS.brut,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 1,
    padding: SPACING.xs,
  },
  closeIcon: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.mutedForeground,
    borderRadius: BORDER_RADIUS.none,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
  },
});
