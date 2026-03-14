/**
 * i18n Configuration
 *
 * Internationalization setup for AhoyCrew app.
 * - Default language: Croatian (HR)
 * - Supported: HR, EN
 * - Language persisted to AsyncStorage
 *
 * Usage:
 *   import { useAppTranslation } from '@/i18n';
 *   const { t } = useAppTranslation();
 *   <Text>{t('nav.home')}</Text>
 */

import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import hr from './locales/hr';
import en from './locales/en';

// Storage key for persisted language preference
const LANGUAGE_STORAGE_KEY = '@ahoy_language';

// Supported languages
export const SUPPORTED_LANGUAGES = {
  hr: { code: 'hr', name: 'Hrvatski', nativeName: 'Hrvatski' },
  en: { code: 'en', name: 'English', nativeName: 'English' },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

// Default language
export const DEFAULT_LANGUAGE: LanguageCode = 'hr';

/**
 * Get stored language preference from AsyncStorage
 */
export async function getStoredLanguage(): Promise<LanguageCode> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && (stored === 'hr' || stored === 'en')) {
      return stored as LanguageCode;
    }
  } catch (error) {
    console.warn('[i18n] Error reading language from storage:', error);
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Save language preference to AsyncStorage
 */
export async function setStoredLanguage(language: LanguageCode): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.warn('[i18n] Error saving language to storage:', error);
  }
}

/**
 * Change the current language
 */
export async function changeLanguage(language: LanguageCode): Promise<void> {
  await i18n.changeLanguage(language);
  await setStoredLanguage(language);
}

/**
 * Get current language code
 */
export function getCurrentLanguage(): LanguageCode {
  return (i18n.language as LanguageCode) || DEFAULT_LANGUAGE;
}

/**
 * Initialize i18n
 * Call this once at app startup (before rendering)
 */
export async function initI18n(): Promise<void> {
  const storedLanguage = await getStoredLanguage();

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        hr: { translation: hr },
        en: { translation: en },
      },
      lng: storedLanguage,
      fallbackLng: DEFAULT_LANGUAGE,
      interpolation: {
        escapeValue: false, // React already escapes
      },
      react: {
        useSuspense: false, // Disable suspense for React Native
      },
    });
}

/**
 * Custom hook for translations
 *
 * @example
 * const { t, language, changeLanguage } = useAppTranslation();
 * <Text>{t('nav.home')}</Text>
 */
export function useAppTranslation() {
  const { t, i18n: i18nInstance } = useTranslation();

  return {
    t,
    language: i18nInstance.language as LanguageCode,
    changeLanguage: async (lang: LanguageCode) => {
      await changeLanguage(lang);
    },
    isHr: i18nInstance.language === 'hr',
    isEn: i18nInstance.language === 'en',
  };
}

// Export the i18n instance for direct access if needed
export { i18n };

// Re-export types
export type { TranslationKeys } from './locales/hr';
