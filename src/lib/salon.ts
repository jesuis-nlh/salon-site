import { site, type OpeningSlot, type Weekday } from '@/config/site'

/** Primary booking destination: external booking platform if configured, otherwise the booking page. */
export function bookingHref(): { href: string; external: boolean } {
  return site.booking.url ? { href: site.booking.url, external: true } : { href: '/rendez-vous', external: false }
}

export function phoneHref(): string | null {
  return site.contact.phone ? `tel:${site.contact.phone.replace(/\s/g, '')}` : null
}

export function fullAddress(): string | null {
  const { street, postalCode, city } = site.address
  if (!street || !postalCode) return null
  return `${street}, ${postalCode} ${city}`
}

export function directionsHref(): string | null {
  const address = fullAddress()
  if (!address) return null
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${site.name}, ${address}`)}`
}

const DAY_LABEL: Record<Weekday, string> = {
  lundi: 'Lundi',
  mardi: 'Mardi',
  mercredi: 'Mercredi',
  jeudi: 'Jeudi',
  vendredi: 'Vendredi',
  samedi: 'Samedi',
  dimanche: 'Dimanche',
}

const SCHEMA_DAY: Record<Weekday, string> = {
  lundi: 'Monday',
  mardi: 'Tuesday',
  mercredi: 'Wednesday',
  jeudi: 'Thursday',
  vendredi: 'Friday',
  samedi: 'Saturday',
  dimanche: 'Sunday',
}

function formatTime(t: string) {
  const [h, m] = t.split(':')
  return m === '00' ? `${Number(h)} h` : `${Number(h)} h ${m}`
}

export function formatHours(slot: OpeningSlot): string {
  if (!slot.ranges || slot.ranges.length === 0) return 'Fermé'
  return slot.ranges.map(([a, b]) => `${formatTime(a)} – ${formatTime(b)}`).join(', ')
}

export function hoursTable() {
  return site.hours.map((slot) => ({ day: DAY_LABEL[slot.day], value: formatHours(slot) }))
}

export function schemaOpeningHours() {
  if (!site.hoursConfirmed) return undefined
  return site.hours.flatMap((slot) =>
    (slot.ranges ?? []).map(([opens, closes]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${SCHEMA_DAY[slot.day]}`,
      opens,
      closes,
    })),
  )
}

export function socialLinks(): { label: string; href: string }[] {
  const out: { label: string; href: string }[] = []
  if (site.social.instagram) out.push({ label: 'Instagram', href: site.social.instagram })
  if (site.social.facebook) out.push({ label: 'Facebook', href: site.social.facebook })
  if (site.social.tiktok) out.push({ label: 'TikTok', href: site.social.tiktok })
  return out
}

export function absoluteUrl(path = '/') {
  return `${site.url}${path === '/' ? '' : path}`
}
