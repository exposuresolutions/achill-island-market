# OpenClaw/Open WebUI + Telegram Bot Wiring

This pulls the known infrastructure values from your imported system export and gives you a direct setup path from this machine.

## Known Infrastructure (from imported export)

- **AI hub (Ubuntu server):** `exposureos`
- **Tailscale IP:** `100.96.2.10`
- **Open WebUI URL:** `http://100.96.2.10:8080`
- **Ollama URL:** `http://100.96.2.10:11434`
- **n8n URL:** `http://100.96.2.10:5678`
- **SSH:** `ssh exposureai@100.96.2.10`

Telegram wiring in your existing stack uses:

- `TG_BOT_TOKEN`
- `TG_CHAT_ID`
- `NOTIFY_ENABLED=true`

Known imported bot details:

- **Bot name:** Lilly
- **Telegram:** `@LillyDDWL_bot`
- **Server service:** `lilly-telegram.service`
- **Entry point:** `/home/exposureai/ddwl/agent-skills/telegram_bot.py`

## 1) Verify Server Reachability (from this PC)

PowerShell:

```powershell
Test-NetConnection 100.96.2.10 -Port 8080
Test-NetConnection 100.96.2.10 -Port 5678
Test-NetConnection 100.96.2.10 -Port 11434
```

## 2) Wire Telegram Alerts (Render/Node apps)

Set environment variables where your app runs:

- `TG_BOT_TOKEN=<your token>`
- `TG_CHAT_ID=<your chat id>`
- `NOTIFY_ENABLED=true`

The scripts in this repo also accept Lilly aliases:

- `LILLY_TG_BOT_TOKEN`
- `LILLY_TG_CHAT_ID`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Then send a test alert using `scripts/test-telegram-alert.ps1`.

Check Lilly service on Ubuntu:

```powershell
ssh exposureai@100.96.2.10 "systemctl status lilly-telegram.service --no-pager"
```

## 3) OpenClaw/Open WebUI Access

If by "OpenClaw" you mean your local chat stack, use:

- Open WebUI: `http://100.96.2.10:8080`
- Ollama API health:

```powershell
Invoke-RestMethod -Uri "http://100.96.2.10:11434/api/tags" -Method Get
```

## 4) Mobile Workflow (review + updates while away)

### Required apps
- **Tailscale** (phone) — connect to private services
- **GitHub app** — review commits, diffs, PRs
- **Browser** — open Open WebUI/n8n via Tailscale IP

### On mobile (fast routine)
1. Connect Tailscale.
2. Open `http://100.96.2.10:8080` for AI chat.
3. Open `http://100.96.2.10:5678` for workflow status.
4. Use GitHub app to review latest commits on:
   - `exposuresolutions/achill-island-market`
5. Watch Telegram channel/chat for deployment notifications.

## 5) What I Can Wire Automatically Next

If you want, I can add:

- post-deploy Telegram notify script in this repo,
- a small status dashboard page for mobile quick checks,
- and a "daily summary" message format you can trigger from n8n.

## 6) Do Deals With Lee (`dodealswithlee` on Render) — what you do

Only you can set secrets and approve access. Use this order after each deploy:

1. **Render → `dodealswithlee` → Environment:** set `KIMI_API_KEY` (required for Kimi). Optional: `KIMI_MODEL`, `KIMI_BASE_URL`, `GROQ_API_KEY` (fallback if Kimi unset).
2. **Same service:** set `TG_BOT_TOKEN`, `TG_CHAT_ID`, and `TG_ALLOWED_USERS` (comma-separated Telegram user or chat IDs that may use the command bot). Optional: `TG_BOT_LABEL` (custom footer text instead of auto `@username`).
3. **Alerts:** set `NOTIFY_ENABLED=true` if you want server-driven Telegram alerts from `sendTelegram`; omit or `false` to reduce noise.
4. **DDWL-OS login alerts (optional, can be a different bot):** `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`, optional `TELEGRAM_BOT_LABEL`.
5. **Smoke tests:** open `https://dodealswithlee.onrender.com/health` (expect `status: ok`); POST `/ask-lilly` with `{"question":"hi"}` (expect `provider: kimi` when Kimi is set); in Telegram send a **non-command** message to the bot tied to `TG_BOT_TOKEN` and confirm a reply plus footer.

**ES Chat API (separate Render service, if you use it):** `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`, `KIMI_API_KEY`, optional `TELEGRAM_BOT_LABEL`.
