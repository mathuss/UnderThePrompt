/**
 * UTP-000 v2 "The first *actual* bug". Format: Mott tells the story to Leo (the intern) at the night desk;
 * the story itself is shown with the people who lived it (storyboard: production/UTP-000-moth/storyboard.md).
 * Every scene in the timeline is one beat; everything is keyed to sync words.
 */
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildMott, P, Track } from "../brand/mott";
import { buildPerson, CAST, faceAt, FaceName } from "../brand/person";
import { buildHostDesk, MOTT_SPOT } from "../brand/sets/hostDesk";
import { buildMachineRoom, HERO } from "../brand/sets/machineRoom";
import { buildDesk1947, buildWorkshop1878, buildStoryRoom, buildMuseum } from "../brand/sets/storySets";
import { HOSTS } from "../HostOptions";
import { makeSync, ramp, lerp, lerp3, smooth, clamp01, Timeline } from "../brand/sync";
import { ProgressBar, BrandLine, CaptionPill, Card, Tag, Blink, EndCard, DocumentShot, UI } from "../brand/ui";
import tlJson from "../data/utp000v2_en.json";
import envMott from "../data/utp000v2_env_mott.json";
import envLeo from "../data/utp000v2_env_leo.json";

const TL = tlJson as unknown as Timeline;
const EM = (envMott as { env: number[] }).env, EL = (envLeo as { env: number[] }).env;
const { W, S, chunks, duration } = makeSync(TL);
const HS = 0.27;                                  // machine room: Mott units → metres
const relayW = (lx: number, ly: number, lz: number): [number, number, number] => [(HERO.x + lz) * HS, (HERO.y + ly) * HS, (HERO.z - lx) * HS];
const MOTH_IN_RELAY = relayW(0.62, 0.86, 0.02), COIL_TOP = relayW(-0.3, 0.83, 0);

const T = {
  toHall: W(3, "picture"),
  toWorkshop: W(11, "edison") - 0.1,
  toStoryRoom: W(14, "she") - 0.1,
  tap: W(17, "light", 0, "end") + 0.6,
};
const END_AT = T.tap + 0.45;
export const PILOT_DURATION = Math.max(duration, END_AT) + 1.6;

type Set = "desk" | "hall" | "desk1947" | "photo" | "workshop" | "room" | "museum";
function setAt(t: number): Set {
  const id = (TL.scenes.find((s) => t < s.end) ?? TL.scenes[TL.scenes.length - 1]).id;
  if (id === 3) return t < T.toHall ? "desk" : "hall";
  if (id >= 4 && id <= 6) return "hall";
  if (id === 8) return "desk1947";
  if (id === 9 || id === 12) return "photo";
  if (id === 11) return t < T.toWorkshop ? "desk" : "workshop";
  if (id === 14) return t < T.toStoryRoom ? "desk" : "room";
  if (id === 15) return "museum";
  return "desk";
}
const sceneId = (t: number) => (TL.scenes.find((s) => t < s.end) ?? TL.scenes[TL.scenes.length - 1]).id;
const u = (t: number, id: number) => clamp01((t - S(id).start) / (S(id).end - S(id).start));

const MOTT_TRACK: Track = [[0, "shocked"], [W(1, "computer"), "curious"], [S(3).start, "smug"], [S(6).start, "worried"],
  [S(11).start, "skeptical"], [S(12).start, "smug"], [S(14).start, "curious"], [W(14, "lamp"), "skeptical"], [S(15).start, "neutral"],
  [S(17).start, "smug"], [T.tap - 0.35, "excited"]];
const LEO_TRACK: [number, FaceName][] = [[0, "curious"], [S(2).start, "surprised"], [W(2, "like"), "curious"], [S(3).start, "neutral"],
  [S(7).start, "surprised"], [S(10).start, "happy"], [S(11).start, "confused"], [S(13).start, "thinking"], [S(14).start, "skeptical"],
  [S(16).start, "excited"], [W(17, "family"), "happy"]];

type V3 = [number, number, number];
type Cam = { pos: V3; look: V3; fov?: number };

/** Camera for every beat. Desk shots: Mott close-up, Leo close-up, or the two-shot. */
const MOTT_HEAD: V3 = [MOTT_SPOT.x, MOTT_SPOT.y + 0.075, MOTT_SPOT.z];
const CAM_MOTT: Cam = { pos: [0.52, 0.94, 0.55], look: MOTT_HEAD, fov: 30 };
const CAM_LEO: Cam = { pos: [0.24, 1.58, 0.8], look: [-0.1, 1.48, -0.5], fov: 30 };
const CAM_TWO: Cam = { pos: [0.6, 1.32, 1.7], look: [0.05, 1.1, -0.2], fov: 34 };

function camAt(t: number): Cam {
  const id = sceneId(t), k = smooth(u(t, id)), set = setAt(t);
  if (set === "desk") {
    if (id === 1) return CAM_MOTT;
    if (id === 2 || id === 7 || id === 10 || id === 13 || id === 16) return CAM_LEO;
    if (id === 3) return { ...CAM_TWO, pos: lerp3(CAM_TWO.pos, [0.5, 1.25, 1.45], k) as V3 };
    if (id === 11 || id === 14) return CAM_MOTT;
    if (id === 17) return t < W(17, "stay") ? CAM_MOTT : { pos: lerp3([0.45, 1.3, 1.6], [0.1, 1.45, 2.1], ramp(t, W(17, "light", 0, "end"), 0.8)) as V3, look: [-0.15, 1.25, -0.1], fov: 34 };
  }
  if (set === "hall") {
    if (id === 3) { const q = smooth((t - T.toHall) / (S(3).end - T.toHall)); return { pos: lerp3([0, 1.45, 1.9], [0.15, 1.95, 2.3], q) as V3, look: [0, 1.0, -1.6], fov: 36 }; }
    if (id === 4) return { pos: [-0.4, 1.62, -1.0], look: [0.3, 1.45, -1.66], fov: 30 };
    if (id === 5) {
      // seen from deeper in the aisle, looking back at the engineers, so their faces read
      if (t < W(5, "so")) return { pos: [-0.25, 1.6, -2.85], look: [0.05, 1.38, -1.05], fov: 36 };
      const q = smooth((t - W(5, "so")) / (S(5).end - W(5, "so")));
      return { pos: [-0.25, 1.6, lerp(-3.7, -3.9, q)], look: [0.02, 1.25, -1.3], fov: 36 };
    }
    return { pos: [-0.3, 1.52, -1.4], look: [0.3, 1.45, -1.86], fov: 32 }; // 6: the relay with the moth, the engineer leaning in behind it
  }
  if (set === "desk1947") return { pos: lerp3([1.6, 1.7, 1.1], [1.35, 1.55, 0.9], k) as V3, look: [0.02, 1.12, -0.2], fov: 34 }; // 3/4 from the side: engineer, book and tape
  if (set === "workshop") return { pos: [0.9, 1.15, 1.4], look: [0.0, 1.0, -0.3], fov: 34 };
  if (set === "room") return { pos: [1.5, 1.65, 2.8], look: [0.05, 1.15, -0.4], fov: 34 };
  if (set === "museum") return { pos: lerp3([1.3, 1.65, 2.6], [1.0, 1.55, 2.1], k) as V3, look: [0.0, 1.0, -0.55], fov: 34 };
  return CAM_TWO;
}

const Scene: React.FC<{ t: number; frame: number; photo: THREE.Texture | null }> = ({ t, frame, photo }) => {
  const { camera } = useThree();
  const w = useMemo(() => {
    const desk = buildHostDesk(), hall = buildMachineRoom(HS), d47 = buildDesk1947(), shop = buildWorkshop1878(), room = buildStoryRoom(), museum = buildMuseum(null);
    // the host and Mott at the night desk
    const leo = buildPerson(HOSTS.host.look); leo.root.position.set(-0.12, 0, -0.55); leo.root.rotation.y = 0.15; desk.group.add(leo.root);
    const mott = buildMott(), mottHolder = new THREE.Group(); mottHolder.add(mott.root); mottHolder.scale.setScalar(0.1); desk.group.add(mottHolder);
    // 1947: three engineers in the hall
    const engA = buildPerson(CAST.engineer1947A), engB = buildPerson(CAST.engineer1947B), engC = buildPerson(CAST.engineer1947C);
    const lightA = engA.holdFlashlight(), lightB = engB.holdFlashlight();
    // people live in world metres, outside the scaled room group (inside it they would be 0.27× tall)
    // a tiny Mott who watches the relay (only in the macro shot)
    const mott2 = buildMott(), m2 = new THREE.Group(); m2.add(mott2.root); m2.scale.setScalar(0.1); m2.position.set(...COIL_TOP); m2.rotation.y = -1.2;
    const hallWorld = new THREE.Group(); hallWorld.add(hall.group, m2, engA.root, engB.root, engC.root);
    // the logbook desk
    const engD = buildPerson(CAST.engineer1947B); engD.root.position.set(0.0, 0, -0.42); d47.group.add(engD.root);
    // 1878 silhouette, the storyteller and listeners, museum visitors
    const inventor = buildPerson(CAST.inventor1878); inventor.root.position.set(0, 0, -0.42); shop.group.add(inventor.root);
    const teller = buildPerson(CAST.navyOfficer); teller.root.position.set(0.25, 0, 0.35); teller.root.rotation.y = Math.PI - 0.25; room.group.add(teller.root);
    const listeners = [buildPerson(CAST.visitorA), buildPerson(CAST.visitorB), buildPerson(CAST.engineer1947A)];
    [[-0.45, -0.75, 0.45], [0.65, -0.8, -0.45], [0.1, -1.15, 0.0]].forEach(([x, z, ry], i) => { listeners[i].root.position.set(x, 0, z); listeners[i].root.rotation.y = ry; room.group.add(listeners[i].root); });
    const visitors = [buildPerson(CAST.visitorA), buildPerson(CAST.visitorB)];
    [[-0.55, 0.2, Math.PI + 0.4], [0.6, 0.15, Math.PI - 0.45]].forEach(([x, z, ry], i) => { visitors[i].root.position.set(x, 0, z); visitors[i].root.rotation.y = ry; museum.group.add(visitors[i].root); });
    return { desk, hall, hallWorld, d47, shop, room, museum, leo, mott, mottHolder, engA, engB, engC, lightA, lightB, mott2, engD, inventor, teller, listeners, visitors, photoSet: false };
  }, []);
  if (photo && !w.photoSet) { w.museum.setPhoto(photo); w.photoSet = true; }

  const id = sceneId(t), set = setAt(t);
  const cam = camAt(t);
  camera.position.set(...cam.pos);
  (camera as THREE.PerspectiveCamera).fov = cam.fov ?? 32; (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  camera.lookAt(...cam.look);

  w.desk.group.visible = set === "desk" || set === "photo";
  w.hallWorld.visible = set === "hall"; w.d47.group.visible = set === "desk1947"; w.shop.group.visible = set === "workshop";
  w.room.group.visible = set === "room"; w.museum.group.visible = set === "museum";

  /* desk: Leo and Mott */
  const talkM = EM[Math.min(frame, EM.length - 1)] ?? 0, talkL = EL[Math.min(frame, EL.length - 1)] ?? 0;
  const lf = faceAt(t, LEO_TRACK);
  const leoAct = lf.name === "happy" ? "laugh" : lf.name === "confused" ? "scratch" : talkL > 0.1 ? "talk" : "idle";
  w.leo.pose(t, { action: leoAct, amount: Math.min(1, lf.since / 0.35) * (leoAct === "laugh" ? 0.6 : 1), face: lf.face, look: 0.5, talk: talkL * 0.8 });
  // Mott: sits on the keyboard facing Leo/camera; at the end flies up and taps the lamp
  const go = smooth((t - (W(17, "light", 0, "end") + 0.05)) / 0.55);
  w.mottHolder.position.set(...(lerp3([MOTT_SPOT.x, MOTT_SPOT.y, MOTT_SPOT.z], [-0.42, 1.64, 0.22], go) as V3));
  w.mottHolder.rotation.y = lerp(0.25, -0.4, go);
  const lean = id === 14 && t < T.toStoryRoom ? ramp(t, S(14).start + 0.1, 0.5) * (1 - ramp(t, W(14, "lamp") - 0.1, 0.35)) : 0; // Light Lean
  w.mottHolder.position.x -= lean * 0.05; w.mottHolder.position.y += lean * 0.03;
  w.mott.pose(t, MOTT_TRACK, { talk: talkM, fly: Math.max(go, lean), tap: ramp(t, T.tap - 0.15, 0.15) });
  w.desk.update(t, t > END_AT - 0.05 ? 1 : 0);

  /* hall: 1947 */
  const hallOn = set === "hall";
  w.hall.update(t, {
    on: id === 3 ? ramp(t, T.toHall, 1.2) : 1,
    fault: id >= 5 ? ramp(t, W(5, "errors"), 0.6) : 0,
    click: id === 4 && t > W(4, "click") ? (Math.floor((t - W(4, "click")) * 2.6) % 2 === 0 ? 1 : 0) : 0,
    found: id === 6 ? ramp(t, W(6, "found"), 0.3) : 0,
  });
  if (hallOn) {
    // A: walks the aisle (3) → checks the right cabinets with a flashlight (5) → leans in at relay #70 (6)
    if (id <= 4) { w.engA.root.position.set(0.05, 0, lerp(-0.5, -1.0, u(t, 3))); w.engA.root.rotation.y = Math.PI; w.engA.pose(t, { action: "walk" }); }
    else if (id === 5) { const q = t < W(5, "so") ? 0 : (t - W(5, "so")) / (S(5).end - W(5, "so")); w.engA.root.position.set(0.12, 0, lerp(-0.75, -1.7, q)); /* stays ahead of the camera */ w.engA.root.rotation.y = Math.PI - 0.6; w.engA.pose(t, { action: "inspect" }); }
    else { w.engA.root.position.set(0.05, 0, -2.2); w.engA.root.rotation.y = Math.PI / 2 - 0.55; w.engA.pose(t, { action: "inspect", face: id === 6 && t > W(6, "found") ? { browUp: 1, open: 0.6, lid: -0.1 } : undefined }); } // beyond the relay, facing it and the camera
    w.lightA.visible = id >= 5;
    // B: at a panel; scratches his head when the lamps turn coral, then searches with a flashlight
    if (id === 5 && t < W(5, "so")) { w.engB.root.position.set(0.05, 0, -1.05); w.engB.root.rotation.y = 2.2; w.engB.pose(t, { action: "scratch", face: { browInner: 0.8, smile: -0.4 } }); w.lightB.visible = false; }
    else { w.engB.root.position.set(id >= 5 ? -0.12 : 0.15, 0, id >= 5 ? lerp(-0.6, -1.4, clamp01((t - W(5, "so")) / 3)) : -2.7); w.engB.root.rotation.y = id >= 5 ? Math.PI + 0.6 : Math.PI / 2; w.engB.pose(t, { action: id >= 5 ? "inspect" : "idle" }); w.lightB.visible = id >= 5; }
    // C: notes on a clipboard by the left cabinets
    w.engC.root.position.set(-0.22, 0, -0.55); w.engC.root.rotation.y = -Math.PI / 2 + 0.3; w.engC.pose(t, { action: "write", amount: 0.6 });
    w.mott2.root.visible = id === 4;
    w.mott2.pose(t, [[0, "curious"]]);
  }

  /* desk 1947: tape and write */
  w.d47.update(t, { tape: ramp(t, W(8, "taped"), 0.6), write: clamp01((t - W(8, "wrote")) / 1.2) });
  w.engD.pose(t, { action: t < W(8, "wrote") ? "reach" : "write", amount: 0.8, face: { smile: 0.4, lid: 0.25 } });

  /* 1878 */
  w.shop.update(t, { glow: ramp(t, W(11, "bugs"), 0.5) });
  w.inventor.pose(t, { action: "write" });

  /* the story gets told */
  w.teller.pose(t, { action: "talk", phase: 0.5 });
  w.listeners.forEach((l, i) => l.pose(t, { action: t > W(14, "famous") - 0.2 ? "laugh" : "idle", phase: i * 1.3, look: i === 2 ? 0 : 0.2 }));

  /* museum */
  w.visitors.forEach((v, i) => v.pose(t, { action: "idle", phase: i * 2.1, look: i ? -0.15 : 0.15 }));

  const fogFar = set === "hall" ? 7 : set === "museum" ? 6 : 7;
  return (
    <>
      <color attach="background" args={[P.night]} />
      <fog attach="fog" args={[P.night, 1.8, fogFar]} />
      <primitive object={w.desk.group} />
      <primitive object={w.hallWorld} />
      <primitive object={w.d47.group} />
      <primitive object={w.shop.group} />
      <primitive object={w.room.group} />
      <primitive object={w.museum.group} />
    </>
  );
};

export const Pilot000: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const [photo, setPhoto] = useState<THREE.Texture | null>(null);
  const [handle] = useState(() => delayRender("archive photo"));
  useEffect(() => {
    new THREE.TextureLoader().load(staticFile("nh96566.jpg"), (tex) => { tex.colorSpace = THREE.SRGBColorSpace; setPhoto(tex); continueRender(handle); }, undefined, () => continueRender(handle));
  }, [handle]);
  const set = setAt(t);
  const story = set === "hall" || set === "desk1947" || set === "workshop" || set === "room";
  return (
    <AbsoluteFill style={{ background: UI.night }}>
      <ThreeCanvas width={width} height={height} shadows flat camera={{ fov: 32, near: 0.01, far: 40 }}
        gl={{ antialias: true }} onCreated={({ gl }) => { gl.shadowMap.type = THREE.PCFSoftShadowMap; }}>
        <Scene t={t} frame={frame} photo={photo} />
      </ThreeCanvas>

      {/* the real document */}
      <DocumentShot src={staticFile("nh96566.jpg")} w={1920} h={1519} t={t} at={S(9).start} out={S(9).end}
        keys={[{ t: S(9).start, cx: 960, cy: 900, k: 0.6 }, { t: S(9).end, cx: 860, cy: 1000, k: 0.95 }]}
        underline={{ at: W(9, "first"), x0: 290, x1: 1480, y: 1168 }} credit="PHOTO: US NAVY / NHHC · PUBLIC DOMAIN" />
      <DocumentShot src={staticFile("nh96566.jpg")} w={1920} h={1519} t={t} at={S(12).start} out={S(12).end}
        keys={[{ t: S(12).start, cx: 760, cy: 1110, k: 1.0 }, { t: S(12).end, cx: 565, cy: 1118, k: 1.45 }]}
        underline={{ at: W(12, "actual"), x0: 468, x1: 662, y: 1160 }} credit="PHOTO: US NAVY / NHHC · PUBLIC DOMAIN" />

      {/* one short card per idea, no sources in frame */}
      <Card t={t} at={W(1, "1947") - 0.1} out={S(1).end - 0.1} x={540} y={330} w={420} tab="▍_ night log" title="1947" big />
      <Card t={t} at={W(3, "harvard")} out={S(3).end - 0.1} x={540} y={300} w={640} title="Harvard Mark II" sub="1947" />
      <Card t={t} at={W(6, "stuck") - 0.1} out={S(6).end - 0.1} x={540} y={300} w={460} title="Relay #70" />
      <Card t={t} at={T.toWorkshop + 0.2} out={S(11).end - 0.1} x={540} y={300} w={560} tone="ice" title="Edison · 1878" />
      <Card t={t} at={W(14, "famous") - 0.3} out={S(14).end - 0.1} x={540} y={300} w={620} tone="ice" title="She told the story" />
      <Card t={t} at={S(15).start + 0.3} out={S(15).end - 0.1} x={540} y={300} w={560} title="Smithsonian" />

      {/* honesty tags */}
      {story && <Tag t={t} at={0} out={1e9} text="RECREATION" />}
      {set === "museum" && <Tag t={t} at={0} out={1e9} text="RECREATION · PAGE: US NAVY / NHHC" />}

      <ProgressBar t={t} duration={END_AT} />
      <BrandLine t={t} brand="UNDER THE PROMPT" stamp="NIGHT LOG #000" stampUntil={S(2).end} />
      {t < END_AT && <CaptionPill t={t} chunks={chunks} accent={(wd) => (wd.speaker === "leo" ? UI.ice : UI.amber)} />}

      <Blink t={t} at={T.toHall} />
      <Blink t={t} at={S(16).start} />
      <EndCard t={t} at={END_AT} brand="UNDER THE PROMPT" line="Sources in the description." />
      <Audio src={staticFile("utp000v2_en.wav")} />
    </AbsoluteFill>
  );
};
