// Static canvas illustration drawn once with the game's own sprite code (rules, menus).

import { useEffect, useRef } from 'react';

export function CanvasArt({
  width,
  height,
  draw,
  style,
}: {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ratio = 2;
  useEffect(() => {
    const ctx = ref.current!.getContext('2d')!;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    draw(ctx);
  }, [draw, width, height]);
  return <canvas ref={ref} width={width * ratio} height={height * ratio} style={{ width, height, display: 'block', ...style }} />;
}
