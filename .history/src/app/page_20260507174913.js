"use client"
import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import gsap from "gsap"

export default function Home() {
  const breatheRef = useRef(null)
  const safeRef = useRef(null)
  const glowRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const tl = gsap.timeline()

    // fade in glow
    tl.fromTo(glowRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 2, ease: "power2.out" }
    )

    // breathe... fades in
    .fromTo(breatheRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.8, ease: "power2.out" },
      "-=1.5"
    )

    // you are safe fades in
    .fromTo(safeRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.8, ease: "power2.out" },
      "-=1.2"
    )

    // everything fades out
    .to([glowRef.current, breatheRef.current, safeRef.current],
      { opacity: 0, y: -10, duration: 1.2, ease: "power2.in" },
      "+=1.5"
    )

    // go to login
    .call(() => router.push("/login"))

  }, [])

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Georgia, serif",
      background: "radial-gradient(ellipse at center, #1e1030 0%, #0f0f1a 70%)",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* glow */}
      <div ref={glowRef} style={{
        position: "absolute",
        width: "350px",
        height: "350px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(160,100,220,0.15) 0%, transparent 70%)",
        opacity: 0,
      }} />

      {/* breathe... */}
      <p ref={breatheRef} style={{
        color: "#c9a0dc",
        fontSize: "1.1rem",
        letterSpacing: "0.35em",
        margin: "0 0 20px 0",
        opacity: 0,
      }}>
        breathe...
      </p>

      {/* you are safe */}
      <h1 ref={safeRef} style={{
        color: "#e8d5f5",
        fontSize: "2.2rem",
        fontWeight: "normal",
        margin: "0",
        letterSpacing: "0.05em",
        opacity: 0,
      }}>
        you are safe. 🌸
      </h1>

    </main>
  )
}