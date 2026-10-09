// Paywall: « JOUEZ 1 € » deducts the bet (if affordable) then opens the matchmaking.

import { useState } from 'react';
import { economy } from '../../config/economy';
import { navigate, placeBet } from '../app/store';
import { formatEuros } from '../purse/format';
import { Button3D } from '../ui/Button3D';
import { OutlinedText } from '../ui/OutlinedText';
import { sfx } from '../audio/sfx';
import { TitleLayout } from './TitleLayout';

export function BetMenu() {
  const [refusedKey, setRefusedKey] = useState(0);
  const play = () => {
    if (!placeBet()) {
      sfx.error();
      setRefusedKey((k) => k + 1);
      return;
    }
    sfx.coin();
    navigate('Matchmaking');
  };
  return (
    <TitleLayout
      footer={
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1540, display: 'flex', justifyContent: 'center' }}>
            <div style={{ animation: refusedKey ? undefined : 'pulse 1.4s ease-in-out infinite' }}>
              <Button3D width={600} height={190} fontSize={96} onClick={play} silent>
                JOUEZ {formatEuros(economy.betCents).replace(',00', '')}
              </Button3D>
            </div>
          </div>
          {refusedKey > 0 && (
            <div key={refusedKey} style={{ position: 'absolute', left: 0, right: 0, top: 1770, display: 'flex', justifyContent: 'center', animation: 'shake-x 0.45s ease-out' }}>
              <div style={{ padding: '16px 36px', borderRadius: 40, background: '#c4162c', boxShadow: '0 0 0 5px #1b1430' }}>
                <OutlinedText size={44} shadow={null}>
                  Solde insuffisant pour jouer
                </OutlinedText>
              </div>
            </div>
          )}
        </>
      }
    />
  );
}
