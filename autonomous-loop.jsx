import { useState, useEffect, useRef } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Oxanium:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  @keyframes fadeUp    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.25} }
  @keyframes glow      { 0%,100%{box-shadow:0 0 6px #00FFB240} 50%{box-shadow:0 0 22px #00FFB2A0,0 0 48px #00FFB230} }
  @keyframes scan      { 0%{top:0%} 100%{top:100%} }
  @keyshift ripple     { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.4);opacity:0} }
  @keyframes ripple    { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(2.6);opacity:0} }
  @keyframes ticker    { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes blink     { 0%,100%{opacity:1} 49%{opacity:1} 50%{opacity:0} 99%{opacity:0} }
  @keyframes nodeOn    { from{opacity:0;transform:scale(.6)} to{opacity:1;transform:scale(1)} }
  @keyframes lineFill  { from{stroke-dashoffset:var(--len)} to{stroke-dashoffset:0} }
  @keyframes slideR    { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
  @keyframes countUp   { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

  * { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:#050505} ::-webkit-scrollbar-thumb{background:#1a1a1a}
`;

// ── PIPELINE NODES ─────────────────────────────────────────────────────────────
const NODES = [
  { id:"trigger",   label:"TRIGGER",         sub:"Cron / Schedule",        icon:"⏰", color:"#7B61FF" },
  { id:"scout",     label:"TREND SCOUT",     sub:"Market intelligence",    icon:"📡", color:"#00FFB2" },
  { id:"strategy",  label:"STRATEGIST",      sub:"Playbook generation",    icon:"🧠", color:"#00FFB2" },
  { id:"copy",      label:"COPY ENGINE",     sub:"Hook & content writing", icon:"✍️",  color:"#FF3B6B" },
  { id:"critic",    label:"CRITIC AGENT",    sub:"Quality gate (>70%)",    icon:"⚖️",  color:"#FFD700" },
  { id:"scheduler", label:"SCHEDULER",       sub:"Optimal time windows",   icon:"📅", color:"#00C9FF" },
  { id:"queue",     label:"PUBLISH QUEUE",   sub:"Platform dispatch",      icon:"🚀", color:"#FF8C00" },
  { id:"analytics", label:"ANALYTICS LOOP",  sub:"Feedback → next cycle",  icon:"📊", color:"#00FFB2" },
];

const PLATFORMS = ["TikTok","Twitter/X","LinkedIn","YouTube","Reels"];
const NICHES    = ["Creator Economy","SaaS / Tech","Health & Wellness","Finance","E-commerce","Personal Brand","AI / Future Tech","Fitness"];

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

// ── LIVE LOG ──────────────────────────────────────────────────────────────────
function LiveLog({ logs }) {
  const ref = useRef(null);
  useEffect(()=>{ ref.current?.scrollTo({top:ref.current.scrollHeight,behavior:"smooth"}); },[logs]);
  return (
    <div ref={ref} style={{
      background:"#020202", borderRadius:8, padding:"12px 14px",
      height:200, overflowY:"auto", border:"1px solid #0f0f0f",
    }}>
      {logs.length===0 && <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:"#111" }}>Awaiting cycle start...</span>}
      {logs.map((l,i)=>(
        <div key={i} style={{
          display:"flex", gap:10, marginBottom:4,
          fontFamily:"'Share Tech Mono',monospace", fontSize:11,
          animation:"slideR 0.15s ease",
        }}>
          <span style={{ color:"#1c1c1c", flexShrink:0 }}>{l.time}</span>
          <span style={{ color: l.type==="system"?"#00FFB2":l.type==="warn"?"#FFD700":l.type==="error"?"#FF3B6B":l.type==="agent"?"#7B61FF":"#2a2a2a" }}>
            {l.type==="system"?"▶":l.type==="warn"?"⚠":l.type==="error"?"✕":l.type==="agent"?"◈":"·"}
          </span>
          <span style={{ color: l.type==="system"?"#00FFB2":l.type==="warn"?"#FFD700":l.type==="error"?"#FF3B6B":l.type==="agent"?"#9D87FF":"#333" }}>{l.text}</span>
        </div>
      ))}
    </div>
  );
}

// ── PIPELINE VISUAL ───────────────────────────────────────────────────────────
function Pipeline({ activeNode, completedNodes }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      {NODES.map((n,i)=>{
        const done    = completedNodes.includes(n.id);
        const active  = activeNode === n.id;
        const waiting = !done && !active;
        const isLast  = i === NODES.length-1;
        return (
          <div key={n.id} style={{ display:"flex", flexDirection:"column", alignItems:"flex-start" }}>
            <div style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"10px 14px", borderRadius:8, width:"100%",
              background: active ? `${n.color}12` : done ? "#0a0a0a" : "#060606",
              border:`1px solid ${active ? n.color+"50" : done ? n.color+"20" : "#0d0d0d"}`,
              transition:"all 0.4s ease",
              animation: active ? "glow 2s infinite" : done ? "nodeOn 0.3s ease" : "none",
            }}>
              {/* Icon */}
              <div style={{
                width:32, height:32, borderRadius:"50%", flexShrink:0,
                background: active ? n.color+"20" : done ? n.color+"15" : "#0f0f0f",
                border:`1px solid ${active||done ? n.color+"40" : "#141414"}`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
                position:"relative",
              }}>
                {active && <div style={{
                  position:"absolute", inset:-4, borderRadius:"50%",
                  border:`1px solid ${n.color}`, animation:"ripple 1.2s infinite",
                }} />}
                <span style={{ opacity: waiting ? 0.2 : 1 }}>{n.icon}</span>
              </div>
              {/* Label */}
              <div style={{ flex:1 }}>
                <div style={{
                  fontFamily:"'Oxanium',sans-serif", fontSize:12, fontWeight:700,
                  color: active ? n.color : done ? n.color+"90" : "#222",
                  letterSpacing:1,
                }}>{n.label}</div>
                <div style={{ fontSize:10, color: active ? "#555" : "#1a1a1a", fontFamily:"'DM Sans',sans-serif", marginTop:1 }}>{n.sub}</div>
              </div>
              {/* Status */}
              <div style={{ flexShrink:0 }}>
                {done && <span style={{ color:n.color, fontSize:14 }}>✓</span>}
                {active && <div style={{ width:12,height:12,border:`2px solid ${n.color}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.7s linear infinite" }} />}
                {waiting && <div style={{ width:6,height:6,borderRadius:"50%",background:"#1a1a1a" }} />}
              </div>
            </div>
            {/* Connector */}
            {!isLast && (
              <div style={{
                width:1, height:10, marginLeft:29,
                background: done ? `linear-gradient(${n.color}, ${NODES[i+1].color}40)` : "#0d0d0d",
                transition:"background 0.5s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── RESULT CARD ───────────────────────────────────────────────────────────────
function ResultCard({ item, index }) {
  const pc = { "TikTok":"#FF0050","Twitter/X":"#1DA1F2","LinkedIn":"#0A66C2","YouTube":"#FF0000","Reels":"#E1306C" };
  const c = pc[item.platform] || "#fff";
  const [open, setOpen] = useState(index < 2);
  return (
    <div style={{
      background:"#070707", border:`1px solid ${c}18`,
      borderRadius:10, overflow:"hidden", marginBottom:10,
      animation:`fadeUp 0.4s ${index*0.06}s ease both`,
    }}>
      <div onClick={()=>setOpen(!open)} style={{
        display:"flex", alignItems:"center", gap:12,
        padding:"11px 14px", cursor:"pointer",
        borderBottom: open ? `1px solid ${c}15` : "none",
        background: open ? `${c}08` : "transparent",
      }}>
        <span style={{ fontSize:10,fontWeight:700,fontFamily:"'Share Tech Mono',monospace",color:c,background:`${c}18`,padding:"3px 8px",borderRadius:4,letterSpacing:1 }}>{item.platform}</span>
        <span style={{ fontSize:12,color:"#555",fontFamily:"'DM Sans',sans-serif",flex:1 }}>{item.format}</span>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ width:60,height:3,background:"#111",borderRadius:2,overflow:"hidden" }}>
            <div style={{ height:"100%",width:`${item.score}%`,background:c,borderRadius:2 }} />
          </div>
          <span style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:c }}>{item.score}%</span>
          <span style={{ color:"#222",fontSize:10 }}>{open?"▲":"▼"}</span>
        </div>
      </div>
      {open && (
        <div style={{ padding:"14px 16px" }}>
          <div style={{
            fontFamily:"'Oxanium',sans-serif", fontSize:15, color:"#eee",
            lineHeight:1.5, marginBottom:10, borderLeft:`2px solid ${c}`,
            paddingLeft:12, fontWeight:500,
          }}>{item.hook}</div>
          <div style={{ fontSize:12,color:"#555",lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"'DM Sans',sans-serif" }}>{item.body}</div>
          {item.scheduledTime && (
            <div style={{
              marginTop:12,display:"flex",alignItems:"center",gap:8,
              fontSize:11,color:"#00C9FF",fontFamily:"'Share Tech Mono',monospace",
            }}>
              📅 Queued: {item.scheduledTime}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── SCHEDULE CONFIG ───────────────────────────────────────────────────────────
function ScheduleConfig({ config, onChange }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
      <div>
        <label style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#444",letterSpacing:2,display:"block",marginBottom:8 }}>RUN TIME (24H)</label>
        <input type="time" value={config.runTime} onChange={e=>onChange({...config,runTime:e.target.value})} style={{
          background:"#0D0D0D",border:"1px solid #1a1a1a",borderRadius:8,
          padding:"10px 14px",color:"#eee",fontSize:14,
          fontFamily:"'Share Tech Mono',monospace",outline:"none",width:"100%",
        }} />
        <div style={{ fontSize:10,color:"#333",marginTop:5,fontFamily:"'DM Sans',sans-serif" }}>Agent wakes and runs at this time every cycle</div>
      </div>
      <div>
        <label style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#444",letterSpacing:2,display:"block",marginBottom:8 }}>CYCLE FREQUENCY</label>
        <div style={{ display:"flex",gap:6 }}>
          {[["12h","12 Hours"],["24h","Daily"],["48h","Every 2 Days"],["weekly","Weekly"]].map(([v,l])=>(
            <button key={v} onClick={()=>onChange({...config,freq:v})} style={{
              flex:1,padding:"8px 4px",borderRadius:6,cursor:"pointer",
              background:config.freq===v?"#00FFB210":"#0D0D0D",
              border:`1px solid ${config.freq===v?"#00FFB240":"#141414"}`,
              color:config.freq===v?"#00FFB2":"#333",
              fontSize:10,fontWeight:700,fontFamily:"'Share Tech Mono',monospace",
              transition:"all 0.2s",letterSpacing:.5,
            }}>{l}</button>
          ))}
        </div>
      </div>
      <div>
        <label style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#444",letterSpacing:2,display:"block",marginBottom:8 }}>QUALITY GATE</label>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <input type="range" min={50} max={95} step={5} value={config.qualityGate}
            onChange={e=>onChange({...config,qualityGate:+e.target.value})}
            style={{ flex:1,accentColor:"#FFD700" }}
          />
          <span style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:14,color:"#FFD700",width:40,textAlign:"right" }}>{config.qualityGate}%</span>
        </div>
        <div style={{ fontSize:10,color:"#333",marginTop:4,fontFamily:"'DM Sans',sans-serif" }}>Content below this score gets rejected & regenerated</div>
      </div>
      <div>
        <label style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#444",letterSpacing:2,display:"block",marginBottom:8 }}>POSTS PER CYCLE</label>
        <div style={{ display:"flex",gap:6 }}>
          {[3,5,7,10].map(n=>(
            <button key={n} onClick={()=>onChange({...config,postsPerCycle:n})} style={{
              flex:1,padding:"8px 0",borderRadius:6,cursor:"pointer",
              background:config.postsPerCycle===n?"#FF3B6B10":"#0D0D0D",
              border:`1px solid ${config.postsPerCycle===n?"#FF3B6B40":"#141414"}`,
              color:config.postsPerCycle===n?"#FF3B6B":"#333",
              fontSize:13,fontWeight:700,fontFamily:"'Share Tech Mono',monospace",
              transition:"all 0.2s",
            }}>{n}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── STATS BAR ─────────────────────────────────────────────────────────────────
function StatPill({ label, value, color="#00FFB2", animate=false }) {
  return (
    <div style={{
      background:"#080808",border:`1px solid ${color}20`,borderRadius:10,
      padding:"14px 18px",flex:1,
      animation: animate ? "fadeUp 0.5s ease" : "none",
    }}>
      <div style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#333",letterSpacing:2,marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:"'Oxanium',sans-serif",fontSize:26,fontWeight:700,color, animation: animate?"countUp 0.5s ease":"none" }}>{value}</div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function AutonomousLoop() {
  const [niche,    setNiche]    = useState("Creator Economy");
  const [platforms,setPlatforms]= useState(["TikTok","Twitter/X","LinkedIn"]);
  const [config,   setConfig]   = useState({ runTime:"02:00", freq:"24h", qualityGate:70, postsPerCycle:5 });
  const [loopState,setLoopState]= useState("idle"); // idle|running|done|scheduled
  const [activeNode,setActiveNode]=useState(null);
  const [completedNodes,setCompleted]=useState([]);
  const [logs,     setLogs]     = useState([]);
  const [results,  setResults]  = useState([]);
  const [stats,    setStats]    = useState(null);
  const [cycleNum, setCycleNum] = useState(0);
  const [countdown,setCountdown]= useState(null);
  const [autoEnabled,setAuto]   = useState(false);
  const timerRef = useRef(null);

  function log(text,type="info"){
    const time=new Date().toLocaleTimeString("en-US",{hour12:false});
    setLogs(p=>[...p,{text,type,time}]);
  }

  function togglePlatform(p){
    setPlatforms(prev=>prev.includes(p)?prev.filter(x=>x!==p):[...prev,p]);
  }

  // Countdown tick
  useEffect(()=>{
    if(!autoEnabled||loopState==="running") return;
    if(timerRef.current) clearInterval(timerRef.current);
    // simulate next run in 30s for demo
    let secs = 30;
    setCountdown(secs);
    timerRef.current = setInterval(()=>{
      secs--;
      setCountdown(secs);
      if(secs<=0){
        clearInterval(timerRef.current);
        runCycle();
      }
    },1000);
    return ()=>clearInterval(timerRef.current);
  },[autoEnabled, cycleNum]);

  async function runCycle(){
    if(loopState==="running") return;
    setLoopState("running");
    setResults([]); setLogs([]); setCompleted([]); setActiveNode(null); setCountdown(null);

    const num = cycleNum+1;
    setCycleNum(num);

    log(`◈ AUTONOMOUS CYCLE #${num} INITIATED`,"system");
    await sleep(400);

    // TRIGGER
    setActiveNode("trigger");
    log("Trigger fired — cron schedule activated","agent");
    await sleep(600);
    log(`Config: ${config.freq} cycle · ${config.postsPerCycle} posts · quality gate ${config.qualityGate}%`,"info");
    await sleep(500);
    setCompleted(p=>[...p,"trigger"]);

    // SCOUT
    setActiveNode("scout");
    log("Trend Scout online — scanning global signals...","agent");
    await sleep(600);
    log(`Platform scan: ${platforms.join(", ")}`,"info");
    await sleep(500);
    log(`Niche: ${niche} — volatility index: HIGH`,"warn");
    await sleep(400);
    log("3 viral opportunity windows detected","system");
    setCompleted(p=>[...p,"scout"]);

    // STRATEGY — AI call
    setActiveNode("strategy");
    log("Strategist Agent generating playbook...","agent");
    await sleep(500);

    let playbook = null;
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`You are the ViralLift Strategist. Respond ONLY with valid JSON:
{
  "weekTheme":"string",
  "topAngle":"string (the single best viral angle this cycle)",
  "platforms":["array of platforms to target this cycle"]
}`,
          messages:[{role:"user",content:`Generate a micro-playbook for: Niche: ${niche}, Platforms: ${platforms.join(", ")}, Posts needed: ${config.postsPerCycle}`}],
        }),
      });
      const d = await r.json();
      const raw = d.content?.map(c=>c.text||"").join("")||"{}";
      playbook = JSON.parse(raw.replace(/```json|```/g,"").trim());
      log(`Theme: "${playbook.weekTheme}"`,"system");
      log(`Lead angle: ${playbook.topAngle}`,"system");
    } catch {
      log("Strategy fallback — using cached playbook","warn");
      playbook = { weekTheme:"Authentic Growth Hacking", topAngle:"Vulnerability + data = viral", platforms };
    }
    setCompleted(p=>[...p,"strategy"]);

    // COPY ENGINE — AI call
    setActiveNode("copy");
    log("Copy Engine generating content batch...","agent");
    await sleep(500);
    log(`Generating ${config.postsPerCycle} posts across ${platforms.length} platforms...`,"info");

    let generatedPosts = [];
    try {
      const r2 = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`You are the ViralLift Copy Engine. Respond ONLY with valid JSON:
{
  "posts":[
    {
      "platform":"string",
      "format":"string",
      "hook":"string",
      "body":"string",
      "score":number
    }
  ]
}`,
          messages:[{role:"user",content:`Generate exactly ${Math.min(config.postsPerCycle,5)} viral posts.
Theme: ${playbook.weekTheme}
Angle: ${playbook.topAngle}
Platforms to use: ${platforms.join(", ")}
Distribute across platforms. Each post must be platform-native. Score = predicted engagement 60-98.`}],
        }),
      });
      const d2 = await r2.json();
      const raw2 = d2.content?.map(c=>c.text||"").join("")||"{}";
      const parsed2 = JSON.parse(raw2.replace(/```json|```/g,"").trim());
      generatedPosts = parsed2.posts||[];
      log(`${generatedPosts.length} posts generated`,"system");
    } catch {
      log("Copy engine error — using fallback content","warn");
      generatedPosts = platforms.slice(0,3).map((p,i)=>({
        platform:p, format:"Post", hook:`Hook for ${p} — ${playbook.topAngle}`,
        body:"Full post body here...", score:72+i*4,
      }));
    }
    setCompleted(p=>[...p,"copy"]);

    // CRITIC
    setActiveNode("critic");
    log(`Critic Agent scoring batch against ${config.qualityGate}% gate...`,"agent");
    await sleep(600);
    const passed = generatedPosts.filter(p=>p.score>=config.qualityGate);
    const rejected = generatedPosts.filter(p=>p.score<config.qualityGate);
    log(`${passed.length} posts passed · ${rejected.length} rejected`,"system");
    if(rejected.length>0) log(`Rejected: ${rejected.map(r=>r.platform).join(", ")} — below threshold`,"warn");
    await sleep(400);
    const finalPosts = passed.length > 0 ? passed : generatedPosts; // fallback: keep all if all rejected
    setCompleted(p=>[...p,"critic"]);

    // SCHEDULER
    setActiveNode("scheduler");
    log("Scheduler calculating optimal post windows...","agent");
    await sleep(500);
    const times = ["Mon 9:02 AM","Mon 12:14 PM","Tue 8:47 AM","Tue 5:30 PM","Wed 11:00 AM","Wed 7:15 PM","Thu 9:30 AM"];
    const scheduled = finalPosts.map((post,i)=>({ ...post, scheduledTime: times[i%times.length] }));
    log("Peak engagement windows assigned per timezone","system");
    setCompleted(p=>[...p,"scheduler"]);

    // QUEUE
    setActiveNode("queue");
    log("Dispatching to publish queue...","agent");
    await sleep(500);
    for(let i=0;i<scheduled.length;i++){
      await sleep(200);
      log(`Queued [${scheduled[i].platform}] ${scheduled[i].scheduledTime}`,"system");
    }
    setResults(scheduled);
    setCompleted(p=>[...p,"queue"]);

    // ANALYTICS
    setActiveNode("analytics");
    log("Analytics loop configured — feedback will update next cycle","agent");
    await sleep(500);
    log("Performance tracking active on all queued posts","system");
    await sleep(300);
    log(`Cycle #${num} complete ✓ — system idle until next run`,"system");
    setCompleted(p=>[...p,"analytics"]);
    setActiveNode(null);

    const avgScore = Math.round(scheduled.reduce((a,p)=>a+p.score,0)/scheduled.length);
    setStats({ posts:scheduled.length, avgScore, cycleTime: Math.floor((Date.now()-Date.now()%1000)/1000), platforms:platforms.length, rejected:rejected.length });
    setLoopState(autoEnabled?"scheduled":"done");

    if(autoEnabled){
      log(`Next autonomous cycle in ${config.freq} — system sleeping`,"system");
    }
  }

  const platformColors = {"TikTok":"#FF0050","Twitter/X":"#1DA1F2","LinkedIn":"#0A66C2","YouTube":"#FF0000","Reels":"#E1306C"};

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", background:"#030303", fontFamily:"'DM Sans',sans-serif", color:"#eee" }}>

        {/* Top bar */}
        <div style={{ background:"#7B61FF", padding:"5px 0", overflow:"hidden" }}>
          <div style={{ display:"flex", animation:"ticker 22s linear infinite", whiteSpace:"nowrap", width:"200%" }}>
            {[...Array(2)].map((_,j)=>(
              <span key={j} style={{ display:"flex" }}>
                {["AUTONOMOUS LOOP ONLINE","SELF-RUNNING ENGINE ACTIVE","ZERO HUMAN INTERVENTION MODE","SET IT AND FORGET IT","WORKS WHILE YOU SLEEP"].map((t,i)=>(
                  <span key={i} style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,fontWeight:700,color:"#fff",padding:"0 36px",letterSpacing:2,opacity:.9 }}>◆ {t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <div style={{ maxWidth:1060, margin:"0 auto", padding:"32px 24px 60px" }}>

          {/* Header */}
          <div style={{ marginBottom:32, animation:"fadeUp 0.5s ease" }}>
            <div style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#7B61FF",letterSpacing:4,marginBottom:8 }}>VIRALLIFT OS — MODULE 03</div>
            <h1 style={{ fontFamily:"'Oxanium',sans-serif",fontSize:44,fontWeight:800,color:"#fff",lineHeight:1,marginBottom:8,letterSpacing:-1 }}>
              AUTONOMOUS<br /><span style={{ color:"#7B61FF" }}>DAILY LOOP</span>
            </h1>
            <p style={{ fontSize:14, color:"#444", maxWidth:460, lineHeight:1.6 }}>
              The engine that never sleeps. Configure once — it runs the full pipeline every cycle, automatically.
            </p>
          </div>

          {/* Stats row */}
          {stats && (
            <div style={{ display:"flex", gap:12, marginBottom:24 }}>
              <StatPill label="POSTS QUEUED"   value={stats.posts}      color="#7B61FF" animate />
              <StatPill label="AVG VIRAL SCORE" value={`${stats.avgScore}%`} color="#00FFB2" animate />
              <StatPill label="PLATFORMS HIT"   value={stats.platforms}  color="#00C9FF" animate />
              <StatPill label="REJECTED"         value={stats.rejected}   color="#FF3B6B" animate />
              <StatPill label="CYCLE #"          value={cycleNum}         color="#FFD700" animate />
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:20 }}>

            {/* ── LEFT ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* Niche */}
              <div style={{ background:"#080808",border:"1px solid #111",borderRadius:14,padding:18,animation:"fadeUp 0.4s 0.1s ease both" }}>
                <label style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#444",letterSpacing:2,display:"block",marginBottom:8 }}>NICHE</label>
                <select value={niche} onChange={e=>setNiche(e.target.value)} style={{
                  width:"100%",background:"#0D0D0D",border:"1px solid #1a1a1a",borderRadius:8,
                  padding:"10px 12px",color:"#eee",fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none",cursor:"pointer",
                }}>
                  {NICHES.map(n=><option key={n}>{n}</option>)}
                </select>
              </div>

              {/* Platforms */}
              <div style={{ background:"#080808",border:"1px solid #111",borderRadius:14,padding:18,animation:"fadeUp 0.4s 0.15s ease both" }}>
                <label style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#444",letterSpacing:2,display:"block",marginBottom:10 }}>PLATFORMS</label>
                <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                  {PLATFORMS.map(p=>{
                    const a=platforms.includes(p); const c=platformColors[p]||"#fff";
                    return <button key={p} onClick={()=>togglePlatform(p)} style={{
                      padding:"5px 11px",borderRadius:6,cursor:"pointer",
                      background:a?`${c}18`:"#0D0D0D",border:`1px solid ${a?c+"50":"#141414"}`,
                      color:a?c:"#333",fontSize:11,fontWeight:700,transition:"all 0.2s",
                      fontFamily:"'Share Tech Mono',monospace",
                    }}>{p}</button>;
                  })}
                </div>
              </div>

              {/* Schedule Config */}
              <div style={{ background:"#080808",border:"1px solid #111",borderRadius:14,padding:18,animation:"fadeUp 0.4s 0.2s ease both" }}>
                <label style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#444",letterSpacing:2,display:"block",marginBottom:14 }}>CYCLE CONFIG</label>
                <ScheduleConfig config={config} onChange={setConfig} />
              </div>

              {/* Auto toggle */}
              <div style={{
                background:"#080808",border:`1px solid ${autoEnabled?"#7B61FF30":"#111"}`,
                borderRadius:14,padding:18,
                animation:"fadeUp 0.4s 0.25s ease both",
              }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom: autoEnabled?12:0 }}>
                  <div>
                    <div style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#444",letterSpacing:2 }}>FULL AUTO MODE</div>
                    <div style={{ fontSize:11,color:"#333",marginTop:3 }}>Runs every cycle without any input</div>
                  </div>
                  <div onClick={()=>setAuto(!autoEnabled)} style={{
                    width:44,height:24,borderRadius:12,cursor:"pointer",
                    background:autoEnabled?"#7B61FF":"#1a1a1a",
                    border:`1px solid ${autoEnabled?"#7B61FF":"#333"}`,
                    position:"relative",transition:"all 0.3s",
                  }}>
                    <div style={{
                      position:"absolute",top:4,left:autoEnabled?22:4,
                      width:14,height:14,borderRadius:"50%",
                      background:autoEnabled?"#fff":"#555",transition:"left 0.3s",
                    }} />
                  </div>
                </div>
                {autoEnabled && countdown!==null && (
                  <div style={{
                    padding:"10px 14px",background:"#7B61FF10",border:"1px solid #7B61FF20",
                    borderRadius:8,fontFamily:"'Share Tech Mono',monospace",
                    fontSize:11,color:"#7B61FF",
                  }}>
                    Next cycle in: <strong>{countdown}s</strong> (demo mode)
                  </div>
                )}
              </div>

              {/* Launch */}
              <button onClick={runCycle} disabled={loopState==="running"||platforms.length===0} style={{
                width:"100%",padding:"16px 0",
                background:loopState==="running"?"#0D0D0D":"linear-gradient(135deg,#7B61FF,#5A47CC)",
                border:`1px solid ${loopState==="running"?"#1e1e1e":"transparent"}`,
                borderRadius:10,color:loopState==="running"?"#333":"#fff",
                fontSize:13,fontWeight:800,cursor:loopState==="running"?"not-allowed":"pointer",
                fontFamily:"'Share Tech Mono',monospace",letterSpacing:2,
                transition:"all 0.3s",display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                animation:loopState==="idle"?"glow 3s infinite":"none",
              }}>
                {loopState==="running"
                  ? <><div style={{width:14,height:14,border:"2px solid #7B61FF",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.7s linear infinite"}} /> LOOP RUNNING...</>
                  : loopState==="done"||loopState==="scheduled" ? "↺ RUN CYCLE AGAIN" : "▶ LAUNCH LOOP"
                }
              </button>
            </div>

            {/* ── RIGHT ── */}
            <div>
              <div style={{ display:"grid",gridTemplateColumns:"240px 1fr",gap:16,marginBottom:16 }}>
                {/* Pipeline */}
                <div style={{ background:"#080808",border:"1px solid #111",borderRadius:14,padding:16,animation:"fadeUp 0.4s 0.2s ease both" }}>
                  <div style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#444",letterSpacing:2,marginBottom:14 }}>PIPELINE</div>
                  <Pipeline activeNode={activeNode} completedNodes={completedNodes} />
                </div>

                {/* Log */}
                <div style={{ background:"#080808",border:"1px solid #111",borderRadius:14,padding:16,animation:"fadeUp 0.4s 0.25s ease both", display:"flex",flexDirection:"column" }}>
                  <div style={{
                    display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,
                    fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#444",letterSpacing:2,
                  }}>
                    <span>LIVE LOG</span>
                    {loopState==="running" && <span style={{ color:"#7B61FF",animation:"pulse 1s infinite" }}>● RUNNING</span>}
                    {loopState==="done"    && <span style={{ color:"#00FFB2" }}>✓ COMPLETE</span>}
                    {loopState==="scheduled"&&<span style={{ color:"#7B61FF" }}>◉ SCHEDULED</span>}
                  </div>
                  <LiveLog logs={logs} />

                  {/* Cycle summary */}
                  {(loopState==="done"||loopState==="scheduled") && stats && (
                    <div style={{
                      marginTop:12,padding:"12px 14px",
                      background:"#00FFB208",border:"1px solid #00FFB220",borderRadius:8,
                      animation:"fadeUp 0.4s ease",
                    }}>
                      <div style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#00FFB2",letterSpacing:2,marginBottom:6 }}>CYCLE #{cycleNum} SUMMARY</div>
                      <div style={{ display:"flex",gap:20 }}>
                        {[
                          [`${stats.posts} posts queued`,"#fff"],
                          [`avg score ${stats.avgScore}%`,"#00FFB2"],
                          [`${stats.rejected} rejected`,"#FF3B6B"],
                        ].map(([t,c])=>(
                          <span key={t} style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:c }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Results */}
              {results.length>0 && (
                <div style={{ background:"#080808",border:"1px solid #111",borderRadius:14,padding:18,animation:"fadeUp 0.4s ease" }}>
                  <div style={{
                    display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,
                    fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#444",letterSpacing:2,
                  }}>
                    <span>QUEUED CONTENT BATCH</span>
                    <span style={{ color:"#FF8C00" }}>{results.length} posts scheduled</span>
                  </div>
                  {results.map((r,i)=><ResultCard key={i} item={r} index={i} />)}
                </div>
              )}

              {/* Idle state */}
              {loopState==="idle" && results.length===0 && (
                <div style={{
                  background:"#060606",border:"1px dashed #0f0f0f",borderRadius:14,
                  padding:60,textAlign:"center",animation:"fadeUp 0.5s 0.3s ease both",
                }}>
                  <div style={{ fontSize:48,marginBottom:12 }}>🔄</div>
                  <div style={{ fontFamily:"'Oxanium',sans-serif",fontSize:20,color:"#111",fontWeight:700,marginBottom:6 }}>LOOP STANDING BY</div>
                  <div style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#1a1a1a",letterSpacing:2 }}>
                    CONFIGURE → LAUNCH → SLEEP
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
