"use client";
import { useEffect } from "react";
import { useLuneaStore } from "@/store/lunea";

export function Timer() {
  const { session, tickTimer, toggleTimer, resetTimer } = useLuneaStore();

  useEffect(() => {
    if (!session?.timerRunning) return;
    const id = setInterval(tickTimer, 1000);
    return () => clearInterval(id);
  }, [session?.timerRunning, tickTimer]);

  if (!session) return null;
  const { timerSeconds, timerRunning } = session;
  const m = Math.floor(timerSeconds / 60);
  const s = timerSeconds % 60;
  const display = `${m}:${s.toString().padStart(2, "0")}`;
  const isLow = timerSeconds <= 60 && timerSeconds > 0;
  const isDone = timerSeconds === 0;

  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <span style={{
        fontSize:15, fontWeight:700, letterSpacing:"0.04em",
        color: isDone ? "#DC2626" : isLow ? "var(--orange)" : "var(--text)",
        fontVariantNumeric:"tabular-nums",
        minWidth:42, textAlign:"center",
      }}>{display}</span>
      <button onClick={toggleTimer} style={{
        width:28, height:28, borderRadius:8, cursor:"pointer",
        border:"1.5px solid var(--border-2)",
        background: timerRunning ? "rgba(249,115,22,0.1)" : "var(--bg2)",
        color: timerRunning ? "var(--orange)" : "var(--text-3)",
        fontSize:11, display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        {timerRunning ? "⏸" : "▶"}
      </button>
      <button onClick={resetTimer} style={{
        width:28, height:28, borderRadius:8, cursor:"pointer",
        border:"1.5px solid var(--border-2)",
        background:"var(--bg2)", color:"var(--text-3)",
        fontSize:11, display:"flex", alignItems:"center", justifyContent:"center",
      }}>↺</button>
    </div>
  );
}
