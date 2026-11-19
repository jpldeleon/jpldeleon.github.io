/*!
 * android-bubbles.js: phone layout (<= 768px). Android 16 style "app bubbles" for the individual Project and
 * Certificate windows. It does not touch app.js: it watches #wm-layer and decorates those windows.
 *
 *   window open     -> every project/certificate has a round bubble; they sit in a row at the top, centred, with the open
 *                      one filled and a small pointer on the sheet. A "+" bubble opens the Projects list.
 *   tap open bubble -> the sheet shrinks into its bubble and the bubbles float free as chat heads (edge-snapping, stacking)
 *   tap other one   -> switch (only one sheet is open at a time)
 *   drag a bubble   -> the X target appears at the bottom; drop on it to close that window
 *   swipe the title bar down -> same as tapping the open bubble
 * Load after app.js and android.js:  <script src="assets/js/android-bubbles.js" defer></script>
 */
(() => {
  'use strict';
  const mq = window.matchMedia('(max-width:768px)');
  const still = () => window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const KINDS = /^(project|cert):/;
  const S = 56, M = 6, TOP = 40, BOTTOM = 130;       // floating chat head: size, edge margin, top limit, space kept for dock + search
  const R = 46, G = 10, ROWTOP = 40;                  // bubble row: size, gap, y
  const PANEL_TOP = 106, PANEL_BOTTOM = 126;          // sheet sits between the bubble row and the dock
  const XS = 60, XB = 100;                            // close target size + distance from the bottom
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const vw = () => window.innerWidth, vh = () => window.innerHeight;
  const recs = new Map();                             // window id -> record
  let host, xt, plus;

  const build = () => {
    host = document.createElement('div');
    host.id = 'adr-bubbles'; host.className = 'adr-layer';
    host.innerHTML = '<div class="adr-bx" aria-hidden="true"><i class="fa-solid fa-xmark"></i></div>' +
      '<button type="button" class="adr-bub adr-plus" data-app="portfolio" aria-label="All projects"><i class="fa-solid fa-plus" aria-hidden="true"></i></button>';
    document.body.appendChild(host);
    xt = host.children[0]; plus = host.children[1];
    plus.addEventListener('click', () => recs.forEach(r => collapse(r)));   // the click also reaches app.js, which opens Projects
  };

  const active = () => { for (const r of recs.values()) if (!r.collapsed && r.el.isConnected) return r; return null; };

  /* ───────── layout: bubble row while a sheet is open, floating chat heads otherwise ───────── */
  const freeY = side => {
    const ys = [...recs.values()].filter(r => r.placed && r.side === side).map(r => r.y);
    let y = 150;
    while (ys.some(v => Math.abs(v - y) < S + 8) && y < vh() - S - BOTTOM) y += S + 10;
    return y;
  };
  const layout = () => {
    const act = mq.matches ? active() : null, list = [...recs.values()].filter(r => r.bub);
    host.classList.toggle('row', !!act);
    if (act) {
      const n = list.length + 1, x0 = Math.round((vw() - (n * R + (n - 1) * G)) / 2);
      list.forEach((r, i) => {
        r.tx = x0 + i * (R + G); r.ty = ROWTOP; r.ts = R;
        const b = r.bub;
        b.classList.add('show', 'inrow'); b.classList.toggle('active', r === act);
        b.style.left = r.tx + 'px'; b.style.top = r.ty + 'px';
      });
      plus.style.left = (x0 + list.length * (R + G)) + 'px'; plus.style.top = ROWTOP + 'px';
      plus.classList.add('show', 'inrow');
    } else {
      plus.classList.remove('show', 'inrow');
      list.forEach(r => {
        if (!r.placed) { r.y = freeY(r.side); r.placed = true; }
        r.ts = S; r.tx = r.side === 'l' ? M : vw() - S - M; r.ty = clamp(r.y, TOP, vh() - S - BOTTOM);
        const b = r.bub;
        b.classList.remove('inrow', 'active'); b.classList.toggle('show', r.collapsed);
        b.classList.toggle('l', r.side === 'l'); b.classList.toggle('r', r.side === 'r');
        b.style.left = r.tx + 'px'; b.style.top = r.ty + 'px';
      });
    }
  };

  /* the sheet: below the bubble row, above the dock. Applied through CSS variables so app.js's own sizing can't undo it. */
  const fit = rec => {
    const el = rec.el;
    if (!mq.matches || !el.isConnected) return;
    const avail = Math.max(240, vh() - PANEL_BOTTOM - PANEL_TOP);
    let top = PANEL_TOP, h = avail;
    if (el.classList.contains('is-lite')) {            // certificate: hugs the image, centred in the free space
      const h0 = parseFloat(el.style.height) || avail;
      h = Math.min(h0, avail); top = Math.round(PANEL_TOP + (avail - h) / 2);
    }
    if (el.style.getPropertyValue('--adr-top') !== top + 'px') el.style.setProperty('--adr-top', top + 'px');
    if (el.style.getPropertyValue('--adr-h') !== h + 'px') el.style.setProperty('--adr-h', h + 'px');
  };

  /* ───────── collapse / expand ───────── */
  const collapse = (rec, instant) => {
    if (rec.collapsed || !mq.matches || !rec.el.isConnected) return;
    rec.collapsed = true;
    layout();
    const el = rec.el, r = el.getBoundingClientRect();
    const fin = a => {
      el.classList.add('adr-bubbled'); el.classList.remove('is-focused'); el.style.transformOrigin = '';
      if (a) a.cancel();
      if (!active()) {                                  // floating again: show the name for a moment
        rec.bub.classList.add('tipon');
        clearTimeout(rec.tipT); rec.tipT = setTimeout(() => rec.bub.classList.remove('tipon'), 1900);
      }
    };
    if (instant || still()) return fin();
    el.style.transformOrigin = (rec.tx + rec.ts / 2 - r.left) + 'px ' + (rec.ty + rec.ts / 2 - r.top) + 'px';
    const a = el.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.06)', opacity: 0 }],
      { duration: 260, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    a.onfinish = () => fin(a); a.oncancel = () => fin(null);
  };

  const expand = (rec, instant) => {
    if (!rec.collapsed || !rec.el.isConnected) return;
    rec.collapsed = false;
    recs.forEach(o => { if (o !== rec && !o.collapsed && mq.matches) collapse(o); });   // one open sheet at a time
    layout(); fit(rec);
    const el = rec.el;
    el.classList.remove('adr-bubbled');
    el.dispatchEvent(new Event('pointerdown'));         // app.js focuses a window on pointerdown: raises it above the others
    if (instant || still()) return;
    const r = el.getBoundingClientRect();
    el.style.transformOrigin = (rec.tx + rec.ts / 2 - r.left) + 'px ' + (rec.ty + rec.ts / 2 - r.top) + 'px';
    const a = el.animate([{ transform: 'scale(.06)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }],
      { duration: 300, easing: 'cubic-bezier(.2,.9,.3,1.1)' });
    a.onfinish = a.oncancel = () => { el.style.transformOrigin = ''; };
  };

  const dismiss = rec => {                              // dropped on the X: the bubble shrinks away, the window closes
    rec.bub.classList.add('dying');
    setTimeout(() => { const c = rec.el.querySelector('.wm-close'); if (c) c.click(); }, 180);
  };

  /* ───────── a bubble ───────── */
  const makeBubble = rec => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'adr-bub'; b.dataset.kind = rec.kind;
    b.setAttribute('aria-label', rec.title);
    b.innerHTML = '<i class="' + rec.icon + '" aria-hidden="true"></i><span class="tip"></span>';
    b.querySelector('.tip').textContent = rec.title;
    host.insertBefore(b, plus); rec.bub = b;

    let d = null;
    b.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      d = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: b.offsetLeft, oy: b.offsetTop, moved: false, near: false, row: !!active() };
      b.setPointerCapture(e.pointerId);
    });
    b.addEventListener('pointermove', e => {
      if (!d || e.pointerId !== d.id) return;
      const dx = e.clientX - d.sx, dy = e.clientY - d.sy, sz = b.offsetWidth;
      if (!d.moved) {
        if (Math.hypot(dx, dy) < 8) return;
        d.moved = true; b.classList.add('drag'); b.classList.remove('tipon'); xt.classList.add('show');
      }
      let x = clamp(d.ox + dx, 0, vw() - sz), y = clamp(d.oy + dy, TOP - 8, vh() - sz);
      const tx = vw() / 2, ty = vh() - XB - XS / 2;     // centre of the X target
      d.near = Math.hypot(x + sz / 2 - tx, y + sz / 2 - ty) < 84;
      xt.classList.toggle('near', d.near);
      if (d.near) { x = tx - sz / 2; y = ty - sz / 2; } // magnet
      b.style.left = x + 'px'; b.style.top = y + 'px';
    });
    const up = (e, cancelled) => {
      if (!d || e.pointerId !== d.id) return;
      const dd = d; d = null;
      b.classList.remove('drag'); xt.classList.remove('show', 'near');
      if (!dd.moved) { if (!cancelled) (rec.collapsed ? expand(rec) : collapse(rec)); return; }   // tap: open, or fold the open one away
      if (dd.near && !cancelled) { dismiss(rec); return; }
      if (!dd.row) {                                    // floating: snap to the nearest edge
        rec.side = b.offsetLeft + S / 2 < vw() / 2 ? 'l' : 'r';
        rec.y = clamp(b.offsetTop, TOP, vh() - S - BOTTOM); rec.placed = true;
      }
      layout();                                         // in the row: spring back into place
    };
    b.addEventListener('pointerup', e => up(e, false));
    b.addEventListener('pointercancel', e => up(e, true));
    b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rec.collapsed ? expand(rec) : collapse(rec); } });
  };

  /* ───────── decorate project / certificate windows ───────── */
  const setup = el => {
    const id = el.getAttribute('data-wm-app');
    if (!id || !KINDS.test(id) || recs.has(id)) return;
    const ic = el.querySelector('.wm-title i');
    const rec = {
      id, el, kind: id.split(':')[0], collapsed: false, placed: false, side: 'r', y: 0, bub: null, tx: 0, ty: 0, ts: R,
      icon: ic ? ic.className : 'fa-solid fa-window-maximize', title: el.getAttribute('aria-label') || id
    };
    recs.set(id, rec);
    makeBubble(rec);
    recs.forEach(o => { if (o !== rec && !o.collapsed && mq.matches) collapse(o); });   // opening a new one folds the old one away
    fit(rec); layout();

    new MutationObserver(() => fit(rec)).observe(el, { attributes: true, attributeFilter: ['style'] });   // app.js resized it

    /* swipe the title bar down to fold the sheet into its bubble */
    const bar = el.querySelector('.wm-titlebar');
    if (bar) {
      let sy = null;
      const end = () => { sy = null; el.style.translate = ''; };
      bar.addEventListener('pointerdown', e => { if (mq.matches && !e.target.closest('.wm-btn')) sy = e.clientY; });
      bar.addEventListener('pointermove', e => {
        if (sy == null) return;
        const dy = e.clientY - sy;
        el.style.translate = dy > 0 ? '0 ' + Math.min(dy, 120) * 0.6 + 'px' : '';
        if (dy > 70) { end(); collapse(rec); }
      });
      bar.addEventListener('pointerup', end); bar.addEventListener('pointercancel', end);
    }
  };

  const teardown = id => {
    const rec = recs.get(id); if (!rec) return;
    clearTimeout(rec.tipT);
    if (rec.bub) rec.bub.remove();
    recs.delete(id);
    layout();
  };

  /* ───────── wiring ───────── */
  const start = layer => {
    build();
    new MutationObserver(list => list.forEach(m => {
      m.addedNodes.forEach(n => { if (n.nodeType === 1 && n.matches('.wm-window')) setup(n); });
      m.removedNodes.forEach(n => { if (n.nodeType === 1 && n.matches('.wm-window')) teardown(n.getAttribute('data-wm-app')); });
    })).observe(layer, { childList: true });
    layer.querySelectorAll('.wm-window').forEach(setup);

    /* tapping that project in the dock / Projects grid while it is folded away opens it */
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('[data-app]');
      const rec = a && recs.get(a.getAttribute('data-app'));
      if (rec && rec.collapsed) expand(rec);
    }, true);

    window.addEventListener('resize', () => { recs.forEach(fit); layout(); });
    const sync = () => { if (!mq.matches) recs.forEach(r => expand(r, true)); layout(); };   // back on desktop: every window opens normally
    mq.addEventListener ? mq.addEventListener('change', sync) : mq.addListener(sync);
  };

  const boot = () => {
    const layer = document.getElementById('wm-layer');
    if (layer) start(layer); else setTimeout(boot, 250);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();