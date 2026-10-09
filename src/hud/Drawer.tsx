// Bottom drawer (HUD layout C). Collapsed between rounds: next-round bar + the gauge legend (charge level → special shot).
// During a round it slides up over the bottom of the board: decision timer, rivals' gauges, your powder cards,
// the power gauge, CHARGER / FEU !. Staged by `panelStage`: each stage highlights what the player is asked to do.

import type { CSSProperties } from 'react';
import { bonusByLevel } from '../../config/bonuses';
import { cardVisual, charge as chargeCfg, jam as jamCfg } from '../../config/charge';
import { gameLayout, stage as stageFrame } from '../../config/layout';
import { staging, stagingCopy as copy } from '../../config/staging';
import { maxCard, minCard } from '../charge/cards';
import { ChargeCard } from '../charge/ChargeCard';
import { PowerGauge } from '../charge/PowerGauge';
import type { SeatInfo } from '../game/match';
import type { MatchUi, RivalGaugeUi } from '../game/snapshot';
import { levelColor } from '../cannon/cannon';
import { HexBadge } from '../ui/HexBadge';
import { OutlinedText } from '../ui/OutlinedText';
import { panelStage, roundOn, type PanelStage } from './stage';

const D = gameLayout.drawer;

/** « 3/5 »: the round being played, or the next one between rounds. */
const roundIndex = (ui: MatchUi) => `${Math.min(ui.roundsTotal, Math.max(1, ui.roundsStarted + (ui.gauge ? 0 : 1)))}/${ui.roundsTotal}`;

const STRIPES = (a: string, b: string) => `repeating-linear-gradient(115deg, ${a} 0 46px, ${b} 46px 60px)`;

// ---------------------------------------------------------------- collapsed tray

function NextRoundBar({ ui, stage }: { ui: MatchUi; stage: PanelStage }) {
  const g = D.bar;
  const waiting = stage.kind === 'waiting';
  const jammed = ui.jamLeft > 0 && ui.phase === 'playing';
  const ready = waiting && stage.ready && !jammed;
  const progress = jammed ? ui.jamLeft / jamCfg.durationSec : stage.kind === 'waiting' || stage.kind === 'lastStretch' ? stage.progress : 1;
  const secs = jammed ? Math.ceil(ui.jamLeft) : stage.kind === 'waiting' || stage.kind === 'lastStretch' ? stage.secs : 0;
  const label = jammed ? copy.barJammed : waiting ? (ready ? copy.barReady : `${copy.barNextRound} · ${roundIndex(ui)}`) : copy.barLastStretch;
  const fill = jammed ? STRIPES('#ff8a98', '#fb586c') : ready ? STRIPES('#ffd75a', '#f1b340') : waiting ? STRIPES('#52e04c', '#2fbd35') : STRIPES('#8f93ad', '#767a96');
  const glow = jammed ? '0 0 30px 8px rgba(251,88,108,0.65)' : ready ? '0 0 30px 8px rgba(255,215,90,0.65)' : null;
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
          boxShadow: `0 0 0 6px #1b1430, inset 0 -6px 0 #d7d9e6${glow ? `, ${glow}` : ''}`,
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
            animation: ready || jammed ? 'pulse 0.5s ease-in-out infinite' : undefined,
          }}
        >
          {label}
        </div>
      </div>
      <HexBadge
        key={ready || jammed ? secs : 'idle'}
        size={g.badgeSize}
        fontSize={g.badgeFontSize}
        skin={jammed ? 'red' : ready ? 'gold' : waiting ? 'green' : 'grey'}
        style={{ position: 'absolute', left: 0, top: (g.height - g.badgeSize) / 2, animation: ready || jammed ? 'tick-pop 0.5s ease-out' : undefined }}
      >
        {secs}
      </HexBadge>
    </div>
  );
}

function ClosedTray({ ui, stage, flyLevel }: { ui: MatchUi; stage: PanelStage; flyLevel: number | null }) {
  const l = D.legend;
  const dim = stage.kind === 'lastStretch' || stage.kind === 'ended';
  return (
    <>
      <NextRoundBar ui={ui} stage={stage} />
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
      <div style={{ position: 'absolute', left: l.left, top: l.top, opacity: dim ? 0.55 : 1, filter: dim ? 'grayscale(0.6)' : undefined, transition: 'opacity 300ms' }}>
        <PowerGauge width={l.width} headerHeight={l.headerHeight} barHeight={l.barHeight} artSize={l.artSize} nameFontSize={l.nameFontSize} level={0} flyLevel={flyLevel} />
      </div>
    </>
  );
}

// ---------------------------------------------------------------- open drawer

function PromptBar({ ui, stage }: { ui: MatchUi; stage: PanelStage }) {
  const p = D.prompt;
  const g = ui.gauge;
  const deciding = stage.kind === 'deciding';
  const urgent = deciding && stage.urgent;
  const fillK = deciding ? stage.timeK : 1;
  const text =
    stage.kind === 'dealing'
      ? copy.promptDealing
      : deciding
        ? urgent
          ? copy.promptUrgent
          : stage.fire
            ? copy.promptInZone
            : copy.promptBelowZone
        : g && (g.phase === 'results' || g.phase === 'done')
          ? copy.promptResults
          : copy.promptWaitRivals;
  const fill =
    stage.kind === 'dealing'
      ? 'linear-gradient(180deg,#b9a6f0,#8c74d6)'
      : deciding
        ? urgent
          ? STRIPES('#ff8a98', '#fb586c')
          : STRIPES('#ffd75a', '#f1b340')
        : 'linear-gradient(180deg,#c9cbe0,#a5a8c2)';
  const right = deciding && g ? `${Math.ceil(g.decisionLeft)} s` : `${copy.roundCounter} ${roundIndex(ui)}`;
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

function rivalLabel(r: RivalGaugeUi): { text: string; out: boolean; color: string } {
  if (r.status === 'charging') return { text: copy.rivalCharging, out: false, color: '#ffffff' };
  if (r.status === 'jammed') return { text: copy.rivalJammed, out: true, color: '#ff8a98' };
  if (r.outcome !== null) {
    const b = bonusByLevel[r.outcome];
    return { text: b.name.toUpperCase(), out: false, color: b.color };
  }
  return { text: copy.rivalWeak, out: true, color: '#c9c3e6' };
}

/** Tiny version of the gauge: one cell per level, lit in the zone colors (red when jammed). */
function MiniGauge({ level, jammed }: { level: number; jammed: boolean }) {
  const r = D.rivals;
  return (
    <div style={{ display: 'flex', gap: 3, height: r.cellHeight, padding: 3, borderRadius: r.cellHeight, background: '#1b1430', animation: jammed ? 'shake-x 0.4s ease-out' : undefined }}>
      {Array.from({ length: chargeCfg.cap }, (_, i) => {
        const l = i + 1;
        const lit = jammed || l <= level;
        const zone = !!bonusByLevel[l];
        return (
          <span
            key={l}
            style={{
              flex: zone ? 1.6 : 1,
              borderRadius: 4,
              background: jammed ? '#ff3b52' : lit ? levelColor(l) : zone ? `${levelColor(l)}44` : '#33374f',
              transition: 'background 150ms',
            }}
          />
        );
      })}
    </div>
  );
}

function RivalChips({ ui, seats }: { ui: MatchUi; seats: SeatInfo[] }) {
  const r = D.rivals;
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
        const l = rivalLabel(rv);
        return (
          <div
            key={rv.seat}
            style={{
              borderRadius: 24,
              background: '#2b2f47',
              boxShadow: `inset 0 0 0 4px ${l.out ? '#8f93ad' : s.palette.tile}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 8,
              padding: '0 18px',
              minWidth: 0,
              opacity: l.out ? staging.rivalOutOpacity : 1,
              transition: 'opacity 250ms',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <span style={{ width: 20, height: 20, flexShrink: 0, borderRadius: '50%', background: s.palette.tile, boxShadow: '0 0 0 3px #1b1430' }} />
              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <OutlinedText size={r.fontSize} shadow={null}>
                  {s.name}
                </OutlinedText>
              </span>
              <span key={l.text} style={{ animation: rv.status !== 'charging' ? 'pop-in 300ms ease-out both' : undefined }}>
                <OutlinedText size={r.fontSize} shadow={null} color={l.color}>
                  {l.text}
                </OutlinedText>
              </span>
            </div>
            <MiniGauge level={rv.level} jammed={rv.status === 'jammed'} />
          </div>
        );
      })}
    </div>
  );
}

/** Face-down pile the powder cards are drawn from, with the card range. */
function Deck({ dealing }: { dealing: boolean }) {
  const C = D.cards;
  const s = C.cardScale * 0.9;
  return (
    <div style={{ position: 'absolute', left: C.deckLeft, top: C.top, width: cardVisual.width * s + 16, height: C.height }}>
      {[2, 1, 0].map((i) => (
        <ChargeCard
          key={i}
          faceDown
          scale={s}
          style={{
            position: 'absolute',
            left: i * 5,
            top: -i * 5,
            transform: `rotate(${-4 + i * 3}deg)`,
            animation: i === 0 && dealing ? 'deck-shake 0.3s ease-in-out infinite' : undefined,
          }}
        />
      ))}
      <div style={{ position: 'absolute', left: cardVisual.width * s + 34, top: 16, width: 120, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <OutlinedText size={40} color="#ffb347">
          +{minCard} à +{maxCard}
        </OutlinedText>
        <span style={{ fontFamily: 'var(--font-title)', fontSize: C.deckLabelFontSize, color: '#a9adc8', letterSpacing: 1 }}>{copy.deckLabel}</span>
      </div>
    </div>
  );
}

/** Hex badge colors for a level: zone color, white below the zones, red when jammed. */
function levelSkin(level: number, jammed: boolean) {
  if (jammed) return { fill: '#fb586c', hi: '#ffb3bd', rim: '#8a1122' };
  const b = bonusByLevel[level];
  if (b) return { fill: b.color, hi: '#ffffff', rim: b.dark };
  return { fill: '#8f93ad', hi: '#c9cbe0', rim: '#4b4e66' };
}

function CardsRow({ ui }: { ui: MatchUi }) {
  const C = D.cards;
  const g = ui.gauge!;
  const s = C.cardScale;
  const w = cardVisual.width * s;
  const h = cardVisual.height * s;
  const n = Math.max(1, g.cards.length);
  // cards spread out (values readable) and only overlap when the hand gets long
  const room = C.areaRight - C.areaLeft - C.levelGap - C.levelSize - w;
  const step = n > 1 ? Math.min(cardVisual.spread * s, room / (n - 1)) : 0;
  const groupW = w + (n - 1) * step + C.levelGap + C.levelSize;
  const left = C.areaLeft + (C.areaRight - C.areaLeft - groupW) / 2;
  const deckX = C.deckLeft + (cardVisual.width * s * 0.9) / 2;
  const jammed = g.status === 'jammed';
  return (
    <div style={{ position: 'absolute', left, top: C.top, width: groupW, height: C.height, transition: 'left 200ms ease-out' }}>
      {g.cards.map((c, i) => (
        <ChargeCard
          key={c.id}
          card={c}
          scale={s}
          style={
            {
              position: 'absolute',
              left: i * step,
              top: (C.height - h) / 2,
              transform: `rotate(${(i - (g.cards.length - 1) / 2) * 4}deg)`,
              transition: 'left 200ms ease-out',
              animation: `deal-from-deck ${cardVisual.dealFlightMs}ms cubic-bezier(.2,.9,.3,1.2) both`,
              '--dx': `${deckX - (left + i * step + w / 2)}px`,
              '--dy': '0px',
              '--s': 0.9,
            } as CSSProperties
          }
        />
      ))}
      <HexBadge
        key={`${g.level}-${g.status}`}
        size={C.levelSize}
        colors={levelSkin(g.level, jammed)}
        style={{
          position: 'absolute',
          left: w + (n - 1) * step + C.levelGap,
          top: (C.height - C.levelSize) / 2,
          animation: jammed ? 'shake-x 0.4s ease-out' : `tick-pop 0.35s ease-out ${cardVisual.dealFlightMs * 0.6}ms both`,
        }}
      >
        {g.level}
      </HexBadge>
    </div>
  );
}

function LiveGauge({ ui }: { ui: MatchUi }) {
  const G = D.gauge;
  const g = ui.gauge!;
  const resolved = g.phase === 'results' || g.phase === 'done';
  return (
    <div style={{ position: 'absolute', left: G.left, top: G.top }}>
      <PowerGauge
        width={G.width}
        headerHeight={G.headerHeight}
        barHeight={G.barHeight}
        artSize={G.artSize}
        nameFontSize={G.nameFontSize}
        level={g.level}
        status={g.status}
        won={resolved ? g.outcome : undefined}
        ghost={g.phase === 'deciding' && g.status === 'charging'}
      />
    </div>
  );
}

function ActionButton({
  color,
  title,
  sub,
  subColor,
  onClick,
  callToAction,
  index,
  width,
}: {
  color: 'green' | 'orange';
  title: string;
  sub: string;
  subColor?: string;
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
            boxShadow: `0 0 0 5px #ffffff, 0 0 34px 12px ${color === 'green' ? 'rgba(140,255,110,0.9)' : 'rgba(255,170,80,0.9)'}`,
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
            <OutlinedText size={a.subFontSize} shadow={null} stroke="#2a1640" strokeWidth={3} color={subColor}>
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
  const g = ui.gauge!;
  const bonus = g.outcome !== null ? bonusByLevel[g.outcome] : null;
  return (
    <div
      key={g.status}
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
          <OutlinedText size={R.titleFontSize} color={bonus.color}>
            {g.full ? copy.resultFull : `${bonus.name.toUpperCase()} !`}
          </OutlinedText>
          <OutlinedText size={R.subFontSize}>
            {g.full ? `${bonus.name.toUpperCase()} ${copy.resultReady}` : `Tir spécial ${copy.resultReady}`}
          </OutlinedText>
        </>
      ) : g.status === 'jammed' ? (
        <>
          <OutlinedText size={R.titleFontSize} color="#ff8a98">
            {copy.resultJam}
          </OutlinedText>
          <OutlinedText size={R.subFontSize} color="#d6caf7">
            {copy.resultJamSub} {jamCfg.durationSec} s
          </OutlinedText>
        </>
      ) : (
        <>
          <OutlinedText size={R.titleFontSize} color="#c9c3e6">
            {copy.resultWeak}
          </OutlinedText>
          <OutlinedText size={R.subFontSize} color="#d6caf7">
            {copy.resultWeakSub} {chargeCfg.minZone}
          </OutlinedText>
        </>
      )}
    </div>
  );
}

function OpenDrawer({ ui, seats, stage, onLoad, onFire }: { ui: MatchUi; seats: SeatInfo[]; stage: PanelStage; onLoad: () => void; onFire: () => void }) {
  const a = D.actions;
  const btnW = (a.width - a.gap) / 2;
  const g = ui.gauge;
  const riskPct = stage.kind === 'deciding' ? Math.round(stage.risk * 100) : 0;
  return (
    <>
      <PromptBar ui={ui} stage={stage} />
      <RivalChips ui={ui} seats={seats} />
      <Deck dealing={stage.kind === 'dealing'} />
      {g && <CardsRow ui={ui} />}
      {g && <LiveGauge ui={ui} />}
      {stage.kind === 'deciding' && (
        <div style={{ position: 'absolute', left: a.left, top: a.top, display: 'flex', gap: a.gap }}>
          <ActionButton
            index={0}
            width={btnW}
            color="green"
            title={copy.loadTitle}
            sub={riskPct === 0 ? copy.loadSafe : `${copy.loadRisk} ${riskPct} %`}
            subColor={riskPct === 0 ? '#ffffff' : stage.risk >= staging.highRisk ? '#ff9aa6' : '#ffe36b'}
            onClick={onLoad}
            callToAction={!stage.fire}
          />
          <ActionButton
            index={1}
            width={btnW}
            color="orange"
            title={copy.fireTitle}
            sub={stage.fire ? `→ ${stage.fire.name.toUpperCase()}` : copy.fireNone}
            onClick={onFire}
            callToAction={!!stage.fire}
          />
        </div>
      )}
      {stage.kind === 'resolved' && g && <Result ui={ui} />}
      {g?.status === 'jammed' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: `${D.radius}px ${D.radius}px 0 0`,
            background: 'radial-gradient(ellipse at center, rgba(255,59,82,0) 30%, rgba(255,59,82,0.6) 100%)',
            animation: 'jam-flash 700ms ease-out forwards',
            pointerEvents: 'none',
          }}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------- drawer

export function Drawer({
  ui,
  seats,
  onLoad,
  onFire,
  flyLevel,
}: {
  ui: MatchUi;
  seats: SeatInfo[];
  onLoad: () => void;
  onFire: () => void;
  flyLevel: number | null;
}) {
  const stage = panelStage(ui);
  const open = roundOn(stage);
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
          <ClosedTray ui={ui} stage={stage} flyLevel={flyLevel} />
        </div>
        <div style={{ position: 'absolute', inset: 0, opacity: open ? 1 : 0, transition: fade, pointerEvents: open ? 'auto' : 'none' }}>
          {(open || ui.gauge) && <OpenDrawer key={`round-${ui.gauge?.index ?? 'none'}`} ui={ui} seats={seats} stage={stage} onLoad={onLoad} onFire={onFire} />}
        </div>
      </div>
    </div>
  );
}
