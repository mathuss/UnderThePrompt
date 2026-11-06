/**
 * Low-poly people for every video: the recurring host and the people in the stories
 * (engineers, visitors, historical figures shown without likeness).
 * Pure three.js. Units are metres (~1.7 m tall). Animation is a pure function of time.
 *
 * Style rules (brand/identity.md): flat-shaded and matte, simple face (disc eyes, box brows,
 * dark mouth), no violet (reserved for Mott), muted clothing so the lit story element pops.
 */
import * as THREE from "three";
import { mat } from "./mott";

export type Hair = "curly" | "bob" | "short" | "bun" | "bald" | "cap" | "modern" | "fringe";
export type Look = {
  skin: number; hair: Hair; hairColor: number;
  top: number; bottom: number; shoes?: number;
  overlay?: { kind: "apron" | "jacket" | "vest" | "uniform"; color: number };
  tie?: number; skirt?: boolean; beard?: number; polo?: number; lips?: number; smile?: number; eyeSize?: number; // polo: collar + placket in this colour
  headlamp?: boolean; headphones?: number; glasses?: boolean;
  height?: number; build?: number; // 1 = average
  silhouette?: boolean;             // historical figures: one dark material, no face
};

export type Action = "idle" | "walk" | "point" | "inspect" | "reach" | "write" | "scratch" | "talk" | "laugh" | "wave" | "surprised" | "lean";
export type Face = { browUp: number; browInner: number; browAsym: number; lid: number; lidAsym: number; smile: number; open: number; mouthX: number; tilt: number; turn: number; lean: number };
export type PersonPose = { action?: Action; amount?: number; look?: number; talk?: number; walkSpeed?: number; phase?: number; face?: Partial<Face> };

/* ───────────── facial expression presets (shared by every person) ───────────── */
const F0: Face = { browUp: 0, browInner: 0, browAsym: 0, lid: 0.12, lidAsym: 0, smile: 0.2, open: 0, mouthX: 0, tilt: 0, turn: 0, lean: 0 };
const f = (o: Partial<Face>): Face => ({ ...F0, ...o });
export const FACE = {
  neutral: F0,
  curious: f({ browUp: 0.35, browAsym: 0.5, lid: 0.02, smile: 0.25, tilt: 0.1, lean: 0.06 }),
  surprised: f({ browUp: 1, lid: -0.15, smile: 0, open: 0.75, lean: -0.05 }),
  happy: f({ browUp: 0.25, lid: 0.42, smile: 1, open: 0.35 }),
  skeptical: f({ browUp: -0.15, browAsym: 0.7, lid: 0.35, lidAsym: -0.2, smile: -0.1, mouthX: 0.006, tilt: -0.08 }),
  confused: f({ browInner: 0.7, browAsym: 0.4, lid: 0.15, smile: -0.25, open: 0.12, tilt: 0.18 }),
  worried: f({ browInner: 0.9, browUp: 0.1, lid: 0.18, smile: -0.6, lean: 0.04 }),
  excited: f({ browUp: 0.7, lid: 0, smile: 0.9, open: 0.55 }),
  thinking: f({ browUp: -0.25, browInner: -0.3, lid: 0.3, smile: 0, turn: 0.25, tilt: 0.08 }),
} satisfies Record<string, Face>;
export type FaceName = keyof typeof FACE;
const FKEYS = Object.keys(F0) as (keyof Face)[];
/** Face at time t from a [time, preset] track, blended over 0.3 s (surprised snaps in 0.1 s). */
export function faceAt(t: number, track: [number, FaceName][]): { face: Face; name: FaceName; since: number } {
  let i = 0; while (i + 1 < track.length && track[i + 1][0] <= t) i++;
  const [t1, n1] = track[i], n0 = i > 0 ? track[i - 1][1] : n1;
  const x = Math.min(1, Math.max(0, (t - t1) / (n1 === "surprised" ? 0.1 : 0.3))), k = x * x * (3 - 2 * x);
  const a = FACE[n0], b = FACE[n1], out = { ...b };
  FKEYS.forEach((key) => (out[key] = a[key] + (b[key] - a[key]) * k));
  return { face: out, name: n1, since: t - t1 };
}
/** Seeded natural blinks every 3–5 s. */
function blinkAt(t: number) {
  let at = 1.4, seed = 5;
  while (at < t + 1) {
    const d = t - at;
    if (d >= 0 && d < 0.15) return Math.sin((d / 0.15) * Math.PI);
    seed = (seed * 16807) % 2147483647; at += 3 + (seed / 2147483647) * 2;
  }
  return 0;
}

export function buildPerson(L: Look) {
  const H = L.height ?? 1, B = L.build ?? 1;
  const dark = L.silhouette ? mat(0x120d18, { roughness: 1 }) : null;
  const M = (c: number) => dark ?? mat(c);
  const skin = M(L.skin), top = M(L.top), bottom = M(L.bottom), shoes = M(L.shoes ?? 0x241b22), hairM = M(L.hairColor);

  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body); body.scale.setScalar(H);
  const hips = new THREE.Group(); hips.position.y = 0.84; body.add(hips);
  const add = <T extends THREE.Object3D>(p: THREE.Object3D, o: T, x = 0, y = 0, z = 0) => { o.position.set(x, y, z); o.traverse((c) => (c.castShadow = true)); p.add(o); return o; };

  // legs: hip → knee → foot
  const legs = [-1, 1].map((s) => {
    const hip = add(hips, new THREE.Group(), s * 0.1 * B, 0, 0);
    add(hip, new THREE.Mesh(new THREE.CylinderGeometry(0.07 * B, 0.06 * B, 0.42, 8), bottom), 0, -0.21, 0);
    const knee = add(hip, new THREE.Group(), 0, -0.42, 0);
    add(knee, new THREE.Mesh(new THREE.CylinderGeometry(0.057 * B, 0.046 * B, 0.38, 8), L.skirt ? skin : bottom), 0, -0.19, 0);
    add(knee, new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.2), shoes), 0, -0.39, 0.04);
    return { s, hip, knee };
  });
  if (L.skirt) add(hips, new THREE.Mesh(new THREE.CylinderGeometry(0.19 * B, 0.25 * B, 0.5, 8), bottom), 0, -0.2, 0);

  // torso
  const spine = add(hips, new THREE.Group(), 0, 0.02, 0);
  const chest = add(spine, new THREE.Mesh(new THREE.CylinderGeometry(0.17 * B, 0.15 * B, 0.46, 10), top), 0, 0.23, 0);
  chest.scale.z = 0.62;
  if (L.overlay) {
    const o = L.overlay;
    if (o.kind === "apron") add(spine, new THREE.Mesh(new THREE.BoxGeometry(0.25 * B, 0.52, 0.02), M(o.color)), 0, 0.1, 0.105 * B);
    else {
      // jacket / vest / uniform: an open shell over the shirt
      const sh = add(spine, new THREE.Mesh(new THREE.CylinderGeometry(0.182 * B, 0.165 * B, o.kind === "vest" ? 0.36 : 0.5, 10, 1, true, 0.5, Math.PI * 2 - 1.0), M(o.color)), 0, 0.22, 0);
      sh.scale.z = 0.68; // opening (1 rad) faces front: three.js theta 0 points to +z
      (sh.material as THREE.Material).side = THREE.DoubleSide;
    }
  }
  if (L.polo !== undefined) {
    const pm = M(L.polo);
    [-1, 1].forEach((s) => { const c = add(spine, new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.012, 0.06), pm), s * 0.045, 0.455, 0.075); c.rotation.set(0.5, -s * 0.5, s * 0.35); });
    add(spine, new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.12, 0.008), pm), 0, 0.4, 0.094 * B);
    [0.43, 0.38].forEach((y) => add(spine, new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 4), mat(0xe8e8ee)), 0, y, 0.1 * B));
  }
  if (L.tie) add(spine, new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.26, 0.015), M(L.tie)), 0, 0.31, 0.1 * B);

  // arms: shoulder → elbow → hand
  const arms = [-1, 1].map((s) => {
    const sh = add(spine, new THREE.Group(), s * 0.19 * B, 0.43, 0);
    const sleeve = L.overlay && L.overlay.kind !== "apron" && L.overlay.kind !== "vest" ? M(L.overlay.color) : top;
    add(sh, new THREE.Mesh(new THREE.CylinderGeometry(0.045 * B, 0.04 * B, 0.27, 7), sleeve), 0, -0.135, 0);
    const elbow = add(sh, new THREE.Group(), 0, -0.27, 0);
    add(elbow, new THREE.Mesh(new THREE.CylinderGeometry(0.038 * B, 0.032 * B, 0.24, 7), L.overlay?.kind === "apron" ? skin : sleeve), 0, -0.12, 0);
    const hand = add(elbow, new THREE.Mesh(new THREE.IcosahedronGeometry(0.036, 1), skin), 0, -0.26, 0);
    return { s, sh, elbow, hand };
  });

  // head
  const neck = add(spine, new THREE.Group(), 0, 0.47, 0);
  add(neck, new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.08, 7), skin), 0, 0.04, 0);
  // stylized proportions: a big, expressive head (everything inside is drawn at 1x and scaled)
  const head = add(neck, new THREE.Group(), 0, 0.245, 0.01); head.scale.setScalar(1.36);
  const skull = add(head, new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 1), skin)); skull.scale.set(0.9, 1.1, 0.98);
  let brows: THREE.Mesh[] = [];
  let lips: { up: THREE.Group; low: THREE.Group; upSides: THREE.Group[]; lowSides: THREE.Group[]; inner: THREE.Mesh } | null = null;
  const lids: { s: number; pivot: THREE.Group }[] = [];
  if (!L.silhouette) {
    const eyeM = new THREE.MeshStandardMaterial({ color: 0x15111c, roughness: 0.3 });
    const er = L.eyeSize ?? 0.02;
    [-1, 1].forEach((s) => {
      // eye + eyelid share one squash group, so the lid stays concentric with the eye (same fix as Mott)
      const eg = add(head, new THREE.Group(), s * 0.048, 0.015, 0.127);
      const sq = new THREE.Group(); sq.scale.set(1, 1.2, 0.5); eg.add(sq);
      add(sq, new THREE.Mesh(new THREE.SphereGeometry(er, 12, 10), eyeM));
      const pivot = new THREE.Group(); sq.add(pivot);
      add(pivot, new THREE.Mesh(new THREE.SphereGeometry(er * 1.14, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(L.skin)));
      lids.push({ s, pivot });
      const b = add(head, new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.011, 0.012), hairM), s * 0.05, 0.05, 0.13);
      brows.push(b);
      add(head, new THREE.Mesh(new THREE.IcosahedronGeometry(0.028, 0), skin), s * 0.135, 0.0, 0.0).scale.set(0.5, 1, 0.8);
    });
    add(head, new THREE.Mesh(new THREE.IcosahedronGeometry(0.022, 0), skin), 0, -0.018, 0.14).scale.set(0.8, 1, 1);
    // lips: upper and lower, each a centre piece plus two corner pieces that rotate up (smile) or down (frown);
    // a dark inner mouth only shows when the lips part
    const lipM = mat(L.lips ?? 0xc98a80, { roughness: 0.55 });
    const mg = add(head, new THREE.Group(), 0, -0.068, 0.128);
    const mkLip = (rad: number, y: number) => {
      const g = add(mg, new THREE.Group(), 0, y, 0);
      add(g, new THREE.Mesh(new THREE.CapsuleGeometry(rad, 0.016, 3, 8), lipM)).rotation.z = Math.PI / 2;
      const sides = [-1, 1].map((sd) => {
        const pv = add(g, new THREE.Group(), sd * 0.009, 0, 0);
        const c = add(pv, new THREE.Mesh(new THREE.CapsuleGeometry(rad * 0.9, 0.011, 3, 8), lipM), sd * 0.0045, 0, -0.0005); c.rotation.z = Math.PI / 2;
        return pv;
      });
      return { g, sides };
    };
    const U = mkLip(0.0032, 0.0028), Lo = mkLip(0.0042, -0.0032);
    const inner = add(mg, new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 6), mat(0x3a1f24, { roughness: 0.6 })), 0, 0, -0.003); inner.scale.set(1.0, 0.04, 0.3);
    lips = { up: U.g, low: Lo.g, upSides: U.sides, lowSides: Lo.sides, inner };
    if (L.glasses) {
      // rounded "soft-rectangle" frames in clear acrylic: glass-like, slightly tinted so the edges read
      const frameM = new THREE.MeshPhysicalMaterial({ color: 0xcfe0ee, transparent: true, opacity: 0.55, roughness: 0.08, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05 });
      const lensM = new THREE.MeshPhysicalMaterial({ color: 0xe6f0ff, transparent: true, opacity: 0.12, roughness: 0.03, clearcoat: 1, side: THREE.DoubleSide });
      const ring = (a: number, b: number, n = 3.2) => {
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i < 48; i++) { const t = (i / 48) * Math.PI * 2, c = Math.cos(t), si = Math.sin(t); pts.push(new THREE.Vector3(a * Math.sign(c) * Math.pow(Math.abs(c), 2 / n), b * Math.sign(si) * Math.pow(Math.abs(si), 2 / n), 0)); }
        return new THREE.CatmullRomCurve3(pts, true);
      };
      [-1, 1].forEach((s) => {
        const cx = s * 0.05, cy = 0.016, cz = 0.141;
        const f = add(head, new THREE.Mesh(new THREE.TubeGeometry(ring(0.036, 0.026), 64, 0.0045, 6, true), frameM), cx, cy, cz); f.castShadow = false;
        const lensShape = new THREE.Shape(ring(0.034, 0.024).getPoints(48).map((v) => new THREE.Vector2(v.x, v.y)));
        const lens = add(head, new THREE.Mesh(new THREE.ShapeGeometry(lensShape), lensM), cx, cy, cz); lens.castShadow = false;
        const glint = add(head, new THREE.Mesh(new THREE.PlaneGeometry(0.018, 0.004), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 })), cx - 0.014, cy + 0.011, cz + 0.002); glint.rotation.z = 0.5; glint.castShadow = false;
        const arm = add(head, new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.11, 6), frameM), s * 0.088, 0.022, 0.085); arm.rotation.x = Math.PI / 2; arm.castShadow = false;
      });
      const bridge = add(head, new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.014, 0.024, 0.142), new THREE.Vector3(0, 0.03, 0.146), new THREE.Vector3(0.014, 0.024, 0.142)), 8, 0.004, 6, false), frameM));
      bridge.castShadow = false;
    }
    if (L.beard) { const bd = add(head, new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 0), M(L.beard)), 0, -0.08, 0.05); bd.scale.set(1.15, 0.7, 0.9); }
  }
  // hair
  const hc = (g: THREE.BufferGeometry, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1) => add(head, new THREE.Mesh(g, hairM), x, y, z).scale.set(sx, sy, sz);
  if (L.hair === "curly") { for (let i = 0; i < 11; i++) { const a = (i / 11) * Math.PI * 2; hc(new THREE.IcosahedronGeometry(0.055, 0), Math.cos(a) * 0.09, 0.1 + (i % 2) * 0.03, Math.sin(a) * 0.09 - 0.02); } hc(new THREE.IcosahedronGeometry(0.08, 0), 0, 0.13, -0.01); }
  if (L.hair === "bob") { hc(new THREE.IcosahedronGeometry(0.155, 1), 0, 0.02, -0.03, 1.02, 1.0, 1.0); hc(new THREE.IcosahedronGeometry(0.1, 1), 0, 0.1, 0.06, 1.25, 0.45, 0.8); }
  if (L.hair === "short") hc(new THREE.IcosahedronGeometry(0.148, 1), 0, 0.045, -0.02, 0.98, 0.85, 1.0);
  if (L.hair === "bun") { hc(new THREE.IcosahedronGeometry(0.148, 1), 0, 0.045, -0.02, 0.98, 0.86, 1.0); hc(new THREE.IcosahedronGeometry(0.06, 0), 0, 0.1, -0.15); }
  if (L.hair === "fringe") {
    // Host cut (v3, approved look): short tight sides to ear height, the back down to the nape,
    // a fuller top shell and a soft fringe of locks across the forehead. Uniform colour (no fade),
    // no loose pieces on top.
    const sk = [0.9, 1.1, 0.98], r = 0.14;
    const side = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12, Math.PI / 2 + 0.95, Math.PI * 2 - 1.9, 0, 1.66), hairM); // down to mid-ear: no skin gap above the ear
    add(head, side, 0, 0.006, -0.004).scale.set(sk[0] * 1.03, sk[1] * 1.03, sk[2] * 1.035);
    const back = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10, Math.PI * 1.5 - 1.05, 2.1, 0, 1.9), hairM); // only the back (−z), not the sides
    add(head, back, 0, 0.006, -0.006).scale.set(sk[0] * 1.025, sk[1] * 1.02, sk[2] * 1.04);
    const topShell = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 8, 0, Math.PI * 2, 0, 1.02), hairM);
    add(head, topShell, 0, 0.018, -0.006).scale.set(sk[0] * 1.09, sk[1] * 1.06, sk[2] * 1.08);
    (hairM as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
    // fringe: overlapping locks swept slightly to the right
    [[-0.07, 0.096, 0.112, 0.036, -0.25], [-0.034, 0.09, 0.124, 0.04, -0.15], [0.004, 0.088, 0.128, 0.04, -0.05], [0.042, 0.092, 0.122, 0.038, 0.08], [0.074, 0.1, 0.105, 0.032, 0.22]]
      .forEach(([x, y, z, rr, rz]) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(rr, 0), hairM); m.rotation.set(0.35, 0, rz); add(head, m, x, y + 0.006, z).scale.set(1.3, 0.62, 0.5); });
  }
  if (L.hair === "modern") {
    // short faded sides + a textured top swept up and slightly to one side
    hc(new THREE.IcosahedronGeometry(0.146, 1), 0, 0.025, -0.02, 0.985, 0.8, 1.0); // tight sides
    // textured top: three swept rows, front row lifted into a soft quiff
    [[0.11, 0.135, 0.06], [0.04, 0.155, 0.075], [-0.04, 0.155, 0.075], [-0.11, 0.135, 0.06]].forEach(([z, y, r], i) => {
      [-0.05, 0.0, 0.05].forEach((x, j) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), hairM); m.rotation.set(-0.6, 0.4 * j, 0.15); add(head, m, x + (i === 0 ? 0.01 : 0), y + (i === 0 ? 0.01 : 0), z).scale.set(1.0, 0.5, 1.25); });
    });
  }
  if (L.hair === "cap") { hc(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 10), 0, 0.12, 0); hc(new THREE.BoxGeometry(0.2, 0.015, 0.12), 0, 0.085, 0.15); }
  if (L.headlamp && !L.silhouette) {
    add(head, new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.012, 4, 16), mat(0x2a2a30)), 0, 0.07, 0).rotation.x = Math.PI / 2;
    add(head, new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 8), new THREE.MeshBasicMaterial({ color: 0xffe2a8 })), 0, 0.075, 0.15).rotation.x = Math.PI / 2;
  }
  if (L.headphones !== undefined && !L.silhouette) {
    const hpM = mat(L.headphones);
    add(neck, new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.015, 5, 14, Math.PI), hpM), 0, 0.02, 0.03).rotation.set(Math.PI / 2 + 0.3, 0, 0);
    [-1, 1].forEach((s) => add(neck, new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 10), hpM), s * 0.11, 0.0, 0.05).rotation.set(0, 0, Math.PI / 2));
  }

  /** Pose for time t. amount 0…1 blends the action in over the idle stance. */
  function pose(t: number, p: PersonPose = {}) {
    const a = p.action ?? "idle", k = p.amount ?? 1, ph = p.phase ?? 0;
    const breath = Math.sin(t * 1.6 + ph) * 0.012;
    // reset
    hips.position.y = 0.84; hips.rotation.set(0, 0, 0); spine.rotation.set(breath, 0, 0); neck.rotation.set(0, p.look ?? 0, 0); head.rotation.set(0, 0, 0);
    legs.forEach((l) => { l.hip.rotation.set(0, 0, 0); l.knee.rotation.set(0, 0, 0); });
    arms.forEach((r) => { r.sh.rotation.set(0.05, 0, r.s * 0.08); r.elbow.rotation.set(-0.15, 0, 0); });
    const R = arms[1], Lf = arms[0];
    switch (a) {
      case "walk": {
        const w = t * (p.walkSpeed ?? 1) * 6.2 + ph;
        legs.forEach((l) => { const s = Math.sin(w + (l.s > 0 ? Math.PI : 0)); l.hip.rotation.x = s * 0.45 * k; l.knee.rotation.x = Math.max(0, -Math.cos(w + (l.s > 0 ? Math.PI : 0))) * 0.6 * k; });
        arms.forEach((r) => { r.sh.rotation.x = -Math.sin(w + (r.s > 0 ? Math.PI : 0)) * 0.4 * k; });
        hips.position.y = 0.84 + Math.abs(Math.cos(w)) * 0.025 * k;
        break;
      }
      case "point": R.sh.rotation.set(-1.45 * k, 0, 0.15 * k); R.elbow.rotation.x = -0.05; break;
      case "inspect": spine.rotation.x = 0.35 * k; neck.rotation.x = -0.25 * k; R.sh.rotation.set(-1.2 * k, 0, 0.1); R.elbow.rotation.x = -0.4 * k; break;
      case "reach": spine.rotation.x = 0.25 * k; arms.forEach((r) => { r.sh.rotation.set(-1.0 * k, 0, -r.s * 0.15 * k); r.elbow.rotation.x = -0.5 * k; }); break;
      case "write": spine.rotation.x = 0.4 * k; neck.rotation.x = 0.25 * k; R.sh.rotation.set(-0.7 * k, 0, -0.2 * k); R.elbow.rotation.x = -1.1 * k + Math.sin(t * 14) * 0.06 * k; Lf.sh.rotation.set(-0.5 * k, 0, 0.2 * k); Lf.elbow.rotation.x = -1.0 * k; break;
      case "scratch": R.sh.rotation.set(-2.4 * k, 0, 0.5 * k); R.elbow.rotation.x = -1.9 * k + Math.sin(t * 16) * 0.12 * k; head.rotation.z = 0.12 * k; break;
      case "talk": { const g = Math.sin(t * 3.1 + ph); R.sh.rotation.set(-0.75 * k, 0, 0.25 * k); R.elbow.rotation.set((-1.25 + g * 0.25) * k, 0, 0); Lf.sh.rotation.set((-0.5 + g * 0.1) * k, 0, -0.2 * k); Lf.elbow.rotation.x = -1.1 * k; break; }
      case "laugh": { const b = Math.abs(Math.sin(t * 9 + ph)); spine.rotation.x = -0.12 * k + b * 0.08 * k; head.rotation.x = -0.25 * k; hips.position.y = 0.84 + b * 0.015 * k; arms.forEach((r) => { r.sh.rotation.set(-0.3 * k, 0, r.s * 0.1); r.elbow.rotation.x = -1.2 * k; }); break; }
      case "wave": R.sh.rotation.set(-0.3, 0, 2.6 * k); R.elbow.rotation.set(0, 0, (0.5 + Math.sin(t * 9) * 0.35) * k); break;
      case "surprised": spine.rotation.x = -0.18 * k; head.rotation.x = -0.1 * k; arms.forEach((r) => { r.sh.rotation.set(-0.6 * k, 0, r.s * 0.35 * k); r.elbow.rotation.x = -1.3 * k; }); break;
      case "lean": spine.rotation.x = 0.5 * k; arms.forEach((r) => { r.sh.rotation.set(-0.9 * k, 0, -r.s * 0.1); r.elbow.rotation.x = -0.3 * k; }); break;
    }
    // face: expression (blended track or a named preset), plus talk and action extras
    const fx = p.face ? { ...FACE.neutral, ...p.face } : FACE.neutral;
    const open = Math.min(1, fx.open + (p.talk ?? 0) + (a === "laugh" ? 0.4 * k : a === "surprised" ? 0.5 * k : 0));
    const smile = fx.smile + (L.smile ?? 0) * 0.3;
    if (lips) {
      lips.up.position.y = 0.0028 + open * 0.002;
      lips.low.position.y = -0.0032 - open * 0.008;
      lips.inner.scale.set(1.0 - open * 0.15, 0.04 + open * 0.34, 0.3);
      lips.upSides.forEach((pv, i) => (pv.rotation.z = (i ? 1 : -1) * smile * 0.75));
      lips.lowSides.forEach((pv, i) => (pv.rotation.z = (i ? 1 : -1) * smile * 0.9));
      lips.low.position.x = lips.up.position.x = fx.mouthX;
    }
    const blink = blinkAt(t + ph);
    lids.forEach((l) => { const c = Math.min(1, Math.max(-0.2, fx.lid + (l.s < 0 ? fx.lidAsym : -fx.lidAsym * 0.5))); l.pivot.rotation.x = Math.max(-1.75, -Math.PI / 2 + Math.max(c, blink) * Math.PI); });
    brows.forEach((b, i) => {
      const sd = i ? 1 : -1;
      b.position.y = 0.05 + fx.browUp * 0.011 + (sd < 0 ? fx.browAsym * 0.009 : 0) + (a === "surprised" ? 0.004 * k : 0);
      b.rotation.z = -sd * fx.browInner * 0.35;
    });
    head.rotation.z += fx.tilt; neck.rotation.y += fx.turn; spine.rotation.x += fx.lean;
  }
  /** Props held in the right hand (e.g. a flashlight). Returns the prop group so callers can toggle it. */
  function holdFlashlight() {
    const g = new THREE.Group(); arms[1].hand.add(g);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.16, 8), mat(0x3a3d44)); body.rotation.x = Math.PI / 2; body.position.z = 0.06; g.add(body);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.02, 10), new THREE.MeshBasicMaterial({ color: 0xfff1c0 })); lens.position.z = 0.141; g.add(lens);
    const beam = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.9, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd98a, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    beam.rotation.x = -Math.PI / 2; beam.position.z = 0.59; g.add(beam);
    g.rotation.x = Math.PI / 2; // point forward when the arm is raised
    return g;
  }
  pose(0);
  return { root, pose, arms, head, holdFlashlight };
}

/* ───────────── cast presets (no likeness of real people) ───────────── */
export const CAST = {
  engineer1947A: { skin: 0xe0b48f, hair: "short", hairColor: 0x3a2a20, top: 0xe9e4d8, bottom: 0x3d3a42, tie: 0x2f4a5c, overlay: { kind: "vest", color: 0x5a5148 } },
  engineer1947B: { skin: 0xc68e66, hair: "short", hairColor: 0x1e1814, top: 0xdcd6c8, bottom: 0x2e3440, tie: 0x6a2f2f, glasses: true },
  engineer1947C: { skin: 0xeac3a0, hair: "bun", hairColor: 0x5a3a24, top: 0xd8d2c4, bottom: 0x44403c, skirt: true, overlay: { kind: "jacket", color: 0x4c5a4e } },
  navyOfficer: { skin: 0xe8c4a4, hair: "bun", hairColor: 0x8a8a8a, top: 0xe8e8e8, bottom: 0x1f2a44, skirt: true, overlay: { kind: "uniform", color: 0x1f2a44 }, tie: 0x1a1a1a },
  visitorA: { skin: 0x9c6a48, hair: "curly", hairColor: 0x1a1412, top: 0x3e6e6a, bottom: 0x2b2b33 },
  visitorB: { skin: 0xf0cfb4, hair: "bob", hairColor: 0xb08a5a, top: 0xc8553d, bottom: 0x2b2b33, height: 0.95 },
  inventor1878: { skin: 0, hair: "short", hairColor: 0, top: 0, bottom: 0, silhouette: true, overlay: { kind: "jacket", color: 0 } },
} satisfies Record<string, Look>;
