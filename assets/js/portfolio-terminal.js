/**
 * Portfolio (terminal app)
 * Two-pane layout: neofetch (left) + projects (right). Circular ASCII {jp} logo, category menu, hover/tap previews and the typed launch animation.
 * Opens projects through the existing window manager: WindowManager.open('project:...').
 * Load AFTER app.js.
 */
(function () {
  'use strict';
  var root = document.getElementById('portfolio');
  if (!root || !root.classList.contains('pt')) return;

  var $ = function (s, r) { return (r || root).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); };
  var reduce = function () { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, reduce() ? Math.min(ms, 60) : ms); }); };

  /* ---------- fit: one base size for the whole app, from the real window size ----------
     Everything in the CSS is in em, so the two panes always fit side by side
     (needs ~50em of width and ~54em of height). */
  function host() {
    for (var n = root.parentElement; n && n !== document.body; n = n.parentElement) {
      var oy = getComputedStyle(n).overflowY;
      if (oy === 'auto' || oy === 'scroll') return n;
    }
    return null;
  }
  function fit() {
    var h = host(), w = root.clientWidth, ht = h ? h.clientHeight : window.innerHeight;
    if (!w) return;
    var s = Math.max(5.5, Math.min(13, w / 50, ht / 54));
    root.style.setProperty('--pt-s', s.toFixed(2) + 'px');
  }
  try {
    fit();
    if (window.ResizeObserver) { var ro = new ResizeObserver(fit); ro.observe(root); if (host()) ro.observe(host()); }
    window.addEventListener('resize', fit);
  } catch (err) { /* cosmetic only */ }

  /* ---------- ASCII logo: bold {jp} on a solid circular ASCII disc (Ubuntu style) ----------
     Every cell of the disc is a character (letters, symbols, numbers), no gaps. Flat look: one colour,
     one weight and one density everywhere (no gradient, no glow). The {jp} is made of the same
     characters and is told apart from the disc by colour only. Plain ASCII only.
       b2 - disc fill        mono/brace - the {jp} monogram
       RING / NODES - optional Ubuntu-like ring and three dots (off by default)
     Edit CHARS to change which characters make up the texture. */
  var W = 37, H = 19, CX = 18, CY = 9, R = 18.4;       // chars are ~1:2, so y is doubled below
  var RING = false, NODES = false;
  var CHARS = 'oe0s8x*+=n';                        // one even texture: symbols, letters, numbers
  function noise(x, y) { var n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return n - Math.floor(n); }
  function flip(rows) { return rows.map(function (r) { return r.split('').reverse().join(''); }); }
  var BRACE_L = ['  ##', ' ## ', ' ## ', ' ## ', '##  ', '##  ', ' ## ', ' ## ', ' ## ', '  ##'];
  var GLYPH_J = ['    ###', '       ', '    ###', '    ###', '    ###', '    ###', '    ###', '    ###', '##  ###', ' ##### '];
  var GLYPH_P = ['       ', '       ', '###### ', '###  ##', '###  ##', '###  ##', '###### ', '###    ', '###    ', '###    '];
  var MONO = [   // bold 3-wide strokes, 1-column gaps between characters (25 cols wide)
    { g: BRACE_L,       x: 0,  ch: '{', cls: 'brace', heavy: false },
    { g: GLYPH_J,       x: 5,  ch: '',  cls: 'mono',  heavy: true  },
    { g: GLYPH_P,       x: 13, ch: '',  cls: 'mono',  heavy: true  },
    { g: flip(BRACE_L), x: 21, ch: '}', cls: 'brace', heavy: false }
  ];
  function buildLogo() {
    var grid = [], x, y;
    for (y = 0; y < H; y++) { grid.push([]); for (x = 0; x < W; x++) grid[y].push(null); }

    /* monogram strokes (centred) */
    var X0 = CX - 12, Y0 = CY - 5, ink = [];
    MONO.forEach(function (m) {
      m.g.forEach(function (row, gy) {
        for (var gx = 0; gx < row.length; gx++) if (row.charAt(gx) === '#') {
          var ix = X0 + m.x + gx, iy = Y0 + gy;
          ink.push({ x: ix, y: iy, c: CHARS.charAt(Math.floor(noise(ix, iy) * CHARS.length)), k: m.cls });
        }
      });
    });
    /* solid disc + ring */
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      var px = x - CX, py = (y - CY) * 2, r = Math.sqrt(px * px + py * py) / R;
      if (r > 1) continue;
      if (RING && r >= 0.88) { grid[y][x] = { c: 'Oo0'.charAt((x + y) % 3), k: 'ring' }; continue; }
      grid[y][x] = { c: CHARS.charAt(Math.floor(noise(y, x) * CHARS.length)), k: 'b2' };
    }
    /* three nodes sitting on the ring */
    if (NODES) [90, 210, 330].forEach(function (deg) {
      var a = deg * Math.PI / 180, ncx = CX + 0.88 * R * Math.cos(a), ncy = CY - 0.88 * R * Math.sin(a) / 2;
      for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
        if (Math.sqrt(Math.pow(x - ncx, 2) + Math.pow((y - ncy) * 2, 2)) / R <= 0.125) grid[y][x] = { c: '@', k: 'node' };
      }
    });
    ink.forEach(function (p) { grid[p.y][p.x] = { c: p.c, k: p.k }; });

    /* serialise: one <span class="lr"> per row, runs of equal class merged */
    var html = '';
    for (y = 0; y < H; y++) {
      var row = '', run = '', cur = null;
      for (x = 0; x < W; x++) {
        var cell = grid[y][x], k = cell ? cell.k : '', ch = cell ? cell.c : ' ';
        if (k !== cur) { if (run) row += cur ? '<span class="' + cur + '">' + run + '</span>' : run; run = ''; cur = k; }
        run += ch;
      }
      if (run) row += cur ? '<span class="' + cur + '">' + run + '</span>' : run;
      html += '<span class="lr" style="--r:' + y + '">' + row + '</span>';
    }
    return html;
  }
  try {
    $('#pt-logo').innerHTML = buildLogo();
    $('#pt-dashes').textContent = new Array(('jp@portfolio').length + 1).join('-');
  } catch (err) { /* cosmetic only */ }

  /* ---------- live neofetch fields ---------- */
  var THEMES = { everforest: 'Everforest', aurora: 'Aurora', gruvbox: 'Gruvbox', monokai: 'Monokai Pro', draculapro: 'Dracula Pro' };
  var themeEl = $('#pt-theme') || document.createElement('i');
  function syncTheme() {
    var t = document.documentElement.getAttribute('data-theme') || 'everforest';
    themeEl.textContent = THEMES[t] || t;
  }
  syncTheme();
  new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  var t0 = Date.now(), upEl = $('#pt-uptime') || document.createElement('i');
  function tick() {
    var s = Math.floor((Date.now() - t0) / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
    upEl.textContent = h ? h + 'h ' + (m % 60) + 'm' : m ? m + 'm ' + (s % 60) + 's' : s + 's';
  }
  tick();
  setInterval(function () { if (document.body.contains(root) && root.offsetParent !== null) tick(); }, 1000);

  /* ---------- status bar clock ---------- */
  var clockEl = $('#pt-clock');
  function clock() { if (!clockEl) return; var d = new Date(); clockEl.textContent = (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(); }
  clock(); setInterval(clock, 20000);

  /* ---------- terminal-style autoscroll ---------- */
  function scroller() {
    for (var n = root; n && n !== document.body; n = n.parentElement) {
      var oy = getComputedStyle(n).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight + 1) return n;
    }
    return document.scrollingElement;
  }
  function toBottom() {
    requestAnimationFrame(function () {
      var sc = scroller(); if (!sc) return;
      sc.scrollTo({ top: sc.scrollHeight, behavior: reduce() ? 'auto' : 'smooth' });
    });
  }

  /* ---------- category filter ---------- */
  var busy = false, raf = 0;
  var pv = $('#pt-preview'), pvImg = pv.querySelector('img'), pvCap = pv.querySelector('span');
  var list = $('#pt-list');
  var run = $('#pt-run'), typed = $('#pt-typed'), out = $('#pt-out');
  var items = $$('.pt-item'), cats = $$('.pt-cat'), pathEl = $('#pt-path');
  items.forEach(function (li) { var sub = li.querySelector('.pt-sub'); if (sub) li.querySelector('.pt-link').title = sub.textContent; });   // full text on hover (list is one-line compact)
  var PATHS = { all: '~/portfolio', seo: '~/portfolio/seo', wordpress: '~/portfolio/wordpress', webdev: '~/portfolio/web-dev', cert: '~/certifications' };
  function inCat(li, f) {
    var c = li.getAttribute('data-cat').split(' ');
    return f === 'all' ? c.indexOf('cert') < 0 : c.indexOf(f) > -1;   // "All Projects" = projects only
  }
  cats.forEach(function (b) {
    var n = items.filter(function (li) { return inCat(li, b.getAttribute('data-filter')); }).length;
    b.querySelector('em').textContent = n;
  });
  var nProj = items.filter(function (li) { return inCat(li, 'all'); }).length;
  $('#pt-count').textContent = nProj + ' projects, ' + (items.length - nProj) + ' certs';

  function applyFilter(f, scroll) {
    cats.forEach(function (b) {
      var on = b.getAttribute('data-filter') === f;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on);
    });
    pathEl.textContent = PATHS[f] || '~/portfolio';
    var sb = $('#pt-sbwin'); if (sb) sb.textContent = ({ all: 'all', seo: 'seo', wordpress: 'wordpress', webdev: 'web-dev', cert: 'certs' })[f] || f;
    closeInline(); hidePreview();
    var n = 0;
    items.forEach(function (li) {
      var show = inCat(li, f);
      li.hidden = !show;
      if (show) {
        n++;
        li.style.setProperty('--i', n - 1);
        li.querySelector('.pt-idx').setAttribute('data-n', (n < 10 ? '0' : '') + n);
        li.style.animation = 'none'; void li.offsetWidth; li.style.animation = '';   // replay the fade-in
      }
    });
    if (scroll) toBottom();
  }
  $('#pt-menu').addEventListener('click', function (e) {
    var b = e.target.closest('.pt-cat'); if (b && !busy) applyFilter(b.getAttribute('data-filter'), false);
  });
  root.addEventListener('keydown', function (e) {   // 1-5 pick a category while the app has focus
    if (busy || e.ctrlKey || e.metaKey || e.altKey) return;
    var b = cats[parseInt(e.key, 10) - 1]; if (b) { applyFilter(b.getAttribute('data-filter'), false); }
  });
  applyFilter('all');

  /* ---------- hover preview (mouse) ---------- */
  function showPreview(a) {
    if (!fine.matches || busy) return;
    var src = a.getAttribute('data-thumb');
    if (pvImg.getAttribute('src') !== src) pvImg.setAttribute('src', src);
    pvCap.textContent = a.getAttribute('data-cmd') + (a.getAttribute('data-open').indexOf('cert:') ? '.html' : '.pdf');
    pv.classList.add('is-on');
  }
  function hidePreview() { pv.classList.remove('is-on'); }
  function movePreview(x, y) {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      var r = root.getBoundingClientRect(), w = pv.offsetWidth, h = pv.offsetHeight;
      var sx = root.scrollLeft, sy = root.scrollTop;          // 0 unless the app itself scrolls
      var px = x - r.left + sx + 16, py = y - r.top + sy + 14;
      if (px + w > r.width + sx - 8) px = x - r.left + sx - w - 16;   // flip left near the edge
      px = Math.max(8, px);
      py = Math.max(8, Math.min(py, root.scrollHeight - h - 8));
      pv.style.transform = 'translate3d(' + px + 'px,' + py + 'px,0)';
    });
  }
  list.addEventListener('pointerover', function (e) {
    if (e.pointerType !== 'mouse') return;
    var a = e.target.closest('.pt-link'); if (a) { showPreview(a); movePreview(e.clientX, e.clientY); }
  });
  list.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' && pv.classList.contains('is-on')) movePreview(e.clientX, e.clientY); });
  list.addEventListener('pointerout', function (e) {
    if (e.pointerType !== 'mouse') return;
    if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest('.pt-link')) hidePreview();
  });
  list.addEventListener('focusin', function (e) {   // keyboard users get the same preview
    var a = e.target.closest('.pt-link'); if (!a || !fine.matches) return;
    showPreview(a); var r = a.getBoundingClientRect(); movePreview(r.left + 90, r.bottom - 6);
  });
  list.addEventListener('focusout', hidePreview);

  /* ---------- touch: tap = inline preview, tap again = launch ---------- */
  function closeInline() {
    $$('.pt-link.is-open').forEach(function (a) { a.classList.remove('is-open'); });
  }
  function openInline(a) {
    closeInline();
    var box = a.querySelector('.pt-inline');
    if (!box.firstChild) {
      var inner = document.createElement('span'), img = document.createElement('img'), cap = document.createElement('small');
      img.alt = ''; img.decoding = 'async'; img.src = a.getAttribute('data-thumb');
      cap.textContent = 'tap again to launch';
      inner.appendChild(img); inner.appendChild(cap); box.appendChild(inner);
    }
    a.classList.add('is-open');
    setTimeout(function () { a.scrollIntoView({ block: 'nearest', behavior: reduce() ? 'auto' : 'smooth' }); }, 120);
  }

  list.addEventListener('click', function (e) {
    var a = e.target.closest('.pt-link'); if (!a) return;
    e.preventDefault();
    if (busy) return;
    var keyboard = e.detail === 0;
    if (!fine.matches && !keyboard && !a.classList.contains('is-open')) { openInline(a); return; }
    launch(a);
  });

  /* ---------- typed launch animation, then the real window ---------- */
  function typeText(text) {
    return new Promise(function (done) {
      if (reduce()) { typed.textContent = text; return done(); }
      var i = 0;
      run.classList.add('is-typing');
      (function step() {
        typed.textContent = text.slice(0, ++i);
        if (i >= text.length) { run.classList.remove('is-typing'); return setTimeout(done, 260); }
        var d = 16 + Math.random() * 24 + (text.charAt(i - 1) === ' ' ? 30 : 0);
        setTimeout(step, d);
      })();
    });
  }
  function line(html, cls) {
    var d = document.createElement('div'); if (cls) d.className = cls; d.innerHTML = html; out.appendChild(d);
    return d;
  }
  function esc(s) { return s.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  async function launch(a) {
    if (busy) return;
    busy = true; root.classList.add('is-busy'); hidePreview(); closeInline();
    var id = a.getAttribute('data-open'), cmd = a.getAttribute('data-cmd'), isCert = id.indexOf('cert:') === 0;
    var title = a.querySelector('.pt-name').textContent;
    out.innerHTML = ''; typed.textContent = ''; run.hidden = false;
    try {
      await typeText(isCert ? 'xdg-open ~/certifications/' + cmd + '.pdf' : './launch ' + cmd + ' --window');
      await sleep(120);
      line('<span class="ok"><b>ok</b></span> ' + (isCert ? 'locating certificate' : 'resolving ~/projects/' + esc(cmd)));
      await sleep(260);
      line('<span class="ok"><b>ok</b></span> ' + (isCert ? 'starting viewer' : 'allocating window') + '<span class="pt-bar"><i></i></span>');
      await sleep(700);
      line((isCert ? '▶ Opening ' : '▶ Launching ') + esc(title) + '…', 'go');
      await sleep(420);
      for (var tries = 0; tries < 20 && !(window.WindowManager && window.WindowManager.open); tries++) await sleep(100);
      if (window.WindowManager && window.WindowManager.open) window.WindowManager.open(id);
      else if (!isCert) window.open(a.getAttribute('href'), '_blank', 'noopener');   // never dump a certificate image into a tab
      await sleep(650);
    } finally {
      out.innerHTML = ''; typed.textContent = ''; run.hidden = true;
      busy = false; root.classList.remove('is-busy');
    }
  }
})();