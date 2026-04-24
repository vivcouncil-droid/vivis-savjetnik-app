import { useState } from "react";
import Head from "next/head";

const ACCENT = "#BF5AF2";
const ACCENT_DARK = "#9B3DC8";

const ADVISORS = [
  { id: "a1", name: "Akcionar",   sub: "Što napraviti odmah",     emoji: "⚡", color: "#BF5AF2" },
  { id: "a2", name: "Provokator", sub: "Što može poći krivo",     emoji: "🔥", color: "#FF375F" },
  { id: "a3", name: "Autsajder",  sub: "Pogled izvana",           emoji: "🌍", color: "#30B0C7" },
  { id: "a4", name: "Vizionar",   sub: "Razmišljaj 10x veće",     emoji: "🚀", color: "#34C759" },
  { id: "a5", name: "Filozof",    sub: "Što je zapravo istinito", emoji: "🧠", color: "#FF9F0A" },
];

const SYSTEM_PROMPT = `Ti si 5 savjetnika koji zajedno odgovaraju na pitanje korisnika. Svaki ima drugačiji pristup:

- akcionar: Brutalno praktičan. Konkretni numerirani koraci. Akcija SADA. Koristi **bold**.
- provokator: Dovodi sve u pitanje. Traži slabosti. Đavlov advokat. Koristi **bold**.
- autsajder: Perspektive iz biologije, sporta, arhitekture. Svježi pogled. Koristi **bold**.
- vizionar: Prilike za rast. Razmišlja 10x veće. Točke poluge. Koristi **bold**.
- filozof: Gradi od temelja. Što je fundamentalno istinito. Sokratski. Koristi **bold**.

VAŽNO: Vrati ISKLJUČIVO validan JSON, bez ikakvog teksta prije ili poslije, bez markdown blokova:
{"akcionar":"odgovor ovdje","provokator":"odgovor ovdje","autsajder":"odgovor ovdje","vizionar":"odgovor ovdje","filozof":"odgovor ovdje"}

Svaki odgovor max 120 riječi. Odgovaraj na jeziku korisnika.`;

const VERDICT_PROMPT = (summary) =>
  `Na temelju ovih 5 perspektiva napiši kratak Final Verdict.\n\nStruktura:\n**Gdje se slažu:** (1-2 rečenice)\n**Ključni trade-off:** (1-2 rečenice)\n**Preporuka:** (1-2 konkretne akcije)\n\nMax 120 riječi. Odgovaraj na jeziku savjetnika.\n\n${summary}`;

async function apiCall(prompt, maxTokens = 2000) {
  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, maxTokens }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || "Greška");
  return data.text;
}

function renderMd(text) {
  if (!text) return null;
  return text.split("\n").map((line, i) => {
    const isH = /^#+\s/.test(line);
    const html = line
      .replace(/^#+\s/, "")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
    return (
      <p key={i} style={{ margin: "0 0 5px", fontWeight: isH ? 600 : 400 }}
        dangerouslySetInnerHTML={{ __html: html }} />
    );
  });
}

export default function Home() {
  const [q, setQ] = useState("");
  const [resp, setResp] = useState({});
  const [loading, setLoading] = useState(false);
  const [sub, setSub] = useState(false);
  const [sel, setSel] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [verdictLoad, setVerdictLoad] = useState(false);

  const go = async () => {
    if (!q.trim() || loading) return;
    setSub(true); setResp({}); setSel(null); setVerdict(null); setLoading(true);
    try {
      const raw = await apiCall(SYSTEM_PROMPT + "\n\nPitanje: " + q);
      const clean = raw.replace(/```json|```/g, "").trim();
      const json = JSON.parse(clean);
      const newResp = {
        a1: json.akcionar || "Nema odgovora",
        a2: json.provokator || "Nema odgovora",
        a3: json.autsajder || "Nema odgovora",
        a4: json.vizionar || "Nema odgovora",
        a5: json.filozof || "Nema odgovora",
      };
      setResp(newResp);
      setVerdictLoad(true);
      const summary = ADVISORS.map((a) => `**${a.name}:** ${newResp[a.id]}`).join("\n\n");
      const v = await apiCall(VERDICT_PROMPT(summary), 600);
      setVerdict(v);
    } catch (e) {
      const err = "Greška: " + e.message;
      setResp({ a1: err, a2: err, a3: err, a4: err, a5: err });
    } finally {
      setLoading(false);
      setVerdictLoad(false);
    }
  };

  return (
    <>
      <Head>
        <title>Viv's Savjetnik</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: "100vh", background: "#F5F5F7", fontFamily: "Inter, sans-serif" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "56px 24px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 20, padding: "5px 14px", marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
              <span style={{ fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: "#86868B", fontWeight: 500 }}>Viv's · 5 Savjetnika</span>
            </div>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 600, color: "#1D1D1F", letterSpacing: -1.5, lineHeight: 1.05, margin: "0 0 12px" }}>
              Viv's<br />
              <span style={{ color: ACCENT }}>Savjetnik</span>
            </h1>
            <p style={{ fontSize: 17, color: "#86868B", margin: 0 }}>Svako pitanje. Pet perspektiva. Jedna istina.</p>
          </div>

          {/* Input */}
          <div style={{ maxWidth: 640, margin: "0 auto 48px" }}>
            <textarea
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Postavi svoje pitanje..."
              rows={3}
              style={{ width: "100%", boxSizing: "border-box", background: "#fff", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 12, padding: "16px 18px", fontSize: 15, fontFamily: "Inter, sans-serif", color: "#1D1D1F", resize: "vertical", outline: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", lineHeight: 1.6 }}
              onFocus={(e) => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = `0 0 0 3px ${ACCENT}22`; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(0,0,0,0.12)"; e.target.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
            />
            <button
              onClick={go}
              disabled={!q.trim() || loading}
              style={{ marginTop: 10, width: "100%", background: q.trim() && !loading ? ACCENT : "#E5E5EA", color: q.trim() && !loading ? "#fff" : "#C5C5C7", border: "none", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 600, cursor: q.trim() && !loading ? "pointer" : "not-allowed", transition: "background 0.2s", fontFamily: "Inter, sans-serif" }}
              onMouseEnter={(e) => { if (q.trim() && !loading) e.target.style.background = ACCENT_DARK; }}
              onMouseLeave={(e) => { if (q.trim() && !loading) e.target.style.background = ACCENT; }}
            >
              {loading ? "Savjetnici razmišljaju..." : "Sazovi Savjetnike"}
            </button>
          </div>

          {/* Cards */}
          {sub && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, marginBottom: 12 }}>
                {ADVISORS.map((advisor) => {
                  const r = resp[advisor.id], isAct = sel === advisor.id;
                  return (
                    <div key={advisor.id}
                      onClick={() => r && setSel(isAct ? null : advisor.id)}
                      style={{ background: "#fff", border: isAct ? `1px solid ${advisor.color}` : "0.5px solid rgba(0,0,0,0.1)", borderRadius: 14, padding: "16px 18px", cursor: r ? "pointer" : "default", transition: "all 0.2s", boxShadow: isAct ? `0 0 0 3px ${advisor.color}18` : "0 1px 4px rgba(0,0,0,0.06)", minHeight: 120, display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 18 }}>{advisor.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", color: advisor.color }}>{advisor.name}</div>
                          <div style={{ fontSize: 11, color: "#86868B", marginTop: 1 }}>{advisor.sub}</div>
                        </div>
                        {loading && !r && <div style={{ width: 7, height: 7, borderRadius: "50%", background: advisor.color, animation: "pulse 1s infinite", marginTop: 3 }} />}
                        {r && <span style={{ color: "#C5C5C7", fontSize: 10, marginTop: 2 }}>{isAct ? "▲" : "▼"}</span>}
                      </div>
                      <div style={{ flex: 1, fontSize: 13, lineHeight: 1.6, color: isAct ? "#1D1D1F" : "#6E6E73" }}>
                        {loading && !r && <span style={{ color: "#C5C5C7", fontStyle: "italic" }}>Analizira...</span>}
                        {r && !isAct && <div style={{ overflow: "hidden", maxHeight: 68 }}>{renderMd(r)}</div>}
                        {r && isAct && renderMd(r)}
                      </div>
                    </div>
                  );
                })}

                {/* Final Verdict */}
                <div style={{ background: "#fff", border: verdict ? `1px solid ${ACCENT}` : "0.5px solid rgba(0,0,0,0.1)", borderRadius: 14, padding: "16px 18px", boxShadow: verdict ? `0 0 0 3px ${ACCENT}12` : "0 1px 4px rgba(0,0,0,0.06)", minHeight: 120, display: "flex", flexDirection: "column", transition: "all 0.3s" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 18 }}>⚖️</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", color: ACCENT }}>Final Verdict</div>
                      <div style={{ fontSize: 11, color: "#86868B", marginTop: 1 }}>Sinteza svih perspektiva</div>
                    </div>
                    {verdictLoad && <div style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT, animation: "pulse 1s infinite", marginTop: 3 }} />}
                  </div>
                  <div style={{ flex: 1, fontSize: 13, lineHeight: 1.6, color: verdict ? "#1D1D1F" : "#C5C5C7", fontStyle: !verdict && !verdictLoad ? "italic" : "normal" }}>
                    {!verdictLoad && !verdict && "Čeka završetak analize..."}
                    {verdictLoad && <span style={{ color: "#86868B" }}>Vijeće se savjetuje...</span>}
                    {verdict && renderMd(verdict)}
                  </div>
                </div>
              </div>

              {Object.keys(resp).length > 0 && (
                <p style={{ textAlign: "center", fontSize: 11, color: "#C5C5C7", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 8 }}>
                  Klikni na savjetnika za puni odgovor
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F5F5F7; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(1.6)} }
        textarea::placeholder { color: #C5C5C7; }
      `}</style>
    </>
  );
}
