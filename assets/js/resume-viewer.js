/**
 * Hybrid Resume Viewer: section switching + Text / PDF modes for the Resume window.
 * Vanilla JS. Load AFTER app.js (the window manager moves #resume into the window).
 *
 * Markup contract (see the #resume section in index.html):
 *   #resume.rv[data-pdf="assets/resume.pdf"]
 *   .rv-item[data-view][data-dir][data-file][data-meta][data-page]   sidebar entries (role="tab")
 *   .rv-view#rv-view-x                                               text panels
 *   .rv-mode[data-mode="text|pdf"]                                   Text / PDF switch
 *   .rv-scroll (text pane) / .rv-pdf (pdf pane) / .rv-frame-host     panes
 *   #rv-crumb-dir / #rv-crumb-file / #rv-meta                        path bar
 *
 * data-page on each sidebar entry is the PDF page that section starts on.
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
  var frameHost = root.querySelector('.rv-frame-host');
  var crumbDir = root.querySelector('#rv-crumb-dir');
  var crumbFile = root.querySelector('#rv-crumb-file');
  var meta = root.querySelector('#rv-meta');
  var tree = root.querySelector('.rv-tree');
  if (!tabs.length || !views.length || !textPane || !pdfPane || !frameHost) return;

  var PDF = root.getAttribute('data-pdf') || 'assets/resume.pdf';

  var state = {
    view: tabs[0].getAttribute('data-view'),
    mode: 'text',
    frame: null,
    framePage: 0
  };

  function tabFor(name) {
    for (var i = 0; i < tabs.length; i++) if (tabs[i].getAttribute('data-view') === name) return tabs[i];
    return tabs[0];
  }

  function pageOf(tab) {
    var n = parseInt(tab.getAttribute('data-page'), 10);
    return n > 0 ? n : 1;
  }

  /* ---------- PDF pane ---------- */
  function pdfUrl(page) {
    return PDF + '#page=' + page + '&view=FitH&toolbar=0&navpanes=0';
  }

  function showFallback() {
    frameHost.innerHTML =
      '<div class="rv-fallback">' +
        '<i class="fa-regular fa-file-pdf" aria-hidden="true"></i>' +
        '<p>Your browser can\u2019t show PDFs inline.</p>' +
        '<div class="rv-fallback-btns">' +
          '<a class="btn-live" href="' + PDF + '" download><i class="fa-solid fa-download"></i> Download CV</a>' +
          '<a class="btn-github" href="' + PDF + '" target="_blank" rel="noopener">Open in new tab</a>' +
        '</div>' +
      '</div>';
    state.frame = null;
  }

  function loadPdf(page) {
    if (navigator.pdfViewerEnabled === false) { showFallback(); return; }
    if (state.frame && state.framePage === page) return;

    /* A fresh iframe is the one way to make every browser honour a new #page=
       (changing only the hash of an existing PDF frame is unreliable). */
    var f = document.createElement('iframe');
    f.className = 'rv-frame';
    f.title = 'CV (PDF)';
    f.setAttribute('loading', 'lazy');
    f.src = pdfUrl(page);
    frameHost.innerHTML = '';
    frameHost.appendChild(f);
    state.frame = f;
    state.framePage = page;
  }

  /* ---------- Path bar ---------- */
  function renderBar() {
    var t = tabFor(state.view);
    if (state.mode === 'pdf') {
      if (crumbDir) crumbDir.textContent = '~/cv/';
      if (crumbFile) crumbFile.textContent = PDF.split('/').pop();
      if (meta) meta.textContent = 'page ' + pageOf(t);
    } else {
      if (crumbDir) crumbDir.textContent = t.getAttribute('data-dir') || '';
      if (crumbFile) crumbFile.textContent = t.getAttribute('data-file') || '';
      if (meta) meta.textContent = t.getAttribute('data-meta') || '';
    }
  }

  /* ---------- Modes ---------- */
  function setMode(mode, byUser) {
    if (mode !== 'text' && mode !== 'pdf') return;
    state.mode = mode;

    modeBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-mode') === mode ? 'true' : 'false');
    });

    textPane.hidden = mode !== 'text';
    pdfPane.hidden = mode !== 'pdf';

    if (mode === 'pdf') loadPdf(pageOf(tabFor(state.view)));
    renderBar();
  }

  /* ---------- Sections ---------- */
  function show(name, opts) {
    opts = opts || {};
    var active = tabFor(name);
    state.view = active.getAttribute('data-view');

    tabs.forEach(function (t) {
      var on = t === active;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on) {
        if (opts.focus) t.focus();
        if (t.scrollIntoView && !opts.initial) {
          try { t.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* old browsers */ }
        }
      }
    });

    views.forEach(function (v) { v.hidden = v.id !== 'rv-view-' + state.view; });
    textPane.scrollTop = 0;

    if (state.mode === 'pdf') loadPdf(pageOf(active));
    renderBar();
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.preventDefault();
      show(t.getAttribute('data-view'));
    });
  });

  modeBtns.forEach(function (b) {
    b.addEventListener('click', function () { setMode(b.getAttribute('data-mode'), true); });
  });

  /* Keyboard: arrows move through the tree, Home/End jump to the ends */
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

  /* Links elsewhere on the site can deep-link to a section: <a data-app="resume" data-resume-view="experience"> */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-resume-view]');
    if (!a) return;
    show(a.getAttribute('data-resume-view'));
  });

  /* ---------- Default mode ----------
     Always opens on Text. The visitor can switch to PDF, and the choice is kept
     for as long as the window stays on the page. */
  show(state.view, { initial: true });
  setMode('text', false);
})();