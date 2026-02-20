/**
 * useBrutFonts Hook
 *
 * Loads Space Grotesk and Space Mono fonts for brutalist design.
 * Must be called at app root before rendering any UI.
 *
 * @see docs/Ahoy_DESIGN_RULES.md Section 3 - Typography
 */

import { useFonts } from 'expo-font';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from '@expo-google-fonts/space-mono';

/**
 * Load brutalist fonts for the app.
 *
 * @returns Object with fontsLoaded boolean and error if any
 *
 * @example
 * const { fontsLoaded, fontError } = useBrutFonts();
 * if (!fontsLoaded) return <SplashScreen />;
 */
export function useBrutFonts() {
  const [fontsLoaded, fontError] = useFonts({
    // Space Grotesk - Display font for headings, labels, buttons
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,

    // Space Mono - Mono font for body text, data, metadata
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  return { fontsLoaded, fontError };
}

/**
 * Font family names for use in styles.
 * These match the FONTS config in theme.ts.
 */
export const FONT_FAMILIES = {
  // Display - Space Grotesk
  display: 'SpaceGrotesk_700Bold',
  displayRegular: 'SpaceGrotesk_400Regular',
  displayMedium: 'SpaceGrotesk_500Medium',
  displaySemiBold: 'SpaceGrotesk_600SemiBold',
  displayBold: 'SpaceGrotesk_700Bold',

  // Mono - Space Mono
  mono: 'SpaceMono_400Regular',
  monoBold: 'SpaceMono_700Bold',
} as const;
