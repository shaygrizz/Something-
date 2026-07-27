/*
  background-fx.js
  ----------------------------------------------------------------
  Pure decoration: scatters .cloud and .sparkle elements into a
  container. Called once per screen from main.js. Layout numbers
  come from App.config.CLOUD_LAYOUT / SPARKLE_COUNT.

  Each .cloud is shaped by a cloud-silhouette CSS mask (defined in
  background.css) and shows App.config.CLOUD_IMAGE faintly inside
  that silhouette, faded with a white overlay at CLOUD_IMAGE_OPACITY.
*/
(function(App){

  function addClouds(container){
    const cfg = App.config;
    const fade = 1 - cfg.CLOUD_IMAGE_OPACITY;

    cfg.CLOUD_LAYOUT.forEach(p => {
      const c = document.createElement('div');
      c.className = 'cloud';
      c.style.top = p.top;
      c.style.width  = (p.size * 1.5) + 'px';
      c.style.height = p.size + 'px';
      c.style.animationDuration = p.dur + 's';
      c.style.animationDelay = '-' + p.delay + 's';
      c.style.backgroundImage =
        'linear-gradient(rgba(255,255,255,' + fade + '), rgba(255,255,255,' + fade + ')), ' +
        'url("' + cfg.CLOUD_IMAGE + '")';
      container.appendChild(c);
    });

    for(let i=0; i<cfg.SPARKLE_COUNT; i++){
      const d = document.createElement('div');
      d.className = 'sparkle';
      d.style.left = (Math.random()*100) + '%';
      d.style.top = (10 + Math.random()*70) + '%';
      d.style.animationDelay = (Math.random()*4) + 's';
      d.style.animationDuration = (4 + Math.random()*3) + 's';
      container.appendChild(d);
    }
  }

  App.addClouds = addClouds;

})(window.App);
