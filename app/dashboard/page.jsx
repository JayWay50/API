"use client";
export default function Dashboard() {
  return (
    <div style={{fontFamily:"sans-serif",minHeight:"100vh",background:"#f5f5f5"}}>
      <nav style={{background:"white",padding:"16px 32px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"}}>
        <h1 style={{margin:0,fontSize:"20px",color:"#6366f1"}}>ViralLift Global</h1>
        <button style={{padding:"8px 16px",background:"#6366f1",color:"white",border:"none",borderRadius:"8px",cursor:"pointer"}}>Logout</button>
      </nav>
      <main style={{padding:"32px",maxWidth:"1200px",margin:"0 auto"}}>
        <h2>Dashboard</h2>
        <p>Welcome to ViralLift Global!</p>
      </main>
    </div>
  )
}
