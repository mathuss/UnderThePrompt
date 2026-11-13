/**
 * UTP-20261105-06 "One prompt" (grill-me). Dialogue format: Leo brings the problem, Mott explains what's under it.
 * Script and sources: production/UTP-20261105-06/script.md · real session text: session.md.
 * One timeline scene per script line (line 26 is silence, so there is no scene 26). Everything is keyed to sync words.
 */
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildMott, P, Track } from "../brand/mott";
import { buildPerson, faceAt, FaceName } from "../brand/person";
import { buildHostDesk, PERCH, LAMP_Y_DIALOGUE } from "../brand/sets/hostDesk";
import { HOSTS } from "../HostOptions";
import { makeSync, ramp, lerp, lerp3, smooth, clamp01, Timeline } from "../brand/sync";
import { ProgressBar, BrandLine, CaptionPill, Card, EndCard, MONO, SANS, UI } from "../brand/ui";
import { Projection, ProjText, QuestionRow, DecisionTree } from "../brand/projection";
import tlJson from "../data/utp2611050601_en.json";
import envMott from "../data/utp2611050601_env_mott.json";
import envLeo from "../data/utp2611050601_env_leo.json";
import session from "../data/utp2611050601_session.json";

const TL = tlJson as unknown as Timeline;
const EM = (envMott as { env: number[] }).env, EL = (envLeo as { env: number[] }).env;
const { W, S, chunks } = makeSync(TL);

/* ───────────── beats ───────────── */
const SIL0 = W(25, "lamp", 0, "end"), SIL1 = S(27).start;      // line 26: Mott has no answer
const YES_END = W(28, "yes", 0, "end");
const T = {
  proj14: W(14, "grill") - 0.15,
  tap: YES_END + 1.0,
};
const END_AT = T.tap + 0.45;
export const EP2611050601_DURATION = END_AT + 2.8;

const sceneId = (t: number) => (TL.scenes.find((s) => t < s.end) ?? TL.scenes[TL.scenes.length - 1]).id;
const u = (t: number, id: number) => clamp01((t - S(id).start) / (S(id).end - S(id).start));

type Shot = "leo" | "mott" | "mottLamp" | "two" | "proj" | "split" | "wide";
const LEO_IDS = [1, 3, 5, 7, 9, 12, 15, 17, 19, 22], MOTT_IDS = [2, 4, 6, 8, 11, 13, 20, 23];
function shotAt(t: number): Shot {
  const id = sceneId(t);
  if (LEO_IDS.includes(id)) return "leo";
  if (MOTT_IDS.includes(id)) return "mott";
  if (id === 10 || id === 27) return "two";
  if (id === 14) return t < T.proj14 ? "mott" : "proj";
  if (id === 16 || id === 18 || id === 21) return "proj";
  if (id === 24) return "split";
  if (id === 25) return t < SIL0 + 0.3 ? "leo" : "mottLamp";
  return t < YES_END + 0.2 ? "mott" : "wide"; // 28
}

/* ───────────── stage ───────────── */
type V3 = [number, number, number];
type Cam = { pos: V3; look: V3; fov: number; shift?: number }; // shift: pixels the picture moves down, to clear the projection
const LEO_POS: V3 = [-0.12, 0, -0.62], LEO_HEAD: V3 = [-0.11, 1.17, -0.6];
const MOTT_AT: V3 = [PERCH.x, PERCH.y, PERCH.z], MOTT_HEAD: V3 = [PERCH.x, PERCH.y + 0.075, PERCH.z];
const LAMP: V3 = [-0.5, LAMP_Y_DIALOGUE, 0.2];
const CAM_LEO: Cam = { pos: [0.12, 1.2, 1.12], look: [-0.11, 1.12, -0.6], fov: 34 };   // from the front, Mott and his books on the right edge
const CAM_MOTT: Cam = { pos: [0.2, 1.24, -0.66], look: [MOTT_HEAD[0], MOTT_HEAD[1] - 0.012, MOTT_HEAD[2]], fov: 22 }; // over Leo's right shoulder
// two-shot: square to the line between their heads, so both are in profile and neither covers the other
const MID: V3 = [(LEO_HEAD[0] + MOTT_HEAD[0]) / 2, 1.12, (LEO_HEAD[2] + MOTT_HEAD[2]) / 2];
const CAM_TWO: Cam = { pos: [MID[0] - 0.78 * 2.6, 1.2, MID[2] + 0.62 * 2.6], look: MID, fov: 40 };
const CAM_PROJ: Cam = { pos: [MID[0] - 0.78 * 2.5, 1.2, MID[2] + 0.62 * 2.5], look: MID, fov: 34, shift: 330 };
const CAM_SPLIT: Cam = { pos: [-0.9, 1.36, 1.4], look: [-0.11, 1.2, -0.45], fov: 34, shift: 330 };
// line 26: seen from the lamp's side, so his face stays readable when he turns to the light
const CAM_MOTT_LAMP: Cam = { pos: [-0.22, 1.33, 0.22], look: [MOTT_HEAD[0], MOTT_HEAD[1] - 0.01, MOTT_HEAD[2]], fov: 20 };
const push = (c: Cam, k: number, amt = 0.06): Cam => ({ ...c, pos: lerp3(c.pos, c.look, k * amt) as V3 });

function camAt(t: number): Cam {
  const id = sceneId(t), k = smooth(u(t, id)), shot = shotAt(t);
  if (shot === "leo") return push(CAM_LEO, k, 0.08);
  if (shot === "mott") return push(CAM_MOTT, k);
  if (shot === "mottLamp") return push(CAM_MOTT_LAMP, ramp(t, SIL0 + 0.3, SIL1 - SIL0), 0.1);
  if (shot === "two") return push(CAM_TWO, k, 0.1);
  if (shot === "proj") return CAM_PROJ;
  if (shot === "split") return CAM_SPLIT;
  const q = ramp(t, YES_END + 0.2, 1.2);
  return { pos: lerp3([0.35, 1.3, 2.0], [0.25, 1.36, 2.3], q) as V3, look: [-0.12, 1.24, -0.2], fov: 34 };
}

const MOTT_TRACK: Track = [[0, "neutral"], [S(2).start, "curious"], [S(4).start, "skeptical"], [S(8).start, "smug"], [S(11).start, "neutral"],
  [S(13).start, "skeptical"], [S(14).start, "curious"], [S(16).start, "neutral"], [S(20).start, "skeptical"], [S(21).start, "smug"],
  [S(23).start, "neutral"], [S(25).start, "curious"], [SIL0 + 0.3, "worried"], [SIL0 + 1.1, "embarrassed"], [S(28).start, "sad"], [T.tap - 0.35, "curious"]];
const LEO_TRACK: [number, FaceName][] = [[0, "smug"], [S(2).start, "happy"], [S(3).start, "smug"], [S(4).start, "neutral"], [S(5).start, "thinking"],
  [S(6).start, "neutral"], [S(7).start, "confused"], [S(8).start, "worried"], [S(9).start - 0.55, "guilty"], [S(10).start, "skeptical"],
  [S(11).start, "neutral"], [S(12).start, "smug"], [S(13).start, "worried"], [S(15).start, "curious"], [S(16).start, "neutral"], [S(17).start, "curious"],
  [S(18).start, "neutral"], [S(19).start, "skeptical"], [S(21).start, "curious"], [S(23).start, "neutral"],
  [W(24, "no") - 0.15, "surprised"], [W(24, "wait"), "thinking"], [S(25).start, "smug"], [S(28).start, "happy"]];

/** Mott acts small: expressions at half strength, slower blends, almost no twitching (user direction, 2026-11-12). */
const MOTT_INTENSITY = 0.5;
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

const Scene: React.FC<{ t: number; frame: number; width: number; height: number }> = ({ t, frame, width, height }) => {
  const { camera } = useThree();
  const w = useMemo(() => {
    const desk = buildHostDesk({ dialogue: true });
    const leo = buildPerson(HOSTS.host.look); leo.root.position.set(...LEO_POS); leo.root.rotation.y = 0.1; desk.group.add(leo.root);
    const mott = buildMott(), mottHolder = new THREE.Group(); mottHolder.add(mott.root); mottHolder.scale.setScalar(0.1); desk.group.add(mottHolder);
    // emote: a small faceted drop by Leo's temple (ice = Leo's colour)
    const drop = new THREE.Mesh(new THREE.OctahedronGeometry(0.016, 0), new THREE.MeshBasicMaterial({ color: P.ice })); drop.scale.set(1, 1.7, 1); leo.head.add(drop);
    return { desk, leo, mott, mottHolder, drop };
  }, []);

  const id = sceneId(t), shot = shotAt(t), cam = camAt(t), pc = camera as THREE.PerspectiveCamera;
  pc.position.set(...cam.pos); pc.fov = cam.fov;
  if (cam.shift) pc.setViewOffset(width, height, 0, -cam.shift, width, height); else pc.clearViewOffset();
  pc.updateProjectionMatrix(); pc.lookAt(...cam.look);

  const talkM = EM[Math.min(frame, EM.length - 1)] ?? 0, talkL = EL[Math.min(frame, EL.length - 1)] ?? 0;

  // Mott: on the book stack, at Leo's eye level; at the end he flies up and taps the lamp
  const go = smooth((t - (YES_END + 0.3)) / 0.6);
  w.mottHolder.position.set(...(lerp3(MOTT_AT, [LAMP[0] + 0.08, LAMP[1] - 0.14, LAMP[2] + 0.02], go) as V3));
  const mh = w.mottHolder.position, toLeo = [LEO_HEAD[0] - mh.x, LEO_HEAD[1] - (mh.y + 0.075), LEO_HEAD[2] - mh.z];
  const mottYaw = Math.atan2(toLeo[0], toLeo[2]), mottPitch = Math.atan2(toLeo[1], Math.hypot(toLeo[0], toLeo[2]));
  w.mottHolder.rotation.y = lerp(mottYaw, -0.4, go);
  // line 26: no answer. He turns to the lamp instead (his weakness for light)
  const away = ramp(t, SIL0 + 0.45, 0.5) * (1 - ramp(t, S(28).start - 0.1, 0.4));
  const lampYaw = Math.max(-1.1, Math.min(1.1, wrap(Math.atan2(LAMP[0] - mh.x, LAMP[2] - mh.z) - mottYaw)));
  const projOn = shot === "proj" ? 1 : 0;
  w.mott.pose(t, MOTT_TRACK, { talk: talkM, fly: go, tap: ramp(t, T.tap - 0.15, 0.15), point: projOn * ramp(t, id === 14 ? T.proj14 : S(id).start, 0.3),
    gazePitch: lerp(mottPitch * (1 - go), 0.4, away), gazeYaw: lampYaw * away * 0.8, intensity: MOTT_INTENSITY });

  // Leo: seated, looks at Mott (or at his screen while he types)
  const lf = faceAt(t, LEO_TRACK);
  const typing = id === 24;
  const toMott = [mh.x - LEO_HEAD[0], mh.y + 0.075 - LEO_HEAD[1], mh.z - LEO_HEAD[2]];
  const yawToMott = Math.atan2(toMott[0], toMott[2]) - 0.1;
  const pitchToMott = Math.max(-0.6, Math.min(0.6, -Math.atan2(toMott[1], Math.hypot(toMott[0], toMott[2])) * 0.8)); // < 0 looks up
  const atScreen = typing ? 1 - ramp(t, W(24, "wait") + 0.5, 0.4) : 0;
  const leoAct = typing ? "type" : lf.name === "confused" ? "scratch" : talkL > 0.1 ? "talk" : "idle";
  w.leo.pose(t, { sit: 1, action: leoAct, amount: leoAct === "talk" ? 0.55 : Math.min(1, lf.since / 0.35), face: lf.face,
    look: lerp(yawToMott, -0.1, atScreen), lookPitch: lerp(pitchToMott, 0.3, atScreen), talk: talkL * 0.8 });
  const dk = clamp01((t - (S(9).start - 0.45)) / 1.6);
  w.drop.visible = dk > 0 && dk < 1; w.drop.position.set(0.118, 0.12 - dk * 0.06, 0.085);

  // the lamp: a quick dip when a projection starts, off after the tap
  const starts = [T.proj14, S(16).start, S(18).start, S(21).start, S(24).start];
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
const SKILL_P1 = session.skillFile.firstParagraphs[0];
const ROUND2_LINE = R2.intro.split(". ")[1].split(",")[0] + "…"; // "Your sync requirement changes Q3…"
const SRC_SESSION = `real session · Claude Code + grill-me · ${session.captured}`;

export const Ep2611050601: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const shot = shotAt(t);
  const low = shot === "proj" || shot === "split";
  const y1 = W(24, "yes", 0), y2 = W(24, "yes", 1), n3 = W(24, "no");
  return (
    <AbsoluteFill style={{ background: UI.night }}>
      <ThreeCanvas width={width} height={height} shadows flat camera={{ fov: 32, near: 0.01, far: 40 }}
        gl={{ antialias: true }} onCreated={({ gl }) => { gl.shadowMap.type = THREE.PCFSoftShadowMap; }}>
        <Scene t={t} frame={frame} width={width} height={height} />
      </ThreeCanvas>

      {/* line 3: Leo's whole plan */}
      <Card t={t} at={S(3).start + 0.1} out={S(3).end - 0.1} x={540} y={300} w={820} tone="ice" tab="▍_ prompt" title="Build me a habit tracker." typed />

      {/* line 14: the skill, named after we saw it work */}
      <Projection t={t} at={T.proj14} out={S(14).end} kind="REAL TEXT" title="github.com/mattpocock/skills" height={470} source="repo page · MIT licence · read 2026-11-11">
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 84, color: UI.amber, marginTop: 26 }}>/grill-me</div>
        <ProjText text="A relentless interview to sharpen a plan or design." size={36} />
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, color: UI.cream, marginTop: 26, opacity: ramp(t, W(14, "free") - 0.1, 0.2) }}>MIT · free · ★ 322k <span style={{ color: UI.muted, fontWeight: 500 }}>(whole collection)</span></div>
      </Projection>

      {/* line 16: what a skill is */}
      <Projection t={t} at={S(16).start} out={S(16).end} kind="REAL TEXT" title="skills/productivity/grilling/SKILL.md" height={560} source="installed file · mattpocock-skills 1.3.1">
        <ProjText mono size={30} color={UI.muted} text={"---\nname: grilling\n---"} />
        <div style={{ height: 22 }} />
        <ProjText size={36} text={SKILL_P1} />
      </Projection>

      {/* line 18: the idea, drawn */}
      <Projection t={t} at={S(18).start} out={S(18).end} kind="SCHEMATIC" title="a plan as a tree of decisions" height={600}>
        <DecisionTree k={clamp01((t - W(18, "until")) / (S(18).end - 0.5 - W(18, "until")))} />
        <div style={{ display: "flex", gap: 40, fontFamily: MONO, fontWeight: 700, fontSize: 26, marginTop: 4 }}>
          <span style={{ color: UI.ice }}>○ open</span><span style={{ color: UI.amber }}>● settled</span>
        </div>
      </Projection>

      {/* line 21: one real question with its recommended answer */}
      <Projection t={t} at={S(21).start} out={S(21).end} kind="REAL TEXT" title="round 1 · question 7 of 7" height={500} source={SRC_SESSION}>
        <QuestionRow n={7} title={q(7).title} body={q(7).body} rec={q(7).rec} size={34} recOn={ramp(t, W(21, "brings"), 0.3)} mark="yes" markK={(t - W(21, "yes")) / 0.3} />
      </Projection>

      {/* line 24: Leo answers the real round */}
      <Projection t={t} at={S(24).start} out={S(24).end} kind="REAL TEXT" title="round 1 · 7 questions" height={690} source={SRC_SESSION}>
        <QuestionRow n={1} title={q(1).title} rec={firstSentence(q(1).rec)} mark={t >= y1 ? "yes" : null} markK={(t - y1) / 0.25} />
        <QuestionRow n={2} title={q(2).title} rec={firstSentence(q(2).rec)} mark={t >= y2 ? "yes" : null} markK={(t - y2) / 0.25} />
        <QuestionRow n={3} title={q(3).title} rec={firstSentence(q(3).rec)} mark={t >= n3 ? "no" : null} markK={(t - n3) / 0.25} />
        <div style={{ opacity: ramp(t, W(24, "wait") + 0.45, 0.3), borderTop: "1px solid rgba(255,241,214,.2)", paddingTop: 16 }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: UI.muted, marginBottom: 6 }}>round 2</div>
          <ProjText size={34} text={ROUND2_LINE} />
        </div>
      </Projection>

      <ProgressBar t={t} duration={END_AT} />
      <BrandLine t={t} brand="UNDER THE PROMPT" stamp="NIGHT LOG · INCIDENT" stampUntil={S(1).end} />
      {t < END_AT && <div style={{ position: "absolute", inset: 0, transform: `translateY(${low ? 190 : 0}px)` }}>
        <CaptionPill t={t} chunks={chunks} accent={(wd) => (wd.speaker === "leo" ? UI.ice : UI.amber)} />
      </div>}

      <EndCard t={t} at={END_AT} brand="UNDER THE PROMPT" line="Send this to the friend who says “just build it”." />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1130, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 26, color: UI.muted, opacity: ramp(t, END_AT + 0.6, 0.3) }}>Sources in the description.</div>
      <Audio src={staticFile("utp2611050601_en.wav")} />
    </AbsoluteFill>
  );
};
