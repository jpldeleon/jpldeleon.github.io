/**
 * Boot sequence: GRUB (Arch entries) -> boot log -> tty login -> desktop.
 * Plays once per browser session (sessionStorage 'boot-seen'). No input, no countdown.
 * Fires "boot:done" on window when finished (app.js waits for it before opening the terminal).
 * window.Boot.play() runs it again (the Restart button uses this) and returns a Promise.
 * Load BEFORE app.js.
 */
(function () {
  'use strict';
  var de = document.documentElement, scr = null, removeTimer = 0, playing = null;

  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var rand = function (a, b) { return a + Math.random() * (b - a); };

  /* ---- timing (ms): tweak here ---- */
  var T = { grub: 1500, loading: 380, logMin: 45, logMax: 120, typeMin: 70, typeMax: 140 };

  var HOST = 'portfolio', USER = 'jp', KERNEL = '6.12.8-arch1-1';

  function add(html, cls) {
    var d = document.createElement('div'); if (cls) d.className = cls; d.innerHTML = html;
    scr.appendChild(d); return d;
  }
  function typeInto(el, caret, text) {
    caret.classList.add('is-typing');
    return new Promise(function (done) {
      var i = 0;
      (function step() {
        if (i >= text.length) { caret.classList.remove('is-typing'); return done(); }
        el.textContent += text.charAt(i++);
        setTimeout(step, rand(T.typeMin, T.typeMax));
      })();
    });
  }
  function promptLine(label) {            // "label <typed><caret>"
    var d = add('<span class="bt-label"></span><span class="bt-typed"></span><i class="bt-caret"></i>');
    d.querySelector('.bt-label').innerHTML = label;
    return { typed: d.querySelector('.bt-typed'), caret: d.querySelector('.bt-caret'), row: d };
  }
  function ok(msg) { return add('[  <span class="bt-ok">OK</span>  ] ' + msg); }

  var LOG = [
    'OK|Mounted /boot.',
    'OK|Started Network Manager.',
    'OK|Started Technical SEO Crawler.',
    'OK|Started WordPress Service.',
    'OK|Started Portfolio Web Server.',
    'OK|Reached target Graphical Interface.'
  ];

  function lastLogin() {
    var d = new Date(Date.now() - 86400000 * 1);
    return d.toDateString().slice(0, 10) + ' ' + d.toTimeString().slice(0, 8);
  }

  async function run() {
    /* 1. GRUB: just the entries, centred over the wallpaper */
    scr.classList.add('is-grub');
    scr.innerHTML =
      '<div class="bt-grub bt-min">' +
      '<ul class="bt-grub-box">' +
      '<li class="is-sel">Arch Linux</li>' +
      '<li>Arch Linux (fallback initramfs)</li>' +
      '</ul>' +
      '</div>';
    await sleep(T.grub);

    /* 2. boot log */
    scr.classList.remove('is-grub'); scr.innerHTML = '';
    for (var i = 0; i < LOG.length; i++) {
      var l = LOG[i];
      if (l.indexOf('OK|') === 0) ok(l.slice(3)); else add(l, 'bt-dim');
      await sleep(rand(T.logMin, T.logMax) + 40);
    }
    await sleep(450);

    /* 3. tty login (typed) */
    scr.innerHTML = '';
    add('<span class="bt-arch">Arch Linux</span> ' + KERNEL + ' (tty1)');
    add('');
    var lg = promptLine(HOST + ' login: ');
    await sleep(600);
    await typeInto(lg.typed, lg.caret, USER);
    await sleep(240);
    lg.caret.remove();
    var pw = promptLine('Password: ');
    await sleep(500);
    await typeInto(pw.typed, pw.caret, '********');   // one * per character
    await sleep(300);
    pw.caret.remove();
    add('Last login: ' + lastLogin() + ' on tty1');
    await sleep(240);
    var sh = promptLine('[' + USER + '@' + HOST + ' ~]$ ');
    await sleep(450);
    await typeInto(sh.typed, sh.caret, 'startx');
    await sleep(380);
    sh.caret.remove();
  }

  function finish(boot) {
    try { sessionStorage.setItem('boot-seen', '1'); } catch (e) { }
    boot.classList.add('is-out');
    window.dispatchEvent(new Event('boot:done'));          // app.js reveals the desktop now
    removeTimer = setTimeout(function () {
      boot.remove(); de.classList.remove('boot-on'); playing = null;
      de.classList.add('boot-ui-in');                      // panel + dock fade in over the wallpaper
      setTimeout(function () { de.classList.remove('boot-ui-in'); }, 1000);
    }, 800);
  }

  /* Build (or reuse) the #boot overlay, then play. Safe to call again after a restart. */
  function play() {
    if (playing) return playing;
    clearTimeout(removeTimer);
    var boot = document.getElementById('boot'), s = boot && document.getElementById('bt-screen');
    if (!boot || !s) {
      boot = document.createElement('div'); boot.className = 'boot'; boot.id = 'boot'; boot.setAttribute('aria-hidden', 'true');
      s = document.createElement('div'); s.className = 'bt-screen'; s.id = 'bt-screen';
      boot.appendChild(s); document.body.insertBefore(boot, document.body.firstChild);
    }
    scr = s; scr.className = 'bt-screen'; scr.innerHTML = '';
    boot.classList.remove('is-out');
    de.classList.add('boot-on');
    playing = run().catch(function () { }).then(function () { finish(boot); });   // never leave the visitor stuck
    return playing;
  }

  window.Boot = { play: play };
  if (document.getElementById('boot') && document.getElementById('bt-screen') && de.classList.contains('boot-on')) play();
})();