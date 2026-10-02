/*--------------------------------------------------------------
# Ambient space scene
# - Astronaut floats gently around the centre (desktop) or rests in the
#   lower area above the dock (mobile).
# - ~10 tiny spheres orbit it on tilted ellipses, passing behind and in
#   front of it (back canvas under the astronaut, front canvas over it).
# - Sparse twinkling stars, 5 faint distant bodies, a rare shooting star.
# - All colours come from the active theme's CSS variables and ease
#   smoothly when the theme changes.
--------------------------------------------------------------*/
(function () {
  'use strict';

  var scene = document.getElementById('space-scene');
  if (!scene) return;

  var backCv = document.getElementById('space-back');
  var frontCv = document.getElementById('space-front');
  var astro = document.getElementById('space-astronaut');
  var img = astro.querySelector('img');
  var tintFlood = document.getElementById('space-tint-flood');
  var tintMix = document.getElementById('space-tint-mix');
  var bctx = backCv.getContext('2d');
  var fctx = frontCv.getContext('2d');

  /* ---- Settings you may want to tweak ------------------------- */
  var MOBILE_MQ = window.matchMedia('(max-width: 991px)'); // matches the site's stacked layout
  var TINT_STRENGTH = 0.6;     // 0 = original artwork, 1 = fully tinted
  var DESKTOP_HEIGHT = 0.38;   // astronaut height as a fraction of viewport height
  var MOBILE_HEIGHT = 0.26;    // smaller on mobile so it fits between content and dock
  var MOBILE_DOCK_GAP = 26;    // px of clear space between astronaut and dock
  var ORB_COUNT = 10;
  var TWO_PI = Math.PI * 2;
  var reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- Match the stacking level of the existing background ----- */
  var deskBg = document.querySelector('.desktop-background');
  if (deskBg) {
    var bz = parseInt(getComputedStyle(deskBg).zIndex, 10);
    if (!isNaN(bz)) scene.style.zIndex = bz; // later in the DOM, so it sits just above it
  }

  /* ---- Helpers -------------------------------------------------- */
  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
  function mix(c1, c2, f) {
    return [c1[0] + (c2[0] - c1[0]) * f, c1[1] + (c2[1] - c1[1]) * f, c1[2] + (c2[2] - c1[2]) * f];
  }
  function rgba(c, a) {
    return 'rgba(' + (c[0] + 0.5 | 0) + ',' + (c[1] + 0.5 | 0) + ',' + (c[2] + 0.5 | 0) + ',' + a.toFixed(3) + ')';
  }
  var WHITE = [255, 255, 255], BLACK = [8, 10, 14];

  var probe = document.createElement('canvas').getContext('2d');
  function toRGB(str, fallback) {
    if (!str) return fallback;
    probe.fillStyle = '#000';
    probe.fillStyle = str;
    var s = probe.fillStyle;
    if (s.charAt(0) === '#') {
      return [parseInt(s.substr(1, 2), 16), parseInt(s.substr(3, 2), 16), parseInt(s.substr(5, 2), 16)];
    }
    var m = s.match(/[\d.]+/g);
    return m ? [+m[0], +m[1], +m[2]] : fallback;
  }

  /* ---- Theme palette (eased towards the active theme) ----------- */
  var PAL_VARS = ['--accent-color', '--accent-highlight', '--quote-color',
                  '--typed-color', '--heading-color', '--nav-hover-color'];
  var palTarget = [], palCur = [];
  var defTarget = [200, 200, 200], defCur = [200, 200, 200];
  var themeKey = '';
  var palMoving = true;

  function readTheme() {
    var cs = getComputedStyle(document.documentElement);
    var key = '';
    var vals = PAL_VARS.map(function (v) { var x = cs.getPropertyValue(v).trim(); key += x + '|'; return x; });
    var def = cs.getPropertyValue('--default-color').trim();
    key += def;
    if (key === themeKey) return;
    var first = themeKey === '';
    themeKey = key;
    var base = toRGB(vals[0], [131, 192, 146]);
    for (var i = 0; i < PAL_VARS.length; i++) palTarget[i] = toRGB(vals[i], base);
    defTarget = toRGB(def, [211, 198, 170]);
    if (first) { palCur = palTarget.map(function (c) { return c.slice(); }); defCur = defTarget.slice(); }
    palMoving = true;
  }

  function stepPalette(dt) {
    var k = 1 - Math.exp(-dt / 0.7); // ~2s to settle
    var delta = 0, i, j;
    for (i = 0; i < palCur.length; i++) {
      for (j = 0; j < 3; j++) {
        var d = palTarget[i][j] - palCur[i][j];
        palCur[i][j] += d * k;
        delta = Math.max(delta, Math.abs(d));
      }
    }
    for (j = 0; j < 3; j++) {
      var dd = defTarget[j] - defCur[j];
      defCur[j] += dd * k;
      delta = Math.max(delta, Math.abs(dd));
    }
    if (palMoving) {
      if (tintFlood) tintFlood.setAttribute('flood-color', rgba(mix(palCur[1], palCur[0], 0.45), 1));
      if (delta < 0.3) palMoving = false;
    }
  }

  if (tintMix) { tintMix.setAttribute('k2', TINT_STRENGTH); tintMix.setAttribute('k3', 1 - TINT_STRENGTH); }

  readTheme();
  new MutationObserver(function () { readTheme(); setTimeout(readTheme, 120); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] });
  new MutationObserver(function () { readTheme(); setTimeout(readTheme, 120); })
    .observe(document.body, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  setInterval(readTheme, 600); // safety net for any other way the theme can change

  /* ---- Sizing / layout ------------------------------------------ */
  var W = 0, H = 0, dpr = 1;
  var aspect = 1;
  var astW = 0, astH = 0;
  var ampX = 0, ampY = 0;
  var targetCX = 0, targetCY = 0, cx = 0, cy = 0, layoutInit = false;
  var mobile = false;

  function resizeCanvases() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    [backCv, frontCv].forEach(function (c) {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    });
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function layout() {
    mobile = MOBILE_MQ.matches;
    astH = H * (mobile ? MOBILE_HEIGHT : DESKTOP_HEIGHT);
    astW = astH * aspect;
    if (astW > W * 0.7) { astW = W * 0.7; astH = astW / aspect; }
    astro.style.width = astW.toFixed(1) + 'px';
    astro.style.height = astH.toFixed(1) + 'px';

    if (mobile) {
      ampX = W * 0.05;
      ampY = Math.max(8, H * 0.014);
      var dock = document.querySelector('.linux-dock');
      var r = dock ? dock.getBoundingClientRect() : null;
      var dockTop = (r && r.height > 0) ? r.top : H - 90;
      // bottom edge of the astronaut (incl. max float + depth scale) stays MOBILE_DOCK_GAP above the dock
      targetCX = W / 2;
      targetCY = dockTop - MOBILE_DOCK_GAP - ampY - (astH / 2) * 1.14;
    } else {
      ampX = Math.min(W * 0.06, 110);
      ampY = H * 0.045;
      targetCX = W / 2;
      targetCY = H / 2 + 14; // small offset for the top panel
    }
    if (!layoutInit) { cx = targetCX; cy = targetCY; layoutInit = true; }
  }

  function onResize() { resizeCanvases(); layout(); }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', function () { setTimeout(onResize, 200); });
  if (MOBILE_MQ.addEventListener) MOBILE_MQ.addEventListener('change', layout);
  setInterval(layout, 1000); // keeps the mobile dock gap right if the dock changes

  function setAspect(w, h) {
    if (w > 0 && h > 0) { aspect = w / h; layout(); }
    astro.classList.add('is-ready');
  }
  function loadAspect() {
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setAspect(img.naturalWidth, img.naturalHeight);
    } else {
      // SVGs without intrinsic size: read the viewBox instead
      fetch(img.currentSrc || img.src).then(function (r) { return r.text(); }).then(function (t) {
        var m = t.match(/viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/);
        setAspect(m ? +m[1] : 1, m ? +m[2] : 1);
      }).catch(function () { setAspect(1, 1); });
    }
  }
  if (img.complete) loadAspect(); else img.addEventListener('load', loadAspect);
  img.addEventListener('error', function () { astro.classList.remove('is-ready'); });

  /* ---- Stars (normalised coords, so resizes don't reshuffle) ---- */
  var stars = [];
  (function makeStars() {
    var n = clamp(Math.round((window.innerWidth * window.innerHeight) / 9500), 70, 260);
    for (var i = 0; i < n; i++) {
      var roll = Math.random();
      var kind = roll < 0.16 ? 0 : (roll < 0.94 ? 1 : 2); // 0 dot, 1 star, 2 sparkle
      stars.push({
        x: Math.random(), y: Math.random(), kind: kind,
        r: kind === 0 ? rand(0.5, 0.8) : kind === 1 ? rand(0.5, 1.2) : rand(1.1, 1.6),
        base: kind === 0 ? rand(0.18, 0.34) : rand(0.4, 0.85),
        per: rand(5, 14), ph: rand(0, TWO_PI),
        ci: 1 + (Math.random() * (PAL_VARS.length - 1) | 0),
        cm: Math.random() < 0.35 ? rand(0.25, 0.6) : 0.04
      });
    }
  })();

  /* ---- Distant celestial objects (5, subtle) --------------------- */
  var bodies = [
    { x: 0.13, y: 0.24, r: 0.046, ci: 0, a: 0.20, ring: true,  tilt: -0.38, dr: 140, ph: 0.4 },
    { x: 0.84, y: 0.27, r: 0.028, ci: 3, a: 0.17, ring: false, tilt: 0,     dr: 120, ph: 2.1 },
    { x: 0.74, y: 0.80, r: 0.064, ci: 2, a: 0.12, ring: false, tilt: 0,     dr: 170, ph: 4.0 },
    { x: 0.21, y: 0.79, r: 0.021, ci: 4, a: 0.19, ring: true,  tilt: 0.22,  dr: 110, ph: 5.3 },
    { x: 0.52, y: 0.09, r: 0.10,  ci: 1, a: 0.065, ring: false, tilt: 0,    dr: 190, ph: 1.3, soft: true }
  ];

  /* ---- Orbiting spheres ------------------------------------------ */
  var orbs = [];
  (function makeOrbs() {
    for (var i = 0; i < ORB_COUNT; i++) {
      var sgn = Math.random() < 0.5 ? -1 : 1;
      orbs.push({
        a: rand(0.62, 1.38),                       // semi-major axis, in astronaut heights
        e: rand(0.34, 0.72),                       // minor/major ratio
        phi: sgn * rand(0.55, 1.25),               // pitch of the orbit plane
        chi: rand(-0.55, 0.55),                    // yaw of the orbit plane
        psi: (i / ORB_COUNT) * Math.PI + rand(-0.2, 0.2), // roll, spread around
        per: rand(40, 100),                        // seconds per revolution
        dir: Math.random() < 0.5 ? -1 : 1,
        th0: rand(0, TWO_PI),
        r: rand(2.3, 4.4),                         // tiny
        cper: rand(16, 26),                        // seconds per palette step
        coff: rand(0, PAL_VARS.length)
      });
    }
  })();

  /* ---- Shooting star (rare, top-right to bottom-left) ------------ */
  var shoot = { on: false, t: 0, dur: 1.7, x: 0, y: 0, len: 0, wait: rand(14, 26) };
  var SHOOT_ANGLE = 30 * Math.PI / 180;
  var ux = -Math.cos(SHOOT_ANGLE), uy = Math.sin(SHOOT_ANGLE);

  function stepShoot(dt) {
    if (reduceMq.matches) return;
    if (!shoot.on) {
      shoot.wait -= dt;
      if (shoot.wait <= 0) {
        shoot.on = true; shoot.t = 0;
        shoot.dur = rand(1.5, 2.1);
        shoot.x = W * rand(0.55, 1.0); shoot.y = -10 + H * rand(0, 0.22);
        shoot.len = Math.min(W, 1400) * rand(0.45, 0.7);
      }
    } else {
      shoot.t += dt;
      if (shoot.t >= shoot.dur) { shoot.on = false; shoot.wait = rand(35, 80); }
    }
  }

  /* ---- Astronaut motion ------------------------------------------ */
  var T = reduceMq.matches ? 20 : 0;
  function wave(p, ph) { return Math.sin(T * TWO_PI / p + ph); }

  var ax = 0, ay = 0; // astronaut centre on screen (used by halo + orbits)

  function updateAstronaut(dt) {
    var k = 1 - Math.exp(-dt / 0.5);
    cx += (targetCX - cx) * k;
    cy += (targetCY - cy) * k;

    var wx = wave(83, 1.1) * 0.6 + wave(131, 4.2) * 0.4;
    var wy = wave(67, 0.3) * 0.6 + wave(109, 2.7) * 0.4;
    var wz = wave(97, 5.1);
    var bob = wave(11, 0) * astH * 0.008;

    var dx = wx * ampX;
    var dy = wy * ampY + bob;
    var dz = wz * 70;                       // px toward/away, gives subtle depth scale
    var rz = wave(71, 0.8) * 4.5;           // tilt
    var rx = wave(89, 2.2) * 6.5;           // pitch
    var ry = wave(127, 3.6) * 6;            // slow yaw

    ax = cx + dx;
    ay = cy + dy;

    astro.style.transform =
      'translate3d(' + (ax - astW / 2).toFixed(2) + 'px,' + (ay - astH / 2).toFixed(2) + 'px,0) ' +
      'perspective(1100px) translateZ(' + dz.toFixed(1) + 'px) ' +
      'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) rotateZ(' + rz.toFixed(2) + 'deg)';
  }

  /* ---- Drawing ---------------------------------------------------- */
  function drawBodies(ctx) {
    var m = Math.min(W, H);
    for (var i = 0; i < bodies.length; i++) {
      var b = bodies[i];
      var c = palCur[b.ci];
      var r = b.r * m;
      var x = b.x * W + Math.sin(T * TWO_PI / b.dr + b.ph) * 5;
      var y = b.y * H + Math.cos(T * TWO_PI / (b.dr * 1.3) + b.ph) * 4;
      var g;
      if (b.soft) {            // faint nebula-like cloud
        g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, rgba(c, b.a));
        g.addColorStop(1, rgba(c, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, TWO_PI); ctx.fill();
        continue;
      }
      if (b.ring) { // back half of ring
        ctx.strokeStyle = rgba(mix(c, defCur, 0.35), b.a * 0.55);
        ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.ellipse(x, y, r * 1.75, r * 0.42, b.tilt, Math.PI, TWO_PI); ctx.stroke();
      }
      g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.08, x, y, r);
      g.addColorStop(0, rgba(mix(c, WHITE, 0.35), b.a));
      g.addColorStop(0.6, rgba(c, b.a));
      g.addColorStop(1, rgba(mix(c, BLACK, 0.6), b.a * 0.85));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, TWO_PI); ctx.fill();
      if (b.ring) { // front half of ring
        ctx.strokeStyle = rgba(mix(c, defCur, 0.35), b.a * 0.8);
        ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.ellipse(x, y, r * 1.75, r * 0.42, b.tilt, 0, Math.PI); ctx.stroke();
      }
    }
  }

  function drawStars(ctx) {
    var tw = reduceMq.matches ? 0 : 1;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var px = s.x * W, py = s.y * H;
      var a = s.base;
      if (s.kind !== 0) {
        var t = 0.5 + 0.5 * Math.sin(T * TWO_PI / s.per + s.ph);
        a = s.base * (0.3 + 0.7 * (tw ? t * t * (3 - 2 * t) : 0.8));
      }
      var col = mix(defCur, palCur[s.ci], s.cm);
      ctx.fillStyle = rgba(col, a);
      ctx.beginPath(); ctx.arc(px, py, s.r, 0, TWO_PI); ctx.fill();
      if (s.kind === 2) {
        var L = 2.6 + s.r * 2;
        ctx.strokeStyle = rgba(col, a * 0.55);
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(px - L, py); ctx.lineTo(px + L, py);
        ctx.moveTo(px, py - L); ctx.lineTo(px, py + L);
        ctx.stroke();
      }
    }
  }

  function drawShoot(ctx) {
    if (!shoot.on) return;
    var p = shoot.t / shoot.dur;
    var e = p * (2 - p);                         // ease-out travel
    var hx = shoot.x + ux * shoot.len * e;
    var hy = shoot.y + uy * shoot.len * e;
    var alpha = Math.sin(Math.PI * p);
    var tl = 70 + 90 * Math.sin(Math.PI * p);    // tail grows then shortens
    var col = mix(defCur, palCur[1], 0.3);
    var g = ctx.createLinearGradient(hx, hy, hx - ux * tl, hy - uy * tl);
    g.addColorStop(0, rgba(col, 0.9 * alpha));
    g.addColorStop(1, rgba(col, 0));
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - ux * tl, hy - uy * tl); ctx.stroke();
    ctx.fillStyle = rgba(mix(col, WHITE, 0.5), alpha);
    ctx.beginPath(); ctx.arc(hx, hy, 1.3, 0, TWO_PI); ctx.fill();
  }

  function drawHalo(ctx) {
    var R = astH * 0.95;
    var breathe = 1 + 0.12 * Math.sin(T * TWO_PI / 9);
    var c = mix(palCur[1], palCur[0], 0.4);
    var g = ctx.createRadialGradient(ax, ay, astH * 0.1, ax, ay, R);
    g.addColorStop(0, rgba(c, 0.15 * breathe));
    g.addColorStop(0.5, rgba(c, 0.06 * breathe));
    g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(ax, ay, R, 0, TWO_PI); ctx.fill();
  }

  function drawOrb(ctx, x, y, r, c, a) {
    var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, 0, x, y, r);
    g.addColorStop(0, rgba(mix(c, WHITE, 0.55), a));
    g.addColorStop(0.55, rgba(c, a));
    g.addColorStop(1, rgba(mix(c, BLACK, 0.45), a));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TWO_PI); ctx.fill();
  }

  function drawOrbs() {
    var n = palCur.length;
    var maxA = Math.min(W * 0.46, Infinity);
    for (var i = 0; i < orbs.length; i++) {
      var o = orbs[i];
      var a = Math.min(o.a * astH, maxA);
      var b = a * o.e;
      var th = o.th0 + o.dir * T * TWO_PI / o.per;
      // ellipse in its own plane, then pitch (X), yaw (Y), roll (Z)
      var x0 = a * Math.cos(th), y0 = b * Math.sin(th);
      var y1 = y0 * Math.cos(o.phi), z1 = y0 * Math.sin(o.phi);
      var x2 = x0 * Math.cos(o.chi) + z1 * Math.sin(o.chi);
      var z2 = -x0 * Math.sin(o.chi) + z1 * Math.cos(o.chi);
      var x3 = x2 * Math.cos(o.psi) - y1 * Math.sin(o.psi);
      var y3 = x2 * Math.sin(o.psi) + y1 * Math.cos(o.psi);
      var s = 1400 / (1400 - z2);               // gentle perspective
      var px = ax + x3 * s, py = ay + y3 * s;
      var depth = clamp((z2 / (a * 0.6) + 1) / 2, 0, 1);
      var alpha = 0.6 + 0.4 * depth;
      var rad = o.r * s * (mobile ? 0.9 : 1);

      var u = T / o.cper + o.coff;
      var idx = Math.floor(u), f = u - idx;
      var col = mix(palCur[((idx % n) + n) % n], palCur[(((idx + 1) % n) + n) % n], smooth((f - 0.4) / 0.6));

      drawOrb(z2 > 0 ? fctx : bctx, px, py, rad, col, alpha);
    }
  }

  /* ---- Main loop --------------------------------------------------- */
  var last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (!reduceMq.matches) T += dt;

    stepPalette(dt);
    stepShoot(dt);
    updateAstronaut(dt);

    bctx.clearRect(0, 0, W, H);
    fctx.clearRect(0, 0, W, H);
    drawBodies(bctx);
    drawStars(bctx);
    drawShoot(bctx);
    drawHalo(bctx);
    drawOrbs();          // orbs behind the astronaut -> back canvas, in front -> front canvas
  }

  resizeCanvases();
  layout();
  requestAnimationFrame(frame);
})();