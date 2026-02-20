/**
 * Header Component
 *
 * Reusable header with back button, title, and optional action buttons.
 * Used for screens with navigation (not tabs).
 */

import { ReactNode } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, FONTS } from '../../config/theme';

interface HeaderProps {
  /** Screen title */
  title: string;
  /** Subtitle (optional) */
  subtitle?: string;
  /** Show back button (default: true) */
  showBack?: boolean;
  /** Custom back handler (default: router.back) */
  onBack?: () => void;
  /** Right side action button(s) */
  rightAction?: ReactNode;
  /** Large title style (default: false) */
  large?: boolean;
  /** Custom container style */
  style?: ViewStyle;
}

export function Header({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightAction,
  large = false,
  style,
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, large && styles.containerLarge, style]}>
      <View style={styles.row}>
        {/* Left: Back button */}
        <View style={styles.leftSection}>
          {showBack && (
            <Pressable
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backIcon}>←</Text>
            </Pressable>
          )}
        </View>

        {/* Center: Title (only for non-large headers) */}
        {!large && (
          <View style={styles.centerSection}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        )}

        {/* Right: Action buttons */}
        <View style={styles.rightSection}>{rightAction}</View>
      </View>

      {/* Large title below the row */}
      {large && (
        <View style={styles.largeTitleContainer}>
          <Text style={styles.largeTitle}>{title}</Text>
          {subtitle && <Text style={styles.largeSubtitle}>{subtitle}</Text>}
        </View>
      )}
    </View>
  );
}

/**
 * Header action button
 */
interface HeaderActionProps {
  icon: string;
  onPress: () => void;
  disabled?: boolean;
}

export function HeaderAction({ icon, onPress, disabled }: HeaderActionProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.actionButton, disabled && styles.actionDisabled]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={[styles.actionIcon, disabled && styles.actionIconDisabled]}>
        {icon}
      </Text>
    </Pressable>
  );
}

/**
 * Header text action (e.g., "Save", "Done")
 */
interface HeaderTextActionProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary';
}

export function HeaderTextAction({
  label,
  onPress,
  disabled,
  variant = 'default',
}: HeaderTextActionProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={styles.textActionButton}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text
        style={[
          styles.textActionLabel,
          variant === 'primary' && styles.textActionPrimary,
          disabled && styles.textActionDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  containerLarge: {
    paddingBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
  },
  leftSection: {
    width: 60,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 60,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backButton: {
    padding: SPACING.xs,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.primary,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: FONTS.mono,
    fontSize: FONT_SIZES.sm,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  largeTitleContainer: {
    marginTop: SPACING.sm,
  },
  largeTitle: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.foreground,
    textTransform: 'uppercase',
  },
  largeSubtitle: {
    fontFamily: FONTS.mono,
    fontSize: FONT_SIZES.md,
    color: COLORS.mutedForeground,
    marginTop: SPACING.xs,
  },
  actionButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  actionDisabled: {
    opacity: 0.5,
  },
  actionIcon: {
    fontSize: 22,
    color: COLORS.primary,
  },
  actionIconDisabled: {
    color: COLORS.mutedForeground,
  },
  textActionButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  textActionLabel: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  textActionPrimary: {
    fontWeight: '600',
  },
  textActionDisabled: {
    color: COLORS.mutedForeground,
  },
});
