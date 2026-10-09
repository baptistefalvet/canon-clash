// Global app state: navigation (screen + modal), purse, audio flags, match lineup and last result.
// Tiny external store consumed through useSyncExternalStore.

import { useSyncExternalStore } from 'react';
import { economy } from '../../config/economy';
import { flow } from '../../config/flow';
import { audio as audioConfig } from '../../config/audio';

export type ScreenId = 'TitleScreen' | 'Rules' | 'BetMenu' | 'Matchmaking' | 'Game' | 'Win' | 'Lose';
export type ModalId = 'Options';

export interface PlayerProfile {
  name: string;
  /** Seed of the random seagull avatar (see src/avatar). */
  avatar: number;
  isHuman: boolean;
}

export interface MatchStanding {
  seat: number;
  name: string;
  /** Seed of the random seagull avatar (see src/avatar). */
  avatar: number;
  isHuman: boolean;
  share: number;
  rank: number;
}

export interface MatchResult {
  won: boolean;
  prizeCents: number;
  prizeLabel: string;
  standings: MatchStanding[];
}

export interface AppState {
  screen: ScreenId;
  modal: ModalId | null;
  purseCents: number;
  musicOn: boolean;
  sfxOn: boolean;
  lineup: PlayerProfile[] | null;
  lastResult: MatchResult | null;
  matchId: number;
  devMode: boolean;
}

const params = new URLSearchParams(window.location.search);
const devMode = flow.devMode || params.get('dev') === '1';
const deepLink = devMode ? (params.get('screen') as ScreenId | null) : null;

let state: AppState = {
  screen: deepLink ?? flow.initialScreen,
  modal: null,
  purseCents: economy.startingPurseCents,
  musicOn: audioConfig.defaultMusicOn,
  sfxOn: audioConfig.defaultSfxOn,
  lineup: null,
  lastResult: null,
  matchId: 0,
  devMode,
};

const listeners = new Set<() => void>();

function set(patch: Partial<AppState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function getState(): AppState {
  return state;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAppState<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state));
}

// ---- Actions ----

/** Changing screen always closes the modal. */
export function navigate(screen: ScreenId) {
  set({ screen, modal: null });
}

export function openModal(modal: ModalId) {
  set({ modal });
}

export function closeModal() {
  set({ modal: null });
}

export function canAfford(cents = economy.betCents) {
  return state.purseCents >= cents;
}

/** Deducts the bet. Returns false (and changes nothing) when the purse is too low. */
export function placeBet(): boolean {
  if (!canAfford()) return false;
  set({ purseCents: state.purseCents - economy.betCents });
  return true;
}

export function refundBet() {
  set({ purseCents: state.purseCents + economy.betCents });
}

export function credit(cents: number) {
  set({ purseCents: state.purseCents + cents });
}

export function setMusic(on: boolean) {
  set({ musicOn: on });
}

export function setSfx(on: boolean) {
  set({ sfxOn: on });
}

export function startMatch(lineup: PlayerProfile[]) {
  set({ lineup, matchId: state.matchId + 1 });
}

export function setResult(result: MatchResult) {
  set({ lastResult: result });
}
