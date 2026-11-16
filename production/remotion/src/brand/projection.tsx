/**
 * Lamp projection: a panel of light the cursor-lamp casts over the scene (dialogue format).
 * `kind` records what the panel is (project rule 4):
 *   REAL TEXT  = words copied from a real source or capture, typeset by us, never reworded
 *   REAL       = an unedited capture (screenshot, photo)
 *   SCHEMATIC  = our own drawing of an idea
 * Only SCHEMATIC shows a tag on screen: a "REAL" chip on every panel reads as odd to viewers (user note 2026-11-16).
 * `source` is kept in the code as the record of where each panel's content came from, but it is not drawn:
 * a "sesión real · …" line under every panel was visual noise (user note 2026-11-16). Sources go in the post description.
 */
import React from "react";
import { clamp01, ramp } from "./sync";
import { MONO, SANS, UI } from "./ui";

export type ProjKind = "REAL" | "REAL TEXT" | "SCHEMATIC";
export const PROJ = { left: 60, width: 960, top: 250 };

export const Projection: React.FC<{
  t: number; at: number; out: number; kind: ProjKind; source?: string; title?: string; height?: number; children?: React.ReactNode;
}> = ({ t, at, out, kind, source, title, height = 690, children }) => {
  if (t < at - 0.05 || t > out + 0.3) return null;
  const d = t - at;
  // a soft fade and rise in, a soft fade out (the old double flicker felt like a glitch)
  const inK = ramp(t, at, 0.45), outK = ramp(t, out - 0.25, 0.35);
  const o = inK * (1 - outK);
  const real = kind !== "SCHEMATIC";
  const col = real ? UI.amber : UI.ice;
  const { left, width, top } = PROJ;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      {/* the beam, from the lamp (up left, out of frame) down to the panel */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="utpBeam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={UI.amber} stopOpacity="0.02" />
            <stop offset="1" stopColor={UI.amber} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <polygon points={`620,110 840,150 ${left + width},${top} ${left},${top}`} fill="url(#utpBeam)" />
      </svg>
      <div style={{ position: "absolute", left, top, width, height, boxSizing: "border-box", transform: `translateY(${(1 - inK) * 24 - outK * 12}px) scale(${0.98 + 0.02 * inK})`, borderRadius: 26, padding: "26px 34px 30px",
        background: "linear-gradient(180deg, rgba(34,23,12,.95), rgba(18,13,24,.95))", border: `2px solid rgba(255,178,62,.55)`,
        boxShadow: `0 0 60px rgba(255,178,62,.22), inset 0 0 80px rgba(255,178,62,.06), 0 30px 70px rgba(0,0,0,.55)`, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          {!real && <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 3, padding: "5px 14px", borderRadius: 8,
            color: col, background: "transparent", border: `2px solid ${col}` }}>{kind}</div>}
          {title && <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: UI.cream, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>}
        </div>
        {children}
      </div>
    </div>
  );
};

/** Body text inside a projection. `**bold**` in copied Markdown is rendered as bold, not rewritten. */
export const ProjText: React.FC<{ text: string; size?: number; color?: string; mono?: boolean; hl?: string }> = ({ text, size = 34, color = UI.cream, mono, hl = UI.amber }) => (
  <div style={{ fontFamily: mono ? MONO : SANS, fontWeight: mono ? 500 : 600, fontSize: size, lineHeight: 1.32, color, whiteSpace: "pre-wrap" }}>
    {text.split(/(\*\*[^*]+\*\*)/).map((p, i) => (p.startsWith("**") ? <span key={i} style={{ color: hl, fontWeight: 800 }}>{p.slice(2, -2)}</span> : <React.Fragment key={i}>{p}</React.Fragment>))}
  </div>
);

/** One question of a grilling round, as the tool printed it: number, title, body, recommended answer. */
export const QuestionRow: React.FC<{
  n: number; title: string; body?: string; rec: string; mark?: "yes" | "no" | null; markLabel?: string; markK?: number; recOn?: number; size?: number;
}> = ({ n, title, body, rec, mark, markLabel, markK = 1, recOn = 1, size = 32 }) => (
  <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 20 }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: size + 2, color: UI.cream, lineHeight: 1.25 }}>
        <span style={{ fontFamily: MONO, color: UI.amber }}>Q{n}</span> · {title}
        {body && <span style={{ fontWeight: 600 }}>: {body}</span>}
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: size, lineHeight: 1.28, marginTop: 8, color: UI.amber, opacity: 0.35 + 0.65 * recOn }}>
        <span style={{ fontFamily: MONO }}>→ </span>{rec}
      </div>
    </div>
    {/* mark = null reserves the chip's column before the answer arrives, so the text doesn't reflow when it appears */}
    {mark !== undefined && (
      <div style={{ width: 120, flex: "none", textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 34, borderRadius: 12, padding: "6px 0",
        color: UI.night, background: mark === "yes" ? UI.amber : UI.coral, opacity: mark ? clamp01(markK * 3) : 0, transform: `scale(${0.7 + 0.3 * clamp01(markK * 2)})` }}>
        {mark ? markLabel ?? mark : ""}
      </div>
    )}
  </div>
);

/** Schematic: a plan as a tree of decisions. `k` 0…1 settles the branches one by one (ice = open, amber = settled). */
export const DecisionTree: React.FC<{ k: number }> = ({ k }) => {
  const root = { x: 444, y: 50 };
  const mids = [150, 444, 738].map((x) => ({ x, y: 210 }));
  const leaves = mids.flatMap((m) => [-78, 78].map((dx) => ({ x: m.x + dx, y: 380, p: m })));
  const order = [mids[0], leaves[0], leaves[1], mids[1], leaves[2], leaves[3], mids[2], leaves[4], leaves[5]];
  const lit = (node: { x: number; y: number }) => clamp01(k * (order.length + 1) - (order.indexOf(node as never) + 1));
  const col = (v: number) => (v > 0.5 ? UI.amber : UI.ice);
  const Node = ({ n, r, v }: { n: { x: number; y: number }; r: number; v: number }) => (
    <circle cx={n.x} cy={n.y} r={r * (1 + 0.25 * Math.sin(Math.min(1, v) * Math.PI))} fill={v > 0.5 ? UI.amber : "rgba(18,13,24,1)"} stroke={col(v)} strokeWidth={5} />
  );
  return (
    <svg width={888} height={450} viewBox="0 0 888 450">
      {mids.map((m, i) => <line key={`a${i}`} x1={root.x} y1={root.y} x2={m.x} y2={m.y} stroke={col(lit(m))} strokeWidth={5} opacity={0.85} />)}
      {leaves.map((l, i) => <line key={`b${i}`} x1={l.p.x} y1={l.p.y} x2={l.x} y2={l.y} stroke={col(lit(l))} strokeWidth={5} opacity={0.85} />)}
      <circle cx={root.x} cy={root.y} r={30} fill={UI.amber} />
      {mids.map((m, i) => <Node key={`m${i}`} n={m} r={24} v={lit(m)} />)}
      {leaves.map((l, i) => <Node key={`l${i}`} n={l} r={18} v={lit(l)} />)}
    </svg>
  );
};
