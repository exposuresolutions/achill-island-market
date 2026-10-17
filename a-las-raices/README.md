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
| Website (one page) | `index.html` → will be at `/a-las-raices/` on the site once merged |
| Screen ad, 15s loop (HTML) | `signage/ad.html` — auto-fits landscape or portrait |
| Screen ad, MP4 | `signage/ad-landscape-1920x1080.mp4`, `signage/ad-portrait-1080x1920.mp4` |
| Promo video builder | `promo/make-promo.sh` |
| Logo (transparent / square), QR | `assets/` |

## Putting the ad on the 6 venue screens
Upload the MP4 that matches each screen's orientation to the signage player (Yodeck or similar) and add it to each venue's playlist.
15s loop; suggested slot: once every 3–5 minutes. No sound, so it works in any venue.

## Still needed from the band
- [ ] Their OK to use their videos, plus any newer clips (originals from their phones beat Facebook copies)
- [ ] Confirm the line-up is still current, and a booking email / WhatsApp number
- [ ] Current prices, if they want them on the site (Dec 2025: duo €150, trio €200, full band €699)
- [ ] A domain if they want their own (e.g. alasraices.com)

## After that
1. Website: set `BOOKING_EMAIL` and `VIDEOS` at the bottom of `index.html`.
2. Promo: put clips in a folder (numbered for order) and run
   `./promo/make-promo.sh <folder> portrait` and `… landscape`.
   Public Facebook video links can be pulled with `yt-dlp <link>`.
3. QR codes point to their Facebook page today. Once the site has its final address, regenerate `assets/qr-facebook.svg` and re-render:
   `node signage/render.mjs signage/ad.html signage/ad-landscape-1920x1080.mp4 1920 1080`
