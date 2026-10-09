// Raw power of each bonus: tiles flipped by one bonus alone (cannons silent), from the starting layout.
import './stub-env';
import { Match } from '../src/game/match';
import { spawnBonus } from '../src/bonuses';
import type { BonusId } from '../config/bonuses';

const ids: BonusId[] = ['saw', 'gatling', 'bombs', 'dragon'];
for (const id of ids) {
  const gains: number[] = [];
  for (let t = 0; t < 40; t++) {
    const m = new Match([0, 1, 2, 3].map((i) => ({ name: `B${i}`, avatar: i, isHuman: i === 0 })), 500 + t);
    m.phase = 'playing';
    m.roundsStarted = 999;
    const start = m.grid.counts[t % 4];
    m.bonuses.push(spawnBonus(id, t % 4, m));
    let steps = 0;
    while (m.bonuses.length && steps++ < 30 * 30) m.update(1 / 30);
    for (let k = 0; k < 90; k++) m.update(1 / 30); // let gatling bullets land
    gains.push(m.grid.counts[t % 4] - start);
  }
  const mean = gains.reduce((a, b) => a + b, 0) / gains.length;
  console.log(id.padEnd(7), 'mean', mean.toFixed(1), 'min', Math.min(...gains), 'max', Math.max(...gains));
}
