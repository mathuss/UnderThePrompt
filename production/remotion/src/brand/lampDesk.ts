/**
 * Home set "The Lamp" (brand/identity.md §4): a night desk at Mott's 4 cm scale under a giant
 * blinking "_" cursor-lamp. Lights follow the brand rules: one warm motivated key (the lamp),
 * cool violet fill, lilac rim, dust motes in the beam. Animated by `update(t)`, a pure function of time.
 */
import * as THREE from "three";
import { P, mat, prng } from "./mott";

// three >= r155 uses physical light units; the look was tuned with legacy units, which were π times brighter.
const PI = Math.PI;
const KEY = 4.4 * PI; // warm key from the cursor-lamp

export function buildLampDesk() {
  const rnd = prng(11);
  const group = new THREE.Group();

  group.add(new THREE.HemisphereLight(0x6a5bc0, P.night, 0.3 * PI));
  group.add(new THREE.AmbientLight(P.plum, 0.3 * PI));
  const key = new THREE.PointLight(P.amber, KEY, 6, 1.4);
  key.position.set(-0.4, 1.78, 0.8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.002;
  group.add(key);
  const rim = new THREE.DirectionalLight(P.lilac, 1.0 * PI);
  rim.position.set(1.2, 1.4, -2);
  group.add(rim);

  // keycap the character stands on, and the desk
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.14, 0.9), mat(0x2a2138));
  cap.position.y = -0.07; cap.receiveShadow = true; group.add(cap);
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.02, 0.78), mat(0x332842));
  top.position.y = 0.005; top.receiveShadow = true; group.add(top);
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), mat(0x161020));
  desk.rotation.x = -Math.PI / 2; desk.position.y = -0.14; desk.receiveShadow = true; group.add(desk);
  // neighbouring keycaps fading into the dark
  [[-1.0, -0.4], [1.0, -0.3], [-0.2, -1.2], [0.9, -1.3], [-1.1, -1.5]].forEach(([x, z]) => {
    const k = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.14, 0.9), mat(0x221a2e));
    k.position.set(x, -0.07, z); k.receiveShadow = true; group.add(k);
  });

  // phosphor monitor far behind: dark glass, amber lines, scanlines
  const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 600;
  const cx = cv.getContext("2d")!;
  cx.fillStyle = "#140c05"; cx.fillRect(0, 0, 1024, 600);
  cx.font = "32px monospace"; cx.fillStyle = "rgba(255,178,62,.55)";
  ["$ tail -f night.log", "> 03:12  new release spotted", "> 03:13  checking sources…", "> 03:14  lamp or fire?", "_"].forEach((l, i) => cx.fillText(l, 48, 90 + i * 72));
  cx.fillStyle = "rgba(0,0,0,.35)"; for (let y = 0; y < 600; y += 6) cx.fillRect(0, y, 1024, 3);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const mon = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.52), new THREE.MeshBasicMaterial({ map: tex, fog: false, transparent: true, opacity: 0.8 }));
  mon.position.set(0.7, 1.05, -2.6); group.add(mon);

  // city bokeh through the window
  for (let i = 0; i < 16; i++) {
    const b = new THREE.Mesh(new THREE.CircleGeometry(0.03 + rnd() * 0.05, 14),
      new THREE.MeshBasicMaterial({ color: [P.amber, P.lilac, P.ice][i % 3], transparent: true, opacity: 0.25, fog: false }));
    b.position.set(-1.7 + rnd() * 1.3, 0.4 + rnd() * 1.6, -3.6); group.add(b);
  }

  // the cursor-lamp "_" and its cord
  const lampM = new THREE.MeshBasicMaterial({ color: P.amber });
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.07, 0.07), lampM);
  lamp.position.set(-0.4, 1.85, 0.3); group.add(lamp);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 1.2, 4), mat(0x2a2138));
  cord.position.set(-0.4, 2.48, 0.3); group.add(cord);

  // dust motes drifting in the beam
  const n = 90, pos = new Float32Array(n * 3), base: number[][] = [];
  for (let i = 0; i < n; i++) base.push([-1 + rnd() * 1.6, rnd() * 1.8, -0.6 + rnd() * 1.4, rnd() * 6]);
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  group.add(new THREE.Points(g, new THREE.PointsMaterial({ color: P.catch, size: 0.012, transparent: true, opacity: 0.7 })));

  /** `blink` 0…1 dims the lamp (the signature blink transition). */
  function update(t: number, blink = 0) {
    base.forEach((b, i) => pos.set([b[0] + Math.sin(t * 0.2 + b[3]) * 0.08, (b[1] + t * 0.03) % 1.8, b[2]], i * 3));
    g.attributes.position.needsUpdate = true;
    const on = 1 - blink;
    lampM.color.setHex(P.amber).multiplyScalar(0.25 + 0.75 * on);
    key.intensity = KEY * (0.08 + 0.92 * on);
  }

  return { group, update };
}
