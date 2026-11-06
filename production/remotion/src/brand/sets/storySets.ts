/**
 * Human-scale story sets (metres) where the people of a story perform its actions.
 * All are stylized recreations; videos label them "RECREATION". Historical figures appear only as
 * silhouettes or from behind (no likeness).
 */
import * as THREE from "three";
import { P, mat, prng } from "../mott";

const PI = Math.PI;

function lightKit(group: THREE.Group, key: { color: number; intensity: number; pos: [number, number, number]; distance?: number }) {
  group.add(new THREE.HemisphereLight(0x6a5bc0, P.night, 0.3 * PI));
  group.add(new THREE.AmbientLight(P.plum, 0.32 * PI));
  const k = new THREE.PointLight(key.color, key.intensity * PI, key.distance ?? 5, 1.4);
  k.position.set(...key.pos); k.castShadow = true; k.shadow.mapSize.set(2048, 2048); k.shadow.bias = -0.0015;
  group.add(k);
  const rim = new THREE.DirectionalLight(P.lilac, 0.8 * PI); rim.position.set(1.5, 2.5, -2.5); group.add(rim);
  return k;
}
const floor = (g: THREE.Group, c: number) => { const f = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), mat(c)); f.rotation.x = -PI / 2; f.receiveShadow = true; g.add(f); };
const wall = (g: THREE.Group, c: number, z = -2.2) => { const w = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), mat(c)); w.position.set(0, 3, z); w.receiveShadow = true; g.add(w); };

/* ───────────── 1947: the desk with the logbook ───────────── */
export const LOG_DESK_Y = 0.78;
export function buildDesk1947() {
  const group = new THREE.Group();
  const key = lightKit(group, { color: P.amber, intensity: 2.4, pos: [-0.5, 1.7, 0.6] });
  floor(group, 0x2b1d17); wall(group, 0x241c26);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.8), mat(0x4a3324)); top.position.y = LOG_DESK_Y - 0.025; top.receiveShadow = true; top.castShadow = true; group.add(top);
  // open logbook: grid-paper pages (abstract strokes, no imitation of the real handwriting)
  const cv = document.createElement("canvas"); cv.width = 600; cv.height = 400; const c = cv.getContext("2d")!;
  c.fillStyle = "#efe7d4"; c.fillRect(0, 0, 600, 400); c.strokeStyle = "rgba(90,120,170,.35)"; c.lineWidth = 1;
  for (let x = 0; x < 600; x += 16) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 400); c.stroke(); }
  for (let y = 0; y < 400; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(600, y); c.stroke(); }
  c.fillStyle = "rgba(170,150,170,.4)"; c.fillRect(298, 0, 4, 400);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const book = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.02, 0.38), [mat(0xd8cfba), mat(0xd8cfba), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }), mat(0xd8cfba), mat(0xd8cfba), mat(0xd8cfba)]);
  book.position.set(0.05, LOG_DESK_Y + 0.01, 0.05); book.receiveShadow = true; group.add(book);
  // the moth (schematic, small) and a strip of tape that lands on it
  const moth = new THREE.Mesh(new THREE.ShapeGeometry((() => { const s = new THREE.Shape(); s.moveTo(0, 0.012); s.quadraticCurveTo(0.03, 0.03, 0.035, 0); s.quadraticCurveTo(0.03, -0.02, 0, -0.015); s.quadraticCurveTo(-0.03, -0.02, -0.035, 0); s.quadraticCurveTo(-0.03, 0.03, 0, 0.012); return s; })(), 8), new THREE.MeshStandardMaterial({ color: 0x6e6152, roughness: 0.9, side: THREE.DoubleSide }));
  moth.rotation.x = -PI / 2; moth.position.set(0.16, LOG_DESK_Y + 0.0215, 0.05); group.add(moth);
  const tape = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.002, 0.045), new THREE.MeshStandardMaterial({ color: 0xe9d9a8, transparent: true, opacity: 0.6, roughness: 0.5 }));
  group.add(tape);
  // pen
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.14, 6), mat(0x1c1a22)); group.add(pen);
  // desk lamp
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.14, 10, 1, true), mat(0x2f3a33, { side: THREE.DoubleSide })); shade.position.set(-0.5, 1.15, 0.0); group.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: P.amber })); bulb.position.set(-0.5, 1.1, 0.0); group.add(bulb);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 6), mat(0x2f3a33)); stem.position.set(-0.5, LOG_DESK_Y + 0.2, -0.05); group.add(stem);
  key.position.set(-0.5, 1.12, 0.05);

  /** tape 0…1 lands the strip; write 0…1 moves the pen across the line below the moth. */
  function update(t: number, { tape: tk = 0, write = 0 }: { tape?: number; write?: number } = {}) {
    tape.position.set(0.16, LOG_DESK_Y + 0.023 + (1 - tk) * 0.18, 0.05); tape.visible = tk > 0; tape.rotation.y = (1 - tk) * 0.3;
    pen.position.set(0.0 + write * 0.18, LOG_DESK_Y + 0.03 + Math.abs(Math.sin(t * 18)) * 0.004 * (write > 0 && write < 1 ? 1 : 0), 0.12);
    pen.rotation.set(0.9, 0, -0.5);
  }
  return { group, update, moth };
}

/* ───────────── 1878: a workshop at night (illustration, silhouette only) ───────────── */
export function buildWorkshop1878() {
  const group = new THREE.Group();
  const key = lightKit(group, { color: 0xffb35a, intensity: 2.0, pos: [0.35, 1.05, 0.1], distance: 4 });
  floor(group, 0x22170f); wall(group, 0x1f1812, -1.4);
  // a warm pool of light on the back wall, so the silhouette reads against it
  const back = new THREE.PointLight(0xffa548, 3.2 * PI, 3, 1.4); back.position.set(-0.1, 1.5, -0.95); group.add(back);
  const glowWall = new THREE.Mesh(new THREE.CircleGeometry(0.9, 24), new THREE.MeshBasicMaterial({ color: 0x5a3a1c, transparent: true, opacity: 0.55, fog: false })); glowWall.position.set(-0.05, 1.45, -1.39); group.add(glowWall);
  const desk = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.05, 0.7), mat(0x3a2616)); desk.position.y = 0.76; desk.receiveShadow = true; group.add(desk);
  // shelves with jars and coils, in shadow
  const rnd = prng(78);
  for (let i = 0; i < 14; i++) { const j = new THREE.Mesh(new THREE.CylinderGeometry(0.04 + rnd() * 0.03, 0.04, 0.12 + rnd() * 0.1, 8), mat([0x4a3a2a, 0x3a4a44, 0x5a4630][i % 3])); j.position.set(-1.2 + (i % 7) * 0.35, 1.25 + Math.floor(i / 7) * 0.45, -1.3); group.add(j); }
  [1.15, 1.6].forEach((y) => { const sh = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.03, 0.25), mat(0x2e2014)); sh.position.set(-0.15, y, -1.3); group.add(sh); });
  // oil lamp (the light source)
  const glass = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffc070 })); glass.position.set(0.35, 0.9, 0.1); group.add(glass);
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.1, 10), mat(0x6b4a22)); lampBase.position.set(0.35, 0.83, 0.1); group.add(lampBase);
  // the letter: paper with the single word "bugs" that glows (we show only that word, not a quote)
  const cv = document.createElement("canvas"); cv.width = 512; cv.height = 360; const c = cv.getContext("2d")!;
  const paper = new THREE.CanvasTexture(cv); paper.colorSpace = THREE.SRGBColorSpace;
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.2), new THREE.MeshStandardMaterial({ map: paper, roughness: 0.9 }));
  sheet.rotation.x = -PI / 2; sheet.position.set(0.0, 0.787, 0.12); group.add(sheet);
  let lastGlow = -1;
  function drawPaper(glow: number) {
    c.fillStyle = "#e9dcc0"; c.fillRect(0, 0, 512, 360);
    c.strokeStyle = "rgba(50,35,30,.5)"; c.lineWidth = 3; c.lineCap = "round";
    for (let r = 0; r < 6; r++) { const y = 50 + r * 50; c.beginPath(); c.moveTo(40, y); for (let x = 40; x < 470; x += 22) c.quadraticCurveTo(x + 11, y - 8, x + 22, y + 2); c.stroke(); }
    c.fillStyle = `rgba(255,178,62,${0.25 + 0.75 * glow})`; c.font = "italic bold 64px Georgia, serif"; c.fillText("bugs", 190, 210);
    paper.needsUpdate = true;
  }
  drawPaper(0);
  function update(t: number, { glow = 0 }: { glow?: number } = {}) {
    const g = Math.round(glow * 20) / 20; if (g !== lastGlow) { drawPaper(g); lastGlow = g; }
    key.intensity = 2.0 * PI * (0.9 + 0.1 * Math.sin(t * 13) * Math.sin(t * 7.3)); // oil-lamp flicker
  }
  return { group, update };
}

/* ───────────── a warm room where the story gets told ───────────── */
export function buildStoryRoom() {
  const group = new THREE.Group();
  lightKit(group, { color: P.amber, intensity: 2.6, pos: [0.6, 2.2, 0.8], distance: 6 });
  floor(group, 0x2a1f1a); wall(group, 0x2a2230, -2.0);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), new THREE.MeshBasicMaterial({ color: 0x1a2440 })); win.position.set(-0.9, 1.6, -1.99); group.add(win);
  const table = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.04, 16), mat(0x4a3324)); table.position.set(0.1, 0.74, -0.3); table.receiveShadow = true; table.castShadow = true; group.add(table);
  [0, 1, 2].forEach((i) => { const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.08, 8), mat(0xe8dcc4)); cup.position.set(-0.1 + i * 0.2, 0.8, -0.25 - (i % 2) * 0.15); cup.castShadow = true; group.add(cup); });
  return { group, update: (_t: number) => {} };
}

/* ───────────── the museum gallery ───────────── */
export function buildMuseum(photo: THREE.Texture | null) {
  const group = new THREE.Group();
  group.add(new THREE.HemisphereLight(0x6a5bc0, P.night, 0.22 * PI));
  group.add(new THREE.AmbientLight(P.plum, 0.25 * PI));
  const spot = new THREE.SpotLight(0xfff1d6, 22 * PI, 6, 0.5, 0.5, 1.3); spot.position.set(0, 2.9, 0.4); spot.target.position.set(0, 1.0, -0.6); spot.castShadow = true; group.add(spot, spot.target);
  floor(group, 0x1a1620); wall(group, 0x221c2a, -1.6);
  const ped = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.95, 0.55), mat(0x2e2838)); ped.position.set(0, 0.475, -0.6); ped.castShadow = true; ped.receiveShadow = true; group.add(ped);
  // the page, lying slightly tilted inside the case
  const pageM = new THREE.MeshStandardMaterial({ map: photo, color: photo ? 0xffffff : 0xefe7d4, roughness: 0.85 });
  const page = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.395), pageM);
  page.rotation.x = -PI / 2 + 0.35; page.position.set(0, 1.0, -0.6); page.receiveShadow = true; group.add(page);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.36, 0.5), new THREE.MeshPhysicalMaterial({ color: 0xdfeaff, transparent: true, opacity: 0.12, roughness: 0.05, clearcoat: 1 }));
  glass.position.set(0, 1.13, -0.6); group.add(glass);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.08), mat(0xd8cfba)); label.position.set(0.3, 0.8, -0.32); label.rotation.x = -0.4; group.add(label);
  const setPhoto = (tex: THREE.Texture) => { pageM.map = tex; pageM.color.setHex(0xffffff); pageM.needsUpdate = true; };
  return { group, update: (_t: number) => {}, setPhoto };
}
