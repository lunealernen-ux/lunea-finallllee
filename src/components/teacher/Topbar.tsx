"use client";
import { useState } from "react";
import { useLuneaStore } from "@/store/lunea";
import { Phase } from "@/types";
import { PHASE_META, Lbl, PillBadge, Stars } from "@/components/ui";
import { Timer } from "@/components/shared/Timer";

const PHASE_COLORS: Record<Phase, string> = {
  eigen: "#1d8348", ki: "#0071e3", fokus: "#1d1d1f", reflexion: "#6e3cbf",
};

export function Topbar({ onAnalyze, onGroupCompare }: { onAnalyze: () => void; onGroupCompare: () => void }) {
  const { session, setPhase, endSession } = useLuneaStore();
  const [panel, setPanel] = useState<"students" | "analysis" | null>(null);

  if (!session) return null;
  const { config, currentPhase, studentSessions, analysis } = session;
  const students = Object.values(studentSessions);
  const allPrompts = students.flatMap(ss => ss.prompts);
  const sc = config.subjectColor;
  const toggle = (p: "students" | "analysis") => setPanel(prev => prev === p ? null : p);
  const phases: Phase[] = ["eigen", "ki", "fokus", "reflexion"];

  return (
    <>
      <div className="topbar">
        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: sc, boxShadow: `0 0 0 2px ${sc}30` }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f", letterSpacing: "-0.02em" }}>
            {config.subject}
          </span>
          <span style={{ color: "#d2d2d7", fontSize: 12 }}>·</span>
          <span style={{ fontSize: 13, color: "#6e6e73", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {config.topic}
          </span>
          <span style={{ color: "#d2d2d7", fontSize: 12 }}>·</span>
          <span style={{ fontSize: 12, color: "#6e6e73" }}>Jg. {config.grade}</span>
        </div>

        {/* Mitte: Phasen */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: 4 }}>
          {phases.map(p => {
            const active = currentPhase === p;
            const color = PHASE_COLORS[p];
            return (
              <button key={p} onClick={() => setPhase(p)} style={{
                padding: "5px 14px", borderRadius: 980, cursor: "pointer",
                border: `1px solid ${active ? color : "rgba(0,0,0,0.1)"}`,
                background: active ? `${color}12` : "transparent",
                color: active ? color : "#6e6e73",
                fontSize: 12, fontWeight: active ? 600 : 400,
                fontFamily: "inherit", transition: "all 0.18s",
              }}>
                {PHASE_META[p].label}
              </button>
            );
          })}
        </div>

        {/* Rechts */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}>
          <Timer />

          {/* Session Code */}
          <div style={{
            padding: "4px 12px", borderRadius: 8,
            background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.08)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 10, color: "#a1a1a6", fontWeight: 500 }}>CODE</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1d1d1f", letterSpacing: "0.1em" }}>
              {config.sessionCode}
            </span>
          </div>

          <button onClick={() => toggle("students")} style={{
            padding: "5px 12px", borderRadius: 980, cursor: "pointer",
            border: `1px solid ${panel === "students" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.1)"}`,
            background: panel === "students" ? "#f5f5f7" : "transparent",
            color: "#6e6e73", fontSize: 13, fontFamily: "inherit",
          }}>
            {students.length} Schüler:innen
          </button>

          <button onClick={() => { onAnalyze(); toggle("analysis"); }} style={{
            padding: "5px 12px", borderRadius: 980, cursor: "pointer",
            border: `1px solid ${panel === "analysis" ? "rgba(0,113,227,0.4)" : "rgba(0,113,227,0.2)"}`,
            background: panel === "analysis" ? "rgba(0,113,227,0.08)" : "transparent",
            color: "#0071e3", fontSize: 13, fontFamily: "inherit",
          }}>Analyse</button>

          {currentPhase === "reflexion" && (
            <button onClick={onGroupCompare} style={{
              padding: "5px 12px", borderRadius: 980, cursor: "pointer",
              border: "1px solid rgba(110,60,191,0.25)",
              background: "rgba(110,60,191,0.06)",
              color: "#6e3cbf", fontSize: 13, fontFamily: "inherit",
            }}>Vergleich</button>
          )}

          <button onClick={endSession} style={{
            width: 28, height: 28, borderRadius: "50%", cursor: "pointer",
            border: "1px solid rgba(220,38,38,0.2)",
            background: "rgba(220,38,38,0.06)", color: "#DC2626",
            fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "inherit",
          }}>×</button>
        </div>
      </div>

      {/* Panel: Schüler */}
      {panel === "students" && (
        <div className="slide-down" style={{
          position: "fixed", top: 60, right: 16, zIndex: 300,
          width: 360, maxHeight: 480, overflowY: "auto",
          background: "#fff", border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 18, boxShadow: "0 12px 48px rgba(0,0,0,0.12)", padding: 18,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>Schüler:innen ({students.length})</span>
            <button onClick={() => setPanel(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#6e6e73" }}>×</button>
          </div>
          {students.length === 0 ? (
            <div style={{ fontSize: 13, color: "#a1a1a6" }}>Noch keine Einträge.</div>
          ) : students.map(ss => (
            <div key={ss.student.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>{ss.student.name}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {ss.reflection && <PillBadge color="#6e3cbf" style={{ fontSize: 9.5 }}>Transfer ✓</PillBadge>}
                  {ss.prompts.length > 0 && <PillBadge color={sc} style={{ fontSize: 9.5 }}>{ss.prompts.length} Prompts</PillBadge>}
                </div>
              </div>
              {ss.prompts.slice(-1).map((p, i) => (
                <div key={i} style={{ fontSize: 12, color: "#a1a1a6" }}>→ {p.text.slice(0, 60)}{p.text.length > 60 ? "…" : ""}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Panel: Analyse */}
      {panel === "analysis" && (
        <div className="slide-down" style={{
          position: "fixed", top: 60, right: 16, zIndex: 300,
          width: 440, maxHeight: 560, overflowY: "auto",
          background: "#fff", border: "1px solid rgba(0,113,227,0.15)",
          borderRadius: 18, boxShadow: "0 12px 48px rgba(0,0,0,0.12)", padding: 20,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#0071e3" }}>Top-5 Prompts · Gruppenanalyse</span>
            <button onClick={() => setPanel(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#6e6e73" }}>×</button>
          </div>
          {!analysis ? (
            <div style={{ fontSize: 13, color: "#a1a1a6" }}>
              {allPrompts.length === 0 ? "Noch keine Prompts vorhanden." : "Analyse läuft…"}
            </div>
          ) : (
            <div>
              {analysis.topPrompts.slice(0, 5).map((p, i) => (
                <div key={i} style={{
                  padding: "12px 14px", borderRadius: 12, marginBottom: 8,
                  background: i === 0 ? "rgba(0,113,227,0.05)" : "#f5f5f7",
                  border: `1px solid ${i === 0 ? "rgba(0,113,227,0.18)" : "rgba(0,0,0,0.06)"}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "#0071e3", fontWeight: 700 }}>#{p.rank} · {p.studentName}</span>
                    {i === 0 && <span style={{ fontSize: 11, color: "#0071e3" }}>Stärkster Prompt</span>}
                  </div>
                  <div style={{ fontSize: 13, color: "#1d1d1f", marginBottom: 5, lineHeight: 1.45 }}>„{p.text}"</div>
                  <div style={{ fontSize: 12, color: "#6e6e73", lineHeight: 1.55 }}>{p.reason}</div>
                </div>
              ))}
              {analysis.groupPatterns.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#6e6e73", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>Muster in der Gruppe</div>
                  {analysis.groupPatterns.map((pat, i) => (
                    <div key={i} style={{ fontSize: 13, color: "#424245", marginBottom: 5, paddingLeft: 12, borderLeft: "2px solid rgba(0,0,0,0.1)", lineHeight: 1.5 }}>{pat}</div>
                  ))}
                </div>
              )}
              {analysis.commonWeaknesses.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#6e6e73", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>Häufige Schwächen</div>
                  {analysis.commonWeaknesses.map((w, i) => (
                    <div key={i} style={{ fontSize: 13, color: "rgba(220,38,38,0.8)", marginBottom: 5, paddingLeft: 12, borderLeft: "2px solid rgba(220,38,38,0.2)", lineHeight: 1.5 }}>{w}</div>
                  ))}
                </div>
              )}
              {analysis.generalFeedback && (
                <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(0,113,227,0.05)", border: "1px solid rgba(0,113,227,0.12)", borderRadius: 12, fontSize: 13, color: "#424245", lineHeight: 1.65 }}>
                  {analysis.generalFeedback}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
