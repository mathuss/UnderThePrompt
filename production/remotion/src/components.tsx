import React from "react";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { C, L, TL, Word, clamp01, ease, pop, W, S, kf, mix } from "./lib";

const INTER = loadInter("normal", { weights: ["400", "600", "800"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const MONO = loadMono("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily;
export const SANS = C.mono ? MONO : INTER;

/** Themes with offset ("printed") shadows get the same hard shadow on chips instead of a glow. */
const HARD = /^\d+px \d+px 0 /.test(C.shadow);
const HARD_CHIP = HARD ? C.shadow.replace(/^\d+px \d+px/, "6px 6px") : "none";

type Box = { x: number; y: number; w?: number; h?: number };

/** Absolutely positioned element centered on (x, y). */
export const At: React.FC<{ x: number; y: number; s?: number; o?: number; rot?: number; children: React.ReactNode; z?: number }> = ({ x, y, s = 1, o = 1, rot = 0, children, z }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${s}) rotate(${rot}deg)`, opacity: o, zIndex: z }}>
    {children}
  </div>
);

export const Panel: React.FC<{ b: Required<Box>; o?: number; title?: string; children?: React.ReactNode; accent?: string }> = ({ b, o = 1, title, children, accent }) => (
  <div style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h, opacity: o, background: C.panel, border: `${C.bw}px solid ${accent ?? C.line}`, borderRadius: C.radius, overflow: "hidden", boxShadow: C.shadow, backdropFilter: C.blur }}>
    {title !== undefined && (
      <div style={{ height: 54, display: "flex", alignItems: "center", gap: 12, padding: "0 22px", background: C.panel2, borderBottom: `2px solid ${C.line}` }}>
        {[C.red, C.amber, C.green].map((c) => <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c, opacity: 0.8 }} />)}
        <div style={{ marginLeft: 10, fontFamily: MONO, fontSize: 24, color: C.dim }}>{title}</div>
      </div>
    )}
    {children}
  </div>
);

/** Step title: number pill + title + optional mono tool name. */
export const StepTitle: React.FC<{ t: number; at: number; n?: string; title: string; tool?: string; toolAt?: number; o?: number }> = ({ t, at, n, title, tool, toolAt, o = 1 }) => {
  const k = pop(t, at);
  const kt = tool ? pop(t, toolAt ?? at + 0.3) : 0;
  return (
    <div style={{ position: "absolute", left: 70, top: 290, opacity: o }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, transform: `translateX(${mix(-40, 0, k)}px)`, opacity: clamp01(k) }}>
        {n && <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 44, color: C.ink, background: C.amber, borderRadius: 18, padding: "4px 20px" }}>{n}</div>}
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 76, color: C.text, letterSpacing: -1.5 }}>{title}</div>
      </div>
      {tool && (
        <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 34, color: C.cyan, opacity: clamp01(kt), transform: `translateY(${mix(14, 0, kt)}px)` }}>{tool}</div>
      )}
    </div>
  );
};

export const Chip: React.FC<{ label: string; color?: string; lit?: number; mono?: boolean; size?: number; pad?: string }> = ({ label, color = C.cyan, lit = 1, mono = true, size = 30, pad = "10px 22px" }) => (
  <div style={{
    fontFamily: mono ? MONO : SANS, fontWeight: 700, fontSize: size, whiteSpace: "nowrap", padding: pad, borderRadius: 16,
    color: lit > 0.5 ? C.ink : C.dim,
    background: `color-mix(in srgb, ${color} ${Math.round(lit * 100)}%, ${C.panel2})`,
    border: `2px solid color-mix(in srgb, ${color} ${Math.round(30 + lit * 70)}%, ${C.line})`,
    boxShadow: lit <= 0.5 || C.shadow === "none" ? "none" : HARD ? HARD_CHIP : `0 0 ${30 * lit}px color-mix(in srgb, ${color} 45%, transparent)`,
  }}>{label}</div>
);

export const Node: React.FC<{ label: string; color?: string; w?: number; lit?: number; size?: number }> = ({ label, color = C.cyan, w, lit = 1, size = 34 }) => (
  <div style={{
    width: w, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: size, color: C.text, padding: "18px 22px", borderRadius: 20,
    background: C.panel2, border: `3px solid color-mix(in srgb, ${color} ${Math.round(25 + lit * 75)}%, ${C.line})`,
    boxShadow: C.shadow === "none" ? "none" : HARD ? HARD_CHIP : `0 0 ${40 * lit}px color-mix(in srgb, ${color} 35%, transparent)`,
  }}>{label}</div>
);

/** SVG stroke that draws itself from 0→1 (k). */
export const Stroke: React.FC<{ d: string; k: number; color?: string; width?: number; dash?: boolean; arrow?: boolean }> = ({ d, k, color = C.cyan, width = 5, dash, arrow }) => {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }} width={1080} height={1920}>
      {arrow && (
        <defs>
          <marker id={id} markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={color} />
          </marker>
        </defs>
      )}
      <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round"
        strokeDasharray={dash ? "0.02 0.02" : "1 1"} strokeDashoffset={dash ? 0 : 1 - k}
        opacity={dash ? k : k > 0.001 ? 1 : 0} markerEnd={arrow && k > 0.95 ? `url(#${id})` : undefined} />
    </svg>
  );
};

export const Check: React.FC<{ k: number; size?: number; color?: string }> = ({ k, size = 56, color = C.green }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" style={{ transform: `scale(${mix(0.4, 1, pop(k, 0, 1, 0))})`, opacity: clamp01(k * 3) }}>
    <circle cx="28" cy="28" r="26" fill={color} />
    <path d="M16 29 L25 38 L41 20" fill="none" stroke={C.ink} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp01(k * 1.4 - 0.3)} />
  </svg>
);

export const Glyph: React.FC<{ kind: "ok" | "maybe" | "unknown"; size?: number }> = ({ kind, size = 50 }) => {
  const color = kind === "ok" ? C.green : kind === "maybe" ? C.amber : C.dim;
  const sym = kind === "ok" ? "✓" : kind === "maybe" ? "≈" : "?";
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, background: color, color: C.ink, fontFamily: SANS, fontWeight: 800, fontSize: size * 0.62, display: "flex", alignItems: "center", justifyContent: "center" }}>{sym}</div>
  );
};

/** File card that persists through the whole video. */
export const FileCard: React.FC<{ name: string; badge?: string; badgeK?: number; color?: string; glow?: number }> = ({ name, badge, badgeK = 0, color = C.amber, glow = 0 }) => (
  <div style={{ position: "relative", width: 200, height: 240 }}>
    <svg width="200" height="240" viewBox="0 0 200 240" style={{ position: "absolute", filter: `drop-shadow(0 0 ${glow * 40}px ${color})` }}>
      <path d="M14 6 H140 L194 60 V226 Q194 234 186 234 H14 Q6 234 6 226 V14 Q6 6 14 6 Z" fill={C.panel2} stroke={color} strokeWidth="5" />
      <path d="M140 6 V52 Q140 60 148 60 H194" fill="none" stroke={color} strokeWidth="5" />
      {[0, 1, 2, 3].map((r) => (
        <text key={r} x="30" y={96 + r * 30} fontFamily={MONO} fontSize="22" fill={C.dim}>{["01001101", "01011010", "10010000", "00000000"][r]}</text>
      ))}
    </svg>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 18, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.text }}>{name}</div>
    {badge && (
      <div style={{ position: "absolute", right: -26, top: -22, transform: `scale(${pop(badgeK, 0, 1, 0)})` }}>
        <Chip label={badge} color={C.amber} size={30} pad="6px 16px" />
      </div>
    )}
  </div>
);

/** Words grouped into short caption chunks (≤4 words / ≤24 chars, break after punctuation). */
type Chunk = { words: Word[]; start: number; end: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  const flush = () => { if (cur.length) out.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end }); cur = []; };
  TL.words.forEach((w, i) => {
    const prev = TL.words[i - 1];
    if (prev && prev.line !== w.line) flush();
    const len = cur.map((x) => x.text).join(" ").length + w.text.length + 1;
    if (cur.length >= 4 || len > 24) flush();
    cur.push(w);
    if (/[,.:?!…]$/.test(w.text) && cur.length >= 2) flush();
  });
  flush();
  for (let i = 0; i < out.length; i++) {
    const next = out[i + 1];
    out[i].end = next && next.start - out[i].end < 0.7 ? next.start : out[i].end + 0.35;
  }
  return out;
})();

export const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = CHUNKS.find((x) => t >= x.start - 0.05 && t < x.end);
  if (!c) return null;
  const k = ease(t, c.start, 0.15, 0.05);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1335, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 18px", transform: `translateY(${mix(10, 0, k)}px)`, opacity: k }}>
      {c.words.map((w, i) => {
        const on = t >= w.start - 0.03;
        return (
          <span key={i} style={{
            fontFamily: SANS, fontWeight: 800, fontSize: 70, lineHeight: 1.12, letterSpacing: -0.5,
            color: on && t < w.end + 0.15 ? C.capActive : C.capText, opacity: on ? 1 : 0.55,
            WebkitTextStroke: `10px ${C.capStroke}`, paintOrder: "stroke fill",
          }}>{w.text}</span>
        );
      })}
    </div>
  );
};

export const Brand: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", left: 70, top: 222, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: C.brand }}>
    {L("DEBAJO DEL PROMPT", "UNDER THE PROMPT")}<span style={{ color: C.amber, opacity: Math.floor(t * 2) % 2 ? 1 : 0.2 }}>_</span>
  </div>
);

/** Static paper grain (fixed seed, so it doesn't flicker). */
const Grain: React.FC<{ o: number }> = ({ o }) => (
  <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: o, mixBlendMode: "overlay", pointerEvents: "none" }}>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width="1080" height="1920" filter="url(#grain)" />
  </svg>
);

/** Theme background. Vivid themes drift slowly and shift hue per scene so steps feel distinct. */
export const Background: React.FC<{ t: number }> = ({ t }) => {
  const hue = C.hueShift ? kf(t, TL.scenes.map((sc, i) => [sc.start, (i % 4) * C.hueShift] as [number, number])) : 0;
  const dx = Math.sin(t * 0.25) * 120, dy = Math.cos(t * 0.2) * 160;
  if (C.name === "noir") return (
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(1200px 900px at 50% 40%, #121826 0%, ${C.bg} 70%)` }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.35, backgroundImage: `linear-gradient(${C.line}55 1px, transparent 1px), linear-gradient(90deg, ${C.line}55 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
    </div>
  );
  if (C.name === "paper") return (
    <div style={{ position: "absolute", inset: 0, background: C.bg }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${C.line}33 2.2px, transparent 2.6px)`, backgroundSize: "36px 36px" }} />
      <div style={{ position: "absolute", left: 780 + dx * 0.3, top: 1560, width: 480, height: 480, borderRadius: 240, background: "#FFD60A", border: `5px solid ${C.line}` }} />
      <div style={{ position: "absolute", left: -230, top: -260 + dy * 0.2, width: 420, height: 420, background: C.cyan, border: `5px solid ${C.line}`, transform: `rotate(${12 + t * 3}deg)` }} />
    </div>
  );
  const sc = (TL.scenes.find((s) => t < s.end) ?? TL.scenes[TL.scenes.length - 1]).id;
  // Per-scene target positions, eased between scenes so shapes travel instead of jumping
  const glide = (vals: number[]) => kf(t, TL.scenes.map((s, i) => [s.start + 0.6, vals[i % vals.length]] as [number, number]));
  if (C.name === "keynote") {
    // one soft key light that drifts to a new spot each scene, plus a light sweep at each scene change
    const lx = glide([540, 300, 760, 420, 700]), ly = glide([700, 820, 640, 900, 760]);
    const s0 = (TL.scenes.find((s) => t < s.end) ?? TL.scenes[0]).start;
    const sweep = clamp01((t - s0) / 1.1);
    return (
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #0B0D12 0%, ${C.bg} 55%, #050608 100%)`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: lx - 700, top: ly - 700, width: 1400, height: 1400, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(150,170,210,.16), transparent)" }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.5, backgroundImage: "linear-gradient(#ffffff0d 1px, transparent 1px), linear-gradient(90deg, #ffffff0d 1px, transparent 1px)", backgroundSize: "90px 90px" }} />
        {sweep > 0 && sweep < 1 && <div style={{ position: "absolute", top: -400, bottom: -400, left: mix(-700, 1400, sweep), width: 380, transform: "rotate(18deg)", background: "linear-gradient(90deg, transparent, rgba(255,255,255,.05), transparent)" }} />}
      </div>
    );
  }
  if (C.name === "placa") {
    // traces held to 0/45/90°, gold pads at both ends; light pulses run along them
    const tr = ["M -20 470 H 160 L 240 550 V 760", "M 1100 520 H 930 L 860 590 V 900", "M -20 1250 H 120 L 200 1330 H 420", "M 1100 1180 H 980 L 900 1260 V 1500 H 700",
      "M 60 1900 V 1650 L 140 1570 H 380", "M 1020 1900 V 1700 L 940 1620 H 640", "M 300 -20 V 120 L 360 180 H 720 L 780 120 V -20"];
    const pads = tr.flatMap((d) => { const n = d.match(/-?\d+/g)!.map(Number); return [[n[0], n[1]], [n[n.length - 2], n[n.length - 1]]]; });
    return (
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(1300px 1000px at 50% 40%, #0F4A2E 0%, #0A3320 50%, ${C.bg} 100%)`, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.25, backgroundImage: "radial-gradient(#1C6A44 3px, transparent 3.5px)", backgroundSize: "48px 48px" }} />
        <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
          {tr.map((d, i) => <path key={i} d={d} fill="none" stroke="#2C7E53" strokeWidth="14" strokeLinejoin="round" />)}
          {tr.map((d, i) => <path key={"p" + i} d={d} pathLength={1} fill="none" stroke="#FFD08A" strokeWidth="6" strokeLinecap="round" strokeDasharray="0.08 0.92" strokeDashoffset={-((t * 0.35 + i * 0.17) % 1)} style={{ filter: "drop-shadow(0 0 8px #FFBE54)" }} />)}
          {pads.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="15" fill="#D9B25B" stroke="#8A6A22" strokeWidth="3" />)}
          {[["U1", 150, 430], ["REA-001", 820, 1560], ["R12", 200, 1230], ["C7", 930, 500]].map(([l, x, y]) => <text key={l as string} x={x as number} y={y as number} fontFamily={MONO} fontSize="24" fill="#F2EEE1" opacity="0.55">{l}</text>)}
        </svg>
      </div>
    );
  }
  if (C.name === "crt") return (
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(1100px 1500px at 50% 45%, #1C1206 0%, ${C.bg} 70%, #000 100%)` }} />
  );
  if (C.name === "linea") {
    // the five steps are stations on one line; the line is drawn as the video reaches each step
    const st = [[4, L("Identificar", "Identify")], [5, L("Mapear", "Map")], [6, L("Descompilar", "Decompile")], [7, L("Entender", "Understand")], [9, L("Reconstruir", "Rebuild")]] as [number, string][];
    const X = [140, 340, 540, 740, 940], Y = 1580;
    const head = kf(t, [[S(3).end - 0.5, 60], ...st.flatMap(([id], i) => [[S(id).start - 0.2, i ? X[i - 1] : 60], [S(id).start + 0.6, X[i]]] as [number, number][]), [S(10).start, X[4]], [S(10).start + 0.8, 1020]]);
    return (
      <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden" }}>
        <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
          <path d={`M 60 ${Y} H 1020`} stroke="#262A33" strokeWidth="18" strokeLinecap="round" />
          <path d="M -20 1460 H 420 L 540 1580 L 660 1700 H 1100" stroke="#3FA9F5" strokeOpacity="0.22" strokeWidth="18" fill="none" />
          <path d={`M 60 ${Y} H ${head}`} stroke={C.amber} strokeWidth="18" strokeLinecap="round" />
          {X.map((x, i) => {
            const on = head >= x - 2, cur = on && (i === X.length - 1 || head < X[i + 1] - 2);
            return (
              <g key={i}>
                {cur ? <rect x={x - 34} y={Y - 22} width="68" height="44" rx="22" fill="#fff" stroke="#0B0C10" strokeWidth="6" />
                  : <circle cx={x} cy={Y} r="16" fill={on ? "#fff" : "#4A4F5C"} stroke="#0B0C10" strokeWidth="5" />}
                <text x={x} y={Y + 64} textAnchor="middle" fontFamily={MONO} fontWeight="700" fontSize="26" fill={on ? "#fff" : "#6B7180"}>{st[i][1]}</text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }
  if (C.name === "tinta") return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${C.line}26 2.2px, transparent 2.6px)`, backgroundSize: "36px 36px" }} />
      <div style={{ position: "absolute", left: glide([760, 820, -260, 800, 700, -220]), top: glide([1540, 1620, 1580, 1500, 1640, 1560]), width: 480, height: 480, borderRadius: 240, background: C.amber, border: `5px solid ${C.line}`, boxShadow: "14px 14px 0 #07080B" }} />
      <div style={{ position: "absolute", left: glide([-230, 830, -250, 860, -240, 820]), top: glide([-260, -240, -280, -250, -230, -270]), width: 420, height: 420, background: C.cyan, border: `5px solid ${C.line}`, transform: `rotate(${12 + t * 3}deg)`, boxShadow: "14px 14px 0 #07080B" }} />
      <div style={{ position: "absolute", left: glide([980, -60, 990, -70]), top: glide([700, 900, 640, 980]), width: 150, height: 150, background: C.red, border: `5px solid ${C.line}`, clipPath: "polygon(50% 0, 100% 100%, 0 100%)", transform: `rotate(${-t * 6}deg)` }} />
      <Grain o={0.09} />
    </div>
  );
  if (C.name === "plano") return (
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(1400px 1100px at 45% 35%, #1A4E9C 0%, ${C.bg} 60%, #0A2B62 100%)`, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.22, backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`, backgroundSize: "30px 30px" }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.35, backgroundImage: `linear-gradient(${C.line} 2px, transparent 2px), linear-gradient(90deg, ${C.line} 2px, transparent 2px)`, backgroundSize: "150px 150px" }} />
      <div style={{ position: "absolute", inset: 34, border: `3px solid ${C.line}`, opacity: 0.8 }} />
      {[[60, 60], [1020, 60], [60, 1860], [1020, 1860]].map(([x, y], i) => (
        <svg key={i} width="60" height="60" style={{ position: "absolute", left: x - 30, top: y - 30 }}><circle cx="30" cy="30" r="14" fill="none" stroke={C.line} strokeWidth="2.5" /><path d="M0 30 H60 M30 0 V60" stroke={C.line} strokeWidth="2.5" /></svg>
      ))}
      <div style={{ position: "absolute", right: 34, bottom: 34, width: 380, border: `3px solid ${C.line}`, fontFamily: MONO, color: C.line, fontSize: 20, letterSpacing: 2, background: "rgba(8,36,84,.6)" }}>
        <div style={{ padding: "10px 16px", borderBottom: `2px solid ${C.line}`, fontWeight: 700 }}>REA · RECONSTRUCTION</div>
        <div style={{ display: "flex" }}>
          <div style={{ flex: 1, padding: "8px 16px", borderRight: `2px solid ${C.line}` }}>FIG. {sc}</div>
          <div style={{ flex: 1, padding: "8px 16px" }}>SHEET {sc}/11</div>
        </div>
      </div>
      <Grain o={0.12} />
    </div>
  );
  if (C.name === "riso") return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden" }}>
      {/* each shape printed twice, the teal plate slightly off-register */}
      {[[C.cyan, 16, 12, 0.75], [C.red, 0, 0, 0.92]].map(([col, ox, oy, op], i) => (
        <React.Fragment key={i}>
          <div style={{ position: "absolute", left: glide([620, 700, -220, 640]) + (ox as number), top: glide([1450, 1520, 1480, 1400]) + (oy as number), width: 620, height: 620, borderRadius: "50%", background: col as string, opacity: op as number, mixBlendMode: "screen" }} />
          <div style={{ position: "absolute", left: glide([-260, 840, -280, 860]) + (ox as number), top: glide([-300, -320, -290, -310]) + (oy as number), width: 460, height: 460, borderRadius: "50%", background: i ? C.amber : col as string, opacity: op as number, mixBlendMode: "screen" }} />
        </React.Fragment>
      ))}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${C.bg} 38%, transparent 42%)`, backgroundSize: "14px 14px", opacity: 0.55 }} />
      <Grain o={0.14} />
    </div>
  );
  if (C.name === "suizo") return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: glide([640, -260, 700, -300, 660]), top: glide([1380, 1460, 1500, 1400, 1440]), width: 720, height: 720, borderRadius: "50%", background: C.red }} />
      {[1, 2, 3, 4, 5].map((i) => <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: i * 180, width: 1, background: "#ffffff1a" }} />)}
      <div style={{ position: "absolute", right: -30, top: 380, fontFamily: SANS, fontWeight: 800, fontSize: 620, lineHeight: 1, letterSpacing: -40, color: "transparent", WebkitTextStroke: "3px #ffffff22" }}>{String(sc).padStart(2, "0")}</div>
      <Grain o={0.07} />
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden", filter: `hue-rotate(${hue}deg)` }}>
      {C.blobs.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: b[0] + (i % 2 ? dx : -dx), top: b[1] + (i % 2 ? -dy : dy), width: b[2], height: b[2], borderRadius: "50%", background: b[3], filter: "blur(120px)", opacity: 0.85 }} />
      ))}
      <div style={{ position: "absolute", inset: 0, opacity: 0.18, backgroundImage: `linear-gradient(#ffffff22 1px, transparent 1px), linear-gradient(90deg, #ffffff22 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
    </div>
  );
};

/** Screen-surface effects drawn over everything (CRT scanlines and vignette). */
export const Overlay: React.FC = () => C.name !== "crt" ? null : (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 2px, transparent 2px 5px)" }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(130% 100% at 50% 50%, transparent 60%, rgba(0,0,0,.75) 100%)" }} />
  </div>
);

export { W, S, kf };
