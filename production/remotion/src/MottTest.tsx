/** Test reel for the Mott component: a turntable, then each expression preset, labeled. Not a published video. */
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildMott, EXPRESSIONS, ExprName, P, Track } from "./brand/mott";
import { buildLampDesk } from "./brand/lampDesk";
import { MONO } from "./components";

const TURN = 3.5, EACH = 1.4;
const NAMES = Object.keys(EXPRESSIONS) as ExprName[];
const TRACK: Track = [[0, "neutral"], ...NAMES.map((n, i) => [TURN + i * EACH, n] as [number, ExprName])];
export const MOTT_TEST_SECONDS = TURN + NAMES.length * EACH + 0.6;

const Scene: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const { mott, set } = useMemo(() => ({ mott: buildMott(), set: buildLampDesk() }), []);
  camera.position.set(0, 0.8, 5.3);
  camera.lookAt(0, 0.72, 0);
  // turntable first, then a fixed 3/4 view for the expressions
  mott.root.rotation.y = t < TURN ? (t / TURN) * Math.PI * 2 : 0.28;
  mott.pose(t, TRACK);
  set.update(t);
  return (
    <>
      <color attach="background" args={[P.night]} />
      <fog attach="fog" args={[P.night, 3.4, 9]} />
      <primitive object={set.group} />
      <primitive object={mott.root} />
    </>
  );
};

export const MottTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const idx = TRACK.reduce((a, k, i) => (k[0] <= t ? i : a), 0);
  const label = t < TURN ? "turnaround" : TRACK[idx][1];
  return (
    <AbsoluteFill style={{ background: "#0E0B14" }}>
      <ThreeCanvas width={width} height={height} shadows flat camera={{ fov: 32, near: 0.05, far: 50 }}
        gl={{ antialias: true }} onCreated={({ gl }) => { gl.shadowMap.type = THREE.PCFSoftShadowMap; }}>
        <Scene t={t} />
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 70, top: 222, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: "#FFB23E" }}>
        MOTT · TEST REEL
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1500, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 54, color: "#FFF1D6" }}>
        {label}
      </div>
    </AbsoluteFill>
  );
};
