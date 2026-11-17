/**
 * Hybrid Resume Viewer: section switching + Text / PDF tabs for the Resume window.
 * Vanilla JS. Load AFTER app.js (the window manager moves #resume into the window).
 *
 * Markup contract (see the #resume section in index.html):
 *   .rv-item[data-view][data-dir][data-file][data-meta]   sidebar entries (role="tab")
 *   .rv-view#rv-view-x                                    text panels
 *   .rv-mode[data-mode="text|pdf"]                        Text / PDF tabs
 *   .rv-scroll (text pane) / .rv-pdf (pdf pane)
 *   #rv-crumb-dir / #rv-crumb-file / #rv-meta             path bar
 *
 * Opens on Text. Clicking a section always goes to its text.
 *
 * Also owns the resume DOWNLOAD buttons (hero applet "Resume" + "Download CV"): they save the
 * PDF directly instead of opening the browser's PDF viewer. See DIRECT RESUME DOWNLOAD below.
 */
(function () {
  'use strict';

  /* ───────────────────────── DIRECT RESUME DOWNLOAD ─────────────────────────
   * Runs before the viewer's own guards below: the hero applet's button lives outside #resume.
   * The hero applet "Resume" button (.sidebar-cta) and the Resume window's
   * "Download CV" button (.btn-live) must SAVE the PDF, never show it in the
   * browser's PDF viewer. A plain <a download> is not enough in every browser /
   * webview, so the click is handled here: the PDF is fetched once (prefetched when
   * the browser is idle), kept as a Blob, and saved through a temporary download link.
   * That temporary link's click still reaches notifications.js, so the
   * "Resume download started" toast keeps working (the "#name.pdf" tail keeps its
   * .pdf match). If the fetch fails, it falls back to the plain download link. */
  (() => {
    if (!window.fetch || !window.URL || !URL.createObjectURL) return;
    const SEL = 'a.sidebar-cta[download], a.btn-live[download]';
    const cache = {};
    const load = url => cache[url] || (cache[url] = fetch(url, { credentials: 'same-origin' })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); })
      .then(b => URL.createObjectURL(new Blob([b], { type: 'application/pdf' }))));
    const nameOf = url => url.split('/').pop().split('?')[0] || 'resume.pdf';
    const save = (href, name) => {
      const a = document.createElement('a');
      a.href = href; a.download = name; a.hidden = true; a.setAttribute('data-direct-dl', '');
      document.body.appendChild(a); a.click(); a.remove();
    };

    document.addEventListener('click', e => {
      if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest(SEL);
      if (!a || a.hasAttribute('data-direct-dl')) return;
      e.preventDefault();
      const url = a.getAttribute('href'), name = nameOf(url);
      load(url).then(blobUrl => save(blobUrl + '#' + name, name))
        .catch(() => { delete cache[url]; save(url, name); });
    }, true);

    /* warm the cache so the first click saves instantly */
    const warm = () => document.querySelectorAll(SEL).forEach(a => load(a.getAttribute('href')).catch(() => {}));
    if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 3000 }); else setTimeout(warm, 1500);
  })();

  var root = document.getElementById('resume');
  if (!root || !root.classList.contains('rv')) return;

  var tabs = Array.prototype.slice.call(root.querySelectorAll('.rv-item[data-view]'));
  var views = Array.prototype.slice.call(root.querySelectorAll('.rv-view'));
  var modeBtns = Array.prototype.slice.call(root.querySelectorAll('.rv-mode[data-mode]'));
  var textPane = root.querySelector('.rv-scroll');
  var pdfPane = root.querySelector('.rv-pdf');
  var crumbDir = root.querySelector('#rv-crumb-dir');
  var crumbFile = root.querySelector('#rv-crumb-file');
  var meta = root.querySelector('#rv-meta');
  var tree = root.querySelector('.rv-tree');
  if (!tabs.length || !views.length || !textPane || !pdfPane) return;

  /* icon-only tabs on phones still need a name (screen readers + long-press tooltip) */
  tabs.forEach(function (t) {
    var n = t.getAttribute('data-label') || (t.querySelector('.rv-name') || {}).textContent || '';
    if (n && !t.getAttribute('aria-label')) { t.setAttribute('aria-label', n); t.title = n; }
  });

  var PDF_NAME = 'JohnPaulDeLeon.pdf';
  var state = { view: tabs[0].getAttribute('data-view'), mode: 'text' };

  function tabFor(name) {
    for (var i = 0; i < tabs.length; i++) if (tabs[i].getAttribute('data-view') === name) return tabs[i];
    return tabs[0];
  }

  /* Developer mode shows the terminal path (~/cv/profile.md); plain mode shows a readable label. */
  function isDev() { return document.documentElement.classList.contains('dev'); }

  function renderBar() {
    var t = tabFor(state.view), dev = isDev();
    if (state.mode === 'pdf') {
      if (crumbDir) crumbDir.textContent = dev ? '~/cv/' : '';
      if (crumbFile) crumbFile.textContent = dev ? PDF_NAME : 'Resume (PDF)';
      if (meta) meta.textContent = '1 page';
    } else {
      if (crumbDir) crumbDir.textContent = dev ? (t.getAttribute('data-dir') || '') : '';
      if (crumbFile) crumbFile.textContent = dev
        ? (t.getAttribute('data-file') || '')
        : (t.getAttribute('data-label') || t.getAttribute('data-file') || '');
      if (meta) meta.textContent = t.getAttribute('data-meta') || '';
    }
  }
  document.addEventListener('devmode:change', renderBar);

  function setMode(mode) {
    if (mode !== 'text' && mode !== 'pdf') return;
    state.mode = mode;
    modeBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-mode') === mode ? 'true' : 'false');
    });
    textPane.hidden = mode !== 'text';
    pdfPane.hidden = mode !== 'pdf';
    renderBar();
  }

  function show(name, opts) {
    opts = opts || {};
    var active = tabFor(name);
    state.view = active.getAttribute('data-view');

    tabs.forEach(function (t) {
      var on = t === active;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });

    views.forEach(function (v) { v.hidden = v.id !== 'rv-view-' + state.view; });
    textPane.scrollTop = 0;

    if (state.mode !== 'text') setMode('text');   // sections live in the Text tab
    else renderBar();

    if (opts.focus) active.focus();
    if (active.scrollIntoView && !opts.initial) {
      try { active.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* old browsers */ }
    }
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.preventDefault();
      show(t.getAttribute('data-view'));
    });
  });

  modeBtns.forEach(function (b) {
    b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); });
  });

  /* Keyboard: arrows move through the list, Home/End jump to the ends */
  if (tree) {
    tree.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var next = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      show(tabs[next].getAttribute('data-view'), { focus: true });
    });
  }

  show(state.view, { initial: true });
  setMode('text');
})();