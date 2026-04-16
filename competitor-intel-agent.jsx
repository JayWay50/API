import { useState, useEffect, useRef } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&family=Manrope:wght@300;400;500;600;700;800&display=swap');

  @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.15} }
  @keyframes scanline  { 0%{top:-2px} 100%{top:100%} }
  @keyframes ticker    { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes radar     { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
  @keyframes radarPing { 0%{transform:scale(0);opacity:.8} 100%{transform:scale(1);opacity:0} }
  @keyframes slideR    { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
  @keyframes glitch    { 0%,100%{clip-path:inset(0 0 98% 0)} 10%{clip-path:inset(20% 0 60% 0)} 20%{clip-path:inset(50% 0 30% 0)} 30%{clip-path:inset(10% 0 80% 0)} 40%{clip-path:inset(70% 0 5% 0)} 50%{clip-path:inset(40% 0 40% 0)} }
  @keyframes heatmap   { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
  @keyframes borderFlow{ 0%{border-color:#FF6B0020} 50%{border-color:#FF6B0060} 100%{border-color:#FF6B0020} }

  * { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:#040404} ::-webkit-scrollbar-thumb{background:#1c1c1c}
`;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const PLATFORMS = ["All","Twitter/X","TikTok","LinkedIn","YouTube","Reels"];
const PC = { "Twitter/X":"#1DA1F2","TikTok":"#FF0050","LinkedIn":"#0A66C2","YouTube":"#FF0000","Reels":"#E1306C" };

const SCAN_PHASES = [
  { id:"init",     label:"INITIALIZING AGENT",      icon:"🤖", color:"#FF6B00" },
  { id:"profile",  label:"SCANNING PROFILES",        icon:"👤", color:"#FF6B00" },
  { id:"content",  label:"EXTRACTING CONTENT",       icon:"📥", color:"#FFD700" },
  { id:"patterns", label:"DETECTING PATTERNS",       icon:"🧬", color:"#FF3B6B" },
  { id:"hooks",    label:"REVERSE-ENGINEERING HOOKS", icon:"🎣", color:"#7B61FF" },
  { id:"gaps",     label:"FINDING YOUR EDGE",        icon:"⚡", color:"#00FFB2" },
  { id:"report",   label:"GENERATING INTEL REPORT",  icon:"📊", color:"#00FFB2" },
];

const DEMO_COMPETITORS = [
  { handle:"@garyvee",      name:"Gary Vaynerchuk", platform:"Twitter/X", followers:"3.2M", growth:"+2.1%", avgEng:"6.8%", topHook:"Hustle + vulnerability loop",   niche:"Entrepreneur" },
  { handle:"@alexhormozi",  name:"Alex Hormozi",    platform:"Twitter/X", followers:"2.8M", growth:"+4.3%", avgEng:"9.2%", topHook:"Data shock + contrarian take",  niche:"Business" },
  { handle:"@mrbreastyt",   name:"MrBeast",         platform:"YouTube",   followers:"240M", growth:"+1.2%", avgEng:"11.4%",topHook:"Curiosity gap + challenge arc",  niche:"Entertainment" },
  { handle:"@charlidamelio",name:"Charli D'Amelio",  platform:"TikTok",    followers:"151M", growth:"+0.8%", avgEng:"5.3%", topHook:"Trend riding + relatable POV",  niche:"Lifestyle" },
  { handle:"@justinwelsh",  name:"Justin Welsh",    platform:"LinkedIn",  followers:"580K", growth:"+3.7%", avgEng:"4.1%", topHook:"Personal story + framework drop",niche:"Creator Economy" },
];

// ── RADAR COMPONENT ───────────────────────────────────────────────────────────
function RadarScope({ active, competitors }) {
  const dots = [
    { x:62, y:28, size:6,  color:"#FF6B00", label:"Target A" },
    { x:78, y:55, size:8,  color:"#FFD700", label:"Target B" },
    { x:35, y:70, size:5,  color:"#FF3B6B", label:"Target C" },
    { x:55, y:82, size:7,  color:"#7B61FF", label:"Target D" },
    { x:20, y:42, size:6,  color:"#00FFB2", label:"Target E" },
    { x:50, y:50, size:10, color:"#FF6B00", label:"YOU",       isYou:true },
  ];

  return (
    <div style={{ position:"relative", width:200, height:200, flexShrink:0 }}>
      {/* Rings */}
      {[1,2,3,4].map(i => (
        <div key={i} style={{
          position:"absolute",
          top:`${(i/4)*50-i*2}%`, left:`${(i/4)*50-i*2}%`,
          width:`${100-(i/4)*100+i*4}%`, height:`${100-(i/4)*100+i*4}%`,
          borderRadius:"50%",
          border:`1px solid #FF6B00${["30","25","18","10"][i-1]}`,
        }}/>
      ))}
      {/* Cross hairs */}
      <div style={{ position:"absolute", top:"50%", left:0, right:0, height:1, background:"#FF6B0018" }}/>
      <div style={{ position:"absolute", left:"50%", top:0, bottom:0, width:1, background:"#FF6B0018" }}/>
      {/* Sweep arm */}
      {active && (
        <div style={{
          position:"absolute", top:"50%", left:"50%",
          width:"48%", height:1,
          background:"linear-gradient(90deg, #FF6B00, transparent)",
          transformOrigin:"0 0",
          animation:"radar 2s linear infinite",
        }}/>
      )}
      {/* Ping effect */}
      {active && (
        <div style={{
          position:"absolute", top:"10%", left:"10%",
          width:"80%", height:"80%", borderRadius:"50%",
          border:"1px solid #FF6B00",
          animation:"radarPing 2s ease-out infinite",
        }}/>
      )}
      {/* Dots */}
      {dots.map((d, i) => (
        <div key={i} title={d.label} style={{
          position:"absolute",
          top:`${d.y}%`, left:`${d.x}%`,
          transform:"translate(-50%,-50%)",
          width:d.size, height:d.size, borderRadius:"50%",
          background:d.color,
          boxShadow:`0 0 ${d.size*2}px ${d.color}`,
          zIndex:2,
          animation: d.isYou ? "pulse 2s infinite" : "none",
        }}>
          {d.isYou && (
            <div style={{
              position:"absolute", top:"50%", left:"50%",
              transform:"translate(-50%,-50%)",
              width:d.size*3, height:d.size*3, borderRadius:"50%",
              border:`1px solid ${d.color}40`,
              animation:"radarPing 1.5s ease-out infinite",
            }}/>
          )}
        </div>
      ))}
      {/* Center label */}
      <div style={{
        position:"absolute", bottom:-24, left:"50%", transform:"translateX(-50%)",
        fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#FF6B00",
        letterSpacing:2, whiteSpace:"nowrap",
      }}>INTEL RADAR</div>
    </div>
  );
}

// ── LIVE LOG ──────────────────────────────────────────────────────────────────
function Log({ logs, height=160 }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.scrollTo({ top:ref.current.scrollHeight, behavior:"smooth" }); }, [logs]);
  return (
    <div ref={ref} style={{ background:"#020202", borderRadius:8, padding:"10px 12px", height, overflowY:"auto", border:"1px solid #0c0c0c" }}>
      {!logs.length && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#111" }}>Agent standby...</span>}
      {logs.map((l,i) => (
        <div key={i} style={{ display:"flex", gap:8, marginBottom:4, fontFamily:"'JetBrains Mono',monospace", fontSize:10, animation:"slideR .15s ease" }}>
          <span style={{ color:"#1a1a1a", flexShrink:0 }}>{l.time}</span>
          <span style={{ color:l.type==="system"?"#FF6B00":l.type==="warn"?"#FFD700":l.type==="hit"?"#00FFB2":l.type==="error"?"#FF3B6B":"#2a2a2a" }}>
            {l.type==="system"?"▶":l.type==="warn"?"⚠":l.type==="hit"?"◈":l.type==="error"?"✕":"·"}
          </span>
          <span style={{ color:l.type==="system"?"#FF6B00":l.type==="warn"?"#FFD700":l.type==="hit"?"#00FFB2":l.type==="error"?"#FF3B6B":"#2a2a2a" }}>{l.text}</span>
        </div>
      ))}
    </div>
  );
}

// ── COMPETITOR ROW ────────────────────────────────────────────────────────────
function CompetitorRow({ c, index, onAnalyze, analyzing }) {
  const pc = PC[c.platform] || "#fff";
  return (
    <div style={{
      display:"grid", gridTemplateColumns:"1fr 90px 70px 70px 1fr auto",
      alignItems:"center", gap:12,
      padding:"12px 16px", borderRadius:10,
      background:"#080808", border:"1px solid #111",
      marginBottom:8, animation:`fadeUp .3s ${index*.06}s ease both`,
      transition:"border-color .2s",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor="#FF6B0030"}
    onMouseLeave={e => e.currentTarget.style.borderColor="#111"}>
      <div>
        <div style={{ fontSize:13, color:"#ddd", fontWeight:600, fontFamily:"'Manrope',sans-serif" }}>{c.name}</div>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2 }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#444" }}>{c.handle}</span>
          <span style={{ fontSize:9, color:pc, background:`${pc}15`, padding:"1px 6px", borderRadius:3, fontFamily:"'JetBrains Mono',monospace", letterSpacing:.5 }}>{c.platform}</span>
        </div>
      </div>
      <div style={{ textAlign:"right" }}>
        <div style={{ fontFamily:"'Exo 2',sans-serif", fontSize:13, fontWeight:700, color:"#ccc" }}>{c.followers}</div>
        <div style={{ fontSize:10, color:"#00FFB2", fontFamily:"'JetBrains Mono',monospace" }}>{c.growth}/wk</div>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontFamily:"'Exo 2',sans-serif", fontSize:14, fontWeight:800, color: parseFloat(c.avgEng)>7?"#FF6B00":parseFloat(c.avgEng)>5?"#FFD700":"#555" }}>{c.avgEng}</div>
        <div style={{ fontSize:9, color:"#333", fontFamily:"'JetBrains Mono',monospace" }}>ENG RATE</div>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:10, color:"#555", fontStyle:"italic", fontFamily:"'Manrope',sans-serif", lineHeight:1.4 }}>{c.niche}</div>
      </div>
      <div style={{ fontSize:11, color:"#555", fontStyle:"italic", fontFamily:"'Manrope',sans-serif", lineHeight:1.4 }}>{c.topHook}</div>
      <button onClick={() => onAnalyze(c)} disabled={analyzing} style={{
        padding:"6px 12px", borderRadius:7,
        background: analyzing ? "#0D0D0D" : "#FF6B0015",
        border:`1px solid ${analyzing?"#141414":"#FF6B0040"}`,
        color: analyzing ? "#333" : "#FF6B00",
        fontSize:10, fontWeight:700, cursor: analyzing ? "not-allowed" : "pointer",
        fontFamily:"'JetBrains Mono',monospace", letterSpacing:.5,
        flexShrink:0, transition:"all .2s",
      }}>SCAN</button>
    </div>
  );
}

// ── INTEL CARD ────────────────────────────────────────────────────────────────
function IntelCard({ report, index }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{
      background:"#070707", border:"1px solid #FF6B0025",
      borderRadius:12, overflow:"hidden", marginBottom:12,
      animation:`fadeUp .4s ${index*.07}s ease both`,
      position:"relative",
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,#FF6B00,transparent)" }}/>
      <div onClick={() => setOpen(!open)} style={{
        display:"flex", alignItems:"center", gap:12,
        padding:"14px 16px", cursor:"pointer",
        background: open ? "#FF6B0008" : "transparent",
        borderBottom: open ? "1px solid #FF6B0015" : "none",
      }}>
        <div style={{
          width:36, height:36, borderRadius:10,
          background:"#FF6B0015", border:"1px solid #FF6B0030",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"'Exo 2',sans-serif", fontSize:14, fontWeight:800, color:"#FF6B00",
          flexShrink:0,
        }}>#{index+1}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Exo 2',sans-serif", fontSize:14, fontWeight:700, color:"#fff" }}>{report.competitor}</div>
          <div style={{ fontSize:11, color:"#555", marginTop:2, fontFamily:"'Manrope',sans-serif" }}>{report.platform} · {report.followers} followers</div>
        </div>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, color:"#FF6B00", fontWeight:700 }}>{report.threatScore}%</div>
            <div style={{ fontSize:9, color:"#444", fontFamily:"'JetBrains Mono',monospace" }}>THREAT</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, color:"#00FFB2", fontWeight:700 }}>{report.opportunityScore}%</div>
            <div style={{ fontSize:9, color:"#444", fontFamily:"'JetBrains Mono',monospace" }}>OPPORTUNITY</div>
          </div>
          <span style={{ color:"#333", fontSize:12 }}>{open?"▲":"▼"}</span>
        </div>
      </div>
      {open && (
        <div style={{ padding:"16px 18px", animation:"fadeIn .3s ease" }}>
          {/* Hook formulas */}
          {report.hookFormulas?.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#444", letterSpacing:2, marginBottom:10 }}>REVERSE-ENGINEERED HOOK FORMULAS</div>
              {report.hookFormulas.map((h,i) => (
                <div key={i} style={{ padding:"10px 13px", background:"#0D0D0D", border:"1px solid #141414", borderRadius:8, marginBottom:6, display:"flex", gap:10, alignItems:"flex-start", animation:`slideR .2s ${i*.05}s ease both` }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:16, color:"#1e1e1e", flexShrink:0 }}>0{i+1}</span>
                  <div>
                    <div style={{ fontSize:12, color:"#ccc", lineHeight:1.5, marginBottom:3, fontFamily:"'Manrope',sans-serif" }}>"{h.formula}"</div>
                    <div style={{ fontSize:10, color:"#FF6B00", fontFamily:"'JetBrains Mono',monospace" }}>avg {h.engRate} engagement · {h.postCount} posts analyzed</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Content gaps */}
          {report.contentGaps?.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#444", letterSpacing:2, marginBottom:10 }}>YOUR CONTENT GAPS VS THIS CREATOR</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {report.contentGaps.map((g,i) => (
                  <div key={i} style={{ padding:"5px 11px", borderRadius:20, background:"#00FFB210", border:"1px solid #00FFB230", fontSize:11, color:"#00FFB2", fontFamily:"'JetBrains Mono',monospace", letterSpacing:.3 }}>
                    + {g}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Power move */}
          {report.powerMove && (
            <div style={{ padding:"12px 14px", background:"#7B61FF10", border:"1px solid #7B61FF25", borderRadius:10, fontSize:12, color:"#9D87FF", lineHeight:1.6, fontFamily:"'Manrope',sans-serif" }}>
              ⚡ <strong>Your power move:</strong> {report.powerMove}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function CompetitorIntelAgent() {
  const [handles,   setHandles]   = useState("");
  const [platform,  setPlatform]  = useState("All");
  const [niche,     setNiche]     = useState("Creator Economy");
  const [state,     setState]     = useState("idle"); // idle|running|done
  const [phase,     setPhase]     = useState(null);
  const [logs,      setLogs]      = useState([]);
  const [reports,   setReports]   = useState([]);
  const [summary,   setSummary]   = useState(null);
  const [trackedList, setTracked] = useState(DEMO_COMPETITORS);
  const [analyzing, setAnalyzing] = useState(false);
  const [addHandle, setAddHandle] = useState("");
  const [filterPlat,setFilter]    = useState("All");

  function log(text, type="info") {
    const time = new Date().toLocaleTimeString("en-US", { hour12:false });
    setLogs(p => [...p, { text, type, time }]);
  }

  async function runScan(targetHandles = null) {
    if (state === "running") return;
    setState("running"); setReports([]); setLogs([]); setSummary(null);

    const targets = targetHandles || trackedList.map(c => c.handle).join(", ");
    log("◈ Competitor Intelligence Agent activated", "system");
    await sleep(300);

    for (const [ph, msg, type, delay] of [
      ["init",    `Initializing scan for: ${targets.slice(0,40)}...`, "system", 500],
      ["profile", "Fetching public profile data...", "system", 600],
      ["content", "Extracting top performing content (last 90 days)...", "system", 700],
      ["content", `${Math.floor(Math.random()*200)+100} posts analyzed`, "hit", 400],
      ["patterns","Running engagement pattern detection...", "system", 600],
      ["patterns","⚠ High-engagement formula cluster detected", "warn", 400],
      ["hooks",   "Reverse-engineering viral hook structures...", "system", 700],
      ["gaps",    "Mapping your content gap opportunities...", "system", 500],
      ["report",  "Generating intelligence report via AI...", "system", 300],
    ]) {
      setPhase(ph); log(msg, type); await sleep(delay);
    }

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are ViralLift's Competitor Intelligence Agent — an elite analyst who reverse-engineers viral content strategies. Respond ONLY with valid JSON:
{
  "reports": [
    {
      "competitor": "string (creator name)",
      "platform": "string",
      "followers": "string",
      "threatScore": number (0-100),
      "opportunityScore": number (0-100),
      "hookFormulas": [
        {"formula":"string (their hook pattern)","engRate":"string","postCount":"string"}
      ],
      "contentGaps": ["string","string","string"],
      "powerMove": "string (specific action you should take to beat them)"
    }
  ],
  "summary": {
    "dominantFormula": "string (the #1 formula working in this niche)",
    "biggestGap": "string (the content angle nobody is owning)",
    "weeklyAction": "string (the single highest-ROI move this week)"
  }
}`,
          messages: [{
            role: "user",
            content: `Analyze these competitors for niche: ${niche}.
Competitors: ${trackedList.slice(0,3).map(c=>`${c.handle} (${c.platform}, ${c.followers} followers)`).join(", ")}.
Generate 3 detailed intelligence reports. Be specific about hook formulas, engagement patterns, and actionable gaps. Make powerMoves genuinely tactical and specific.`,
          }],
        }),
      });
      const d = await res.json();
      const parsed = JSON.parse(d.content.map(c => c.text||"").join("").replace(/```json|```/g,"").trim());

      log(`${parsed.reports?.length} competitor reports generated ✓`, "hit");
      log(`Dominant formula: "${parsed.summary?.dominantFormula?.slice(0,50)}..."`, "system");
      log("Intelligence scan complete ✓", "system");

      setReports(parsed.reports || []);
      setSummary(parsed.summary);
      setState("done");
      setPhase(null);
    } catch(err) {
      log("AI analysis failed — retrying...", "warn");
      setState("idle");
      setPhase(null);
    }
  }

  async function quickAnalyze(competitor) {
    setAnalyzing(true);
    log(`Quick scan: ${competitor.handle}...`, "system");
    await sleep(400);
    log(`Extracting hook patterns from ${competitor.handle}...`, "system");
    await sleep(600);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are ViralLift's Competitor Intelligence Agent. Respond ONLY with valid JSON matching this exact structure:
{
  "reports": [{
    "competitor": "string",
    "platform": "string",
    "followers": "string",
    "threatScore": number,
    "opportunityScore": number,
    "hookFormulas": [{"formula":"string","engRate":"string","postCount":"string"}],
    "contentGaps": ["string","string","string"],
    "powerMove": "string"
  }],
  "summary": {
    "dominantFormula": "string",
    "biggestGap": "string",
    "weeklyAction": "string"
  }
}`,
          messages: [{
            role: "user",
            content: `Deep analysis of ${competitor.handle} (${competitor.platform}, ${competitor.followers} followers, niche: ${competitor.niche}).
Known top hook style: ${competitor.topHook}. Average engagement: ${competitor.avgEng}.
Generate 1 detailed report with 3 hook formulas, 4 content gaps, and a specific power move.`,
          }],
        }),
      });
      const d = await res.json();
      const parsed = JSON.parse(d.content.map(c => c.text||"").join("").replace(/```json|```/g,"").trim());
      log(`Scan complete: ${competitor.handle} ✓`, "hit");

      // Merge into existing reports
      setReports(prev => {
        const exists = prev.findIndex(r => r.competitor === parsed.reports?.[0]?.competitor);
        if (exists >= 0) {
          const updated = [...prev];
          updated[exists] = parsed.reports[0];
          return updated;
        }
        return [...prev, ...(parsed.reports || [])];
      });
      if (!summary && parsed.summary) setSummary(parsed.summary);
    } catch {
      log(`Scan failed for ${competitor.handle}`, "warn");
    }
    setAnalyzing(false);
  }

  function addCompetitor() {
    if (!addHandle.trim()) return;
    const h = addHandle.startsWith("@") ? addHandle : `@${addHandle}`;
    setTracked(p => [...p, { handle:h, name:h, platform:"Twitter/X", followers:"--", growth:"--", avgEng:"--", topHook:"Scanning...", niche:niche }]);
    setAddHandle("");
    log(`Added ${h} to watchlist`, "hit");
  }

  const filtered = filterPlat === "All" ? trackedList : trackedList.filter(c => c.platform === filterPlat);

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", background:"#030303", fontFamily:"'Manrope',sans-serif", color:"#eee" }}>

        {/* Ticker */}
        <div style={{ background:"#FF6B00", padding:"5px 0", overflow:"hidden" }}>
          <div style={{ display:"flex", animation:"ticker 18s linear infinite", whiteSpace:"nowrap", width:"200%" }}>
            {[...Array(2)].map((_,j) => (
              <span key={j} style={{ display:"flex" }}>
                {["COMPETITOR INTEL AGENT ONLINE","REVERSE ENGINEERING ACTIVE","HOOK PATTERN EXTRACTION","CONTENT GAP ANALYSIS","THREAT ASSESSMENT RUNNING"].map((t,i) => (
                  <span key={i} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, color:"#000", padding:"0 36px", letterSpacing:2 }}>◆ {t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <div style={{ maxWidth:1060, margin:"0 auto", padding:"32px 24px 60px" }}>

          {/* Header */}
          <div style={{ marginBottom:28, animation:"fadeUp .4s ease" }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#FF6B00", letterSpacing:4, marginBottom:8 }}>VIRALLIFT OS — COMPETITOR INTEL</div>
            <h1 style={{ fontFamily:"'Exo 2',sans-serif", fontSize:46, fontWeight:900, color:"#fff", lineHeight:1, marginBottom:8, letterSpacing:-1 }}>
              INTELLIGENCE<br/><span style={{ color:"#FF6B00" }}>AGENT</span>
            </h1>
            <p style={{ fontSize:13, color:"#555", maxWidth:440, lineHeight:1.7 }}>
              Monitor top creators. Reverse-engineer their hooks. Steal their gaps. Win.
            </p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:20 }}>

            {/* ── LEFT ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* Radar */}
              <div style={{ background:"#080808", border:"1px solid #141414", borderRadius:14, padding:20, display:"flex", flexDirection:"column", alignItems:"center", animation:"fadeUp .4s .1s ease both" }}>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#444", letterSpacing:2, marginBottom:20 }}>THREAT RADAR</div>
                <RadarScope active={state==="running"} competitors={trackedList}/>
                <div style={{ marginTop:28, width:"100%" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#444", fontFamily:"'JetBrains Mono',monospace", marginBottom:8 }}>
                    <span>TRACKING</span><span style={{ color:"#FF6B00" }}>{trackedList.length} creators</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#444", fontFamily:"'JetBrains Mono',monospace", marginBottom:4 }}>
                    <span>REPORTS</span><span style={{ color:"#00FFB2" }}>{reports.length} generated</span>
                  </div>
                </div>
              </div>

              {/* Niche + Add */}
              <div style={{ background:"#080808", border:"1px solid #141414", borderRadius:14, padding:18, animation:"fadeUp .4s .15s ease both" }}>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#444", letterSpacing:2, marginBottom:10 }}>YOUR NICHE</div>
                <select value={niche} onChange={e=>setNiche(e.target.value)} style={{ width:"100%", background:"#0D0D0D", border:"1px solid #1a1a1a", borderRadius:8, padding:"9px 12px", color:"#eee", fontSize:12, outline:"none", cursor:"pointer", marginBottom:14, fontFamily:"'Manrope',sans-serif" }}>
                  {["Creator Economy","SaaS / Tech","Health & Wellness","Finance","E-commerce","Personal Brand","AI / Future Tech","Fitness"].map(n=><option key={n}>{n}</option>)}
                </select>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#444", letterSpacing:2, marginBottom:8 }}>ADD TO WATCHLIST</div>
                <div style={{ display:"flex", gap:6 }}>
                  <input value={addHandle} onChange={e=>setAddHandle(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCompetitor()} placeholder="@handle" style={{ flex:1, background:"#0D0D0D", border:"1px solid #1a1a1a", borderRadius:8, padding:"8px 11px", color:"#eee", fontSize:12, outline:"none", fontFamily:"'Manrope',sans-serif" }}/>
                  <button onClick={addCompetitor} style={{ padding:"8px 12px", borderRadius:8, background:"#FF6B0015", border:"1px solid #FF6B0040", color:"#FF6B00", fontSize:14, cursor:"pointer" }}>+</button>
                </div>
              </div>

              {/* Scan button */}
              <button onClick={() => runScan()} disabled={state==="running"} style={{
                padding:"15px", background:state==="running"?"#0D0D0D":"linear-gradient(135deg,#FF6B00,#CC4A00)",
                border:"none", borderRadius:12, color:state==="running"?"#333":"#fff",
                fontSize:13, fontWeight:800, cursor:state==="running"?"not-allowed":"pointer",
                fontFamily:"'Exo 2',sans-serif", letterSpacing:1,
                display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                animation:state==="idle"?"borderFlow 2s infinite":"none",
              }}>
                {state==="running"
                  ? <><div style={{ width:14,height:14,border:"2px solid #FF6B00",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite" }}/> SCANNING...</>
                  : state==="done" ? "↺ RE-SCAN ALL" : "▶ LAUNCH INTEL SCAN"}
              </button>

              {/* Log */}
              <div style={{ background:"#080808", border:"1px solid #141414", borderRadius:14, padding:16, animation:"fadeUp .4s .2s ease both" }}>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#444", letterSpacing:2, marginBottom:10, display:"flex", justifyContent:"space-between" }}>
                  <span>AGENT LOG</span>
                  {state==="running"&&<span style={{ color:"#FF6B00", animation:"pulse 1s infinite" }}>● LIVE</span>}
                  {state==="done"&&<span style={{ color:"#00FFB2" }}>✓ COMPLETE</span>}
                </div>
                <Log logs={logs} height={150}/>
              </div>
            </div>

            {/* ── RIGHT ── */}
            <div>

              {/* Summary banner */}
              {summary && (
                <div style={{ background:"linear-gradient(135deg,#FF6B0010,#7B61FF08)", border:"1px solid #FF6B0030", borderRadius:14, padding:"18px 22px", marginBottom:16, position:"relative", overflow:"hidden", animation:"fadeUp .4s ease" }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,#FF6B00,#7B61FF)" }}/>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#FF6B00", letterSpacing:2, marginBottom:12 }}>INTELLIGENCE SUMMARY</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                    {[
                      { label:"DOMINANT FORMULA", value:summary.dominantFormula, color:"#FF6B00" },
                      { label:"BIGGEST GAP",       value:summary.biggestGap,      color:"#00FFB2" },
                      { label:"THIS WEEK'S MOVE",  value:summary.weeklyAction,    color:"#7B61FF" },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#333", letterSpacing:1.5, marginBottom:5 }}>{s.label}</div>
                        <div style={{ fontSize:12, color:s.color, lineHeight:1.5, fontWeight:600 }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Watchlist */}
              <div style={{ background:"#080808", border:"1px solid #141414", borderRadius:14, padding:18, marginBottom:16, animation:"fadeUp .4s .1s ease both" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#444", letterSpacing:2 }}>WATCHLIST</span>
                  <div style={{ display:"flex", gap:5 }}>
                    {PLATFORMS.map(p => (
                      <button key={p} onClick={() => setFilter(p)} style={{
                        padding:"3px 9px", borderRadius:5, cursor:"pointer",
                        background:filterPlat===p?"#FF6B0015":"transparent",
                        border:`1px solid ${filterPlat===p?"#FF6B0040":"#141414"}`,
                        color:filterPlat===p?"#FF6B00":"#333",
                        fontSize:9, fontFamily:"'JetBrains Mono',monospace", letterSpacing:.3,
                        transition:"all .2s",
                      }}>{p}</button>
                    ))}
                  </div>
                </div>

                {/* Table header */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 70px 70px 1fr auto", gap:12, padding:"0 16px", marginBottom:8 }}>
                  {["CREATOR","FOLLOWERS","ENG RATE","NICHE","TOP HOOK",""].map((h,i) => (
                    <span key={i} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#222", letterSpacing:1 }}>{h}</span>
                  ))}
                </div>

                {filtered.map((c, i) => (
                  <CompetitorRow key={c.handle} c={c} index={i} onAnalyze={quickAnalyze} analyzing={analyzing}/>
                ))}
              </div>

              {/* Intel reports */}
              {reports.length > 0 && (
                <div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#444", letterSpacing:2, marginBottom:14 }}>
                    INTELLIGENCE REPORTS — {reports.length} GENERATED
                  </div>
                  {reports.map((r, i) => <IntelCard key={i} report={r} index={i}/>)}
                </div>
              )}

              {/* Empty state */}
              {state==="idle" && !reports.length && (
                <div style={{ background:"#060606", border:"1px dashed #0f0f0f", borderRadius:14, padding:60, textAlign:"center", animation:"fadeUp .5s .3s ease both" }}>
                  <div style={{ fontSize:52, marginBottom:14 }}>🎯</div>
                  <div style={{ fontFamily:"'Exo 2',sans-serif", fontSize:20, color:"#111", fontWeight:700, marginBottom:6 }}>AGENT STANDING BY</div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#1a1a1a", letterSpacing:2 }}>
                    CLICK SCAN TO INFILTRATE COMPETITOR STRATEGIES
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
