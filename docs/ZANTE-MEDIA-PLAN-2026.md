# Zante recruitment 2026 — media plan & tracking (one page)

**Canonical apply URL:** `https://exposuresolutions.me/zante-jobs` (set in `zante/staff-apply.html` → `<meta name="apply-canonical-url">`).  
**Campaign:** `utm_campaign=zante26` unless you run a new year.  
**Master sheet:** copy [`ZANTE-ADS-MASTER-SHEET.csv`](ZANTE-ADS-MASTER-SHEET.csv) to Google Sheets — add costs, ad IDs, dates as you spend.

---

## 1. CRM (single source of truth)

| System | Role |
|--------|------|
| **GoHighLevel (GHL)** | Contacts, pipelines, SMS/WhatsApp, calendars for Stage 3, tags, reporting. |
| **Render `POST /api/client-form`** | Accepts JSON from `staff-apply.html`; **must** map `client: exposure-zante` → GHL (see [`GHL-exposure-zante-FIELD-MAP.md`](GHL-exposure-zante-FIELD-MAP.md)). |

**Blockers until live:** (1) jobs page deployed on Exposure domain, (2) `exposure-zante` whitelisted + field map on server, (3) GHL pipeline + tags created.

---

## 2. UTM convention (use on every link)

| Parameter | Rule |
|-----------|------|
| `utm_campaign` | `zante26` |
| `utm_source` | Platform or site: `facebook`, `tiktok`, `instagram`, `poster`, `seasonworkers`, … |
| `utm_medium` | `paid`, `organic`, `bio`, `qr`, `listing`, `group`, `email`, … |
| `utm_content` | Creative or angle: `greece_returners_30s`, `flavors_energy_15s`, `a4_print`, … |

**Example:**  
`https://exposuresolutions.me/zante-jobs?utm_source=tiktok&utm_medium=paid&utm_campaign=zante26&utm_content=golf_playful_15s`

The apply page **reads UTMs + ad click IDs** from the URL and POSTs them with the form (see field map).

---

## 3. Where ads & listings go (buckets)

| Bucket | Channels |
|--------|----------|
| **Paid social** | Meta (FB+IG), TikTok Ads, Snapchat |
| **Paid search / video** | Google Ads Search + Demand Gen / YouTube |
| **Seasonal / Greece boards** | SeasonWorkers, Backpacker Job Board, Yseasonal, Seasonal Jobs Abroad, EURES |
| **General jobs** | Indeed (IE+NL), LinkedIn Jobs, Jooble, Talent.com, Glassdoor |
| **Hospitality** | Hosco, Caterer.com |
| **Organic** | TikTok, IG Reels, YT Shorts, FB Page, brand bios |
| **Communities** | FB groups (IE/NL/Greece expat) — follow each group’s rules |
| **Physical** | A4/A3 poster QR, on-site WiFi/table QR |
| **Owned web** | Exposure jobs, Flavors/Fantasy/Dutchman job buttons → same URL + UTMs |
| **Rehire** | WhatsApp broadcast (consent) — use `utm_source=whatsapp&utm_medium=broadcast` |

Full row templates are pre-filled in **`ZANTE-ADS-MASTER-SHEET.csv`**.

---

## 4. Analytics (optional but recommended)

| Layer | Action |
|-------|--------|
| **GA4** | Create a data stream for the jobs hostname; put Measurement ID in `staff-apply.html` → `ZANTE_TRACKING.ga4MeasurementId`. |
| **Meta Pixel** | Create Pixel; put ID in `ZANTE_TRACKING.metaPixelId`. PageView loads automatically; **Lead** fires on successful submit. |
| **TikTok** | Add Pixel when TikTok Ads go live; extend `staff-apply.html` similarly if needed. |

**GHL** remains the CRM of record; pixels help **ad platforms** attribute conversions.

---

## 5. Speed SLAs (from playbook)

| Step | Target |
|------|--------|
| Auto-ack | Minutes (GHL SMS/WhatsApp) |
| Human triage | &lt;24h (Greece/AFM priority) |
| Stage 3 booking | Calendar link same day as shortlist |
| Decision after call | Same or next day |

---

## 6. Execution checklist (order)

1. Deploy **`zante/staff-apply.html`** as live **`/zante-jobs`** (or path you choose).  
2. Set **`ZANTE_TRACKING`** GA4 + Meta IDs in the file (or inject at build).  
3. Implement **`exposure-zante`** on `client-form` + GHL per **[`GHL-exposure-zante-FIELD-MAP.md`](GHL-exposure-zante-FIELD-MAP.md)**.  
4. Copy CSV → **Sheets**; assign owners for each row.  
5. Turn on **Meta + TikTok** with 2–3 creatives each (IE+NL).  
6. Post **free listings** (SeasonWorkers + 2 boards) same week.  
7. Posters + venue site buttons with **unique `utm_content`** per placement.  
8. Weekly: reconcile **ad spend vs GHL leads** using `utm_*` on contacts.

---

## 7. Related docs

| File | Purpose |
|------|---------|
| [`ZANTE-RECRUITMENT-PLAYBOOK.md`](../ZANTE-RECRUITMENT-PLAYBOOK.md) | Full playbook: quest stages, AI video, legal AFM notes |
| [`HANDOVER-FLAVORS-FANTASY-ZANTE-OPERATIONS.md`](HANDOVER-FLAVORS-FANTASY-ZANTE-OPERATIONS.md) | Domains, Render, GHL context |
| [`GHL-exposure-zante-FIELD-MAP.md`](GHL-exposure-zante-FIELD-MAP.md) | JSON → GHL mapping |
| [`ZANTE-ADS-MASTER-SHEET.csv`](ZANTE-ADS-MASTER-SHEET.csv) | Placement + UTM log |
