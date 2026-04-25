export const config = { maxDuration: 60 };

async function claudeCall(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const d = await res.json();
  if (!res.ok || d.type === "error") throw new Error(d.error?.message || "API greška");
  return d.content?.find((b) => b.type === "text")?.text || "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { context, questions, answers, lang } = req.body;
  if (!context || !answers) return res.status(400).json({ error: "Nedostaju podaci" });

  const isHr = lang === "hr";
  const base = `${isHr ? "KONTEKST" : "CONTEXT"}: ${context.userProfile}\n${isHr ? "ROK" : "DEADLINE"}: ${context.deadline || "-"}\n${isHr ? "PRIORITETI" : "PRIORITIES"}: ${context.coreValues?.join(", ") || "-"}\n${isHr ? "PITANJA" : "QUESTIONS"}: ${JSON.stringify(questions)}\n${isHr ? "ODGOVORI" : "ANSWERS"}: ${answers}`;

  const promptA = isHr
    ? `Ti si Operativac i Provokator. Pišeš besprijekorno na hrvatskom.\n${base}\n\n### ⚡ Operativac — Tvoj sljedeći korak\n[200+ riječi, konkretni koraci, **bold**]\n\n### 🔥 Provokator — Testiranje stvarnosti\n[200+ riječi, dovodi u pitanje, **bold**]`
    : `You are the Executor and Provocateur. Write in fluent English.\n${base}\n\n### ⚡ Executor — Your next move\n[200+ words, concrete steps, **bold**]\n\n### 🔥 Provocateur — The reality check\n[200+ words, challenges assumptions, **bold**]`;

  const promptB = isHr
    ? `Ti si Autsajder i Vizionar. Pišeš besprijekorno na hrvatskom.\n${base}\n\n### 🌍 Autsajder — Pogled iz drugog kuta\n[200+ riječi, analogije iz različitih područja, **bold**]\n\n### 🚀 Vizionar — Puni potencijal\n[200+ riječi, 10x razmišljanje, **bold**]`
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
      ? `Na temelju ovih analiza napiši:\n1. ## Strateška osnova (2 rečenice)\n2. ## Konflikt Vijeća (1 paragraf — gdje se savjetnici ne slažu)\n3. ## ⚖️ Presuda (150 riječi — jedna jasna preporuka)\n4. ## Akcijski Plan\n### Sljedeća 24 sata\n- [2 akcije]\n### Sljedećih 7 dana\n- [2 akcije]\n### Dugoročno\n- [2 akcije]\n\nAnalize:\n${partA}\n${partB}\n${partC}\n\nPišeš besprijekorno na hrvatskom.`
      : `Based on these analyses write:\n1. ## Strategic Foundation (2 sentences)\n2. ## The Council's Conflict (1 paragraph — where advisors disagree)\n3. ## ⚖️ Final Verdict (150 words — one clear recommendation)\n4. ## Action Plan\n### Next 24 hours\n- [2 actions]\n### Next 7 days\n- [2 actions]\n### Long-term\n- [2 actions]\n\nAnalyses:\n${partA}\n${partB}\n${partC}`;

    const summary = await claudeCall(summaryPrompt);

    const blueprint = `# The Blueprint\n\n${summary}\n\n## Perspektive Vijeća\n\n${partA}\n\n${partB}\n\n${partC}`;

    return res.status(200).json({ blueprint });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
