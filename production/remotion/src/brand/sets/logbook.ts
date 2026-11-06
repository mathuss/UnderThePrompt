/**
 * "Archive / Logbook": a giant open logbook on a desk, at Mott's scale. The page itself is a
 * stylized schematic (generic ruled entries, no imitation of the real handwriting); the REAL
 * archival photo is shown as a separate, credited photo card on the page.
 */
import * as THREE from "three";
import { P, mat } from "../mott";

const PI = Math.PI;
export const PAGE = { w: 4.6, h: 6.2 };
/** Where the photo card sits on the right-hand page (world coords). */
export const PHOTO_AT = new THREE.Vector3(2.55, 0.235, -0.4); // just above the page surface (y 0.22)

function pageTexture(right: boolean) {
  const cv = document.createElement("canvas"); cv.width = 900; cv.height = 1200;
  const c = cv.getContext("2d")!;
  c.fillStyle = "#efe3c6"; c.fillRect(0, 0, 900, 1200);
  c.strokeStyle = "rgba(90,110,160,.35)"; c.lineWidth = 2;
  for (let y = 120; y < 1180; y += 46) { c.beginPath(); c.moveTo(40, y); c.lineTo(860, y); c.stroke(); }
  c.strokeStyle = "rgba(190,70,70,.35)"; c.beginPath(); c.moveTo(150, 60); c.lineTo(150, 1180); c.stroke();
  // abstract pen strokes only: no words, so nothing here imitates the real log's content
  c.strokeStyle = "rgba(40,30,60,.45)"; c.lineWidth = 4; c.lineCap = "round";
  let seed = right ? 5 : 3; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let row = 0; row < (right ? 6 : 14); row++) {
    const y = 145 + row * 92; let x = 175; c.beginPath(); c.moveTo(x, y);
    while (x < 180 + 300 + r() * 380) { x += 14 + r() * 10; c.quadraticCurveTo(x - 7, y - 10 - r() * 8, x, y + (r() - 0.5) * 6); }
    c.stroke();
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

function photoPlaceholder() {
  const cv = document.createElement("canvas"); cv.width = 800; cv.height = 600;
  const c = cv.getContext("2d")!;
  c.fillStyle = "#d9d2c0"; c.fillRect(0, 0, 800, 600);
  c.strokeStyle = "#8a8070"; c.lineWidth = 6; c.strokeRect(20, 20, 760, 560);
  c.fillStyle = "#4a4236"; c.font = "bold 44px monospace"; c.textAlign = "center";
  c.fillText("ARCHIVE PHOTO", 400, 260);
  c.font = "28px monospace"; c.fillText("US Navy / NHHC · NH 96566-KN", 400, 320);
  c.fillText("(pending download approval)", 400, 370);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildLogbook(photo?: THREE.Texture) {
  const group = new THREE.Group();
  group.add(new THREE.HemisphereLight(0x6a5bc0, P.night, 0.3 * PI));
  group.add(new THREE.AmbientLight(P.plum, 0.35 * PI));
  const key = new THREE.PointLight(P.amber, 9 * PI, 14, 1.4); // the reading lamp
  key.position.set(-2.5, 6, 2.5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.002;
  group.add(key);
  const rim = new THREE.DirectionalLight(P.lilac, 0.8 * PI); rim.position.set(3, 4, -5); group.add(rim);

  const desk = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), mat(0x241812)); desk.rotation.x = -PI / 2; desk.receiveShadow = true; group.add(desk);

  // the book: cover + two slightly tilted pages
  const cover = new THREE.Mesh(new THREE.BoxGeometry(PAGE.w * 2 + 0.5, 0.12, PAGE.h + 0.4), mat(0x3a2230)); cover.position.y = 0.06; cover.receiveShadow = true; group.add(cover);
  [-1, 1].forEach((s) => {
    const pg = new THREE.Mesh(new THREE.BoxGeometry(PAGE.w, 0.1, PAGE.h),
      [mat(0xe6d9ba), mat(0xe6d9ba), new THREE.MeshStandardMaterial({ map: pageTexture(s > 0), roughness: 0.9 }), mat(0xe6d9ba), mat(0xe6d9ba), mat(0xe6d9ba)]);
    pg.position.set(s * (PAGE.w / 2 + 0.04), 0.17, 0); pg.rotation.z = -s * 0.03; pg.receiveShadow = true; pg.castShadow = true;
    group.add(pg);
  });

  // photo card (real archival photo, credited in 2D overlay) lies on the right page
  const photoM = new THREE.MeshStandardMaterial({ map: photo ?? photoPlaceholder(), roughness: 0.7, transparent: true, opacity: 0 });
  const card = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.95), photoM);
  card.rotation.x = -PI / 2; card.position.copy(PHOTO_AT); card.receiveShadow = true; group.add(card);

  // two strips of tape that land on the photo
  const tapeM = new THREE.MeshStandardMaterial({ color: 0xf2ead2, transparent: true, opacity: 0.55, roughness: 0.6 });
  const tapes = [-1, 1].map((s) => {
    const tp = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.01, 0.38), tapeM);
    tp.rotation.y = s * 0.35; group.add(tp);
    return { tp, s };
  });

  /** photo 0…1 fades the card in; tape 0…1 drops the strips onto it. */
  function update(_t: number, { photo: ph = 0, tape = 0 }: { photo?: number; tape?: number } = {}) {
    photoM.opacity = ph;
    tapes.forEach(({ tp, s }, i) => {
      const k = Math.min(1, Math.max(0, tape * 2 - i * 0.6));
      tp.position.set(PHOTO_AT.x + s * 1.0, 0.245 + (1 - k) * 2.2, PHOTO_AT.z + s * 0.75);
      tp.visible = tape > 0;
    });
  }
  return { group, update };
}
