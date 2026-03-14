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
    info: 'Info',
    export: 'Export',
    exportError: 'Export failed',
    summary: 'Summary',
    total: 'Total',
    date: 'Date',
    generated: 'Generated',
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

    // Tabs
    tabs: {
      items: 'ITEMS',
      financials: 'FINANCIALS',
    },

    // Financials
    finance: {
      totalInvested: 'Total Invested',
      totalSold: 'Total Sold',
      profit: 'Profit',
      remainingStock: 'Remaining Stock',
      invested: 'Invested',
      returned: 'Returned',
      yourProfit: 'Your Profit',
      crewBreakdown: 'Per Crew Member',
      totalReturn: 'Total Return',
      remaining: 'Remaining',
      noInvestments: 'No investments',
      you: '(you)',
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
      transferConfirmTitle: 'Transfer Stock',
      transferConfirmMessage: 'This will copy all items with remaining stock to the selected season.',
      transferNoItems: 'No items to transfer',
      transferNoOtherSeasons: 'No other seasons available. Create a new season first.',
      selectSeason: 'Select Season',
    },

    // Settings
    settings: {
      storeName: 'Store Name',
      storeNamePlaceholder: 'e.g. Crew Bar, Wine Cellar',
      storeNameHint: 'Shown on expenses',
      defaultStoreName: 'Crew Pantry',
    },
  },

  // Logs
  logs: {
    // Screen titles & tabs
    title: 'Logs',
    tabs: {
      defects: 'DEFECTS',
      wishList: 'WISH LIST',
      storage: 'STORAGE',
    },

    // Common
    common: {
      addEntry: 'Add Entry',
      noEntries: 'No entries',
      createdBy: 'Created by',
      createdAt: 'Created',
      updatedAt: 'Updated',
      photos: 'Photos',
      addPhoto: 'Add Photo',
      visibility: 'Visibility',
      public: 'Public',
      private: 'Private',
      captainOnly: 'Captain only can edit',
    },

    // Defect Log
    defect: {
      title: 'Defects',
      addDefect: 'Report Defect',
      editDefect: 'Edit Defect',
      description: 'Description',
      location: 'Location',
      priority: 'Priority',
      status: 'Status',
      reportedDate: 'Reported Date',
      resolvedDate: 'Resolved Date',
      notes: 'Notes',
      empty: {
        title: 'No defects reported',
        description: 'Everything is working!',
      },
      priorities: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        critical: 'Critical',
      },
      statuses: {
        reported: 'Reported',
        in_progress: 'In Progress',
        resolved: 'Resolved',
        wont_fix: "Won't Fix",
      },
      allDefects: 'All Defects',
      defectsCount: 'defects',
      exportTitle: 'Export Defects',
    },

    // Wish List
    wish: {
      title: 'Wish List',
      addWish: 'Add Wish',
      editWish: 'Edit Wish',
      description: 'Description',
      category: 'Category',
      markDone: 'Mark as Done',
      markUndone: 'Mark as Undone',
      empty: {
        title: 'No wishes',
        description: 'Add the first wish for the boat',
      },
      categories: {
        equipment: 'Equipment',
        supplies: 'Supplies',
        maintenance: 'Maintenance',
        upgrade: 'Upgrade',
        other: 'Other',
      },
    },

    // Storage Map
    storage: {
      title: 'Storage Map',
      addItem: 'Add Item',
      editItem: 'Edit Item',
      item: 'Item',
      location: 'Location',
      quantity: 'Quantity',
      toggleVisibility: 'Toggle Visibility',
      myItems: 'My Items',
      othersItems: "Others' Items",
      transferToSeason: 'Transfer to Season',
      transferSuccess: 'Items transferred',
      empty: {
        title: 'No storage items',
        description: 'Add the first item',
      },
    },

    // Errors
    errors: {
      loadFailed: 'Failed to load',
      createFailed: 'Failed to create',
      updateFailed: 'Failed to update',
      deleteFailed: 'Failed to delete',
      uploadFailed: 'Failed to upload photo',
      notAuthorized: 'Not authorized for this action',
      entryNotFound: 'Entry not found',
    },
  },
} as const;

export default en;
