import { useState, useEffect, useRef } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Geist+Mono:wght@400;500;700&family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap');

  @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.2} }
  @keyframes shimmer   { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
  @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes checkPop  { 0%{transform:scale(0) rotate(-10deg)} 70%{transform:scale(1.2) rotate(3deg)} 100%{transform:scale(1) rotate(0deg)} }
  @keyframes ringPulse { 0%{box-shadow:0 0 0 0 var(--rc)} 100%{box-shadow:0 0 0 12px transparent} }
  @keyframes ticker    { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }

  * { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:#050505} ::-webkit-scrollbar-thumb{background:#1c1c1c;border-radius:2px}
`;

// ── PLATFORM DATA ─────────────────────────────────────────────────────────────
const PLATFORMS = [
  {
    id:       "twitter",
    name:     "Twitter / X",
    icon:     "𝕏",
    color:    "#1DA1F2",
    bg:       "#0a1929",
    desc:     "Post threads, tweets & replies automatically",
    scopes:   ["Read timeline","Write tweets","Post threads","Schedule content"],
    apiNote:  "Requires Basic plan ($100/mo) for write access",
    apiUrl:   "https://developer.twitter.com",
    tier:     "Paid",
    tierColor:"#FFD700",
    authUrl:  "https://twitter.com/i/oauth2/authorize",
    steps:    [
      "Create app at developer.twitter.com",
      "Enable OAuth 2.0 with PKCE",
      "Set callback URL in app settings",
      "Add API keys to .env",
    ],
  },
  {
    id:       "linkedin",
    name:     "LinkedIn",
    icon:     "in",
    color:    "#0A66C2",
    bg:       "#091929",
    desc:     "Publish posts, articles & carousels to your network",
    scopes:   ["Post content","Read profile","Access analytics","Manage pages"],
    apiNote:  "Free — requires Marketing API approval (1-2 weeks)",
    apiUrl:   "https://developer.linkedin.com",
    tier:     "Free",
    tierColor:"#00FFB2",
    authUrl:  "https://www.linkedin.com/oauth/v2/authorization",
    steps:    [
      "Create app at developer.linkedin.com",
      "Request Marketing Developer Platform",
      "Add r_liteprofile & w_member_social scopes",
      "Add client ID/secret to .env",
    ],
  },
  {
    id:       "tiktok",
    name:     "TikTok",
    icon:     "♪",
    color:    "#FF0050",
    bg:       "#1a0a10",
    desc:     "Auto-publish videos, photos & captions",
    scopes:   ["Upload videos","Post photos","Manage captions","Schedule posts"],
    apiNote:  "Free — Content Posting API requires separate approval",
    apiUrl:   "https://developers.tiktok.com",
    tier:     "Free",
    tierColor:"#00FFB2",
    authUrl:  "https://www.tiktok.com/v2/auth/authorize",
    steps:    [
      "Create app at developers.tiktok.com",
      "Apply for Content Posting API access",
      "Add video.publish & video.upload scopes",
      "Add client key/secret to .env",
    ],
  },
  {
    id:       "youtube",
    name:     "YouTube",
    icon:     "▶",
    color:    "#FF0000",
    bg:       "#1a0a0a",
    desc:     "Upload videos, Shorts & manage your channel",
    scopes:   ["Upload videos","Manage channel","Post Shorts","Read analytics"],
    apiNote:  "Free — 10K API units/day via Google Cloud",
    apiUrl:   "https://console.cloud.google.com",
    tier:     "Free",
    tierColor:"#00FFB2",
    authUrl:  "https://accounts.google.com/o/oauth2/v2/auth",
    steps:    [
      "Enable YouTube Data API v3 in Google Cloud",
      "Create OAuth 2.0 credentials",
      "Add youtube.upload scope",
      "Add client ID/secret to .env",
    ],
  },
  {
    id:       "reels",
    name:     "Instagram Reels",
    icon:     "◈",
    color:    "#E1306C",
    bg:       "#1a0a14",
    desc:     "Publish Reels, carousels & stories via Meta API",
    scopes:   ["Publish media","Manage posts","Read insights","Schedule content"],
    apiNote:  "Free via Meta Business Suite — requires Business account",
    apiUrl:   "https://developers.facebook.com",
    tier:     "Free",
    tierColor:"#00FFB2",
    authUrl:  "https://api.instagram.com/oauth/authorize",
    steps:    [
      "Create app at developers.facebook.com",
      "Add Instagram Graph API product",
      "Connect Instagram Business account",
      "Add access token to .env",
    ],
  },
];

// ── MOCK CONNECTION STATES ────────────────────────────────────────────────────
const INITIAL_STATUS = {
  twitter:   { state: "disconnected" },
  linkedin:  { state: "connected",    username: "@virallift_brand", since: "Dec 12, 2024", posts: 47 },
  tiktok:    { state: "disconnected" },
  youtube:   { state: "connecting" },
  reels:     { state: "disconnected" },
};

// ── PERMISSION BADGE ──────────────────────────────────────────────────────────
function ScopeBadge({ label, color }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:6,
      padding:"5px 10px", borderRadius:20,
      background:`${color}10`, border:`1px solid ${color}25`,
      fontSize:11, color:"#888",
      fontFamily:"'Geist Mono',monospace",
    }}>
      <div style={{ width:5, height:5, borderRadius:"50%", background:color, flexShrink:0 }}/>
      {label}
    </div>
  );
}

// ── OAUTH MODAL ───────────────────────────────────────────────────────────────
function OAuthModal({ platform, onClose, onSuccess }) {
  const [step, setStep]       = useState("intro"); // intro|setup|authorizing|success|error
  const [setupStep, setSetup] = useState(0);
  const [copied, setCopied]   = useState(null);
  const timerRef = useRef(null);

  function copyText(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function startAuth() {
    setStep("authorizing");
    // Simulate OAuth popup + callback
    timerRef.current = setTimeout(() => {
      setStep("success");
      setTimeout(() => { onSuccess(); onClose(); }, 1800);
    }, 3000);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const callbackUrl = `https://virallift.app/api/auth/${platform.id}/callback`;
  const envKey = platform.id === "twitter" ? "TWITTER_API_KEY" :
                 platform.id === "linkedin" ? "LINKEDIN_CLIENT_ID" :
                 platform.id === "tiktok"   ? "TIKTOK_CLIENT_KEY" :
                 platform.id === "youtube"  ? "YOUTUBE_CLIENT_ID" : "META_CLIENT_ID";

  return (
    <div style={{
      position:"fixed", inset:0, background:"#00000095", zIndex:200,
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:20, backdropFilter:"blur(4px)",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        width:520, background:"#080808",
        border:`1px solid ${platform.color}30`,
        borderRadius:20, overflow:"hidden",
        boxShadow:`0 0 80px ${platform.color}18`,
        animation:"slideDown .3s ease",
      }}>
        {/* Modal header */}
        <div style={{
          padding:"20px 24px", borderBottom:"1px solid #141414",
          background:`linear-gradient(135deg, ${platform.bg}, #080808)`,
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{
              width:44, height:44, borderRadius:12,
              background:`${platform.color}20`, border:`1px solid ${platform.color}40`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20, color:platform.color, fontWeight:700,
            }}>{platform.icon}</div>
            <div>
              <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:17, fontWeight:700, color:"#fff" }}>
                Connect {platform.name}
              </div>
              <div style={{ fontSize:11, color:"#555", marginTop:2, fontFamily:"'Geist Mono',monospace" }}>
                OAuth 2.0 Authorization
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#333", cursor:"pointer", fontSize:18, lineHeight:1 }}>✕</button>
        </div>

        <div style={{ padding:"24px" }}>

          {/* INTRO STEP */}
          {step === "intro" && (
            <div style={{ animation:"fadeIn .3s ease" }}>
              <p style={{ fontSize:13, color:"#666", lineHeight:1.7, marginBottom:20 }}>
                ViralLift will request permission to publish content on your behalf. You can revoke access at any time from your {platform.name} settings.
              </p>

              {/* Scopes */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, color:"#333", letterSpacing:2, marginBottom:10 }}>PERMISSIONS REQUESTED</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {platform.scopes.map(s => <ScopeBadge key={s} label={s} color={platform.color}/>)}
                </div>
              </div>

              {/* API note */}
              <div style={{
                padding:"12px 14px", background:`${platform.color}08`,
                border:`1px solid ${platform.color}20`, borderRadius:10,
                fontSize:12, color:"#666", marginBottom:20,
                display:"flex", gap:10, alignItems:"flex-start",
              }}>
                <span style={{ fontSize:16, flexShrink:0 }}>
                  {platform.tier === "Paid" ? "💳" : "✅"}
                </span>
                <div>
                  <span style={{ color:platform.tierColor, fontWeight:700 }}>{platform.tier} · </span>
                  {platform.apiNote}
                  {" "}<a href={platform.apiUrl} target="_blank" rel="noreferrer" style={{ color:platform.color, textDecoration:"none" }}>Get API keys →</a>
                </div>
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setStep("setup")} style={{
                  flex:1, padding:"12px", borderRadius:10,
                  background:`linear-gradient(135deg, ${platform.color}, ${platform.color}CC)`,
                  border:"none", color:"#fff", fontSize:13, fontWeight:700,
                  cursor:"pointer", fontFamily:"'Bricolage Grotesque',sans-serif",
                }}>Setup Guide →</button>
                <button onClick={startAuth} style={{
                  flex:1, padding:"12px", borderRadius:10,
                  background:"#0D0D0D", border:`1px solid ${platform.color}40`,
                  color:platform.color, fontSize:13, fontWeight:700,
                  cursor:"pointer", fontFamily:"'Bricolage Grotesque',sans-serif",
                }}>I Have Keys — Connect</button>
              </div>
            </div>
          )}

          {/* SETUP GUIDE STEP */}
          {step === "setup" && (
            <div style={{ animation:"fadeIn .3s ease" }}>
              <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, color:"#444", letterSpacing:2, marginBottom:16 }}>
                SETUP GUIDE — {setupStep + 1}/{platform.steps.length}
              </div>

              {/* Progress dots */}
              <div style={{ display:"flex", gap:6, marginBottom:20 }}>
                {platform.steps.map((_,i) => (
                  <div key={i} style={{
                    flex:1, height:3, borderRadius:2,
                    background: i <= setupStep ? platform.color : "#141414",
                    transition:"background .3s",
                    boxShadow: i === setupStep ? `0 0 8px ${platform.color}` : "none",
                  }}/>
                ))}
              </div>

              <div style={{
                padding:"18px 20px", background:"#0D0D0D",
                border:`1px solid ${platform.color}20`, borderRadius:12,
                marginBottom:20,
              }}>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:20, color:"#fff", marginBottom:8, fontWeight:600 }}>
                  Step {setupStep + 1}
                </div>
                <div style={{ fontSize:14, color:"#888", lineHeight:1.7 }}>
                  {platform.steps[setupStep]}
                </div>
              </div>

              {/* Callback URL (shown on step 2) */}
              {setupStep === 1 && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, color:"#444", letterSpacing:2, marginBottom:8 }}>YOUR CALLBACK URL</div>
                  <div style={{
                    display:"flex", alignItems:"center", gap:8,
                    padding:"10px 12px", background:"#060606",
                    border:"1px solid #1a1a1a", borderRadius:8,
                  }}>
                    <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:11, color:"#555", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {callbackUrl}
                    </span>
                    <button onClick={() => copyText(callbackUrl, "callback")} style={{
                      background: copied==="callback" ? `${platform.color}20` : "#111",
                      border:`1px solid ${copied==="callback" ? platform.color+"40" : "#1e1e1e"}`,
                      borderRadius:6, padding:"4px 10px", cursor:"pointer",
                      fontSize:10, fontFamily:"'Geist Mono',monospace",
                      color: copied==="callback" ? platform.color : "#444",
                      flexShrink:0, transition:"all .2s",
                    }}>{copied==="callback" ? "✓ COPIED" : "COPY"}</button>
                  </div>
                </div>
              )}

              {/* Env var hint (shown on step 3) */}
              {setupStep === 2 && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, color:"#444", letterSpacing:2, marginBottom:8 }}>ADD TO .env.local</div>
                  <div style={{
                    padding:"10px 14px", background:"#060606",
                    border:"1px solid #1a1a1a", borderRadius:8,
                    fontFamily:"'Geist Mono',monospace", fontSize:11, color:"#555",
                    lineHeight:1.8,
                  }}>
                    {envKey}=<span style={{ color:platform.color }}>"your_key_here"</span><br/>
                    {envKey.replace("_ID","_SECRET").replace("_KEY","_SECRET")}=<span style={{ color:platform.color }}>"your_secret_here"</span>
                  </div>
                </div>
              )}

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setupStep > 0 ? setSetup(s => s-1) : setStep("intro")} style={{
                  padding:"11px 20px", borderRadius:10, background:"#0D0D0D",
                  border:"1px solid #1e1e1e", color:"#555", fontSize:13,
                  cursor:"pointer", fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:600,
                }}>← Back</button>
                {setupStep < platform.steps.length - 1
                  ? <button onClick={() => setSetup(s => s+1)} style={{
                      flex:1, padding:"11px", borderRadius:10,
                      background:`${platform.color}18`, border:`1px solid ${platform.color}40`,
                      color:platform.color, fontSize:13, fontWeight:700,
                      cursor:"pointer", fontFamily:"'Bricolage Grotesque',sans-serif",
                    }}>Next Step →</button>
                  : <button onClick={startAuth} style={{
                      flex:1, padding:"11px", borderRadius:10,
                      background:`linear-gradient(135deg,${platform.color},${platform.color}CC)`,
                      border:"none", color:"#fff", fontSize:13, fontWeight:700,
                      cursor:"pointer", fontFamily:"'Bricolage Grotesque',sans-serif",
                    }}>⚡ Authorize {platform.name}</button>
                }
              </div>
            </div>
          )}

          {/* AUTHORIZING */}
          {step === "authorizing" && (
            <div style={{ textAlign:"center", padding:"20px 0", animation:"fadeIn .3s ease" }}>
              <div style={{
                width:72, height:72, borderRadius:"50%", margin:"0 auto 20px",
                background:`${platform.color}15`, border:`2px solid ${platform.color}40`,
                display:"flex", alignItems:"center", justifyContent:"center",
                position:"relative",
              }}>
                <div style={{
                  position:"absolute", inset:-6, borderRadius:"50%",
                  border:`2px solid ${platform.color}`, borderTopColor:"transparent",
                  animation:"spin 1s linear infinite",
                }}/>
                <span style={{ fontSize:28, color:platform.color }}>{platform.icon}</span>
              </div>
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:22, color:"#fff", marginBottom:8, fontStyle:"italic" }}>
                Authorizing...
              </div>
              <div style={{ fontSize:13, color:"#444", lineHeight:1.7 }}>
                Waiting for {platform.name} authorization.<br/>
                Complete the popup window to continue.
              </div>
              <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:20 }}>
                {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:platform.color, animation:`pulse 1.2s ${i*.2}s infinite` }}/>)}
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {step === "success" && (
            <div style={{ textAlign:"center", padding:"20px 0", animation:"fadeIn .3s ease" }}>
              <div style={{
                width:72, height:72, borderRadius:"50%", margin:"0 auto 20px",
                background:`${platform.color}20`, border:`2px solid ${platform.color}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                animation:"checkPop .5s ease",
                boxShadow:`0 0 30px ${platform.color}40`,
              }}>
                <span style={{ fontSize:32 }}>✓</span>
              </div>
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:24, color:platform.color, marginBottom:8, fontWeight:600 }}>
                Connected!
              </div>
              <div style={{ fontSize:13, color:"#555" }}>
                {platform.name} is now linked to ViralLift OS
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PLATFORM CARD ─────────────────────────────────────────────────────────────
function PlatformCard({ platform, status, onConnect, onDisconnect, index }) {
  const [hovered, setHovered] = useState(false);
  const isConnected   = status.state === "connected";
  const isConnecting  = status.state === "connecting";
  const isDisconnected= status.state === "disconnected";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isConnected
          ? `linear-gradient(135deg, ${platform.bg}, #080808)`
          : "#080808",
        border:`1px solid ${isConnected ? platform.color+"40" : hovered ? platform.color+"20" : "#141414"}`,
        borderRadius:16, padding:"22px", overflow:"hidden",
        position:"relative", transition:"all .3s ease",
        animation:`fadeUp .4s ${index*.08}s ease both`,
        boxShadow: isConnected ? `0 0 30px ${platform.color}10` : "none",
      }}>

      {/* Connected shimmer */}
      {isConnected && (
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:2,
          background:`linear-gradient(90deg, transparent, ${platform.color}, transparent)`,
        }}/>
      )}

      {/* Top row */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{
            width:48, height:48, borderRadius:14,
            background: isConnected ? `${platform.color}20` : "#0D0D0D",
            border:`1px solid ${isConnected ? platform.color+"50" : "#1a1a1a"}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:22, color:platform.color, fontWeight:800,
            transition:"all .3s",
            boxShadow: isConnected ? `0 0 20px ${platform.color}30` : "none",
            animation: isConnected ? "float 3s ease infinite" : "none",
          }}>{platform.icon}</div>
          <div>
            <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:16, fontWeight:700, color:"#fff" }}>
              {platform.name}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
              <div style={{
                width:6, height:6, borderRadius:"50%",
                background: isConnected ? "#00FFB2" : isConnecting ? "#FFD700" : "#2a2a2a",
                boxShadow: isConnected ? "0 0 6px #00FFB2" : isConnecting ? "0 0 6px #FFD700" : "none",
                animation: isConnecting ? "pulse 1s infinite" : "none",
              }}/>
              <span style={{
                fontFamily:"'Geist Mono',monospace", fontSize:10,
                color: isConnected ? "#00FFB2" : isConnecting ? "#FFD700" : "#2a2a2a",
                letterSpacing:.5,
              }}>
                {isConnected ? "CONNECTED" : isConnecting ? "CONNECTING..." : "NOT CONNECTED"}
              </span>
            </div>
          </div>
        </div>

        {/* Tier badge */}
        <span style={{
          fontFamily:"'Geist Mono',monospace", fontSize:9, fontWeight:700,
          color:platform.tierColor, background:`${platform.tierColor}15`,
          padding:"3px 9px", borderRadius:20, letterSpacing:.5,
          border:`1px solid ${platform.tierColor}30`,
        }}>{platform.tier}</span>
      </div>

      {/* Description */}
      <p style={{ fontSize:12, color:"#555", lineHeight:1.6, marginBottom:14 }}>
        {platform.desc}
      </p>

      {/* Scopes */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:16 }}>
        {platform.scopes.slice(0,3).map(s => <ScopeBadge key={s} label={s} color={platform.color}/>)}
      </div>

      {/* Connected info */}
      {isConnected && (
        <div style={{
          padding:"10px 12px", background:"#00000040",
          border:`1px solid ${platform.color}15`, borderRadius:10,
          marginBottom:14, animation:"fadeIn .3s ease",
        }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {[
              { label:"ACCOUNT",  value:status.username },
              { label:"SINCE",    value:status.since },
              { label:"POSTS",    value:`${status.posts} published` },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:9, color:"#333", letterSpacing:1, marginBottom:2 }}>{item.label}</div>
                <div style={{ fontSize:11, color:"#888", fontWeight:600 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display:"flex", gap:8 }}>
        {isDisconnected && (
          <button onClick={() => onConnect(platform)} style={{
            flex:1, padding:"11px", borderRadius:10,
            background: hovered
              ? `linear-gradient(135deg, ${platform.color}, ${platform.color}CC)`
              : `${platform.color}15`,
            border:`1px solid ${platform.color}${hovered?"":"40"}`,
            color: hovered ? "#fff" : platform.color,
            fontSize:12, fontWeight:700, cursor:"pointer",
            fontFamily:"'Bricolage Grotesque',sans-serif",
            transition:"all .3s", display:"flex", alignItems:"center",
            justifyContent:"center", gap:7,
          }}>
            <span style={{ fontSize:14 }}>🔗</span> Connect {platform.name}
          </button>
        )}
        {isConnecting && (
          <button disabled style={{
            flex:1, padding:"11px", borderRadius:10,
            background:"#0D0D0D", border:`1px solid ${platform.color}30`,
            color:platform.color, fontSize:12, fontWeight:700,
            cursor:"not-allowed", fontFamily:"'Bricolage Grotesque',sans-serif",
            display:"flex", alignItems:"center", justifyContent:"center", gap:7,
          }}>
            <div style={{ width:12, height:12, border:`2px solid ${platform.color}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin .7s linear infinite" }}/>
            Connecting...
          </button>
        )}
        {isConnected && (
          <>
            <button style={{
              flex:1, padding:"11px", borderRadius:10,
              background:`${platform.color}12`, border:`1px solid ${platform.color}30`,
              color:platform.color, fontSize:12, fontWeight:700,
              cursor:"pointer", fontFamily:"'Bricolage Grotesque',sans-serif",
              display:"flex", alignItems:"center", justifyContent:"center", gap:7,
            }}>
              <span>⚙</span> Settings
            </button>
            <button onClick={() => onDisconnect(platform.id)} style={{
              padding:"11px 16px", borderRadius:10,
              background:"#0D0D0D", border:"1px solid #1e1e1e",
              color:"#333", fontSize:12, cursor:"pointer",
              fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:600,
              transition:"all .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="#FF3B6B40"; e.currentTarget.style.color="#FF3B6B"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="#1e1e1e"; e.currentTarget.style.color="#333"; }}>
              Disconnect
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function OAuthConnectFlow() {
  const [statuses, setStatuses] = useState(INITIAL_STATUS);
  const [modal,    setModal]    = useState(null);
  const [toast,    setToast]    = useState(null);

  const connected   = Object.values(statuses).filter(s => s.state === "connected").length;
  const total       = PLATFORMS.length;

  function showToast(msg, color = "#00FFB2") {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  }

  function handleConnect(platform) {
    setModal(platform);
  }

  function handleSuccess(platformId) {
    setStatuses(p => ({
      ...p,
      [platformId]: {
        state:    "connected",
        username: `@virallift_${platformId}`,
        since:    new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }),
        posts:    0,
      },
    }));
    showToast(`${PLATFORMS.find(p=>p.id===platformId)?.name} connected successfully!`);
  }

  function handleDisconnect(id) {
    setStatuses(p => ({ ...p, [id]: { state: "disconnected" } }));
    showToast(`${PLATFORMS.find(p=>p.id===id)?.name} disconnected`, "#FF3B6B");
  }

  const readyToLaunch = connected >= 2;

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", background:"#030303", fontFamily:"'Bricolage Grotesque',sans-serif", color:"#eee", position:"relative" }}>

        {/* Ambient glow */}
        <div style={{ position:"fixed", top:-200, right:-200, width:500, height:500, borderRadius:"50%", background:"#00FFB208", filter:"blur(100px)", pointerEvents:"none", zIndex:0 }}/>
        <div style={{ position:"fixed", bottom:-200, left:-200, width:400, height:400, borderRadius:"50%", background:"#7B61FF08", filter:"blur(100px)", pointerEvents:"none", zIndex:0 }}/>

        {/* Ticker */}
        <div style={{ background:"linear-gradient(90deg,#00FFB2,#7B61FF)", padding:"5px 0", overflow:"hidden", position:"relative", zIndex:10 }}>
          <div style={{ display:"flex", animation:"ticker 20s linear infinite", whiteSpace:"nowrap", width:"200%" }}>
            {[...Array(2)].map((_,j) => (
              <span key={j} style={{ display:"flex" }}>
                {["OAUTH 2.0 SECURE CONNECTION","PLATFORM AUTHORIZATION","END-TO-END ENCRYPTED","TOKEN MANAGEMENT ACTIVE","ZERO-KNOWLEDGE ARCHITECTURE"].map((t,i) => (
                  <span key={i} style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, fontWeight:700, color:"#000", padding:"0 36px", letterSpacing:2 }}>◆ {t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <div style={{ maxWidth:1000, margin:"0 auto", padding:"36px 24px 60px", position:"relative", zIndex:1 }}>

          {/* Header */}
          <div style={{ marginBottom:32, animation:"fadeUp .4s ease" }}>
            <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, color:"#00FFB2", letterSpacing:4, marginBottom:10 }}>
              VIRALLIFT OS — PLATFORM CONNECTIONS
            </div>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:52, fontWeight:600, color:"#fff", lineHeight:1.05, marginBottom:12, letterSpacing:-1 }}>
              Connect your<br/>
              <span style={{ fontStyle:"italic", color:"#00FFB2" }}>platforms.</span>
            </h1>
            <p style={{ fontSize:14, color:"#555", maxWidth:460, lineHeight:1.7 }}>
              Authorize ViralLift OS to publish on your behalf. Connect once — the autonomous loop handles everything from here.
            </p>
          </div>

          {/* Status bar */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"16px 20px", background:"#080808",
            border:`1px solid ${readyToLaunch?"#00FFB230":"#141414"}`,
            borderRadius:14, marginBottom:28,
            animation:"fadeUp .4s .1s ease both",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div>
                <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, color:"#333", letterSpacing:2, marginBottom:4 }}>PLATFORMS CONNECTED</div>
                <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
                  <span style={{ fontFamily:"'Fraunces',serif", fontSize:36, color: readyToLaunch?"#00FFB2":"#fff", fontWeight:600 }}>{connected}</span>
                  <span style={{ fontSize:16, color:"#333" }}>/ {total}</span>
                </div>
              </div>
              <div style={{ width:1, height:40, background:"#141414" }}/>
              <div>
                <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, color:"#333", letterSpacing:2, marginBottom:6 }}>CONNECTION STATUS</div>
                <div style={{ display:"flex", gap:8 }}>
                  {PLATFORMS.map(p => (
                    <div key={p.id} title={p.name} style={{
                      width:28, height:28, borderRadius:8,
                      background:`${p.color}${statuses[p.id]?.state==="connected"?"20":"08"}`,
                      border:`1px solid ${p.color}${statuses[p.id]?.state==="connected"?"50":"15"}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:12, color:`${p.color}${statuses[p.id]?.state==="connected"?"":"50"}`,
                      transition:"all .3s",
                      boxShadow: statuses[p.id]?.state==="connected" ? `0 0 10px ${p.color}30` : "none",
                    }}>{p.icon}</div>
                  ))}
                </div>
              </div>
            </div>

            {readyToLaunch ? (
              <div style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"10px 18px", background:"#00FFB210",
                border:"1px solid #00FFB230", borderRadius:10,
              }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:"#00FFB2", boxShadow:"0 0 8px #00FFB2" }}/>
                <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:11, color:"#00FFB2", letterSpacing:1 }}>READY TO LAUNCH</span>
              </div>
            ) : (
              <div style={{ fontSize:12, color:"#333", fontStyle:"italic" }}>
                Connect 2+ platforms to enable auto-publish
              </div>
            )}
          </div>

          {/* Platform grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:16, marginBottom:28 }}>
            {PLATFORMS.map((p, i) => (
              <PlatformCard
                key={p.id}
                platform={p}
                status={statuses[p.id]}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                index={i}
              />
            ))}
          </div>

          {/* Security note */}
          <div style={{
            padding:"18px 22px", background:"#080808",
            border:"1px solid #141414", borderRadius:14,
            display:"flex", gap:16, alignItems:"flex-start",
            animation:"fadeUp .4s .3s ease both",
          }}>
            <span style={{ fontSize:24, flexShrink:0 }}>🔐</span>
            <div>
              <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, color:"#444", letterSpacing:2, marginBottom:6 }}>SECURITY</div>
              <p style={{ fontSize:12, color:"#555", lineHeight:1.7 }}>
                All OAuth tokens are encrypted at rest using AES-256. ViralLift never stores your platform passwords. You can revoke access at any time directly from each platform's settings. Tokens are automatically refreshed and never exposed in client-side code.
              </p>
            </div>
          </div>
        </div>

        {/* OAuth Modal */}
        {modal && (
          <OAuthModal
            platform={modal}
            onClose={() => setModal(null)}
            onSuccess={() => { handleSuccess(modal.id); setModal(null); }}
          />
        )}

        {/* Toast */}
        {toast && (
          <div style={{
            position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
            padding:"12px 22px", background:"#0D0D0D",
            border:`1px solid ${toast.color}40`, borderRadius:40,
            display:"flex", alignItems:"center", gap:10,
            boxShadow:`0 0 30px ${toast.color}20`,
            animation:"slideDown .3s ease",
            zIndex:300, whiteSpace:"nowrap",
          }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:toast.color, boxShadow:`0 0 8px ${toast.color}` }}/>
            <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:12, color:toast.color, letterSpacing:.5 }}>{toast.msg}</span>
          </div>
        )}
      </div>
    </>
  );
}
