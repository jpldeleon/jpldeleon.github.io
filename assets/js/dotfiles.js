/**
 * Hobbies & Interests (dotfiles) applet, Linux Mint menu style: a small popover above the
 * taskbar icon with a search entry on top, categories on the left, content on the right. Vanilla JS. Not a window app: it no
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
  const wrap = root.querySelector('.df-wrap');
  const esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* Font Awesome icon for a hobby, picked from keywords in its name (first match wins) */
  const HOB_ICONS = [
    [/linux|ubuntu|mint|arch\b|distro/i, 'fa-brands fa-linux'],
    [/android|lineage/i, 'fa-brands fa-android'],
    [/rom|firmware|flash|chip|embedded|arduino|raspberry/i, 'fa-solid fa-microchip'],
    [/hardware|pc build|\bpc\b|computer|troubleshoot|repair/i, 'fa-solid fa-computer'],
    [/open[- ]?source|foss|free (&|and) /i, 'fa-solid fa-code-branch'],
    [/llm|\bai\b|artificial|machine learning|model/i, 'fa-solid fa-robot'],
    [/ui\/?ux|design|ui\b|ux\b|graphic|art\b|draw|sketch/i, 'fa-solid fa-pen-ruler'],
    [/web|site|internet|browser|wordpress/i, 'fa-solid fa-globe'],
    [/cod(e|ing)|program|script|develop|learn/i, 'fa-solid fa-code'],
    [/news|emerging|trend|article|blog/i, 'fa-solid fa-newspaper'],
    [/desktop|custom|theme|rice|dotfile/i, 'fa-solid fa-desktop'],
    [/mobile|phone|smartphone|gadget/i, 'fa-solid fa-mobile-screen'],
    [/terminal|shell|cli\b|command/i, 'fa-solid fa-terminal'],
    [/server|self-?host|homelab|cloud/i, 'fa-solid fa-server'],
    [/network|wi-?fi|router/i, 'fa-solid fa-network-wired'],
    [/secur|privacy|vpn/i, 'fa-solid fa-shield-halved'],
    [/guitar/i, 'fa-solid fa-guitar'],
    [/music|song|playlist|band|listen/i, 'fa-solid fa-music'],
    [/game|gaming|esport|console/i, 'fa-solid fa-gamepad'],
    [/chess/i, 'fa-solid fa-chess'],
    [/movie|film|cinema|series|show|anime|watch/i, 'fa-solid fa-film'],
    [/book|read|novel|manga|comic/i, 'fa-solid fa-book-open'],
    [/photo|camera|video|film making|edit/i, 'fa-solid fa-camera'],
    [/travel|trip|explor|adventure|hik|road/i, 'fa-solid fa-earth-asia'],
    [/cook|food|bak|coffee|tea\b/i, 'fa-solid fa-utensils'],
    [/gym|fitness|workout|exercise|lift/i, 'fa-solid fa-dumbbell'],
    [/run|jog|cycl|bike|swim|sport|basketball|football|badminton/i, 'fa-solid fa-person-running'],
    [/3d|print|maker|diy|build/i, 'fa-solid fa-cube'],
    [/space|astronom|science|physics/i, 'fa-solid fa-rocket'],
    [/car|motor|drive/i, 'fa-solid fa-car-side'],
    [/pet|dog|cat\b/i, 'fa-solid fa-paw']
  ];
  const hobIcon = function (t) {
    for (let i = 0; i < HOB_ICONS.length; i++) if (HOB_ICONS[i][0].test(t)) return HOB_ICONS[i][1];
    return 'fa-solid fa-circle-dot';
  };

  /* launcher badges: every row gets a Font Awesome icon */
  panes.forEach(function (p) {
    Array.prototype.forEach.call(p.querySelectorAll('.df-list li'), function (li) {
      if (li.querySelector(':scope > i')) return;
      li.insertAdjacentHTML('afterbegin', '<i class="' + hobIcon(li.textContent.trim()) + '" aria-hidden="true"></i>');
    });
  });

  /* search entry: filters every category at once, like typing in the Mint menu */
  let input = null, results = null;
  if (wrap && view) {
    const bar = document.createElement('div');
    bar.className = 'df-search';
    bar.innerHTML = '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>' +
      '<input class="df-q" type="text" placeholder="Search hobbies" aria-label="Search hobbies and interests" autocomplete="off" spellcheck="false">';
    wrap.insertBefore(bar, wrap.firstChild);
    input = bar.querySelector('input');
    results = document.createElement('div');
    results.className = 'df-pane df-results';
    results.hidden = true;
    results.setAttribute('aria-live', 'polite');
    view.appendChild(results);
  }

  function current() {
    return tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
  }

  function search() {
    const q = input.value.trim().toLowerCase();
    root.classList.toggle('is-searching', !!q);
    if (!q) {
      results.hidden = true;
      const cur = current();
      panes.forEach(function (p) { p.hidden = !cur || p.id !== cur.getAttribute('aria-controls'); });
      return;
    }
    panes.forEach(function (p) { p.hidden = true; });
    let html = '', n = 0;
    tabs.forEach(function (t) {
      const p = document.getElementById(t.getAttribute('aria-controls'));
      if (!p) return;
      const hits = Array.prototype.filter.call(p.querySelectorAll('.df-list li'), function (li) {
        return li.textContent.toLowerCase().indexOf(q) > -1;
      });
      if (!hits.length) return;
      n += hits.length;
      html += '<p class="df-desc">' + esc(t.textContent.trim()) + '</p><ul class="df-list">' +
        hits.map(function (li) { const ic = li.querySelector(':scope > i'); return '<li><i class="' + esc(ic ? ic.className : hobIcon(li.textContent)) + '" aria-hidden="true"></i>' + esc(li.textContent.trim()) + '</li>'; }).join('') + '</ul>';
    });
    results.innerHTML = n ? html : '<p class="df-empty">Nothing matches \u201c' + esc(input.value.trim()) + '\u201d.</p>';
    results.hidden = false;
    view.scrollTop = 0;
  }

  function clearSearch() {
    if (!input || !input.value) return false;
    input.value = '';
    search();
    return true;
  }

  if (input) {
    input.addEventListener('input', search);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && clearSearch()) { e.stopPropagation(); e.preventDefault(); }   // first Esc clears, the next one closes the applet
      else if (e.key === 'ArrowDown') { e.preventDefault(); const cur = current(); if (cur) cur.focus(); }
    });
  }

  function select(tab, focus) {
    clearSearch();
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
        if (input) { input.focus({ preventScroll: true }); return; }   // like the Mint menu: opens with the search entry ready
        const cur = current();
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