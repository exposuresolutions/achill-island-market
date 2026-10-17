# Exposure Solutions — brand kit

Open `index.html` to see everything: the lens options, the live animated logo, and all downloads.

## The logo
- **Lettering:** Barlow Semi Condensed Black, the closest free match to the old logo's lettering (SIL Open Font License, `fonts/OFL.txt`).
- **Lens:** a camera aperture replaces the O in EXPOSURE (option A, recommended). Option B puts it in SOLUTIONS.
- **Built as vectors** by `gen_logo.py`, which writes `logo-A.svg`, `logo-B.svg`, `logo-A-dark.svg` and `logo-geometry.js(on)`.

## The animation
`animated-logo.html`: cyan energy waves flow through the letters, lightning crackles along them, and the aperture turns and breathes. It loops seamlessly every 4 seconds.

URL options:
- `?w=&h=` — size
- `&mode=icon` — lens only
- `&pad=` — margin
- `&bg=none` — transparent background
- `&still=1.6` — a single frame at that time

## Exports (`export/`)
| File | Use |
|---|---|
| `email-header-600x200.gif` | Newsletter/campaign header (~0.8 MB) |
| `email-signature-300x100.gif` | Email signature (~0.25 MB). Outlook desktop shows the first frame only |
| `facebook-cover-1640x624.mp4` / `.png` | Facebook cover video (20s, Facebook's minimum) or image |
| `profile-icon-1080.png` / `.mp4` | Profile picture (lens icon, safe for circle crops) |
| `linkedin-banner-1584x396.png`, `x-header-1500x500.png`, `youtube-banner-2560x1440.png` | Social banners |
| `logo-animated-1920x1080.mp4`, `logo-animated-1080x1920.mp4` | Screens, video intros (12s) |
| `logo-still-transparent-2400.png` | Logo with glow on a transparent background |

Re-export everything with `node render.mjs`, or one group with `node render.mjs email`. Needs Playwright and ffmpeg. GIFs are only shrunk if `gifsicle` is installed (set `GIFSICLE=/path` if it isn't on PATH).

## Not switched over yet
The A Las Raices site, screen ads and print kit still use the old logo (`a-las-raices/assets/exposure-logo.*`). Once this logo is approved, swap it in and re-run `a-las-raices/signage/make-ads.sh` and `a-las-raices/print/make-pdfs.mjs`.
