"use client";
import { useState } from "react";

const T = {
  sw: {
    title: "Unganisha WhatsApp Bot", ph: "255712345678", btn: "Pata Pairing Code", wait: "Inatafuta code...",
    copy: "Copy", copied: "Imenakiliwa ✓",
    steps: ["Fungua WhatsApp > Linked Devices", "Gonga \"Link a device\"", "Chagua \"Link with phone number instead\"", "Weka code hapo juu"],
    note: "Unaunganisha WhatsApp yako na bot hii. Unaweza kuondoa muda wowote kupitia Linked Devices.",
    hint: "Namba pamoja na country code, bila + au nafasi.",
  },
  en: {
    title: "Link WhatsApp Bot", ph: "255712345678", btn: "Get Pairing Code", wait: "Getting code...",
    copy: "Copy", copied: "Copied ✓",
    steps: ["Open WhatsApp > Linked Devices", "Tap \"Link a device\"", "Choose \"Link with phone number instead\"", "Enter the code above"],
    note: "You are linking your WhatsApp to this bot. You can remove it anytime via Linked Devices.",
    hint: "Number with country code, no + or spaces.",
  },
};

export default function Home() {
  const [lang, setLang] = useState("sw");
  const [number, setNumber] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = T[lang];

  async function submit(e) {
    e.preventDefault();
    setError(""); setCode(""); setLoading(true);
    try {
      const r = await fetch("/api/pair", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ number }) });
      const d = await r.json();
      if (!r.ok) setError(d.error); else setCode(d.code);
    } catch { setError("Hitilafu ya mtandao."); }
    setLoading(false);
  }

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main>
      <style>{`
        :root{--bg:#f5f7f6;--card:#fff;--fg:#111;--mut:#667;--ac:#25d366;--bd:#dde}
        @media(prefers-color-scheme:dark){:root{--bg:#0d1412;--card:#16201d;--fg:#eee;--mut:#9ab;--ac:#25d366;--bd:#2a3a35}}
        body{background:var(--bg);color:var(--fg);font-family:system-ui,sans-serif}
        main{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}
        .card{background:var(--card);border:1px solid var(--bd);border-radius:16px;padding:24px;width:100%;max-width:420px}
        input{width:100%;box-sizing:border-box;padding:14px;font-size:18px;border-radius:10px;border:1px solid var(--bd);background:transparent;color:var(--fg)}
        .go{width:100%;margin-top:12px;padding:14px;font-size:16px;font-weight:600;border:0;border-radius:10px;background:var(--ac);color:#04210f;cursor:pointer}
        .go:disabled{opacity:.6}
        .code{font-size:34px;letter-spacing:6px;font-weight:700;text-align:center;margin:16px 0 8px;font-family:ui-monospace,monospace}
        .mut{color:var(--mut);font-size:13px}
        .err{color:#e5484d;margin-top:12px;font-size:14px}
        .lang{float:right;background:none;border:1px solid var(--bd);color:var(--fg);border-radius:8px;padding:4px 10px;cursor:pointer}
      `}</style>
      <div className="card">
        <button className="lang" onClick={() => setLang(lang === "sw" ? "en" : "sw")}>{lang === "sw" ? "EN" : "SW"}</button>
        <h1 style={{ fontSize: 22, marginTop: 0 }}>{t.title}</h1>
        <form onSubmit={submit}>
          <input inputMode="numeric" placeholder={t.ph} value={number} onChange={(e) => setNumber(e.target.value)} required />
          <p className="mut">{t.hint}</p>
          <button className="go" disabled={loading}>{loading ? t.wait : t.btn}</button>
        </form>
        {error && <div className="err">{error}</div>}
        {code && (
          <>
            <div className="code">{code.match(/.{1,4}/g).join("-")}</div>
            <button className="go" onClick={copy}>{copied ? t.copied : t.copy}</button>
            <ol className="mut">{t.steps.map((s) => <li key={s}>{s}</li>)}</ol>
          </>
        )}
        <p className="mut" style={{ marginTop: 20 }}>{t.note}</p>
      </div>
    </main>
  );
}
