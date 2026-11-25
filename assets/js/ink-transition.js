/*!
 * ink-transition.js: ink-in-water theme switch (~800 ms), desktop + phone layouts. No hard edges, no solid colour.
 *
 * How it works
 *  - A click on any [data-theme-choice] (desktop dots, panel menu, Android Theme tile) is intercepted in the capture
 *    phase and re-dispatched inside document.startViewTransition(). The page's own handler (main.js) runs
 *    unchanged and the browser snapshots the OLD and NEW theme of the whole viewport (windows, widgets, panels,
 *    nav, backgrounds, same-origin project iframes).
 *  - The NEW snapshot is revealed through a SOFT ALPHA FIELD, so the new theme simply thickens out of the old one
 *    like dye spreading in water: several drops, each a translucent cloud whose density falls off gradually
 *    (and gets more diffuse as it spreads), irregular lobes and tendrils, small droplets running ahead of the
 *    front, and the whole field slowly swirled by a flow warp. Clouds merge smoothly where they meet.
 *  - The field is pre-rendered once as a low-res sprite sheet (one frame per ~20 ms) and played with a stepped
 *    mask-position animation, so there is no per-frame JS or style work while it plays.
 *
 * Behaviour
 *  - Pointer events pass through during the animation (the live page underneath is already in the new theme).
 *  - prefers-reduced-motion, hidden tabs and browsers without View Transitions: instant switch, nothing breaks.
 *  - Phones (<= 768px) and low-core devices render a smaller sprite and fewer drops, same 800 ms.
 *  - Sound: a synthesised water-drop soundscape that follows the animation (a "bloop" for every ink drop at the moment
 *    it appears, panned to where it lands, a soft swell while the ink spreads, a gentle chime as the theme settles;
 *    the chime's pitch depends on the theme). The old theme-toggle sound is silenced while it plays.
 *    Mute with InkTheme.setSound(false) or localStorage.setItem('ink-mute','1').
 *  - Console: InkTheme.why() (what could block it), InkTheme.test() (play it),
 *    localStorage.setItem('ink-force','1') (ignore reduced-motion while testing).
 *  - Programmatic: InkTheme.run(() => root.setAttribute('data-theme', 'nordfrost'), { x, y })
 */
(() => {
  'use strict';
  if (window.__inkTheme) return;

  const root = document.documentElement;
  const DUR = 800;
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const sstep = (a, b, v) => { const x = clamp((v - a) / (b - a)); return x * x * (3 - 2 * x); };
  const supports = typeof document.startViewTransition === 'function';
  const forced = () => { try { return localStorage.getItem('ink-force') === '1'; } catch (e) { return false; } };
  const reduce = () => !forced() && !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ───────── css (only active while html.ink-switching is set) ───────── */
  const css = document.createElement('style');
  css.id = 'ink-transition-css';
  css.textContent = `
html.ink-switching *,html.ink-switching *::before,html.ink-switching *::after{transition:none!important}
html.ink-switching::view-transition{pointer-events:none}
html.ink-switching::view-transition-group(root),
html.ink-switching::view-transition-image-pair(root),
html.ink-switching::view-transition-old(root),
html.ink-switching::view-transition-new(root){animation:none;mix-blend-mode:normal}`;
  (document.head || root).appendChild(css);

  /* ───────── plan: where the drops fall and how each one behaves ───────── */
  function rng(a) {   // mulberry32
    return () => {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function makePlan(W, H, ox, oy, lite) {
    const R = rng((Math.random() * 4294967296) >>> 0);
    const nDrops = lite ? 4 : 6;
    const minDim = Math.min(W, H);

    /* the tap/click point first, the rest scattered with a minimum spacing */
    const centres = [[clamp(ox, 0, W), clamp(oy, 0, H)]];
    for (let g = 0; centres.length < nDrops && g < 80; g++) {
      const x = W * (0.08 + 0.84 * R()), y = H * (0.08 + 0.84 * R());
      if (centres.every(c => Math.hypot(c[0] - x, c[1] - y) > minDim * 0.34)) centres.push([x, y]);
    }

    const drops = centres.map(([x, y], i) => {
      const far = Math.max(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y));
      const primary = i === 0;
      const harm = [];
      for (let k = 2; k <= 8; k++) harm.push({ k, a: 1 / Math.pow(k, 0.8), ph: R() * TAU, w: (R() * 2 - 1) * 2.2 });
      const tend = [];
      for (let j = 0; j < 5; j++) tend.push({ th: R() * TAU, w: 0.12 + 0.2 * R(), h: 0.25 + 0.45 * R(), drift: (R() * 2 - 1) * 0.5, start: 0.1 + 0.3 * R() });
      return {
        x, y, harm, tend,
        sat: { ang: R() * TAU, lead: 0.2 + 0.25 * R(), size: 0.07 + 0.08 * R(), start: 0.05 + 0.4 * R(), ph: R() * TAU },
        delay: primary ? 0 : 0.07 + 0.3 * R(),
        rmax: far * (primary ? 1.25 : 0.6 + 0.45 * R())
      };
    });
    return {
      drops, W, H, minDim,
      ph: [R() * TAU, R() * TAU, R() * TAU, R() * TAU]       // flow-warp phases
    };
  }

  /* radius multiplier of a drop's outline at angle th (drop progress p, global time t) */
  function edge(d, th, p, t) {
    let n = 0;
    for (const h of d.harm) n += h.a * Math.sin(h.k * th + h.ph + h.w * t);
    n /= 1.6;
    let b = 0;
    for (const tn of d.tend) {
      let a = th - (tn.th + tn.drift * t);
      a = Math.atan2(Math.sin(a), Math.cos(a));
      b += tn.h * Math.exp(-(a * a) / (tn.w * tn.w)) * sstep(tn.start, tn.start + 0.5, p);
    }
    return 1 + (0.12 + 0.26 * sstep(0, 1, p)) * n + b;
  }

  const NA = 128;                     // angular lookup resolution per cloud
  function cloud(x, y, L, w, den) {
    let lo = 1e9, hi = 0;
    for (let i = 0; i < NA; i++) { if (L[i] < lo) lo = L[i]; if (L[i] > hi) hi = L[i]; }
    const inner = lo * 0.2, outer = hi + w;     // inside 20% of the radius the dye is at full density
    return { x, y, L, w, den, inner2: inner > 0 ? inner * inner : -1, outer2: outer * outer };
  }

  /* the clouds (drops + their droplet) at time t: centre, radius per angle, softness */
  function cloudsAt(plan, t) {
    const out = [];
    const boost = 1 + 2.4 * Math.pow(clamp((t - 0.66) / 0.34), 2);
    for (const d of plan.drops) {
      const p = clamp((t - d.delay) / (1 - d.delay));
      const R = d.rmax * Math.pow(sstep(0, 1, p), 0.7) * boost;
      if (R < 0.5) continue;
      const L = new Float32Array(NA + 1);
      for (let i = 0; i < NA; i++) L[i] = R * edge(d, TAU * i / NA, p, t);
      L[NA] = L[0];
      const w = R * (0.1 + 0.2 * p) + plan.minDim * 0.012;       // the older the cloud, the more diffuse its rim
      out.push(cloud(d.x, d.y, L, w, 0.6 + 0.4 * sstep(0, 1, p)));   // dye starts thin and thickens

      const s = d.sat, ps = clamp((p - s.start) / (1 - s.start));
      const sr = s.size * R * sstep(0, 0.45, ps) * (1 - 0.6 * sstep(0.6, 1, ps));
      if (sr > 0.5) {
        const dist = R * edge(d, s.ang, p, t) * (1 + s.lead * (1 - ps));
        const SL = new Float32Array(NA + 1);
        for (let i = 0; i < NA; i++) { const th = TAU * i / NA; SL[i] = sr * (1 + 0.16 * Math.sin(2 * th + s.ph + 3 * t) + 0.09 * Math.sin(3 * th + 2 * s.ph)); }
        SL[NA] = SL[0];
        out.push(cloud(d.x + dist * Math.cos(s.ang), d.y + dist * Math.sin(s.ang), SL, sr * 0.3 + plan.minDim * 0.006, 0.55));
      }
    }
    return out;
  }

  /* ───────── sprite: one low-res alpha frame per time step, stacked vertically ───────── */
  function buildSprite(plan, wF, hF, K) {
    const { W, H, minDim } = plan;
    const sx = W / wF, sy = H / hF, invTAU = 1 / TAU;
    const data = new Uint8ClampedArray(wF * hF * K * 4);
    const rowDX = new Float32Array(hF), colDY = new Float32Array(wF);
    const k1 = TAU / (minDim * 0.62), k2 = TAU / (minDim * 0.8), k3 = TAU / (minDim * 0.27), k4 = TAU / (minDim * 0.33);

    for (let k = 0; k < K; k++) {
      const t = k / (K - 1);
      const clouds = cloudsAt(plan, t), nc = clouds.length;
      const floor = sstep(0.9, 1, t);                              // everything is revealed by t = 1
      const A1 = minDim * (0.018 + 0.05 * t), A2 = A1 * 0.45, ph = t * 2.4;
      const p0 = plan.ph[0], p1 = plan.ph[1], p2 = plan.ph[2], p3 = plan.ph[3];
      let o = k * hF * wF * 4 + 3;
      /* the warp is separable: x-shift depends only on the row, y-shift only on the column */
      for (let y = 0; y < hF; y++) { const py = (y + 0.5) * sy; rowDX[y] = A1 * Math.sin(py * k1 + ph + p0) + A2 * Math.sin(py * k3 - ph * 1.3 + p2); }
      for (let x = 0; x < wF; x++) { const px = (x + 0.5) * sx; colDY[x] = A1 * Math.sin(px * k2 - ph * 0.8 + p1) + A2 * Math.sin(px * k4 + ph * 1.1 + p3); }

      for (let y = 0; y < hF; y++) {
        const py = (y + 0.5) * sy;
        for (let x = 0; x < wF; x++, o += 4) {
          const px = (x + 0.5) * sx;
          /* flow warp: swirls the field like currents in the water */
          const wx = px + rowDX[y], wy = py + colDY[x];
          let keep = 1;
          for (let c = 0; c < nc; c++) {
            const b = clouds[c];
            const dx = wx - b.x, dy = wy - b.y, d2 = dx * dx + dy * dy;
            if (d2 > b.outer2) continue;
            let a;
            if (d2 < b.inner2) a = b.den;
            else {
              const d = Math.sqrt(d2);
              let u = Math.atan2(dy, dx); if (u < 0) u += TAU;
              u *= invTAU * NA;
              const i = u | 0, fr = u - i;
              const r = b.L[i] * (1 - fr) + b.L[i + 1] * fr;
              a = b.den * (1 - sstep(r * 0.2, r + b.w, d));          // dense core fading smoothly outward: no outline anywhere
            }
            keep *= 1 - a;
          }
          let a = 1 - keep; if (floor > a) a = floor;
          data[o] = a * 255 + 0.5;
        }
      }
    }
    return data;
  }

  async function makeMask(plan, lite) {
    const L = lite ? 96 : 112;                                     // long side of one frame, in texels
    const wF = plan.W >= plan.H ? L : Math.max(8, Math.round(L * plan.W / plan.H));
    const hF = plan.W >= plan.H ? Math.max(8, Math.round(L * plan.H / plan.W)) : L;
    const K = Math.max(12, Math.min(lite ? 30 : 40, Math.floor(4000 / hF)));   // keep the sprite under GPU texture limits
    const data = buildSprite(plan, wF, hF, K);
    const cv = document.createElement('canvas');
    cv.width = wF; cv.height = hF * K;
    cv.getContext('2d').putImageData(new ImageData(data, wF, hF * K), 0, 0);
    const url = cv.toDataURL('image/png');
    const img = new Image(); img.src = url;
    try { await img.decode(); } catch (e) { /* the browser will decode it when used */ }
    return { url, K };
  }


  /* ───────── sound: Web Audio, timed to the same plan that draws the ink ───────── */
  let actx = null, master = null, noiseBuf = null, hushUntil = 0;
  const soundOn = () => { try { return localStorage.getItem('ink-mute') !== '1'; } catch (e) { return true; } };
  const hush = ms => { hushUntil = performance.now() + ms; };
  const hushed = () => performance.now() < hushUntil;

  function audio() {                    // call from a user gesture so the context is allowed to start
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
      master = actx.createGain(); master.gain.value = 0.6;
      const comp = actx.createDynamicsCompressor();
      master.connect(comp); comp.connect(actx.destination);
    }
    if (actx.state === 'suspended') actx.resume().catch(() => {});
    return actx;
  }

  /* While the ink plays, the page's old theme sound (notifications.js) is silenced: <audio> play() is skipped and
     Web Audio graphs from other contexts are routed into a muted gain instead of the speakers. */
  try {
    const mediaPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (hushed() && this instanceof HTMLAudioElement) return Promise.resolve();
      return mediaPlay.apply(this, arguments);
    };
    const nodeConnect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (dest) {
      if (hushed() && actx && dest instanceof AudioDestinationNode && dest.context !== actx) {
        const mute = dest.context.createGain(); mute.gain.value = 0;
        nodeConnect.call(mute, dest);
        nodeConnect.call(this, mute);
        return dest;
      }
      return nodeConnect.apply(this, arguments);
    };
  } catch (e) { /* no Web Audio: nothing to silence */ }

  function playInk(plan, key) {
    const c = actx;
    if (!c || c.state !== 'running') return;
    const t0 = c.currentTime + 0.02;
    let h = 0; for (const ch of String(key)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const base = 392 * [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3][h % 5];      // pentatonic root, one per theme
    const deg = [1, 1.5, 2, 1.25, 1.667, 2.5];
    const pan = x => {
      if (!c.createStereoPanner) return null;
      const p = c.createStereoPanner(); p.pan.value = clamp(x / plan.W * 2 - 1, -1, 1) * 0.7; return p;
    };
    const out = (node, x) => { const p = x == null ? null : pan(x); if (p) { node.connect(p); p.connect(master); } else node.connect(master); };

    /* ripple: where each ink drop lands, a soft ring spreads out as a few fading lapping pulses of band-passed noise
       (the band slides down as the ring widens), with just a hint of a pitched ring underneath. */
    const getNoise = () => {
      if (!noiseBuf) {
        noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
        const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      return noiseBuf;
    };
    const bloop = (when, f, g, x) => {
      const n = c.createBufferSource(); n.buffer = getNoise();
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 3;
      bp.frequency.setValueAtTime(f * 1.5, when);
      bp.frequency.exponentialRampToValueAtTime(f * 0.8, when + 0.34);
      const a = c.createGain(), k = g * 5;
      a.gain.setValueAtTime(0.0001, when);
      a.gain.exponentialRampToValueAtTime(k, when + 0.012);            // the touch
      a.gain.exponentialRampToValueAtTime(k * 0.3, when + 0.07);
      a.gain.exponentialRampToValueAtTime(k * 0.8, when + 0.10);       // first ring
      a.gain.exponentialRampToValueAtTime(k * 0.15, when + 0.17);
      a.gain.exponentialRampToValueAtTime(k * 0.4, when + 0.20);       // second, wider ring
      a.gain.exponentialRampToValueAtTime(0.0001, when + 0.38);
      n.connect(bp); bp.connect(a); out(a, x);
      n.start(when, Math.random() * 0.5); n.stop(when + 0.42);

      const o = c.createOscillator(), og = c.createGain();             // faint tonal ring
      o.type = 'sine';
      o.frequency.setValueAtTime(f * 1.1, when);
      o.frequency.exponentialRampToValueAtTime(f * 0.9, when + 0.2);
      og.gain.setValueAtTime(0.0001, when);
      og.gain.exponentialRampToValueAtTime(g * 0.2, when + 0.01);
      og.gain.exponentialRampToValueAtTime(0.0001, when + 0.22);
      o.connect(og); out(og, x);
      o.start(when); o.stop(when + 0.25);
    };
    plan.drops.forEach((d, i) => bloop(t0 + d.delay * DUR / 1000, i === 0 ? base : base * deg[i % deg.length], i === 0 ? 0.2 : 0.11 * (1 - i * 0.08), d.x));

    /* the first drop landing: a soft low "plunk" */
    const th = c.createOscillator(), tg = c.createGain();
    th.type = 'sine';
    th.frequency.setValueAtTime(190, t0); th.frequency.exponentialRampToValueAtTime(100, t0 + 0.24);
    tg.gain.setValueAtTime(0.0001, t0); tg.gain.exponentialRampToValueAtTime(0.22, t0 + 0.01); tg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32);
    th.connect(tg); out(tg, plan.drops[0].x); th.start(t0); th.stop(t0 + 0.36);

    /* the ink spreading: filtered noise that blooms open and thins out, following the coverage curve */
    if (!noiseBuf) {
      noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const n = c.createBufferSource(); n.buffer = noiseBuf; n.loop = true;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.6;
    lp.frequency.setValueAtTime(380, t0); lp.frequency.exponentialRampToValueAtTime(2600, t0 + 0.62);
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 140;
    const ng = c.createGain();
    ng.gain.setValueAtTime(0.0001, t0); ng.gain.exponentialRampToValueAtTime(0.075, t0 + 0.36); ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
    n.connect(lp); lp.connect(hp); hp.connect(ng); out(ng); n.start(t0); n.stop(t0 + 0.95);
  }

  /* ───────── runner ───────── */
  let current = null;
  const post = [];   // callbacks queued with InkTheme.queue(): they run inside the transition, right after the theme is applied
  const flush = () => { while (post.length) { try { post.shift()(); } catch (e) { console.warn('[ink] queued callback failed', e); } } };

  function watchTheme() {   // resolves when data-theme changes, or after 120 ms (async theme code)
    return new Promise(res => {
      const mo = new MutationObserver(() => { mo.disconnect(); clearTimeout(tm); res(); });
      mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
      const tm = setTimeout(() => { mo.disconnect(); res(); }, 120);
    });
  }

  function run(apply, origin) {
    if (!supports || reduce() || document.hidden) { apply(); flush(); return Promise.resolve(); }

    const W = innerWidth, H = innerHeight;
    const lite = matchMedia('(max-width:768px)').matches || ((navigator.hardwareConcurrency || 8) <= 4);
    const ox = origin && isFinite(origin.x) ? origin.x : W / 2;
    const oy = origin && isFinite(origin.y) ? origin.y : H / 2;

    let mask = null, st = null, plan = null, key = '';
    const sound = soundOn();
    if (sound) { audio(); }
    root.classList.add('ink-switching');
    const vt = document.startViewTransition(async () => {
      const w = watchTheme();
      apply();
      await w;
      flush();                                  // e.g. close the Android shade so it vanishes behind the ink
      try {
        plan = makePlan(W, H, ox, oy, lite);
        key = root.getAttribute('data-theme') || '';
        mask = await makeMask(plan, lite);
        const u = 'url("' + mask.url + '")', sz = '100% ' + mask.K * 100 + '%';
        st = document.createElement('style');
        /* frame 0 is empty, so the new theme is hidden until the animation starts: no flash */
        st.textContent = 'html.ink-switching::view-transition-new(root){-webkit-mask-image:' + u + ';mask-image:' + u +
          ';-webkit-mask-size:' + sz + ';mask-size:' + sz + ';-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat' +
          ';-webkit-mask-position:0% 0%;mask-position:0% 0%}';
        document.head.appendChild(st);
      } catch (e) { mask = null; console.warn('[ink] mask failed, switching instantly', e); }
    });
    current = vt;

    vt.ready.then(() => {
      if (!mask) return;
      if (sound) { try { playInk(plan, key); } catch (e) { console.warn('[ink] sound failed', e); } }
      /* stepped through the sprite: K frames, each held for DUR / K ms; stays on the last (fully revealed) frame */
      root.animate(
        [{ maskPosition: '0% 0%', webkitMaskPosition: '0% 0%' }, { maskPosition: '0% 100%', webkitMaskPosition: '0% 100%' }],
        { duration: DUR, easing: 'steps(' + mask.K + ', jump-none)', fill: 'forwards', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(() => { /* skipped by a newer transition */ });

    vt.updateCallbackDone.catch(() => {});
    return vt.finished.catch(() => {}).then(() => {
      if (st) st.remove();
      if (current === vt) { current = null; root.classList.remove('ink-switching'); }
    });
  }

  /* ───────── hook: theme dots (desktop panel, dots, Android tile) ───────── */
  let bypass = false, lp = { x: 0, y: 0, t: -1e9 };
  addEventListener('pointerdown', e => { lp = { x: e.clientX, y: e.clientY, t: performance.now() }; }, { capture: true, passive: true });

  document.addEventListener('click', e => {
    if (bypass) return;
    const el = e.target && e.target.closest && e.target.closest('[data-theme-choice]');
    if (!el) return;
    if (!supports || reduce()) {
      console.info('[ink] not animating:', !supports ? 'View Transitions API unsupported in this browser' : 'prefers-reduced-motion is on (run localStorage.setItem("ink-force","1") to override)');
      return;
    }
    if (el.getAttribute('data-theme-choice') === (root.getAttribute('data-theme') || 'everforest')) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    let x, y;
    if (e.clientX || e.clientY) { x = e.clientX; y = e.clientY; }                       // real click / tap
    else if (performance.now() - lp.t < 2000) { x = lp.x; y = lp.y; }                  // synthetic .click() (Android tile)
    else {
      const r = el.getBoundingClientRect();
      if (r.width || r.height) { x = r.left + r.width / 2; y = r.top + r.height / 2; }
      else { x = innerWidth / 2; y = innerHeight / 2; }
    }

    run(() => {
      bypass = true;
      try {
        el.dispatchEvent(new MouseEvent('click', {
          bubbles: true, cancelable: true, composed: true, view: window,
          clientX: e.clientX, clientY: e.clientY, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, metaKey: e.metaKey
        }));
      } finally { bypass = false; }
    }, { x, y });
  }, true);

  /* console helpers */
  const why = () => {
    const r = {
      loaded: true,
      viewTransitionsSupported: supports,
      reducedMotionBlocking: reduce(),
      forcedOverride: forced(),
      soundOn: soundOn(),
      audioContext: actx ? actx.state : 'not created yet',
      tabHidden: document.hidden,
      themeDotsFound: document.querySelectorAll('[data-theme-choice]').length,
      currentTheme: root.getAttribute('data-theme')
    };
    console.table(r);
    return r;
  };
  const test = name => {
    if (!name) {
      const d = [...document.querySelectorAll('[data-theme-choice]')].map(n => n.getAttribute('data-theme-choice'));
      name = d.find(n => n !== root.getAttribute('data-theme')) || 'nordfrost';
    }
    return run(() => root.setAttribute('data-theme', name), { x: innerWidth / 2, y: innerHeight / 2 });
  };

  /* InkTheme.queue(fn): run fn together with the theme change; it lands inside the transition when one is playing
     (check InkTheme.active() right after triggering the switch to know whether to queue or just call fn) */
  const active = () => root.classList.contains('ink-switching');
  const queue = fn => { post.push(fn); };

  const setSound = on => { try { localStorage.setItem('ink-mute', on ? '0' : '1'); } catch (e) { /* ignore */ } };

  window.__inkTheme = window.InkTheme = { run, queue, active, setSound, why, test, _plan: makePlan, _sprite: buildSprite, _audio: audio, _play: playInk };
})();