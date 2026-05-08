export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "#1a1a2e",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Georgia, serif",
      gap: "16px",
    }}>

      <p style={{ color: "#9b7fbd", fontSize: "1rem", letterSpacing: "0.2em" }}>
        a safe space for your feelings
      </p>

      <h1 style={{ color: "#e8d5f5", fontSize: "2.8rem", margin: "0" }}>
        Hey. You showed up. 🌸
      </h1>

      <p style={{ color: "#7a6a8a", fontSize: "1rem", marginTop: "8px" }}>
        How are you feeling right now?
      </p>

    </main>
  )
}