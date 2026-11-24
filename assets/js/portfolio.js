/**
 * Projects window: filter chips (All / SEO / WordPress / Web Dev / Certificates).
 * The cards are plain links (also data-app buttons for app.js), so they work without this file;
 * this only shows / hides them. Load anywhere after the #portfolio section.
 */
(function () {
  'use strict';
  var root = document.getElementById('portfolio');
  if (!root || !root.classList.contains('pj')) return;

  var chips = Array.prototype.slice.call(root.querySelectorAll('.pj-chip'));
  var cards = Array.prototype.slice.call(root.querySelectorAll('.pj-card'));

  function apply(filter) {
    chips.forEach(function (c) {
      c.setAttribute('aria-pressed', c.getAttribute('data-filter') === filter ? 'true' : 'false');
    });
    cards.forEach(function (card) {
      var cats = (card.getAttribute('data-cats') || '').split(' ');
      card.hidden = !(filter === 'all' || cats.indexOf(filter) > -1);
    });
  }

  chips.forEach(function (c) {
    c.addEventListener('click', function () { apply(c.getAttribute('data-filter')); });
  });

  /* Hover preview: a small screenshot next to the cursor instead of a glowing border.
     Image source, in order: card[data-shot], an <img> inside the card. */
  var peek = document.createElement('div');
  peek.className = 'pj-peek';
  peek.setAttribute('aria-hidden', 'true');
  document.body.appendChild(peek);

  function shotOf(card) {
    var src = card.getAttribute('data-shot');
    if (src) return src;
    var img = card.querySelector('img');
    return img ? (img.currentSrc || img.src) : '';
  }

  function place(e) {
    var w = peek.offsetWidth || 220, h = peek.offsetHeight || 138, pad = 16;
    var x = e.clientX + pad, y = e.clientY + pad;
    if (x + w > window.innerWidth - 8) x = e.clientX - w - pad;
    if (y + h > window.innerHeight - 8) y = e.clientY - h - pad;
    peek.style.left = Math.max(8, x) + 'px';
    peek.style.top = Math.max(8, y) + 'px';
  }

  cards.forEach(function (card) {
    card.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'touch') return;
      var src = shotOf(card);
      if (!src) return;
      peek.style.backgroundImage = 'url("' + src.replace(/"/g, '%22') + '")';
      place(e);
      peek.classList.add('is-on');
    });
    card.addEventListener('pointermove', function (e) { if (peek.classList.contains('is-on')) place(e); });
    card.addEventListener('pointerleave', function () { peek.classList.remove('is-on'); });
  });
})();