import { getInputProps } from "remotion";
import timelineEs from "./data/timeline.json";
import timelineEn from "./data/timeline_en.json";

const PROPS = getInputProps() as { theme?: string; lang?: string };
export const LANG: "es" | "en" = PROPS.lang === "en" ? "en" : "es";
/** Pick the on-screen string for the current language. */
export const L = <T,>(es: T, en: T): T => (LANG === "en" ? en : es);

export const FPS = 30;
export const W_ = 1080;
export const H_ = 1920;

export type Word = { text: string; start: number; end: number; scene: number; line: number };
export const TL = (LANG === "en" ? timelineEn : timelineEs) as {
  duration: number;
  scenes: { id: number; start: number; end: number }[];
  lines: { scene: number; text: string; start: number; end: number }[];
  words: Word[];
};

type Theme = {
  name: string; bg: string; panel: string; panel2: string; line: string; text: string; dim: string;
  amber: string; cyan: string; green: string; red: string; purple: string;
  ink: string; capText: string; capActive: string; capStroke: string; brand: string;
  bw: number; radius: number; shadow: string; blur: string; hueShift: number;
  blobs: [number, number, number, string][]; mono?: boolean;
};
const base = { bw: 2, radius: 26, shadow: "0 30px 80px rgba(0,0,0,.45)", blur: "none", hueShift: 0, blobs: [] as Theme["blobs"] };

const THEMES: Record<string, Theme> = {
  // A: the first version, for reference
  noir: { ...base, name: "noir", bg: "#0A0C10", panel: "#121722", panel2: "#171D2A", line: "#263042", text: "#E8ECF3", dim: "#6B7690",
    amber: "#FFB020", cyan: "#3DD6F5", green: "#3ED598", red: "#FF5C6C", purple: "#A78BFA",
    ink: "#0A0C10", capText: "#E8ECF3", capActive: "#FFB020", capStroke: "#0A0C10", brand: "#6B7690" },
  // B: saturated violet night with drifting neon blobs, hue shifts per step
  neon: { ...base, name: "neon", bg: "#1A0638", panel: "rgba(36,14,84,.88)", panel2: "#341A78", line: "#6A48D8", text: "#FFFFFF", dim: "#B9A8F0",
    amber: "#FFE14D", cyan: "#00F0FF", green: "#3DFF9A", red: "#FF3D8B", purple: "#FF5FE0",
    ink: "#14052E", capText: "#FFFFFF", capActive: "#FFE14D", capStroke: "#14052E", brand: "#FFE14D",
    shadow: "0 0 60px rgba(255,95,224,.35)", hueShift: 28,
    blobs: [[-200, 200, 760, "#FF2FB9"], [600, 900, 820, "#2D5BFF"], [100, 1500, 700, "#00D9FF"]] },
  // C: bright neo-brutalist paper: cream, black outlines, hard shadows, primary colors
  paper: { ...base, name: "paper", bg: "#FFF1D6", panel: "#FFFFFF", panel2: "#FFF8EA", line: "#111111", text: "#111111", dim: "#7A6F62",
    amber: "#FF7A00", cyan: "#2E5BFF", green: "#12A150", red: "#FF3B30", purple: "#8B5CF6",
    ink: "#111111", capText: "#111111", capActive: "#2E5BFF", capStroke: "#FFFFFF", brand: "#111111",
    bw: 5, radius: 22, shadow: "10px 10px 0 #111111" },
  // D: vivid sunset gradient behind dark glass panels
  sunset: { ...base, name: "sunset", bg: "#3A0F5C", panel: "rgba(14,8,34,.72)", panel2: "rgba(30,16,60,.85)", line: "rgba(255,255,255,.22)", text: "#FFFFFF", dim: "#D7CCF5",
    amber: "#FFD93D", cyan: "#5CE1E6", green: "#4ADE80", red: "#FF6B8B", purple: "#C084FC",
    ink: "#1A0B2E", capText: "#FFFFFF", capActive: "#FFD93D", capStroke: "#1A0B2E", brand: "#FFFFFF",
    blur: "blur(18px)", hueShift: 18,
    blobs: [[-250, -100, 900, "#FF5F6D"], [500, 600, 900, "#FF9A3C"], [-200, 1200, 900, "#7B2FF7"], [500, 1600, 700, "#1FA2FF"]] },
  // E: Noir + Paper. Charcoal sheet, cream cut-paper outlines, hard shadows, primary shapes
  tinta: { ...base, name: "tinta", bg: "#1C1E26", panel: "#262934", panel2: "#30333F", line: "#F2E8D5", text: "#F7F1E3", dim: "#A39C8E",
    amber: "#FFD23F", cyan: "#4C8DFF", green: "#2FD17E", red: "#FF5A4E", purple: "#B28CFF",
    ink: "#14151A", capText: "#F7F1E3", capActive: "#FFD23F", capStroke: "#0B0C10", brand: "#F2E8D5",
    bw: 5, radius: 20, shadow: "10px 10px 0 #07080B" },
  // F: blueprint. White drafting lines on Prussian blue, title block, no shadows
  plano: { ...base, name: "plano", bg: "#0F3C80", panel: "rgba(8,36,84,.55)", panel2: "rgba(255,255,255,.07)", line: "#DCEBFF", text: "#FFFFFF", dim: "#9DBBE6",
    amber: "#FFE066", cyan: "#8FE3FF", green: "#7CF0B0", red: "#FF8A80", purple: "#C9B6FF",
    ink: "#0A2A5C", capText: "#FFFFFF", capActive: "#FFE066", capStroke: "#0A2A5C", brand: "#DCEBFF",
    bw: 3, radius: 4, shadow: "none" },
  // G: night risograph. Indigo stock, fluorescent pink + yellow, teal misregistered shadows, halftone
  riso: { ...base, name: "riso", bg: "#1F1A3D", panel: "#2B2552", panel2: "#363062", line: "#FF4FA3", text: "#FFF3E0", dim: "#B7A9D9",
    amber: "#FFE03D", cyan: "#2EE6D6", green: "#9CFF5E", red: "#FF4FA3", purple: "#B98CFF",
    ink: "#1A1533", capText: "#FFF3E0", capActive: "#FFE03D", capStroke: "#1A1533", brand: "#FF4FA3",
    bw: 4, radius: 14, shadow: "9px 9px 0 #2EE6D6" },
  // H: Swiss noir. Black, white, signal red; strict grid, square corners, giant scene numerals
  suizo: { ...base, name: "suizo", bg: "#0E0E0E", panel: "#171717", panel2: "#222222", line: "#F5F5F0", text: "#F5F5F0", dim: "#8A8A85",
    amber: "#FF3B1F", cyan: "#F5F5F0", green: "#FFD400", red: "#FF3B1F", purple: "#3D7BFF",
    ink: "#0E0E0E", capText: "#F5F5F0", capActive: "#FF3B1F", capStroke: "#0E0E0E", brand: "#F5F5F0",
    bw: 3, radius: 0, shadow: "none" },
  // I: dark tech keynote. Cool near-black stage, hairline grid, soft moving light, ONE accent (lime)
  keynote: { ...base, name: "keynote", bg: "#07080B", panel: "rgba(17,20,26,.92)", panel2: "#161A21", line: "#262B35", text: "#F2F4F8", dim: "#7C8494",
    amber: "#B7F34A", cyan: "#C9D1DC", green: "#B7F34A", red: "#FF5468", purple: "#8B93A1",
    ink: "#07080B", capText: "#F2F4F8", capActive: "#B7F34A", capStroke: "#07080B", brand: "#7C8494",
    bw: 1, radius: 22, shadow: "0 40px 90px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.06)" },
  // J: circuit board. Green solder mask, gold pads, white silkscreen; light (amber) runs along traces
  placa: { ...base, name: "placa", bg: "#05190F", panel: "rgba(4,22,13,.9)", panel2: "#0C3020", line: "#2F8A5C", text: "#F2EEE1", dim: "#8FBFA2",
    amber: "#FFBE54", cyan: "#AAD6E2", green: "#7BE0A6", red: "#FF7A5C", purple: "#D9B25B",
    ink: "#05190F", capText: "#F2EEE1", capActive: "#FFBE54", capStroke: "#03110A", brand: "#D9B25B",
    bw: 2, radius: 8, shadow: "0 0 0 1px #0A2A1A, 0 18px 40px rgba(0,0,0,.5)" },
  // K: amber phosphor CRT. One phosphor ramp, monospace everything, scanlines; ice-blue only for rebuilt code
  crt: { ...base, name: "crt", bg: "#0B0703", panel: "rgba(26,16,4,.7)", panel2: "#24160A", line: "#7A4A10", text: "#FFC46B", dim: "#C98A3A",
    amber: "#FFB000", cyan: "#FFD58A", green: "#BFE6FF", red: "#FF8A3D", purple: "#E09A3A",
    ink: "#0B0703", capText: "#FFC46B", capActive: "#FFF1D0", capStroke: "#0B0703", brand: "#FFB000",
    bw: 2, radius: 4, shadow: "0 0 24px rgba(255,176,0,.18)", mono: true },
  // L: transit line on a dark ground. Each step is a station on one coloured line that grows with the video
  linea: { ...base, name: "linea", bg: "#111318", panel: "#1A1D24", panel2: "#232731", line: "#343946", text: "#FFFFFF", dim: "#8D93A3",
    amber: "#FFC21A", cyan: "#3FA9F5", green: "#21B573", red: "#EF4136", purple: "#A066D3",
    ink: "#111318", capText: "#FFFFFF", capActive: "#FFC21A", capStroke: "#0B0C10", brand: "#FFFFFF",
    bw: 3, radius: 30, shadow: "0 20px 50px rgba(0,0,0,.45)" },
};
export const C: Theme = THEMES[PROPS.theme ?? "noir"] ?? THEMES.noir;

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9_]/g, "");

/** Scenes are written against Spanish sync words; these are the matching words in the English script. */
const EN_KEYS: Record<string, string> = {
  cualquier: "any", programa: "program", aunque: "even", fuente: "source", codigo: "code",
  millones: "millions", vos: "you", ia: "ai", servidor: "server",
  nativo: "native", tipo: "kind", reconoce: "works", motor: "engine",
  arquitectura: "architecture", librerias: "libraries", textos: "text", referencias: "cross",
  pseudocodigo: "pseudocode", grafo: "graph", nombres: "names", comentarios: "comments",
  vio: "saw", deduce: "inferred", sabe: "know", corre: "runs", navegador: "browser",
  verifica: "checks", documento: "documented", modificar: "change", compilar: "build", testear: "test",
  binario: "binary", evidencia: "evidence", seguime: "follow",
};

/** Start time (s) of the nth word in a scene whose text starts with `q`. Throws if missing. */
export function W(scene: number, q: string, nth = 0, edge: "start" | "end" = "start"): number {
  const n = LANG === "en" ? (EN_KEYS[norm(q)] ?? norm(q)) : norm(q);
  const hits = TL.words.filter((w) => w.scene === scene && norm(w.text).startsWith(n));
  if (!hits.length) throw new Error(`timeline: word "${q}" not found in scene ${scene}`);
  return hits[Math.min(nth, hits.length - 1)][edge];
}

export const S = (id: number) => TL.scenes.find((s) => s.id === id)!;

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** Ease-out cubic from 0→1 starting at `at` over `d` seconds. Lead lets the motion land on the word. */
export const ease = (t: number, at: number, d = 0.4, lead = 0.12) => {
  const x = clamp01((t - (at - lead)) / d);
  return 1 - Math.pow(1 - x, 3);
};
/** Overshooting pop 0→1. */
export const pop = (t: number, at: number, d = 0.45, lead = 0.12) => {
  const x = clamp01((t - (at - lead)) / d);
  const c1 = 1.70158, c3 = c1 + 1;
  return x === 0 ? 0 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/** Piecewise keyframes [[time, value]...] with ease-in-out between keys. */
export function kf(t: number, keys: [number, number][]): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) {
      const x = (t - t0) / Math.max(t1 - t0, 1e-6);
      const e = x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
      return v0 + (v1 - v0) * e;
    }
  }
  return keys[keys.length - 1][1];
}

/** Visibility of a scene's own elements: fade in at start, fade out at end. */
export const sceneAlpha = (t: number, id: number, fadeIn = 0.25, fadeOut = 0.25) => {
  const s = S(id);
  return clamp01((t - s.start) / fadeIn) * clamp01((s.end - t) / fadeOut);
};
export const inScene = (t: number, id: number, pad = 0.3) => {
  const s = S(id);
  return t >= s.start - pad && t <= s.end + pad;
};
