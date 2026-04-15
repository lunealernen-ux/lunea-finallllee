"use client";
import { useState, useEffect } from "react";
import { useLuneaStore } from "@/store/lunea";

export function StudentJoin() {
  const { joinSession, setView } = useLuneaStore();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-fill code from URL param
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get("code");
      if (urlCode) setCode(urlCode.toUpperCase());

      // Also check global set by page.tsx
      const globalCode = (window as unknown as Record<string, string>).__LUNEA_CODE__;
      if (globalCode) setCode(globalCode.toUpperCase());
    }
  }, []);

  const handleJoin = async () => {
    if (!code.trim() || !name.trim()) return;
    setLoading(true); setError("");
    const result = await joinSession(code.trim().toUpperCase(), name.trim());
    if (!result.success) setError("Session nicht gefunden. Prüfe den Code oder warte bis die Lehrkraft die Session gestartet hat.");
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "-apple-system,'SF Pro Text',sans-serif", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <button onClick={() => setView("landing")} style={{
          background: "none", border: "none", color: "#0071e3",
          fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginBottom: 32, padding: 0,
        }}>← Zurück</button>

        <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em", color: "#1d1d1f", marginBottom: 8 }}>
          Session beitreten
        </h1>
        <p style={{ fontSize: 16, color: "#6e6e73", marginBottom: 40, lineHeight: 1.6 }}>
          Gib den Code deiner Lehrkraft und deinen Namen ein.
        </p>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 8 }}>
            Session-Code
          </label>
          <input
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={e => e.key === "Enter" && name.trim() && handleJoin()}
            placeholder="z.B. AB3XY7"
            maxLength={6}
            style={{ textAlign: "center", fontSize: 28, fontWeight: 700, letterSpacing: "0.18em", borderRadius: 14, padding: "14px" }}
          />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 8 }}>
            Dein Name
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && code.trim().length >= 4 && handleJoin()}
            placeholder="Vorname"
            style={{ borderRadius: 14, fontSize: 16 }}
            autoFocus={!code}
          />
        </div>

        {error && (
          <div style={{ marginBottom: 20, padding: "12px 14px", borderRadius: 12, background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)", fontSize: 14, color: "#DC2626", lineHeight: 1.6 }}>
            {error}
          </div>
        )}

        <button onClick={handleJoin} disabled={!code.trim() || !name.trim() || loading} style={{
          width: "100%", padding: "16px", borderRadius: 14, border: "none",
          background: code.trim() && name.trim() ? "#0071e3" : "#d2d2d7",
          color: "#fff", fontSize: 17, fontWeight: 600,
          cursor: code.trim() && name.trim() ? "pointer" : "not-allowed",
          fontFamily: "inherit",
          boxShadow: code.trim() && name.trim() ? "0 4px 16px rgba(0,113,227,0.3)" : "none",
        }}>
          {loading ? "Verbinden…" : "Beitreten →"}
        </button>
      </div>
    </div>
  );
}
