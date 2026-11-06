import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { FPS, C, LANG } from "./lib";
import { Background, Brand, Captions, Overlay } from "./components";
import * as Sc from "./scenes";

const SCENES = [Sc.Scene1, Sc.Scene2, Sc.Scene3, Sc.Scene4, Sc.Scene5, Sc.Scene6, Sc.Scene7, Sc.Scene8, Sc.Scene9, Sc.Scene10, Sc.Scene11];

export const Video: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Background t={t} />
      <AbsoluteFill style={{ filter: C.name === "crt" ? "drop-shadow(0 0 6px rgba(255,176,0,.45))" : undefined }}>
      <Brand t={t} />
      {SCENES.map((Scene, i) => <Scene key={i} t={t} />)}
      <Sc.CodePanel t={t} />
      <Sc.FunctionBox t={t} />
      <Sc.PersistentCard t={t} />
      <Captions t={t} />
      </AbsoluteFill>
      <Overlay />
      <Audio src={staticFile(`voice_${LANG}.wav`)} />
    </AbsoluteFill>
  );
};
