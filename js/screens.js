/*
  screens.js
  ----------------------------------------------------------------
  Looks up the three top-level screens once and exposes a single
  showScreen(name) function that every other module uses instead
  of touching classList directly. Add a 4th screen? Register it
  here and it's available everywhere as App.screens.whatever.
*/
(function(App){

  App.screens = {
    cover: document.getElementById('cover-screen'),
    game:  document.getElementById('game-screen'),
    final: document.getElementById('final-screen')
  };

  App.showScreen = function(name){
    Object.values(App.screens).forEach(s => s.classList.remove('active'));
    App.screens[name].classList.add('active');
  };

})(window.App);
