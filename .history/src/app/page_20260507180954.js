"use client"
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { useRouter } from "next/navigation"

export default function Home() {
  const breatheRef = useRef(null)
  const safeRef = useRef(null)
  const glowRef = useRef(null)
  const waveRef1 = useRef(null)
  const waveRef2 = useRef(null)
  const waveRef3 = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const tl = gsap.timeline()

    // waves slowly drift in from bottom
    tl.fromTo(waveRef1.current,
      { opacity: 0, y: 40 },
      { opacity: 0.15, y: 0, duration: 4, ease: "sine.inOut" }
    )
    .fromTo(waveRef2.current,
      { opacity: 0, y: 30 },
      { opacity: 0.1, y: 0, duration: 4, ease: "sine.inOut" },
      "-=3.5"
    )
    .fromTo(waveRef3.current,
      { opacity: 0, y: 20 },
      { opacity: 0.07, y: 0, duration: 4, ease: "sine.inOut" },
      "-=3.5"
    )

    // breathe... floats in very slowly
    .fromTo(breatheRef.current,
      { opacity: 0, y: 16, letterSpacing: "0.2em" },
      { opacity: 1, y: 0, letterSpacing: "0.5em", duration: 3.5, ease: "power1.out" },
      "-=2"
    )

    // you are safe drifts in underneath
    .fromTo(safeRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 3, ease: "power1.out" },
      "-=2"
    )

    // waves gently keep moving
    gsap.to(waveRef1.current, {
      y: -10,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 4,
    })
    gsap.to(waveRef2.current, {
      y: -7,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 4.5,
    })
    gsap.to(waveRef3.current, {
      y: -5,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 5,
    })

    // everything fades out gently like a wave pulling back
    tl.to([breatheRef.current, safeRef.current],
      { opacity: 0, y: -8, duration: 2.5, ease: "power1.inOut" },
      "+=2.5"
    )
    .to([waveRef1.current, waveRef2.current, waveRef3.current],
      { opacity: 0, duration: 2, ease: "power1.inOut" },
      "-=2"
    )
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
      background: "linear-gradient(180deg, #060d14 0%, #0a1f2e 40%, #0d3040 70%, #0e3d4f 100%)",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* stars — tiny dots in the sky */}
      {[...Array(30)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: Math.random() * 2 + 1 + "px",
          height: Math.random() * 2 + 1 + "px",
          borderRadius: "50%",
          background: "white",
          opacity: Math.random() * 0.4 + 0.1,
          top: Math.random() * 60 + "%",
          left: Math.random() * 100 + "%",
        }} />
      ))}

      {/* waves at the bottom */}
      <div ref={waveRef1} style={{
        position: "absolute",
        bottom: "0",
        width: "140%",
        height: "220px",
        background: "radial-gradient(ellipse at center bottom, #1a6a7a 0%, transparent 70%)",
        opacity: 0,
        borderRadius: "50% 50% 0 0",
      }} />
      <div ref={waveRef2} style={{
        position: "absolute",
        bottom: "0",
        width: "120%",
        height: "160px",
        background: "radial-gradient(ellipse at center bottom, #1d8a9a 0%, transparent 65%)",
        opacity: 0,
        borderRadius: "50% 50% 0 0",
      }} />
      <div ref={waveRef3} style={{
        position: "absolute",
        bottom: "0",
        width: "100%",
        height: "100px",
        background: "radial-gradient(ellipse at center bottom, #20b2aa33 0%, transparent 60%)",
        opacity: 0,
        borderRadius: "50% 50% 0 0",
      }} />

      {/* soft glow in the middle — like moonlight on water */}
      <div ref={glowRef} style={{
        position: "absolute",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(20,140,160,0.07) 0%, transparent 70%)",
      }} />

      {/* breathe... */}
      <p ref={breatheRef} style={{
        color: "#a8dde0",
        fontSize: "1.4rem",
        letterSpacing: "0.2em",
        margin: "0 0 18px 0",
        opacity: 0,
        fontWeight: "normal",
      }}>
        breathe...
      </p>

      {/* you are safe */}
      <h1 ref={safeRef} style={{
        color: "#e0f4f5",
        fontSize: "3rem",
        fontWeight: "300",
        margin: "0",
        letterSpacing: "0.08em",
        opacity: 0,
      }}>
        you are safe. 🌸
      </h1>

    </main>
  )
}