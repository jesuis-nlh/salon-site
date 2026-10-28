/**
 * ──────────────────────────────────────────────────────────────────────────
 *  CONFIGURATION DU SALON — point d'entrée unique pour le rebranding.
 * ──────────────────────────────────────────────────────────────────────────
 *
 *  Toute valeur à `null` est une information NON FOURNIE. Tant que
 *  `draft` vaut `true`, le site l'affiche comme un repère « à compléter »
 *  bien visible ; quand `draft` passe à `false`, l'élément correspondant est
 *  simplement masqué. Rien n'est inventé : renseignez uniquement des
 *  informations vérifiées.
 *
 *  « Trame » est un NOM DE TRAVAIL provisoire, choisi pour la maquette.
 */

export type Weekday = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche'

export interface OpeningSlot {
  day: Weekday
  /** null = fermé ce jour-là. Format 24 h, ex. [['09:30', '19:00']] */
  ranges: [string, string][] | null
}

export const site = {
  /**
   * Mode maquette : bandeau d'avertissement, repères « à compléter »,
   * pages en noindex. Passez à `false` uniquement quand toutes les
   * informations publiées ont été vérifiées.
   */
  draft: true,

  name: 'Trame',
  /** Nom de travail : à remplacer par le nom réel du salon. */
  nameIsPlaceholder: true,
  descriptor: 'Atelier de coiffure',
  city: 'Lyon',

  /** URL de production canonique (sans slash final). */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://salon-site.vercel.app').replace(/\/$/, ''),

  description:
    "Atelier de coiffure à Lyon : coupe sur mesure, couleur, balayage et soins. Chaque rendez-vous commence par un diagnostic de vos cheveux.",

  contact: {
    /** Format international pour les liens tel:, ex. '+33478000000' */
    phone: null as string | null,
    /** Format d'affichage, ex. '04 78 00 00 00' */
    phoneDisplay: null as string | null,
    email: null as string | null,
  },

  address: {
    street: null as string | null,
    postalCode: null as string | null,
    city: 'Lyon',
    /** Quartier ou arrondissement, ex. 'Presqu’île — 2e arrondissement' */
    district: null as string | null,
    /** Coordonnées GPS vérifiées, pour les données structurées. */
    geo: null as { lat: number; lng: number } | null,
  },

  /** Accès : lignes de métro, tram, stationnement… (informations vérifiées uniquement) */
  access: [] as string[],

  hours: [
    { day: 'lundi', ranges: null },
    { day: 'mardi', ranges: null },
    { day: 'mercredi', ranges: null },
    { day: 'jeudi', ranges: null },
    { day: 'vendredi', ranges: null },
    { day: 'samedi', ranges: null },
    { day: 'dimanche', ranges: null },
  ] as OpeningSlot[],
  /** Passez à true une fois les horaires ci-dessus renseignés. */
  hoursConfirmed: false,

  booking: {
    /**
     * Lien de réservation en ligne (Planity, Treatwell, Booksy, site maison…).
     * Quand il est renseigné, tous les boutons « Prendre rendez-vous » y mènent.
     */
    url: null as string | null,
    /** Nom de la plateforme affiché à côté du lien, ex. 'Planity'. */
    provider: null as string | null,
  },

  social: {
    instagram: null as string | null,
    facebook: null as string | null,
    tiktok: null as string | null,
  },

  /** Informations légales (mentions légales) — à fournir par le salon. */
  legal: {
    companyName: null as string | null,
    legalForm: null as string | null,
    capital: null as string | null,
    siret: null as string | null,
    rcs: null as string | null,
    vatNumber: null as string | null,
    publicationDirector: null as string | null,
    registeredAddress: null as string | null,
  },

  /** Hébergeur — à vérifier au moment de la mise en ligne. */
  host: {
    name: 'Vercel Inc.',
    address: '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
    url: 'https://vercel.com',
  },
}

export type Site = typeof site
