async function callClaude(context, questions, answers, lang) {
  const isHr = lang === "hr";
  const prompt = isHr ? `Ti si dva vrhunska savjetnika: Filozof i Autsajder. Pišeš isključivo na hrvatskom jeziku, besprijekorno i prirodno.

Kontekst odluke: ${context.userProfile}
Rok: ${context.deadline}
Prioriteti: ${context.coreValues?.join(", ")}
Pitanja koja su postavljena: ${JSON.stringify(questions)}
Korisnikovi odgovori: ${answers}

Napiši duboku, nijansiranu analizu iz dviju perspektiva. Koristi **podebljano** za ključne pojmove.

### 🧠 Filozof — Tvoj pravi razlog
[400+ riječi. Svuci sve pretpostavke. Što je ovdje fundamentalno istinito? Sokratska dubina. Usklađenost s vrijednostima. Zašto iza odluke.]

### 🌍 Autsajder — Pogled iz drugog kuta
[400+ riječi. Analogije iz biologije, arhitekture, sporta, vojne strategije. Što bi netko iz potpuno drugog područja vidio ovdje?]

Ton: Mudar, human, precizan. Piši kao da razgovaraš s prijateljem koji traži iskrean savjet.`
  : `You are two expert advisors: The Philosopher and The Outsider.

Decision context: ${context.userProfile}
Deadline: ${context.deadline}
Core values: ${context.coreValues?.join(", ")}
Questions asked: ${JSON.stringify(questions)}
User's answers: ${answers}

Generate deep, nuanced analysis from two perspectives. Use **bold** for key concepts.

### 🧠 Philosopher — The core truth
[400+ words. Strip away assumptions. What is fundamentally true here? Socratic depth. Values alignment. The WHY behind the decision.]

### 🌍 Outsider — The bird's-eye view
[400+ words. Cross-domain analogies from biology, architecture, sports, military strategy. What would someone from a completely different field see here?]

Tone: Wise, empathetic, precise.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 2000, messages: [{ role: "user", content: prompt }] }),
  });
  const d = await res.json();
  if (!res.ok || d.type === "error") throw new Error("Claude: " + (d.error?.message || res.status));
  return d.content?.find(b => b.type === "text")?.text || "";
}

async function callOpenAI(context, questions, answers, lang) {
  const isHr = lang === "hr";
  const prompt = isHr ? `Ti si dva vrhunska savjetnika: Operativac i Provokator. Pišeš isključivo na hrvatskom jeziku, besprijekorno i prirodno.

Kontekst odluke: ${context.userProfile}
Rok: ${context.deadline}
Prioriteti: ${context.coreValues?.join(", ")}
Pitanja koja su postavljena: ${JSON.stringify(questions)}
Korisnikovi odgovori: ${answers}

Napiši oštru, logičku analizu iz dviju perspektiva. Koristi **podebljano** za ključne pojmove.

### ⚡ Operativac — Tvoj sljedeći korak
[400+ riječi. Konkretni numerirani koraci akcije. Što napraviti SADA. Potrebni resursi. Rokovi. Bez praznih priča.]

### 🔥 Provokator — Testiranje stvarnosti
[400+ riječi. Dovedi svaku pretpostavku u pitanje. Pronađi slijepe točke. Najgori scenariji. Đavlov advokat u najostrijoj formi.]

Ton: Direktan, analitičan, izazovan. Ne uljepšavaj — reci istinu kako jest.`
  : `You are two expert advisors: The Executor and The Provocateur.

Decision context: ${context.userProfile}
Deadline: ${context.deadline}
Core values: ${context.coreValues?.join(", ")}
Questions asked: ${JSON.stringify(questions)}
User's answers: ${answers}

Generate sharp, logical analysis from two perspectives. Use **bold** for key concepts.

### ⚡ Executor — Your next move
[400+ words. Concrete numbered action steps. What to do NOW. Resources needed. Timeline. Zero fluff.]

### 🔥 Provocateur — The reality check
[400+ words. Challenge every assumption. Find blind spots. Worst case scenarios. Devil's advocate at its sharpest.]

Tone: Direct, analytical, challenging.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: "gpt-4o", max_tokens: 2000, messages: [{ role: "user", content: prompt }] }),
  });
  const d = await res.json();
  if (!res.ok || d.error) throw new Error("GPT-4o: " + (d.error?.message || res.status));
  return d.choices?.[0]?.message?.content || "";
}

async function callGemini(context, questions, answers, lang) {
  const isHr = lang === "hr";
  const prompt = isHr ? `Ti si vrhunski savjetnik Vizionar. Pišeš isključivo na hrvatskom jeziku, besprijekorno i prirodno.

Kontekst odluke: ${context.userProfile}
Rok: ${context.deadline}
Prioriteti: ${context.coreValues?.join(", ")}
Pitanja koja su postavljena: ${JSON.stringify(questions)}
Korisnikovi odgovori: ${answers}

Napiši ekspanzivnu vizionarsku analizu. Koristi **podebljano** za ključne pojmove.

### 🚀 Vizionar — Puni potencijal
[500+ riječi. Razmišljaj 10x veće. Što ako ova odluka otvori nešto eksponencijalno veće? Identificiraj točke poluge, susjedne prilike, multiplikatorske efekte. Kako izgleda najbolja moguća verzija ove odluke za 5 godina?]

Ton: Ekspanzivan, optimističan, strateški. Inspiriraj korisnika da vidi više nego što misli da je moguće.`
  : `You are The Visionary advisor.

Decision context: ${context.userProfile}
Deadline: ${context.deadline}
Core values: ${context.coreValues?.join(", ")}
Questions asked: ${JSON.stringify(questions)}
User's answers: ${answers}

Generate expansive visionary analysis. Use **bold** for key concepts.

### 🚀 Visionary — The 10x path
[500+ words. Think 10x bigger. What if this decision unlocked something exponentially larger? Identify leverage points, adjacent opportunities, multiplier effects. What does the best possible version of this decision look like in 5 years?]

Tone: Expansive, optimistic, strategic.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 2000, messages: [{ role: "user", content: prompt }] }),
  });
  const d = await res.json();
  if (!res.ok || d.type === "error") throw new Error("Vizionar (Claude): " + (d.error?.message || res.status));
  return d.content?.find(b => b.type === "text")?.text || "";
}

async function callClaudeSynthesis(claudePerspectives, openaiPerspectives, geminiPerspective, context, lang) {
  const isHr = lang === "hr";
  const prompt = `You are the Master Synthesizer. Three of the world's most advanced AI systems have analyzed a decision from different angles. Your task is to synthesize their perspectives into a single, cohesive, premium strategic Blueprint document.

THE DECISION: ${context.userProfile}
DEADLINE: ${context.deadline}
CORE VALUES: ${context.coreValues?.join(", ")}

=== CLAUDE 3.5 SONNET PERSPECTIVES (Empathy, Ethics, Nuance) ===
${claudePerspectives}

=== GPT-4o PERSPECTIVES (Logic, Risk Analysis, Concrete Steps) ===
${openaiPerspectives}

=== GEMINI 1.5 PRO PERSPECTIVE (Visionary Growth) ===
${geminiPerspective}

Now synthesize everything into this exact Markdown structure:

# The Blueprint

## ${isHr ? "Strateška osnova" : "Strategic Foundation"}
${isHr ? "[3-4 rečenice. Kristalno jasan sažetak situacije, rokova i prioriteta.]" : "[3-4 sentences. Crystal clear summary of the situation, deadline, and priorities.]"}

## ${isHr ? "Konflikt Vijeća" : "The Council's Conflict"}
${isHr ? "[2-3 paragrafa. Gdje se AI modeli NE slažu? Koji je temeljni trade-off koji korisnik mora razriješiti? Ovo je najvrednije poglavlje — iskreno i bez uljepšavanja.]" : "[2-3 paragraphs. Where do the AI models DISAGREE? What is the fundamental trade-off the user must resolve? This is the most valuable section — honest, not sugarcoated.]"}

## ${isHr ? "Duboke Perspektive" : "Deep Perspectives"}

### ⚡ ${isHr ? "Operativac" : "Executor"} — ${isHr ? "Tvoj sljedeći korak" : "Your next move"}
[Insert Executor perspective from GPT-4o verbatim, cleaned up]

### 🔥 ${isHr ? "Provokator" : "Provocateur"} — ${isHr ? "Testiranje stvarnosti" : "The reality check"}
[Insert Provocateur perspective from GPT-4o verbatim, cleaned up]

### 🌍 ${isHr ? "Autsajder" : "Outsider"} — ${isHr ? "Pogled iz drugog kuta" : "The bird's-eye view"}
[Insert Outsider perspective from Claude verbatim, cleaned up]

### 🚀 ${isHr ? "Vizionar" : "Visionary"} — ${isHr ? "Puni potencijal" : "The 10x path"}
[Insert Visionary perspective from Gemini verbatim, cleaned up]

### 🧠 ${isHr ? "Filozof" : "Philosopher"} — ${isHr ? "Tvoj pravi razlog" : "The core truth"}
[Insert Philosopher perspective from Claude verbatim, cleaned up]

## ⚖️ ${isHr ? "Presuda" : "Final Verdict"}
${isHr ? "[300 riječi. Sinteza svih perspektiva. Jedna jasna preporuka. Mudar, human, definitivan ton.]" : "[300 words. Synthesis of all perspectives. One clear recommendation. Wise, human, definitive tone.]"}

## ${isHr ? "Akcijski Plan" : "Action Plan"}

### ${isHr ? "Sljedeća 24 sata" : "Next 24 hours"}
- [3 concrete, specific actions]

### ${isHr ? "Sljedećih 7 dana" : "Next 7 days"}
- [3 concrete, specific actions]

### ${isHr ? "Dugoročno (30-90 dana)" : "Long-term (30-90 days)"}
- [3 concrete, specific actions]

${isHr ? "Piši ISKLJUČIVO na hrvatskom jeziku, besprijekorno i prirodno. Ton: Premium konzultantski izvještaj. Autoritativan, smiren, precizan." : "Language: English. Tone: Premium consulting report. Authoritative, calm, precise."}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 6000, messages: [{ role: "user", content: prompt }] }),
  });
  const d = await res.json();
  if (!res.ok || d.type === "error") throw new Error("Claude Synthesis: " + (d.error?.message || res.status));
  return d.content?.find(b => b.type === "text")?.text || "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { context, questions, answers, lang } = req.body;
  if (!context || !answers) return res.status(400).json({ error: "Nedostaju podaci" });

  try {
    const [claudeResp, openaiResp, geminiResp] = await Promise.all([
      callClaude(context, questions, answers, lang),
      callOpenAI(context, questions, answers, lang),
      callGemini(context, questions, answers, lang),
    ]);

    const blueprint = await callClaudeSynthesis(claudeResp, openaiResp, geminiResp, context, lang);

    return res.status(200).json({
      blueprint,
      models: {
        claude: claudeResp,
        openai: openaiResp,
        gemini: geminiResp,
      },
    });
  } catch (err) {
    console.error("Ensemble error:", err);
    return res.status(500).json({ error: err.message });
  }
}
