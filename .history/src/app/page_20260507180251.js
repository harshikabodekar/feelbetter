"use client"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"

const styles = {
  main: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Georgia, serif",
    background: "radial-gradient(ellipse at center, #0d2f2f 0%, #061a1a 70%)",
    overflow: "hidden",
    position: "relative",
    gap: "20px",
  },
  glow: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(32,178,170,0.12) 0%, transparent 70%)",
    opacity: 0,
  },
  breathe: {
    color: "#7ececa",
    fontSize: "1rem",
    letterSpacing: "0.4em",
    margin: "0",
    opacity: 0,
  },
  safe: {
    color: "#cef0ee",
    fontSize: "2.2rem",
    fontWeight: "normal",
    margin: "0",
    letterSpacing: "0.06em",
    opacity: 0,
  },
  btnRow: {
    position: "fixed",
    bottom: "32px",
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "center",
    zIndex: 10,
  },
  btn: {
    background: "rgba(32,178,170,0.1)",
    border: "1px solid rgba(126,206,202,0.3)",
    color: "#7ececa",
    padding: "8px 18px",
    borderRadius: "20px",
    fontSize: "12px",
    cursor: "pointer",
    letterSpacing: "0.05em",
    fontFamily: "Georgia, serif",
  },
  activeBtn: {
    background: "rgba(32,178,170,0.25)",
    border: "1px solid #7ececa",
    color: "#cef0ee",
    padding: "8px 18px",
    borderRadius: "20px",
    fontSize: "12px",
    cursor: "pointer",
    letterSpacing: "0.05em",
    fontFamily: "Georgia, serif",
  }
}

export default function Home() {
  const breatheRef = useRef(null)
  const safeRef = useRef(null)
  const glowRef = useRef(null)
  const [active, setActive] = useState("float")
  const tlRef = useRef(null)

  const animations = {

    // 1 — words float up like smoke
    float: () => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 })
      tl.set([breatheRef.current, safeRef.current, glowRef.current], { opacity: 0, y: 0 })
      tl.to(glowRef.current, { opacity: 1, duration: 2.5, ease: "power1.out" })
      tl.to(breatheRef.current, { opacity: 1, y: -14, duration: 3, ease: "power1.out" }, "-=2")
      tl.to(safeRef.current, { opacity: 1, y: -10, duration: 3, ease: "power1.out" }, "-=2.2")
      tl.to([breatheRef.current, safeRef.current, glowRef.current], { opacity: 0, y: -22, duration: 2.5, ease: "power1.in" }, "+=1.5")
      return tl
    },

    // 2 — breathe pulse in and out
    breathe: () => {
      const tl = gsap.timeline({ repeat: -1 })
      tl.set([breatheRef.current, safeRef.current, glowRef.current], { opacity: 0, scale: 1 })
      tl.to(glowRef.current, { opacity: 1, scale: 1.15, duration: 3, ease: "sine.inOut" })
      tl.to(breatheRef.current, { opacity: 1, scale: 1.04, duration: 3, ease: "sine.inOut" }, "-=2.5")
      tl.to(safeRef.current, { opacity: 1, scale: 1.04, duration: 3, ease: "sine.inOut" }, "-=2.5")
      tl.to([glowRef.current, breatheRef.current, safeRef.current], { scale: 0.97, duration: 3, ease: "sine.inOut" }, "+=0.2")
      tl.to([glowRef.current, breatheRef.current, safeRef.current], { scale: 1.04, duration: 3, ease: "sine.inOut" })
      tl.to([glowRef.current, breatheRef.current, safeRef.current], { opacity: 0, scale: 1, duration: 2, ease: "power1.in" }, "+=0.5")
      return tl
    },

    // 3 — ripple wave from center
    ripple: () => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 })
      tl.set([breatheRef.current, safeRef.current, glowRef.current], { opacity: 0, scale: 0.85 })
      tl.to(glowRef.current, { opacity: 1, scale: 1.2, duration: 3, ease: "elastic.out(1, 0.5)" })
      tl.to(breatheRef.current, { opacity: 1, scale: 1, duration: 2.5, ease: "elastic.out(1, 0.6)" }, "-=2")
      tl.to(safeRef.current, { opacity: 1, scale: 1, duration: 2.5, ease: "elastic.out(1, 0.6)" }, "-=2")
      tl.to([breatheRef.current, safeRef.current, glowRef.current], { opacity: 0, scale: 1.05, duration: 2, ease: "power2.in" }, "+=2")
      return tl
    },

    // 4 — typewriter one letter at a time
    typewriter: () => {
      const breatheText = "breathe..."
      const safeText = "you are safe. 🌸"
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 })

      tl.to(glowRef.current, { opacity: 1, duration: 2, ease: "power1.out" })

      // type breathe
      breatheText.split("").forEach((_, i) => {
        tl.call(() => {
          if (breatheRef.current) {
            breatheRef.current.style.opacity = 1
            breatheRef.current.textContent = breatheText.slice(0, i + 1)
          }
        }).to({}, { duration: 0.1 })
      })

      tl.to({}, { duration: 0.8 })

      // type you are safe
      safeText.split("").forEach((_, i) => {
        tl.call(() => {
          if (safeRef.current) {
            safeRef.current.style.opacity = 1
            safeRef.current.textContent = safeText.slice(0, i + 1)
          }
        }).to({}, { duration: 0.07 })
      })

      tl.to({}, { duration: 1.5 })
      tl.to([breatheRef.current, safeRef.current, glowRef.current], { opacity: 0, duration: 1.5, ease: "power1.in" })
      tl.call(() => {
        if (breatheRef.current) breatheRef.current.textContent = "breathe..."
        if (safeRef.current) safeRef.current.textContent = "you are safe. 🌸"
      })
      return tl
    }
  }

  const playAnimation = (name) => {
    if (tlRef.current) tlRef.current.kill()
    gsap.set([breatheRef.current, safeRef.current, glowRef.current], { clearProps: "all" })
    breatheRef.current.style.opacity = 0
    safeRef.current.style.opacity = 0
    glowRef.current.style.opacity = 0
    setActive(name)
    tlRef.current = animations[name]()
  }

  useEffect(() => {
    tlRef.current = animations.float()
    return () => { if (tlRef.current) tlRef.current.kill() }
  }, [])

  return (
    <main style={styles.main}>

      <div ref={glowRef} style={styles.glow} />

      <p ref={breatheRef} style={styles.breathe}>
        breathe...
      </p>

      <h1 ref={safeRef} style={styles.safe}>
        you are safe. 🌸
      </h1>

      {/* animation switcher */}
      <div style={styles.btnRow}>
        {[
          { key: "float", label: "float like smoke" },
          { key: "breathe", label: "breathe pulse" },
          { key: "ripple", label: "ripple wave" },
          { key: "typewriter", label: "typewriter" },
        ].map(({ key, label }) => (
          <button
            key={key}
            style={active === key ? styles.activeBtn : styles.btn}
            onClick={() => playAnimation(key)}
          >
            {label}
          </button>
        ))}
      </div>

    </main>
  )
}