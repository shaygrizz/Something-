/*
  genshin-snake.js
  ----------------------------------------------------------------
  Round 2: classic Snake, Genshin Impact themed. Purple/gold
  palette, a little gem/"Vision" mark on the snake's head, and
  food drawn from Genshin's elemental icons. Arrow keys / WASD,
  plus an on-screen d-pad for touch. Crashing soft-resets the
  round.

  Exposes: App.games.genshinSnake = { start(container, onWin), stop() }
*/
(function(App){

  const cfg = App.config;

  let container, onWin;
  let board, scoreEl, hintEl, dpad;
  let cell = 20, cols, rows;
  let snake, dir, nextDir, food;
  let score = 0;
  let tickTimer = null;
  let running = false;

  function px(n){ return n * cell; }

  function render(){
    board.innerHTML = '';

    const f = document.createElement('div');
    f.className = 'gs-food';
    f.textContent = food.emoji;
    f.style.left = px(food.x) + 'px';
    f.style.top  = px(food.y) + 'px';
    f.style.width = cell + 'px';
    f.style.height = cell + 'px';
    f.style.fontSize = (cell * 0.8) + 'px';
    board.appendChild(f);

    snake.forEach((seg, i) => {
      const s = document.createElement('div');
      s.className = 'gs-seg' + (i === 0 ? ' gs-head' : '');
      s.style.left = px(seg.x) + 'px';
      s.style.top  = px(seg.y) + 'px';
      s.style.width = cell + 'px';
      s.style.height = cell + 'px';
      board.appendChild(s);
    });
  }

  function placeFood(){
    let x, y, collide;
    do{
      x = Math.floor(Math.random() * cols);
      y = Math.floor(Math.random() * rows);
      collide = snake.some(s => s.x === x && s.y === y);
    } while(collide);
    const emoji = cfg.SNAKE_FOOD_EMOJIS[Math.floor(Math.random() * cfg.SNAKE_FOOD_EMOJIS.length)];
    food = { x, y, emoji };
  }

  function updateScore(){
    scoreEl.textContent = 'Collected: ' + score + ' / ' + cfg.SNAKE_TARGET;
  }

  function resetRound(){
    cols = cfg.SNAKE_COLS;
    rows = cfg.SNAKE_ROWS;

    // measure real space used by everything that isn't the board (HUD-safe
    // top padding, score pill, swipe hint, d-pad) so the board always fits
    // on screen instead of assuming fixed pixel heights
    const wrapStyle = getComputedStyle(container);
    const reservedTop = parseFloat(wrapStyle.paddingTop) || 0;
    const reservedBottom = parseFloat(wrapStyle.paddingBottom) || 0;
    const scoreSpace = scoreEl.getBoundingClientRect().height + 10; // + its margin-bottom
    const belowBoardSpace = hintEl.getBoundingClientRect().height + dpad.getBoundingClientRect().height + 18; // margins

    const availW = container.clientWidth - 20;
    const availH = container.clientHeight - reservedTop - reservedBottom - scoreSpace - belowBoardSpace;
    cell = Math.max(10, Math.floor(Math.min(availW / cols, availH / rows)));
    board.style.width  = (cell * cols) + 'px';
    board.style.height = (cell * rows) + 'px';

    snake = [{ x: Math.floor(cols/2), y: Math.floor(rows/2) }];
    dir = { x: 1, y: 0 };
    nextDir = dir;
    score = 0;
    placeFood();
    updateScore();
    render();
  }

  function flashHit(){
    board.classList.add('gs-hit');
    setTimeout(() => board.classList.remove('gs-hit'), 220);
  }

  function finish(){
    running = false;
    clearInterval(tickTimer);
    onWin();
  }

  function tick(){
    if(!running) return;
    dir = nextDir;
    const head = snake[0];
    const nx = head.x + dir.x, ny = head.y + dir.y;

    const hitsWall = nx < 0 || ny < 0 || nx >= cols || ny >= rows;
    const hitsSelf = snake.some(s => s.x === nx && s.y === ny);
    if(hitsWall || hitsSelf){
      flashHit();
      resetRound();
      return;
    }

    snake.unshift({ x: nx, y: ny });

    if(nx === food.x && ny === food.y){
      score++;
      updateScore();
      if(score >= cfg.SNAKE_TARGET){ finish(); return; }
      placeFood();
    } else {
      snake.pop();
    }
    render();
  }

  function setDir(x, y){
    if(dir.x === -x && dir.y === -y) return; // no instant reversing
    nextDir = { x, y };
  }

  function onKey(e){
    const map = {
      ArrowUp:[0,-1], KeyW:[0,-1],
      ArrowDown:[0,1], KeyS:[0,1],
      ArrowLeft:[-1,0], KeyA:[-1,0],
      ArrowRight:[1,0], KeyD:[1,0]
    };
    const m = map[e.code];
    if(m){ e.preventDefault(); setDir(m[0], m[1]); }
  }

  function makeDpad(){
    const pad = document.createElement('div');
    pad.className = 'gs-dpad';
    function addBtn(cls, x, y, label){
      const b = document.createElement('button');
      b.className = 'gs-dbtn ' + cls;
      b.textContent = label;
      b.addEventListener('click', () => setDir(x, y));
      pad.appendChild(b);
    }
    addBtn('gs-up', 0, -1, '▲');
    addBtn('gs-left', -1, 0, '◀');
    addBtn('gs-right', 1, 0, '▶');
    addBtn('gs-down', 0, 1, '▼');
    return pad;
  }

  // ----- swipe controls: the main way to play on a phone -----
  // A short swipe on the board itself sets the direction, same as the
  // d-pad / arrow keys. Keeps the whole thumb-reachable board as the
  // control surface instead of relying only on small buttons.
  let touchStartX = 0, touchStartY = 0, touchActive = false;
  const SWIPE_MIN_PX = 18; // small threshold so quick flicks register, not just long drags

  function onTouchStart(e){
    if(e.touches.length !== 1) return;
    touchActive = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
  function onTouchMove(e){
    if(!touchActive) return;
    e.preventDefault(); // stop the page from scrolling while swiping
  }
  function onTouchEnd(e){
    if(!touchActive) return;
    touchActive = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if(Math.abs(dx) < SWIPE_MIN_PX && Math.abs(dy) < SWIPE_MIN_PX) return; // tap, not a swipe
    if(Math.abs(dx) > Math.abs(dy)){
      setDir(dx > 0 ? 1 : -1, 0);
    } else {
      setDir(0, dy > 0 ? 1 : -1);
    }
  }

  function start(el, cb){
    container = el;
    onWin = cb;
    container.classList.add('genshin-wrap');

    scoreEl = document.createElement('div');
    scoreEl.className = 'gs-score';
    container.appendChild(scoreEl);

    board = document.createElement('div');
    board.className = 'gs-board';
    container.appendChild(board);

    hintEl = document.createElement('div');
    hintEl.className = 'gs-hint';
    hintEl.textContent = 'Swipe the board, or use the arrows ✨';
    container.appendChild(hintEl);

    dpad = makeDpad();
    container.appendChild(dpad);

    document.addEventListener('keydown', onKey);
    board.addEventListener('touchstart', onTouchStart, { passive:true });
    board.addEventListener('touchmove', onTouchMove, { passive:false });
    board.addEventListener('touchend', onTouchEnd, { passive:true });

    resetRound();
    running = true;
    tickTimer = setInterval(tick, cfg.SNAKE_TICK_MS);
  }

  function stop(){
    running = false;
    clearInterval(tickTimer);
    document.removeEventListener('keydown', onKey);
    if(board){
      board.removeEventListener('touchstart', onTouchStart);
      board.removeEventListener('touchmove', onTouchMove);
      board.removeEventListener('touchend', onTouchEnd);
    }
  }

  App.games.genshinSnake = { start, stop };

})(window.App);
