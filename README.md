# Starry Slots

A fictional, non-monetary slot-machine-style arcade game with a deep-space look. Spin three glowing reels, chase matching symbols and rack up points among the stars.

> **Note:** Starry Slots is an arcade simulation made for entertainment and programming practice. It involves **no real-money gambling**: no betting, deposits, withdrawals, payments or casino integration. Points are only an in-game score.

## Screenshots

_Add screenshots here, for example `docs/desktop.png` and `docs/mobile.png`._

## Features

- Three animated reels that stop one after another
- Twinkling starfield (hundreds of stars, a few large glowing ones) and a slow-drifting nebula
- Glassmorphism machine panel with neon glow and a subtle screen shake when the reels stop
- Score, spin counter and last-win readout, plus a reset button
- Highlighted winning symbols and payline
- Points table showing what each combination is worth
- Responsive layout for desktop and mobile
- Keyboard friendly (`Space` to spin), visible focus styles and screen-reader announcements
- Respects `prefers-reduced-motion`

## Technologies used

- Semantic HTML5
- Modern CSS (custom properties, grid, `backdrop-filter`, keyframe animations)
- Vanilla JavaScript (no frameworks, no build step)
- Canvas 2D for the starfield
- Google Fonts (Unbounded, Outfit). The game falls back to system fonts if offline.

## How to run locally

No installation needed.

```bash
git clone https://github.com/<your-username>/starry-slots.git
cd starry-slots
# Open index.html in your browser, or serve the folder:
python3 -m http.server 8000   # then visit http://localhost:8000
```

To host it for free, enable **GitHub Pages** on the `main` branch in your repository settings.

## Project structure

```
starry-slots/
├── index.html   # Page structure
├── style.css    # Theme, layout, animations
├── script.js    # Game logic and starfield
└── README.md
```

## How the game works

1. Press **Spin** (or `Space`). Each reel gets a random column of three symbols.
2. The reels stop left to right with short delays between them.
3. Only the **middle row** (the highlighted payline) is scored.
4. Three matching symbols award that symbol's points. Any two matching symbols award 10 points.
5. Points are added to your score. Nothing is ever wagered or lost, so you can spin freely. **Reset** clears score and spins.

| Symbols | Points |
| --- | --- |
| 7️⃣ 7️⃣ 7️⃣ | 500 |
| 💎 💎 💎 | 300 |
| ⭐ ⭐ ⭐ | 200 |
| 🔔 🔔 🔔 | 100 |
| 🍒 🍒 🍒 | 75 |
| 🍋 🍋 🍋 | 50 |
| Any pair | 10 |

Symbols and point values live in the `SYMBOLS` array at the top of `script.js`, so they are easy to tweak.

## Future improvements

- Sound effects with a mute toggle
- Best score saved with `localStorage`
- Extra paylines and bonus rounds
- Selectable themes (nebula, aurora, retro terminal)
- Unit tests for the win-evaluation logic

## License

MIT. See the license text below.

```
MIT License

Copyright (c) 2026 <your name>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
