/**
 * App Configuration
 *
 * App-wide settings, feature flags, limits, and timeouts.
 */

export const APP_CONFIG = {
  name: 'Ahoy',
  version: '1.0.0',

  // Feature flags
  features: {
    ocr: true,
    offlineMode: true,
    pushNotifications: true,
  },

  // Limits
  limits: {
    maxCrewMembers: 20,
    maxBookingsPerSeason: 50,
    maxExpensesPerBooking: 500,
    maxImageSizeMB: 10,
    maxShoppingItems: 100,
  },

  // Timeouts (in milliseconds)
  timeouts: {
    syncInterval: 30000, // 30 seconds
    ocrTimeout: 10000, // 10 seconds
    imageUploadTimeout: 60000, // 60 seconds
  },
} as const;
