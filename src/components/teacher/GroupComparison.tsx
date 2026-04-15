"use client";
import { LoadingDots } from "@/components/ui";
import { GroupComparison } from "@/types";

export function GroupComparisonPanel({ comparison, entries, onClose }: {
  comparison: GroupComparison | null;
  entries: Array<{ name: string; answer: string }>;
  onClose: () => void;
}) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: "fixed", inset: 0, zIndex: 400,
      background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div className="scale-in" style={{
        background: "#fff", borderRadius: 24,
        width: "100%", maxWidth: 580, maxHeight: "88vh", overflowY: "auto",
        boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
        fontFamily: "-apple-system,'SF Pro Text',sans-serif",
      }}>
        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.025em" }}>Gruppenvergleich</div>
              <div style={{ fontSize: 13, color: "#6e6e73", marginTop: 3 }}>{entries.length} Transfer-Sätze</div>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#f5f5f7", border: "none", color: "#6e6e73",
              fontSize: 16, cursor: "pointer",
            }}>×</button>
          </div>

          {/* Alle Antworten */}
          <div style={{ marginBottom: 20 }}>
            {entries.length === 0 ? (
              <div style={{ fontSize: 14, color: "#a1a1a6", fontStyle: "italic" }}>Noch keine Transfer-Sätze.</div>
            ) : entries.map((e, i) => {
              const isStrongest = comparison?.starksteAntwort === e.name && !comparison?.loading;
              return (
                <div key={i} style={{
                  display: "flex", gap: 12, padding: "10px 14px", marginBottom: 7,
                  background: isStrongest ? "rgba(110,60,191,0.05)" : "#f5f5f7",
                  border: `1px solid ${isStrongest ? "rgba(110,60,191,0.2)" : "rgba(0,0,0,0.06)"}`,
                  borderRadius: 12,
                }}>
                  <div style={{ width: 80, flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isStrongest ? "#6e3cbf" : "#1d1d1f" }}>{e.name}</div>
                    {isStrongest && <div style={{ fontSize: 10, color: "#6e3cbf", fontWeight: 600, marginTop: 2 }}>★ Stärkste</div>}
                  </div>
                  <div style={{ fontSize: 14, color: "#1d1d1f", lineHeight: 1.6, flex: 1 }}>„{e.answer}"</div>
                </div>
              );
            })}
          </div>

          <div style={{ height: 1, background: "rgba(0,0,0,0.08)", marginBottom: 20 }} />

          {comparison?.loading ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <LoadingDots />
              <div style={{ fontSize: 13, color: "#6e6e73", marginTop: 12 }}>KI analysiert…</div>
            </div>
          ) : comparison ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {comparison.gemeinsames && (
                <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(0,113,227,0.05)", border: "1px solid rgba(0,113,227,0.12)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#0071e3", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 7 }}>Gemeinsam verstanden</div>
                  <div style={{ fontSize: 14, color: "#1d1d1f", lineHeight: 1.65 }}>{comparison.gemeinsames}</div>
                </div>
              )}
              {comparison.unterschiede && (
                <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(191,72,0,0.05)", border: "1px solid rgba(191,72,0,0.12)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#bf4800", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 7 }}>Unterschiede</div>
                  <div style={{ fontSize: 14, color: "#1d1d1f", lineHeight: 1.65 }}>{comparison.unterschiede}</div>
                </div>
              )}
              {comparison.starksteAntwort && (
                <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(110,60,191,0.05)", border: "1px solid rgba(110,60,191,0.15)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6e3cbf", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 7 }}>Stärkste Antwort</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#6e3cbf", marginBottom: 6 }}>{comparison.starksteAntwort}</div>
                  <div style={{ fontSize: 14, color: "#1d1d1f", lineHeight: 1.65 }}>{comparison.begruendung}</div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
