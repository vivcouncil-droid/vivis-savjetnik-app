// ─────────────────────────────────────────
// HELPMEDECIDE — Secure API Proxy
// ask.js — Quick Analysis endpoint
// ─────────────────────────────────────────

const rateMap = new Map();

function checkRate(ip) {
  const now = Date.now();
  const WINDOW = 60 * 60 * 1000;
  const MAX = 20;
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

const ALLOWED_ORIGINS = [
  'https://helpmedecide.to',
  'https://www.helpmedecide.to',
  'https://vivis-savjetnik-app.vercel.app',
];

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

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

  const { prompt, maxTokens } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  if (isInjection(prompt)) {
    return res.status(400).json({ error: 'Invalid input detected.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: Math.min(parseInt(maxTokens) || 1000, 2000),
        messages: [{ role: 'user', content: prompt.slice(0, 8000) }],
      }),
    });
    const data = await response.json();
    if (!response.ok || data.type === 'error') {
      return res.status(500).json({ error: data?.error?.message || 'API greška' });
    }
    const text = data.content?.find((b) => b.type === 'text')?.text;
    return res.status(200).json({ text });
  } catch (error) {
    return res.status(500).json({ error: 'Service temporarily unavailable' });
  }
}
