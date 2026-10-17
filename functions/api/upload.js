// Cloudflare Pages Function: POST /api/upload
// Takes one photo or video per request and forwards it to the Exposure Telegram chat,
// tagged with the booking reference, so the team sees it next to the booking alert.
//
// Settings → Environment variables in the Cloudflare Pages project:
//   TELEGRAM_BOT_TOKEN   bot token (same bot as the booking alerts)
//   TELEGRAM_CHAT_ID     chat to send files to
// Until both are set this returns 503 and the website tells the customer
// Exposure will collect their files on the call instead.
//
// Request: raw file body, Content-Type = the file's type, details in the query string:
//   ?client=a-las-raices&ref=<booking ref>&stage=booking|completion&name=<customer>&file=<filename>

const MAX_BYTES = 45 * 1024 * 1024; // Telegram bots can send files up to 50 MB
const CLIENTS = new Set(["a-las-raices"]);
const STAGES = { booking: "📎 Booking upload", completion: "✅ Job finished — upload" };

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const q = (k, max) => (url.searchParams.get(k) || "").slice(0, max).replace(/[<>]/g, "");
  const client = q("client", 40), ref = q("ref", 40), stage = q("stage", 20) || "booking";
  const name = q("name", 80), file = q("file", 120) || "upload";
  const type = (request.headers.get("content-type") || "").split(";")[0].trim();

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return json({ success: false, error: "uploads not configured" }, 503);
  if (!CLIENTS.has(client) || !STAGES[stage]) return json({ success: false, error: "bad request" }, 400);
  if (!/^(image|video)\//.test(type)) return json({ success: false, error: "photos and videos only" }, 415);
  const len = +(request.headers.get("content-length") || 0);
  if (len > MAX_BYTES) return json({ success: false, error: "file too large (max 45 MB)" }, 413);

  const body = await request.arrayBuffer();
  if (!body.byteLength || body.byteLength > MAX_BYTES) return json({ success: false, error: "file empty or too large" }, 413);

  const caption = [STAGES[stage] + " · " + client, ref && "Ref: " + ref, name && "From: " + name, file].filter(Boolean).join("\n");
  const kind = type.startsWith("image/") && body.byteLength < 10 * 1024 * 1024 ? "photo" : type.startsWith("video/") ? "video" : "document";
  const form = new FormData();
  form.append("chat_id", env.TELEGRAM_CHAT_ID);
  form.append("caption", caption);
  form.append(kind, new Blob([body], { type }), file);

  const method = { photo: "sendPhoto", video: "sendVideo", document: "sendDocument" }[kind];
  const tg = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, { method: "POST", body: form });
  const out = await tg.json().catch(() => ({}));
  if (!out.ok) return json({ success: false, error: "could not deliver file" }, 502);
  return json({ success: true });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}
