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

  // Auth
  auth: {
    joinBoat: {
      title: 'Pridruži se brodu',
      subtitle: 'Unesi pozivni kod koji si dobio/la od svog kapetana',
      inviteCode: 'Pozivni kod',
      inviteCodePlaceholder: 'ABCD1234',
      inviteCodeHint: 'Kod ima 8 znakova, slova i brojeve',
      join: 'Pridruži se',
      noCode: 'Nemaš pozivni kod?',
      createBoat: 'Kreiraj svoj brod',
      errors: {
        codeRequired: 'Molimo unesite pozivni kod',
        codeTooShort: 'Pozivni kod mora imati najmanje 6 znakova',
        joinFailed: 'Pridruživanje brodu nije uspjelo',
      },
    },
  },

  // APA
  apa: {
    title: 'APA',
    addApa: 'Dodaj APA',
    subtitle: 'Zabilježi gotovinu primljenu od gostiju',
    notePlaceholder: 'Napomena (opcionalno)',
    adding: 'Dodavanje...',
    errors: {
      invalidAmount: 'Unesite ispravan iznos',
      addFailed: 'Dodavanje APA unosa nije uspjelo',
    },
  },

  // Reconciliation
  reconciliation: {
    title: 'Obračun gotovine',
    titleShort: 'Obračun',
    expectedCash: 'Očekivana gotovina',
    apaReceived: 'APA primljen',
    expensesTotal: 'Troškovi',
    countCash: 'Prebroji gotovinu',
    countCashHint: 'Unesite stvarni iznos gotovine koji imate',
    actualCash: 'Stvarna gotovina',
    difference: 'Razlika',
    surplus: 'višak',
    shortage: 'manjak',
    balanced: 'Uravnoteženo',
    alreadyReconciled: 'Već obračunato',
    finishReconciliation: 'Završi obračun',
    saving: 'Spremanje...',
    confirmTitle: 'Potvrdi obračun',
    confirmMessage: 'Postoji {{type}} od {{amount}}. Nastaviti?',
    successTitle: 'Obračun završen',
    successMessage: 'Obračun gotovine je uspješno spremljen.',
    bookingNotFound: 'Booking nije pronađen',
    errors: {
      invalidAmount: 'Unesite ispravan iznos gotovine',
      saveFailed: 'Nije uspjelo spremanje obračuna',
    },
  },

  // Expenses
  expenses: {
    scan: 'Skeniraj račun',
    manual: 'Ručni unos',
    reconciliation: 'Obračun',
    noReceipt: 'Bez računa',
    digitalRecord: 'Kreirat će se digitalni zapis',
    amount: 'Iznos',
    merchant: 'Trgovina',
    merchantPlaceholder: 'Unesite naziv trgovine',
    category: 'Kategorija',
    note: 'Napomena',
    notePlaceholder: 'Dodaj napomenu...',
    saveExpense: 'Spremi trošak',
    // Capture screen
    capture: {
      title: 'Skeniraj račun',
      loading: 'Učitavanje kamere...',
      cameraRequired: 'Potreban pristup kameri',
      cameraDescription: 'Dozvolite pristup kameri za skeniranje računa, ili odaberite sliku iz galerije.',
      allowCamera: 'Dozvoli kameru',
      pickFromGallery: 'Odaberi iz galerije',
      positionReceipt: 'Pozicioniraj račun u okvir',
      capture: 'Snimi',
      or: 'ili',
      photoError: 'Nije uspjelo fotografiranje. Pokušajte ponovo.',
      galleryError: 'Nije uspjelo odabiranje slike. Pokušajte ponovo.',
    },
    // Review screen
    review: {
      title: 'Pregled',
      analyzing: 'Analiziranje računa...',
      analyzingHint: 'Ovo može potrajati nekoliko sekundi',
      notReceipt: 'Nije račun',
      analysisFailed: 'Analiza nije uspjela',
      notReceiptError: 'Ovo ne izgleda kao račun. Pokušajte s drugom slikom.',
      analysisError: 'Nije uspjela analiza računa',
      retry: 'Pokušaj ponovo',
      enterManually: 'Unesi ručno',
      extractedData: 'Izvučeni podaci',
      connectionError: 'Nije moguće spojiti se na AI servis. Provjerite internetsku vezu.',
      imageNotSelected: 'Slika nije odabrana',
    },
    // Edit screen
    edit: {
      title: 'Uredi trošak',
      receipt: 'Račun',
      digitalReceipt: 'Digitalni zapis',
      manualEntry: 'Uneseno ručno',
      unknown: 'Nepoznato',
      saveChanges: 'Spremi promjene',
      deleteExpense: 'Obriši trošak',
      deleteConfirm: 'Jeste li sigurni da želite obrisati ovaj trošak?',
      expenseNotFound: 'Trošak nije pronađen',
    },
    errors: {
      invalidAmount: 'Unesite ispravan iznos',
      merchantRequired: 'Unesite naziv trgovine',
      saveFailed: 'Nije uspjelo spremanje troška',
      deleteFailed: 'Nije uspjelo brisanje',
    },
  },

  // Income
  income: {
    title: 'Prihod',
    addWorkDay: 'Novi radni dan',
    dayType: 'Vrsta dana',
    guestDay: 'S gostima',
    nonGuestDay: 'Bez gostiju',
    earnings: 'Zarada',
    noteLabel: 'Bilješka (opcionalno)',
    notePlaceholder: 'Npr. Charter Dubrovnik-Split',
    addDay: 'Dodaj radni dan',
    noRatesWarning: 'Nemaš postavljene dnevnice. Zarada će biti 0€.',
    setRates: 'Postavi dnevnice',
    selectDate: 'Odaberi datum',
    errors: {
      saveFailed: 'Greška pri spremanju',
    },
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

  // Score
  score: {
    title: 'Bodovi',
    leaderboard: 'Tablica',
    history: 'Povijest',
    entries: 'unosa',
    addScore: 'Dodaj bod',
    crewMember: 'Član posade',
    emptyLeaderboardTitle: 'Još nema bodova',
    emptyLeaderboardText: 'Kapetan može dodati bodove',
    emptyHistoryTitle: 'Nema povijesti',
    emptyHistoryText: 'Ovdje će se prikazati bodovi',
    loading: 'Učitavanje...',
    bookingNotFound: 'Booking nije pronađen',
    unknown: 'Nepoznato',
    from: 'od',
    awardPoints: 'Dodijeli bodove',
    points: 'Bodovi',
    reasonOptional: 'Razlog (opcionalno)',
    reasonPlaceholder: 'Zakasnio na vez, spasio dan...',
    accessDenied: 'Pristup odbijen',
    captainOnly: 'Samo kapetani mogu dodati bodove',
    cannotDelete: 'Napomena: Bodovi se ne mogu obrisati. Dodaj suprotne bodove za kompenzaciju.',
  },

  // Booking
  booking: {
    edit: 'Uredi booking',
    notFound: 'Booking nije pronađen',
    startDate: 'Datum početka',
  },

  // Shopping
  shopping: {
    title: 'Kupovina',
    emptyTitle: 'Još nema stavki',
    emptyText: 'Dodaj prvu stavku na listu',
    addItem: 'Dodaj stavku',
    itemPlaceholder: 'Naziv stavke...',
    add: 'Dodaj',
    toBuy: 'Za kupiti',
    purchased: 'Kupljeno',
    deleteItem: 'Obriši stavku',
    deleteConfirm: 'Ukloniti s liste?',
    errors: {
      addFailed: 'Nije moguće dodati stavku',
      updateFailed: 'Nije moguće ažurirati stavku',
      deleteFailed: 'Nije moguće obrisati stavku',
    },
  },

  // Season Settings
  seasonSettings: {
    title: 'Postavke sezone',
    start: 'Početak',
    end: 'Kraj',
    deleteSeason: 'Obriši sezonu',
    noActiveSeason: 'Nema aktivne sezone',
    boatName: 'Naziv broda',
    boatNamePlaceholder: 'npr. S/Y Ahalya',
    seasonName: 'Naziv sezone',
    seasonNamePlaceholder: 'npr. Ljeto 2026',
    dates: 'Datumi',
    datesReadOnly: 'Datumi se ne mogu promijeniti nakon kreiranja sezone',
    currency: 'Valuta',
    currencyReadOnly: 'Valuta se ne može promijeniti nakon kreiranja sezone',
    seasonInfo: 'Info o sezoni',
    created: 'Kreirano',
    tipSplit: 'Podjela napojnice',
    equal: 'Jednako',
    custom: 'Prilagođeno',
    saveChanges: 'Spremi promjene',
    dangerZone: 'Opasna zona',
    dangerWarning: 'Brisanje sezone trajno će ukloniti sve bookinge, troškove i podatke o posadi.',
    accessDenied: 'Pristup odbijen',
    captainOnly: 'Samo kapetan može uređivati postavke sezone.',
    boatNameRequired: 'Naziv broda je obavezan',
    seasonNameRequired: 'Naziv sezone je obavezan',
    saved: 'Spremljeno',
    settingsUpdated: 'Postavke sezone ažurirane.',
    cannotSave: 'Nije moguće spremiti promjene',
    deleteConfirmTitle: 'Obriši sezonu',
    deleteConfirmMessage: 'Jeste li sigurni da želite obrisati ovu sezonu? Ova radnja se ne može poništiti. Svi bookings, troškovi i podaci o posadi će biti trajno obrisani.',
    deleted: 'Obrisano',
    seasonDeleted: 'Sezona je obrisana.',
    cannotDelete: 'Nije moguće obrisati sezonu',
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
