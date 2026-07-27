# For Princess Yeva 💛

A mini web game: 4 rounds, each a different themed mini-game (Sailor
Moon flappy-bird flight, Genshin Impact snake, Inazuma Eleven memory match,
an Italy-styled city quiz), while a pure-CSS cat named Luna wanders
the screen. Claim your prize at the end and watch cats race across
the screen leaving heart-shaped paw prints.

No images (except one user photo used inside the clouds), no font
files or bundlers — plain HTML/CSS/JS. Opens right in the browser, no
server and no `npm install` needed.

---

## Quick start

Just open `index.html` in a browser (double-click the file).

If your browser blocks something when opening via `file://` (happens
in some versions of Chrome for non-standard paths), spin up a local
server with one command and open `http://localhost:8000`:

```bash
# Python 3, if you have it installed
python3 -m http.server 8000
```

No build step (webpack/vite/npm) is required — the files are ready to
run as-is.

---

## Project structure

```
dlya-evy-project/
├── index.html              ← markup only, links to css/js
├── README.md                ← this file
├── audio/                    ← round music + cat sounds (mp3)
├── img/                       ← the photo shown inside the clouds
├── css/
│   ├── variables.css        ← EVERY color in the project (single source of truth)
│   ├── base.css              ← reset + the screen-switching mechanism
│   ├── background.css        ← sun, clouds, sparkles
│   ├── typography.css        ← title, subtitle, button, footer caption
│   ├── game-ui.css            ← shared HUD (round title/dots) + round-complete banner
│   ├── games/                  ← one stylesheet per themed mini-game
│   │   ├── sailor-pop.css        ← round 1: Sailor Moon flappy-bird flight
│   │   ├── genshin-snake.css     ← round 2: Genshin Impact snake
│   │   ├── inazuma-memory.css    ← round 3: Inazuma Eleven memory match
│   │   └── italy-quiz.css        ← round 4: Italy-styled city quiz
│   ├── luna-cat.css            ← the Luna cat itself (her full "blueprint")
│   └── final-screen.css        ← final screen, confetti, paw prints
└── js/
    ├── app-namespace.js       ← window.App = {} — the shared namespace
    ├── config.js               ← EVERY tunable number and piece of text
    ├── screens.js                ← switching between the 3 screens
    ├── background-fx.js           ← generates clouds/sparkles
    ├── luna-cat.js                 ← factory for the cat's DOM element
    ├── cover-cats.js                ← the two idle cats flanking the cover screen
    ├── games/                        ← one module per themed mini-game
    │   ├── sailor-pop.js                ← round 1
    │   ├── genshin-snake.js              ← round 2
    │   ├── inazuma-memory.js              ← round 3
    │   └── city-quiz.js                    ← round 4
    ├── game.js                              ← round orchestrator (order, music, HUD, banner)
    ├── cat-walker.js                         ← the wandering cat during the game
    ├── celebration.js                         ← the final cat run around the heart
    └── main.js                                 ← entry point, wires everything together
```

**Project rule:** one file = one responsibility. Need to change only
the colors? Touch `variables.css` only. Need to change text? Only
`config.js`. Need to change one round's game? Only that round's file
under `js/games/` + `css/games/`. Nothing is tangled together such
that you'd need to touch five places for one edit.

---

## Quick reference for common edits

| What you want to change                              | Where to change it                                        |
|-------------------------------------------------------|-------------------------------------------------------------|
| Sky, button, and cat colors                            | `css/variables.css`                                          |
| Title, subtitle, button, and message text              | `js/config.js` → `TEXT` section                               |
| Round names / order                                     | `js/config.js` → `ROUND_NAMES` (must match `js/game.js`'s game order) |
| Which music plays each round                             | `js/config.js` → `ROUND_MUSIC` (drop mp3 files into `audio/`) |
| A single round's rules (target score, speed, difficulty) | that round's own key in `js/config.js` (`SAILOR_*`, `SNAKE_*`, `MEMORY_*`, `QUIZ_*`) |
| The quiz questions/cities                                | `js/config.js` → `QUIZ_QUESTIONS`                              |
| How often the cat wanders / how long it walks for       | `js/config.js` → `CAT_WALK_*`                                 |
| How many cats run at the finale / lap speed             | `js/config.js` → `CELEBRATION_CAT_COUNT`, `CELEBRATION_LOOP_MS` |
| How many flower rings fill the heart / which emoji      | `js/config.js` → `FLOWER_RINGS`, `FLOWER_EMOJIS`               |
| Luna the cat's shape/size/color                          | `css/luna-cat.css` (every block has a comment explaining it)  |
| The heart-path shape itself                              | `js/celebration.js` → the `heartPoint()` function             |
| Adding a new screen                                       | Add a `<div class="screen" id="...">` to `index.html`, register it in `js/screens.js` |

Every constant in `config.js` is commented — there's no need to hunt
for "magic numbers" scattered across the project.

---

## How it works under the hood

### Screens
`index.html` contains three `<div class="screen">` elements (cover,
game, final). Only one is visible at a time — `App.showScreen(name)`
from `screens.js` controls that.

### Namespace
Instead of a pile of global variables, the whole project uses a single
object, `window.App`. Every file in `js/` is an IIFE that receives
`App` and hangs its own piece off of it:

```js
(function(App){
  // ...
  App.startGame = startGame;
})(window.App);
```

Thanks to this, the file order in `index.html` is essentially the only
place where the dependency architecture is visible. `main.js` loads
last and simply calls whatever the previous files placed onto `App`.

### Rounds & mini-games (`game.js` + `js/games/*.js`)
`game.js` doesn't contain any gameplay itself — it's just the round
orchestrator. Each round is a self-contained module registered onto
`App.games`:

```js
App.games.sailorPop = { start(container, onWin), stop() };
```

`start()` builds the round's UI inside `#game-area` and calls `onWin()`
whenever the player clears it; `stop()` tears down timers/listeners
before the next round takes over the same container. `game.js` just
calls `start`/`stop` in order (`ROUND_NAMES` / the array in
`roundModule()`), updates the round dots, and swaps the background
music track (`ROUND_MUSIC`) for each round — all via a single shared
`<audio loop>` element it creates and replaces per round. The cat's
meow sound (`cat-walker.js`) and the finale's purring sound
(`celebration.js`) are separate `Audio` instances, so they keep
playing over the round music without conflict.

### Luna the cat (`luna-cat.js` + `luna-cat.css`)
The cat is drawn entirely out of CSS shapes (tail, body, neck, head,
ears, crescent moon, eyes, whiskers) on a fixed 280×400px canvas
(`.lc-stage`), then scaled down with `transform: scale()` on the
`.lc-scale` wrapper — the cat's actual "blueprint" is never redrawn
for different sizes.

`App.makeLunaCat(extraClass)` returns a ready-to-use DOM node — this
one function is used by both the wandering cat (`cat-walker.js`) and
the cats at the finale (`celebration.js`), so fixing the blueprint in
`luna-cat.css` instantly updates every use of the cat in the project.

### The final paw-print heart (`celebration.js`)
It uses the classic parametric heart formula:

```
x(t) = 16·sin³(t)
y(t) = 13·cos(t) − 5·cos(2t) − 2·cos(3t) − cos(4t)
```

Several cats walk this curve at the same time with a phase offset
between them (so they appear to run "one after another" around the
outline), and each drops a paw print whenever it has moved far enough
from its last one — spacing by distance, not by time, so the outline
stays gap-free even where the curve itself moves faster. By the end of
one full lap, the prints have traced out a complete heart. Afterward,
flowers bloom in on concentric rings to fill the heart's interior
completely, with no empty patches.

---

## Possible follow-ups (if you want to keep going)

- Difficulty: each round has its own difficulty knobs in `config.js` (e.g. `SAILOR_GRAVITY`/`SAILOR_PIPE_GAP`, `SNAKE_TICK_MS`, `QUIZ_ANSWER_PAUSE_MS`).
- Save progress: `localStorage`, so the game remembers the prize was already claimed.
- Sharing: publish the folder on GitHub Pages — it's already fully static, no backend needed.

---

## Compatibility

Any normal modern mobile/desktop browser (Chrome, Safari, Firefox,
Edge). Uses: CSS custom properties, CSS animations, `Element.animate()`
(Web Animations API), `requestAnimationFrame` — all of this has been
widely supported since 2019+.
