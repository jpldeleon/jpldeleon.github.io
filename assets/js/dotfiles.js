/**
 * Hobbies & Interests: a tab inside the clock applet (#clock-popover).
 * Search entry on top, categories on the left, content on the right. Vanilla JS.
 * app.js owns open/close of the applet; this file wires the applet tab and the hobbies panes.
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
  const files = root.querySelector('.df-files');
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

  let syncArrows = function () {};
  if (files && files.parentNode) {
    const cats = document.createElement('div');
    cats.className = 'df-cats';
    const arrow = function (dir, icon, label) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'df-arrow';
      b.tabIndex = -1;
      b.setAttribute('aria-label', label);
      b.innerHTML = '<i class="fa-solid ' + icon + '" aria-hidden="true"></i>';
      b.addEventListener('click', function () {
        files.scrollBy({ left: dir * Math.max(120, files.clientWidth * 0.7), behavior: 'smooth' });
      });
      return b;
    };
    const prev = arrow(-1, 'fa-chevron-left', 'Scroll categories left');
    const next = arrow(1, 'fa-chevron-right', 'Scroll categories right');
    files.parentNode.insertBefore(cats, files);
    cats.appendChild(prev);
    cats.appendChild(files);
    cats.appendChild(next);
    syncArrows = function () {
      const max = files.scrollWidth - files.clientWidth;
      cats.classList.toggle('is-scrollable', max > 1);
      prev.disabled = files.scrollLeft <= 1;
      next.disabled = files.scrollLeft >= max - 1;
    };
    files.addEventListener('scroll', syncArrows, { passive: true });
    window.addEventListener('resize', syncArrows);
    if (window.ResizeObserver) new ResizeObserver(syncArrows).observe(files);
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
      if (e.key === 'Escape' && clearSearch()) { e.stopPropagation(); e.preventDefault(); }
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
    if (files) files.scrollTo({ left: tab.offsetLeft - (files.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' });
    if (focus) tab.focus({ preventScroll: true });
  }

  const hubTabs = Array.prototype.slice.call(document.querySelectorAll('.hub-tab'));
  const clockBtn = document.getElementById('panel-clock');
  const clockPop = document.getElementById('clock-popover');

  function hubSelect(tab, focus) {
    hubTabs.forEach(function (t) {
      const on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      const p = document.getElementById(t.getAttribute('aria-controls'));
      if (p) p.hidden = !on;
    });
    if (tab.id === 'hub-tab-hobbies' && input) input.focus({ preventScroll: true });
    else if (focus) tab.focus();
  }

  hubTabs.forEach(function (t, i) {
    t.addEventListener('click', function () { hubSelect(t, false); });
    t.addEventListener('keydown', function (e) {
      let n = i;
      if (e.key === 'ArrowRight') n = (i + 1) % hubTabs.length;
      else if (e.key === 'ArrowLeft') n = (i - 1 + hubTabs.length) % hubTabs.length;
      else return;
      e.preventDefault();
      hubSelect(hubTabs[n], true);
    });
  });

  if (clockBtn && clockPop) {
    clockBtn.addEventListener('click', function () {
      setTimeout(function () {
        if (clockPop.hidden || !input) return;
        const hob = document.getElementById('hub-tab-hobbies');
        if (hob && hob.getAttribute('aria-selected') === 'true') input.focus({ preventScroll: true });
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