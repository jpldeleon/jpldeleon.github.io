/**
 * Window Manager
 * One reusable system for every app window (Resume, Portfolio, each project).
 * Vanilla JS, no dependencies. Load AFTER main.js (needs the existing dock/theme).
 */
(function () {
  'use strict';

  /* =====================================================================
   * 1. CONFIG: the only part you normally need to edit
   * ===================================================================== */

  /* Permanent apps (About = sticky note widget and Skills = widgets, see section 8c).
     `adopt` = an existing <section> on the page that is moved
     into the window (so your current Resume/Portfolio markup is reused as-is).
     `url` = optional iframe fallback if that section isn't on the page. */
  const APPS = {
    resume: {
      title: 'Resume', icon: 'fa-solid fa-timeline', dockClass: 'dock-resume',
      adopt: '#resume', size: [980, 700]
    },
    portfolio: {
      title: 'Portfolio', icon: 'fa-solid fa-flask', dockClass: 'dock-projects',
      adopt: '#portfolio', size: [1040, 720]
    },
    /* File Explorer: desktop only, opens by itself on first load, small and centred.
       `static` = nothing for Isotope/Swiper to re-measure; `center` = dead centre. */
    files: {
      title: 'Files', icon: 'fa-solid fa-folder-open', dockClass: 'dock-files',
      adopt: '#files-explorer', size: [560, 400], center: true, static: true
    }
  };

  /* Portfolio projects. Each opens in its own window (iframe of the project page).
     `url` is the project page. Links on the site pointing to this url are
     intercepted automatically, so existing sidebar/portfolio links just work. */
  const PROJECTS = [
    { id: 'auditkit', title: 'AuditKit', sub: 'API Capstone Project',
      icon: 'fa-solid fa-magnifying-glass-chart', url: 'auditkit/index.html' },
    { id: 'nothingtechblob', title: 'NothingTechBlob',
      icon: 'fa-solid fa-mobile-screen', url: 'nothingtechblob/' },
    { id: 'badlands-ink', title: 'Badlands Ink',
      icon: 'fa-solid fa-pen-nib', url: 'badlands-ink/' },
    { id: 'johnoffthewall', title: 'John Off the Wall',
      icon: 'fa-solid fa-fire-flame-curved', url: 'johnoffthewall/' },
    { id: 'pixellog', title: 'PixelLog',
      icon: 'fa-brands fa-mintbit', url: 'pixellog/' },
    { id: 'jamporudex', title: 'JamporuDEX',
      icon: 'fa-brands fa-leanpub', url: 'jamporudex/' },
    { id: 'route196', title: 'Route 196',
      icon: 'fa-solid fa-shield', url: 'route196/' }
  ];

  /* Certificates: each opens in the SAME window system as the projects
     (drag, resize, minimize, close, dock icon). `image` is the full certificate. */
  const CERTS = [
    { id: 'fullstack', title: 'Full Stack Certificate',
      sub: 'The Complete Full-Stack Web Development Bootcamp',
      image: 'assets/img/certifications/cert-fullstack-bootcamp_F.webp' },
    { id: 'techseo', title: 'Technical SEO Certificate',
      sub: 'Technical SEO and SEO Sprint',
      image: 'assets/img/certifications/cert_techseosprint_F.webp' }
  ];

  /* Injected into every project iframe so the project pages need NO edits:
     hides the page's own dock / theme dots / breadcrumbs / footer. */
  const EMBED_CSS = `
    .linux-dock:not(.side-nav),.theme-dots,.app-menu,.terminal-overlay,.scroll-top,
    .breadcrumbs,.page-title,#footer,footer,#preloader{display:none!important}
    main,#footer{padding-bottom:0!important}
    html{scroll-behavior:auto}`;

  /* =====================================================================
   * 2. HELPERS
   * ===================================================================== */
  const EASE = 'cubic-bezier(.4, 0, .2, 1)';
  const POP = 'cubic-bezier(.2, .8, .2, 1)';
  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi));
  const MIN_W = 380, MIN_H = 260;      // smallest a desktop window can be resized to
  const HANDLES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

  function el(tag, attrs, html) {
    const n = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, v));
    if (html != null) n.innerHTML = html;
    return n;
  }

  const SVG = {
    close: '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 2l6 6M8 2l-6 6"/></svg>',
    min: '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 5h6"/></svg>',
    expand: '<svg class="ico-expand" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M2 2h6v6H2z"/></svg>',
    restore: '<svg class="ico-restore" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3.5 3.5h4.5v4.5H3.5zM2 6.5V2h4.5"/></svg>'
  };

  function normPath(url) {
    try {
      const u = new URL(url, location.href);
      if (u.origin !== location.origin) return null;
      return u.pathname.replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
    } catch (e) { return null; }
  }

  /* =====================================================================
   * 3. STATE + DOM SCAFFOLDING
   * ===================================================================== */
  const layer = el('div', { id: 'wm-layer' });
  const store = el('div', { id: 'wm-store', 'aria-hidden': 'true' });
  const wins = new Map();      // id -> window record
  const defs = new Map();      // id -> app definition
  const dockBtns = new Map();  // id -> dock <button>
  const frames = new Set();    // live iframes (for theme sync)
  let zTop = 1, focused = null, cascade = 0, filesDismissed = false;
  let dock, dockApps, dockDivider;

  Object.entries(APPS).forEach(([id, d]) => defs.set(id, Object.assign({ id, permanent: true }, d)));
  CERTS.forEach(c => defs.set('cert:' + c.id, Object.assign({}, c, {
    id: 'cert:' + c.id, icon: 'fa-solid fa-file-pdf', permanent: false,
    size: [940, 680], dockClass: 'dock-app dock-cert'
  })));
  PROJECTS.forEach(p => defs.set('project:' + p.id, Object.assign({}, p, {
    id: 'project:' + p.id, permanent: false, size: [1000, 720], dockClass: 'dock-app'
  })));

  /* ---------- Dock ---------- */
  function makeDockBtn(def) {
    const b = el('button', {
      type: 'button', class: 'dock-item ' + (def.dockClass || 'dock-app'),
      'data-app': def.id, 'aria-label': def.title
    });
    b.innerHTML = '<i class="' + def.icon + '"></i><span class="dock-tooltip"></span>';
    b.querySelector('.dock-tooltip').textContent = def.title;
    return b;
  }

  function buildDock() {
    dock = document.querySelector('.linux-dock');
    if (!dock) {
      dock = el('nav', { class: 'linux-dock', 'aria-label': 'Applications' });
      document.body.appendChild(dock);
    }
    const menuBtn = dock.querySelector('#dock-menu-btn');
    Array.from(dock.children).forEach(c => { if (c !== menuBtn) c.remove(); });

    ['files', 'resume', 'portfolio'].forEach(id => {   // always in the dock (also reachable from the Ubuntu menu)
      const b = makeDockBtn(defs.get(id));
      dockBtns.set(id, b);
      dock.appendChild(b);
    });
    dockDivider = el('span', { class: 'wm-dock-divider', role: 'separator', hidden: '' });
    dockApps = el('div', { class: 'wm-dock-apps' });
    dock.append(dockDivider, dockApps);
    placeDockApps();
  }

  /* Active apps always live inside the bottom dock (after the divider).
     On phones the strip swipes sideways; there is no separate side dock. */
  function placeDockApps() {
    if (!dock || !dockApps) return;
    if (dockApps.parentNode !== dock) dock.append(dockDivider, dockApps);
  }

  /* Left inset for full-screen windows (no side dock any more) */
  function railInset() { return 6; }

  /* Tell the CSS how much space the bottom dock takes (project dock stops above it) */
  function syncDockVar() {
    document.documentElement.style.setProperty('--dock-space', dockSpace() + 'px');
  }

  /* Scroll the swipeable strip so the given app's icon is fully visible */
  function revealDockBtn(btn) {
    if (!btn || !dockApps || btn.parentNode !== dockApps) return;
    if (dockApps.scrollWidth <= dockApps.clientWidth) return;
    const l = btn.offsetLeft, r = l + btn.offsetWidth;
    if (l < dockApps.scrollLeft) dockApps.scrollTo({ left: l - 4, behavior: 'smooth' });
    else if (r > dockApps.scrollLeft + dockApps.clientWidth) dockApps.scrollTo({ left: r - dockApps.clientWidth + 4, behavior: 'smooth' });
  }

  function refreshDock() {
    dockBtns.forEach((btn, id) => {
      const w = wins.get(id);
      btn.classList.toggle('wm-open', !!w);
      btn.classList.toggle('wm-minimized', !!w && w.state === 'min');
      btn.classList.toggle('wm-focused', !!w && w === focused);
      btn.setAttribute('aria-pressed', String(!!w && w === focused));
    });
    dockDivider.hidden = dockApps.children.length === 0;
    syncDockVar();
    if (focused && focused.dockBtn) revealDockBtn(focused.dockBtn);
    const pt = document.getElementById('panel-title');
    if (pt) pt.textContent = (focused && focused.state !== 'min') ? focused.def.title : 'Desktop';
    const anyVisible = Array.from(wins.values()).some(w => w.state !== 'min');
    document.body.classList.toggle('wm-has-window', anyVisible);
  }

  /* Vertical space to keep clear for the dock */
  function dockSpace() {
    if (!dock) return 96;
    const r = dock.getBoundingClientRect();
    return Math.max(72, window.innerHeight - r.top + 12);
  }

  /* Height of the top panel: windows must never slide under it */
  function topSpace() {
    const p = document.getElementById('top-panel');
    return p ? Math.round(p.getBoundingClientRect().bottom) : 0;   // floating pill: include its top gap
  }

  /* =====================================================================
   * 4. GEOMETRY
   * ===================================================================== */
  function targetRect(w) {
    const vw = window.innerWidth, vh = window.innerHeight, ds = dockSpace(), ts = topSpace();
    /* phones: a floating window with a visible margin, never edge-to-edge */
    if (isMobile()) return mobileRect(w, vw, vh, ds, ts);
    if (w.state === 'max') return { x: 0, y: ts, w: vw, h: vh - ds - ts };
    return w.rect;
  }

  /* Phones. Every window sits in the same slot between the top panel and the dock:
     - screenshot windows shrink-wrap the image (title bar + small padding + image)
     - project windows (iframe pages) are ~62% of the screen, centred in the slot
     - everything else (Resume, Portfolio, ...) keeps the full-height slot */
  const MOBILE_PROJECT_H = 0.62;
  function mobileRect(w, vw, vh, ds, ts) {
    const L = railInset() + 6, top = ts + 30;
    const availW = vw - L - 10, availH = Math.max(240, vh - ds - top - 4);

    if (w.def.lite) {
      const nat = w.def.natural, cert = w.body && w.body.querySelector('.wm-cert');
      const bar = w.el.querySelector('.wm-titlebar');
      if (nat && cert && bar) {
        const cs = getComputedStyle(cert);
        const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
        const padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
        const extraW = (w.el.offsetWidth - w.el.clientWidth) + padX;                    // borders + padding
        const extraH = (w.el.offsetHeight - w.el.clientHeight) + bar.offsetHeight + padY; // + title bar
        const k = Math.min(1, (availW - extraW) / nat.w, (availH - extraH) / nat.h);
        const W = Math.round(nat.w * k + extraW), H = Math.round(nat.h * k + extraH);
        return { x: Math.round(L + (availW - W) / 2), y: Math.round(top + (availH - H) / 2), w: W, h: H };
      }
    }

    if (w.frame) {
      const h = Math.round(Math.min(availH, Math.max(300, vh * MOBILE_PROJECT_H)));
      return { x: L, y: Math.round(top + (availH - h) / 2), w: availW, h };
    }

    return { x: L, y: top, w: availW, h: availH };
  }

  function applyRect(w) {
    const r = targetRect(w);
    const s = w.el.style;
    s.left = r.x + 'px'; s.top = r.y + 'px';
    s.width = r.w + 'px'; s.height = r.h + 'px';
  }

  /* Space taken by the notification panel on the right (0 when it is hidden or on small screens) */
  function sidebarW() { return 0; }   // the hero panel is on the left and windows float above it

  /* Space taken by the desktop icons on the left (desktop only) */
  function iconsW() { return 0; }     // desktop icons were removed: they live in the Files window

  /* Restart: close every window, put the About sticky note back where it started */
  async function restartDesktop() {
    await Promise.all(Array.from(wins.values()).map(w => closeWindow(w, true)));
    cascade = 0;
    filesDismissed = false;
    window.scrollTo(0, 0);
    resetNote(true);
    if (isDesk()) openWindow('files');
  }

  function initialRect(def) {
    const vw = window.innerWidth, vh = window.innerHeight, ds = dockSpace(), ts = topSpace();
    const left = iconsW(), right = sidebarW();   // centre in the free area between icons and panel
    const w = Math.min(def.size[0], vw - left - right - 24);
    const h = Math.min(def.size[1], vh - ds - ts - 20);
    const still = def.lite || def.center;
    const off = still ? 0 : (cascade++ % 6) * 28;
    const sh = still ? 0 : 56;                    // lite + centred windows sit dead centre
    return {
      w, h,
      x: clamp(left + (vw - left - right - w) / 2 + off - sh, 8, vw - w - 8),
      y: clamp(ts + (vh - ds - ts - h) / 2 + off - sh, ts + 8, vh - ds - h)
    };
  }

  /* While dragging: the window may hang off the edges, but the title bar and
     the buttons on its right must always stay reachable. */
  function keepInView(w) {
    if (isMobile() || w.state === 'max') return;
    const vw = window.innerWidth, vh = window.innerHeight, ds = dockSpace(), ts = topSpace();
    w.rect.x = clamp(w.rect.x, 150 - w.rect.w, vw - 100);
    w.rect.y = clamp(w.rect.y, ts, vh - ds);
  }

  /* When the browser is resized: shrink a window that no longer fits and pull
     it fully back on screen (above the dock) so content is never cut off. */
  function fitToViewport(w) {
    if (isMobile() || w.state === 'max') return;
    const vw = window.innerWidth, vh = window.innerHeight, ds = dockSpace(), ts = topSpace();
    const r = w.rect;
    r.w = clamp(r.w, Math.min(MIN_W, vw), vw);
    r.h = clamp(r.h, Math.min(MIN_H, vh - ds - ts), vh - ds - ts);
    r.x = clamp(r.x, 0, vw - r.w);
    r.y = clamp(r.y, ts, vh - ds - r.h);
  }

  /* =====================================================================
   * 5. ANIMATION  (Web Animations API, like main.js)
   * ===================================================================== */
  function dockDelta(w) {
    const btn = w.dockBtn;
    const d = btn.getBoundingClientRect();
    const r = w.el.getBoundingClientRect();
    return {
      dx: d.left + d.width / 2 - (r.left + r.width / 2),
      dy: d.top + d.height / 2 - (r.top + r.height / 2)
    };
  }

  /* Grow out of the dock icon (open / restore) */
  function flyIn(w) {
    if (reduceMotion()) return Promise.resolve();
    const { dx, dy } = dockDelta(w);
    const a = w.el.animate([
      { transform: `translate(${dx}px, ${dy}px) scale(.05)`, opacity: 0 },
      { transform: `translate(${dx * 0.25}px, ${dy * 0.25}px) scale(.7)`, opacity: 0.9, offset: 0.55 },
      { transform: 'translate(0, 0) scale(1)', opacity: 1 }
    ], { duration: 380, easing: POP });
    return a.finished.catch(() => {});
  }

  /* Shrink into the dock icon (minimize). Returns the animation so the caller
     can commit the hidden state first, then cancel it (no flash). */
  function flyOut(w) {
    if (reduceMotion()) return Promise.resolve(null);
    const { dx, dy } = dockDelta(w);
    const a = w.el.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: 0 },
      { transform: `translate(${dx * 0.18}px, ${dy * 0.14}px) scale(.86, .9)`, opacity: 1, offset: 0.3 },
      { transform: `translate(${dx * 0.8}px, ${dy * 0.82}px) scale(.22, .16)`, opacity: 0.9, offset: 0.78 },
      { transform: `translate(${dx}px, ${dy}px) scale(.04)`, opacity: 0, offset: 1 }
    ], { duration: 420, easing: EASE, fill: 'forwards' });
    return a.finished.then(() => a).catch(() => a);
  }

  function fadeOut(w) {
    if (reduceMotion()) return Promise.resolve(null);
    const a = w.el.animate([
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(.96)' }
    ], { duration: 200, easing: 'ease-out', fill: 'forwards' });
    return a.finished.then(() => a).catch(() => a);
  }

  /* =====================================================================
   * 6. WINDOW LIFECYCLE
   * ===================================================================== */
  function createWindow(def) {
    const root = el('section', {
      class: 'wm-window', role: 'dialog', tabindex: '-1',
      'aria-label': def.title, 'data-wm-app': def.id
    });
    root.innerHTML =
      '<header class="wm-titlebar">' +
        '<span class="wm-title"><i class="' + def.icon + '"></i><span></span></span>' +
        '<div class="wm-controls" role="group" aria-label="Window controls">' +
          (def.lite ? '' :
            '<button type="button" class="wm-btn wm-min" aria-label="Minimize" title="Minimize">' + SVG.min + '</button>' +
            '<button type="button" class="wm-btn wm-max" aria-label="Maximize" title="Maximize">' + SVG.expand + SVG.restore + '</button>') +
          '<button type="button" class="wm-btn wm-close" aria-label="Close" title="Close">' + SVG.close + '</button>' +
        '</div>' +
      '</header>' +
      '<div class="wm-body"></div>' +
      (def.lite ? '' : HANDLES.map(d => '<span class="wm-resize" data-dir="' + d + '" aria-hidden="true"></span>').join(''));
    root.querySelector('.wm-title span').textContent = def.title;
    if (def.lite) root.classList.add('is-lite');   // close-only window: fixed position and size

    const w = {
      id: def.id, def, el: root, body: root.querySelector('.wm-body'),
      state: 'normal', rect: initialRect(def), busy: false, dockBtn: null, adopted: null
    };

    /* Controls */
    root.querySelector('.wm-close').addEventListener('click', () => { if (def.id === 'files') filesDismissed = true; closeWindow(w); });
    const bar = root.querySelector('.wm-titlebar');

    /* Focus on any press (capture: works before inner handlers) */
    root.addEventListener('pointerdown', () => focusWindow(w), true);
    if (!def.lite) {                       // lite windows: no minimize, maximize, drag or resize
      root.querySelector('.wm-min').addEventListener('click', () => minimize(w));
      root.querySelector('.wm-max').addEventListener('click', () => toggleMaximize(w));
      bar.addEventListener('dblclick', e => { if (!e.target.closest('.wm-btn')) toggleMaximize(w); });
      enableDrag(w, bar);
      enableResize(w);
    }

    fillBody(w);
    return w;
  }

  /* --- Content sources: adopt an existing section, iframe, or fallback --- */
  function fillBody(w) {
    const d = w.def;
    if (d.adopt) {
      const node = document.querySelector(d.adopt);
      if (node) {
        prepareAdopted(node);
        w.adopted = node;
        w.body.appendChild(node);
        return;
      }
    }
    if (d.image) { renderCert(w); return; }
    if (d.url) { mountFrame(w, d.url); return; }
    if (d.id === 'portfolio') { renderProjectList(w); return; }
    w.body.innerHTML = '<div class="wm-loading">Nothing to show for “' + d.title + '” yet.</div>';
  }

  /* Sections were designed for page scrolling: AOS would leave them invisible
     inside a window, and progress bars wait for a scroll trigger. */
  function prepareAdopted(node) {
    if (node.dataset.wmPrepared) return;
    node.dataset.wmPrepared = '1';
    node.querySelectorAll('[data-aos]').forEach(n => {
      n.removeAttribute('data-aos');
      n.removeAttribute('data-aos-delay');
      n.classList.remove('aos-init', 'aos-animate');
    });
    node.querySelectorAll('.progress .progress-bar[aria-valuenow]').forEach(bar => {
      bar.style.width = bar.getAttribute('aria-valuenow') + '%';
    });
  }

  /* Layout libraries measured the section while it was hidden: nudge them. */
  function refreshLayout(w) {
    const run = () => {
      if (window.Isotope) {
        w.el.querySelectorAll('.isotope-container').forEach(c => {
          const inst = Isotope.data(c);
          if (inst) inst.layout();
        });
      }
      w.el.querySelectorAll('.swiper').forEach(s => s.swiper && s.swiper.update());
      window.dispatchEvent(new Event('resize'));
    };
    run();
    setTimeout(run, 450);
  }

  /* Re-flow Isotope/Swiper when a window's width changes (resize, maximize,
     restore). Instant, so it follows the pointer while a handle is dragged. */
  function relayout(w) {
    if (window.Isotope) {
      w.el.querySelectorAll('.isotope-container').forEach(c => {
        const inst = Isotope.data(c);
        if (!inst) return;
        inst.options.layoutInstant = true;
        try { inst.layout(); } finally { inst.options.layoutInstant = undefined; }
      });
    }
    w.el.querySelectorAll('.swiper').forEach(s => s.swiper && s.swiper.update());
  }

  function watchLayout(w) {
    if (!w.def.adopt || !('ResizeObserver' in window)) return;
    let raf = 0, lastW = 0;
    w.ro = new ResizeObserver(entries => {
      const cw = entries[0].contentRect.width;
      if (!cw || Math.abs(cw - lastW) < 1) return;   // hidden, or only the height changed
      lastW = cw;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => relayout(w));
    });
    w.ro.observe(w.body);
  }

  /* Certificate window: the whole certificate, fitted to the window */
  function renderCert(w) {
    w.body.classList.add('is-cert');
    const wrap = el('div', { class: 'wm-cert' });
    const img = el('img', { class: 'wm-cert-img', alt: w.def.sub || w.def.title, src: w.def.image, draggable: 'false' });
    wrap.appendChild(img);
    w.body.appendChild(wrap);
  }

  function renderProjectList(w) {
    const wrap = el('div', { class: 'wm-projects' });
    PROJECTS.forEach(p => {
      const card = el('button', { type: 'button', class: 'wm-project-card', 'data-app': 'project:' + p.id });
      card.innerHTML = '<i class="' + p.icon + '"></i><h4></h4><p></p>';
      card.querySelector('h4').textContent = p.title;
      card.querySelector('p').textContent = p.sub || '';
      wrap.appendChild(card);
    });
    w.body.appendChild(wrap);
  }

  /* --- Project pages -------------------------------------------------- */
  function withEmbed(url) {
    return url + (url.indexOf('?') > -1 ? '&' : '?') + 'embed=1';
  }

  function currentTheme() { return document.documentElement.getAttribute('data-theme'); }

  function syncTheme(doc) {
    const t = currentTheme();
    if (t) doc.documentElement.setAttribute('data-theme', t);
    else doc.documentElement.removeAttribute('data-theme');
  }

  function mountFrame(w, url) {
    w.body.classList.add('is-frame');
    const loader = el('div', { class: 'wm-loading' }, 'loading ' + w.def.title.toLowerCase());
    const f = el('iframe', { class: 'wm-frame', title: w.def.title });
    w.body.append(f, loader);
    frames.add(f);
    w.frame = f;

    let injected = false, revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      f.classList.add('is-ready');
      loader.remove();
    };

    /* Same-origin: inject the embed CSS as soon as the frame's <head> exists,
       so the page's dock/footer never flash. Cross-origin: just show the page. */
    const poll = setInterval(() => {
      try {
        const d = f.contentDocument;
        if (d && d.head && d.location.href !== 'about:blank') {
          if (!injected) {
            injected = true;
            const s = d.createElement('style');
            s.textContent = EMBED_CSS;
            d.head.appendChild(s);
            d.documentElement.classList.add('wm-embedded');
            syncTheme(d);
            bindShots(d, w);
          }
          if (d.readyState !== 'loading') { clearInterval(poll); reveal(); }
        }
      } catch (e) { clearInterval(poll); reveal(); }
    }, 30);
    f.addEventListener('load', () => {
      clearInterval(poll); reveal();
      try { bindShots(f.contentDocument, w); } catch (e) { /* cross-origin */ }
    });
    setTimeout(() => { clearInterval(poll); reveal(); }, 7000);

    f.src = withEmbed(url);
  }

  /* Keep project windows in step with the site's theme dots */
  new MutationObserver(() => {
    frames.forEach(f => {
      try { if (f.contentDocument) syncTheme(f.contentDocument); } catch (e) { /* cross-origin */ }
    });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* --- Open / focus / close --------------------------------------------- */
  function ensureDockBtn(w) {
    if (dockBtns.has(w.id)) { w.dockBtn = dockBtns.get(w.id); return; }
    const b = makeDockBtn(w.def);
    b.classList.add('wm-new');
    dockApps.appendChild(b);
    dockBtns.set(w.id, b);
    w.dockBtn = b;
  }

  function openWindow(def, rect, origin) {
    if (typeof def === 'string') def = defs.get(def);
    if (!def) return null;
    if (def.id === 'files' && window.innerWidth < 992) return null;   // File Explorer is desktop-only
    let w = wins.get(def.id);
    if (w) {                              // already open: never duplicate
      if (w.state === 'min') restore(w); else focusWindow(w);
      return w;
    }
    defs.set(def.id, def);
    w = createWindow(def);
    if (rect) w.rect = rect;
    wins.set(def.id, w);
    layer.appendChild(w.el);
    if (!def.lite) ensureDockBtn(w);            // lite windows have no dock icon
    applyRect(w);
    if (isMobile()) wins.forEach(applyRect);   // project dock may have just appeared: shift the others
    focusWindow(w);
    if (def.adopt && !def.static) { refreshLayout(w); watchLayout(w); }
    if (def.lite) { fitLite(w); popIn(w, origin); } else flyIn(w);
    return w;
  }

  function focusWindow(w) {
    if (!w || w.state === 'min') return;
    if (focused && focused !== w) focused.el.classList.remove('is-focused');
    w.el.style.zIndex = ++zTop;
    w.el.classList.add('is-focused');
    focused = w;
    refreshDock();
    if (!w.el.contains(document.activeElement)) w.el.focus({ preventScroll: true });
  }

  function focusNext() {
    let next = null;
    wins.forEach(w => {
      if (w.state !== 'min' && (!next || +w.el.style.zIndex > +next.el.style.zIndex)) next = w;
    });
    focused = null;
    if (next) focusWindow(next); else refreshDock();
  }

  async function minimize(w) {
    if (w.busy || w.state === 'min') return;
    w.busy = true;
    const anim = await flyOut(w);
    w.state = w.state === 'max' ? 'max' : 'normal';
    w.wasMax = w.state === 'max';
    w.state = 'min';
    w.el.classList.add('is-minimized');
    w.el.classList.remove('is-focused');
    if (anim) anim.cancel();
    w.busy = false;
    if (focused === w) focusNext(); else refreshDock();
    bounce(w.dockBtn);
  }

  function restore(w) {
    if (w.state !== 'min') return;
    w.state = w.wasMax ? 'max' : 'normal';
    w.el.classList.remove('is-minimized');
    applyRect(w);
    focusWindow(w);
    flyIn(w);
  }

  async function closeWindow(w, instant) {
    if (w.busy) return;
    w.busy = true;
    let anim = null;
    if (!instant) anim = await fadeOut(w);          // instant = no await, so the swap is synchronous
    if (w.frame) frames.delete(w.frame);
    if (w.ro) w.ro.disconnect();
    if (w.adopted) store.appendChild(w.adopted);    // keep Resume/Portfolio state for next open
    w.el.remove();
    if (anim) anim.cancel();
    wins.delete(w.id);
    if (!w.def.permanent) {                        // dynamic dock item goes away
      dockBtns.delete(w.id);
      if (w.dockBtn) w.dockBtn.remove();
      if (isMobile()) wins.forEach(applyRect);   // project dock may have just disappeared
    }
    if (focused === w) { focused = null; focusNext(); } else refreshDock();
  }

  function bounce(btn) {
    if (!btn || reduceMotion()) return;
    /* `translate` (not `transform`): main.css locks dock-item transform with !important */
    btn.animate([
      { translate: '0 0' }, { translate: '0 -10px' },
      { translate: '0 0' }, { translate: '0 -4px' }, { translate: '0 0' }
    ], { duration: 520, easing: 'ease-out' });
  }

  function syncMaxUI(w) {
    const max = w.state === 'max';
    const b = w.el.querySelector('.wm-max');
    w.el.classList.toggle('is-maximized', max);
    b.setAttribute('aria-label', max ? 'Restore' : 'Maximize');
    b.title = max ? 'Restore Down' : 'Maximize';
  }

  /* Maximize / restore: FLIP on the real geometry */
  function toggleMaximize(w) {
    if (isMobile() || w.busy || w.state === 'min') return;
    const first = w.el.getBoundingClientRect();
    w.state = w.state === 'max' ? 'normal' : 'max';
    syncMaxUI(w);
    fitToViewport(w);
    applyRect(w);
    if (reduceMotion()) return;
    const last = w.el.getBoundingClientRect();
    const box = r => ({ left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    w.el.animate([box(first), box(last)], { duration: 300, easing: POP });
  }

  /* =====================================================================
   * 7. DRAGGING (desktop only)
   * ===================================================================== */
  function enableDrag(w, bar) {
    bar.addEventListener('pointerdown', e => {
      if (isMobile() || e.button !== 0 || e.target.closest('.wm-btn')) return;
      if (w.state === 'max') return;      // a maximized window stays maximized: restore it with the button or a double-click
      const sx = e.clientX, sy = e.clientY;
      let started = false, offX = 0, offY = 0;
      try { bar.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }

      const move = ev => {
        if (!started) {
          if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 4) return;
          started = true;
          layer.classList.add('wm-dragging');
          offX = sx - w.rect.x;
          offY = sy - w.rect.y;
        }
        w.rect.x = ev.clientX - offX;
        w.rect.y = ev.clientY - offY;
        keepInView(w);
        applyRect(w);
      };
      const up = () => {
        bar.removeEventListener('pointermove', move);
        bar.removeEventListener('pointerup', up);
        bar.removeEventListener('pointercancel', up);
        layer.classList.remove('wm-dragging');
      };
      bar.addEventListener('pointermove', move);
      bar.addEventListener('pointerup', up);
      bar.addEventListener('pointercancel', up);
    });
  }

  /* Resize from any edge or corner (desktop, normal state only) */
  function enableResize(w) {
    w.el.querySelectorAll('.wm-resize').forEach(h => {
      h.addEventListener('pointerdown', e => {
        if (isMobile() || e.button !== 0 || w.state !== 'normal') return;
        e.preventDefault();
        const dir = h.dataset.dir, sx = e.clientX, sy = e.clientY, s = Object.assign({}, w.rect);
        try { h.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        layer.classList.add('wm-dragging');

        const move = ev => {
          const vw = window.innerWidth, vh = window.innerHeight, ds = dockSpace();
          const minW = Math.min(MIN_W, vw), minH = Math.min(MIN_H, vh - ds);
          const dx = ev.clientX - sx, dy = ev.clientY - sy;
          const r = Object.assign({}, s);
          if (dir.includes('e')) r.w = clamp(s.w + dx, minW, Math.max(vw - s.x, s.w));
          if (dir.includes('s')) r.h = clamp(s.h + dy, minH, Math.max(vh - ds - s.y, s.h));
          if (dir.includes('w')) {
            const right = s.x + s.w;
            r.x = clamp(s.x + dx, Math.min(0, s.x), right - minW);
            r.w = right - r.x;
          }
          if (dir.includes('n')) {
            const bottom = s.y + s.h;
            r.y = clamp(s.y + dy, topSpace(), bottom - minH);
            r.h = bottom - r.y;
          }
          w.rect = r;
          applyRect(w);
        };
        const up = () => {
          h.removeEventListener('pointermove', move);
          h.removeEventListener('pointerup', up);
          h.removeEventListener('pointercancel', up);
          layer.classList.remove('wm-dragging');
        };
        h.addEventListener('pointermove', move);
        h.addEventListener('pointerup', up);
        h.addEventListener('pointercancel', up);
      });
    });
  }

  /* Desktop layout (>= 992px): floating sticky note + widgets + notification panel.
     Small layout: everything stacks in the page (hero, About note, Skills widgets). */
  let desktopMode = window.innerWidth >= 992;

  function syncMode() {
    const d = window.innerWidth >= 992;
    if (d === desktopMode) return;
    desktopMode = d;
    if (!d) {
      window.scrollTo(0, 0);
      if (wins.has('files')) closeWindow(wins.get('files'), true);   // desktop-only app
    } else if (!filesDismissed && !wins.has('files')) {
      openWindow('files');
    }
    resetNote(false);          // desktop: back to its start spot; small: back into the page flow
    refreshDock();
  }

  window.matchMedia('(min-width: 992px)').addEventListener('change', () => syncMode());
  window.addEventListener('load', () => { syncMode(); });

  window.matchMedia('(max-width: 768px)').addEventListener('change', () => {
    placeDockApps();
    refreshDock();
    wins.forEach(w => { fitToViewport(w); applyRect(w); if (w.def.adopt) setTimeout(() => relayout(w), 60); });
  });

  window.addEventListener('resize', e => {
    if (e && e.isTrusted === false) return;   // ignore the synthetic event from refreshLayout()
    syncMode();
    syncDockVar();
    wins.forEach(w => { fitToViewport(w); applyRect(w); });
    keepNoteInView();
  });

  /* Restart (panel + Ubuntu menu) */
  document.addEventListener('desktop:restart', e => { e.preventDefault(); restartDesktop(); });

  /* =====================================================================
   * 7b. SCREENSHOT WINDOWS (project pages)
   *     A screenshot opens as a certificate-style window in THIS page (above the
   *     project window) instead of a GLightbox inside the small iframe. Same
   *     title bar + fitted image as the certificates, but close-only: no
   *     minimize / maximize, not draggable, not resizable, no dock icon.
   * ===================================================================== */
  const LITE_CSS = `
    .wm-window.is-lite .wm-titlebar{cursor:default}
    .wm-window.is-lite .wm-controls{margin-left:auto}`;
  document.head.appendChild(el('style', { id: 'wm-lite-css' }, LITE_CSS));

  /* Pop out of the thumbnail that was clicked (or a soft pop when unknown) */
  function popIn(w, origin) {
    if (reduceMotion()) return;
    const r = w.el.getBoundingClientRect();
    let from = { transform: 'scale(.94)', opacity: 0 };
    if (origin && r.width && r.height) {
      const dx = (origin.left + origin.width / 2) - (r.left + r.width / 2);
      const dy = (origin.top + origin.height / 2) - (r.top + r.height / 2);
      from = {
        transform: `translate(${dx}px, ${dy}px) scale(${Math.max(origin.width / r.width, .05)}, ${Math.max(origin.height / r.height, .05)})`,
        opacity: .2
      };
    }
    w.el.animate([from, { transform: 'translate(0, 0) scale(1)', opacity: 1 }],
      { duration: 320, easing: POP });
  }

  /* Desktop: shrink-wrap the window to the screenshot so there is no empty margin.
     Phones keep the standard floating-window geometry. Measured from the real
     layout, so it follows whatever the window CSS does. */
  function fitLite(w) {
    const nat = w.def.natural, img = w.body.querySelector('.wm-cert-img');
    if (!nat || !img || isMobile()) return;
    const box = img.parentElement;
    const bw = box.clientWidth, bh = box.clientHeight;
    if (!bw || !bh) return;
    const r = w.el.getBoundingClientRect();
    const extraW = r.width - bw, extraH = r.height - bh;          // title bar, borders, padding
    const vw = window.innerWidth, vh = window.innerHeight, ds = dockSpace(), ts = topSpace();
    const left = iconsW(), right = sidebarW();
    const maxW = vw - left - right - 24, maxH = vh - ds - ts - 20;
    const k = Math.min(1, (maxW - extraW) / nat.w, (maxH - extraH) / nat.h);
    const W = Math.max(Math.min(MIN_W, maxW), Math.round(nat.w * k + extraW));
    const H = Math.max(Math.min(MIN_H, maxH), Math.round(nat.h * k + extraH));
    w.rect = {
      w: W, h: H,
      x: clamp(left + (vw - left - right - W) / 2, 8, vw - W - 8),
      y: clamp(ts + (vh - ds - ts - H) / 2, ts + 8, vh - ds - H)
    };
    applyRect(w);
  }

  function closeShots(instant) {
    wins.forEach(x => { if (x.def.lite) closeWindow(x, instant); });
  }

  function openShot(a, owner, frameWin) {
    const href = a.href;
    const card = a.closest('.portfolio-wrap, .portfolio-item');
    const thumb = card && card.querySelector('img');
    const name = ((thumb && thumb.alt) || (a.getAttribute('aria-label') || '')
      .replace(/^Open\s+/i, '').replace(/\s+screenshot$/i, '') || 'Screenshot').trim();
    const id = 'shot:' + (normPath(href) || href);

    /* where the thumbnail sits on the desktop (iframe offset + its own position) */
    let origin = null;
    try {
      const fr = frameWin && frameWin.frameElement && frameWin.frameElement.getBoundingClientRect();
      const tr = (card || a).getBoundingClientRect();
      if (fr) origin = { left: fr.left + tr.left, top: fr.top + tr.top, width: tr.width, height: tr.height };
    } catch (err) { /* cross-origin: plain pop */ }

    const existing = wins.get(id);
    if (existing) { focusWindow(existing); return; }
    closeShots(true);                                  // one screenshot at a time, like a lightbox

    const def = {
      id, title: (owner ? owner.def.title + ' \u00b7 ' : '') + name, sub: name,
      icon: 'fa-solid fa-image', image: href, lite: true, permanent: false,
      size: [940, 680], dockClass: 'dock-app', natural: null
    };
    /* Preload so the window can open at the image's own proportions */
    const probe = new Image();
    let opened = false;
    const go = () => {
      if (opened) return;
      opened = true;
      if (probe.naturalWidth) def.natural = { w: probe.naturalWidth, h: probe.naturalHeight };
      if (!wins.has(id)) openWindow(def, undefined, origin);
    };
    probe.onload = go;
    probe.onerror = go;
    setTimeout(go, 1500);
    probe.src = href;
  }

  /* Listen inside a project iframe. Capture phase on the frame's document runs before
     GLightbox and main.js, exactly like the certificate cards above. */
  const boundDocs = new WeakSet();
  function bindShots(d, owner) {
    if (!d || boundDocs.has(d)) return;
    boundDocs.add(d);
    d.addEventListener('click', e => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target && e.target.closest && e.target.closest('a.glightbox');
      if (!a || !a.href) return;
      const path = normPath(a.href);
      if (!path || !IMG.test(path)) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openShot(a, owner, d.defaultView);
    }, true);
    /* Esc while the project page has focus */
    d.addEventListener('keydown', e => { if (e.key === 'Escape') closeShots(); });
  }

  /* Esc closes the screenshot window */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = Array.from(wins.values()).filter(x => x.def.lite);
    if (open.length) { e.preventDefault(); closeShots(); }
  });

  /* =====================================================================
   * 8. WIRING: dock, links, deep links
   * ===================================================================== */
  function dockActivate(id) {
    const w = wins.get(id);
    if (!w) { if (id === 'files') filesDismissed = false; openWindow(id); return; }
    if (w.state === 'min') restore(w);
    else if (id === 'files') focusWindow(w);          // Files: bring forward, don't toggle away
    else if (w === focused) minimize(w);   // clicking the active app's icon minimizes it
    else focusWindow(w);
  }

  function titleFromLink(a) {
    if (a.dataset.title) return a.dataset.title;
    const card = a.closest('.portfolio-item, .portfolio-wrap, article, li');
    const h = card && card.querySelector('h1, h2, h3, h4, h5');
    if (h && h.textContent.trim()) return h.textContent.trim();
    if (a.title) return a.title;
    return (a.textContent || '').trim() || a.pathname.split('/').filter(Boolean).pop() || 'Project';
  }

  const IMG = /\.(png|jpe?g|webp|gif|svg|avif|pdf)$/i;

  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    /* 1) Anything with data-app="..." (dock buttons, hero/about buttons, cards) */
    const appEl = e.target.closest('[data-app]');
    if (appEl) {
      const id = appEl.getAttribute('data-app');
      if (!defs.has(id) && !wins.has(id)) return;
      e.preventDefault();
      if (appEl.closest('.linux-dock')) dockActivate(id); else openWindow(id);
      /* launcher menu (dock Menu button) closes after picking an app */
      const launcher = document.getElementById('app-menu'), mb = document.getElementById('dock-menu-btn');
      if (launcher && mb && appEl.closest('#app-menu') && launcher.classList.contains('open')) mb.click();
      return;
    }

    const a = e.target.closest('a[href]');
    if (!a || a.hasAttribute('download')) return;
    const href = a.getAttribute('href');

    /* 2) Existing in-page links: <a href="#resume">, <a href="#portfolio"> */
    if (href === '#resume' || href === '#portfolio') {
      e.preventDefault();
      openWindow(href.slice(1));
      return;
    }

    /* 3) Links to a known project page open that project's window */
    const path = normPath(a.href);
    if (path === null) return;                              // external → normal behaviour
    for (const d of defs.values()) {
      if (d.url && normPath(d.url) === path) {
        e.preventDefault();
        /* Opened from inside a GLightbox caption: close the lightbox first,
           otherwise it would sit on top of the new window. */
        const gclose = a.closest('.glightbox-container') &&
          document.querySelector('.glightbox-container .gclose');
        if (gclose) gclose.click();
        openWindow(d);
        return;
      }
    }

    /* 4) Any other project link clicked inside the Portfolio app opens as a window too */
    if (a.closest('[data-wm-app="portfolio"]') &&
        !a.matches('.glightbox, [target="_blank"]') &&
        !href.startsWith('#') && !IMG.test(path)) {
      e.preventDefault();
      openWindow({
        id: 'project:' + path, title: titleFromLink(a), icon: 'fa-solid fa-window-maximize',
        url: a.pathname + a.search, permanent: false, size: [1000, 720], dockClass: 'dock-app'
      });
    }
  });

  /* =====================================================================
   * 8b. TOP PANEL: dropdowns (My Work, theme) and the clock.
   *     The focused-window title is updated in refreshDock().
   * ===================================================================== */
  function initPanel() {
    const panel = document.getElementById('top-panel');
    if (!panel) return;
    const menus = Array.from(panel.querySelectorAll('.panel-menu'));
    const partsOf = m => ({ btn: m.querySelector('.panel-btn'), pop: m.querySelector('.panel-dropdown, .panel-popover') });
    const closeAll = except => menus.forEach(m => {
      if (m === except) return;
      const { btn, pop } = partsOf(m);
      if (!btn || !pop) return;
      pop.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    });
    menus.forEach(m => {
      const { btn, pop } = partsOf(m);
      if (!btn || !pop) return;
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const willOpen = pop.hidden;
        closeAll(m);
        pop.hidden = !willOpen;
        btn.setAttribute('aria-expanded', String(willOpen));
      });
    });
    document.addEventListener('click', e => { if (!e.target.closest('.panel-menu')) closeAll(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
    /* picking a project from My Work opens its window (data-app) and closes the menu */
    panel.addEventListener('click', e => { if (e.target.closest('[data-app]')) closeAll(); });

    const clock = document.getElementById('panel-clock');
    if (clock) {
      const tick = () => {
        clock.textContent = new Date().toLocaleString([], {
          weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });
      };
      tick();
      setInterval(tick, 15000);
    }
  }

  /* =====================================================================
   * 8c. DESKTOP WIDGETS: About sticky note
   *     The note is a floating widget on desktop (drag the header, resize the
   *     corner). It never closes, has no dock icon, and Restart resets it.
   *     Below 992px it is a normal block in the page and these handlers sleep.
   * ===================================================================== */
  const note = document.getElementById('about');
  const NOTE_MIN_W = 260, NOTE_MIN_H = 160, NOTE_MARGIN = 10, NOTE_GAP = 12;
  const isDesk = () => window.innerWidth >= 992;
  let noteMoved = false;

  /* Default spot: directly under the notification panel, same width, right-aligned.
     If the panel is hidden (bell), the note rises to sit just under the top panel. */
  function noteDefaults() {
    const ts = topSpace();
    const hero = document.getElementById('hero');
    const w = hero ? hero.offsetWidth : 340;
    /* offsetHeight is unaffected by the collapse transform, so the note keeps its
       place under the (open-size) hero panel even while the hero is hidden */
    const top = hero ? hero.offsetTop + hero.offsetHeight + NOTE_GAP : ts + 8;
    const h = clamp(window.innerHeight - top - 16, NOTE_MIN_H, 360);
    return { left: NOTE_MARGIN, top: Math.round(top), w, h };
  }

  function setNoteRect(r) {
    note.style.left = Math.round(r.left) + 'px';
    note.style.top = Math.round(r.top) + 'px';
    note.style.width = Math.round(r.w) + 'px';
    note.style.height = Math.round(r.h) + 'px';
  }

  function resetNote(animate) {
    if (!note) return;
    noteMoved = false;
    const body = note.querySelector('.sticky-body');
    if (body) body.scrollTop = 0;
    if (!isDesk()) {                                  // small screens: plain block in the page
      ['left', 'top', 'width', 'height'].forEach(p => { note.style[p] = ''; });
      return;
    }
    const d = noteDefaults();
    setNoteRect(d);
    if (animate && !reduceMotion()) {
      note.animate([
        { opacity: 0, transform: 'scale(.9)' },
        { opacity: 1, transform: 'scale(1)' }
      ], { duration: 320, easing: POP });
    }
  }

  function keepNoteInView() {
    if (!note || !isDesk()) return;
    if (!noteMoved) { resetNote(false); return; }
    const vw = window.innerWidth, vh = window.innerHeight, ts = topSpace();
    const r = note.getBoundingClientRect();
    const w = clamp(r.width, NOTE_MIN_W, vw - 16), h = clamp(r.height, NOTE_MIN_H, vh - ts - 16);
    setNoteRect({
      left: clamp(r.left, 0, vw - w), top: clamp(r.top, ts, vh - 48), w, h
    });
  }

  function flashNote() {
    if (!note) return;
    if (!isDesk()) { note.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    note.classList.remove('is-flash');
    void note.offsetWidth;                            // restart the animation
    note.classList.add('is-flash');
    setTimeout(() => note.classList.remove('is-flash'), 1100);
  }

  function initNote() {
    if (!note) return;
    const handle = note.querySelector('.sticky-handle');
    const grip = note.querySelector('.sticky-resize');
    let zNote = 14;
    const raise = () => { note.style.zIndex = ++zNote > 40 ? (zNote = 15) : zNote; };

    /* drag by the header */
    handle.addEventListener('pointerdown', e => {
      if (!isDesk() || e.button !== 0) return;
      raise();
      const r = note.getBoundingClientRect();
      const offX = e.clientX - r.left, offY = e.clientY - r.top;
      note.classList.add('is-dragging');
      try { handle.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      const move = ev => {
        const vw = window.innerWidth, vh = window.innerHeight, ts = topSpace();
        noteMoved = true;
        note.style.left = clamp(ev.clientX - offX, 0, vw - note.offsetWidth) + 'px';
        note.style.top = clamp(ev.clientY - offY, ts, vh - 48) + 'px';
      };
      const up = () => {
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', up);
        handle.removeEventListener('pointercancel', up);
        note.classList.remove('is-dragging');
      };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
      handle.addEventListener('pointercancel', up);
    });

    /* resize from the bottom-right corner */
    grip.addEventListener('pointerdown', e => {
      if (!isDesk() || e.button !== 0) return;
      e.preventDefault();
      raise();
      const r = note.getBoundingClientRect();
      const sx = e.clientX, sy = e.clientY;
      note.classList.add('is-dragging');
      try { grip.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      const move = ev => {
        const vw = window.innerWidth, vh = window.innerHeight;
        noteMoved = true;
        note.style.width = clamp(r.width + ev.clientX - sx, NOTE_MIN_W, vw - r.left - 8) + 'px';
        note.style.height = clamp(r.height + ev.clientY - sy, NOTE_MIN_H, vh - r.top - 8) + 'px';
      };
      const up = () => {
        grip.removeEventListener('pointermove', move);
        grip.removeEventListener('pointerup', up);
        grip.removeEventListener('pointercancel', up);
        note.classList.remove('is-dragging');
      };
      grip.addEventListener('pointermove', move);
      grip.addEventListener('pointerup', up);
      grip.addEventListener('pointercancel', up);
    });

    note.addEventListener('pointerdown', () => { if (isDesk()) raise(); }, true);

    /* the bell only collapses the hero panel: the note does not follow it */
    resetNote(false);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!noteMoved) resetNote(false); });
    window.addEventListener('load', () => { if (!noteMoved) resetNote(false); });
  }

  /* Certificate cards inside Portfolio (thumbnail or its maximize button) open the
     certificate WINDOW instead of the GLightbox overlay. Capture phase: runs before
     GLightbox / main.js see the click. */
  document.addEventListener('click', e => {
    if (e.button !== 0) return;
    const t = e.target.closest(
      '.portfolio-item.filter-certifications a.glightbox, ' +
      '.portfolio-item.filter-certifications .portfolio-image-link, ' +
      '.portfolio-item.filter-certifications [data-portfolio-maximize]');
    if (!t) return;
    const item = t.closest('.portfolio-item');
    const full = (item && item.getAttribute('data-full-image')) || t.getAttribute('href') || '';
    const def = CERTS.find(c => full.endsWith(c.image.split('/').pop()));
    if (!def) return;                                // unknown cert: leave the old behaviour
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    openWindow('cert:' + def.id);
  }, true);

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-desktop]');
    if (!b) return;
    e.preventDefault();
    if (b.getAttribute('data-desktop') === 'about') flashNote();
  });

  /* =====================================================================
   * 8d. CONKY: decorative system monitor with fake, gently fluctuating data.
   *     Bars glide (CSS), line graphs scroll one step per second (WAAPI).
   * ===================================================================== */
  function initConky() {
    const root = document.getElementById('conky');
    if (!root) return;
    const NS = 'http://www.w3.org/2000/svg';
    const N = 40, VW = 200, VH = 36, STEP = VW / (N - 1);
    const rnd = (a, b) => a + Math.random() * (b - a);
    const walk = (v, target, k, sigma, lo, hi) => clamp(v + (target - v) * k + rnd(-sigma, sigma), lo, hi);
    const pad = n => String(Math.floor(n)).padStart(2, '0');
    const out = k => root.querySelector('[data-cky="' + k + '"]');
    const setBar = (bar, p) => { if (bar) bar.style.setProperty('--p', clamp(p, 0, 1).toFixed(3)); };

    /* ----- line graphs ----- */
    function makeGraph(key, nSeries) {
      const svg = root.querySelector('[data-cky-graph="' + key + '"]');
      if (!svg) return null;
      const g = document.createElementNS(NS, 'g');
      const series = [];
      for (let i = 0; i < nSeries; i++) {
        const area = i === 0 ? document.createElementNS(NS, 'path') : null;
        const line = document.createElementNS(NS, 'path');
        line.setAttribute('class', 'ln' + (i ? ' s' + (i + 1) : ''));
        if (area) { area.setAttribute('class', 'ar'); g.appendChild(area); }
        g.appendChild(line);
        series.push({ vals: new Array(N + 1).fill(0), line, area });
      }
      svg.appendChild(g);
      return { g, series };
    }
    const yOf = (v, max) => (VH - 2 - clamp(v / max, 0, 1) * (VH - 5)).toFixed(1);
    function draw(graph, max) {
      graph.series.forEach(s => {
        let d = '';
        s.vals.forEach((v, i) => { d += (i ? 'L' : 'M') + ((i - 1) * STEP).toFixed(1) + ' ' + yOf(v, max) + ' '; });
        s.line.setAttribute('d', d);
        if (s.area) s.area.setAttribute('d', d + 'L' + ((N - 1) * STEP).toFixed(1) + ' ' + VH + ' L' + (-STEP).toFixed(1) + ' ' + VH + ' Z');
      });
    }
    function push(graph, values, max, animate) {
      graph.series.forEach((s, i) => { s.vals.shift(); s.vals.push(values[i]); });
      draw(graph, max);
      if (animate && !reduceMotion() && graph.g.animate) {
        graph.g.animate([{ transform: 'translateX(' + STEP + 'px)' }, { transform: 'translateX(0)' }],
          { duration: 1000, easing: 'linear' });
      }
    }

    const gCpu = makeGraph('cpu', 1), gNet = makeGraph('net', 2);
    const bars = root.querySelectorAll('.cky-bar');
    const coreBars = root.querySelectorAll('.cky-cores .cky-bar');
    const ramBar = bars[coreBars.length], diskBar = bars[coreBars.length + 1], procBar = bars[coreBars.length + 2];

    /* ----- simulated machine ----- */
    const st = {
      cpu: 14, cpuT: 16, cores: [12, 15, 10, 18],
      ram: 6.1, disk: 318.4, dr: 4, dw: 2,
      down: 420, up: 60, downT: 400, upT: 60,
      procs: 187, running: 2,
      up0: 12 * 86400 + 4 * 3600 + 31 * 60 + 9, t0: Date.now()
    };
    const RAM_TOTAL = 16, DISK_TOTAL = 512, PROC_MAX = 400;

    const rate = kb => kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB/s' : Math.round(kb) + ' KB/s';

    function step() {
      if (Math.random() < 0.07) st.cpuT = rnd(24, 58); else if (Math.random() < 0.2) st.cpuT = rnd(9, 22);
      st.cpu = walk(st.cpu, st.cpuT, 0.22, 2.2, 3, 92);
      st.cores = st.cores.map(c => walk(c, st.cpu, 0.35, 5, 1, 99));
      st.ram = walk(st.ram, 6.1, 0.01, 0.05, 4.6, 8.2);
      st.disk = clamp(st.disk + rnd(0, 0.004), 0, DISK_TOTAL);
      st.dr = Math.random() < 0.08 ? rnd(25, 70) : walk(st.dr, 3, 0.3, 1.2, 0, 90);
      st.dw = Math.random() < 0.06 ? rnd(12, 40) : walk(st.dw, 1.5, 0.3, 0.8, 0, 60);
      if (Math.random() < 0.08) st.downT = rnd(900, 4200); else if (Math.random() < 0.2) st.downT = rnd(120, 600);
      if (Math.random() < 0.08) st.upT = rnd(150, 700); else if (Math.random() < 0.2) st.upT = rnd(20, 120);
      st.down = walk(st.down, st.downT, 0.25, 60, 8, 6000);
      st.up = walk(st.up, st.upT, 0.25, 14, 2, 1200);
      st.procs = Math.round(walk(st.procs, 187, 0.05, 2.2, 168, 224));
      st.running = Math.random() < 0.25 ? Math.floor(rnd(1, 5)) : st.running;
    }

    function render(animate) {
      out('cpu').textContent = Math.round(st.cpu) + '%';
      coreBars.forEach((b, i) => setBar(b, st.cores[i] / 100));
      out('ram').textContent = st.ram.toFixed(1) + ' / ' + RAM_TOTAL + ' GiB';
      setBar(ramBar, st.ram / RAM_TOTAL);
      out('disk').textContent = Math.round(st.disk) + ' / ' + DISK_TOTAL + ' GiB';
      setBar(diskBar, st.disk / DISK_TOTAL);
      out('dr').textContent = st.dr.toFixed(1) + ' MB/s';
      out('dw').textContent = st.dw.toFixed(1) + ' MB/s';
      out('down').textContent = '\u2193 ' + rate(st.down);
      out('up').textContent = '\u2191 ' + rate(st.up);
      out('procs').textContent = st.procs + ' total';
      setBar(procBar, st.procs / PROC_MAX);
      out('running').textContent = st.running;
      const u = st.up0 + (Date.now() - st.t0) / 1000;
      out('uptime').textContent = Math.floor(u / 86400) + 'd ' + pad((u % 86400) / 3600) + ':' + pad((u % 3600) / 60) + ':' + pad(u % 60);
      const netMax = Math.max(400, ...gNet.series[0].vals, ...gNet.series[1].vals, st.down) * 1.15;
      if (gCpu) push(gCpu, [st.cpu], 100, animate);
      if (gNet) push(gNet, [st.down, st.up], netMax, animate);
    }

    /* pre-fill the history so the graphs are not empty on load */
    for (let i = 0; i < N; i++) { step(); render(false); }
    render(false);
    setInterval(() => { if (document.hidden || !root.getClientRects().length) return; step(); render(true); }, 1000);
  }

  /* =====================================================================
   * 8e. RIGHT COLUMN: live month count for the current role, and scale the
   *     Experience + Skills column to fit the screen height (nothing is cut).
   * ===================================================================== */
  function initRightColumn() {
    const col = document.getElementById('desk-right');
    if (!col) return;
    const now = new Date();
    col.querySelectorAll('[data-since]').forEach(b => {
      const [y, m] = b.getAttribute('data-since').split('-').map(Number);
      const months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m) + 1;   // inclusive
      const v = b.querySelector('[data-months]');
      if (v) v.textContent = months + ' mos';
      const bar = b.querySelector('.cky-bar');
      if (bar) bar.style.setProperty('--p', clamp(months / 63, 0, 1).toFixed(3));
    });
    const fit = () => {
      col.style.transform = '';
      if (!isDesk()) return;
      const avail = window.innerHeight - col.getBoundingClientRect().top - 16;
      const k = clamp(avail / col.offsetHeight, 0.6, 1);
      if (k < 1) col.style.transform = 'scale(' + k.toFixed(3) + ')';
    };
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('load', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }

  /* =====================================================================
   * 9. BOOT
   * ===================================================================== */
  function boot() {
    document.body.append(layer, store);
    buildDock();
    initPanel();

    /* Park Resume/Portfolio off-page; nothing opens on first load.
       (They stay in the DOM, so content is still there for crawlers.) */
    Object.values(APPS).forEach(a => {
      const node = a.adopt && document.querySelector(a.adopt);
      if (node) store.appendChild(node);
    });

    refreshDock();
    initNote();
    initConky();
    initRightColumn();
    desktopMode = window.innerWidth >= 992;
    const h = location.hash;                       // shareable deep links: /#resume, /#portfolio
    if (h === '#resume' || h === '#portfolio') openWindow(h.slice(1));

    /* File Explorer opens by itself on first load (desktop only), after the preloader.
       A deep-linked window keeps the focus. */
    const openFiles = () => setTimeout(() => {
      if (!isDesk() || filesDismissed || wins.has('files')) return;
      const prev = focused;
      openWindow('files');
      if (prev && wins.has(prev.id)) focusWindow(prev);
    }, 250);
    if (document.readyState === 'complete') openFiles();
    else window.addEventListener('load', openFiles, { once: true });
  }

  window.WindowManager = { open: openWindow, close: id => wins.has(id) && closeWindow(wins.get(id)), windows: wins };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();