# Salon site: premium hair salon website (Lyon)

A production-ready, rebrandable website for a high-end hair salon in Lyon, built with
Next.js (App Router) and TypeScript and deployed on Vercel.

> **Status: mockup (`draft: true`).** No real salon identity was supplied. **"Trame" is a
> working name.** Every business fact (address, phone, hours, prices, team, reviews, legal
> details) is left empty and shown as a visible *"à renseigner"* marker. All imagery consists
> of provisional procedural studies, not photos of clients or of the salon's work. Draft mode
> also sets `noindex` and `Disallow: /`, so the mockup stays out of search engines.

## Creative direction

- **Concept:** *la chaîne et la trame*. In Lyon's silk weaving tradition the warp gives
  the structure and the weft brings the colour, in the same way that a cut gives shape and
  colour brings light.
- **Palette:** noir de soie `#16110E` (Lyon was famed for its black silks), raw‑silk grège
  `#D5BF98`, perle `#E8E3DA` and prune `#2E1A22`.
- **Type:** Bodoni Moda (display) and Jost (text), both self-hosted (SIL OFL), with no request
  to Google at runtime.
- **Signature moment:** a WebGL2 field of silk-like hair strands in the hero. Strands are
  GPU-instanced and shaded with the Kajiya‑Kay hair model, with a restrained half-resolution
  bloom. Moving the pointer combs through them.

## Run locally

```bash
npm ci
npm run dev          # http://localhost:3000
npm run check        # lint + typecheck + production build
```

Node 22 is required (`.nvmrc` and `package.json` engines pin 22.x; Vercel builds with the same major).

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint (`eslint-config-next`, core‑web‑vitals and TypeScript) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run render:etudes` | Re-renders the provisional studies in `src/assets/etudes/` (needs `npm run dev` and Playwright with Chromium, see `scripts/render-etudes.mjs`) |

## Rebranding and filling in real information

Everything a salon owner would change lives in **`src/config/`**:

| File | Contents |
| --- | --- |
| `site.ts` | name, `draft` flag, contact, address, access, opening hours, booking URL, social links, legal details, host |
| `services.ts` | service categories, items, **durations and prices** (`null` = not shown), FAQ |
| `content.ts` | gallery, before/after pairs, team, reviews, brand story, principles |
| `etudes.ts` | image registry: replace each provisional study with an authorised photo under the same key |

Rules built into the code:

- A `null` value is **never invented**. In draft mode it shows as a dashed *"à renseigner"*
  marker; once `draft: false` the element is simply hidden.
- Setting `booking.url` (Planity, Treatwell, Booksy and similar) points every **"Prendre
  rendez-vous"** button at that platform. Without it, they lead to `/rendez-vous`.
- **Reviews** render only when `reviews` holds genuine entries. **Before/after** renders only
  when real, authorised photo pairs exist. **Structured data** (`HairSalon` JSON-LD) is output
  only when `draft` is `false`, and only with the fields that are filled in.
- The *"Un nom tissé à Lyon"* story (`brandStory`) is tied to the working name. Rewrite it if
  the salon has another name.

Before turning `draft` off, check this list:

1. The salon's real name, address, phone, e-mail, hours (`hoursConfirmed: true`) and access details.
2. The services list, durations and prices, validated by the salon.
3. Real photography, with model releases. Replace `src/assets/etudes/*` through `etudes.ts`.
4. Team names, roles, bios and portraits.
5. Legal notice: company name, legal form, SIRET, RCS/RM, VAT, publication director and
   **consumer mediator** (required for B2C services in France). Privacy policy: data
   controller and **retention period**. Have both reviewed; the templates are not legal advice.
6. Set `NEXT_PUBLIC_SITE_URL` to the production domain.
7. Regenerate `public/og.jpg` if the name or headline changes.

## Appointment request form

`/rendez-vous` offers three paths: the online booking link (if configured), the phone number
(if configured), and a **request** form. The form never books anything. `POST /api/demande`:

- validates input on both client and server, has a honeypot field and a small per-IP rate limit;
- sends an e-mail through [Resend](https://resend.com) **only if** `RESEND_API_KEY`,
  `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` are set;
- otherwise answers `503 not_configured`, and the visitor is told plainly that the request
  **was not sent**;
- stores nothing.

See `.env.example`. On Vercel, add the variables under *Project → Settings → Environment Variables*.

## Privacy and cookies

The site sets **no analytics, advertising or social cookies**, embeds no third-party maps or
videos, and loads fonts locally, so no consent banner is needed in its current state. If
analytics or third-party embeds are added later, prior consent will be required (CNIL rules).

## Performance and accessibility notes

- All pages are statically prerendered except `/api/demande`. Images go through `next/image`
  (AVIF/WebP, responsive sizes, blur placeholders).
- The WebGL engine (`src/lib/silk/`) is lazy-loaded and picks a quality tier per device. It
  pauses when off-screen or when the tab is hidden, and probes the GPU with an asynchronous
  fence before animating. Slow devices fall back to the static still. Reduced motion, Save-Data
  and browsers without WebGL2 always get the still.
- Custom cursor and inertial scrolling (Lenis) run only with a fine pointer and without
  reduced motion. The native cursor is kept everywhere except over labelled image zones.
- Skip link, landmarks, visible focus, accessible mobile menu (focus trap, Escape, `inert`
  page), native `<dialog>` lightbox, ARIA accordion, labelled form fields with inline errors,
  and touch targets of at least 44 px on touch screens.

## Deployment (Vercel)

The Vercel project `salon-site` is linked to this GitHub repository (production branch `main`).
`vercel.json` pins the framework (`nextjs`), `npm ci`, `npm run build` and the `cdg1` (Paris)
region for the API route.

- Every push to a non-`main` branch gets a **Preview** deployment.
- Merging into `main` creates the **Production** deployment.
- Project *Deployment Protection* (Vercel Authentication) is enabled for preview URLs, so
  viewers need Vercel access or a share link.

## Project structure

```
src/
  app/            routes (App Router), metadata, sitemap, robots, manifest, API route
  components/     layout, hero, home sections, services, gallery, booking, ui, seo
  config/         ← all business content and settings (rebranding happens here)
  lib/            silk/ (WebGL engine), fonts, salon helpers, form validation
  assets/etudes/  provisional procedural studies (replace with real photography)
scripts/          render-etudes.mjs (offline still renders)
```
