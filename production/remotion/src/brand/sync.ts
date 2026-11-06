/** Word-level sync for any episode timeline (from tools/make_voice.py). */
export type Word = { text: string; start: number; end: number; scene: number; line: number; speaker?: string };
export type Timeline = { duration: number; scenes: { id: number; start: number; end: number }[]; words: Word[] };

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9_]/g, "");

export function makeSync(tl: Timeline) {
  /** Start (or end) time of the nth word in a scene that starts with `q`. Throws if missing, so a script edit can't silently break sync. */
  const W = (scene: number, q: string, nth = 0, edge: "start" | "end" = "start") => {
    const n = norm(q);
    const hits = tl.words.filter((w) => w.scene === scene && norm(w.text).startsWith(n));
    if (!hits.length) throw new Error(`timeline: word "${q}" not found in scene ${scene}`);
    return hits[Math.min(nth, hits.length - 1)][edge];
  };
  const S = (id: number) => {
    const s = tl.scenes.find((x) => x.id === id);
    if (!s) throw new Error(`timeline: scene ${id} missing`);
    return s;
  };
  /** Shot id at time t (scenes are contiguous). */
  const shotAt = (t: number) => (tl.scenes.find((s) => t < s.end) ?? tl.scenes[tl.scenes.length - 1]).id;

  // caption chunks: ≤4 words / ≤24 chars, break after punctuation and between lines
  type Chunk = { words: Word[]; start: number; end: number };
  const chunks: Chunk[] = [];
  let cur: Word[] = [];
  const flush = () => { if (cur.length) chunks.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end }); cur = []; };
  tl.words.forEach((w, i) => {
    const prev = tl.words[i - 1];
    if (prev && (prev.line !== w.line || prev.scene !== w.scene)) flush();
    if (cur.length >= 4 || cur.map((x) => x.text).join(" ").length + w.text.length + 1 > 24) flush();
    cur.push(w);
    if (/[,.:?!…"]$/.test(w.text) && cur.length >= 2) flush();
  });
  flush();
  chunks.forEach((c, i) => { const nx = chunks[i + 1]; c.end = nx && nx.start - c.end < 0.7 ? nx.start : c.end + 0.35; });

  return { W, S, shotAt, chunks, duration: tl.duration };
}

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const c = clamp01(x); return c * c * (3 - 2 * c); };
/** 0→1 over [a, a+d] with smoothstep. */
export const ramp = (t: number, a: number, d = 0.4) => smooth((t - a) / d);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => lerp(v, b[i], k));
/** Overshooting pop 0→1 (back-out). */
export const pop = (t: number, a: number, d = 0.45) => {
  const x = clamp01((t - a) / d); if (x === 0) return 0;
  const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
