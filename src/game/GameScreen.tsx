// Game screen: canvas arena + React HUD. Runs the Match loop and turns its events into overlays/sounds.

import { useEffect, useMemo, useRef, useState } from 'react';
import { bonusAnnounce } from '../../config/bonuses';
import { charge as chargeCfg } from '../../config/charge';
import { board } from '../../config/board';
import { gameLayout, stage } from '../../config/layout';
import { match as matchCfg } from '../../config/match';
import { useAppState } from '../app/store';
import { useStageScale } from '../app/Stage';
import { renderStaticDecor } from '../board/frame';
import { Drawer } from '../hud/Drawer';
import { TopHud } from '../hud/TopHud';
import { randomLineup } from '../matchmaking/lineup';
import { OutlinedText } from '../ui/OutlinedText';
import { sfx } from '../audio/sfx';
import { bonusArt } from '../ui/bonusArt';
import { Match } from './match';
import { bonusForLevel, spawnBonus } from '../bonuses';
import { computeResult, finishMatch } from './result';
import { snapshot } from './snapshot';
import type { BonusInfo } from '../../config/bonuses';

const BOARD_CX = board.originX + (board.cols * board.tileSize) / 2;
const BOARD_CY = board.originY + (board.rows * board.tileSize) / 2;

type Overlay =
  | { kind: 'count'; text: string; key: number }
  | { kind: 'bonus'; bonus: BonusInfo; key: number }
  | { kind: 'timeUp'; key: number };

export function GameScreen() {
  const lineup = useAppState((s) => s.lineup);
  const devMode = useAppState((s) => s.devMode);
  const scale = useStageScale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const matchRef = useRef<Match | null>(null);
  if (!matchRef.current) matchRef.current = new Match(lineup ?? randomLineup());
  const m = matchRef.current;

  const [ui, setUi] = useState(() => snapshot(m));
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null);
  const [flyLevel, setFlyLevel] = useState<number | null>(null);

  // Dev helpers: ?speed=N fast-forwards; keys 1–4 fire a special shot for you (Scie → Dragon)
  const devSpeed = devMode ? Math.max(1, Math.floor(Number(new URLSearchParams(window.location.search).get('speed')) || 1)) : 1;
  useEffect(() => {
    if (!devMode) return;
    const onKey = (e: KeyboardEvent) => {
      const k = Number(e.key);
      const info = k >= 1 && k <= 4 ? bonusForLevel(chargeCfg.minZone + k - 1) : null;
      if (info && m.phase === 'playing') {
        m.bonuses.push(spawnBonus(info.id, m.humanSeat, m));
        m.cannons[m.humanSeat].blast(m, info.color);
        m.events.push({ type: 'bonus', seat: m.humanSeat, bonus: info });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [devMode, m]);

  const pixelRatio = Math.min(3, Math.max(0.5, scale * (window.devicePixelRatio || 1)));
  const decor = useMemo(() => renderStaticDecor(pixelRatio), [pixelRatio]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    let last = performance.now();
    let lastUi = 0;
    let key = 0;
    let done = false;
    const timers: number[] = [];

    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      for (let i = 0; i < devSpeed; i++) m.update(dt);
      let dirty = false;
      for (const e of m.events.splice(0)) {
        dirty = true;
        switch (e.type) {
          case 'countdown':
            setOverlay({ kind: 'count', text: String(e.value), key: ++key });
            sfx.countdown(false);
            break;
          case 'go':
            setOverlay({ kind: 'count', text: 'GO !', key: ++key });
            sfx.countdown(true);
            break;
          case 'roundStart':
            setToast({
              text: e.index === 0 ? `Chargez votre canon ! Visez ${chargeCfg.minZone} à ${chargeCfg.cap}` : `Charge ${e.index + 1}/${matchCfg.chargeRounds}`,
              key: ++key,
            });
            break;
          case 'bonus':
            if (e.seat === m.humanSeat) {
              setFlyLevel(e.bonus.level);
              setOverlay({ kind: 'bonus', bonus: e.bonus, key: ++key });
              timers.push(window.setTimeout(() => setFlyLevel(null), 700));
            }
            break;
          case 'timeUp':
            setOverlay({ kind: 'timeUp', key: ++key });
            sfx.whoosh();
            break;
          case 'over':
            if (!done) {
              done = true;
              finishMatch(computeResult(m));
            }
            break;
          default:
            break;
        }
      }
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      m.draw(ctx, decor);
      if (dirty || now - lastUi > 80) {
        lastUi = now;
        setUi(snapshot(m));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [decor, pixelRatio, m, devSpeed]);

  const debugFinish = (won: boolean) => {
    const r = computeResult(m);
    finishMatch(won ? { ...r, won: true, prizeCents: r.prizeCents || 200, prizeLabel: r.prizeLabel || 'VICTOIRE !' } : { ...r, won: false, prizeCents: 0 });
  };

  return (
    <div className="layer" style={{ background: '#302653' }}>
      <canvas
        ref={canvasRef}
        width={Math.round(stage.width * pixelRatio)}
        height={Math.round(stage.height * pixelRatio)}
        style={{ position: 'absolute', left: 0, top: 0, width: stage.width, height: stage.height }}
      />

      <TopHud seats={m.seats} ui={ui} humanSeat={m.humanSeat} />
      <Drawer ui={ui} seats={m.seats} onLoad={() => m.humanLoad()} onFire={() => m.humanFire()} flyLevel={flyLevel} />

      {/* Board overlays */}
      {overlay?.kind === 'count' && (
        <div
          key={overlay.key}
          style={{ position: 'absolute', left: BOARD_CX, top: BOARD_CY, animation: 'count-pop 900ms ease-out forwards', pointerEvents: 'none' }}
        >
          <OutlinedText size={overlay.text.length > 2 ? 220 : 280} strokeWidth={22} shadowOffset={16}>
            {overlay.text}
          </OutlinedText>
        </div>
      )}
      {overlay?.kind === 'bonus' && (
        <div
          key={overlay.key}
          style={{
            position: 'absolute',
            left: BOARD_CX,
            top: BOARD_CY - 120,
            animation: `banner-in ${bonusAnnounce.bannerSec}s ease-out forwards`,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <img src={bonusArt(overlay.bonus.id)} alt="" style={{ width: 260, filter: 'drop-shadow(0 10px 0 rgba(0,0,0,0.3))' }} />
          <OutlinedText size={overlay.bonus.level === chargeCfg.cap ? 150 : 120} color={overlay.bonus.color} strokeWidth={16} shadowOffset={12}>
            {overlay.bonus.name.toUpperCase()} !
          </OutlinedText>
        </div>
      )}
      {overlay?.kind === 'timeUp' && (
        <div key={overlay.key} style={{ position: 'absolute', inset: 0, background: 'rgba(10,5,25,0.45)', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: BOARD_CX, top: BOARD_CY, animation: `banner-in ${matchCfg.endBannerSec}s ease-out forwards`, textAlign: 'center' }}>
            <OutlinedText size={130} strokeWidth={16} shadowOffset={12} color="#ffd75a">
              TEMPS ÉCOULÉ !
            </OutlinedText>
          </div>
        </div>
      )}
      {toast && (
        <div
          key={toast.key}
          style={{
            position: 'absolute',
            left: '50%',
            top: gameLayout.toastTop,
            animation: 'toast-in 2.2s ease-out forwards',
            pointerEvents: 'none',
            padding: '18px 40px',
            borderRadius: 40,
            background: 'rgba(27,20,48,0.9)',
            boxShadow: '0 0 0 5px #ffc631',
            whiteSpace: 'nowrap',
          }}
        >
          <OutlinedText size={48} shadow={null}>
            {toast.text}
          </OutlinedText>
        </div>
      )}

      {devMode && (
        <div style={{ position: 'absolute', left: 24, top: 6, display: 'flex', gap: 8, zIndex: 5 }}>
          <button onClick={() => debugFinish(true)} style={{ fontSize: 22, padding: '6px 10px' }}>
            WIN (debug)
          </button>
          <button onClick={() => debugFinish(false)} style={{ fontSize: 22, padding: '6px 10px' }}>
            LOSE (debug)
          </button>
        </div>
      )}
    </div>
  );
}
