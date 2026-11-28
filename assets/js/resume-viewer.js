/**
 * Hybrid Resume Viewer: section switching + Text / PDF tabs for the Resume window.
 * Vanilla JS. Load AFTER app.js (the window manager moves #resume into the window).
 *
 * Markup contract (see the #resume section in index.html):
 *   .rv-item[data-view][data-dir][data-file][data-meta]   sidebar entries (role="tab")
 *   .rv-view#rv-view-x                                    text panels
 *   .rv-mode[data-mode="text|pdf"]                        Text / PDF buttons (in the sidebar, next to Download CV)
 *   .rv-scroll (text pane) / .rv-pdf (pdf pane)
 *   #rv-crumb-dir / #rv-crumb-file / #rv-meta             path bar
 *
 * The Text tab is one long page (Profile down to Certifications). The sidebar is its navigation:
 * clicking a section scrolls to it, and the highlight follows you as you scroll. Opens on Text.
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
   * "Resume download started" notification keeps working (the "#name.pdf" tail keeps its
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

  /* TOOLS section: the catalogue that used to open from the hero applet's App Manager.
     Built from window.ToolboxManager.tools (so toolbox.js must load BEFORE this file).
     Shows icon + name only, grouped by category. Adds a "Tools" entry to the sidebar and a view to the text page. */
  (function () {
    var TM = window.ToolboxManager, list = TM && TM.tools;
    if (!list || !list.length || root.querySelector('#rv-view-tools')) return;
    var tplTab = root.querySelector('.rv-item[data-view]'), allViews = root.querySelectorAll('.rv-view');
    /* placed right after Skills (falls back to the end if there is no Skills section) */
    var lastTab = root.querySelector('.rv-item[data-view="skills"]') || Array.prototype.slice.call(root.querySelectorAll('.rv-item[data-view]')).pop();
    var lastView = root.querySelector('#rv-view-skills') || allViews[allViews.length - 1];
    if (!tplTab || !lastView || !lastTab) return;

    var tab = tplTab.cloneNode(true);
    tab.removeAttribute('id');
    tab.setAttribute('data-view', 'tools');
    tab.setAttribute('data-dir', '~/cv/');
    tab.setAttribute('data-file', 'tools.md');
    tab.setAttribute('data-label', 'Tools');
    tab.setAttribute('data-meta', list.length + ' tools');
    tab.setAttribute('aria-selected', 'false');
    tab.tabIndex = -1;
    if (tab.hasAttribute('aria-controls')) tab.setAttribute('aria-controls', 'rv-view-tools');
    tab.removeAttribute('aria-label');
    var ti = tab.querySelector('i'); if (ti) ti.className = 'fa-solid fa-toolbox';
    var tn = tab.querySelector('.rv-name'); if (tn) tn.textContent = 'Tools';
    var tc = tab.querySelector('.rv-count'); if (tc) tc.textContent = String(list.length);
    lastTab.parentNode.insertBefore(tab, lastTab.nextSibling);

    var view = lastView.cloneNode(false);
    view.id = 'rv-view-tools';
    view.hidden = false;
    var h = document.createElement('h3'); h.className = 'rv-h'; h.textContent = 'Tools';
    view.appendChild(h);
    var sub = document.createElement('p'); sub.className = 'rv-sub'; sub.textContent = 'Software I use, grouped by area.';
    view.appendChild(sub);

    var cats = [];
    list.forEach(function (t) { if (cats.indexOf(t.cat) < 0) cats.push(t.cat); });
    cats.forEach(function (cat) {
      var group = document.createElement('div'); group.className = 'rv-tool-group';
      var gh = document.createElement('h3'); gh.className = 'rv-tool-cat'; gh.textContent = cat;
      var ul = document.createElement('ul'); ul.className = 'rv-tools';
      list.filter(function (t) { return t.cat === cat; }).forEach(function (t) {
        var li = document.createElement('li'); li.className = 'rv-tool';
        var ic = document.createElement('i'); ic.className = t.ic[0]; ic.setAttribute('aria-hidden', 'true');
        ic.setAttribute('data-fb', t.ic.slice(1).join('|'));
        var nm = document.createElement('span'); nm.textContent = t.name;
        li.appendChild(ic); li.appendChild(nm); ul.appendChild(li);
      });
      group.appendChild(gh); group.appendChild(ul); view.appendChild(group);
    });
    lastView.parentNode.insertBefore(view, lastView.nextSibling);

    /* an icon missing from the loaded Font Awesome draws nothing: walk down the fallback list (same idea as toolbox.js) */
    function fixIcons() {
      view.querySelectorAll('i[data-fb]').forEach(function (i) {
        if (!i.getClientRects().length) return;           /* not on screen yet: try again later */
        var rest = i.getAttribute('data-fb').split('|').filter(Boolean); i.removeAttribute('data-fb');
        while (i.getBoundingClientRect().width === 0 && rest.length) i.className = rest.shift();
        if (i.getBoundingClientRect().width === 0) { i.className = ''; i.textContent = '\u25C8'; }
      });
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        if (en.some(function (e) { return e.isIntersecting; })) { fixIcons(); if (!view.querySelector('i[data-fb]')) io.disconnect(); }
      });
      io.observe(view);
    } else { setTimeout(fixIcons, 800); }
  })();

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

  /* typed subtitle on the Profile page: rotates through data-items (split on "|").
     Plain text if Typed.js is missing or the person prefers reduced motion. */
  (function () {
    var el = root.querySelector('.rv-typed-text');
    if (!el) return;
    var items = (el.getAttribute('data-items') || '').split('|').filter(Boolean);
    if (!items.length) return;
    el.textContent = items[0];
    if (typeof Typed === 'undefined') return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    new Typed(el, { strings: items, typeSpeed: 70, backSpeed: 35, backDelay: 1800, startDelay: 400, loop: true });
  })();

  /* icon-only tabs on phones still need a name (screen readers + long-press tooltip) */
  tabs.forEach(function (t) {
    var n = t.getAttribute('data-label') || (t.querySelector('.rv-name') || {}).textContent || '';
    if (n && !t.getAttribute('aria-label')) { t.setAttribute('aria-label', n); t.title = n; }
  });

  var PDF_NAME = 'JohnPaulDeLeon.pdf';
  var state = { view: tabs[0].getAttribute('data-view'), mode: 'text' };
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var savedScroll = 0;      // text pane position, kept while the PDF tab is open
  var lockUntil = 0;        // the scroll-spy waits while a nav click is still scrolling

  /* the Text tab is one long page: every section is shown, the sidebar is its navigation */
  views.forEach(function (v) { v.hidden = false; });

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

  /* highlight one section in the sidebar (no scrolling of the page) */
  function setActive(name) {
    var active = tabFor(name);
    state.view = active.getAttribute('data-view');
    tabs.forEach(function (t) {
      var on = t === active;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    renderBar();
    return active;
  }

  function setMode(mode) {
    if (mode !== 'text' && mode !== 'pdf') return;
    if (mode === state.mode) return;
    if (state.mode === 'text') savedScroll = textPane.scrollTop;
    state.mode = mode;
    modeBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-mode') === mode ? 'true' : 'false');
    });
    textPane.hidden = mode !== 'text';
    pdfPane.hidden = mode !== 'pdf';
    if (mode === 'text') { textPane.scrollTop = savedScroll; spy(); }
    renderBar();
  }

  /* scroll the text pane so a section starts at the top */
  function goTo(name, opts) {
    opts = opts || {};
    var active = setActive(name);
    if (state.mode !== 'text') setMode('text');
    var target = document.getElementById('rv-view-' + state.view);
    if (target) {
      var pad = parseFloat(getComputedStyle(textPane).paddingTop) || 0;
      var top = textPane.scrollTop + target.getBoundingClientRect().top - textPane.getBoundingClientRect().top - pad;
      var smooth = !reduceMotion && !opts.initial;
      lockUntil = Date.now() + (smooth ? 700 : 0);
      textPane.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto' });
    }
    if (opts.focus) active.focus();
    if (active.scrollIntoView && !opts.initial) {
      try { active.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* old browsers */ }
    }
  }

  /* scroll-spy: the sidebar follows whatever section is at the top of the pane */
  var spyQueued = false;
  function spy() {
    spyQueued = false;
    if (state.mode !== 'text' || textPane.hidden || Date.now() < lockUntil) return;
    var paneTop = textPane.getBoundingClientRect().top + (parseFloat(getComputedStyle(textPane).paddingTop) || 0);
    var current = views[0];
    for (var i = 0; i < views.length; i++) {
      if (views[i].getBoundingClientRect().top - paneTop <= 48) current = views[i];
    }
    if (textPane.scrollTop + textPane.clientHeight >= textPane.scrollHeight - 2) current = views[views.length - 1];
    var name = current.id.replace('rv-view-', '');
    if (name !== state.view) {
      var active = setActive(name);
      if (active.scrollIntoView) {
        try { active.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* old browsers */ }
      }
    }
  }
  textPane.addEventListener('scroll', function () {
    if (spyQueued) return;
    spyQueued = true;
    requestAnimationFrame(spy);
    if (lockUntil > Date.now()) setTimeout(spy, lockUntil - Date.now() + 30);
  }, { passive: true });

  tabs.forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.preventDefault();
      goTo(t.getAttribute('data-view'));
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
      goTo(tabs[next].getAttribute('data-view'), { focus: true });
    });
  }

  goTo(state.view, { initial: true });
})();