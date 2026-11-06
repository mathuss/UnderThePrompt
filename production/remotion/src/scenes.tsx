import React from "react";
import { C, L, W, S, ease, pop, kf, mix, clamp01, sceneAlpha, inScene } from "./lib";
import { At, Panel, StepTitle, Chip, Node, Stroke, Check, Glyph, FileCard, SANS, MONO } from "./components";

type P = { t: number };

/* ───────────── persistent elements ───────────── */

const LANE_Y = [985, 1063, 1141, 1219];

/** The .exe card: lands in the terminal, dives into bytes, gets scanned, then waits in the corner. */
export const PersistentCard: React.FC<P> = ({ t }) => {
  const keys: [number, number, number, number, number][] = [
    [0, 540, -300, 1, 1],
    [W(1, "cualquier") - 0.25, 540, -300, 1, 1],
    [W(1, "programa"), 540, 830, 1, 1],
    [S(2).start, 540, 830, 1, 1],
    [S(2).start + 0.55, 540, 830, 7, 0],
    [S(3).start + 0.1, 190, 470, 0.6, 0],
    [S(3).start + 0.5, 190, 470, 0.6, 1],
    [S(4).start, 190, 470, 0.6, 1],
    [W(4, "open_binary"), 540, 640, 0.85, 1],
    [W(4, "nativo") - 0.35, 540, 640, 0.85, 1],
    [W(4, "nativo"), 110, LANE_Y[0], 0.38, 1],
    [S(5).start, 110, LANE_Y[0], 0.38, 1],
    [S(5).start + 0.6, 965, 330, 0.42, 1],
    [S(11).start + 0.2, 965, 330, 0.42, 1],
    [W(11, "binario"), 210, 760, 0.85, 1],
  ];
  const col = (i: number) => kf(t, keys.map((k) => [k[0], k[i]] as [number, number]));
  const glow = inScene(t, 11, 0) ? ease(t, W(11, "binario"), 0.4) : 0;
  return (
    <At x={col(1)} y={col(2)} s={col(3)} o={col(4)} z={5}>
      <FileCard name="app.exe" badge={t > W(4, "tipo") - 0.2 ? "PE" : undefined} badgeK={ease(t, W(4, "tipo"), 0.5)} glow={glow} />
    </At>
  );
};

/** The function box born in step 2 and renamed in step 4. */
export const FunctionBox: React.FC<P> = ({ t }) => {
  const born = W(5, "referencias") + 0.35;
  if (t < born - 0.2 || t > W(9, "codigo") + 0.8) return null;
  const tree = { x: 470, y: 707 };
  const keys: [number, number, number, number, number][] = [
    [born - 0.2, 540, 1185, 0.6, 0],
    [born + 0.2, 540, 1185, 1, 1],
    [S(6).start, 540, 1185, 1, 1],
    [S(6).start + 0.6, 540, 470, 1, 1],
    [S(8).start, 540, 470, 1, 1],
    [S(8).start + 0.6, 540, 730, 1.15, 1],
    [W(9, "codigo") - 0.1, 540, 730, 1.15, 1],
    [W(9, "codigo") + 0.5, tree.x, tree.y, 0.45, 0],
  ];
  const col = (i: number) => kf(t, keys.map((k) => [k[0], k[i]] as [number, number]));
  // rename: erase old name, type new one
  const r0 = W(7, "nombres");
  const oldN = "FUN_00401a30", newN = "validate_license";
  let label = oldN;
  if (t > r0 - 0.1) {
    const e = clamp01((t - (r0 - 0.1)) / 0.25), w = clamp01((t - (r0 + 0.15)) / 0.45);
    label = w > 0 ? newN.slice(0, Math.round(w * newN.length)) : oldN.slice(0, Math.round((1 - e) * oldN.length));
  }
  const renamed = t > r0 + 0.6;
  const pulse = inScene(t, 8, 0) && t > W(8, "corre") ? 0.5 + 0.5 * Math.sin((t - W(8, "corre")) * 9) : 0;
  const color = renamed ? C.green : C.amber;
  return (
    <At x={col(1)} y={col(2)} s={col(3)} o={col(4)} z={6}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, color: C.text, padding: "18px 30px", borderRadius: 18, background: C.panel2, border: `3px solid ${color}`, boxShadow: `0 0 ${30 + pulse * 40}px color-mix(in srgb, ${color} ${40 + pulse * 40}%, transparent)`, whiteSpace: "nowrap" }}>
        {label}<span style={{ color: C.dim }}>()</span>
      </div>
    </At>
  );
};

/* ───────────── scene 1: hook ───────────── */
export const Scene1: React.FC<P> = ({ t }) => {
  const a = sceneAlpha(t, 1, 0.01, 0.3);
  const src = pop(t, W(1, "aunque"));
  const cross = ease(t, W(1, "fuente"), 0.35);
  const qk = pop(t, W(1, "codigo"));
  return (
    <div style={{ opacity: a }}>
      <At x={540} y={360} s={mix(0.6, 1, qk)} o={clamp01(qk)}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: C.mono ? 78 : 96, color: C.text, letterSpacing: C.mono ? -4 : -2, whiteSpace: "nowrap" }}>{L(<>¿Sin código <span style={{ color: C.amber }}>fuente</span>?</>, <>No <span style={{ color: C.amber }}>source</span> code?</>)}</div>
      </At>
      <Panel b={{ x: 90, y: 560, w: 900, h: 540 }} title="terminal">
        <div style={{ padding: "28px 30px", fontFamily: MONO, fontSize: 34, color: C.green }}>
          ›<span style={{ opacity: Math.floor(t * 2.5) % 2 ? 1 : 0, color: C.text }}> ▍</span>
        </div>
      </Panel>
      <At x={540} y={1210} s={mix(0.5, 1, src)} o={clamp01(src)}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 18, fontFamily: MONO, fontSize: 42, color: C.dim }}>
          <svg width="70" height="56" viewBox="0 0 70 56"><path d="M4 10 Q4 4 10 4 H26 L32 12 H60 Q66 12 66 18 V48 Q66 52 60 52 H10 Q4 52 4 46 Z" fill="none" stroke={C.dim} strokeWidth="4" /></svg>
          src/
          <div style={{ position: "absolute", left: -10, top: "50%", height: 7, width: `${cross * 210}px`, background: C.red, borderRadius: 4, transform: "rotate(-8deg)" }} />
        </div>
      </At>
    </div>
  );
};

/* ───────────── scene 2: bytes, at scale ───────────── */
const HEX_HEAD = "4D 5A 90 00 03 00 00 00 04 00 00 00 FF FF 00 00 B8 00 00 00 00 00 00 00 40 00 00 00 00 00 00 00".split(" ");
const hexAt = (i: number) => (i < HEX_HEAD.length ? HEX_HEAD[i] : ((i * 2654435761) >>> 24).toString(16).toUpperCase().padStart(2, "0"));

export const Scene2: React.FC<P> = ({ t }) => {
  const a = sceneAlpha(t, 2, 0.2, 0.3);
  const zoom = ease(t, W(2, "millones"), 1.3, 0.05);
  const count = Math.round(5_000_000 * ease(t, W(2, "millones"), 1.4, 0));
  const near = { w: 900, h: 560 };
  const s = mix(1, 0.075, zoom);
  const you = pop(t, W(2, "vos")), ai = pop(t, W(2, "ia"));
  return (
    <div style={{ opacity: a }}>
      <StepTitle t={t} at={W(2, "millones")} title={L("Millones de bytes", "Millions of bytes")} />
      <At x={540} y={455} o={clamp01(zoom * 2)}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 46, color: C.amber }}>{count.toLocaleString(L("es-AR", "en-US"))} bytes</div>
      </At>
      {/* far view: a sea of bytes */}
      <div style={{ position: "absolute", left: 60, top: 520, width: 960, height: 700, opacity: zoom, borderRadius: 20, border: `2px solid ${C.line}`, backgroundImage: `radial-gradient(${C.dim} 1.4px, transparent 1.6px)`, backgroundSize: "9px 9px" }} />
      {/* near view: the first bytes of the file (real PE/MZ header) */}
      <At x={540} y={870} s={s}>
        <div style={{ width: near.w, height: near.h, borderRadius: 24, background: C.panel, border: `${mix(2, 26, zoom)}px solid ${zoom > 0.3 ? C.amber : C.line}`, padding: 34, boxSizing: "border-box", display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "10px 0", fontFamily: MONO, fontSize: 44, color: C.text }}>
          {Array.from({ length: 80 }, (_, i) => (
            <span key={i} style={{ color: i < 2 ? C.amber : i < 16 ? C.text : C.dim }}>{hexAt(i)}</span>
          ))}
        </div>
      </At>
      <At x={360} y={1150} s={you} o={clamp01(you)}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: C.panel, padding: "12px 22px", borderRadius: 20, border: `2px solid ${C.line}` }}>
          <svg width="56" height="60" viewBox="0 0 56 60"><circle cx="28" cy="16" r="12" fill={C.text} /><path d="M4 58 Q4 32 28 32 Q52 32 52 58 Z" fill={C.text} /></svg>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, color: C.red }}>?</span>
        </div>
      </At>
      <At x={720} y={1150} s={ai} o={clamp01(ai)}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: C.panel, padding: "12px 22px", borderRadius: 20, border: `2px solid ${C.line}` }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 38, color: C.ink, background: C.purple, borderRadius: 14, padding: "6px 14px" }}>{L("IA", "AI")}</div>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, color: C.red }}>?</span>
        </div>
      </At>
    </div>
  );
};

/* ───────────── scene 3: what REA is ───────────── */
export const Scene3: React.FC<P> = ({ t }) => {
  const a = sceneAlpha(t, 3, 0.25, 0.3);
  const rea = pop(t, W(3, "rea"));
  const l1 = ease(t, W(3, "servidor"), 0.5), l2 = ease(t, W(3, "mcp"), 0.5);
  const tools = ease(t, W(3, "200"), 1.1, 0.05);
  const engines = ["Ghidra", "IDA", "Hopper", "JADX"].map((n) => ({ n, k: pop(t, W(3, n)) }));
  const ex = [160, 400, 650, 905];
  return (
    <div style={{ opacity: a }}>
      <At x={540} y={350} o={clamp01(tools * 3)}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 74, color: C.text, whiteSpace: "nowrap" }}>
          <span style={{ color: C.amber }}>{Math.round(207 * tools)}</span> {L("herramientas", "tools")}
        </div>
      </At>
      <Stroke d="M 300 640 L 450 640" k={l1} color={C.dim} />
      <Stroke d="M 630 640 L 760 640" k={l2} color={C.dim} />
      <At x={190} y={640}><Node label="Claude" color={C.purple} /></At>
      <At x={540} y={640} s={pop(t, W(3, "mcp"))} o={clamp01(l1 * 3)}><Chip label="MCP" color={C.cyan} /></At>
      <At x={880} y={640} s={rea} o={clamp01(rea)}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 80, letterSpacing: 4, color: C.ink, background: C.amber, borderRadius: 24, padding: "10px 34px" }}>REA</div>
      </At>
      {/* 207 tools, one dot each, to show the scale */}
      <div style={{ position: "absolute", left: 540 - 299, top: 770, width: 598, display: "grid", gridTemplateColumns: "repeat(23, 1fr)", gap: 12 }}>
        {Array.from({ length: 207 }, (_, i) => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: i < tools * 207 ? C.amber : C.line, transform: `scale(${i < tools * 207 ? 1 : 0.6})` }} />
        ))}
      </div>
      {engines.map(({ n, k }, i) => (
        <React.Fragment key={n}>
          <Stroke d={`M 540 1040 L ${ex[i]} 1110`} k={ease(t, W(3, n), 0.3, 0.2)} color={C.cyan} width={4} />
          <At x={ex[i]} y={1160} s={k} o={clamp01(k)}><Node label={n} size={32} /></At>
        </React.Fragment>
      ))}
    </div>
  );
};

/* ───────────── scene 4: step 1 identify ───────────── */
const BADGES = ["PE", "ELF", "Mach-O", "APK", "ASAR", ".NET", "Firmware"];
export const Scene4: React.FC<P> = ({ t }) => {
  const a = sceneAlpha(t, 4);
  const scanOn = t > W(4, "open_binary") - 0.1 && t < W(4, "motor") + 0.2;
  const scanY = 520 + ((t * 300) % 240);
  const lanes = [
    { from: L("Nativo", "Native"), to: "Ghidra · IDA · Hopper", at: W(4, "nativo"), badge: "PE" },
    { from: "Android", to: "JADX", at: W(4, "android"), badge: "APK" },
    { from: "Firmware", to: "Binwalk", at: W(4, "firmware"), badge: "Firmware" },
    { from: "Electron", to: "JavaScript", at: W(4, "electron"), badge: "ASAR" },
  ];
  const lit = (b: string) => Math.max(b === "PE" ? ease(t, W(4, "tipo"), 0.3) * (t < W(4, "android") - 0.2 ? 1 : 0.35) : 0,
    ...lanes.filter((l) => l.badge === b && b !== "PE").map((l) => ease(t, l.at, 0.3) * (1 - ease(t, l.at + 1.6, 0.4) * 0.65)));
  return (
    <div style={{ opacity: a }}>
      <StepTitle t={t} at={S(4).start + 0.15} n="1" title={L("Identificar", "Identify")} tool="open_binary()" toolAt={W(4, "open_binary")} />
      {/* scanner frame */}
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080} height={1920}>
        {[[390, 500, 1, 1], [690, 500, -1, 1], [390, 780, 1, -1], [690, 780, -1, -1]].map(([x, y, dx, dy], i) => (
          <path key={i} d={`M ${x} ${y + 50 * dy} L ${x} ${y} L ${x + 50 * dx} ${y}`} fill="none" stroke={C.cyan} strokeWidth="6" />
        ))}
        {scanOn && <rect x={400} y={scanY} width={280} height={5} fill={C.cyan} opacity={0.9} />}
      </svg>
      {/* format badges */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 820, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
        {BADGES.map((b, i) => {
          const k = pop(t, W(4, "reconoce") + i * 0.13, 0.35);
          return <div key={b} style={{ transform: `scale(${k})`, opacity: clamp01(k) }}><Chip label={b} color={C.amber} lit={lit(b)} size={30} pad="8px 18px" /></div>;
        })}
      </div>
      {/* engine routing lanes */}
      {lanes.map((l, i) => {
        const k = ease(t, l.at, 0.35);
        return (
          <div key={l.from} style={{ position: "absolute", left: 200, top: LANE_Y[i] - 32, width: 820, height: 64, display: "flex", alignItems: "center", gap: 18, opacity: mix(0.25, 1, k) }}>
            <div style={{ width: 200, fontFamily: SANS, fontWeight: 600, fontSize: 34, color: C.text }}>{l.from}</div>
            <div style={{ height: 4, width: 90 * k + 4, background: C.cyan, borderRadius: 2 }} />
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 32, color: k > 0.5 ? C.cyan : C.dim, whiteSpace: "nowrap" }}>{l.to}</div>
          </div>
        );
      })}
    </div>
  );
};

/* ───────────── scene 5: step 2 map ───────────── */
export const Scene5: React.FC<P> = ({ t }) => {
  const a = sceneAlpha(t, 5);
  const focus = ease(t, W(5, "license"), 0.35);
  const cols = [
    { title: "ARCH", x: 60, w: 250, at: W(5, "arquitectura"), rows: ["x86-64", "PE32+", "GUI"] },
    { title: "IMPORTS", x: 330, w: 300, at: W(5, "librerias"), rows: ["kernel32.dll", "user32.dll", "advapi32.dll", "bcrypt.dll"] },
    { title: "STRINGS", x: 650, w: 370, at: W(5, "textos"), rows: ["\"Welcome\"", "\"License invalid\"", "\"Trial expired\"", "\"Settings\""] },
  ];
  const arrow = ease(t, W(5, "referencias"), 0.6, 0.05);
  return (
    <div style={{ opacity: a }}>
      <StepTitle t={t} at={S(5).start + 0.15} n="2" title={L("Mapear", "Map")} tool="binary_overview()" toolAt={S(5).start + 0.6} />
      {cols.map((c) => {
        const k = pop(t, c.at, 0.4);
        return (
          <div key={c.title} style={{ position: "absolute", left: c.x, top: 520, width: c.w, height: 470, opacity: clamp01(k), transform: `translateY(${mix(30, 0, clamp01(k))}px)` }}>
            <Panel b={{ x: 0, y: 0, w: c.w, h: 470 }}>
              <div style={{ padding: "20px 20px", fontFamily: MONO }}>
                <div style={{ fontSize: 24, color: C.cyan, fontWeight: 700, letterSpacing: 2, marginBottom: 18 }}>{c.title}</div>
                {c.rows.map((r) => {
                  const hot = r.includes("License");
                  return (
                    <div key={r} style={{ fontSize: 28, lineHeight: "62px", whiteSpace: "nowrap", color: hot && focus > 0.5 ? C.ink : C.text, opacity: hot ? 1 : mix(1, 0.22, focus), background: hot ? `color-mix(in srgb, ${C.amber} ${focus * 100}%, transparent)` : "none", borderRadius: 10, padding: "0 8px", margin: "0 -8px" }}>{r}</div>
                  );
                })}
              </div>
            </Panel>
          </div>
        );
      })}
      <Stroke d="M 835 735 C 835 980, 640 980, 560 1120" k={arrow} color={C.amber} width={6} arrow />
      <At x={800} y={1050} o={arrow}><div style={{ fontFamily: MONO, fontSize: 28, color: C.amber }}>xrefs</div></At>
    </div>
  );
};

/* ───────────── scenes 6 + 7: shared code panel ───────────── */
const ASM = ["push  rbp", "mov   rbp, rsp", "call  FUN_00401f10", "test  eax, eax", "jne   0x401a62", "lea   rcx, [str_lic]", "call  show_error", "xor   eax, eax"];
const CSRC = (renamed: boolean, commented: boolean) => [
  `int ${renamed ? "validate_license" : "FUN_00401a30"}(char *key) {`,
  commented ? L("  // rechaza claves inválidas", "  // rejects invalid keys") : "",
  `  if (!${renamed ? "verify_signature" : "FUN_00401f10"}(key)) {`,
  `    show_error("License invalid");`,
  "    return 0;",
  "  }",
  "  return 1;",
  "}",
];
export const CodePanel: React.FC<P> = ({ t }) => {
  if (t < S(6).start - 0.3 || t > S(7).end + 0.3) return null;
  const a = clamp01((t - S(6).start) / 0.3) * clamp01((S(7).end - t) / 0.3);
  const m = W(6, "pseudocodigo");
  const renamed = t > W(7, "nombres") + 0.5;
  const commented = t > W(7, "comentarios") - 0.1;
  const c = CSRC(renamed, commented);
  return (
    <div style={{ opacity: a }}>
      <Panel b={{ x: 60, y: 560, w: 960, h: 450 }}>
        <div style={{ position: "absolute", right: 24, top: 18 }}>
          <Chip label={t > m ? "C" : "ASM"} color={t > m ? C.green : C.dim} lit={1} size={24} pad="4px 14px" />
        </div>
        <div style={{ padding: "22px 30px", fontFamily: MONO, fontSize: 31, lineHeight: "50px" }}>
          {ASM.map((line, i) => {
            const k = ease(t, m + i * 0.07, 0.3, 0);
            const cl = c[i];
            const isComment = cl.trim().startsWith("//");
            return (
              <div key={i} style={{ position: "relative", height: 50, whiteSpace: "pre" }}>
                <span style={{ position: "absolute", opacity: 1 - k, color: C.dim, transform: `translateX(${-30 * k}px)` }}>{line}</span>
                <span style={{ position: "absolute", opacity: k, color: isComment ? C.green : cl.includes("License") ? C.amber : C.text, transform: `translateX(${30 * (1 - k)}px)` }}>{cl}</span>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
};

export const Scene6: React.FC<P> = ({ t }) => {
  const a = sceneAlpha(t, 6);
  const g = W(6, "grafo");
  const nodes = [
    { l: "main", x: 150, y: 1170, at: g },
    { l: "FUN_00401a30", x: 470, y: 1170, at: g + 0.25, hot: true },
    { l: "FUN_00401f10", x: 860, y: 1100, at: g + 0.5 },
    { l: "show_error", x: 860, y: 1240, at: g + 0.7 },
  ];
  return (
    <div style={{ opacity: a }}>
      <StepTitle t={t} at={S(6).start + 0.15} n="3" title={L("Descompilar", "Decompile")} />
      <Stroke d="M 230 1170 L 330 1170" k={ease(t, g + 0.15, 0.3)} color={C.dim} width={4} arrow />
      <Stroke d="M 615 1160 L 715 1105" k={ease(t, g + 0.4, 0.3)} color={C.dim} width={4} arrow />
      <Stroke d="M 615 1185 L 725 1235" k={ease(t, g + 0.6, 0.3)} color={C.dim} width={4} arrow />
      {nodes.map((n) => {
        const k = pop(t, n.at, 0.35);
        return <At key={n.l} x={n.x} y={n.y} s={k} o={clamp01(k)}><Node label={n.l} size={26} color={n.hot ? C.amber : C.cyan} lit={n.hot ? 1 : 0.3} /></At>;
      })}
    </div>
  );
};

/* ───────────── scene 7: step 4 understand ───────────── */
export const Scene7: React.FC<P> = ({ t }) => {
  const a = sceneAlpha(t, 7);
  const chips: { kind: "ok" | "maybe" | "unknown"; l: string; at: number; color: string }[] = [
    { kind: "ok", l: L("observado", "observed"), at: W(7, "vio"), color: C.green },
    { kind: "maybe", l: L("inferido", "inferred"), at: W(7, "deduce"), color: C.amber },
    { kind: "unknown", l: L("desconocido", "unknown"), at: W(7, "sabe"), color: C.dim },
  ];
  const ev = pop(t, W(7, "evidence"));
  return (
    <div style={{ opacity: a }}>
      <StepTitle t={t} at={S(7).start + 0.15} n="4" title={L("Entender", "Understand")} />
      <At x={190} y={1090} s={ev} o={clamp01(ev)}><div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.cyan }}>evidence_id</div></At>
      <div style={{ position: "absolute", left: 340, top: 1040, display: "flex", flexDirection: "column", gap: 14 }}>
        {chips.map((c) => {
          const k = pop(t, c.at, 0.4);
          return (
            <div key={c.l} style={{ display: "flex", alignItems: "center", gap: 18, transform: `translateX(${mix(60, 0, clamp01(k))}px) scale(${mix(0.7, 1, clamp01(k))})`, transformOrigin: "left center", opacity: clamp01(k) }}>
              <Glyph kind={c.kind} size={58} />
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, color: c.color }}>{c.l}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ───────────── scene 8: runtime ───────────── */
export const Scene8: React.FC<P> = ({ t }) => {
  const a = sceneAlpha(t, 8);
  const run = ease(t, W(8, "corre"), 0.4);
  const probes = [
    { l: "Frida", x: 230, at: W(8, "frida") },
    { l: "GDB", x: 540, at: W(8, "gdb") },
    { l: L("Navegador", "Browser"), x: 850, at: W(8, "navegador") },
  ];
  const beat = Array.from({ length: 60 }, (_, i) => {
    const x = 170 + i * 12.4;
    const ph = (i * 0.35 - t * 7) % 6.28;
    const spike = Math.abs(((i + Math.floor(t * 20)) % 20) - 10) < 1 ? -45 : 0;
    return `${x},${905 + Math.sin(ph) * 6 * run + spike * run}`;
  }).join(" ");
  return (
    <div style={{ opacity: a }}>
      <StepTitle t={t} at={S(8).start + 0.15} title={L("En ejecución", "Running")} />
      <Panel b={{ x: 140, y: 560, w: 800, h: 410 }} accent={run > 0.5 ? C.green : C.line} title="app.exe" />
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080} height={1920}>
        <polyline points={beat} fill="none" stroke={C.green} strokeWidth="5" opacity={run} />
      </svg>
      {probes.map((p) => {
        const k = pop(t, p.at, 0.35);
        return (
          <React.Fragment key={p.l}>
            <Stroke d={`M ${p.x} 1110 L ${p.x} 975`} k={ease(t, p.at + 0.1, 0.3)} color={C.cyan} width={5} />
            <At x={p.x} y={1160} s={k} o={clamp01(k)}><Node label={p.l} size={32} /></At>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ───────────── scene 9: step 5 rebuild ───────────── */
const TREE = [L("proyecto/", "project/"), "├─ src/", "│  ├─ main.c", "│  └─ license.c", "├─ tests/", "└─ Makefile"];
export const Scene9: React.FC<P> = ({ t }) => {
  const a = sceneAlpha(t, 9);
  const f = W(9, "codigo");
  const v = W(9, "verifica");
  const done = pop(t, W(9, "documento"), 0.5);
  return (
    <div style={{ opacity: a }}>
      <StepTitle t={t} at={S(9).start + 0.15} n="5" title={L("Reconstruir", "Rebuild")} />
      <Panel b={{ x: 120, y: 500, w: 840, h: 400 }}>
        <div style={{ padding: "26px 40px", fontFamily: MONO, fontSize: 36, lineHeight: "58px", whiteSpace: "pre" }}>
          {TREE.map((l, i) => {
            const k = ease(t, f - 0.4 + i * 0.12, 0.3, 0);
            const hot = l.includes("license.c");
            const landed = ease(t, f + 0.45, 0.3, 0);
            return <div key={l} style={{ opacity: k, color: hot ? (landed > 0.5 ? C.green : C.text) : l.endsWith("/") ? C.cyan : C.text, fontWeight: hot ? 700 : 400 }}>{l}</div>;
          })}
        </div>
      </Panel>
      <div style={{ position: "absolute", left: 120, top: 935, display: "flex", flexDirection: "column", gap: 16 }}>
        {[0, 1, 2].map((i) => {
          const k = clamp01((t - (v + i * 0.45)) / 0.5);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, opacity: t > v - 0.6 ? 1 : 0 }}>
              <div style={{ width: 56, height: 56 }}>{k > 0 ? <Check k={k} /> : <div style={{ width: 52, height: 52, borderRadius: 26, border: `3px solid ${C.line}` }} />}</div>
              <div style={{ height: 18, width: [420, 360, 480][i], borderRadius: 9, background: k > 0.5 ? C.green : C.line, opacity: 0.8 }} />
            </div>
          );
        })}
      </div>
      <At x={540} y={1250} s={done} o={clamp01(done)}>
        <Chip label="verify_reconstruction ✓" color={C.green} size={36} />
      </At>
    </div>
  );
};

/* ───────────── scene 10: step 6 modify ───────────── */
const EDIT = [
  "int validate_license(char *key) {",
  L("  // rechaza claves inválidas", "  // rejects invalid keys"),
  "  if (!verify_signature(key)) {",
  "    show_error(\"License invalid\");",
  "    return 0;",
  "  }",
  "  return 1;",
  "}",
];
export const Scene10: React.FC<P> = ({ t }) => {
  const a = sceneAlpha(t, 10);
  const ed = W(10, "modificar");
  const add = "    log_attempt(key);";
  const typed = add.slice(0, Math.round(clamp01((t - ed + 0.1) / 0.8) * add.length));
  const build = clamp01((t - W(10, "compilar") + 0.1) / 0.6);
  const tests = W(10, "testear");
  return (
    <div style={{ opacity: a }}>
      <StepTitle t={t} at={S(10).start + 0.15} n="6" title={L("Modificar", "Modify")} />
      <Panel b={{ x: 60, y: 500, w: 960, h: 510 }} title="license.c">
        <div style={{ padding: "16px 28px", fontFamily: MONO, fontSize: 30, lineHeight: "46px", whiteSpace: "pre" }}>
          {EDIT.slice(0, 4).map((l, i) => <div key={i} style={{ color: l.includes("//") ? C.green : C.text }}>{l}</div>)}
          {t > ed - 0.2 && (
            <div style={{ background: `color-mix(in srgb, ${C.green} 22%, transparent)`, color: C.green, margin: "0 -28px", padding: "0 28px" }}>
              {typed}<span style={{ opacity: Math.floor(t * 3) % 2 ? 1 : 0 }}>▍</span>
            </div>
          )}
          {EDIT.slice(4).map((l, i) => <div key={i} style={{ color: C.text }}>{l}</div>)}
        </div>
      </Panel>
      <div style={{ position: "absolute", left: 60, top: 1060, width: 960, display: "flex", alignItems: "center", gap: 24, opacity: t > W(10, "compilar") - 0.3 ? 1 : 0 }}>
        <div style={{ fontFamily: MONO, fontSize: 32, color: C.text, width: 130 }}>build</div>
        <div style={{ flex: 1, height: 26, borderRadius: 13, background: C.line, overflow: "hidden" }}>
          <div style={{ width: `${build * 100}%`, height: "100%", background: C.cyan }} />
        </div>
        <div style={{ width: 56 }}>{build >= 1 && <Check k={clamp01((t - W(10, "compilar") - 0.5) / 0.4)} />}</div>
      </div>
      <div style={{ position: "absolute", left: 60, top: 1150, display: "flex", alignItems: "center", gap: 18, opacity: t > tests - 0.3 ? 1 : 0 }}>
        <div style={{ fontFamily: MONO, fontSize: 32, color: C.text, width: 130 }}>tests</div>
        {[0, 1, 2, 3, 4].map((i) => {
          const k = clamp01((t - (tests + i * 0.12)) / 0.25);
          return <div key={i} style={{ width: 44, height: 44, borderRadius: 22, background: k > 0.5 ? C.green : C.line, transform: `scale(${mix(0.7, 1, k)})` }} />;
        })}
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, color: C.green, opacity: clamp01((t - tests - 0.6) / 0.3) }}>passed</div>
      </div>
    </div>
  );
};

/* ───────────── scene 11: recap + CTA ───────────── */
export const Scene11: React.FC<P> = ({ t }) => {
  const a = sceneAlpha(t, 11, 0.25, 0.01);
  const b = pop(t, W(11, "binario")), e = pop(t, W(11, "evidencia")), c = pop(t, W(11, "codigo"));
  const cta = pop(t, W(11, "seguime"));
  return (
    <div style={{ opacity: a }}>
      <At x={540} y={380}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 56, color: C.text, whiteSpace: "nowrap", display: "flex", gap: 14 }}>
          <span style={{ opacity: clamp01(b) }}>{L("Binario", "Binary")}</span>
          <span style={{ opacity: clamp01(e), color: C.amber }}>→ {L("evidencia", "evidence")}</span>
          <span style={{ opacity: clamp01(c), color: C.green }}>→ {L("código", "code")}</span>
        </div>
      </At>
      <Stroke d="M 330 760 L 420 760" k={ease(t, W(11, "evidencia"), 0.3, 0.25)} color={C.dim} width={5} arrow />
      <Stroke d="M 660 760 L 750 760" k={ease(t, W(11, "codigo"), 0.3, 0.25)} color={C.dim} width={5} arrow />
      <At x={540} y={760} s={e} o={clamp01(e)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 22, borderRadius: 22, background: C.panel2, border: `3px solid ${C.amber}` }}>
          <Glyph kind="ok" size={52} /><Glyph kind="maybe" size={52} /><Glyph kind="unknown" size={52} />
        </div>
      </At>
      <At x={870} y={760} s={c} o={clamp01(c)}>
        <FileCard name="license.c" color={C.green} glow={0.6} />
      </At>
      <At x={540} y={1000} o={ease(t, S(11).start + 0.3, 0.4)}>
        <div style={{ width: 900, textAlign: "center", fontFamily: SANS, fontSize: 30, lineHeight: 1.35, color: C.dim }}>
          {L(<>Es una reconstrucción, no el código original.<br />Usalo solo con software propio o autorizado.</>, <>A reconstruction, not the original code.<br />Only use it on software you own or may analyze.</>)}
        </div>
      </At>
      <At x={540} y={1185} s={cta} o={clamp01(cta)}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, letterSpacing: 3, color: C.text, whiteSpace: "nowrap" }}>{L("DEBAJO DEL PROMPT", "UNDER THE PROMPT")}<span style={{ color: C.amber }}>_</span></div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: C.ink, background: C.amber, borderRadius: 40, padding: "10px 26px", whiteSpace: "nowrap" }}>{L("+ Seguir", "+ Follow")}</div>
        </div>
      </At>
    </div>
  );
};
