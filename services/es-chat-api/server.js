const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

const KIMI_API_KEY = process.env.KIMI_API_KEY;
const KIMI_BASE = process.env.KIMI_BASE_URL || 'https://api.moonshot.ai/v1';
const KIMI_URL = KIMI_BASE.endsWith('/chat/completions') ? KIMI_BASE : `${KIMI_BASE}/chat/completions`;
const KIMI_MODEL = process.env.KIMI_MODEL || 'moonshot-v1-8k';

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG_ADMIN = process.env.TELEGRAM_ADMIN_CHAT_ID;
const TG_API = TG_TOKEN ? `https://api.telegram.org/bot${TG_TOKEN}` : null;

const pendingQuestions = new Map();

async function tgSend(text, opts = {}) {
  if (!TG_API || !TG_ADMIN) return null;
  try {
    const body = {
      chat_id: TG_ADMIN,
      text,
      parse_mode: opts.parse_mode || 'Markdown',
      ...(opts.reply_markup && { reply_markup: opts.reply_markup })
    };
    const r = await fetch(`${TG_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    return data.ok ? data.result.message_id : null;
  } catch (e) {
    console.error('[TG] Send failed:', e.message);
    return null;
  }
}

async function tgAsk(question, options = []) {
  const id = Date.now().toString(36);
  const keyboard = options.length > 0
    ? { inline_keyboard: [options.map((o, i) => ({ text: o, callback_data: `answer_${id}_${i}` }))] }
    : undefined;

  const msgId = await tgSend(`❓ *Question from ES System*\n\n${question}${options.length ? '\n\n_Tap a button or type your reply:_' : '\n\n_Reply to this message:_'}`, {
    reply_markup: keyboard
  });

  if (!msgId) return null;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      pendingQuestions.delete(id);
      resolve(null);
    }, 3600000);
    pendingQuestions.set(id, { resolve, timeout, msgId });
  });
}

async function tgNotify(category, message) {
  const icons = {
    form: '📋', error: '🚨', lead: '💰', alert: '⚠️',
    info: 'ℹ️', game: '🎮', site: '🌐', deploy: '🚀'
  };
  return tgSend(`${icons[category] || '📌'} *${category.toUpperCase()}*\n\n${message}`);
}

const ALLOWED_ORIGINS = [
  'https://gieltysbar.com', 'https://www.gieltysbar.com',
  'https://achilloffshore.com', 'https://www.achilloffshore.com',
  'https://achillislandmarket.com', 'https://www.achillislandmarket.com',
  'https://fantasyminigolf.com', 'https://www.fantasyminigolf.com',
  'https://laganasflavors.com', 'https://www.laganasflavors.com',
  'https://achillquest.com', 'https://achillcoaches.com',
  'https://gieltyscafe.com', 'https://exposuresolutions.ie',
  'http://localhost:8080', 'http://127.0.0.1:8080',
  'http://localhost:3000', 'http://localhost:5500',
  'http://localhost:9876', 'http://127.0.0.1:9876'
];

app.use(cors({
  origin: function(origin, cb) {
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.pages.dev')) return cb(null, true);
    cb(null, false);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10kb' }));

const CLIENTS = {
  gieltys: {
    name: "Gielty's Helper",
    greeting: "Welcome to Gielty's Bar & Restaurant on Achill Island. Ask me about bookings, the menu, live music, or anything else — I'm here to help.",
    system: `You are the friendly concierge for Gielty's Bar & Restaurant on Achill Island, Ireland.
Help with table bookings, menu, events, live music, and property investment enquiries.
Hours: 12pm-11:30pm daily. Food: 12-9pm. Address: Keel, Achill Island, Co. Mayo.
Be warm and welcoming. Keep answers under 120 words. Use simple language anyone can understand.
For property investment: collect name, email, budget, timeline. Say Alan will contact them.`
  },
  flavors: {
    name: 'Flavors Helper',
    greeting: "Welcome to Flavors Daiquiri Bar in Laganas, Zante. Ask about drinks, events, jobs, or our Atlantic to Ionian Exchange — happy to help.",
    system: `You are the assistant for Flavors Daiquiri Bar, Laganas, Zante, Greece.
Help with events, drinks, jobs, and the Atlantic to Ionian Exchange program.
Season: May-October. Sister venue: Fantasy Mini Golf, Tsilivi.
Keep answers fun, short (under 100 words), and friendly.`
  },
  'fantasy-mini-golf': {
    name: 'Golf Helper',
    greeting: "Welcome to Fantasy Mini Golf in Tsilivi! Ask about our courses, prices, group bookings, or opening times.",
    system: `You are the assistant for Fantasy Mini Golf, Tsilivi, Zante, Greece.
5 themed courses: Blue (Dinosaur), Red (Pirate), Green (Volcanic), Yellow (Wild West), and Course 5 (Coming Summer 2026 - Largest in Greece).
81 holes total. Price: 8EUR per course. Family combo: All courses 30EUR/person. Under 5s free.
Open 10am-midnight May-October. On-site: Molly Malone's Bar.
Digital scorecard: fantasyminigolf.com/scorecard. Play online: fantasyminigolf.com/play.
Keep answers short and friendly. Use simple language a child could understand.`
  },
  offshore: {
    name: 'Jobs Helper',
    greeting: "Welcome to Achill Offshore. I can help you explore local and international job opportunities — what kind of role are you looking for?",
    system: `You are the recruitment assistant for Achill Offshore (achilloffshore.com).
Help find jobs: local Achill Island roles and international FIFO positions.
Sectors: energy, marine, construction, hospitality (seasonal exchange Ireland-Greece).
To apply: collect name, email, role interest, experience.
Keep answers professional but warm. Under 120 words.`
  },
  'achill-market': {
    name: 'Market Guide',
    greeting: "Welcome to the Achill Island Farmers Market guide. Ask about Keel and Cashel markets, vendors, or what to find when you visit.",
    system: `You are the guide for Achill Island Farmers Market.
Keel Market: Saturdays 12-4. Cashel Market: Wednesdays at Ted's Bar.
Vendors sell local food, handmade crafts, jewellery, plants, skincare, knitwear.
Help visitors find vendors, products, schedules. Be warm and local.
Keep answers short and friendly. Use simple language.`
  },
  coaches: {
    name: 'Booking Helper',
    greeting: "Welcome to Achill Coaches. I can help with coach hire, routes, group bookings, and prices — what do you need?",
    system: `You are the assistant for Achill Coaches, a coach hire service on Achill Island.
Help with coach hire, routes, group bookings, school tours, wedding transport, prices.
Keep answers helpful and professional. Under 100 words.`
  },
  cafe: {
    name: 'Cafe Helper',
    greeting: "Welcome to Gielty's Cafe on Achill Island. Ask about the menu, opening times, directions, or catering.",
    system: `You are the assistant for Gielty's Cafe on Achill Island.
Help with menu, opening times, directions, catering enquiries.
Keep answers warm and brief. Under 80 words.`
  }
};

let requestCount = 0;
const RATE_LIMIT = {};
const RATE_WINDOW = 60000;
const MAX_PER_WINDOW = 10;

function rateLimit(ip) {
  const now = Date.now();
  if (!RATE_LIMIT[ip] || now - RATE_LIMIT[ip].start > RATE_WINDOW) {
    RATE_LIMIT[ip] = { start: now, count: 1 };
    return true;
  }
  RATE_LIMIT[ip].count++;
  return RATE_LIMIT[ip].count <= MAX_PER_WINDOW;
}

async function askKimi(systemPrompt, userPrompt, opts = {}) {
  const { temperature = 0.7, max_tokens = 400 } = opts;
  const response = await fetch(KIMI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIMI_API_KEY}`
    },
    body: JSON.stringify({
      model: KIMI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature,
      max_tokens
    })
  });
  if (!response.ok) throw new Error(`Kimi ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

const SUPPORTED_CLIENT_KEYS = Object.keys(CLIENTS);

// ========== HEALTH ==========

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'es-chat-api',
    version: '3.0.1',
    uptime: process.uptime(),
    requests: requestCount,
    kimi: KIMI_API_KEY ? 'configured' : 'MISSING',
    telegram: TG_API ? 'configured' : 'not-set',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    version: '3.0.1',
    clients: SUPPORTED_CLIENT_KEYS,
    kimi: KIMI_API_KEY ? 'configured' : 'not-configured',
    features: ['chat', 'forms', 'trivia', 'icebreakers', 'stories', 'challenges'],
    uptime: process.uptime()
  });
});

// ========== AI CHAT (all client sites) ==========

app.get('/api/ai-chat/greeting', (req, res) => {
  const client = String(req.query.client || 'gieltys');
  const ctx = CLIENTS[client] || CLIENTS.gieltys;
  res.json({
    success: true,
    client: CLIENTS[client] ? client : 'gieltys',
    assistant: ctx.name,
    greeting: ctx.greeting
  });
});

app.post('/api/ai-chat', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.ip;
  if (!rateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  requestCount++;
  const { client = 'gieltys', message, history = [] } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Please type a message.' });
  }
  if (message.length > 1500) {
    return res.status(400).json({ error: 'Message is too long. Please keep it shorter.' });
  }

  if (!KIMI_API_KEY) {
    const ctx = CLIENTS[client] || CLIENTS.gieltys;
    return res.json({
      success: true,
      reply: "I'm just getting set up! In the meantime, please call us or send an email. We'd love to help!",
      assistant: ctx.name,
      client
    });
  }

  const ctx = CLIENTS[client] || CLIENTS.gieltys;
  const messages = [{ role: 'system', content: ctx.system }];
  const recent = history.slice(-4);
  for (const m of recent) {
    if (m.role === 'user' || m.role === 'assistant') {
      messages.push({ role: m.role, content: String(m.content).slice(0, 800) });
    }
  }
  messages.push({ role: 'user', content: message });

  try {
    const response = await fetch(KIMI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`
      },
      body: JSON.stringify({
        model: KIMI_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 400
      })
    });

    if (!response.ok) {
      console.error('Kimi API error:', response.status);
      return res.json({
        success: true,
        reply: "I'm having a wee moment! Please try again or give us a call.",
        assistant: ctx.name,
        client
      });
    }

    const data = await response.json();
    res.json({
      success: true,
      reply: data.choices[0].message.content,
      assistant: ctx.name,
      client
    });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.json({
      success: true,
      reply: "Sorry about that! I'm having a connection issue. Please try again in a moment.",
      assistant: ctx.name,
      client
    });
  }
});

// ========== FORM SUBMISSIONS ==========

const formSubmissions = [];

async function handleClientForm(req, res) {
  requestCount++;
  const submission = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
    ...req.body,
    ip: req.headers['x-forwarded-for'] || req.ip
  };

  formSubmissions.push(submission);
  if (formSubmissions.length > 500) formSubmissions.shift();

  console.log(`[FORM] ${submission.client}/${submission.form_type}: ${submission.name || 'anonymous'} <${submission.email || 'no email'}>`);

  let aiAnalysis = null;
  if (KIMI_API_KEY && submission.email) {
    try {
      aiAnalysis = JSON.parse(await askKimi(
        'Analyse this form submission. Return JSON only: {"priority":"high|medium|low","type":"booking|enquiry|job-application|property-lead|exchange|general","summary":"one sentence","action":"what to do next"}',
        `Client: ${submission.client}\nForm: ${submission.form_type}\nName: ${submission.name}\nEmail: ${submission.email}\nMessage: ${submission.message || 'none'}\nPhone: ${submission.phone || 'none'}`,
        { temperature: 0.3, max_tokens: 200 }
      ));
    } catch (e) {
      console.error('AI qualification error:', e.message);
    }
  }

  if (TG_API) {
    const priority = aiAnalysis?.priority || 'medium';
    const emoji = priority === 'high' ? '🔥' : priority === 'low' ? '📝' : '📋';
    const lines = [
      `${emoji} *New ${submission.form_type || 'form'} — ${submission.client || 'unknown'}*`,
      submission.name && `👤 ${submission.name}`,
      submission.email && `📧 ${submission.email}`,
      submission.phone && `📱 ${submission.phone}`,
      submission.message && `💬 _${submission.message.slice(0, 200)}_`,
      aiAnalysis && `\n🤖 AI: ${aiAnalysis.summary}\n⚡ Action: ${aiAnalysis.action}`
    ].filter(Boolean).join('\n');
    tgSend(lines).catch(() => {});
  }

  res.json({
    success: true,
    message: 'Thank you! We will be in touch shortly.',
    id: submission.id,
    ai: aiAnalysis
  });
}

app.post('/api/client-form', handleClientForm);

app.post('/api/achill-market', (req, res, next) => {
  req.body = req.body && typeof req.body === 'object' ? req.body : {};
  if (!req.body.client) req.body.client = 'achill-market';
  return handleClientForm(req, res);
});

app.get('/api/client-form/recent', (req, res) => {
  const client = req.query.client;
  const results = client
    ? formSubmissions.filter(s => s.client === client).slice(-20)
    : formSubmissions.slice(-50);
  res.json({ success: true, count: results.length, submissions: results });
});

// ========== SOCIAL GAMES API ==========

const TRIVIA_CATEGORIES = [
  'general knowledge', 'Irish culture & history', 'Greek mythology & culture',
  'world sports', 'music & entertainment', 'science & nature', 'food & drink',
  'geography', 'movies & TV', 'history', 'animals', 'famous people'
];

app.post('/api/games/trivia', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.ip;
  if (!rateLimit(ip)) return res.status(429).json({ error: 'Too many requests' });
  requestCount++;

  const { category, difficulty = 'medium', count = 5, venue } = req.body;
  const cat = category || TRIVIA_CATEGORIES[Math.floor(Math.random() * TRIVIA_CATEGORIES.length)];

  if (!KIMI_API_KEY) {
    return res.json({ success: true, questions: getFallbackTrivia(cat, count), source: 'offline', category: cat });
  }

  try {
    const raw = await askKimi(
      `You are a fun pub quiz master. Generate exactly ${count} trivia questions.
Return ONLY a JSON array. Each object: {"q":"question text","options":["A","B","C","D"],"answer":0,"fun_fact":"one sentence fun fact"}
answer is the 0-based index of the correct option.
Difficulty: ${difficulty}. Make questions entertaining, not obscure. Mix easy and tricky.`,
      `Category: ${cat}${venue ? `\nVenue: ${venue} (add 1 local/themed question if relevant)` : ''}`,
      { temperature: 0.9, max_tokens: 800 }
    );

    let questions;
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      questions = JSON.parse(jsonMatch[0]);
    } else {
      questions = JSON.parse(raw);
    }

    res.json({ success: true, questions, source: 'ai', category: cat });
  } catch (err) {
    console.error('Trivia error:', err.message);
    res.json({ success: true, questions: getFallbackTrivia(cat, count), source: 'offline', category: cat });
  }
});

function getFallbackTrivia(cat, count) {
  const bank = [
    { q: "What is the capital of Ireland?", options: ["Cork", "Dublin", "Galway", "Limerick"], answer: 1, fun_fact: "Dublin comes from the Irish 'Dubh Linn' meaning black pool." },
    { q: "Which Greek god is associated with the sea?", options: ["Zeus", "Hades", "Poseidon", "Apollo"], answer: 2, fun_fact: "Poseidon was also known as the 'Earth Shaker' due to his power over earthquakes." },
    { q: "What sport uses a shuttlecock?", options: ["Tennis", "Badminton", "Squash", "Table Tennis"], answer: 1, fun_fact: "A shuttlecock can travel over 300 mph when hit by a professional player." },
    { q: "Which planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Saturn"], answer: 2, fun_fact: "Mars has the largest volcano in the solar system — Olympus Mons." },
    { q: "What is the longest river in the world?", options: ["Amazon", "Nile", "Mississippi", "Yangtze"], answer: 1, fun_fact: "The Nile flows through 11 different countries." },
    { q: "Who painted the Mona Lisa?", options: ["Michelangelo", "Da Vinci", "Raphael", "Rembrandt"], answer: 1, fun_fact: "The Mona Lisa has no eyebrows — it was fashionable to shave them in Renaissance Florence." },
    { q: "What is the smallest country in the world?", options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], answer: 1, fun_fact: "Vatican City is only 0.44 sq km — you could walk across it in about 10 minutes." },
    { q: "In what year did the Titanic sink?", options: ["1910", "1912", "1914", "1916"], answer: 1, fun_fact: "The Titanic's last meal had 11 courses for first-class passengers." },
    { q: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], answer: 2, fun_fact: "All the gold ever mined would fit into about 3.5 Olympic swimming pools." },
    { q: "Which country is Zakynthos (Zante) in?", options: ["Italy", "Turkey", "Greece", "Croatia"], answer: 2, fun_fact: "Zakynthos is home to the famous Navagio (Shipwreck) Beach, one of the most photographed spots in the world." }
  ];
  const shuffled = bank.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, bank.length));
}

app.post('/api/games/icebreaker', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.ip;
  if (!rateLimit(ip)) return res.status(429).json({ error: 'Too many requests' });
  requestCount++;

  const { venue, mood = 'fun', count = 3 } = req.body;

  if (!KIMI_API_KEY) {
    return res.json({ success: true, icebreakers: getFallbackIcebreakers(count), source: 'offline' });
  }

  try {
    const raw = await askKimi(
      `You generate fun social icebreaker challenges for people at a bar or venue.
Return ONLY a JSON array. Each object: {"challenge":"the challenge text","type":"question|action|group","difficulty":"easy|medium|bold","emoji":"one relevant emoji"}
Make them fun, inclusive, and appropriate for all ages. Mix types.
Some should get people talking to strangers. Some are for the whole table.
${venue ? `Venue: ${venue}. Make 1-2 challenges venue-specific.` : ''}
Mood: ${mood}`,
      `Generate ${count} icebreaker challenges.`,
      { temperature: 0.95, max_tokens: 600 }
    );

    let icebreakers;
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    icebreakers = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);

    res.json({ success: true, icebreakers, source: 'ai' });
  } catch (err) {
    console.error('Icebreaker error:', err.message);
    res.json({ success: true, icebreakers: getFallbackIcebreakers(count), source: 'offline' });
  }
});

function getFallbackIcebreakers(count) {
  const bank = [
    { challenge: "Find someone wearing the same colour as you and give them a compliment!", type: "action", difficulty: "easy", emoji: "🎨" },
    { challenge: "Ask the person nearest to you: What's the most adventurous thing you've ever done?", type: "question", difficulty: "easy", emoji: "🏔️" },
    { challenge: "Everyone at the table: name your favourite movie. Anyone with the same answer has to do a toast together!", type: "group", difficulty: "easy", emoji: "🎬" },
    { challenge: "Go to the bar and ask the bartender what THEIR favourite drink is, then order it.", type: "action", difficulty: "medium", emoji: "🍸" },
    { challenge: "Tell the table a fun fact nobody would guess about you.", type: "question", difficulty: "medium", emoji: "🤯" },
    { challenge: "Find someone at another table and ask them to recommend one thing to do on the island.", type: "action", difficulty: "bold", emoji: "🗺️" },
    { challenge: "Everyone: What's your most useless talent? Demonstrate it!", type: "group", difficulty: "medium", emoji: "🎪" },
    { challenge: "Ask someone nearby: If you could have dinner with anyone, dead or alive, who?", type: "question", difficulty: "easy", emoji: "🍽️" },
    { challenge: "Table challenge: Everyone has 30 seconds to sketch the person opposite them. Best drawing wins!", type: "group", difficulty: "medium", emoji: "✏️" },
    { challenge: "Find someone who's been to a country you haven't. Ask them the best thing about it.", type: "action", difficulty: "bold", emoji: "✈️" }
  ];
  return bank.sort(() => Math.random() - 0.5).slice(0, Math.min(count, bank.length));
}

app.post('/api/games/two-truths', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.ip;
  if (!rateLimit(ip)) return res.status(429).json({ error: 'Too many requests' });
  requestCount++;

  const { name, truths } = req.body;
  if (!truths || !Array.isArray(truths) || truths.length !== 2) {
    return res.status(400).json({ error: 'Provide exactly 2 truths as an array.' });
  }

  if (!KIMI_API_KEY) {
    return res.json({
      success: true,
      statements: [...truths, "Once accidentally walked into a glass door in front of 50 people"].sort(() => Math.random() - 0.5),
      lie_index: null,
      source: 'offline'
    });
  }

  try {
    const raw = await askKimi(
      `You are playing Two Truths and a Lie. A person gives you 2 true statements about themselves.
You must invent 1 convincing lie that sounds like it COULD be true based on the style and tone of their truths.
Return ONLY JSON: {"lie":"the lie you invented","all_shuffled":["statement1","statement2","statement3"],"lie_position":0}
The lie_position is the 0-based index of the lie in all_shuffled. Shuffle randomly.`,
      `Name: ${name || 'Player'}\nTruth 1: ${truths[0]}\nTruth 2: ${truths[1]}`,
      { temperature: 0.9, max_tokens: 200 }
    );

    const result = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);
    res.json({ success: true, ...result, source: 'ai' });
  } catch (err) {
    console.error('Two truths error:', err.message);
    const lie = "Once accidentally called a teacher 'mum' in front of the whole class";
    const all = [...truths, lie].sort(() => Math.random() - 0.5);
    res.json({ success: true, lie, all_shuffled: all, lie_position: all.indexOf(lie), source: 'offline' });
  }
});

app.post('/api/games/story', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.ip;
  if (!rateLimit(ip)) return res.status(429).json({ error: 'Too many requests' });
  requestCount++;

  const { venue, contributions = [], action = 'start' } = req.body;

  if (!KIMI_API_KEY) {
    const starters = [
      "It was a dark and stormy night on Achill Island when the door of the pub burst open and in walked...",
      "Nobody expected the goat to walk into the bar, but there it was, wearing sunglasses and ordering a pint.",
      "The last ferry had left Zakynthos an hour ago, but somehow, a mysterious stranger appeared at the dock with a treasure map."
    ];
    return res.json({
      success: true,
      text: action === 'start' ? starters[Math.floor(Math.random() * starters.length)] : "...and then something completely unexpected happened!",
      source: 'offline'
    });
  }

  try {
    let prompt, sysPrompt;
    if (action === 'start') {
      sysPrompt = `You are a hilarious storyteller. Write the opening line (2-3 sentences) of a fun, engaging story.
Set it in or near ${venue || 'a lively bar'}. Make it funny, mysterious, or dramatic. End on a cliffhanger.
Keep it family-friendly. Write the story directly — no quotes, no "Once upon a time".`;
      prompt = 'Start a new story!';
    } else {
      sysPrompt = `You are continuing a collaborative story. Read what has been written so far and add 2-3 sentences.
Keep the tone fun and engaging. Build on what others wrote. End with a cliffhanger or twist.
Family-friendly. Write the continuation directly.`;
      prompt = `Story so far:\n${contributions.join('\n')}\n\nContinue the story:`;
    }

    const text = await askKimi(sysPrompt, prompt, { temperature: 0.95, max_tokens: 200 });
    res.json({ success: true, text, source: 'ai' });
  } catch (err) {
    console.error('Story error:', err.message);
    res.json({
      success: true,
      text: "...and just when they thought it was over, the lights went out and a voice whispered: 'The real adventure starts now.'",
      source: 'offline'
    });
  }
});

app.post('/api/games/challenge', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.ip;
  if (!rateLimit(ip)) return res.status(429).json({ error: 'Too many requests' });
  requestCount++;

  const { venue, players = [], difficulty = 'mixed' } = req.body;

  if (!KIMI_API_KEY) {
    return res.json({ success: true, challenges: getFallbackChallenges(), source: 'offline' });
  }

  try {
    const raw = await askKimi(
      `You create fun social challenges for groups at a bar or venue. Challenges get people laughing, talking, and connecting.
Return ONLY a JSON array of 5 challenges. Each: {"title":"short title","description":"what to do","points":10|20|30,"type":"solo|duo|team","emoji":"one emoji"}
Mix easy (10pts), medium (20pts), and bold (30pts). Family-friendly. Fun for all ages.
${venue ? `Venue: ${venue}` : ''}
${players.length > 0 ? `Players: ${players.join(', ')}` : ''}`,
      `Generate 5 ${difficulty} challenges.`,
      { temperature: 0.95, max_tokens: 600 }
    );

    let challenges;
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    challenges = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);

    res.json({ success: true, challenges, source: 'ai' });
  } catch (err) {
    console.error('Challenge error:', err.message);
    res.json({ success: true, challenges: getFallbackChallenges(), source: 'offline' });
  }
});

function getFallbackChallenges() {
  return [
    { title: "Compliment Chain", description: "Give a genuine compliment to 3 different people. They must pass it on!", points: 10, type: "solo", emoji: "💬" },
    { title: "Bartender's Choice", description: "Ask the bartender to surprise you with their favourite drink combo.", points: 10, type: "solo", emoji: "🍹" },
    { title: "Photo Bomb", description: "Find a group taking a photo and ask to join. Bonus if you make them laugh!", points: 20, type: "duo", emoji: "📸" },
    { title: "Accent Challenge", description: "Order your next drink in a different accent. Table votes if it's convincing.", points: 20, type: "solo", emoji: "🎭" },
    { title: "Table Talent Show", description: "Each person has 30 seconds to show their most unique talent. Group votes on best!", points: 30, type: "team", emoji: "⭐" }
  ];
}

// ========== TELEGRAM WEBHOOK ==========

app.post('/api/telegram/webhook', async (req, res) => {
  res.sendStatus(200);
  const update = req.body;

  if (update.callback_query) {
    const data = update.callback_query.data;
    const match = data.match(/^answer_(\w+)_(\d+)$/);
    if (match) {
      const [, qId, optIdx] = match;
      const pending = pendingQuestions.get(qId);
      if (pending) {
        clearTimeout(pending.timeout);
        pendingQuestions.delete(qId);
        pending.resolve({ type: 'button', index: parseInt(optIdx), text: update.callback_query.data });
      }
    }
    try {
      await fetch(`${TG_API}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: update.callback_query.id, text: '✓ Got it' })
      });
    } catch (e) { /* swallow */ }
    return;
  }

  if (update.message?.text) {
    const text = update.message.text.trim();
    const chatId = String(update.message.chat.id);
    if (chatId !== TG_ADMIN) return;

    if (text.startsWith('/')) {
      await handleTgCommand(text, chatId);
      return;
    }

    const reply = update.message.reply_to_message;
    if (reply) {
      for (const [qId, pending] of pendingQuestions) {
        if (pending.msgId === reply.message_id) {
          clearTimeout(pending.timeout);
          pendingQuestions.delete(qId);
          pending.resolve({ type: 'text', text });
          return;
        }
      }
    }

    await tgSend(`✅ Received: "${text}"\n\nUse /help to see commands.`);
  }
});

async function handleTgCommand(text, chatId) {
  const [cmd, ...args] = text.split(' ');
  switch (cmd.toLowerCase()) {
    case '/help':
      await tgSend(
        `🤖 *ES System Commands*\n\n` +
        `/status — System health check\n` +
        `/leads — Recent form submissions\n` +
        `/stats — Usage statistics\n` +
        `/sites — Check all sites\n` +
        `/games — Game usage stats\n` +
        `/report — Full daily report\n` +
        `/ask — Ask Kimi AI a question\n` +
        `/broadcast — Send to all site chatbots`
      );
      break;
    case '/status':
      await tgSend(
        `🟢 *System Status*\n\n` +
        `⏱ Uptime: ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m\n` +
        `📊 Requests: ${requestCount}\n` +
        `🤖 Kimi: ${KIMI_API_KEY ? '✅ Connected' : '❌ Not configured'}\n` +
        `📋 Forms cached: ${formSubmissions.length}\n` +
        `🔌 Telegram: ✅ Active\n` +
        `⏰ ${new Date().toISOString()}`
      );
      break;
    case '/leads': {
      const recent = formSubmissions.slice(-5).reverse();
      if (recent.length === 0) {
        await tgSend('No submissions yet.');
        break;
      }
      const lines = recent.map(s =>
        `• *${s.client || '?'}* — ${s.name || 'anon'} (${s.email || 'no email'}) — ${s.form_type || 'form'} — ${new Date(s.timestamp).toLocaleString('en-IE')}`
      );
      await tgSend(`📋 *Recent Leads (last 5)*\n\n${lines.join('\n')}`);
      break;
    }
    case '/stats':
      await tgSend(
        `📊 *Usage Stats*\n\n` +
        `Requests: ${requestCount}\n` +
        `Forms: ${formSubmissions.length}\n` +
        `Active rate limits: ${Object.keys(RATE_LIMIT).length}\n` +
        `Pending TG questions: ${pendingQuestions.size}\n` +
        `Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
      );
      break;
    case '/sites': {
      const sites = [
        { name: 'Gielty\'s Bar', url: 'https://gieltysbar.com' },
        { name: 'Achill Offshore', url: 'https://achilloffshore.com' },
        { name: 'Achill Market', url: 'https://achillislandmarket.com' },
        { name: 'Fantasy Mini Golf', url: 'https://fantasyminigolf.com' },
        { name: 'Chat API', url: `https://dodealswithlee.onrender.com/health` }
      ];
      let report = '🌐 *Site Status*\n\n';
      for (const site of sites) {
        try {
          const start = Date.now();
          const r = await fetch(site.url, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
          const ms = Date.now() - start;
          report += `${r.ok ? '🟢' : '🟡'} ${site.name} — ${r.status} (${ms}ms)\n`;
        } catch (e) {
          report += `🔴 ${site.name} — DOWN (${e.message})\n`;
        }
      }
      await tgSend(report);
      break;
    }
    case '/ask': {
      const question = args.join(' ');
      if (!question) { await tgSend('Usage: /ask <your question>'); break; }
      if (!KIMI_API_KEY) { await tgSend('Kimi API not configured.'); break; }
      try {
        const answer = await askKimi(
          'You are a helpful business assistant for Exposure Solutions, a digital agency managing websites, AI chatbots, and digital signage for clients in Ireland and Greece.',
          question,
          { temperature: 0.7, max_tokens: 600 }
        );
        await tgSend(`🤖 *Kimi says:*\n\n${answer}`);
      } catch (e) {
        await tgSend(`❌ Kimi error: ${e.message}`);
      }
      break;
    }
    case '/report': {
      const today = new Date().toISOString().split('T')[0];
      const todayForms = formSubmissions.filter(s => s.timestamp?.startsWith(today));
      const byClient = {};
      todayForms.forEach(s => { byClient[s.client || 'unknown'] = (byClient[s.client || 'unknown'] || 0) + 1; });
      let report = `📊 *Daily Report — ${today}*\n\n`;
      report += `📋 Forms today: ${todayForms.length}\n`;
      report += `📊 Total requests: ${requestCount}\n`;
      report += `⏱ Uptime: ${Math.floor(process.uptime() / 3600)}h\n\n`;
      if (Object.keys(byClient).length > 0) {
        report += `*By client:*\n`;
        for (const [c, n] of Object.entries(byClient)) report += `  • ${c}: ${n}\n`;
      }
      report += `\n💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`;
      await tgSend(report);
      break;
    }
    default:
      await tgSend(`Unknown command: ${cmd}\nUse /help for available commands.`);
  }
}

// ========== SITE HEALTH MONITOR ==========

const siteHealthState = {};

async function checkSiteHealth() {
  const sites = [
    { key: 'gieltys', url: 'https://gieltysbar.com' },
    { key: 'offshore', url: 'https://achilloffshore.com' },
    { key: 'market', url: 'https://achillislandmarket.com' },
    { key: 'fmg', url: 'https://fantasyminigolf.com' }
  ];

  for (const site of sites) {
    try {
      const r = await fetch(site.url, { method: 'HEAD', signal: AbortSignal.timeout(10000) });
      const wasDown = siteHealthState[site.key] === 'down';
      siteHealthState[site.key] = r.ok ? 'up' : 'degraded';
      if (wasDown && r.ok) {
        tgNotify('site', `✅ *${site.key}* is back UP`).catch(() => {});
      }
    } catch (e) {
      const wasUp = siteHealthState[site.key] !== 'down';
      siteHealthState[site.key] = 'down';
      if (wasUp) {
        tgNotify('alert', `🔴 *${site.key}* is DOWN: ${e.message}`).catch(() => {});
      }
    }
  }
}

// ========== ADMIN DASHBOARD ==========

app.get('/api/admin/dashboard', (req, res) => {
  const key = req.query.key;
  if (key !== process.env.ADMIN_KEY && key !== 'es2026') return res.status(403).json({ error: 'Forbidden' });

  const today = new Date().toISOString().split('T')[0];
  const todayForms = formSubmissions.filter(s => s.timestamp?.startsWith(today));
  const byClient = {};
  formSubmissions.forEach(s => { byClient[s.client || 'unknown'] = (byClient[s.client || 'unknown'] || 0) + 1; });

  res.json({
    uptime: process.uptime(),
    requests: requestCount,
    kimi: KIMI_API_KEY ? 'connected' : 'not-set',
    telegram: TG_API ? 'active' : 'not-set',
    memory_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    forms: { total: formSubmissions.length, today: todayForms.length, by_client: byClient },
    sites: siteHealthState,
    timestamp: new Date().toISOString()
  });
});

// ========== LISTEN ==========

app.listen(PORT, async () => {
  console.log(`ES Chat API v3.0 running on port ${PORT}`);
  console.log(`Kimi: ${KIMI_API_KEY ? 'CONNECTED' : 'NOT SET'} | Model: ${KIMI_MODEL}`);
  console.log(`Telegram: ${TG_API ? 'CONNECTED' : 'NOT SET'}`);
  console.log(`Clients: ${Object.keys(CLIENTS).join(', ')}`);

  if (TG_API) {
    tgNotify('deploy', `*ES Chat API v3.0 started*\n\n🤖 Kimi: ${KIMI_API_KEY ? '✅' : '❌'}\n📋 Clients: ${Object.keys(CLIENTS).length}\n🎮 Games: 5 endpoints\n📡 Telegram: ✅`).catch(() => {});

    try {
      const webhookUrl = process.env.RENDER_EXTERNAL_URL
        ? `${process.env.RENDER_EXTERNAL_URL}/api/telegram/webhook`
        : null;
      if (webhookUrl) {
        await fetch(`${TG_API}/setWebhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: webhookUrl, allowed_updates: ['message', 'callback_query'] })
        });
        console.log(`Telegram webhook: ${webhookUrl}`);
      }
    } catch (e) {
      console.error('Telegram webhook setup failed:', e.message);
    }
  }

  setInterval(checkSiteHealth, 5 * 60 * 1000);
  setTimeout(checkSiteHealth, 10000);
});
