# Zante seasonal recruitment — playbook (2026)

**Owner:** **Exposure Solutions** — digital recruitment, forms, CRM routing, and automation for **partner venues** in Zakynthos: **Flavors** (Laganas + Tsilivi), **Fantasy Mini Golf**, and **Flying Dutchman**.

**Infrastructure note:** Application data may post through the **same secure form API** you already use elsewhere (hosted on Render). That is **technical hosting only** — candidates, posters, and URLs should read as **Exposure-led** (or your chosen Exposure domain), not as another agency brand.

---

## 1. Single application URL (canonical)

Pick **one** primary link for every poster, bio link, and paid ad. **Prefer an Exposure domain** so the funnel stays yours:

| Option | When to use |
|--------|-------------|
| **`https://exposuresolutions.me/zante-jobs`** (or `.ie`, or `jobs.exposuresolutions.…`) | **Default:** one owned URL; client sites link or redirect here |
| `https://laganasflavors.com/jobs` | Short-term: traffic already expects Flavors; still fine if page footer and legal say **Exposure** runs recruitment |

**Implementation:** Host **`zante/staff-apply.html`** on **Exposure** (Cloudflare Pages) or copy it onto each venue site — same markup, same `client` id in the JSON (see §5). Venue sites can use a **thin redirect** to the Exposure URL if you want a single analytics funnel.

### 1b. Gamified quest — four stages (candidate + interviewer script)

The apply page frames hiring as a **season quest** (fun, clear progression). **“Final boss”** = in-person on-site moment in Zante — not a joke at the candidate’s expense; it’s the **real-world skills check** on the floor.

| Stage | Name | What happens |
|-------|------|----------------|
| **1** | Character sheet | Form: identity, venues, Greece experience (prior Greece = priority), optional **Greek AFM** for fast-track admin, dates. |
| **2** | Highlight reel | Video link + written answers (why you / us / add / Zante). |
| **3** | Co-op interview | Virtual: **two-way briefing** — you state **what you expect** (standards, hours, culture, money clarity); they state **what they need**; align or part ways honestly. |
| **4** | Boss stage (IRL) | In Zante: **trial / floor moment** — they **show** welcome, energy, service instinct, reading a busy room. Managers score against the same criteria you already promised in Stage 3. |

**Talking points in Stage 3:** rota reality (**6 days a week**), **accommodation** rules and what’s included, drink knowledge expectations, upsell vs pushiness, how you handle messy nights, team communication — and be straight that the venues **party while you work** (strip energy); filter people who want that vs people who don’t.

**Stage 4 success:** observable behaviours (guest greeting, colleague handoff, calm under noise) — not “personality trivia.”

Payload includes `recruitment_quest_version: "zante_quest_v1"` for funnel analytics.

---

## 2. Poster ads — print spec

- **Ready-to-show A4 (open in browser → Print or Save as PDF):** [`zante/poster-zante-recruitment-a4.html`](zante/poster-zante-recruitment-a4.html) — headline, bullets, QR for owners (e.g. Costa & Tasha) until Canva finals exist.
- **Sizes:** A3 window poster + A4 handbill + IG story (1080×1920) + IG square (1080×1080).
- **QR:** Points at the **canonical Exposure jobs URL** + `?utm_source=poster&utm_medium=qr&utm_campaign=zante26`.
- **Credit line (small):** *Recruitment by Exposure Solutions for partner venues in Zante.* (Adjust with legal.)
- **Legals:** *Eligibility, flights, and accommodation subject to offer letter / contract.*
- **Copy:** Headline + bullets from the campaign brief; **May 1 – end October**, **6 roles**, **Dutch & Irish** focus, **virtual interview**, **~1 week process**. Lead with **6 days a week**, **accommodation included**, and honest **party-while-you-work** culture (aligned on poster + `staff-apply.html`).

---

## 3. Online — where to advertise + video / AI avatar playbook

Post the **same canonical apply URL** + short hook. **Video first:** 15–45s for ads, 60s for organic “explainer” posts. Refresh organic posts every 48h where allowed.

### 3a. Sites & platforms (free listings + paid)

| Type | Where | Notes |
|------|--------|--------|
| **Seasonal job boards** | [SeasonWorkers](https://www.seasonworkers.com), [Backpacker Job Board](https://www.backpackerjobboard.com) | Employer / recruiter listings; Greece + bar keywords |
| **General job boards** | **Indeed** (IE + NL geo + “Greece” / remote filter), **LinkedIn Jobs** (target Ireland, Netherlands, “hospitality” interests) | Paid “sponsor job” optional; keep copy neutral on equality |
| **Aggregators** | **Jooble**, **Talent.com**, **Glassdoor** (company page + jobs if you have legal entity name) | Syndication; verify how Greece location displays |
| **Hospitality / travel** | **Caterer.com** (UK — useful for Irish audience), **Hosco** / hospitality networks if relevant | Check Greece / seasonal filters |
| **Social (organic)** | **Facebook groups** (IE: Irish in Greece, Zante 20xx, summer jobs abroad; NL: Nederlanders in Griekenland, Zakynthos, werk in het buitenland) | Follow each group’s promo rules |
| **Social (short video)** | **TikTok**, **Instagram Reels**, **YouTube Shorts** | Bio link = apply URL + UTM `utm_source=tiktok` / `instagram` |
| **Reddit** | r/Ireland, r/galway, r/Dublin, r/thenetherlands (weekly threads only where allowed) | No spam; native “hiring” posts get reported fast |
| **Paid social** | **Meta Ads** (FB + IG Reels/Stories/Feed), **TikTok Ads Manager**, **Snapchat Ads** (young NL/IE demos) | Locations: Ireland + Netherlands; interests: Greece, Zante, Laganas, festivals, “working holiday” |
| **Search (optional)** | **Google Ads** (Search + Demand Gen / YouTube) | Keywords: zante jobs, summer work greece bar, laganas staff |
| **Local Ireland** | **achillstore.store** strip, posters at markets / Ted’s (QR) | Already wired in site template |

**Paid boost (quick):** Meta — interests: Greece, Zante, Laganas, work abroad, travel; **locations:** Ireland + Netherlands; **ages:** set in Ads Manager to match typical hire band (platform policy — avoid discriminatory targeting in ad *copy*).

---

### 3b. TikTok & Instagram video ads + AI “bar host” avatars

**Concept:** One **recognisable AI presenter per brand** (Flavors, Fantasy Mini Golf, Flying Dutchman) — same outfit/energy each time — speaking over **real venue photos and video** (drinks, course, crowd, sunset). Feels premium, not generic stock-only.

**Production stack (typical — pick one avatar vendor):**

| Step | Tool / approach |
|------|------------------|
| **Script** | 30–45s: hook (“Back to Greece?”), 3 bullets (accom, crew, May–Oct), CTA “link in bio / scan”. One script per bar, same structure, different personality line. |
| **Avatar + lip-sync** | **HeyGen**, **Synthesia**, **D-ID**, **Colossyan**, or **CapCut** “AI presenter” (features change often — trial before subscription) | Upload or pick avatar; match **brand colours** in clothing/background plate |
| **Voice** | Platform built-in TTS **or** **ElevenLabs** (clear, warm; IE/NL accent if you want local resonance — test for clarity) | |
| **Backgrounds** | **Your own footage** (phones on site: bar pour, mini golf hole, harbour) + **Pexels / Pixabay** Zante/Greece B-roll | Layer in **CapCut**, **DaVinci Resolve**, or **Canva** video — avatar as picture-in-picture or full-screen with lower-third venue logo |
| **Captions** | Burn in **English + Dutch** subtitles on NL-targeted exports; **English** for IE | Improves completion rate on mute |
| **Variants** | 3×15s cuts from one 45s master (TikTok + Reels + Stories aspect ratios 9:16) | |

**Per-bar “character” brief (for avatar consistency):**

| Brand | Vibe for avatar + B-roll |
|-------|---------------------------|
| **Flavors** | High energy, tropical colours, neon night, frozen daiquiri pour, crowd hands up |
| **Fantasy Mini Golf** | Playful, family + groups, course lights, “largest in Greece” line if legally approved |
| **Flying Dutchman** | Nautical / bold, harbour or deck energy, darker blues + gold accents |

**Trust & policy (do not skip):**

- Add small on-screen label: **“Includes AI presenter”** or **“AI host — real venues in Zante”** (builds trust; aligns with EU consumer expectations).
- **Meta** and **TikTok** periodically update rules on **synthetic / AI** content in ads — check current help centres before heavy spend.
- Job ads must stay **honest** on pay, flights, and hours; avatar is **delivery**, not a fake “employee testimonial” unless a real person approves the line.

**Ad setup:**  
- **TikTok:** Campaign objective **Traffic** or **Leads** (if pixel + form); landing = apply URL with `utm_source=tiktok&utm_medium=paid&utm_campaign=zante26_avatar`.  
- **Instagram / Facebook:** Same URL + `utm_source=instagram` / `facebook`; use **Reels** placement + Advantage+ creative broadening.

**Organic:** Post the same masters on **@Flavors / @Fantasy / @Dutchman** + Exposure; **Spark Ads** (TT) / **Partnership Ads** (IG) if you boost from creator accounts.

### 3c. Expanded placement list (research-backed)

Use alongside §3a. **Verify** each site’s current pricing / employer terms before paying.

| Category | Where | Notes |
|----------|--------|--------|
| Greece / seasonal hubs | **[Yseasonal](https://www.yseasonal.com)** (Greece country hub) | Seasonal hospitality focus |
| | **[Seasonal Jobs Abroad](https://www.seasonaljobsabroad.com)** — Greece | Aggregated seasonal listings |
| | **[EURES / European Job Days](https://www.europeanjobdays.eu)** | EU seasonal campaigns; check “seasonal Greece” events |
| Seasonal (existing) | SeasonWorkers, Backpacker Job Board | Core IE/NL + backpacker flow |
| General jobs | Indeed (IE + NL), LinkedIn Jobs, Jooble, Talent.com | Sponsor jobs optional |
| Hospitality | Hosco, Caterer.com (UK-facing) | Useful for Irish applicants |
| Paid social | Meta (FB + IG), TikTok Ads, Snapchat | IE + NL geo; Reels + TikTok 9:16 |
| Search | Google Ads (Search + Demand Gen / YouTube) | Keywords: zante jobs, laganas bar job, summer work greece |
| Organic social | TikTok, IG Reels, YouTube Shorts, Facebook groups | Same apply URL + UTMs |
| Agencies (optional) | Hospitality recruiters (e.g. Talent Odyssey–style) | Fee per hire / retainer; keep your canonical apply URL in contract |

**Master tracking:** Copy [`docs/ZANTE-ADS-MASTER-SHEET.csv`](docs/ZANTE-ADS-MASTER-SHEET.csv) to Google Sheets — fill logins, costs, last refreshed.

### 3d. Multi-ad matrix and UTM naming

Run **multiple creatives** so ads don’t fatigue. Suggested **message angles** (mix with §3b video):

| `utm_content` suffix (example) | Hook |
|-------------------------------|------|
| `greece_returners_30s` | “Worked Greece before? We want you first.” |
| `afm_fasttrack_30s` | “Got a Greek AFM? Admin can move faster.” |
| `flavors_energy_15s` | Flavors / daiquiris / crew |
| `golf_playful_15s` | Fantasy Mini Golf / groups |
| `dutchman_nautical_15s` | Flying Dutchman |
| `quest_game_30s` | Season quest / stages / final round in Zante |

**Convention:** `utm_campaign=zante26` + `utm_source={platform}` + `utm_medium=paid|organic|bio` + `utm_content={angle}_{length}`.

**Minimum set:** 6–9 paid variants (2–3 hooks × 2–3 lengths or 3 brands × 2 hooks) pointing at the **same** apply URL.

### 3e. Where we advertise (one list) + how fast applications should move

**Sites & channels (everything we use or test):**

| Bucket | Names |
|--------|--------|
| **Seasonal / Greece** | SeasonWorkers, Backpacker Job Board, Yseasonal, Seasonal Jobs Abroad (Greece), EURES / European Job Days |
| **General jobs** | Indeed (IE + NL), LinkedIn Jobs, Jooble, Talent.com, Glassdoor (if company profile exists) |
| **Hospitality** | Hosco, Caterer.com (UK / Irish audience) |
| **Paid social** | Meta (Facebook + Instagram Reels/Stories), TikTok Ads, Snapchat |
| **Organic social** | TikTok, Instagram Reels, YouTube Shorts, Facebook groups (IE + NL + Greece expat) |
| **Search (optional)** | Google Ads (Search + Demand Gen / YouTube) |
| **Local / physical** | Achill **achillstore.store** strip, A4/A3 **posters + QR** ([`zante/poster-zante-recruitment-a4.html`](zante/poster-zante-recruitment-a4.html)) |
| **Optional agencies** | Hospitality recruiters (fee per hire) — keep canonical apply URL |

**How quick are applications “normally”? (industry norms, not guarantees)**  
- Strong seasonal/hospitality candidates often **apply to many bars at once**; **first meaningful contact within 24 hours** massively improves reply and show-up rates.  
- **Time-to-hire** for streamlined seasonal roles is often **a few days to ~2 weeks** when interviews are pre-scheduled and decisions are same-day after Stage 3.  
- Slow replies = **ghosting risk**; SMS/WhatsApp usually beats email for speed.

**Your public promise:** ~**1 week** from application to decision for Stages 1–3 when possible — keep internal SLAs tighter than the ad copy.

**What we do to stay fast (execute this week):**

| Tactic | Action |
|--------|--------|
| **Live apply URL + working form** | Publish `zante-jobs`; confirm `exposure-zante` hits GHL — **blocker until done** |
| **Instant acknowledgement** | GHL automation: SMS or WhatsApp **within minutes** of submit — “Got it — we reply within 24h” |
| **SLA** | **&lt;24h** human triage for Greece alumni / AFM tags; **48h max** first reply for everyone else |
| **One calendar** | GHL / Calendly **Stage 3** links ready — no “email ping-pong” for slots |
| **Decision after call** | Same day or next day: yes / no / hold — tell them in WhatsApp |
| **Rehire & referrals** | WhatsApp previous Greece staff first — fastest hires, lowest risk |
| **Ads on today** | Turn on **Meta + TikTok** small budget to IE+NL even while polish continues; parallel **free** SeasonWorkers + 3 Facebook groups |

---

## 4. Websites — Exposure + venue properties

| Property | Role |
|----------|------|
| **Exposure Solutions** | **Primary:** jobs page, canonical URL, privacy/applicant notices if needed |
| **Flavors / Fantasy Mini Golf / Flying Dutchman** | **Promote** the same application: button → Exposure URL, or embedded same HTML with Exposure footer unchanged |

**Shared rules**

- One form → **one Exposure-managed pipeline** (GHL location / pipeline owned by ES).
- **UTM** on every link (`utm_source`, `utm_medium`, `utm_campaign`, optional `utm_content`).
- **Chatbot on the jobs page:** Exposure-branded helper (`data-client="custom"` in the template) → answers FAQs and points to apply; still calls the **shared** `/api/ai-chat` URL if you keep that integration.

---

## 5. Backend: `POST /api/client-form`

The template posts to the **shared form endpoint** (same base URL as your other Exposure sites):

`https://dodealswithlee.onrender.com/api/client-form`

Treat this as **Exposure’s API route on shared infrastructure** — document it internally as **“ES form relay”**, not as a public brand for candidates.

**Payload**

```json
{
  "client": "exposure-zante",
  "form_type": "zante_seasonal_staff",
  "name": "Full name",
  "email": "a@b.ie",
  "phone": "+353…",
  "nationality": "IE",
  "passport_eu": "yes",
  "venues": ["flavors_laganas", "flavors_tsilivi", "fantasy_mini_golf", "flying_dutchman"],
  "greece_experience": "free text",
  "availability_start": "2026-05-01",
  "pitch_video_url": "https://…",
  "intro_video_url": "https://…",
  "why_you": "Why they’re the Flavors / Fantasy Mini Golf person you want",
  "what_you_add": "What they’ll bring to the team",
  "why_zante": "Why Zante / this season",
  "greek_afm": "",
  "has_greek_afm": false,
  "recruitment_quest_version": "zante_quest_v1",
  "source": "Exposure — Zante jobs (exposuresolutions.me)",
  "utm_source": "instagram",
  "utm_medium": "bio",
  "utm_campaign": "zante26"
}
```

**QR:** The page `zante/staff-apply.html` renders a **scannable QR** (and shows the exact URL). Set `<meta name="apply-canonical-url" content="https://…/zante-jobs">` so posters always encode the **live** URL even if you open the file locally. The encoded link adds `utm_source=qr&utm_medium=scan&utm_campaign=zante26` for reporting.

**Engineering (whoever maintains the form service):**

1. Whitelist **`client: exposure-zante`** and `form_type: zante_seasonal_staff`.
2. Map fields into **Exposure’s GHL** (or Sheet + Telegram) — include **`greek_afm`** (optional; restrict field visibility in GHL), **`has_greek_afm`** boolean.
3. **GHL tags (recommended):** `Zante-2026-Applicant`; if `has_greek_afm` → **`AFM-fasttrack-review`**; manual or rule-based **`greece-alumni`** when `greece_experience` shows prior Greece seasons.
4. Optional: alias path e.g. `POST /api/exposure/zante-jobs` that forwards to the same handler (cleaner internal naming).

---

## 6. AI for traction and pipeline management

Owned by **Exposure** operationally: **n8n** + **GHL** + optional LLM for drafting (not auto-reject).

| Stage | Automation |
|-------|------------|
| **Capture** | Submit → GHL + tag `Zante-2026-Applicant` + optional Telegram ping |
| **Triage** | Missing video / thin answers → WhatsApp or email template |
| **Screening assist** | LLM **draft** note in GHL — **human** decides |
| **Interview** | Calendly / GHL calendar |
| **Re-engagement** | Timed nudges; opt-out respected |

**Traction content:** Exposure produces scripts; venues supply B-roll; subtitles NL/EN.

### 6b. Greece experience priority + AFM fast-track (copy, ops, legal)

**Marketing copy (examples — confirm wording with counsel):**

- *“Seasoned Greece? You’re exactly who we’re looking for — bars, islands, pace: tell us in your application.”*
- *“Already have a Greek **AFM** (tax number)? Add it — we can often **speed up onboarding paperwork** for shortlisted hires.”*

**Ops:**

- Treat rich **`greece_experience`** answers as **shortlist priority** in Stage 3 (human triage); tag **`greece-alumni`** in GHL when confirmed.
- When **`has_greek_afm`** is true, tag **`AFM-fasttrack-review`** and route to whoever handles payroll / legal onboarding first.

**Legal / privacy (checklist — not legal advice):**

- Confirm **lawful basis** and **retention** for storing AFM in CRM; some employers collect AFM **only after offer** — if counsel prefers, remove the field from the public form and collect AFM at Stage 3+.
- Do **not** promise a job or guaranteed faster hire — only **admin / onboarding** where accurate.
- EU equality: Greece experience = **desirable**, not an absolute bar to applicants without it.

---

## 7. Staff supply — Cherry Bay, Zante Rocks (phase 2)

**Product:** Exposure-managed **“Zante Hospitality Staff Pool”** — vetted candidates referred under **written placement terms**; **employer of record** stays with the hiring venue unless you formalise something else legally.

**GHL:** Tags `Pool-Available`, `Pool-Placed`, `Partner-CherryBay`, etc.

---

## 8. Files in this repo

| File | Use |
|------|-----|
| `zante/staff-apply.html` | Deploy under **Exposure** domain first; copy or embed from venue sites |
| `zante/TEAM-PLAN-RECRUITMENT-2026.html` | **Team deck** — click-through slides (arrows / swipe); phone-friendly |
| `zante-deck.html` (repo root) | **Short URL** after deploy: `https://achillstore.store/zante-deck.html` → redirects to deck |
| `zante/OWNER-SHARE-NOTE.md` | **WhatsApp / email** copy-paste to send Costa & Tasha when they’re too busy for a live walkthrough |
| `zante/poster-zante-recruitment-a4.html` | A4 poster + QR for print / WhatsApp |
| `zante/logos/README.txt` | Drop **flavors.png**, **fantasy.png**, **dutchman.png** for real logos on the deck |
| `docs/ZANTE-ADS-MASTER-SHEET.csv` | Copy to Sheets — track every ad placement, UTM, cost, owner |

---

## 9. Checklist (execution order)

1. Publish **`staff-apply.html`** on **exposuresolutions.me** (or `.ie`) — set **canonical** + Open Graph.
2. Register **`exposure-zante`** on the form API + GHL pipeline.
3. Point Flavors / Fantasy / Flying Dutchman CTAs to the **Exposure** URL (or iframe/embed).
4. Posters + QR + UTMs.
5. Listings on SeasonWorkers, Backpacker Job Board, Yseasonal / EURES where relevant; multi-creative Meta + TikTok (IE + NL); fill `docs/ZANTE-ADS-MASTER-SHEET.csv`.
6. n8n triage + human interviews.
7. Pilot partner placements when core hires are stable.
