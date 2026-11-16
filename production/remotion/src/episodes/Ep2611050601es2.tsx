/**
 * UTP-20261105-06, Spanish v2 "Adivinó" for Debajo del Prompt (production/UTP-20261105-06/script_es_v2.md).
 * Story: Leo's idea → the real counterexample (Claude builds it without asking, counterexample_es.md) → "che, tengo justo lo que necesitás"
 * → how grill-me works → how to install and use it → the real session (session_es.md) → conclusion. Voice: voice_es_v2.json.
 */
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildMott, P, Track } from "../brand/mott";
import { buildPerson, faceAt, FaceName } from "../brand/person";
import { buildHostDesk, PERCH, LAPTOP, DESK_Y, LAMP_Y_DIALOGUE } from "../brand/sets/hostDesk";
import { HOSTS } from "../HostOptions";
import { makeSync, ramp, lerp, lerp3, smooth, clamp01, Timeline, Word } from "../brand/sync";
import { ProgressBar, BrandLine, CaptionPill, EndCard, MONO, SANS, UI } from "../brand/ui";
import { Projection, ProjText, QuestionRow } from "../brand/projection";
import session from "../data/utp2611050601_session_es.json";
import tlJson from "../data/utp2611050601es2.json";
import envMott from "../data/utp2611050601es2_env_mott.json";
import envLeo from "../data/utp2611050601es2_env_leo.json";

/* ───────────── voiced timeline: ElevenLabs (tools/make_voice_eleven.py), word times from its character alignment ───────────── */
/** Seconds of the establishing shot before the first line (the voice spec's lead_in): where we are. */
const ESTABLISH = 3.4;
const TL = tlJson as unknown as Timeline;
const EM = (envMott as { env: number[] }).env, EL = (envLeo as { env: number[] }).env;
const WHO = (id: number) => TL.words.find((w) => w.scene === id)!.speaker;
const { W, S, chunks } = makeSync(TL);
const lineEnd = (id: number) => TL.words.filter((w) => w.scene === id).slice(-1)[0].end;

const T = { tap: S(17).end - 0.3 };
const END_AT = T.tap + 0.45;
export const EP2611050601ES2_DURATION = END_AT + 2.6;

const sceneId = (t: number) => (TL.scenes.find((s) => t < s.end) ?? TL.scenes[TL.scenes.length - 1]).id;
const u = (t: number, id: number) => clamp01((t - S(id).start) / (S(id).end - S(id).start));
/** Mouth: the speaker's voice envelope at this frame. */
const talkOf = (t: number, who: string) => { const e = who === "mott" ? EM : EL; return e[Math.min(Math.round(t * 30), e.length - 1)] ?? 0; };

/* ───────────── shots: always the two of them ───────────── */
type Shot = "establish" | "front" | "side" | "proj" | "wide";
const PROJ_IDS = [2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 14, 15];
const shotAt = (t: number): Shot => {
  if (t < ESTABLISH - 0.35) return "establish";
  const id = sceneId(t);
  if (PROJ_IDS.includes(id)) return "proj";
  if (id === 17) return t < lineEnd(17) + 0.15 ? "side" : "wide";
  return "front"; // 1, 8, 11, 16: Leo's idea and his questions
};

type V3 = [number, number, number];
type Cam = { pos: V3; look: V3; fov: number; shift?: number };
const LEO_POS: V3 = [-0.12, 0, -0.62], LEO_HEAD: V3 = [-0.11, 1.17, -0.6];
/** Mott is drawn 1.5× his desk size here, so he reads in two-shots (a proposal for this format, not yet the model sheet). */
const MS = 0.15, MH = 0.75 * MS;
const MOTT_AT: V3 = [PERCH.x, PERCH.y, PERCH.z], MOTT_HEAD: V3 = [PERCH.x, PERCH.y + MH, PERCH.z];
const LAMP: V3 = [-0.5, LAMP_Y_DIALOGUE, 0.2];
const MID: V3 = [(LEO_HEAD[0] + MOTT_HEAD[0]) / 2, 1.12, (LEO_HEAD[2] + MOTT_HEAD[2]) / 2];
const LOOK2: V3 = lerp3(MID, LEO_HEAD, 0.12) as V3;
const CAM_SIDE: Cam = { pos: [MID[0] - 0.78 * 2.5, 1.22, MID[2] + 0.62 * 2.5], look: lerp3(MID, LEO_HEAD, 0.1) as V3, fov: 38 };
// second two-shot angle
const CAM_FRONT: Cam = { pos: [MID[0] - 0.3 * 2.4, 1.3, MID[2] + 0.95 * 2.4], look: MID, fov: 36 }; // same side of the line as CAM_SIDE (Leo left, Mott right), more frontal on Leo
// panel shots: further back and aimed a little toward Mott, so both read and Mott stays clear of the platform buttons on the right
const LOOK_P: V3 = lerp3(MID, MOTT_HEAD, 0.3) as V3;
const CAM_PROJ: Cam = { pos: [LOOK_P[0] - 0.78 * 3.0, 1.24, LOOK_P[2] + 0.62 * 3.0], look: LOOK_P, fov: 36, shift: 330 };
const push = (c: Cam, k: number, amt = 0.05): Cam => ({ ...c, pos: lerp3(c.pos, c.look, k * amt) as V3 });
function rawCam(t: number): Cam {
  const id = sceneId(t), k = smooth(u(t, id)), shot = shotAt(t);
  // where we are: the city through the big window first, then a tilt down to the desk in front of it
  if (shot === "establish") { const q = smooth((t - 0.5) / (ESTABLISH - 0.6)); return { pos: lerp3([0.7, 1.55, 2.15], [0.45, 1.5, 1.7], q) as V3, look: lerp3([0.6, 1.5, -3.9], [0.0, 1.15, -0.7], q) as V3, fov: lerp(46, 42, q) }; }
  if (shot === "front") return push(CAM_FRONT, k);
  if (shot === "side") return push(CAM_SIDE, k);
  if (shot === "proj") return CAM_PROJ;
  const q = ramp(t, lineEnd(17) + 0.15, 1.2);
  return { pos: lerp3([0.35, 1.45, 2.4], [0.25, 1.5, 2.9], q) as V3, look: [-0.25, 1.55, -0.2], fov: 44 }; // wide enough to keep Mott below the top UI at the lamp
}

/* Shot changes are eased over BLEND seconds instead of cut, and a slow hand-held drift keeps the frame alive. */
const BLEND = 0.75;
const CUTS: number[] = [];
{ let prev = shotAt(0); for (let f = 1; f / 30 < TL.duration + 3; f++) { const s = shotAt(f / 30); if (s !== prev) { CUTS.push(f / 30); prev = s; } } }
const drift = (c: Cam, t: number): Cam => ({ ...c, pos: [c.pos[0] + Math.sin(t * 0.37) * 0.012, c.pos[1] + Math.sin(t * 0.29 + 1) * 0.008, c.pos[2] + Math.cos(t * 0.31) * 0.01] });
function camAt(t: number): Cam {
  const c = rawCam(t);
  let cut = -1; for (const x of CUTS) if (x <= t) cut = x;
  if (cut < 0 || t - cut >= BLEND) return drift(c, t);
  const a = rawCam(cut - 1 / 30), k = smooth((t - cut) / BLEND);
  return drift({ pos: lerp3(a.pos, c.pos, k) as V3, look: lerp3(a.look, c.look, k) as V3, fov: lerp(a.fov, c.fov, k), shift: lerp(a.shift ?? 0, c.shift ?? 0, k) }, t);
}

/** 0…1 while a speaker's line is being said (eased in and out). */
const lineWeight = (t: number, who: string) => TL.scenes.reduce((m, sc) => (WHO(sc.id) === who ? Math.max(m, ramp(t, sc.start - 0.1, 0.3) * (1 - ramp(t, lineEnd(sc.id), 0.4))) : m), 0);
/** 0…1 while Leo types (eased). */
// Leo types his request (line 2), answers the questions (line 14), and types once more at the end
const TYPE_SPANS: [number, number][] = [[W(2, "pido") - 0.2, S(2).end - 0.3], [S(14).start - 0.25, lineEnd(14) + 0.3], [lineEnd(17) + 0.25, 1e9]];
const typingAt = (t: number) => TYPE_SPANS.reduce((m, [a, b]) => Math.max(m, ramp(t, a, 0.45) * (1 - ramp(t, b, 0.45))), 0);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
/** Where Leo's hands go: on the desk beside the laptop, on the keys while typing; the right hand lifts a little when he talks. */
function leoHands(t: number) {
  const ty = typingAt(t), tk = lineWeight(t, "leo") * (1 - ty);
  const tap = (ph: number) => 0.012 * Math.max(0, Math.sin(t * 16 + ph)) * ty;
  const restL = V(LAPTOP.x - 0.21, DESK_Y + 0.022, LAPTOP.z - 0.11), restR = V(LAPTOP.x + 0.2, DESK_Y + 0.022, LAPTOP.z - 0.1);
  const keyL = V(LAPTOP.x - 0.065, DESK_Y + 0.033, LAPTOP.z + 0.035), keyR = V(LAPTOP.x + 0.065, DESK_Y + 0.033, LAPTOP.z + 0.035);
  const left = restL.lerp(keyL, ty); left.y += tap(0);
  const right = restR.lerp(keyR, ty); right.y += tap(1.7);
  right.add(V(0.03, 0.07 + 0.02 * Math.sin(t * 3.1), 0.04).multiplyScalar(tk));
  return { left, right, k: 1, lean: 0.12 * ty };
}

/** While a panel needs reading, both look up at it. */
const READ: [number, number][] = [[lineEnd(3), S(3).end], [lineEnd(4), S(4).end], [lineEnd(7), S(7).end], [lineEnd(10), S(10).end], [lineEnd(12), S(12).end], [lineEnd(13), S(13).end], [lineEnd(15), S(15).end]];
const readingAt = (t: number) => READ.reduce((m, [a, b]) => Math.max(m, ramp(t, a, 0.3) * (1 - ramp(t, b - 0.3, 0.3))), 0);

const MOTT_TRACK: Track = [[0, "neutral"], [S(1).start, "curious"], [S(4).start, "skeptical"], [S(6).start, "neutral"], [S(7).start, "smug"], [S(9).start, "neutral"],
  [S(12).start, "curious"], [S(15).start, "smug"], [S(17).start, "neutral"], [T.tap - 0.35, "curious"]];
const LEO_TRACK: [number, FaceName][] = [[0, "excited"], [S(2).start, "smug"], [S(3).start, "happy"], [S(4).start, "neutral"], [S(5).start, "surprised"], [W(5, "no"), "confused"],
  [S(6).start, "guilty"], [S(7).start, "curious"], [S(8).start, "curious"], [S(11).start, "curious"], [S(14).start, "thinking"], [W(14, "quiero"), "happy"],
  [S(16).start, "thinking"], [S(17).start, "happy"]];
const MOTT_INTENSITY = 0.5;
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

const Scene: React.FC<{ t: number; width: number; height: number }> = ({ t, width, height }) => {
  const { camera } = useThree();
  const w = useMemo(() => {
    const desk = buildHostDesk({ dialogue: true });
    const leo = buildPerson(HOSTS.host.look); leo.root.position.set(...LEO_POS); leo.root.rotation.y = 0.1; desk.group.add(leo.root);
    const mott = buildMott(), mottHolder = new THREE.Group(); mottHolder.add(mott.root); mottHolder.scale.setScalar(MS); desk.group.add(mottHolder);
    return { desk, leo, mott, mottHolder };
  }, []);
  const id = sceneId(t), cam = camAt(t), pc = camera as THREE.PerspectiveCamera;
  pc.position.set(...cam.pos); pc.fov = cam.fov;
  if (cam.shift) pc.setViewOffset(width, height, 0, -cam.shift, width, height); else pc.clearViewOffset();
  pc.updateProjectionMatrix(); pc.lookAt(...cam.look);

  const read = readingAt(t);
  const go = smooth((t - (lineEnd(17) + 0.3)) / 0.6);
  w.mottHolder.position.set(...(lerp3(MOTT_AT, [LAMP[0] + 0.16, LAMP[1] - 0.24, LAMP[2] + 0.1], go) as V3)); // a little below and in front of the lamp: not inside its hot spot
  const mh = w.mottHolder.position, toLeo = [LEO_HEAD[0] - mh.x, LEO_HEAD[1] - (mh.y + MH), LEO_HEAD[2] - mh.z];
  const mottYaw = Math.atan2(toLeo[0], toLeo[2]), mottPitch = Math.atan2(toLeo[1], Math.hypot(toLeo[0], toLeo[2]));
  w.mottHolder.rotation.y = lerp(mottYaw, -0.4, go);
  const lampYaw = Math.max(-1.1, Math.min(1.1, wrap(Math.atan2(LAMP[0] - mh.x, LAMP[2] - mh.z) - mottYaw)));
  w.mott.pose(t, MOTT_TRACK, { talk: talkOf(t, "mott"), fly: go, tap: ramp(t, T.tap - 0.15, 0.15), point: Math.max(ramp(t, W(7, "grill"), 0.3) * (1 - ramp(t, S(7).end, 0.4)), ramp(t, S(12).start, 0.3) * (1 - ramp(t, S(13).end, 0.4))),
    gazePitch: lerp(mottPitch * (1 - go), 0.45, read), gazeYaw: lampYaw * read * 0.6, intensity: MOTT_INTENSITY });

  const lf = faceAt(t, LEO_TRACK);
  const toMott = [mh.x - LEO_HEAD[0], mh.y + MH - LEO_HEAD[1], mh.z - LEO_HEAD[2]];
  const yawToMott = Math.atan2(toMott[0], toMott[2]) - 0.1;
  const pitchToMott = Math.max(-0.6, Math.min(0.6, -Math.atan2(toMott[1], Math.hypot(toMott[0], toMott[2])) * 0.8));
  const atScreen = typingAt(t);
  const talkL = talkOf(t, "leo");
  w.leo.pose(t, { sit: 1, action: "idle", hands: leoHands(t), face: lf.face,
    look: lerp(lerp(yawToMott, -0.1, atScreen), -0.25, read * (1 - atScreen)), lookPitch: lerp(lerp(pitchToMott, 0.3, atScreen), -0.3, read * (1 - atScreen)), talk: talkL * 0.8 });

  const starts = [W(2, "pido"), S(3).start, S(4).start, W(7, "grill"), S(9).start, S(10).start, S(12).start, S(13).start, S(14).start, S(15).start];
  const dip = starts.reduce((m, a) => Math.max(m, t >= a - 0.05 && t < a + 0.1 ? 0.6 : 0), 0);
  w.desk.update(t, t > END_AT - 0.05 ? 1 : dip);
  return (
    <>
      <color attach="background" args={[P.night]} />
      <fog attach="fog" args={[P.night, 1.8, 7]} />
      <primitive object={w.desk.group} />
    </>
  );
};

/* ───────────── real text, cut but never reworded ───────────── */
const R1 = session.rounds[0], R2 = session.rounds[1];
const q = (n: number) => R1.questions.find((x) => x.n === n)!;
const firstSentence = (s: string) => s.slice(0, s.indexOf(". ") + 1 || s.length);
const R1_FIRST = firstSentence(R1.intro);            // "Antes de escribir código, necesito cerrar las decisiones de la raíz del árbol."
const R2_FIRST = firstSentence(R2.intro);            // "Con sync entre celu y compu cambia la raíz del árbol."
const INSTALL = "claude plugin install mattpocock-skills@claude-plugins-official"; // README; run on 2026-11-12
const INSTALLED = "✔ Successfully installed plugin: mattpocock-skills@claude-plugins-official (scope: user)"; // its real output
const SRC = `sesión real · Claude Code + grill-me · ${session.captured}`;
const SRC_NO = "sesión real · Claude Code sin grill-me · 2026-11-16";
const NO_GRILL_DATA = "No hay cuenta ni servidor, y los datos quedan en ese navegador y en ese dispositivo."; // its own summary, verbatim (counterexample_es.md)

/** "PASO n/3" with three amber segments: how much of the how-to is left. */
const Steps: React.FC<{ n: number }> = ({ n }) => (
  <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>{[1, 2].map((i) => <div key={i} style={{ flex: 1, height: 10, borderRadius: 5, background: i <= n ? UI.amber : "rgba(255,241,214,.15)" }} />)}</div>
);

export const Ep2611050601es2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const lowK = (camAt(t).shift ?? 0) / 330;
  const typed = (s: string, a: number, cps = 16) => s.slice(0, Math.round(clamp01((t - a) * cps / s.length) * s.length));
  const idea = "Haceme una app para seguir hábitos.";
  // the real answers: Q1 ok, Q2 no (it asked about login and sync), Q3–Q6 ok
  const [y1, n2, y3] = [W(14, "ok", 0), W(14, "no"), W(14, "ok", 1)];
  return (
    <AbsoluteFill style={{ background: UI.night }}>
      <ThreeCanvas width={width} height={height} shadows flat camera={{ fov: 36, near: 0.01, far: 40 }}
        gl={{ antialias: true }} onCreated={({ gl }) => { gl.shadowMap.type = THREE.PCFSoftShadowMap; }}>
        <Scene t={t} width={width} height={height} />
      </ThreeCanvas>

      {/* EL PROBLEMA · Leo lo pide sin grill-me (real, 2026-11-16) */}
      <Projection t={t} at={W(2, "pido") - 0.1} out={S(2).end} kind="REAL TEXT" title="Claude Code · sin grill-me" height={330} source={SRC_NO}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 44, color: UI.ice }}>&gt; {typed(idea, W(2, "pido"), 15)}<span style={{ opacity: Math.floor(t * 3) % 2 ? 1 : 0 }}>▍</span></div>
      </Projection>
      <Projection t={t} at={S(3).start} out={S(3).end} kind="REAL TEXT" title="lo que hizo, en 31 segundos" height={430} source={SRC_NO}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 64, color: UI.cream }}>index.html</div>
        <div style={{ display: "flex", gap: 40, marginTop: 24 }}>
          <div><div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 80, color: UI.amber }}>117</div><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: UI.muted }}>líneas de código</div></div>
          <div style={{ opacity: ramp(t, W(3, "listo") + 0.4, 0.3) }}><div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 80, color: UI.coral }}>0</div><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: UI.muted }}>preguntas</div></div>
        </div>
      </Projection>
      <Projection t={t} at={S(4).start} out={S(6).end} kind="REAL TEXT" title="su propio resumen" height={420} source={SRC_NO}>
        <ProjText size={50} text={NO_GRILL_DATA} hl={UI.coral} />
      </Projection>

      {/* LA SOLUCIÓN · quién lo hizo: la página real del repo (captura del 2026-11-12) */}
      <Projection t={t} at={W(7, "grill") - 0.2} out={S(7).end} kind="REAL" title="github.com/mattpocock/skills" height={760} source="captura de la página pública del repo · 2026-11-12">
        <Img src={staticFile("captures/utp2611050601_repo_header.png")} style={{ width: "100%", borderRadius: 10, display: "block" }} />
        <div style={{ display: "flex", gap: 26, marginTop: 22, alignItems: "flex-start" }}>
          <Img src={staticFile("captures/utp2611050601_repo_about.png")} style={{ width: 280, borderRadius: 10, display: "block" }} />
          <div style={{ flex: 1, paddingTop: 10 }}>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: UI.muted }}>hecho por</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 60, lineHeight: 1.05, color: UI.cream, marginTop: 6 }}>Matt Pocock</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: UI.amber, marginTop: 22 }}>/grill-me</div>
            <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 24, color: UI.muted, marginTop: 8 }}>gratis · licencia MIT</div>
          </div>
        </div>
      </Projection>

      {/* CÓMO FUNCIONA · su primera frase, después las preguntas con su respuesta recomendada */}
      <Projection t={t} at={S(9).start} out={S(9).end} kind="REAL TEXT" title="lo primero que dice grill-me" height={420} source={SRC}>
        <ProjText size={50} text={R1_FIRST} />
      </Projection>
      <Projection t={t} at={S(10).start} out={S(10).end} kind="REAL TEXT" title={`ronda 1 · ${R1.questions.length} preguntas`} height={700} source={SRC}>
        <QuestionRow n={1} title={q(1).title} rec={firstSentence(q(1).rec)} size={30} recOn={0.55 + 0.45 * ramp(t, W(10, "respuesta"), 0.4)} />
        <QuestionRow n={2} title={q(2).title} rec={firstSentence(q(2).rec)} size={30} recOn={0.55 + 0.45 * ramp(t, W(10, "respuesta"), 0.4)} />
        <QuestionRow n={3} title={q(3).title} rec={firstSentence(q(3).rec)} size={30} recOn={0.55 + 0.45 * ramp(t, W(10, "respuesta"), 0.4)} />
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: UI.muted }}>+ {R1.questions.length - 3} más</div>
      </Projection>

      {/* CÓMO SE USA · PASO 1/2 instalar (comando del README y su respuesta real), PASO 2/2 /grill-me + la idea */}
      <Projection t={t} at={S(12).start} out={S(12).end} kind="REAL TEXT" title="PASO 1/2 · instalar en Claude Code" height={520} source="README del repo · lo corrimos el 2026-11-12">
        <Steps n={1} />
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, lineHeight: 1.4, color: UI.cream }}><span style={{ color: UI.amber }}>$ </span>claude plugin install<br />&nbsp;&nbsp;mattpocock-skills<br />&nbsp;&nbsp;@claude-plugins-official</div>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 27, lineHeight: 1.35, color: UI.ice, marginTop: 22, opacity: ramp(t, W(12, "comando"), 0.3), overflowWrap: "anywhere" }}>{INSTALLED}</div>
      </Projection>
      <Projection t={t} at={S(13).start} out={S(13).end} kind="REAL TEXT" title="PASO 2/2 · escribí /grill-me y tu idea" height={420} source={SRC}>
        <Steps n={2} />
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 96, color: UI.amber }}>/grill-me</div>
        <div style={{ marginTop: 18, fontFamily: MONO, fontWeight: 700, fontSize: 40, color: UI.ice, opacity: ramp(t, W(13, "tu") - 0.25, 0.2) }}>
          {typed(idea, W(13, "tu") - 0.3, 24)}<span style={{ opacity: Math.floor(t * 3) % 2 ? 1 : 0 }}>▍</span>
        </div>
      </Projection>

      {/* LO PRUEBA · Leo responde ok / ok / no a la ronda real */}
      <Projection t={t} at={S(14).start} out={S(14).end} kind="REAL TEXT" title="ronda 1 · Leo responde" height={680} source={SRC}>
        <QuestionRow n={1} title={q(1).title} rec={firstSentence(q(1).rec)} size={28} mark={t >= y1 ? "yes" : null} markLabel="ok" markK={(t - y1) / 0.25} />
        <QuestionRow n={2} title={q(2).title} body={q(2).body} rec={firstSentence(q(2).rec)} size={30} mark={t >= n2 ? "no" : null} markK={(t - n2) / 0.25} />
        <QuestionRow n={3} title={q(3).title} rec={firstSentence(q(3).rec)} size={28} mark={t >= y3 ? "yes" : null} markLabel="ok" markK={(t - y3) / 0.25} />
      </Projection>
      <Projection t={t} at={S(15).start} out={S(15).end} kind="REAL TEXT" title="ronda 2" height={380} source={SRC}>
        <ProjText size={52} text={R2_FIRST} />
      </Projection>
      <ProgressBar t={t} duration={END_AT} />
      <BrandLine t={t} brand="DEBAJO DEL PROMPT" stamp="BITÁCORA · HERRAMIENTA" stampUntil={S(1).end} />
      {t < END_AT && <div style={{ position: "absolute", inset: 0, transform: `translateY(${lowK * 190}px)` }}>
        <CaptionPill t={t} chunks={chunks} accent={(wd) => (wd.speaker === "leo" ? UI.ice : UI.amber)} />
      </div>}
      <Audio src={staticFile("utp2611050601es2.wav")} />

      {/* end card: only the brand (user note 2026-11-15); credit and command live in the panels and the post description */}
      <EndCard t={t} at={END_AT} brand="DEBAJO DEL PROMPT" line="" />
    </AbsoluteFill>
  );
};
