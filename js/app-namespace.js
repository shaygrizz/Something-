/*
  app-namespace.js
  ----------------------------------------------------------------
  The single global the whole project uses: window.App.
  Every other file does `(function(App){ ... })(window.App);` and
  hangs its own piece off of it (App.config, App.screens,
  App.startGame, App.makeLunaCat, etc). This must load first.
*/
window.App = window.App || {};
window.App.games = window.App.games || {}; // sailorPop, genshinSnake, inazumaMemory, cityQuiz
