// FDJ persistent overlay: purse pill + settings button, top-right, on every screen.

import { purseOverlay } from '../../config/purse';
import { openModal, useAppState } from '../app/store';
import { formatPurseAmount } from './format';
import { sfx } from '../audio/sfx';

const { pill, settings } = purseOverlay;

function gearPath(): string {
  const { outerRadius: R, bodyRadius: rb, holeRadius: rh, teeth, toothWidth: tw } = settings.gear;
  const step = (Math.PI * 2) / teeth;
  const baseHalf = Math.asin((tw / 2 + 1.5) / rb);
  const tipHalf = Math.asin((tw / 2 - 0.8) / R);
  const pt = (r: number, a: number) => `${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`;
  let d = '';
  for (let i = 0; i < teeth; i++) {
    const a = -Math.PI / 2 + i * step;
    d += `${i === 0 ? 'M' : 'L'}${pt(rb, a - baseHalf)} L${pt(R, a - tipHalf)} L${pt(R, a + tipHalf)} L${pt(rb, a + baseHalf)} `;
    const next = a + step - baseHalf;
    d += `A${rb} ${rb} 0 0 1 ${pt(rb, next)} `;
  }
  d += 'Z ';
  // Hole (even-odd)
  d += `M${rh} 0 A${rh} ${rh} 0 1 0 ${-rh} 0 A${rh} ${rh} 0 1 0 ${rh} 0 Z`;
  return d;
}

const GEAR_D = gearPath();

export function GearIcon({ size, color }: { size: number; color: string }) {
  const r = settings.gear.outerRadius + 1;
  return (
    <svg width={size} height={size} viewBox={`${-r} ${-r} ${r * 2} ${r * 2}`} style={{ display: 'block' }}>
      <path d={GEAR_D} fill={color} fillRule="evenodd" stroke={color} strokeWidth={1.2} strokeLinejoin="round" />
    </svg>
  );
}

export function SettingsGlyph({ size }: { size: number }) {
  // Gear + « ? » exactly as in the settings button, scaled to `size` (used inline in texts).
  const k = size / settings.size;
  const g = settings.gear;
  const gearBox = (g.outerRadius + 1) * 2;
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: settings.background,
        verticalAlign: 'middle',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: (settings.size / 2 + g.offsetX - gearBox / 2) * k,
          top: (settings.size / 2 + g.offsetY - gearBox / 2) * k,
        }}
      >
        <GearIcon size={gearBox * k} color={settings.iconColor} />
      </span>
    </span>
  );
}

export function PurseOverlay() {
  const purseCents = useAppState((s) => s.purseCents);
  const g = settings.gear;
  const gearBox = (g.outerRadius + 1) * 2;
  const q = settings.question;

  return (
    <div className="purse-overlay">
      <div
        className="purse-pill"
        style={{
          position: 'absolute',
          right: pill.right,
          top: pill.top,
          width: pill.width,
          height: pill.height,
          borderRadius: pill.height / 2,
          background: pill.background,
          color: pill.textColor,
          fontFamily: pill.fontFamily,
          fontWeight: pill.fontWeight,
          fontSize: pill.fontSize,
          letterSpacing: pill.letterSpacing,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        <span>{formatPurseAmount(purseCents, pill.hideZeroCents)}</span>
        <span style={{ marginLeft: pill.currencyGap, display: 'inline-block', transform: `scaleX(${pill.currencyScaleX})`, transformOrigin: 'left center', marginRight: -(1 - pill.currencyScaleX) * pill.fontSize * 0.7 }}>€</span>
      </div>

      <button
        className="purse-settings"
        aria-label="Options"
        onClick={() => {
          sfx.click();
          openModal('Options');
        }}
        style={{
          position: 'absolute',
          right: settings.right,
          top: settings.top,
          width: settings.size,
          height: settings.size,
          borderRadius: '50%',
          background: settings.background,
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: settings.size / 2 + g.offsetX - gearBox / 2,
            top: settings.size / 2 + g.offsetY - gearBox / 2,
          }}
        >
          <GearIcon size={gearBox} color={settings.iconColor} />
        </span>
        <span
          style={{
            position: 'absolute',
            left: q.left,
            top: q.top,
            fontFamily: pill.fontFamily,
            fontWeight: q.fontWeight,
            fontSize: q.fontSize,
            lineHeight: 1,
            color: settings.iconColor,
            WebkitTextStroke: `${q.outlineWidth}px ${q.outlineColor}`,
            paintOrder: 'stroke fill',
          }}
        >
          ?
        </span>
      </button>
    </div>
  );
}
