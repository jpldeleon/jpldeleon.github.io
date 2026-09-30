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

  /* Permanent apps. `adopt` = an existing <section> on the page that is moved
     into the window (so your current Resume/Portfolio markup is reused as-is).
     `url` = optional iframe fallback if that section isn't on the page. */
  const APPS = {
    resume: {
      title: 'Resume', icon: 'fa-solid fa-timeline', dockClass: 'dock-resume',
      adopt: '#resume', size: [980, 700]
    },
    skills: {
      title: 'Skills', icon: 'fa-solid fa-microchip', dockClass: 'dock-skills',
      adopt: '#skills', size: [960, 620]
    },
    portfolio: {
      title: 'Portfolio', icon: 'fa-solid fa-flask', dockClass: 'dock-projects',
      adopt: '#portfolio', size: [1040, 720]
    }
  };

  /* Portfolio projects. Each opens in its own window (iframe of the project page).
     `url` is the project page. Links on the site pointing to this url are
     intercepted automatically, so existing sidebar/portfolio links just work. */
  const PROJECTS = [
    { id: 'auditkit', title: 'AuditKit', sub: 'API Capstone Project',
      icon: 'fa-solid fa-magnifying-glass-chart', url: 'auditkit/index.html' },
    { id: 'nothingtechblob', title: 'NothingTechBlob',
      icon: 'fa-solid fa-blog', url: 'nothingtechblob/' },
    { id: 'badlands-ink', title: 'Badlands Ink',
      icon: 'fa-solid fa-pen-nib', url: 'badlands-ink/' },
    { id: 'johnoffthewall', title: 'John Off the Wall',
      icon: 'fa-solid fa-code', url: 'johnoffthewall/' },
    { id: 'pixellog', title: 'PixelLog',
      icon: 'fa-solid fa-images', url: 'pixellog/' },
    { id: 'jamporudex', title: 'JamporuDEX',
      icon: 'fa-solid fa-book-open', url: 'jamporudex/' },
    { id: 'route196', title: 'Route 196',
      icon: 'fa-solid fa-route', url: 'route196/' }
  ];

  /* Injected into every project iframe so the project pages need NO edits:
     hides the page's own dock / theme dots / breadcrumbs / footer. */
  const EMBED_CSS = `
    .linux-dock,.theme-dots,.app-menu,.terminal-overlay,.scroll-top,
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
  let zTop = 1, focused = null, cascade = 0;
  let dock, dockApps, dockDivider;

  Object.entries(APPS).forEach(([id, d]) => defs.set(id, Object.assign({ id, permanent: true }, d)));
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

    ['resume', 'skills', 'portfolio'].forEach(id => {
      const b = makeDockBtn(defs.get(id));
      dockBtns.set(id, b);
      dock.appendChild(b);
    });
    dockDivider = el('span', { class: 'wm-dock-divider', role: 'separator', hidden: '' });
    dockApps = el('div', { class: 'wm-dock-apps' });
    dock.append(dockDivider, dockApps);
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
    return p ? p.offsetHeight : 0;
  }

  /* =====================================================================
   * 4. GEOMETRY
   * ===================================================================== */
  function targetRect(w) {
    const vw = window.innerWidth, vh = window.innerHeight, ds = dockSpace(), ts = topSpace();
    if (isMobile()) return { x: 6, y: ts + 6, w: vw - 12, h: vh - ds - ts - 6 };
    if (w.state === 'max') return { x: 0, y: ts, w: vw, h: vh - ds - ts };
    return w.rect;
  }

  function applyRect(w) {
    const r = targetRect(w);
    const s = w.el.style;
    s.left = r.x + 'px'; s.top = r.y + 'px';
    s.width = r.w + 'px'; s.height = r.h + 'px';
  }

  function initialRect(def) {
    const vw = window.innerWidth, vh = window.innerHeight, ds = dockSpace(), ts = topSpace();
    const w = Math.min(def.size[0], vw - 40);
    const h = Math.min(def.size[1], vh - ds - ts - 20);
    const sidebar = vw >= 992 ? 380 : 0;  // centre in the area beside the sidebar
    const off = (cascade++ % 6) * 28;
    return {
      w, h,
      x: clamp(sidebar + (vw - sidebar - w) / 2 + off - 56, 8, vw - w - 8),
      y: clamp(ts + (vh - ds - ts - h) / 2 + off - 56, ts + 8, vh - ds - h)
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
          '<button type="button" class="wm-btn wm-min" aria-label="Minimize" title="Minimize">' + SVG.min + '</button>' +
          '<button type="button" class="wm-btn wm-max" aria-label="Maximize" title="Maximize">' + SVG.expand + SVG.restore + '</button>' +
          '<button type="button" class="wm-btn wm-close" aria-label="Close" title="Close">' + SVG.close + '</button>' +
        '</div>' +
      '</header>' +
      '<div class="wm-body"></div>' +
      HANDLES.map(d => '<span class="wm-resize" data-dir="' + d + '" aria-hidden="true"></span>').join('');
    root.querySelector('.wm-title span').textContent = def.title;

    const w = {
      id: def.id, def, el: root, body: root.querySelector('.wm-body'),
      state: 'normal', rect: initialRect(def), busy: false, dockBtn: null, adopted: null
    };

    /* Controls */
    root.querySelector('.wm-close').addEventListener('click', () => closeWindow(w));
    root.querySelector('.wm-min').addEventListener('click', () => minimize(w));
    root.querySelector('.wm-max').addEventListener('click', () => toggleMaximize(w));
    const bar = root.querySelector('.wm-titlebar');
    bar.addEventListener('dblclick', e => { if (!e.target.closest('.wm-btn')) toggleMaximize(w); });

    /* Focus on any press (capture: works before inner handlers) */
    root.addEventListener('pointerdown', () => focusWindow(w), true);
    enableDrag(w, bar);
    enableResize(w);

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
          }
          if (d.readyState !== 'loading') { clearInterval(poll); reveal(); }
        }
      } catch (e) { clearInterval(poll); reveal(); }
    }, 30);
    f.addEventListener('load', () => { clearInterval(poll); reveal(); });
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

  function openWindow(def) {
    if (typeof def === 'string') def = defs.get(def);
    if (!def) return null;
    let w = wins.get(def.id);
    if (w) {                              // already open: never duplicate
      if (w.state === 'min') restore(w); else focusWindow(w);
      return w;
    }
    defs.set(def.id, def);
    w = createWindow(def);
    wins.set(def.id, w);
    layer.appendChild(w.el);
    ensureDockBtn(w);
    applyRect(w);
    focusWindow(w);
    if (def.adopt) { refreshLayout(w); watchLayout(w); }
    flyIn(w);
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

  async function closeWindow(w) {
    if (w.busy) return;
    w.busy = true;
    const anim = await fadeOut(w);
    if (w.frame) frames.delete(w.frame);
    if (w.ro) w.ro.disconnect();
    if (w.adopted) store.appendChild(w.adopted);   // keep Resume/Portfolio state for next open
    w.el.remove();
    if (anim) anim.cancel();
    wins.delete(w.id);
    if (!w.def.permanent) {                        // dynamic dock item goes away
      dockBtns.delete(w.id);
      w.dockBtn.remove();
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
      const sx = e.clientX, sy = e.clientY;
      let started = false, offX = 0, offY = 0;
      try { bar.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }

      const move = ev => {
        if (!started) {
          if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 4) return;
          started = true;
          layer.classList.add('wm-dragging');
          if (w.state === 'max') {            // drag a maximized window = restore under the cursor
            const r = w.el.getBoundingClientRect();
            const ratio = (sx - r.left) / r.width;
            w.state = 'normal';
            syncMaxUI(w);
            fitToViewport(w);
            w.rect.x = sx - ratio * w.rect.w;
            w.rect.y = 0;
            applyRect(w);
          }
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

  window.addEventListener('resize', e => {
    if (e && e.isTrusted === false) return;   // ignore the synthetic event from refreshLayout()
    wins.forEach(w => { fitToViewport(w); applyRect(w); });
  });

  /* =====================================================================
   * 8. WIRING: dock, links, deep links
   * ===================================================================== */
  function dockActivate(id) {
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
    if (href === '#resume' || href === '#skills' || href === '#portfolio') {
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
   * 9. BOOT
   * ===================================================================== */
  function boot() {
    document.body.append(layer, store);
    buildDock();
    initPanel();

    /* Park Resume/Portfolio off-page: the main page is just sidebar + hero + about.
       (They stay in the DOM, so content is still there for crawlers.) */
    Object.values(APPS).forEach(a => {
      const node = a.adopt && document.querySelector(a.adopt);
      if (node) store.appendChild(node);
    });

    refreshDock();
    fitHome();

    const h = location.hash;                       // shareable deep links: /#resume, /#portfolio
    if (h === '#resume' || h === '#skills' || h === '#portfolio') openWindow(h.slice(1));
  }

  /* Home page is locked (no scroll): scale the About section down when the
     screen is too short, so it always sits between the top panel and the dock. */
  function fitHome() {
    const about = document.getElementById('about');
    const main = about && about.closest('main');
    if (!main) return;
    about.style.zoom = '';
    if (window.innerWidth < 992) return;
    const cs = getComputedStyle(main);
    const avail = main.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const natural = about.getBoundingClientRect().height;
    if (natural > avail && avail > 0) about.style.zoom = String(Math.max(0.55, avail / natural));
  }
  window.addEventListener('resize', fitHome);
  window.addEventListener('load', fitHome);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHome);

  window.WindowManager = { open: openWindow, close: id => wins.has(id) && closeWindow(wins.get(id)), windows: wins };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();