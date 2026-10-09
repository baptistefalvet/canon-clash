// Player profile picture: a goofy cartoon seagull built from random traits. Background color comes from the team.

import { useId, useMemo } from 'react';
import { seagullColors as C } from '../../config/avatars';
import { seagullFromSeed, type BeakStyle, type EyeStyle, type FaceGear, type HatStyle, type NeckGear, type SeagullLook } from './seagull';

const OUT = C.outline;
const SW = 3.5;

// Eye centers (near eye, far eye) for a 3/4 view looking right
const EYES = [
  { x: 46, y: 42, r: 9 },
  { x: 62, y: 40, r: 7.5 },
];

function Eye({ x, y, r, style, i, feather }: { x: number; y: number; r: number; style: EyeStyle; i: number; feather: string }) {
  if (style === 'happy') {
    return <path d={`M${x - r} ${y + 2} Q${x} ${y - r * 1.2} ${x + r} ${y + 2}`} fill="none" stroke={OUT} strokeWidth={4} strokeLinecap="round" />;
  }
  const rr = style === 'crazy' ? r * 1.25 : r;
  const white = <ellipse cx={x} cy={y} rx={rr} ry={rr * 1.1} fill="#fff" stroke={OUT} strokeWidth={3} />;
  switch (style) {
    case 'gull':
      return (
        <g>
          {white}
          <circle cx={x + 2} cy={y + 1} r={r * 0.58} fill={C.iris} stroke={C.eyeRing} strokeWidth={1.5} />
          <circle cx={x + 2} cy={y + 1} r={r * 0.26} fill={OUT} />
          <circle cx={x + 3.5} cy={y - 1.5} r={r * 0.16} fill="#fff" />
        </g>
      );
    case 'derp': {
      const [dx, dy, pr] = i === 0 ? [-3, 3, 0.55] : [3, -3, 0.38];
      return (
        <g>
          {white}
          <circle cx={x + dx} cy={y + dy} r={r * pr} fill={OUT} />
          <circle cx={x + dx + 1.5} cy={y + dy - 1.5} r={r * 0.15} fill="#fff" />
        </g>
      );
    }
    case 'crazy':
      return (
        <g>
          {white}
          <circle cx={x + (i === 0 ? 2 : -1)} cy={y} r={r * 0.22} fill={OUT} />
        </g>
      );
    case 'sleepy':
      return (
        <g>
          {white}
          <circle cx={x + 1.5} cy={y + r * 0.4} r={r * 0.45} fill={OUT} />
          <path d={`M${x - r} ${y + 1} A${r} ${r * 1.1} 0 0 1 ${x + r} ${y + 1} Z`} fill={feather} stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
        </g>
      );
    case 'angry':
    default: {
      const brow = i === 0 ? `M${x - r - 1} ${y - r - 6} L${x + r} ${y - r + 1}` : `M${x - r} ${y - r + 1} L${x + r + 1} ${y - r - 6}`;
      return (
        <g>
          {white}
          <circle cx={x + 1.5} cy={y + 1.5} r={r * 0.5} fill={OUT} />
          <circle cx={x + 3} cy={y - 0.5} r={r * 0.17} fill="#fff" />
          <path d={brow} stroke={OUT} strokeWidth={4.5} strokeLinecap="round" />
        </g>
      );
    }
  }
}

function Beak({ style, color }: { style: BeakStyle; color: string }) {
  const nostril = <path d="M68 51 L72 50.5" stroke={OUT} strokeWidth={2} strokeLinecap="round" />;
  if (style === 'squawk') {
    return (
      <g>
        <path d="M58 55 Q76 50 92 49 L90 70 Q74 66 58 63 Z" fill={C.mouth} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
        <ellipse cx={74} cy={61} rx={8} ry={3.5} fill={C.tongue} />
        <path d="M58 62 Q74 64 90 70 Q86 77 60 69 Z" fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
        <circle cx={81} cy={70.5} r={2.6} fill={C.beakSpot} />
        <path d="M56 48 Q76 38 92 42 Q97 45 92 49 Q76 50 58 56 Z" fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M66 46.5 L70 45.5" stroke={OUT} strokeWidth={2} strokeLinecap="round" />
      </g>
    );
  }
  const upper = <path d="M56 50 Q78 45 92 52 Q97 56 91 59 Q76 58 58 60 Z" fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />;
  const lower = (
    <g>
      <path d="M58 60 Q76 58 88 60 Q84 67 60 66 Z" fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      <circle cx={79} cy={62.5} r={2.5} fill={C.beakSpot} />
    </g>
  );
  return (
    <g>
      {style === 'tongue' && (
        <g>
          <path d="M64 62 Q65 78 71 78 Q77 78 76 62 Z" fill={C.tongue} stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
          <path d="M70 66 L70.5 73" stroke={C.mouth} strokeWidth={1.8} strokeLinecap="round" />
        </g>
      )}
      {lower}
      {style === 'fry' && (
        <g transform="rotate(16 78 58)">
          <rect x={74} y={55} width={30} height={7} rx={1.5} fill={C.fry} stroke={OUT} strokeWidth={2.5} />
          <path d="M80 57 L80 60.5 M88 57 L88 60.5 M96 57 L96 60.5" stroke={C.fryShade} strokeWidth={1.6} strokeLinecap="round" />
        </g>
      )}
      {upper}
      {nostril}
    </g>
  );
}

function FaceGearArt({ kind }: { kind: FaceGear }) {
  switch (kind) {
    case 'sunglasses':
      return (
        <g>
          <path d="M34 38 L20 34" stroke={OUT} strokeWidth={3.5} strokeLinecap="round" />
          <rect x={34} y={34} width={22} height={15} rx={6} fill={C.dark} stroke={OUT} strokeWidth={2.5} />
          <rect x={55} y={32} width={17} height={14} rx={5} fill={C.dark} stroke={OUT} strokeWidth={2.5} />
          <path d="M38 38 L44 38 M58 36 L62 36" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" opacity={0.55} />
        </g>
      );
    case 'eyepatch':
      return (
        <g>
          <path d="M22 30 L66 52 M30 24 L60 36" stroke={OUT} strokeWidth={2.5} strokeLinecap="round" />
          <ellipse cx={46} cy={42} rx={11} ry={10} fill={C.dark} stroke={OUT} strokeWidth={2.5} />
        </g>
      );
    case 'monocle':
      return (
        <g>
          <circle cx={62} cy={40} r={10} fill="#ffffff" fillOpacity={0.15} stroke={C.gold} strokeWidth={3} />
          <path d="M60 50 Q56 62 50 72" fill="none" stroke={C.gold} strokeWidth={1.8} strokeDasharray="2 2" />
        </g>
      );
    case 'none':
    default:
      return null;
  }
}

/** Point at fraction t from a to b. */
const lerpPt = (a: number[], b: number[], t: number) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

function PartyHat({ color }: { color: string }) {
  const L = [32, 26];
  const R = [62, 23];
  const T = [46, 0];
  const band = (t0: number, t1: number) => {
    const pts = [lerpPt(L, T, t0), lerpPt(L, T, t1), lerpPt(R, T, t1), lerpPt(R, T, t0)];
    return pts.map((p) => p.join(' ')).join(' L');
  };
  return (
    <g>
      <path d={`M${L.join(' ')} L${T.join(' ')} L${R.join(' ')} Z`} fill={color} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      <path d={`M${band(0.25, 0.4)} Z`} fill={C.gold} />
      <path d={`M${band(0.58, 0.7)} Z`} fill={C.gold} />
      <path d={`M${L.join(' ')} L${T.join(' ')} L${R.join(' ')} Z`} fill="none" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      <circle cx={T[0]} cy={T[1]} r={5} fill={C.white} stroke={OUT} strokeWidth={3} />
    </g>
  );
}

function HatArt({ kind, color, feather }: { kind: HatStyle; color: string; feather: string }) {
  const s = { stroke: OUT, strokeWidth: SW, strokeLinejoin: 'round' as const };
  switch (kind) {
    case 'tuft':
      return <path d="M42 22 Q34 8 42 6 Q43 14 47 20 Q47 6 56 8 Q50 14 50 21" fill={feather} {...s} />;
    case 'sailor':
      return (
        <g>
          <path d="M28 25 Q30 6 46 6 Q62 6 64 25 Z" fill={C.white} {...s} />
          <path d="M29 19 L63 19 L64 25 L28 25 Z" fill={color} />
          <ellipse cx={46} cy={25} rx={24} ry={6} fill={C.white} {...s} />
        </g>
      );
    case 'bandana':
      return (
        <g>
          <path d="M20 32 L6 24 L9 38 Z M20 34 L8 44 L18 46 Z" fill={color} {...s} />
          <path d="M18 36 Q20 12 46 14 Q72 12 74 32 Q46 24 18 36 Z" fill={color} {...s} />
          <circle cx={36} cy={22} r={2.2} fill={C.white} />
          <circle cx={50} cy={19} r={2.2} fill={C.white} />
          <circle cx={62} cy={23} r={2.2} fill={C.white} />
          <circle cx={44} cy={28} r={2} fill={C.white} />
        </g>
      );
    case 'party':
      return <PartyHat color={color} />;
    case 'captain':
      return (
        <g>
          <path d="M20 28 Q18 4 46 4 Q74 4 72 26 Z" fill={C.white} {...s} />
          <path d="M21 21 Q46 16 72 19 L72 26 Q46 23 20 28 Z" fill={C.navy} />
          <circle cx={50} cy={13} r={4.5} fill={C.gold} stroke={C.goldDark} strokeWidth={2} />
          <path d="M30 28 Q50 24 74 26 Q77 32 68 34 Q48 33 32 33 Z" fill={C.navy} {...s} />
        </g>
      );
    case 'beanie':
      return (
        <g>
          <path d="M22 30 Q20 6 46 6 Q72 6 70 30 Z" fill={color} {...s} />
          <path d="M19 26 Q46 20 73 26 L73 34 Q46 28 19 34 Z" fill={color} {...s} />
          <path d="M22 30 Q46 25 70 30" fill="none" stroke="#fff" strokeWidth={2} opacity={0.5} />
          <circle cx={46} cy={4} r={6} fill={C.white} {...s} />
        </g>
      );
    case 'crown':
      return (
        <g>
          <path d="M28 26 L28 6 L37 16 L46 2 L55 16 L64 6 L64 26 Z" fill={C.gold} {...s} />
          <circle cx={37} cy={21} r={2.6} fill={C.hat[0]} />
          <circle cx={46} cy={20} r={2.8} fill={C.hat[1]} />
          <circle cx={55} cy={21} r={2.6} fill={C.hat[2]} />
        </g>
      );
    case 'propeller':
      return (
        <g>
          <path d="M46 12 L46 3" stroke={OUT} strokeWidth={3} />
          <ellipse cx={37} cy={3} rx={9} ry={3.2} fill={C.gold} {...s} strokeWidth={2.5} />
          <ellipse cx={55} cy={3} rx={9} ry={3.2} fill={color} {...s} strokeWidth={2.5} />
          <path d="M60 25 Q74 23 80 28 Q72 31 60 29 Z" fill={color} {...s} />
          <path d="M24 27 Q26 10 46 10 Q66 10 68 27 Z" fill={color} {...s} />
          <path d="M46 10 L46 27 M34 13 Q32 20 33 27 M58 13 Q60 20 59 27" stroke={C.gold} strokeWidth={2.5} fill="none" />
          <path d="M24 27 Q26 10 46 10 Q66 10 68 27 Z" fill="none" {...s} />
        </g>
      );
    case 'none':
    default:
      return null;
  }
}

function NeckGearArt({ kind, color }: { kind: NeckGear; color: string }) {
  const s = { stroke: OUT, strokeWidth: 3, strokeLinejoin: 'round' as const };
  switch (kind) {
    case 'bowtie':
      return (
        <g>
          <path d="M46 76 L33 68 L33 84 Z M46 76 L59 68 L59 84 Z" fill={color} {...s} />
          <circle cx={46} cy={76} r={4} fill={color} {...s} />
        </g>
      );
    case 'scarf':
      return (
        <g>
          <path d="M56 78 L64 100 L53 100 L50 80 Z" fill={color} {...s} />
          <path d="M22 68 Q46 80 70 68 L72 77 Q46 90 20 77 Z" fill={color} {...s} />
          <path d="M28 74 L30 79 M40 78 L41 83 M54 78 L53 83 M64 74 L62 79" stroke="#fff" strokeWidth={2} opacity={0.5} strokeLinecap="round" />
        </g>
      );
    case 'chain':
      return (
        <g>
          <path d="M24 70 Q46 92 70 70" fill="none" stroke={C.gold} strokeWidth={4} strokeDasharray="4 2" />
          <circle cx={47} cy={84} r={6.5} fill={C.gold} {...s} />
          <circle cx={47} cy={84} r={3.2} fill="none" stroke={C.goldDark} strokeWidth={2} />
        </g>
      );
    case 'none':
    default:
      return null;
  }
}

function Seagull({ look }: { look: SeagullLook }) {
  const s = { stroke: OUT, strokeWidth: SW, strokeLinejoin: 'round' as const };
  return (
    <g transform={look.mirrored ? 'translate(100 0) scale(-1 1)' : undefined}>
      <g transform={`translate(6 12) scale(0.88) rotate(${look.tilt.toFixed(1)} 46 60)`}>
        {/* body + wings */}
        <path d="M12 112 Q14 72 46 70 Q78 72 82 112 Z" fill={look.feather} {...s} />
        <path d="M0 112 Q2 82 24 76 Q34 92 26 112 Z" fill={look.wing} {...s} />
        <path d="M1 106 Q3 98 8 94 L16 112 L2 112 Z" fill={C.wingTip} />
        <path d="M94 112 Q92 84 70 78 Q62 94 70 112 Z" fill={look.wing} {...s} />
        {/* head */}
        <ellipse cx={46} cy={46} rx={28} ry={26} fill={look.feather} {...s} />
        <path d="M24 34 Q28 24 38 22" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
        <ellipse cx={36} cy={58} rx={6} ry={3.5} fill={C.blush} opacity={0.6} />
        <Beak style={look.beak} color={look.beakColor} />
        {EYES.map((e, i) => (
          <Eye key={i} {...e} i={i} style={look.eyes} feather={look.feather} />
        ))}
        <FaceGearArt kind={look.face} />
        <HatArt kind={look.hat} color={look.gearColor} feather={look.feather} />
        <NeckGearArt kind={look.neck} color={look.gearColor} />
      </g>
    </g>
  );
}

export function Avatar({
  seed,
  bg,
  size,
  shape = 'square',
  border = '#ffffff',
}: {
  seed: number;
  bg: string;
  size: number;
  shape?: 'square' | 'circle';
  border?: string;
}) {
  const look = useMemo(() => seagullFromSeed(seed), [seed]);
  const clipId = `av${useId().replace(/:/g, '')}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <clipPath id={clipId}>
          {shape === 'square' ? <rect x={4} y={4} width={92} height={92} rx={12} /> : <circle cx={50} cy={50} r={46} />}
        </clipPath>
        <radialGradient id={`${clipId}-g`} cx="50%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.15} />
        </radialGradient>
      </defs>
      {shape === 'square' ? (
        <rect x={1} y={1} width={98} height={98} rx={15} fill={OUT} />
      ) : (
        <circle cx={50} cy={50} r={50} fill={OUT} />
      )}
      <g clipPath={`url(#${clipId})`}>
        <rect x={0} y={0} width={100} height={100} fill={bg} />
        <rect x={0} y={0} width={100} height={100} fill={`url(#${clipId}-g)`} />
        <Seagull look={look} />
      </g>
      {shape === 'square' ? (
        <rect x={4} y={4} width={92} height={92} rx={12} fill="none" stroke={border} strokeWidth={5} />
      ) : (
        <circle cx={50} cy={50} r={45} fill="none" stroke={border} strokeWidth={5} />
      )}
    </svg>
  );
}
