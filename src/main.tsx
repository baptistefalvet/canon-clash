import { createRoot } from 'react-dom/client';
import '@fontsource/lilita-one/400.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import '@fontsource/nunito/900.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import './styles/global.css';
import { App } from './app/App';
import { installAudioUnlock } from './audio/context';
import { startMusic } from './audio/music';

installAudioUnlock();
startMusic();

// Canvas text needs the fonts loaded before the first frame
Promise.all([document.fonts.load("40px 'Lilita One'"), document.fonts.load("800 40px 'Montserrat'")])
  .catch(() => undefined)
  .finally(() => {
    createRoot(document.getElementById('root')!).render(<App />);
  });
