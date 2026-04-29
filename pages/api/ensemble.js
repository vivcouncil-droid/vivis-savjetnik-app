// ─────────────────────────────────────────
// HELPMEDECIDE — Secure API Proxy
// ensemble.js — Deep Analysis endpoint
// ─────────────────────────────────────────

export const config = { maxDuration: 60 };

const rateMap = new Map();

function checkRate(ip) {
  const now = Date.now();
  const WINDOW = 60 * 60 * 1000;
  const MAX = 5; // Deep analysis is expensive — 5/hr
  const entry = rateMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW) { entry.count = 0; entry.start = now; }
  entry.count++;
  rateMap.set(ip, entry);
  if (rateMap.size > 2000) {
    for (const [key, val] of rateMap) {
      if (now - val.start > WINDOW) rateMap.delete(key);
    }
  }
  return entry.count <= MAX;
}

const INJECTION_PATTERNS = [
  /ignore\s+(previous|prior|above|all)\s+instructions?/i,
  /forget\s+(everything|all|your|previous)/i,
  /you\s+are\s+now\s+(a|an)\s+/i,
  /act\s+as\s+(if\s+you\s+are|a|an)\s+/i,
  /pretend\s+(you|to)\s+/i,
  /jailbreak/i,
  /DAN\s+mode/i,
  /do\s+anything\s+now/i,
  /disregard\s+(your|all|previous)/i,
  /override\s+(your|the|all)\s+(instructions?|rules?|system)/i,
  /system\s*prompt/i,
  /bypass\s+(safety|filter|restriction|guideline)/i,
  /new\s+persona/i,
  /from\s+now\s+on\s+(you|act|behave)/i,
  /<script/i,
  /javascript:/i,
];

function isInjection(text) {
  if (!text || typeof text !== 'string') return false;
  return INJECTION_PATTERNS.some(p => p.test(text));
}

function scanContext(context) {
  if (!context || typeof context !== 'object') return true;
  return isInjection(context.userProfile || '') ||
    isInjection(context.deadline || '') ||
    (context.coreValues || []).some(v => isInjection(v));
}

const ALLOWED_ORIGINS = [
  'https://helpmedecide.to',
  'https://www.helpmedecide.to',
  'https://vivis-savjetnik-app.vercel.app',
];

async function claudeCall(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const d = await res.json();
  if (!res.ok || d.type === 'error') throw new Error(d.error?.message || 'API greška');
  return d.content?.find((b) => b.type === 'text')?.text || '';
}

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  const origin = req.headers.origin || '';
  const isLocalDev = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const isAllowed = isLocalDev || ALLOWED_ORIGINS.includes(origin);

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isAllowed) return res.status(403).json({ error: 'Forbidden' });

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress || 'unknown';
  if (!checkRate(ip)) {
    res.setHeader('Retry-After', '3600');
    return res.status(429).json({ error: 'Too many requests. Try again in an hour.' });
  }

  const { context, questions, answers, lang } = req.body || {};

  if (!context || !answers || typeof answers !== 'string') {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  if (scanContext(context) || isInjection(answers) || isInjection(JSON.stringify(questions || {}))) {
    return res.status(400).json({ error: 'Invalid input detected.' });
  }

  const isHr = lang === 'hr';
  const safeContext = {
    userProfile: (context.userProfile || '').slice(0, 3000),
    deadline: (context.deadline || '').slice(0, 100),
    coreValues: (context.coreValues || []).slice(0, 10).map(v => String(v).slice(0, 50)),
  };
  const safeAnswers = answers.slice(0, 3000);
  const safeQuestions = JSON.stringify(questions || {}).slice(0, 1000);

  const base = isHr
    ? `KONTEKST: ${safeContext.userProfile}\nROK: ${safeContext.deadline || '-'}\nPRIORITETI: ${safeContext.coreValues.join(', ') || '-'}\nPITANJA: ${safeQuestions}\nODGOVORI: ${safeAnswers}`
    : `CONTEXT: ${safeContext.userProfile}\nDEADLINE: ${safeContext.deadline || '-'}\nPRIORITIES: ${safeContext.coreValues.join(', ') || '-'}\nQUESTIONS: ${safeQuestions}\nANSWERS: ${safeAnswers}`;

  const promptA = isHr
    ? `Ti si Operativac i Provokator. Pišeš besprijekorno na hrvatskom.\n${base}\n\n### ⚡ Operativac — Tvoj sljedeći korak\n[200+ riječi, konkretni koraci, **bold**]\n\n### 🔥 Provokator — Testiranje stvarnosti\n[200+ riječi, dovodi u pitanje, **bold**]`
    : `You are the Executor and Provocateur. Write in fluent English.\n${base}\n\n### ⚡ Executor — Your next move\n[200+ words, concrete steps, **bold**]\n\n### 🔥 Provocateur — The reality check\n[200+ words, challenges assumptions, **bold**]`;

  const promptB = isHr
    ? `Ti si Autsajder i Vizionar. Pišeš besprijekorno na hrvatskom.\n${base}\n\n### 🌍 Autsajder — Pogled iz drugog kuta\n[200+ riječi, analogije, **bold**]\n\n### 🚀 Vizionar — Puni potencijal\n[200+ riječi, 10x razmišljanje, **bold**]`
    : `You are the Outsider and Visionary. Write in fluent English.\n${base}\n\n### 🌍 Outsider — The bird's-eye view\n[200+ words, cross-domain analogies, **bold**]\n\n### 🚀 Visionary — The 10x path\n[200+ words, exponential thinking, **bold**]`;

  const promptC = isHr
    ? `Ti si Filozof. Pišeš besprijekorno na hrvatskom.\n${base}\n\n### 🧠 Filozof — Tvoj pravi razlog\n[200+ riječi, fundamentalna istina, vrijednosti, **bold**]`
    : `You are the Philosopher. Write in fluent English.\n${base}\n\n### 🧠 Philosopher — The core truth\n[200+ words, fundamental truth, values alignment, **bold**]`;

  try {
    const [partA, partB, partC] = await Promise.all([
      claudeCall(promptA),
      claudeCall(promptB),
      claudeCall(promptC),
    ]);

    const summaryPrompt = isHr
      ? `Na temelju ovih analiza napiši besprijekorno na hrvatskom:\n## Strateška osnova\n[2 rečenice]\n## Konflikt Vijeća\n[1 paragraf — gdje se ne slažu]\n## ⚖️ Presuda\n[150 riječi — jedna jasna preporuka]\n## Akcijski Plan\n### Sljedeća 24 sata\n- [2 akcije]\n### Sljedećih 7 dana\n- [2 akcije]\n### Dugoročno\n- [2 akcije]\n\nAnalize:\n${partA}\n${partB}\n${partC}`
      : `Based on these analyses write in fluent English:\n## Strategic Foundation\n[2 sentences]\n## The Council's Conflict\n[1 paragraph]\n## ⚖️ Final Verdict\n[150 words]\n## Action Plan\n### Next 24 hours\n- [2 actions]\n### Next 7 days\n- [2 actions]\n### Long-term\n- [2 actions]\n\nAnalyses:\n${partA}\n${partB}\n${partC}`;

    const summary = await claudeCall(summaryPrompt);
    const blueprint = `# The Blueprint\n\n${summary}\n\n## ${isHr ? 'Perspektive Vijeća' : 'Council Perspectives'}\n\n${partA}\n\n${partB}\n\n${partC}`;

    return res.status(200).json({ blueprint });
  } catch (err) {
    return res.status(500).json({ error: 'Service temporarily unavailable' });
  }
}
