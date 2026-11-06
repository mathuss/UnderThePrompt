import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { FPS, TL, LANG } from "./lib";
import { MottTest, MOTT_TEST_SECONDS } from "./MottTest";

export const Root: React.FC = () => (
  <>
    <Composition id={`UTP-${LANG.toUpperCase()}-001-rea`} component={Video} durationInFrames={Math.ceil(TL.duration * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="Mott-Test" component={MottTest} durationInFrames={Math.ceil(MOTT_TEST_SECONDS * FPS)} fps={FPS} width={1080} height={1920} />
  </>
);
