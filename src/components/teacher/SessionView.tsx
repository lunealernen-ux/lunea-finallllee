"use client";
import { useState, useEffect } from "react";
import { useLuneaStore } from "@/store/lunea";
import { Topbar } from "./Topbar";
import { StudentView } from "@/components/student/StudentView";
import { GroupComparisonPanel } from "./GroupComparison";

const PHASE_COLORS: Record<string, string> = {
  eigen: "#1d8348", ki: "#0071e3", fokus: "#1d1d1f", reflexion: "#6e3cbf",
};

export function SessionView() {
  const store = useLuneaStore();
  const { session, addStudent, setActiveStudent, activeStudentId, setGroupAnalysis, setGroupComparison, syncSession } = store;
  const [nameInput, setNameInput] = useState("");
  const [showGroupCompare, setShowGroupCompare] = useState(false);

  // Poll server every 3s to get new students and their data
  useEffect(() => {
    const interval = setInterval(() => {
      syncSession();
    }, 3000);
    return () => clearInterval(interval);
  }, [syncSession]);

  if (!session) return null;
  const { config, currentPhase, studentSessions, groupComparison } = session;
  const students = Object.values(studentSessions);
  const sc = config.subjectColor;
  const phaseColor = PHASE_COLORS[currentPhase] ?? "#1d1d1f";

  const handleAddStudent = () => {
    const n = nameInput.trim();
    if (!n) return;
    addStudent(n);
    setNameInput("");
  };

  const handleAnalyze = async () => {
    const allPrompts = students.flatMap(ss => ss.prompts.map(p => ({ studentName: ss.student.name, text: p.text })));
    if (!allPrompts.length) return;
    try {
      const res = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "group", promptsList: allPrompts, subject: config.subject, topic: config.topic, grade: config.grade }),
      });
      const data = await res.json();
      if (data.analysis) setGroupAnalysis(data.analysis);
    } catch {}
  };

  const handleGroupCompare = async () => {
    setShowGroupCompare(true);
    setGroupComparison({ gemeinsames: "", unterschiede: "", starksteAntwort: "", begruendung: "", loading: true });
    const entries = students.filter(ss => ss.reflection?.transferAnswer?.trim()).map(ss => ({ name: ss.student.name, answer: ss.reflection!.transferAnswer }));
    if (!entries.length) {
      setGroupComparison({ gemeinsames: "Noch keine Transfer-Sätze eingereicht.", unterschiede: "", starksteAntwort: "", begruendung: "", loading: false });
      return;
    }
    try {
      const res = await fetch("/api/group-compare", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries, task: config.task, subject: config.subject, topic: config.topic }),
      });
      const data = await res.json();
      setGroupComparison(data.comparison ? { ...data.comparison, loading: false } : null);
    } catch { setGroupComparison(null); }
  };

  const groupEntries = students.filter(ss => ss.reflection?.transferAnswer?.trim()).map(ss => ({ name: ss.student.name, answer: ss.reflection!.transferAnswer }));

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7", fontFamily: "-apple-system,'SF Pro Text',sans-serif" }}>
      <Topbar onAnalyze={handleAnalyze} onGroupCompare={handleGroupCompare} />

      <div style={{ paddingTop: 52 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 20px 80px" }}>

          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 18px", borderRadius: 14, marginBottom: 16,
            background: "#fff", border: "1px solid rgba(0,0,0,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: phaseColor }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: phaseColor }}>
                {currentPhase === "eigen" && "Eigenphase — Schüler:innen arbeiten selbstständig"}
                {currentPhase === "ki" && `KI-Phase — max. ${config.maxPrompts} Prompts pro Person`}
                {currentPhase === "fokus" && "Fokusphase — KI gesperrt, Ergebnisse optimieren"}
                {currentPhase === "reflexion" && "Reflexion — Transfer-Sätze einreichen"}
              </span>
            </div>
            {currentPhase === "reflexion" && (
              <button onClick={handleGroupCompare} style={{
                padding: "7px 14px", borderRadius: 980, border: "none",
                background: "#6e3cbf", color: "#fff",
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}>Vergleich starten</button>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            {students.map(ss => {
              const isActive = activeStudentId === ss.student.id;
              return (
                <button key={ss.student.id} onClick={() => setActiveStudent(ss.student.id)} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 980, cursor: "pointer",
                  border: `1px solid ${isActive ? sc : "rgba(0,0,0,0.12)"}`,
                  background: isActive ? `${sc}12` : "#fff",
                  color: isActive ? sc : "#424245",
                  fontSize: 14, fontWeight: isActive ? 600 : 400,
                  fontFamily: "inherit", transition: "all 0.15s",
                }}>
                  {ss.student.name}
                  {ss.reflection && <span style={{ fontSize: 10, color: "#6e3cbf" }}>✓</span>}
                  {ss.prompts.length > 0 && (
                    <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 6, background: isActive ? `${sc}20` : "#f5f5f7", color: isActive ? sc : "#6e6e73" }}>
                      {ss.prompts.length}
                    </span>
                  )}
                </button>
              );
            })}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={nameInput} onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddStudent()}
                placeholder="Schüler:in hinzufügen…"
                style={{ width: 180, fontSize: 14, padding: "7px 12px", borderRadius: 980 }}
              />
              <button onClick={handleAddStudent} disabled={!nameInput.trim()} style={{
                padding: "7px 14px", borderRadius: 980, border: "none",
                background: nameInput.trim() ? "#0071e3" : "#d2d2d7",
                color: "#fff", fontSize: 14, cursor: "pointer", fontFamily: "inherit",
              }}>+</button>
            </div>
          </div>

          {activeStudentId ? (
            <StudentView studentId={activeStudentId} />
          ) : (
            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(0,0,0,0.08)", textAlign: "center", padding: "64px 24px" }}>
              <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.2 }}>◈</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#6e6e73" }}>Bereit.</div>
              <div style={{ fontSize: 14, color: "#a1a1a6", marginTop: 4 }}>Schüler:in hinzufügen oder auf Join warten.</div>
            </div>
          )}
        </div>
      </div>

      {showGroupCompare && (
        <GroupComparisonPanel comparison={groupComparison ?? null} entries={groupEntries} onClose={() => setShowGroupCompare(false)} />
      )}
    </div>
  );
}
