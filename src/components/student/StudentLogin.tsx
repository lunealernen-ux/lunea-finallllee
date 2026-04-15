"use client";
import { useState } from "react";
import { Glass } from "@/components/ui";

export function StudentLogin({
  subjectColor, subject, grade, topic,
  onJoin,
}: {
  subjectColor: string;
  subject: string;
  grade: number;
  topic: string;
  onJoin: (name: string) => void;
}) {
  const [name, setName] = useState("");

  const handleJoin = () => {
    if (name.trim()) onJoin(name.trim());
  };

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Glass style={{ width: 320, textAlign: "center", padding: 32, borderColor: `${subjectColor}33` }}>
        <div style={{ fontSize: 28, color: subjectColor, marginBottom: 10, fontFamily: "var(--font-display)" }}>◈</div>
        <div style={{ fontSize: 20, fontWeight: 300, color: "var(--text)", marginBottom: 4, fontFamily: "var(--font-display)" }}>LUNEA</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{subject} · Jahrgang {grade}</div>
        <div style={{ fontSize: 12, color: subjectColor, marginBottom: 24, padding: "4px 10px", background: `${subjectColor}12`, borderRadius: 6, display: "inline-block" }}>{topic}</div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleJoin()}
          placeholder="Dein Name"
          autoFocus
          style={{ textAlign: "center", marginBottom: 12, fontSize: 14 }}
        />
        <button
          onClick={handleJoin}
          disabled={!name.trim()}
          style={{
            width: "100%", padding: "11px", borderRadius: 10, border: "none",
            background: name.trim() ? `linear-gradient(135deg, ${subjectColor}, ${subjectColor}99)` : "rgba(255,255,255,0.07)",
            color: name.trim() ? "#fff" : "var(--text-muted)",
            fontSize: 14, fontWeight: 600, fontFamily: "var(--font-display)",
          }}
        >
          Einloggen
        </button>
      </Glass>
    </div>
  );
}
