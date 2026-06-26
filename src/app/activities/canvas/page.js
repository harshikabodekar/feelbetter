"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

// ── Mood-based drawing palettes ──────────────────────────────────────────────
// Each palette has variety within its mood-hue: dark, mid, light, and one
// warm or contrasting accent so the drawing isn't monochromatic.
// Colors are tuned to show clearly on the warm-cream canvas background.
const MOOD_PALETTES = {
  empty:       ["#4a6878", "#7a8a96", "#9aaab8", "#3a5060", "#a89488", "#c8d4de"],
  overwhelmed: ["#1a7a8a", "#3a9aaa", "#5eb4c2", "#7a78b8", "#b0d8e4", "#c8aed8"],
  okayish:     ["#4a6040", "#6a8060", "#8aaa78", "#a0a070", "#c8dcc0", "#d4c8a0"],
  heavy:       ["#3a2a70", "#5a4a90", "#7a6ab0", "#9888cc", "#504880", "#c8b8e8"],
  full:        ["#a04820", "#c06830", "#e08a3c", "#c89030", "#e8b878", "#e0c8b0"],
  // Default: a calm varied mix — used when no mood is known
  default:     ["#5a8898", "#7a9a8a", "#9888a8", "#a07858", "#5878a0", "#88a088"],
}

// Charcoal + mid-grey — always available regardless of mood.
// Near-white was removed because it's invisible on the cream canvas.
const EXTRA_COLORS = ["#2a2a2a", "#808080"]

// ── Shared nav bar ─────────────────────────────────────────────────────────────
function CanvasNav({ onBack }) {
  return (
    <nav style={{ display: "flex", alignItems: "center", gap: 16, padding: "28px 40px 0" }}>
      <button
        onClick={onBack}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 40, height: 40, borderRadius: "50%",
          background: "rgba(255,255,255,.62)", backdropFilter: "blur(8px)",
          border: ".5px solid rgba(255,255,255,.85)",
          cursor: "pointer", flexShrink: 0, transition: "background .2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.9)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.62)"}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#2a5a66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>
      <span style={{
        fontFamily: "var(--font-dm-serif), serif",
        fontSize: 18, color: "#1a3a42",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="#3a8a8f" strokeWidth="1.8" strokeLinecap="round">
          <path d="M2 9c2.4-3 4.3-3 6.7 0s4.3 3 6.7 0 4.3-3 6.6 0" />
          <path d="M2 14.5c2.4-3 4.3-3 6.7 0s4.3 3 6.7 0 4.3-3 6.6 0" />
        </svg>
        feelbetter
      </span>
    </nav>
  )
}

// ── Decorative paintbrush icon — tops the mode picker ────────────────────────
function BrushMark({ color = "#c4bad6", opacity = ".58" }) {
  return (
    <svg width="26" height="36" viewBox="0 0 42 58" fill="none">
      <rect x="16" y="2" width="10" height="28" rx="5" fill={color} opacity={opacity} />
      <rect x="13" y="27" width="16" height="7" rx="2.5" fill={color} opacity={parseFloat(opacity) * 0.72} />
      <path d="M21 34 C11 40 11 54 21 54 C31 54 31 40 21 34Z"
        fill={color} opacity={parseFloat(opacity) * 0.88} />
    </svg>
  )
}

// ── Labeled tool button — icon on the left, text label on the right ───────────
// Used for Undo, Eraser, Clear in the drawing toolbar.
function ToolBtn({ children, label, onClick, active = false, disabled = false }) {
  const [hov, setHov] = useState(false)

  const bg = active
    ? "rgba(42,122,136,.15)"
    : hov && !disabled
      ? "rgba(255,255,255,.92)"
      : "rgba(255,255,255,.65)"
  const borderColor = active
    ? "rgba(42,122,136,.4)"
    : hov && !disabled
      ? "rgba(180,210,218,.8)"
      : "rgba(200,220,226,.55)"
  const textColor = disabled
    ? "#b4c4cc"
    : active
      ? "#1a7888"
      : "#3a7888"

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 7,
        height: 38, padding: "0 14px", borderRadius: 12, flexShrink: 0,
        background: bg,
        border: `1.5px solid ${borderColor}`,
        cursor: disabled ? "default" : "pointer",
        color: textColor,
        opacity: disabled ? .38 : 1,
        transition: "background .15s, border-color .15s, color .15s",
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 13, fontWeight: 500, letterSpacing: .1,
      }}
    >
      {children}
      <span>{label}</span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FreeScribble — HTML Canvas drawing surface + toolbar.
// Saves NOTHING. Pure release. When you leave, the drawing is gone.
//
// Drawing architecture:
//  - canvas.width / height fixed at 880 × 520 (internal resolution)
//  - CSS width: 100% scales the canvas visually; getPos() compensates
//  - Pointer events are non-passive so e.preventDefault() blocks mobile scroll
//  - setPointerCapture keeps the stroke alive if pointer leaves the element
//  - tool/color/brushSize are mirrored into refs so event handlers (which
//    close over nothing) always read the latest values without stale closures
// ─────────────────────────────────────────────────────────────────────────────
function FreeScribble({ mood }) {
  const canvasRef    = useRef(null)
  const containerRef = useRef(null)

  // Mutable drawing state — doesn't need React re-renders
  const isDrawingRef = useRef(false)
  const historyRef   = useRef([])   // ImageData snapshots (max 30) for undo

  // Refs mirror state so event handlers always see the current value
  const toolRef   = useRef("draw")
  const colorRef  = useRef(null)
  const brushRef  = useRef(7)

  const palette   = MOOD_PALETTES[mood] || MOOD_PALETTES.default
  const allColors = [...palette, ...EXTRA_COLORS]

  // React state — drives the toolbar UI only (not drawing logic)
  const [color,     setColor]     = useState(palette[0])
  const [tool,      setTool]      = useState("draw")    // "draw" | "erase"
  const [brushSize, setBrushSize] = useState(7)
  const [canUndo,   setCanUndo]   = useState(false)
  const [isEmpty,   setIsEmpty]   = useState(true)

  // Keep refs in sync whenever state changes
  useEffect(() => { toolRef.current = tool },      [tool])
  useEffect(() => { colorRef.current = color },    [color])
  useEffect(() => { brushRef.current = brushSize }, [brushSize])

  // ── Set canvas internal resolution once on mount ───────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    colorRef.current = palette[0]
    canvas.width  = 880
    canvas.height = 520
    // Canvas stays transparent — the cream CSS background shows through,
    // and destination-out erasing will reveal it cleanly.
  }, [])

  // ── Pointer event listeners (non-passive) ──────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Convert a PointerEvent's viewport position → canvas internal coordinates.
    // getBoundingClientRect() reflects the visual (CSS-transformed) size;
    // dividing by it gives the correct scale even when the page is zoomed.
    function getPos(e) {
      const r  = canvas.getBoundingClientRect()
      const sx = canvas.width  / r.width
      const sy = canvas.height / r.height
      return [(e.clientX - r.left) * sx, (e.clientY - r.top) * sy]
    }

    // Apply current tool + color settings to a canvas 2D context
    function applySettings(ctx) {
      const isErase = toolRef.current === "erase"
      ctx.lineCap     = "round"
      ctx.lineJoin    = "round"
      ctx.lineWidth   = isErase ? brushRef.current * 3.5 : brushRef.current
      ctx.strokeStyle = colorRef.current
      // destination-out makes drawn pixels transparent — perfect for erasing
      ctx.globalCompositeOperation = isErase ? "destination-out" : "source-over"
    }

    function onDown(e) {
      if (isDrawingRef.current) return  // ignore extra touch points mid-stroke
      canvas.setPointerCapture(e.pointerId)  // keep tracking outside the element
      e.preventDefault()

      const ctx    = canvas.getContext("2d")
      const [x, y] = getPos(e)

      // Save snapshot BEFORE the stroke so undo restores to the pre-stroke state
      const snap = ctx.getImageData(0, 0, canvas.width, canvas.height)
      historyRef.current.push(snap)
      if (historyRef.current.length > 30) historyRef.current.shift()
      setCanUndo(true)
      setIsEmpty(false)

      applySettings(ctx)

      // Dot at the tap point so single taps leave a visible mark
      ctx.beginPath()
      ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2)
      ctx.fillStyle = toolRef.current === "erase" ? "rgba(0,0,0,1)" : colorRef.current
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(x, y)
      isDrawingRef.current = true
    }

    function onMove(e) {
      if (!isDrawingRef.current) return
      e.preventDefault()

      const ctx    = canvas.getContext("2d")
      const [x, y] = getPos(e)

      applySettings(ctx)
      ctx.lineTo(x, y)
      ctx.stroke()
      // Reset path so each segment renders independently — avoids replaying
      // the whole accumulated path on every mouse-move event
      ctx.beginPath()
      ctx.moveTo(x, y)
    }

    function onUp() {
      if (!isDrawingRef.current) return
      isDrawingRef.current = false
      const ctx = canvas.getContext("2d")
      ctx.globalCompositeOperation = "source-over"
      ctx.beginPath()
    }

    const opts = { passive: false }
    canvas.addEventListener("pointerdown",   onDown, opts)
    canvas.addEventListener("pointermove",   onMove, opts)
    canvas.addEventListener("pointerup",     onUp)
    canvas.addEventListener("pointercancel", onUp)

    return () => {
      canvas.removeEventListener("pointerdown",   onDown, opts)
      canvas.removeEventListener("pointermove",   onMove, opts)
      canvas.removeEventListener("pointerup",     onUp)
      canvas.removeEventListener("pointercancel", onUp)
    }
  }, [])  // [] — handlers only read from refs, so no deps needed

  // ── Undo ──────────────────────────────────────────────────────────────────
  const handleUndo = () => {
    const canvas = canvasRef.current
    if (!canvas || historyRef.current.length === 0) return
    const ctx  = canvas.getContext("2d")
    const snap = historyRef.current.pop()
    ctx.putImageData(snap, 0, 0)
    const remaining = historyRef.current.length
    setCanUndo(remaining > 0)
    if (remaining === 0) setIsEmpty(true)
  }

  // ── Clear ─────────────────────────────────────────────────────────────────
  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height)
    historyRef.current = []
    setCanUndo(false)
    setIsEmpty(true)
  }

  // Picking a color always switches back to draw mode
  const pickColor = (c) => { setColor(c); setTool("draw") }

  // Brush size presets — value is the canvas-internal stroke width
  const SIZES = [
    { value: 3,  label: "S" },
    { value: 7,  label: "M" },
    { value: 16, label: "L" },
  ]

  const isErase = tool === "erase"

  return (
    <div>
      {/* ── Drawing surface ──────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          // Warm cream/paper — opaque so it reads clearly as a drawing surface
          background: "rgba(252,249,246,.98)",
          border: "1px solid rgba(215,230,234,.8)",
          borderRadius: 18, overflow: "hidden",
          marginBottom: 14,
          // Outer shadow lifts it off the page; inner shadow adds a gentle
          // paper-texture depth; top highlight reads as a lit surface edge
          boxShadow: "0 2px 0 rgba(255,255,255,.88), 0 10px 40px rgba(60,120,140,.12), inset 0 2px 8px rgba(60,110,130,.05)",
        }}
      >
        {/* Empty-canvas placeholder — fades as soon as drawing starts */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 10,
          pointerEvents: "none",
          opacity: isEmpty ? 1 : 0, transition: "opacity .9s ease",
        }}>
          {/* Faint crosshair mark at center — feels like an art canvas */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ marginBottom: 4 }}>
            <line x1="16" y1="4"  x2="16" y2="28" stroke="rgba(90,130,140,.18)" strokeWidth="1" strokeDasharray="2 3" />
            <line x1="4"  y1="16" x2="28" y2="16" stroke="rgba(90,130,140,.18)" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx="16" cy="16" r="2.5" fill="rgba(90,130,140,.15)" />
          </svg>
          <p style={{
            fontFamily: "var(--font-dm-serif), serif",
            fontSize: 20, fontStyle: "italic",
            color: "rgba(80,118,130,.42)", userSelect: "none",
          }}>
            draw how you feel.
          </p>
        </div>

        {/* The canvas — transparent layer over the cream background.
            CSS width:100% scales it to the container; internal resolution
            stays fixed at 880×520 and getPos() handles the coordinate mapping. */}
        <canvas
          ref={canvasRef}
          style={{
            display: "block", width: "100%",
            touchAction: "none",
            cursor: isErase ? "cell" : "crosshair",
          }}
        />
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div style={{
        background: "rgba(255,255,255,.82)",
        backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,.96)",
        borderRadius: 18, padding: "12px 18px",
        display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
        boxShadow: "0 4px 24px rgba(60,120,140,.08)",
      }}>

        {/* ── Action tools — labeled pill buttons ── */}
        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>

          <ToolBtn label="undo" disabled={!canUndo} onClick={handleUndo}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 14 4 9 9 4" />
              <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
            </svg>
          </ToolBtn>

          <ToolBtn label={isErase ? "erasing" : "erase"} active={isErase}
            onClick={() => setTool(t => t === "erase" ? "draw" : "erase")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 20H7L3 16l10-10 7 7z" />
              <path d="M6.5 17.5l-3.5-5" />
            </svg>
          </ToolBtn>

          <ToolBtn label="clear" disabled={isEmpty} onClick={handleClear}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </ToolBtn>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 26, background: "rgba(100,140,150,.18)", flexShrink: 0 }} />

        {/* ── Color palette ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {allColors.map(c => {
            const isActive = color === c && !isErase
            return (
              <button
                key={c}
                title={c}
                onClick={() => pickColor(c)}
                style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: c,
                  // Outer white ring + dark ring = clear selection indicator
                  boxShadow: isActive
                    ? `0 0 0 2.5px #fff, 0 0 0 4.5px rgba(40,80,100,.45)`
                    : "0 1px 3px rgba(0,0,0,.12)",
                  transform: isActive ? "scale(1.18)" : "scale(1)",
                  border: "none",
                  cursor: "pointer", flexShrink: 0,
                  transition: "transform .15s ease, box-shadow .15s ease",
                }}
              />
            )
          })}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 26, background: "rgba(100,140,150,.18)", flexShrink: 0 }} />

        {/* ── Brush size presets ──
            The dot is colored with the current drawing color so you can
            preview how the stroke will look before drawing. */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {SIZES.map(({ value, label }) => {
            const isActive  = brushSize === value
            const dotSize   = value === 3 ? 5 : value === 7 ? 10 : 18
            const dotColor  = isErase ? "#a0b4ba" : color

            return (
              <button
                key={value}
                title={`brush size ${label}`}
                onClick={() => setBrushSize(value)}
                style={{
                  width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                  background: isActive ? "rgba(42,122,136,.1)" : "transparent",
                  border: isActive
                    ? "1.5px solid rgba(42,122,136,.32)"
                    : "1.5px solid transparent",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background .14s, border-color .14s",
                }}
              >
                <div style={{
                  width: dotSize, height: dotSize, borderRadius: "50%",
                  background: dotColor,
                  opacity: isActive ? .88 : .45,
                  transition: "opacity .14s, background .14s",
                }} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CanvasContent — separated from the default export so useSearchParams()
// can be safely wrapped in Suspense (required by Next.js App Router)
// ─────────────────────────────────────────────────────────────────────────────
function CanvasContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  // ?mood=heavy comes from the dashboard mood overlay — selects the palette
  const mood = searchParams.get("mood") || null

  // "picker" → choose a mode | "scribble" → the free drawing canvas
  const [view, setView] = useState("picker")

  // Desktop scaling — same formula used across all feelbetter pages
  const [pageScale, setPageScale] = useState(1)
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      setPageScale(w >= 1024 ? Math.min(1, w / 1920) : 1)
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const handleNavBack = () => {
    if (view === "picker")   return router.back()
    if (view === "scribble") return setView("picker")
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes canvasFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: none; }
        }
        .canvas-fade { animation: canvasFadeIn .32s ease both; }

        /* Mode picker cards */
        .canvas-mode-card {
          background: rgba(255,255,255,.62);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,.92);
          border-radius: 26px;
          padding: 26px 30px;
          display: flex; align-items: center; gap: 22px;
          cursor: pointer;
          transition: transform .24s ease, box-shadow .24s ease, background .18s;
          box-shadow: 0 4px 24px rgba(60,120,140,.07);
        }
        .canvas-mode-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 48px rgba(60,120,140,.14);
          background: rgba(255,255,255,.82);
        }
        .canvas-mode-card.disabled {
          opacity: .45; cursor: default; pointer-events: none;
        }
      `}</style>

      {/* Aqua background — Canvas never tints */}
      <div style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        background: "linear-gradient(165deg,#e6f5f7 0%,#d3edf2 48%,#e8f6f8 100%)",
        minHeight: "100vh",
        color: "#1a3a42",
      }}>
        {/* Desktop scale wrapper */}
        <div style={pageScale < 1 ? {
          transformOrigin: "top left",
          transform: `scale(${pageScale})`,
          width: `${(100 / pageScale).toFixed(3)}vw`,
        } : {}}>

          <CanvasNav onBack={handleNavBack} />

          {/* ════════════════════════════════════════════════════════════════
              VIEW 1 — MODE PICKER
          ════════════════════════════════════════════════════════════════ */}
          {view === "picker" && (
            <main className="canvas-fade" style={{ maxWidth: 700, margin: "0 auto", padding: "52px 28px 100px" }}>

              {/* Header */}
              <div style={{ marginBottom: 52 }}>
                <div style={{ marginBottom: 18 }}><BrushMark /></div>
                <h1 style={{
                  fontFamily: "var(--font-dm-serif), serif",
                  fontSize: "clamp(44px,5.5vw,68px)",
                  fontWeight: 400, color: "#0f2e35",
                  letterSpacing: -1.5, lineHeight: 1.02, marginBottom: 14,
                }}>canvas.</h1>
                <p style={{ fontSize: 17, color: "#5a7888", fontWeight: 300, lineHeight: 1.65 }}>
                  express, for when words fail.
                </p>
              </div>

              {/* Mode cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Free Scribble — clickable */}
                <div className="canvas-mode-card" onClick={() => setView("scribble")}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: "rgba(195,185,214,.18)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                      stroke="#9888b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 500, color: "#1a3a42", marginBottom: 6 }}>
                      free scribble
                    </div>
                    <div style={{ fontSize: 14, color: "#5a7888", fontWeight: 300, lineHeight: 1.55 }}>
                      a blank canvas. no judgment. just draw.
                    </div>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#9ab8c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>

                {/* Guided Doodle — disabled, coming soon */}
                <div className="canvas-mode-card disabled" style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", top: 14, right: 14,
                    background: "rgba(160,180,188,.22)",
                    color: "#7a9aaa", fontSize: 11, letterSpacing: 1.4,
                    textTransform: "uppercase", padding: "4px 10px",
                    borderRadius: 20, fontWeight: 500,
                  }}>
                    coming soon
                  </span>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: "rgba(160,178,188,.1)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                      stroke="#99acb2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 500, color: "#4a6a72", marginBottom: 6 }}>
                      guided doodle
                    </div>
                    <div style={{ fontSize: 14, color: "#7a9aaa", fontWeight: 300, lineHeight: 1.55 }}>
                      a soft prompt to draw to — and a reflection on what came out — coming soon.
                    </div>
                  </div>
                </div>
              </div>
            </main>
          )}

          {/* ════════════════════════════════════════════════════════════════
              VIEW 2 — FREE SCRIBBLE
              maxWidth: 920 gives the canvas more room than the picker.
          ════════════════════════════════════════════════════════════════ */}
          {view === "scribble" && (
            <main className="canvas-fade" style={{ maxWidth: 940, margin: "0 auto", padding: "36px 28px 100px" }}>

              {/* Page header row */}
              <div style={{
                display: "flex", alignItems: "baseline",
                justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8,
              }}>
                <div>
                  <p style={{
                    fontSize: 12, letterSpacing: 1.7, textTransform: "uppercase",
                    color: "#5a8098", marginBottom: 6, fontWeight: 600,
                  }}>
                    canvas · free scribble
                  </p>
                  <p style={{
                    fontFamily: "var(--font-dm-serif), serif",
                    fontSize: 26, fontWeight: 400, color: "#1a3a42", letterSpacing: -.5,
                  }}>
                    draw how you feel.
                  </p>
                </div>
                <p style={{
                  fontSize: 13, color: "rgba(80,110,120,.65)", fontStyle: "italic", alignSelf: "flex-end",
                }}>
                  this doesn&apos;t save. when you leave, it&apos;s gone.
                </p>
              </div>

              {/* Drawing canvas + toolbar */}
              <FreeScribble mood={mood} />
            </main>
          )}

        </div>
      </div>
    </>
  )
}

export default function CanvasPage() {
  return (
    <Suspense>
      <CanvasContent />
    </Suspense>
  )
}
