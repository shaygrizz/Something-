/*
  sailor-pop.js
  ----------------------------------------------------------------
  Round 1: "Moonlight Flight" — a Sailor-Moon-themed Flappy Bird.
  Tap/click/space to flap the pixel-art magical girl upward; gravity
  pulls her back down. Fly through the gaps between pairs of glowing
  crystal towers. Clearing SAILOR_TARGET towers (5 by default) wins
  the round. Crashing just resets the run right there — no penalty
  beyond starting the round over, so it stays low-frustration.

  Exposes: App.games.sailorPop = { start(container, onWin), stop() }
*/
(function(App){

  const cfg = App.config;

  let container, onWin;
  let scoreEl, hintEl;
  let rafId = null;
  let lastTs = null;
  let running = false;   // round is mounted and animating
  let started = false;   // player has flapped at least once (gravity/pipes active)
  let score = 0;

  let areaW = 0, areaH = 0;
  let birdEl, birdX;
  let birdY, velocity;
  let pipes = [];         // { x, gapTop, passed, topEl, botEl, topCapEl, botCapEl }
  let spawnAcc = 0;       // ms accumulator for pipe spawning

  const BIRD_W = () => cfg.SAILOR_BIRD_WIDTH;
  const BIRD_H = () => cfg.SAILOR_BIRD_HEIGHT;

  function updateScore(){
    scoreEl.textContent = score + ' / ' + cfg.SAILOR_TARGET;
  }

  function makeBird(){
    birdEl = document.createElement('div');
    birdEl.className = 'sp-bird';
    const px = document.createElement('div');
    px.className = 'sp-bird-px';
    birdEl.appendChild(px);
    container.appendChild(birdEl);
    birdX = areaW * 0.22;
  }

  function resetRun(){
    pipes.forEach(p => { p.topEl.remove(); p.botEl.remove(); });
    pipes = [];
    spawnAcc = 0;
    score = 0;
    updateScore();
    birdY = areaH / 2 - BIRD_H() / 2;
    velocity = 0;
  }

  function placeBird(){
    birdEl.style.left = birdX + 'px';
    birdEl.style.top = birdY + 'px';
    const tilt = Math.max(-25, Math.min(75, velocity / 8));
    birdEl.style.transform = 'rotate(' + tilt + 'deg)';
  }

  function spawnSparkles(){
    for(let i=0;i<4;i++){
      const s = document.createElement('div');
      s.className = 'sp-sparkle';
      s.textContent = ['✨','⭐','💫'][i % 3];
      s.style.left = (birdX + BIRD_W()/2) + 'px';
      s.style.top  = (birdY + BIRD_H()) + 'px';
      s.style.setProperty('--sx', (Math.random()*30-15) + 'px');
      s.style.setProperty('--sy', (10 + Math.random()*16) + 'px');
      container.appendChild(s);
      setTimeout(() => s.remove(), 520);
    }
  }

  function flap(){
    if(!running) return;
    if(!started){
      started = true;
      if(hintEl){ hintEl.remove(); hintEl = null; }
    }
    velocity = cfg.SAILOR_FLAP_VELOCITY;
    birdEl.classList.add('flap');
    setTimeout(() => birdEl && birdEl.classList.remove('flap'), 160);
    spawnSparkles();
  }

  function spawnPipe(){
    const gap = cfg.SAILOR_PIPE_GAP;
    const topMargin = cfg.SAILOR_TOP_SAFE + 12;
    const botMargin = 40;
    const gapTop = topMargin + Math.random() * Math.max(20, (areaH - gap - topMargin - botMargin));

    const topEl = document.createElement('div');
    topEl.className = 'sp-pipe top';
    topEl.style.left = areaW + 'px';
    topEl.style.top = '0px';
    topEl.style.height = gapTop + 'px';
    const topCap = document.createElement('div');
    topCap.className = 'sp-pipe-cap';
    topEl.appendChild(topCap);

    const botEl = document.createElement('div');
    botEl.className = 'sp-pipe bottom';
    botEl.style.left = areaW + 'px';
    botEl.style.top = (gapTop + gap) + 'px';
    botEl.style.height = (areaH - gapTop - gap) + 'px';
    const botCap = document.createElement('div');
    botCap.className = 'sp-pipe-cap';
    botEl.appendChild(botCap);

    container.appendChild(topEl);
    container.appendChild(botEl);

    pipes.push({ x: areaW, gapTop, gap, passed:false, topEl, botEl });
  }

  function crash(){
    started = false;
    const flash = document.createElement('div');
    flash.className = 'sp-flash';
    container.appendChild(flash);
    setTimeout(() => flash.remove(), 460);

    resetRun();
    placeBird();

    hintEl = document.createElement('div');
    hintEl.className = 'sp-hint';
    hintEl.textContent = 'Tap to fly! ✨';
    container.appendChild(hintEl);
  }

  function finish(){
    running = false;
    if(rafId) cancelAnimationFrame(rafId);
    rafId = null;
    onWin();
  }

  function step(ts){
    if(!running) return;
    if(lastTs == null) lastTs = ts;
    let dt = (ts - lastTs) / 1000;
    lastTs = ts;
    if(dt > 0.05) dt = 0.05; // clamp huge jumps (tab switches etc.)

    if(started){
      velocity += cfg.SAILOR_GRAVITY * dt;
      if(velocity > cfg.SAILOR_MAX_FALL_SPEED) velocity = cfg.SAILOR_MAX_FALL_SPEED;
      birdY += velocity * dt;

      // ceiling / floor = crash (ceiling kept below the HUD, not the raw top edge)
      const ceiling = cfg.SAILOR_TOP_SAFE;
      if(birdY < ceiling){ birdY = ceiling; crash(); rafId = requestAnimationFrame(step); return; }
      if(birdY + BIRD_H() > areaH){ crash(); rafId = requestAnimationFrame(step); return; }

      // move + evaluate pipes
      spawnAcc += dt * 1000;
      if(spawnAcc >= cfg.SAILOR_PIPE_SPAWN_MS){
        spawnAcc = 0;
        spawnPipe();
      }

      const speed = cfg.SAILOR_PIPE_SPEED * dt;
      for(let i = pipes.length - 1; i >= 0; i--){
        const p = pipes[i];
        p.x -= speed;
        p.topEl.style.left = p.x + 'px';
        p.botEl.style.left = p.x + 'px';

        // collision (bird box vs both pipe rects)
        const bx0 = birdX + 6, bx1 = birdX + BIRD_W() - 6;
        const by0 = birdY + 4, by1 = birdY + BIRD_H() - 4;
        const px0 = p.x, px1 = p.x + cfg.SAILOR_PIPE_WIDTH;
        if(bx1 > px0 && bx0 < px1){
          if(by0 < p.gapTop || by1 > p.gapTop + p.gap){
            crash();
            rafId = requestAnimationFrame(step);
            return;
          }
        }

        // scoring: pipe's right edge passed the bird's left edge
        if(!p.passed && px1 < bx0){
          p.passed = true;
          score++;
          updateScore();
          if(score >= cfg.SAILOR_TARGET){ finish(); return; }
        }

        // cleanup off-screen pipes
        if(p.x + cfg.SAILOR_PIPE_WIDTH < -10){
          p.topEl.remove(); p.botEl.remove();
          pipes.splice(i, 1);
        }
      }
    }

    placeBird();
    rafId = requestAnimationFrame(step);
  }

  function makeStars(){
    const count = cfg.SAILOR_STAR_COUNT;
    for(let i=0;i<count;i++){
      const s = document.createElement('div');
      s.className = 'sp-star';
      s.style.left = (Math.random()*96 + 2) + '%';
      s.style.top  = (Math.random()*70 + 2) + '%';
      s.style.animationDelay = (Math.random()*2) + 's';
      container.appendChild(s);
    }
    const moon = document.createElement('div');
    moon.className = 'sp-moon';
    // Quick-adjust: append ?moonOpacity=0.5 (any value 0–1) to the page URL to
    // preview a different transparency instantly. Falls back to the config
    // default (cfg.MOON_IMAGE_OPACITY) if no URL param is given or it's invalid.
    const urlOverride = parseFloat(new URLSearchParams(location.search).get('moonOpacity'));
    const moonOpacity = !isNaN(urlOverride) ? urlOverride
      : (cfg.MOON_IMAGE_OPACITY != null ? cfg.MOON_IMAGE_OPACITY : cfg.CLOUD_IMAGE_OPACITY);
    const fade = 1 - moonOpacity;
    moon.style.backgroundImage =
      // 1) sphere shading: a soft highlight top-left fading to a gentle shadow
      //    bottom-right, blended with soft-light so the flat photo reads as a globe
      'radial-gradient(circle at 34% 30%, rgba(255,255,255,0.9), rgba(255,246,218,0.35) 55%, rgba(120,90,60,0.55) 100%), ' +
      // 2) warm moonlight tint over the photo (much lighter than before, so the
      //    picture actually stays visible instead of washing out to white)
      'linear-gradient(rgba(255,246,218,' + fade + '), rgba(255,246,218,' + fade + ')), ' +
      // 3) the photo itself
      'url("' + cfg.CLOUD_IMAGE + '")';
    container.appendChild(moon);
  }

  function onPointerDown(e){
    e.preventDefault();
    flap();
  }

  function onKeyDown(e){
    if(e.code === 'Space' || e.code === 'ArrowUp'){
      e.preventDefault();
      flap();
    }
  }

  function start(el, cb){
    container = el;
    onWin = cb;
    container.classList.add('sailor-pop-wrap');
    areaW = container.clientWidth;
    areaH = container.clientHeight;

    makeStars();

    scoreEl = document.createElement('div');
    scoreEl.className = 'sp-score';
    container.appendChild(scoreEl);

    makeBird();
    resetRun();
    placeBird();
    updateScore();

    hintEl = document.createElement('div');
    hintEl.className = 'sp-hint';
    hintEl.textContent = 'Tap to fly! ✨';
    container.appendChild(hintEl);

    container.addEventListener('mousedown', onPointerDown);
    container.addEventListener('touchstart', onPointerDown, { passive:false });
    document.addEventListener('keydown', onKeyDown);

    running = true;
    lastTs = null;
    rafId = requestAnimationFrame(step);
  }

  function stop(){
    running = false;
    started = false;
    if(rafId) cancelAnimationFrame(rafId);
    rafId = null;
    container.removeEventListener('mousedown', onPointerDown);
    container.removeEventListener('touchstart', onPointerDown);
    document.removeEventListener('keydown', onKeyDown);
    pipes.forEach(p => { p.topEl.remove(); p.botEl.remove(); });
    pipes = [];
  }

  App.games.sailorPop = { start, stop };

})(window.App);
