/*
  game.js
  ----------------------------------------------------------------
  Round orchestrator. Each round is a totally different themed
  mini-game (see js/games/*.js). This file just: shows the round
  number/dots, starts/stops the right music track, hands control
  to the round's mini-game module, and moves to the next round
  (or the final screen) when that module reports it's won.

  Depends on: App.config, App.screens, App.showScreen,
              App.games.* (js/games/*.js),
              App.startCatWalker / App.stopCatWalker (cat-walker.js)
*/
(function(App){

  const cfg = App.config;

  const gameArea   = document.getElementById('game-area');
  const roundTitle = document.getElementById('round-title');

  let currentRound = 1;
  let musicEl = null;
  let activeGame = null;

  // the 4 mini-games, in play order — each exposes { start(container, onWin), stop() }
  function roundModule(n){
    return [App.games.sailorPop, App.games.genshinSnake,
            App.games.inazumaMemory, App.games.cityQuiz][n-1];
  }

  function updateDots(){
    for(let i=1; i<=cfg.TOTAL_ROUNDS; i++){
      const dot = document.getElementById('dot-'+i);
      dot.classList.remove('done','current');
      if(i < currentRound) dot.classList.add('done');
      else if(i === currentRound) dot.classList.add('current');
    }
  }

  function playRoundMusic(n){
    stopRoundMusic();
    try{
      musicEl = new Audio(cfg.ROUND_MUSIC[n-1]);
      musicEl.loop = true;
      musicEl.volume = cfg.ROUND_MUSIC_VOLUME;
      musicEl.play().catch(() => {});
    }catch(e){ /* track not available yet — round still playable without it */ }
  }

  function stopRoundMusic(){
    if(musicEl){ musicEl.pause(); musicEl = null; }
  }

  function startRound(n){
    currentRound = n;
    gameArea.innerHTML = '';
    gameArea.className = 'game-area';
    roundTitle.textContent = 'Round ' + n + ' — ' + cfg.ROUND_NAMES[n-1];
    updateDots();
    playRoundMusic(n);
    activeGame = roundModule(n);
    activeGame.start(gameArea, finishRound);
  }

  function finishRound(){
    if(activeGame && activeGame.stop) activeGame.stop();
    activeGame = null;

    const banner = document.createElement('div');
    banner.className = 'round-banner';
    const txt = document.createElement('div');
    txt.className = 'round-banner-text';
    txt.textContent = cfg.TEXT.roundCompleted(currentRound);
    banner.appendChild(txt);
    App.screens.game.appendChild(banner);

    setTimeout(() => {
      banner.remove();
      if(currentRound >= cfg.TOTAL_ROUNDS){
        stopRoundMusic();
        App.stopCatWalker();
        App.showScreen('final');
        playFinalReveal();
      } else {
        startRound(currentRound + 1);
      }
    }, cfg.ROUND_BANNER_MS);
  }

  function playFinalReveal(){
    try{
      const snd = new Audio(cfg.FINAL_REVEAL_SOUND);
      snd.volume = cfg.FINAL_REVEAL_VOLUME;
      snd.play().catch(() => {});
    }catch(e){ /* sound not available — final screen still shows fine without it */ }

    // the celebration song starts at the exact same moment as the reveal
    // sound, right as the "You did it!" title appears on the final screen
    try{
      const song = new Audio(cfg.FINAL_SONG);
      song.volume = cfg.FINAL_SONG_VOLUME;
      song.loop = cfg.FINAL_SONG_LOOP;
      song.play().catch(() => {});
    }catch(e){ /* song not available — final screen still shows fine without it */ }
  }

  function startGame(){
    App.showScreen('game');
    App.startCatWalker();
    startRound(1);
  }

  App.startGame = startGame;

})(window.App);
