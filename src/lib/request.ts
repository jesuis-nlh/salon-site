/** Shared validation for the appointment request form (client and server). */

export interface RequestPayload {
  prenom: string
  nom: string
  telephone: string
  email: string
  prestation: string
  disponibilites: string
  message: string
  /** honeypot — must stay empty */
  website?: string
}

export type FieldErrors = Partial<Record<keyof RequestPayload | 'contact', string>>

export const LIMITS = { short: 80, medium: 300, long: 1500 }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE = /^[+()\d\s.-]{8,20}$/

export function validateRequest(p: RequestPayload): FieldErrors {
  const e: FieldErrors = {}
  if (!p.prenom.trim()) e.prenom = 'Indiquez votre prénom.'
  else if (p.prenom.length > LIMITS.short) e.prenom = 'Prénom trop long.'
  if (p.nom.length > LIMITS.short) e.nom = 'Nom trop long.'
  const tel = p.telephone.trim()
  const mail = p.email.trim()
  if (!tel && !mail) e.contact = 'Indiquez un téléphone ou un e-mail pour que le salon puisse vous répondre.'
  if (tel && !PHONE.test(tel)) e.telephone = 'Ce numéro ne semble pas valide. Exemple : 06 12 34 56 78.'
  if (mail && !EMAIL.test(mail)) e.email = 'Cette adresse e-mail ne semble pas valide. Exemple : prenom@exemple.fr.'
  if (p.prestation.length > LIMITS.short) e.prestation = 'Choix invalide.'
  if (p.disponibilites.length > LIMITS.medium) e.disponibilites = `${LIMITS.medium} caractères maximum.`
  if (p.message.length > LIMITS.long) e.message = `${LIMITS.long} caractères maximum.`
  return e
}
