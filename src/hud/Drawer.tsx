// Bottom drawer (HUD layout C). Collapsed between deals: next-deal gauge + the bonus table (hand total 18–21 → bonus).
// During a deal it slides up over the bottom of the board: decision timer, rivals' hands, your hand, bonus chips, HIT / STAND.
// Staged by `panelStage`: each stage highlights what the player is asked to do and hides the rest.

import type { CSSProperties } from 'react';
import { bonusByTotal } from '../../config/bonuses';
import { blackjack as bjCfg, cardVisual } from '../../config/blackjack';
import { gameLayout, stage as stageFrame } from '../../config/layout';
import { staging, stagingCopy as copy } from '../../config/staging';
import { PlayingCard } from '../blackjack/PlayingCard';
import type { SeatInfo } from '../game/match';
import type { MatchUi, RivalHandUi } from '../game/snapshot';
import { bonusArt } from '../ui/bonusArt';
import { HexBadge } from '../ui/HexBadge';
import { OutlinedText } from '../ui/OutlinedText';
import { handOnTable, panelStage, type PanelStage } from './stage';

const D = gameLayout.drawer;
const TOTALS = [18, 19, 20, 21];

type ChipState = 'idle' | 'dim' | 'target' | 'won';

function chipState(total: number, ui: MatchUi, stage: PanelStage): ChipState {
  if (stage.kind === 'lastStretch' || stage.kind === 'ended') return 'dim';
  const h = ui.hand;
  if (!h) return 'idle';
  if (h.phase === 'results' || h.phase === 'done') return h.outcome === total ? 'won' : 'dim';
  if (h.status === 'bust') return 'dim';
  return h.total === total ? 'target' : 'dim';
}

/** « 3/5 »: the deal being played, or the next one between deals. */
const dealIndex = (ui: MatchUi) => `${Math.min(ui.roundsTotal, Math.max(1, ui.roundsStarted + (ui.hand ? 0 : 1)))}/${ui.roundsTotal}`;

// ---------------------------------------------------------------- collapsed tray

function NextDealGauge({ ui, stage }: { ui: MatchUi; stage: PanelStage }) {
  const g = D.gauge;
  const waiting = stage.kind === 'waiting';
  const ready = waiting && stage.ready;
  const progress = stage.kind === 'waiting' || stage.kind === 'lastStretch' ? stage.progress : 1;
  const secs = stage.kind === 'waiting' || stage.kind === 'lastStretch' ? stage.secs : 0;
  const label = waiting ? (ready ? copy.barReady : `${copy.barNextDeal} · ${dealIndex(ui)}`) : copy.barLastStretch;
  const fill = ready
    ? 'repeating-linear-gradient(115deg, #ffd75a 0 46px, #f1b340 46px 60px)'
    : waiting
      ? 'repeating-linear-gradient(115deg, #52e04c 0 46px, #2fbd35 46px 60px)'
      : 'repeating-linear-gradient(115deg, #8f93ad 0 46px, #767a96 46px 60px)';
  const barInset = g.badgeSize / 2;
  return (
    <div style={{ position: 'absolute', left: g.left, top: g.top, width: g.width, height: g.height }}>
      <div
        style={{
          position: 'absolute',
          left: barInset,
          top: (g.height - g.barHeight) / 2,
          right: 0,
          height: g.barHeight,
          borderRadius: g.barHeight / 2,
          background: '#ffffff',
          boxShadow: ready ? '0 0 0 6px #1b1430, inset 0 -6px 0 #d7d9e6, 0 0 30px 8px rgba(255,215,90,0.65)' : '0 0 0 6px #1b1430, inset 0 -6px 0 #d7d9e6',
          overflow: 'hidden',
          transition: 'box-shadow 250ms',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
            background: fill,
            boxShadow: 'inset 0 -6px 0 rgba(0,0,0,0.15), inset 0 6px 0 rgba(255,255,255,0.35)',
            transition: 'width 200ms linear',
            animation: 'stripes-move 0.8s linear infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            paddingLeft: barInset,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-title)',
            fontSize: g.fontSize,
            color: '#5b5f7a',
            letterSpacing: 1,
            mixBlendMode: 'multiply',
            animation: ready ? 'pulse 0.5s ease-in-out infinite' : undefined,
          }}
        >
          {label}
        </div>
      </div>
      <HexBadge
        key={ready ? secs : 'idle'}
        size={g.badgeSize}
        fontSize={g.badgeFontSize}
        skin={ready ? 'gold' : waiting ? 'green' : 'grey'}
        style={{ position: 'absolute', left: 0, top: (g.height - g.badgeSize) / 2, animation: ready ? 'tick-pop 0.5s ease-out' : undefined }}
      >
        {secs}
      </HexBadge>
    </div>
  );
}

/** Mini playing card carrying a hand total: says « 18 » is a card total, not a level or a price. */
function TotalCard({ total, jackpot }: { total: number; jackpot: boolean }) {
  const c = D.legend.card;
  return (
    <div
      style={{
        width: c.width,
        height: c.height,
        borderRadius: c.radius,
        flexShrink: 0,
        background: 'linear-gradient(180deg,#ffffff,#eeeaf7)',
        boxShadow: `0 0 0 4px #1b1430${jackpot ? ', 0 0 0 7px #f2b52e' : ''}`,
        transform: `rotate(${c.tiltDeg}deg)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-title)',
        fontSize: c.fontSize,
        lineHeight: 1,
        color: jackpot ? '#e39a25' : '#1b1430',
      }}
    >
      {total}
    </div>
  );
}

/** One row of the bonus table: flat and read-only, so it never looks like a button to press. */
function BonusTile({ total, state, flying }: { total: number; state: ChipState; flying?: boolean }) {
  const l = D.legend;
  const bonus = bonusByTotal[total];
  const jackpot = total === bjCfg.target;
  const dim = state === 'dim';
  const won = state === 'won';
  return (
    <div
      style={{
        position: 'relative',
        height: l.height,
        borderRadius: l.radius,
        background: jackpot ? '#3d3550' : '#2b2f47',
        boxShadow: won
          ? `inset 0 0 0 5px #ffd75a, 0 0 30px 8px ${jackpot ? 'rgba(255,214,80,0.75)' : 'rgba(140,255,120,0.7)'}`
          : `inset 0 0 0 4px ${jackpot ? '#a77a2a' : '#191c2e'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        filter: dim ? 'grayscale(0.8) brightness(0.75)' : undefined,
        transition: 'filter 300ms, box-shadow 200ms',
        animation: flying ? 'card-fly 650ms cubic-bezier(.4,0,.6,1) forwards' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <TotalCard total={total} jackpot={jackpot} />
        <img src={bonusArt(bonus.id)} alt="" draggable={false} style={{ width: l.artSize, height: l.artSize, objectFit: 'contain' }} />
      </div>
      <OutlinedText size={l.nameFontSize} color={jackpot ? '#ffd75a' : '#ffffff'}>
        {bonus.name}
      </OutlinedText>
    </div>
  );
}

function ClosedTray({ ui, stage, flyTotal }: { ui: MatchUi; stage: PanelStage; flyTotal: number | null }) {
  const l = D.legend;
  return (
    <>
      <NextDealGauge ui={ui} stage={stage} />
      <div
        style={{
          position: 'absolute',
          left: l.left,
          top: l.captionTop,
          width: l.width,
          textAlign: 'center',
          fontFamily: 'var(--font-title)',
          fontSize: l.captionFontSize,
          letterSpacing: 1,
          color: '#a9adc8',
          whiteSpace: 'pre',
        }}
      >
        {copy.legendCaption}
      </div>
      <div
        style={{
          position: 'absolute',
          left: l.left,
          top: l.top,
          width: l.width,
          display: 'grid',
          gridTemplateColumns: `repeat(${TOTALS.length}, minmax(0, 1fr))`,
          gap: l.gap,
        }}
      >
        {TOTALS.map((t) => (
          <div key={t} style={{ position: 'relative' }}>
            <BonusTile total={t} state={chipState(t, ui, stage)} />
            {flyTotal === t && (
              <div style={{ position: 'absolute', inset: 0 }}>
                <BonusTile total={t} state="won" flying />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------- open drawer

function PromptBar({ ui, stage }: { ui: MatchUi; stage: PanelStage }) {
  const p = D.prompt;
  const h = ui.hand;
  const deciding = stage.kind === 'deciding';
  const urgent = deciding && stage.urgent;
  const fillK = deciding ? stage.timeK : 1;
  const text =
    stage.kind === 'dealing'
      ? copy.promptDealing
      : deciding
        ? urgent
          ? copy.promptUrgent
          : copy.promptDecide
        : h && (h.phase === 'results' || h.phase === 'done')
          ? copy.promptResults
          : copy.promptWaitRivals;
  const fill =
    stage.kind === 'dealing'
      ? 'linear-gradient(180deg,#b9a6f0,#8c74d6)'
      : deciding
        ? urgent
          ? 'repeating-linear-gradient(115deg, #ff8a98 0 46px, #fb586c 46px 60px)'
          : 'repeating-linear-gradient(115deg, #ffd75a 0 46px, #f1b340 46px 60px)'
        : 'linear-gradient(180deg,#c9cbe0,#a5a8c2)';
  const right = deciding && h ? `${Math.ceil(h.decisionLeft)} s` : `${copy.dealCounter} ${dealIndex(ui)}`;
  return (
    <div
      style={{
        position: 'absolute',
        left: p.left,
        top: p.top,
        width: p.width,
        height: p.height,
        borderRadius: p.height / 2,
        background: '#ffffff',
        boxShadow: urgent ? '0 0 0 5px #1b1430, 0 0 22px 6px rgba(251,88,108,0.7)' : '0 0 0 5px #1b1430, inset 0 -5px 0 #d7d9e6',
        overflow: 'hidden',
        animation: urgent ? 'shake-x 0.5s ease-in-out infinite' : undefined,
        transition: 'box-shadow 200ms',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${Math.max(0, Math.min(1, fillK)) * 100}%`,
          background: fill,
          boxShadow: 'inset 0 -5px 0 rgba(0,0,0,0.15), inset 0 5px 0 rgba(255,255,255,0.35)',
          transition: 'width 120ms linear',
          animation: deciding ? 'stripes-move 0.8s linear infinite' : undefined,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '0 26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-title)',
          fontSize: p.fontSize,
          letterSpacing: 1,
          color: '#5b5f7a',
          mixBlendMode: 'multiply',
        }}
      >
        <span key={text} style={{ animation: `pop-in ${staging.hintPopMs}ms ease-out both` }}>
          {text}
        </span>
        <span>{right}</span>
      </div>
    </div>
  );
}

function rivalLabel(r: RivalHandUi, revealed: boolean): { text: string; out: boolean; good: boolean } {
  if (r.status === 'playing' || !revealed) return { text: copy.rivalPlaying, out: false, good: false };
  if (r.status === 'bust') return { text: copy.rivalBust, out: true, good: false };
  if (r.outcome !== null) return { text: bonusByTotal[r.outcome]?.name.toUpperCase() ?? copy.rivalStood, out: false, good: true };
  return { text: copy.rivalMissed, out: true, good: false };
}

function RivalChips({ ui, seats }: { ui: MatchUi; seats: SeatInfo[] }) {
  const r = D.rivals;
  const revealed = !!ui.hand && ui.hand.phase !== 'dealing';
  return (
    <div
      style={{
        position: 'absolute',
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.max(1, ui.rivals.length)}, minmax(0, 1fr))`,
        gap: r.gap,
      }}
    >
      {ui.rivals.map((rv) => {
        const s = seats[rv.seat];
        const l = rivalLabel(rv, revealed);
        return (
          <div
            key={rv.seat}
            style={{
              borderRadius: r.height / 2,
              background: '#2b2f47',
              boxShadow: `inset 0 0 0 4px ${l.out ? '#8f93ad' : s.palette.tile}`,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0 18px',
              minWidth: 0,
              opacity: l.out ? staging.rivalOutOpacity : 1,
              transition: 'opacity 250ms',
            }}
          >
            <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: '50%', background: s.palette.tile, boxShadow: '0 0 0 3px #1b1430' }} />
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <OutlinedText size={r.fontSize} shadow={null}>
                {s.name}
              </OutlinedText>
            </span>
            <OutlinedText size={r.fontSize} shadow={null} color={l.good ? '#ffd75a' : l.out ? '#c9c3e6' : '#ffffff'}>
              {rv.cards ? `${rv.total} · ${l.text}` : l.text}
            </OutlinedText>
          </div>
        );
      })}
    </div>
  );
}

function HandRow({ ui }: { ui: MatchUi }) {
  const H = D.hand;
  const h = ui.hand!;
  const s = H.cardScale;
  const w = cardVisual.width * s;
  const ch = cardVisual.height * s;
  const step = cardVisual.overlap * s;
  const n = Math.max(1, h.cards.length);
  const groupW = w + (n - 1) * step + H.gap + H.totalSize;
  const left = (stageFrame.width - groupW) / 2;
  const cardTop = (H.height - ch) / 2;
  const totalSkin = h.status === 'bust' ? 'red' : h.total >= bjCfg.minBonusTotal ? (h.total === bjCfg.target ? 'gold' : 'green') : 'grey';
  const cardOrigin = (i: number) => ({
    '--dx': `${D.dealFrom.x - (left + i * step + w / 2)}px`,
    '--dy': `${D.dealFrom.y - (H.top + cardTop + ch / 2)}px`,
    '--s': staging.dealFromDeckScale,
  });
  return (
    <div style={{ position: 'absolute', left, top: H.top, width: groupW, height: H.height, transition: 'left 200ms ease-out' }}>
      {h.cards.map((c, i) => (
        <PlayingCard
          key={c.id}
          card={c}
          scale={s}
          style={
            {
              position: 'absolute',
              left: i * step,
              top: cardTop,
              transform: `rotate(${(i - (h.cards.length - 1) / 2) * 5}deg)`,
              animation: `deal-from-deck ${cardVisual.dealFlightMs}ms cubic-bezier(.2,.9,.3,1.2) both`,
              ...cardOrigin(i),
            } as CSSProperties
          }
        />
      ))}
      <HexBadge
        key={`${h.total}-${h.status}`}
        size={H.totalSize}
        skin={totalSkin}
        style={{
          position: 'absolute',
          left: w + (n - 1) * step + H.gap,
          top: (H.height - H.totalSize) / 2,
          animation: h.status === 'bust' ? 'shake-x 0.4s ease-out' : 'tick-pop 0.35s ease-out',
        }}
      >
        {h.total}
      </HexBadge>
    </div>
  );
}

function BonusChips({ ui, stage, flyTotal }: { ui: MatchUi; stage: PanelStage; flyTotal: number | null }) {
  const c = D.chips;
  const deciding = stage.kind === 'deciding';
  return (
    <div
      style={{
        position: 'absolute',
        left: c.left,
        top: c.top,
        width: c.width,
        height: c.height,
        display: 'grid',
        gridTemplateColumns: `repeat(${TOTALS.length}, minmax(0, 1fr))`,
        gap: c.gap,
      }}
    >
      {TOTALS.map((t) => {
        const st = chipState(t, ui, stage);
        const lit = st === 'target' || st === 'won';
        const jackpot = t === bjCfg.target;
        const bonus = bonusByTotal[t];
        return (
          <div
            key={t}
            style={{
              position: 'relative',
              borderRadius: 22,
              background: lit ? (jackpot ? 'linear-gradient(180deg,#ffe48a,#f2b52e 60%,#e39a25)' : 'linear-gradient(180deg,#7fd6ff,#2b8ff0)') : '#2b2f47',
              boxShadow: lit
                ? `0 0 0 5px #1b1430, inset 0 0 0 5px #ffd75a, 0 0 30px 8px ${jackpot ? 'rgba(255,214,80,0.75)' : 'rgba(140,255,120,0.7)'}`
                : 'inset 0 0 0 4px #191c2e',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '0 12px',
              opacity: st === 'dim' ? staging.chipDimOpacity : 1,
              transform: lit ? `scale(${staging.chipTargetScale})` : 'none',
              transition: 'opacity 200ms, transform 160ms ease-out, box-shadow 200ms',
              animation: st === 'won' || flyTotal === t ? 'pulse 0.45s ease-in-out infinite' : undefined,
            }}
          >
            <OutlinedText size={c.totalFontSize} color={jackpot && !lit ? '#ffd75a' : '#ffffff'}>
              {t}
            </OutlinedText>
            <img src={bonusArt(bonus.id)} alt="" draggable={false} style={{ width: c.artSize, height: c.artSize, objectFit: 'contain', flexShrink: 0 }} />
            <OutlinedText size={c.nameFontSize}>{bonus.name}</OutlinedText>
            {deciding && st === 'target' && (
              <span
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: -22,
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                  padding: '4px 14px 6px',
                  borderRadius: 18,
                  background: 'linear-gradient(180deg,#ffe48a,#f2b52e 60%,#e39a25)',
                  boxShadow: '0 0 0 4px #1b1430',
                  animation: 'pop-in 260ms ease-out both',
                }}
              >
                <OutlinedText size={20} shadow={null} strokeWidth={3} stroke="#7a400d">
                  {copy.targetTag}
                </OutlinedText>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ActionButton({
  color,
  title,
  sub,
  onClick,
  callToAction,
  index,
  width,
}: {
  color: 'green' | 'red';
  title: string;
  sub: string;
  onClick: () => void;
  callToAction: boolean;
  index: number;
  width: number;
}) {
  const a = D.actions;
  return (
    <div style={{ position: 'relative', animation: `pop-in ${staging.buttonPopMs}ms ${index * staging.buttonStaggerMs}ms ease-out both` }}>
      {callToAction && (
        <div
          style={{
            position: 'absolute',
            inset: '-8px -8px 0',
            borderRadius: 40,
            boxShadow: `0 0 0 5px #ffffff, 0 0 34px 12px ${color === 'green' ? 'rgba(140,255,110,0.9)' : 'rgba(255,140,155,0.9)'}`,
            animation: 'halo-pulse 0.9s ease-in-out infinite',
          }}
        />
      )}
      <div style={{ animation: callToAction ? 'cta-bounce 0.9s ease-in-out infinite' : undefined }}>
        <button className={`btn3d btn-${color}`} style={{ width, height: a.height }} onClick={onClick}>
          <span className="btn3d-depth" />
          <span className="btn3d-face" style={{ flexDirection: 'column', gap: 4 }}>
            <OutlinedText size={a.titleFontSize} shadow="#2a1640" stroke="#2a1640">
              {title}
            </OutlinedText>
            <OutlinedText size={a.subFontSize} shadow={null} stroke="#2a1640" strokeWidth={3}>
              {sub}
            </OutlinedText>
          </span>
        </button>
      </div>
    </div>
  );
}

function Result({ ui }: { ui: MatchUi }) {
  const a = D.actions;
  const R = D.result;
  const h = ui.hand!;
  const bonus = h.outcome !== null ? bonusByTotal[h.outcome] : null;
  return (
    <div
      key={h.status}
      style={{
        position: 'absolute',
        left: a.left,
        top: a.top,
        width: a.width,
        height: a.height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        animation: 'pop-in 360ms ease-out both',
      }}
    >
      {bonus ? (
        <>
          <OutlinedText size={R.titleFontSize} color={bonus.total === bjCfg.target ? '#ffd75a' : '#8cf06b'}>
            {bonus.total === bjCfg.target ? copy.resultBlackjack : `${bonus.total} !`}
          </OutlinedText>
          <OutlinedText size={R.subFontSize}>
            {bonus.name.toUpperCase()} {copy.resultUnlocked}
          </OutlinedText>
        </>
      ) : (
        <>
          <OutlinedText size={R.titleFontSize} color="#ff8a98">
            {h.status === 'bust' ? copy.resultBust : copy.resultMissed}
          </OutlinedText>
          <OutlinedText size={R.subFontSize} color="#d6caf7">
            {h.status === 'bust' ? `Plus de ${bjCfg.target} : pas de bonus` : `Moins de ${bjCfg.minBonusTotal} : pas de bonus`}
          </OutlinedText>
        </>
      )}
    </div>
  );
}

function OpenDrawer({
  ui,
  seats,
  stage,
  flyTotal,
  onHit,
  onStand,
}: {
  ui: MatchUi;
  seats: SeatInfo[];
  stage: PanelStage;
  flyTotal: number | null;
  onHit: () => void;
  onStand: () => void;
}) {
  const a = D.actions;
  const btnW = (a.width - a.gap) / 2;
  return (
    <>
      <PromptBar ui={ui} stage={stage} />
      <RivalChips ui={ui} seats={seats} />
      {ui.hand && <HandRow ui={ui} />}
      <BonusChips ui={ui} stage={stage} flyTotal={flyTotal} />
      {stage.kind === 'deciding' && (
        <div style={{ position: 'absolute', left: a.left, top: a.top, display: 'flex', gap: a.gap }}>
          <ActionButton index={0} width={btnW} color="green" title={copy.hitTitle} sub={stage.stand ? copy.hitRisky : copy.hitSafe} onClick={onHit} callToAction={!stage.stand} />
          <ActionButton
            index={1}
            width={btnW}
            color="red"
            title={copy.standTitle}
            sub={stage.stand ? `→ ${stage.stand.name}` : copy.standNoBonus}
            onClick={onStand}
            callToAction={!!stage.stand}
          />
        </div>
      )}
      {stage.kind === 'resolved' && ui.hand && <Result ui={ui} />}
    </>
  );
}

// ---------------------------------------------------------------- drawer

export function Drawer({
  ui,
  seats,
  onHit,
  onStand,
  flyTotal,
}: {
  ui: MatchUi;
  seats: SeatInfo[];
  onHit: () => void;
  onStand: () => void;
  flyTotal: number | null;
}) {
  const stage = panelStage(ui);
  const open = handOnTable(stage);
  const closedShift = D.closedTop - D.openTop;
  const fade = `opacity ${D.contentFadeMs}ms ease-out`;
  return (
    <div className="layer" style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: D.openTop,
          width: '100%',
          height: D.height,
          transform: `translateY(${open ? 0 : closedShift}px)`,
          transition: `transform ${D.slideMs}ms cubic-bezier(.3,1.25,.5,1)`,
        }}
      >
        {/* sheet */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: open ? `${D.radius}px ${D.radius}px 0 0` : 0,
            background: 'linear-gradient(180deg,#444a6c 0%,#3a3f5c 120px,#33374f 100%)',
            boxShadow: open
              ? '0 0 0 6px #191c2e, 0 -24px 60px rgba(10,5,25,0.6), inset 0 6px 0 rgba(255,255,255,0.12)'
              : '0 -6px 0 #191c2e, inset 0 6px 0 rgba(255,255,255,0.12)',
            transition: `border-radius ${D.slideMs}ms, box-shadow ${D.slideMs}ms`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: (stageFrame.width - D.handle.width) / 2,
            top: D.handle.top,
            width: D.handle.width,
            height: D.handle.height,
            borderRadius: D.handle.height / 2,
            background: '#6b7194',
            opacity: open ? 1 : 0,
            transition: fade,
          }}
        />

        <div style={{ position: 'absolute', inset: 0, opacity: open ? 0 : 1, transition: fade }}>
          <ClosedTray ui={ui} stage={stage} flyTotal={flyTotal} />
        </div>
        <div style={{ position: 'absolute', inset: 0, opacity: open ? 1 : 0, transition: fade, pointerEvents: open ? 'auto' : 'none' }}>
          {(open || ui.hand) && <OpenDrawer key={`deal-${ui.hand?.index ?? 'none'}`} ui={ui} seats={seats} stage={stage} flyTotal={flyTotal} onHit={onHit} onStand={onStand} />}
        </div>
      </div>
    </div>
  );
}
