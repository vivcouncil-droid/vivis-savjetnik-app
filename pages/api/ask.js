export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { prompt, maxTokens = 2000 } = req.body;
  if (!prompt) return res.status(400).json({ error: "Nedostaje prompt" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok || data.type === "error") {
      return res.status(500).json({ error: data?.error?.message || "API greška" });
    }

    const text = data.content?.find((b) => b.type === "text")?.text;
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
