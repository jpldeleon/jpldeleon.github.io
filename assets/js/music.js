/**
 * Background music (Satie, Gymnopedie No. 1) + a tiny "Sound" applet in the top panel.
 *  - Panel: just a speaker icon. Click = open / close the applet. Mouse wheel on it = volume, middle click = mute
 *    (the usual Linux panel gestures).
 *  - Applet: just a mute button and a volume slider (no text).
 *  - Playback starts when the boot sequence finishes (and again after a Restart). Browsers block sound until the
 *    visitor has interacted with the page, so if that is refused it starts on the first click, key or tap instead.
 *  - Volume and mute are remembered (localStorage). If the audio file is missing the controls grey out
 *    (the icon never disappears).
 * Put your recording at assets/audio/gymnopedie-no1.mp3 (see SRC). Load AFTER app.js.
 */
(function () {
  'use strict';
  var SRC = 'assets/audio/gymnopedie-no1.mp3';
  var KEY_V = 'site-volume', KEY_M = 'site-muted', DEFAULT_V = 0.35, FADE_MS = 2500, WHEEL_STEP = 0.05;

  var anchor = document.getElementById('panel-restart-btn');
  if (!anchor) return;

  function read(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function write(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  var volume = parseFloat(read(KEY_V, DEFAULT_V)); if (isNaN(volume)) volume = DEFAULT_V;
  volume = Math.min(1, Math.max(0, volume));
  var muted = read(KEY_M, '0') === '1';
  var started = false, failed = false, fadeTimer = 0;

  var audio = new Audio();
  audio.loop = true;
  audio.preload = 'none';
  audio.src = SRC;
  audio.addEventListener('error', fail);

  /* ---- UI ---- */
  var menu = document.createElement('div');
  menu.className = 'panel-vol-menu';
  menu.innerHTML =
    '<button type="button" class="panel-btn panel-btn-icon vol-trigger" aria-haspopup="dialog" aria-expanded="false" aria-controls="volume-popover">' +
      '<i aria-hidden="true" class="fa-solid fa-volume-high"></i></button>' +
    '<div class="panel-popover volume-popover" id="volume-popover" role="dialog" aria-label="Sound" hidden>' +
      '<button type="button" class="vol-mute" aria-label="Mute"><i aria-hidden="true" class="fa-solid fa-volume-high"></i></button>' +
      '<input type="range" class="pv-range" min="0" max="100" step="1" aria-label="Volume">' +
    '</div>';
  anchor.parentNode.insertBefore(menu, anchor);

  var trigger = menu.querySelector('.vol-trigger'), tIcon = trigger.querySelector('i'),
      pop = menu.querySelector('.volume-popover'),
      muteBtn = menu.querySelector('.vol-mute'), mIcon = muteBtn.querySelector('i'),
      range = menu.querySelector('.pv-range');

  function render() {
    var silent = muted || volume === 0 || failed;
    var cls = 'fa-solid ' + ((muted || volume === 0) ? 'fa-volume-xmark' : volume < 0.4 ? 'fa-volume-low' : 'fa-volume-high');
    tIcon.className = cls; mIcon.className = cls;
    trigger.classList.toggle('is-muted', silent);
    trigger.setAttribute('aria-label', 'Sound');
    muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
    muteBtn.setAttribute('aria-pressed', String(muted));
    var p = Math.round((muted ? 0 : volume) * 100);
    range.value = p;
    range.style.setProperty('--pv', p + '%');
    audio.muted = muted;
    if (!fadeTimer) audio.volume = volume;
  }

  /* ---- playback ---- */
  function fail() {                       // missing / unsupported file: grey the controls out, keep them
    if (failed) return;
    failed = true;
    range.disabled = true; muteBtn.disabled = true;
    detach();
    render();
    if (window.console) console.warn('[music] could not load ' + SRC);
  }

  function fadeIn() {
    clearInterval(fadeTimer);
    var t0 = Date.now();
    audio.volume = 0;
    fadeTimer = setInterval(function () {
      var k = Math.min(1, (Date.now() - t0) / FADE_MS);
      audio.volume = volume * k;
      if (k >= 1) { clearInterval(fadeTimer); fadeTimer = 0; audio.volume = volume; }
    }, 60);
  }

  var booting = function () { return document.documentElement.classList.contains('boot-on'); };

  function start(force) {
    if (started || failed) return;
    if (booting() && force !== true) return;          // stay silent during the boot sequence
    var p = audio.play();
    if (!p || !p.then) { started = true; return; }
    p.then(function () { started = true; fadeIn(); detach(); })
     .catch(function (e) { if (e && e.name !== 'NotAllowedError') fail(); else attach(); });   // NotAllowed = wait for a gesture
  }

  var EVENTS = ['pointerdown', 'keydown', 'touchend'], attached = false;
  function onGesture() { start(); }       // fallback: first interaction after the boot starts the music
  function attach() { if (attached) return; attached = true; EVENTS.forEach(function (n) { document.addEventListener(n, onGesture, true); }); }
  function detach() { attached = false; EVENTS.forEach(function (n) { document.removeEventListener(n, onGesture, true); }); }
  attach();

  /* the boot sequence just finished (first visit, or after Restart): play now */
  window.addEventListener('boot:done', function () { start(true); });
  /* Restart: stop, so the track begins again with the next boot */
  document.addEventListener('desktop:restart', function () {
    audio.pause(); audio.currentTime = 0; started = false;
  });

  /* ---- controls ---- */
  function save() { write(KEY_V, volume); write(KEY_M, muted ? '1' : '0'); }
  function setVolume(v) {
    if (failed) return;
    volume = Math.min(1, Math.max(0, v));
    if (volume > 0) muted = false;
    clearInterval(fadeTimer); fadeTimer = 0;
    save(); render(); start();
  }
  function toggleMute() {
    if (failed) return;
    muted = !muted;
    if (!muted && volume === 0) volume = DEFAULT_V;
    save(); render(); start();
  }

  muteBtn.addEventListener('click', toggleMute);
  range.addEventListener('input', function () { setVolume(range.value / 100); });
  trigger.addEventListener('wheel', function (e) {          // wheel over the panel icon = volume
    e.preventDefault();
    setVolume((muted ? 0 : volume) + (e.deltaY < 0 ? WHEEL_STEP : -WHEEL_STEP));
  }, { passive: false });
  trigger.addEventListener('auxclick', function (e) { if (e.button === 1) { e.preventDefault(); toggleMute(); } });

  /* open / close. Not a .panel-menu on purpose; the page's document click handler closes the other
     panel menus when this one is used, and a capture-phase listener closes this one for any outside click. */
  function setOpen(open) {
    pop.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
  }
  trigger.addEventListener('click', function () { setOpen(pop.hidden); start(); });
  document.addEventListener('click', function (e) { if (!pop.hidden && !menu.contains(e.target)) setOpen(false); }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pop.hidden) { setOpen(false); trigger.focus(); } });

  render();
  start();                                // no boot sequence (already seen this session): try straight away
})();