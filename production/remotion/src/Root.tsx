import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { FPS, TL, LANG } from "./lib";

export const Root: React.FC = () => (
  <>
    <Composition id={`UTP-${LANG.toUpperCase()}-001-rea`} component={Video} durationInFrames={Math.ceil(TL.duration * FPS)} fps={FPS} width={1080} height={1920} />
  </>
);
