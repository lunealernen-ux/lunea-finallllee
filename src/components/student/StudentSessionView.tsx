"use client";
import { useEffect } from "react";
import { useLuneaStore } from "@/store/lunea";
import { StudentView } from "./StudentView";

const PHASE_COLORS: Record<string, string> = {
  eigen: "#1d8348", ki: "#0071e3", fokus: "#1d1d1f", reflexion: "#6e3cbf",
};
const PHASE_LABELS: Record<string, string> = {
  eigen: "Eigenphase", ki: "KI-Phase", fokus: "Fokusphase", reflexion: "Reflexion",
};

export function StudentSessionView() {
  const { session, activeStudentId, syncSession } = useLuneaStore();

  // Poll server every 3 seconds to get phase updates from teacher
  useEffect(() => {
    const interval = setInterval(() => {
      syncSession();
    }, 3000);
    return () => clearInterval(interval);
  }, [syncSession]);

  if (!session || !activeStudentId) return null;

  const phase = session.currentPhase;
  const phaseColor = PHASE_COLORS[phase] ?? "#1d1d1f";
  const cfg = session.config;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7", fontFamily: "-apple-system,'SF Pro Text',sans-serif" }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 100, height: 50,
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "saturate(180%) blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        display: "flex", alignItems: "center", padding: "0 20px", gap: 10,
      }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: phaseColor }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: phaseColor }}>{PHASE_LABELS[phase]}</span>
        <span style={{ color: "#d2d2d7" }}>·</span>
        <span style={{ fontSize: 13, color: "#6e6e73", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {cfg.subject} · {cfg.topic}
        </span>
        <span style={{
          fontSize: 12, fontWeight: 700, color: "#6e6e73",
          padding: "3px 9px", borderRadius: 6,
          background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.08)",
          letterSpacing: "0.08em",
        }}>{cfg.sessionCode}</span>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 20px 80px" }}>
        <StudentView studentId={activeStudentId} />
      </div>
    </div>
  );
}
