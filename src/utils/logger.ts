/**
 * Logger Utility
 *
 * Development-only logging wrapper.
 * Prevents console.logs from appearing in production builds.
 */

/* eslint-disable no-console */
declare const __DEV__: boolean;

/**
 * Logger that only outputs in development mode
 */
export const logger = {
  /**
   * Log message (dev only)
   */
  log: (...args: unknown[]): void => {
    if (__DEV__) console.log(...args);
  },

  /**
   * Warning message (dev only)
   */
  warn: (...args: unknown[]): void => {
    if (__DEV__) console.warn(...args);
  },

  /**
   * Error message (always logs for crash reporting)
   */
  error: (...args: unknown[]): void => {
    console.error(...args);
  },
};
