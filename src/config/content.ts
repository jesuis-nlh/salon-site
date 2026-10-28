import { visuals, type Visual } from './etudes'

/* ─────────────────────────────  Réalisations  ───────────────────────────── */

export type GalleryCategory = 'coupe' | 'couleur' | 'boucles' | 'coiffage'

export const galleryCategories: { id: GalleryCategory; label: string }[] = [
  { id: 'coupe', label: 'Coupe' },
  { id: 'couleur', label: 'Couleur' },
  { id: 'boucles', label: 'Boucles' },
  { id: 'coiffage', label: 'Coiffage' },
]

export interface GalleryItem {
  id: string
  title: string
  category: GalleryCategory
  visual: Visual
  /** Format d'affichage dans la grille éditoriale */
  shape: 'portrait' | 'landscape' | 'square'
}

/**
 * Remplacez ces études par de vraies réalisations du salon (avec l'accord des
 * personnes photographiées).
 */
export const gallery: GalleryItem[] = [
  { id: 'carre-net', title: 'Carré net', category: 'coupe', visual: visuals.carreExpresso, shape: 'portrait' },
  { id: 'ondes-miel', title: 'Balayage miel', category: 'couleur', visual: visuals.ondesMiel, shape: 'portrait' },
  { id: 'vagues-cuivre', title: 'Vagues cuivrées', category: 'couleur', visual: visuals.ondesCuivre, shape: 'landscape' },
  { id: 'boucles-cuivre', title: 'Boucles définies', category: 'boucles', visual: visuals.bouclesCuivre, shape: 'portrait' },
  { id: 'chignon', title: 'Chignon torsadé', category: 'coiffage', visual: visuals.torsadeChatain, shape: 'portrait' },
  { id: 'blond-polaire', title: 'Carré blond polaire', category: 'coupe', visual: visuals.carrePlatine, shape: 'portrait' },
  { id: 'platine', title: 'Blond platine', category: 'couleur', visual: visuals.lissePlatine, shape: 'portrait' },
  { id: 'torsade', title: 'Torsade cuivrée', category: 'coiffage', visual: visuals.torsadeCuivre, shape: 'square' },
  { id: 'ebene', title: 'Brun ébène', category: 'couleur', visual: visuals.ondesEbene, shape: 'portrait' },
  { id: 'longueurs', title: 'Longueurs en mouvement', category: 'coupe', visual: visuals.cascadeChatain, shape: 'portrait' },
]

/**
 * Avant / après — uniquement des photos réelles, autorisées par la cliente.
 * Laisser vide tant qu'aucune paire authentique n'est disponible : la section
 * ne s'affiche pas.
 */
export interface Transformation {
  id: string
  title: string
  before: Visual
  after: Visual
}
export const transformations: Transformation[] = []

/* ────────────────────────────────  Équipe  ──────────────────────────────── */

export interface TeamMember {
  /** null = à renseigner (affiché comme repère en mode maquette, masqué sinon) */
  name: string | null
  role: string
  bio: string | null
  portrait: Visual | null
}

export const team: TeamMember[] = [
  { name: null, role: 'Fondateur·trice, coiffeur·euse', bio: null, portrait: null },
  { name: null, role: 'Coloriste', bio: null, portrait: null },
  { name: null, role: 'Coiffeur·euse', bio: null, portrait: null },
]

/* ─────────────────────────────────  Avis  ───────────────────────────────── */

export interface Review {
  author: string
  /** Note sur 5, telle qu'elle apparaît sur la plateforme source */
  rating: number | null
  text: string
  source: string
  date: string | null
}

/**
 * Avis authentiques uniquement, recopiés fidèlement depuis leur source
 * (Google, Planity…) avec l'accord de leur auteur. Vide = section masquée.
 */
export const reviews: Review[] = []
export const reviewsSourceUrl: string | null = null

/* ─────────────────────────────  La maison  ──────────────────────────────── */

/**
 * Histoire du nom — liée au nom de travail « Trame ». À réécrire si le salon
 * porte un autre nom.
 */
export const brandStory = {
  title: 'Un nom tissé à Lyon',
  paragraphs: [
    'À la Croix-Rousse, les canuts croisaient la chaîne et la trame sur les métiers Jacquard pour faire naître les soieries qui ont fait la réputation de Lyon.',
    'Nous avons choisi ce nom pour ce qu’il dit du métier de coiffeur : un travail patient et précis, fil après fil, où la structure et la couleur se répondent.',
  ],
}

export const principles = [
  {
    title: 'Partir de vos cheveux',
    text: 'Nature, densité, implantation, historique de couleur : la coupe et la couleur s’adaptent à ce que vos cheveux savent faire, pas l’inverse.',
  },
  {
    title: 'Dire les choses simplement',
    text: 'Le tarif est annoncé avant de commencer. Si un résultat demande plusieurs séances pour préserver vos cheveux, nous vous le disons.',
  },
  {
    title: 'Penser à l’après',
    text: 'Des conseils concrets pour vous coiffer chez vous, et des produits recommandés seulement s’ils vous sont utiles.',
  },
]
