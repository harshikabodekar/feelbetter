"use client"
import { useRouter } from "next/navigation"

export default function SpillPage() {
  const router = useRouter()
  return (
    <div style={{
      fontFamily:"var(--font-dm-sans),sans-serif",
      background:"linear-gradient(165deg,#e6f5f7 0%,#d3edf2 48%,#e8f6f8 100%)",
      minHeight:"100vh", color:"#1a3a42",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"40px 24px", textAlign:"center",
    }}>
      <div style={{ fontSize:48, marginBottom:24 }}>💧</div>
      <h1 style={{ fontFamily:"var(--font-dm-serif),serif", fontSize:"clamp(40px,6vw,72px)", fontWeight:400, color:"#0f2e35", marginBottom:16, letterSpacing:-1 }}>
        Spill
      </h1>
      <p style={{ fontSize:20, color:"#5a8a96", fontWeight:300, maxWidth:480, lineHeight:1.6, marginBottom:48 }}>
        let it all out, unfiltered.
      </p>
      <div style={{ background:"rgba(255,255,255,.65)", backdropFilter:"blur(12px)", border:".5px solid rgba(255,255,255,.9)", borderRadius:28, padding:"32px 40px", fontSize:16, color:"#7a9aaa", fontStyle:"italic", marginBottom:40 }}>
        this space is being built with care. check back soon.
      </div>
      <span onClick={() => router.back()} style={{ fontSize:15, color:"#4a8a96", cursor:"pointer", textDecoration:"underline" }}>
        ← back to activities
      </span>
    </div>
  )
}
