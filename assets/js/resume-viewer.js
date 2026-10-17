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
 */
(function () {
  'use strict';

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

  var PDF_NAME = 'JohnPaulDeLeon.pdf';
  var state = { view: tabs[0].getAttribute('data-view'), mode: 'text' };

  function tabFor(name) {
    for (var i = 0; i < tabs.length; i++) if (tabs[i].getAttribute('data-view') === name) return tabs[i];
    return tabs[0];
  }

  function renderBar() {
    var t = tabFor(state.view);
    if (state.mode === 'pdf') {
      if (crumbDir) crumbDir.textContent = '~/cv/';
      if (crumbFile) crumbFile.textContent = PDF_NAME;
      if (meta) meta.textContent = '1 page';
    } else {
      if (crumbDir) crumbDir.textContent = t.getAttribute('data-dir') || '';
      if (crumbFile) crumbFile.textContent = t.getAttribute('data-file') || '';
      if (meta) meta.textContent = t.getAttribute('data-meta') || '';
    }
  }

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