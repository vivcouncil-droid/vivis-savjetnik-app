export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { context, questions, answers, lang } = req.body;
  if (!context || !answers) return res.status(400).json({ error: "Nedostaju podaci" });

  const isHr = lang === "hr";

  const prompt = isHr ? `Ti si vijeće od 5 vrhunskih savjetnika koji zajedno analiziraju jednu važnu odluku. Pišeš isključivo na hrvatskom jeziku, besprijekorno i prirodno.

KONTEKST ODLUKE: ${context.userProfile}
ROK: ${context.deadline || "nije određen"}
PRIORITETI: ${context.coreValues?.join(", ") || "nisu navedeni"}
PITANJA VIJEĆA: ${JSON.stringify(questions)}
ODGOVORI KORISNIKA: ${answers}

Generiraj kompletan Blueprint dokument u Markdown formatu. Budi detaljan, konkretan i human.

# The Blueprint

## Strateška osnova
[3-4 rečenice. Kristalno jasan sažetak situacije, rokova i prioriteta korisnika.]

## Konflikt Vijeća
[2-3 paragrafa. Gdje se savjetnici NE slažu? Koji je temeljni trade-off koji korisnik mora razriješiti? Budi iskren, ne uljepšavaj.]

## Perspektive Vijeća

### ⚡ Operativac — Tvoj sljedeći korak
[400+ riječi. Konkretni numerirani koraci. Što napraviti SADA. Resursi, rokovi, akcija. Koristi **bold** za ključne pojmove.]

### 🔥 Provokator — Testiranje stvarnosti
[400+ riječi. Dovedi svaku pretpostavku u pitanje. Pronađi slijepe točke. Najgori scenariji. Budi oštar ali konstruktivan. Koristi **bold**.]

### 🌍 Autsajder — Pogled iz drugog kuta
[400+ riječi. Analogije iz biologije, arhitekture, sporta, vojne strategije. Svježa perspektiva izvana. Koristi **bold**.]

### 🚀 Vizionar — Puni potencijal
[400+ riječi. Razmišljaj 10x veće. Točke poluge, multiplikatorski efekti, dugoročne prilike. Što ako ova odluka otvori nešto eksponencijalno veće? Koristi **bold**.]

### 🧠 Filozof — Tvoj pravi razlog
[400+ riječi. Svuci pretpostavke. Što je fundamentalno istinito ovdje? Usklađenost s vrijednostima. Zašto iza odluke. Koristi **bold**.]

## ⚖️ Presuda
[300 riječi. Sinteza svih perspektiva. Jedna jasna preporuka. Mudar, human, definitivan ton.]

## Akcijski Plan

### Sljedeća 24 sata
- [3 konkretne akcije]

### Sljedećih 7 dana
- [3 konkretne akcije]

### Dugoročno (30-90 dana)
- [3 konkretne akcije]`

  : `You are a council of 5 elite advisors jointly analysing one important decision. Write exclusively in fluent, natural English.

DECISION CONTEXT: ${context.userProfile}
DEADLINE: ${context.deadline || "not specified"}
PRIORITIES: ${context.coreValues?.join(", ") || "not specified"}
COUNCIL QUESTIONS: ${JSON.stringify(questions)}
USER ANSWERS: ${answers}

Generate a complete Blueprint document in Markdown format. Be detailed, concrete, and human.

# The Blueprint

## Strategic Foundation
[3-4 sentences. Crystal clear summary of the situation, deadline and priorities.]

## The Council's Conflict
[2-3 paragraphs. Where do the advisors DISAGREE? What is the fundamental trade-off the user must resolve? Be honest, don't sugarcoat.]

## Council Perspectives

### ⚡ Executor — Your next move
[400+ words. Concrete numbered action steps. What to do NOW. Resources, timelines, action. Use **bold** for key concepts.]

### 🔥 Provocateur — The reality check
[400+ words. Challenge every assumption. Find blind spots. Worst-case scenarios. Be sharp but constructive. Use **bold**.]

### 🌍 Outsider — The bird's-eye view
[400+ words. Analogies from biology, architecture, sports, military strategy. Fresh external perspective. Use **bold**.]

### 🚀 Visionary — The 10x path
[400+ words. Think 10x bigger. Leverage points, multiplier effects, long-term opportunities. Use **bold**.]

### 🧠 Philosopher — The core truth
[400+ words. Strip away assumptions. What is fundamentally true here? Values alignment. The WHY. Use **bold**.]

## ⚖️ Final Verdict
[300 words. Synthesis of all perspectives. One clear recommendation. Wise, human, definitive tone.]

## Action Plan

### Next 24 hours
- [3 concrete actions]

### Next 7 days
- [3 concrete actions]

### Long-term (30-90 days)
- [3 concrete actions]`;

  try {
    const res2 = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 6000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res2.json();
    if (!res2.ok || data.type === "error") {
      return res.status(500).json({ error: data?.error?.message || "API greška" });
    }
    const blueprint = data.content?.find((b) => b.type === "text")?.text;
    if (!blueprint) return res.status(500).json({ error: "Prazan odgovor" });

    return res.status(200).json({ blueprint });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
