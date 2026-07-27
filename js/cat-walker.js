/*
  cat-walker.js
  ----------------------------------------------------------------
  Makes two Luna cats (App.makeLunaCat) stroll across the game
  screen every so often, purely for charm — no effect on scoring.
  One walks along the bottom, one along the top, and they always
  set off in opposite directions from each other. Only active on
  the game screen — the final screen has its own celebration cats.

  Depends on: App.config, App.screens, App.makeLunaCat
*/
(function(App){

  const cfg = App.config;
  let catTimer = null;

  /** Plays one instance of the meow sound; a fresh Audio per call so two
      cats crossing at once each get their own overlapping sound. */
  function playMeow(){
    try{
      const sound = new Audio(cfg.CAT_MEOW_SOUND);
      sound.volume = cfg.CAT_MEOW_VOLUME;
      sound.play().catch(() => {});
    }catch(e){ /* audio not available — fail silently, cats still walk */ }
  }

  /** Spawns one wandering cat. position: 'bottom' | 'top'. */
  function walkOneCat(position, fromLeft){
    if(!App.screens.game.classList.contains('active')) return;

    const extraClass = (position === 'top' ? 'lc-walker-top' : 'lc-walker') + (fromLeft ? '' : ' lc-flip');
    const cat = App.makeLunaCat(extraClass);
    cat.style.left = fromLeft ? '-70px' : (window.innerWidth+10)+'px';
    App.screens.game.appendChild(cat);
    playMeow();

    const target = fromLeft ? (window.innerWidth+80) : -90;
    const duration = cfg.CAT_WALK_DURATION_MIN_MS + Math.random()*(cfg.CAT_WALK_DURATION_MAX_MS - cfg.CAT_WALK_DURATION_MIN_MS);

    cat.animate([
      { left: cat.style.left },
      { left: target+'px' }
    ], { duration, easing:'linear' });

    setTimeout(() => cat.remove(), duration+50);
  }

  /** Sends the bottom cat and the top cat off at the same time, always in opposite directions. */
  function walkPairOnce(){
    if(!App.screens.game.classList.contains('active')) return;
    const bottomFromLeft = Math.random() > 0.5;
    walkOneCat('bottom', bottomFromLeft);
    walkOneCat('top', !bottomFromLeft);
  }

  function startCatWalker(){
    stopCatWalker();
    walkPairOnce();
    const interval = cfg.CAT_WALK_INTERVAL_MIN_MS + Math.random()*(cfg.CAT_WALK_INTERVAL_MAX_MS - cfg.CAT_WALK_INTERVAL_MIN_MS);
    catTimer = setInterval(walkPairOnce, interval);
  }

  function stopCatWalker(){
    if(catTimer) clearInterval(catTimer);
    catTimer = null;
  }

  App.startCatWalker = startCatWalker;
  App.stopCatWalker  = stopCatWalker;

})(window.App);
