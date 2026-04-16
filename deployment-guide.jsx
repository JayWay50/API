import { useState } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;600&display=swap');
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.3} }
  * { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:#040404} ::-webkit-scrollbar-thumb{background:#1a1a1a}
`;

const PHASES = [
  {
    id: "repo",
    label: "01 — SCAFFOLD PROJECT",
    color: "#00FFB2",
    icon: "📁",
    steps: [
      { cmd: "npx create-next-app@latest virallift-os --app --tailwind --typescript", desc: "Create Next.js app with App Router" },
      { cmd: "cd virallift-os", desc: "Enter project directory" },
      { cmd: "npm install @anthropic-ai/sdk prisma @prisma/client twitter-api-v2 googleapis inngest next-auth", desc: "Install all core dependencies" },
      { cmd: "npm install -D @types/node typescript", desc: "Install dev dependencies" },
      { cmd: "npx prisma init", desc: "Initialize Prisma ORM" },
    ],
    note: "Run these commands in your terminal to set up the full project structure.",
  },
  {
    id: "db",
    label: "02 — DATABASE SETUP",
    color: "#7B61FF",
    icon: "🗄️",
    steps: [
      { cmd: "# Go to neon.tech → Create project → Copy DATABASE_URL", desc: "Get free Postgres from Neon (recommended) or Supabase" },
      { cmd: "# Paste DATABASE_URL into .env.local", desc: "Add connection string to environment" },
      { cmd: "# Copy schema.prisma from your deployment package into /prisma/schema.prisma", desc: "Add ViralLift schema file" },
      { cmd: "npx prisma generate", desc: "Generate Prisma client" },
      { cmd: "npx prisma db push", desc: "Push schema to database — creates all tables" },
    ],
    note: "Neon free tier gives you 0.5GB storage and 190 compute hours/month — more than enough to start.",
  },
  {
    id: "apis",
    label: "03 — PLATFORM API KEYS",
    color: "#FF3B6B",
    icon: "🔑",
    steps: [
      { cmd: "# TWITTER/X: developer.twitter.com → Create App → Basic plan ($100/mo for write access)", desc: "Twitter requires paid Basic plan for posting" },
      { cmd: "# LINKEDIN: developer.linkedin.com → Create App → Request Marketing API access", desc: "LinkedIn API is free but requires approval (1-2 weeks)" },
      { cmd: "# TIKTOK: developers.tiktok.com → Create App → Apply for Content Posting API", desc: "TikTok requires Content Posting API approval (separate application)" },
      { cmd: "# YOUTUBE: console.cloud.google.com → YouTube Data API v3 → Create credentials", desc: "Google Cloud — YouTube Data API v3 is free (10K units/day)" },
      { cmd: "# Add all keys to .env.local using the .env.example template", desc: "Populate your environment variables file" },
    ],
    note: "Start with LinkedIn + YouTube — both free. Add Twitter/X and TikTok once ready to scale.",
  },
  {
    id: "inngest",
    label: "04 — AUTONOMOUS LOOP (INNGEST)",
    color: "#FFD700",
    icon: "🔄",
    steps: [
      { cmd: "# Go to app.inngest.com → Create account → New App", desc: "Sign up for Inngest free tier (50K runs/month)" },
      { cmd: "npm install inngest", desc: "Install Inngest SDK" },
      { cmd: "# Create /inngest/client.js and /inngest/autonomousLoop.js from your deployment package", desc: "Add worker files to project" },
      { cmd: "# Create /app/api/inngest/route.js — serve the Inngest handler", desc: "Expose Inngest endpoint in Next.js" },
      { cmd: "# Add INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY to .env.local", desc: "Add Inngest credentials" },
      { cmd: "npx inngest-cli@latest dev", desc: "Test locally — opens Inngest dev server at localhost:8288" },
    ],
    note: "Inngest handles the cron scheduling, retry logic, and error handling automatically. No server to manage.",
  },
  {
    id: "routes",
    label: "05 — ADD API ROUTES",
    color: "#00C9FF",
    icon: "🔌",
    steps: [
      { cmd: "# Copy all files from api-routes/ into /app/api/publish/", desc: "Add Twitter, LinkedIn, TikTok, YouTube connectors" },
      { cmd: "# Copy lib/publisher.js into /lib/publisher.js", desc: "Add unified publisher router" },
      { cmd: "# Copy workers/autonomousLoop.js into /inngest/autonomousLoop.js", desc: "Add the autonomous loop worker" },
      { cmd: "npm run dev", desc: "Start local dev server — test all routes at localhost:3000" },
    ],
    note: "Each platform connector lives at /api/publish/[platform] and handles OAuth + posting logic.",
  },
  {
    id: "deploy",
    label: "06 — DEPLOY TO VERCEL",
    color: "#FF8C00",
    icon: "🚀",
    steps: [
      { cmd: "# Push project to GitHub: git init → git add . → git commit -m 'init' → git push", desc: "Push code to GitHub repository" },
      { cmd: "# Go to vercel.com → Import GitHub repo → Deploy", desc: "One-click deploy from GitHub" },
      { cmd: "# In Vercel dashboard: Settings → Environment Variables → Add all from .env.example", desc: "Add all production environment variables" },
      { cmd: "# In Inngest dashboard: Add production URL → Sync functions", desc: "Register your deployed Inngest worker with production URL" },
      { cmd: "# Set up Vercel Postgres OR connect your Neon DB URL in Vercel env vars", desc: "Connect production database" },
      { cmd: "npx prisma db push  # run against production DATABASE_URL", desc: "Run migrations on production database" },
    ],
    note: "Vercel free tier supports up to 100GB bandwidth/month and serverless functions — perfect for ViralLift.",
  },
  {
    id: "oauth",
    label: "07 — OAUTH CONNECT FLOW",
    color: "#00FFB2",
    icon: "🔐",
    steps: [
      { cmd: "# Build /app/api/auth/[platform]/route.js for each platform OAuth flow", desc: "Create OAuth initiation routes" },
      { cmd: "# Build /app/api/auth/[platform]/callback/route.js — save tokens to DB", desc: "Handle OAuth callbacks and store tokens" },
      { cmd: "# In your OS Dashboard → Settings → Connect Platforms", desc: "Add platform connection UI to your dashboard" },
      { cmd: "# Test: click Connect Twitter → authorize → verify token saved in DB", desc: "Test each OAuth connection end-to-end" },
    ],
    note: "Users authorize each platform once. Tokens are stored encrypted in your database and reused every cycle.",
  },
];

const API_COSTS = [
  { platform: "Twitter/X",  cost: "$100/mo", tier: "Basic",   note: "Required for write access", color: "#1DA1F2" },
  { platform: "LinkedIn",   cost: "Free",    tier: "Standard",note: "Approval required (1-2 wks)", color: "#0A66C2" },
  { platform: "TikTok",     cost: "Free",    tier: "Standard",note: "Content API approval needed", color: "#FF0050" },
  { platform: "YouTube",    cost: "Free",    tier: "Standard",note: "10K units/day limit",          color: "#FF0000" },
  { platform: "Anthropic",  cost: "~$5-20/mo",tier:"API",     note: "Pay per token — scales with use", color: "#00FFB2" },
  { platform: "Inngest",    cost: "Free",    tier: "Free",    note: "50K runs/month",               color: "#7B61FF" },
  { platform: "Vercel",     cost: "Free",    tier: "Hobby",   note: "Upgrade at $20/mo if needed",  color: "#fff" },
  { platform: "Neon DB",    cost: "Free",    tier: "Free",    note: "0.5GB — upgrade at $19/mo",    color: "#FFD700" },
];

function Step({ step, index, done, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      display:"flex", alignItems:"flex-start", gap:12,
      padding:"10px 14px", borderRadius:8, marginBottom:7,
      background: done ? "#0a0a0a" : "#080808",
      border:`1px solid ${done?"#1a1a1a":"#111"}`,
      cursor:"pointer", transition:"all .2s",
      animation:`fadeUp .3s ${index*.05}s ease both`,
    }}>
      <div style={{
        width:18, height:18, borderRadius:4, border:`1px solid ${done?"#00FFB2":"#1e1e1e"}`,
        background: done?"#00FFB2":"transparent", flexShrink:0, marginTop:2,
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"all .2s",
      }}>
        {done && <span style={{fontSize:10, color:"#000", fontWeight:800}}>✓</span>}
      </div>
      <div style={{flex:1}}>
        <div style={{
          fontFamily:"'Space Mono',monospace", fontSize:10,
          color: done?"#333":"#555", marginBottom:4,
          textDecoration: done?"line-through":"none",
          wordBreak:"break-all",
        }}>{step.cmd}</div>
        <div style={{fontSize:11, color: done?"#2a2a2a":"#444"}}>{step.desc}</div>
      </div>
    </div>
  );
}

export default function DeployGuide() {
  const [checked, setChecked] = useState({});
  const [expanded, setExpanded] = useState({ repo: true });

  function toggleStep(phaseId, stepIdx) {
    const key = `${phaseId}-${stepIdx}`;
    setChecked(p => ({ ...p, [key]: !p[key] }));
  }
  function togglePhase(id) {
    setExpanded(p => ({ ...p, [id]: !p[id] }));
  }

  const totalSteps = PHASES.reduce((a, p) => a + p.steps.length, 0);
  const doneSteps  = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((doneSteps / totalSteps) * 100);

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", background:"#030303", fontFamily:"'DM Sans',sans-serif", color:"#eee", padding:"32px 24px 60px", maxWidth:820, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom:28, animation:"fadeUp .4s ease" }}>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#00FFB2", letterSpacing:4, marginBottom:8 }}>VIRALLIFT GLOBAL OS</div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:42, color:"#fff", letterSpacing:1, lineHeight:1, marginBottom:8 }}>
            PRODUCTION<br/><span style={{color:"#00FFB2"}}>DEPLOYMENT GUIDE</span>
          </h1>
          <p style={{ fontSize:13, color:"#555", maxWidth:500, lineHeight:1.7 }}>
            Step-by-step checklist to go from prototype to fully autonomous, live production system. Check each step as you complete it.
          </p>
        </div>

        {/* Progress */}
        <div style={{ background:"#080808", border:"1px solid #141414", borderRadius:14, padding:"18px 20px", marginBottom:24, animation:"fadeUp .4s .1s ease both" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#444", letterSpacing:2 }}>DEPLOYMENT PROGRESS</span>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:"#00FFB2" }}>{pct}%</span>
          </div>
          <div style={{ height:6, background:"#111", borderRadius:3, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#00FFB2,#7B61FF)", borderRadius:3, transition:"width .5s ease", boxShadow:"0 0 12px #00FFB260" }}/>
          </div>
          <div style={{ fontSize:11, color:"#333", marginTop:8, fontFamily:"'Space Mono',monospace" }}>{doneSteps} / {totalSteps} steps completed</div>
        </div>

        {/* Phase cards */}
        {PHASES.map((phase, pi) => {
          const phaseDone = phase.steps.filter((_,i) => checked[`${phase.id}-${i}`]).length;
          const isOpen = expanded[phase.id];
          return (
            <div key={phase.id} style={{
              background:"#080808", border:`1px solid ${phaseDone===phase.steps.length?"#00FFB230":"#141414"}`,
              borderRadius:14, marginBottom:12, overflow:"hidden",
              animation:`fadeUp .4s ${pi*.07}s ease both`,
            }}>
              <div onClick={()=>togglePhase(phase.id)} style={{
                display:"flex", alignItems:"center", gap:12, padding:"16px 18px", cursor:"pointer",
                background: phaseDone===phase.steps.length ? "#00FFB208" : "transparent",
              }}>
                <span style={{fontSize:20}}>{phase.icon}</span>
                <div style={{flex:1}}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color: phaseDone===phase.steps.length?phase.color:"#fff", letterSpacing:1 }}>{phase.label}</div>
                  <div style={{ fontSize:11, color:"#444", marginTop:2 }}>{phaseDone}/{phase.steps.length} steps done</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:60, height:3, background:"#111", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${(phaseDone/phase.steps.length)*100}%`, background:phase.color, borderRadius:2, transition:"width .3s" }}/>
                  </div>
                  <span style={{color:"#222", fontSize:11}}>{isOpen?"▲":"▼"}</span>
                </div>
              </div>
              {isOpen && (
                <div style={{ padding:"0 18px 16px" }}>
                  {phase.note && (
                    <div style={{ padding:"10px 12px", background:`${phase.color}08`, border:`1px solid ${phase.color}20`, borderRadius:8, marginBottom:12, fontSize:12, color:"#666", lineHeight:1.6 }}>
                      💡 {phase.note}
                    </div>
                  )}
                  {phase.steps.map((step, si) => (
                    <Step key={si} step={step} index={si}
                      done={!!checked[`${phase.id}-${si}`]}
                      onToggle={()=>toggleStep(phase.id, si)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Cost table */}
        <div style={{ background:"#080808", border:"1px solid #141414", borderRadius:14, padding:20, marginTop:24, animation:"fadeUp .4s ease" }}>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#444", letterSpacing:2, marginBottom:16 }}>MONTHLY COST BREAKDOWN</div>
          {API_COSTS.map((r,i) => (
            <div key={i} style={{ display:"grid", gridTemplateColumns:"140px 80px 100px 1fr", gap:12, alignItems:"center", padding:"10px 12px", borderRadius:8, background:"#0D0D0D", border:"1px solid #111", marginBottom:7, animation:`fadeUp .3s ${i*.05}s ease both` }}>
              <span style={{ fontSize:13, fontWeight:600, color:r.color }}>{r.platform}</span>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:12, color: r.cost==="Free"?"#00FFB2":"#FFD700" }}>{r.cost}</span>
              <span style={{ fontSize:10, color:"#555", background:"#141414", padding:"2px 8px", borderRadius:4 }}>{r.tier}</span>
              <span style={{ fontSize:11, color:"#444" }}>{r.note}</span>
            </div>
          ))}
          <div style={{ marginTop:14, padding:"12px 14px", background:"#00FFB208", border:"1px solid #00FFB220", borderRadius:8 }}>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#00FFB2", letterSpacing:1, marginBottom:4 }}>TOTAL TO LAUNCH</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:"#fff" }}>$0 — $125/month</div>
            <div style={{ fontSize:12, color:"#555", marginTop:4 }}>Start free with LinkedIn + YouTube. Add Twitter/X when ready to scale.</div>
          </div>
        </div>

        {/* Support note */}
        <div style={{ marginTop:20, padding:"16px 20px", background:"#7B61FF08", border:"1px solid #7B61FF20", borderRadius:12, fontSize:13, color:"#666", lineHeight:1.7 }}>
          <strong style={{color:"#7B61FF"}}>Next Steps After Deploy:</strong> Once live, return to ViralLift OS → Auto Loop → enable Full Auto Mode. The system will run its first cycle within 24 hours and post autonomously every cycle thereafter.
        </div>
      </div>
    </>
  );
}
