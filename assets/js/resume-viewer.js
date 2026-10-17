/**
 * Resume viewer: section switching only (Profile, Experience, Skills, Education, Certifications).
 * Vanilla JS. Load AFTER app.js (the window manager moves #resume into the window).
 *
 * Markup contract:
 *   .rv-item[data-view][data-dir][data-file][data-meta]   sidebar entries (role="tab")
 *   .rv-view#rv-view-x                                    panels
 *   #rv-crumb-dir / #rv-crumb-file / #rv-meta             path bar
 */
(function () {
  'use strict';

  var root = document.getElementById('resume');
  if (!root || !root.classList.contains('rv')) return;

  var tabs = Array.prototype.slice.call(root.querySelectorAll('.rv-item[data-view]'));
  var views = Array.prototype.slice.call(root.querySelectorAll('.rv-view'));
  var scroller = root.querySelector('.rv-scroll');
  var crumbDir = root.querySelector('#rv-crumb-dir');
  var crumbFile = root.querySelector('#rv-crumb-file');
  var meta = root.querySelector('#rv-meta');
  var tree = root.querySelector('.rv-tree');
  if (!tabs.length || !views.length) return;

  function tabFor(name) {
    for (var i = 0; i < tabs.length; i++) if (tabs[i].getAttribute('data-view') === name) return tabs[i];
    return tabs[0];
  }

  function show(name, opts) {
    opts = opts || {};
    var active = tabFor(name);
    var view = active.getAttribute('data-view');

    tabs.forEach(function (t) {
      var on = t === active;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });

    if (crumbDir) crumbDir.textContent = active.getAttribute('data-dir') || '';
    if (crumbFile) crumbFile.textContent = active.getAttribute('data-file') || '';
    if (meta) meta.textContent = active.getAttribute('data-meta') || '';
    if (opts.focus) active.focus();
    if (active.scrollIntoView && !opts.initial) {
      try { active.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* old browsers */ }
    }

    views.forEach(function (v) { v.hidden = v.id !== 'rv-view-' + view; });
    if (scroller) scroller.scrollTop = 0;
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.preventDefault();
      show(t.getAttribute('data-view'));
    });
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

  show(tabs[0].getAttribute('data-view'), { initial: true });
})();