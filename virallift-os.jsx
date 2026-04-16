import { useState, useEffect, useRef } from "react";

const PLATFORMS = ["TikTok", "Reels", "Twitter/X", "LinkedIn", "YouTube"];

const CAMPAIGN_STAGES = ["Strategy", "Hook Engine", "Content", "Review", "Live"];

const initialCampaigns = [
  { id: 1, name: "Growth Hack Wave #1", platform: "Twitter/X", status: "Live", score: 94, stage: 4 },
  { id: 2, name: "LinkedIn Authority Play", platform: "LinkedIn", status: "Review", score: 81, stage: 3 },
  { id: 3, name: "TikTok Viral Storm", platform: "TikTok", status: "Running", score: 67, stage: 2 },
];

const analytics = [
  { label: "Impressions", value: "2.4M", delta: "+18%", color: "#00FFB2" },
  { label: "Engagements", value: "184K", delta: "+32%", color: "#FF3B6B" },
  { label: "Shares", value: "41K", delta: "+61%", color: "#FFD700" },
  { label: "Conversions", value: "3,820", delta: "+24%", color: "#7B61FF" },
];

const taskQueue = [
  { id: 1, type: "Strategy", label: "Analyze competitor hooks — @garyvee, @alexhormozi", status: "completed" },
  { id: 2, type: "Copy", label: "Generate 8 Twitter thread variations for SaaS niche", status: "running" },
  { id: 3, type: "Visual", label: "Create viral thumbnail batch — YouTube (5 images)", status: "pending" },
  { id: 4, type: "Schedule", label: "Queue Tuesday 9AM TikTok post", status: "pending" },
];

const glowPulse = `
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 8px #00FFB280; }
  50% { box-shadow: 0 0 24px #00FFB2CC, 0 0 48px #00FFB240; }
}
@keyframes scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes progressFill {
  from { width: 0%; }
  to { width: var(--target-width); }
}
@keyframes typewriter {
  from { width: 0; }
  to { width: 100%; }
}
`;

function StatusDot({ status }) {
  const colors = {
    Live: "#00FFB2",
    Review: "#FFD700",
    Running: "#7B61FF",
    completed: "#00FFB2",
    running: "#7B61FF",
    pending: "#444",
  };
  const c = colors[status] || "#444";
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: c, marginRight: 7, flexShrink: 0,
      boxShadow: status !== "pending" ? `0 0 8px ${c}` : "none",
      animation: status === "running" || status === "Running" ? "glowPulse 1.5s infinite" : "none",
    }} />
  );
}

function MetricCard({ label, value, delta, color }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #0D0D0D 0%, #111 100%)",
      border: `1px solid ${color}30`,
      borderRadius: 12,
      padding: "20px 22px",
      position: "relative",
      overflow: "hidden",
      animation: "fadeSlideIn 0.5s ease both",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      }} />
      <div style={{ fontSize: 11, color: "#666", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", color: "#fff", letterSpacing: 2 }}>{value}</div>
      <div style={{ fontSize: 12, color, marginTop: 4, fontWeight: 700 }}>{delta} this week</div>
    </div>
  );
}

function TaskCard({ task }) {
  const typeColors = { Strategy: "#7B61FF", Copy: "#FF3B6B", Visual: "#FFD700", Schedule: "#00FFB2" };
  const c = typeColors[task.type] || "#fff";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 16px", borderRadius: 8,
      background: task.status === "running" ? "#1a1a2e" : "#0D0D0D",
      border: `1px solid ${task.status === "running" ? c + "60" : "#1e1e1e"}`,
      marginBottom: 8,
      animation: "fadeSlideIn 0.4s ease both",
    }}>
      <StatusDot status={task.status} />
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
        color: c, background: c + "18", padding: "2px 8px", borderRadius: 4, flexShrink: 0,
      }}>{task.type}</span>
      <span style={{ fontSize: 13, color: task.status === "completed" ? "#555" : "#ccc", flex: 1,
        textDecoration: task.status === "completed" ? "line-through" : "none" }}>
        {task.label}
      </span>
      {task.status === "running" && (
        <div style={{
          width: 14, height: 14, border: "2px solid " + c, borderTopColor: "transparent",
          borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0,
        }} />
      )}
    </div>
  );
}

function CampaignRow({ campaign }) {
  const platformColors = { "Twitter/X": "#1DA1F2", LinkedIn: "#0A66C2", TikTok: "#FF0050", Reels: "#E1306C", YouTube: "#FF0000" };
  const pc = platformColors[campaign.platform] || "#fff";
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr auto auto auto",
      alignItems: "center", gap: 16,
      padding: "14px 18px", borderRadius: 10,
      background: "#0D0D0D", border: "1px solid #1e1e1e",
      marginBottom: 8, animation: "fadeSlideIn 0.4s ease both",
    }}>
      <div>
        <div style={{ fontSize: 13, color: "#eee", fontWeight: 600 }}>{campaign.name}</div>
        <div style={{ fontSize: 11, color: pc, marginTop: 3, fontWeight: 700 }}>{campaign.platform}</div>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {CAMPAIGN_STAGES.map((s, i) => (
          <div key={s} style={{
            width: 28, height: 4, borderRadius: 2,
            background: i <= campaign.stage ? "#00FFB2" : "#1e1e1e",
            boxShadow: i === campaign.stage ? "0 0 8px #00FFB2" : "none",
          }} title={s} />
        ))}
      </div>
      <div style={{
        fontSize: 20, fontFamily: "'Bebas Neue', sans-serif",
        color: campaign.score > 85 ? "#00FFB2" : campaign.score > 65 ? "#FFD700" : "#FF3B6B",
        letterSpacing: 1,
      }}>{campaign.score}<span style={{ fontSize: 11, color: "#555" }}>/100</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <StatusDot status={campaign.status} />
        <span style={{ fontSize: 11, color: "#888" }}>{campaign.status}</span>
      </div>
    </div>
  );
}

function AIPanel({ onClose }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "ViralLift OS online. I'm your AI Creative Director. What campaign shall we ignite today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are the ViralLift OS AI Creative Director — an elite viral growth strategist and content architect. You specialize in creating explosive, high-engagement content for TikTok, Reels, Twitter/X, LinkedIn, and YouTube with global reach in mind.

Your personality: Bold, direct, data-obsessed, culturally sharp. You speak like a top-tier CMO who also understands internet culture deeply.

When users ask for content, hooks, or strategies, you deliver:
- 3-5 viral hook variations (numbered, punchy, platform-specific)
- A brief strategy rationale (2-3 sentences max)
- One "power move" — an unexpected angle most creators miss

Keep responses tight, energetic, and actionable. No fluff. Use emojis sparingly but effectively. Format with clear sections.`,
          messages: [...history, { role: "user", content: userMsg }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "Signal lost. Try again.";
      setMessages(prev => [...prev, { role: "assistant", text }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Connection error. Reconnecting to the grid..." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#00000099", zIndex: 100,
      display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
      padding: 24,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        width: 440, height: 600, background: "#080808",
        border: "1px solid #00FFB240", borderRadius: 16,
        display: "flex", flexDirection: "column",
        boxShadow: "0 0 60px #00FFB220",
        animation: "fadeSlideIn 0.3s ease",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid #1e1e1e",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%", background: "#00FFB2",
              animation: "glowPulse 1.5s infinite",
            }} />
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#00FFB2", letterSpacing: 2 }}>
              AI CREATIVE DIRECTOR
            </span>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18,
          }}>✕</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              background: m.role === "user" ? "#7B61FF20" : "#0D0D0D",
              border: `1px solid ${m.role === "user" ? "#7B61FF40" : "#1e1e1e"}`,
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              padding: "10px 14px",
              fontSize: 13, color: "#ddd", lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}>{m.text}</div>
          ))}
          {loading && (
            <div style={{
              alignSelf: "flex-start", display: "flex", gap: 6, padding: "12px 16px",
              background: "#0D0D0D", border: "1px solid #1e1e1e", borderRadius: "16px 16px 16px 4px",
            }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: "50%", background: "#00FFB2",
                  animation: `blink 1.2s ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #1e1e1e", display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Generate hooks for SaaS founders..."
            style={{
              flex: 1, background: "#111", border: "1px solid #2a2a2a", borderRadius: 8,
              padding: "10px 14px", color: "#eee", fontSize: 13, outline: "none",
            }}
          />
          <button onClick={send} disabled={loading} style={{
            background: loading ? "#1e1e1e" : "linear-gradient(135deg, #00FFB2, #00CC8E)",
            border: "none", borderRadius: 8, padding: "10px 16px",
            color: loading ? "#555" : "#000", fontWeight: 800, fontSize: 13,
            cursor: loading ? "not-allowed" : "pointer", letterSpacing: 1,
          }}>FIRE</button>
        </div>
      </div>
    </div>
  );
}

export default function ViralLiftOS() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAI, setShowAI] = useState(false);
  const [directorMode, setDirectorMode] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "campaigns", label: "Campaigns" },
    { id: "tasks", label: "Task Queue" },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <>
      <style>{glowPulse}</style>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet" />

      <div style={{
        minHeight: "100vh", background: "#050505",
        fontFamily: "'Syne', sans-serif", color: "#eee",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background grid */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 0,
          backgroundImage: "linear-gradient(#0a0a0a 1px, transparent 1px), linear-gradient(90deg, #0a0a0a 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.6,
        }} />

        {/* Glow orbs */}
        <div style={{ position: "fixed", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "#00FFB210", filter: "blur(80px)", zIndex: 0 }} />
        <div style={{ position: "fixed", bottom: -100, left: -100, width: 300, height: 300, borderRadius: "50%", background: "#7B61FF10", filter: "blur(80px)", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 24px 40px" }}>

          {/* Top Bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 0 16px", borderBottom: "1px solid #1a1a1a", marginBottom: 28,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: "linear-gradient(135deg, #00FFB2, #7B61FF)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 900,
              }}>⚡</div>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3, color: "#fff" }}>
                  VIRALLIFT <span style={{ color: "#00FFB2" }}>GLOBAL</span>
                </div>
                <div style={{ fontSize: 10, color: "#444", letterSpacing: 2 }}>OPERATIONAL OS v1.0</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#444",
              }}>{time.toLocaleTimeString()}</div>

              {/* Director Mode Toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#555", letterSpacing: 1 }}>DIRECTOR MODE</span>
                <div onClick={() => setDirectorMode(!directorMode)} style={{
                  width: 40, height: 22, borderRadius: 11, cursor: "pointer",
                  background: directorMode ? "#00FFB2" : "#1e1e1e",
                  border: `1px solid ${directorMode ? "#00FFB2" : "#333"}`,
                  position: "relative", transition: "all 0.3s",
                }}>
                  <div style={{
                    position: "absolute", top: 3, left: directorMode ? 20 : 3,
                    width: 14, height: 14, borderRadius: "50%",
                    background: directorMode ? "#000" : "#555",
                    transition: "left 0.3s",
                  }} />
                </div>
              </div>

              <button onClick={() => setShowAI(true)} style={{
                background: "linear-gradient(135deg, #00FFB2, #00CC8E)",
                border: "none", borderRadius: 8, padding: "8px 18px",
                color: "#000", fontWeight: 800, fontSize: 12,
                cursor: "pointer", letterSpacing: 1, fontFamily: "'Syne', sans-serif",
              }}>⚡ AI DIRECTOR</button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                background: activeTab === t.id ? "#00FFB210" : "none",
                border: `1px solid ${activeTab === t.id ? "#00FFB240" : "#1e1e1e"}`,
                borderRadius: 8, padding: "8px 20px",
                color: activeTab === t.id ? "#00FFB2" : "#555",
                cursor: "pointer", fontSize: 12, fontWeight: 700,
                letterSpacing: 1, fontFamily: "'Syne', sans-serif",
                transition: "all 0.2s",
              }}>{t.label.toUpperCase()}</button>
            ))}
          </div>

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div style={{ animation: "fadeSlideIn 0.4s ease" }}>
              {/* Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
                {analytics.map(a => <MetricCard key={a.label} {...a} />)}
              </div>

              {/* Two col */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Active Campaigns */}
                <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 14, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1, color: "#888" }}>ACTIVE CAMPAIGNS</span>
                    <span style={{ fontSize: 11, color: "#00FFB2" }}>{initialCampaigns.length} running</span>
                  </div>
                  {initialCampaigns.map(c => <CampaignRow key={c.id} campaign={c} />)}
                </div>

                {/* Task Queue */}
                <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 14, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1, color: "#888" }}>TASK QUEUE</span>
                    <span style={{ fontSize: 11, color: "#7B61FF" }}>Daily Cycle Active</span>
                  </div>
                  {taskQueue.map(t => <TaskCard key={t.id} task={t} />)}
                </div>
              </div>

              {/* Platform reach bar */}
              <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 14, padding: 20, marginTop: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1, color: "#888", marginBottom: 16 }}>GLOBAL REACH BY PLATFORM</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { name: "TikTok / Reels", pct: 38, color: "#FF0050" },
                    { name: "YouTube", pct: 27, color: "#FF0000" },
                    { name: "Twitter / X", pct: 20, color: "#1DA1F2" },
                    { name: "LinkedIn", pct: 15, color: "#0A66C2" },
                  ].map(p => (
                    <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ fontSize: 12, color: "#666", width: 130, flexShrink: 0 }}>{p.name}</span>
                      <div style={{ flex: 1, height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 3,
                          background: p.color,
                          width: `${p.pct}%`,
                          boxShadow: `0 0 10px ${p.color}80`,
                          transition: "width 1s ease",
                        }} />
                      </div>
                      <span style={{ fontSize: 12, color: p.color, fontWeight: 700, width: 36, textAlign: "right" }}>{p.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CAMPAIGNS */}
          {activeTab === "campaigns" && (
            <div style={{ animation: "fadeSlideIn 0.4s ease" }}>
              <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 14, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1, color: "#888" }}>ALL CAMPAIGNS</span>
                  <button style={{
                    background: "#00FFB210", border: "1px solid #00FFB240",
                    borderRadius: 8, padding: "6px 16px", color: "#00FFB2",
                    fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Syne', sans-serif",
                  }}>+ NEW CAMPAIGN</button>
                </div>
                <div style={{ marginBottom: 12, display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 16, padding: "0 18px" }}>
                  {["Campaign", "Stage", "Score", "Status"].map(h => (
                    <span key={h} style={{ fontSize: 10, color: "#333", letterSpacing: 2, fontWeight: 700 }}>{h.toUpperCase()}</span>
                  ))}
                </div>
                {initialCampaigns.map(c => <CampaignRow key={c.id} campaign={c} />)}
                <div style={{
                  marginTop: 20, padding: 16, border: "1px dashed #1e1e1e", borderRadius: 10,
                  textAlign: "center", color: "#333", fontSize: 13,
                }}>
                  Open AI Director to auto-generate a new campaign strategy →
                </div>
              </div>
            </div>
          )}

          {/* TASKS */}
          {activeTab === "tasks" && (
            <div style={{ animation: "fadeSlideIn 0.4s ease" }}>
              <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 14, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1, color: "#888" }}>AUTONOMOUS TASK QUEUE</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7B61FF", animation: "glowPulse 1.5s infinite" }} />
                    <span style={{ fontSize: 11, color: "#7B61FF" }}>Daily Cycle Running</span>
                  </div>
                </div>
                {taskQueue.map(t => <TaskCard key={t.id} task={t} />)}
                <div style={{ marginTop: 16, padding: "14px 18px", background: "#0D0D0D", borderRadius: 8, border: "1px solid #1e1e1e" }}>
                  <div style={{ fontSize: 11, color: "#555", marginBottom: 8, letterSpacing: 1 }}>NEXT CYCLE IN</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 24, color: "#00FFB2" }}>06:42:18</div>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {activeTab === "analytics" && (
            <div style={{ animation: "fadeSlideIn 0.4s ease" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                {analytics.map(a => <MetricCard key={a.label} {...a} />)}
              </div>
              <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 14, padding: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1, color: "#888", marginBottom: 20 }}>HOOK PERFORMANCE LEADERBOARD</div>
                {[
                  { hook: '"Nobody tells you this about building in public..."', platform: "Twitter/X", rate: "8.4%", color: "#1DA1F2" },
                  { hook: '"POV: You went from 0 to 100K followers in 90 days"', platform: "TikTok", rate: "7.1%", color: "#FF0050" },
                  { hook: '"The framework no one is talking about for B2B growth"', platform: "LinkedIn", rate: "6.3%", color: "#0A66C2" },
                  { hook: '"I studied 1,000 viral videos. Here\'s the pattern."', platform: "YouTube", rate: "5.9%", color: "#FF0000" },
                ].map((h, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "12px 16px", borderRadius: 8, marginBottom: 8,
                    background: "#0D0D0D", border: "1px solid #1e1e1e",
                  }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#2a2a2a", width: 28 }}>#{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "#ccc" }}>{h.hook}</div>
                      <div style={{ fontSize: 11, color: h.color, marginTop: 3, fontWeight: 700 }}>{h.platform}</div>
                    </div>
                    <div style={{
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: 22,
                      color: "#00FFB2", letterSpacing: 1,
                    }}>{h.rate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Director Mode Banner */}
          {directorMode && (
            <div style={{
              marginTop: 20, padding: "14px 20px",
              background: "#FFD70010", border: "1px solid #FFD70040",
              borderRadius: 10, display: "flex", alignItems: "center", gap: 12,
              animation: "fadeSlideIn 0.3s ease",
            }}>
              <span style={{ fontSize: 16 }}>🎬</span>
              <span style={{ fontSize: 13, color: "#FFD700" }}>
                <strong>Creative Director Mode Active</strong> — All AI-generated content requires your approval before publishing.
              </span>
            </div>
          )}
        </div>
      </div>

      {showAI && <AIPanel onClose={() => setShowAI(false)} />}
    </>
  );
}
