/**
 * AHOY THEME CONFIG
 * =================
 * All design values in one place.
 * Components MUST use these values - no hardcoding!
 *
 * Based on: docs/Ahoy_DESIGN_RULES.md
 *
 * SKIN-BASED RULE: This is the ONLY file where raw HSL values are allowed.
 * All other files MUST import from here.
 */

// ===================
// COLORS (HSL values from DESIGN_RULES.md Section 2)
// ===================
export const COLORS = {
  // Core
  background: 'hsl(55, 30%, 94%)',      // Warm cream — app background
  foreground: 'hsl(220, 25%, 8%)',      // Near-black — text, borders, shadows
  card: 'hsl(0, 0%, 100%)',             // Pure white — card backgrounds

  // Primary Accents
  primary: 'hsl(196, 90%, 55%)',        // Sky blue — main accent, headers, CTAs
  primaryLight: 'hsl(196, 90%, 90%)',   // Light blue — tinted backgrounds
  secondary: 'hsl(220, 25%, 8%)',       // Near-black — dark buttons
  accent: 'hsl(80, 70%, 52%)',          // Lime green — secondary CTAs, tags
  pink: 'hsl(330, 90%, 55%)',           // Hot pink — tertiary accent

  // UI States
  muted: 'hsl(55, 20%, 88%)',           // Muted cream — disabled states, bg
  mutedForeground: 'hsl(220, 12%, 45%)', // Mid-grey — secondary text
  destructive: 'hsl(0, 80%, 55%)',      // Red — errors, destructive actions

  // Stats
  statsBg: 'hsl(35, 95%, 58%)',         // Amber — stats highlights

  // Hero colors (for colored section headers)
  heroBlue: 'hsl(196, 90%, 55%)',
  heroPink: 'hsl(330, 90%, 55%)',
  heroAmber: 'hsl(35, 95%, 62%)',
  heroTeal: 'hsl(172, 55%, 48%)',
  heroLime: 'hsl(80, 70%, 52%)',

  // Crew colors (8 distinct, for member identification)
  crew: [
    'hsl(196, 90%, 55%)',   // 0: sky blue
    'hsl(330, 90%, 55%)',   // 1: hot pink
    'hsl(35, 95%, 58%)',    // 2: amber
    'hsl(80, 70%, 52%)',    // 3: lime
    'hsl(142, 60%, 38%)',   // 4: forest
    'hsl(260, 65%, 65%)',   // 5: purple
    'hsl(0, 80%, 55%)',     // 6: red
    'hsl(200, 70%, 52%)',   // 7: teal
  ] as const,

  // Status colors
  status: {
    active: 'hsl(196, 90%, 55%)',
    activeBg: 'hsl(196, 90%, 90%)',
    upcoming: 'hsl(80, 70%, 52%)',
    upcomingBg: 'hsl(80, 70%, 90%)',
    completed: 'hsl(220, 12%, 45%)',
    completedBg: 'hsl(55, 20%, 88%)',
    cancelled: 'hsl(0, 80%, 55%)',
    cancelledBg: 'hsl(0, 80%, 90%)',
  },

  // Score colors
  score: {
    positive: 'hsl(142, 60%, 42%)',  // forest green
    negative: 'hsl(0, 75%, 52%)',    // red
    neutral: 'hsl(220, 12%, 45%)',   // muted
  },

  // Transparent & Absolute
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',

  // Overlay colors (for modals, backdrops)
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(255, 255, 255, 0.2)',
  overlayLightStrong: 'rgba(255, 255, 255, 0.9)',

  // ===================
  // LEGACY COMPATIBILITY (to be removed after full migration)
  // ===================
  coral: 'hsl(196, 90%, 55%)',          // Maps to primary
  warmYellow: 'hsl(35, 95%, 58%)',      // Maps to statsBg
  sageGreen: 'hsl(80, 70%, 52%)',       // Maps to accent
  steelBlue: 'hsl(200, 70%, 52%)',      // Maps to heroTeal
  statusActive: 'hsl(196, 90%, 55%)',
  statusUpcoming: 'hsl(80, 70%, 52%)',
  statusCompleted: 'hsl(220, 12%, 45%)',
  statusCancelled: 'hsl(0, 80%, 55%)',
  surface: 'hsl(55, 20%, 88%)',
  border: 'hsl(220, 25%, 8%)',
  textPrimary: 'hsl(220, 25%, 8%)',
  textSecondary: 'hsl(220, 12%, 45%)',
  textMuted: 'hsl(220, 12%, 45%)',
  success: 'hsl(142, 60%, 42%)',
  warning: 'hsl(35, 95%, 58%)',
  error: 'hsl(0, 80%, 55%)',
  info: 'hsl(196, 90%, 55%)',
} as const;

// ===================
// SHADOWS - OFFSET ONLY, NO BLUR (per DESIGN_RULES.md Section 1)
// ===================
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  brutSm: {
    shadowColor: COLORS.foreground,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,  // BRUTALIST: No blur!
    elevation: 2,
  },
  brut: {
    shadowColor: COLORS.foreground,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,  // BRUTALIST: No blur!
    elevation: 4,
  },
  brutLg: {
    shadowColor: COLORS.foreground,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,  // BRUTALIST: No blur!
    elevation: 6,
  },
} as const;

// ===================
// BORDERS (per DESIGN_RULES.md Section 1)
// ===================
export const BORDERS = {
  none: 0,
  thin: 1.5,    // Light borders — small elements
  normal: 2,    // Standard — cards, buttons
  heavy: 3,     // Heavy — headers, dividers
} as const;

// ===================
// BORDER RADIUS - ALWAYS 0 FOR BRUTALIST!
// ===================
export const BORDER_RADIUS = {
  none: 0,  // The only value we use!
  // Legacy compatibility (all map to 0)
  sm: 0,
  md: 0,
  lg: 0,
  xl: 0,
  full: 0,
} as const;

// ===================
// SPACING
// ===================
export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ===================
// LAYOUT
// ===================
export const LAYOUT = {
  appMaxWidth: 430,
  tabBarHeight: 72,
  headerHeight: 56,
  pagePaddingHorizontal: 16,  // px-4
  pagePaddingLarge: 20,       // px-5
  cardPadding: 16,            // p-4
  cardPaddingLarge: 20,       // p-5
} as const;

// ===================
// TYPOGRAPHY
// ===================
export const TYPOGRAPHY = {
  // Font sizes
  sizes: {
    hero: 40,         // 4xl-5xl — Page heroes
    sectionTitle: 28, // 2xl-3xl — Card titles
    cardTitle: 20,    // xl — Booking names
    large: 18,        // lg
    body: 14,         // sm — Regular text
    label: 12,        // xs — Section labels
    meta: 10,         // 10px — Timestamps, tiny text
  },
  // Line heights
  lineHeights: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
  },
  // Letter spacing
  letterSpacing: {
    tight: -0.01,      // Headings
    normal: 0,
    wide: 0.05,
    widest: 0.1,       // Labels (tracking-widest)
  },
} as const;

// ===================
// FONTS
// ===================
export const FONTS = {
  display: 'SpaceGrotesk_700Bold',   // Headings, labels, buttons
  mono: 'SpaceMono_400Regular',      // Body text, data, metadata
  monoBold: 'SpaceMono_700Bold',     // Bold mono text
} as const;

// ===================
// FONT SIZES (Legacy compatibility)
// ===================
export const FONT_SIZES = {
  xs: TYPOGRAPHY.sizes.meta,
  sm: TYPOGRAPHY.sizes.label,
  md: TYPOGRAPHY.sizes.body,
  lg: TYPOGRAPHY.sizes.large,
  xl: TYPOGRAPHY.sizes.cardTitle,
  xxl: TYPOGRAPHY.sizes.sectionTitle,
  xxxl: TYPOGRAPHY.sizes.hero,
  display: TYPOGRAPHY.sizes.hero,
} as const;

// ===================
// ANIMATION (per DESIGN_RULES.md Section 8)
// ===================
export const ANIMATION = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 200,
    slow: 300,
  },
  // Button press transform - BRUTALIST: translate, NOT scale!
  pressedTransform: [
    { translateX: 1 },
    { translateY: 1 },
  ] as const,
} as const;

// ===================
// COMPONENT PRESETS (commonly used combinations)
// ===================
export const PRESETS = {
  card: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    ...SHADOWS.brut,
  },
  cardColored: (bgColor: string) => ({
    backgroundColor: bgColor,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    ...SHADOWS.brut,
  }),
  buttonBase: {
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  inputBase: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  badgeBase: {
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    ...SHADOWS.brutSm,
  },
} as const;

// ===================
// USER COLORS (Legacy - 20 crew colors)
// ===================
export const USER_COLORS = [
  'hsl(0, 80%, 55%)',    // red
  'hsl(25, 90%, 55%)',   // orange
  'hsl(35, 95%, 58%)',   // amber
  'hsl(50, 90%, 50%)',   // yellow
  'hsl(80, 70%, 52%)',   // lime
  'hsl(142, 60%, 42%)',  // green
  'hsl(160, 60%, 45%)',  // emerald
  'hsl(172, 55%, 48%)',  // teal
  'hsl(196, 90%, 55%)',  // cyan/sky
  'hsl(200, 70%, 52%)',  // blue
  'hsl(220, 70%, 55%)',  // indigo
  'hsl(240, 60%, 60%)',  // violet
  'hsl(260, 65%, 65%)',  // purple
  'hsl(280, 70%, 60%)',  // fuchsia
  'hsl(330, 90%, 55%)',  // pink
  'hsl(350, 80%, 55%)',  // rose
  'hsl(15, 50%, 45%)',   // brown
  'hsl(30, 30%, 40%)',   // stone
  'hsl(200, 10%, 50%)',  // slate
  'hsl(220, 25%, 30%)',  // zinc
] as const;
