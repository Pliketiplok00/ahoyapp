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
    bookings: 'POPIS',
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
