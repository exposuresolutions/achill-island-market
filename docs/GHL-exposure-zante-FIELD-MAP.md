# GHL + API mapping — `exposure-zante` (Zante seasonal staff)

**Form endpoint:** `POST https://dodealswithlee.onrender.com/api/client-form`  
**Discriminator:** `client: "exposure-zante"` and `form_type: "zante_seasonal_staff"`

Implement in **DDWL** `server.js` (or equivalent): validate client, then **create/update GHL contact** and optionally **opportunity** in the seasonal hiring pipeline.

---

## 1. Core contact fields (map from JSON)

| JSON field | GHL / notes |
|------------|-------------|
| `name` | Contact name (split first/last if your workflow requires it) |
| `email` | Email |
| `phone` | Phone (E.164 if possible for WhatsApp) |
| `nationality` | Custom field or dropdown |
| `passport_eu` | Custom field |
| `venues` | Array → multi-select custom field or comma text: `flavors_laganas`, `flavors_tsilivi`, `fantasy_mini_golf`, `flying_dutchman` |
| `greece_experience` | Long text → note or custom field |
| `availability_start` | Custom field (date) |
| `pitch_video_url` | Custom field URL |
| `intro_video_url` | Same as pitch for now; can mirror |
| `why_you`, `what_you_add`, `why_zante` | Notes or three custom fields |
| `greek_afm` | Optional; restrict visibility per legal advice |
| `has_greek_afm` | Boolean → automation: tag **AFM-fasttrack-review** when true |
| `recruitment_quest_version` | Custom field (e.g. `zante_quest_v1`) for analytics |
| `source` | Custom field “Lead source detail” (human-readable string from page) |

---

## 2. Attribution (store on contact for reporting)

| JSON field | GHL |
|------------|-----|
| `utm_source` | Custom field `utm_source` |
| `utm_medium` | Custom field `utm_medium` |
| `utm_campaign` | Custom field `utm_campaign` |
| `utm_content` | Custom field `utm_content` |
| `fbclid` | Custom field `fbclid` (truncate if &gt; 255 chars) |
| `gclid` | Custom field `gclid` |
| `ttclid` | Custom field `ttclid` |
| `msclkid` | Custom field `msclkid` |
| `landing_page` | Custom field `landing_page` (URL at submit time) |

Use these in **GHL reports** and **Looker Studio** exports.

---

## 3. Tags (automation)

| Condition | Tag |
|-----------|-----|
| Every successful submit | `Zante-2026-Applicant` |
| `has_greek_afm === true` | `AFM-fasttrack-review` |
| Human confirms prior Greece seasons from `greece_experience` | `greece-alumni` (manual or LLM-assist + human confirm) |

---

## 4. Pipeline stages (suggested names)

| Stage | Meaning |
|-------|---------|
| New applicant | Form received |
| Triage | Video + answers reviewed |
| Stage 3 booked | Calendly / GHL calendar sent |
| Stage 3 completed | Virtual interview done |
| Stage 4 invite | Fly / trial on island |
| Hired / Rejected / Hold | Close reasons |

Align naming with the **season quest** copy on the website.

---

## 5. Automations (GHL or n8n)

1. **Instant SMS or WhatsApp** template: “Got your application — we reply within 24h.”  
2. **Internal notify:** Telegram or email to ops when `greece-alumni` or `AFM-fasttrack-review` applies.  
3. **Missing video:** wait 2h → if `pitch_video_url` empty (should not happen — form validates) skip.  
4. **Pipeline move:** on calendar booking webhook → move to Stage 3 booked.

---

## 6. Server acceptance

The HTML may send **additional keys**; the API should **ignore unknown fields** rather than 400, **or** explicitly persist the attribution block above.

**Test payload:** submit once from `?utm_source=test&utm_medium=qa&utm_campaign=zante26&utm_content=field_map` and verify every field appears on the GHL contact.
