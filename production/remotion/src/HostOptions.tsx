/** Review still: one host candidate at the night desk with Mott. Choose with --props='{"host":"nico"|"ro"|"tito"}'. */
import React, { useMemo } from "react";
import { AbsoluteFill, getInputProps, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildMott, P } from "./brand/mott";
import { buildPerson, Look } from "./brand/person";
import { buildHostDesk, MOTT_SPOT } from "./brand/sets/hostDesk";
import { MONO, SANS, UI } from "./brand/ui";

export const HOSTS: Record<string, { name: string; role: string; look: Look }> = {
  host: { name: "Host", role: "intern · systems student",
    look: { skin: 0xecc8ae, hair: "fringe", hairColor: 0x0d0a09, top: 0x2b4f9e, polo: 0x22407f, bottom: 0x141417, shoes: 0x1c1c22, glasses: true, lips: 0xc48f8f, smile: 0.4, eyeSize: 0.0155 } },
  nico: { name: "Nico", role: "night-shift repair tech",
    look: { skin: 0x8d5a3c, hair: "curly", hairColor: 0x1a1210, top: 0x2a6f6a, bottom: 0x2b2b33, overlay: { kind: "apron", color: 0xb59f80 }, headlamp: true } },
  ro: { name: "Ro", role: "late-night radio host",
    look: { skin: 0xf0cdb0, hair: "bob", hairColor: 0x8e3f22, top: 0xcfc4b0, bottom: 0x23262e, overlay: { kind: "jacket", color: 0x22303a }, headphones: 0xc8553d } },
  tito: { name: "Tito", role: "retired engineer",
    look: { skin: 0xdcae8a, hair: "bald", hairColor: 0xb8b2aa, top: 0xcbc2b0, bottom: 0x3a3530, overlay: { kind: "jacket", color: 0x4e6b5c }, beard: 0xc9c3bb, glasses: true, build: 1.08 } },
};

const VIEWS: Record<string, { cam: [number, number, number]; look: [number, number, number]; fov: number }> = {
  front: { cam: [0.55, 1.42, 2.55], look: [0.0, 1.12, -0.3], fov: 34 },
  three4: { cam: [-1.3, 1.5, 1.6], look: [-0.1, 1.2, -0.5], fov: 34 },
  close: { cam: [0.12, 1.62, 0.55], look: [-0.1, 1.56, -0.5], fov: 30 },
};

const Scene: React.FC<{ t: number; host: string; view: string }> = ({ t, host, view }) => {
  const { camera } = useThree();
  const w = useMemo(() => {
    const set = buildHostDesk(), mott = buildMott(), person = buildPerson(HOSTS[host].look);
    const mh = new THREE.Group(); mh.add(mott.root); mh.scale.setScalar(0.1); mh.position.copy(MOTT_SPOT); mh.rotation.y = -0.5;
    person.root.position.set(-0.12, 0, -0.55); person.root.rotation.y = 0.15;
    return { set, mott, person, mh };
  }, [host]);
  const v = VIEWS[view] ?? VIEWS.front;
  camera.position.set(...v.cam);
  camera.lookAt(...v.look);
  (camera as THREE.PerspectiveCamera).fov = v.fov; (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  w.person.pose(t, { action: "talk", look: 0.25, talk: Math.max(0, Math.sin(t * 7)) * 0.5 });
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

export const HostOptions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const props = getInputProps() as { host?: string; view?: string };
  const host = props.host ?? "nico";
  const h = HOSTS[host] ?? HOSTS.nico;
  return (
    <AbsoluteFill style={{ background: UI.night }}>
      <ThreeCanvas width={width} height={height} shadows flat camera={{ fov: 34, near: 0.02, far: 40 }}
        gl={{ antialias: true }} onCreated={({ gl }) => { gl.shadowMap.type = THREE.PCFSoftShadowMap; }}>
        <Scene t={frame / fps} host={host in HOSTS ? host : "nico"} view={props.view ?? "front"} />
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 70, top: 200, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: UI.amber }}>HOST OPTION</div>
      <div style={{ position: "absolute", left: 70, top: 1480, fontFamily: SANS, fontWeight: 800, fontSize: 84, color: UI.cream }}>{h.name}</div>
      <div style={{ position: "absolute", left: 72, top: 1590, fontFamily: MONO, fontSize: 34, color: UI.muted }}>{h.role}</div>
    </AbsoluteFill>
  );
};
