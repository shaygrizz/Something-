/*
  cover-cats.js
  ----------------------------------------------------------------
  Two big, still Luna cats flanking the cover screen (left + right
  edges). They don't walk anywhere — they just idle in place, using
  Luna's built-in breathing/blinking/tail-sway animations from
  luna-cat.css. Shown once, as soon as the app loads.

  Depends on: App.screens, App.makeLunaCat
*/
(function(App){

  function addCoverCats(){
    const leftCat  = App.makeLunaCat('lc-flank lc-flank-left');
    const rightCat = App.makeLunaCat('lc-flank lc-flank-right lc-flip');
    App.screens.cover.appendChild(leftCat);
    App.screens.cover.appendChild(rightCat);
  }

  App.addCoverCats = addCoverCats;

})(window.App);
