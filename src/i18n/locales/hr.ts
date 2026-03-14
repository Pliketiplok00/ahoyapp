/**
 * Croatian (HR) Translations
 *
 * Default language for AhoyCrew app.
 * All user-visible strings must be defined here.
 */

const hr = {
  // Navigation
  nav: {
    home: 'POČETNA',
    bookings: 'BOOKINGS',
    pantry: 'PANTRY',
    stats: 'STATISTIKA',
    logs: 'ZAPISNICI',
    settings: 'POSTAVKE',
  },

  // Common
  common: {
    loading: 'Učitavanje...',
    error: 'Greška',
    retry: 'Pokušaj ponovo',
    save: 'Spremi',
    cancel: 'Odustani',
    delete: 'Obriši',
    edit: 'Uredi',
    add: 'Dodaj',
    close: 'Zatvori',
    confirm: 'Potvrdi',
    back: 'Natrag',
    next: 'Dalje',
    done: 'Gotovo',
    yes: 'Da',
    no: 'Ne',
    ok: 'U redu',
    search: 'Pretraži',
    filter: 'Filtriraj',
    sort: 'Sortiraj',
    all: 'Sve',
    none: 'Ništa',
    required: 'Obavezno',
    optional: 'Opcionalno',
    info: 'Informacija',
    export: 'Izvoz',
    exportError: 'Greška pri izvozu',
    summary: 'Sažetak',
    total: 'Ukupno',
    date: 'Datum',
    generated: 'Generirano',
  },

  // Placeholder screens
  placeholder: {
    comingSoon: 'Uskoro dolazi',
    underConstruction: 'U izgradnji',
    pantryDescription: 'Upravljanje zalihama posade',
    logsDescription: 'Zapisnici i evidencije',
  },

  // Settings
  settings: {
    title: 'Postavke',
    language: 'Jezik',
    languageHr: 'Hrvatski',
    languageEn: 'English',
    profile: 'Profil',
    income: 'Prihod',
    about: 'O aplikaciji',
    logout: 'Odjava',
    version: 'Verzija',
  },

  // Errors
  errors: {
    generic: 'Nešto je pošlo po zlu',
    network: 'Provjerite internetsku vezu',
    unauthorized: 'Niste prijavljeni',
    notFound: 'Nije pronađeno',
    serverError: 'Greška na serveru',
  },

  // Expenses
  expenses: {
    scan: 'Skeniraj račun',
    manual: 'Ručni unos',
    reconciliation: 'Obračun',
  },

  // Pantry
  pantry: {
    // Screen titles
    title: 'Pantry',
    addItem: 'Dodaj artikl',
    editItem: 'Uredi artikl',
    itemDetails: 'Detalji artikla',
    sell: 'Prodaj',
    financials: 'Financije',

    // Categories
    categories: {
      wine: 'Vino',
      spirits: 'Žestica',
      beer: 'Pivo',
      other: 'Ostalo',
    },

    // Form fields
    fields: {
      name: 'Naziv',
      category: 'Kategorija',
      quantity: 'Količina',
      purchasePrice: 'Nabavna cijena',
      markup: 'Marža',
      sellingPrice: 'Prodajna cijena',
      investors: 'Ulagači',
      selectInvestors: 'Odaberi ulagače',
      equalSplit: 'Podijeli jednako',
    },

    // Stock status
    stock: {
      inStock: 'Na zalihi',
      lowStock: 'Malo na zalihi',
      outOfStock: 'Nema na zalihi',
      units: 'kom',
    },

    // Sale
    sale: {
      selectQuantity: 'Odaberi količinu',
      selectBooking: 'Odaberi booking',
      total: 'Ukupno',
      confirmSale: 'Potvrdi prodaju',
      saleSuccess: 'Prodaja uspješna',
      noActiveBookings: 'Nema aktivnih ili nadolazećih bookinga',
    },

    // Detail screen
    salesHistory: 'Povijest prodaja',
    noSales: 'Nema prodaja',
    confirmDelete: 'Jeste li sigurni da želite obrisati ovaj artikl?',

    // Tabs
    tabs: {
      items: 'ARTIKLI',
      financials: 'FINANCIJE',
    },

    // Financials
    finance: {
      totalInvested: 'Ukupno uloženo',
      totalSold: 'Ukupno prodano',
      profit: 'Zarada',
      remainingStock: 'Preostale zalihe',
      invested: 'Uloženo',
      returned: 'Povrat',
      yourProfit: 'Tvoja zarada',
      crewBreakdown: 'Po članu posade',
      totalReturn: 'Ukupni povrat',
      remaining: 'Preostalo',
      noInvestments: 'Nema ulaganja',
      you: '(ti)',
    },

    // Summary
    summary: {
      items: 'artikala',
      value: 'Vrijednost',
    },

    // Empty state
    empty: {
      title: 'Nema artikala',
      description: 'Dodaj prvi artikl u pantry',
    },

    // Errors (i18n keys used by service)
    errors: {
      createFailed: 'Greška pri kreiranju artikla',
      loadFailed: 'Greška pri učitavanju',
      updateFailed: 'Greška pri ažuriranju',
      deleteFailed: 'Greška pri brisanju',
      itemNotFound: 'Artikl nije pronađen',
      insufficientStock: 'Nedovoljna količina na zalihi',
      saleFailed: 'Greška pri prodaji',
      loadSalesFailed: 'Greška pri učitavanju prodaja',
      financialsFailed: 'Greška pri izračunu financija',
      transferFailed: 'Greška pri prijenosu artikala',
      noSeasonOrUser: 'Nema aktivne sezone ili korisnika',
    },

    // Actions
    actions: {
      transfer: 'Prenesi u novu sezonu',
      transferSuccess: 'Preneseno artikala',
      transferConfirmTitle: 'Prijenos zaliha',
      transferConfirmMessage: 'Ovo će kopirati sve artikle s preostalim zalihama u odabranu sezonu.',
      transferNoItems: 'Nema artikala za prijenos',
      transferNoOtherSeasons: 'Nema drugih sezona. Prvo kreiraj novu sezonu.',
      selectSeason: 'Odaberi sezonu',
    },

    // Settings
    settings: {
      storeName: 'Naziv trgovine',
      storeNamePlaceholder: 'npr. Crew Bar, Wine Cellar',
      storeNameHint: 'Prikazuje se na troškovima',
      defaultStoreName: 'Crew Pantry',
    },
  },

  // Logs
  logs: {
    // Screen titles & tabs
    title: 'Zapisnici',
    tabs: {
      defects: 'KVAROVI',
      wishList: 'ŽELJE',
      storage: 'SKLADIŠTE',
    },

    // Common
    common: {
      addEntry: 'Dodaj unos',
      noEntries: 'Nema unosa',
      createdBy: 'Kreirao',
      createdAt: 'Kreirano',
      updatedAt: 'Ažurirano',
      photos: 'Fotografije',
      addPhoto: 'Dodaj fotografiju',
      visibility: 'Vidljivost',
      public: 'Javno',
      private: 'Privatno',
      captainOnly: 'Samo kapetan može uređivati',
    },

    // Defect Log
    defect: {
      title: 'Kvarovi',
      addDefect: 'Prijavi kvar',
      editDefect: 'Uredi kvar',
      description: 'Opis kvara',
      location: 'Lokacija',
      priority: 'Prioritet',
      status: 'Status',
      reportedDate: 'Datum prijave',
      resolvedDate: 'Datum popravka',
      notes: 'Napomene',
      empty: {
        title: 'Nema prijavljenih kvarova',
        description: 'Sve je ispravno!',
      },
      priorities: {
        low: 'Nizak',
        medium: 'Srednji',
        high: 'Visok',
        critical: 'Kritičan',
      },
      statuses: {
        reported: 'Prijavljeno',
        in_progress: 'U tijeku',
        resolved: 'Riješeno',
        wont_fix: 'Neće se popraviti',
      },
      allDefects: 'Svi kvarovi',
      defectsCount: 'kvarova',
      exportTitle: 'Izvoz kvarova',
    },

    // Wish List
    wish: {
      title: 'Lista želja',
      addWish: 'Dodaj želju',
      editWish: 'Uredi želju',
      description: 'Opis',
      category: 'Kategorija',
      markDone: 'Označi kao gotovo',
      markUndone: 'Označi kao neriješeno',
      empty: {
        title: 'Nema želja',
        description: 'Dodaj prvu želju za brod',
      },
      categories: {
        equipment: 'Oprema',
        supplies: 'Potrošni materijal',
        maintenance: 'Održavanje',
        upgrade: 'Nadogradnja',
        other: 'Ostalo',
      },
    },

    // Storage Map
    storage: {
      title: 'Mapa skladišta',
      addItem: 'Dodaj artikl',
      editItem: 'Uredi artikl',
      item: 'Artikl',
      location: 'Lokacija',
      quantity: 'Količina',
      toggleVisibility: 'Promijeni vidljivost',
      myItems: 'Moji artikli',
      othersItems: 'Artikli drugih',
      transferToSeason: 'Prenesi u drugu sezonu',
      transferSuccess: 'Preneseno artikala',
      empty: {
        title: 'Nema artikala u skladištu',
        description: 'Dodaj prvi artikl',
      },
    },

    // Errors
    errors: {
      loadFailed: 'Greška pri učitavanju',
      createFailed: 'Greška pri kreiranju',
      updateFailed: 'Greška pri ažuriranju',
      deleteFailed: 'Greška pri brisanju',
      uploadFailed: 'Greška pri uploadu fotografije',
      notAuthorized: 'Nemate ovlasti za ovu radnju',
      entryNotFound: 'Unos nije pronađen',
    },
  },
} as const;

export default hr;

/**
 * Type for translation structure (keys only, not values)
 * This ensures en.ts has the same structure as hr.ts
 */
type DeepStringRecord<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringRecord<T[K]>;
};

export type TranslationKeys = DeepStringRecord<typeof hr>;
