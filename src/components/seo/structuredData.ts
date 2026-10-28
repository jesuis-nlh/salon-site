import { site } from '@/config/site'
import { absoluteUrl, fullAddress, schemaOpeningHours, socialLinks } from '@/lib/salon'

/**
 * schema.org HairSalon built only from verified config values.
 * Returns null in draft mode: no structured data for a provisional identity.
 */
export function salonSchema(): Record<string, unknown> | null {
  if (site.draft) return null
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    '@id': `${site.url}/#salon`,
    name: site.name,
    url: site.url,
    description: site.description,
    image: absoluteUrl('/og.jpg'),
  }
  if (site.contact.phone) data.telephone = site.contact.phone
  if (site.contact.email) data.email = site.contact.email
  if (fullAddress()) {
    data.address = {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressCountry: 'FR',
    }
  }
  if (site.address.geo) {
    data.geo = { '@type': 'GeoCoordinates', latitude: site.address.geo.lat, longitude: site.address.geo.lng }
  }
  const hours = schemaOpeningHours()
  if (hours?.length) data.openingHoursSpecification = hours
  const sameAs = socialLinks().map((s) => s.href)
  if (sameAs.length) data.sameAs = sameAs
  if (site.booking.url) {
    data.potentialAction = { '@type': 'ReserveAction', target: site.booking.url }
  }
  return data
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
