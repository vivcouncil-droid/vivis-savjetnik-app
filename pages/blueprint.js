import { useEffect, useState } from "react";
import Head from "next/head";

export default function Blueprint() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("hmd_blueprint");
    if (stored) setData(JSON.parse(stored));
    setTimeout(() => window.print(), 800);
  }, []);

  if (!data) return <div style={{ padding: 40, fontFamily: "Inter, sans-serif" }}>Učitavanje...</div>;

  const { blueprint, context, date } = data;

  const renderMd = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      if (line.startsWith("# ")) return <h1 key={i} style={{ fontSize: 28, fontFamily: "'Playfair Display', Georgia, serif", color: "#1D1D1F", margin: "32px 0 12px", borderBottom: "2px solid #C9A84C", paddingBottom: 8 }}>{line.replace(/^# /, "")}</h1>;
      if (line.startsWith("## ")) return <h2 key={i} style={{ fontSize: 20, fontFamily: "'Playfair Display', Georgia, serif", color: "#1D1D1F", margin: "28px 0 10px" }}>{line.replace(/^## /, "")}</h2>;
      if (line.startsWith("### ")) return <h3 key={i} style={{ fontSize: 16, fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#C9A84C", margin: "20px 0 8px", letterSpacing: "0.5px", textTransform: "uppercase" }}>{line.replace(/^### /, "")}</h3>;
      if (line.startsWith("- ")) return <div key={i} style={{ display: "flex", gap: 10, margin: "4px 0", fontSize: 14, lineHeight: 1.7 }}><span style={{ color: "#C9A84C", flexShrink: 0 }}>•</span><span dangerouslySetInnerHTML={{ __html: line.replace(/^- /, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} /></div>;
      if (!line.trim()) return <div key={i} style={{ height: 8 }} />;
      const html = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
      return <p key={i} style={{ fontSize: 14, lineHeight: 1.8, margin: "4px 0", color: "#333" }} dangerouslySetInnerHTML={{ __html: html }} />;
    });
  };

  return (
    <>
      <Head>
        <title>Blueprint — HelpMeDecide</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { margin: 20mm; }
          }
          body { margin: 0; background: #FAFAF7; }
        `}</style>
      </Head>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 48px", background: "white", minHeight: "100vh", boxShadow: "0 0 40px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40, paddingBottom: 20, borderBottom: "1px solid #E8E0D0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#C9A84C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontSize: 14, fontWeight: 600 }}>H</span>
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: "#1D1D1F" }}>HelpMeDecide</div>
              <div style={{ fontSize: 11, color: "#86868B", letterSpacing: 1 }}>helpmedecide.to</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#86868B" }}>Blueprint generiran</div>
            <div style={{ fontSize: 12, color: "#1D1D1F", fontWeight: 500 }}>{date}</div>
          </div>
        </div>

        {context && (
          <div style={{ background: "#FAFAF7", border: "1px solid #E8E0D0", borderRadius: 8, padding: "16px 20px", marginBottom: 32 }}>
            <div style={{ fontSize: 10, color: "#C9A84C", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Kontekst odluke</div>
            {context.deadline && <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}><strong>Rok:</strong> {context.deadline}</div>}
            {context.coreValues?.length > 0 && <div style={{ fontSize: 13, color: "#555" }}><strong>Prioriteti:</strong> {context.coreValues.join(", ")}</div>}
          </div>
        )}

        <div>{renderMd(blueprint)}</div>

        <div style={{ marginTop: 48, paddingTop: 20, borderTop: "1px solid #E8E0D0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "#86868B" }}>helpmedecide.to — For the decisions that keep you up at night.</div>
          <div className="no-print">
            <button onClick={() => window.print()} style={{ background: "#C9A84C", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              Spremi kao PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
