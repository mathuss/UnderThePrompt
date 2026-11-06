/** Review reel: the intern's expression presets, one after another, labeled. Not a published video. */
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildMott, P } from "./brand/mott";
import { buildPerson, FACE, faceAt, FaceName, Action } from "./brand/person";
import { buildHostDesk, MOTT_SPOT } from "./brand/sets/hostDesk";
import { HOSTS } from "./HostOptions";
import { MONO, SANS, UI } from "./brand/ui";

const TURN = 3, EACH = 1.5;
const NAMES = Object.keys(FACE) as FaceName[];
const TRACK: [number, FaceName][] = [[0, "neutral"], ...NAMES.map((n, i) => [TURN + i * EACH, n] as [number, FaceName])];
export const HOST_EXPR_SECONDS = TURN + NAMES.length * EACH + 0.5;
const ACTION: Partial<Record<FaceName, Action>> = { surprised: "surprised", happy: "laugh", confused: "scratch", excited: "talk", curious: "lean" };

const Scene: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const w = useMemo(() => {
    const set = buildHostDesk(), mott = buildMott(), person = buildPerson(HOSTS.host.look);
    const mh = new THREE.Group(); mh.add(mott.root); mh.scale.setScalar(0.1); mh.position.copy(MOTT_SPOT); mh.rotation.y = -0.5;
    person.root.position.set(-0.12, 0, -0.55);
    return { set, mott, person, mh };
  }, []);
  // medium close-up on the face and hands
  camera.position.set(0.25, 1.54, 1.15);
  camera.lookAt(-0.1, 1.46, -0.5);
  const { face, name, since } = faceAt(t, TRACK);
  w.person.root.rotation.y = t < TURN ? Math.sin((t / TURN) * Math.PI * 2) * 0.9 + 0.15 : 0.15;
  const act = t < TURN ? "idle" : ACTION[name] ?? "idle";
  const amt = Math.min(1, since / 0.35) * (name === "curious" ? 0.35 : 1); // a light lean, not a dive at the camera
  w.person.pose(t, { action: act, amount: amt, face, talk: name === "excited" ? Math.max(0, Math.sin(t * 9)) * 0.3 : 0 });
  w.mott.pose(t, [[0, "curious"]]);
  w.set.update(t);
  return (
    <>
      <color attach="background" args={[P.night]} />
      <fog attach="fog" args={[P.night, 2.5, 7]} />
      <primitive object={w.set.group} />
      <primitive object={w.person.root} />
      <primitive object={w.mh} />
    </>
  );
};

export const HostExpr: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const { name } = faceAt(t, TRACK);
  return (
    <AbsoluteFill style={{ background: UI.night }}>
      <ThreeCanvas width={width} height={height} shadows flat camera={{ fov: 30, near: 0.02, far: 40 }}
        gl={{ antialias: true }} onCreated={({ gl }) => { gl.shadowMap.type = THREE.PCFSoftShadowMap; }}>
        <Scene t={t} />
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 70, top: 200, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: UI.amber }}>INTERN · EXPRESSIONS</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 72, color: UI.cream }}>{t < TURN ? "turnaround" : name}</div>
    </AbsoluteFill>
  );
};
