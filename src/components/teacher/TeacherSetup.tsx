"use client";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useLuneaStore } from "@/store/lunea";
import { SUBJECTS, getGradesForSubject, getTopicsForGrade } from "@/lib/curriculum";
import { AIMode, PhaseTimings } from "@/types";

const AI_MODES: Record<AIMode, { label: string; desc: string }> = {
  standard:   { label: "Standard",   desc: "Kompetent und hilfreich — erklärt vollständig" },
  socratic:   { label: "Sokratisch", desc: "Führt durch Rückfragen zum eigenen Denken" },
  unreliable: { label: "Kritisch",   desc: "Baut subtile Fehler ein — Prüfkompetenz trainieren" },
};

const s = (active: boolean, color: string) => ({
  padding: "7px 16px", borderRadius: 980, cursor: "pointer",
  border: `1px solid ${active ? color : "rgba(0,0,0,0.12)"}`,
  background: active ? color : "transparent",
  color: active ? "#fff" : "#1d1d1f",
  fontSize: 14, fontFamily: "inherit",
  transition: "all 0.15s",
});

export function TeacherSetup() {
  const { startSession, setView } = useLuneaStore();
  const [subjectId, setSubjectId]   = useState("deutsch");
  const [grade, setGrade]           = useState(7);
  const [topicId, setTopicId]       = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [task, setTask]             = useState("");
  const [aiMode, setAiMode]         = useState<AIMode>("standard");
  const [maxPrompts, setMaxPrompts] = useState(5);
  const [timings, setTimings]       = useState<PhaseTimings>({ eigen: 10, ki: 10, fokus: 10, reflexion: 10 });
  const [priorEnabled, setPriorEnabled] = useState(true);
  const [imageEnabled, setImageEnabled] = useState(false);
  const [showBestPrompts, setShowBestPrompts] = useState(false);
  const [lastWeekQ, setLastWeekQ]   = useState("");
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [step, setStep]             = useState<1|2|3>(1);

  const subject     = SUBJECTS.find(s => s.id === subjectId)!;
  const grades      = getGradesForSubject(subjectId);
  const topics      = getTopicsForGrade(subjectId, grade);
  const activeTopic = customTopic.trim() || topics.find(t => t.id === topicId)?.label || "";
  const canNext1    = activeTopic.length > 0;
  const canNext2    = task.length > 0;
  const filtered    = SUBJECTS.filter(s => s.label.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const vg = getGradesForSubject(subjectId);
    if (!vg.includes(grade)) setGrade(vg[0] ?? 5);
    setTopicId(""); setCustomTopic("");
  }, [subjectId]);
  useEffect(() => { setTopicId(""); setCustomTopic(""); }, [grade]);

  const handleStart = async () => {
    if (!canNext2 || loading) return;
    setLoading(true);
    let priorKnowledgeQuestions: string[] = [];
    if (priorEnabled) {
      try {
        const res = await fetch("/api/prior-knowledge", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject: subject.label, grade, topic: activeTopic, task }),
        });
        const data = await res.json();
        priorKnowledgeQuestions = data.questions ?? [];
      } catch {}
    }
    setLoading(false);
    startSession({
      id: uuidv4(), subject: subject.label, subjectColor: subject.color,
      grade, topic: activeTopic, task, aiMode, maxPrompts,
      phaseTimings: timings, priorKnowledgeEnabled: priorEnabled,
      priorKnowledgeQuestions, imageUploadEnabled: imageEnabled,
      lastWeekQuestion: lastWeekQ, promptSuggestions: [],
      createdAt: Date.now(),
    });
  };

  const sc = subject.color;

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "-apple-system,'SF Pro Text',sans-serif" }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "saturate(180%) blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 44px", height: 52,
      }}>
        <button onClick={() => setView("landing")} style={{
          background: "none", border: "none", fontSize: 14, color: "#0071e3",
          cursor: "pointer", fontFamily: "inherit",
        }}>← Zurück</button>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em" }}>Session einrichten</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {[1,2,3].map(n => (
            <div key={n} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: step >= n ? "#0071e3" : "#d2d2d7",
              transition: "background 0.2s",
            }} />
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* ── SCHRITT 1: Fach, Jahrgang, Thema ─────────── */}
        {step === 1 && (
          <div style={{ animation: "fadeUp 0.4s ease both" }}>
            <div style={{ fontSize: 13, color: "#0071e3", fontWeight: 500, marginBottom: 12 }}>Schritt 1 von 3</div>
            <h2 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em", color: "#1d1d1f", marginBottom: 8 }}>
              Fach & Thema
            </h2>
            <p style={{ fontSize: 16, color: "#6e6e73", marginBottom: 40 }}>
              Wähle Fach, Jahrgang und das Thema der Stunde.
            </p>

            {/* Fach */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 12 }}>Fach</div>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Fach suchen…"
                style={{ marginBottom: 12, borderRadius: 12 }}
              />
              <div style={{
                display: "flex", flexWrap: "wrap", gap: 8,
                maxHeight: 200, overflowY: "auto",
              }}>
                {filtered.map(sub => (
                  <button key={sub.id} onClick={() => setSubjectId(sub.id)} style={{
                    padding: "8px 16px", borderRadius: 980, cursor: "pointer",
                    border: `1px solid ${subjectId === sub.id ? sub.color : "rgba(0,0,0,0.12)"}`,
                    background: subjectId === sub.id ? `${sub.color}12` : "transparent",
                    color: subjectId === sub.id ? sub.color : "#424245",
                    fontSize: 14, fontFamily: "inherit", fontWeight: subjectId === sub.id ? 600 : 400,
                    transition: "all 0.15s",
                  }}>{sub.label}</button>
                ))}
              </div>
            </div>

            {/* Jahrgang */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 12 }}>Jahrgang</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {grades.map(g => (
                  <button key={g} onClick={() => setGrade(g)} style={s(grade === g, sc)}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Thema */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 12 }}>Thema</div>
              {topics.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {topics.map(t => (
                    <button key={t.id} onClick={() => { setTopicId(t.id); setCustomTopic(""); }} style={s(topicId === t.id && !customTopic, sc)}>
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
              <input
                value={customTopic}
                onChange={e => { setCustomTopic(e.target.value); setTopicId(""); }}
                placeholder={topics.length > 0 ? "Oder eigenes Thema eingeben…" : "Thema eingeben…"}
                style={{ borderRadius: 12 }}
              />
              {activeTopic && (
                <div style={{ marginTop: 8, fontSize: 13, color: sc, fontWeight: 500 }}>✓ {activeTopic}</div>
              )}
            </div>

            <button onClick={() => setStep(2)} disabled={!canNext1} style={{
              width: "100%", padding: "16px", borderRadius: 14, border: "none",
              background: canNext1 ? "#0071e3" : "#d2d2d7",
              color: "#fff", fontSize: 17, fontWeight: 600,
              cursor: canNext1 ? "pointer" : "not-allowed", fontFamily: "inherit",
            }}>Weiter</button>
          </div>
        )}

        {/* ── SCHRITT 2: Aufgabe & KI ─────────────────── */}
        {step === 2 && (
          <div style={{ animation: "fadeUp 0.4s ease both" }}>
            <div style={{ fontSize: 13, color: "#0071e3", fontWeight: 500, marginBottom: 12 }}>Schritt 2 von 3</div>
            <h2 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em", color: "#1d1d1f", marginBottom: 8 }}>
              Aufgabe & KI-Modus
            </h2>
            <p style={{ fontSize: 16, color: "#6e6e73", marginBottom: 40 }}>
              Was sollen Schüler:innen bearbeiten? Wie soll die KI antworten?
            </p>

            {/* Aufgabe */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 10 }}>Arbeitsauftrag</div>
              <textarea
                value={task} onChange={e => setTask(e.target.value)}
                placeholder="Formuliere die Aufgabe so, wie sie den Schüler:innen angezeigt wird…"
                rows={4} style={{ borderRadius: 14, fontSize: 15 }}
              />
            </div>

            {/* Anknüpfung */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 10 }}>
                Anknüpfung an letzte Stunde <span style={{ color: "#6e6e73", fontWeight: 400 }}>(optional)</span>
              </div>
              <input
                value={lastWeekQ} onChange={e => setLastWeekQ(e.target.value)}
                placeholder="Was haben wir letzte Stunde erarbeitet…?"
                style={{ borderRadius: 12 }}
              />
            </div>

            {/* KI-Modus */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 12 }}>KI-Modus</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(Object.entries(AI_MODES) as [AIMode, typeof AI_MODES[AIMode]][]).map(([key, val]) => (
                  <button key={key} onClick={() => setAiMode(key)} style={{
                    padding: "14px 18px", borderRadius: 14, textAlign: "left", cursor: "pointer",
                    border: `1px solid ${aiMode === key ? "#0071e3" : "rgba(0,0,0,0.1)"}`,
                    background: aiMode === key ? "rgba(0,113,227,0.06)" : "#f5f5f7",
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: aiMode === key ? "#0071e3" : "#1d1d1f", marginBottom: 3 }}>
                      {val.label}
                    </div>
                    <div style={{ fontSize: 13, color: "#6e6e73" }}>{val.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt-Limit */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 12 }}>
                Max. Prompts pro Schüler:in
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[2, 3, 5, 7, 10].map(n => (
                  <button key={n} onClick={() => setMaxPrompts(n)} style={s(maxPrompts === n, "#0071e3")}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep(1)} style={{
                flex: 1, padding: "16px", borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.12)", background: "transparent",
                fontSize: 17, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", color: "#1d1d1f",
              }}>Zurück</button>
              <button onClick={() => setStep(3)} disabled={!canNext2} style={{
                flex: 2, padding: "16px", borderRadius: 14, border: "none",
                background: canNext2 ? "#0071e3" : "#d2d2d7",
                color: "#fff", fontSize: 17, fontWeight: 600,
                cursor: canNext2 ? "pointer" : "not-allowed", fontFamily: "inherit",
              }}>Weiter</button>
            </div>
          </div>
        )}

        {/* ── SCHRITT 3: Phasen & Optionen ────────────── */}
        {step === 3 && (
          <div style={{ animation: "fadeUp 0.4s ease both" }}>
            <div style={{ fontSize: 13, color: "#0071e3", fontWeight: 500, marginBottom: 12 }}>Schritt 3 von 3</div>
            <h2 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em", color: "#1d1d1f", marginBottom: 8 }}>
              Phasen & Optionen
            </h2>
            <p style={{ fontSize: 16, color: "#6e6e73", marginBottom: 40 }}>
              Passe die Zeitstruktur und weitere Optionen an.
            </p>

            {/* Phasenzeiten */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 14 }}>Phasenzeiten (Minuten)</div>
              {[
                { key: "eigen" as const,     label: "Eigenphase",  color: "#1d8348" },
                { key: "ki" as const,        label: "KI-Phase",    color: "#0071e3" },
                { key: "fokus" as const,     label: "Fokusphase",  color: "#1d1d1f" },
                { key: "reflexion" as const, label: "Reflexion",   color: "#6e3cbf" },
              ].map(ph => (
                <div key={ph.key} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 16px", borderRadius: 12,
                  background: "#f5f5f7", marginBottom: 8,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: ph.color }}>{ph.label}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => setTimings(t => ({ ...t, [ph.key]: Math.max(1, t[ph.key] - 1) }))} style={{
                      width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.12)",
                      background: "#fff", fontSize: 18, cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>−</button>
                    <span style={{ fontSize: 17, fontWeight: 700, minWidth: 28, textAlign: "center" }}>
                      {timings[ph.key]}
                    </span>
                    <button onClick={() => setTimings(t => ({ ...t, [ph.key]: Math.min(60, t[ph.key] + 1) }))} style={{
                      width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.12)",
                      background: "#fff", fontSize: 18, cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Toggle options */}
            {[
              { val: priorEnabled, set: setPriorEnabled, label: "Vorwissensaktivierung", sub: "KI generiert 3 themenspezifische Einstiegsfragen" },
              { val: showBestPrompts, set: setShowBestPrompts, label: "Beste Prompts zeigen", sub: "Vor der KI-Phase: Top-Prompts der Klasse als Inspiration (optional)" },
              { val: imageEnabled, set: setImageEnabled, label: "Bild-Upload", sub: "Schüler:innen können Bilder in den Chat einbinden" },
            ].map(opt => (
              <div key={opt.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px", borderRadius: 14, background: "#f5f5f7",
                marginBottom: 8,
              }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1d1d1f" }}>{opt.label}</div>
                  <div style={{ fontSize: 13, color: "#6e6e73", marginTop: 2 }}>{opt.sub}</div>
                </div>
                <button onClick={() => opt.set(!opt.val)} style={{
                  width: 50, height: 30, borderRadius: 980, border: "none",
                  background: opt.val ? "#0071e3" : "#d2d2d7",
                  position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
                }}>
                  <div style={{
                    position: "absolute", top: 4, left: opt.val ? 24 : 4,
                    width: 22, height: 22, borderRadius: "50%", background: "#fff",
                    transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }} />
                </button>
              </div>
            ))}

            {/* Summary */}
            <div style={{
              padding: "16px 20px", borderRadius: 14,
              background: "#f5f5f7", marginTop: 24, marginBottom: 24,
              fontSize: 14, color: "#6e6e73", lineHeight: 1.8,
            }}>
              <span style={{ fontWeight: 600, color: "#1d1d1f" }}>{subject.label}</span> · Jg. {grade} · {activeTopic}<br />
              {AI_MODES[aiMode].label} · max. {maxPrompts} Prompts ·{" "}
              {timings.eigen}+{timings.ki}+{timings.fokus}+{timings.reflexion} Min.
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep(2)} style={{
                flex: 1, padding: "16px", borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.12)", background: "transparent",
                fontSize: 17, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", color: "#1d1d1f",
              }}>Zurück</button>
              <button onClick={handleStart} disabled={loading} style={{
                flex: 2, padding: "16px", borderRadius: 14, border: "none",
                background: "#0071e3", color: "#fff",
                fontSize: 17, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 4px 16px rgba(0,113,227,0.3)",
              }}>
                {loading ? "Bereite vor…" : "Session starten →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
