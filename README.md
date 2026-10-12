# VAC V4 "Field Briefing" (HTML)

The **VAC V4** homepage from the Figma file (Finalized Studies → `VAC V4`, plus `VAC V4 / Mobile / 390` for small screens), built with Next.js (App Router). The page is server-rendered markup plus the original browser scripts; `nodemailer` sends form email from a route handler.

## Run it

```bash
npm install
npm run dev          # development, http://localhost:4174
npm run build && npm start   # production build on the same port
npm run smoke        # with the server running: checks the page, every asset and the API error paths
```

For form email, see [Email (SMTP)](#email-smtp). The 3D models load over HTTP; use the server instead of opening the page from disk. See [3D integration](3D-INTEGRATION.md) for the viewer connection and validation.

## Project layout

| Path | What it is |
| --- | --- |
| `app/layout.jsx` | `<head>`: metadata, self-hosted fonts (`app/fonts/`, via `next/font/local`), hero image preload, `globals.css` |
| `app/page.jsx` | The homepage, made of one server component per section in `components/` |
| `app/globals.css` | All styles |
| `components/LegacyScripts.jsx` | Loads the browser scripts below after React hydrates, in order, and sets the chatbot config (`VACChatConfig`) |
| `public/js/` | `va-math.js`, `calculator-3d.js`, `app.js`: the calculator, forms, menu and story player. Plain scripts that find elements by `id`, so keep ids in `components/` in sync |
| `public/vac-chatbot.js` | The chat widget, the same file as in the WordPress plugin |
| `app/api/[form]/route.js`, `lib/mail.js` | Form email endpoint and its validation/SMTP logic |
| `public/assets/` | Images, SVGs and 3D model assets, served from `/assets/…` |

## What's interactive

- **3D calculator.** Drag the male/female model, use the rotation buttons, or press left/right arrows.
  - **Body parts:** click the model or choose one of the 30 original platform parts from the dropdown. Up/down arrows step through the body parts. Joint selection from model clicks is approximate; the dropdown refines it.
  - **Other conditions:** use the original mental health, tinnitus, hearing loss, migraine, TBI, sleep apnea, asthma, heart/BP, digestive, skin and other buttons. Mapped conditions select their corresponding 3D region.
  - **Adding a condition:** pick a part or condition, an effect and a percentage, then Add condition. The original platform percentage choices remain available. Clear all empties the conditions.
  - **The dog tag** shows the combined rating.
  - **The pay card** shows the monthly pay in large type, the yearly total, a bar splitting rating pay from household pay, and what each household member adds. It updates live as you change anything. See [Calculator maths](#calculator-maths).
- **Free evaluation intake.** The three steps from veteransadvocatecenter.com, with validation, Back, and a confirmation screen.
- **Contact form.** Name, email, phone, message and the SMS consent text copied word for word, with validation.
- **Veteran stories ("screening room").** A rack of five VHS tapes loads the selected story into a camcorder viewfinder.
  - The video plays in place, with a REC light and a running timecode.
  - Prev/next buttons and the arrow keys move through the tapes.
  - The selected name is printed huge and outlined behind the section.
  - Each story's line is condensed from the title card in that veteran's own video. Tape 05 (Guy Delprete) has its own still, taken from his video.
- **Other.** Mobile menu (Escape closes it) and FAQ answers revealed on tap.

## Email (SMTP)

Both forms and the chatbot's lead flows are emailed through SMTP by `app/api/[form]/route.js`, using `lib/mail.js`:

| Endpoint | Sent by |
| --- | --- |
| `POST /api/intake` | Free evaluation intake (`public/js/app.js`) |
| `POST /api/contact` | Contact form (`public/js/app.js`) |
| `POST /api/lead` | Chatbot callback / eligibility flows (`leadWebhook` in `components/LegacyScripts.jsx`) |

To set it up, copy `.env.example` to `.env` and fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` and `MAIL_TO`. Next.js reads `.env` itself. Only variables prefixed `NEXT_PUBLIC_` ever reach the browser, so never give an SMTP or mail variable that prefix. On startup the server logs `SMTP ready` or the reason the connection check failed (`instrumentation.js`, skipped on Vercel).

- Emails go to `MAIL_TO`, with **Reply-To** set to the visitor, so replying in your inbox answers them directly.
- The server checks fields again before sending, limits each IP to 10 submissions per 10 minutes, and has a hidden honeypot field for bots.
- If SMTP isn't configured or a send fails, the forms show an error with the phone number. The chatbot falls back to its pre-filled `mailto:` link.
- Only `public/` is served as files, so `.env`, `lib/` and the rest of the source are never exposed.
- Bodies over 32 KB are rejected, and methods other than POST get `405` with `Allow: POST`.
- After a successful send the forms still fire `vac:intake` / `vac:contact` events for analytics.

### On Vercel

Vercel detects Next.js and runs `app/api/[form]/route.js` as a function for the three endpoints. There's no `.env` on Vercel: add the same `SMTP_*` and `MAIL_*` variables under **Project → Settings → Environment Variables**, then redeploy.

## Calculator maths

`public/js/va-math.js` is the maths from the VAC calculator embed (`vac-calculator-embed/calculator.html`), ported unchanged and exposed as `window.VAMath`. Only the UI wording is VAC V4's.

- **Combined rating:** the VA method (38 CFR 4.25–4.26). Ratings combine highest first, each applied to what's left, then the total rounds to the nearest 10.
- **Bilateral factor:** applies when both arms, or both legs, have a condition. Those ratings combine first and get a 10% bonus, as in the VA method. A row that counts as bilateral gets a red edge in "Your conditions".
- **Pay:** 2026 VA rates (effective Dec 1, 2025). Household (spouse, Aid & Attendance, kids under 18, kids 18–23 in school, up to 2 parents) only adds pay at 30% and above, as with the VA.
- **Show the math:** lists every step, the exact value before rounding, what a simple sum would have said, and the yearly total.
- **Not included:** special monthly compensation (SMC).
- **Every December 1:** update `RATES` in `public/js/va-math.js` and the "2026" wording in `components/Calculator.jsx`.

Effect chips (pain, limited motion…) describe the condition only; they don't change the numbers. The "VA rating" meter is the rating the veteran has, or expects, for that condition.

## How part selection works

`public/js/calculator-3d.js` connects model ray hits to the platform body parts using the model region and normalized intersection height. The body-part dropdown retains all individual joints, while the supplied 3D mesh highlights its broader arm, leg, foot, back, head, ear, and chest regions. Added ratings and bilateral status are passed to the model as marks. The original VA math stays in `public/js/va-math.js`.

## Assets

- `public/assets/calculator/`: the 3D viewer bundle and male/female model assets from `3d.zip`. The previous turntable script and frames are retained as archived assets but are no longer loaded.
- `public/assets/img`, `public/assets/svg`: exported from the V4 Figma frames. The hero background is the flattened flag layer.
- `public/assets/img/trust-photo.png`: cropped to the saluting service members only.
- `public/assets/img/overlay-*.jpg`: greyscale copies of free [Unsplash](https://unsplash.com/license) photos, faded into the light sections by `components/SectionPhoto.jsx` (placement and strength in `globals.css`, `.sec__photo--*`):
  - `apache`: [helicopter](https://unsplash.com/photos/grayscale-photo-of-helicopter-ps9K6gMM1CE) (evaluation)
  - `boots`: [marching boots](https://unsplash.com/photos/men-in-green-and-brown-camouflage-uniform-1LTunOck3es) (where to start)
  - `dogtags`: [dog tags](https://unsplash.com/photos/dog-tag-lot-D2k_7YlRLTs) (why veterans trust VAC)
  - `marpat`: [Marines in camouflage](https://unsplash.com/photos/a-couple-of-soldiers-standing-next-to-each-other-famtUWEBH_Y) (free guides)
  - `osprey`: [V-22 Osprey](https://unsplash.com/photos/black-helicopter-carrier-hovering-on-sky-cw-KdZv8SoE) (contact)
- `public/assets/svg/topo-wide.svg`: the V4 topo regenerated 3840 wide, with the design column in the middle and extra contours on each side, so it reaches the screen edges without stretching.

## Full-width behaviour (desktop)

Content stays in the 1280 design column. These elements run the full width of the screen:

- **Hero:** full screen, one window tall and edge to edge. Labels and corner brackets sit at the screen edges. The headline and soldier scale with whichever is smaller, the window's width or its height. The copy is centred between the nav and the stats bar.
- **Ball chain:** drawn by `public/js/app.js` across the screen width, with each dog tag lowered to meet it.
- **Topo map:** the wide SVG above.
- Photo rights, the story videos and the hero stats ("100%", "1,000+") still need sign-off. See the V4 review notes in Figma.
