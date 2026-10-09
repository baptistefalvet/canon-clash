// Random seagull look, derived from a seed so a profile only has to carry a number.

import { seagullColors as C, seagullOdds, seagullTiltDeg, seagullTraits } from '../../config/avatars';
import { Rng } from '../util/rng';

export type EyeStyle = (typeof seagullTraits.eyes)[number];
export type BeakStyle = (typeof seagullTraits.beaks)[number];
export type HatStyle = (typeof seagullTraits.hats)[number];
export type FaceGear = (typeof seagullTraits.faceGear)[number] | 'none';
export type NeckGear = (typeof seagullTraits.neckGear)[number] | 'none';

export interface SeagullLook {
  eyes: EyeStyle;
  beak: BeakStyle;
  hat: HatStyle;
  face: FaceGear;
  neck: NeckGear;
  feather: string;
  wing: string;
  beakColor: string;
  gearColor: string;
  tilt: number;
  mirrored: boolean;
}

export function seagullFromSeed(seed: number): SeagullLook {
  const rng = new Rng(seed);
  return {
    eyes: rng.pick(seagullTraits.eyes),
    beak: rng.pick(seagullTraits.beaks),
    hat: rng.pick(seagullTraits.hats),
    face: rng.next() < seagullOdds.faceGear ? rng.pick(seagullTraits.faceGear) : 'none',
    neck: rng.next() < seagullOdds.neckGear ? rng.pick(seagullTraits.neckGear) : 'none',
    feather: rng.pick(C.feather),
    wing: rng.pick(C.wing),
    beakColor: rng.pick(C.beak),
    gearColor: rng.pick(C.hat),
    tilt: rng.range(-seagullTiltDeg, seagullTiltDeg),
    mirrored: rng.next() < seagullOdds.mirrored,
  };
}

export const randomAvatarSeed = () => (Math.random() * 2 ** 32) >>> 0;
