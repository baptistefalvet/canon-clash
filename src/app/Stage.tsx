// Fixed 1080×1920 design frame, scaled to the viewport. Everything inside uses design pixels.

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { stage } from '../../config/layout';

const StageScaleContext = createContext(1);

export const useStageScale = () => useContext(StageScaleContext);

function computeScale() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const byWidth = w / stage.width;
  return stage.fit === 'width' ? byWidth : Math.min(byWidth, h / stage.height);
}

export function Stage({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(computeScale);

  useEffect(() => {
    const onResize = () => setScale(computeScale());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="stage-viewport" style={{ background: stage.letterboxColor }}>
      <div
        className="stage"
        style={{
          width: stage.width,
          height: stage.height,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <StageScaleContext.Provider value={scale}>{children}</StageScaleContext.Provider>
      </div>
    </div>
  );
}
