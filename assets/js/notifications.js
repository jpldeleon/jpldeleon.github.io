/**
 * Notification center for the top-panel bell (#panel-bell-btn).
 * Vanilla JS. Load AFTER app.js: app.js's initPanel() already opens/closes the
 * .panel-menu popover (outside click, Escape, one menu open at a time); this file
 * only records events and renders the feed.
 *
 * Tracked events, and only these:
 *   theme    a theme dot was clicked AND data-theme actually changed
 *   phone    a phone copy trigger was clicked AND its toast appeared
 *   email    an email copy trigger was clicked AND its toast appeared
 *   resume   the resume PDF download link was clicked
 *   link     an external (other-origin) http(s) link was clicked
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

  /* 2) Phone / email: a copy trigger was clicked AND its toast appeared */
  let copyPending = null;
  document.addEventListener('click', e => {
    const t = closest(e, '.js-copy-trigger');
    const type = t && t.getAttribute('data-copy-type');
    if (type === 'phone' || type === 'email') copyPending = { type: type, at: Date.now() };
  }, true);

  function toastAppeared(toast) {
    const p = copyPending;
    if (!p || Date.now() - p.at > 4000) return;       // a toast nobody asked for: ignore
    copyPending = null;                               // one click = one notification
    const failed = /fail|unable|couldn|could not|error/i.test(toast.textContent || '');
    const what = p.type === 'phone' ? 'Phone number' : 'Email address';
    add(p.type, failed ? 'Could not copy ' + what.toLowerCase() : what + ' copied', p.type);
  }
  const watchedToasts = new WeakSet();
  function watchToasts() {
    document.querySelectorAll('.copy-toast').forEach(t => {
      if (watchedToasts.has(t)) return;
      watchedToasts.add(t);
      new MutationObserver(recs => {
        recs.forEach(r => {
          const was = (r.oldValue || '').split(/\s+/).indexOf('show') !== -1;
          if (!was && t.classList.contains('show')) toastAppeared(t);
        });
      }).observe(t, { attributes: true, attributeFilter: ['class'], attributeOldValue: true });
    });
  }
  /* Bootstrap fires this each time a toast finishes showing, even when it was already visible */
  document.addEventListener('shown.bs.toast', e => {
    const t = closest(e, '.copy-toast');
    if (t) toastAppeared(t);
  });
  watchToasts();
  window.addEventListener('load', watchToasts);

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