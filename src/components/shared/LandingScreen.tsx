"use client";
import { useState, useEffect } from "react";
import { useLuneaStore } from "@/store/lunea";

export function LandingScreen() {
  const { setView } = useLuneaStore();
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#fff",
      fontFamily: "-apple-system, 'SF Pro Display', 'SF Pro Text', BlinkMacSystemFont, sans-serif",
      color: "#1d1d1f",
      overflowX: "hidden",
    }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 44px", height: 52,
      }}>
        <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", color: "#1d1d1f" }}>LUNEA</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setView("student-join")} style={{
            padding: "7px 16px", borderRadius: 980,
            border: "1px solid rgba(0,0,0,0.15)",
            background: "transparent", fontSize: 13,
            fontWeight: 400, color: "#1d1d1f", cursor: "pointer",
            fontFamily: "inherit",
          }}>Mit Code beitreten</button>
          <button onClick={() => setView("teacher-setup")} style={{
            padding: "7px 16px", borderRadius: 980,
            border: "none", background: "#0071e3",
            fontSize: 13, fontWeight: 400,
            color: "#fff", cursor: "pointer",
            fontFamily: "inherit",
          }}>Für Lehrkräfte</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        textAlign: "center",
        padding: "100px 44px 80px",
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateY(20px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
      }}>
        <div style={{
          fontSize: 13, fontWeight: 500, color: "#0071e3",
          letterSpacing: "0.02em", marginBottom: 16,
        }}>
          Pädagogische KI-Lernumgebung
        </div>
        <h1 style={{
          fontSize: "clamp(48px, 7vw, 80px)",
          fontWeight: 700,
          letterSpacing: "-0.045em",
          lineHeight: 1.05,
          color: "#1d1d1f",
          margin: "0 auto 24px",
          maxWidth: 800,
        }}>
          KI im Unterricht.<br />Unter Kontrolle.
        </h1>
        <p style={{
          fontSize: 21, fontWeight: 300,
          color: "#6e6e73",
          lineHeight: 1.6,
          maxWidth: 560,
          margin: "0 auto 40px",
          letterSpacing: "-0.01em",
        }}>
          LUNEA strukturiert KI-gestütztes Lernen in vier Phasen.
          Die Lehrkraft steuert. Schüler:innen denken zuerst.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setView("teacher-setup")} style={{
            padding: "16px 32px", borderRadius: 980,
            background: "#0071e3", color: "#fff",
            border: "none", fontSize: 17, fontWeight: 400,
            cursor: "pointer", fontFamily: "inherit",
            letterSpacing: "-0.01em",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#0077ed")}
          onMouseLeave={e => (e.currentTarget.style.background = "#0071e3")}
          >
            Als Lehrkraft starten
          </button>
          <button onClick={() => setView("student-join")} style={{
            padding: "16px 32px", borderRadius: 980,
            background: "transparent", color: "#0071e3",
            border: "1px solid #0071e3", fontSize: 17, fontWeight: 400,
            cursor: "pointer", fontFamily: "inherit",
            letterSpacing: "-0.01em",
          }}>
            Mit Code beitreten
          </button>
        </div>
      </section>

      {/* Feature tiles — Apple Store style */}
      <section style={{ padding: "0 22px 80px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
          maxWidth: 980,
          margin: "0 auto",
        }}>

          {/* Tile 1 — groß, blau */}
          <div style={{
            gridColumn: "1 / 3",
            background: "#f5f5f7",
            borderRadius: 24,
            padding: "56px 48px",
            display: "flex", flexDirection: "column", alignItems: "center",
            textAlign: "center",
            opacity: vis ? 1 : 0,
            transform: vis ? "none" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
          }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#0071e3", marginBottom: 12 }}>
              Das 10–10–10–10-Modell
            </div>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 700, letterSpacing: "-0.03em",
              lineHeight: 1.1, color: "#1d1d1f",
              margin: "0 auto 16px", maxWidth: 560,
            }}>
              Vier Phasen. Eine Stunde. Echtes Lernen.
            </h2>
            <p style={{ fontSize: 17, color: "#6e6e73", maxWidth: 480, lineHeight: 1.65, margin: 0 }}>
              Eigenphase, KI-Phase, Fokusphase, Reflexion — strukturiert, kontrolliert, nachvollziehbar.
            </p>
            <div style={{
              display: "flex", gap: 8, marginTop: 36, flexWrap: "wrap", justifyContent: "center",
            }}>
              {[
                { n: "01", label: "Eigenphase", color: "#1d1d1f" },
                { n: "02", label: "KI-Phase", color: "#0071e3" },
                { n: "03", label: "Fokusphase", color: "#1d1d1f" },
                { n: "04", label: "Reflexion", color: "#bf4800" },
              ].map(p => (
                <div key={p.n} style={{
                  padding: "10px 20px",
                  background: "#fff",
                  borderRadius: 12,
                  display: "flex", alignItems: "center", gap: 10,
                  border: "1px solid rgba(0,0,0,0.08)",
                }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#6e6e73" }}>{p.n}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: p.color }}>{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tile 2 */}
          <div style={{
            background: "#1d1d1f",
            borderRadius: 24,
            padding: "48px 40px",
            opacity: vis ? 1 : 0,
            transform: vis ? "none" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
          }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#6e6e73", marginBottom: 12 }}>
              Für Lehrkräfte
            </div>
            <h3 style={{
              fontSize: 32, fontWeight: 700,
              letterSpacing: "-0.03em", lineHeight: 1.1,
              color: "#f5f5f7", margin: "0 0 16px",
            }}>
              Du steuerst.<br />Die KI hilft.
            </h3>
            <p style={{ fontSize: 15, color: "#a1a1a6", lineHeight: 1.65, margin: "0 0 32px" }}>
              Session-Code, Phasen-Timer, Prompt-Limit, KI-Modus — alles in deiner Hand.
            </p>
            <button onClick={() => setView("teacher-setup")} style={{
              padding: "12px 24px", borderRadius: 980,
              background: "#fff", color: "#1d1d1f",
              border: "none", fontSize: 15, fontWeight: 400,
              cursor: "pointer", fontFamily: "inherit",
            }}>Dashboard öffnen</button>
          </div>

          {/* Tile 3 */}
          <div style={{
            background: "#0071e3",
            borderRadius: 24,
            padding: "48px 40px",
            opacity: vis ? 1 : 0,
            transform: vis ? "none" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s",
          }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>
              Für Schüler:innen
            </div>
            <h3 style={{
              fontSize: 32, fontWeight: 700,
              letterSpacing: "-0.03em", lineHeight: 1.1,
              color: "#fff", margin: "0 0 16px",
            }}>
              Code eingeben.<br />Sofort starten.
            </h3>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.65, margin: "0 0 32px" }}>
              6-stelliger Session-Code. Name eingeben. Fertig.
            </p>
            <button onClick={() => setView("student-join")} style={{
              padding: "12px 24px", borderRadius: 980,
              background: "#fff", color: "#0071e3",
              border: "none", fontSize: 15, fontWeight: 400,
              cursor: "pointer", fontFamily: "inherit",
            }}>Mit Code beitreten</button>
          </div>

          {/* Stats row */}
          {[
            { n: "17", label: "Schulfächer", sub: "Von Deutsch bis Informatik" },
            { n: "5–13", label: "Jahrgänge", sub: "Curricular angepasst" },
            { n: "3", label: "KI-Modi", sub: "Standard · Sokratisch · Kritisch" },
            { n: "5 ★", label: "Feedback", sub: "Strukturiert in 5 Dimensionen" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "#f5f5f7",
              borderRadius: 24,
              padding: "40px 32px",
              gridColumn: "auto",
              opacity: vis ? 1 : 0,
              transform: vis ? "none" : "translateY(16px)",
              transition: `opacity 0.6s ease ${0.35 + i * 0.07}s, transform 0.6s ease ${0.35 + i * 0.07}s`,
            }}>
              <div style={{
                fontSize: "clamp(32px, 4vw, 44px)",
                fontWeight: 700, letterSpacing: "-0.04em",
                color: "#1d1d1f", marginBottom: 6,
              }}>{s.n}</div>
              <div style={{ fontSize: 17, fontWeight: 600, color: "#1d1d1f", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 13, color: "#6e6e73" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(0,0,0,0.08)",
        padding: "20px 44px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 12, color: "#6e6e73" }}>LUNEA · Pädagogische KI-Lernumgebung · V1</span>
        <span style={{ fontSize: 12, color: "#6e6e73" }}>Niedersachsen · Klasse 5–13</span>
      </footer>
    </div>
  );
}
