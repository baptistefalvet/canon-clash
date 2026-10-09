import { navigate } from '../app/store';
import { Button3D } from '../ui/Button3D';

export function EndButtons({ top }: { top: number }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', gap: 40 }}>
      <Button3D width={440} height={160} fontSize={76} onClick={() => navigate('BetMenu')}>
        REJOUER
      </Button3D>
      <Button3D variant="purple" width={440} height={160} fontSize={76} onClick={() => navigate('TitleScreen')}>
        QUITTER
      </Button3D>
    </div>
  );
}
