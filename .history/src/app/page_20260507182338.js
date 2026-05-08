"use client"
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { useRouter } from "next/navigation"

export default function Home() {
  const scrollTextRef = useRef(null)
  const canvasRef = useRef(null)
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

  // scrolling text — no fade, immediate
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

      {/* logo */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "14px",
        zIndex: 2,
      }}>
        {/* logo mark */}
        <div style={{
          width: "75px",
          height: "75px",
          borderRadius: "50%",
          border: "2.5px solid rgba(168,230,232,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(6px)",
        }}>
          <span style={{ fontSize: "2rem" }}>🌊</span>
        </div>

        {/