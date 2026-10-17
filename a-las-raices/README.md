# A Las Raices — client kit

Live band (Facebook: https://www.facebook.com/people/A-Las-Raices/100083239897155/ — 7.4k followers).
Line-up from their bio: Demircan (guitar & vocals), Ibrahim Cetiner (solo guitar), Daniel (bass) — bio is cut off, confirm the rest.
Logo taken from their Facebook profile picture.

| What | File |
|---|---|
| Website (one page) | `index.html` → will be at `/a-las-raices/` on the site once merged |
| Screen ad, 15s loop (HTML) | `signage/ad.html` — auto-fits landscape or portrait |
| Screen ad, MP4 | `signage/ad-landscape-1920x1080.mp4`, `signage/ad-portrait-1080x1920.mp4` |
| Promo video builder | `promo/make-promo.sh` |
| Logo (transparent / square), QR | `assets/` |

## Putting the ad on the 6 venue screens
Upload the MP4 that matches each screen's orientation to the signage player (Yodeck or similar) and add it to each venue's playlist.
15s loop; suggested slot: once every 3–5 minutes. No sound, so it works in any venue.

## Still needed from the band
- [ ] Their OK to use their videos + 4–8 of their best clips (originals from their phones are better quality than Facebook copies)
- [ ] Full line-up, booking email / WhatsApp number
- [ ] Where "Los Altos" is (town), regular gig nights
- [ ] A domain if they want their own (e.g. alasraices.com)

## After that
1. Website: set `BOOKING_EMAIL` and `VIDEOS` at the bottom of `index.html`.
2. Promo: put clips in a folder (numbered for order) and run
   `./promo/make-promo.sh <folder> portrait` and `… landscape`.
   Public Facebook video links can be pulled with `yt-dlp <link>`.
3. QR codes point to their Facebook page today. Once the site has its final address, regenerate `assets/qr-facebook.svg` and re-render:
   `node signage/render.mjs signage/ad.html signage/ad-landscape-1920x1080.mp4 1920 1080`
