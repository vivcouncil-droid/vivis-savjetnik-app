import { useState, useEffect } from "react";
import Head from "next/head";

const ACCENT = "#C9A84C";
const ACCENT_DARK = "#B8973D";

const LANGS = {
  hr: {
    badge: "HelpMeDecide · AI",
    title1: "HelpMe",
    title2: "Decide",
    subtitle: "Za odluke koje te drže budnima noću.",
    placeholder: "Postavi svoje pitanje...",
    button: "Sazovi Savjetnike",
    buttonLoading: "Savjetnici razmišljaju...",
    analyzing: "Analizira...",
    waiting: "Čeka završetak analize...",
    thinking: "Vijeće se savjetuje...",
    footer: "Klikni na savjetnika za puni odgovor",
    subheader: "Ujedinjena inteligencija najnaprednijih svjetskih AI modela.",
    verdictName: "Presuda",
    verdictSub: "Put do jasnoće",
    toggleQuick: "Brza analiza",
    toggleDeep: "Dubinska analiza",
    deeperBtn: "Idemo dublje →",
    deeperSub: "Generiraj personalizirani Blueprint dokument",
    deeperTitle: "Želiš dublju analizu?",
    step1Title: "Za preciznu Presudu, Vijeću je potrebno više konteksta.",
    step1Placeholder: "Npr. Planiram lansirati novi projekt, ali nisam siguran u tajming... ili Razmišljam o otkazu jer želim više slobode...",
    step1Deadline: "Rok odluke",
    step1Label: "Opiši nam situaciju, projekt ili dilemu",
    step1Values: "Što ti je najvažnije?",
    step1Btn: "Vijeće, analizirajte →",
    step2Title: "Vijeće ima 3 pitanja za tebe.",
    step3Title: "Tvoj glas je ključan za finalnu Presudu.",
    step3Placeholder: "Odgovori Vijeću...",
    step3Btn: "Kristaliziraj Blueprint →",
    loading1: "Vijeće analizira tvoje odgovore...",
    loading2: "Kristaliziramo tvoj Blueprint...",
    loading3: "Finalna Presuda se formira...",
    blueprintReady: "Tvoj Blueprint je spreman.",
    savePdf: "Spremi kao PDF",
    sendEmail: "Pošalji na email",
    savedOk: "✓ Otvoreno!",
    deadlineOpts: ["Danas", "Ovaj tjedan", "Bez roka"],
    values: ["Obitelj", "Karijera", "Novac", "Sloboda", "Sigurnost", "Rast", "Projekt", "Ideja", "Ostalo"],
  },
  en: {
    badge: "HelpMeDecide · AI",
    title1: "HelpMe",
    title2: "Decide",
    subtitle: "For the decisions that keep you up at night.",
    placeholder: "Ask your question...",
    button: "Summon the Advisors",
    buttonLoading: "Advisors are thinking...",
    analyzing: "Analyzing...",
    waiting: "Waiting for analysis...",
    thinking: "The Council is deliberating...",
    footer: "Click on an advisor for the full answer",
    subheader: "Unified intelligence from the world's leading AI models.",
    verdictName: "Verdict",
    verdictSub: "The path to clarity",
    toggleQuick: "Quick analysis",
    toggleDeep: "Deep analysis",
    deeperBtn: "Go deeper →",
    deeperSub: "Generate your personalised Blueprint document",
    deeperTitle: "Want a deeper analysis?",
    step1Title: "For a precise Verdict, the Council needs more context.",
    step1Placeholder: "E.g. I'm planning to launch a new project but I'm unsure about the timing... or I'm thinking of quitting because I want more freedom...",
    step1Deadline: "Decision deadline",
    step1Label: "Describe the situation, project, or dilemma",
    step1Values: "What matters most to you?",
    step1Btn: "Council, analyse this →",
    step2Title: "The Council has 3 questions for you.",
    step3Title: "Your voice is essential to the final Verdict.",
    step3Placeholder: "Answer the Council...",
    step3Btn: "Crystallise Blueprint →",
    loading1: "The Council is analysing your answers...",
    loading2: "Crystallising your Blueprint...",
    loading3: "The final Verdict is taking shape...",
    blueprintReady: "Your Blueprint is ready.",
    savePdf: "Save as PDF",
    sendEmail: "Send to email",
    savedOk: "✓ Opened!",
    deadlineOpts: ["Today", "This week", "No deadline"],
    values: ["Family", "Career", "Money", "Freedom", "Security", "Growth", "Project", "Idea", "Other"],
  },
};

const ADVISORS = {
  hr: [
    { id: "a1", name: "Operativac", sub: "Tvoj sljedeći korak", emoji: "⚡", color: ACCENT, key: "operativac" },
    { id: "a2", name: "Provokator", sub: "Testiranje stvarnosti", emoji: "🔥", color: "#FF375F", key: "provokator" },
    { id: "a3", name: "Autsajder", sub: "Pogled iz drugog kuta", emoji: "🌍", color: "#30B0C7", key: "autsajder" },
    { id: "a4", name: "Vizionar", sub: "Puni potencijal", emoji: "🚀", color: "#34C759", key: "vizionar" },
    { id: "a5", name: "Filozof", sub: "Tvoj pravi razlog", emoji: "🧠", color: "#FF9F0A", key: "filozof" },
  ],
  en: [
    { id: "a1", name: "Executor", sub: "Your next move", emoji: "⚡", color: ACCENT, key: "operativac" },
    { id: "a2", name: "Provocateur", sub: "The reality check", emoji: "🔥", color: "#FF375F", key: "provokator" },
    { id: "a3", name: "Outsider", sub: "The bird's-eye view", emoji: "🌍", color: "#30B0C7", key: "autsajder" },
    { id: "a4", name: "Visionary", sub: "The 10x path", emoji: "🚀", color: "#34C759", key: "vizionar" },
    { id: "a5", name: "Philosopher", sub: "The core truth", emoji: "🧠", color: "#FF9F0A", key: "filozof" },
  ],
};

const SYSTEM_PROMPT = `Ti si 5 savjetnika koji zajedno odgovaraju na pitanje korisnika. Svaki ima drugačiji pristup:
- operativac: Brutalno praktičan. Konkretni numerirani koraci. Akcija SADA. Koristi **bold**.
- provokator: Dovodi sve u pitanje. Traži slabosti. Đavlov advokat. Koristi **bold**.
- autsajder: Perspektive iz biologije, sporta, arhitekture. Svježi pogled. Koristi **bold**.
- vizionar: Prilike za rast. Razmišlja 10x veće. Točke poluge. Koristi **bold**.
- filozof: Gradi od temelja. Što je fundamentalno istinito. Sokratski. Koristi **bold**.
VAŽNO: Vrati ISKLJUČIVO validan JSON, bez ikakvog teksta prije ili poslije, bez markdown blokova:
{"operativac":"odgovor","provokator":"odgovor","autsajder":"odgovor","vizionar":"odgovor","filozof":"odgovor"}
Svaki odgovor max 120 riječi.`;

const VERDICT_PROMPT = (summary) =>
  `Na temelju ovih 5 perspektiva napiši kratak Final Verdict.\nStruktura:\n**Gdje se slažu:** (1-2 rečenice)\n**Ključni trade-off:** (1-2 rečenice)\n**Preporuka:** (1-2 konkretne akcije)\nMax 120 riječi. Odgovaraj na jeziku savjetnika.\n\n${summary}`;

const CLASSIFY_PROMPT = (input) =>
  `Analyse this user input and return ONLY one of these three tags, nothing else, no punctuation:\nBUSINESS\nPERSONAL\nLOGISTICS\n\nUser input: ${input}`;

const INQUIRY_PROMPT = (input, tag, lang) => {
  const specialist = tag === "BUSINESS" ? "vizionar (asks about 10x scale and potential)" : tag === "PERSONAL" ? "autsajder (provides objective external distance)" : "operativac (asks about resources and deadlines)";
  return `You are an elite advisory council for ${tag} decisions. Three advisors: Provokator (challenges assumptions), Filozof (seeks fundamental truth), and specialist ${specialist}.
User context: ${input}
Generate exactly 3 focused questions, one per advisor, that unlock the deepest insight.
Return ONLY valid JSON: {"provokator":"question","filozof":"question","specialist":"question"}
Max 25 words per question. Language: ${lang === "hr" ? "Croatian" : "English"}.`;
};

const BLUEPRINT_PROMPT = (input, context, questions, answers, lang) =>
  `You are an elite advisory council that completed a deep analysis session.
Decision: ${input}
Deadline: ${context.deadline}
Core values: ${context.coreValues?.join(", ")}
Questions asked: ${JSON.stringify(questions)}
User answers: ${answers}

Generate a comprehensive strategic Blueprint in structured Markdown.
Structure:
# The Blueprint
## ${lang === "hr" ? "Sažetak" : "Executive Summary"}
## ${lang === "hr" ? "Kontekst odluke" : "Decision Context"}
## ${lang === "hr" ? "Perspektive Vijeća" : "Council Perspectives"}
### ⚡ ${lang === "hr" ? "Operativac" : "Executor"}
[400+ words]
### 🔥 ${lang === "hr" ? "Provokator" : "Provocateur"}
[400+ words]
### 🌍 ${lang === "hr" ? "Autsajder" : "Outsider"}
[400+ words]
### 🚀 ${lang === "hr" ? "Vizionar" : "Visionary"}
[400+ words]
### 🧠 ${lang === "hr" ? "Filozof" : "Philosopher"}
[400+ words]
## ⚖️ ${lang === "hr" ? "Presuda" : "Final Verdict"}
[300 words]
## ${lang === "hr" ? "Akcijski Plan" : "Action Plan"}
### ${lang === "hr" ? "Sljedeća 24 sata" : "Next 24 hours"}
- [3 actions]
### ${lang === "hr" ? "Sljedećih 7 dana" : "Next 7 days"}
- [3 actions]
### ${lang === "hr" ? "Dugoročno" : "Long-term (30-90 days)"}
- [3 actions]

Language: ${lang === "hr" ? "Croatian" : "English"}. Tone: Premium, calm, authoritative.`;

async function apiCall(endpoint, prompt, maxTokens = 2000) {
  const res = await fetch(endpoint, {
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
    const isNumbered = /^\d+\.\s/.test(line);
    const isBullet = /^[-*]\s/.test(line);
    const html = line.replace(/^#+\s/, "").replace(/^\d+\.\s/, "").replace(/^[-*]\s/, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
    if (isNumbered || isBullet) return (
      <div key={i} style={{ display: "flex", gap: 8, margin: "0 0 5px", alignItems: "flex-start" }}>
        <span style={{ color: ACCENT, fontSize: 16, lineHeight: "1.4", flexShrink: 0, marginTop: 1 }}>•</span>
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
    return <p key={i} style={{ margin: "0 0 5px", fontWeight: isH ? 600 : 400 }} dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

const SPECIALIST_MAP = {
  BUSINESS: { hr: "vizionar", en: "visionary", hrName: "Vizionar", enName: "Visionary", emoji: "🚀" },
  PERSONAL: { hr: "autsajder", en: "outsider", hrName: "Autsajder", enName: "Outsider", emoji: "🌍" },
  LOGISTICS: { hr: "operativac", en: "executor", hrName: "Operativac", enName: "Executor", emoji: "⚡" },
};

export default function Home() {
  const [lang, setLang] = useState("hr");
  const [appMode, setAppMode] = useState("quick");
  const [q, setQ] = useState("");
  const [resp, setResp] = useState({});
  const [loading, setLoading] = useState(false);
  const [sub, setSub] = useState(false);
  const [sel, setSel] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [verdictLoad, setVerdictLoad] = useState(false);
  const [deepStep, setDeepStep] = useState(1);
  const [deepContext, setDeepContext] = useState({ userProfile: "", deadline: "", coreValues: [] });
  const [deepLoading, setDeepLoading] = useState(false);
  const [deepLoadingMsg, setDeepLoadingMsg] = useState(0);
  const [questions, setQuestions] = useState(null);
  const [specialistTag, setSpecialistTag] = useState(null);
  const [answers, setAnswers] = useState("");
  const [blueprint, setBlueprint] = useState(null);
  const [pdfSaved, setPdfSaved] = useState(false);
  const t = LANGS[lang];
  const advisors = ADVISORS[lang];

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");
    const saved = localStorage.getItem("hmd_user_profile");
    if (saved) setDeepContext(prev => ({ ...prev, ...JSON.parse(saved) }));
  }, []);

  useEffect(() => {
    if (!deepLoading) return;
    const msgs = [t.loading1, t.loading2, t.loading3];
    let i = 0;
    const interval = setInterval(() => { i = (i + 1) % msgs.length; setDeepLoadingMsg(i); }, 4000);
    return () => clearInterval(interval);
  }, [deepLoading, lang]);

  const goQuick = async () => {
    if (!q.trim() || loading) return;
    setSub(true); setResp({}); setSel(null); setVerdict(null); setLoading(true);
    try {
      const langInstruction = lang === "en" ? "IMPORTANT: Respond ONLY in English." : "VAŽNO: Odgovaraj ISKLJUČIVO na hrvatskom.";
      const raw = await apiCall("/api/ask", SYSTEM_PROMPT + "\n\n" + langInstruction + "\n\nPitanje: " + q);
      const clean = raw.replace(/```json|```/g, "").trim();
      const json = JSON.parse(clean);
      const newResp = { a1: json.operativac || "-", a2: json.provokator || "-", a3: json.autsajder || "-", a4: json.vizionar || "-", a5: json.filozof || "-" };
      setResp(newResp);
      setVerdictLoad(true);
      const summary = advisors.map((a) => `**${a.name}:** ${newResp[a.id]}`).join("\n\n");
      const v = await apiCall("/api/ask", VERDICT_PROMPT(summary), 600);
      setVerdict(v);
    } catch (e) {
      const err = "Greška: " + e.message;
      setResp({ a1: err, a2: err, a3: err, a4: err, a5: err });
    } finally {
      setLoading(false); setVerdictLoad(false);
    }
  };

  const goDeepStep1 = async () => {
    if (!deepContext.userProfile.trim()) return;
    setDeepLoading(true);
    localStorage.setItem("hmd_user_profile", JSON.stringify({ deadline: deepContext.deadline, coreValues: deepContext.coreValues }));
    try {
      const tag = (await apiCall("/api/deep", CLASSIFY_PROMPT(deepContext.userProfile), 10)).trim().toUpperCase();
      const validTag = ["BUSINESS", "PERSONAL", "LOGISTICS"].includes(tag) ? tag : "PERSONAL";
      setSpecialistTag(validTag);
      const raw = await apiCall("/api/deep", INQUIRY_PROMPT(deepContext.userProfile, validTag, lang), 300);
      const clean = raw.replace(/```json|```/g, "").trim();
      const json = JSON.parse(clean);
      setQuestions(json);
      setDeepStep(2);
    } catch (e) {
      alert("Greška: " + e.message);
    } finally {
      setDeepLoading(false);
    }
  };

  const goDeepStep3 = async () => {
    if (!answers.trim()) return;
    setDeepStep(3);
  };

  const goBlueprint = async () => {
    setDeepLoading(true); setDeepStep(4);
    try {
      const res = await fetch("/api/ensemble", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: deepContext, questions, answers, lang }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Greška");
      setBlueprint(data.blueprint);
    } catch (e) {
      setBlueprint("Greška: " + e.message);
    } finally {
      setDeepLoading(false);
    }
  };

  const openBlueprint = () => {
    sessionStorage.setItem("hmd_blueprint", JSON.stringify({ blueprint, context: deepContext, date: new Date().toLocaleDateString(lang === "hr" ? "hr-HR" : "en-GB", { day: "numeric", month: "long", year: "numeric" }) }));
    window.open("/blueprint", "_blank");
    setPdfSaved(true);
    setTimeout(() => setPdfSaved(false), 3000);
  };

  const toggleValue = (v) => {
    setDeepContext(prev => ({
      ...prev,
      coreValues: prev.coreValues.includes(v) ? prev.coreValues.filter(x => x !== v) : [...prev.coreValues, v]
    }));
  };

  const specialist = specialistTag ? SPECIALIST_MAP[specialistTag] : null;
  const loadingMsgs = [t.loading1, t.loading2, t.loading3];

  return (
    <>
      <Head>
        <title>HelpMeDecide.ai</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="For the decisions that keep you up at night." />
        <meta name="theme-color" content="#C9A84C" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HelpMeDecide" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <meta property="og:title" content="HelpMeDecide" />
        <meta property="og:description" content="For the decisions that keep you up at night." />
        <meta property="og:image" content="https://helpmedecide.to/og-image.png" />
        <meta property="og:url" content="https://helpmedecide.to" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HelpMeDecide" />
        <meta name="twitter:description" content="For the decisions that keep you up at night." />
        <meta name="twitter:image" content="https://helpmedecide.to/og-image.png" />
      </Head>

      <div style={{ minHeight: "100vh", background: "#FAFAF7", fontFamily: "Inter, sans-serif" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 32 }}>
            <div style={{ display: "flex", background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 20, padding: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", gap: 2 }}>
              {["hr", "en"].map((l) => (
                <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? ACCENT : "transparent", color: lang === l ? "#fff" : "#86868B", border: "none", borderRadius: 16, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", fontFamily: "Inter, sans-serif" }}>
                  {l === "hr" ? "🇭🇷 HR" : "🇬🇧 EN"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 20, padding: "5px 14px", marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
              <span style={{ fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: "#86868B", fontWeight: 500 }}>{t.badge}</span>
            </div>
            <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 600, color: "#1D1D1F", letterSpacing: -1.5, lineHeight: 1.05, margin: "0 0 12px", fontFamily: "'Playfair Display', serif" }}>
              {t.title1}<br /><span style={{ color: ACCENT }}>{t.title2}</span>
            </h1>
            <p style={{ fontSize: 17, color: "#86868B", margin: "0 0 10px" }}>{t.subtitle}</p>
            <p style={{ fontSize: 12, color: "#C9A84C", margin: "0 0 28px", letterSpacing: 0.5, fontStyle: "italic" }}>{t.subheader}</p>

            <div style={{ display: "inline-flex", background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 24, padding: 4, gap: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              {["quick", "deep"].map((mode) => (
                <button key={mode} onClick={() => setAppMode(mode)} style={{ background: appMode === mode ? ACCENT : "transparent", color: appMode === mode ? "#fff" : "#86868B", border: "none", borderRadius: 20, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", fontFamily: "Inter, sans-serif" }}>
                  {mode === "quick" ? t.toggleQuick : t.toggleDeep}
                </button>
              ))}
            </div>
          </div>

          {appMode === "quick" && (
            <>
              <div style={{ maxWidth: 640, margin: "0 auto 40px" }}>
                <textarea value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.placeholder} rows={3}
                  style={{ width: "100%", boxSizing: "border-box", background: "#fff", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 12, padding: "16px 18px", fontSize: 15, fontFamily: "Inter, sans-serif", color: "#1D1D1F", resize: "vertical", outline: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", lineHeight: 1.6 }}
                  onFocus={(e) => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = `0 0 0 3px ${ACCENT}22`; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(0,0,0,0.12)"; e.target.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }} />
                <button onClick={goQuick} disabled={!q.trim() || loading}
                  style={{ marginTop: 10, width: "100%", background: q.trim() && !loading ? ACCENT : "#E5E5EA", color: q.trim() && !loading ? "#fff" : "#C5C5C7", border: "none", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 600, cursor: q.trim() && !loading ? "pointer" : "not-allowed", transition: "background 0.2s", fontFamily: "Inter, sans-serif" }}
                  onMouseEnter={(e) => { if (q.trim() && !loading) e.target.style.background = ACCENT_DARK; }}
                  onMouseLeave={(e) => { if (q.trim() && !loading) e.target.style.background = ACCENT; }}>
                  {loading ? t.buttonLoading : t.button}
                </button>
              </div>

              {sub && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, marginBottom: 12 }}>
                    {advisors.map((advisor) => {
                      const r = resp[advisor.id], isAct = sel === advisor.id;
                      return (
                        <div key={advisor.id} onClick={() => r && setSel(isAct ? null : advisor.id)}
                          style={{ background: "#fff", border: `1px solid ${ACCENT}`, borderRadius: 14, padding: "16px 18px", cursor: r ? "pointer" : "default", transition: "all 0.2s", boxShadow: isAct ? `0 0 0 3px ${ACCENT}18` : "0 1px 4px rgba(0,0,0,0.06)", minHeight: 120, display: "flex", flexDirection: "column" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                            <span style={{ fontSize: 18 }}>{advisor.emoji}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", color: ACCENT }}>{advisor.name}</div>
                              <div style={{ fontSize: 11, color: "#86868B", marginTop: 1 }}>{advisor.sub}</div>
                            </div>
                            {loading && !r && <div style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT, animation: "pulse 1s infinite", marginTop: 3 }} />}
                            {r && <span style={{ color: ACCENT, fontSize: 10, marginTop: 2 }}>{isAct ? "▲" : "▼"}</span>}
                          </div>
                          <div style={{ flex: 1, fontSize: 13, lineHeight: 1.6, color: isAct ? "#1D1D1F" : "#6E6E73" }}>
                            {loading && !r && <span style={{ color: "#C5C5C7", fontStyle: "italic" }}>{t.analyzing}</span>}
                            {r && !isAct && <div style={{ overflow: "hidden", maxHeight: 68 }}>{renderMd(r)}</div>}
                            {r && isAct && renderMd(r)}
                          </div>
                        </div>
                      );
                    })}

                    <div style={{ background: verdict ? "linear-gradient(135deg, #FFFDF5, #FFF8E7)" : "#fff", border: verdict ? `1px solid ${ACCENT}` : "0.5px solid rgba(0,0,0,0.1)", borderRadius: 14, padding: "16px 18px", boxShadow: verdict ? `0 0 24px ${ACCENT}30, 0 0 0 1px ${ACCENT}20` : "0 1px 4px rgba(0,0,0,0.06)", minHeight: 120, display: "flex", flexDirection: "column", transition: "all 0.5s ease" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 18 }}>⚖️</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", color: ACCENT }}>{t.verdictName}</div>
                          <div style={{ fontSize: 11, color: "#86868B", marginTop: 1 }}>{t.verdictSub}</div>
                        </div>
                        {verdictLoad && <div style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT, animation: "pulse 1s infinite", marginTop: 3 }} />}
                      </div>
                      <div style={{ flex: 1, fontSize: 13, lineHeight: 1.6, color: verdict ? "#1D1D1F" : "#C5C5C7", fontStyle: !verdict && !verdictLoad ? "italic" : "normal" }}>
                        {!verdictLoad && !verdict && t.waiting}
                        {verdictLoad && <span style={{ color: "#86868B" }}>{t.thinking}</span>}
                        {verdict && renderMd(verdict)}
                      </div>
                    </div>
                  </div>

                  {verdict && (
                    <div style={{ maxWidth: 640, margin: "24px auto 0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "#fff", borderRadius: 12, border: `1px solid ${ACCENT}` }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: "#1D1D1F" }}>{t.deeperTitle}</p>
                          <p style={{ fontSize: 12, color: "#86868B", margin: 0 }}>{t.deeperSub}</p>
                        </div>
                        <button onClick={() => { setAppMode("deep"); setDeepContext(prev => ({ ...prev, userProfile: q })); }} style={{ padding: "10px 18px", background: ACCENT, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap", marginLeft: 12 }}>
                          {t.deeperBtn}
                        </button>
                      </div>
                    </div>
                  )}

                  {Object.keys(resp).length > 0 && (
                    <p style={{ textAlign: "center", fontSize: 11, color: "#C5C5C7", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 16 }}>{t.footer}</p>
                  )}
                </div>
              )}
            </>
          )}

          {appMode === "deep" && (
            <div style={{ maxWidth: 640, margin: "0 auto" }}>

              {deepStep === 1 && (
                <div style={{ background: "#fff", border: `1px solid ${ACCENT}`, borderRadius: 16, padding: "28px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 600, flexShrink: 0 }}>1</div>
                    <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "#1D1D1F", fontFamily: "'Playfair Display', serif" }}>{t.step1Title}</p>
                  </div>

                  <p style={{ fontSize: 12, color: "#86868B", margin: "0 0 6px" }}>{t.step1Label}</p>
                  <textarea value={deepContext.userProfile} onChange={(e) => setDeepContext(prev => ({ ...prev, userProfile: e.target.value }))} placeholder={t.step1Placeholder} rows={4}
                    style={{ width: "100%", boxSizing: "border-box", background: "#FAFAF7", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 10, padding: "14px 16px", fontSize: 14, fontFamily: "Inter, sans-serif", color: "#1D1D1F", resize: "vertical", outline: "none", lineHeight: 1.6, marginBottom: 16 }} />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                    <div>
                      <p style={{ fontSize: 12, color: "#86868B", margin: "0 0 8px" }}>{t.step1Deadline}</p>
                      <select value={deepContext.deadline} onChange={(e) => setDeepContext(prev => ({ ...prev, deadline: e.target.value }))}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "0.5px solid rgba(0,0,0,0.15)", fontSize: 13, fontFamily: "Inter, sans-serif", background: "#FAFAF7", outline: "none" }}>
                        <option value="">—</option>
                        {t.deadlineOpts.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: "#86868B", margin: "0 0 8px" }}>{t.step1Values}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {t.values.map((v) => (
                          <span key={v} onClick={() => toggleValue(v)} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 12, border: `0.5px solid ${deepContext.coreValues.includes(v) ? ACCENT : "rgba(0,0,0,0.15)"}`, background: deepContext.coreValues.includes(v) ? ACCENT : "transparent", color: deepContext.coreValues.includes(v) ? "#fff" : "#86868B", cursor: "pointer", transition: "all 0.15s" }}>{v}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button onClick={goDeepStep1} disabled={!deepContext.userProfile.trim() || deepLoading}
                    style={{ width: "100%", background: deepContext.userProfile.trim() && !deepLoading ? ACCENT : "#E5E5EA", color: deepContext.userProfile.trim() && !deepLoading ? "#fff" : "#C5C5C7", border: "none", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 600, cursor: deepContext.userProfile.trim() && !deepLoading ? "pointer" : "not-allowed", fontFamily: "Inter, sans-serif" }}>
                    {deepLoading ? "Vijeće analizira..." : t.step1Btn}
                  </button>
                </div>
              )}

              {deepStep === 2 && questions && (
                <div style={{ background: "#fff", border: `1px solid ${ACCENT}`, borderRadius: 16, padding: "28px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 600, flexShrink: 0 }}>2</div>
                    <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "#1D1D1F", fontFamily: "'Playfair Display', serif" }}>{t.step2Title}</p>
                  </div>
                  {specialist && (
                    <div style={{ fontSize: 11, color: ACCENT, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>
                      {specialist.emoji} {lang === "hr" ? "Specijalist" : "Specialist"}: {lang === "hr" ? specialist.hrName : specialist.enName}
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                    {[
                      { key: "provokator", emoji: "🔥", name: lang === "hr" ? "Provokator" : "Provocateur" },
                      { key: "filozof", emoji: "🧠", name: lang === "hr" ? "Filozof" : "Philosopher" },
                      { key: "specialist", emoji: specialist?.emoji || "⚡", name: lang === "hr" ? specialist?.hrName : specialist?.enName },
                    ].map((a) => (
                      <div key={a.key} style={{ background: "#FAFAF7", borderRadius: 10, padding: "14px 16px", borderLeft: `3px solid ${ACCENT}` }}>
                        <div style={{ fontSize: 11, color: ACCENT, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>{a.emoji} {a.name}</div>
                        <p style={{ fontSize: 14, color: "#1D1D1F", margin: 0, lineHeight: 1.6 }}>{questions[a.key]}</p>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 13, color: "#1D1D1F", fontWeight: 600, margin: "0 0 10px" }}>{t.step3Title}</p>
                  <textarea value={answers} onChange={(e) => setAnswers(e.target.value)} placeholder={t.step3Placeholder} rows={5}
                    style={{ width: "100%", boxSizing: "border-box", background: "#FAFAF7", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 10, padding: "14px 16px", fontSize: 14, fontFamily: "Inter, sans-serif", color: "#1D1D1F", resize: "vertical", outline: "none", lineHeight: 1.6, marginBottom: 16 }} />
                  <button onClick={() => { goDeepStep3(); goBlueprint(); }} disabled={answers.length < 20 || deepLoading}
                    style={{ width: "100%", background: answers.length >= 20 && !deepLoading ? ACCENT : "#E5E5EA", color: answers.length >= 20 && !deepLoading ? "#fff" : "#C5C5C7", border: "none", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 600, cursor: answers.length >= 20 && !deepLoading ? "pointer" : "not-allowed", fontFamily: "Inter, sans-serif" }}>
                    {t.step3Btn}
                  </button>
                </div>
              )}

              {deepStep >= 3 && (
                <div style={{ background: "#fff", border: `1px solid ${ACCENT}`, borderRadius: 16, padding: "28px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 600, flexShrink: 0 }}>4</div>
                    <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "#1D1D1F", fontFamily: "'Playfair Display', serif" }}>Blueprint</p>
                  </div>

                  {deepLoading && (
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid ${ACCENT}`, borderTopColor: "transparent", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
                      <p style={{ fontSize: 14, color: "#86868B", fontStyle: "italic" }}>{loadingMsgs[deepLoadingMsg]}</p>
                    </div>
                  )}

                  {blueprint && !deepLoading && (
                    <div>
                      <div style={{ fontSize: 13, lineHeight: 1.8, color: "#1D1D1F", marginBottom: 32 }}>
                        {renderMd(blueprint)}
                      </div>
                      <div style={{ borderTop: "1px solid rgba(201,168,76,0.2)", paddingTop: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                        <button onClick={openBlueprint} style={{ background: pdfSaved ? "#34C759" : ACCENT, color: "#fff", border: "none", borderRadius: 24, padding: "12px 36px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "all 0.3s" }}>
                          {pdfSaved ? t.savedOk : t.savePdf}
                        </button>
                        <p style={{ fontSize: 11, color: "#C5C5C7", textAlign: "center", margin: 0 }}>
                          {lang === "hr" ? "Otvara se u novom tabu — spremi kao PDF iz preglednika." : "Opens in a new tab — save as PDF from your browser."}
                        </p>
                        <p style={{ fontSize: 11, color: "#D4B896", fontStyle: "italic", margin: 0 }}>
                          Synthesized by Claude Sonnet.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FAFAF7; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(1.6)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        textarea::placeholder { color: #C5C5C7; }
      `}</style>
    </>
  );
}
