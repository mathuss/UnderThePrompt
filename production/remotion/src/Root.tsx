import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { FPS, TL, LANG } from "./lib";
import { MottTest, MOTT_TEST_SECONDS } from "./MottTest";
import { Pilot000, PILOT_DURATION } from "./episodes/Pilot000";
import { HostOptions } from "./HostOptions";
import { HostExpr, HOST_EXPR_SECONDS } from "./HostExpr";
import { Ep2611050601, EP2611050601_DURATION } from "./episodes/Ep2611050601";
import { Ep2611050601v2, EP2611050601V2_DURATION } from "./episodes/Ep2611050601v2";
import { Ep2611050601es, EP2611050601ES_DURATION } from "./episodes/Ep2611050601es";
import { Ep2611050601es2, EP2611050601ES2_DURATION } from "./episodes/Ep2611050601es2";
import { LogoEyespot, LogoMott, LogoPrompt, Wordmark, Banner, Cover } from "./BrandAssets";

export const Root: React.FC = () => (
  <>
    <Composition id={`UTP-${LANG.toUpperCase()}-001-rea`} component={Video} durationInFrames={Math.ceil(TL.duration * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="UTP-000-moth-EN" component={Pilot000} durationInFrames={Math.ceil(PILOT_DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="UTP-20261105-06-EN" component={Ep2611050601} durationInFrames={Math.ceil(EP2611050601_DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="UTP-20261105-06-v2-EN" component={Ep2611050601v2} durationInFrames={Math.ceil(EP2611050601V2_DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="UTP-20261105-06-ES" component={Ep2611050601es} durationInFrames={Math.ceil(EP2611050601ES_DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="UTP-20261105-06-ES2" component={Ep2611050601es2} durationInFrames={Math.ceil(EP2611050601ES2_DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="Host-Options" component={HostOptions} durationInFrames={90} fps={FPS} width={1080} height={1920} />
    <Composition id="Host-Expressions" component={HostExpr} durationInFrames={Math.ceil(HOST_EXPR_SECONDS * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="Mott-Test" component={MottTest} durationInFrames={Math.ceil(MOTT_TEST_SECONDS * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="Logo-Eyespot" component={LogoEyespot} durationInFrames={1} fps={FPS} width={800} height={800} />
    <Composition id="Logo-Mott" component={LogoMott} durationInFrames={1} fps={FPS} width={800} height={800} />
    <Composition id="Logo-Prompt" component={LogoPrompt} durationInFrames={1} fps={FPS} width={800} height={800} />
    <Composition id="Wordmark" component={Wordmark} durationInFrames={1} fps={FPS} width={2400} height={600} />
    <Composition id="Banner-YouTube" component={Banner} durationInFrames={1} fps={FPS} width={2560} height={1440} />
    <Composition id="Cover" component={Cover} durationInFrames={1} fps={FPS} width={1080} height={1920} />
  </>
);
