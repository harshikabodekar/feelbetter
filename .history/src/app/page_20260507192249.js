"use client"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { useRouter } from "next/navigation"

export default function Home() {
  const scrollTextRef = useRef(null)
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  const logoContainerRef = useRef(null)
  const router = useRouter()

  // realistic wave on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    canvas.width = window.innerWidth
    canvas.height = 220

    const waves = [
      { amplitude: 28, frequency: 0.018, speed: 0.03, offset: 0, color: "rgba(14,143,163,0.5)" },
      { amplitude: 20, frequency: 0.022, speed: 0.045, offset: 2, color: "rgba(20,180,200,0.35)" },
      { amplitude: 14, frequency: 0.03, speed: 0.06, offset: 4, color: "rgba(168,230,232,0.25)" },
    ]

    let frame = 0
    let animId

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      waves.forEach(wave => {
        ctx.beginPath()
        ctx.moveTo(0, canvas.height)

        for (let x = 0; x <= canvas.width; x += 2) {
          const y = canvas.height / 2
            + Math.sin(x * wave.frequency + frame * wave.speed + wave.offset) * wave.amplitude
            + Math.sin(x * wave.frequency * 1.7 + frame * wave.speed * 0.8 + wave.offset) * (wave.amplitude * 0.4)

          ctx.lineTo(x, y)
        }

        ctx.lineTo(canvas.width, canvas.height)
        ctx.lineTo(0, canvas.height)
        ctx.closePath()

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, wave.color)
        gradient.addColorStop(1, "rgba(168,230,232,0.05)")
        ctx.fillStyle = gradient
        ctx.fill()
      })

      frame++
      animId = requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      canvas.width = window.innerWidth
    }
    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // scrolling text animation only
  useEffect(() => {
    gsap.fromTo(scrollTextRef.current,
      { x: "100vw" },
      {
        x: "-100%",
        duration: 12,
        ease: "none",
        repeat: -1,
      }
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

      {/* logo/video container - stays centered */}
      <div ref={logoContainerRef} style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        zIndex: 5,
        position: "relative",
      }}>
        {/* video in place of logo mark */}
        <video
          ref={videoRef}
          autoPlay
          loop
          playsInline
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            border: "3px solid rgba(168,230,232,0.8)",
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(6px)",
            objectFit: "cover",
          }}
        >
          <source src="/wave.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* app name */}
        <h1 style={{
          color: "#e8f8f9",
          fontSize: "4.5rem",
          fontWeight: "700",
          margin: "0",
          letterSpacing: "0.12em",
          textShadow: "0 2px 20px rgba(14,143,163,0.5)",
        }}>
          feelbetter
        </h1>

        {/* tagline */}
        <p style={{
          color: "rgba(232,248,249,0.85)",
          fontSize: "1.3rem",
          letterSpacing: "0.22em",
          margin: "0",
          fontWeight: "600",
        }}>
          a safe space for your feelings
        </p>

        {/* go button */}
        <button
          onClick={() => router.push("/login")}
          style={{
            marginTop: "30px",
            background: "rgba(255,255,255,0.1)",
            border: "2px solid rgba(168,230,232,0.7)",
            color: "#e8f8f9",
            padding: "14px 40px",
            borderRadius: "30px",
            fontSize: "1.1rem",
            fontWeight: "700",
            letterSpacing: "0.15em",
            cursor: "pointer",
            fontFamily: "Georgia, serif",
            backdropFilter: "blur(6px)",
          }}>
          enter →
        </button>
      </div>

      {/* realistic canvas waves */}
      <canvas ref={canvasRef} style={{
        position: "absolute",
        bottom: "60px",
        left: "0",
        width: "100%",
        zIndex: 1,
      }} />

      {/* scrolling bold text */}
      <div style={{
        position: "absolute",
        bottom: "18px",
        width: "100%",
        overflow: "hidden",
        zIndex: 2,
      }}>
        <p ref={scrollTextRef} style={{
          color: "rgba(232,248,249,0.9)",
          fontSize: "1.4rem",
          fontWeight: "800",
          margin: "0",
          whiteSpace: "nowrap",
          letterSpacing: "0.2em",
          display: "inline-block",
          textShadow: "0 1px 10px rgba(14,143,163,0.6)",
        }}>
          breathe. feel. heal. &nbsp;&nbsp;&nbsp;&nbsp; breathe. feel. heal. &nbsp;&nbsp;&nbsp;&nbsp; breathe. feel. heal. &nbsp;&nbsp;&nbsp;&nbsp;
        </p>
      </div>

    </main>
  )
}