/**
 * UTP-20261105-06 v2 "Let it ask first" (production/UTP-20261105-06/script_v2.md, storyboard in the same folder).
 * Voice: ElevenLabs Eleven v4 (voice_en_v2.json). Mouths follow each speaker's voice envelope.
 * Direction (user, 2026-11-12): the tool is the focus; the two characters share every shot; simple, one idea per panel.
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
import session from "../data/utp2611050601_session.json";
import tlJson from "../data/utp2611050601v2_en.json";
import envMott from "../data/utp2611050601v2_env_mott.json";
import envLeo from "../data/utp2611050601v2_env_leo.json";

/* ───────────── voiced timeline: ElevenLabs (tools/make_voice_eleven.py), word times from its character alignment ───────────── */
/** Seconds of the establishing shot before the first line (the voice spec's lead_in): where we are. */
const ESTABLISH = 3.4;
const TL = tlJson as unknown as Timeline;
const EM = (envMott as { env: number[] }).env, EL = (envLeo as { env: number[] }).env;
const WHO = (id: number) => TL.words.find((w) => w.scene === id)!.speaker;
const { W, S, chunks } = makeSync(TL);
const lineEnd = (id: number) => TL.words.filter((w) => w.scene === id).slice(-1)[0].end;

const T = { tap: S(11).end - 0.3 };
const END_AT = T.tap + 0.45;
export const EP2611050601V2_DURATION = END_AT + 2.6;

const sceneId = (t: number) => (TL.scenes.find((s) => t < s.end) ?? TL.scenes[TL.scenes.length - 1]).id;
const u = (t: number, id: number) => clamp01((t - S(id).start) / (S(id).end - S(id).start));
/** Mouth: the speaker's voice envelope at this frame. */
const talkOf = (t: number, who: string) => { const e = who === "mott" ? EM : EL; return e[Math.min(Math.round(t * 30), e.length - 1)] ?? 0; };

/* ───────────── shots: always the two of them ───────────── */
type Shot = "establish" | "front" | "side" | "proj" | "wide";
const PROJ_IDS = [2, 3, 4, 5, 6, 7, 9];
const shotAt = (t: number): Shot => {
  if (t < ESTABLISH - 0.35) return "establish";
  const id = sceneId(t);
  if (PROJ_IDS.includes(id)) return "proj";
  if (id === 11) return t < lineEnd(11) + 0.15 ? "side" : "wide";
  return "front"; // 1, 8, 10
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
  const q = ramp(t, lineEnd(11) + 0.15, 1.2);
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
const TYPE_SPANS: [number, number][] = [[S(3).start - 0.25, lineEnd(3) + 0.5], [S(6).start - 0.25, lineEnd(6) + 0.3], [lineEnd(11) + 0.25, 1e9]];
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
const READ: [number, number][] = [[lineEnd(2), S(2).end], [lineEnd(3), S(3).end], [lineEnd(4) - 0.4, S(4).end], [lineEnd(7), S(7).end], [lineEnd(9), S(9).end]];
const readingAt = (t: number) => READ.reduce((m, [a, b]) => Math.max(m, ramp(t, a, 0.3) * (1 - ramp(t, b - 0.3, 0.3))), 0);

const MOTT_TRACK: Track = [[0, "neutral"], [S(2).start, "curious"], [S(5).start, "smug"], [S(7).start, "neutral"], [S(9).start, "curious"], [S(11).start, "smug"], [T.tap - 0.35, "curious"]];
const LEO_TRACK: [number, FaceName][] = [[0, "smug"], [S(2).start, "curious"], [S(4).start, "surprised"], [W(4, "it's"), "curious"], [S(6).start, "thinking"], [W(6, "want"), "happy"],
  [S(8).start, "skeptical"], [S(9).start, "curious"], [S(10).start, "skeptical"], [W(11, "your"), "thinking"], [lineEnd(11) + 0.3, "happy"]];
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
  const go = smooth((t - (lineEnd(11) + 0.3)) / 0.6);
  w.mottHolder.position.set(...(lerp3(MOTT_AT, [LAMP[0] + 0.16, LAMP[1] - 0.24, LAMP[2] + 0.1], go) as V3)); // a little below and in front of the lamp: not inside its hot spot
  const mh = w.mottHolder.position, toLeo = [LEO_HEAD[0] - mh.x, LEO_HEAD[1] - (mh.y + MH), LEO_HEAD[2] - mh.z];
  const mottYaw = Math.atan2(toLeo[0], toLeo[2]), mottPitch = Math.atan2(toLeo[1], Math.hypot(toLeo[0], toLeo[2]));
  w.mottHolder.rotation.y = lerp(mottYaw, -0.4, go);
  const lampYaw = Math.max(-1.1, Math.min(1.1, wrap(Math.atan2(LAMP[0] - mh.x, LAMP[2] - mh.z) - mottYaw)));
  w.mott.pose(t, MOTT_TRACK, { talk: talkOf(t, "mott"), fly: go, tap: ramp(t, T.tap - 0.15, 0.15), point: ramp(t, W(2, "try"), 0.3) * (1 - ramp(t, S(2).end, 0.4)),
    gazePitch: lerp(mottPitch * (1 - go), 0.45, read), gazeYaw: lampYaw * read * 0.6, intensity: MOTT_INTENSITY });

  const lf = faceAt(t, LEO_TRACK);
  const toMott = [mh.x - LEO_HEAD[0], mh.y + MH - LEO_HEAD[1], mh.z - LEO_HEAD[2]];
  const yawToMott = Math.atan2(toMott[0], toMott[2]) - 0.1;
  const pitchToMott = Math.max(-0.6, Math.min(0.6, -Math.atan2(toMott[1], Math.hypot(toMott[0], toMott[2])) * 0.8));
  const atScreen = typingAt(t);
  const talkL = talkOf(t, "leo");
  w.leo.pose(t, { sit: 1, action: "idle", hands: leoHands(t), face: lf.face,
    look: lerp(lerp(yawToMott, -0.1, atScreen), -0.25, read * (1 - atScreen)), lookPitch: lerp(lerp(pitchToMott, 0.3, atScreen), -0.3, read * (1 - atScreen)), talk: talkL * 0.8 });

  const starts = [W(2, "try"), S(3).start - 0.2, S(4).start, S(7).start, S(9).start];
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
const ROUND2_LINE = R2.intro.split(". ")[1].split(",")[0] + "…";
const RULE = "Do not act on it until the user confirms you have reached a shared understanding."; // grilling/SKILL.md, last sentence, verbatim
const SRC = `real session · Claude Code + grill-me · ${session.captured}`;

export const Ep2611050601v2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const lowK = (camAt(t).shift ?? 0) / 330;
  const typed = (s: string, a: number, cps = 16) => s.slice(0, Math.round(clamp01((t - a) * cps / s.length) * s.length));
  const prompt = "Build me a habit tracker.";
  const [y1, y2, n3] = [W(6, "yes", 0), W(6, "yes", 1), W(6, "no")];
  return (
    <AbsoluteFill style={{ background: UI.night }}>
      <ThreeCanvas width={width} height={height} shadows flat camera={{ fov: 36, near: 0.01, far: 40 }}
        gl={{ antialias: true }} onCreated={({ gl }) => { gl.shadowMap.type = THREE.PCFSoftShadowMap; }}>
        <Scene t={t} width={width} height={height} />
      </ThreeCanvas>

      {/* 1 · who made it: the real repo page (captured 2026-11-12), credited by name */}
      <Projection t={t} at={W(2, "try")} out={S(2).end} kind="REAL" title="github.com/mattpocock/skills" height={760} source="screenshot of the public repo page · 2026-11-12">
        <Img src={staticFile("captures/utp2611050601_repo_header.png")} style={{ width: "100%", borderRadius: 10, display: "block" }} />
        <div style={{ display: "flex", gap: 26, marginTop: 22, alignItems: "flex-start" }}>
          <Img src={staticFile("captures/utp2611050601_repo_about.png")} style={{ width: 280, borderRadius: 10, display: "block" }} />
          <div style={{ flex: 1, paddingTop: 10 }}>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: UI.muted }}>made by</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 60, lineHeight: 1.05, color: UI.cream, marginTop: 6 }}>Matt Pocock</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: UI.amber, marginTop: 22, opacity: ramp(t, W(2, "grill"), 0.3) }}>/grill-me</div>
            <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 24, color: UI.muted, marginTop: 8 }}>free · MIT licence</div>
          </div>
        </div>
      </Projection>

      {/* 2 · the tool, then the prompt typed into it */}
      <Projection t={t} at={S(3).start - 0.2} out={S(3).end} kind="REAL TEXT" title="/grill-me · by Matt Pocock" height={470} source="repo README · read 2026-11-11">
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 96, color: UI.amber, marginTop: 10 }}>/grill-me</div>
        <ProjText text="A relentless interview to sharpen a plan or design." size={40} />
        <div style={{ marginTop: 34, fontFamily: MONO, fontWeight: 700, fontSize: 40, color: UI.ice, opacity: ramp(t, S(3).start - 0.1, 0.2) }}>
          &gt; {typed(prompt, S(3).start)}<span style={{ opacity: Math.floor(t * 3) % 2 ? 1 : 0 }}>▍</span>
        </div>
      </Projection>

      {/* 3 · it answers with questions; Leo answers them */}
      <Projection t={t} at={S(4).start} out={S(6).end} kind="REAL TEXT" title="round 1 · 7 questions" height={640} source={SRC}>
        <QuestionRow n={1} title={q(1).title} rec={firstSentence(q(1).rec)} recOn={0.6 + 0.4 * ramp(t, W(5, "each"), 0.4)} mark={t >= y1 ? "yes" : null} markK={(t - y1) / 0.25} />
        <QuestionRow n={2} title={q(2).title} rec={firstSentence(q(2).rec)} recOn={0.6 + 0.4 * ramp(t, W(5, "each"), 0.4)} mark={t >= y2 ? "yes" : null} markK={(t - y2) / 0.25} />
        <QuestionRow n={3} title={q(3).title} rec={firstSentence(q(3).rec)} recOn={0.6 + 0.4 * ramp(t, W(5, "each"), 0.4)} mark={t >= n3 ? "no" : null} markK={(t - n3) / 0.25} />
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: UI.muted }}>+ 4 more</div>
      </Projection>

      {/* 4 · the no changes the plan */}
      <Projection t={t} at={S(7).start} out={S(7).end} kind="REAL TEXT" title="round 2" height={380} source={SRC}>
        <ProjText size={52} text={ROUND2_LINE} />
      </Projection>

      {/* 5 · the rule: no code until you agree */}
      <Projection t={t} at={S(9).start} out={S(9).end} kind="REAL TEXT" title="grill-me's own rule" height={420} source="skills/productivity/grilling/SKILL.md">
        <ProjText size={48} text={RULE} />
      </Projection>

      <ProgressBar t={t} duration={END_AT} />
      <BrandLine t={t} brand="UNDER THE PROMPT" stamp="NIGHT LOG · TOOL" stampUntil={S(1).end} />
      {t < END_AT && <div style={{ position: "absolute", inset: 0, transform: `translateY(${lowK * 190}px)` }}>
        <CaptionPill t={t} chunks={chunks} accent={(wd) => (wd.speaker === "leo" ? UI.ice : UI.amber)} />
      </div>}
      <Audio src={staticFile("utp2611050601v2_en.wav")} />

      <EndCard t={t} at={END_AT} brand="UNDER THE PROMPT" line="/grill-me by Matt Pocock · free · MIT" />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1130, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 28, color: UI.muted, opacity: ramp(t, END_AT + 0.6, 0.3) }}>Link in the description.</div>
    </AbsoluteFill>
  );
};
