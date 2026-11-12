/**
 * Window Manager
 * One reusable system for every app window (Resume, Portfolio, each project).
 * Vanilla JS, no dependencies. Load AFTER main.js (needs the existing taskbar/theme).
 */
(function () {
  'use strict';

  /* =====================================================================
   * 1. CONFIG: the only part you normally need to edit
   * ===================================================================== */

  /* Apps (Resume, Portfolio, Socials). Hobbies & Interests is no longer a window:
     it is a top-panel applet (#df-pop, assets/js/dotfiles.js).
     `adopt` = an existing <section> on the page that is moved
     into the window (so your current Resume/Portfolio markup is reused as-is).
     `url` = optional iframe fallback if that section isn't on the page. */
  const APPS = {
    resume: {
      title: 'Resume', icon: 'fa-solid fa-timeline',
      adopt: '#resume', size: [800, 600]
    },
    portfolio: {
      title: 'Projects', icon: 'fa-solid fa-flask',
      adopt: '#portfolio', size: [1000, 640], center: true
    },
    socials: {
      title: 'Socials', icon: 'fa-solid fa-share-nodes',
      adopt: '#socials', size: [540, 360], center: true, static: true
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
     (drag, resize, minimize, close, taskbar button). `image` is the full certificate. */
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
    html{scroll-behavior:auto}
    *{scrollbar-width:thin;scrollbar-color:color-mix(in srgb,var(--accent-highlight,var(--accent-color,#888)) 40%,transparent) transparent}
    *:hover{scrollbar-color:color-mix(in srgb,var(--accent-highlight,var(--accent-color,#888)) 65%,transparent) transparent}
    /* translucent: the window glass shows through the project page */
    html,body,main,section,.section,.light-background,.dark-background{background:transparent!important}
    /* no divider lines */
    hr{display:none!important}
    section,.section,header,footer,.section-title,.page-title .container{border-top:0!important;border-bottom:0!important}
    /* generic fallback for pages that use plain .card / *-card markup */
    [class~="card"],[class*="-card "],[class$="-card"]{border:1px solid color-mix(in srgb,var(--default-color,#fff) 18%,var(--surface-color,#222))!important;border-radius:12px!important;box-shadow:none!important;background:var(--surface-color,#222)!important}`;

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
  const taskbarBtns = new Map();  // id -> taskbar <button>
  const frames = new Set();    // live iframes (for theme sync)
  let zTop = 1, focused = null, cascade = 0;
  let panel, taskbarApps;

  Object.entries(APPS).forEach(([id, d]) => defs.set(id, Object.assign({ id }, d)));
  CERTS.forEach(c => defs.set('cert:' + c.id, Object.assign({}, c, {
    id: 'cert:' + c.id, icon: 'fa-solid fa-file-pdf',
    size: [940, 680]
  })));
  PROJECTS.forEach(p => defs.set('project:' + p.id, Object.assign({}, p, {
    id: 'project:' + p.id, size: [1000, 720]
  })));

  /* ---------- Taskbar (the bottom panel) ----------
     One button per open window, inside #taskbar-apps. The active window's button is highlighted,
     minimized windows are dimmed. Nothing is pinned: the Menu button launches apps. */
  const TOP_INSET = 0;   // nothing sits along the top edge any more, windows may use the full height

  function makeTaskbarBtn(def) {
    const b = el('button', {
      type: 'button', class: 'taskbar-item',
      'data-app': def.id, 'aria-label': def.title, title: def.title
    });
    b.innerHTML = '<i aria-hidden="true" class="' + def.icon + '"></i><span class="taskbar-label"></span>';
    b.querySelector('.taskbar-label').textContent = def.title;
    return b;
  }

  function buildTaskbar() {
    panel = document.getElementById('top-panel');
    if (!panel) return;
    taskbarApps = document.getElementById('taskbar-apps');
    if (!taskbarApps) {
      taskbarApps = el('div', { class: 'taskbar-apps', id: 'taskbar-apps', role: 'toolbar', 'aria-label': 'Open applications' });
      (panel.querySelector('.panel-center') || panel).appendChild(taskbarApps);
    }
  }

  /* Tell the CSS how much space the taskbar takes at the bottom */
  function syncTaskbarVar() {
    document.documentElement.style.setProperty('--taskbar-space', taskbarSpace() + 'px');
  }

  /* Scroll the taskbar strip so the given app's button is fully visible */
  function revealTaskbarBtn(btn) {
    if (!btn || !taskbarApps || btn.parentNode !== taskbarApps) return;
    if (taskbarApps.scrollWidth <= taskbarApps.clientWidth) return;
    const l = btn.offsetLeft, r = l + btn.offsetWidth;
    if (l < taskbarApps.scrollLeft) taskbarApps.scrollTo({ left: l - 4, behavior: 'smooth' });
    else if (r > taskbarApps.scrollLeft + taskbarApps.clientWidth) taskbarApps.scrollTo({ left: r - taskbarApps.clientWidth + 4, behavior: 'smooth' });
  }

  function refreshTaskbar() {
    taskbarBtns.forEach((btn, id) => {
      const w = wins.get(id);
      const active = !!w && w === focused && w.state !== 'min';
      btn.classList.toggle('is-active', active);
      btn.classList.toggle('is-minimized', !!w && w.state === 'min');
      btn.setAttribute('aria-pressed', String(active));
    });
    syncTaskbarVar();
    if (focused && focused.taskbarBtn) revealTaskbarBtn(focused.taskbarBtn);
    const anyVisible = Array.from(wins.values()).some(w => w.state !== 'min');
    document.body.classList.toggle('wm-has-window', anyVisible);
  }

  /* Vertical space to keep clear along the bottom edge for the taskbar */
  function taskbarSpace() {
    if (isMobile()) return 122;   // phones: keep the floating icon dock + search bar (android.js) clear
    if (!panel) return 56;
    const r = panel.getBoundingClientRect();
    if (!r.height) return 56;
    return Math.max(0, Math.round(window.innerHeight - r.top)) + 8;
  }

  /* =====================================================================
   * 4. GEOMETRY
   * ===================================================================== */
  function targetRect(w) {
    const vw = window.innerWidth, vh = window.innerHeight, ds = taskbarSpace(), ts = TOP_INSET;
    /* phones: a floating window with a visible margin, never edge-to-edge */
    if (isMobile()) return mobileRect(w, vw, vh, ds, ts);
    if (w.state === 'max') return { x: 0, y: ts, w: vw, h: vh - ds - ts };
    return w.rect;
  }

  /* Phones. Every window sits in the same slot above the taskbar:
     - screenshot windows shrink-wrap the image (title bar + small padding + image)
     - project windows (iframe pages) are ~62% of the screen, centred in the slot
     - everything else (Resume, Portfolio, ...) keeps the full-height slot */
  const MOBILE_PROJECT_H = 0.95;   // project pages get (almost) the whole slot above the taskbar
  function mobileRect(w, vw, vh, ds, ts) {
    const L = 8, top = 44;   // phones: start below the status bar
    const availW = vw - L * 2, availH = Math.max(240, vh - ds - top - 4);

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

    const h = availH;   // phones: use the whole slot between the status bar and the dock
return { x: L, y: Math.round(top + (availH - h) / 2), w: availW, h };
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
  function iconsW() { return 0; }     // desktop icons were removed

  /* Wallpaper first: hero, right column and the Portfolio window are hidden (html.desk-pre) until the
     wallpaper has been on screen for a moment; then they fade in one after another. */
  const WALLPAPER_MS = 1400, PORTFOLIO_AFTER_MS = 900;
  function revealDesktop() {
    return new Promise(res => setTimeout(() => {
      const de = document.documentElement;
      de.classList.remove('desk-pre');
      de.classList.add('desk-reveal');                       // CSS animations (staggered)
      /* replay the Experience bars' own grow animation so it plays now, as the column appears */
      document.querySelectorAll('.desk-right .cky-bar > i').forEach(i => { i.style.animation = 'none'; void i.offsetWidth; i.style.animation = ''; });
      setTimeout(() => de.classList.remove('desk-reveal'), 2400);
      res();
    }, WALLPAPER_MS));
  }

  /* Restart: close every window, reset the About card, then reveal the desktop again */
  let restarting = false;
  /* Boot screen shown on Restart: LineageOS-style on phones, Linux Mint-style on desktop.
     Colours come from the theme variables (see "Boot sequence" in desktop.css). */
  const BOOT_LINEAGE = '<svg class="boot-logo" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M21.64526 12.05735a2.40391 2.40391 0 0 0-1.80293.7993l-.13823-.0541a17.80096 17.80096 0 0 0-2.86666-.8594 4.80782 4.80782 0 0 0-9.61565 0h-.13221a17.74687 17.74687 0 0 0-2.7645.83537l-.13822.05409a2.40391 2.40391 0 1 0 .5589 1.06974 16.599 16.599 0 0 1 2.5782-.77526 4.80782 4.80782 0 0 0 9.35722 0 16.55693 16.55693 0 0 1 2.5782.76925 2.40391 2.40391 0 1 0 2.38588-1.839zM2.41397 15.6632a1.20196 1.20196 0 1 1 1.20196-1.20195 1.20196 1.20196 0 0 1-1.20196 1.20195zm9.61565 0a3.60587 3.60587 0 1 1 3.60586-3.60586 3.60587 3.60587 0 0 1-3.60586 3.60586zm9.61564 0a1.20196 1.20196 0 1 1 1.20196-1.20195 1.20196 1.20196 0 0 1-1.20196 1.20195zm-7.81271-3.60586a1.80293 1.80293 0 1 1-1.80293-1.80294 1.80293 1.80293 0 0 1 1.80293 1.80294z"/>' +
    '</svg>';
  const BOOT_MINT = '<svg class="boot-logo" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M5.438 5.906v8.438c0 2.06 1.69 3.75 3.75 3.75h5.625c2.06 0 3.75-1.69 3.75-3.75V9.656a2.827 2.827 0 0 0-2.813-2.812 2.8 2.8 0 0 0-1.875.737A2.8 2.8 0 0 0 12 6.844a2.827 2.827 0 0 0-2.812 2.812v4.688h1.875V9.656c0-.529.408-.937.937-.937s.938.408.938.937v4.688h1.875V9.656c0-.529.408-.937.937-.937s.938.408.938.937v4.688a1.86 1.86 0 0 1-1.875 1.875H9.188a1.86 1.86 0 0 1-1.875-1.875V5.906ZM12 0C5.384 0 0 5.384 0 12s5.384 12 12 12 12-5.384 12-12S18.616 0 12 0m0 1.875A10.11 10.11 0 0 1 22.125 12 10.11 10.11 0 0 1 12 22.125 10.11 10.11 0 0 1 1.875 12 10.11 10.11 0 0 1 12 1.875"/>' +
    '</svg><div class="boot-bar"><i></i></div>';

  function bootSequence() {
    const mobile = isMobile(), still = reduceMotion();
    const ms = still ? 1200 : (mobile ? 3600 : 3400);
    const box = document.createElement('div');
    box.id = 'boot-screen';
    box.className = 'boot-screen ' + (mobile ? 'boot-lineage' : 'boot-mint');
    box.setAttribute('role', 'status');
    box.setAttribute('aria-label', 'Restarting');
    box.style.setProperty('--boot-ms', ms + 'ms');
    box.innerHTML = mobile ? BOOT_LINEAGE : BOOT_MINT;
    document.body.appendChild(box);
    void box.offsetWidth;
    box.classList.add('is-on');
    const wait = t => new Promise(r => setTimeout(r, t));
    return {
      covered: wait(still ? 0 : 350),                          // fully faded in
      done: async () => {
        await wait(ms);
        box.classList.remove('is-on');
        await wait(still ? 0 : 450);
        box.remove();
      }
    };
  }

  async function restartDesktop() {
    if (restarting) return;
    restarting = true;
    const boot = bootSequence();
    await boot.covered;
    document.documentElement.classList.add('desk-pre');      // hide the desktop until it is revealed again
    await Promise.all(Array.from(wins.values()).map(w => closeWindow(w, true)));
    cascade = 0;
    window.scrollTo(0, 0);
    flashAbout(false);
    await boot.done();                               // boot animation plays out, then fades to the wallpaper
    await revealDesktop();
    document.dispatchEvent(new CustomEvent('desktop:booted'));   // every widget is up: the chatbot may load now
    restarting = false;                              // all windows stay closed after a restart
  }

  function initialRect(def) {
    const vw = window.innerWidth, vh = window.innerHeight, ds = taskbarSpace(), ts = TOP_INSET;
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
    const vw = window.innerWidth, vh = window.innerHeight, ds = taskbarSpace(), ts = TOP_INSET;
    w.rect.x = clamp(w.rect.x, 150 - w.rect.w, vw - 100);
    w.rect.y = clamp(w.rect.y, ts, vh - ds);
  }

  /* When the browser is resized: shrink a window that no longer fits and pull
     it fully back on screen (above the taskbar) so content is never cut off. */
  function fitToViewport(w) {
    if (isMobile() || w.state === 'max') return;
    const vw = window.innerWidth, vh = window.innerHeight, ds = taskbarSpace(), ts = TOP_INSET;
    const r = w.rect;
    r.w = clamp(r.w, Math.min(MIN_W, vw), vw);
    r.h = clamp(r.h, Math.min(MIN_H, vh - ds - ts), vh - ds - ts);
    r.x = clamp(r.x, 0, vw - r.w);
    r.y = clamp(r.y, ts, vh - ds - r.h);
  }

  /* =====================================================================
   * 5. ANIMATION  (Web Animations API, like main.js)
   * ===================================================================== */
  function taskbarDelta(w) {
    const btn = w.taskbarBtn;
    const d = btn.getBoundingClientRect();
    const r = w.el.getBoundingClientRect();
    return {
      dx: d.left + d.width / 2 - (r.left + r.width / 2),
      dy: d.top + d.height / 2 - (r.top + r.height / 2)
    };
  }

  /* Grow out of the taskbar button (open / restore) */
  function flyIn(w) {
    if (reduceMotion()) return Promise.resolve();
    const { dx, dy } = taskbarDelta(w);
    const a = w.el.animate([
      { transform: `translate(${dx}px, ${dy}px) scale(.05)`, opacity: 0 },
      { transform: `translate(${dx * 0.25}px, ${dy * 0.25}px) scale(.7)`, opacity: 0.9, offset: 0.55 },
      { transform: 'translate(0, 0) scale(1)', opacity: 1 }
    ], { duration: 380, easing: POP });
    return a.finished.catch(() => {});
  }

  /* Shrink into the taskbar button (minimize). Returns the animation so the caller
     can commit the hidden state first, then cancel it (no flash). */
  function flyOut(w) {
    if (reduceMotion()) return Promise.resolve(null);
    const { dx, dy } = taskbarDelta(w);
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
      state: 'normal', rect: initialRect(def), busy: false, taskbarBtn: null, adopted: null
    };

    /* Controls */
    root.querySelector('.wm-close').addEventListener('click', () => closeWindow(w));
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
  function ensureTaskbarBtn(w) {
    if (!taskbarApps) return;
    if (taskbarBtns.has(w.id)) { w.taskbarBtn = taskbarBtns.get(w.id); return; }
    const b = makeTaskbarBtn(w.def);
    taskbarApps.appendChild(b);
    taskbarBtns.set(w.id, b);
    w.taskbarBtn = b;
  }

  /* Portfolio: shrink the window to its longest line of text (title, category, description, filter chip),
     instead of the fixed 760px. Capped below the 2-column breakpoint (600px) so cards stay in one column.
     Runs on open only: once you drag/resize, your size wins. */
  function fitPortfolioWidth(w, refit) {
    if (isMobile() || w.state !== 'normal' || !w.adopted) return;
    const MAX = 599, MIN = 440;
    const nodes = Array.from(w.body.querySelectorAll(
      '.portfolio-info .content h4, .portfolio-info .content p, .portfolio-info .content .category,' +
      ' .portfolio-filters li, .portfolio-terminal-title'));
    let longest = 0, ln = null, oneLine = 0;
    nodes.forEach(n => {                                   // natural (unwrapped) width of each text
      const st = n.style, prev = [st.whiteSpace, st.width, st.maxWidth];
      st.whiteSpace = 'nowrap'; st.width = 'max-content'; st.maxWidth = 'none';
      const r = n.getBoundingClientRect();
      if (r.width > longest) { longest = r.width; ln = n; oneLine = r.height; }
      [st.whiteSpace, st.width, st.maxWidth] = prev;
    });
    if (!ln) return;
    const vwMax = Math.min(MAX, window.innerWidth - 24);
    let W = Math.max(Math.min(MIN, vwMax), Math.min(vwMax, Math.round(longest + 90)));
    for (let i = 0; i < 60; i++) {                          // grow in small steps until that text no longer wraps
      w.el.style.width = W + 'px';
      if (ln.getBoundingClientRect().height <= oneLine + 2 || W >= vwMax) break;
      W = Math.min(vwMax, W + 8);
    }
    const cx = w.rect.x + w.rect.w / 2;
    w.rect.w = W;
    w.rect.x = clamp(Math.round(cx - W / 2), 8, window.innerWidth - W - 8);
    applyRect(w);
    if (!refit && document.fonts && document.fonts.ready) {   // web fonts change text widths: measure once more
      document.fonts.ready.then(() => {
        if (wins.get(w.id) === w && w.rect.w === W) fitPortfolioWidth(w, true);
      });
    }
  }

  function openWindow(def, rect, origin) {
    if (typeof def === 'string') def = defs.get(def);
    if (!def) return null;
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
    if (!def.lite) ensureTaskbarBtn(w);         // lite windows have no taskbar button
    applyRect(w);
    if (def.id === 'portfolio' && !rect) fitPortfolioWidth(w);
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
    refreshTaskbar();
    if (!w.el.contains(document.activeElement)) w.el.focus({ preventScroll: true });
  }

  function focusNext() {
    let next = null;
    wins.forEach(w => {
      if (w.state !== 'min' && (!next || +w.el.style.zIndex > +next.el.style.zIndex)) next = w;
    });
    focused = null;
    if (next) focusWindow(next); else refreshTaskbar();
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
    if (focused === w) focusNext(); else refreshTaskbar();
    pulse(w.taskbarBtn);
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
    taskbarBtns.delete(w.id);                      // the taskbar button goes away with the window
    if (w.taskbarBtn) w.taskbarBtn.remove();
    if (focused === w) { focused = null; focusNext(); } else refreshTaskbar();
  }

  /* Small press pulse on the taskbar button (after a minimize) */
  function pulse(btn) {
    if (!btn || reduceMotion()) return;
    btn.animate([{ scale: '1' }, { scale: '.88' }, { scale: '1' }], { duration: 260, easing: 'ease-out' });
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
          const vw = window.innerWidth, vh = window.innerHeight, ds = taskbarSpace();
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
            r.y = clamp(s.y + dy, TOP_INSET, bottom - minH);
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

  /* Desktop layout (>= 992px): widgets + notification panel.
     Small layout: everything stacks in the page (hero with About, widgets). */
  let desktopMode = window.innerWidth >= 992;

  function syncMode() {
    const d = window.innerWidth >= 992;
    if (d === desktopMode) return;
    desktopMode = d;
    if (!d) window.scrollTo(0, 0);
    refreshTaskbar();
  }

  window.matchMedia('(min-width: 992px)').addEventListener('change', () => syncMode());
  window.addEventListener('load', () => { syncMode(); });

  window.matchMedia('(max-width: 768px)').addEventListener('change', () => {
    refreshTaskbar();
    wins.forEach(w => { fitToViewport(w); applyRect(w); if (w.def.adopt) setTimeout(() => relayout(w), 60); });
  });

  window.addEventListener('resize', e => {
    if (e && e.isTrusted === false) return;   // ignore the synthetic event from refreshLayout()
    syncMode();
    syncTaskbarVar();
    wins.forEach(w => { fitToViewport(w); applyRect(w); });
  });

  /* Restart (panel + Ubuntu menu) */
  document.addEventListener('desktop:restart', e => { e.preventDefault(); restartDesktop(); });

  /* =====================================================================
   * 7b. SCREENSHOT WINDOWS (project pages)
   *     A screenshot opens as a certificate-style window in THIS page (above the
   *     project window) instead of a GLightbox inside the small iframe. Same
   *     title bar + fitted image as the certificates, but close-only: no
   *     minimize / maximize, not draggable, not resizable, no taskbar button.
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
    const vw = window.innerWidth, vh = window.innerHeight, ds = taskbarSpace(), ts = TOP_INSET;
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
      icon: 'fa-solid fa-image', image: href, lite: true,
      size: [940, 680], natural: null
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
   * 8. WIRING: taskbar, links, deep links
   * ===================================================================== */
  /* Taskbar button: open, restore, focus, or minimize the active one */
  function taskbarActivate(id) {
    const w = wins.get(id);
    if (!w) { openWindow(id); return; }
    if (w.state === 'min') restore(w);
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

    /* 1) Anything with data-app="..." (taskbar buttons, hero/about buttons, cards) */
    const appEl = e.target.closest('[data-app]');
    if (appEl) {
      const id = appEl.getAttribute('data-app');
      if (!defs.has(id) && !wins.has(id)) return;
      e.preventDefault();
      if (appEl.closest('.taskbar-apps')) taskbarActivate(id); else openWindow(id);
      /* launcher menu (taskbar Menu button) closes after picking an app */
      const launcher = document.getElementById('app-menu'), mb = document.getElementById('taskbar-menu-btn');
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
        url: a.pathname + a.search, size: [1000, 720]
      });
    }
  });

  /* =====================================================================
   * 8b. BOTTOM PANEL: dropdowns (theme, applets) and the clock.
   *     The open-window buttons are kept in sync by refreshTaskbar().
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
        const now = new Date();
        clock.textContent = now.toLocaleString([], {
          weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });
        /* phones show only the time (CSS reads data-short) */
        clock.setAttribute('data-short', now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
        clock.title = isMobile() ? 'Why hire me' : 'Calendar';
      };
      tick();
      setInterval(tick, 15000);
    }
    initCalendar();
  }

  /* Calendar applet (right pane of the clock popover). Sunday-first month grid. */
  function initCalendar() {
    const grid = document.getElementById('cal-grid');
    if (!grid) return;
    const title = document.getElementById('cal-title'), dateLine = document.getElementById('cal-date');
    const same = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    const monthStart = () => { const d = new Date(); d.setDate(1); return d; };
    let view = monthStart();
    function render() {
      const today = new Date();
      dateLine.textContent = today.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      title.textContent = view.toLocaleDateString([], { month: 'long', year: 'numeric' });
      const start = new Date(view.getFullYear(), view.getMonth(), 1 - new Date(view.getFullYear(), view.getMonth(), 1).getDay());
      let out = '';
      for (let i = 0; i < 42; i++) {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const t = same(d, today);
        out += '<span class="cp-day' + (d.getMonth() !== view.getMonth() ? ' is-out' : '') + (t ? ' is-today' : '') +
          '" role="gridcell"' + (t ? ' aria-current="date"' : '') + '>' + d.getDate() + '</span>';
      }
      grid.innerHTML = out;
    }
    const shift = n => { view = new Date(view.getFullYear(), view.getMonth() + n, 1); render(); };
    document.getElementById('cal-prev').addEventListener('click', () => shift(-1));
    document.getElementById('cal-next').addEventListener('click', () => shift(1));
    document.getElementById('cal-today').addEventListener('click', () => { view = monthStart(); render(); });
    document.getElementById('panel-clock').addEventListener('click', () => { view = monthStart(); render(); tickClock(); });
    render();

    /* Left pane: live clock + date above the existing "Why hire me" content and buttons.
       The date element (#cal-date) moves here, so render() keeps updating it. */
    const pop = document.querySelector('.clock-popover'), why = pop && pop.querySelector('.cp-why');
    let timeEl = null;
    if (why && !why.querySelector('.cp-clock')) {
      const box = el('div', { class: 'cp-clock' },
        '<time class="cp-time" id="cp-time"></time><span class="cp-tz"></span>');
      box.querySelector('.cp-tz').textContent = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').replace(/_/g, ' ');
      if (dateLine) box.insertBefore(dateLine, box.querySelector('.cp-tz'));
      why.prepend(box);
      timeEl = box.querySelector('#cp-time');
    }
    const timeFmt = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
    function tickClock() {
      if (!timeEl) return;
      const now = new Date(), v = {};
      timeFmt.formatToParts(now).forEach(p => { v[p.type] = p.value; });
      timeEl.innerHTML = '<span class="t-main">' + v.hour + ':' + v.minute + '</span>' +
        '<span class="t-sec">' + v.second + '</span>' + (v.dayPeriod ? '<span class="t-ap">' + v.dayPeriod + '</span>' : '');
      timeEl.setAttribute('datetime', now.toISOString());
      dateLine.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    /* Window bar, same language as the About card */
    if (pop && !pop.querySelector('.cp-bar')) {
      pop.prepend(el('div', { class: 'cp-bar', 'aria-hidden': 'true' },
        '<span class="ab-dots"><i></i><i></i><i></i></span><span class="cp-bar-title">Why hire me &amp; calendar</span>'));
    }

    tickClock();
    setInterval(() => { if (pop && !pop.hidden) tickClock(); }, 1000);   // only runs while the popover is open
  }

  /* =====================================================================
   * 8c. ABOUT CARD (terminal card inside the hero sidebar)
   *     The header toggle collapses it. Restart re-opens it.
   * ===================================================================== */
  const isDesk = () => window.innerWidth >= 992;

  function setAbout(open) {
    const card = document.getElementById('about');
    if (!card) return null;
    const body = card.querySelector('.ab-term-body'), btn = card.querySelector('.ab-toggle');
    body.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Collapse about me' : 'Expand about me');
    card.classList.toggle('is-collapsed', !open);
    return card;
  }

  /* Hero as a 2-pane applet: [headerbar] / [hero (left) | About inspector (right)].
     Pure re-parenting, so every id, listener and class keeps working. Below 992px the
     wrapper is display:contents and the headerbar is hidden, so mobile is unchanged. */
  function initHeroApplet() {
    const hero = document.getElementById('hero'), about = document.getElementById('about');
    if (!hero || !about || hero.classList.contains('hero-applet')) return;
    const inner = hero.querySelector('.hero-sidebar-inner');
    if (!inner) return;
    const bar = el('div', { class: 'hero-bar', 'aria-hidden': 'true' },
      '<span class="ab-dots"><i></i><i></i><i></i></span><span class="hero-bar-title">profile \u2014 John Paul De Leon</span>');
    const body = el('div', { class: 'hero-body' });
    const card = el('div', { class: 'hero-card' });
    inner.classList.add('hero-main');
    about.classList.add('hero-inspector');
    body.append(inner);
    card.append(bar, body);                    // the profile applet: headerbar + body
    hero.classList.add('hero-applet');
    hero.append(card, about);                  // About is its own applet, beside the profile (stacked on phones)
  }

  /* Keep the hero panel clear of the taskbar along the bottom edge. */
  function initHeroReserve() {
    const fit = () => {
      const root = document.documentElement;
      if (window.innerWidth < 992) { root.style.removeProperty('--hero-reserve'); return; }
      root.style.setProperty('--hero-reserve', taskbarSpace() + 'px');
    };
    window.addEventListener('resize', fit);
    window.addEventListener('load', fit);
    fit();
  }

  /* The hero applet is open on first load (desktop). Runs at boot and again on window load, in case another
     script restores a collapsed state in between; stops caring once the person uses the bell themselves. */
  function showHeroOnFirstLoad() {
    const b = document.body, bell = document.getElementById('panel-notif-btn');
    let touched = false;
    if (bell) bell.addEventListener('click', () => { touched = true; });
    const open = () => {
      if (touched || window.innerWidth < 992 || !b.classList.contains('sidebar-collapsed')) return;
      b.classList.add('sidebar-noanim');
      b.classList.remove('sidebar-collapsed');
      requestAnimationFrame(() => requestAnimationFrame(() => b.classList.remove('sidebar-noanim')));
    };
    open();
    window.addEventListener('load', open);
  }

  /* Open the card; with `show` also scroll it into view and pulse it */
  function flashAbout(show) {
    const card = setAbout(true);
    if (!card) return;
    const hero = document.getElementById('hero');
    if (hero) { hero.scrollTop = 0; const hb = hero.querySelector('.hero-body'); if (hb) hb.scrollTop = 0; }
    if (show === false) return;
    card.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'nearest' });
    card.classList.remove('is-flash');
    void card.offsetWidth;                            // restart the animation
    card.classList.add('is-flash');
    setTimeout(() => card.classList.remove('is-flash'), 1100);
  }

  function initAbout() {
    const card = document.getElementById('about');
    if (!card) return;
    card.querySelector('.ab-toggle').addEventListener('click', () => {
      setAbout(card.querySelector('.ab-term-body').hidden);
    });
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
    if (b.getAttribute('data-desktop') === 'about') flashAbout();
  });

  /* =====================================================================
   * 8d. RIGHT COLUMN: live month count for the current role, and scale the
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
      const avail = window.innerHeight - col.getBoundingClientRect().top - taskbarSpace();
      const k = clamp(avail / col.offsetHeight, 0.6, 1);
      if (k < 1) col.style.transform = 'scale(' + k.toFixed(3) + ')';
    };
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('load', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }

  /* =====================================================================
   * 9. START
   * ===================================================================== */
  function boot() {
    clearTimeout(window.__deskFailsafe);
    document.body.append(layer, store);
    buildTaskbar();
    initPanel();

    /* Park Resume/Portfolio off-page; nothing opens on first load.
       (They stay in the DOM, so content is still there for crawlers.) */
    Object.values(APPS).forEach(a => {
      const node = a.adopt && document.querySelector(a.adopt);
      if (node) store.appendChild(node);
    });

    refreshTaskbar();
    initHeroApplet();
    initAbout();
    initHeroReserve();
    showHeroOnFirstLoad();
    initRightColumn();
    desktopMode = window.innerWidth >= 992;
    const h = location.hash;                       // shareable deep links: /#resume, /#portfolio
    if (h === '#resume' || h === '#portfolio') openWindow(h.slice(1));

    /* First load: wallpaper alone for a moment, then hero + widgets fade in (no window opens by itself).
       A deep-linked window keeps the focus. */
    (async () => {
      if (document.readyState !== 'complete') await new Promise(r => window.addEventListener('load', r, { once: true }));
      await revealDesktop();                       // nothing opens on its own; the visitor launches windows from the Menu
    })();
  }

  /* Embed a project page inside any element (used by the Zen-style Portfolio tabs).
     Same iframe, embed CSS, theme sync and screenshot handling as a project window. */
  function embedFrame(container, url, title) {
    const pseudo = { id: 'embed:' + url, def: { title: title || 'Project' }, body: container, el: container, frame: null };
    mountFrame(pseudo, url);
    return pseudo.frame;
  }

  window.WindowManager = { open: openWindow, close: id => wins.has(id) && closeWindow(wins.get(id)), windows: wins, embed: embedFrame };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();