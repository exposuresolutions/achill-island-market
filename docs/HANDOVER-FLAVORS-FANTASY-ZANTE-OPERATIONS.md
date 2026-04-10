# Handover — Flavors, Fantasy Mini Golf, Flying Dutchman & Zante digital operations

**Document type:** Operational handover (systems, web, social, AI) + commercial framing  
**Prepared for:** **Seb Costa’s son** — incoming **fee-based digital & commercial ops** lead for the Zante venue group (with venue leadership)  
**Maintained by:** Exposure Solutions (agency) — update this file when ownership, fees, or URLs change  
**Last updated:** 2026-04-10  

> **Confidential.** This file describes *where* systems live and *how* they connect. **Do not** paste API keys, tokens, or passwords here. Store secrets in Render / Cloudflare / GHL / a password manager only.

---

## 1. What you are taking over

You are responsible for **day-to-day coordination** of digital systems for the **Zante (Zakynthos) venue group**, including **Flying Dutchman** as a **first-class** brand alongside Flavors and Fantasy Mini Golf — same rigour, same reporting rhythm, **billed fairly** (see §2).

| Brand / venue | Typical digital scope |
|---------------|------------------------|
| **Flavors** Frozen Daiquiri (Laganas & Tsilivi) | Website, domain, social, bookings/promo content, recruitment CTAs, chatbot surface |
| **Fantasy Mini Golf** (Zante) | Website / landing, social, events, recruitment CTAs, chatbot surface |
| **Flying Dutchman** | **Full parity:** web/social presence, promos, recruitment CTAs, chatbot (`flying-dutchman` widget profile), liaison with Exposure on changes |
| **Seasonal recruitment** | Exposure-led quest funnel (`exposure-zante`), forms, CRM pipeline hygiene on the venue side (see §9) |

**Agency boundary:** Exposure Solutions builds, hosts (where agreed), and wires **AI, forms, and integrations**. Venue companies still own **on-the-ground operations, HR contracts, payroll, and legal employer-of-record** unless formally delegated. **Your** role is **management & coordination for a fee**, not automatic legal liability for employment — keep that in writing with each venue.

---

## 2. Commercial model — Seb’s management business (fee-based)

The intent is a **proper little business** for Seb: predictable income, clear scope, and room to grow (e.g. more venues, content packages, or partner bars later).

**Recommended structure (confirm with an accountant / solicitor):**

| Topic | Guidance |
|--------|------------|
| **Entity** | Trade as **sole trader** or **limited company** (IE, EL, or UK — depends where Seb is tax-resident). Invoice from that entity. |
| **Who pays** | Each **venue legal entity** (or one holding company) signs a **simple management / marketing services agreement** with Seb’s business. |
| **Fee shape** | **Monthly retainer** per venue (Flavors, Fantasy Mini Golf, Flying Dutchman) *or* one **bundle price** for the three + variable line items (e.g. extra ad spend admin, recruitment drive weeks). |
| **What’s in scope (typical)** | Social posting rhythm & community management, content coordination, **Utm-tagged links**, weekly digital health check, **first-line** triage before escalating to Exposure, on-site signage / QR updates where agreed, **recruitment pipeline** hygiene (tags, follow-ups in GHL with venue managers). |
| **What’s out of scope (unless extra fee)** | Deep dev (new features, API changes), paid media strategy beyond execution, legal/HR contracts, payroll. Those stay **venue + professionals** or **Exposure** as contracted. |
| **Exposure relationship** | Seb is the **venue-side commercial lead**; Exposure remains **technical agency**. Optional: **referral or white-label** arrangement — document hours/rates or monthly “tech support bundle” so nobody is working for free. |
| **Review** | **Quarterly** — adjust fee if scope grows (fourth venue, new AI agent, major site rebuild). |

**Action:** Fill in **Schedule A** (separate one-pager or appendix): monthly fee per venue, payment terms (e.g. net 14), notice period, and signatories. Do not store bank details in this Git repo.

---

## 3. Golden rules

1. **Never commit secrets** to Git (keys, `.env`, tokens).  
2. **One source of truth for deploy:** Git `main` → Render (DDWL) or Cloudflare Pages (static sites).  
3. **Chat and forms** almost always hit the **same Render base URL** (see §6).  
4. If something breaks **outside office hours**, fix **DNS / SSL / billing** first (Cloudflare, Render, domain registrar).  
5. **Lee / Exposure** remains the escalation path for **code and API** until fully transitioned.

---

## 4. Domains & brands (checklist — confirm live DNS)

| Asset | Intended domain / URL | Typical host | Notes |
|--------|------------------------|--------------|--------|
| Flavors | `laganasflavors.com` | Often Cloudflare → origin | May proxy to Render path `/flavors/` — confirm in Cloudflare |
| Flavors (Render path) | `https://dodealswithlee.onrender.com/flavors/` | Render (DDWL) | Always works if custom domain fails |
| Fantasy Mini Golf | `fantasyminigolf.com` | Cloudflare Pages or other | Confirm in Cloudflare dashboard |
| Flying Dutchman | _TBD — e.g. dutchman… / subdomain / section on group site_ | CF or Render path | **Seb:** confirm domain + who pays renewal |
| Exposure (agency + jobs) | `exposuresolutions.ie` / `exposuresolutions.me` | CF Pages or static | Recruitment canonical URL TBD per `ZANTE-RECRUITMENT-PLAYBOOK.md` |
| Central API / chat assets | `https://dodealswithlee.onrender.com` | Render | **Not** a public brand for candidates |

**Action for handover recipient:** Log into **Cloudflare** and draw a one-page diagram: domain → DNS record → target (Render, Pages, redirect).

---

## 5. Repositories & folders (where the code lives)

Paths are relative to the Exposure workstation convention:  
`C:\Users\…\Clients\ACTIVE\`

| What | Where | Git remote (typical) |
|------|--------|----------------------|
| **DDWL** (backend + Flavors static site + many APIs) | `DDWL\` | `exposuresolutions/dodealswithlee` |
| Flavors **public site files** | `DDWL\ghl-proxy\public\flavors\` | Same repo |
| **Achill Island Market** (contains Zante recruitment template) | `Achill Island Market\` | `exposuresolutions/achill-island-market` |
| Flavors **client assets** (non-repo collateral) | `FLAVORS\` | May be local / Drive only |
| **Exposure** website | `ExposureSolutions\website\` or similar | Per project |
| **Fantasy Mini Golf** standalone site | Confirm repo — may be separate Cloudflare project or inside DDWL `public/` | Fill in when known |

**Template file for Zante jobs (quest form + QR):**  
`Achill Island Market\zante\staff-apply.html` — copy to Exposure hosting + Flavors as `jobs.html` when live.

---

## 6. Central backend (DDWL on Render) — “the brain”

**Base URL:** `https://dodealswithlee.onrender.com`

**Endpoints you will touch most:**

| Path | Purpose |
|------|---------|
| `POST /api/client-form` | Generic JSON forms (gift boxes, **Zante recruitment** when `client: exposure-zante`, etc.) |
| `POST /api/ai-chat` | Website chat widgets (`es-chatbot-widget.js`) |
| `POST /api/achill-market` | Achill Market-specific forms (not Zante venues) |
| `POST /api/teds-form` | Ted’s Bar |
| `…/api/telegram/webhook` | Telegram bot hooks / alerts |

**Static chat widget script (often loaded by sites):**  
`/assets/es-chatbot-widget.js` on the same host — **Flavors:** `data-client="flavors"`; **Flying Dutchman:** `data-client="flying-dutchman"` (preset in repo `assets/es-chatbot-widget.js` — sync to Render-hosted `/assets/` when updated); **quest apply page:** `data-client="custom"`.

**Deploy:** Push to DDWL **`main`** → Render auto-build (typically a few minutes). Use **Render Dashboard → Manual Deploy** if needed.

> **Do not** publish Render **deploy hook URLs** or API keys in this document. Store them in Render only.

**Environment variables (conceptual — names only):**  
`KIMI_API_KEY`, `KIMI_BASE_URL`, `KIMI_MODEL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`, plus GHL, Resend, Google Sheets, etc. Full list: `DDWL\.env.example` (in DDWL repo).

**Env backup (internal):** `SYSTEMS/ENV-BACKUPS/DDWL.env.backup` — encrypted or restricted access only.

---

## 7. AI agents & chatbots

| Layer | What it is | Who configures |
|--------|------------|----------------|
| **Public site chat** | `es-chatbot-widget.js` + `/api/ai-chat` | Exposure / dev — client name & colours per site |
| **LLM provider** | Kimi (Moonshot) via env on Render | Exposure |
| **Telegram** | Ops alerts, commands (`/status`, `/leads`, etc.) | Exposure + admin chat ID |
| **n8n** (if used) | Workflows: GHL, WhatsApp, triage, draft notes | Exposure + venue for business rules |
| **Local Ollama** (optional) | On Ubuntu mini PC (`exposureos` in network docs) | Advanced / self-hosted experiments |

**For Flavors / Fantasy:** Ensure widget `data-client` matches a **profile** in the widget config (or use `data-client="custom"` with `data-name`, `data-greeting`, colours).

---

## 8. CRM & marketing automation (GoHighLevel)

- **GHL** is the agency’s default CRM for funnels, pipelines, SMS/email, calendars.  
- **Zante recruitment:** new applicants should land as **contacts** with tags (e.g. `Zante-2026-Applicant`) once `client-form` maps `exposure-zante` + `form_type: zante_seasonal_staff`. Map optional **`greek_afm`** / **`has_greek_afm`** → tag **`AFM-fasttrack-review`** when true; use **`greece-alumni`** when prior Greece seasons are confirmed (see `ZANTE-RECRUITMENT-PLAYBOOK.md` §6b).  
- **Handover task:** In GHL, document **Location ID**, **pipelines**, and **tags** used for Flavors / Fantasy / Flying Dutchman.

*Fill in when confirming with Lee:*

| Field | Value |
|-------|--------|
| GHL Location / sub-account | _TBD_ |
| Pipeline for seasonal staff | _TBD_ |
| Meta Business / ad account access | _TBD_ |

---

## 9. Recruitment “season quest” funnel

- **Playbook:** `ZANTE-RECRUITMENT-PLAYBOOK.md` (repo root, Achill Island Market project).  
- **Apply page template:** `zante/staff-apply.html`  
- **Payload:** `client: exposure-zante`, video + written pitch fields, `recruitment_quest_version: zante_quest_v1`.  
- **Backend:** Must whitelist `exposure-zante` in `client-form` handler (DDWL `server.js`) and map fields to GHL.

---

## 10. Social media & content

**Per platform, record in a secure sheet (not here):**

| Platform | Account / handle | Admin email | 2FA? | Notes |
|----------|------------------|-------------|------|--------|
| Instagram | _TBD_ | | | |
| Facebook Page | _TBD_ | | | |
| TikTok | _TBD_ | | | |
| Google Business Profile | _TBD_ | | | Per location |
| Flying Dutchman (IG / FB / etc.) | _TBD_ | | | Same cadence as Flavors — **billable** under Seb’s agreement |

**Operational rhythm:** content calendar, UTM links on every campaign link (`utm_source`, `utm_medium`, `utm_campaign`), reuse **hero video** + **Stories** for recruitment during season.

---

## 11. Analytics

- **GA4:** Each site may have its own property or shared — confirm **Measurement ID** in site `<head>`.  
- **Cloudflare Web Analytics** where enabled.  
- **Meta Pixel** if ads run — store Pixel ID in ad account notes.

---

## 12. Email & comms

- **Transactional / form notifications:** Often **Resend** (from DDWL) — check `sendEmail` usage in `server.js`.  
- **Business email:** Google Workspace / Microsoft 365 — venue inboxes for customer-facing comms.

---

## 13. Digital signage (if deployed)

- REVENUE / ops notes referenced **Yodeck** or similar for Ted’s Bar — Zante venues may use the same class of tool.  
- **Handover:** List screen locations, dashboard login (password manager), and who updates playlists weekly.

---

## 14. Games / engagement (if live)

- Exposure hosts a **games hub** pattern (`games-hub` URLs appear on Achill Market).  
- If Flavors / Fantasy use **on-site games** or QR campaigns, document URLs and whether they hit `/api/games/*` on Render.

---

## 15. Runbook — weekly (5–15 min)

- [ ] Spot-check **Flavors** + **Fantasy** + **Flying Dutchman** sites / pages on mobile (loads, menu, key links).  
- [ ] Test **chat widgets** once per brand you manage (e.g. Jobs / hours).  
- [ ] Check **Instagram/Facebook** DMs for missed messages.  
- [ ] Confirm **GHL** inbox / pipeline for new leads or applicants.  
- [ ] Note any **Render** incident banner (render.com/status).

---

## 16. Runbook — deploy change (Flavors site)

1. Edit files in `DDWL/ghl-proxy/public/flavors/`.  
2. `git add` / `commit` / `push` to `main`.  
3. Wait for Render deploy green.  
4. Hard-refresh `https://dodealswithlee.onrender.com/flavors/` then custom domain.  
5. Optional: ping Telegram or team WhatsApp “Flavors deploy done”.

---

## 17. Runbook — incident

| Symptom | First checks |
|---------|----------------|
| Site 502 / blank | Render service up? Recent deploy failed? |
| Chat never replies | `/api/ai-chat` errors? Kimi key / quota? |
| Forms not saving | `client-form` payload, CORS, network tab 4xx/5xx |
| Domain shows old site | Cloudflare cache, wrong DNS target, SSL mode |

**Escalation:** Exposure Solutions (Lee) for code/API; registrar/Cloudflare for DNS; Meta for ad account locks.

---

## 18. Related documentation (read order)

1. `EXPOSURE-SYSTEM-EXPORT.md` — full agency stack overview (machines, n8n, tools).  
2. `PROJECT-REPORTS.md` — §4 Flavors Zante.  
3. `ZANTE-RECRUITMENT-PLAYBOOK.md` — recruitment + UTMs + quest stages.  
4. `docs/ZANTE-MEDIA-PLAN-2026.md` — placements, UTM rules, execution checklist for the Zante drive.  
5. `docs/GHL-exposure-zante-FIELD-MAP.md` — JSON → GHL fields/tags for `exposure-zante` / `zante_seasonal_staff`.  
6. `.cursorrules` (Achill Island Market or DDWL repo) — client domains and API conventions.  
7. `DDWL/CLAUDE.md` or `GEMINI.md` — AI coding rules for the monolith.

---

## 19. First 30 days — handover checklist (recipient)

- [ ] Password manager folder: Cloudflare, Render, GHL, Meta, Instagram, domain registrar, Google Analytics.  
- [ ] Confirmed **GitHub org** access (`exposuresolutions` repos).  
- [ ] Render: view **env vars** (not screenshot into Slack).  
- [ ] Walkthrough: one **test** `client-form` submit for staging tag.  
- [ ] Single **diagram**: domains → hosts → APIs.  
- [ ] List of **vendors**: printer, photographer, paid ads spend owner.  
- [ ] Legal: who signs **employment** vs **agency** contracts.  
- [ ] **Signed Schedule A:** retainer for Flavors + Fantasy + **Flying Dutchman** (or bundle) + Exposure tech arrangement.

---

## 20. Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Outgoing (Seb / Lee) | | | |
| Incoming (operations) | | | |

---

*End of handover document. Update §4 (domains), §8 (GHL), §10 (social), and §2 (fees) when confirmed.*
