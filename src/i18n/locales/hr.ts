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
