import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { Captions, type Card } from "./Captions";
import { loadInter } from "./font";

export type ReelProps = {
  video: string;
  cards: Card[];
  captionStyle: React.ComponentProps<typeof Captions>["style"];
};

/**
 * Картинка приходит уже нарезанной и покрашенной из первой стадии, поэтому
 * здесь только наложение текста. Разделение нарочное: цветокор в ffmpeg
 * точнее, чем CSS-фильтры, а резкости в CSS нет вовсе.
 */
export const Reel: React.FC<ReelProps> = ({ video, cards, captionStyle }) => {
  loadInter();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo src={staticFile(video)} />
      <Captions cards={cards} style={captionStyle} />
    </AbsoluteFill>
  );
};
