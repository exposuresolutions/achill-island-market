# A Las Raices — client kit

Rumba Flamenca / "Gipsy Fiesta" band on the Costa Blanca (La Zenia, Cabo Roig, Torrevieja). Led by Demircan Ulugun ("Demi").
Duo, trio or full 9-piece. Facebook: https://www.facebook.com/people/A-Las-Raices/100083239897155/ (7.4k followers, Oct 2026).
"Residencia Los Altos" on their Facebook is their location (Los Altos, Orihuela Costa), not a gig residency.
Logo taken from their Facebook profile picture. Background and line-up come from the Dec 2025 recon in OneDrive:
`Exposureai/ExposureSolutions/EXPOSURE-WORKSPACE-LENOVO-DAN/EXPOSURE WORKSPACE/Clients/A_LAS_RAICES/`.

## Existing footage in OneDrive
`OneDrive - Exposure Solutions/Clients/ARCHIVED/ACHILL-OFFSHORE/CLIENTS/A Las Rasias/Videos/` holds 5 gig videos from 29 Mar 2025 (VID_20250329_*.mp4, 2.5 GB in total).
`…/Clients/ARCHIVED/Old-Archived/A Las Rasias/1765700585788.mp4` (1.8 MB, Dec 2025) is probably the logo intro.
The Murphy's On The Park › Live Entertainment › Bands › A Las Raices folders (Logo, Vids, Murphy's Video Ads…) are empty in every copy.
The M365 connector can list these files but can't download video, so share them with an "Anyone with the link" link and pull them with curl.

| What | File |
|---|---|
| **Dates, residency, ticket packages, contact details** | `data/band.js` — the one file to edit; site and posters read from it |
| Website (one page) | `index.html`: gigs, weekly residency, tickets & packages, private event quotes. Will be at `/a-las-raices/` once merged |
| Posters + stationery | `print/` — open `print/index.html`. Click any text to edit, then Print / Save as PDF |
| Ready PDFs | `print/pdf/` — re-make with `node print/make-pdfs.mjs` after editing `data/band.js` |
| Screen ad, 15s loop (HTML) | `signage/ad.html` — auto-fits landscape or portrait |
| Screen ad, MP4 (Exposure intro + 15s ad) | `signage/ad-landscape-1920x1080.mp4`, `signage/ad-portrait-1080x1920.mp4` |
| Per-venue screen ads ("Live here at …") | `signage/venues/<venue>-landscape.mp4` / `-portrait.mp4`. Rebuild everything with `signage/make-ads.sh` |
| Job complete + final payment | `complete.html` |
| Promo video builder | `promo/make-promo.sh` |
| Logo (transparent / square), QR | `assets/` |

## How booking works (Exposure process)
1. **Pick the night.** The venue and what's advertised come first: a partner venue party, a private gig, or tickets.
2. **Call Lilly** on **098 78500** (+353 98 78500). That's Exposure's ElevenLabs phone agent "Lilly Phone — Exposure Solutions". Or use the website form.
3. **Photos or videos.** Customers can upload pictures of their venue or space with the booking (optional).
4. **Confirmation.** Sent once one of Exposure's contractors (the band or venue) confirms the date.
5. **After the job.** Photos and videos of the finished job go up on `complete.html` (booking reference, role, files), then the final payment is made (`finalPayment` in `data/band.js`: a Stripe link or an invoice note).

### Uploads — one-time setup
Uploads go through a Cloudflare Pages Function at `/functions/api/upload.js`, which forwards each file to Telegram with its booking reference.
In Cloudflare → Pages → achill-island-market → Settings → Environment variables, add:
- `TELEGRAM_BOT_TOKEN`: the same bot that sends the booking alerts
- `TELEGRAM_CHAT_ID`: the chat to receive the files

Until both are set, bookings still go through and the site tells customers Lilly will collect their files on the call. Files are limited to 45 MB each (Telegram's limit is 50 MB).

### Branding
- Exposure Solutions logo: `assets/exposure-logo.jpg`, from OneDrive `Clients/ACTIVE/DDWL/Branding/exposure-solutions/logo/ES-logo-final.png`.
- Animated Exposure intro: `signage/exposure-intro.html` (3s). It plays when the website opens and at the start of every screen ad and promo.
- The band's own animated logo intro (`1765700585788.mp4` in OneDrive) still needs a share link before it can be added.

## Bookings, tickets and packages
**Exposure Solutions is the booking agent.** Every booking contact on the site, posters, stationery and screen ad is Exposure's (`agency` in `data/band.js`). The band's own number isn't published.

Ways to book on the site:
- **At your place:** a private gig at a villa, home, yacht, wedding venue or the customer's own bar.
- **Venue + band:** the customer picks a partner venue (`venues` in `data/band.js`) and Exposure books the space, the band and optional food and drink together. Each venue card has a "Book a party here" button.
- **Tickets / tables** for gigs and the weekly residency.
- **Become a partner:** a card for bars and hotels that want the band and the screen ad.

- Private event / venue enquiries and ticket or table orders are sent to the Exposure form API (`/api/client-form`, client `a-las-raices`) and come through as a Telegram alert. If the API is down, the site falls back to WhatsApp (once a number is set) or Facebook.
- Ticket packages (Show Ticket, Fiesta Package, VIP Table) take reservations with payment on the door until Stripe is set up. Then create a Stripe Payment Link for each package and paste it into `payLink` in `data/band.js`, and the button switches to "Pay €…".
- `DRAFT: true` in `data/band.js` shows a draft banner on the site and a SAMPLE watermark on every print piece. Set it to `false` once dates, prices and contacts are real.

## Print kit
- Posters (A4, also scales to A3): **Next Dates** (all gigs, or pick one venue for a "Live here" poster) and **Weekly Residency** (La Zenia Beach Sundays).
- Stationery: letterhead, business card (85 × 55 mm with 3 mm bleed, front + back), compliments slip (DL), quote/invoice (works out totals and IVA), email signature (copy and paste).
- Highlighted fields (WhatsApp number, email, NIE, IBAN) still need real details.

## Putting the ad on the 6 venue screens
Upload the MP4 that matches each screen's orientation to the signage player (Yodeck or similar). Give each venue its own "Live here at …" version from `signage/venues/`.
18s loop (3s Exposure intro + 15s ad); suggested slot: once every 3–5 minutes. No sound, so it works in any venue.

## Still needed from the band
- [ ] Their OK to use their videos, plus any newer clips (originals from their phones beat Facebook copies)
- [ ] Confirm the line-up is still current
- [ ] Exposure NIF/CIF for quotes and invoices (optional WhatsApp: `agency.whatsapp`)
- [ ] Update Lilly's instructions (ElevenLabs agent) so she knows the A Las Raices booking questions
- [ ] The 6 partner venues: name, town, type, and whether they take party bookings
- [ ] Current prices, if they want them on the site (Dec 2025: duo €150, trio €200, full band €699)
- [ ] Real gig dates, the La Zenia beach bar name and residency day/time
- [ ] Ticket package prices and contents (current ones are examples), plus a Stripe account if they want card payments
- [ ] IBAN for the invoice template
- [ ] A domain if they want their own (e.g. alasraices.com)

## After that
1. Website: set `BOOKING_EMAIL` and `VIDEOS` at the bottom of `index.html`.
2. Promo: put clips in a folder (numbered for order) and run
   `./promo/make-promo.sh <folder> portrait` and `… landscape`.
   Public Facebook video links can be pulled with `yt-dlp <link>`.
3. QR codes point to their Facebook page today. Once the site has its final address, regenerate `assets/qr-facebook.svg` and re-render:
   `node signage/render.mjs signage/ad.html signage/ad-landscape-1920x1080.mp4 1920 1080`
