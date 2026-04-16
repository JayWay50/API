import { useState, useEffect, useRef } from "react";

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.2} }
  @keyframes glow      { 0%,100%{box-shadow:0 0 8px #00FFB250} 50%{box-shadow:0 0 28px #00FFB2B0,0 0 56px #00FFB230} }
  @keyframes ticker    { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes ripple    { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(2.4);opacity:0} }
  @keyframes slideR    { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
  @keyframes barGrow   { from{width:0} to{width:var(--w)} }
  @keyframes navGlow   { 0%,100%{box-shadow:none} 50%{box-shadow:0 0 16px var(--nc)} }
  @keyframes countIn   { from{opacity:0;transform:scale(.8)} to{opacity:1;transform:scale(1)} }

  * { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:#040404} ::-webkit-scrollbar-thumb{background:#1a1a1a;border-radius:2px}
  textarea,input,select{font-family:'DM Sans',sans-serif}
`;

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const NAV = [
  {id:"dashboard", label:"Dashboard",   icon:"⚡", color:"#00FFB2"},
  {id:"strategy",  label:"Strategist",  icon:"📡", color:"#7B61FF"},
  {id:"copy",      label:"Copy Engine", icon:"✍️",  color:"#FF3B6B"},
  {id:"loop",      label:"Auto Loop",   icon:"🔄", color:"#FFD700"},
  {id:"analytics", label:"Analytics",   icon:"📊", color:"#00C9FF"},
];

const PLATFORMS = ["TikTok","Twitter/X","LinkedIn","YouTube","Reels"];
const NICHES    = ["Creator Economy","SaaS / Tech","Health & Wellness","Finance","E-commerce","Personal Brand","AI / Future Tech","Fitness"];
const FORMULAS  = [
  {id:"curiosity",label:"Curiosity Gap",emoji:"🕳️"},
  {id:"contrarian",label:"Contrarian",emoji:"🔥"},
  {id:"vulnerability",label:"Vulnerability",emoji:"💔"},
  {id:"data_shock",label:"Data Shock",emoji:"📊"},
  {id:"story",label:"Story Arc",emoji:"🎬"},
];
const PIPELINE_NODES = [
  {id:"trigger",label:"TRIGGER",icon:"⏰",color:"#7B61FF"},
  {id:"scout",label:"TREND SCOUT",icon:"📡",color:"#00FFB2"},
  {id:"strategy",label:"STRATEGIST",icon:"🧠",color:"#00FFB2"},
  {id:"copy",label:"COPY ENGINE",icon:"✍️",color:"#FF3B6B"},
  {id:"critic",label:"CRITIC",icon:"⚖️",color:"#FFD700"},
  {id:"scheduler",label:"SCHEDULER",icon:"📅",color:"#00C9FF"},
  {id:"queue",label:"PUBLISH",icon:"🚀",color:"#FF8C00"},
  {id:"analytics",label:"ANALYTICS",icon:"📊",color:"#00FFB2"},
];

const PC = {"TikTok":"#FF0050","Twitter/X":"#1DA1F2","LinkedIn":"#0A66C2","YouTube":"#FF0000","Reels":"#E1306C"};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Spinner({color="#00FFB2",size=14}){
  return <div style={{width:size,height:size,border:`2px solid ${color}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.7s linear infinite",flexShrink:0}}/>;
}
function Dot({color,active=false}){
  return <div style={{width:8,height:8,borderRadius:"50%",background:color,boxShadow:active?`0 0 8px ${color}`:undefined,animation:active?"pulse 1.5s infinite":undefined,flexShrink:0}}/>;
}
function Tag({label,color}){
  return <span style={{fontSize:10,fontWeight:700,fontFamily:"'Space Mono',monospace",color,background:`${color}18`,padding:"2px 8px",borderRadius:4,letterSpacing:.5,flexShrink:0}}>{label}</span>;
}
function CopyBtn({text}){
  const [ok,setOk]=useState(false);
  return <button onClick={()=>{navigator.clipboard.writeText(text);setOk(true);setTimeout(()=>setOk(false),2000);}} style={{background:ok?"#00FFB215":"#0D0D0D",border:`1px solid ${ok?"#00FFB230":"#1e1e1e"}`,borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:10,fontFamily:"'Space Mono',monospace",color:ok?"#00FFB2":"#444",transition:"all .2s",letterSpacing:.5}}>{ok?"✓":"COPY"}</button>;
}
function SectionHead({label,color="#00FFB2",right}){
  return <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
    <span style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#444",letterSpacing:2}}>{label}</span>
    {right}
  </div>;
}
function Card({children,style={},glow}){
  return <div style={{background:"#080808",border:"1px solid #141414",borderRadius:14,padding:20,...style,animation:glow?"glow 3s infinite":undefined}}>{children}</div>;
}

// ─── LOG COMPONENT ────────────────────────────────────────────────────────────
function Log({logs,height=160}){
  const ref=useRef(null);
  useEffect(()=>{ref.current?.scrollTo({top:ref.current.scrollHeight,behavior:"smooth"});},[logs]);
  return <div ref={ref} style={{background:"#020202",borderRadius:8,padding:"10px 12px",height,overflowY:"auto",border:"1px solid #0a0a0a"}}>
    {!logs.length&&<span style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#111"}}>Standby...</span>}
    {logs.map((l,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:3,fontFamily:"'Space Mono',monospace",fontSize:10,animation:"slideR .15s ease"}}>
      <span style={{color:"#1a1a1a",flexShrink:0}}>{l.time}</span>
      <span style={{color:l.type==="system"?"#00FFB2":l.type==="warn"?"#FFD700":l.type==="error"?"#FF3B6B":l.type==="agent"?"#7B61FF":"#252525"}}>
        {l.type==="system"?"▶":l.type==="warn"?"⚠":l.type==="error"?"✕":l.type==="agent"?"◈":"·"}
      </span>
      <span style={{color:l.type==="system"?"#00FFB2":l.type==="warn"?"#FFD700":l.type==="error"?"#FF3B6B":l.type==="agent"?"#9D87FF":"#2e2e2e"}}>{l.text}</span>
    </div>)}
  </div>;
}

// ─── PIPELINE ─────────────────────────────────────────────────────────────────
function Pipeline({active,done}){
  return <div style={{display:"flex",flexDirection:"column",gap:0}}>
    {PIPELINE_NODES.map((n,i)=>{
      const isDone=done.includes(n.id),isActive=active===n.id,isLast=i===PIPELINE_NODES.length-1;
      return <div key={n.id} style={{display:"flex",flexDirection:"column",alignItems:"flex-start"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,width:"100%",
          background:isActive?`${n.color}12`:isDone?"#0a0a0a":"#060606",
          border:`1px solid ${isActive?n.color+"50":isDone?n.color+"20":"#0d0d0d"}`,
          transition:"all .4s",
        }}>
          <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,
            background:isActive?n.color+"20":isDone?n.color+"12":"#0f0f0f",
            border:`1px solid ${isActive||isDone?n.color+"40":"#141414"}`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,position:"relative",
          }}>
            {isActive&&<div style={{position:"absolute",inset:-3,borderRadius:"50%",border:`1px solid ${n.color}`,animation:"ripple 1.2s infinite"}}/>}
            <span style={{opacity:(!isDone&&!isActive)?.15:1}}>{n.icon}</span>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:.5,
              color:isActive?n.color:isDone?n.color+"80":"#1e1e1e"}}>{n.label}</div>
          </div>
          {isDone&&<span style={{color:n.color,fontSize:12,flexShrink:0}}>✓</span>}
          {isActive&&<Spinner color={n.color} size={12}/>}
        </div>
        {!isLast&&<div style={{width:1,height:8,marginLeft:26,background:isDone?`linear-gradient(${n.color},${PIPELINE_NODES[i+1].color}40)`:"#0d0d0d",transition:"background .5s"}}/>}
      </div>;
    })}
  </div>;
}

// ─── DASHBOARD MODULE ─────────────────────────────────────────────────────────
function Dashboard({globalState,setView}){
  const metrics=[
    {label:"Impressions",  value:"2.4M",  delta:"+18%", color:"#00FFB2"},
    {label:"Engagements",  value:"184K",  delta:"+32%", color:"#FF3B6B"},
    {label:"Shares",       value:"41K",   delta:"+61%", color:"#FFD700"},
    {label:"Conversions",  value:"3,820", delta:"+24%", color:"#7B61FF"},
  ];
  const campaigns=[
    {name:"Growth Hack Wave #1",platform:"Twitter/X",score:94,stage:4,status:"Live"},
    {name:"LinkedIn Authority Play",platform:"LinkedIn",score:81,stage:3,status:"Review"},
    {name:"TikTok Viral Storm",platform:"TikTok",score:67,stage:2,status:"Running"},
  ];
  const stages=["Strategy","Hooks","Copy","Review","Live"];

  return <div style={{animation:"fadeUp .4s ease"}}>
    {/* Welcome */}
    <div style={{marginBottom:24,padding:"20px 24px",background:"linear-gradient(135deg,#00FFB208,#7B61FF08)",border:"1px solid #00FFB220",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2,color:"#fff"}}>VIRALLIFT GLOBAL OS <span style={{color:"#00FFB2"}}>v1.0</span></div>
        <div style={{fontSize:13,color:"#555",marginTop:3}}>All systems operational · {globalState.cyclesRun} cycles completed · Autonomous mode {globalState.autoOn?"active":"standby"}</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        {globalState.autoOn&&<div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",background:"#00FFB210",border:"1px solid #00FFB230",borderRadius:8}}>
          <Dot color="#00FFB2" active/><span style={{fontSize:11,color:"#00FFB2",fontFamily:"'Space Mono',monospace",letterSpacing:1}}>AUTO RUNNING</span>
        </div>}
      </div>
    </div>

    {/* Metrics */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
      {metrics.map((m,i)=><div key={m.label} style={{background:"#080808",border:`1px solid ${m.color}20`,borderRadius:12,padding:"18px 20px",position:"relative",overflow:"hidden",animation:`fadeUp .4s ${i*.08}s ease both`}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${m.color},transparent)`}}/>
        <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#444",letterSpacing:1,marginBottom:6}}>{m.label}</div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,color:"#fff",letterSpacing:1}}>{m.value}</div>
        <div style={{fontSize:11,color:m.color,marginTop:2,fontWeight:700}}>{m.delta}</div>
      </div>)}
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
      {/* Campaigns */}
      <Card>
        <SectionHead label="ACTIVE CAMPAIGNS" right={<Tag label={`${campaigns.length} LIVE`} color="#00FFB2"/>}/>
        {campaigns.map((c,i)=>{
          const pc=PC[c.platform]||"#fff";
          return <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:8,background:"#0D0D0D",border:"1px solid #141414",marginBottom:8,animation:`fadeUp .3s ${i*.07}s ease both`}}>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:"#ddd",fontWeight:600}}>{c.name}</div>
              <div style={{fontSize:10,color:pc,marginTop:2,fontWeight:700}}>{c.platform}</div>
            </div>
            <div style={{display:"flex",gap:3}}>
              {stages.map((s,j)=><div key={s} style={{width:20,height:3,borderRadius:2,background:j<=c.stage?"#00FFB2":"#1a1a1a",boxShadow:j===c.stage?"0 0 6px #00FFB2":undefined}} title={s}/>)}
            </div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:c.score>85?"#00FFB2":c.score>65?"#FFD700":"#FF3B6B"}}>{c.score}</div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <Dot color={c.status==="Live"?"#00FFB2":c.status==="Review"?"#FFD700":"#7B61FF"} active={c.status==="Running"}/>
              <span style={{fontSize:10,color:"#555"}}>{c.status}</span>
            </div>
          </div>;
        })}
      </Card>

      {/* Quick launch */}
      <Card>
        <SectionHead label="QUICK LAUNCH"/>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {NAV.filter(n=>n.id!=="dashboard"&&n.id!=="analytics").map(n=>(
            <button key={n.id} onClick={()=>setView(n.id)} style={{
              display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,
              background:"#0D0D0D",border:`1px solid #141414`,cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif",transition:"all .2s",
              textAlign:"left",
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=n.color+"50";e.currentTarget.style.background=`${n.color}08`;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#141414";e.currentTarget.style.background="#0D0D0D";}}>
              <span style={{fontSize:18}}>{n.icon}</span>
              <div>
                <div style={{fontSize:13,color:"#ccc",fontWeight:600}}>{n.label}</div>
                <div style={{fontSize:11,color:"#444",marginTop:1}}>
                  {n.id==="strategy"?"Generate weekly viral playbook":n.id==="copy"?"Write platform-native hooks & copy":n.id==="loop"?"Run the autonomous overnight engine":""}
                </div>
              </div>
              <span style={{marginLeft:"auto",color:"#222",fontSize:12}}>→</span>
            </button>
          ))}
        </div>
      </Card>
    </div>

    {/* Platform reach */}
    <Card>
      <SectionHead label="GLOBAL REACH BY PLATFORM"/>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[{name:"TikTok / Reels",pct:38,color:"#FF0050"},{name:"YouTube",pct:27,color:"#FF0000"},{name:"Twitter / X",pct:20,color:"#1DA1F2"},{name:"LinkedIn",pct:15,color:"#0A66C2"}].map(p=>(
          <div key={p.name} style={{display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:12,color:"#444",width:120,flexShrink:0,fontFamily:"'Space Mono',monospace",fontSize:10}}>{p.name}</span>
            <div style={{flex:1,height:5,background:"#111",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${p.pct}%`,background:p.color,borderRadius:3,boxShadow:`0 0 8px ${p.color}60`,transition:"width 1s ease"}}/>
            </div>
            <span style={{fontSize:11,color:p.color,fontWeight:700,width:32,textAlign:"right",fontFamily:"'Space Mono',monospace"}}>{p.pct}%</span>
          </div>
        ))}
      </div>
    </Card>
  </div>;
}

// ─── STRATEGY MODULE ──────────────────────────────────────────────────────────
function StrategyModule({onPlaybookGenerated}){
  const [niche,setNiche]=useState("Creator Economy");
  const [platforms,setPlatforms]=useState(["TikTok","Twitter/X","LinkedIn"]);
  const [state,setState]=useState("idle");
  const [phase,setPhase]=useState(null);
  const [logs,setLogs]=useState([]);
  const [playbook,setPlaybook]=useState(null);

  function log(text,type="info"){const time=new Date().toLocaleTimeString("en-US",{hour12:false});setLogs(p=>[...p,{text,type,time}]);}
  function toggleP(p){setPlatforms(prev=>prev.includes(p)?prev.filter(x=>x!==p):[...prev,p]);}

  async function run(){
    if(state==="running"||!platforms.length) return;
    setState("running");setPlaybook(null);setLogs([]);
    log("Strategist Agent initializing...","system");
    await sleep(400);
    for(const[p,t,ty] of [
      [`Niche: ${niche}`,400,"system"],
      ["Scanning trend signals...",500,"info"],
      ["Detecting viral patterns...",600,"info"],
      ["⚠ High opportunity window detected",400,"warn"],
      ["Generating playbook via AI engine...",300,"system"],
    ]){log(p,ty);await sleep(t);}
    setPhase("write");
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:1000,
        system:`You are ViralLift Strategist. Respond ONLY with valid JSON:
{"weekTheme":"string","insight":"string (2 sentences)","powerMove":"string","hooks":[{"hook":"string","platform":"string","score":number}],"schedule":[{"day":"string","platform":"string","time":"string","format":"string"}],"avoidThis":"string"}`,
        messages:[{role:"user",content:`Playbook for: Niche: ${niche}, Platforms: ${platforms.join(", ")}`}],
      })});
      const d=await r.json();
      const pb=JSON.parse(d.content.map(c=>c.text||"").join("").replace(/```json|```/g,"").trim());
      log(`Theme: "${pb.weekTheme}"`, "system");
      log(`${pb.hooks?.length} hooks generated ✓`,"system");
      setPlaybook(pb);
      setState("done");
      setPhase(null);
      onPlaybookGenerated(pb);
    }catch{log("Error — retry","error");setState("idle");}
  }

  return <div style={{animation:"fadeUp .4s ease"}}>
    <div style={{marginBottom:20}}>
      <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#7B61FF",letterSpacing:3,marginBottom:6}}>MODULE 01</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:"#fff",letterSpacing:1}}>STRATEGIST <span style={{color:"#7B61FF"}}>AGENT</span></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:16}}>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <Card>
          <SectionHead label="NICHE"/>
          <select value={niche} onChange={e=>setNiche(e.target.value)} style={{width:"100%",background:"#0D0D0D",border:"1px solid #1a1a1a",borderRadius:8,padding:"9px 12px",color:"#eee",fontSize:13,outline:"none",cursor:"pointer",marginBottom:14}}>
            {NICHES.map(n=><option key={n}>{n}</option>)}
          </select>
          <SectionHead label="PLATFORMS"/>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {PLATFORMS.map(p=>{const a=platforms.includes(p),c=PC[p]||"#fff";return <button key={p} onClick={()=>toggleP(p)} style={{padding:"4px 10px",borderRadius:5,cursor:"pointer",background:a?`${c}18`:"#0D0D0D",border:`1px solid ${a?c+"50":"#141414"}`,color:a?c:"#333",fontSize:10,fontWeight:700,transition:"all .2s",fontFamily:"'Space Mono',monospace"}}>{p}</button>;})}
          </div>
        </Card>
        <button onClick={run} disabled={state==="running"||!platforms.length} style={{padding:"14px",background:state==="running"?"#0D0D0D":"linear-gradient(135deg,#7B61FF,#5A47CC)",border:"none",borderRadius:10,color:state==="running"?"#333":"#fff",fontSize:12,fontWeight:800,cursor:state==="running"?"not-allowed":"pointer",fontFamily:"'Space Mono',monospace",letterSpacing:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,animation:state==="idle"?"glow 3s infinite":undefined}}>
          {state==="running"?<><Spinner color="#7B61FF"/> RUNNING...</>:state==="done"?"↺ RUN AGAIN":"▶ LAUNCH AGENT"}
        </button>
        <Card><SectionHead label="AGENT LOG"/><Log logs={logs} height={140}/></Card>
      </div>
      <div>
        {playbook?<div style={{animation:"fadeUp .4s ease"}}>
          <div style={{background:"linear-gradient(135deg,#7B61FF10,#00FFB208)",border:"1px solid #7B61FF30",borderRadius:14,padding:20,marginBottom:14,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#7B61FF,#00FFB2)"}}/>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#7B61FF",letterSpacing:2,marginBottom:6}}>THIS WEEK'S THEME</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:"#fff",letterSpacing:1,marginBottom:8}}>{playbook.weekTheme}</div>
            <p style={{fontSize:13,color:"#666",lineHeight:1.7,marginBottom:10}}>{playbook.insight}</p>
            <div style={{background:"#FF3B6B12",border:"1px solid #FF3B6B25",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#FF3B6B"}}>⚡ <b>Power Move:</b> {playbook.powerMove}</div>
          </div>
          <Card style={{marginBottom:14}}>
            <SectionHead label="VIRAL HOOKS"/>
            {playbook.hooks?.map((h,i)=>{const pc=PC[h.platform]||"#fff";return <div key={i} style={{padding:"11px 13px",borderRadius:8,background:"#0D0D0D",border:"1px solid #141414",marginBottom:8,display:"flex",gap:10,animation:`fadeUp .3s ${i*.06}s ease both`}}>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"#1e1e1e",flexShrink:0}}>{`0${i+1}`}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:"#ddd",lineHeight:1.6,marginBottom:4}}>{h.hook}</div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}><Tag label={h.platform} color={pc}/><span style={{fontSize:10,color:"#00FFB2",fontFamily:"'Space Mono',monospace"}}>{h.score}% predicted</span></div>
              </div>
            </div>;})}
          </Card>
          <Card>
            <SectionHead label="POSTING SCHEDULE"/>
            {playbook.schedule?.map((s,i)=>{const pc=PC[s.platform]||"#fff";return <div key={i} style={{display:"grid",gridTemplateColumns:"70px 1fr 70px 1fr",gap:10,alignItems:"center",padding:"9px 13px",borderRadius:8,background:"#0D0D0D",border:"1px solid #141414",marginBottom:7,animation:`fadeUp .3s ${i*.05}s ease both`}}>
              <span style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#FFD700"}}>{s.day}</span>
              <span style={{fontSize:12,color:pc,fontWeight:700}}>{s.platform}</span>
              <span style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#444"}}>{s.time}</span>
              <span style={{fontSize:11,color:"#555",background:"#141414",padding:"2px 8px",borderRadius:4}}>{s.format}</span>
            </div>;})}
          </Card>
        </div>
        :<div style={{background:"#060606",border:"1px dashed #111",borderRadius:14,padding:60,textAlign:"center",animation:"fadeUp .5s ease"}}>
          <div style={{fontSize:48,marginBottom:12}}>🧠</div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:"#1a1a1a",letterSpacing:2}}>LAUNCH AGENT TO GENERATE PLAYBOOK</div>
        </div>}
      </div>
    </div>
  </div>;
}

// ─── COPY OUTPUT CARD (must be component, not inline — hooks rule) ────────────
function CopyOutputCard({o, pc, index}){
  const [open, setOpen] = useState(index === 0);
  return (
    <div style={{background:"#080808",border:`1px solid ${pc}20`,borderRadius:12,overflow:"hidden",marginBottom:10,animation:`fadeUp .3s ${index*.07}s ease both`}}>
      <div onClick={()=>setOpen(!open)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",cursor:"pointer",background:open?`${pc}08`:"transparent",borderBottom:open?`1px solid ${pc}15`:"none"}}>
        <Tag label={o.format} color={pc}/>
        <span style={{fontSize:11,color:"#444",flex:1}}>{o.formula}</span>
        <div style={{width:60,height:3,background:"#111",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${o.viralScore}%`,background:pc}}/></div>
        <span style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:pc}}>{o.viralScore}%</span>
        <CopyBtn text={`${o.hook}\n\n${o.body}\n\n${o.cta}`}/>
      </div>
      {open&&<div style={{padding:"14px 16px"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,color:"#fff",lineHeight:1.5,marginBottom:10,borderLeft:`2px solid ${pc}`,paddingLeft:12,fontWeight:600}}>{o.hook}</div>
        <div style={{fontSize:12,color:"#666",lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:10}}>{o.body}</div>
        {o.cta&&<div style={{padding:"9px 12px",background:`${pc}10`,border:`1px solid ${pc}25`,borderRadius:7,fontSize:12,color:pc}}>📣 {o.cta}</div>}
      </div>}
    </div>
  );
}

// ─── COPY ENGINE MODULE ───────────────────────────────────────────────────────
function CopyModule(){
  const [topic,setTopic]=useState("");
  const [platform,setPlatform]=useState(PLATFORMS[0]);
  const [formulas,setFormulas]=useState(["curiosity","contrarian"]);
  const [state,setState]=useState("idle");
  const [outputs,setOutputs]=useState([]);
  const [logs,setLogs]=useState([]);

  function log(text,type="info"){const time=new Date().toLocaleTimeString("en-US",{hour12:false});setLogs(p=>[...p,{text,type,time}]);}
  function toggleF(f){setFormulas(p=>p.includes(f)?p.filter(x=>x!==f):[...p,f]);}

  async function generate(){
    if(!topic.trim()||state==="running") return;
    setState("running");setOutputs([]);setLogs([]);
    log("Copy Engine initializing...","system");
    await sleep(300);
    log(`Platform: ${platform} · Formulas: ${formulas.map(f=>FORMULAS.find(x=>x.id===f)?.label).join(", ")}`, "system");
    await sleep(500);
    log("Analyzing topic for viral angles...","info");
    await sleep(500);
    log("Generating platform-native copy...","system");
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:1000,
        system:`You are ViralLift Copy Engine. Respond ONLY with valid JSON:
{"outputs":[{"format":"string","formula":"string","hook":"string","body":"string","cta":"string","viralScore":number}]}
Generate 3-4 genuinely distinct variations. Platform-native copy. viralScore 60-99.`,
        messages:[{role:"user",content:`Topic: "${topic}", Platform: ${platform}, Formulas: ${formulas.map(f=>FORMULAS.find(x=>x.id===f)?.label).join(", ")}`}],
      })});
      const d=await r.json();
      const parsed=JSON.parse(d.content.map(c=>c.text||"").join("").replace(/```json|```/g,"").trim());
      log(`${parsed.outputs?.length} variations generated ✓`,"system");
      setOutputs(parsed.outputs||[]);
      setState("done");
    }catch{log("Error generating copy","error");setState("idle");}
  }

  const pc=PC[platform]||"#fff";
  return <div style={{animation:"fadeUp .4s ease"}}>
    <div style={{marginBottom:20}}>
      <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#FF3B6B",letterSpacing:3,marginBottom:6}}>MODULE 02</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:"#fff",letterSpacing:1}}>HOOK & COPY <span style={{color:"#FF3B6B"}}>ENGINE</span></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:16}}>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <Card>
          <SectionHead label="YOUR TOPIC"/>
          <textarea value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. I grew from 0 to 50K followers in 90 days..." rows={4} style={{width:"100%",background:"#0D0D0D",border:"1px solid #1a1a1a",borderRadius:8,padding:"10px 12px",color:"#eee",fontSize:12,outline:"none",resize:"none",lineHeight:1.6,marginBottom:14}}/>
          <SectionHead label="PLATFORM"/>
          <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:14}}>
            {PLATFORMS.map(p=>{const c=PC[p]||"#fff";return <button key={p} onClick={()=>setPlatform(p)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 11px",borderRadius:7,cursor:"pointer",background:platform===p?`${c}15`:"#0D0D0D",border:`1px solid ${platform===p?c+"50":"#141414"}`,color:platform===p?c:"#333",fontSize:12,fontWeight:600,transition:"all .2s",textAlign:"left",fontFamily:"'DM Sans',sans-serif"}}>{p}</button>;} )}
          </div>
          <SectionHead label="FORMULAS"/>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {FORMULAS.map(f=>{const a=formulas.includes(f.id);return <button key={f.id} onClick={()=>toggleF(f.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 11px",borderRadius:7,cursor:"pointer",background:a?"#FF3B6B10":"#0D0D0D",border:`1px solid ${a?"#FF3B6B40":"#141414"}`,color:a?"#FF3B6B":"#333",fontSize:12,fontWeight:600,transition:"all .2s",textAlign:"left",fontFamily:"'DM Sans',sans-serif"}}><span>{f.emoji}</span>{f.label}</button>;})}
          </div>
        </Card>
        <button onClick={generate} disabled={!topic.trim()||state==="running"} style={{padding:"14px",background:!topic.trim()||state==="running"?"#0D0D0D":"linear-gradient(135deg,#FF3B6B,#CC1F4A)",border:"none",borderRadius:10,color:!topic.trim()||state==="running"?"#333":"#fff",fontSize:12,fontWeight:800,cursor:!topic.trim()||state==="running"?"not-allowed":"pointer",fontFamily:"'Space Mono',monospace",letterSpacing:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {state==="running"?<><Spinner color="#FF3B6B"/> GENERATING...</>:state==="done"?"↺ REGENERATE":"▶ GENERATE COPY"}
        </button>
        <Card><SectionHead label="ENGINE LOG"/><Log logs={logs} height={120}/></Card>
      </div>
      <div>
        {outputs.length>0?<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#444",letterSpacing:2}}>{outputs.length} VARIATIONS</span>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"#00FFB2"}}>{Math.round(outputs.reduce((a,o)=>a+o.viralScore,0)/outputs.length)}% AVG SCORE</span>
          </div>
          {outputs.map((o,i)=><CopyOutputCard key={i} o={o} pc={pc} index={i}/>)}
        </>
        :<div style={{background:"#060606",border:"1px dashed #111",borderRadius:14,padding:60,textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:12}}>✍️</div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#1a1a1a",letterSpacing:2}}>ENTER TOPIC → SELECT PLATFORM → GENERATE</div>
        </div>}
      </div>
    </div>
  </div>;
}

// ─── AUTO LOOP MODULE ─────────────────────────────────────────────────────────
function LoopModule({onCycleComplete}){
  const [niche,setNiche]=useState("Creator Economy");
  const [platforms,setPlatforms]=useState(["TikTok","Twitter/X","LinkedIn"]);
  const [qualityGate,setQualityGate]=useState(70);
  const [postsPerCycle,setPosts]=useState(5);
  const [autoOn,setAutoOn]=useState(false);
  const [state,setState]=useState("idle");
  const [activeNode,setActiveNode]=useState(null);
  const [doneNodes,setDoneNodes]=useState([]);
  const [logs,setLogs]=useState([]);
  const [results,setResults]=useState([]);
  const [cycleNum,setCycleNum]=useState(0);
  const [countdown,setCountdown]=useState(null);
  const timerRef=useRef(null);

  function log(text,type="info"){const time=new Date().toLocaleTimeString("en-US",{hour12:false});setLogs(p=>[...p,{text,type,time}]);}
  function toggleP(p){setPlatforms(prev=>prev.includes(p)?prev.filter(x=>x!==p):[...prev,p]);}

  useEffect(()=>{
    if(!autoOn||state==="running") return;
    if(timerRef.current) clearInterval(timerRef.current);
    let s=30;setCountdown(s);
    timerRef.current=setInterval(()=>{s--;setCountdown(s);if(s<=0){clearInterval(timerRef.current);runCycle();}},1000);
    return ()=>clearInterval(timerRef.current);
  },[autoOn,cycleNum]);

  async function runCycle(){
    if(state==="running") return;
    setState("running");setResults([]);setLogs([]);setDoneNodes([]);setActiveNode(null);setCountdown(null);
    const num=cycleNum+1;setCycleNum(num);
    log(`◈ CYCLE #${num} INITIATED`,"system");
    await sleep(300);

    const steps=[
      ["trigger","Trigger fired — cron activated","agent",600],
      ["scout","Trend Scout scanning...","agent",700],
      ["strategy","Strategist generating playbook...","agent",500],
    ];
    for(const[node,msg,type,delay] of steps){
      setActiveNode(node);log(msg,type);await sleep(delay);setDoneNodes(p=>[...p,node]);
    }

    setActiveNode("copy");
    log("Copy Engine generating content batch...","agent");
    await sleep(500);
    let posts=[];
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:1000,
        system:`You are ViralLift Copy Engine. Respond ONLY with valid JSON:
{"posts":[{"platform":"string","format":"string","hook":"string","body":"string","score":number}]}`,
        messages:[{role:"user",content:`Generate ${Math.min(postsPerCycle,5)} viral posts. Niche: ${niche}. Platforms: ${platforms.join(", ")}. Make them platform-native. Score 60-99.`}],
      })});
      const d=await r.json();
      posts=JSON.parse(d.content.map(c=>c.text||"").join("").replace(/```json|```/g,"").trim()).posts||[];
      log(`${posts.length} posts generated`,"system");
    }catch{log("Fallback content used","warn");posts=platforms.slice(0,3).map((p,i)=>({platform:p,format:"Post",hook:`Viral hook for ${p}`,body:"Post body...",score:72+i*4}));}
    setDoneNodes(p=>[...p,"copy"]);

    setActiveNode("critic");
    log(`Scoring against ${qualityGate}% gate...`,"agent");
    await sleep(500);
    const passed=posts.filter(p=>p.score>=qualityGate);
    const rejected=posts.filter(p=>p.score<qualityGate);
    log(`${passed.length} passed · ${rejected.length} rejected`,"system");
    const final=passed.length>0?passed:posts;
    setDoneNodes(p=>[...p,"critic"]);

    setActiveNode("scheduler");
    log("Assigning optimal post windows...","agent");
    await sleep(400);
    const times=["Mon 9:00 AM","Mon 12:00 PM","Tue 8:45 AM","Tue 5:30 PM","Wed 11:00 AM","Thu 9:30 AM"];
    const scheduled=final.map((p,i)=>({...p,scheduledTime:times[i%times.length]}));
    setDoneNodes(p=>[...p,"scheduler"]);

    setActiveNode("queue");
    log("Dispatching to publish queue...","agent");
    await sleep(400);
    for(const s of scheduled){log(`Queued [${s.platform}] ${s.scheduledTime}`,"system");await sleep(150);}
    setResults(scheduled);
    setDoneNodes(p=>[...p,"queue"]);

    setActiveNode("analytics");
    log("Analytics loop configured","agent");
    await sleep(400);
    log(`Cycle #${num} complete ✓`,"system");
    setDoneNodes(p=>[...p,"analytics"]);
    setActiveNode(null);
    setState(autoOn?"scheduled":"done");
    onCycleComplete(num,scheduled.length);
    if(autoOn) log(`Next cycle in 30s (demo)...`,"system");
  }

  return <div style={{animation:"fadeUp .4s ease"}}>
    <div style={{marginBottom:20}}>
      <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#FFD700",letterSpacing:3,marginBottom:6}}>MODULE 03</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:"#fff",letterSpacing:1}}>AUTONOMOUS <span style={{color:"#FFD700"}}>DAILY LOOP</span></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:16}}>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <Card>
          <SectionHead label="NICHE"/>
          <select value={niche} onChange={e=>setNiche(e.target.value)} style={{width:"100%",background:"#0D0D0D",border:"1px solid #1a1a1a",borderRadius:8,padding:"9px 12px",color:"#eee",fontSize:13,outline:"none",cursor:"pointer",marginBottom:12}}>
            {NICHES.map(n=><option key={n}>{n}</option>)}
          </select>
          <SectionHead label="PLATFORMS"/>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
            {PLATFORMS.map(p=>{const a=platforms.includes(p),c=PC[p]||"#fff";return <button key={p} onClick={()=>toggleP(p)} style={{padding:"4px 10px",borderRadius:5,cursor:"pointer",background:a?`${c}18`:"#0D0D0D",border:`1px solid ${a?c+"50":"#141414"}`,color:a?c:"#333",fontSize:10,fontWeight:700,transition:"all .2s",fontFamily:"'Space Mono',monospace"}}>{p}</button>;})}
          </div>
          <SectionHead label={`QUALITY GATE: ${qualityGate}%`}/>
          <input type="range" min={50} max={95} step={5} value={qualityGate} onChange={e=>setQualityGate(+e.target.value)} style={{width:"100%",accentColor:"#FFD700",marginBottom:14}}/>
          <SectionHead label="POSTS / CYCLE"/>
          <div style={{display:"flex",gap:5,marginBottom:14}}>
            {[3,5,7,10].map(n=><button key={n} onClick={()=>setPosts(n)} style={{flex:1,padding:"7px 0",borderRadius:6,cursor:"pointer",background:postsPerCycle===n?"#FFD70010":"#0D0D0D",border:`1px solid ${postsPerCycle===n?"#FFD70040":"#141414"}`,color:postsPerCycle===n?"#FFD700":"#333",fontSize:12,fontWeight:700,fontFamily:"'Space Mono',monospace",transition:"all .2s"}}>{n}</button>)}
          </div>
          {/* Auto toggle */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:autoOn?"#7B61FF08":"#0D0D0D",border:`1px solid ${autoOn?"#7B61FF30":"#141414"}`,borderRadius:8}}>
            <div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#444",letterSpacing:1}}>FULL AUTO</div>
              <div style={{fontSize:10,color:"#2a2a2a",marginTop:1}}>Runs every cycle</div>
            </div>
            <div onClick={()=>setAutoOn(!autoOn)} style={{width:40,height:22,borderRadius:11,cursor:"pointer",background:autoOn?"#7B61FF":"#1a1a1a",border:`1px solid ${autoOn?"#7B61FF":"#333"}`,position:"relative",transition:"all .3s"}}>
              <div style={{position:"absolute",top:4,left:autoOn?20:4,width:13,height:13,borderRadius:"50%",background:autoOn?"#fff":"#555",transition:"left .3s"}}/>
            </div>
          </div>
          {autoOn&&countdown!==null&&<div style={{padding:"8px 12px",background:"#7B61FF10",border:"1px solid #7B61FF20",borderRadius:7,fontFamily:"'Space Mono',monospace",fontSize:10,color:"#7B61FF",marginTop:6}}>Next cycle: {countdown}s</div>}
        </Card>
        <button onClick={runCycle} disabled={state==="running"||!platforms.length} style={{padding:"14px",background:state==="running"?"#0D0D0D":"linear-gradient(135deg,#FFD700,#CC9900)",border:"none",borderRadius:10,color:state==="running"?"#333":"#000",fontSize:12,fontWeight:800,cursor:state==="running"?"not-allowed":"pointer",fontFamily:"'Space Mono',monospace",letterSpacing:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,animation:state==="idle"?"glow 3s infinite":undefined}}>
          {state==="running"?<><Spinner color="#FFD700"/> LOOP RUNNING...</>:state==="done"||state==="scheduled"?"↺ RUN AGAIN":"▶ LAUNCH LOOP"}
        </button>
      </div>
      <div>
        <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:12,marginBottom:14}}>
          <Card style={{padding:14}}><SectionHead label="PIPELINE"/><Pipeline active={activeNode} done={doneNodes}/></Card>
          <Card style={{padding:14,display:"flex",flexDirection:"column"}}>
            <SectionHead label="LIVE LOG" right={state==="running"?<span style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#FFD700",animation:"pulse 1s infinite"}}>● LIVE</span>:state==="done"?<span style={{fontSize:10,color:"#00FFB2"}}>✓ DONE</span>:null}/>
            <Log logs={logs} height={180}/>
          </Card>
        </div>
        {results.length>0&&<Card>
          <SectionHead label={`QUEUED BATCH — ${results.length} POSTS`} right={<Tag label="SCHEDULED" color="#FF8C00"/>}/>
          {results.map((r,i)=>{const c=PC[r.platform]||"#fff";return <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 12px",borderRadius:8,background:"#0D0D0D",border:"1px solid #141414",marginBottom:7,animation:`fadeUp .3s ${i*.06}s ease both`}}>
            <Tag label={r.platform} color={c}/>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:"#ccc",lineHeight:1.5}}>{r.hook}</div>
              <div style={{fontSize:10,color:"#00C9FF",marginTop:4,fontFamily:"'Space Mono',monospace"}}>📅 {r.scheduledTime}</div>
            </div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:r.score>80?"#00FFB2":r.score>65?"#FFD700":"#FF3B6B"}}>{r.score}%</div>
          </div>;})}
        </Card>}
        {state==="idle"&&!results.length&&<div style={{background:"#060606",border:"1px dashed #111",borderRadius:14,padding:60,textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:12}}>🔄</div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#1a1a1a",letterSpacing:2}}>CONFIGURE → LAUNCH → LET IT RUN</div>
        </div>}
      </div>
    </div>
  </div>;
}

// ─── ANALYTICS MODULE ─────────────────────────────────────────────────────────
function AnalyticsModule(){
  const hooks=[
    {hook:'"Nobody tells you this about building in public..."',platform:"Twitter/X",rate:"8.4%"},
    {hook:'"POV: You went from 0 to 100K in 90 days"',platform:"TikTok",rate:"7.1%"},
    {hook:'"The framework no one is talking about for B2B"',platform:"LinkedIn",rate:"6.3%"},
    {hook:'"I studied 1,000 viral videos. Here\'s the pattern."',platform:"YouTube",rate:"5.9%"},
    {hook:'"Stop doing this if you want to grow faster"',platform:"Reels",rate:"5.2%"},
  ];
  const weekly=[
    {day:"Mon",impressions:320000,engagements:24000},
    {day:"Tue",impressions:410000,engagements:31000},
    {day:"Wed",impressions:290000,engagements:21000},
    {day:"Thu",impressions:520000,engagements:44000},
    {day:"Fri",impressions:480000,engagements:38000},
    {day:"Sat",impressions:360000,engagements:29000},
    {day:"Sun",impressions:440000,engagements:35000},
  ];
  const maxImp=Math.max(...weekly.map(w=>w.impressions));
  return <div style={{animation:"fadeUp .4s ease"}}>
    <div style={{marginBottom:20}}>
      <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#00C9FF",letterSpacing:3,marginBottom:6}}>MODULE 04</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:"#fff",letterSpacing:1}}>PERFORMANCE <span style={{color:"#00C9FF"}}>ANALYTICS</span></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
      {[{label:"Total Impressions",value:"2.4M",delta:"+18%",color:"#00C9FF"},{label:"Engagements",value:"184K",delta:"+32%",color:"#00FFB2"},{label:"Viral Score Avg",value:"79%",delta:"+6pts",color:"#FFD700"},{label:"Posts Published",value:"47",delta:"+12",color:"#FF3B6B"}].map((m,i)=>(
        <div key={m.label} style={{background:"#080808",border:`1px solid ${m.color}20`,borderRadius:12,padding:"16px 18px",position:"relative",overflow:"hidden",animation:`fadeUp .4s ${i*.07}s ease both`}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${m.color},transparent)`}}/>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#333",letterSpacing:1,marginBottom:5}}>{m.label}</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:"#fff",letterSpacing:1}}>{m.value}</div>
          <div style={{fontSize:11,color:m.color,marginTop:2,fontWeight:700}}>{m.delta} this week</div>
        </div>
      ))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card>
        <SectionHead label="WEEKLY IMPRESSIONS"/>
        <div style={{display:"flex",alignItems:"flex-end",gap:6,height:120,paddingTop:10}}>
          {weekly.map((w,i)=>{
            const h=Math.round((w.impressions/maxImp)*100);
            return <div key={w.day} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{width:"100%",background:"#00C9FF20",borderRadius:"3px 3px 0 0",height:`${h}%`,minHeight:4,position:"relative",transition:"height 1s ease"}}>
                <div style={{position:"absolute",bottom:0,left:0,right:0,height:"40%",background:"#00C9FF",borderRadius:"2px 2px 0 0",boxShadow:"0 0 8px #00C9FF60"}}/>
              </div>
              <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#333"}}>{w.day}</span>
            </div>;
          })}
        </div>
      </Card>
      <Card>
        <SectionHead label="HOOK LEADERBOARD"/>
        {hooks.map((h,i)=>{
          const c=PC[h.platform]||"#fff";
          return <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,background:"#0D0D0D",border:"1px solid #141414",marginBottom:7,animation:`fadeUp .3s ${i*.06}s ease both`}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"#1e1e1e",flexShrink:0,width:24}}>#{i+1}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,color:"#ccc",lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.hook}</div>
              <Tag label={h.platform} color={c}/>
            </div>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"#00FFB2",flexShrink:0}}>{h.rate}</span>
          </div>;
        })}
      </Card>
    </div>
  </div>;
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function ViralLiftOS(){
  const [view,setView]=useState("dashboard");
  const [time,setTime]=useState(new Date());
  const [globalState,setGlobalState]=useState({cyclesRun:0,postsQueued:0,autoOn:false,lastPlaybook:null});
  const [aiOpen,setAiOpen]=useState(false);
  const [aiMsgs,setAiMsgs]=useState([{role:"assistant",text:"ViralLift OS online. I'm your AI Creative Director. What campaign shall we launch today?"}]);
  const [aiInput,setAiInput]=useState("");
  const [aiLoading,setAiLoading]=useState(false);
  const aiBottomRef=useRef(null);

  useEffect(()=>{const t=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(t);},[]);
  useEffect(()=>{aiBottomRef.current?.scrollIntoView({behavior:"smooth"});},[aiMsgs]);

  async function sendAI(){
    if(!aiInput.trim()||aiLoading) return;
    const msg=aiInput.trim();setAiInput("");
    setAiMsgs(p=>[...p,{role:"user",text:msg}]);
    setAiLoading(true);
    try{
      const history=aiMsgs.map(m=>({role:m.role==="assistant"?"assistant":"user",content:m.text}));
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:1000,
        system:`You are the ViralLift OS AI Creative Director — an elite viral growth strategist. Bold, direct, data-obsessed, culturally sharp. Deliver hooks, strategies, and playbooks with precision. Keep responses tight and actionable. No fluff.`,
        messages:[...history,{role:"user",content:msg}],
      })});
      const d=await r.json();
      setAiMsgs(p=>[...p,{role:"assistant",text:d.content?.map(c=>c.text||"").join("")||"Signal lost."}]);
    }catch{setAiMsgs(p=>[...p,{role:"assistant",text:"Connection error. Try again."}]);}
    setAiLoading(false);
  }

  const activeNav=NAV.find(n=>n.id===view);

  return <>
    <style>{CSS}</style>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
    <div style={{minHeight:"100vh",background:"#030303",fontFamily:"'DM Sans',sans-serif",color:"#eee",display:"flex"}}>

      {/* ── SIDEBAR ── */}
      <div style={{width:200,flexShrink:0,background:"#050505",borderRight:"1px solid #0f0f0f",display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh"}}>
        {/* Logo */}
        <div style={{padding:"20px 16px",borderBottom:"1px solid #0f0f0f"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#00FFB2,#7B61FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⚡</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:2,color:"#fff"}}>VIRALLIFT</div>
          </div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#222",letterSpacing:2}}>GLOBAL OS v1.0</div>
        </div>

        {/* Nav */}
        <nav style={{flex:1,padding:"12px 10px",display:"flex",flexDirection:"column",gap:3}}>
          {NAV.map(n=>{
            const active=view===n.id;
            return <button key={n.id} onClick={()=>setView(n.id)} style={{
              display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:8,cursor:"pointer",
              background:active?`${n.color}12`:"transparent",
              border:`1px solid ${active?n.color+"30":"transparent"}`,
              color:active?n.color:"#333",fontFamily:"'DM Sans',sans-serif",
              fontSize:13,fontWeight:active?700:500,transition:"all .2s",textAlign:"left",width:"100%",
            }}
            onMouseEnter={e=>{if(!active){e.currentTarget.style.background="#0a0a0a";e.currentTarget.style.color="#666";}}}
            onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color="#333";}}}>
              <span style={{fontSize:15,flexShrink:0}}>{n.icon}</span>
              <span>{n.label}</span>
              {active&&<div style={{marginLeft:"auto",width:4,height:4,borderRadius:"50%",background:n.color,boxShadow:`0 0 6px ${n.color}`}}/>}
            </button>;
          })}
        </nav>

        {/* Status */}
        <div style={{padding:"12px 14px",borderTop:"1px solid #0f0f0f"}}>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#1a1a1a",letterSpacing:1,marginBottom:6}}>SYSTEM STATUS</div>
          {[{label:"Agents",color:"#00FFB2"},{label:"Loop",color:globalState.autoOn?"#00FFB2":"#1a1a1a"},{label:"Queue",color:"#FFD700"}].map(s=>(
            <div key={s.label} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:s.color,boxShadow:s.color!=="#1a1a1a"?`0 0 5px ${s.color}`:undefined}}/>
              <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#2a2a2a",letterSpacing:.5}}>{s.label}</span>
            </div>
          ))}
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#1a1a1a",marginTop:8}}>{time.toLocaleTimeString("en-US",{hour12:false})}</div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>

        {/* Topbar */}
        <div style={{padding:"14px 24px",borderBottom:"1px solid #0f0f0f",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#040404",position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:1,color:"#fff"}}>{activeNav?.label.toUpperCase()}</span>
            {globalState.cyclesRun>0&&<Tag label={`${globalState.cyclesRun} CYCLES`} color="#00FFB2"/>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {globalState.postsQueued>0&&<span style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:"#333"}}>{globalState.postsQueued} posts queued</span>}
            <button onClick={()=>setAiOpen(true)} style={{background:"linear-gradient(135deg,#00FFB2,#00CC8E)",border:"none",borderRadius:8,padding:"7px 16px",color:"#000",fontWeight:800,fontSize:11,cursor:"pointer",letterSpacing:1,fontFamily:"'Space Mono',monospace"}}>⚡ AI DIRECTOR</button>
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1,padding:"28px 28px",overflowY:"auto"}}>
          {view==="dashboard"&&<Dashboard globalState={globalState} setView={setView}/>}
          {view==="strategy" &&<StrategyModule onPlaybookGenerated={pb=>setGlobalState(g=>({...g,lastPlaybook:pb}))}/>}
          {view==="copy"    &&<CopyModule/>}
          {view==="loop"    &&<LoopModule onCycleComplete={(n,p)=>setGlobalState(g=>({...g,cyclesRun:n,postsQueued:g.postsQueued+p}))}/>}
          {view==="analytics"&&<AnalyticsModule/>}
        </div>
      </div>

      {/* ── AI DIRECTOR PANEL ── */}
      {aiOpen&&<div style={{position:"fixed",inset:0,background:"#00000080",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"flex-end",padding:20}} onClick={e=>e.target===e.currentTarget&&setAiOpen(false)}>
        <div style={{width:420,height:580,background:"#070707",border:"1px solid #00FFB230",borderRadius:16,display:"flex",flexDirection:"column",boxShadow:"0 0 60px #00FFB215",animation:"fadeUp .3s ease"}}>
          <div style={{padding:"14px 18px",borderBottom:"1px solid #141414",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <Dot color="#00FFB2" active/>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#00FFB2",letterSpacing:2}}>AI CREATIVE DIRECTOR</span>
            </div>
            <button onClick={()=>setAiOpen(false)} style={{background:"none",border:"none",color:"#333",cursor:"pointer",fontSize:16}}>✕</button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
            {aiMsgs.map((m,i)=><div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"85%",background:m.role==="user"?"#7B61FF18":"#0D0D0D",border:`1px solid ${m.role==="user"?"#7B61FF30":"#141414"}`,borderRadius:m.role==="user"?"14px 14px 3px 14px":"14px 14px 14px 3px",padding:"10px 13px",fontSize:12,color:"#ccc",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{m.text}</div>)}
            {aiLoading&&<div style={{alignSelf:"flex-start",display:"flex",gap:5,padding:"10px 14px",background:"#0D0D0D",border:"1px solid #141414",borderRadius:"14px 14px 14px 3px"}}>
              {[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#00FFB2",animation:`pulse 1.2s ${i*.2}s infinite`}}/>)}
            </div>}
            <div ref={aiBottomRef}/>
          </div>
          <div style={{padding:"10px 14px",borderTop:"1px solid #141414",display:"flex",gap:8}}>
            <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendAI()} placeholder="Generate hooks for my niche..." style={{flex:1,background:"#0D0D0D",border:"1px solid #1e1e1e",borderRadius:8,padding:"9px 12px",color:"#eee",fontSize:12,outline:"none"}}/>
            <button onClick={sendAI} disabled={aiLoading} style={{background:aiLoading?"#141414":"linear-gradient(135deg,#00FFB2,#00CC8E)",border:"none",borderRadius:8,padding:"9px 14px",color:aiLoading?"#333":"#000",fontWeight:800,fontSize:11,cursor:aiLoading?"not-allowed":"pointer",fontFamily:"'Space Mono',monospace",letterSpacing:1}}>FIRE</button>
          </div>
        </div>
      </div>}
    </div>
  </>;
}
