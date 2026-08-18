import React from "react";
import { Composition } from "remotion";
import { Reel, type ReelProps } from "./Reel";
import preset from "../preset.json";

const FPS = preset.output.fps;

const captionStyle = {
  size_pct_of_height: preset.captions.size_pct_of_height,
  weight: preset.captions.weight,
  letter_spacing_em: preset.captions.letter_spacing_em,
  color: preset.captions.color,
  align: preset.captions.align,
  x_pct: preset.captions.x_pct,
  y_pct: preset.captions.y_pct,
};

/**
 * План приходит пропсами, а не импортом.
 *
 * `import plan from "../work/plan.json"` разваливал сборку, пока ролик ещё не
 * прогоняли: файл генерируется, в репозитории его нет. Пропсы решают это и
 * заодно позволяют рендерить разные ролики без правки кода — длительность
 * считается из них же в calculateMetadata.
 */
export const RemotionRoot: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel}
    fps={FPS}
    width={preset.output.width}
    height={preset.output.height}
    durationInFrames={FPS}
    defaultProps={{ video: "graded.mov", cards: [], captionStyle } as ReelProps}
    calculateMetadata={({ props }) => {
      const last = props.cards.length ? props.cards[props.cards.length - 1].end : 1;
      return { durationInFrames: Math.max(1, Math.round(last * FPS)) };
    }}
  />
);
