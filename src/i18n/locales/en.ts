/**
 * English (EN) Translations
 *
 * English language support for AhoyCrew app.
 * Structure must match hr.ts exactly.
 */

import type { TranslationKeys } from './hr';

const en: TranslationKeys = {
  // Navigation
  nav: {
    home: 'HOME',
    bookings: 'BOOKINGS',
    pantry: 'PANTRY',
    stats: 'STATS',
    logs: 'LOGS',
    settings: 'SETTINGS',
  },

  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    all: 'All',
    none: 'None',
    required: 'Required',
    optional: 'Optional',
  },

  // Placeholder screens
  placeholder: {
    comingSoon: 'Coming Soon',
    underConstruction: 'Under Construction',
    pantryDescription: 'Crew inventory management',
    logsDescription: 'Logs and records',
  },

  // Settings
  settings: {
    title: 'Settings',
    language: 'Language',
    languageHr: 'Hrvatski',
    languageEn: 'English',
    profile: 'Profile',
    income: 'Income',
    about: 'About',
    logout: 'Logout',
    version: 'Version',
  },

  // Errors
  errors: {
    generic: 'Something went wrong',
    network: 'Check your internet connection',
    unauthorized: 'Not logged in',
    notFound: 'Not found',
    serverError: 'Server error',
  },
} as const;

export default en;
