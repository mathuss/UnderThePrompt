/**
 * "Machine Room 1947": a stylized recreation of a relay computer hall, seen at Mott's scale
 * (Mott = 1 unit ≈ 4 cm, so a cabinet is a skyscraper). Schematic, not a replica: videos label it "recreation".
 * Instanced relays and indicator lamps keep it cheap to render.
 */
import * as THREE from "three";
import { P, mat, prng } from "../mott";

const PI = Math.PI;
export const AISLE_X = 2.4;            // cabinets stand at x = ±AISLE_X, faces toward the aisle
export const CAB_Z = [2, -2.2, -6.4, -10.6, -14.8];
export const CAB = { w: 3.8, h: 9, d: 1.2 };
/** Hero relay "#70": right row, third cabinet, at Mott's landing height. Faces the aisle (-x). */
export const HERO = new THREE.Vector3(AISLE_X - CAB.d / 2 - 0.55, 4.6, CAB_Z[2]); // chest height for a person when the room is scaled to metres

/**
 * @param S world scale. 1 = Mott units; 0.27 = metres (a 9-unit cabinet becomes 2.4 m).
 *          Light distances and intensities are compensated so the look is the same at any scale.
 */
export function buildMachineRoom(S = 1) {
  const rnd = prng(23);
  const outer = new THREE.Group(); outer.scale.setScalar(S);
  const group = new THREE.Group(); outer.add(group);
  const LK = (decay: number) => Math.pow(S, decay); // intensity compensation for physical falloff

  // light: warm hanging work lamps along the aisle (the motivated key), cool plum fill
  group.add(new THREE.HemisphereLight(0x5a4aa0, P.night, 0.35 * PI));
  group.add(new THREE.AmbientLight(P.plum, 0.35 * PI));
  const lamps: THREE.PointLight[] = [];
  CAB_Z.forEach((z, i) => {
    const l = new THREE.PointLight(P.amber, 5 * PI * LK(1.5), 9 * S, 1.5);
    l.position.set(0, 7.5, z);
    if (i === 2) { l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.003; }
    group.add(l); lamps.push(l);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.45, 8, 1, true), mat(0x2a2138, { side: THREE.DoubleSide }));
    shade.position.set(0, 7.9, z); group.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), new THREE.MeshBasicMaterial({ color: P.amber }));
    bulb.position.set(0, 7.68, z); group.add(bulb);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 4, 4), mat(0x2a2138));
    cord.position.set(0, 10.1, z); group.add(cord);
  });
  const hero = new THREE.SpotLight(P.amber, 0, 6 * S, 0.5, 0.6, 1.2); // lights relay #70 when the story finds it
  hero.position.set(HERO.x - 2.2, HERO.y + 2.4, HERO.z + 0.6);
  hero.target.position.copy(HERO); group.add(hero, hero.target);

  // wooden floor (planks)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 40), mat(0x2b1d17));
  floor.rotation.x = -PI / 2; floor.position.z = -6; floor.receiveShadow = true; group.add(floor);
  for (let i = -6; i <= 6; i++) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.005, 40), mat(0x1c120e));
    seam.position.set(i * 1.1, 0.003, -6); group.add(seam);
  }

  // cabinets with a grid of relays and indicator lamps (instanced)
  const cabM = mat(0x2b2236), relayM = mat(0x463b52), lampGeo = new THREE.SphereGeometry(0.06, 6, 4);
  const cols = 9, rows = 20, relayGeo = new THREE.BoxGeometry(0.34, 0.22, 0.16);
  const nCab = CAB_Z.length * 2;
  const relays = new THREE.InstancedMesh(relayGeo, relayM, nCab * cols * rows);
  const lampsI = new THREE.InstancedMesh(lampGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }), nCab * cols * rows);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1);
  const lampBase: { side: number; phase: number }[] = [];
  let k = 0;
  [-1, 1].forEach((side) => CAB_Z.forEach((z) => {
    const cab = new THREE.Mesh(new THREE.BoxGeometry(CAB.d, CAB.h, CAB.w), cabM);
    cab.position.set(side * AISLE_X, CAB.h / 2, z); cab.castShadow = true; cab.receiveShadow = true; group.add(cab);
    const faceX = side * (AISLE_X - CAB.d / 2) - side * 0.08;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const y = 0.9 + r * 0.38, zz = z - CAB.w / 2 + 0.3 + c * 0.4;
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), PI / 2);
      m4.compose(new THREE.Vector3(faceX, y, zz), q, one); relays.setMatrixAt(k, m4);
      m4.compose(new THREE.Vector3(faceX - side * 0.1, y + 0.08, zz + 0.12), q, one); lampsI.setMatrixAt(k, m4);
      lampBase.push({ side, phase: rnd() });
      k++;
    }
  }));
  relays.receiveShadow = true;
  group.add(relays, lampsI);

  // the hero relay: base, coil, armature (clicks), two contacts
  const relay = new THREE.Group(); relay.position.copy(HERO); relay.rotation.y = PI / 2; group.add(relay);
  const copper = mat(0xc7773f, { roughness: 0.55 }), steel = mat(0x9a93a8, { roughness: 0.4 }), dark = mat(0x1c1626);
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.16, 1.1), dark); base.position.y = -0.08; relay.add(base);
  const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.8, 10), copper); coil.position.set(-0.3, 0.4, 0); relay.add(coil);
  const yoke = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 0.36), steel); yoke.position.set(-0.72, 0.5, 0); relay.add(yoke);
  const arm = new THREE.Group(); arm.position.set(-0.72, 0.98, 0); relay.add(arm);
  const armBar = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.07, 0.34), steel); armBar.position.x = 0.66; arm.add(armBar);
  const cUp = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 8), mat(0xe8e2f0, { roughness: 0.3 })); cUp.position.set(1.3, -0.08, 0); arm.add(cUp);
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.72, 0.3), dark); post.position.set(0.62, 0.36, 0); relay.add(post);
  const cLow = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 8), mat(0xe8e2f0, { roughness: 0.3 })); cLow.position.set(0.62, 0.76, 0); relay.add(cLow);
  relay.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });

  // schematic moth caught between the contacts: flat grey, no face (videos label it "schematic")
  const gm = new THREE.MeshBasicMaterial({ color: 0x8c8698, side: THREE.DoubleSide, transparent: true, opacity: 0 });
  const moth = new THREE.Group(); moth.position.set(0.62, 0.86, 0.02); relay.add(moth);
  const w = new THREE.Shape(); w.moveTo(0, 0); w.quadraticCurveTo(0.08, 0.1, 0.17, 0.07); w.quadraticCurveTo(0.2, -0.02, 0.12, -0.06); w.quadraticCurveTo(0.05, -0.06, 0, 0);
  [-1, 1].forEach((s) => { const m = new THREE.Mesh(new THREE.ShapeGeometry(w, 6), gm); m.scale.x = s; moth.add(m); });
  const bodyG = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.12, 2, 6), gm); moth.add(bodyG);
  moth.rotation.set(0, 0, 0.2); moth.scale.setScalar(1.8); // shape plane faces the aisle camera; big enough to read

  const red = new THREE.Color(P.coral), amber = new THREE.Color(P.amber), off = new THREE.Color(0x3a2a20);
  const col = new THREE.Color();

  /**
   * @param on 0…1 lamps switching on (shot 3)
   * @param fault 0…1 lamps flicker coral (wrong answers)
   * @param click relay armature closed 0…1
   * @param found 0…1 hero spotlight + schematic moth visible
   */
  function update(t: number, { on = 1, fault = 0, click = 0, found = 0 }: { on?: number; fault?: number; click?: number; found?: number } = {}) {
    for (let i = 0; i < lampBase.length; i++) {
      const b = lampBase[i];
      const lit = on * 6 > b.phase * 6 + (b.side > 0 ? 0.5 : 0) ? 1 : 0;
      const blink = (Math.sin(t * (3 + b.phase * 5) + b.phase * 20) > 0.2 ? 1 : 0.35);
      const isFault = fault > 0 && b.phase < fault * 0.45 && Math.sin(t * 9 + b.phase * 40) > -0.2;
      col.copy(isFault ? red : amber).multiplyScalar(lit ? blink : 0);
      if (!lit) col.copy(off);
      lampsI.setColorAt(i, col);
    }
    lampsI.instanceColor!.needsUpdate = true;
    arm.rotation.z = -0.1 * click;
    hero.intensity = found * 9 * PI * LK(1.2);
    gm.opacity = found;
    lamps.forEach((l) => (l.intensity = 5 * PI * LK(1.5) * (0.25 + 0.75 * on)));
  }

  return { group: outer, update };
}
