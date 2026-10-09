// « Règles du jeu » — FDJ rules layout: gold-framed panel, ribbon, scrollable illustrated sections, OK.
// Every number shown comes from the config modules.

import { useCallback, useEffect, useRef, useState } from 'react';
import { blackjack as bjCfg } from '../../config/blackjack';
import { bonusByTotal } from '../../config/bonuses';
import { economy } from '../../config/economy';
import { match as matchCfg } from '../../config/match';
import { seats, teams } from '../../config/players';
import { navigate } from '../app/store';
import { Avatar } from '../avatar/Avatar';
import { PlayingCard } from '../blackjack/PlayingCard';
import { BonusCard } from '../hud/BonusCard';
import { SettingsGlyph } from '../purse/PurseOverlay';
import { formatEuros } from '../purse/format';
import { drawBoardMini, drawCannonDemo } from '../rules/illustrations';
import { Backdrop } from '../ui/Backdrop';
import { Button3D } from '../ui/Button3D';
import { CanvasArt } from '../ui/CanvasArt';
import { FdjPanel, SectionTitle, TitleBadge } from '../ui/FdjPanel';
import { HexBadge } from '../ui/HexBadge';
import { OutlinedText } from '../ui/OutlinedText';
import { Ribbon } from '../ui/Ribbon';

const PANEL = { left: 42, top: 344, width: 1011, height: 1200 };
const TRACK = { left: 985 - PANEL.left - 22, top: 175, height: 960 };

function Crown() {
  return (
    <svg width={52} height={52} viewBox="0 0 40 40">
      <path d="M5 30 L7 12 L15 20 L20 8 L25 20 L33 12 L35 30 Z" fill="#fff" stroke="#2a1640" strokeWidth={3} strokeLinejoin="round" />
      <rect x={6} y={30} width={28} height={5} rx={2} fill="#fff" stroke="#2a1640" strokeWidth={3} />
    </svg>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return (
    <OutlinedText size={58} color="#f2b52e" stroke="#2a1640" strokeWidth={6} shadowOffset={4}>
      {children}
    </OutlinedText>
  );
}

const DEMO_PLAYERS: { name: string; avatar: number }[] = [
  { name: 'Vous', avatar: 11 },
  { name: 'Joueur 2', avatar: 22 },
  { name: 'Joueur 3', avatar: 33 },
  { name: 'Joueur 4', avatar: 44 },
];

export function RulesScreen() {
  const scroller = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ top: 0, height: 120 });

  const updateThumb = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const ratio = el.clientHeight / el.scrollHeight;
    const h = Math.max(90, TRACK.height * ratio);
    const top = (el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight)) * (TRACK.height - h - 6);
    setThumb({ top: 3 + top, height: h });
  }, []);

  useEffect(() => {
    updateThumb();
    const t = window.setTimeout(updateThumb, 300);
    return () => window.clearTimeout(t);
  }, [updateThumb]);

  const drawBoard = useCallback((ctx: CanvasRenderingContext2D) => drawBoardMini(ctx, 330, 380), []);
  const drawCannon = useCallback((ctx: CanvasRenderingContext2D) => drawCannonDemo(ctx, 800, 360), []);
  const tiers = economy.winnerPrizeTiers;

  return (
    <div className="layer">
      <Backdrop dim={0.7} />
      <FdjPanel style={PANEL}>
        <div ref={scroller} className="fdj-scroll" onScroll={updateThumb} style={{ position: 'absolute', left: 0, right: 40, top: 140, bottom: 20, padding: '20px 18px 30px 30px' }}>
          {/* Le but */}
          <div className="fdj-section">
            <SectionTitle
              badge={
                <TitleBadge kind="purple">
                  <Crown />
                </TitleBadge>
              }
            >
              <H>Le but</H>
            </SectionTitle>
            <div className="felt" style={{ height: 420, display: 'flex', alignItems: 'center', padding: '0 30px', gap: 30 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, flex: 1 }}>
                {DEMO_PLAYERS.map((p, i) => (
                  <div key={p.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <Avatar seed={p.avatar} bg={teams[seats[i].team].tile} size={110} shape="circle" />
                    <OutlinedText size={30} color={i === 0 ? '#ffd75a' : '#ffffff'} strokeWidth={4} shadowOffset={2}>
                      {p.name}
                    </OutlinedText>
                  </div>
                ))}
              </div>
              <CanvasArt width={330} height={380} draw={drawBoard} />
            </div>
            <p className="fdj-text" style={{ margin: '26px 6px 0' }}>
              Affrontez <b>3 joueurs</b> pour le contrôle du plateau. Chacun possède un canon dans son coin. Après{' '}
              <b>{matchCfg.durationSec} secondes</b>, le joueur qui possède <b>le plus de territoire</b> remporte le gain !
            </p>
          </div>

          {/* 1 Les canons */}
          <div className="fdj-section">
            <SectionTitle badge={<TitleBadge kind="gold">1</TitleBadge>}>
              <H>Les canons</H>
            </SectionTitle>
            <div className="felt" style={{ height: 360, padding: 0 }}>
              <CanvasArt width={800} height={360} draw={drawCannon} />
            </div>
            <p className="fdj-text" style={{ margin: '26px 6px 0' }}>
              Votre canon tire tout seul en balayant votre coin. Chaque boule qui touche une case adverse la <b>peint à vos couleurs</b>.
            </p>
          </div>

          {/* 2 La donne */}
          <div className="fdj-section">
            <SectionTitle badge={<TitleBadge kind="gold">2</TitleBadge>}>
              <H>La donne</H>
            </SectionTitle>
            <div className="felt" style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
              <div style={{ position: 'relative', width: 190, height: 170 }}>
                <PlayingCard card={{ rank: '10', suit: '♠', id: -10 }} style={{ position: 'absolute', left: 0, top: 6, transform: 'rotate(-6deg)' }} />
                <PlayingCard card={{ rank: '9', suit: '♥', id: -11 }} style={{ position: 'absolute', left: 70, top: 0, transform: 'rotate(5deg)' }} />
              </div>
              <OutlinedText size={70}>=</OutlinedText>
              <HexBadge size={130}>19</HexBadge>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <MiniButton variant="green" text="CARTE" />
                <MiniButton variant="red" text="RESTER" />
              </div>
            </div>
            <p className="fdj-text" style={{ margin: '26px 6px 0' }}>
              Toutes les <b>{matchCfg.roundIntervalSec} secondes</b>, une main de Blackjack est distribuée en bas de l’écran ({matchCfg.blackjackRounds} donnes
              par partie). Tirez une <b>CARTE</b> ou <b>RESTEZ</b> pour approcher <b>{bjCfg.target}</b> sans le dépasser. Vous avez{' '}
              <b>{bjCfg.decisionTimeSec} secondes</b> pour décider.
            </p>
          </div>

          {/* 3 Les bonus */}
          <div className="fdj-section">
            <SectionTitle badge={<TitleBadge kind="gold">3</TitleBadge>}>
              <H>Les bonus</H>
            </SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
              {[18, 19, 20, 21].map((t) => {
                const b = bonusByTotal[t];
                return (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
                    <div style={{ transform: 'scale(0.72)', transformOrigin: 'left center', width: 196 * 0.72, height: 210 * 0.72 + 20 }}>
                      <BonusCard bonus={b} width={196} height={210} state={t === 21 ? 'target' : 'idle'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <OutlinedText size={46} color={t === 21 ? '#ffd75a' : '#ffffff'} strokeWidth={5} shadowOffset={3}>
                        {t} · {b.name}
                      </OutlinedText>
                      <div className="fdj-text" style={{ fontSize: 32, lineHeight: 1.3, marginTop: 6 }}>
                        {b.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="fdj-text" style={{ margin: '26px 6px 0' }}>
              Les bonus se jouent <b>automatiquement</b> juste après la donne. Au-dessus de {bjCfg.target} ou en dessous de {bjCfg.minBonusTotal} :
              pas de bonus. Le <b>{bjCfg.target}</b> débloque le Dragon, de loin le plus puissant !
            </p>
          </div>

          {/* 4 Les gains */}
          <div className="fdj-section">
            <SectionTitle badge={<TitleBadge kind="gold">4</TitleBadge>}>
              <H>Les gains</H>
            </SectionTitle>
            <div className="felt" style={{ padding: '30px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {tiers.map((t, i) => (
                <div key={t.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <OutlinedText size={40} strokeWidth={5} shadowOffset={3}>
                    {i === tiers.length - 1 ? '1er du plateau' : `1er avec ${Math.round(t.minShare * 100)} % ou +`}
                  </OutlinedText>
                  <OutlinedText size={58} color="#ffd75a" strokeWidth={6} shadowOffset={4}>
                    {formatEuros(t.prizeCents)}
                  </OutlinedText>
                </div>
              ))}
            </div>
            <p className="fdj-text" style={{ margin: '26px 6px 0' }}>
              Mise : <b>{formatEuros(economy.betCents)}</b> par partie. Seul le joueur qui termine <b>premier</b> remporte un gain, d’autant plus gros que
              son territoire est grand.
            </p>
          </div>
        </div>

        <div className="fdj-scrolltrack" style={{ left: TRACK.left, top: TRACK.top, height: TRACK.height }}>
          <div className="fdj-scrollthumb" style={{ top: thumb.top, height: thumb.height }} />
        </div>
      </FdjPanel>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 287, display: 'flex', justifyContent: 'center' }}>
        <Ribbon text="Règles du jeu" width={820} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1592,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          fontFamily: 'var(--font-body)',
          fontWeight: 900,
          fontSize: 33,
          color: '#ffffff',
        }}
      >
        Pour retrouver les règles pendant le jeu, cliquez sur <SettingsGlyph size={54} />
      </div>
      <div style={{ position: 'absolute', left: 334, top: 1680 }}>
        <Button3D width={412} height={156} fontSize={86} onClick={() => navigate('BetMenu')}>
          OK
        </Button3D>
      </div>
    </div>
  );
}

function MiniButton({ variant, text }: { variant: 'green' | 'red'; text: string }) {
  return (
    <div className={`btn3d btn-${variant}`} style={{ width: 190, height: 92, pointerEvents: 'none' }}>
      <span className="btn3d-depth" style={{ borderRadius: 24 }} />
      <span className="btn3d-face" style={{ borderRadius: 24 }}>
        <OutlinedText size={40} stroke="#2a1640" shadow="#2a1640" strokeWidth={5} shadowOffset={3}>
          {text}
        </OutlinedText>
      </span>
    </div>
  );
}
