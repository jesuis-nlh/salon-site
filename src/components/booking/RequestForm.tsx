'use client'

import Link from 'next/link'
import { useRef, useState, type FormEvent } from 'react'
import { services } from '@/config/services'
import { site } from '@/config/site'
import { phoneHref } from '@/lib/salon'
import { LIMITS, validateRequest, type FieldErrors, type RequestPayload } from '@/lib/request'
import styles from './RequestForm.module.css'

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; prenom: string }
  | { kind: 'error'; reason: 'not_configured' | 'rate_limited' | 'network' | 'server' }

const EMPTY: RequestPayload = {
  prenom: '',
  nom: '',
  telephone: '',
  email: '',
  prestation: '',
  disponibilites: '',
  message: '',
  website: '',
}

const ORDER: (keyof FieldErrors)[] = ['prenom', 'nom', 'contact', 'telephone', 'email', 'prestation', 'disponibilites', 'message']

/**
 * Appointment request form. It sends a *request* (never a booking) and is
 * explicit about what happened: success only when the server confirms the
 * e-mail was handed to the provider.
 */
export function RequestForm() {
  const [values, setValues] = useState<RequestPayload>(EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const formRef = useRef<HTMLFormElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const tel = phoneHref()

  const set = (name: keyof RequestPayload) => (e: { target: { value: string } }) => {
    const next = { ...values, [name]: e.target.value }
    setValues(next)
    if (submitted) setErrors(validateRequest(next))
  }

  const focusFirstError = (errs: FieldErrors) => {
    const first = ORDER.find((k) => errs[k])
    if (!first) return
    const id = first === 'contact' ? 'f-telephone' : `f-${first}`
    document.getElementById(id)?.focus()
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    const errs = validateRequest(values)
    setErrors(errs)
    if (Object.keys(errs).length) {
      focusFirstError(errs)
      return
    }
    setStatus({ kind: 'sending' })
    try {
      const res = await fetch('/api/demande', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; code?: string; errors?: FieldErrors }
      if (res.ok && data.ok) {
        setStatus({ kind: 'sent', prenom: values.prenom.trim() })
        setValues(EMPTY)
        setSubmitted(false)
      } else if (data.code === 'invalid' && data.errors) {
        setErrors(data.errors)
        setStatus({ kind: 'idle' })
        focusFirstError(data.errors)
        return
      } else if (data.code === 'not_configured') {
        setStatus({ kind: 'error', reason: 'not_configured' })
      } else if (data.code === 'rate_limited') {
        setStatus({ kind: 'error', reason: 'rate_limited' })
      } else {
        setStatus({ kind: 'error', reason: 'server' })
      }
    } catch {
      setStatus({ kind: 'error', reason: 'network' })
    }
    requestAnimationFrame(() => statusRef.current?.focus())
  }

  if (status.kind === 'sent') {
    return (
      <div ref={statusRef} tabIndex={-1} className={styles.success} role="status">
        <p className={styles.successTitle}>Demande envoyée, merci {status.prenom}.</p>
        <p>
          Le salon vous recontacte pour vous proposer un créneau. Votre rendez-vous n’est pas encore réservé tant que
          vous n’avez pas reçu cette confirmation.
        </p>
        <button type="button" className="link" onClick={() => setStatus({ kind: 'idle' })}>
          Envoyer une autre demande
        </button>
      </div>
    )
  }

  const err = (name: keyof FieldErrors) =>
    errors[name] ? (
      <p id={`e-${name}`} className={styles.error}>
        {errors[name]}
      </p>
    ) : null

  const describedBy = (...ids: (string | false)[]) => ids.filter(Boolean).join(' ') || undefined
  const sending = status.kind === 'sending'

  return (
    <form ref={formRef} className={styles.form} onSubmit={onSubmit} noValidate aria-describedby="form-intro">
      <p id="form-intro" className={styles.intro}>
        Les champs marqués d’un astérisque (*) sont obligatoires. Indiquez au moins un moyen de vous recontacter.
      </p>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="f-prenom">Prénom *</label>
          <input
            id="f-prenom"
            name="prenom"
            autoComplete="given-name"
            required
            maxLength={LIMITS.short}
            value={values.prenom}
            onChange={set('prenom')}
            aria-invalid={!!errors.prenom}
            aria-describedby={describedBy(!!errors.prenom && 'e-prenom')}
          />
          {err('prenom')}
        </div>
        <div className={styles.field}>
          <label htmlFor="f-nom">Nom</label>
          <input
            id="f-nom"
            name="nom"
            autoComplete="family-name"
            maxLength={LIMITS.short}
            value={values.nom}
            onChange={set('nom')}
            aria-invalid={!!errors.nom}
            aria-describedby={describedBy(!!errors.nom && 'e-nom')}
          />
          {err('nom')}
        </div>
      </div>

      <fieldset className={styles.fieldset} aria-describedby={describedBy(!!errors.contact && 'e-contact')}>
        <legend className={styles.legend}>Pour vous recontacter *</legend>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="f-telephone">Téléphone</label>
            <input
              id="f-telephone"
              name="telephone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={LIMITS.short}
              value={values.telephone}
              onChange={set('telephone')}
              aria-invalid={!!errors.telephone || !!errors.contact}
              aria-describedby={describedBy(!!errors.telephone && 'e-telephone', !!errors.contact && 'e-contact')}
            />
            {err('telephone')}
          </div>
          <div className={styles.field}>
            <label htmlFor="f-email">E-mail</label>
            <input
              id="f-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={LIMITS.short}
              value={values.email}
              onChange={set('email')}
              aria-invalid={!!errors.email || !!errors.contact}
              aria-describedby={describedBy(!!errors.email && 'e-email', !!errors.contact && 'e-contact')}
            />
            {err('email')}
          </div>
        </div>
        {err('contact')}
      </fieldset>

      <div className={styles.field}>
        <label htmlFor="f-prestation">Prestation souhaitée</label>
        <div className={styles.selectWrap}>
          <select id="f-prestation" name="prestation" value={values.prestation} onChange={set('prestation')}>
            <option value="">Je ne sais pas encore</option>
            {services.map((s) => (
              <optgroup key={s.slug} label={s.name}>
                {s.items.map((i) => (
                  <option key={i.name} value={`${s.name} : ${i.name}`}>
                    {i.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="f-disponibilites">Vos disponibilités</label>
        <input
          id="f-disponibilites"
          name="disponibilites"
          maxLength={LIMITS.medium}
          value={values.disponibilites}
          onChange={set('disponibilites')}
          aria-describedby="h-disponibilites"
          aria-invalid={!!errors.disponibilites}
        />
        <p id="h-disponibilites" className={styles.help}>
          Par exemple : mardi après-midi, ou samedi matin.
        </p>
        {err('disponibilites')}
      </div>

      <div className={styles.field}>
        <label htmlFor="f-message">Votre message</label>
        <textarea
          id="f-message"
          name="message"
          rows={5}
          maxLength={LIMITS.long}
          value={values.message}
          onChange={set('message')}
          aria-describedby="h-message"
          aria-invalid={!!errors.message}
        />
        <p id="h-message" className={styles.help}>
          Longueur de vos cheveux, couleur actuelle, envie… Tout ce qui aide à prévoir le bon temps de rendez-vous.
        </p>
        {err('message')}
      </div>

      {/* Honeypot: hidden from people and assistive tech, tempting for bots. */}
      <div className={styles.hp} aria-hidden="true">
        <label htmlFor="f-website">Site web</label>
        <input id="f-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
      </div>

      <p className={styles.privacy}>
        Vos informations servent uniquement à vous recontacter au sujet de cette demande.{' '}
        <Link href="/confidentialite" className="inline-link">
          En savoir plus sur vos données
        </Link>
        .
      </p>

      {status.kind === 'error' && (
        <div ref={statusRef} tabIndex={-1} className={styles.alert} role="alert">
          {status.reason === 'not_configured' && (
            <>
              <p className={styles.alertTitle}>Votre demande n’a pas été envoyée.</p>
              <p>L’envoi en ligne n’est pas encore activé sur ce site.</p>
            </>
          )}
          {status.reason === 'rate_limited' && (
            <>
              <p className={styles.alertTitle}>Trop de demandes envoyées à la suite.</p>
              <p>Patientez quelques minutes avant de réessayer.</p>
            </>
          )}
          {(status.reason === 'network' || status.reason === 'server') && (
            <>
              <p className={styles.alertTitle}>Votre demande n’a pas pu être envoyée.</p>
              <p>
                {status.reason === 'network'
                  ? 'La connexion a échoué. Vérifiez votre accès à Internet, puis réessayez.'
                  : 'Le service d’envoi n’a pas répondu. Réessayez dans un instant.'}
              </p>
            </>
          )}
          {(tel || site.contact.email) && (
            <p>
              Vous pouvez aussi{' '}
              {tel && site.contact.phoneDisplay && (
                <>
                  appeler le salon au{' '}
                  <a href={tel} className="inline-link">
                    {site.contact.phoneDisplay}
                  </a>
                </>
              )}
              {tel && site.contact.email && ' ou '}
              {site.contact.email && (
                <>
                  écrire à{' '}
                  <a href={`mailto:${site.contact.email}`} className="inline-link">
                    {site.contact.email}
                  </a>
                </>
              )}
              .
            </p>
          )}
        </div>
      )}

      {site.draft && (
        <p className={styles.draftNote}>
          Maquette : l’envoi de ce formulaire n’est pas encore relié à une messagerie (voir README, variables
          RESEND_API_KEY, CONTACT_TO_EMAIL et CONTACT_FROM_EMAIL).
        </p>
      )}

      <div className={styles.submitRow}>
        <button type="submit" className={styles.submit} disabled={sending} aria-busy={sending} data-magnetic="">
          <span>{sending ? 'Envoi en cours…' : 'Envoyer ma demande'}</span>
          {sending && <span className={styles.spinner} aria-hidden="true" />}
        </button>
        <p className={styles.help}>Ceci est une demande&nbsp;: le salon vous recontacte pour confirmer le créneau.</p>
      </div>
    </form>
  )
}
