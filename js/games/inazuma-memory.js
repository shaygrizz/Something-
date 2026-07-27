/*
  inazuma-memory.js
  ----------------------------------------------------------------
  Round 3: memory match, Inazuma Eleven themed. Blue/orange (Raimon
  Japan colors), soccer/hissatsu-flavored emoji pairs, card backs
  with a little lightning mark. Tap two cards; matched pairs stay
  face up.

  Exposes: App.games.inazumaMemory = { start(container, onWin), stop() }
*/
(function(App){

  const cfg = App.config;

  let container, onWin;
  let board, statusEl;
  let flipped = [];
  let matchedCount = 0;
  let lock = false;

  function shuffle(arr){
    for(let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function buildDeck(){
    const icons = cfg.MEMORY_ICONS.slice();
    const deck = icons.concat(icons).map((icon, i) => ({ icon, id: i }));
    return shuffle(deck);
  }

  function updateStatus(){
    statusEl.textContent = 'Matched: ' + matchedCount + ' / ' + cfg.MEMORY_ICONS.length;
  }

  function finish(){
    onWin();
  }

  function onCardClick(cardData, el){
    if(lock || el.classList.contains('flipped') || el.classList.contains('matched')) return;
    el.classList.add('flipped');
    flipped.push({ data: cardData, el });

    if(flipped.length === 2){
      lock = true;
      const [a, b] = flipped;
      if(a.data.icon === b.data.icon){
        setTimeout(() => {
          a.el.classList.add('matched');
          b.el.classList.add('matched');
          flipped = [];
          lock = false;
          matchedCount++;
          updateStatus();
          if(matchedCount >= cfg.MEMORY_ICONS.length) finish();
        }, 260);
      } else {
        setTimeout(() => {
          a.el.classList.remove('flipped');
          b.el.classList.remove('flipped');
          flipped = [];
          lock = false;
        }, cfg.MEMORY_MISMATCH_DELAY_MS);
      }
    }
  }

  function start(el, cb){
    container = el;
    onWin = cb;
    container.classList.add('inazuma-wrap');
    matchedCount = 0;
    flipped = [];
    lock = false;

    statusEl = document.createElement('div');
    statusEl.className = 'im-status';
    container.appendChild(statusEl);
    updateStatus();

    board = document.createElement('div');
    board.className = 'im-board';
    container.appendChild(board);

    buildDeck().forEach(cardData => {
      const card = document.createElement('button');
      card.className = 'im-card';
      card.innerHTML =
        '<div class="im-card-inner">' +
          '<div class="im-card-back">⚡</div>' +
          '<div class="im-card-front">' + cardData.icon + '</div>' +
        '</div>';
      card.addEventListener('click', () => onCardClick(cardData, card));
      board.appendChild(card);
    });
  }

  function stop(){
    lock = true;
    flipped = [];
  }

  App.games.inazumaMemory = { start, stop };

})(window.App);
