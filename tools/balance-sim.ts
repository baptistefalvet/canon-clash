// Headless balance check: plays N bot-only matches and reports territory / bonus statistics.
// Run: npm run sim -- [matches]
import './stub-env';
import { Match } from '../src/game/match';
import { match as matchCfg } from '../config/match';
import { economy } from '../config/economy';

const N = Number(process.argv[2] ?? 200);
const dt = 1 / 30;
const wins = [0, 0, 0, 0];
const bonusGain: Record<string, number[]> = {};
const finalShares: number[] = [];
let corrNum = 0;
const pts: [number, number][] = [];
const timeline: number[][] = [];

for (let m = 0; m < N; m++) {
  const match = new Match(
    [0, 1, 2, 3].map((i) => ({ name: `B${i}`, avatar: i, isHuman: false })),
    1000 + m,
  );
  const bonusPoints = [0, 0, 0, 0];
  const weights: Record<string, number> = { saw: 1, gatling: 2, bombs: 3, dragon: 5 };
  // track gain of each bonus: count captures attributed while bonus active is hard; measure share delta over 10s after spawn
  const pending: { seat: number; id: string; start: number; at: number }[] = [];
  let lastSample = -1;
  while (match.phase !== 'over') {
    match.update(dt);
    for (const e of match.events.splice(0)) {
      if (e.type === 'bonus') {
        bonusPoints[e.seat] += weights[e.bonus.id];
        pending.push({ seat: e.seat, id: e.bonus.id, start: match.grid.counts[e.seat], at: match.time });
      }
    }
    for (let i = pending.length - 1; i >= 0; i--) {
      const p = pending[i];
      if (match.time - p.at >= 9 || match.phase !== 'playing') {
        (bonusGain[p.id] ??= []).push(match.grid.counts[p.seat] - p.start);
        pending.splice(i, 1);
      }
    }
    if (m === 0 && Math.floor(match.time / 5) !== lastSample) {
      lastSample = Math.floor(match.time / 5);
      timeline.push(match.shares().map((s) => Math.round(s * 100)));
    }
  }
  const shares = match.shares();
  const best = shares.indexOf(Math.max(...shares));
  wins[best]++;
  finalShares.push(Math.max(...shares));
  shares.forEach((s, i) => pts.push([bonusPoints[i], s]));
}

const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
const mx = mean(pts.map((p) => p[0]));
const my = mean(pts.map((p) => p[1]));
let sxx = 0, syy = 0;
for (const [x, y] of pts) { corrNum += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; }
console.log(`matches=${N} duration=${matchCfg.durationSec}s`);
console.log('wins by seat', wins);
console.log('winner share  mean', mean(finalShares).toFixed(3), 'min', Math.min(...finalShares).toFixed(3), 'max', Math.max(...finalShares).toFixed(3));
const buckets = [0.3, 0.35, 0.4, 0.5, 0.6];
console.log('winner share >= ', buckets.map((b) => `${b}:${(finalShares.filter((s) => s >= b).length / N * 100).toFixed(0)}%`).join(' '));
console.log('corr(bonus points, final share)', (corrNum / Math.sqrt(sxx * syy)).toFixed(3));
for (const [k, v] of Object.entries(bonusGain)) console.log(`bonus ${k.padEnd(7)} n=${String(v.length).padStart(4)} net tiles after 9s: mean ${mean(v).toFixed(1)}`);
console.log('timeline match0 (every 5s):', timeline.map((t) => t.join('/')).join('  '));

// Estimated RTP for a player as strong as the bots (wins 1/4 of the matches)
const prizeOf = (share: number) => economy.winnerPrizeTiers.find((t) => share >= t.minShare)!.prizeCents;
const avgPrize = mean(finalShares.map(prizeOf));
console.log(`estimated RTP ${(0.25 * avgPrize / economy.betCents * 100).toFixed(1)}% (avg winner prize ${(avgPrize / 100).toFixed(2)} €)`);
