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

  // Pantry
  pantry: {
    // Screen titles
    title: 'Pantry',
    addItem: 'Add Item',
    editItem: 'Edit Item',
    itemDetails: 'Item Details',
    sell: 'Sell',
    financials: 'Financials',

    // Categories
    categories: {
      wine: 'Wine',
      spirits: 'Spirits',
      beer: 'Beer',
      other: 'Other',
    },

    // Form fields
    fields: {
      name: 'Name',
      category: 'Category',
      quantity: 'Quantity',
      purchasePrice: 'Purchase Price',
      markup: 'Markup',
      sellingPrice: 'Selling Price',
      investors: 'Investors',
      selectInvestors: 'Select Investors',
      equalSplit: 'Split Equally',
    },

    // Stock status
    stock: {
      inStock: 'In Stock',
      lowStock: 'Low Stock',
      outOfStock: 'Out of Stock',
      units: 'pcs',
    },

    // Sale
    sale: {
      selectQuantity: 'Select Quantity',
      selectBooking: 'Select Booking',
      total: 'Total',
      confirmSale: 'Confirm Sale',
      saleSuccess: 'Sale successful',
      noActiveBookings: 'No active or upcoming bookings',
    },

    // Detail screen
    salesHistory: 'Sales History',
    noSales: 'No sales',
    confirmDelete: 'Are you sure you want to delete this item?',

    // Financials
    finance: {
      totalInvested: 'Total Invested',
      totalSold: 'Total Sold',
      profit: 'Profit',
      remainingStock: 'Remaining Stock',
      invested: 'Invested',
      returned: 'Returned',
      yourProfit: 'Your Profit',
    },

    // Summary
    summary: {
      items: 'items',
      value: 'Value',
    },

    // Empty state
    empty: {
      title: 'No Items',
      description: 'Add your first pantry item',
    },

    // Errors (i18n keys used by service)
    errors: {
      createFailed: 'Failed to create item',
      loadFailed: 'Failed to load',
      updateFailed: 'Failed to update',
      deleteFailed: 'Failed to delete',
      itemNotFound: 'Item not found',
      insufficientStock: 'Insufficient stock',
      saleFailed: 'Failed to create sale',
      loadSalesFailed: 'Failed to load sales',
      financialsFailed: 'Failed to calculate financials',
      transferFailed: 'Failed to transfer items',
      noSeasonOrUser: 'No active season or user',
    },

    // Actions
    actions: {
      transfer: 'Transfer to New Season',
      transferSuccess: 'Items transferred',
    },
  },
} as const;

export default en;
