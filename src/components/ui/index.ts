/**
 * UI Primitives
 *
 * Reusable UI components.
 */

// Legacy components (will be replaced by Brut* components)
export * from './Button';
export * from './Input';
export * from './Card';
export * from './Modal';

// ===================
// BRUTALIST COMPONENTS
// Neo-brutalist design system per docs/Ahoy_DESIGN_RULES.md
// ===================

/** Neo-brutalist card with hard edges and offset shadows */
export { BrutCard, getVariantBackground as getBrutCardVariantBackground } from './BrutCard';
export type { BrutCardVariant, BrutCardSize } from './BrutCard';

/** Neo-brutalist button with uppercase text and translate on press */
export { BrutButton, getVariantStyles as getBrutButtonVariantStyles } from './BrutButton';
export type { BrutButtonVariant, BrutButtonSize } from './BrutButton';

/** Neo-brutalist text input with focus state changes */
export { BrutInput, getSizeStyles as getBrutInputSizeStyles } from './BrutInput';
export type { BrutInputSize, BrutInputState } from './BrutInput';

/** Neo-brutalist badge/pill with thin border and small shadow */
export { BrutBadge, getVariantStyles as getBrutBadgeVariantStyles } from './BrutBadge';
export type { BrutBadgeVariant, BrutBadgeSize } from './BrutBadge';

/** Section badge for headers (ACTIVE CHARTER, UP NEXT) */
export { SectionBadge, getBadgeColor } from './SectionBadge';
export type { SectionBadgeVariant, SectionBadgeProps } from './SectionBadge';

/** Inline status badge (LIVE NOW, UPCOMING) */
export { StatusBadge, getStatusColor } from './StatusBadge';
export type { StatusBadgeVariant, StatusBadgeProps } from './StatusBadge';

/** Progress bar for APA spending, season progress */
export { ProgressBar, clampProgress, getProgressWidth } from './ProgressBar';
export type { ProgressBarProps } from './ProgressBar';

/** Floating action button */
export { FAB, getFABSizeStyles } from './FAB';
export type { FABSize, FABProps } from './FAB';

/** Empty state display */
export { EmptyState, getEmptyStateIcon } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';
