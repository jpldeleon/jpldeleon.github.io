/**
 * Notification center for the top-panel bell (#panel-bell-btn).
 * Vanilla JS. Load AFTER app.js: app.js's initPanel() already opens/closes the
 * .panel-menu popover (outside click, Escape, one menu open at a time); this file
 * only records events and renders the feed.
 *
 * Tracked events, and only these:
 *   theme    a theme dot was clicked AND data-theme actually changed
 *   phone    the phone copy button copied (main.js fires "copy:result")
 *   email    the email copy button copied
 *   resume   the resume PDF download link was clicked
 *   link     an external (other-origin) http(s) link was clicked
 *
 * Every new notification also pops up as a pill above the taskbar (desktop only; see PILL below),
 * shakes the bell and plays a chime (mute button in the popover header);
 * restarting the desktop plays an exit sound, and the desktop finishing its boot plays a welcome sound. See SOUND + BELL SHAKE below.
 *
 * History lives in sessionStorage, so it lasts for the browser tab's session.
 */
(function () {
  'use strict';

  if (window.top !== window.self) return;            // never run inside a project iframe
  if (window.__notifCenterReady) return;             // never bind twice
  const btn = document.getElementById('panel-bell-btn');
  const pop = document.getElementById('notif-pop');
  if (!btn || !pop) return;
  window.__notifCenterReady = true;

  const STORE_KEY = 'notif-center-v1';
  const MAX_ITEMS = 50;
  const TYPES = { theme: 1, phone: 1, email: 1, resume: 1, link: 1 };
  const THEME_NAMES = {
    everforest: 'Everforest', aurora: 'Aurora', gruvbox: 'Gruvbox',
    monokai: 'Monokai Pro', draculapro: 'Dracula Pro'
  };

  const list = pop.querySelector('.notif-list');
  const empty = pop.querySelector('.notif-empty');
  const badge = btn.querySelector('.notif-badge');
  const announcer = pop.querySelector('.notif-announce');
  const readAllBtn = pop.querySelector('[data-act="read-all"]');
  const clearBtn = pop.querySelector('[data-act="clear-all"]');
  const actions = pop.querySelector('.notif-head-actions');

  /* Top-panel clock shows the time only (no day / date). app.js rewrites the text each tick,
     so re-apply the time-only text whenever it changes. The full date stays in the calendar popover. */
  const clockEl = document.getElementById('panel-clock');
  if (clockEl) {
    const timeOnly = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const clockObs = new MutationObserver(() => {
      const t = timeOnly();
      if (clockEl.textContent === t) return;
      clockObs.disconnect();
      clockEl.textContent = t;
      clockObs.observe(clockEl, { childList: true, characterData: true, subtree: true });
    });
    clockObs.observe(clockEl, { childList: true, characterData: true, subtree: true });
    clockEl.textContent = timeOnly();
  }

  /* ===================== sound + bell shake =====================
   * Every new notification rings the bell (a short shake) and plays a soft two-note chime in the
   * style of a Linux / LineageOS notification. Restarting the desktop plays a boot arpeggio.
   * The sounds are synthesised with the Web Audio API, so there are no audio files to ship.
   * To use real recordings instead, put your own files in SOUND_FILES (for example 'assets/audio/notify.ogg');
   * an empty string keeps the built-in sound. A speaker button in the notification header mutes everything
   * (remembered in localStorage). Browsers only allow sound after a click or key press, so a sound that
   * fires before the first interaction is simply skipped. */
  const SOUND_FILES = { notify: '', exit: '', welcome: '' };
  const SOUND_KEY = 'notif-sound';
  const VOLUME = 0.2;
  const reducedMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let soundOn = true;
  try { soundOn = localStorage.getItem(SOUND_KEY) !== 'off'; } catch (e) { /* private mode */ }

  /* bell shake */
  const bellStyle = document.createElement('style');
  bellStyle.textContent =
    '@keyframes notif-ring{0%{transform:rotate(0)}12%{transform:rotate(18deg)}24%{transform:rotate(-16deg)}' +
    '36%{transform:rotate(12deg)}48%{transform:rotate(-9deg)}60%{transform:rotate(6deg)}72%{transform:rotate(-3deg)}100%{transform:rotate(0)}}' +
    '#panel-bell-btn i.is-ringing{display:inline-block;transform-origin:50% 0;animation:notif-ring .9s ease-in-out}' +
    '.notif-sound[aria-pressed="false"]{opacity:.6}';
  document.head.appendChild(bellStyle);

  function shakeBell() {
    if (reducedMotion) return;
    const icon = btn.querySelector('i');
    if (!icon) return;
    icon.classList.remove('is-ringing');
    void icon.offsetWidth;                            // restart the animation if it is already running
    icon.classList.add('is-ringing');
    icon.addEventListener('animationend', () => icon.classList.remove('is-ringing'), { once: true });
  }

  /* synthesised sounds */
  let ctx = null, master = null;
  function audio() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = VOLUME;
      master.connect(ctx.destination);
    } catch (e) { ctx = null; }
    return ctx;
  }
  function unlock() { const c = audio(); if (c && c.state === 'suspended') c.resume(); }
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => document.addEventListener(ev, unlock, { capture: true, passive: true }));

  function tone(freq, at, dur, vol, type) {
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + at;
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function bell(freq, at, dur, vol) {                 // a soft bell: fundamental plus a quiet octave and a fifth above
    tone(freq, at, dur, vol);
    tone(freq * 2, at, dur * 0.6, vol * 0.25);
    tone(freq * 3, at, dur * 0.35, vol * 0.08);
  }
  const SYNTH = {
    notify: () => { bell(1174.66, 0, 0.55, 0.5); bell(1567.98, 0.13, 0.8, 0.5); },                       // D6, G6
    exit: () => {                                                                                      // goodbye: a falling phrase that settles on a low note
      [1046.5, 783.99, 659.25, 523.25].forEach((f, i) => bell(f, i * 0.16, 0.9, 0.4));                 // C6 G5 E5 C5
      tone(130.81, 0.45, 1.2, 0.22, 'triangle');                                                       // C3
    },
    welcome: () => {                                                                                   // hello: a warm swell, then one high bell
      [220, 329.63, 440].forEach(f => tone(f, 0, 1.5, 0.22, 'triangle'));                              // A3, E4, A4 pad
      bell(1174.66, 0.35, 1.1, 0.4);                                                                   // D6
      bell(1760, 0.6, 1.0, 0.3);                                                                       // A6
    }
  };

  function playSound(name) {
    if (!soundOn) return;
    const file = SOUND_FILES[name];
    const synth = () => { const c = audio(); if (!c) return; if (c.state === 'suspended') c.resume(); SYNTH[name](); };
    if (file) {
      const a = new Audio(file);
      a.volume = 0.6;
      a.play().catch(synth);
    } else {
      synth();
    }
  }
  function alertUser() { shakeBell(); playSound('notify'); }

  /* mute button in the notification header */
  const head = pop.querySelector('.notif-head');
  if (head) {
    const mute = el('button', 'notif-act notif-sound');
    mute.type = 'button';
    const icon = el('i', 'fa-solid');
    icon.setAttribute('aria-hidden', 'true');
    mute.appendChild(icon);
    const sync = () => {
      icon.className = 'fa-solid ' + (soundOn ? 'fa-volume-high' : 'fa-volume-xmark');
      mute.setAttribute('aria-pressed', String(soundOn));
      mute.setAttribute('aria-label', soundOn ? 'Mute notification sounds' : 'Unmute notification sounds');
      mute.title = soundOn ? 'Sound on' : 'Sound off';
    };
    mute.addEventListener('click', e => {
      e.stopPropagation();                            // same reason as the feed: do not let the outside-click handler close the popover
      soundOn = !soundOn;
      try { localStorage.setItem(SOUND_KEY, soundOn ? 'on' : 'off'); } catch (err) { /* private mode */ }
      sync();
      if (soundOn) playSound('notify');               // a preview
    });
    sync();
    head.insertBefore(mute, head.querySelector('.notif-head-actions'));
  }

  /* Restart / shut down: the exit sound plays on the click (the click is the user gesture).
     When the desktop has finished booting (app.js fires "desktop:booted"), the welcome sound plays,
     after a restart too. If the browser still blocks audio (no click yet on a fresh load), the welcome
     sound plays on the first click or key press within 20 seconds. */
  document.addEventListener('desktop:restart', () => playSound('exit'));

  let welcomed = false;
  document.addEventListener('desktop:restart', () => { welcomed = false; });
  document.addEventListener('desktop:booted', () => {
    if (welcomed) return;                              // app.js can announce the boot more than once per load
    welcomed = true;
    const c = audio();
    if (c && c.state === 'running') { playSound('welcome'); return; }
    const t0 = Date.now();
    let played = false;
    const late = () => { if (played || Date.now() - t0 > 20000) return; played = true; playSound('welcome'); };
    document.addEventListener('pointerdown', late, { once: true, capture: true });
    document.addEventListener('keydown', late, { once: true, capture: true });
  });

  /* ===================== card above the bell =====================
   * Desktop only (the phone layout has its own shade + heads-up banner, see android.js). A small rounded card
   * slides up right above the bell on the taskbar, like a Windows / Linux Mint notification: icon, message,
   * close button and a thin timer line. Every card is the same size and takes its colours from the theme
   * variables (taskbar.css). Hovering a card keeps it open; click it or its close button to dismiss it;
   * Escape dismisses all of them. */
  const PILL_MS = 4200;
  const PILL_MAX = 3;
  const PILL_ICONS = {
    theme: 'fa-palette', phone: 'fa-phone', email: 'fa-envelope', resume: 'fa-download', link: 'fa-arrow-up-right-from-square'
  };
  const phoneLayout = window.matchMedia ? matchMedia('(max-width: 768px)') : { matches: false };
  let pillHost = null;

  function pillStack() {
    if (pillHost && pillHost.isConnected) return pillHost;
    pillHost = el('div', 'taskbar-pills');
    pillHost.setAttribute('aria-hidden', 'true');      // the sr-only .notif-announce live region already speaks it
    document.body.appendChild(pillHost);
    return pillHost;
  }
  /* Sit right above the bell: the stack's right edge lines up with the bell, and a small caret points at it. */
  function placePills() {
    if (!pillHost) return;
    const r = btn.getBoundingClientRect();
    if (!r.width) return;                              // bell hidden: keep the CSS fallback position
    const vw = document.documentElement.clientWidth;
    const right = Math.max(8, vw - r.right - 2);
    const caret = Math.max(14, vw - (r.left + r.width / 2) - right - 6);
    pillHost.style.setProperty('--pill-right', right + 'px');
    pillHost.style.setProperty('--pill-bottom', (window.innerHeight - r.top + 6) + 'px');
    pillHost.style.setProperty('--pill-caret', caret + 'px');
  }
  window.addEventListener('resize', placePills);

  function closePill(p) {
    if (!p || p.classList.contains('is-leaving')) return;
    p.classList.add('is-leaving');
    clearTimeout(p._timer);
    const done = () => p.remove();
    if (reducedMotion) done(); else { p.addEventListener('animationend', done, { once: true }); setTimeout(done, 400); }
  }
  function showPill(type, text) {
    if (phoneLayout.matches) return;
    const host = pillStack();
    placePills();
    host.querySelectorAll('.taskbar-pill:not(.is-leaving)').forEach((old, i, all) => {
      if (old.textContent === text) closePill(old);                           // same message again: replace it
      else if (all.length >= PILL_MAX && i === 0) closePill(old);            // keep the stack short
    });

    const p = el('div', 'taskbar-pill taskbar-pill--' + type);
    const ico = el('span', 'taskbar-pill-icon');
    ico.appendChild(el('i', 'fa-solid ' + (PILL_ICONS[type] || 'fa-bell')));
    const msg = el('span', 'taskbar-pill-text', text);
    msg.title = text;
    const x = el('button', 'taskbar-pill-x');
    x.type = 'button';
    x.setAttribute('aria-label', 'Dismiss');
    x.appendChild(el('i', 'fa-solid fa-xmark'));
    const bar = el('span', 'taskbar-pill-timer');
    bar.style.animationDuration = PILL_MS + 'ms';
    p.append(ico, msg, x, bar);
    p.addEventListener('click', () => closePill(p));
    host.appendChild(p);

    const arm = () => { clearTimeout(p._timer); p._timer = setTimeout(() => closePill(p), PILL_MS); p.classList.remove('is-paused'); };
    p.addEventListener('pointerenter', () => { clearTimeout(p._timer); p.classList.add('is-paused'); });
    p.addEventListener('pointerleave', arm);
    arm();
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && pillHost) pillHost.querySelectorAll('.taskbar-pill').forEach(closePill);
  });

  /* ===================== state ===================== */
  function load() {
    try {
      const raw = JSON.parse(sessionStorage.getItem(STORE_KEY));
      if (!Array.isArray(raw)) return [];
      return raw.filter(i => i && typeof i.id === 'number' && typeof i.text === 'string' &&
        typeof i.ts === 'number' && Object.prototype.hasOwnProperty.call(TYPES, i.type))
        .map(i => ({ id: i.id, type: i.type, text: i.text, ts: i.ts, read: !!i.read }))
        .slice(0, MAX_ITEMS);
    } catch (e) { return []; }
  }
  function save() { try { sessionStorage.setItem(STORE_KEY, JSON.stringify(items)); } catch (e) { /* private mode */ } }

  let items = load();                                 // newest first
  let seq = items.reduce((m, i) => Math.max(m, i.id), 0);
  let lastKey = '', lastAt = 0;

  function add(type, text, key) {
    const now = Date.now();
    const k = type + '|' + (key || text);
    if (k === lastKey && now - lastAt < 500) return;  // same event reported twice
    lastKey = k; lastAt = now;
    items.unshift({ id: ++seq, type: type, text: text, ts: now, read: false });
    if (items.length > MAX_ITEMS) items.length = MAX_ITEMS;
    save();
    render();
    announce(text);
    showPill(type, text);
    alertUser();
  }

  /* ===================== view ===================== */
  function sameDay(a, b) { return a.toDateString() === b.toDateString(); }
  function stamp(ts) {
    const d = new Date(ts);
    const t = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return sameDay(d, new Date()) ? t : d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + t;
  }
  function announce(text) {
    if (!announcer) return;
    announcer.textContent = '';
    setTimeout(() => { announcer.textContent = 'Notification: ' + text; }, 50);
  }
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function actBtn(act, icon, label) {
    const b = el('button', 'notif-act');
    b.type = 'button';
    b.setAttribute('data-act', act);
    b.setAttribute('aria-label', label);
    b.title = label;
    const i = el('i', 'fa-solid ' + icon);
    i.setAttribute('aria-hidden', 'true');
    b.appendChild(i);
    return b;
  }
  function row(n) {
    const li = el('li', 'notif-item' + (n.read ? '' : ' is-unread'));
    li.setAttribute('data-id', String(n.id));

    const main = el('div', 'notif-main');
    main.appendChild(el('p', 'notif-msg', n.text));
    const time = el('time', 'notif-time', stamp(n.ts));
    time.setAttribute('datetime', new Date(n.ts).toISOString());
    time.title = new Date(n.ts).toLocaleString();
    main.appendChild(time);

    const acts = el('div', 'notif-actions');
    if (!n.read) acts.appendChild(actBtn('read', 'fa-check', 'Mark as read'));
    acts.appendChild(actBtn('dismiss', 'fa-xmark', 'Dismiss notification'));

    li.append(main, acts);
    return li;
  }

  function render() {
    const unread = items.reduce((c, i) => c + (i.read ? 0 : 1), 0);

    if (badge) {
      badge.hidden = unread === 0;
      badge.classList.toggle('is-dot', unread === 1);
      badge.textContent = unread > 1 ? (unread > 9 ? '9+' : String(unread)) : '';
    }
    btn.setAttribute('aria-label', unread ? 'Notifications, ' + unread + ' unread' : 'Notifications');
    btn.title = unread ? unread + ' unread notification' + (unread > 1 ? 's' : '') : 'Notifications';

    list.textContent = '';
    items.forEach(n => list.appendChild(row(n)));
    list.hidden = !items.length;
    empty.hidden = items.length > 0;
    actions.hidden = !items.length;
    readAllBtn.disabled = unread === 0;
  }

  /* ===================== feed actions ===================== */
  function indexOfRow(li) { return Array.prototype.indexOf.call(list.children, li); }
  function refocus(idx, act) {
    const r = list.children[Math.min(idx, list.children.length - 1)];
    const t = r && (r.querySelector('[data-act="' + act + '"]') || r.querySelector('[data-act]'));
    (t || btn).focus();
  }

  pop.addEventListener('click', e => {
    /* stop here: re-rendering removes the clicked node, and the panel's outside-click
       handler would then think the click landed outside the menu and close it */
    e.stopPropagation();
    const trigger = e.target.closest('[data-act]');
    const li = e.target.closest('.notif-item');
    const act = trigger && trigger.getAttribute('data-act');

    if (act === 'read-all') {
      items.forEach(i => { i.read = true; });
      save(); render();
    } else if (act === 'clear-all') {
      items = [];
      save(); render(); btn.focus();
    } else if (li) {
      const n = items.find(i => i.id === Number(li.getAttribute('data-id')));
      if (!n) return;
      const idx = indexOfRow(li);
      if (act === 'dismiss') {
        items = items.filter(i => i !== n);
        save(); render();
        if (items.length) refocus(idx, 'dismiss'); else btn.focus();
      } else if (act === 'read' || (!act && !n.read)) {
        n.read = true;
        save(); render();
        if (act === 'read') refocus(idx, 'dismiss');
      }
    }
  });

  /* ===================== event sources ===================== */
  /* After the other handlers have run: only report a click whose default action went ahead. */
  function afterDefault(ev, fn) { setTimeout(() => { if (!ev.defaultPrevented) fn(); }, 0); }
  const closest = (ev, sel) => (ev.target && ev.target.closest) ? ev.target.closest(sel) : null;

  /* 1) Theme: a theme dot was clicked and data-theme really changed */
  const currentTheme = () => document.documentElement.getAttribute('data-theme') || 'everforest';
  let themePending = null;
  document.addEventListener('click', e => {
    if (closest(e, '[data-theme-choice]')) themePending = { from: currentTheme(), at: Date.now() };
  }, true);
  new MutationObserver(() => {
    if (!themePending) return;
    if (Date.now() - themePending.at > 3000) { themePending = null; return; }
    const now = currentTheme();
    if (now === themePending.from) return;
    themePending = null;
    add('theme', 'Theme changed to ' + (THEME_NAMES[now] || now), now);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* 2) Copy buttons: main.js fires "copy:result" once the clipboard write has succeeded or failed.
        Phone and email copies are filed under their own type; profile links (GitHub, LinkedIn...) under "link". */
  document.addEventListener('copy:result', e => {
    const d = e.detail || {};
    const type = d.type === 'phone' || d.type === 'email' ? d.type : 'link';
    const label = d.type === 'phone' ? 'Phone number' : d.type === 'email' ? 'Email address' : (d.label || 'Link');
    add(type, d.success ? label + ' copied' : 'Could not copy ' + (d.custom ? label : label.toLowerCase()), 'copy-' + type + '-' + label);
  });

  /* 3) Resume: the CV download link was clicked */
  document.addEventListener('click', e => {
    const a = closest(e, 'a[download]');
    if (!a || !/\.pdf([?#]|$)/i.test(a.getAttribute('href') || '')) return;
    afterDefault(e, () => add('resume', 'Resume download started', 'resume'));
  }, true);

  /* 4) Outbound links: other-origin http(s) only. Internal pages, #anchors, mailto:, tel: and downloads don't count. */
  function externalUrl(a) {
    if (!a || a.hasAttribute('download')) return null;
    const raw = a.getAttribute('href');
    if (!raw || raw.charAt(0) === '#') return null;
    let u;
    try { u = new URL(a.href); } catch (e) { return null; }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.origin === window.location.origin ? null : u;
  }
  function onLinkClick(e) {
    if (e.type === 'auxclick' && e.button !== 1) return;    // middle click = open in new tab
    const u = externalUrl(closest(e, 'a[href]'));
    if (!u) return;
    afterDefault(e, () => add('link', 'Opened ' + u.hostname.replace(/^www\./, ''), u.href));
  }
  document.addEventListener('click', onLinkClick, true);
  document.addEventListener('auxclick', onLinkClick, true);

  /* Project windows are same-origin iframes: their external links leave the portfolio too. */
  const hookedDocs = new WeakSet();
  const watchedFrames = new WeakSet();
  function hookFrameDoc(f) {
    try {
      const d = f.contentDocument;
      if (!d || hookedDocs.has(d)) return;
      hookedDocs.add(d);
      d.addEventListener('click', onLinkClick, true);
      d.addEventListener('auxclick', onLinkClick, true);
    } catch (e) { /* cross-origin frame */ }
  }
  function watchFrame(f) {
    if (watchedFrames.has(f)) return;
    watchedFrames.add(f);
    f.addEventListener('load', () => hookFrameDoc(f));      // every navigation brings a new document
    hookFrameDoc(f);
  }
  document.querySelectorAll('iframe').forEach(watchFrame);
  new MutationObserver(recs => {
    recs.forEach(r => r.addedNodes.forEach(n => {
      if (n.nodeType !== 1) return;
      if (n.tagName === 'IFRAME') watchFrame(n);
      else if (n.querySelector) n.querySelectorAll('iframe').forEach(watchFrame);
    }));
  }).observe(document.body, { childList: true, subtree: true });

  render();
})();