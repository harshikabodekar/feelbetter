"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const [phase, setPhase] = useState("hidden")
  const router = useRouter()

  useEffect(() => {
    // fade in
    setTimeout(() => setPhase("visible"), 300)
    // fade out and go to login
    setTimeout(() => setPhase("hidden"), 3500)
    setTimeout(() => router.push("/login"), 4200)
  }, [])

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "#0f0f1a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Georgia, serif",
      background: "radial-gradient(ellipse at center, #1e1030 0%, #0f0f1a 70%)",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* soft glowing circle behind text */}
      <div style={{
        position: "absolute",
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(160,100,220,0.12) 0%, transparent 70%)",
        transition: "opacity 1.5s ease",
        opacity: phase === "visible" ? 1 : 0,
      }} />

      {/* breathe... */}
      <p style={{
        color: "#c9a0dc",
        fontSize: "1.1rem",
        letterSpacing: "0.35em",
        margin: "0 0 20px 0",
        transition: "opacity 1.8s ease, transform 1.8s ease",
        opacity: phase === "visible" ? 1 : 0,
        transform: phase === "visible" ? "translateY(0)" : "translateY(12px)",
      }}>
        breathe...
      </p>

      {/* you are safe */}
      <h1 style={{
        color: "#e8d5f5",
        fontSize: "2.2rem",
        fontWeight: "normal",
        margin: "0",
        letterSpacing: "0.05em",
        transition: "opacity 2.2s ease, transform 2.2s ease",
        transitionDelay: "0.4s",
        opacity: phase === "visible" ? 1 : 0,
        transform: phase === "visible" ? "translateY(0)" : "translateY(12px)",
      }}>
        you are safe. 🌸
      </h1>

    </main>
  )
}