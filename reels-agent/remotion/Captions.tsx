import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

export type Card = { start: number; end: number; text: string };

type Props = {
  cards: Card[];
  style: {
    size_pct_of_height: number;
    weight: number;
    letter_spacing_em: number;
    color: string;
    align: string;
    x_pct: number;
    y_pct: number;
  };
};

/**
 * Карточка держится на экране ровно столько, сколько звучит, и меняется
 * жёстко — без затухания. Плавное появление на коротких карточках читается
 * как задержка: текст ещё проявляется, а слово уже сказано.
 */
export const Captions: React.FC<Props> = ({ cards, style }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;

  const card = cards.find((c) => t >= c.start && t < c.end);
  if (!card) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: `${style.y_pct}%`,
        left: `${style.x_pct}%`,
        right: "6%",
        textAlign: style.align as React.CSSProperties["textAlign"],
        fontFamily: "Inter, sans-serif",
        fontWeight: style.weight,
        fontSize: (style.size_pct_of_height / 100) * height,
        letterSpacing: `${style.letter_spacing_em}em`,
        color: style.color,
        lineHeight: 1.35,
        whiteSpace: "pre-wrap",
      }}
    >
      {card.text}
    </div>
  );
};
