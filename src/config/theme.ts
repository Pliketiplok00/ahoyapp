/**
 * Theme Configuration
 *
 * Colors, spacing, fonts, and other design tokens.
 */

export const COLORS = {
  // Brand (Color Blocking)
  coral: '#E85D3B',
  warmYellow: '#F5B800',
  sageGreen: '#8CB369',
  steelBlue: '#7B9AAF',

  // Status
  statusActive: '#4CAF50',
  statusUpcoming: '#FF9800',
  statusCompleted: '#607D8B',
  statusCancelled: '#EF4444',

  // Neutral
  white: '#FFFFFF',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  border: '#E5E5E5',
  textPrimary: '#1A1A1A',
  textSecondary: '#4A4A4A',
  textMuted: '#7A7A7A',

  // Semantic
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#EF4444',
  info: '#2196F3',
} as const;

/**
 * 20 predefined colors for crew member assignment.
 * Assigned automatically at onboarding.
 */
export const USER_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
  '#F43F5E', '#78716C', '#57534E', '#44403C',
] as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
  display: 48,
} as const;

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;
