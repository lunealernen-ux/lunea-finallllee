"use client";
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useLuneaStore } from "@/store/lunea";
import { LoadingDots, Stars } from "@/components/ui";
import type { Prompt, StudentReflection, StructuredFeedback } from "@/types";

const PHASE_LABELS: Record<string, { title: string; color: string; desc: string }> = {
  eigen:     { title: "Eigenphase",  color: "#1d8348", desc: "Arbeite zuerst selbst — die KI ist noch gesperrt." },
  ki:        { title: "KI-Phase",    color: "#0071e3", desc: "Jetzt kannst du die KI befragen." },
  fokus:     { title: "Fokusphase",  color: "#1d1d1f", desc: "KI gesperrt. Optimiere deine Ergebnisse." },
  reflexion: { title: "Reflexion",   color: "#6e3cbf", desc: "Reiche deinen Transfer-Satz ein." },
};

export function StudentView({ studentId }: { studentId: string }) {
  const store = useLuneaStore();
  const { session } = store;
  const ss = session?.studentSessions[studentId];
  const cfg = session?.config;
  const phase = session?.currentPhase ?? "eigen";

  const [promptText, setPromptText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [transferAnswer, setTransferAnswer] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<{ data: string; mediaType: string } | null>(null);
  const [showPriorDone, setShowPriorDone] = useState(false);
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [ss?.chatHistory]);

  if (!ss || !cfg) return null;

  const sc = cfg.subjectColor;
  const promptsLeft = cfg.maxPrompts - ss.promptsUsed;
  const kiActive = phase === "ki";
  const ph = PHASE_LABELS[phase] ?? PHASE_LABELS.eigen;

  const sendPrompt = async () => {
    if (!promptText.trim() || promptsLeft <= 0 || chatLoading) return;
    const text = promptText.trim();
    setPromptText("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...ss.chatHistory, { role: "user", content: text }],
          mode: cfg.aiMode, subject: cfg.subject,
          topic: cfg.topic, grade: cfg.grade, task: cfg.task,
          imageData: pendingImage,
        }),
      });
      const data = await res.json();
      const response: string = data.reply ?? "Verbindungsfehler.";
      const promptId = uuidv4();
      store.addPrompt(studentId, { id: promptId, studentId, studentName: ss.student.name, text, response, timestamp: Date.now(), phase });
      setPendingImage(null); setImagePreview(null);
      fetch("/api/rate-prompt", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptText: text, subject: cfg.subject, topic: cfg.topic, grade: cfg.grade }),
      }).then(r => r.json()).then(d => { if (d.rating) store.updatePromptRating(studentId, promptId, d.rating); }).catch(() => {});
    } catch { /* silent */ }
    setChatLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setPendingImage({ data: result.split(",")[1], mediaType: file.type });
      store.addImage(studentId, { id: uuidv4(), studentId, dataUrl: result, mediaType: file.type, timestamp: Date.now() });
    };
    reader.readAsDataURL(file);
  };

  const requestFeedback = async () => {
    if (feedbackLoading || ss.feedback) return;
    setFeedbackLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "student-feedback",
          subject: cfg.subject, topic: cfg.topic, grade: cfg.grade, task: cfg.task,
          ownThoughts: ss.ownThoughts, priorAnswers: ss.priorAnswers,
          prompts: ss.prompts.map(p => ({ text: p.text, response: p.response })),
        }),
      });
      const data = await res.json();
      if (data.feedback) store.setStudentFeedback(studentId, data.feedback as StructuredFeedback);
    } catch { /* silent */ }
    setFeedbackLoading(false);
  };

  const submitReflection = () => {
    if (!transferAnswer.trim()) return;
    store.setStudentReflection(studentId, { studentId, transferAnswer: transferAnswer.trim(), submittedAt: Date.now() });
  };

  const fb = ss.feedback as StructuredFeedback | undefined;
  const t = (active: boolean) => ({
    fontFamily: "-apple-system,'SF Pro Text',sans-serif",
    fontSize: 15,
  });

  const card = (extra = {}) => ({
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    ...extra,
  });

  return (
    <div style={{ fontFamily: "-apple-system,'SF Pro Text',sans-serif" }}>

      {/* Aufgabenkarte */}
      <div style={{ ...card(), borderLeft: `3px solid ${sc}` }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: sc, letterSpacing: "0.04em", marginBottom: 8 }}>
          {cfg.subject} · Jg. {cfg.grade} · {cfg.topic}
        </div>
        <div style={{ fontSize: 16, color: "#1d1d1f", lineHeight: 1.65 }}>{cfg.task}</div>
        {cfg.lastWeekQuestion && (
          <div style={{ marginTop: 12, padding: "8px 12px", background: `${sc}0a`, borderRadius: 10, fontSize: 13, color: sc }}>
            💭 {cfg.lastWeekQuestion}
          </div>
        )}
      </div>

      {/* Phasen-Status */}
      <div style={{
        ...card(), background: `${ph.color}06`,
        borderColor: `${ph.color}20`, display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: ph.color, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: ph.color }}>{ph.title}</div>
          <div style={{ fontSize: 13, color: "#6e6e73", marginTop: 2 }}>{ph.desc}</div>
        </div>
      </div>

      {/* Vorwissen */}
      {phase === "eigen" && cfg.priorKnowledgeEnabled && cfg.priorKnowledgeQuestions.length > 0 && !showPriorDone && (
        <div style={card()} className="fade-up">
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f", marginBottom: 16 }}>Vorwissen aktivieren</div>
          {cfg.priorKnowledgeQuestions.map((q, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: "#1d1d1f", marginBottom: 8, lineHeight: 1.5 }}>
                <span style={{ fontWeight: 700, color: "#1d8348", marginRight: 8 }}>{i + 1}.</span>{q}
              </div>
              <textarea
                value={ss.priorAnswers.find(a => a.questionIndex === i)?.answer ?? ""}
                onChange={e => store.addPriorAnswer(studentId, { questionIndex: i, question: q, answer: e.target.value })}
                rows={2} placeholder="Deine Antwort…"
                style={{ borderRadius: 12, fontSize: 14 }}
              />
            </div>
          ))}
          <button onClick={() => setShowPriorDone(true)} style={{
            width: "100%", padding: "12px", borderRadius: 12, border: "none",
            background: "#1d8348", color: "#fff", fontSize: 15, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}>Fertig →</button>
        </div>
      )}

      {/* Eigene Gedanken */}
      {(phase === "eigen" || phase === "ki" || phase === "fokus") && (
        <div style={card()} className="fade-up">
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f", marginBottom: 12 }}>Eigene Gedanken</div>
          <textarea
            value={ss.ownThoughts}
            onChange={e => store.updateStudentOwnThoughts(studentId, e.target.value)}
            placeholder="Was weißt du schon? Was vermutest du? Notiere zuerst selbst."
            rows={4} disabled={phase === "fokus"}
            style={{ borderRadius: 12, fontSize: 14, opacity: phase === "fokus" ? 0.4 : 1 }}
          />
          {phase === "fokus" && (
            <div style={{ marginTop: 10, fontSize: 13, color: "#6e6e73" }}>
              Nutze jetzt das, was du aus der KI-Phase mitgenommen hast.
            </div>
          )}
        </div>
      )}

      {/* KI-Chat */}
      {kiActive && (
        <div style={card({ borderColor: "rgba(0,113,227,0.15)" })} className="fade-up">
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f", marginBottom: 4 }}>LUNEA</div>
              <span style={{
                display: "inline-block", padding: "3px 9px", borderRadius: 6,
                background: cfg.aiMode === "unreliable" ? "rgba(220,38,38,0.08)" : "rgba(0,113,227,0.08)",
                color: cfg.aiMode === "unreliable" ? "#DC2626" : "#0071e3",
                fontSize: 11, fontWeight: 600,
              }}>
                {cfg.aiMode === "standard" ? "Standard" : cfg.aiMode === "socratic" ? "Sokratisch" : "Kritischer Modus"}
              </span>
            </div>
            {/* Prompt-Counter */}
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                {Array.from({ length: cfg.maxPrompts }).map((_, i) => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: i < ss.promptsUsed ? "#d2d2d7" : "#0071e3",
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: "#a1a1a6", marginTop: 4 }}>{promptsLeft} verbleibend</div>
            </div>
          </div>

          {cfg.aiMode === "unreliable" && (
            <div style={{ marginBottom: 12, padding: "9px 12px", borderRadius: 10, background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.12)", fontSize: 13, color: "#DC2626" }}>
              ⚠ Kritischer Modus: Prüfe alle Aussagen — die KI kann Fehler enthalten.
            </div>
          )}

          {/* Vorschläge */}
          {cfg.promptSuggestions.length > 0 && ss.prompts.length === 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#a1a1a6", marginBottom: 7 }}>Vorschläge:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {cfg.promptSuggestions.map((s, i) => (
                  <button key={i} onClick={() => setPromptText(s)} style={{
                    padding: "5px 11px", borderRadius: 980,
                    border: "1px solid rgba(0,113,227,0.2)", background: "rgba(0,113,227,0.06)",
                    color: "#0071e3", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                  }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Chat */}
          <div style={{ minHeight: 80, maxHeight: 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {ss.chatHistory.length === 0 && (
              <div style={{ fontSize: 14, color: "#a1a1a6", textAlign: "center", padding: "24px 0", fontStyle: "italic" }}>
                Überlege zuerst: Was willst du wirklich wissen?
              </div>
            )}
            {ss.chatHistory.map((msg, i) => (
              <div key={i} className={msg.role === "user" ? "bubble-user" : "bubble-ai"}>{msg.content}</div>
            ))}
            {chatLoading && <div className="bubble-ai" style={{ padding: "12px 14px" }}><LoadingDots /></div>}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt-Bewertungen */}
          {ss.prompts.some(p => p.rating) && (
            <div style={{ marginBottom: 12, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 12 }}>
              <div style={{ fontSize: 12, color: "#a1a1a6", marginBottom: 8 }}>Bewertungen deiner Fragen</div>
              {ss.prompts.map(p => {
                if (!p.rating) return null;
                const avg = Math.round((p.rating.praezision.stars + p.rating.eigenanteil.stars + p.rating.lernwert.stars) / 3);
                const isOpen = expandedPrompt === p.id;
                return (
                  <div key={p.id} style={{ marginBottom: 6 }}>
                    <button onClick={() => setExpandedPrompt(isOpen ? null : p.id)} style={{
                      width: "100%", padding: "8px 12px", borderRadius: 10,
                      background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.06)",
                      display: "flex", alignItems: "center", gap: 8,
                      cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                    }}>
                      <span style={{ flex: 1, fontSize: 12, color: "#6e6e73", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.text}</span>
                      <Stars value={avg} size={11} />
                      <span style={{ fontSize: 10, color: "#a1a1a6" }}>{isOpen ? "▲" : "▼"}</span>
                    </button>
                    {isOpen && (
                      <div className="scale-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 6 }}>
                        {[
                          { label: "Präzision", d: p.rating!.praezision, color: "#0071e3" },
                          { label: "Eigenanteil", d: p.rating!.eigenanteil, color: "#1d8348" },
                          { label: "Lernwert", d: p.rating!.lernwert, color: "#6e3cbf" },
                        ].map(({ label, d, color }) => (
                          <div key={label} style={{ padding: "10px 12px", background: "#f5f5f7", borderRadius: 10, border: "1px solid rgba(0,0,0,0.06)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                              <span style={{ fontSize: 10, fontWeight: 600, color }}>{label}</span>
                              <Stars value={d.stars} size={10} color={color} />
                            </div>
                            <div style={{ fontSize: 11, color: "#6e6e73", lineHeight: 1.5 }}>{d.comment}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Bild-Upload */}
          {cfg.imageUploadEnabled && (
            <div style={{ marginBottom: 8 }}>
              {imagePreview ? (
                <div style={{ position: "relative", marginBottom: 8, display: "inline-block" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Vorschau" style={{ maxWidth: "100%", maxHeight: 110, borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)" }} />
                  <button onClick={() => { setImagePreview(null); setPendingImage(null); }} style={{
                    position: "absolute", top: 5, right: 5, width: 22, height: 22, borderRadius: "50%",
                    background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", fontSize: 12, cursor: "pointer",
                  }}>×</button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()} style={{
                  padding: "5px 11px", borderRadius: 980,
                  border: "1px dashed rgba(0,0,0,0.15)", background: "transparent",
                  color: "#6e6e73", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                }}>📎 Bild anhängen</button>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
            </div>
          )}

          {/* Input */}
          {promptsLeft > 0 ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                ref={inputRef}
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendPrompt(); } }}
                placeholder="Deine Frage an LUNEA…"
                disabled={chatLoading}
                style={{ flex: 1, borderRadius: 12, fontSize: 15 }}
              />
              <button onClick={sendPrompt} disabled={!promptText.trim() || chatLoading} style={{
                width: 44, height: 44, borderRadius: 12, border: "none",
                background: promptText.trim() && !chatLoading ? "#0071e3" : "#d2d2d7",
                color: "#fff", fontSize: 18, cursor: "pointer",
              }}>↑</button>
            </div>
          ) : (
            <div style={{ textAlign: "center", fontSize: 14, color: "#6e6e73", padding: "12px", background: "#f5f5f7", borderRadius: 12 }}>
              Prompts aufgebraucht — denke jetzt selbst weiter.
            </div>
          )}

          {/* Feedback anfordern */}
          {ss.prompts.length > 0 && !fb && !feedbackLoading && (
            <button onClick={requestFeedback} style={{
              width: "100%", marginTop: 12, padding: "12px", borderRadius: 12, border: "none",
              background: "#1d1d1f", color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>Persönliches Feedback anfordern</button>
          )}
          {feedbackLoading && <div style={{ display: "flex", justifyContent: "center", paddingTop: 12 }}><LoadingDots /></div>}
        </div>
      )}

      {/* 5-Dimensionen-Feedback */}
      {fb && (
        <div style={card({ borderColor: `${sc}20` })} className="fade-up">
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f", marginBottom: 20 }}>Dein Feedback</div>

          {/* 5 Sterne-Dimensionen */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
            {([
              { key: "vorwissen" as const, color: "#1d8348" },
              { key: "kritischePruefung" as const, color: "#0071e3" },
              { key: "umgangMitKI" as const, color: "#bf4800" },
              { key: "eigenanteil" as const, color: "#6e3cbf" },
              { key: "denkqualitaet" as const, color: "#1d1d1f" },
            ]).map(({ key, color }) => {
              const dim = fb[key];
              return (
                <div key={key} style={{ padding: "12px 14px", background: "#f5f5f7", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color }}>{dim.label}</span>
                    <Stars value={dim.stars} size={12} color={color} />
                  </div>
                  <div style={{ fontSize: 12, color: "#6e6e73", lineHeight: 1.55 }}>{dim.comment}</div>
                </div>
              );
            })}
          </div>

          {/* Stärke, Blinder Fleck, Nächster Schritt */}
          {[
            { icon: "💪", label: "Größte Stärke", val: fb.staerke, color: "#1d8348" },
            { icon: "🔍", label: "Blinder Fleck", val: fb.blinder_fleck, color: "#bf4800" },
            { icon: "→", label: "Nächster Schritt", val: fb.naechster_schritt, color: "#0071e3" },
          ].map(({ icon, label, val, color }) => (
            <div key={label} style={{ padding: "12px 14px", borderRadius: 12, background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.06)", marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 5 }}>{icon} {label}</div>
              <div style={{ fontSize: 14, color: "#1d1d1f", lineHeight: 1.65 }}>{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Reflexion / Transfer */}
      {phase === "reflexion" && !ss.reflection && (
        <div style={card({ borderColor: "rgba(110,60,191,0.2)" })} className="fade-up">
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f", marginBottom: 8 }}>Transfer-Satz</div>
          <div style={{ fontSize: 14, color: "#6e6e73", marginBottom: 20, lineHeight: 1.65 }}>
            Was nimmst du aus dieser Stunde mit? Formuliere in einem Satz — dann vergleicht die Gruppe.
          </div>
          <textarea
            value={transferAnswer}
            onChange={e => setTransferAnswer(e.target.value)}
            rows={3} placeholder="In einem Satz: Was habe ich heute wirklich verstanden?"
            style={{ borderRadius: 12, fontSize: 15 }}
          />
          <button onClick={submitReflection} disabled={!transferAnswer.trim()} style={{
            width: "100%", marginTop: 12, padding: "14px", borderRadius: 12, border: "none",
            background: transferAnswer.trim() ? "#6e3cbf" : "#d2d2d7",
            color: "#fff", fontSize: 15, fontWeight: 600,
            cursor: transferAnswer.trim() ? "pointer" : "not-allowed", fontFamily: "inherit",
          }}>Einreichen</button>
        </div>
      )}

      {phase === "reflexion" && ss.reflection && (
        <div style={{ ...card({ borderColor: "rgba(110,60,191,0.2)", textAlign: "center" as const }), padding: "44px 24px" }} className="fade-up">
          <div style={{ fontSize: 22, marginBottom: 12 }}>✓</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#1d1d1f", marginBottom: 6 }}>Transfer eingereicht</div>
          <div style={{ fontSize: 14, color: "#6e6e73" }}>Die Lehrkraft startet jetzt den Gruppenvergleich.</div>
          {ss.reflection.transferAnswer && (
            <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(110,60,191,0.05)", border: "1px solid rgba(110,60,191,0.12)", borderRadius: 12, fontSize: 15, color: "#1d1d1f", fontStyle: "italic" }}>
              „{ss.reflection.transferAnswer}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
