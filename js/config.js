/*
  config.js
  ----------------------------------------------------------------
  Every "magic number" and piece of tunable content lives here.
  Want a harder game, different emoji, or a longer celebration?
  Change it here — no need to touch the logic files at all.
*/
(function(App){

  App.config = {
    // ----- rounds: each round is a different themed mini-game -----
    TOTAL_ROUNDS: 4,
    ROUND_BANNER_MS: 1500,          // how long the "Round complete" banner stays up
    ROUND_NAMES: ['Sailor Moon', 'Genshin Impact', 'Inazuma Eleven', 'City Quiz'],
    ROUND_MUSIC: [
      'audio/round1-sailormoon.mp3',
      'audio/round2-genshin.mp3',
      'audio/round3-inazuma.mp3',
      'audio/round4-quiz.mp3'
    ],
    ROUND_MUSIC_VOLUME: 0.42,       // background music, kept under the cat/finale sounds

    // ----- round 1: "Moonlight Flight" — Sailor Moon themed Flappy Bird -----
    SAILOR_TARGET: 10,               // towers to fly through to clear the round
    SAILOR_BIRD_WIDTH: 40,           // pixel-art sprite bounding box (matches the drawn art exactly)
    SAILOR_BIRD_HEIGHT: 48,
    SAILOR_GRAVITY: 1500,            // px/s^2, downward acceleration while flying
    SAILOR_FLAP_VELOCITY: -420,      // px/s, upward velocity applied on each flap
    SAILOR_MAX_FALL_SPEED: 560,      // px/s, terminal velocity so falls stay controllable
    SAILOR_PIPE_GAP: 210,            // vertical gap between top/bottom tower — generous on purpose, kept playable
    SAILOR_PIPE_WIDTH: 64,
    SAILOR_PIPE_SPEED: 120,          // px/s, how fast towers scroll left
    SAILOR_PIPE_SPAWN_MS: 1800,      // time between new tower pairs
    SAILOR_STAR_COUNT: 18,           // twinkling background stars
    SAILOR_TOP_SAFE: 64,             // px kept clear at the top so play stays under the round HUD

    // ----- round 2: Genshin Impact snake -----
    SNAKE_TARGET: 10,               // food items to eat to clear the round
    SNAKE_COLS: 14,
    SNAKE_ROWS: 14,
    SNAKE_TICK_MS: 155,
    SNAKE_FOOD_EMOJIS: ['💎','⚡','❄️','🔥','🍃','🪨','💧','⭐'],

    // ----- round 3: Inazuma Eleven memory match -----
    MEMORY_ICONS: ['⚽','🥅','🔥','⚡','🧤','🏆','👟','🎯'],  // 8 pairs = 16 cards
    MEMORY_MISMATCH_DELAY_MS: 700,

    // ----- round 4: city quiz -----
    QUIZ_QUESTIONS: [
      { city:'Porto',        answer:'Portugal', options:['Portugal','Spain','Italy','Greece'] },
      { city:'Bratislava',   answer:'Slovakia', options:['Slovakia','Czech Republic','Hungary','Austria'] },
      { city:'Ljubljana',    answer:'Slovenia', options:['Slovenia','Croatia','Serbia','Slovakia'] },
      { city:'Thessaloniki', answer:'Greece',   options:['Greece','Turkey','Bulgaria','Albania'] },
      { city:'Bergen',       answer:'Norway',   options:['Norway','Sweden','Denmark','Finland'] },
      { city:'Antwerp',      answer:'Belgium',  options:['Belgium','Netherlands','Luxembourg','France'] },
      { city:'Krakow',       answer:'Poland',   options:['Poland','Czech Republic','Slovakia','Germany'] },
      { city:'Valencia',     answer:'Spain',    options:['Spain','Portugal','Italy','France'] },
      { city:'Odesa',        answer:'Ukraine',  options:['Ukraine','Russia','Romania','Moldova'] },
      { city:'Graz',         answer:'Austria',  options:['Austria','Germany','Switzerland','Slovenia'] }
    ],
    QUIZ_ANSWER_PAUSE_MS: 900,      // pause after each answer before the next question

    // ----- wandering cat during the game -----
    CAT_WALK_INTERVAL_MIN_MS: 9000,
    CAT_WALK_INTERVAL_MAX_MS: 13000,
    CAT_WALK_DURATION_MIN_MS: 7000,
    CAT_WALK_DURATION_MAX_MS: 9500,
    CAT_MEOW_SOUND: 'audio/cat-meow.mp3',  // played once per cat that walks across
    CAT_MEOW_VOLUME: 0.45,                 // kept fairly quiet since two can overlap

    // ----- finale celebration -----
    FINAL_REVEAL_SOUND: 'audio/final-reveal.mp3', // plays once, right as "You did it!" appears
    FINAL_REVEAL_VOLUME: 0.7,
    FINAL_SONG: 'audio/final-song.m4a',    // starts right alongside the reveal sound, as "You did it!" appears
    FINAL_SONG_VOLUME: 0.55,
    FINAL_SONG_LOOP: false,
    CELEBRATION_CAT_COUNT: 6,      // how many cats trace the heart at once
    CELEBRATION_LOOP_MS: 7800,     // controls cat speed: the cats stop as soon as they've traced the full outline together (~LOOP_MS / CELEBRATION_CAT_COUNT), not after a full lap
    CELEBRATION_PAW_SPACING_PX: 15, // max gap (in px) between consecutive paw prints along the path
    CELEBRATION_MEOW_SOUND: 'audio/purring-cat.mp3', // played once, right as the celebration cats appear
    CELEBRATION_MEOW_VOLUME: 0.55,
    CONFETTI_COUNT: 26,
    CONFETTI_EMOJIS: ['💖','💛','🌸','✨'],
    FLOWER_RINGS: 10,                // concentric rings used to fill the heart with flowers
    FLOWER_EMOJIS: ['🌸','🌷','🌹','💐','🌼','🌻'],
    FLOWER_STAGGER_MS: 14,          // gap between each flower popping in

    // ----- background decoration -----
    CLOUD_LAYOUT: [
      { top:'6%',  size:58, dur:32, delay:0 },
      { top:'14%', size:40, dur:24, delay:6 },
      { top:'24%', size:68, dur:38, delay:3 },
      { top:'34%', size:36, dur:22, delay:11 },
      { top:'44%', size:52, dur:30, delay:16 },
      { top:'52%', size:44, dur:27, delay:8 },
      { top:'62%', size:64, dur:36, delay:20 },
      { top:'10%', size:34, dur:20, delay:14 }
    ],
    CLOUD_IMAGE: 'img/cloud-photo.png',   // photo shown faintly inside every cloud's silhouette
    CLOUD_IMAGE_OPACITY: 0.3,             // how visible the photo is inside the cloud (0-1)
    // Moon (round 1 night sky) uses its own opacity below — quick-adjust guide:
    //   - Edit MOON_IMAGE_OPACITY here for the permanent default, OR
    //   - Add ?moonOpacity=0.5 to the page URL to preview a different value instantly,
    //     without touching this file (see js/games/sailor-pop.js for how it's read).
    MOON_IMAGE_OPACITY: 0.7,               // how visible the photo is inside the moon (0-1)
    SPARKLE_COUNT: 10,

    // ----- copy -----
    TEXT: {
      coverTitle: 'For Princess Yeva',
      coverSubtitle: 'A cute little game for the sweetest, most charming and smart girl.',
      startButton: 'Start',
      footerCover: 'With love From Rese for Yeva',
      footerGame: 'With love From Rese for Yeva',
      footerFinal: 'With love From Rese for Yeva',
      roundCompleted: (n) => 'Round ' + n + ' complete! 🎉',
      finalTitle: 'You did it! 💛',
      finalMessage: 'Congratulations — you\u2019ve successfully completed this game. Time to claim your well-deserved prize.',
      prizeButton: 'Claim your prize 🎁',
      celebrationCaption: 'For the most beautiful, charming, smart, and lovely girl'
    }
  };

})(window.App);
