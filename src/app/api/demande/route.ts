import { LIMITS, validateRequest, type RequestPayload } from '@/lib/request'

/**
 * Appointment *request* endpoint. It never books anything: it forwards the
 * request by e-mail through Resend when RESEND_API_KEY, CONTACT_TO_EMAIL and
 * CONTACT_FROM_EMAIL are configured, and otherwise answers 503 so the form can
 * tell the visitor plainly that nothing was sent. Nothing is stored.
 */

export const runtime = 'nodejs'

const recent = new Map<string, number[]>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5

function rateLimited(ip: string) {
  const now = Date.now()
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  hits.push(now)
  recent.set(ip, hits)
  return hits.length > MAX_PER_WINDOW
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max + 1) : '')

export async function POST(req: Request) {
  const raw = await req.text()
  if (raw.length > 12_000) return Response.json({ ok: false, code: 'too_large' }, { status: 413 })

  let body: Record<string, unknown>
  try {
    body = JSON.parse(raw)
  } catch {
    return Response.json({ ok: false, code: 'bad_request' }, { status: 400 })
  }

  const payload: RequestPayload = {
    prenom: str(body.prenom, LIMITS.short),
    nom: str(body.nom, LIMITS.short),
    telephone: str(body.telephone, LIMITS.short),
    email: str(body.email, LIMITS.short),
    prestation: str(body.prestation, LIMITS.short),
    disponibilites: str(body.disponibilites, LIMITS.medium),
    message: str(body.message, LIMITS.long),
    website: str(body.website, LIMITS.short),
  }

  // Bots fill the hidden field: accept silently, send nothing.
  if (payload.website) return Response.json({ ok: true })

  const errors = validateRequest(payload)
  if (Object.keys(errors).length) return Response.json({ ok: false, code: 'invalid', errors }, { status: 422 })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (rateLimited(ip)) return Response.json({ ok: false, code: 'rate_limited' }, { status: 429 })

  const key = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.CONTACT_FROM_EMAIL
  if (!key || !to || !from) {
    return Response.json({ ok: false, code: 'not_configured' }, { status: 503 })
  }

  const lines = [
    `Prénom : ${payload.prenom}`,
    payload.nom && `Nom : ${payload.nom}`,
    payload.telephone && `Téléphone : ${payload.telephone}`,
    payload.email && `E-mail : ${payload.email}`,
    `Prestation : ${payload.prestation || 'Non précisée'}`,
    payload.disponibilites && `Disponibilités : ${payload.disponibilites}`,
    payload.message && `\nMessage :\n${payload.message}`,
    '\n— Demande envoyée depuis le formulaire du site. Aucun créneau n’a été réservé.',
  ].filter(Boolean)

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Demande de rendez-vous : ${payload.prenom}${payload.nom ? ` ${payload.nom}` : ''}`,
        text: lines.join('\n'),
        ...(payload.email ? { reply_to: payload.email } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return Response.json({ ok: false, code: 'provider_error' }, { status: 502 })
  } catch {
    return Response.json({ ok: false, code: 'provider_error' }, { status: 502 })
  }

  return Response.json({ ok: true })
}

export function GET() {
  return Response.json({ ok: false, code: 'method_not_allowed' }, { status: 405, headers: { Allow: 'POST' } })
}
