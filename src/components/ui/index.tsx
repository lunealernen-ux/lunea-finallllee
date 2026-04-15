"use client";
import React from "react";

// ─── CARD ─────────────────────────────────────────────────────────────────────
export function Card({
  children, className = "", style = {}, accent,
}: { children: React.ReactNode; className?: string; style?: React.CSSProperties; accent?: string }) {
  return (
    <div
      className={`card ${className}`}
      style={{ padding: 20, borderColor: accent ? `${accent}28` : undefined, ...style }}
    >{children}</div>
  );
}

// Keep Glass as alias for backwards compat
export const Glass = Card;

// ─── LABEL ────────────────────────────────────────────────────────────────────
export function Lbl({ children, color, style = {} }: { children: React.ReactNode; color?: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, letterSpacing: "0.05em",
      textTransform: "uppercase", color: color ?? "var(--text-3)",
      marginBottom: 10, ...style,
    }}>{children}</div>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, color, right }: {
  title: string; subtitle?: string; color?: string; right?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: color ?? "var(--text)", letterSpacing: "-0.02em" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

// ─── BUTTON ───────────────────────────────────────────────────────────────────
export function Btn({
  children, onClick, disabled, variant = "default", size = "md", color, style = {}, fullWidth,
}: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
  variant?: "default"|"primary"|"ghost"|"danger"|"tinted"; size?: "sm"|"md"|"lg";
  color?: string; style?: React.CSSProperties; fullWidth?: boolean;
}) {
  const sizes: Record<string,React.CSSProperties> = {
    sm: { padding:"5px 12px", fontSize:12, borderRadius:8 },
    md: { padding:"9px 18px", fontSize:13.5, borderRadius:11 },
    lg: { padding:"13px 28px", fontSize:15, borderRadius:13 },
  };
  const variants: Record<string,React.CSSProperties> = {
    default:{ background:"var(--bg2)", border:"1.5px solid var(--border-2)", color:"var(--text)" },
    primary:{ background:color??"var(--blue)", border:"1.5px solid transparent", color:"#fff",
              boxShadow: `0 4px 16px ${color?color+"40":"rgba(37,99,235,0.25)"}` },
    tinted: { background:color?`${color}0f`:"var(--blue-soft)", border:`1.5px solid ${color?color+"28":"var(--blue-border)"}`,
              color:color??"var(--blue)" },
    ghost:  { background:"transparent", border:"1.5px solid transparent", color:"var(--text-2)" },
    danger: { background:"rgba(220,38,38,0.08)", border:"1.5px solid rgba(220,38,38,0.18)", color:"#DC2626" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6,
      fontWeight:500, width:fullWidth?"100%":undefined, letterSpacing:"-0.01em",
      ...sizes[size], ...variants[variant], ...style,
    }}>{children}</button>
  );
}

// ─── STARS ────────────────────────────────────────────────────────────────────
export function Stars({ value, size = 14, color = "#F97316" }: { value: number; size?: number; color?: string }) {
  return (
    <div style={{ display:"flex", gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize:size, color: i<=value ? color : "var(--bg3)", lineHeight:1 }}>★</span>
      ))}
    </div>
  );
}

// ─── STAR RATING DISPLAY ──────────────────────────────────────────────────────
export function StarRating({ label, stars, comment, color = "#F97316" }: {
  label: string; stars: number; comment: string; color?: string;
}) {
  return (
    <div style={{
      padding: "12px 14px", borderRadius: "var(--r)",
      background: "var(--bg)", border: "1.5px solid var(--border)",
      display: "flex", flexDirection: "column", gap: 6,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:11.5, fontWeight:600, color:"var(--text-2)", letterSpacing:"-0.01em" }}>{label}</span>
        <Stars value={stars} size={12} color={color} />
      </div>
      <div style={{ fontSize:12.5, color:"var(--text-3)", lineHeight:1.55 }}>{comment}</div>
    </div>
  );
}

// ─── LOADING DOTS ─────────────────────────────────────────────────────────────
export function LoadingDots({ color }: { color?: string }) {
  return (
    <div style={{ display:"flex", gap:5, alignItems:"center", height:16 }}>
      {[0,1,2].map(i => <div key={i} className="loading-dot" style={color?{background:color}:undefined} />)}
    </div>
  );
}

// ─── TOGGLE ───────────────────────────────────────────────────────────────────
export function Toggle({ value, onChange, color = "var(--blue)" }: {
  value: boolean; onChange: (v: boolean) => void; color?: string;
}) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width:44, height:26, borderRadius:100, border:"none",
      background: value ? color : "var(--bg3)",
      position:"relative", flexShrink:0,
      boxShadow: value ? `0 0 0 2px ${color}30` : "inset 0 0 0 1.5px var(--border-2)",
      transition:"background 0.22s var(--ease)",
    }}>
      <div style={{
        position:"absolute", top:2, left: value ? 20 : 2,
        width:22, height:22, borderRadius:"50%",
        background:"#fff",
        boxShadow:"0 1px 4px rgba(0,0,0,0.2)",
        transition:"left 0.22s var(--ease-spring)",
      }} />
    </button>
  );
}

// ─── PHASE META ───────────────────────────────────────────────────────────────
export const PHASE_META = {
  eigen:     { label:"Eigenphase",  icon:"✦", color:"var(--phase-eigen)"     },
  ki:        { label:"KI-Phase",    icon:"◈", color:"var(--phase-ki)"        },
  fokus:     { label:"Fokusphase",  icon:"◉", color:"var(--phase-fokus)"     },
  reflexion: { label:"Reflexion",   icon:"◇", color:"var(--phase-reflexion)" },
} as const;

// ─── PHASE CHIP ───────────────────────────────────────────────────────────────
export function PhaseChip({ phase, active=false, onClick }: {
  phase: keyof typeof PHASE_META; active?: boolean; onClick?: () => void;
}) {
  const pm = PHASE_META[phase];
  return (
    <button onClick={onClick} style={{
      display:"flex", alignItems:"center", gap:5,
      padding:"5px 13px", borderRadius:100,
      border:`1.5px solid ${active ? pm.color : "var(--border-2)"}`,
      background: active ? `${pm.color}0f` : "transparent",
      color: active ? pm.color : "var(--text-3)",
      fontSize:12, fontWeight:500, cursor:onClick?"pointer":"default",
      transition:"all 0.18s var(--ease)",
    }}>
      <span style={{fontSize:9}}>{pm.icon}</span> {pm.label}
    </button>
  );
}

// ─── PHASE BAR ────────────────────────────────────────────────────────────────
export function PhaseBar({ current, onSelect }: { current: string; onSelect?: (p: string) => void }) {
  return (
    <div style={{ display:"flex", gap:3 }}>
      {(["eigen","ki","fokus","reflexion"] as const).map(p => (
        <PhaseChip key={p} phase={p} active={current===p} onClick={onSelect?()=>onSelect(p):undefined} />
      ))}
    </div>
  );
}

// ─── PROMPT DOTS ──────────────────────────────────────────────────────────────
export function PromptDots({ used, max }: { used: number; max: number }) {
  const left = max - used;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
      <div style={{ display:"flex", gap:4 }}>
        {Array.from({length:max}).map((_,i) => (
          <div key={i} style={{
            width:8, height:8, borderRadius:"50%",
            background: i<used ? "var(--bg3)" : "var(--phase-ki)",
            border: i<used ? "1.5px solid var(--border-2)" : "none",
            transition:"all 0.3s",
          }} />
        ))}
      </div>
      <div style={{ fontSize:10, color:left===0?"var(--orange)":"var(--text-3)", fontWeight:500 }}>
        {left===0 ? "Aufgebraucht" : `${left} verbleibend`}
      </div>
    </div>
  );
}

// ─── SUBJECT DOT ──────────────────────────────────────────────────────────────
export function SubjectDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
      <div style={{ width:8, height:8, borderRadius:"50%", background:color, boxShadow:`0 0 0 2px ${color}30` }} />
      {label && <span style={{ fontSize:13, fontWeight:500, color:"var(--text)" }}>{label}</span>}
    </div>
  );
}

// ─── PILL BADGE ───────────────────────────────────────────────────────────────
export function PillBadge({ children, color = "var(--blue)", style = {} }: {
  children: React.ReactNode; color?: string; style?: React.CSSProperties;
}) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center",
      padding:"2px 8px", borderRadius:100,
      background:`${color}0f`, border:`1.5px solid ${color}28`,
      color, fontSize:10.5, fontWeight:600, ...style,
    }}>{children}</span>
  );
}

// ─── DIVIDER ──────────────────────────────────────────────────────────────────
export function Divider({ margin = 16 }: { margin?: number }) {
  return <div style={{ height:1.5, background:"var(--border)", margin:`${margin}px 0` }} />;
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle }: { icon:string; title:string; subtitle?:string }) {
  return (
    <div style={{ textAlign:"center", padding:"48px 24px" }}>
      <div style={{ fontSize:32, marginBottom:10, opacity:0.2 }}>{icon}</div>
      <div style={{ fontSize:14, fontWeight:500, color:"var(--text-3)", marginBottom:4 }}>{title}</div>
      {subtitle && <div style={{ fontSize:12, color:"var(--text-4)" }}>{subtitle}</div>}
    </div>
  );
}
