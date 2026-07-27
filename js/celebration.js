/*
  celebration.js
  ----------------------------------------------------------------
  Runs once, when the "Claim your prize" button is pressed. A handful
  of Luna cats (App.makeLunaCat) walk along a parametric heart
  curve in lockstep at different phase offsets, dropping paw
  prints as they go — so by the time they finish, the prints have
  traced out a full heart. Falling confetti hearts run alongside.

  Depends on: App.config, App.makeLunaCat
*/
(function(App){

  const cfg = App.config;
  const celebrateLayer = document.getElementById('celebrate-layer');
  let celebrated = false;

  /** Classic parametric heart curve, scaled and centered on screen. */
  function heartPoint(t, scale, cx, cy){
    const x = 16*Math.pow(Math.sin(t), 3);
    const y = 13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);
    return { x: cx + x*scale, y: cy - y*scale };
  }

  function spawnConfetti(){
    for(let i=0; i<cfg.CONFETTI_COUNT; i++){
      const fh = document.createElement('div');
      fh.className = 'confetti-heart';
      fh.textContent = cfg.CONFETTI_EMOJIS[Math.floor(Math.random()*cfg.CONFETTI_EMOJIS.length)];
      fh.style.left = (Math.random()*100)+'%';
      fh.style.animationDuration = (3+Math.random()*2.5)+'s';
      fh.style.animationDelay = (Math.random()*1.5)+'s';
      fh.style.fontSize = (14+Math.random()*14)+'px';
      celebrateLayer.appendChild(fh);
      setTimeout(() => fh.remove(), 7000);
    }
  }

  /**
   * Fills the inside of the heart with flowers, once the paw-print
   * outline has finished tracing it. Rather than random points (which
   * always leave visible gaps no matter how many you throw down), this
   * lays flowers out on concentric "rings" scaled in from the boundary,
   * with more flowers on the outer (bigger) rings so density stays even
   * — that's what guarantees full coverage with no empty patches.
   */
  function spawnFlowerFill(scale, cx, cy){
    const RINGS = cfg.FLOWER_RINGS;
    const fragment = document.createDocumentFragment();
    let i = 0;

    for(let ring=0; ring<RINGS; ring++){
      const r = (ring+0.5) / RINGS;               // 0 (center) .. ~1 (near the outline)
      const count = 5 + ring*5;                     // more flowers on the bigger outer rings
      const angleStep = (Math.PI*2) / count;
      const angleOffset = (ring % 2) * (angleStep/2); // stagger alternating rings

      for(let k=0; k<count; k++){
        const t = angleOffset + k*angleStep + (Math.random()-0.5)*angleStep*0.3;
        const rJit = r + (Math.random()-0.5)*(1/RINGS)*0.35;

        const edge = heartPoint(t, scale, cx, cy);
        const x = cx + (edge.x - cx) * rJit;
        const y = cy + (edge.y - cy) * rJit;

        const flower = document.createElement('div');
        flower.className = 'heart-flower';
        flower.textContent = cfg.FLOWER_EMOJIS[Math.floor(Math.random()*cfg.FLOWER_EMOJIS.length)];
        flower.style.left = x+'px';
        flower.style.top  = y+'px';
        flower.style.fontSize = (20+Math.random()*14)+'px';
        flower.style.animationDelay = (i*cfg.FLOWER_STAGGER_MS)+'ms';
        fragment.appendChild(flower);
        i++;
      }
    }
    celebrateLayer.appendChild(fragment);
    return i; // total flower count, used to time the caption below
  }

  /**
   * Fades in the "for the most beautiful..." caption once the last
   * flower has bloomed. Timed off the same stagger math as the flowers
   * themselves (last flower's delay + its bloom duration), plus a
   * small pause so the full heart gets a beat to breathe first.
   */
  function showCelebrationCaption(flowerCount){
    const lastFlowerDelay = Math.max(0, flowerCount-1) * cfg.FLOWER_STAGGER_MS;
    const bloomDuration = 600; // matches .heart-flower's flowerBloom animation-duration
    const pause = 500;
    setTimeout(() => {
      const caption = document.createElement('div');
      caption.className = 'celebration-caption';
      caption.textContent = cfg.TEXT.celebrationCaption;
      celebrateLayer.appendChild(caption);
    }, lastFlowerDelay + bloomDuration + pause);
  }

  function runCelebration(){
    if(celebrated) return;
    celebrated = true;
    celebrateLayer.innerHTML = '';
    document.getElementById('final-screen').classList.add('is-celebrating');

    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w/2;
    const cy = h/2 + 10;
    const scale = Math.min(w,h)/34;

    spawnConfetti();

    // several Luna cats trace the same heart path at different phase offsets
    const cats = [];
    for(let i=0; i<cfg.CELEBRATION_CAT_COUNT; i++){
      const cat = App.makeLunaCat('lc-run');
      celebrateLayer.appendChild(cat);
      cats.push({ el: cat, phase: (i/cfg.CELEBRATION_CAT_COUNT)*Math.PI*2 });
    }

    try{
      const sound = new Audio(cfg.CELEBRATION_MEOW_SOUND);
      sound.volume = cfg.CELEBRATION_MEOW_VOLUME;
      sound.play().catch(() => {});
    }catch(e){ /* audio not available — celebration still runs */ }

    const start = performance.now();
    const lastPawPos = cats.map(() => null); // per-cat: {x,y} of the last paw dropped, or null

    // The cats' phases are spread evenly around the circle (see the `phase`
    // set above), so together they finish tracing the WHOLE heart outline
    // after covering just 1/CELEBRATION_CAT_COUNT of a lap — long before
    // any single cat has gone all the way around. Previously the code kept
    // running the cats until a full lap (progress 1) before starting the
    // flowers, which left a long stretch of the cats pointlessly re-running
    // an outline that was already complete. Stopping as soon as the outline
    // is actually finished removes that dead time.
    const TRACE_PROGRESS = Math.min(1, 1/cfg.CELEBRATION_CAT_COUNT + 0.02);

    function frame(now){
      const elapsed = now - start;
      const progress = Math.min(elapsed/cfg.CELEBRATION_LOOP_MS, TRACE_PROGRESS);
      const t = progress*Math.PI*2 - Math.PI/2; // start at the top of the heart

      cats.forEach((c, idx) => {
        const tt = t + c.phase;
        const p = heartPoint(tt, scale, cx, cy);
        const pNext = heartPoint(tt+0.05, scale, cx, cy);
        const movingRight = (pNext.x - p.x) >= 0;

        // paws (bottom of the 70x100 sprite) land on the path point
        c.el.style.left = (p.x-35)+'px';
        c.el.style.top  = (p.y-88)+'px';

        if(movingRight)  c.el.classList.remove('lc-flip');
        else              c.el.classList.add('lc-flip');

        // drop a paw whenever this cat has moved far enough since its last
        // one — spacing by distance (not by time) keeps the outline gap-free
        // even where the heart curve itself moves faster, like near the dip.
        const last = lastPawPos[idx];
        const dist = last ? Math.hypot(p.x-last.x, p.y-last.y) : Infinity;
        if(dist >= cfg.CELEBRATION_PAW_SPACING_PX){
          lastPawPos[idx] = p;
          const paw = document.createElement('div');
          paw.className = 'paw';
          paw.textContent = '🐾';
          paw.style.left = (p.x-10)+'px';
          paw.style.top  = (p.y-10)+'px';
          paw.style.setProperty('--rot', (Math.random()*360)+'deg');
          celebrateLayer.appendChild(paw);
        }
      });

      if(progress < TRACE_PROGRESS){
        requestAnimationFrame(frame);
      } else {
        cats.forEach(c => c.el.remove());
        const flowerCount = spawnFlowerFill(scale, cx, cy);
        showCelebrationCaption(flowerCount);
      }
    }
    requestAnimationFrame(frame);
  }

  App.runCelebration = runCelebration;

})(window.App);
