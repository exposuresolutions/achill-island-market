#!/usr/bin/env node
/**
 * DDWL operator CLI (Node): same modes as ddwl-ops.ps1
 *
 * Usage:
 *   RENDER_API_KEY=rnd_... RENDER_SERVICE_ID=srv-... node scripts/ddwl-ops.mjs verify
 *   node scripts/ddwl-ops.mjs all --env-file scripts/ddwl.local.env
 *
 * Render API: https://api-docs.render.com/reference
 * API keys: https://dashboard.render.com/u/settings#api-keys
 */
import fs from 'fs';
import path from 'path';
import process from 'process';

const API = 'https://api.render.com/v1';
const DEFAULT_BASE = 'https://dodealswithlee.onrender.com';
const KEYS_TO_PUSH = [
  'KIMI_API_KEY', 'KIMI_MODEL', 'KIMI_BASE_URL', 'GROQ_API_KEY',
  'TG_BOT_TOKEN', 'TG_CHAT_ID', 'TG_ALLOWED_USERS', 'NOTIFY_ENABLED', 'TG_BOT_LABEL',
  'TELEGRAM_BOT_TOKEN', 'TELEGRAM_ADMIN_CHAT_ID', 'TELEGRAM_BOT_LABEL'
];

function loadDotEnv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    process.env[k] = v;
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { action: 'verify', envFile: '', baseUrl: DEFAULT_BASE, deployWaitSec: 90, skipTelegram: false, whatIf: false };
  const actions = new Set(['verify', 'push-env', 'deploy', 'all']);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--env-file' && args[i + 1]) { out.envFile = args[++i]; continue; }
    if (a === '--base-url' && args[i + 1]) { out.baseUrl = args[++i].replace(/\/$/, ''); continue; }
    if (a === '--deploy-wait' && args[i + 1]) { out.deployWaitSec = parseInt(args[++i], 10); continue; }
    if (a === '--skip-telegram') { out.skipTelegram = true; continue; }
    if (a === '--what-if' || a === '--dry-run') { out.whatIf = true; continue; }
    if (!a.startsWith('-') && actions.has(a.toLowerCase())) { out.action = a.toLowerCase(); continue; }
  }
  return out;
}

async function renderHeaders() {
  const key = process.env.RENDER_API_KEY;
  if (!key) throw new Error('RENDER_API_KEY missing. https://dashboard.render.com/u/settings#api-keys');
  return { Authorization: `Bearer ${key}`, Accept: 'application/json', 'Content-Type': 'application/json' };
}

async function getServiceIdByName(name) {
  const q = new URLSearchParams({ name });
  const r = await fetch(`${API}/services?${q}`, { headers: await renderHeaders() });
  if (!r.ok) throw new Error(`Render list services: ${r.status} ${await r.text()}`);
  const rows = await r.json();
  const match = rows.find((row) => row.service?.name === name || row.service?.slug === name);
  if (!match?.service?.id) {
    throw new Error(`No service named "${name}". Set RENDER_SERVICE_ID from https://dashboard.render.com`);
  }
  return match.service.id;
}

async function putEnvVar(serviceId, envKey, value, whatIf) {
  const enc = encodeURIComponent(envKey);
  const uri = `${API}/services/${serviceId}/env-vars/${enc}`;
  if (whatIf) {
    console.log('[what-if] PUT', uri);
    return;
  }
  const r = await fetch(uri, {
    method: 'PUT',
    headers: await renderHeaders(),
    body: JSON.stringify({ value })
  });
  if (!r.ok) throw new Error(`PUT ${envKey}: ${r.status} ${await r.text()}`);
}

async function postDeploy(serviceId, whatIf) {
  const uri = `${API}/services/${serviceId}/deploys`;
  if (whatIf) {
    console.log('[what-if] POST', uri);
    return null;
  }
  const r = await fetch(uri, {
    method: 'POST',
    headers: await renderHeaders(),
    body: JSON.stringify({ clearCache: 'do_not_clear' })
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Deploy: ${r.status} ${text}`);
  try { return JSON.parse(text); } catch { return text; }
}

async function verify(baseUrl) {
  console.log('\n== Health ==');
  const h = await fetch(`${baseUrl}/health`);
  const hj = await h.json();
  console.log(JSON.stringify(hj));
  if (hj.status !== 'ok') throw new Error('health not ok');

  console.log('\n== ask-lilly ==');
  const a = await fetch(`${baseUrl}/ask-lilly`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'Reply with one word: OK' })
  });
  const aj = await a.json();
  console.log(JSON.stringify(aj));
  if (!aj.ok) throw new Error('ask-lilly failed');
  console.log('provider:', aj.provider);
}

async function telegramPing() {
  const token = process.env.TG_BOT_TOKEN;
  const chat = process.env.TG_CHAT_ID;
  if (!token || !chat) {
    console.log('\n[telegram] skip (TG_BOT_TOKEN / TG_CHAT_ID)');
    return;
  }
  const msg = `DDWL ops (node) ping — ${new Date().toISOString()}`;
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text: msg })
  });
  const j = await r.json();
  if (!j.ok) throw new Error(JSON.stringify(j));
  console.log('\n[telegram] sent');
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const opts = parseArgs();
  if (opts.envFile) loadDotEnv(path.resolve(opts.envFile));

  let serviceId = process.env.RENDER_SERVICE_ID || '';
  const apiKey = process.env.RENDER_API_KEY;
  const serviceName = process.env.RENDER_SERVICE_NAME || 'dodealswithlee';

  if (apiKey && !serviceId && ['push-env', 'deploy', 'all'].includes(opts.action)) {
    console.log('Resolving service id:', serviceName);
    serviceId = await getServiceIdByName(serviceName);
    console.log('ServiceId:', serviceId);
  }

  if (opts.action === 'verify') {
    await verify(opts.baseUrl);
    if (!opts.skipTelegram) await telegramPing();
    console.log('\nDone (verify).');
    return;
  }

  if (opts.action === 'push-env') {
    if (!apiKey || !serviceId) throw new Error('Need RENDER_API_KEY and RENDER_SERVICE_ID (or name resolution)');
    for (const k of KEYS_TO_PUSH) {
      const v = process.env[k];
      if (!v) continue;
      console.log('Pushing', k, '...');
      await putEnvVar(serviceId, k, v, opts.whatIf);
    }
    console.log('Push-env complete.');
    return;
  }

  if (opts.action === 'deploy') {
    if (!apiKey || !serviceId) throw new Error('Need RENDER_API_KEY and RENDER_SERVICE_ID');
    const d = await postDeploy(serviceId, opts.whatIf);
    console.log(JSON.stringify(d, null, 2));
    return;
  }

  if (opts.action === 'all') {
    if (!apiKey || !serviceId) throw new Error('Need RENDER_API_KEY and RENDER_SERVICE_ID');
    for (const k of KEYS_TO_PUSH) {
      const v = process.env[k];
      if (!v) continue;
      console.log('Pushing', k, '...');
      await putEnvVar(serviceId, k, v, opts.whatIf);
    }
    console.log('Deploying...');
    await postDeploy(serviceId, opts.whatIf);
    console.log(`Waiting ${opts.deployWaitSec}s...`);
    await sleep(opts.deployWaitSec * 1000);
    await verify(opts.baseUrl);
    if (!opts.skipTelegram) await telegramPing();
    console.log('\nDone (all).');
    return;
  }

  throw new Error(`Unknown action: ${opts.action}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
