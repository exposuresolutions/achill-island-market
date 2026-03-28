# ES Chat API

Deploy this folder on Render: set **Root Directory** to `services/es-chat-api`, build `npm install`, start `node server.js`.

Required env vars: `KIMI_API_KEY`, `KIMI_BASE_URL` (https://api.moonshot.ai/v1), `KIMI_MODEL` (moonshot-v1-8k), `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`, optional `ADMIN_KEY` for `/api/admin/dashboard`.

After deploy, confirm `GET /health` returns JSON with `"service":"es-chat-api"` and `"version":"3.0.1"`.
