/*--------------------------------------------------------------
# Contact & Socials: small extras only.
#   - Copying and the toast are handled by the existing
#     .js-copy-trigger / .copy-toast code in main.js.
#   - 1. briefly swaps the copy icon for a check mark
#   - 2. renames the window "Socials" -> "Contact & Socials"
--------------------------------------------------------------*/
(function () {
  'use strict';

  /* ---------- 1. check-mark flash on the copy button ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.sc .sc-copy, .sc .sc-main.js-copy-trigger');
    if (!btn) return;
    btn.classList.add('is-copied');
    setTimeout(function () { btn.classList.remove('is-copied'); }, 1400);
  });

  /* ---------- 2. rename "Socials" -> "Contact & Socials" ----------
     The clean fix is the one string in app.js (search for 'Socials').
     Until then this renames the window title, dock and taskbar labels.
     Safe to delete once app.js says "Contact & Socials". */
  var OLD = 'Socials';
  var NEW = 'Contact & Socials';

  function swapText(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = walker.nextNode())) {
      if (n.nodeValue.trim() === OLD) n.nodeValue = n.nodeValue.replace(OLD, NEW);
    }
  }
  function swapAttrs(root) {
    var list = root.querySelectorAll('[title],[aria-label]');
    for (var i = 0; i < list.length; i++) {
      ['title', 'aria-label'].forEach(function (a) {
        if (list[i].getAttribute(a) === OLD) list[i].setAttribute(a, NEW);
      });
    }
  }
  /* ---------- 3. sharper profile photo (desktop only) ----------
     The Socials avatar can be a small thumbnail, which looks soft once it is cropped into the circle.
     Reuse the photo the hero card already shows (same picture, full size). No-op if it isn't found. */
  var desktopMQ = window.matchMedia('(min-width: 769px)');
  function sharpenAvatar() {
    if (!desktopMQ.matches) return;
    var hero = document.querySelector('#hero .sidebar-avatar img, .sidebar-avatar img');
    var big = hero && (hero.currentSrc || hero.src);
    if (!big) return;
    var imgs = document.querySelectorAll('section.sc .sc-avatar');
    for (var k = 0; k < imgs.length; k++) {
      var img = imgs[k];
      if (img.dataset.hires === big) continue;
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.loading = 'eager';
      img.decoding = 'async';
      img.src = big;
      img.dataset.hires = big;
    }
  }

  function rename() {
    sharpenAvatar();
    var wins = document.querySelectorAll('.wm-window');
    for (var i = 0; i < wins.length; i++) {
      if (!wins[i].querySelector('section.sc')) continue;
      var t = wins[i].querySelector('.wm-title');
      if (t) { swapText(t); swapAttrs(wins[i]); }
    }
    var bars = document.querySelectorAll('.linux-dock, [class*="taskbar"], [id*="taskbar"], #app-menu');
    for (var j = 0; j < bars.length; j++) { swapText(bars[j]); swapAttrs(bars[j]); }
  }

  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; rename(); });
  }
  function start() {
    rename();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();