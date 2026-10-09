// Splash: non-interactive, auto-advances to the rules.

import { useEffect } from 'react';
import { flow } from '../../config/flow';
import { navigate } from '../app/store';
import { CardFan, TitleLayout } from './TitleLayout';

export function TitleScreen() {
  useEffect(() => {
    const t = window.setTimeout(() => navigate('Rules'), flow.titleAutoAdvanceMs);
    return () => window.clearTimeout(t);
  }, []);
  return <TitleLayout footer={<CardFan top={1500} />} />;
}
