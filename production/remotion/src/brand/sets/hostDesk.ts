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

export function buildHostDesk() {
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
  const kb = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.02, 0.16), mat(0x2a2138)); kb.position.set(0.05, DESK_Y + 0.01, 0.16); kb.receiveShadow = true; group.add(kb);
  const capG = new THREE.BoxGeometry(0.03, 0.014, 0.03), capM = mat(0x3a2f4a);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 13; c++) { const k = new THREE.Mesh(capG, capM); k.position.set(-0.15 + c * 0.034, DESK_Y + 0.025, 0.105 + r * 0.036); k.receiveShadow = true; group.add(k); }
  // monitor with a phosphor screen
  const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 600; const cx = cv.getContext("2d")!;
  cx.fillStyle = "#140c05"; cx.fillRect(0, 0, 1024, 600); cx.font = "34px monospace"; cx.fillStyle = "rgba(255,178,62,.6)";
  ["$ tail -f night.log", "> new release spotted", "> checking sources…", "> lamp or fire?", "_"].forEach((l, i) => cx.fillText(l, 50, 100 + i * 80));
  cx.fillStyle = "rgba(0,0,0,.35)"; for (let y = 0; y < 600; y += 6) cx.fillRect(0, y, 1024, 3);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  // monitor sits to the right, angled toward the host, so the host stays in clear view
  const monG = new THREE.Group(); monG.position.set(0.55, DESK_Y, -0.12); monG.rotation.y = -0.55; group.add(monG);
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
  // window with city bokeh behind
  for (let i = 0; i < 26; i++) {
    const b = new THREE.Mesh(new THREE.CircleGeometry(0.02 + rnd() * 0.05, 14), new THREE.MeshBasicMaterial({ color: [P.amber, P.lilac, P.ice][i % 3], transparent: true, opacity: 0.28, fog: false }));
    b.position.set(-1.6 + rnd() * 3.2, 0.9 + rnd() * 1.4, -2.4); group.add(b);
  }
  const win = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.8), new THREE.MeshBasicMaterial({ color: 0x0b0a14, fog: false })); win.position.set(0, 1.5, -2.45); group.add(win);

  function update(_t: number, blink = 0) {
    const on = 1 - blink;
    lampM.color.setHex(P.amber).multiplyScalar(0.25 + 0.75 * on);
    key.intensity = 2.6 * PI * (0.08 + 0.92 * on);
  }
  return { group, update };
}
