"use client";
export default function Signup() {
  return (
    <main style={{fontFamily:"sans-serif",display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"#f5f5f5"}}>
      <div style={{background:"white",padding:"40px",borderRadius:"12px",width:"100%",maxWidth:"400px"}}>
        <h1 style={{textAlign:"center",marginBottom:"8px"}}>ViralLift Global</h1>
        <p style={{textAlign:"center",color:"#666",marginBottom:"32px"}}>Create your account</p>
        <input type="text" placeholder="Full Name" style={{width:"100%",padding:"12px",marginBottom:"12px",border:"1px solid #ddd",borderRadius:"8px",fontSize:"16px",boxSizing:"border-box"}}/>
        <input type="email" placeholder="Email" style={{width:"100%",padding:"12px",marginBottom:"12px",border:"1px solid #ddd",borderRadius:"8px",fontSize:"16px",boxSizing:"border-box"}}/>
        <input type="password" placeholder="Password" style={{width:"100%",padding:"12px",marginBottom:"20px",border:"1px solid #ddd",borderRadius:"8px",fontSize:"16px",boxSizing:"border-box"}}/>
        <button style={{width:"100%",padding:"12px",background:"#6366f1",color:"white",border:"none",borderRadius:"8px",fontSize:"16px",cursor:"pointer"}}>Create Account</button>
        <p style={{textAlign:"center",marginTop:"16px",color:"#666"}}>Already have an account? <a href="/login" style={{color:"#6366f1"}}>Sign in</a></p>
      </div>
    </main>
  )
}
