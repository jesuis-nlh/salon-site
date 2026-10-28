import type { StaticImageData } from 'next/image'

import carreExpresso from '@/assets/etudes/carre-expresso.webp'
import ondesMiel from '@/assets/etudes/ondes-miel.webp'
import lisseChatain from '@/assets/etudes/lisse-chatain.webp'
import torsadeChatain from '@/assets/etudes/torsade-chatain.webp'
import bouclesCuivre from '@/assets/etudes/boucles-cuivre.webp'
import lissePlatine from '@/assets/etudes/lisse-platine.webp'
import carrePlatine from '@/assets/etudes/carre-platine.webp'
import ondesCuivre from '@/assets/etudes/ondes-cuivre.webp'
import cascadeChatain from '@/assets/etudes/cascade-chatain.webp'
import torsadeCuivre from '@/assets/etudes/torsade-cuivre.webp'
import ondesEbene from '@/assets/etudes/ondes-ebene.webp'
import heroDesktop from '@/assets/etudes/hero-desktop.webp'
import heroMobile from '@/assets/etudes/hero-mobile.webp'

/**
 * Visuels provisoires : « études de matière » rendues par le moteur de mèches
 * du site (scripts/render-etudes.mjs). Ce ne sont PAS des photos de clientes ni
 * des réalisations du salon. Remplacez chaque entrée par une photographie
 * autorisée en conservant la même clé.
 */
export interface Visual {
  src: StaticImageData
  alt: string
  /** true tant que le visuel est une étude provisoire */
  provisional: boolean
}

const etude = (src: StaticImageData, alt: string): Visual => ({ src, alt, provisional: true })

export const visuals = {
  heroDesktop: etude(heroDesktop, 'Mèches miel et dorées qui tombent en cascade, éclairées de biais'),
  heroMobile: etude(heroMobile, 'Mèches miel et dorées qui tombent en cascade, éclairées de biais'),
  carreExpresso: etude(carreExpresso, 'Carré brun foncé à la coupe nette, reflet lumineux à mi-longueur'),
  ondesMiel: etude(ondesMiel, 'Ondulations souples dans un dégradé du brun au blond miel'),
  lisseChatain: etude(lisseChatain, 'Longueurs châtain lisses et brillantes'),
  torsadeChatain: etude(torsadeChatain, 'Mèches châtain enroulées en spirale, comme un chignon vu de dos'),
  bouclesCuivre: etude(bouclesCuivre, 'Boucles serrées aux reflets cuivrés'),
  lissePlatine: etude(lissePlatine, 'Longueurs blond platine, lisses et lumineuses'),
  carrePlatine: etude(carrePlatine, 'Carré blond polaire, pointes coupées droit'),
  ondesCuivre: etude(ondesCuivre, 'Vagues cuivrées éclairées par une lumière chaude'),
  cascadeChatain: etude(cascadeChatain, 'Longue chevelure châtain en mouvement'),
  torsadeCuivre: etude(torsadeCuivre, 'Torsade cuivrée enroulée sur elle-même'),
  ondesEbene: etude(ondesEbene, 'Ondulations brun ébène aux reflets discrets'),
} satisfies Record<string, Visual>

export type VisualKey = keyof typeof visuals
