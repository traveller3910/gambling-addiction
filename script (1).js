/**
 * Starry Slots: a fictional, non-monetary arcade game.
 * Points are a score only. There is no betting, wagering or payment.
 */
(() => {
  'use strict';

  /* ---------- Configuration ---------- */
  const SYMBOLS = [
    { emoji: '7️⃣', name: 'Lucky Seven', points: 500 },
    { emoji: '💎', name: 'Crystal',     points: 300 },
    { emoji: '⭐', name: 'Star',        points: 200 },
    { emoji: '🔔', name: 'Bell',        points: 100 },
    { emoji: '🍒', name: 'Cherry',      points: 75 },
    { emoji: '🍋', name: 'Lemon',       points: 50 },
  ];
  const PAIR_POINTS = 10;          // two matching symbols on the payline
  const VISIBLE_ROWS = 3;          // rows visible per reel; the middle row is the payline
  const BASE_SPIN_MS = 1500;       // first reel stop time
  const STAGGER_MS = 450;          // extra delay for each following reel
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- DOM ---------- */
  const $ = (id) => document.getElementById(id);
  const machine = $('machine');
  const reelsBox = document.querySelector('.reels');
  const reels = [...document.querySelectorAll('[data-reel]')];
  const els = {
    spin: $('spinBtn'), reset: $('resetBtn'), message: $('message'),
    score: $('score'), spins: $('spins'), lastWin: $('lastWin'),
  };

  /* ---------- State ---------- */
  const state = { score: 0, spins: 0, spinning: false, columns: [] };

  /* ---------- Helpers ---------- */
  const randomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  const randomColumn = () => Array.from({ length: VISIBLE_ROWS }, randomSymbol);

  function createCell(symbol) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.textContent = symbol.emoji;
    cell.setAttribute('role', 'img');
    cell.setAttribute('aria-label', symbol.name);
    return cell;
  }

  /** Draw a static column of symbols into a reel with no animation. */
  function renderColumn(reel, column) {
    const strip = reel.firstElementChild;
    strip.style.transition = 'none';
    strip.style.transform = 'translateY(0)';
    strip.replaceChildren(...column.map(createCell));
  }

  /* ---------- Spinning ---------- */
  /**
   * Animate one reel. The strip starts with the previous symbols, then a run of
   * random filler, then the final column. Sliding the strip up by a percentage of
   * its own height keeps the animation correct at any screen size.
   */
  function spinReel(index, finalColumn, durationMs) {
    return new Promise((resolve) => {
      const reel = reels[index];
      const strip = reel.firstElementChild;
      const fillerCount = 14 + index * 6;
      const filler = Array.from({ length: fillerCount }, randomSymbol);
      const symbols = [...state.columns[index], ...filler, ...finalColumn];
      const travel = ((symbols.length - VISIBLE_ROWS) / symbols.length) * 100;

      strip.style.transition = 'none';
      strip.style.transform = 'translateY(0)';
      strip.replaceChildren(...symbols.map(createCell));
      void strip.offsetHeight; // force reflow so the transition restarts

      reel.classList.add('spinning');
      strip.style.transition = `transform ${durationMs}ms cubic-bezier(0.22, 0.9, 0.3, 1.02)`;
      strip.style.transform = `translateY(-${travel}%)`;

      // Fallback timer in case transitionend never fires (e.g. hidden tab)
      const done = () => { reel.classList.remove('spinning'); resolve(); };
      strip.addEventListener('transitionend', done, { once: true });
      setTimeout(done, durationMs + 100);
    });
  }

  async function spin() {
    if (state.spinning) return;
    state.spinning = true;
    els.spin.disabled = els.reset.disabled = true;
    reelsBox.classList.remove('win');
    setMessage('Spinning…');

    const results = reels.map(randomColumn);
    const base = REDUCED_MOTION ? 400 : BASE_SPIN_MS;
    const stagger = REDUCED_MOTION ? 150 : STAGGER_MS;

    // Reels stop one after another
    await Promise.all(results.map((col, i) => spinReel(i, col, base + i * stagger)));

    state.columns = results;
    state.spins += 1;
    machine.classList.add('shake');
    setTimeout(() => machine.classList.remove('shake'), 400);

    evaluate(results.map((col) => col[1])); // middle row = payline
    state.spinning = false;
    els.spin.disabled = els.reset.disabled = false;
    els.spin.focus({ preventScroll: true });
  }

  /* ---------- Win detection ---------- */
  function evaluate(line) {
    const [a, b, c] = line;
    let won = 0;
    let winningIdx = [];
    let text = 'No match. Spin again!';

    if (a === b && b === c) {
      won = a.points;
      winningIdx = [0, 1, 2];
      text = `Jackpot of stars! Three ${a.name}s: +${won}`;
    } else {
      // Two matching symbols anywhere on the line
      const pair = [[0, 1], [1, 2], [0, 2]].find(([x, y]) => line[x] === line[y]);
      if (pair) {
        won = PAIR_POINTS;
        winningIdx = pair;
        text = `Pair of ${line[pair[0]].name}s: +${won}`;
      }
    }

    state.score += won;
    if (won) highlight(winningIdx, won >= 50);
    setMessage(text, won > 0);
    updateStats(won);
    if (won >= 50) reelsBox.classList.add('win');
  }

  function highlight(indexes, strong) {
    indexes.forEach((i) => {
      const cells = reels[i].querySelectorAll('.cell');
      cells[cells.length - 2].classList.add('win-cell'); // middle cell of the final column
    });
  }

  /* ---------- UI updates ---------- */
  function setMessage(text, isWin = false) {
    els.message.textContent = text;
    els.message.classList.toggle('win', isWin);
  }

  function updateStats(lastWin = 0) {
    els.score.textContent = state.score.toLocaleString();
    els.spins.textContent = state.spins;
    els.lastWin.textContent = lastWin;
  }

  function reset() {
    if (state.spinning) return;
    Object.assign(state, { score: 0, spins: 0, columns: reels.map(randomColumn) });
    reels.forEach((reel, i) => renderColumn(reel, state.columns[i]));
    reelsBox.classList.remove('win');
    updateStats();
    setMessage('Fresh start. Press SPIN to launch the reels.');
  }

  function buildPaytable() {
    const list = $('paytableList');
    SYMBOLS.forEach((s) => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${s.emoji.repeat(3)}</span><span>${s.points}</span>`;
      list.append(li);
    });
    const pair = document.createElement('li');
    pair.innerHTML = `<span>Any pair</span><span>${PAIR_POINTS}</span>`;
    list.append(pair);
  }

  /* ---------- Starfield background ---------- */
  function initStarfield() {
    const canvas = $('starfield');
    const ctx = canvas.getContext('2d');
    let stars = [];
    let width, height;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(450, Math.floor((width * height) / 4500));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() < 0.04 ? 1.8 + Math.random() * 1.2 : 0.4 + Math.random() * 0.9, // a few large glowing stars
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.9,
      }));
    }

    function draw(time) {
      ctx.clearRect(0, 0, width, height);
      const t = time / 1000;
      for (const s of stars) {
        const twinkle = REDUCED_MOTION ? 0.8 : 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = '#eaf0ff';
        if (s.r > 1.7) { ctx.shadowColor = '#9fd8ff'; ctx.shadowBlur = 12; } else { ctx.shadowBlur = 0; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!REDUCED_MOTION) requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(draw);
  }

  /* ---------- Init ---------- */
  els.spin.addEventListener('click', spin);
  els.reset.addEventListener('click', reset);
  // Space bar spins, unless a button or link already has focus (they handle Space natively)
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.target.closest('button, summary, a')) {
      e.preventDefault();
      spin();
    }
  });

  buildPaytable();
  initStarfield();
  state.columns = reels.map(randomColumn);
  reels.forEach((reel, i) => renderColumn(reel, state.columns[i]));
})();
