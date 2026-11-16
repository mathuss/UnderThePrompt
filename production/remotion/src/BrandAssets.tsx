/**
 * Channel identity drafts (logo / avatar / wordmark / banner), rendered as stills for review.
 * Palette and type come from brand/identity.md §4 ("Lamplight"). Proposals only, nothing here is final.
 *   npx remotion still src/index.ts Logo-Eyespot out.png      (and the other ids registered in Root.tsx)
 */
import React, { useMemo } from "react";
import { AbsoluteFill, getInputProps, Img, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildMott, P } from "./brand/mott";
import { MONO, SANS, UI } from "./brand/ui";

/** The eyespot from Mott's wing: an amber ring, a dark centre and the "_" cursor bar. The channel's mark. */
export const Eyespot: React.FC<{ size: number; glow?: boolean }> = ({ size, glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs>
      <radialGradient id="esGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0.55" stopColor={UI.amber} stopOpacity="0.35" />
        <stop offset="1" stopColor={UI.amber} stopOpacity="0" />
      </radialGradient>
    </defs>
    {glow && <circle cx="50" cy="50" r="48" fill="url(#esGlow)" />}
    <circle cx="50" cy="50" r="33" fill={UI.amber} />
    <circle cx="50" cy="50" r="22.5" fill={UI.night} />
    <rect x="38" y="54" width="24" height="6" rx="1.2" fill={UI.amber} />
  </svg>
);

/** Avatar A: the eyespot mark alone on Night Ink. Reads at 98 px. */
export const LogoEyespot: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${UI.plum} 0%, ${UI.night} 70%)`, alignItems: "center", justifyContent: "center" }}>
    <Eyespot size={620} />
  </AbsoluteFill>
);

/** Avatar C: a terminal prompt ">_" (generic: many dev brands use it; kept as a comparison). */
export const LogoPrompt: React.FC = () => (
  <AbsoluteFill style={{ background: UI.night, alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 420, letterSpacing: -20, lineHeight: 1 }}>
      <span style={{ color: UI.cream }}>&gt;</span><span style={{ color: UI.amber, textShadow: `0 0 60px ${UI.amber}88` }}>_</span>
    </div>
  </AbsoluteFill>
);

/** Avatar B: Mott himself, rendered from the 3D model under the lamp. */
const MottHead: React.FC = () => {
  const { camera } = useThree();
  const w = useMemo(() => {
    const g = new THREE.Group();
    const mott = buildMott(); g.add(mott.root);
    g.add(new THREE.HemisphereLight(0x6a5bc0, P.night, 0.5 * Math.PI));
    const key = new THREE.PointLight(P.amber, 1.6 * Math.PI, 6, 1.3); key.position.set(-0.8, 1.6, 1.4); g.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.5 * Math.PI); fill.position.set(0.3, 1.0, 2.0); g.add(fill);
    const rim = new THREE.DirectionalLight(P.lilac, 1.4 * Math.PI); rim.position.set(1.2, 1.4, -1.5); g.add(rim);
    mott.pose(0.4, [[0, "excited"]], { intensity: 0.9 }); // wings open, so the amber eyespots frame him
    return g;
  }, []);
  camera.position.set(0.0, 0.8, 2.05); (camera as THREE.PerspectiveCamera).fov = 30; (camera as THREE.PerspectiveCamera).updateProjectionMatrix(); camera.lookAt(0, 0.62, 0);
  return (<><color attach="background" args={[P.night]} /><primitive object={w} /></>);
};
export const LogoMott: React.FC = () => (
  <AbsoluteFill style={{ background: UI.night }}>
    <ThreeCanvas width={800} height={800} flat camera={{ fov: 30, near: 0.01, far: 20 }} gl={{ antialias: true }}><MottHead /></ThreeCanvas>
  </AbsoluteFill>
);

/** Wordmark: the name in JetBrains Mono with the amber cursor. lang = "en" | "es" via --props. */
const NAME = { en: "UNDER THE PROMPT", es: "DEBAJO DEL PROMPT" } as const;
export const Wordmark: React.FC = () => {
  const lang = ((getInputProps() as { lang?: "en" | "es" }).lang ?? "en");
  return (
    <AbsoluteFill style={{ background: UI.night, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 60 }}>
      <Eyespot size={260} />
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 110, letterSpacing: 14, color: UI.cream, whiteSpace: "nowrap" }}>
        {NAME[lang]}<span style={{ color: UI.amber }}>_</span>
      </div>
    </AbsoluteFill>
  );
};

/** YouTube banner (2560×1440). Everything that matters sits inside the 1546×423 centre safe area (outlined in the review render). */
const TAG = { en: "What's really under the hood of tech.", es: "Lo que de verdad hay debajo de la tecnología." } as const;
export const Banner: React.FC = () => {
  const { lang = "en", guides = true } = getInputProps() as { lang?: "en" | "es"; guides?: boolean };
  const rnd = (i: number) => ((Math.sin(i * 127.1) * 43758.5453) % 1 + 1) % 1;
  const buildings = Array.from({ length: 34 }, (_, i) => ({ x: i * 78 + rnd(i) * 20, w: 60 + rnd(i + 50) * 60, h: 160 + rnd(i + 99) * 360 }));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #0a0814 0%, #1a1330 70%, #2a1a3a 100%)` }}>
      <svg width={2560} height={1440} style={{ position: "absolute", inset: 0 }}>
        {buildings.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={1440 - b.h} width={b.w} height={b.h} fill={i % 2 ? "#0d0b16" : "#110e1d"} />
            {Array.from({ length: Math.floor(b.h / 26) }, (_, r) => Array.from({ length: Math.floor(b.w / 18) }, (_, c) => rnd(i * 97 + r * 13 + c) > 0.74 && (
              <rect key={`${r}-${c}`} x={b.x + 6 + c * 18} y={1440 - b.h + 12 + r * 26} width={7} height={11} fill={rnd(i + r + c * 3) > 0.35 ? "rgba(255,190,110,.5)" : "rgba(168,228,255,.4)"} />
            )))}
          </g>
        ))}
        <rect x={0} y={0} width={2560} height={1440} fill="url(#vig)" />
        <defs><radialGradient id="vig" cx="50%" cy="50%" r="70%"><stop offset="0.4" stopColor="#0E0B14" stopOpacity="0.2" /><stop offset="1" stopColor="#0E0B14" stopOpacity="0.85" /></radialGradient></defs>
      </svg>
      <div style={{ position: "absolute", left: 507, top: 508, width: 1546, height: 423, display: "flex", alignItems: "center", justifyContent: "center", gap: 56 }}>
        <Eyespot size={250} />
        <div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 92, letterSpacing: 10, color: UI.cream, whiteSpace: "nowrap" }}>{NAME[lang]}<span style={{ color: UI.amber }}>_</span></div>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 44, color: UI.lilac, marginTop: 14 }}>{TAG[lang]}</div>
        </div>
      </div>
      {guides && <div style={{ position: "absolute", left: 507, top: 508, width: 1546, height: 423, border: "4px dashed rgba(255,90,110,.8)" }} />}
    </AbsoluteFill>
  );
};

/**
 * Episode cover (1080×1920): the brand on top, and under it what the episode is about (a skill, a tool, a topic).
 * Props: { bg: "covers/<file>.jpg" (a clean frame of the episode), kicker: "SKILL PARA CLAUDE CODE", topic: "grill-me" }.
 * Text sits in the upper middle: clear of the platforms' top bar and of the buttons and caption at the bottom.
 */
export const Cover: React.FC = () => {
  const { bg = "covers/utp2611050601_bg.jpg", kicker = "SKILL PARA CLAUDE CODE", topic = "grill-me", brand = "DEBAJO DEL PROMPT" } =
    getInputProps() as { bg?: string; kicker?: string; topic?: string; brand?: string };
  return (
    <AbsoluteFill style={{ background: UI.night }}>
      {/* the frame is pushed down so the characters sit in the lower half, under the text */}
      <Img src={staticFile(bg)} style={{ position: "absolute", left: 0, top: 330, width: "100%", height: "100%", objectFit: "cover" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(14,11,20,1) 0%, rgba(14,11,20,1) 30%, rgba(14,11,20,.85) 42%, rgba(14,11,20,.2) 55%, rgba(14,11,20,0) 62%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Eyespot size={92} />
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 58, letterSpacing: 6, color: UI.cream, whiteSpace: "nowrap" }}>{brand}<span style={{ color: UI.amber }}>_</span></div>
        </div>
        <div style={{ width: 760, height: 3, background: "rgba(255,241,214,.18)", margin: "56px 0 50px" }} />
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, letterSpacing: 5, color: UI.lilac }}>{kicker}</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 170, lineHeight: 1.05, color: UI.amber, marginTop: 18, textShadow: `0 0 50px ${UI.amber}55` }}>{topic}</div>
      </div>
    </AbsoluteFill>
  );
};
