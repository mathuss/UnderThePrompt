import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { FPS, TL, LANG } from "./lib";
import { MottTest, MOTT_TEST_SECONDS } from "./MottTest";
import { Pilot000, PILOT_DURATION } from "./episodes/Pilot000";
import { HostOptions } from "./HostOptions";
import { HostExpr, HOST_EXPR_SECONDS } from "./HostExpr";

export const Root: React.FC = () => (
  <>
    <Composition id={`UTP-${LANG.toUpperCase()}-001-rea`} component={Video} durationInFrames={Math.ceil(TL.duration * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="UTP-000-moth-EN" component={Pilot000} durationInFrames={Math.ceil(PILOT_DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="Host-Options" component={HostOptions} durationInFrames={90} fps={FPS} width={1080} height={1920} />
    <Composition id="Host-Expressions" component={HostExpr} durationInFrames={Math.ceil(HOST_EXPR_SECONDS * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="Mott-Test" component={MottTest} durationInFrames={Math.ceil(MOTT_TEST_SECONDS * FPS)} fps={FPS} width={1080} height={1920} />
  </>
);
