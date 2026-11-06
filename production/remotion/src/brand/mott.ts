/**
 * Mott: the channel's host. Pure three.js, no React, so the same model can be used
 * by Remotion (ThreeCanvas) and by any preview page. This file IS the model sheet:
 * proportions, colours and expression presets come from brand/mott.md and must not drift.
 *
 * Animation is a pure function of time (Remotion renders frames out of order):
 *   const mott = buildMott();  mott.pose(t, track)   // track = [[time, "preset"], ...]
 */
import * as THREE from "three";

export const P = {
  night: 0x0e0b14, plum: 0x241b33, amber: 0xffb23e, ember: 0xff7a2f, violet: 0x7a68d8, lilac: 0xb9aef2, deep: 0x5b4bb8,
  ice: 0xa8e4ff, coral: 0xff5a6e, cream: 0xfff1d6, eye: 0x120d18, catch: 0xffe2a8, mouth: 0x2a1c3a,
} as const;

export const mat = (color: number, o: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, metalness: 0, ...o });

/** Deterministic PRNG so the faceted fuzz is identical in every video. */
export function prng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function jitter(geo: THREE.BufferGeometry, amt: number, rnd: () => number) {
  const p = geo.attributes.position as THREE.BufferAttribute;
  const seen = new Map<string, number>();
  for (let i = 0; i < p.count; i++) {
    const k = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
    if (!seen.has(k)) seen.set(k, 1 + (rnd() - 0.5) * 2 * amt);
    const s = seen.get(k)!;
    p.setXYZ(i, p.getX(i) * s, p.getY(i) * s, p.getZ(i) * s);
  }
  geo.computeVertexNormals();
  return geo;
}

const add = <T extends THREE.Object3D>(parent: THREE.Object3D, o: T, x = 0, y = 0, z = 0): T => {
  o.position.set(x, y, z);
  o.traverse((c) => { c.castShadow = true; });
  parent.add(o);
  return o;
};

/* ───────────── expression presets (brand/mott.md §2) ───────────── */
export type Expr = {
  spread: number; fwd: number; bendL: number; bendR: number; // antennae
  lid: number; asym: number; cat: number;                     // eyes: 0 open … 1 closed; asym closes the left more; catchlight scale
  mw: number; mh: number; mx: number;                         // mouth
  wing: number; lean: number; tilt: number; look: number;     // wings 0 folded … 1 open; body/head
  twitch: number; flutter: number; shiver: number; scale: number; dust: number;
};
const D: Expr = { spread: 0.44, fwd: 0.1, bendL: 0.15, bendR: 0.15, lid: 0.15, asym: 0, cat: 1, mw: 1, mh: 0.35, mx: 0,
  wing: 0, lean: 0, tilt: 0, look: 0, twitch: 0, flutter: 0, shiver: 0, scale: 1, dust: 0 };
const e = (o: Partial<Expr>): Expr => ({ ...D, ...o });

export const EXPRESSIONS = {
  neutral: e({}),
  curious: e({ spread: 0.34, fwd: 0.5, bendL: -0.25, bendR: -0.25, lid: 0, cat: 1.1, mw: 0.8, mh: 0.65, wing: 0.08, lean: 0.17, tilt: 0.05 }),
  excited: e({ spread: 0.28, fwd: 0.05, bendL: -0.15, bendR: -0.15, lid: 0, cat: 1.3, mw: 1.45, mh: 0.95, wing: 0.55, lean: 0.05, twitch: 1, flutter: 1 }),
  skeptical: e({ spread: 0.3, bendL: 0, bendR: 0.8, lid: 0.36, asym: 0.18, mw: 0.9, mh: 0.14, mx: 0.03, lean: -0.05, tilt: 0.22, look: 0.12 }),
  shocked: e({ spread: 0.04, fwd: -0.15, bendL: 0, bendR: 0, lid: -0.15, cat: 0.6, mw: 0.62, mh: 1.05, wing: 1, lean: -0.12 }),
  worried: e({ spread: 0.62, fwd: 0.25, bendL: 0.5, bendR: 0.5, lid: 0.3, cat: 0.9, mw: 0.7, mh: 0.3, wing: 0.05, lean: 0.06, tilt: -0.06, shiver: 1, scale: 0.95 }),
  sad: e({ spread: 0.95, fwd: 0.35, bendL: 0.95, bendR: 0.95, lid: 0.55, cat: 0.75, mw: 0.8, mh: 0.2, lean: 0.16, scale: 0.96 }),
  smug: e({ spread: 0.46, fwd: 0.05, bendL: 0.1, bendR: -0.55, lid: 0.5, asym: 0.08, mw: 1.3, mh: 0.24, wing: 0.25, lean: -0.1, tilt: 0.1 }),
  embarrassed: e({ spread: 0.72, fwd: 0.2, bendL: 0.8, bendR: 0.8, lid: 0.4, cat: 0.9, mw: 0.75, mh: 0.25, lean: 0.08, tilt: -0.12, look: 0.45, dust: 1, scale: 0.97 }),
} satisfies Record<string, Expr>;
export type ExprName = keyof typeof EXPRESSIONS;
export type PoseOpts = { talk?: number; fly?: number; point?: number; shield?: number; tap?: number };
export type Track = [number, ExprName][];

const KEYS = Object.keys(D) as (keyof Expr)[];
const smooth = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c); };

/** Expression state at time t from a track of [time, preset] keys. Blends 0.35 s (shocked snaps in 0.1 s). */
export function exprAt(t: number, track: Track) {
  let i = 0;
  while (i + 1 < track.length && track[i + 1][0] <= t) i++;
  const [t1, n1] = track[i];
  const n0 = i > 0 ? track[i - 1][1] : n1;
  const k = smooth((t - t1) / (n1 === "shocked" ? 0.1 : 0.35));
  const a = EXPRESSIONS[n0], b = EXPRESSIONS[n1], out = { ...b };
  KEYS.forEach((key) => { out[key] = a[key] + (b[key] - a[key]) * k; });
  return { x: out, name: n1, since: Math.max(0, t - t1) };
}

/** Seeded blink schedule: a blink every 3–5 s. Returns 0…1 closure. */
function blinkAt(t: number) {
  const r = prng(99);
  let at = 1.2;
  while (at < t + 1) {
    const d = t - at;
    if (d >= 0 && d < 0.16) return Math.sin((d / 0.16) * Math.PI);
    at += 3 + r() * 2;
  }
  return 0;
}

/* ───────────── model ───────────── */
export function buildMott() {
  const rnd = prng(7);
  const root = new THREE.Group(), upper = new THREE.Group();
  root.add(upper);
  const violet = mat(P.violet), lilac = mat(P.lilac), deep = mat(P.deep);

  // thorax + striped abdomen
  add(upper, new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(0.175, 1), 0.05, rnd), lilac), 0, 0.42, 0);
  const abd = add(upper, new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.05, 0.3, 8), violet), 0, 0.25, -0.1);
  abd.rotation.x = 0.5;
  [0.05, -0.02, -0.09].forEach((d) => {
    const r = 0.125 - (0.15 - d) * 0.25;
    add(abd, new THREE.Mesh(new THREE.CylinderGeometry(r + 0.004, r + 0.004, 0.028, 8, 1, true), mat(P.lilac, { side: THREE.DoubleSide })), 0, d, 0);
  });
  // legs
  [-1, 1].forEach((s) => {
    const leg = add(root, new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.012, 0.2, 5), deep), s * 0.07, 0.15, 0.04);
    leg.rotation.z = s * 0.12;
    add(root, new THREE.Mesh(new THREE.IcosahedronGeometry(0.026, 0), deep), s * 0.075, 0.04, 0.06);
  });
  // front limbs ("hands")
  const arms = [-1, 1].map((s) => {
    const g = add(upper, new THREE.Group(), s * 0.12, 0.47, 0.1);
    add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.011, 0.2, 5), deep), 0, -0.1, 0);
    add(g, new THREE.Mesh(new THREE.IcosahedronGeometry(0.022, 0), lilac), 0, -0.2, 0);
    return { s, g };
  });

  // wings: forewing carries the eyespot (amber ring + dark centre + cursor bar "_")
  const fore = new THREE.Shape();
  fore.moveTo(0, 0); fore.quadraticCurveTo(0.22, 0.34, 0.6, 0.3); fore.quadraticCurveTo(0.76, 0.12, 0.6, -0.08); fore.quadraticCurveTo(0.3, -0.2, 0, 0);
  const hind = new THREE.Shape();
  hind.moveTo(0, 0); hind.quadraticCurveTo(0.22, -0.04, 0.42, -0.18); hind.quadraticCurveTo(0.36, -0.44, 0.12, -0.34); hind.quadraticCurveTo(0, -0.18, 0, 0);
  const ds = { side: THREE.DoubleSide };
  const wingM = mat(P.violet, ds), edgeM = mat(P.lilac, ds), inM = mat(P.deep, ds);
  const amberM = new THREE.MeshStandardMaterial({ color: P.amber, emissive: P.amber, emissiveIntensity: 0.55, flatShading: true, ...ds });
  const nightM = new THREE.MeshBasicMaterial({ color: P.night, ...ds });
  const wings = [-1, 1].map((s) => {
    const pivot = add(upper, new THREE.Group(), s * 0.05, 0.5, -0.09);
    const flip = new THREE.Group(); flip.scale.x = s; pivot.add(flip);
    const f = new THREE.Group(); flip.add(f);
    const edge = add(f, new THREE.Mesh(new THREE.ShapeGeometry(fore, 10), edgeM), -0.01, 0, -0.003); edge.scale.setScalar(1.05);
    add(f, new THREE.Mesh(new THREE.ShapeGeometry(fore, 10), wingM));
    const inner = add(f, new THREE.Mesh(new THREE.ShapeGeometry(fore, 10), inM), 0, 0, 0.002); inner.scale.setScalar(0.45);
    add(f, new THREE.Mesh(new THREE.RingGeometry(0.052, 0.078, 18), amberM), 0.42, 0.12, 0.004);
    add(f, new THREE.Mesh(new THREE.CircleGeometry(0.052, 18), nightM), 0.42, 0.12, 0.003);
    add(f, new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.016), amberM), 0.42, 0.1, 0.005);
    const h = add(flip, new THREE.Group(), 0, -0.02, -0.01);
    const he = add(h, new THREE.Mesh(new THREE.ShapeGeometry(hind, 8), edgeM), 0, 0, -0.003); he.scale.setScalar(1.06);
    add(h, new THREE.Mesh(new THREE.ShapeGeometry(hind, 8), wingM));
    return { s, pivot, h };
  });

  // head
  const head = add(upper, new THREE.Group(), 0, 0.74, 0);
  add(head, new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(0.225, 1), 0.03, rnd), violet)).scale.set(1.08, 1, 0.95);
  [-1, 1].forEach((s) => add(head, new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(0.045, 0), 0.1, rnd), lilac), s * 0.135, -0.085, 0.14));
  const eyeM = new THREE.MeshStandardMaterial({ color: P.eye, roughness: 0.18, metalness: 0.1 });
  const catchM = new THREE.MeshBasicMaterial({ color: P.catch });
  const lidM = mat(P.violet, ds);
  const eyes = [-1, 1].map((s) => {
    const g = add(head, new THREE.Group(), s * 0.105, 0.035, 0.165);
    // Eye, catchlight and lid share ONE squash group. The lid rotates *inside* it,
    // so it stays concentric with the eye at every angle (fix for the lid/eye overlap).
    const squash = new THREE.Group(); squash.scale.set(1, 1.12, 0.62); g.add(squash);
    add(squash, new THREE.Mesh(new THREE.SphereGeometry(0.085, 18, 14), eyeM));
    const c = add(squash, new THREE.Mesh(new THREE.SphereGeometry(0.017, 8, 6), catchM), -0.026, 0.036, 0.074);
    const lidPivot = new THREE.Group(); squash.add(lidPivot);
    add(lidPivot, new THREE.Mesh(new THREE.SphereGeometry(0.092, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), lidM));
    return { s, c, lidPivot };
  });
  const mouth = add(head, new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), mat(P.mouth, { roughness: 0.5 })), 0, -0.118, 0.186);

  // antennae: two segments so the tips can curl; 6 feathery barbs per side
  const barbM = mat(P.lilac);
  const ants = [-1, 1].map((s) => {
    const base = add(head, new THREE.Group(), s * 0.09, 0.19, 0.04);
    const seg1 = new THREE.Group(); base.add(seg1);
    add(seg1, new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.3, 5), deep), 0, 0.15, 0);
    const seg2 = add(seg1, new THREE.Group(), 0, 0.3, 0);
    add(seg2, new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.008, 0.25, 5), deep), 0, 0.125, 0);
    for (let i = 0; i < 6; i++) for (const k of [-1, 1]) {
      const b = add(i < 3 ? seg1 : seg2, new THREE.Mesh(new THREE.BoxGeometry(0.075 - (i % 3) * 0.012, 0.008, 0.012), barbM),
        k * 0.034, i < 3 ? 0.09 + i * 0.075 : 0.04 + (i - 3) * 0.068, 0);
      b.rotation.z = k * 0.55;
    }
    return { s, seg1, seg2 };
  });

  // dust puff (embarrassed)
  const N = 26, dustPos = new Float32Array(N * 3), dustV: number[][] = [];
  for (let i = 0; i < N; i++) dustV.push([(rnd() - 0.5) * 0.6, rnd() * 0.5, (rnd() - 0.5) * 0.3]);
  const dustG = new THREE.BufferGeometry(); dustG.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dustM = new THREE.PointsMaterial({ color: P.lilac, size: 0.025, transparent: true, opacity: 0 });
  root.add(new THREE.Points(dustG, dustM));

  /**
   * Set every joint for time t.
   * - talk 0…1: voice envelope; opens the mouth on top of the preset
   * - fly 0…1: hover/flight (wings open, beating at a readable 4 Hz)
   * - point 0…1: right front limb + both antennae aim forward ("Antenna Check")
   * - shield 0…1: left forewing covers the face ("Wing Shield")
   * - tap 0…1: right limb raised high (the "Lamp Tap")
   */
  function pose(t: number, track: Track, o: PoseOpts = {}) {
    const { talk = 0, fly = 0, point = 0, shield = 0, tap = 0 } = o;
    const { x, name, since } = exprAt(t, track);
    const twitch = x.twitch * (since < 0.6 ? Math.sin(t * 50) * 0.12 : 0);
    ants.forEach((a) => {
      a.seg1.rotation.z = -a.s * (x.spread * (1 - point * 0.6) + twitch);
      a.seg1.rotation.x = x.fwd + point * 0.9;
      a.seg2.rotation.z = -a.s * (a.s < 0 ? x.bendL : x.bendR);
    });
    const bl = blinkAt(t);
    eyes.forEach((ey) => {
      const c = Math.min(1, Math.max(-0.2, x.lid + (ey.s < 0 ? x.asym : -x.asym * 0.4)));
      const closed = Math.max(c, bl);
      // 0 = open (lid cap behind the eye), 0.5 = upper half covered, 1 = closed
      ey.lidPivot.rotation.x = Math.max(-1.75, -Math.PI / 2 + closed * Math.PI);
      ey.c.scale.setScalar(x.cat);
      ey.c.visible = closed < 0.36; // the catchlight sits in the upper third; hide it once the lid passes it
    });
    mouth.scale.set(x.mw * (1 - talk * 0.15), Math.max(x.mh, 0.3 + talk * 0.8), 0.32);
    mouth.position.x = x.mx;
    head.rotation.set(0, x.look, x.tilt);
    upper.rotation.x = x.lean;
    const shiver = x.shiver * Math.sin(t * 75) * 0.04;
    const flutter = x.flutter && since < 0.9 ? Math.sin(t * 30) * 0.5 : 0;
    const beat = Math.sin(t * Math.PI * 8) * fly; // 4 Hz
    wings.forEach((w) => {
      const op = Math.max(x.wing, fly * 0.85);
      let ry = w.s * (1.25 * (1 - op) + 0.22 * op + flutter * 0.4 + shiver + beat * 0.55);
      let rz = w.s * (-0.55 * (1 - op) + 0.3 * op + beat * 0.25);
      if (w.s < 0 && shield > 0) { ry += (1.45 - ry) * shield; rz += (-0.35 - rz) * shield; } // left wing swings forward over the face
      w.pivot.rotation.y = ry; w.pivot.rotation.z = rz;
      w.h.rotation.z = -0.15 * op;
    });
    arms.forEach((a) => {
      const up = a.s > 0 ? Math.max(point * 0.55, tap) : 0;
      a.g.rotation.set(-0.35 - up * 2.3, 0, a.s * (0.35 - up * 0.2));
    });
    const hop = x.twitch && since < 0.5 ? Math.sin((since / 0.5) * Math.PI) * 0.06 : 0;
    root.position.y = Math.sin(t * Math.PI) * 0.008 + hop + fly * Math.sin(t * Math.PI * 8 + 1) * 0.02;
    root.scale.setScalar(x.scale);
    dustM.opacity = name === "embarrassed" ? Math.max(0, 0.9 - since * 0.6) : 0;
    const s = Math.min(since, 2) * 0.5;
    for (let i = 0; i < N; i++) { const v = dustV[i]; dustPos.set([v[0] * s, 0.5 + v[1] * s, -0.1 + v[2] * s], i * 3); }
    dustG.attributes.position.needsUpdate = true;
    return name;
  }

  return { root, pose };
}
