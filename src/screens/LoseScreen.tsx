// Game over: subdued glow, final ranking, replay / quit.

import { useEffect } from 'react';
import { useAppState } from '../app/store';
import { Backdrop } from '../ui/Backdrop';
import { OutlinedText } from '../ui/OutlinedText';
import { Ribbon } from '../ui/Ribbon';
import { sfx } from '../audio/sfx';
import { EndButtons } from './EndButtons';
import { Standings } from './Standings';
import { ordinal } from '../hud/TopHud';

export function LoseScreen() {
  const result = useAppState((s) => s.lastResult);
  const me = result?.standings.find((s) => s.isHuman);
  useEffect(() => {
    sfx.lose();
  }, []);
  return (
    <div className="layer">
      <Backdrop dim={0.75} />
      <div
        style={{
          position: 'absolute',
          left: 540 - 420,
          top: 760 - 420,
          width: 840,
          height: 840,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(140,110,230,0.35) 0%, rgba(90,60,180,0.15) 45%, rgba(60,30,140,0) 70%)',
          animation: 'pulse 3s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 540 - 300,
          top: 760 - 300,
          width: 600,
          height: 600,
          borderRadius: '50%',
          border: '6px solid rgba(214,202,247,0.18)',
          boxShadow: '0 0 60px rgba(150,120,255,0.25), inset 0 0 60px rgba(150,120,255,0.2)',
        }}
      />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center', animation: 'pop-in 500ms ease-out both' }}>
        <Ribbon text="Partie Terminée" width={900} fontSize={90} />
      </div>
      {me && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center', animation: 'fade-up 500ms 150ms ease-out both' }}>
          <OutlinedText size={150} color="#d6caf7" strokeWidth={14}>
            {ordinal(me.rank)}
          </OutlinedText>
          <div style={{ marginTop: 18 }}>
            <OutlinedText size={52} color="#b9addf">
              avec {Math.round(me.share * 100)} % du plateau
            </OutlinedText>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 930, textAlign: 'center', animation: 'fade-up 500ms 300ms ease-out both' }}>
        <OutlinedText size={58}>Vous pouvez retenter votre chance</OutlinedText>
      </div>
      {result && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1110 }}>
          <Standings standings={result.standings} />
        </div>
      )}
      <EndButtons top={1620} />
    </div>
  );
}
