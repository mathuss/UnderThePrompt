/**
 * "The Lamp" at human scale (metres): the host's night desk under the "_" cursor-lamp.
 * Mott lives here at ~10 cm on the keyboard. Same light rules as the Mott-scale set.
 */
import * as THREE from "three";
import { P, mat, prng } from "../mott";

const PI = Math.PI;
export const DESK_Y = 0.76;
/** Where Mott stands on the desk (on the keyboard's right edge). */
export const MOTT_SPOT = new THREE.Vector3(0.32, DESK_Y + 0.045, 0.18);

/** Laptop base centre in the dialogue layout; the keyboard is the far half (toward the lid), the trackpad the near half. */
export const LAPTOP = new THREE.Vector3(-0.12, DESK_Y, -0.2);
/** Where Mott stands on the book stack (dialogue format: at the seated host's eye level). */
export const PERCH = new THREE.Vector3(0.24, DESK_Y + 0.33, -0.16);
/** Height of the cursor-lamp in the dialogue room (higher, so it stays clear of the top UI). */
export const LAMP_Y_DIALOGUE = 2.2;
export type DeskOpts = { dialogue?: boolean }; // dialogue: chair + laptop + book stack, no monitor/keyboard, bokeh on both sides

export function buildHostDesk(opts: DeskOpts = {}) {
  const dlg = !!opts.dialogue;
  // living-background state (dialogue layout only)
  const twinkles: { m: THREE.Mesh; ph: number; sp: number }[] = [], bokeh: { m: THREE.Mesh; p0: THREE.Vector3; ph: number; base: number }[] = [];
  const dust: number[][] = [], dustG = new THREE.BufferGeometry(), steam: THREE.Mesh[] = [];
  const rnd = prng(31);
  const group = new THREE.Group();
  group.add(new THREE.HemisphereLight(0x6a5bc0, P.night, 0.32 * PI));
  group.add(new THREE.AmbientLight(P.plum, 0.3 * PI));
  const key = new THREE.PointLight(P.amber, 2.6 * PI, 5, 1.4);
  key.position.set(-0.5, 1.74, 0.3); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0015;
  group.add(key);
  const rim = new THREE.DirectionalLight(P.lilac, 0.9 * PI); rim.position.set(1.5, 2.2, -2.5); group.add(rim);
  const screenGlow = new THREE.PointLight(0x8fb0ff, 0.5 * PI, 2.2, 1.5); screenGlow.position.set(0.4, 1.05, -0.2); group.add(screenGlow);
  // a soft warm fill on the keyboard, so Mott (10 cm) reads in his close-ups
  const mottFill = new THREE.PointLight(0xffc27a, 0.35 * PI, 1.2, 1.6); mottFill.position.set(0.55, 1.0, 0.55); group.add(mottFill);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), mat(0x15101c)); floor.rotation.x = -PI / 2; floor.receiveShadow = true; group.add(floor);
  // desk
  const wood = mat(0x3b2a22), dark = mat(0x221a28);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 0.72), wood); top.position.set(0, DESK_Y - 0.02, 0); top.receiveShadow = true; top.castShadow = true; group.add(top);
  [[-0.7, -0.32], [0.7, -0.32], [-0.7, 0.32], [0.7, 0.32]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, DESK_Y - 0.04, 0.05), dark); l.position.set(x, (DESK_Y - 0.04) / 2, z); group.add(l); });
  // keyboard with keycaps
  const old = new THREE.Group(); old.visible = !dlg; group.add(old); // keyboard + monitor of the standing-host layout
  const kb = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.02, 0.16), mat(0x2a2138)); kb.position.set(0.05, DESK_Y + 0.01, 0.16); kb.receiveShadow = true; old.add(kb);
  const capG = new THREE.BoxGeometry(0.03, 0.014, 0.03), capM = mat(0x3a2f4a);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 13; c++) { const k = new THREE.Mesh(capG, capM); k.position.set(-0.15 + c * 0.034, DESK_Y + 0.025, 0.105 + r * 0.036); k.receiveShadow = true; old.add(k); }
  // monitor with a phosphor screen
  const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 600; const cx = cv.getContext("2d")!;
  cx.fillStyle = "#140c05"; cx.fillRect(0, 0, 1024, 600); cx.font = "34px monospace"; cx.fillStyle = "rgba(255,178,62,.6)";
  ["$ tail -f night.log", "> new release spotted", "> checking sources…", "> lamp or fire?", "_"].forEach((l, i) => cx.fillText(l, 50, 100 + i * 80));
  cx.fillStyle = "rgba(0,0,0,.35)"; for (let y = 0; y < 600; y += 6) cx.fillRect(0, y, 1024, 3);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  // monitor sits to the right, angled toward the host, so the host stays in clear view
  const monG = new THREE.Group(); monG.position.set(0.55, DESK_Y, -0.12); monG.rotation.y = -0.55; old.add(monG);
  const mon = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.31, 0.03), dark); mon.position.y = 0.33; mon.castShadow = true; monG.add(mon);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.47, 0.28), new THREE.MeshBasicMaterial({ map: tex })); scr.position.set(0, 0.33, -0.016); scr.rotation.y = Math.PI; monG.add(scr);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.05), dark); stand.position.y = 0.08; monG.add(stand);
  // mug
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.036, 0.1, 10), mat(0xe8dcc4)); mug.position.set(-0.45, DESK_Y + 0.05, 0.12); mug.castShadow = true; group.add(mug);
  // the "_" cursor-lamp on an arm over the desk
  const lampM = new THREE.MeshBasicMaterial({ color: P.amber });
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.035, 0.035), lampM); lamp.position.set(-0.5, 1.78, 0.2); group.add(lamp);
  const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.6, 5), dark); arm1.position.set(-0.6, DESK_Y + 0.3, -0.25); group.add(arm1);
  const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.72, 5), dark); arm2.position.set(-0.58, 1.45, -0.02); arm2.rotation.set(0.6, 0, -0.15); group.add(arm2);
  // window with city bokeh behind (the standing-host layout only: in the dialogue room they float in front of the glass)
  for (let i = 0; i < (dlg ? 0 : 26); i++) {
    const b = new THREE.Mesh(new THREE.CircleGeometry(0.02 + rnd() * 0.05, 14), new THREE.MeshBasicMaterial({ color: [P.amber, P.lilac, P.ice][i % 3], transparent: true, opacity: 0.28, fog: false }));
    b.position.set(-1.6 + rnd() * 3.2, 0.9 + rnd() * 1.4, -2.4); group.add(b);
  }
  const win = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.8), new THREE.MeshBasicMaterial({ color: 0x0b0a14, fog: false })); win.position.set(0, 1.5, -2.45); group.add(win);

  if (dlg) {
    // the lamp hangs from a cord here: the desk arm would cross the two-shot
    arm1.visible = arm2.visible = false;
    lamp.position.y = LAMP_Y_DIALOGUE; key.position.y = LAMP_Y_DIALOGUE - 0.08;
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.6, 4), dark); cord.position.set(-0.5, LAMP_Y_DIALOGUE + 0.3, 0.2); group.add(cord);
    // chair
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.05, 0.42), dark); seat.position.set(-0.12, 0.44, -0.62); group.add(seat);
    const backR = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.04), dark); backR.position.set(-0.12, 0.74, -0.84); group.add(backR);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 6), dark); post.position.set(-0.12, 0.21, -0.62); group.add(post);
    // laptop: space-grey aluminium, real keyboard deck and trackpad, a terminal on screen (lid opens away from the host)
    const alu = new THREE.MeshStandardMaterial({ color: 0x9aa0ad, metalness: 0.15, roughness: 0.42 }); // no env map here, so real metalness would render black
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.011, 0.215), alu); base.position.set(LAPTOP.x, DESK_Y + 0.0055, LAPTOP.z); base.castShadow = base.receiveShadow = true; group.add(base);
    const kcv = document.createElement("canvas"); kcv.width = 1024; kcv.height = 330; const kx = kcv.getContext("2d")!;
    kx.fillStyle = "#4a4e59"; kx.fillRect(0, 0, 1024, 330);
    const rows = [14, 14, 13, 12, 11];
    rows.forEach((n, r) => { const kw = 1000 / 14.6; let x = 12 + (14 - n) * kw * 0.5; for (let c = 0; c < n; c++) { kx.fillStyle = "#1c1d22"; kx.beginPath(); kx.roundRect(x, 10 + r * 64, kw - 8, 54, 7); kx.fill(); x += kw; } });
    kx.fillStyle = "#1c1d22"; kx.beginPath(); kx.roundRect(290, 10 + 5 * 64 - 64, 420, 54, 7); kx.fill();
    const ktex = new THREE.CanvasTexture(kcv); ktex.colorSpace = THREE.SRGBColorSpace; ktex.anisotropy = 8;
    const keys = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.09), new THREE.MeshStandardMaterial({ map: ktex, roughness: 0.6, metalness: 0.2 }));
    keys.rotation.x = -Math.PI / 2; keys.rotation.z = Math.PI; keys.position.set(LAPTOP.x, DESK_Y + 0.0112, LAPTOP.z + 0.045); keys.receiveShadow = true; group.add(keys);
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.07), new THREE.MeshStandardMaterial({ color: 0x6a6f7c, metalness: 0.4, roughness: 0.25 }));
    pad.rotation.x = -Math.PI / 2; pad.position.set(LAPTOP.x, DESK_Y + 0.0112, LAPTOP.z - 0.06); group.add(pad);
    const lid = new THREE.Group(); lid.position.set(LAPTOP.x, DESK_Y + 0.011, LAPTOP.z + 0.105); lid.rotation.x = 0.28; group.add(lid);
    const lidB = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.205, 0.005), alu); lidB.position.y = 0.1025; lidB.castShadow = true; lid.add(lidB);
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.27, 10), alu); hinge.rotation.z = Math.PI / 2; lid.add(hinge);
    const bezel = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.195), new THREE.MeshBasicMaterial({ color: 0x07070a })); bezel.position.set(0, 0.1025, -0.0027); bezel.rotation.y = Math.PI; lid.add(bezel);
    const scv = document.createElement("canvas"); scv.width = 1024; scv.height = 640; const sx = scv.getContext("2d")!;
    sx.fillStyle = "#14121b"; sx.fillRect(0, 0, 1024, 640); sx.fillStyle = "#24202f"; sx.fillRect(0, 0, 1024, 44);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => { sx.fillStyle = c; sx.beginPath(); sx.arc(30 + i * 30, 22, 9, 0, 7); sx.fill(); });
    sx.font = "30px monospace";
    ([["#a8e4ff", "> Build me a habit tracker."], ["#fff1d6", ""], ["#ffb23e", "Q1 · Platform"], ["#c9c0d8", "  → A web app."], ["#ffb23e", "Q2 · Users"], ["#c9c0d8", "  → Just you, no login."], ["#ffb23e", "Q3 · Data storage"], ["#c9c0d8", "  → Browser-local storage…"], ["#a8e4ff", "> _"]] as [string, string][])
      .forEach(([c, l], i) => { sx.fillStyle = c; sx.fillText(l, 40, 100 + i * 60); });
    const stex = new THREE.CanvasTexture(scv); stex.colorSpace = THREE.SRGBColorSpace;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.285, 0.178), new THREE.MeshBasicMaterial({ map: stex })); screen.position.set(0, 0.106, -0.0029); screen.rotation.y = Math.PI; lid.add(screen);
    const logo = new THREE.Mesh(new THREE.CircleGeometry(0.012, 24), new THREE.MeshStandardMaterial({ color: 0x8a90a0, metalness: 0.8, roughness: 0.2 })); logo.position.set(0, 0.11, 0.0027); lid.add(logo);
    screenGlow.color.setHex(0xb8c8ff); screenGlow.position.set(LAPTOP.x, 1.0, LAPTOP.z - 0.12); screenGlow.intensity = 0.2 * PI; // lower: Leo's chin was clipping to white
    mottFill.position.set(0.5, 1.3, 0.2);
    // book stack: Mott's perch (muted colours, no violet)
    let y = DESK_Y;
    [[0.2, 0.06, 0.15, 0x7a3b2e, 0.12], [0.19, 0.05, 0.14, 0x2f4a5c, -0.2], [0.21, 0.06, 0.15, 0x4c5a4e, 0.05], [0.18, 0.05, 0.13, 0x8a6a3a, -0.1], [0.19, 0.06, 0.14, 0x3d3a42, 0.22], [0.17, 0.05, 0.13, 0x6a2f2f, -0.06]].forEach(([w, h, d, c, r]) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); b.position.set(PERCH.x, y + h / 2, PERCH.z); b.rotation.y = r; b.castShadow = true; b.receiveShadow = true; group.add(b);
      const pages = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, h * 0.7, d * 0.96), mat(0xe8dcc4)); pages.position.set(PERCH.x + 0.004, y + h / 2, PERCH.z + 0.004); pages.rotation.y = r; group.add(pages);
      y += h;
    });
    // a living city through a wide window: skyline with lit windows, twinkling lights, drifting bokeh
    const kyv = document.createElement("canvas"); kyv.width = 2048; kyv.height = 700; const ky = kyv.getContext("2d")!;
    const g = ky.createLinearGradient(0, 0, 0, 700); g.addColorStop(0, "#0a0814"); g.addColorStop(0.7, "#1a1330"); g.addColorStop(1, "#2a1a3a"); ky.fillStyle = g; ky.fillRect(0, 0, 2048, 700);
    let bx = 0;
    while (bx < 2048) {
      const bw = 70 + rnd() * 150, bh = 160 + rnd() * 420; ky.fillStyle = rnd() > 0.5 ? "#0d0b16" : "#110e1d"; ky.fillRect(bx, 700 - bh, bw, bh);
      for (let wy = 700 - bh + 14; wy < 690; wy += 22) for (let wx = bx + 8; wx < bx + bw - 10; wx += 16) if (rnd() > 0.72) { ky.fillStyle = rnd() > 0.35 ? "rgba(255,190,110,.55)" : "rgba(168,228,255,.45)"; ky.fillRect(wx, wy, 7, 10); }
      bx += bw + 4;
    }
    const ktx = new THREE.CanvasTexture(kyv); ktx.colorSpace = THREE.SRGBColorSpace;
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(11, 3.8), new THREE.MeshBasicMaterial({ map: ktx, fog: false, transparent: true, opacity: 0.85 })); sky.position.set(0.4, 1.25, -3.9); group.add(sky);
    win.visible = false;
    /* ── the apartment: a small corner studio; floor-to-ceiling glass on the back AND right walls, so the city stays behind both characters ── */
    const R = { x0: -2.3, x1: 3.1, zBack: -2.55, zGlass: 0.6, h: 2.75, winX0: -1.7, winY0: 0.55, winY1: 2.45 };
    const wallM = mat(0x2a2233), trimM = mat(0x181320), woodM = mat(0x3a2a22);
    (floor.material as THREE.MeshStandardMaterial).color.setHex(0x2b201c); // wooden floor
    const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, ry = 0) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.rotation.y = ry; b.castShadow = b.receiveShadow = true; group.add(b); return b; };
    const fh = R.winY1 - R.winY0, fy = (R.winY0 + R.winY1) / 2;
    // back wall: solid on the left, glass from winX0 to the corner
    const bw = R.x1 - R.winX0, fx = (R.winX0 + R.x1) / 2, fw = bw;
    box(R.winX0 - R.x0, R.h, 0.1, wallM, (R.x0 + R.winX0) / 2, R.h / 2, R.zBack);
    box(bw, R.winY0, 0.1, wallM, fx, R.winY0 / 2, R.zBack);
    box(bw, R.h - R.winY1, 0.1, wallM, fx, (R.h + R.winY1) / 2, R.zBack);
    // right wall: glass from the corner to zGlass, solid after it
    const rd = R.zGlass - R.zBack, rz = (R.zBack + R.zGlass) / 2;
    box(0.1, R.winY0, rd, wallM, R.x1, R.winY0 / 2, rz);
    box(0.1, R.h - R.winY1, rd, wallM, R.x1, (R.h + R.winY1) / 2, rz);
    box(0.1, R.h, 2.55 - R.zGlass, wallM, R.x1, R.h / 2, (R.zGlass + 2.55) / 2);
    // frames: posts, transoms, deep sills, a corner post
    [R.winX0, R.winX0 + bw / 3, R.winX0 + (2 * bw) / 3].forEach((x) => box(0.05, fh, 0.1, trimM, x, fy, R.zBack + 0.02));
    [R.zBack + rd / 3, R.zBack + (2 * rd) / 3, R.zGlass].forEach((z) => box(0.1, fh, 0.05, trimM, R.x1 - 0.02, fy, z));
    box(0.09, fh, 0.09, trimM, R.x1 - 0.02, fy, R.zBack + 0.02);
    box(bw, 0.035, 0.06, trimM, fx, R.winY0 + fh * 0.72, R.zBack + 0.02); box(0.06, 0.035, rd, trimM, R.x1 - 0.02, R.winY0 + fh * 0.72, rz);
    box(bw + 0.1, 0.05, 0.24, trimM, fx, R.winY0, R.zBack + 0.07); box(0.24, 0.05, rd, trimM, R.x1 - 0.07, R.winY0, rz);
    box(bw, 0.06, 0.12, trimM, fx, R.winY1, R.zBack + 0.02); box(0.12, 0.06, rd, trimM, R.x1 - 0.02, R.winY1, rz);
    // glass: only a faint tint (reflections and floating bokeh read as visual noise, user note 2026-11-12)
    const glassM = new THREE.MeshBasicMaterial({ color: 0x9fb4ff, transparent: true, opacity: 0.04, depthWrite: false });
    const g1 = new THREE.Mesh(new THREE.PlaneGeometry(bw, fh), glassM); g1.position.set(fx, fy, R.zBack); group.add(g1);
    const g2 = new THREE.Mesh(new THREE.PlaneGeometry(rd, fh), glassM); g2.position.set(R.x1, fy, rz); g2.rotation.y = -Math.PI / 2; group.add(g2);
    // the city on the right as well (mirrored skyline), with its own twinkling windows
    const ktx2 = new THREE.CanvasTexture(kyv); ktx2.colorSpace = THREE.SRGBColorSpace; ktx2.wrapS = THREE.RepeatWrapping; ktx2.repeat.set(-1, 1);
    const sky2 = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.8), new THREE.MeshBasicMaterial({ map: ktx2, fog: false, transparent: true, opacity: 0.85 })); sky2.position.set(4.7, 1.25, -1.2); sky2.rotation.y = -Math.PI / 2; group.add(sky2);
    for (let i = 0; i < 30; i++) {
      const tw = new THREE.Mesh(new THREE.PlaneGeometry(0.018, 0.026), new THREE.MeshBasicMaterial({ color: i % 3 ? 0xffc27a : 0xa8e4ff, transparent: true, opacity: 0, fog: false }));
      tw.position.set(4.68, 0.3 + rnd() * 2.0, -5.4 + rnd() * 8.2); tw.rotation.y = -Math.PI / 2; group.add(tw); twinkles.push({ m: tw, ph: rnd() * 40, sp: 0.15 + rnd() * 0.35 });
    }
    // a balcony rail outside both panes (a closer layer than the skyline: parallax)
    for (let i = 0; i < 28; i++) box(0.02, 0.5, 0.02, trimM, R.winX0 + 0.1 + i * 0.17, 0.75, R.zBack - 0.45);
    box(bw + 0.45, 0.035, 0.05, trimM, fx + 0.22, 1.0, R.zBack - 0.45);
    for (let i = 0; i < 20; i++) box(0.02, 0.5, 0.02, trimM, R.x1 + 0.45, 0.75, R.zBack - 0.45 + i * 0.17);
    box(0.05, 0.035, rd + 0.45, trimM, R.x1 + 0.45, 1.0, rz - 0.22);
    // left wall, ceiling
    box(0.1, R.h, 5.2, wallM, R.x0, R.h / 2, -0.05);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(R.x1 - R.x0, 5.2), mat(0x151019)); ceil.rotation.x = Math.PI / 2; ceil.position.set((R.x0 + R.x1) / 2, R.h, -0.05); group.add(ceil);
    // curtains bunched at the two ends of the glass
    const curtM = mat(0x3b3048);
    for (let k = 0; k < 6; k++) box(0.07, R.h - 0.12, 0.05, curtM, R.winX0 - 0.12 - k * 0.055, (R.h - 0.12) / 2 + 0.04, R.zBack + 0.12 + (k % 2) * 0.05);
    for (let k = 0; k < 6; k++) box(0.05, R.h - 0.12, 0.07, curtM, R.x1 - 0.12 - (k % 2) * 0.05, (R.h - 0.12) / 2 + 0.04, R.zGlass + 0.12 + k * 0.055);
    // rug under the desk
    const rug = new THREE.Mesh(new THREE.CircleGeometry(1.0, 40), mat(0x3a2b44)); rug.rotation.x = -Math.PI / 2; rug.scale.set(1.5, 1, 1); rug.position.set(0, 0.003, -0.25); rug.receiveShadow = true; group.add(rug);
    // left side of the room: a tall bookshelf, the plant in the back corner, a floor lamp, a framed print
    const shelfX = R.x0 + 0.2;
    box(0.36, 1.9, 0.9, woodM, shelfX, 0.95, -1.0);
    for (let r = 0; r < 4; r++) { let z = -1.4; while (z < -0.6) { const bwk = 0.04 + rnd() * 0.04, bh = 0.24 + rnd() * 0.12; box(0.24, bh, bwk, mat([0x7a3b2e, 0x2f4a5c, 0x4c5a4e, 0x8a6a3a, 0x6a2f2f, 0xc9b79a][Math.floor(rnd() * 6)]), shelfX + 0.03, 0.12 + r * 0.46 + bh / 2, z); z += bwk + 0.008; } }
    const plantX = R.x0 + 0.42, plantZ = R.zBack + 0.42;
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.34, 10), mat(0xb5714f)); pot.position.set(plantX, 0.17, plantZ); pot.castShadow = true; group.add(pot);
    for (let i = 0; i < 12; i++) { const lf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1 + rnd() * 0.06, 0), mat(i % 2 ? 0x56805f : 0x44694d)); const a = rnd() * Math.PI * 2, r = rnd() * 0.18; lf.position.set(plantX + Math.cos(a) * r, 0.45 + rnd() * 0.75, plantZ + Math.sin(a) * r); lf.scale.set(1, 1.8, 0.5); lf.rotation.set(rnd(), rnd() * 3, rnd()); lf.castShadow = true; group.add(lf); }
    const lampX = R.x0 + 0.55, lampZ = -0.25;
    const prac = new THREE.PointLight(0xffb070, 0.5 * PI, 3.2, 1.6); prac.position.set(lampX, 1.5, lampZ); group.add(prac);
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.2, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xffc98a, side: THREE.DoubleSide })); shade.position.set(lampX, 1.5, lampZ); group.add(shade);
    box(0.02, 1.4, 0.02, trimM, lampX, 0.7, lampZ); box(0.26, 0.02, 0.26, trimM, lampX, 0.01, lampZ);
    const pcv = document.createElement("canvas"); pcv.width = 400; pcv.height = 520; const px = pcv.getContext("2d")!;
    px.fillStyle = "#1a1424"; px.fillRect(0, 0, 400, 520); px.fillStyle = "#ffb23e"; px.fillRect(110, 330, 180, 26); px.fillStyle = "#b9aef2"; px.font = "bold 44px monospace"; px.fillText("night", 135, 220); px.fillText("log", 160, 270);
    const ptex = new THREE.CanvasTexture(pcv); ptex.colorSpace = THREE.SRGBColorSpace;
    box(0.04, 0.68, 0.54, trimM, R.x0 + 0.06, 1.6, 0.6);
    const print = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.6), new THREE.MeshStandardMaterial({ map: ptex, roughness: 0.8 })); print.position.set(R.x0 + 0.085, 1.6, 0.6); print.rotation.y = Math.PI / 2; group.add(print);
    // cool moonlit fill from the glass, so the characters separate from the room
    const cityFill = new THREE.DirectionalLight(0x8fa8ff, 0.35 * PI); cityFill.position.set(3.5, 1.9, -3.2); group.add(cityFill);
    // a soft cool spill from the city on the floor in front of the window
    const spill = new THREE.Mesh(new THREE.PlaneGeometry(fw, 1.2), new THREE.MeshBasicMaterial({ color: 0x8fa8ff, transparent: true, opacity: 0.05, depthWrite: false })); spill.rotation.x = -Math.PI / 2; spill.position.set(fx, 0.004, R.zBack + 0.65); group.add(spill);
    for (let i = 0; i < 46; i++) {
      const tw = new THREE.Mesh(new THREE.PlaneGeometry(0.018, 0.026), new THREE.MeshBasicMaterial({ color: i % 3 ? 0xffc27a : 0xa8e4ff, transparent: true, opacity: 0, fog: false }));
      tw.position.set(-4.6 + rnd() * 10, 0.3 + rnd() * 2.0, -3.88); group.add(tw); twinkles.push({ m: tw, ph: rnd() * 40, sp: 0.15 + rnd() * 0.35 });
    }
    // dust in the lamp light (the mug steam was removed: it read as stains on the laptop)
    const dn = 70; const dpos = new Float32Array(dn * 3);
    for (let i = 0; i < dn; i++) dust.push([-0.9 + rnd() * 1.4, 0.8 + rnd() * 1.0, -0.6 + rnd() * 1.0, rnd() * 6]);
    dustG.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
    group.add(new THREE.Points(dustG, new THREE.PointsMaterial({ color: P.catch, size: 0.006, transparent: true, opacity: 0.55, depthWrite: false })));
  }

  function update(t: number, blink = 0) {
    const on = 1 - blink;
    twinkles.forEach((w) => { const c = (t * w.sp + w.ph) % 4; ((w.m.material as THREE.MeshBasicMaterial).opacity = c < 2.6 ? 0.7 * Math.sin((c / 2.6) * Math.PI) : 0); });
    bokeh.forEach((b) => { b.m.position.set(b.p0.x + Math.sin(t * 0.13 + b.ph) * 0.08, b.p0.y + Math.sin(t * 0.09 + b.ph * 2) * 0.05, b.p0.z); (b.m.material as THREE.MeshBasicMaterial).opacity = b.base * (0.75 + 0.25 * Math.sin(t * 0.7 + b.ph)) * on; });
    const dp = dustG.getAttribute("position") as THREE.BufferAttribute | undefined;
    if (dp) { dust.forEach((d, i) => dp.setXYZ(i, d[0] + Math.sin(t * 0.2 + d[3]) * 0.05, 0.8 + ((d[1] - 0.8 + t * 0.012) % 1.0), d[2] + Math.cos(t * 0.17 + d[3]) * 0.04)); dp.needsUpdate = true; }
    steam.forEach((st, i) => { const c = ((t * 0.45 + i / steam.length) % 1); st.position.set(-0.45 + Math.sin(c * 6 + i) * 0.012, DESK_Y + 0.11 + c * 0.16, 0.12 + Math.cos(c * 5 + i) * 0.01); st.scale.setScalar(0.6 + c * 1.6); (st.material as THREE.MeshBasicMaterial).opacity = 0.13 * Math.sin(c * Math.PI); });
    lampM.color.setHex(P.amber).multiplyScalar(0.25 + 0.75 * on);
    key.intensity = (dlg ? 3.3 : 2.6) * PI * (0.08 + 0.92 * on);
  }
  return { group, update };
}
