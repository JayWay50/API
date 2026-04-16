import { useState, useRef, useEffect } from "react";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@400;500;700&family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap');

  @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes flicker  { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:.4} 95%{opacity:1} 97%{opacity:.6} 99%{opacity:1} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes shimmer  { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes ticker   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes typeIn   { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
  @keyframes borderOn { 0%,100%{border-color:#FF3B6B20} 50%{border-color:#FF3B6B60} }

  * { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:#060606} ::-webkit-scrollbar-thumb{background:#1a1a1a;border-radius:2px}
`;

const PLATFORMS = [
  { id:"twitter",  label:"Twitter/X",  color:"#1DA1F2", icon:"𝕏",  formats:["Thread","Single Tweet","Reply Hook"] },
  { id:"linkedin", label:"LinkedIn",   color:"#0A66C2", icon:"in", formats:["Long Post","Short Post","Carousel Script"] },
  { id:"tiktok",   label:"TikTok",     color:"#FF0050", icon:"♪",  formats:["Video Script","Hook + CTA","Stitch Prompt"] },
  { id:"reels",    label:"Reels",      color:"#E1306C", icon:"▶",  formats:["15s Script","30s Script","Voiceover"] },
  { id:"youtube",  label:"YouTube",    color:"#FF0000", icon:"▶",  formats:["Long-form Script","Shorts Script","Title + Hook"] },
];

const FORMULAS = [
  { id:"curiosity",    label:"Curiosity Gap",      desc:"Make them NEED to know what's next",     emoji:"🕳️" },
  { id:"vulnerability",label:"Vulnerability Loop", desc:"Earned trust through honest struggle",    emoji:"💔" },
  { id:"contrarian",   label:"Contrarian Take",    desc:"The opinion that stops the scroll",       emoji:"🔥" },
  { id:"data_shock",   label:"Data Shock",         desc:"A number so surprising they share it",    emoji:"📊" },
  { id:"story_arc",    label:"Story Arc",          desc:"Beginning, conflict, transformation",     emoji:"🎬" },
  { id:"listicle",     label:"Power List",         desc:"Rapid-fire value that earns the follow",  emoji:"⚡" },
];

const TONES = ["Bold & Aggressive","Conversational & Warm","Educational & Sharp","Provocative & Raw","Inspirational & Story-driven"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function Spinner({ color = "#FF3B6B" }) {
  return <div style={{ width:14, height:14, border:`2px solid ${color}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite", flexShrink:0 }} />;
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(()=>setCopied(false), 2000); });
  }
  return (
    <button onClick={copy} style={{
      background: copied ? "#00FFB220" : "#0D0D0D",
      border: `1px solid ${copied ? "#00FFB240" : "#1e1e1e"}`,
      borderRadius:6, padding:"4px 12px", cursor:"pointer",
      fontSize:10, fontFamily:"'Geist Mono',monospace",
      color: copied ? "#00FFB2" : "#444", transition:"all 0.2s",
      letterSpacing:1,
    }}>{copied ? "COPIED ✓" : "COPY"}</button>
  );
}

function ScoreBar({ score, color }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, height:4, background:"#111", borderRadius:2, overflow:"hidden" }}>
        <div style={{
          height:"100%", width:`${score}%`, borderRadius:2,
          background:`linear-gradient(90deg, ${color}80, ${color})`,
          boxShadow:`0 0 8px ${color}60`,
          transition:"width 1s ease",
        }} />
      </div>
      <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:11, color, width:34, textAlign:"right" }}>{score}%</span>
    </div>
  );
}

// ─── OUTPUT CARD ──────────────────────────────────────────────────────────────
function OutputCard({ item, platformColor, index }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{
      background:"#070707", border:`1px solid ${platformColor}20`,
      borderRadius:12, overflow:"hidden",
      animation:`fadeUp 0.4s ${index*0.07}s ease both`,
      marginBottom:12,
    }}>
      {/* Card header */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 16px", borderBottom:`1px solid ${platformColor}15`,
        background:`${platformColor}08`, cursor:"pointer",
      }} onClick={()=>setExpanded(!expanded)}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{
            fontSize:10, fontWeight:700, fontFamily:"'Geist Mono',monospace",
            color:platformColor, background:`${platformColor}18`,
            padding:"3px 10px", borderRadius:4, letterSpacing:1,
          }}>{item.format}</span>
          <span style={{ fontSize:12, color:"#555" }}>{item.formula}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:100 }}><ScoreBar score={item.viralScore} color={platformColor} /></div>
          <CopyBtn text={item.content} />
          <span style={{ color:"#333", fontSize:12 }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div style={{ padding:"16px 18px" }}>
          {/* Hook highlight */}
          <div style={{
            fontFamily:"'Instrument Serif',serif", fontSize:17,
            color:"#fff", lineHeight:1.5, marginBottom:12,
            fontStyle:"italic", borderLeft:`3px solid ${platformColor}`,
            paddingLeft:14,
          }}>{item.hook}</div>
          {/* Body */}
          <div style={{
            fontSize:13, color:"#777", lineHeight:1.8,
            whiteSpace:"pre-wrap", fontFamily:"'Bricolage Grotesque',sans-serif",
          }}>{item.body}</div>
          {/* CTA */}
          {item.cta && (
            <div style={{
              marginTop:14, padding:"10px 14px",
              background:`${platformColor}10`, border:`1px solid ${platformColor}25`,
              borderRadius:8, fontSize:12, color:platformColor, fontWeight:600,
            }}>📣 {item.cta}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function HookCopyEngine() {
  const [topic, setTopic]           = useState("");
  const [selPlatform, setSelPlatform] = useState(PLATFORMS[0]);
  const [selFormats, setSelFormats]   = useState(["Thread"]);
  const [selFormulas, setSelFormulas] = useState(["curiosity","contrarian"]);
  const [tone, setTone]             = useState(TONES[0]);
  const [variations, setVariations] = useState(3);
  const [state, setState]           = useState("idle"); // idle|running|done|error
  const [outputs, setOutputs]       = useState([]);
  const [logs, setLogs]             = useState([]);
  const [elapsed, setElapsed]       = useState(0);
  const startRef = useRef(null);
  const logsRef  = useRef(null);

  useEffect(()=>{
    if(state!=="running") return;
    const t = setInterval(()=>setElapsed(Math.floor((Date.now()-startRef.current)/1000)),500);
    return ()=>clearInterval(t);
  },[state]);

  useEffect(()=>{ logsRef.current?.scrollTo({top:logsRef.current.scrollHeight,behavior:"smooth"}); },[logs]);

  function log(text, type="info") {
    const time = new Date().toLocaleTimeString("en-US",{hour12:false});
    setLogs(p=>[...p,{text,type,time}]);
  }

  function toggleFormat(f) {
    setSelFormats(p=>p.includes(f)?p.filter(x=>x!==f):[...p,f]);
  }
  function toggleFormula(f) {
    setSelFormulas(p=>p.includes(f)?p.filter(x=>x!==f):[...p,f]);
  }

  async function generate() {
    if(!topic.trim()||state==="running") return;
    setState("running"); setOutputs([]); setLogs([]); setElapsed(0);
    startRef.current = Date.now();

    log("Hook & Copy Engine initializing...", "system");
    await new Promise(r=>setTimeout(r,400));
    log(`Platform: ${selPlatform.label}`, "system");
    log(`Formats: ${selFormats.join(", ")}`, "system");
    log(`Formulas: ${selFormulas.map(f=>FORMULAS.find(x=>x.id===f)?.label).join(", ")}`, "system");
    await new Promise(r=>setTimeout(r,500));
    log("Analyzing topic for viral angles...", "info");
    await new Promise(r=>setTimeout(r,600));
    log(`Generating ${variations} variation(s) per format...`, "info");
    await new Promise(r=>setTimeout(r,400));
    log("Calling AI copy engine...", "system");

    try {
      const formulaNames = selFormulas.map(f=>FORMULAS.find(x=>x.id===f)?.label).join(", ");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`You are the ViralLift Hook & Copy Engine — an elite viral content writer. You generate scroll-stopping, platform-native content that drives massive engagement.

Respond ONLY with valid JSON, no markdown, no preamble. Structure:
{
  "outputs": [
    {
      "format": "string",
      "formula": "string",
      "hook": "string (the opening line — must stop the scroll)",
      "body": "string (the full copy, platform-native, use line breaks naturally)",
      "cta": "string (call to action, 1 sentence)",
      "viralScore": number (60-99)
    }
  ]
}

Rules:
- Each output must be genuinely distinct — different angle, different energy
- Hook must be the single most compelling opening line possible
- Body must be platform-native (Twitter = punchy threads, LinkedIn = story-driven, TikTok = spoken word energy, YouTube = narrative arc)
- viralScore reflects predicted engagement based on formula strength and platform fit`,
          messages:[{
            role:"user",
            content:`Generate viral content for:

Topic/Idea: "${topic}"
Platform: ${selPlatform.label}
Formats: ${selFormats.join(", ")}
Hook Formulas: ${formulaNames}
Tone: ${tone}
Variations per format: ${variations}

Create ${Math.min(variations * selFormats.length, 6)} total outputs. Mix the formats and formulas. Make each one genuinely different — different hook style, different angle, different energy. Platform-native copy only.`,
          }],
        }),
      });

      const data = await res.json();
      const raw = data.content?.map(c=>c.text||"").join("") || "{}";
      const clean = raw.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);

      log(`Generated ${parsed.outputs?.length} copy variations ✓`, "system");
      log("Scoring viral potential...", "info");
      await new Promise(r=>setTimeout(r,300));
      log("Copy engine complete ✓", "system");

      setOutputs(parsed.outputs || []);
      setState("done");
    } catch(e) {
      log("Generation failed — check connection", "error");
      setState("error");
    }
  }

  const avgScore = outputs.length ? Math.round(outputs.reduce((a,o)=>a+o.viralScore,0)/outputs.length) : 0;

  return (
    <>
      <style>{CSS}</style>
      <div style={{
        minHeight:"100vh", background:"#040404",
        fontFamily:"'Bricolage Grotesque',sans-serif", color:"#eee",
      }}>

        {/* Top ticker */}
        <div style={{ background:"#FF3B6B", padding:"5px 0", overflow:"hidden" }}>
          <div style={{ display:"flex", animation:"ticker 18s linear infinite", whiteSpace:"nowrap", width:"200%" }}>
            {[...Array(2)].map((_,j)=>(
              <span key={j} style={{ display:"flex" }}>
                {["HOOK ENGINE ONLINE","COPY GENERATION READY","VIRAL FORMULA BANK LOADED","PLATFORM ADAPTERS ACTIVE","ENGAGEMENT SCORING LIVE"].map((t,i)=>(
                  <span key={i} style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, fontWeight:700, color:"#000", padding:"0 36px", letterSpacing:2 }}>◆ {t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <div style={{ maxWidth:1060, margin:"0 auto", padding:"32px 24px 60px" }}>

          {/* Header */}
          <div style={{ marginBottom:32, animation:"fadeUp 0.5s ease" }}>
            <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, color:"#FF3B6B", letterSpacing:4, marginBottom:8 }}>VIRALLIFT OS — MODULE 02</div>
            <h1 style={{ fontFamily:"'Instrument Serif',serif", fontSize:48, color:"#fff", lineHeight:1, marginBottom:8, fontStyle:"italic" }}>
              Hook &amp; Copy<br /><span style={{ color:"#FF3B6B" }}>Engine</span>
            </h1>
            <p style={{ fontSize:14, color:"#444", maxWidth:420 }}>
              Feed it a topic. It writes platform-native viral copy in every format — hooks, threads, scripts, carousels.
            </p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:20 }}>

            {/* ── LEFT: Config ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* Topic input */}
              <div style={{
                background:"#080808", border:"1px solid #141414",
                borderRadius:14, padding:20,
                animation:"fadeUp 0.5s 0.1s ease both",
              }}>
                <label style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, color:"#444", letterSpacing:2, display:"block", marginBottom:10 }}>TOPIC / IDEA</label>
                <textarea
                  value={topic}
                  onChange={e=>setTopic(e.target.value)}
                  placeholder="e.g. I grew from 0 to 50K followers in 90 days without paid ads..."
                  rows={4}
                  style={{
                    width:"100%", background:"#0D0D0D", border:"1px solid #1a1a1a",
                    borderRadius:8, padding:"12px 14px", color:"#eee",
                    fontSize:13, fontFamily:"'Bricolage Grotesque',sans-serif",
                    outline:"none", resize:"none", lineHeight:1.6,
                    animation: topic ? "borderOn 0s" : "none",
                  }}
                />
              </div>

              {/* Platform */}
              <div style={{ background:"#080808", border:"1px solid #141414", borderRadius:14, padding:20, animation:"fadeUp 0.5s 0.15s ease both" }}>
                <label style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, color:"#444", letterSpacing:2, display:"block", marginBottom:10 }}>PLATFORM</label>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {PLATFORMS.map(p=>(
                    <button key={p.id} onClick={()=>{ setSelPlatform(p); setSelFormats([p.formats[0]]); }} style={{
                      display:"flex", alignItems:"center", gap:10,
                      padding:"9px 14px", borderRadius:8, cursor:"pointer",
                      background: selPlatform.id===p.id ? `${p.color}15` : "#0D0D0D",
                      border:`1px solid ${selPlatform.id===p.id ? p.color+"50" : "#141414"}`,
                      color: selPlatform.id===p.id ? p.color : "#444",
                      fontFamily:"'Bricolage Grotesque',sans-serif",
                      fontSize:13, fontWeight:600, transition:"all 0.2s",
                      textAlign:"left",
                    }}>
                      <span style={{ width:20, textAlign:"center", fontSize:12 }}>{p.icon}</span>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formats */}
              <div style={{ background:"#080808", border:"1px solid #141414", borderRadius:14, padding:20, animation:"fadeUp 0.5s 0.2s ease both" }}>
                <label style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, color:"#444", letterSpacing:2, display:"block", marginBottom:10 }}>FORMAT</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {selPlatform.formats.map(f=>{
                    const active = selFormats.includes(f);
                    return (
                      <button key={f} onClick={()=>toggleFormat(f)} style={{
                        padding:"6px 12px", borderRadius:6, cursor:"pointer",
                        background: active ? `${selPlatform.color}18` : "#0D0D0D",
                        border:`1px solid ${active ? selPlatform.color+"50" : "#141414"}`,
                        color: active ? selPlatform.color : "#444",
                        fontSize:11, fontWeight:700, transition:"all 0.2s",
                        fontFamily:"'Geist Mono',monospace", letterSpacing:0.5,
                      }}>{f}</button>
                    );
                  })}
                </div>
              </div>

              {/* Formulas */}
              <div style={{ background:"#080808", border:"1px solid #141414", borderRadius:14, padding:20, animation:"fadeUp 0.5s 0.25s ease both" }}>
                <label style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, color:"#444", letterSpacing:2, display:"block", marginBottom:10 }}>HOOK FORMULA</label>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {FORMULAS.map(f=>{
                    const active = selFormulas.includes(f.id);
                    return (
                      <button key={f.id} onClick={()=>toggleFormula(f.id)} style={{
                        display:"flex", alignItems:"center", gap:10,
                        padding:"9px 12px", borderRadius:8, cursor:"pointer",
                        background: active ? "#FF3B6B10" : "#0D0D0D",
                        border:`1px solid ${active ? "#FF3B6B40" : "#141414"}`,
                        color: active ? "#FF3B6B" : "#444",
                        fontFamily:"'Bricolage Grotesque',sans-serif",
                        fontSize:12, fontWeight:600, transition:"all 0.2s",
                        textAlign:"left",
                      }}>
                        <span>{f.emoji}</span>
                        <div>
                          <div style={{ fontSize:12 }}>{f.label}</div>
                          {active && <div style={{ fontSize:10, color:"#FF3B6B80", marginTop:1 }}>{f.desc}</div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tone + Variations */}
              <div style={{ background:"#080808", border:"1px solid #141414", borderRadius:14, padding:20, animation:"fadeUp 0.5s 0.3s ease both" }}>
                <label style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, color:"#444", letterSpacing:2, display:"block", marginBottom:10 }}>TONE</label>
                <select value={tone} onChange={e=>setTone(e.target.value)} style={{
                  width:"100%", background:"#0D0D0D", border:"1px solid #1a1a1a",
                  borderRadius:8, padding:"10px 12px", color:"#eee",
                  fontSize:12, fontFamily:"'Bricolage Grotesque',sans-serif",
                  outline:"none", marginBottom:14, cursor:"pointer",
                }}>
                  {TONES.map(t=><option key={t} value={t}>{t}</option>)}
                </select>

                <label style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, color:"#444", letterSpacing:2, display:"block", marginBottom:8 }}>VARIATIONS</label>
                <div style={{ display:"flex", gap:6 }}>
                  {[1,2,3,4].map(n=>(
                    <button key={n} onClick={()=>setVariations(n)} style={{
                      flex:1, padding:"8px 0", borderRadius:6, cursor:"pointer",
                      background: variations===n ? "#FF3B6B10" : "#0D0D0D",
                      border:`1px solid ${variations===n ? "#FF3B6B40" : "#141414"}`,
                      color: variations===n ? "#FF3B6B" : "#444",
                      fontSize:13, fontWeight:700, transition:"all 0.2s",
                      fontFamily:"'Geist Mono',monospace",
                    }}>{n}</button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button onClick={generate} disabled={!topic.trim()||state==="running"||selFormats.length===0} style={{
                width:"100%", padding:"16px 0",
                background: !topic.trim()||selFormats.length===0 ? "#0D0D0D"
                  : state==="running" ? "#0D0D0D"
                  : "linear-gradient(135deg, #FF3B6B, #CC1F4A)",
                border:`1px solid ${!topic.trim() ? "#141414" : state==="running" ? "#1e1e1e" : "transparent"}`,
                borderRadius:10, color: state==="running"||!topic.trim() ? "#333" : "#fff",
                fontSize:13, fontWeight:800, cursor: state==="running"||!topic.trim() ? "not-allowed" : "pointer",
                fontFamily:"'Geist Mono',monospace", letterSpacing:2,
                transition:"all 0.3s", display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                animation: topic && state==="idle" ? "fadeUp 0.3s ease" : "none",
              }}>
                {state==="running" ? <><Spinner color="#FF3B6B" /> GENERATING...</> : "▶ GENERATE COPY"}
              </button>
            </div>

            {/* ── RIGHT: Output ── */}
            <div>

              {/* Agent log */}
              {(state==="running" || logs.length > 0) && (
                <div style={{
                  background:"#060606", border:"1px solid #0f0f0f", borderRadius:12,
                  padding:"14px 16px", marginBottom:16,
                  animation:"fadeUp 0.3s ease",
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, color:"#222", letterSpacing:2 }}>COPY ENGINE LOG</span>
                    {state==="running" && <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, color:"#FF3B6B", animation:"pulse 1s infinite" }}>● {elapsed}s</span>}
                  </div>
                  <div ref={logsRef} style={{ maxHeight:120, overflowY:"auto" }}>
                    {logs.map((l,i)=>(
                      <div key={i} style={{
                        display:"flex", gap:10, marginBottom:3,
                        fontFamily:"'Geist Mono',monospace", fontSize:11,
                        animation:"typeIn 0.2s ease",
                      }}>
                        <span style={{ color:"#1a1a1a", flexShrink:0 }}>{l.time}</span>
                        <span style={{ color: l.type==="system"?"#FF3B6B":l.type==="error"?"#ff6b6b":"#2a2a2a" }}>
                          {l.type==="system"?"►":l.type==="error"?"✕":"·"}
                        </span>
                        <span style={{ color: l.type==="system"?"#FF3B6B":l.type==="error"?"#ff6b6b":"#333" }}>{l.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Results header */}
              {outputs.length > 0 && (
                <div style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  marginBottom:14, animation:"fadeUp 0.3s ease",
                }}>
                  <div>
                    <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, color:"#444", letterSpacing:2 }}>
                      {outputs.length} VARIATIONS GENERATED
                    </span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:11, color:"#444" }}>avg viral score</span>
                    <span style={{
                      fontFamily:"'Geist Mono',monospace", fontSize:18,
                      color: avgScore>80?"#00FFB2":avgScore>65?"#FFD700":"#FF3B6B",
                      fontWeight:700,
                    }}>{avgScore}%</span>
                  </div>
                </div>
              )}

              {/* Output cards */}
              {outputs.map((o,i)=>(
                <OutputCard key={i} item={o} platformColor={selPlatform.color} index={i} />
              ))}

              {/* Empty state */}
              {state==="idle" && outputs.length===0 && (
                <div style={{
                  background:"#060606", border:"1px dashed #111",
                  borderRadius:14, padding:60, textAlign:"center",
                  animation:"fadeUp 0.5s 0.3s ease both",
                }}>
                  <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:32, color:"#111", fontStyle:"italic", marginBottom:8 }}>
                    Your copy lives here
                  </div>
                  <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:11, color:"#1a1a1a", letterSpacing:2 }}>
                    ENTER A TOPIC → SELECT PLATFORM → GENERATE
                  </div>
                </div>
              )}

              {/* Running skeleton */}
              {state==="running" && outputs.length===0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {[1,2,3].map(i=>(
                    <div key={i} style={{
                      background:"#070707", borderRadius:12,
                      height:120, border:"1px solid #0f0f0f",
                      background:"linear-gradient(90deg, #080808 25%, #0f0f0f 50%, #080808 75%)",
                      backgroundSize:"400px 100%",
                      animation:`shimmer 1.5s ${i*0.2}s infinite`,
                    }} />
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
