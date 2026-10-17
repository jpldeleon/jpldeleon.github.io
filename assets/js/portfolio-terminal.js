/**
 * Portfolio (terminal app)
 * Neofetch intro, category menu, hover/tap previews and the typed launch animation.
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

  /* ---------- ASCII art: {jp} monogram inside a ring, text characters only ----------
     Every cell is a character. Colors come from CSS classes (.pc1-.pc6, .pm, .pb, .pd),
     which read the active theme's variables, so the theme toggle recolors it for free. */
  var logoEl = $('#pt-logo');
  var LB = [' ▄▀', ' █ ', ' █ ', '▄▀ ', '▀▄ ', ' █ ', ' █ ', ' ▀▄'];
  var RB = ['▀▄ ', ' █ ', ' █ ', ' ▀▄', ' ▄▀', ' █ ', ' █ ', '▄▀ '];
  var JP = [                      // j and p share one stem: dot on top, hook bottom-left, bowl on the right
    '  ██       ',
    '           ',
    '  ██▀▀▀▀█▄ ',
    '  ██     ██',
    '  ██     ██',
    '  ██▄▄▄▄█▀ ',
    '  ██       ',
    '▄▄▄██      '
  ];
  var MONO = JP.map(function (row, i) { return LB[i] + ' ' + row + ' ' + RB[i]; });   // 19 x 8
  var ART_ROWS = 19, ART_R = 9.5, ART_PX = 16, builtFor = 0;

  /* width/height of one character cell, measured in the real font so the ring stays round */
  function cellAspect() {
    var probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;letter-spacing:0';
    probe.textContent = 'MMMMMMMMMMMMMMMMMMMM';
    logoEl.appendChild(probe);
    var w = probe.getBoundingClientRect().width / 20;
    var h = parseFloat(getComputedStyle(logoEl).lineHeight);
    logoEl.removeChild(probe);
    var a = w && h ? w / h : 0;
    return a > 0.3 && a < 0.9 ? a : 0.6;
  }

  function buildArt(A) {
    var cy = (ART_ROWS - 1) / 2;
    var cols = Math.round(2 * ART_R / A) + 2; if (cols % 2 === 0) cols++;   // odd, so there is a true center column
    var cx = (cols - 1) / 2;
    var mh = MONO.length, mw = MONO[0].length;
    var r0 = Math.round(cy - (mh - 1) / 2), c0 = Math.round(cx - (mw - 1) / 2);
    var html = '';
    for (var r = 0; r < ART_ROWS; r++) {
      var runCls = null, run = '';
      for (var c = 0; c < cols; c++) {
        var dx = (c - cx) * A, dy = r - cy, d = Math.sqrt(dx * dx + dy * dy);
        var ang = Math.atan2(dx, -dy); if (ang < 0) ang += 2 * Math.PI;
        var ch = ' ', cls = '';
        if (d >= 8.0 && d <= ART_R) {                                  // outer ring, six color sectors clockwise from the top
          cls = 'pc' + (Math.floor(ang / (2 * Math.PI) * 6) % 6 + 1);
          ch = d > 8.9 ? (((r + c) % 2) ? '.' : 'o') : (((r + c) % 2) ? 'o' : 'O');
        } else if (d >= 6.9 && d < 7.6) { ch = ':'; cls = 'pd'; }      // dim inner halo
        var mr = r - r0, mc = c - c0;
        if (mr >= 0 && mr < mh && mc >= 0 && mc < mw && MONO[mr].charAt(mc) !== ' ') {
          ch = MONO[mr].charAt(mc); cls = (mc < 3 || mc >= mw - 3) ? 'pb' : 'pm';
        }
        if (ch === ' ') cls = '';
        if (cls !== runCls) { if (run) html += runCls ? '<span class="' + runCls + '">' + run + '</span>' : run; runCls = cls; run = ''; }
        run += ch;
      }
      if (run) html += runCls ? '<span class="' + runCls + '">' + run + '</span>' : run;
      if (r < ART_ROWS - 1) html += '\n';
    }
    logoEl.innerHTML = html;
    return cols;
  }

  /* Re-measure on resize: stack when the window is narrow, and scale the whole grid uniformly
     (font-size only), so the characters stay aligned at any size. */
  var artCols = 0, artA = 0;
  function layoutArt() {
    var w = root.clientWidth; if (!w) return;                            // window parked off-page: try again on next resize
    var narrow = w < 620;
    root.classList.toggle('pt-narrow', narrow);
    logoEl.style.fontSize = ART_PX + 'px';
    var A = Math.round(cellAspect() * 100) / 100;
    if (!artCols || A !== artA) { artCols = buildArt(A); artA = A; }
    var cs = getComputedStyle(root), inner = w - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var cap = narrow ? inner : inner * 0.40;                              // art takes at most 40% of a wide window
    var px = Math.max(7, Math.min(ART_PX, cap / (artCols * artA)));
    logoEl.style.fontSize = px.toFixed(2) + 'px';
  }
  layoutArt();
  if (window.ResizeObserver) new ResizeObserver(layoutArt).observe(root); else window.addEventListener('resize', layoutArt);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { artCols = 0; layoutArt(); });

  /* ---------- live neofetch fields ---------- */
  var THEMES = { everforest: 'Everforest', aurora: 'Aurora', gruvbox: 'Gruvbox', monokai: 'Monokai Pro', draculapro: 'Dracula Pro' };
  var themeEl = $('#pt-theme');
  function syncTheme() {
    var t = document.documentElement.getAttribute('data-theme') || 'everforest';
    themeEl.textContent = THEMES[t] || t;
  }
  syncTheme();
  new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  var t0 = Date.now(), upEl = $('#pt-uptime');
  function tick() {
    var s = Math.floor((Date.now() - t0) / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
    upEl.textContent = h ? h + 'h ' + (m % 60) + 'm' : m ? m + 'm ' + (s % 60) + 's' : s + 's';
  }
  tick();
  setInterval(function () { if (document.body.contains(root) && root.offsetParent !== null) tick(); }, 1000);

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
  var PATHS = { all: '~/portfolio', seo: '~/portfolio/seo', wordpress: '~/portfolio/wordpress', webdev: '~/portfolio/web-dev', cert: '~/certifications' };
  function inCat(li, f) {
    var c = li.getAttribute('data-cat').split(' ');
    return f === 'all' ? true : c.indexOf(f) > -1;   // "All" lists every row (projects, then certs) so nothing hides behind a tab
  }
  cats.forEach(function (b) {
    var n = items.filter(function (li) { return inCat(li, b.getAttribute('data-filter')); }).length;
    b.querySelector('em').textContent = n;
  });
  var nProj = items.filter(function (li) { return li.getAttribute('data-cat').split(' ').indexOf('cert') < 0; }).length;
  $('#pt-count').textContent = nProj + ' projects, ' + (items.length - nProj) + ' certs';

  function applyFilter(f, scroll) {
    cats.forEach(function (b) {
      var on = b.getAttribute('data-filter') === f;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on);
    });
    pathEl.textContent = PATHS[f] || '~/portfolio';
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
    var b = e.target.closest('.pt-cat'); if (b && !busy) applyFilter(b.getAttribute('data-filter'), true);
  });
  root.addEventListener('keydown', function (e) {   // 1-5 pick a category while the app has focus
    if (busy || e.ctrlKey || e.metaKey || e.altKey) return;
    var b = cats[parseInt(e.key, 10) - 1]; if (b) { applyFilter(b.getAttribute('data-filter'), true); }
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
        var d = 34 + Math.random() * 46 + (text.charAt(i - 1) === ' ' ? 55 : 0);
        setTimeout(step, d);
      })();
    });
  }
  function line(html, cls) {
    var d = document.createElement('div'); if (cls) d.className = cls; d.innerHTML = html; out.appendChild(d);
    toBottom();
    return d;
  }
  function esc(s) { return s.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  async function launch(a) {
    if (busy) return;
    busy = true; root.classList.add('is-busy'); hidePreview(); closeInline();
    var id = a.getAttribute('data-open'), cmd = a.getAttribute('data-cmd'), isCert = id.indexOf('cert:') === 0;
    var title = a.querySelector('.pt-name').textContent;
    out.innerHTML = ''; typed.textContent = ''; run.hidden = false;
    toBottom();
    try {
      await typeText(isCert ? 'xdg-open ~/certifications/' + cmd + '.pdf' : './launch ' + cmd + ' --window');
      await sleep(120);
      line('<span class="ok"><b>ok</b></span> ' + (isCert ? 'locating certificate' : 'resolving ~/projects/' + esc(cmd)));
      await sleep(260);
      line('<span class="ok"><b>ok</b></span> ' + (isCert ? 'starting viewer' : 'allocating window') + '<span class="pt-bar"><i></i></span>');
      await sleep(700);
      line((isCert ? '▶ Opening ' : '▶ Launching ') + esc(title) + '…', 'go');
      await sleep(420);
      if (window.WindowManager && window.WindowManager.open) window.WindowManager.open(id);
      else window.open(a.getAttribute('href'), '_blank', 'noopener');
      await sleep(650);
    } finally {
      out.innerHTML = ''; typed.textContent = ''; run.hidden = true;
      busy = false; root.classList.remove('is-busy');
    }
  }
})();