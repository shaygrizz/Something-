/*
  city-quiz.js
  ----------------------------------------------------------------
  Round 4: a 10-question "which country is this city in" quiz,
  styled with Italy's colors. Each question shows a city name and
  4 country options; picking one locks the question and shows the
  correct answer before moving on.

  Exposes: App.games.cityQuiz = { start(container, onWin), stop() }
*/
(function(App){

  const cfg = App.config;

  let container, onWin;
  let statusEl, cityEl, optsEl;
  let idx = 0, score = 0;
  let locked = false;
  let pendingTimer = null;

  function shuffle(arr){
    for(let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function finish(){
    onWin();
  }

  function renderQuestion(){
    const q = cfg.QUIZ_QUESTIONS[idx];
    statusEl.textContent = 'Question ' + (idx + 1) + ' / ' + cfg.QUIZ_QUESTIONS.length + '   •   Score: ' + score;
    cityEl.textContent = q.city;
    optsEl.innerHTML = '';

    shuffle(q.options.slice()).forEach(opt => {
      const b = document.createElement('button');
      b.className = 'iq-opt';
      b.textContent = opt;
      b.addEventListener('click', () => onAnswer(opt, q.answer, b));
      optsEl.appendChild(b);
    });
    locked = false;
  }

  function onAnswer(picked, correct, btn){
    if(locked) return;
    locked = true;

    if(picked === correct){
      btn.classList.add('iq-correct');
      score++;
    } else {
      btn.classList.add('iq-wrong');
      Array.from(optsEl.children).forEach(b => {
        if(b.textContent === correct) b.classList.add('iq-correct');
      });
    }

    pendingTimer = setTimeout(() => {
      idx++;
      if(idx >= cfg.QUIZ_QUESTIONS.length) finish();
      else renderQuestion();
    }, cfg.QUIZ_ANSWER_PAUSE_MS);
  }

  function start(el, cb){
    container = el;
    onWin = cb;
    container.classList.add('italy-wrap');
    idx = 0;
    score = 0;
    locked = false;

    statusEl = document.createElement('div');
    statusEl.className = 'iq-status';
    container.appendChild(statusEl);

    const card = document.createElement('div');
    card.className = 'iq-card';
    cityEl = document.createElement('div');
    cityEl.className = 'iq-city';
    card.appendChild(cityEl);
    container.appendChild(card);

    optsEl = document.createElement('div');
    optsEl.className = 'iq-opts';
    container.appendChild(optsEl);

    renderQuestion();
  }

  function stop(){
    locked = true;
    clearTimeout(pendingTimer);
  }

  App.games.cityQuiz = { start, stop };

})(window.App);
