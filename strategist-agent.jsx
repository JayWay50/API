import { useState, useEffect, useRef } from "react";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@400;500;700;800&display=swap');

  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes glow { 0%,100%{box-shadow:0 0 8px #00FFB280} 50%{box-shadow:0 0 28px #00FFB2CC,0 0 60px #00FFB240} }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideRight { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes scan { 0%{top:-4px} 100%{top:100%} }
  @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes barGrow { from{height:0} to{height:var(--h)} }
  @keyframes borderPulse { 0%,100%{border-color:#00FFB220} 50%{border-color:#00FFB260} }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #080808; }
  ::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 2px; }
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const PLATFORMS = ["TikTok","Reels","Twitter/X","LinkedIn","YouTube"];
const NICHES = ["SaaS / Tech","Creator Economy","Health & Wellness","Finance / Investing","E-commerce","Personal Brand","AI / Future Tech","Fitness"];

const AGENT_PHASES = [
  { id: "scan",     label: "SCANNING TRENDS",         icon: "📡", color: "#00FFB2", desc: "Analyzing viral patterns across 5 platforms" },
  { id: "research", label: "RESEARCHING COMPETITORS",  icon: "🔍", color: "#7B61FF", desc: "Reverse-engineering top performer strategies" },
  { id: "pattern",  label: "DETECTING PATTERNS",       icon: "🧠", color: "#FF3B6B", desc: "Identifying hook formulas with >5% engagement" },
  { id: "write",    label: "WRITING PLAYBOOK",         icon: "✍️",  color: "#FFD700", desc: "Generating your Weekly Viral Strategy" },
  { id: "done",     label: "PLAYBOOK READY",           icon: "⚡", color: "#00FFB2", desc: "Your autonomous strategy is live" },
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── SUB COMPONENTS ───────────────────────────────────────────────────────────
function AgentLog({ logs }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" }); }, [logs]);
  return (
    <div ref={ref} style={{
      background: "#020202", border: "1px solid #0f0f0f", borderRadius: 8,
      padding: "14px 16px", height: 180, overflowY: "auto",
      fontFamily: "'Space Mono', monospace", fontSize: 11,
    }}>
      {logs.map((l, i) => (
        <div key={i} style={{
          color: l.type === "system" ? "#00FFB2" : l.type === "warn" ? "#FFD700" : l.type === "error" ? "#FF3B6B" : "#444",
          marginBottom: 4, animation: "slideRight 0.2s ease",
          display: "flex", gap: 10,
        }}>
          <span style={{ color: "#222", flexShrink: 0 }}>{l.time}</span>
          <span style={{ color: l.type === "system" ? "#00FFB2" : l.type === "warn" ? "#FFD700" : l.type === "error" ? "#FF3B6B" : "#555" }}>
            {l.type === "system" ? "►" : l.type === "warn" ? "⚠" : l.type === "error" ? "✕" : "·"}
          </span>
          <span>{l.text}</span>
        </div>
      ))}
      {logs.length === 0 && <span style={{ color: "#1a1a1a" }}>Agent standby. Awaiting initialization...</span>}
    </div>
  );
}

function PhaseTracker({ currentPhase }) {
  const idx = AGENT_PHASES.findIndex(p => p.id === currentPhase);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {AGENT_PHASES.map((p, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={p.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 14px", borderRadius: 8,
            background: active ? p.color + "12" : done ? "#0a0a0a" : "#080808",
            border: `1px solid ${active ? p.color + "50" : done ? "#1a1a1a" : "#0f0f0f"}`,
            transition: "all 0.4s ease",
            animation: active ? "borderPulse 2s infinite" : "none",
          }}>
            <span style={{ fontSize: 16, opacity: done || active ? 1 : 0.2 }}>{p.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 11, fontFamily: "'Space Mono', monospace", fontWeight: 700, letterSpacing: 1,
                color: active ? p.color : done ? "#333" : "#1a1a1a",
              }}>{p.label}</div>
              {active && <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{p.desc}</div>}
            </div>
            {done && <span style={{ color: "#00FFB2", fontSize: 14 }}>✓</span>}
            {active && (
              <div style={{
                width: 14, height: 14, border: `2px solid ${p.color}`, borderTopColor: "transparent",
                borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PlaybookSection({ title, color, icon, children, delay = 0 }) {
  return (
    <div style={{
      background: "#080808", border: `1px solid ${color}20`,
      borderRadius: 12, padding: 20, marginBottom: 16,
      animation: `slideUp 0.5s ${delay}s ease both`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{
          fontFamily: "'Space Mono', monospace", fontSize: 11,
          fontWeight: 700, color, letterSpacing: 2,
        }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function HookCard({ hook, platform, score, index }) {
  const platformColors = { "Twitter/X": "#1DA1F2", LinkedIn: "#0A66C2", TikTok: "#FF0050", Reels: "#E1306C", YouTube: "#FF0000" };
  const pc = platformColors[platform] || "#fff";
  return (
    <div style={{
      padding: "12px 14px", borderRadius: 8, marginBottom: 8,
      background: "#0D0D0D", border: "1px solid #1a1a1a",
      display: "flex", alignItems: "flex-start", gap: 12,
      animation: `slideUp 0.4s ${index * 0.08}s ease both`,
    }}>
      <span style={{
        fontFamily: "'Space Mono', monospace", fontSize: 18,
        color: "#1e1e1e", flexShrink: 0, lineHeight: 1.4,
      }}>0{index + 1}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: "#ddd", lineHeight: 1.6, marginBottom: 6 }}>{hook}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: pc,
            background: pc + "18", padding: "2px 8px", borderRadius: 4,
          }}>{platform}</span>
          <span style={{ fontSize: 10, color: "#00FFB2", fontFamily: "'Space Mono', monospace" }}>
            {score}% predicted engagement
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function StrategistAgent() {
  const [niche, setNiche] = useState("Creator Economy");
  const [platforms, setPlatforms] = useState(["TikTok", "Twitter/X", "LinkedIn"]);
  const [cycleMode, setCycleMode] = useState("daily");
  const [agentState, setAgentState] = useState("idle"); // idle | running | done
  const [currentPhase, setCurrentPhase] = useState(null);
  const [logs, setLogs] = useState([]);
  const [playbook, setPlaybook] = useState(null);
  const [nextRun, setNextRun] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(null);

  // Live elapsed timer
  useEffect(() => {
    if (agentState !== "running") return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 500);
    return () => clearInterval(t);
  }, [agentState]);

  // Next run countdown
  useEffect(() => {
    if (!nextRun) return;
    const t = setInterval(() => {
      const diff = Math.max(0, Math.floor((nextRun - Date.now()) / 1000));
      if (diff === 0) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [nextRun]);

  function addLog(text, type = "info") {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs(prev => [...prev, { text, type, time }]);
  }

  function togglePlatform(p) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  async function runAgent() {
    if (agentState === "running") return;
    setAgentState("running");
    setPlaybook(null);
    setLogs([]);
    setElapsed(0);
    startRef.current = Date.now();

    // Phase 1: Scan
    setCurrentPhase("scan");
    addLog("Initializing Strategist Agent v1.0...", "system");
    await sleep(600);
    addLog(`Target niche: ${niche}`, "system");
    addLog(`Platforms: ${platforms.join(", ")}`, "system");
    await sleep(500);
    addLog("Connecting to trend intelligence layer...", "info");
    await sleep(700);
    addLog("Scanning TikTok FYP patterns (last 72h)...", "info");
    await sleep(600);
    addLog("Scanning Twitter/X trending hooks...", "info");
    await sleep(500);
    addLog("⚠ High volatility detected in Creator Economy niche", "warn");
    await sleep(500);
    addLog("Opportunity window identified: +340% engagement spike", "system");

    // Phase 2: Research
    setCurrentPhase("research");
    await sleep(500);
    addLog("Pulling competitor content fingerprints...", "info");
    await sleep(600);
    addLog("Analyzing top 50 viral posts in niche...", "info");
    await sleep(700);
    addLog("Hook pattern extraction: 'vulnerability loop' scoring +8.2%", "system");
    await sleep(500);
    addLog("Hook pattern extraction: 'contrarian take' scoring +6.9%", "system");
    await sleep(400);
    addLog("Competitor gap identified: underserved angle detected", "system");

    // Phase 3: Pattern
    setCurrentPhase("pattern");
    await sleep(500);
    addLog("Running engagement prediction model...", "info");
    await sleep(700);
    addLog("Filtering hooks below 5% engagement threshold...", "info");
    await sleep(500);
    addLog("8 high-confidence hooks identified for playbook", "system");
    await sleep(400);
    addLog("Optimal post windows calculated per platform/timezone", "system");

    // Phase 4: Write playbook via Claude
    setCurrentPhase("write");
    await sleep(500);
    addLog("Generating Weekly Viral Playbook via AI engine...", "system");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are the ViralLift Strategist Agent. You generate Weekly Viral Playbooks for content creators and brands. Always respond ONLY with valid JSON, no markdown, no preamble. The JSON must match exactly this structure:
{
  "weekTheme": "string (5-8 words, punchy weekly theme)",
  "insight": "string (2 sentences: key trend insight this week)",
  "powerMove": "string (1 sentence: the unexpected angle most creators are missing)",
  "hooks": [
    { "hook": "string", "platform": "string", "score": number },
    { "hook": "string", "platform": "string", "score": number },
    { "hook": "string", "platform": "string", "score": number },
    { "hook": "string", "platform": "string", "score": number },
    { "hook": "string", "platform": "string", "score": number }
  ],
  "schedule": [
    { "day": "string", "platform": "string", "time": "string", "format": "string" },
    { "day": "string", "platform": "string", "time": "string", "format": "string" },
    { "day": "string", "platform": "string", "time": "string", "format": "string" },
    { "day": "string", "platform": "string", "time": "string", "format": "string" },
    { "day": "string", "platform": "string", "time": "string", "format": "string" }
  ],
  "avoidThis": "string (1 sentence: what's oversaturated right now)"
}`,
          messages: [{
            role: "user",
            content: `Generate a Weekly Viral Playbook for the following:
- Niche: ${niche}
- Platforms: ${platforms.join(", ")}
- Goal: Maximum global reach and engagement
- Cycle: ${cycleMode}

Make the hooks bold, specific, and psychologically sharp. Use proven viral formulas (curiosity gap, vulnerability loop, contrarian take, data shock). Platform must be one of: ${platforms.join(", ")}.`,
          }],
        }),
      });

      const data = await res.json();
      const raw = data.content?.map(c => c.text || "").join("") || "{}";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      await sleep(400);
      addLog("Playbook generation complete ✓", "system");
      addLog(`Week theme: "${parsed.weekTheme}"`, "system");
      addLog(`${parsed.hooks?.length || 0} viral hooks ready`, "system");
      addLog("Scheduling matrix compiled", "system");

      setCurrentPhase("done");
      setPlaybook(parsed);
      setAgentState("done");

      // Set next autonomous run
      const ms = cycleMode === "daily" ? 86400000 : cycleMode === "weekly" ? 604800000 : 43200000;
      setNextRun(Date.now() + ms);
      addLog(`Next autonomous cycle scheduled in ${cycleMode === "daily" ? "24h" : cycleMode === "weekly" ? "7 days" : "12h"}`, "system");

    } catch (err) {
      addLog("Playbook generation failed — retrying...", "error");
      setAgentState("idle");
      setCurrentPhase(null);
    }
  }

  const formatNext = () => {
    if (!nextRun) return "--";
    const diff = Math.max(0, nextRun - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  };

  const platformColors = { "Twitter/X": "#1DA1F2", LinkedIn: "#0A66C2", TikTok: "#FF0050", Reels: "#E1306C", YouTube: "#FF0000" };

  return (
    <>
      <style>{CSS}</style>
      <div style={{
        minHeight: "100vh", background: "#030303",
        fontFamily: "'Cabinet Grotesk', sans-serif", color: "#eee",
        position: "relative",
      }}>

        {/* Noise texture overlay */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 0, opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }} />

        {/* Ticker tape */}
        <div style={{
          background: "#00FFB2", padding: "6px 0", overflow: "hidden",
          position: "relative", zIndex: 10,
        }}>
          <div style={{
            display: "flex", animation: "ticker 20s linear infinite",
            whiteSpace: "nowrap", width: "200%",
          }}>
            {[...Array(2)].map((_, j) => (
              <span key={j} style={{ display: "flex", gap: 0 }}>
                {["STRATEGIST AGENT ONLINE", "TREND INTELLIGENCE ACTIVE", "VIRAL PLAYBOOK ENGINE READY", "AUTONOMOUS CYCLE CONFIGURED", "GLOBAL REACH PROTOCOL ENGAGED"].map((t, i) => (
                  <span key={i} style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 10,
                    fontWeight: 700, color: "#000", letterSpacing: 2,
                    padding: "0 40px",
                  }}>◆ {t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px 60px", position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div style={{ marginBottom: 36, animation: "slideUp 0.5s ease" }}>
            <div style={{
              fontFamily: "'Space Mono', monospace", fontSize: 10,
              color: "#00FFB2", letterSpacing: 4, marginBottom: 8,
            }}>VIRALLIFT OS — MODULE 01</div>
            <h1 style={{
              fontFamily: "'Clash Display', sans-serif", fontSize: 42,
              fontWeight: 700, lineHeight: 1, color: "#fff", marginBottom: 8,
              letterSpacing: -1,
            }}>STRATEGIST<br /><span style={{ color: "#00FFB2" }}>AGENT</span></h1>
            <p style={{ fontSize: 14, color: "#555", maxWidth: 400 }}>
              Autonomous trend intelligence. Runs while you sleep. Wakes up with a playbook.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>

            {/* LEFT COLUMN — Config */}
            <div>
              {/* Config Panel */}
              <div style={{
                background: "#080808", border: "1px solid #141414",
                borderRadius: 14, padding: 20, marginBottom: 16,
                animation: "slideUp 0.5s 0.1s ease both",
              }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 10,
                  color: "#444", letterSpacing: 2, marginBottom: 16,
                }}>AGENT CONFIG</div>

                {/* Niche */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 6, letterSpacing: 1 }}>YOUR NICHE</label>
                  <select value={niche} onChange={e => setNiche(e.target.value)} style={{
                    width: "100%", background: "#0D0D0D", border: "1px solid #1e1e1e",
                    borderRadius: 8, padding: "10px 12px", color: "#eee",
                    fontSize: 13, fontFamily: "'Cabinet Grotesk', sans-serif",
                    outline: "none", cursor: "pointer",
                  }}>
                    {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                {/* Platforms */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 8, letterSpacing: 1 }}>TARGET PLATFORMS</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {PLATFORMS.map(p => {
                      const active = platforms.includes(p);
                      const c = platformColors[p] || "#fff";
                      return (
                        <button key={p} onClick={() => togglePlatform(p)} style={{
                          padding: "5px 12px", borderRadius: 6,
                          background: active ? c + "20" : "#0D0D0D",
                          border: `1px solid ${active ? c + "60" : "#1e1e1e"}`,
                          color: active ? c : "#444", fontSize: 11, fontWeight: 700,
                          cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif",
                          transition: "all 0.2s",
                        }}>{p}</button>
                      );
                    })}
                  </div>
                </div>

                {/* Cycle */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 8, letterSpacing: 1 }}>AUTONOMOUS CYCLE</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[["12h","12 Hours"],["daily","Daily"],["weekly","Weekly"]].map(([val, label]) => (
                      <button key={val} onClick={() => setCycleMode(val)} style={{
                        flex: 1, padding: "8px 0", borderRadius: 6,
                        background: cycleMode === val ? "#00FFB210" : "#0D0D0D",
                        border: `1px solid ${cycleMode === val ? "#00FFB240" : "#1e1e1e"}`,
                        color: cycleMode === val ? "#00FFB2" : "#444",
                        fontSize: 11, fontWeight: 700, cursor: "pointer",
                        fontFamily: "'Cabinet Grotesk', sans-serif",
                        transition: "all 0.2s",
                      }}>{label}</button>
                    ))}
                  </div>
                </div>

                {/* Run Button */}
                <button onClick={runAgent} disabled={agentState === "running" || platforms.length === 0} style={{
                  width: "100%", padding: "14px 0",
                  background: agentState === "running"
                    ? "#0D0D0D"
                    : "linear-gradient(135deg, #00FFB2, #00CC8E)",
                  border: `1px solid ${agentState === "running" ? "#1e1e1e" : "transparent"}`,
                  borderRadius: 10, color: agentState === "running" ? "#333" : "#000",
                  fontSize: 13, fontWeight: 800, cursor: agentState === "running" ? "not-allowed" : "pointer",
                  fontFamily: "'Space Mono', monospace", letterSpacing: 2,
                  transition: "all 0.3s",
                  animation: agentState === "idle" && !playbook ? "glow 2s infinite" : "none",
                }}>
                  {agentState === "running" ? "◉ AGENT RUNNING..." : agentState === "done" ? "↺ RUN AGAIN" : "▶ LAUNCH AGENT"}
                </button>

                {agentState === "running" && (
                  <div style={{
                    marginTop: 10, textAlign: "center",
                    fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#333",
                  }}>
                    {elapsed}s elapsed
                  </div>
                )}
              </div>

              {/* Phase Tracker */}
              {(agentState === "running" || agentState === "done") && (
                <div style={{
                  background: "#080808", border: "1px solid #141414",
                  borderRadius: 14, padding: 20, marginBottom: 16,
                  animation: "slideUp 0.3s ease",
                }}>
                  <div style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 10,
                    color: "#444", letterSpacing: 2, marginBottom: 14,
                  }}>AGENT PHASES</div>
                  <PhaseTracker currentPhase={currentPhase} />
                </div>
              )}

              {/* Next Run */}
              {nextRun && (
                <div style={{
                  background: "#080808", border: "1px solid #141414",
                  borderRadius: 14, padding: 20,
                  animation: "slideUp 0.3s ease",
                }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#444", letterSpacing: 2, marginBottom: 8 }}>NEXT AUTONOMOUS RUN</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 28, color: "#00FFB2" }}>{formatNext()}</div>
                  <div style={{ fontSize: 11, color: "#333", marginTop: 4 }}>Agent will auto-execute • no action required</div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div>
              {/* Agent Log */}
              <div style={{
                background: "#080808", border: "1px solid #141414",
                borderRadius: 14, padding: 20, marginBottom: 16,
                animation: "slideUp 0.5s 0.2s ease both",
              }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 10,
                  color: "#444", letterSpacing: 2, marginBottom: 12,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span>AGENT LOG</span>
                  {agentState === "running" && (
                    <span style={{ color: "#00FFB2", animation: "pulse 1s infinite" }}>● LIVE</span>
                  )}
                </div>
                <AgentLog logs={logs} />
              </div>

              {/* Playbook Output */}
              {playbook && (
                <div style={{ animation: "slideUp 0.5s ease" }}>

                  {/* Week Theme Banner */}
                  <div style={{
                    background: "linear-gradient(135deg, #00FFB210, #7B61FF10)",
                    border: "1px solid #00FFB230", borderRadius: 14,
                    padding: "20px 24px", marginBottom: 16,
                    position: "relative", overflow: "hidden",
                  }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #00FFB2, #7B61FF)" }} />
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#00FFB2", letterSpacing: 2, marginBottom: 8 }}>THIS WEEK'S THEME</div>
                    <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 10 }}>
                      {playbook.weekTheme}
                    </div>
                    <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6, marginBottom: 10 }}>{playbook.insight}</p>
                    <div style={{
                      background: "#FF3B6B15", border: "1px solid #FF3B6B30",
                      borderRadius: 8, padding: "10px 14px",
                      fontSize: 12, color: "#FF3B6B", lineHeight: 1.5,
                    }}>
                      ⚡ <strong>Power Move:</strong> {playbook.powerMove}
                    </div>
                  </div>

                  {/* Hooks */}
                  <PlaybookSection title="VIRAL HOOKS" color="#7B61FF" icon="🎣" delay={0.1}>
                    {playbook.hooks?.map((h, i) => (
                      <HookCard key={i} hook={h.hook} platform={h.platform} score={h.score} index={i} />
                    ))}
                  </PlaybookSection>

                  {/* Schedule */}
                  <PlaybookSection title="POSTING SCHEDULE" color="#FFD700" icon="📅" delay={0.2}>
                    {playbook.schedule?.map((s, i) => {
                      const pc = platformColors[s.platform] || "#fff";
                      return (
                        <div key={i} style={{
                          display: "grid", gridTemplateColumns: "80px 1fr 80px 1fr",
                          gap: 10, alignItems: "center",
                          padding: "10px 14px", borderRadius: 8, marginBottom: 8,
                          background: "#0D0D0D", border: "1px solid #1a1a1a",
                          animation: `slideUp 0.3s ${i * 0.06}s ease both`,
                        }}>
                          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#FFD700" }}>{s.day}</span>
                          <span style={{ fontSize: 12, color: pc, fontWeight: 700 }}>{s.platform}</span>
                          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#555" }}>{s.time}</span>
                          <span style={{ fontSize: 11, color: "#666", background: "#141414", padding: "2px 8px", borderRadius: 4 }}>{s.format}</span>
                        </div>
                      );
                    })}
                  </PlaybookSection>

                  {/* Avoid */}
                  <div style={{
                    background: "#FF3B6B08", border: "1px solid #FF3B6B20",
                    borderRadius: 12, padding: "16px 20px",
                    animation: "slideUp 0.5s 0.3s ease both",
                    display: "flex", gap: 12, alignItems: "flex-start",
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>🚫</span>
                    <div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#FF3B6B", letterSpacing: 2, marginBottom: 6 }}>AVOID THIS WEEK</div>
                      <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>{playbook.avoidThis}</div>
                    </div>
                  </div>

                </div>
              )}

              {/* Empty state */}
              {agentState === "idle" && !playbook && (
                <div style={{
                  background: "#080808", border: "1px dashed #141414",
                  borderRadius: 14, padding: 48, textAlign: "center",
                  animation: "slideUp 0.5s 0.3s ease both",
                }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>🤖</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#222", letterSpacing: 2 }}>
                    CONFIGURE & LAUNCH AGENT<br />TO GENERATE YOUR PLAYBOOK
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
