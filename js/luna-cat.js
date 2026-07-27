/*
  luna-cat.js
  ----------------------------------------------------------------
  Builds one Luna cat DOM node from a fixed HTML template (see
  css/luna-cat.css for the visual spec of each part). Every place
  in the project that needs a cat — the wandering one during the
  game, or the pack of them at the finale — calls
  App.makeLunaCat(extraClass) and gets back a ready `.lc-wrap` div
  it can position and animate however it likes.
*/
(function(App){

  const LUNA_CAT_HTML = `
    <div class="lc-scale"><div class="lc-stage">
      <div class="lc-tail">
        <svg viewBox="0 0 140 160"><path class="lc-tail-path" d="M100,158 C85,100 30,110 28,60 C27,35 60,20 42,10"/></svg>
      </div>
      <div class="lc-body">
        <div class="lc-paw left"></div>
        <div class="lc-paw right"></div>
      </div>
      <div class="lc-neck"></div>
      <div class="lc-head">
        <div class="lc-ear left"><div class="lc-ear-inner"></div></div>
        <div class="lc-ear right"><div class="lc-ear-inner"></div></div>
        <div class="lc-moon"><svg viewBox="0 0 24 24"><path class="lc-moon-path" d="M5.16 9.15A9 9 0 1 1 18.84 9.15 A8 8 0 0 0 5.16 9.15 Z"/></svg></div>
        <div class="lc-eyes"><div class="lc-eye"></div><div class="lc-eye"></div></div>
        <div class="lc-lashes left"><span class="lc-lash"></span><span class="lc-lash"></span><span class="lc-lash"></span></div>
        <div class="lc-lashes right"><span class="lc-lash"></span><span class="lc-lash"></span><span class="lc-lash"></span></div>
        <div class="lc-whiskers left"><span class="lc-whisker"></span><span class="lc-whisker"></span><span class="lc-whisker"></span></div>
        <div class="lc-whiskers right"><span class="lc-whisker"></span><span class="lc-whisker"></span><span class="lc-whisker"></span></div>
        <div class="lc-muzzle"><div class="lc-nose"></div><div class="lc-mouth"></div></div>
      </div>
    </div></div>`;

  /**
   * @param {string} extraClass - e.g. 'lc-walker' or 'lc-run', optionally plus ' lc-flip'
   * @returns {HTMLDivElement} a detached .lc-wrap node, ready to append + position
   */
  function makeLunaCat(extraClass){
    const wrap = document.createElement('div');
    wrap.className = 'lc-wrap ' + (extraClass || '');
    wrap.innerHTML = LUNA_CAT_HTML;
    return wrap;
  }

  App.makeLunaCat = makeLunaCat;

})(window.App);
