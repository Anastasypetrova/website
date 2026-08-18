import React from "react";
import { Composition, staticFile, getStaticFiles } from "remotion";
import { Reel } from "./Reel";
import plan from "../work/plan.json";
import preset from "../preset.json";

const FPS = preset.output.fps;
const duration = Math.max(1, Math.round(plan.duration_edited_s * FPS));

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel}
    durationInFrames={duration}
    fps={FPS}
    width={preset.output.width}
    height={preset.output.height}
    defaultProps={{
      video: "graded.mov",
      cards: plan.cards,
      captionStyle: {
        size_pct_of_height: preset.captions.size_pct_of_height,
        weight: preset.captions.weight,
        letter_spacing_em: preset.captions.letter_spacing_em,
        color: preset.captions.color,
        align: preset.captions.align,
        x_pct: preset.captions.x_pct,
        y_pct: preset.captions.y_pct,
      },
    }}
  />
);
