/**
 * UTP-000 "The first *actual* bug": pilot episode (storyboard: production/UTP-000-moth/storyboard.md).
 * Each storyboard shot is one narration scene in the timeline; everything is keyed to sync words.
 */
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildMott, P, Track } from "../brand/mott";
import { buildLampDesk } from "../brand/lampDesk";
import { buildMachineRoom, HERO } from "../brand/sets/machineRoom";
import { buildLogbook } from "../brand/sets/logbook";
import { makeSync, ramp, lerp, lerp3, smooth, clamp01, Timeline } from "../brand/sync";
import { ProgressBar, BrandLine, CaptionPill, Card, Tag, Blink, EndCard, UI, MONO } from "../brand/ui";
import tlJson from "../data/utp000_en.json";
import envJson from "../data/utp000_en_env.json";

const TL = tlJson as unknown as Timeline;
const ENV = (envJson as { env: number[] }).env;
const { W, S, shotAt, chunks, duration } = makeSync(TL);
export const EP000_DURATION = duration + 1.6; // room for the lamp tap + end card

const SET_OF: Record<number, "lamp" | "machine" | "book"> = { 1: "lamp", 2: "lamp", 3: "machine", 4: "machine", 5: "machine", 6: "machine",
  7: "book", 8: "book", 9: "book", 10: "book", 11: "book", 12: "book", 13: "lamp", 14: "lamp" };

/* ───────────── timing anchors ───────────── */
const A = {
  tapAt: W(14, "light", 0, "end") + 0.55,   // Mott reaches the lamp and taps it
};
const END_AT = A.tapAt + 0.45;              // lamp blinks off → end card

const TRACK: Track = [
  [0, "shocked"], [W(1, "computer"), "curious"],
  [S(2).start, "smug"],
  [S(3).start, "curious"],
  [S(5).start, "worried"],
  [W(6, "found"), "shocked"], [W(6, "moth"), "sad"],
  [S(7).start, "curious"], [W(7, "wrote"), "smug"],
  [S(8).start, "excited"], [W(8, "1878"), "curious"],
  [S(9).start, "smug"],
  [S(10).start, "curious"], [W(10, "check"), "skeptical"], [W(10, "team"), "neutral"],
  [S(11).start, "curious"], [W(11, "wings"), "excited"],
  [S(12).start, "neutral"], [W(12, "moth"), "smug"],
  [S(13).start, "neutral"], [W(13, "family"), "smug"],
  [S(14).start, "curious"], [A.tapAt - 0.3, "excited"],
];

/** progress 0…1 inside a shot */
const u = (t: number, id: number) => clamp01((t - S(id).start) / (S(id).end - S(id).start));
type V3 = [number, number, number];
type Shot = { cam: V3; look: V3; fov?: number; mott: V3; rotY: number; fly?: number; point?: number; shield?: number; tap?: number; wobble?: number };

function shot(t: number): Shot {
  const id = shotAt(t);
  const k = smooth(u(t, id));
  switch (id) {
    case 1: return { cam: [0.05, 0.86, 2.0], look: [0, 0.8, 0], mott: [0, 0, 0], rotY: 0.12 };
    case 2: return { cam: lerp3([0, 0.82, 3.7], [0, 0.8, 3.0], k) as V3, look: [0, 0.7, 0], mott: [0, 0, 0], rotY: 0, point: ramp(t, W(2, "talk") - 0.3, 0.3) };
    case 3: return { cam: lerp3([0, 1.3, 9.5], [0.6, 4.6, 10.5], k) as V3, look: lerp3([0, 2.6, -4], [0, 3.4, -6], k) as V3,
      mott: lerp3([0.9, 2.3, 7.4], [0.3, 3.0, 0.8], k) as V3, rotY: 2.4, fly: 1, wobble: 1 };
    case 4: return { cam: [-2.0, 4.1, -3.2], look: [1.1, 3.75, -6.2], fov: 30, mott: [1.25, 3.42, -6.0], rotY: -0.88 };
    case 5: {
      const m = lerp3([-1.0, 3.5, 0.6], [0.35, 3.1, -5.2], k) as V3;
      return { cam: [m[0] + 3.0, m[1] + 0.7, m[2] + 3.3], look: [m[0], m[1] + 0.6, m[2]], mott: m, rotY: 2.6, fly: 1, wobble: 1 };
    }
    case 6: return { cam: [-1.5, 3.9, -3.3], look: [0.7, 3.2, -6.6], fov: 32, mott: [0.2, 2.7, -6.6], rotY: -0.48, fly: 0.2, shield: ramp(t, W(6, "moth"), 0.35) };
    case 7: return { cam: lerp3([1.4, 12, 2.2], [1.3, 5.4, 3.8], k) as V3, look: lerp3([1.4, 0, -0.2], [1.7, 0.3, -0.2], k) as V3, mott: [0.9, 0.22, 0.95], rotY: 0.35 };
    case 8: {
      const a = lerp(-0.4, 0.12, k);
      return { cam: [0.9 + 3.1 * Math.sin(a), 1.3, 0.95 + 3.1 * Math.cos(a)], look: [0.9, 0.85, 0.95], mott: [0.9, 0.22, 0.95], rotY: a * 0.5, point: ramp(t, W(8, "1878") - 0.3, 0.3) * (1 - ramp(t, S(8).end - 0.4, 0.3)) };
    }
    case 9: return { cam: [1.1, 1.1, 2.95], look: [0.9, 0.97, 0.95], mott: [0.9, 0.22, 0.95], rotY: 0.1 };
    case 10: {
      const lean = ramp(t, S(10).start + 0.15, 0.6) * (1 - ramp(t, W(10, "check") - 0.1, 0.4)); // Light Lean: drawn to the glowing card, catches itself
      return { cam: lerp3([0.9, 1.1, 3.7], [0.9, 1.02, 2.7], k) as V3, look: [0.9, 0.95, 0.95], mott: [0.9, 0.22 + lean * 0.25, 0.95 + lean * 0.45], rotY: 0, fly: lean };
    }
    case 11: return { cam: lerp3([1.0, 2.7, 4.3], [1.0, 7.8, 8.4], k) as V3, look: lerp3([0.9, 1.3, 0.3], [1.0, 0.3, -0.4], k) as V3, mott: [0.9, 1.75, 0.75], rotY: 0.2, fly: 1, wobble: 0.6 };
    case 12: {
      const land = smooth((t - S(12).start) / 2.2);
      return { cam: lerp3([2.4, 2.9, 3.6], [2.35, 2.1, 2.7], k) as V3, look: [2.3, 0.45, 0.1], mott: lerp3([1.2, 1.6, 1.4], [2.2, 0.235, 1.05], land) as V3, rotY: lerp(0.2, 0.3, land), fly: 1 - land };
    }
    case 13: return { cam: [0.45, 0.8, 3.1], look: [0, 0.64, 0], mott: [0, 0, 0], rotY: 0.15 };
    default: { // 14: sign-off, then flies up and taps the lamp
      const go = smooth((t - (W(14, "light", 0, "end") + 0.05)) / 0.5);
      return { cam: lerp3([0, 0.88, 2.3], [-0.15, 1.15, 3.9], k) as V3, look: lerp3([0, 0.8, 0], [-0.2, 1.0, 0], k) as V3,
        mott: lerp3([0, 0, 0], [-0.22, 0.86, 0.3], go) as V3, rotY: lerp(0, -0.3, go), fly: go, tap: ramp(t, A.tapAt - 0.15, 0.15) };
    }
  }
}

const Scene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const { camera } = useThree();
  const w = useMemo(() => {
    const mott = buildMott(), lamp = buildLampDesk(), machine = buildMachineRoom(), book = buildLogbook();
    const holder = new THREE.Group(); holder.add(mott.root);
    return { mott, lamp, machine, book, holder };
  }, []);
  const id = shotAt(t), set = SET_OF[id], s = shot(t);

  // camera (+ soft flutter-cam while following a flight)
  const wb = s.wobble ?? 0;
  camera.position.set(s.cam[0] + Math.sin(t * 2.1) * 0.05 * wb, s.cam[1] + Math.sin(t * 2.9 + 1) * 0.04 * wb, s.cam[2]);
  (camera as THREE.PerspectiveCamera).fov = s.fov ?? 32;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  camera.lookAt(s.look[0], s.look[1], s.look[2]);

  // sets
  w.lamp.group.visible = set === "lamp"; w.machine.group.visible = set === "machine"; w.book.group.visible = set === "book";
  const lampBlink = t > END_AT - 0.05 ? 1 : 0;
  w.lamp.update(t, lampBlink);
  w.machine.update(t, {
    on: set === "machine" ? ramp(t, S(3).start, 1.6) : 1,
    fault: id >= 5 ? ramp(t, W(5, "wrong"), 0.8) : 0,
    click: id === 4 ? (Math.floor((t - W(4, "click")) * 2.6) % 2 === 0 && t > W(4, "click") ? 1 : 0) : 0,
    found: id === 6 ? ramp(t, W(6, "found"), 0.3) : 0,
  });
  w.book.update(t, { photo: id >= 7 ? ramp(t, S(7).start + 0.4, 0.5) : 0, tape: id >= 7 ? ramp(t, W(7, "taped"), 0.7) : 0 });

  // Mott
  w.holder.position.set(...s.mott);
  w.holder.rotation.y = s.rotY;
  const talk = ENV[Math.min(frame, ENV.length - 1)] ?? 0;
  w.mott.pose(t, TRACK, { talk, fly: s.fly ?? 0, point: s.point ?? 0, shield: s.shield ?? 0, tap: s.tap ?? 0 });

  return (
    <>
      <color attach="background" args={[P.night]} />
      <fog attach="fog" args={[P.night, set === "machine" ? 8 : 3.6, set === "machine" ? 26 : set === "book" ? 16 : 9]} />
      <primitive object={w.lamp.group} />
      <primitive object={w.machine.group} />
      <primitive object={w.book.group} />
      <primitive object={w.holder} />
    </>
  );
};

export const Episode000: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const id = shotAt(t);
  return (
    <AbsoluteFill style={{ background: UI.night }}>
      <ThreeCanvas width={width} height={height} shadows flat camera={{ fov: 32, near: 0.05, far: 80 }}
        gl={{ antialias: true }} onCreated={({ gl }) => { gl.shadowMap.type = THREE.PCFSoftShadowMap; }}>
        <Scene t={t} frame={frame} />
      </ThreeCanvas>

      {/* evidence cards */}
      <Card t={t} at={W(1, "1947") - 0.1} out={S(1).end - 0.1} x={540} y={330} w={420} tab="▍_ night log" title="1947" big />
      <Card t={t} at={W(3, "harvard")} out={S(3).end - 0.15} x={540} y={300} w={720} title="Harvard Mark II" sub="Electromechanical relay computer" source="Computer History Museum" />
      <Card t={t} at={W(4, "click")} out={S(4).end - 0.1} x={540} y={300} w={520} tone="ice" title="click = 1 · 0" sub="A relay is a switch" />
      <Card t={t} at={W(5, "wrong")} out={W(5, "relay") - 0.05} x={540} y={300} w={620} tone="coral" title="wrong answers" />
      <Card t={t} at={W(5, "relay")} out={S(6).end - 0.1} x={540} y={300} w={620} title="Panel F · Relay #70" source="Smithsonian NMAH" typed />
      <Card t={t} at={W(7, "first")} out={S(7).end - 0.1} x={540} y={290} w={880} tone="ice" tab="▍_ logbook · 1947-09-09"
        title={"“First actual case of bug being found.”"} source="Smithsonian NMAH · Computer History Museum" />
      <Card t={t} at={W(8, "edison") - 0.1} out={S(8).end - 0.1} x={540} y={300} w={760} tone="ice" title="bug (n.) — Edison, 1878" sub="Engineers' slang before computers" source="IEEE Spectrum" typed />
      <Card t={t} at={S(9).start} out={S(9).end - 0.1} x={540} y={300} w={760} title="1878 → 1947">
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontFamily: MONO, fontSize: 30 }}>
          <span style={{ color: UI.cream }}>“bug” (word)</span><span style={{ color: UI.amber, opacity: ramp(t, W(9, "actual"), 0.3) }}>bug (actual)</span>
        </div>
      </Card>
      <Card t={t} at={S(10).start + 0.1} out={W(10, "no") + 0.6} x={540} y={300} w={720} tone="coral" title="Hopper found the bug?" big crack={ramp(t, W(10, "no") - 0.1, 0.7)} />
      <Card t={t} at={W(10, "she")} out={S(10).end - 0.1} x={540} y={300} w={780} tone="ice" title="On the team · made it famous" source="Smithsonian NMAH · CHM" />
      <Card t={t} at={S(11).start + 0.1} out={S(11).end - 0.1} x={300} y={300} w={420} title="first bug" sub="?" />
      <Card t={t} at={W(11, "wings") - 0.1} out={S(11).end - 0.1} x={780} y={300} w={420} tone="ice" title="first with wings" sub="1947 ✓" />
      <Card t={t} at={W(12, "smithsonian")} out={S(12).end - 0.1} x={540} y={300} w={700} title="Smithsonian · NMAH" sub="Log book with computer bug" source="si.edu · nmah_334663" />

      {/* honesty tags */}
      <Tag t={t} at={S(3).start} out={S(6).end} text="RECREATION · SCHEMATIC" />
      <Tag t={t} at={S(7).start} out={S(12).end} text="PHOTO: US NAVY / NHHC · PLACEHOLDER" />

      <ProgressBar t={t} duration={END_AT} />
      <BrandLine t={t} brand="UNDER THE PROMPT" stamp="NIGHT LOG #000" stampUntil={S(2).end} />
      {t < END_AT && <CaptionPill t={t} chunks={chunks} />}

      {/* signature blink cuts */}
      <Blink t={t} at={S(3).start} />
      <Blink t={t} at={S(10).start} />
      <Blink t={t} at={S(13).start} />
      <EndCard t={t} at={END_AT} brand="UNDER THE PROMPT" line="Sources in the description." />
      <Audio src={staticFile("utp000_en.wav")} />
    </AbsoluteFill>
  );
};
