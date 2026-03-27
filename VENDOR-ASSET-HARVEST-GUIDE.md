# Vendor Asset Harvest Guide

Use this with `VENDOR-SOCIAL-ASSET-INTAKE.csv` to collect verified vendor assets.

## 1) Fill the Intake CSV

For each vendor, add only official links:

- `instagram_url`
- `facebook_url`
- `tiktok_url` (optional)
- `website_url` (optional)

If a vendor sends direct media links, paste:

- `logo_url`
- `product_image_1`
- `product_image_2`
- `product_image_3`

Set `status` to:

- `pending` (waiting on vendor)
- `received` (vendor provided links)
- `verified` (you checked links are correct)
- `ready` (approved for site use)

## 2) AI Agent Activation (Hidden Until Ready)

The Achill AI widget loader is now wired on core pages using:

- `assets/js/achill-ai-agent.js`

It only runs when `window.ACHILL_CHAT_WIDGET_ID` is set.

Current state: disabled (`""`) on all core pages.

## 3) Go-Live Step for AI Agent

When your Achill-specific GHL widget ID is ready, replace:

`window.ACHILL_CHAT_WIDGET_ID = "";`

with:

`window.ACHILL_CHAT_WIDGET_ID = "YOUR_ACHILL_WIDGET_ID";`

on:

- `index.html`
- `cashel.html`
- `keel.html`
- `register.html`
- `guide.html`
