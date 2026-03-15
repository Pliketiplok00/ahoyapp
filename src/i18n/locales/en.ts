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

  // Auth
  auth: {
    joinBoat: {
      title: 'Join Boat',
      subtitle: 'Enter the invite code from your captain',
      inviteCode: 'Invite Code',
      inviteCodePlaceholder: 'ABCD1234',
      inviteCodeHint: 'Code has 8 characters, letters and numbers',
      join: 'Join',
      noCode: "Don't have an invite code?",
      createBoat: 'Create your own boat',
      errors: {
        codeRequired: 'Please enter an invite code',
        codeTooShort: 'Invite code must have at least 6 characters',
        joinFailed: 'Failed to join boat',
      },
    },
  },

  // APA
  apa: {
    title: 'APA',
    addApa: 'Add APA',
    subtitle: 'Record cash received from guests',
    notePlaceholder: 'Note (optional)',
    adding: 'Adding...',
    spent: 'Spent',
    errors: {
      invalidAmount: 'Please enter a valid amount',
      addFailed: 'Failed to add APA entry',
    },
  },

  // Reconciliation
  reconciliation: {
    title: 'Cash Reconciliation',
    titleShort: 'Reconciliation',
    expectedCash: 'Expected Cash',
    apaReceived: 'APA Received',
    expensesTotal: 'Expenses',
    countCash: 'Count Cash',
    countCashHint: 'Enter the actual cash amount you have',
    actualCash: 'Actual Cash',
    difference: 'Difference',
    surplus: 'surplus',
    shortage: 'shortage',
    balanced: 'Balanced',
    alreadyReconciled: 'Already Reconciled',
    finishReconciliation: 'Finish Reconciliation',
    saving: 'Saving...',
    confirmTitle: 'Confirm Reconciliation',
    confirmMessage: 'There is a {{type}} of {{amount}}. Continue?',
    successTitle: 'Reconciliation Complete',
    successMessage: 'Cash reconciliation has been saved successfully.',
    bookingNotFound: 'Booking not found',
    errors: {
      invalidAmount: 'Enter a valid cash amount',
      saveFailed: 'Failed to save reconciliation',
    },
  },

  // Expenses
  expenses: {
    scan: 'Scan receipt',
    manual: 'Manual entry',
    reconciliation: 'Reconciliation',
    noReceipt: 'No receipt',
    digitalRecord: 'A digital record will be created',
    amount: 'Amount',
    merchant: 'Merchant',
    merchantPlaceholder: 'Enter merchant name',
    category: 'Category',
    note: 'Note',
    notePlaceholder: 'Add a note...',
    saveExpense: 'Save expense',
    // Capture screen
    capture: {
      title: 'Scan Receipt',
      loading: 'Loading camera...',
      cameraRequired: 'Camera Access Required',
      cameraDescription: 'Allow camera access to scan receipts, or pick an image from your gallery.',
      allowCamera: 'Allow Camera',
      pickFromGallery: 'Pick From Gallery',
      positionReceipt: 'Position receipt in frame',
      capture: 'Capture',
      or: 'or',
      photoError: 'Failed to take photo. Please try again.',
      galleryError: 'Failed to pick image. Please try again.',
    },
    // Review screen
    review: {
      title: 'Review',
      analyzing: 'Analyzing receipt...',
      analyzingHint: 'This may take a few seconds',
      notReceipt: 'Not a Receipt',
      analysisFailed: 'Analysis Failed',
      notReceiptError: "This doesn't look like a receipt. Try another image.",
      analysisError: 'Failed to analyze receipt',
      retry: 'Retry',
      enterManually: 'Enter Manually',
      extractedData: 'Extracted Data',
      connectionError: 'Cannot connect to AI service. Check your internet connection.',
      imageNotSelected: 'Image not selected',
    },
    // Edit screen
    edit: {
      title: 'Edit Expense',
      receipt: 'Receipt',
      digitalReceipt: 'Digital Record',
      manualEntry: 'Manual entry',
      unknown: 'Unknown',
      saveChanges: 'Save Changes',
      deleteExpense: 'Delete Expense',
      deleteConfirm: 'Are you sure you want to delete this expense?',
      expenseNotFound: 'Expense not found',
    },
    errors: {
      invalidAmount: 'Enter a valid amount',
      merchantRequired: 'Merchant name is required',
      saveFailed: 'Failed to save expense',
      deleteFailed: 'Failed to delete',
    },
  },

  // Income
  income: {
    title: 'Income',
    addWorkDay: 'New Work Day',
    dayType: 'Day Type',
    guestDay: 'With Guests',
    nonGuestDay: 'Without Guests',
    earnings: 'Earnings',
    noteLabel: 'Note (optional)',
    notePlaceholder: 'e.g. Charter Dubrovnik-Split',
    addDay: 'Add Work Day',
    noRatesWarning: "You haven't set daily rates. Earnings will be €0.",
    setRates: 'Set Rates',
    selectDate: 'Select Date',
    errors: {
      saveFailed: 'Failed to save',
    },
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

  // Score
  score: {
    title: 'Score',
    cardTitle: 'Crew Score Card',
    add: '+ Add',
    leaderboard: 'Leaderboard',
    history: 'History',
    entries: 'entries',
    addScore: 'Add Score',
    crewMember: 'Crew Member',
    emptyLeaderboardTitle: 'No Scores Yet',
    emptyLeaderboardText: 'Captain can add scores',
    emptyHistoryTitle: 'No History',
    emptyHistoryText: 'Scores will appear here',
    loading: 'Loading...',
    bookingNotFound: 'Booking not found',
    unknown: 'Unknown',
    from: 'from',
    awardPoints: 'Award Points',
    points: 'Points',
    reasonOptional: 'Reason (optional)',
    reasonPlaceholder: 'Late to dock, saved the day...',
    accessDenied: 'Access Denied',
    captainOnly: 'Only captains can add scores',
    cannotDelete: 'Note: Scores cannot be deleted. Add opposite points to compensate.',
  },

  // Booking
  booking: {
    edit: 'Edit Booking',
    notFound: 'Booking not found',
    startDate: 'Start Date',
    prefList: 'PREF',
    prefListUploaded: 'Preference list uploaded',
    prefListMissing: 'Preference list missing',
    statusActive: 'DAY {{day}} OF {{total}}',
    statusUpcoming: 'IN {{days}}D',
    statusCompleted: 'COMPLETED',
    sectionActive: 'Active',
    sectionUpcoming: 'Upcoming',
    sectionCompleted: 'Completed',
    sectionArchived: 'Archived',
    notes: 'Notes',
    shopping: 'Shopping',
    apaExpenses: 'APA & Expenses',
  },

  // Shopping
  shopping: {
    title: 'Shopping',
    emptyTitle: 'No Items Yet',
    emptyText: 'Add your first item to the list',
    addItem: 'Add Item',
    itemPlaceholder: 'Item name...',
    add: 'Add',
    toBuy: 'To Buy',
    purchased: 'Purchased',
    deleteItem: 'Delete Item',
    deleteConfirm: 'Remove from list?',
    errors: {
      addFailed: 'Failed to add item',
      updateFailed: 'Failed to update item',
      deleteFailed: 'Failed to delete item',
    },
  },

  // Season Settings
  seasonSettings: {
    title: 'Season Settings',
    start: 'Start',
    end: 'End',
    deleteSeason: 'Delete Season',
    noActiveSeason: 'No active season',
    boatName: 'Boat Name',
    boatNamePlaceholder: 'e.g. S/Y Ahalya',
    seasonName: 'Season Name',
    seasonNamePlaceholder: 'e.g. Summer 2026',
    dates: 'Dates',
    datesReadOnly: 'Dates cannot be changed after season creation',
    currency: 'Currency',
    currencyReadOnly: 'Currency cannot be changed after season creation',
    seasonInfo: 'Season Info',
    created: 'Created',
    tipSplit: 'Tip Split',
    equal: 'Equal',
    custom: 'Custom',
    saveChanges: 'Save Changes',
    dangerZone: 'Danger Zone',
    dangerWarning: 'Deleting season will permanently remove all bookings, expenses and crew data.',
    accessDenied: 'Access Denied',
    captainOnly: 'Only captain can edit season settings.',
    boatNameRequired: 'Boat name is required',
    seasonNameRequired: 'Season name is required',
    saved: 'Saved',
    settingsUpdated: 'Season settings updated.',
    cannotSave: 'Cannot save changes',
    deleteConfirmTitle: 'Delete Season',
    deleteConfirmMessage: 'Are you sure you want to delete this season? This action cannot be undone. All bookings, expenses and crew data will be permanently deleted.',
    deleted: 'Deleted',
    seasonDeleted: 'Season has been deleted.',
    cannotDelete: 'Cannot delete season',
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
