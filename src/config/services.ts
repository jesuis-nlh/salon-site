import { visuals, type Visual } from './etudes'

/**
 * Prestations. Les intitulés décrivent des prestations courantes en salon ;
 * le salon doit valider la liste, et renseigner durées et tarifs.
 * `duration` et `price` à null = non communiqués (jamais inventés).
 */
export interface ServiceItem {
  name: string
  description: string
  /** ex. '1 h 30' */
  duration: string | null
  /** ex. 'à partir de 65 €' */
  price: string | null
}

export interface ServiceCategory {
  slug: string
  name: string
  /** Titre de page orienté recherche locale */
  seoTitle: string
  seoDescription: string
  short: string
  lede: string
  body: string[]
  visual: Visual
  items: ServiceItem[]
  faq: { q: string; a: string }[]
}

export const pricingNote =
  'Les tarifs varient selon la longueur, la densité et l’historique de vos cheveux. Ils vous sont annoncés lors du diagnostic, avant de commencer.'

export const services: ServiceCategory[] = [
  {
    slug: 'coupe',
    name: 'Coupe & forme',
    seoTitle: 'Coupe femme et homme à Lyon',
    seoDescription:
      'Coupe sur mesure à Lyon pour cheveux lisses, ondulés ou bouclés : diagnostic, coupe et conseils pour vous coiffer facilement chez vous.',
    short: 'Coupes femme et homme, cheveux lisses, ondulés ou bouclés.',
    lede: 'Une bonne coupe se reconnaît le lendemain matin, quand vous vous recoiffez chez vous.',
    body: [
      'Nous commençons par observer la nature de vos cheveux, leur densité, leurs épis et la façon dont vous les portez au quotidien. La forme se décide ensemble, à partir de ce que vos cheveux savent faire.',
      'Les cheveux ondulés et bouclés sont coupés en respectant leur ressort, pour que chaque boucle retrouve sa place au séchage.',
    ],
    visual: visuals.carreExpresso,
    items: [
      {
        name: 'Coupe femme',
        description: 'Diagnostic, shampooing, coupe et coiffage.',
        duration: null,
        price: null,
      },
      {
        name: 'Coupe homme',
        description: 'Coupe aux ciseaux et/ou à la tondeuse, finitions et coiffage.',
        duration: null,
        price: null,
      },
      {
        name: 'Coupe cheveux bouclés',
        description: 'Coupe adaptée au ressort de la boucle, séchage et conseils d’entretien.',
        duration: null,
        price: null,
      },
      {
        name: 'Entretien de frange',
        description: 'Reprise de la frange entre deux coupes.',
        duration: null,
        price: null,
      },
    ],
    faq: [
      {
        q: 'Faut-il venir avec les cheveux lavés ?',
        a: 'Ce n’est pas nécessaire : le shampooing fait partie du rendez-vous. Pour une coupe de cheveux bouclés, venir avec vos boucles coiffées comme d’habitude nous aide à voir leur forme naturelle.',
      },
      {
        q: 'Puis-je venir avec une photo d’inspiration ?',
        a: 'Oui, c’est même le meilleur point de départ. Nous vous dirons honnêtement ce qui est réalisable avec la nature de vos cheveux et comment l’adapter.',
      },
    ],
  },
  {
    slug: 'couleur',
    name: 'Couleur & balayage',
    seoTitle: 'Balayage, mèches et couleur à Lyon',
    seoDescription:
      'Balayage, mèches, couleur et patine à Lyon : des nuances posées à la main, pensées pour votre carnation et pour une repousse douce.',
    short: 'Balayage, mèches, couleur et patine, posés à la main.',
    lede: 'La couleur réussie est celle qu’on remarque sans pouvoir dire exactement ce qui a changé.',
    body: [
      'Balayage, mèches fines ou couleur ton sur ton : la technique se choisit selon votre base, votre carnation et le temps que vous souhaitez laisser entre deux rendez-vous.',
      'Les éclaircissements sont travaillés mèche par mèche, puis ajustés par une patine pour obtenir une nuance précise, chaude ou froide.',
    ],
    visual: visuals.ondesMiel,
    items: [
      {
        name: 'Balayage',
        description: 'Éclaircissement posé à main levée pour un effet naturel et une repousse discrète. Patine incluse ou en complément selon le résultat visé.',
        duration: null,
        price: null,
      },
      {
        name: 'Mèches',
        description: 'Mèches fines ou plus marquées, sous papier, pour éclaircir de façon régulière.',
        duration: null,
        price: null,
      },
      {
        name: 'Couleur racines',
        description: 'Entretien de la couleur sur la repousse.',
        duration: null,
        price: null,
      },
      {
        name: 'Couleur complète',
        description: 'Couleur des racines aux pointes, ton sur ton ou changement de nuance.',
        duration: null,
        price: null,
      },
      {
        name: 'Patine',
        description: 'Ajuste le reflet d’un blond ou d’un balayage, ravive la brillance.',
        duration: null,
        price: null,
      },
      {
        name: 'Correction de couleur',
        description: 'Sur diagnostic uniquement, souvent en plusieurs séances.',
        duration: null,
        price: null,
      },
    ],
    faq: [
      {
        q: 'Un test de tolérance est-il nécessaire ?',
        a: 'Pour une première coloration, un test réalisé 48 heures avant le rendez-vous est recommandé. Signalez-nous toute réaction passée à une coloration lors de votre prise de rendez-vous.',
      },
      {
        q: 'Peut-on passer de brun à blond en une séance ?',
        a: 'Cela dépend de votre base et de l’historique de vos cheveux. Quand une seule séance risquerait de les abîmer, nous vous proposons un plan en plusieurs étapes.',
      },
    ],
  },
  {
    slug: 'soins',
    name: 'Soins',
    seoTitle: 'Soins capillaires à Lyon',
    seoDescription:
      'Soins capillaires à Lyon : diagnostic du cheveu et du cuir chevelu, soins profonds nutrition ou réparation, conseils d’entretien.',
    short: 'Diagnostic, soins profonds et rituels pour le cuir chevelu.',
    lede: 'Des cheveux en bonne santé tiennent mieux la coupe et la couleur.',
    body: [
      'Le soin commence par un diagnostic : porosité, élasticité, état du cuir chevelu. Il s’intègre à un rendez-vous coupe ou couleur, ou se réserve seul.',
      'Nous vous conseillons des gestes simples à reproduire chez vous, et des produits seulement s’ils sont utiles.',
    ],
    visual: visuals.lisseChatain,
    items: [
      {
        name: 'Diagnostic cheveux et cuir chevelu',
        description: 'Observation, questions sur vos habitudes, recommandations écrites.',
        duration: null,
        price: null,
      },
      {
        name: 'Soin profond',
        description: 'Nutrition, hydratation ou réparation selon le diagnostic.',
        duration: null,
        price: null,
      },
      {
        name: 'Rituel cuir chevelu',
        description: 'Gommage doux et massage, pour un cuir chevelu apaisé.',
        duration: null,
        price: null,
      },
    ],
    faq: [
      {
        q: 'Un soin peut-il s’ajouter à une coupe ou une couleur ?',
        a: 'Oui. Indiquez-le lors de la prise de rendez-vous pour que le temps nécessaire soit prévu.',
      },
    ],
  },
  {
    slug: 'coiffage',
    name: 'Coiffage & cérémonies',
    seoTitle: 'Coiffure de mariage et d’événement à Lyon',
    seoDescription:
      'Brushing, chignons et coiffures de cérémonie à Lyon : essai préalable, coiffure le jour J et conseils pour qu’elle tienne toute la journée.',
    short: 'Brushing, chignons, mariages et événements.',
    lede: 'Une coiffure de cérémonie doit tenir jusqu’au dernier invité, sans que l’on sente l’effort.',
    body: [
      'Pour un mariage ou un événement, un essai permet de valider la coiffure, les accessoires et la tenue dans le temps.',
      'Le jour venu, la coiffure est réalisée au salon. Les déplacements sont à convenir directement avec nous.',
    ],
    visual: visuals.torsadeChatain,
    items: [
      {
        name: 'Brushing',
        description: 'Lisse, wavy ou volume, selon la longueur et l’occasion.',
        duration: null,
        price: null,
      },
      {
        name: 'Chignon ou attache',
        description: 'Chignon bas, haut ou semi-attaché, pour une soirée ou une cérémonie.',
        duration: null,
        price: null,
      },
      {
        name: 'Coiffure de mariage',
        description: 'Essai préalable et coiffure le jour J, sur devis.',
        duration: null,
        price: null,
      },
    ],
    faq: [
      {
        q: 'Quand réserver pour un mariage ?',
        a: 'Le plus tôt possible, surtout pour les samedis de printemps et d’été. L’essai se fait idéalement un à deux mois avant la date.',
      },
    ],
  },
]

export function getService(slug: string) {
  return services.find((s) => s.slug === slug)
}
