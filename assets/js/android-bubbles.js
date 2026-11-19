/*!
 * android-bubbles.js: phone layout (<= 768px). Messenger / Android "bubble" behaviour for the individual
 * Project and Certificate windows. It does not touch app.js: it watches #wm-layer and decorates those windows.
 *   - a "bubble" button in the title bar (or swipe the title bar down) shrinks the window into a round chat head
 *   - chat heads float above everything, can be dragged, snap to the left/right edge, and stack
 *   - drag a head onto the X at the bottom to close that window
 *   - tap a head (or the same project in the dock / Projects grid) to pop the window back open
 *   - only one window is open at a time; opening another one turns the current one into a bubble
 * Load after app.js and android.js:  <script src="assets/js/android-bubbles.js" defer></script>
 */
(() => {
  'use strict';
  const mq = window.matchMedia('(max-width:768px)');
  const still = () => window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const KINDS = /^(project|cert):/;
  const S = 56, M = 6, TOP = 40, BOTTOM = 130;         // bubble size, edge margin, top limit, space kept for dock + search
  const XS = 60, XB = 100;                              // close target size + distance from the bottom
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const vw = () => window.innerWidth, vh = () => window.innerHeight;
  const recs = new Map();                               // window id -> { el, bub, collapsed, side, y, ... }
  let host, xt;

  const build = () => {
    host = document.createElement('div');
    host.id = 'adr-bubbles'; host.className = 'adr-layer';
    host.innerHTML = '<div class="adr-bx" aria-hidden="true"><i class="fa-solid fa-xmark"></i></div>';
    document.body.appendChild(host);
    xt = host.firstChild;
  };

  /* ───────── bubble placement ───────── */
  const place = rec => {
    const b = rec.bub;
    b.classList.toggle('l', rec.side === 'l'); b.classList.toggle('r', rec.side === 'r');
    b.style.left = (rec.side === 'l' ? M : vw() - S - M) + 'px';
    b.style.top = clamp(rec.y, TOP, vh() - S - BOTTOM) + 'px';
  };
  const freeY = side => {                               // first free slot on that edge, stacking downwards
    const ys = [...recs.values()].filter(r => r.collapsed && r.placed && r.side === side).map(r => r.y);
    let y = 150;
    while (ys.some(v => Math.abs(v - y) < S + 8) && y < vh() - S - BOTTOM) y += S + 10;
    return y;
  };

  /* ───────── collapse / expand ───────── */
  const collapse = (rec, instant) => {
    if (rec.collapsed || !mq.matches || !rec.el.isConnected) return;
    rec.collapsed = true;
    if (!rec.bub) makeBubble(rec);
    if (!rec.placed) { rec.y = freeY(rec.side); rec.placed = true; }
    place(rec);
    const el = rec.el, r = el.getBoundingClientRect();
    const cx = (rec.side === 'l' ? M : vw() - S - M) + S / 2, cy = clamp(rec.y, TOP, vh() - S - BOTTOM) + S / 2;
    const fin = a => {
      el.classList.add('adr-bubbled'); el.classList.remove('is-focused'); el.style.transformOrigin = '';
      if (a) a.cancel();
      rec.bub.classList.add('show', 'tipon');
      clearTimeout(rec.tipT); rec.tipT = setTimeout(() => rec.bub.classList.remove('tipon'), 1900);
    };
    if (instant || still()) return fin();
    el.style.transformOrigin = (cx - r.left) + 'px ' + (cy - r.top) + 'px';
    const a = el.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.06)', opacity: 0 }],
      { duration: 260, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    a.onfinish = () => fin(a); a.oncancel = () => fin(null);
  };

  const expand = (rec, instant) => {
    if (!rec.collapsed || !rec.el.isConnected) return;
    rec.collapsed = false;
    recs.forEach(o => { if (o !== rec && !o.collapsed && mq.matches) collapse(o); });   // one open window at a time
    const el = rec.el, bub = rec.bub;
    const bx = bub ? bub.offsetLeft + S / 2 : vw() - S / 2, by = bub ? bub.offsetTop + S / 2 : 150;
    el.classList.remove('adr-bubbled');
    if (bub) { bub.classList.remove('show', 'tipon'); clearTimeout(rec.tipT); }
    el.dispatchEvent(new Event('pointerdown'));         // app.js focuses a window on pointerdown: raises it above the others
    if (instant || still()) return;
    const r = el.getBoundingClientRect();
    el.style.transformOrigin = (bx - r.left) + 'px ' + (by - r.top) + 'px';
    const a = el.animate([{ transform: 'scale(.06)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }],
      { duration: 300, easing: 'cubic-bezier(.2,.9,.3,1.1)' });
    a.onfinish = a.oncancel = () => { el.style.transformOrigin = ''; };
  };

  const dismiss = rec => {                              // dropped on the X: bubble shrinks away, the window closes
    rec.bub.classList.add('dying');
    setTimeout(() => { const c = rec.el.querySelector('.wm-close'); if (c) c.click(); }, 180);
  };

  /* ───────── the chat head itself ───────── */
  const makeBubble = rec => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'adr-bub'; b.dataset.kind = rec.kind;
    b.setAttribute('aria-label', 'Open ' + rec.title);
    b.innerHTML = '<i class="' + rec.icon + '" aria-hidden="true"></i><span class="tip"></span>';
    b.querySelector('.tip').textContent = rec.title;
    host.appendChild(b); rec.bub = b;

    let d = null;
    b.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      d = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: b.offsetLeft, oy: b.offsetTop, moved: false, near: false };
      b.setPointerCapture(e.pointerId);
    });
    b.addEventListener('pointermove', e => {
      if (!d || e.pointerId !== d.id) return;
      const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
      if (!d.moved) {
        if (Math.hypot(dx, dy) < 8) return;
        d.moved = true; b.classList.add('drag'); b.classList.remove('tipon'); xt.classList.add('show');
      }
      let x = clamp(d.ox + dx, 0, vw() - S), y = clamp(d.oy + dy, TOP - 8, vh() - S);
      const tx = vw() / 2, ty = vh() - XB - XS / 2;     // centre of the X target
      d.near = Math.hypot(x + S / 2 - tx, y + S / 2 - ty) < 84;
      xt.classList.toggle('near', d.near);
      if (d.near) { x = tx - S / 2; y = ty - S / 2; }   // magnet
      b.style.left = x + 'px'; b.style.top = y + 'px';
    });
    const up = (e, cancelled) => {
      if (!d || e.pointerId !== d.id) return;
      const dd = d; d = null;
      b.classList.remove('drag'); xt.classList.remove('show', 'near');
      if (!dd.moved) { if (!cancelled) expand(rec); return; }
      if (dd.near && !cancelled) { dismiss(rec); return; }
      rec.side = b.offsetLeft + S / 2 < vw() / 2 ? 'l' : 'r';   // snap to the nearest edge
      rec.y = clamp(b.offsetTop, TOP, vh() - S - BOTTOM);
      place(rec);
    };
    b.addEventListener('pointerup', e => up(e, false));
    b.addEventListener('pointercancel', e => up(e, true));
    b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); expand(rec); } });
  };

  /* ───────── decorate project / certificate windows ───────── */
  const setup = el => {
    const id = el.getAttribute('data-wm-app');
    if (!id || !KINDS.test(id) || recs.has(id)) return;
    const ic = el.querySelector('.wm-title i');
    const rec = {
      id, el, kind: id.split(':')[0], collapsed: false, placed: false, side: 'r', y: 0, bub: null,
      icon: ic ? ic.className : 'fa-solid fa-window-maximize', title: el.getAttribute('aria-label') || id
    };
    recs.set(id, rec);

    const ctl = el.querySelector('.wm-controls'), close = el.querySelector('.wm-close');
    if (ctl && close) {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'wm-btn adr-wm-bub';
      btn.setAttribute('aria-label', 'Minimize to bubble'); btn.title = 'Minimize to bubble';
      btn.innerHTML = '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="5" cy="5" r="3.8"/><circle cx="5" cy="5" r="1.3" fill="currentColor" stroke="none"/></svg>';
      btn.addEventListener('click', () => collapse(rec));
      ctl.insertBefore(btn, close);
    }

    /* swipe the title bar down to turn the window into a bubble */
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

    recs.forEach(o => { if (o !== rec && !o.collapsed && mq.matches) collapse(o); });    // opening a new one bubbles the old one
  };

  const teardown = id => {
    const rec = recs.get(id); if (!rec) return;
    clearTimeout(rec.tipT);
    if (rec.bub) rec.bub.remove();
    recs.delete(id);
  };

  /* ───────── wiring ───────── */
  const start = layer => {
    build();
    new MutationObserver(list => list.forEach(m => {
      m.addedNodes.forEach(n => { if (n.nodeType === 1 && n.matches('.wm-window')) setup(n); });
      m.removedNodes.forEach(n => { if (n.nodeType === 1 && n.matches('.wm-window')) teardown(n.getAttribute('data-wm-app')); });
    })).observe(layer, { childList: true });
    layer.querySelectorAll('.wm-window').forEach(setup);

    /* tapping that project in the dock / Projects grid while it is a bubble pops it open */
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('[data-app]');
      const rec = a && recs.get(a.getAttribute('data-app'));
      if (rec && rec.collapsed) expand(rec);
    }, true);

    window.addEventListener('resize', () => recs.forEach(r => { if (r.collapsed && r.bub) place(r); }));
    const sync = () => { if (!mq.matches) recs.forEach(r => expand(r, true)); };      // rotated / resized to desktop: all windows back
    mq.addEventListener ? mq.addEventListener('change', sync) : mq.addListener(sync);
  };

  const boot = () => {
    const layer = document.getElementById('wm-layer');
    if (layer) start(layer); else setTimeout(boot, 250);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
