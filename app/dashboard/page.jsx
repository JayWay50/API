"use client";
export default function Dashboard() {
  return (
    <div style={{fontFamily:"sans-serif",minHeight:"100vh",background:"#f5f5f5"}}>
      <nav style={{background:"white",padding:"16px 32px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"}}>
        <h1 style={{margin:0,fontSize:"20px",color:"#6366f1"}}>ViralLift Global</h1>
        <div style={{display:"flex",gap:"16px",alignItems:"center"}}>
          <span style={{color:"#666"}}>Welcome back!</span>
          <button style={{padding:"8px 16px",background:"#6366f1",color:"white",border:"none",borderRadius:"8px",cursor:"pointer"}}>Logout</button>
        </div>
      </nav>
      <main style={{padding:"32px",maxWidth:"1200px",margin:"0 auto"}}>
        <h2 style={{marginBottom:"24px"}}>Dashboard</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px",marginBottom:"32px"}}>
          <div style={{background:"white",padding:"24px",borderRadius:"12px",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"}}>
            <p style={{color:"#666",margin:"0 0 8px",fontSize:"14px"}}>Total Posts</p>
            <h3 style={{margin:0,fontSize:"32px",color:"#6366f1"}}>0</h3>
          </div>
          <div style={{background:"white",padding:"24px",borderRadius:"12px",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"}}>
            <p style={{color:"#666",margin:"0 0 8px",fontSize:"14px"}}>Connected Accounts</p>
            <h3 style={{margin:0,fontSize:"32px",color:"#6366f1"}}>0</h3>
          </div>
          <div style={{background:"white",padding:"24px",borderRadius:"12px",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"}}>
            <p style={{color:"#666",margin:"0 0 8px",fontSize:"14px"}}>Scheduled Posts</p>
            <h3 style={{margin:0,fontSize:"32px",color:"#6366f1"}}>0</h3>
          </div>
          <div style={{background:"white",padding:"24px",borderRadius:"12px",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"}}>
            <p style={{color:"#666",margin:"0 0 8px",fontSize:"14px"}}>Total Reach</p>
            <h3 style={{margin:0,fontSize:"32px",color:"#6366f1"}}>0</h3>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:"16px"}}>
          <div style={{background:"white",padding:"24px",borderRadius:"12px",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"}}>
            <h3 style={{marginTop:0}}>Recent Posts</h3>
            <p style={{color:"#666"}}>No posts yet. Create your first post!</p>
            <button style={{padding:"12px 24px",background:"#6366f1",color:"white",border:"none",borderRadius:"8px",cursor:"pointer"}}>Create Post</button>
          </div>
          <div style={{background:"white",padding:"24px",borderRadius:"12px",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"}}>
            <h3 style={{marginTop:0}}>Connected Platforms</h3>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              <button style={{padding:"10px",background:"#1da1f2",color:"white",border:"none",borderRadius:"8px",cursor:"pointer"}}>Connect Twitter</button>
              <button style={{padding:"10px",background:"#0077b5",color:"white",border:"none",borderRadius:"8px",cursor:"pointer"}}>Connect LinkedIn</button>
              <button style={{padding:"10px",background:"#ff0050",color:"white",border:"none",borderRadius:"8px",cursor:"pointer"}}>Connect TikTok</button>
              <button style={{padding:"10px",background:"#ff0000",color:"white",border:"none",borderRadius:"8px",cursor:"pointer"}}>Connect YouTube</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
