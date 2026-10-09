// Options modal (above everything, 60 % black backdrop): audio toggles, rules, regulations, quit.

import { flow } from '../../config/flow';
import { closeModal, navigate, setMusic, setSfx, useAppState } from '../app/store';
import { Button3D } from '../ui/Button3D';
import { FdjPanel } from '../ui/FdjPanel';
import { OutlinedText } from '../ui/OutlinedText';
import { Ribbon } from '../ui/Ribbon';
import { sfx } from '../audio/sfx';

function Speaker({ on }: { on: boolean }) {
  return (
    <svg width={64} height={64} viewBox="0 0 40 40">
      <path d="M6 15 H13 L22 7 V33 L13 25 H6 Z" fill="#fff" stroke="#2a1640" strokeWidth={3} strokeLinejoin="round" />
      {on ? (
        <>
          <path d="M26 14 Q30 20 26 26" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" />
          <path d="M30 10 Q37 20 30 30" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" />
        </>
      ) : (
        <path d="M26 14 L36 26 M36 14 L26 26" stroke="#fb586c" strokeWidth={4} strokeLinecap="round" />
      )}
    </svg>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => {
        onChange(!on);
        sfx.click();
      }}
      className="fdj-section"
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 28, padding: '22px 34px', cursor: 'pointer' }}
    >
      <span
        style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          background: on ? 'linear-gradient(180deg,#8cf06b,#2fbd35)' : '#170c31',
          boxShadow: '0 0 0 5px #140e24, inset 0 4px 0 rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {on && (
          <svg width={48} height={48} viewBox="0 0 24 24">
            <path d="M4 12 L10 18 L20 6" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <Speaker on={on} />
      <OutlinedText size={56}>{label}</OutlinedText>
    </button>
  );
}

export function OptionsModal() {
  const musicOn = useAppState((s) => s.musicOn);
  const sfxOn = useAppState((s) => s.sfxOn);
  const hasRegulations = flow.regulationsUrl.length > 0;

  return (
    <div className="layer" style={{ zIndex: 100 }}>
      <div className="layer" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={closeModal} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', animation: 'pop-in 280ms ease-out both' }}>
        <FdjPanel style={{ left: 90, top: 470, width: 900, height: 1080, pointerEvents: 'auto' }}>
          <div style={{ position: 'absolute', left: 50, right: 50, top: 150, display: 'flex', flexDirection: 'column', gap: 26 }}>
            <Toggle label="Musique" on={musicOn} onChange={setMusic} />
            <Toggle label="Sons" on={sfxOn} onChange={setSfx} />
            <div style={{ height: 10 }} />
            <Button3D variant="blue" width={790} height={130} fontSize={58} onClick={() => navigate('Rules')}>
              Règles du jeu
            </Button3D>
            <Button3D
              variant="purple"
              width={790}
              height={130}
              fontSize={58}
              disabled={!hasRegulations}
              onClick={() => window.open(flow.regulationsUrl, '_blank', 'noopener')}
            >
              Règlement de ce jeu
            </Button3D>
            <Button3D variant="red" width={790} height={130} fontSize={58} onClick={() => navigate('TitleScreen')}>
              Quitter le jeu
            </Button3D>
          </div>
        </FdjPanel>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 410, display: 'flex', justifyContent: 'center' }}>
          <Ribbon text="Options" width={640} />
        </div>
        <button
          aria-label="Fermer"
          onClick={() => {
            sfx.click();
            closeModal();
          }}
          style={{
            position: 'absolute',
            left: 920,
            top: 440,
            width: 104,
            height: 104,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            pointerEvents: 'auto',
            background: 'radial-gradient(circle at 50% 30%, #ff9aa6, #fb586c 50%, #c4162c)',
            boxShadow: '0 0 0 6px #140e24, 0 8px 0 6px #140e24, inset 0 -6px 0 rgba(0,0,0,0.2), inset 0 5px 0 rgba(255,255,255,0.4)',
          }}
        >
          <svg width={52} height={52} viewBox="0 0 24 24" style={{ display: 'block', margin: 'auto' }}>
            <path d="M5 5 L19 19 M19 5 L5 19" stroke="#140e24" strokeWidth={7} strokeLinecap="round" />
            <path d="M5 5 L19 19 M19 5 L5 19" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
