/** 2D brand layer drawn over the 3D canvas (brand/identity.md §4). Positions are for 1080×1920 with platform safe zones. */
import React from "react";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { clamp01, pop, ramp, Word } from "./sync";

export const SANS = loadInter("normal", { weights: ["400", "600", "800"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const MONO = loadMono("normal", { weights: ["500", "700"], subsets: ["latin"] }).fontFamily;

export const UI = {
  night: "#0E0B14", plum: "#241B33", amber: "#FFB23E", ember: "#FF7A2F", violet: "#7A68D8", lilac: "#B9AEF2",
  ice: "#A8E4FF", coral: "#FF5A6E", cream: "#FFF1D6", muted: "#A89FB8", cardBg: "rgba(18,13,24,.92)",
};
export type Tone = "amber" | "ice" | "coral";
const toneColor = (t: Tone) => (t === "ice" ? UI.ice : t === "coral" ? UI.coral : UI.amber);

/** Thin amber progress line at the top: the series' progress marker. */
export const ProgressBar: React.FC<{ t: number; duration: number }> = ({ t, duration }) => (
  <div style={{ position: "absolute", left: 70, right: 70, top: 168, height: 6, borderRadius: 3, background: "rgba(255,241,214,.14)" }}>
    <div style={{ width: `${clamp01(t / duration) * 100}%`, height: "100%", borderRadius: 3, background: UI.amber, boxShadow: `0 0 12px ${UI.amber}` }} />
  </div>
);

/** Brand line under the progress bar; during the hook it reads as the log stamp. */
export const BrandLine: React.FC<{ t: number; brand: string; stamp: string; stampUntil: number }> = ({ t, brand, stamp, stampUntil }) => {
  const showStamp = t < stampUntil;
  return (
    <div style={{ position: "absolute", left: 70, top: 196, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: showStamp ? UI.amber : "rgba(255,241,214,.7)", whiteSpace: "nowrap" }}>
      {showStamp ? stamp : brand}<span style={{ color: UI.amber, opacity: Math.floor(t * 2) % 2 ? 1 : 0.15 }}>_</span>
    </div>
  );
};

/** Karaoke caption pill: ≤4 words, active word in amber, fixed position above platform UI. */
export const CaptionPill: React.FC<{ t: number; chunks: { words: Word[]; start: number; end: number }[]; accent?: (w: Word) => string }> = ({ t, chunks, accent }) => {
  const c = chunks.find((x) => t >= x.start - 0.05 && t < x.end);
  if (!c) return null;
  const k = ramp(t, c.start - 0.05, 0.12);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1350, display: "flex", justifyContent: "center", opacity: k, transform: `translateY(${(1 - k) * 8}px)` }}>
      <div style={{ display: "flex", gap: 16, padding: "16px 30px", borderRadius: 999, background: "rgba(14,11,20,.86)", border: "1px solid rgba(185,174,242,.18)", maxWidth: 960 }}>
        {c.words.map((w, i) => {
          const on = t >= w.start - 0.03 && t < w.end + 0.12;
          return <span key={i} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 56, lineHeight: 1.15, color: on ? (accent ? accent(w) : UI.amber) : UI.cream, opacity: t >= w.start - 0.03 ? 1 : 0.5, whiteSpace: "nowrap" }}>{w.text}</span>;
        })}
      </div>
    </div>
  );
};

/** Evidence card. `typed` reveals the title like the Cursor typing it. */
export const Card: React.FC<{
  t: number; at: number; out?: number; x: number; y: number; w?: number; tone?: Tone; tab?: string;
  title: string; sub?: string; source?: string; typed?: boolean; big?: boolean; crack?: number; children?: React.ReactNode;
}> = ({ t, at, out = 1e9, x, y, w = 640, tone = "amber", tab = "▍_ cursor", title, sub, source, typed, big, crack = 0, children }) => {
  if (t < at - 0.1 || t > out + 0.4) return null;
  const k = pop(t, at, 0.4), o = clamp01((t - at + 0.1) / 0.2) * (1 - ramp(t, out, 0.3));
  const col = toneColor(tone);
  const shown = typed ? title.slice(0, Math.round(clamp01((t - at - 0.15) / Math.max(0.4, title.length * 0.035)) * title.length)) : title;
  const shake = crack > 0 && crack < 1 ? Math.sin(t * 90) * 6 * (1 - crack) : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, transform: `translate(-50%, 0) translateX(${shake}px) scale(${0.85 + 0.15 * k})`, opacity: o * (1 - clamp01((crack - 0.6) / 0.4)), transformOrigin: "50% 0" }}>
      <div style={{ position: "relative", background: UI.cardBg, border: `3px solid ${col}`, borderRadius: 24, padding: "20px 28px 22px", boxShadow: `0 0 34px ${col}33, 0 24px 60px rgba(0,0,0,.5)` }}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: UI.muted, marginBottom: 10 }}>{tab}</div>
        <div style={{ fontFamily: big ? SANS : MONO, fontWeight: big ? 800 : 700, fontSize: big ? 58 : 40, lineHeight: 1.15, color: col }}>
          {shown}{typed && shown.length < title.length && <span style={{ opacity: Math.floor(t * 4) % 2 ? 1 : 0 }}>▍</span>}
        </div>
        {sub && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: UI.cream, marginTop: 8 }}>{sub}</div>}
        {children}
        {source && <div style={{ fontFamily: MONO, fontSize: 20, color: UI.muted, marginTop: 14 }}>source: {source}</div>}
        {crack > 0 && (
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
            <path d="M48 0 L55 30 L44 52 L58 74 L50 100" fill="none" stroke={UI.coral} strokeWidth="1.2" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp01(crack * 1.6)} />
          </svg>
        )}
      </div>
    </div>
  );
};

/** Small honesty tag: "recreation", "schematic", photo credits. */
export const Tag: React.FC<{ t: number; at: number; out: number; text: string; x?: number; y?: number }> = ({ t, at, out, text, x = 70, y = 1270 }) => {
  const o = ramp(t, at, 0.25) * (1 - ramp(t, out - 0.25, 0.25));
  if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, opacity: o, fontFamily: MONO, fontSize: 22, letterSpacing: 2, color: UI.cream, background: "rgba(14,11,20,.7)", border: "1px solid rgba(255,241,214,.25)", borderRadius: 8, padding: "4px 12px" }}>{text}</div>;
};

/** Signature blink transition: the frame goes dark around a cut, with the cursor flickering. */
export const Blink: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const d = Math.abs(t - at);
  if (d > 0.22) return null;
  const o = 1 - d / 0.22;
  return (
    <div style={{ position: "absolute", inset: 0, background: `rgba(14,11,20,${Math.min(1, o * 1.4)})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 120, height: 18, background: UI.amber, opacity: o > 0.6 ? 1 : 0, boxShadow: `0 0 40px ${UI.amber}` }} />
    </div>
  );
};

/** Ending card after the lamp tap. */
export const EndCard: React.FC<{ t: number; at: number; brand: string; line: string }> = ({ t, at, brand, line }) => {
  const o = ramp(t, at, 0.25);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", inset: 0, background: `rgba(14,11,20,${o})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 64, letterSpacing: 6, color: UI.cream, opacity: ramp(t, at + 0.1, 0.3) }}>
        {brand}<span style={{ color: UI.amber, opacity: Math.floor(t * 2) % 2 ? 1 : 0.15 }}>_</span>
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, color: UI.muted, opacity: ramp(t, at + 0.3, 0.3) }}>{line}</div>
    </div>
  );
};

/**
 * A real document shown full screen (archive photo), with a slow camera move between focus keys
 * (photo pixel coords) and an optional amber underline. Always credited.
 */
export const DocumentShot: React.FC<{
  src: string; w: number; h: number; t: number; at: number; out: number;
  keys: { t: number; cx: number; cy: number; k: number }[];
  underline?: { at: number; x0: number; x1: number; y: number };
  credit: string;
}> = ({ src, w, h, t, at, out, keys, underline, credit }) => {
  if (t < at - 0.05 || t > out + 0.05) return null;
  let i = 0; while (i + 1 < keys.length && keys[i + 1].t <= t) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const x = b === a ? 1 : Math.max(0, Math.min(1, (t - a.t) / Math.max(0.001, b.t - a.t))), e = x * x * (3 - 2 * x);
  const cx = a.cx + (b.cx - a.cx) * e, cy = a.cy + (b.cy - a.cy) * e, k = a.k + (b.k - a.k) * e;
  const o = Math.min(1, (t - at) / 0.15) * Math.min(1, (out - t) / 0.15);
  const ul = underline ? clamp01((t - underline.at) / 0.45) : 0;
  return (
    <div style={{ position: "absolute", inset: 0, background: UI.night, opacity: o, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 540 - cx * k, top: 860 - cy * k, width: w * k, height: h * k }}>
        <img src={src} style={{ width: "100%", height: "100%", display: "block", boxShadow: "0 30px 80px rgba(0,0,0,.6)" }} />
        {underline && ul > 0 && (
          <div style={{ position: "absolute", left: underline.x0 * k, top: underline.y * k, height: 8, width: (underline.x1 - underline.x0) * k * ul, background: UI.amber, borderRadius: 4, boxShadow: `0 0 16px ${UI.amber}` }} />
        )}
      </div>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(14,11,20,.75) 100%)" }} />
      <div style={{ position: "absolute", left: 70, top: 1270, fontFamily: MONO, fontSize: 22, letterSpacing: 2, color: UI.cream, background: "rgba(14,11,20,.7)", border: "1px solid rgba(255,241,214,.25)", borderRadius: 8, padding: "4px 12px" }}>{credit}</div>
    </div>
  );
};
