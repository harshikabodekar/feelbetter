"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { hasPin, setPin, verifyPin, removePin } from "@/lib/pin"

// ── Small reusable Toggle ─────────────────────────────────────────────────────
function Toggle({ on, onToggle, disabled }) {
  return (
    <button
      onClick={disabled ? undefined : onToggle}
      style={{
        width: 44, height: 26, borderRadius: 13,
        background: disabled ? "#e0e0e0" : on ? "#7ac4d0" : "#d0d0d0",
        border: "none", cursor: disabled ? "not-allowed" : "pointer",
        position: "relative", transition: "background .3s",
        flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 3,
        left: on ? 21 : 3,
        width: 20, height: 20, borderRadius: "50%",
        background: "#fff", transition: "left .3s",
        boxShadow: "0 1px 4px rgba(0,0,0,.18)",
      }} />
    </button>
  )
}

// ── A single settings row inside a section card ───────────────────────────────
function SettingRow({ label, desc, control, danger, noBorder }) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 16,
      padding: "18px 24px",
      borderBottom: noBorder ? "none" : ".5px solid rgba(60,120,140,.08)",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 500,
          color: danger ? "#c05a5a" : "#1a3a42",
          marginBottom: desc ? 3 : 0,
        }}>
          {label}
        </div>
        {desc && (
          <div style={{ fontSize: 13, fontWeight: 300, color: "#7a9aaa", lineHeight: 1.5 }}>
            {desc}
          </div>
        )}
      </div>
      {control && (
        <div style={{ flexShrink: 0 }}>{control}</div>
      )}
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{
        fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
        color: "#4a8a96", fontWeight: 600,
        marginBottom: 10, paddingLeft: 4,
        display: "flex", alignItems: "center", gap: 7,
      }}>
        {title}
      </div>
      <div style={{
        background: "rgba(255,255,255,.68)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        border: ".5px solid rgba(255,255,255,.92)",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(60,120,140,.07)",
      }}>
        {children}
      </div>
    </section>
  )
}

// ── Ghost action button ───────────────────────────────────────────────────────
function GhostButton({ label, danger, onClick, disabled }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "8px 18px", borderRadius: 20,
        fontSize: 13, fontWeight: 400,
        fontFamily: "var(--font-dm-sans), sans-serif",
        border: danger
          ? `1px solid ${hovered ? "#c05a5a" : "rgba(192,90,90,.35)"}`
          : ".5px solid rgba(60,120,140,.25)",
        background: disabled
          ? "rgba(200,200,200,.18)"
          : danger
            ? hovered ? "rgba(192,90,90,.08)" : "transparent"
            : hovered ? "rgba(255,255,255,.8)" : "rgba(255,255,255,.4)",
        color: disabled ? "#bbb" : danger ? "#c05a5a" : "#3a7a88",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all .2s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  )
}

// ── Segmented control ─────────────────────────────────────────────────────────
function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{
      display: "flex", gap: 4,
      background: "rgba(60,120,140,.08)",
      borderRadius: 16, padding: 3,
    }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: "6px 14px", borderRadius: 12,
            fontSize: 12, fontWeight: opt.value === value ? 500 : 400,
            border: "none", cursor: "pointer",
            background: opt.value === value ? "#fff" : "transparent",
            color: opt.value === value ? "#1a3a42" : "#6a9aaa",
            fontFamily: "var(--font-dm-sans), sans-serif",
            boxShadow: opt.value === value ? "0 1px 6px rgba(60,120,140,.12)" : "none",
            transition: "all .18s",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ── PinBoxes — 4 visual boxes backed by a hidden native input ─────────────────
// Renders 4 empty/filled boxes. Clicking anywhere on them focuses the hidden
// <input type="tel"> so the keyboard opens on mobile too.
function PinBoxes({ value, onChange, onComplete, autoFocus, disabled, hasError }) {
  const inputRef = useRef(null)

  // Focus the hidden input when this step mounts
  useEffect(() => {
    if (autoFocus && !disabled) {
      // Small delay so the modal animation doesn't fight focus
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [autoFocus, disabled])

  function handleChange(e) {
    // Strip non-digits, cap at 4 chars
    const v = e.target.value.replace(/\D/g, '').slice(0, 4)
    onChange(v)
    // Auto-submit when complete — but only fire onComplete once per full entry
    if (v.length === 4) onComplete(v)
  }

  return (
    <div
      style={{ display: "flex", gap: 12, cursor: disabled ? "default" : "text" }}
      onClick={() => !disabled && inputRef.current?.focus()}
    >
      {/* Hidden native input captures keyboard on both desktop + mobile */}
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        maxLength={4}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        autoComplete="off"
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 }}
        aria-label="4-digit PIN"
      />

      {/* 4 visual boxes */}
      {[0, 1, 2, 3].map(i => {
        const filled = i < value.length
        const active = i === value.length && !disabled
        return (
          <div key={i} style={{
            width: 54, height: 62, borderRadius: 16,
            background: hasError ? "rgba(192,90,90,.07)" : "rgba(255,255,255,.62)",
            border: hasError
              ? "1.5px solid rgba(192,90,90,.38)"
              : active
                ? "1.5px solid rgba(90,170,190,.72)"
                : filled
                  ? "1.5px solid rgba(90,170,190,.44)"
                  : ".5px solid rgba(60,120,140,.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "border .13s, box-shadow .13s",
            boxShadow: active && !hasError ? "0 0 0 3px rgba(90,170,190,.13)" : "none",
          }}>
            {filled && (
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: hasError ? "rgba(192,90,90,.55)" : "#5aaabb",
                transition: "background .13s",
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}


// ── Main settings page ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  // ── Local preference state ─────────────────────────────────────────────────
  const [anonymousMode, setAnonymousMode] = useState(false)
  const [ambientSound,  setAmbientSound]  = useState("silence")
  const [fontSize,      setFontSize]      = useState("medium")

  // ── PIN state ──────────────────────────────────────────────────────────────
  // hasPinSet: loaded from Supabase on mount; drives the toggle + row labels
  const [hasPinSet,  setHasPinSet]  = useState(false)

  // pinModal: which flow is open — 'set' | 'change' | 'remove' | 'reset' | null
  const [pinModal,   setPinModal]   = useState(null)

  // pinStep: current step within the active flow
  const [pinStep,    setPinStep]    = useState(null)

  // pinValue: digits typed so far in the current box (resets between steps)
  const [pinValue,   setPinValue]   = useState('')

  // pinFirst: stores the PIN entered on the first confirmation step
  const [pinFirst,   setPinFirst]   = useState('')

  // pinError: user-visible error string, or null
  const [pinError,   setPinError]   = useState(null)

  // pinLoading: true while an async Supabase call is in flight
  const [pinLoading, setPinLoading] = useState(false)

  // ── Auth redirect ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return
    if (!user) {
      const isGuest = localStorage.getItem("isGuest") === "true"
      router.replace(isGuest ? "/dashboard" : "/login")
    }
  }, [user, loading])

  // ── Load PIN status from Supabase on mount ────────────────────────────────
  useEffect(() => {
    if (!user) return
    hasPin(user.id).then(setHasPinSet).catch(() => {})
  }, [user])

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  // ── Open a PIN modal flow ─────────────────────────────────────────────────
  // flow: 'set' | 'change' | 'remove' | 'reset'
  function openPinModal(flow) {
    const firstStep = {
      set:    'set-enter',
      change: 'change-verify',
      remove: 'remove-verify',
      reset:  'reset-enter',
    }
    setPinModal(flow)
    setPinStep(firstStep[flow])
    setPinValue('')
    setPinFirst('')
    setPinError(null)
    setPinLoading(false)
  }

  // ── Close the modal and wipe all transient state ──────────────────────────
  function closePinModal() {
    setPinModal(null)
    setPinStep(null)
    setPinValue('')
    setPinFirst('')
    setPinError(null)
    setPinLoading(false)
  }

  // ── Handle the 4th digit being entered in any step ───────────────────────
  async function handlePinComplete(value) {
    if (pinLoading) return

    // ─── SET flow ─────────────────────────────────────────────────────────
    if (pinStep === 'set-enter') {
      setPinFirst(value)
      setPinValue('')
      setPinStep('set-confirm')
      setPinError(null)
      return
    }

    if (pinStep === 'set-confirm') {
      if (value !== pinFirst) {
        setPinError("those didn't match — let's try again")
        setPinValue('')
        setPinFirst('')
        setPinStep('set-enter')
        return
      }
      setPinLoading(true)
      try {
        await setPin(user.id, value)
        setHasPinSet(true)
        setPinStep('success')
        setTimeout(closePinModal, 1800)
      } catch (e) {
        setPinError(e.message)
        setPinValue('')
      } finally {
        setPinLoading(false)
      }
      return
    }

    // ─── CHANGE flow ──────────────────────────────────────────────────────
    if (pinStep === 'change-verify') {
      setPinLoading(true)
      try {
        const ok = await verifyPin(user.id, value)
        if (!ok) {
          setPinError("that PIN doesn't match — try again")
          setPinValue('')
          return
        }
        setPinError(null)
        setPinValue('')
        setPinStep('change-enter')
      } catch {
        setPinError("something went wrong — please try again")
        setPinValue('')
      } finally {
        setPinLoading(false)
      }
      return
    }

    if (pinStep === 'change-enter') {
      setPinFirst(value)
      setPinValue('')
      setPinStep('change-confirm')
      setPinError(null)
      return
    }

    if (pinStep === 'change-confirm') {
      if (value !== pinFirst) {
        setPinError("those didn't match — let's try again")
        setPinValue('')
        setPinFirst('')
        setPinStep('change-enter')
        return
      }
      setPinLoading(true)
      try {
        await setPin(user.id, value)
        setPinStep('success')
        setTimeout(closePinModal, 1800)
      } catch (e) {
        setPinError(e.message)
        setPinValue('')
      } finally {
        setPinLoading(false)
      }
      return
    }

    // ─── REMOVE flow ──────────────────────────────────────────────────────
    if (pinStep === 'remove-verify') {
      setPinLoading(true)
      try {
        const ok = await verifyPin(user.id, value)
        if (!ok) {
          setPinError("that PIN doesn't match — try again")
          setPinValue('')
          return
        }
        await removePin(user.id)
        setHasPinSet(false)
        setPinStep('success')
        setTimeout(closePinModal, 1800)
      } catch {
        setPinError("something went wrong — please try again")
        setPinValue('')
      } finally {
        setPinLoading(false)
      }
      return
    }

    // ─── RESET flow (forgot PIN — user is already authenticated) ──────────
    if (pinStep === 'reset-enter') {
      setPinFirst(value)
      setPinValue('')
      setPinStep('reset-confirm')
      setPinError(null)
      return
    }

    if (pinStep === 'reset-confirm') {
      if (value !== pinFirst) {
        setPinError("those didn't match — let's try again")
        setPinValue('')
        setPinFirst('')
        setPinStep('reset-enter')
        return
      }
      setPinLoading(true)
      try {
        await setPin(user.id, value)
        setHasPinSet(true)
        setPinStep('success')
        setTimeout(closePinModal, 1800)
      } catch (e) {
        setPinError(e.message)
        setPinValue('')
      } finally {
        setPinLoading(false)
      }
      return
    }
  }

  // ── Modal title/subtitle per step ─────────────────────────────────────────
  const PIN_STEP_COPY = {
    'set-enter':      { title: "create your PIN.",    subtitle: "choose 4 digits you'll remember."          },
    'set-confirm':    { title: "confirm your PIN.",   subtitle: "enter it once more to make sure."          },
    'change-verify':  { title: "enter current PIN.",  subtitle: "verify it's you before changing."          },
    'change-enter':   { title: "enter new PIN.",      subtitle: "choose 4 new digits."                      },
    'change-confirm': { title: "confirm new PIN.",    subtitle: "enter your new PIN once more."             },
    'remove-verify':  { title: "enter your PIN.",     subtitle: "confirm to turn off PIN lock."             },
    'reset-enter':    { title: "create a new PIN.",   subtitle: "you're signed in — no old PIN needed."    },
    'reset-confirm':  { title: "confirm new PIN.",    subtitle: "enter your new PIN once more."             },
    'success':        { title: "", subtitle: "" },  // handled separately
  }

  const stepCopy = PIN_STEP_COPY[pinStep] || {}

  // show "forgot PIN?" link on verify steps so users with a forgotten PIN can reset
  const showForgotLink = pinStep === 'change-verify' || pinStep === 'remove-verify'

  // ── Derived user info ──────────────────────────────────────────────────────
  const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there"
  const initials = fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  const email    = user?.email || ""

  if (loading || !user) return null

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .st-root {
          font-family: var(--font-dm-sans), sans-serif;
          background: linear-gradient(165deg, #e6f5f7 0%, #d3edf2 48%, #e8f6f8 100%);
          min-height: 100vh;
          color: #1a3a42;
        }

        .st-content {
          max-width: 660px;
          margin: 0 auto;
          padding: 100px 20px 80px;
        }
        @media (min-width: 640px) {
          .st-content { padding: 100px 32px 80px; }
        }

        .st-header { margin-bottom: 40px; }
        .st-title {
          font-family: var(--font-dm-serif), serif;
          font-size: clamp(40px, 7vw, 60px);
          font-weight: 400; color: #0f2e35;
          letter-spacing: -1px; line-height: 1;
          margin-bottom: 6px;
        }
        .st-subtitle {
          font-size: 16px; font-weight: 300;
          color: #5a8a96; line-height: 1.5;
        }

        .st-avatar {
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, #7ac4d0, #5aaabb);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 20px; font-weight: 600;
          flex-shrink: 0;
        }

        .st-sound-chip {
          padding: 6px 14px; border-radius: 18px;
          font-size: 13px; cursor: pointer;
          border: .5px solid transparent;
          transition: all .18s;
          font-family: var(--font-dm-sans), sans-serif;
        }
        .st-sound-chip.active {
          background: #5eb4c2; color: #fff;
          border-color: #5eb4c2;
        }
        .st-sound-chip:not(.active) {
          background: rgba(255,255,255,.5);
          color: #4a6a72;
          border-color: rgba(60,120,140,.15);
        }
        .st-sound-chip:not(.active):hover {
          background: rgba(255,255,255,.8);
        }

        .st-version {
          text-align: center; padding: 12px 0 8px;
          font-size: 12px; color: #9aacb0;
          font-style: italic; letter-spacing: .3px;
        }

        /* PIN modal */
        .pin-modal-overlay {
          position: fixed; inset: 0; z-index: 500;
          background: rgba(10,40,50,.32);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .pin-modal-card {
          background: rgba(255,255,255,.86);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: .5px solid rgba(255,255,255,.95);
          border-radius: 28px;
          padding: 40px 32px 36px;
          width: 100%; max-width: 340px;
          box-shadow: 0 24px 64px rgba(10,40,50,.22);
          display: flex; flex-direction: column;
          align-items: center; gap: 0;
          position: relative;
        }
        .pin-action-btn {
          width: 100%; padding: 14px;
          border-radius: 18px; border: none;
          font-size: 15px; font-weight: 500;
          font-family: var(--font-dm-sans), sans-serif;
          background: linear-gradient(135deg, #7ac4d0, #5aaabb);
          color: #fff; cursor: pointer;
          transition: opacity .2s;
          margin-top: 28px;
        }
        .pin-action-btn:hover { opacity: .88; }
        .pin-action-btn:disabled { opacity: .45; cursor: not-allowed; }
      `}</style>

      <div className="st-root">

        {/* ── Fixed back button ────────────────────────────────────────────── */}
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            position: "fixed", top: 20, left: 20, zIndex: 200,
            width: 44, height: 44, borderRadius: "50%",
            background: "rgba(255,255,255,.72)",
            backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
            border: ".5px solid rgba(255,255,255,.88)",
            boxShadow: "0 2px 14px rgba(60,120,140,.14)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "background .2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.95)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.72)"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#2a5a66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>

        <div className="st-content">

          {/* ── Page header ── */}
          <div className="st-header">
            <h1 className="st-title">settings.</h1>
            <p className="st-subtitle">your space, your way.</p>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              1. PROFILE
              ══════════════════════════════════════════════════════════════════ */}
          <Section title="profile">
            <div style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "22px 24px",
              borderBottom: ".5px solid rgba(60,120,140,.08)",
            }}>
              <div className="st-avatar">{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 500, color: "#0f2e35", marginBottom: 2 }}>
                  {fullName}
                </div>
                <div style={{
                  fontSize: 13, color: "#7a9aaa", fontWeight: 300,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {email}
                </div>
              </div>
            </div>
            <SettingRow
              label="edit profile"
              desc="change your name or avatar"
              noBorder
              control={
                <GhostButton
                  label="edit"
                  onClick={() => alert("edit profile coming soon")}
                />
              }
            />
          </Section>

          {/* ══════════════════════════════════════════════════════════════════
              2. PRIVACY — PIN management
              ══════════════════════════════════════════════════════════════════ */}
          <Section title="privacy">

            {/* Toggle: clicking it opens the right modal */}
            <SettingRow
              label="lock entries with a PIN"
              desc={hasPinSet
                ? "a 4-digit PIN protects your saved entries"
                : "add a 4-digit PIN to protect your entries"}
              control={
                <Toggle
                  on={hasPinSet}
                  onToggle={() => openPinModal(hasPinSet ? 'remove' : 'set')}
                />
              }
            />

            {/* Change PIN — only shown when a PIN is already set */}
            {hasPinSet && (
              <SettingRow
                label="change PIN"
                desc="update your 4-digit PIN"
                control={
                  <GhostButton
                    label="change"
                    onClick={() => openPinModal('change')}
                  />
                }
              />
            )}

            {/* Set up PIN — only shown when no PIN is set yet */}
            {!hasPinSet && (
              <SettingRow
                label="set up PIN"
                desc="choose 4 digits to lock your entries"
                noBorder
                control={
                  <GhostButton
                    label="set PIN"
                    onClick={() => openPinModal('set')}
                  />
                }
              />
            )}

            {/* Forgot PIN link — shown as a quiet row when PIN is set */}
            {hasPinSet && (
              <div style={{ padding: "14px 24px" }}>
                <button
                  onClick={() => openPinModal('reset')}
                  style={{
                    background: "none", border: "none", padding: 0,
                    fontSize: 13, color: "#7a9aaa", fontWeight: 300,
                    cursor: "pointer", textDecoration: "underline",
                    textDecorationColor: "rgba(122,154,170,.4)",
                    fontFamily: "var(--font-dm-sans), sans-serif",
                  }}
                >
                  forgot PIN? reset it
                </button>
              </div>
            )}
          </Section>

          {/* ══════════════════════════════════════════════════════════════════
              3. PREFERENCES
              ══════════════════════════════════════════════════════════════════ */}
          <Section title="preferences">
            <SettingRow
              label="anonymous mode"
              desc="hide your name and hide mood saves"
              control={
                <Toggle
                  on={anonymousMode}
                  onToggle={() => setAnonymousMode(a => !a)}
                />
              }
            />

            <div style={{ padding: "18px 24px", borderBottom: ".5px solid rgba(60,120,140,.08)" }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#1a3a42", marginBottom: 3 }}>
                ambient sound
              </div>
              <div style={{ fontSize: 13, fontWeight: 300, color: "#7a9aaa", marginBottom: 12 }}>
                background sound while you use feelbetter
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["ocean waves", "rain", "forest", "silence"].map(sound => (
                  <button
                    key={sound}
                    onClick={() => setAmbientSound(sound)}
                    className={`st-sound-chip ${ambientSound === sound ? "active" : ""}`}
                  >
                    {sound}
                  </button>
                ))}
              </div>
            </div>

            <SettingRow
              label="text size"
              desc="adjust how large text appears"
              noBorder
              control={
                <SegmentedControl
                  options={[
                    { label: "S", value: "small" },
                    { label: "M", value: "medium" },
                    { label: "L", value: "large" },
                  ]}
                  value={fontSize}
                  onChange={setFontSize}
                />
              }
            />
          </Section>

          {/* ══════════════════════════════════════════════════════════════════
              4. DATA
              ══════════════════════════════════════════════════════════════════ */}
          <Section title="data">
            <SettingRow
              label="export my data"
              desc="download all your entries as a file"
              control={
                <GhostButton
                  label="export"
                  onClick={() => alert("export coming soon")}
                />
              }
            />
            <SettingRow
              label="delete all my entries"
              desc="permanently remove every saved entry"
              danger
              noBorder
              control={
                <GhostButton
                  label="delete"
                  danger
                  onClick={() => alert("delete all coming soon — will ask for confirmation first")}
                />
              }
            />
          </Section>

          {/* ══════════════════════════════════════════════════════════════════
              5. ACCOUNT
              ══════════════════════════════════════════════════════════════════ */}
          <Section title="account">
            <SettingRow
              label="sign out"
              desc="log out of your feelbetter account"
              noBorder
              control={
                <GhostButton
                  label="sign out"
                  danger
                  onClick={handleLogout}
                />
              }
            />
          </Section>

          <p className="st-version">feelbetter · made with care</p>
        </div>


        {/* ════════════════════════════════════════════════════════════════════
            PIN MODAL — rendered outside .st-content so it's full-screen fixed
            ════════════════════════════════════════════════════════════════════ */}
        {pinModal && (
          <div className="pin-modal-overlay" onClick={e => {
            // Close on overlay click (not on the card itself)
            if (e.target === e.currentTarget) closePinModal()
          }}>
            <div className="pin-modal-card">

              {/* ── Close button ── */}
              <button
                onClick={closePinModal}
                style={{
                  position: "absolute", top: 16, right: 16,
                  width: 32, height: 32, borderRadius: "50%",
                  background: "rgba(60,120,140,.08)", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#4a8a96",
                  fontSize: 18, lineHeight: 1,
                }}
              >
                ✕
              </button>

              {/* ── Success state ── */}
              {pinStep === 'success' ? (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  {/* Checkmark */}
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "linear-gradient(135deg, #7ac4d0, #5aaabb)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 20px",
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div style={{
                    fontFamily: "var(--font-dm-serif), serif",
                    fontSize: 24, color: "#0f2e35", marginBottom: 8,
                  }}>
                    {pinModal === 'remove' ? "PIN removed." : "PIN saved."}
                  </div>
                  <div style={{ fontSize: 14, color: "#7a9aaa", fontWeight: 300 }}>
                    {pinModal === 'remove'
                      ? "your entries are no longer locked."
                      : "your entries are now protected."}
                  </div>
                </div>
              ) : (
                /* ── Normal step state ── */
                <>
                  {/* Title */}
                  <div style={{
                    fontFamily: "var(--font-dm-serif), serif",
                    fontSize: 22, color: "#0f2e35",
                    marginBottom: 8, textAlign: "center",
                  }}>
                    {stepCopy.title}
                  </div>

                  {/* Subtitle */}
                  <div style={{
                    fontSize: 14, color: "#7a9aaa", fontWeight: 300,
                    textAlign: "center", lineHeight: 1.5,
                    marginBottom: 28,
                  }}>
                    {stepCopy.subtitle}
                  </div>

                  {/* PIN boxes */}
                  <PinBoxes
                    value={pinValue}
                    onChange={setPinValue}
                    onComplete={handlePinComplete}
                    autoFocus={true}
                    disabled={pinLoading}
                    hasError={!!pinError}
                  />

                  {/* Error message */}
                  {pinError && (
                    <div style={{
                      marginTop: 16, fontSize: 13,
                      color: "#c05a5a", textAlign: "center",
                      fontWeight: 400, lineHeight: 1.4,
                    }}>
                      {pinError}
                    </div>
                  )}

                  {/* Loading state message */}
                  {pinLoading && (
                    <div style={{
                      marginTop: 16, fontSize: 13,
                      color: "#7a9aaa", textAlign: "center", fontStyle: "italic",
                    }}>
                      saving…
                    </div>
                  )}

                  {/* "Forgot PIN?" link — only on verify steps */}
                  {showForgotLink && !pinLoading && (
                    <button
                      onClick={() => openPinModal('reset')}
                      style={{
                        marginTop: 20, background: "none", border: "none",
                        fontSize: 13, color: "#7a9aaa",
                        cursor: "pointer", fontWeight: 300,
                        textDecoration: "underline",
                        textDecorationColor: "rgba(122,154,170,.4)",
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        padding: 0,
                      }}
                    >
                      forgot your PIN?
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  )
}
