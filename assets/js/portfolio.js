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
})();
