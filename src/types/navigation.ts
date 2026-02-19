/**
 * Navigation Types
 *
 * TypeScript types for navigation parameters and routes.
 */

/**
 * Auth stack routes
 */
export type AuthStackParamList = {
  login: undefined;
  onboarding: undefined;
  'create-boat': undefined;
  'join-boat': undefined;
  'invite-crew': { seasonId: string };
};

/**
 * Main tab routes
 */
export type MainTabParamList = {
  index: undefined; // Home
  bookings: undefined;
  stats: undefined;
  settings: undefined;
};

/**
 * Booking stack routes
 */
export type BookingStackParamList = {
  '[id]': { id: string };
  new: undefined;
  edit: { id: string };
};

/**
 * Expense stack routes
 */
export type ExpenseStackParamList = {
  '[bookingId]': { bookingId: string };
  capture: { bookingId: string };
  manual: { bookingId: string };
  review: { bookingId: string; imageUri: string };
};

/**
 * Root stack routes
 */
export type RootStackParamList = {
  '(auth)': undefined;
  '(main)': undefined;
  index: undefined;
};

/**
 * All possible route names
 */
export type RouteName =
  | keyof AuthStackParamList
  | keyof MainTabParamList
  | keyof BookingStackParamList
  | keyof ExpenseStackParamList
  | keyof RootStackParamList;

/**
 * Navigation helper types
 */
export interface NavigationRoute<T extends RouteName> {
  name: T;
  params?: Record<string, unknown>;
}

/**
 * Declare global navigation types for expo-router
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
