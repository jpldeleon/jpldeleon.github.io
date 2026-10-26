/**
 * Hobbies & Interests (dotfiles) applet: a small popover under the top-panel icon,
 * file list on the left, content on the right. Vanilla JS. Not a window app: it no
 * longer goes through app.js, app.js owns open/close; this file wires the two panes.
 */
(function () {
  'use strict';

  const root = document.getElementById('dotfiles');
  if (!root || root.dataset.dfReady) return;
  root.dataset.dfReady = '1';

  const tabs = Array.prototype.slice.call(root.querySelectorAll('.df-file'));
  const panes = Array.prototype.slice.call(root.querySelectorAll('.df-pane'));
  const view = root.querySelector('.df-view');

  function select(tab, focus) {
    tabs.forEach(function (t) {
      const on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    panes.forEach(function (p) { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
    if (view) view.scrollTop = 0;
    if (focus) tab.focus();
  }

  /* Open/close, outside click and Escape are handled by app.js initPanel()
     (the applet is a .panel-menu with a .panel-popover). Here we only move focus
     to the active file when the popover opens. */
  const btn = document.getElementById('panel-dotfiles-btn');
  const pop = document.getElementById('df-pop');
  if (btn && pop) {
    btn.addEventListener('click', function () {
      setTimeout(function () {
        if (pop.hidden) return;
        const cur = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
        if (cur) cur.focus({ preventScroll: true });
      }, 0);
    });
  }

  root.addEventListener('click', function (e) {
    const t = e.target.closest('.df-file');
    if (t) select(t, false);
  });

  /* arrow keys / Home / End move through the file list */
  root.addEventListener('keydown', function (e) {
    const cur = e.target.closest('.df-file');
    if (!cur) return;
    let i = tabs.indexOf(cur);
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') i = (i + 1) % tabs.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') i = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = tabs.length - 1;
    else return;
    e.preventDefault();
    select(tabs[i], true);
  });
})();