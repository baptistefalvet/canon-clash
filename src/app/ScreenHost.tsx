// Exactly one active screen; on change the previous instance stays mounted just long enough to play its outro.

import { useEffect, useState, type ReactElement } from 'react';
import { screenTransition } from '../../config/layout';
import { useAppState, type ScreenId } from './store';

interface Entry {
  id: ScreenId;
  key: number;
  leaving: boolean;
}

let nextKey = 1;

export function ScreenHost({ screens }: { screens: Record<ScreenId, () => ReactElement> }) {
  const screen = useAppState((s) => s.screen);
  const [entries, setEntries] = useState<Entry[]>(() => [{ id: screen, key: nextKey++, leaving: false }]);

  useEffect(() => {
    setEntries((list) => {
      const active = list.find((e) => !e.leaving);
      if (active && active.id === screen) return list;
      return [...list.filter((e) => !e.leaving).map((e) => ({ ...e, leaving: true })), { id: screen, key: nextKey++, leaving: false }];
    });
    const t = window.setTimeout(() => setEntries((list) => list.filter((e) => !e.leaving)), screenTransition.outroMs);
    return () => window.clearTimeout(t);
  }, [screen]);

  const vars = { '--intro-ms': `${screenTransition.introMs}ms`, '--outro-ms': `${screenTransition.outroMs}ms` } as React.CSSProperties;
  return (
    <div className="layer" style={vars}>
      {entries.map((e) => {
        const Screen = screens[e.id];
        return (
          <div className={`screen ${e.leaving ? 'screen-outro' : 'screen-intro'}`} key={e.key}>
            <Screen />
          </div>
        );
      })}
    </div>
  );
}
