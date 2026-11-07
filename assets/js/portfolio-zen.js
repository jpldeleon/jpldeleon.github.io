/**
 * Portfolio (Zen-browser style)
 * Vertical tabs on the left (Home, one tab per project, one per certificate) and a floating page pane
 * on the right with a compact address bar. Selecting a project tab loads that project inside the pane.
 * The active tab's label gets its category in front, e.g. "SEO - NothingTechBlob".
 *
 * Pages are embedded with WindowManager.embed (same iframe, embed CSS, theme sync and
 * screenshot windows as a normal project window). Load AFTER app.js.
 */
(function () {
  'use strict';
  var root = document.getElementById('portfolio');
  if (!root || !root.classList.contains('zn')) return;

  var $ = function (s) { return root.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };

  var tabs = $$('.zn-tab');
  var view = $('#zn-view');
  var urlEl = $('#zn-url');
  var reloadBtn = $('#zn-reload');
  var openBtn = $('#zn-open');
  var sideBtn = $('#zn-side-toggle');
  if (!tabs.length || !view) return;

  var CATS = { seo: 'SEO', wordpress: 'WordPress', webdev: 'Web Dev', cert: 'Certification' };
  var panels = { home: $('#zn-panel-home') };
  var current = 'home';

  /* ---------- category prefix on every project / certificate tab (shown only on the active one by CSS) ---------- */
  tabs.forEach(function (t) {
    var cat = CATS[t.getAttribute('data-cat') || ''];
    var label = t.querySelector('.zn-tab-label');
    if (!cat || !label) return;
    var c = document.createElement('span');
    c.className = 'zn-tab-cat';
    c.textContent = cat + ' - ';
    label.insertBefore(c, label.firstChild);
    t.setAttribute('data-full-title', cat + ' - ' + (t.getAttribute('data-title') || ''));
  });

  /* ---------- helpers ---------- */
  function absUrl(tab) {
    var href = tab.getAttribute('href');
    if (!href) return '';
    try { return new URL(href, document.baseURI).href; } catch (e) { return href; }
  }

  function setUrlBar(tab) {
    urlEl.textContent = '';
    var href = tab && absUrl(tab), host, path = '';
    try {
      var u = new URL(href || location.href);
      host = u.host;
      path = (href ? u.pathname.replace(/index\.html$/, '') : '') || '';
    } catch (e) { host = location.host; }
    var h = document.createElement('span'); h.className = 'zn-url-host'; h.textContent = host;
    urlEl.appendChild(h);
    if (path && path !== '/') {
      var p = document.createElement('span'); p.className = 'zn-url-path'; p.textContent = path;
      urlEl.appendChild(p);
    }
  }

  function mountProject(panel, url, title) {
    if (window.WindowManager && window.WindowManager.embed) return window.WindowManager.embed(panel, url, title);
    var f = document.createElement('iframe');                      // fallback if app.js is unavailable
    f.className = 'wm-frame is-ready';
    f.title = title;
    f.src = url + (url.indexOf('?') > -1 ? '&' : '?') + 'embed=1';
    panel.appendChild(f);
    return f;
  }

  function buildPanel(tab) {
    var id = tab.getAttribute('data-tab'), title = tab.getAttribute('data-full-title') || tab.getAttribute('data-title') || '';
    var panel = document.createElement('div');
    panel.className = 'zn-panel';
    panel.id = 'zn-panel-' + id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-label', title);
    if (tab.getAttribute('data-kind') === 'cert') {
      panel.classList.add('zn-cert');
      var img = document.createElement('img');
      img.alt = title; img.src = tab.getAttribute('href'); img.draggable = false;
      panel.appendChild(img);
    } else {
      panel.classList.add('zn-page');
      panel._frame = mountProject(panel, absUrl(tab), tab.getAttribute('data-title') || title);
    }
    view.appendChild(panel);
    panels[id] = panel;
    return panel;
  }

  /* ---------- select a tab ---------- */
  function select(tab, opts) {
    var id = tab.getAttribute('data-tab');
    current = id;
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      t.classList.toggle('is-active', on);
    });
    var panel = panels[id] || buildPanel(tab);
    Object.keys(panels).forEach(function (k) { panels[k].hidden = k !== id; });
    panel.hidden = false;

    var isHome = id === 'home';
    setUrlBar(isHome ? null : tab);
    reloadBtn.disabled = !panel._frame;
    openBtn.disabled = isHome;
    openBtn.setAttribute('data-href', isHome ? '' : absUrl(tab));

    if (opts && opts.focus) tab.focus();
    if (tab.scrollIntoView) { try { tab.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* old browsers */ } }
  }

  var tabList = root.querySelector('.zn-side');
  tabList.addEventListener('click', function (e) {
    var t = e.target.closest('.zn-tab');
    if (!t) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;   // let the browser open the real link
    e.preventDefault();
    select(t);
  });

  /* keyboard: arrows move through the tabs, Home / End jump to the ends */
  tabList.addEventListener('keydown', function (e) {
    var i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    var n = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (i + 1) % tabs.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = tabs.length - 1;
    if (n === null) return;
    e.preventDefault();
    select(tabs[n], { focus: true });
  });

  /* ---------- toolbar ---------- */
  reloadBtn.addEventListener('click', function () {
    var f = panels[current] && panels[current]._frame;
    if (!f) return;
    try { f.contentWindow.location.reload(); } catch (e) { f.src = f.src; }
  });
  openBtn.addEventListener('click', function () {
    var href = openBtn.getAttribute('data-href');
    if (href) window.open(href, '_blank', 'noopener');
  });

  function setCompact(c, persist) {
    root.classList.toggle('is-compact', c);
    sideBtn.setAttribute('aria-pressed', c ? 'true' : 'false');
    var label = c ? 'Expand sidebar' : 'Collapse sidebar';
    sideBtn.title = label; sideBtn.setAttribute('aria-label', label);
    if (persist) { try { localStorage.setItem('zn-compact', c ? '1' : '0'); } catch (e) { /* storage blocked */ } }
  }
  sideBtn.addEventListener('click', function () { setCompact(!root.classList.contains('is-compact'), true); });
  try { setCompact(localStorage.getItem('zn-compact') === '1', false); } catch (e) { /* storage blocked */ }

  /* ---------- start on Home ---------- */
  select(tabs.filter(function (t) { return t.getAttribute('data-tab') === 'home'; })[0] || tabs[0]);
})();
