# Canon Clash — prototype FDJ

Jeu d'argent multijoueur (4 joueurs, portrait 1080×1920) : guerre de territoire à la *Color Clash*
+ manches de **charge du canon** (cartes de poudre, jauge à ne pas faire déborder) qui débloquent des tirs spéciaux.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # build de prod (dist/)
npm run sim -- 400   # simulation d'équilibrage headless (victoires par siège, RTP estimé…)
```

## Boucle de jeu
- 4 canons (un par coin) balayent leur quart de plateau de façon sinusoïdale et tirent des boules :
  chaque boule traverse son territoire et peint la première case adverse touchée.
- Une manche de charge toutes les `roundIntervalSec` (5 par partie). Chaque carte de poudre (+1 à +4) remplit la
  jauge ; **FEU !** tire le tir spécial de la zone atteinte : **7 / 8 / 9 / 10** → **Scie / Mitraille / Obus / Dragon**,
  qui partent du canon. < 7 → rien. > 10 → le canon s'**enraye** et ne tire plus pendant `jam.durationSec`.
  Le bouton CHARGER affiche le risque exact d'enrayer avec la carte suivante (`config/charge.ts`).
- À la fin (`durationSec`), le joueur avec le plus de territoire gagne ; le gain dépend de sa part
  du plateau (`config/economy.ts`).

## Structure
- `config/` — **toutes** les valeurs réglables (modules data-only) : plateau, canon, tirs spéciaux, charge,
  partie, économie, portefeuille FDJ (mesures au pixel), flow, audio, fx.
- `src/` — un module par fonctionnalité : `board/`, `cannon/`, `bullets/`, `bonuses/`, `charge/` (cartes, manche, jauge),
  `game/` (orchestration + écran), `hud/`, `screens/`, `purse/`, `options/`, `audio/`, `ui/`, `matchmaking/`.
- `tools/` — simulations headless (équilibrage, puissance brute des bonus).

## Outils de dev (`?dev=1`)
- `?dev=1&screen=Game` (ou `Rules`, `BetMenu`, `Win`…) : accès direct à un écran.
- Boutons `WIN (debug)` / `LOSE (debug)` sur l'écran de jeu.
- Touches `1`–`4` : déclenche Scie / Mitraille / Obus / Dragon pour vous.
- `&speed=6` : accélère la partie.

## À fournir / valider
- URL du « Règlement de ce jeu » (`config/flow.ts`, bouton désactivé tant qu'elle est vide).
- Barème des gains / RTP (`config/economy.ts`) : ~75 % estimé par la simulation, à valider.
