// Simulated matchmaking: opponents appear one by one; cancelling refunds the bet.

import { useEffect, useMemo, useState } from 'react';
import { matchmaking } from '../../config/flow';
import { seats, teams } from '../../config/players';
import { navigate, refundBet, startMatch } from '../app/store';
import { Avatar } from '../avatar/Avatar';
import { randomLineup } from '../matchmaking/lineup';
import { Backdrop } from '../ui/Backdrop';
import { Button3D } from '../ui/Button3D';
import { FdjPanel } from '../ui/FdjPanel';
import { OutlinedText } from '../ui/OutlinedText';
import { Ribbon } from '../ui/Ribbon';
import { sfx } from '../audio/sfx';

const CORNER_LABEL: Record<string, string> = { BL: 'Bas gauche', BR: 'Bas droite', TL: 'Haut gauche', TR: 'Haut droite' };

export function MatchmakingScreen() {
  const lineup = useMemo(randomLineup, []);
  const [found, setFound] = useState(1);
  const ready = found >= lineup.length;

  useEffect(() => {
    const timers = matchmaking.slotFillDelaysMs.map((ms, i) =>
      window.setTimeout(() => {
        setFound(i + 2);
        sfx.coin();
      }, ms),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => {
      startMatch(lineup);
      navigate('Game');
    }, matchmaking.readyHoldMs);
    return () => window.clearTimeout(t);
  }, [ready, lineup]);

  const cancel = () => {
    refundBet();
    navigate('BetMenu');
  };

  // Display order matches the board: top row then bottom row
  const grid = ['TL', 'TR', 'BL', 'BR'].map((corner) => seats.findIndex((s) => s.corner === corner));

  return (
    <div className="layer">
      <Backdrop />
      <FdjPanel style={{ left: 50, top: 380, width: 980, height: 1060 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center' }}>
          <OutlinedText size={50} color="#d6caf7">
            {ready ? 'Adversaires trouvés !' : 'Recherche d’adversaires…'}
          </OutlinedText>
        </div>
        <div style={{ position: 'absolute', left: 50, right: 50, top: 220, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>
          {grid.map((seat) => {
            const p = lineup[seat];
            const team = teams[seats[seat].team];
            const shown = seat < found;
            return (
              <div
                key={seat}
                className="fdj-section"
                style={{ height: 330, padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, borderColor: shown ? team.tile : undefined }}
              >
                {shown ? (
                  <div style={{ animation: 'pop-in 420ms ease-out both', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                    <Avatar seed={p.avatar} bg={team.tile} size={170} shape="circle" />
                    <OutlinedText size={50} color={p.isHuman ? '#ffd75a' : '#ffffff'}>
                      {p.name}
                    </OutlinedText>
                    <span className="fdj-text" style={{ fontSize: 28, lineHeight: 1 }}>
                      {CORNER_LABEL[seats[seat].corner]}
                    </span>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        width: 170,
                        height: 170,
                        borderRadius: '50%',
                        border: '10px solid rgba(214,202,247,0.2)',
                        borderTopColor: '#ffc631',
                        animation: 'spin 0.9s linear infinite',
                      }}
                    />
                    <OutlinedText size={44} color="#9b8fc7">
                      …
                    </OutlinedText>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </FdjPanel>
      <div style={{ position: 'absolute', left: 140, top: 300 }}>
        <Ribbon text="Matchmaking" width={800} fontSize={86} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1560, display: 'flex', justifyContent: 'center' }}>
        {ready ? (
          <div style={{ animation: 'pop-in 400ms ease-out both' }}>
            <OutlinedText size={120} color="#ffd75a" strokeWidth={14} shadowOffset={10}>
              C&apos;EST PARTI !
            </OutlinedText>
          </div>
        ) : (
          <Button3D variant="purple" width={480} height={150} fontSize={64} onClick={cancel}>
            ANNULER
          </Button3D>
        )}
      </div>
    </div>
  );
}
