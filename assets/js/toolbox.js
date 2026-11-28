/*!
 * toolbox.js: the tools catalog, styled after the Linux Mint Update Manager.
 *   desktop -> a compact taskbar applet: an icon beside the theme button opens a popover above the taskbar
 *   icons   -> Font Awesome (brand icon where one exists, a look-alike solid icon otherwise; t.i / t.f)
 *   phone   -> a bubble sheet (android.js / adrBubbles), opened from the icon in the notification shade
 * Public API (unchanged): window.ToolboxManager = { open, close, toggle, tools }
 * Any element with [data-toolbox-open] opens it.
 */
(() => {
  'use strict';

  const TOOLS = [
    {name:'Google Search Console',cat:'SEO & Analytics',desc:'Search performance and indexing insights; reporting workflows are still developing.',level:'Developing',ic:['fa-brands fa-google','fa-solid fa-magnifying-glass-chart','fa-solid fa-magnifying-glass']},
    {name:'Google Analytics 4',cat:'SEO & Analytics',desc:'Hands-on setup and tracking configuration; report building is still developing.',level:'Hands-on setup',ic:['fa-solid fa-chart-simple','fa-solid fa-chart-column','fa-solid fa-chart-bar']},
    {name:'Google Tag Manager',cat:'SEO & Analytics',desc:'Configure tags, triggers and variables for measurement.',level:'Hands-on',ic:['fa-solid fa-tags','fa-solid fa-tag','fa-solid fa-code']},
    {name:'Screaming Frog SEO Spider',cat:'SEO & Analytics',desc:'Website crawling, technical SEO analysis and crawl-based reporting.',level:'Hands-on',ic:['fa-solid fa-frog','fa-solid fa-spider','fa-solid fa-bug']},
    {name:'Ahrefs',cat:'SEO & Analytics',desc:'Backlink analysis, domain metrics, keyword and competitor research.',level:'Used',ic:['fa-solid fa-link','fa-solid fa-share-nodes','fa-solid fa-chart-line']},
    {name:'SEMrush',cat:'SEO & Analytics',desc:'SEO research workflows including keywords, backlinks and competitors.',level:'Used',ic:['fa-solid fa-magnifying-glass-chart','fa-solid fa-chart-line','fa-solid fa-magnifying-glass']},
    {name:'Moz',cat:'SEO & Analytics',desc:'SEO research using domain metrics, backlink and keyword analysis.',level:'Used',ic:['fa-solid fa-arrow-trend-up','fa-solid fa-chart-line','fa-solid fa-signal']},
    {name:'RustySEO',cat:'SEO & Analytics',desc:'SEO analysis and research workflows.',level:'Used',ic:['fa-brands fa-rust','fa-solid fa-screwdriver-wrench','fa-solid fa-wrench']},
    {name:'Sitebulb',cat:'SEO & Analytics',desc:'Familiar with its website auditing and visualization workflows.',level:'Familiar',ic:['fa-solid fa-sitemap','fa-solid fa-diagram-project','fa-solid fa-network-wired']},
    {name:'Google Keyword Planner',cat:'SEO & Analytics',desc:'Keyword discovery and search-demand research.',level:'Used',ic:['fa-solid fa-key','fa-solid fa-lightbulb','fa-solid fa-magnifying-glass']},
    {name:'Looker Studio',cat:'SEO & Analytics',desc:'Dashboard and reporting fundamentals covered in training; no hands-on reporting project yet.',level:'Training',ic:['fa-solid fa-chart-pie','fa-solid fa-chart-area','fa-solid fa-chart-bar']},
    {name:'PageSpeed Insights',cat:'SEO & Analytics',desc:'Page performance insights and Core Web Vitals checks.',level:'Used',ic:['fa-solid fa-gauge-high','fa-solid fa-gauge','fa-solid fa-bolt']},
    {name:'Lighthouse',cat:'SEO & Analytics',desc:'Performance, accessibility and SEO audits.',level:'Used',ic:['fa-solid fa-lightbulb','fa-solid fa-gauge-high','fa-solid fa-bolt']},
    {name:'GTmetrix',cat:'SEO & Analytics',desc:'Performance testing and page-load diagnostics.',level:'Used',ic:['fa-solid fa-stopwatch','fa-solid fa-gauge-simple','fa-solid fa-clock']},
    {name:'Rich Results Test',cat:'SEO & Analytics',desc:'Validate structured data eligibility and markup issues.',level:'Used',ic:['fa-solid fa-star','fa-solid fa-award','fa-solid fa-circle-check']},
    {name:'Schema Markup Validator',cat:'SEO & Analytics',desc:'Inspect and validate schema markup.',level:'Used',ic:['fa-solid fa-file-code','fa-solid fa-code','fa-solid fa-sitemap']},
    {name:'WordPress',cat:'Web Development & CMS',desc:'Website development, customization and CMS management.',level:'Hands-on',ic:['fa-brands fa-wordpress','fa-brands fa-wordpress-simple','fa-solid fa-globe']},
    {name:'LocalWP',cat:'Web Development & CMS',desc:'Local WordPress development and testing environments.',level:'Hands-on',ic:['fa-solid fa-laptop-code','fa-solid fa-server','fa-solid fa-desktop']},
    {name:'Elementor',cat:'Web Development & CMS',desc:'WordPress page building and layout customization.',level:'Used',ic:['fa-brands fa-elementor','fa-solid fa-pen-ruler','fa-solid fa-table-cells-large']},
    {name:'Yoast SEO',cat:'Web Development & CMS',desc:'WordPress SEO configuration and on-page optimization.',level:'Used',ic:['fa-brands fa-yoast','fa-solid fa-traffic-light','fa-solid fa-circle-check']},
    {name:'WooCommerce',cat:'Web Development & CMS',desc:'WordPress online store setup and configuration.',level:'Used',ic:['fa-brands fa-woocommerce','fa-solid fa-cart-shopping','fa-solid fa-store']},
    {name:'WPForms',cat:'Web Development & CMS',desc:'Building and configuring forms in WordPress.',level:'Used',ic:['fa-solid fa-envelope-open-text','fa-solid fa-file-lines','fa-solid fa-table-list']},
    {name:'WP Optimize',cat:'Web Development & CMS',desc:'WordPress caching and performance optimization.',level:'Used',ic:['fa-solid fa-broom','fa-solid fa-bolt','fa-solid fa-gauge']},
    {name:'Rank Math',cat:'Web Development & CMS',desc:'Preferred WordPress SEO plugin for on-page optimization and configuration.',level:'Preferred',ic:['fa-solid fa-ranking-star','fa-solid fa-trophy','fa-solid fa-medal']},
    {name:'HTML, CSS & JavaScript',cat:'Web Development & CMS',desc:'Modify, troubleshoot and adapt code, with AI assistance for more complex implementations.',level:'Developing',ic:['fa-brands fa-html5','fa-brands fa-css3-alt','fa-solid fa-code']},
    {name:'Git & GitHub',cat:'Web Development & CMS',desc:'Version control, repositories and collaboration workflows.',level:'Used',ic:['fa-brands fa-github','fa-brands fa-git-alt','fa-solid fa-code-branch']},
    {name:'GitHub Pages',cat:'Web Development & CMS',desc:'Publish and host static websites.',level:'Used',ic:['fa-brands fa-github-alt','fa-solid fa-globe','fa-solid fa-file-code']},
    {name:'Render',cat:'Web Development & CMS',desc:'Deploy and host web applications.',level:'Used',ic:['fa-solid fa-cloud-arrow-up','fa-solid fa-cloud','fa-solid fa-server']},
    {name:'ChatGPT',cat:'AI & AI-assisted Workflow',desc:'Content writing, prompt engineering, research, brainstorming and coding assistance.',level:'Used',ic:['fa-brands fa-openai','fa-solid fa-comment-dots','fa-solid fa-robot']},
    {name:'Gemini',cat:'AI & AI-assisted Workflow',desc:'Content writing, prompt engineering, research, brainstorming and coding assistance.',level:'Used',ic:['fa-solid fa-wand-magic-sparkles','fa-solid fa-star','fa-brands fa-google']},
    {name:'Claude',cat:'AI & AI-assisted Workflow',desc:'AI-assisted project work, research, writing and development support.',level:'Used',ic:['fa-solid fa-asterisk','fa-solid fa-star-of-life','fa-solid fa-sun']},
    {name:'Claude Code',cat:'AI & AI-assisted Workflow',desc:'AI-assisted website development, code implementation, debugging and project work.',level:'Used',ic:['fa-solid fa-terminal','fa-solid fa-code','fa-solid fa-laptop-code']},
    {name:'OpenAI Codex',cat:'AI & AI-assisted Workflow',desc:'AI-assisted code implementation and development support.',level:'Used',ic:['fa-solid fa-code','fa-brands fa-openai','fa-solid fa-terminal']},
    {name:'Photoshop',cat:'Creative & Media',desc:'Photo editing and image manipulation for personal projects.',level:'Personal projects',ic:['fa-solid fa-image','fa-solid fa-paintbrush','fa-solid fa-camera']},
    {name:'DaVinci Resolve',cat:'Creative & Media',desc:'Video editing and creative media projects.',level:'Personal projects',ic:['fa-solid fa-film','fa-solid fa-clapperboard','fa-solid fa-video']},
    {name:'Canva',cat:'Creative & Media',desc:'Graphic design and visual content for personal projects.',level:'Personal projects',ic:['fa-solid fa-palette','fa-solid fa-pen-ruler','fa-solid fa-paintbrush']},
    {name:'CapCut',cat:'Creative & Media',desc:'Video editing for personal projects.',level:'Personal projects',ic:['fa-solid fa-scissors','fa-solid fa-video','fa-solid fa-film']},
    {name:'Lightroom',cat:'Creative & Media',desc:'Photo processing and editing for personal projects.',level:'Personal projects',ic:['fa-solid fa-sliders','fa-solid fa-camera-retro','fa-solid fa-image']}
  ];
  /* derived, so a category can never exist in TOOLS without showing up in the UI
     (the old list left "Creative & Media" out) */
  const CATS = [...new Set(TOOLS.map(t => t.cat))];
  const SHORT = {'SEO & Analytics':'SEO','Web Development & CMS':'Web & CMS','AI & AI-assisted Workflow':'AI','Creative & Media':'Creative'};
  const ORDER = new Map(TOOLS.map((t, i) => [t, i]));

  /* same query as android.css / android.js ("ANDROID MODE") */
  const PHONE = window.matchMedia('(max-width:768px),(hover:none) and (pointer:coarse) and (orientation:portrait) and (max-width:1100px),(hover:none) and (pointer:coarse) and (max-height:500px)');
  const SHEET_ID = 'toolbox';

  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  /* borderless: no outline on the popup and no divider lines between its parts; the search box becomes a filled pill instead of an outlined one */
  const flat = document.createElement('style');
  flat.textContent = '.um-pop,.um-top,.um-tabs,.um-list,.um-grp,.um-detail,.um-dhead{border:0!important}' +
    '.um-find{border:0!important;background:color-mix(in srgb,currentColor 9%,transparent)!important}';
  (document.head || document.documentElement).appendChild(flat);

  /* ───────── shared state + helpers ───────── */
  const state = {cat:'', q:'', sel:null};

  function visible() {
    const q = state.q.trim().toLowerCase();
    return TOOLS.filter(t => (!state.cat || t.cat === state.cat) &&
      (!q || (t.name + ' ' + t.desc + ' ' + t.level + ' ' + t.cat).toLowerCase().includes(q)));
  }

  /* Font Awesome logo. t.ic lists three icons: the best match, a close one, a generic one. checkIcons() walks down the
     list when an icon is not in the loaded Font Awesome (an unknown class draws nothing, width 0), and ends on a plain
     diamond. Icons that are not on screen yet (a sheet that is still being built) are left for the next check. */
  function logo(t, size) {
    const s = el('span', 'um-logo' + (size ? ' ' + size : '')), i = el('i', t.ic[0]);
    i.setAttribute('aria-hidden', 'true'); i.dataset.fb = t.ic.slice(1).join('|');
    s.append(i);
    return s;
  }
  function checkIcons(root) {
    root.querySelectorAll('i[data-fb]').forEach(i => {
      if (!i.getClientRects().length) return;
      const rest = i.dataset.fb.split('|').filter(Boolean); i.removeAttribute('data-fb');
      while (i.getBoundingClientRect().width === 0 && rest.length) i.className = rest.shift();
      if (i.getBoundingClientRect().width === 0) { i.className = ''; i.textContent = '◈'; }
    });
  }

  /* the details under the list (desktop applet and phone sheet share it) */
  function paintDetail(box) {
    box.textContent = '';
    const t = state.sel;
    box.hidden = !t; box.style.display = t ? '' : 'none';      // the description only exists while a card is selected
    if (!t) return;
    const head = el('div', 'um-dhead'), h = el('h3'), p = el('p');       // logo + name + description; category and level are already on the tabs and the row
    h.textContent = t.name; p.textContent = t.desc;
    head.append(logo(t, 'lg'), h);
    box.append(head, p);
    checkIcons(box);
  }
  function pick(t, rows, box) {
    state.sel = state.sel === t ? null : t;
    rows.forEach((r, k) => r.setAttribute('aria-current', String(k === state.sel)));
    paintDetail(box);
  }

  function dropHeroEntry() {   // the old App Manager button on the hero applet is gone; tidy any wrapper it leaves empty
    document.querySelectorAll('#hero [data-toolbox-open], .hero-sidebar [data-toolbox-open]').forEach(n => {
      let p = n.parentElement; n.remove();
      for (let k = 0; k < 2 && p && !p.matches('#hero, .hero-sidebar, body') && !p.children.length && !p.textContent.trim(); k++) {
        const up = p.parentElement; p.remove(); p = up;
      }
    });
  }

  /* ═════════════ desktop: compact taskbar applet ═════════════ */
  let pop = null, popOpen = false, ui = {};

  function buildPop() {
    pop = el('div', 'um-pop');
    pop.id = 'um-pop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Update Manager');
    pop.innerHTML =
      '<div class="um-top"><label class="um-find"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>' +
        '<input type="search" placeholder="Search tools" aria-label="Search tools" autocomplete="off" spellcheck="false"></label></div>' +
      '<div class="um-tabs" role="tablist" aria-label="Category"></div>' +
      '<div class="um-list"></div>' +
      '<div class="um-detail" aria-live="polite"></div>';
    document.body.append(pop);
    ui = {find: $('input', pop), tabs: $('.um-tabs', pop), list: $('.um-list', pop), detail: $('.um-detail', pop), rows: new Map()};

    const tab = (cat, label) => { const b = el('button', 'um-tab'); b.type = 'button'; b.dataset.cat = cat; b.setAttribute('role', 'tab'); b.textContent = label; return b; };
    ui.tabs.append(tab('', 'All'));
    CATS.forEach(c => ui.tabs.append(tab(c, SHORT[c] || c)));

    ui.tabs.addEventListener('click', e => { const b = e.target.closest('.um-tab'); if (b) { state.cat = b.dataset.cat; paintPop(); } });
    ui.find.addEventListener('input', () => { state.q = ui.find.value; paintPop(); });
    ui.list.addEventListener('click', e => { const r = e.target.closest('.um-row'); if (r) pick(r._tool, ui.rows, ui.detail); });
    pop.addEventListener('keydown', e => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
      const rows = [...ui.list.querySelectorAll('.um-row')]; if (!rows.length) return;
      if (e.target === ui.find && e.key !== 'ArrowDown') return;      // Home/End/Up keep their normal job inside the search box
      e.preventDefault();
      const at = rows.indexOf(document.activeElement);
      const i = e.key === 'Home' ? 0 : e.key === 'End' ? rows.length - 1 : at + (e.key === 'ArrowDown' ? 1 : -1);
      if (i < 0) { ui.find.focus(); return; }
      rows[Math.min(rows.length - 1, i)].focus();
    });
  }

  function paintPop() {
    const list = visible();
    ui.list.textContent = ''; ui.rows = new Map();
    ui.tabs.querySelectorAll('.um-tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.cat === state.cat)));
    if (!list.length) {
      state.sel = null;
      const p = el('p', 'um-none');
      p.textContent = state.q.trim() ? 'No tools match “' + state.q.trim() + '”.' : 'Nothing to show here.';
      ui.list.append(p);
    } else if (!list.includes(state.sel)) state.sel = null;
    const grouped = !state.cat && !state.q.trim();     // category headings only in the plain "All" view
    let last = null;
    list.forEach(t => {
      if (grouped && t.cat !== last) { last = t.cat; const g = el('div', 'um-grp'); g.textContent = t.cat; ui.list.append(g); }
      const row = el('button', 'um-row'), nm = el('span', 'um-nm'), chip = el('span', 'um-chip');
      row.type = 'button'; row._tool = t; row.setAttribute('aria-current', String(t === state.sel));
      nm.textContent = t.name; chip.textContent = t.level;
      row.append(logo(t), nm, chip);
      ui.list.append(row); ui.rows.set(t, row);
    });
    checkIcons(ui.list);
    ui.list.scrollTop = 0;
    paintDetail(ui.detail);
  }

  function place() {           // open upward from the taskbar button, kept on screen
    const a = $('.um-btn'), b = a ? a.getBoundingClientRect() : null, w = pop.offsetWidth;
    pop.style.left = Math.max(8, Math.min(b ? b.left : 8, innerWidth - w - 8)) + 'px';
    pop.style.bottom = (b ? Math.max(8, innerHeight - b.top + 8) : 64) + 'px';
  }

  function setExpanded(on) {
    document.querySelectorAll('[data-toolbox-open]').forEach(b => b.setAttribute('aria-expanded', String(on)));
  }

  function openPop() {
    if (!pop) buildPop();
    popOpen = true;
    ui.find.value = state.q; state.sel = null;
    paintPop(); place();
    pop.classList.add('open'); setExpanded(true);
    ui.find.focus({preventScroll: true});
  }

  function closePop(refocus) {
    if (!pop || !popOpen) return;
    popOpen = false;
    pop.classList.remove('open'); setExpanded(false);
    if (refocus) { const a = $('.um-btn'); if (a) a.focus({preventScroll: true}); }
  }

  /* the icon beside the theme button */
  function mountButton() {
    dropHeroEntry();
    if (PHONE.matches || $('.um-btn')) return true;
    const themePop = document.getElementById('panel-theme-pop');
    const menu = themePop && themePop.closest('.panel-menu');
    const group = $('.top-panel.taskbar .panel-left');
    if (!menu && !group) return false;
    const ref = menu && menu.querySelector('button');      // borrow the theme button's classes so it looks identical
    const wrap = el('div', 'panel-menu um-menu');
    const b = el('button', null, '<i class="fa-solid fa-toolbox" aria-hidden="true"></i>');
    b.type = 'button';
    b.className = ((ref ? ref.className.replace(/\b(is-)?(active|open)\b/g, '') : '').replace(/\s+/g, ' ').trim() + ' um-btn' + (ref ? '' : ' um-plain')).trim();
    b.setAttribute('data-toolbox-open', '');
    b.setAttribute('aria-label', 'Update Manager');
    b.setAttribute('aria-haspopup', 'dialog');
    b.setAttribute('aria-controls', 'um-pop');
    b.setAttribute('aria-expanded', 'false');
    b.title = 'Update Manager';
    wrap.append(b);
    if (menu) menu.after(wrap); else group.append(wrap);
    return true;
  }

  /* ═════════════ phone: bubble sheet ═════════════ */
  let sheet = null, m = {};

  function buildSheet() {
    sheet = el('div', 'um-sheet adr-layer');          /* a <div>: the site's own "section" / "header" rules pad those and left a gap */
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-label', 'Update Manager');
    sheet.innerHTML =
      '<div class="um-m-bar"><b>Update Manager</b></div>' +
      '<div class="um-m-body">' +
        '<label class="um-m-find"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>' +
          '<input type="search" placeholder="Search tools" aria-label="Search tools" autocomplete="off" spellcheck="false"></label>' +
        '<div class="um-m-chips" role="tablist" aria-label="Category"></div>' +
        '<div class="um-m-list"></div>' +
        '<div class="um-m-detail" aria-live="polite"></div>' +
      '</div>';

    m = {bar: $('.um-m-bar', sheet), detail: $('.um-m-detail', sheet), list: $('.um-m-list', sheet), chips: $('.um-m-chips', sheet), find: $('input', sheet), rows: new Map()};

    const chip = (cat, label) => { const c = el('button', 'um-m-chip'); c.type = 'button'; c.dataset.cat = cat; c.setAttribute('role', 'tab'); c.textContent = label; return c; };
    m.chips.append(chip('', 'All'));
    CATS.forEach(c => m.chips.append(chip(c, SHORT[c] || c)));

    m.chips.addEventListener('click', e => { const c = e.target.closest('.um-m-chip'); if (c) { state.cat = c.dataset.cat; paintPhone(); } });
    m.find.addEventListener('input', () => { state.q = m.find.value; paintPhone(); });
    m.list.addEventListener('click', e => { const r = e.target.closest('.um-m-row'); if (r) pick(r._tool, m.rows, m.detail); });
  }

  function paintPhone() {
    const list = visible();
    m.list.textContent = ''; m.rows = new Map();
    m.chips.querySelectorAll('.um-m-chip').forEach(c => c.setAttribute('aria-selected', String(c.dataset.cat === state.cat)));
    if (!list.length) {
      state.sel = null;
      const p = el('p', 'um-m-empty');
      p.textContent = state.q.trim() ? 'No tools match “' + state.q.trim() + '”.' : 'Nothing to show here.';
      m.list.append(p);
    } else if (!list.includes(state.sel)) state.sel = null;
    list.forEach(t => {
      const b = el('button', 'um-m-row'), n = el('span', 'um-m-nm'), chip = el('span', 'um-chip');
      b.type = 'button'; b._tool = t; b.setAttribute('aria-current', String(t === state.sel));
      n.textContent = t.name; chip.textContent = t.level;
      b.append(logo(t), n, chip);
      m.list.append(b); m.rows.set(t, b);
    });
    checkIcons(m.list);
    m.list.scrollTop = 0;
    paintDetail(m.detail);
  }

  function syncGeometry() {    // same left edge + width as the other bubble sheets, when one exists
    const w = $('.wm-window.adr-sheet');
    if (w && w.offsetWidth > 100) {
      sheet.style.setProperty('--adr-left', w.offsetLeft + 'px');
      sheet.style.setProperty('--adr-w', w.offsetWidth + 'px');
    }
  }

  function openPhone() {
    const bub = window.adrBubbles;
    if (!bub) { document.addEventListener('adr:bubbles', openPhone, {once: true}); return; }   // bubbles not ready yet
    if (bub.has(SHEET_ID)) { bub.open(SHEET_ID); return; }
    buildSheet();
    m.find.value = state.q; state.sel = null; paintPhone();
    document.body.append(sheet);
    syncGeometry();
    bub.add({id: SHEET_ID, el: sheet, kind: 'toolbox', icon: 'fa-solid fa-toolbox', title: 'Update Manager', bar: m.bar, close: closePhone});
    checkIcons(sheet);
  }

  function closePhone() {
    if (!sheet) return;
    if (window.adrBubbles) window.adrBubbles.remove(SHEET_ID);
    sheet.remove(); sheet = null; m = {};
  }

  /* ═════════════ wiring ═════════════ */
  function open() { if (PHONE.matches) openPhone(); else if (!popOpen) openPop(); }
  function close() { closePop(); closePhone(); }
  function toggle() { if (PHONE.matches) openPhone(); else if (popOpen) closePop(); else openPop(); }

  document.addEventListener('click', e => {
    const t = e.target.closest && e.target.closest('[data-toolbox-open]');
    if (!t) return;
    e.preventDefault();
    toggle();
  });
  document.addEventListener('pointerdown', e => {      // click outside the applet closes it
    if (!popOpen || pop.contains(e.target) || (e.target.closest && e.target.closest('[data-toolbox-open]'))) return;
    closePop();
  }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && popOpen) closePop(true); });
  window.addEventListener('resize', () => { if (popOpen) place(); });
  const modeChange = () => { close(); mountButton(); };
  PHONE.addEventListener ? PHONE.addEventListener('change', modeChange) : PHONE.addListener(modeChange);

  /* the taskbar can be built after this script runs: try for a few seconds, and again after boot / restart */
  let tries = 0;
  const iv = setInterval(() => { if (mountButton() || ++tries > 80) clearInterval(iv); }, 250);
  ['desktop:booted', 'desktop:restart'].forEach(ev => document.addEventListener(ev, () => { closePop(); setTimeout(mountButton, 200); }));

  window.ToolboxManager = {open, close, toggle, tools: TOOLS};
})();