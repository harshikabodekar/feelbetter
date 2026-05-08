"use client"
import { useEffect, useRef } from "react"
import gsap from "gsap"

export default function Home() {
  const scrollTextRef = useRef(null)
  const logoRef = useRef(null)
  const taglineRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const tl = gsap.timeline()

    // logo fades in first
    tl.fromTo(logoRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 2, ease: "power2.out" }
    )

    // tagline fades in below
    .fromTo(taglineRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 2, ease: "power2.out" },
      "-=1.2"
    )

    // scrolling text slides in from right endlessly
    gsap.fromTo(scrollTextRef.current,
      { x: "100vw" },
      {
        x: "-100%",
        duration: 10,
        ease: "none",
        repeat: -1,
        delay: 1,
      }
    )

    // everything fades out
    tl.to([logoRef.current, taglineRef.current, scrollTextRef.current],
      { opacity: 0, duration: 1.8, ease: "power1.inOut" },
      "+=4"
    )

  }, [])

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Georgia, serif",
      background: "linear-gradient(180deg, #03214a 0%, #06527a 35%, #0e8fa3 65%, #a8e6e8 100%)",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* soft light glow at bottom */}
      <div style={{
        position: "absolute",
        bottom: "0",
        width: "100%",
        height: "200px",
        background: "radial-gradient(ellipse at center bottom, rgba(168,230,232,0.3) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* logo */}
      <div ref={logoRef} style={{
        opacity: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        zIndex: 2,
      }}>
        {/* logo mark — a simple circle with a wave inside */}
        <div style={{
          width: "70px",
          height: "70px",
          borderRadius: "50%",
          border: "2px solid rgba(168,230,232,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(4px)",
        }}>
          <span style={{ fontSize: "1.8rem" }}>🌊</span>
        </div>

        {/* app name */}
        <h1 style={{
          color: "#e8f8f9",
          fontSize: "2.6rem",
          fontWeight: "300",
          margin: "0",
          letterSpacing: "0.15em",
        }}>
          feelbetter
        </h1>
      </div>

      {/* tagline */}
      <p ref={taglineRef} style={{
        opacity: 0,
        color: "rgba(232,248,249,0.6)",
        fontSize: "0.85rem",
        letterSpacing: "0.25em",
        margin: "14px 0 0 0",
        fontWeight: "normal",
        zIndex: 2,
      }}>
        a safe space for your feelings
      </p>

      {/* scrolling bold text at bottom */}
      <div style={{
        position: "absolute",
        bottom: "60px",
        width: "100%",
        overflow: "hidden",
        zIndex: 2,
      }}>
        <p ref={scrollTextRef} style={{
          color: "rgba(232,248,249,0.2)",
          fontSize: "3.5rem",
          fontWeight: "700",
          margin: "0",
          whiteSpace: "nowrap",
          letterSpacing: "0.08em",
          display: "inline-block",
        }}>
          breathe. feel. heal. &nbsp;&nbsp;&nbsp; breathe. feel. heal. &nbsp;&nbsp;&nbsp; breathe. feel. heal.
        </p>
      </div>

    </main>
  )
}