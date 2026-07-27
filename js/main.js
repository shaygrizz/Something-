/*
  main.js
  ----------------------------------------------------------------
  Loaded last. Does three things, in order:
    1. Injects the copy from App.config.TEXT into the DOM, so
       editing text only ever means editing config.js.
    2. Scatters clouds/sparkles onto each screen.
    3. Wires the two buttons to the game and the celebration.
*/
(function(App){

  const cfg = App.config;
  const T = cfg.TEXT;

  // 1. text
  document.getElementById('cover-title').textContent    = T.coverTitle;
  document.getElementById('cover-subtitle').textContent  = T.coverSubtitle;
  document.getElementById('start-btn').textContent       = T.startButton;
  document.getElementById('footer-cover').textContent    = T.footerCover;
  document.getElementById('footer-game').textContent     = T.footerGame;
  document.getElementById('footer-final').textContent    = T.footerFinal;
  document.getElementById('final-title').textContent     = T.finalTitle;
  document.getElementById('final-message').textContent    = T.finalMessage;
  document.getElementById('prize-btn').textContent        = T.prizeButton;

  // 2. background decoration
  App.addClouds(App.screens.cover);
  App.addClouds(App.screens.game);
  App.addClouds(App.screens.final);
  App.addCoverCats();

  // 3. wiring
  document.getElementById('start-btn').addEventListener('click', App.startGame);
  document.getElementById('prize-btn').addEventListener('click', App.runCelebration);

})(window.App);
