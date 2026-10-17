/**
 * Project Inspector: view switching for project pages.
 * Vanilla JS. Load AFTER main.js. No dependencies.
 *
 * Markup contract:
 *   .pi-item[data-view="x"][data-dir][data-file][data-meta]  (sidebar entries)
 *   .pi-view#view-x                                          (panels)
 *   #pi-crumb-dir / #pi-crumb-file / #pi-meta                (path bar)
 */
(function () {
  'use strict';

  var root = document.documentElement;
  try {
    if (/[?&]embed=1(&|$)/.test(location.search)) root.classList.add('pi-embed');
  } catch (e) { /* ignore */ }

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.pi-item[data-view]'));
  var views = Array.prototype.slice.call(document.querySelectorAll('.pi-view'));
  var scroller = document.querySelector('.pi-scroll');
  var crumbDir = document.getElementById('pi-crumb-dir');
  var crumbFile = document.getElementById('pi-crumb-file');
  var meta = document.getElementById('pi-meta');
  if (!tabs.length || !views.length) return;

  var DEFAULT_VIEW = tabs[0].getAttribute('data-view');

  /* Old anchors from the previous layout keep working as deep links */
  var ALIAS = {
    'video': 'walkthrough',
    'portfolio-details': 'walkthrough',
    'details': 'overview',
    'project-screenshots': 'gallery'
  };

  function resolve(name) {
    name = (name || '').replace(/^#/, '');
    name = ALIAS[name] || name;
    return tabs.some(function (t) { return t.getAttribute('data-view') === name; }) ? name : DEFAULT_VIEW;
  }

  function show(name, opts) {
    opts = opts || {};
    name = resolve(name);

    tabs.forEach(function (t) {
      var on = t.getAttribute('data-view') === name;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on) {
        if (crumbDir) crumbDir.textContent = t.getAttribute('data-dir') || '';
        if (crumbFile) crumbFile.textContent = t.getAttribute('data-file') || '';
        if (meta) meta.textContent = t.getAttribute('data-meta') || '';
        if (opts.focus) t.focus();
        if (t.scrollIntoView && !opts.initial) {
          try { t.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* old browsers */ }
        }
      }
    });

    views.forEach(function (v) {
      v.hidden = v.id !== 'view-' + name;
    });

    if (scroller) scroller.scrollTop = 0;

    if (opts.push) {
      try { history.replaceState(null, '', '#' + name); } catch (e) { /* sandboxed */ }
    }
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.preventDefault();
      show(t.getAttribute('data-view'), { push: true });
    });
  });

  /* Keyboard: arrows move through the tree, Home/End jump to the ends */
  document.querySelector('.pi-tree').addEventListener('keydown', function (e) {
    var i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    var next = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    show(tabs[next].getAttribute('data-view'), { push: true, focus: true });
  });

  /* Links inside the page that point at a view (e.g. "View all") */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-goto]');
    if (!a) return;
    e.preventDefault();
    show(a.getAttribute('data-goto'), { push: true });
  });

  /* Gallery filters: chips carry data-filter="*" or a class selector such as ".filter-seo";
     tiles carry the matching class. Only the gallery grid is filtered. */
  var chips = Array.prototype.slice.call(document.querySelectorAll('.pi-filter[data-filter]'));
  if (chips.length) {
    var gridTiles = Array.prototype.slice.call(document.querySelectorAll('#project-screenshots .pi-thumb'));
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.getAttribute('data-filter');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        gridTiles.forEach(function (t) { t.hidden = !(f === '*' || t.matches(f)); });
        if (scroller) scroller.scrollTop = 0;
      });
    });
  }

  window.addEventListener('hashchange', function () { show(location.hash); });

  show(location.hash, { initial: true });
})();