// Root: design-frame stage → screens, persistent FDJ purse overlay, then the modal on top.

import { Stage } from './Stage';
import { ScreenHost } from './ScreenHost';
import { useAppState } from './store';
import { PurseOverlay } from '../purse/PurseOverlay';
import { OptionsModal } from '../options/OptionsModal';
import { TitleScreen } from '../screens/TitleScreen';
import { RulesScreen } from '../screens/RulesScreen';
import { BetMenu } from '../screens/BetMenu';
import { MatchmakingScreen } from '../screens/MatchmakingScreen';
import { WinScreen } from '../screens/WinScreen';
import { LoseScreen } from '../screens/LoseScreen';
import { GameScreen } from '../game/GameScreen';

const SCREENS = {
  TitleScreen,
  Rules: RulesScreen,
  BetMenu,
  Matchmaking: MatchmakingScreen,
  Game: GameScreen,
  Win: WinScreen,
  Lose: LoseScreen,
};

export function App() {
  const modal = useAppState((s) => s.modal);
  return (
    <Stage>
      <ScreenHost screens={SCREENS} />
      <PurseOverlay />
      {modal === 'Options' && <OptionsModal />}
    </Stage>
  );
}
