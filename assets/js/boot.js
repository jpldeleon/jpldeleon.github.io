/**
 * Boot sequence: GRUB (Arch entries) -> boot log -> tty login -> desktop.
 * Plays once per browser session (sessionStorage 'boot-seen'). No input, no countdown.
 * Fires "boot:done" on window when finished (app.js waits for it before opening the terminal).
 * Load BEFORE app.js.
 */
(function () {
  'use strict';
  var de = document.documentElement, boot = document.getElementById('boot'), scr = document.getElementById('bt-screen');
  if (!boot || !scr || !de.classList.contains('boot-on')) return;

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
    ':: running early hook [udev]',
    ':: running hook [udev]',
    ':: Triggering uevents...',
    ":: mounting '/dev/nvme0n1p2' on real root",
    'root: clean, 214532/3055616 files, 5827430/12206336 blocks',
    'OK|Mounted /boot.',
    'OK|Started Journal Service.',
    'OK|Finished Load Kernel Modules.',
    'OK|Reached target Local File Systems.',
    'OK|Started Network Manager.',
    'OK|Reached target Network.',
    'OK|Started Technical SEO Crawler.',
    'OK|Started WordPress Service.',
    'OK|Started Portfolio Web Server.',
    'OK|Reached target Multi-User System.',
    'OK|Reached target Graphical Interface.'
  ];

  function lastLogin() {
    var d = new Date(Date.now() - 86400000 * 1);
    return d.toDateString().slice(0, 10) + ' ' + d.toTimeString().slice(0, 8);
  }

  async function run() {
    /* 1. GRUB menu (translucent), no countdown */
    scr.classList.add('is-grub');
    scr.innerHTML =
      '<div class="bt-grub">' +
        '<div class="bt-grub-head">GNU GRUB&nbsp; version 2.12</div>' +
        '<ul class="bt-grub-box">' +
          '<li class="is-sel">Arch Linux</li>' +
          '<li>Arch Linux (fallback initramfs)</li>' +
          '<li>Advanced options for Arch Linux</li>' +
          '<li>UEFI Firmware Settings</li>' +
        '</ul>' +
        '<div class="bt-grub-help">Use the \u2191 and \u2193 keys to select which entry is highlighted.<br>' +
        'Press enter to boot the selected OS, `e\' to edit the commands before booting or `c\' for a command-line.</div>' +
      '</div>';
    await sleep(T.grub);

    /* 2. kernel handoff + boot log */
    scr.classList.remove('is-grub'); scr.innerHTML = '';
    add('Loading Linux linux ...'); await sleep(T.loading);
    add('Loading initial ramdisk ...'); await sleep(T.loading + 120);
    for (var i = 0; i < LOG.length; i++) {
      var l = LOG[i];
      if (l.indexOf('OK|') === 0) ok(l.slice(3)); else add(l, 'bt-dim');
      await sleep(rand(T.logMin, T.logMax));
    }
    await sleep(350);

    /* 3. tty login (typed) */
    add('');
    add('<span class="bt-arch">Arch Linux</span> ' + KERNEL + ' (tty1)');
    add('');
    var lg = promptLine(HOST + ' login: ');
    await sleep(650);
    await typeInto(lg.typed, lg.caret, USER);
    await sleep(260);
    lg.caret.remove();
    var pw = promptLine('Password: ');          // like a real tty: nothing echoed
    await sleep(1000);
    pw.caret.remove();
    add('Last login: ' + lastLogin() + ' on tty1');
    await sleep(260);
    var sh = promptLine('[' + USER + '@' + HOST + ' ~]$ ');
    await sleep(500);
    await typeInto(sh.typed, sh.caret, 'startx');
    await sleep(380);
    sh.caret.remove();
  }

  function finish() {
    try { sessionStorage.setItem('boot-seen', '1'); } catch (e) { }
    boot.classList.add('is-out');
    window.dispatchEvent(new Event('boot:done'));          // app.js opens the terminal now
    setTimeout(function () { boot.remove(); de.classList.remove('boot-on'); }, 800);
  }

  run().catch(function () { }).then(finish);               // never leave the visitor stuck
})();
