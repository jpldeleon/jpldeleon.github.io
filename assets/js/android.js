/*!
 * android.js: phone layout (<= 768px). Builds the Android-style home screen on top of the existing desktop page:
 * status bar + swipe-down notification shade with quick-settings tiles, a scrolling home (hero applet, About me applet,
 * conky-style Experience + Skills), a floating icon dock above the "Ask Jampol" search.
 * It reuses the page's own pieces (theme dots, copy buttons, data-app windows, #restart button); it adds no dependencies.
 */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const txt = el => (el ? el.textContent.trim() : '');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const THEMES = [['everforest', 'Everforest'], ['aurora', 'Aurora'], ['gruvbox', 'Gruvbox'], ['monokai', 'Monokai Pro'], ['draculapro', 'Dracula Pro']];
  const theme = () => document.documentElement.getAttribute('data-theme') || 'everforest';
  const themeName = () => (THEMES.find(t => t[0] === theme()) || THEMES[0])[1];
  const PROJECTS = [
    ['auditkit', 'AuditKit', 'fa-solid fa-magnifying-glass-chart'],
    ['nothingtechblob', 'NothingTechBlob', 'fa-solid fa-mobile-screen'],
    ['badlands-ink', 'Badlands Ink', 'fa-solid fa-pen-nib'],
    ['johnoffthewall', 'John Off the Wall', 'fa-solid fa-fire-flame-curved'],
    ['pixellog', 'PixelLog', 'fa-brands fa-mintbit'],
    ['jamporudex', 'JamporuDEX', 'fa-brands fa-leanpub'],
    ['route196', 'Route 196', 'fa-solid fa-shield']
  ];

  /* ───────── markup ───────── */
  const home = document.createElement('div');
  home.id = 'adr'; home.className = 'adr-layer';
  home.innerHTML = `
    <div class="adr-home" id="adr-home"></div>
    <nav class="adr-dock" aria-label="Apps and projects">
      <button type="button" data-app="resume" aria-label="Resume" title="Resume"><i class="fa-solid fa-timeline"></i></button>
      <button type="button" data-app="portfolio" aria-label="Projects" title="Projects"><i class="fa-solid fa-flask"></i></button>
      <span class="adr-sep" aria-hidden="true"></span>
      ${PROJECTS.map(p => `<a href="${p[0]}/" data-app="project:${p[0]}" aria-label="${esc(p[1])}" title="${esc(p[1])}"><i class="${p[2]}"></i></a>`).join('')}
    </nav>
    <form class="adr-search" data-ask role="search" action="#" autocomplete="off">
      <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
      <input type="text" placeholder="Ask Jampol" aria-label="Ask Jampol" autocomplete="off" spellcheck="false">
    </form>`;

  const top = document.createElement('div');
  top.id = 'adr-top'; top.className = 'adr-layer';
  top.innerHTML = `
    <div class="adr-heads adr-glass adr-n" id="adr-heads"></div>
    <section class="adr-shade" id="adr-shade" inert aria-label="Notifications and quick settings">
      <div class="adr-sh-head"><div class="adr-sh-time"></div><div class="adr-sh-date"></div></div>
      <div class="adr-tiles">
        <button class="adr-tile" data-tile="theme" type="button"><span class="ic"><i class="fa-solid fa-palette"></i></span><b>Theme</b><small></small></button>
        <button class="adr-tile" data-tile="hire" type="button"><span class="ic"><i class="fa-solid fa-user-check"></i></span><b>Why hire me</b></button>
        <button class="adr-tile" data-tile="restart" type="button"><span class="ic"><i class="fa-solid fa-rotate-right"></i></span><b>Restart</b></button>
        <button class="adr-tile" data-tile="hobbies" type="button"><span class="ic"><i class="fa-solid fa-guitar"></i></span><b>Hobbies &amp; Interests</b></button>
      </div>
      <div class="adr-nhead"><span class="adr-lab">Notifications</span><button class="adr-clear" type="button">CLEAR ALL</button></div>
      <div class="adr-list" role="log" aria-live="polite"></div>
      <div class="adr-grab" tabindex="0" role="button" aria-label="Close notification shade"><i></i></div>
    </section>
    <div class="adr-status" id="adr-status"><span class="adr-time"></span><span class="adr-nicons"></span>
      <span class="adr-sys"><i class="fa-solid fa-wifi"></i><i class="fa-solid fa-signal"></i><i class="fa-solid fa-battery-three-quarters"></i></span></div>`;

  document.body.append(home, top);

  const shade = $('#adr-shade'), list = $('.adr-list', shade), heads = $('#adr-heads'), scroller = $('#adr-home');

  /* ───────── home (read from the page, so it stays in sync with it) ───────── */
  let aboutCollapsed = false;
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function typer(el, items) {
    if (!el || !items.length) return;
    if (reduceMotion) { el.textContent = items[0]; return; }
    let i = 0, j = 0, del = false;
    (function step() {
      if (!el.isConnected) return;                       // the home was re-rendered: stop this loop
      const w = items[i]; j += del ? -1 : 1; el.textContent = w.slice(0, j);
      let d = del ? 40 : 85;
      if (!del && j === w.length) { del = true; d = 1500; }
      else if (del && j === 0) { del = false; i = (i + 1) % items.length; d = 350; }
      setTimeout(step, d);
    })();
  }

  const clone = (sel) => {
    const src = $(sel); if (!src) return '';
    const c = src.cloneNode(true);
    c.removeAttribute('id'); $$('[id]', c).forEach(n => n.removeAttribute('id'));
    return c.outerHTML;
  };

  function renderHome() {
    const keep = scroller.scrollTop;
    const photo = $('#hero .photo-original');
    const items = (($('#hero .typed') || {}).dataset || {}).typedItems;
    const aboutBody = $('#about-body');
    const about = aboutBody ? aboutBody.innerHTML.replace(/\sid="[^"]*"/g, '') : '';
    scroller.innerHTML = `
      <section class="adr-hero adr-glass" aria-label="Profile">
        ${photo ? `<img class="adr-avatar" src="${esc(photo.getAttribute('src'))}" alt="John Paul De Leon">` : ''}
        <h1>John Paul <span>De Leon</span></h1>
        <div class="code-container role-code" aria-hidden="true">
          <span class="role-string"><span class="brace">{</span><span class="quote">"</span>technicalSeoSpecialist<span class="quote">"</span><span class="brace">}</span></span>
          <span class="role-comment">// <span class="typed adr-typed"></span><span class="adr-cursor">|</span></span>
        </div>
        <p class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Technical SEO Specialist</p>
        <p class="adr-sum">${esc(txt($('#hero .sidebar-summary')))}</p>
        <div class="adr-actions">
          <button type="button" data-copy="email"><i class="fa-solid fa-envelope"></i>Email</button>
          <button type="button" data-copy="phone"><i class="fa-solid fa-phone"></i>Phone</button>
          <a href="https://github.com/jpldeleon" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i>GitHub</a>
          <a href="assets/johnpauldeleon_resume.pdf" download><i class="fa-solid fa-download"></i>Resume</a>
        </div>
      </section>
      <section class="adr-about adr-glass${aboutCollapsed ? ' is-collapsed' : ''}" aria-label="About me">
        <button class="adr-about-bar" type="button" data-about-toggle aria-expanded="${!aboutCollapsed}" aria-controls="adr-about-body">
          <i class="fa-solid fa-chevron-down" aria-hidden="true"></i><span>About me</span>
        </button>
        <div class="adr-about-body" id="adr-about-body">${about}</div>
      </section>
      <div class="adr-conky">${clone('#exp-widget')}${clone('#skills')}</div>`;
    typer($('.adr-typed', scroller), items ? items.split(',').filter(Boolean) : ['seoSpecialist']);
    scroller.scrollTop = keep;
  }

  scroller.addEventListener('click', ev => {
    const c = ev.target.closest('[data-copy]');          // reuses the page's own copy buttons, so the toast + notification flow is unchanged
    if (c) { const b = $(`#hero .js-copy-trigger[data-copy-type="${c.dataset.copy}"]`); if (b) b.click(); return; }
    const t = ev.target.closest('[data-about-toggle]');
    if (t) {
      aboutCollapsed = !aboutCollapsed;
      t.parentElement.classList.toggle('is-collapsed', aboutCollapsed);
      t.setAttribute('aria-expanded', String(!aboutCollapsed));
    }
  });

  /* ───────── notifications ───────── */
  const events = [];                       // theme change, email / phone copied, resume downloaded
  const info = { hire: false, hobbies: false };   // cards opened from the tiles
  let hobTab = null, shadeOpen = false, headsT = 0;
  const when = ts => { const m = Math.round((Date.now() - ts) / 60000); return m < 1 ? 'now' : m + 'm'; };

  function push(key, icon, title, text) {
    const i = events.findIndex(e => e.key === key); if (i > -1) events.splice(i, 1);
    const n = { key, icon, title, text, ts: Date.now() };
    events.unshift(n); render();
    if (!shadeOpen) {                                       // heads-up banner
      heads.innerHTML = `<div class="t"><i class="fa-solid ${icon}"></i>Portfolio · now</div><h4>${esc(title)}</h4><p>${esc(text)}</p>`;
      heads.classList.add('show'); clearTimeout(headsT);
      headsT = setTimeout(() => heads.classList.remove('show'), 2600);
    }
  }
  const card = (icon, app, title, body, x) => `<div class="adr-n"><div class="t"><i class="fa-solid ${icon}"></i>${app}</div><h4>${title}</h4>${body}${x ? `<button class="x" type="button" data-dismiss="${x}" aria-label="Dismiss">✕</button>` : ''}</div>`;

  function hireCard() {
    const items = $$('.cp-list li').map(li => `<li><i class="${esc(($('i', li) || {}).className || 'fa-solid fa-check')}"></i><div><b>${esc(txt($('b', li)))}</b><span>${esc(txt($('span', li)))}</span></div></li>`).join('');
    return card('fa-user-check', 'Why hire me', 'Why hire me now?', `<p>Early-career, research-driven, and already building.</p><ul class="adr-hire">${items}</ul>
      <div class="adr-acts"><button class="adr-btn p" data-app="resume" type="button">Resume</button><button class="adr-btn" data-app="portfolio" type="button">Projects</button></div>`, 'hire');
  }
  function hobCard() {
    const tabs = $$('#dotfiles .df-file').map(b => [b.id.replace('df-tab-', ''), txt(b)]);
    if (!tabs.length) return card('fa-guitar', 'Hobbies &amp; Interests', 'Hobbies &amp; Interests', '<p>Nothing to show yet.</p>', 'hobbies');
    if (!tabs.some(t => t[0] === hobTab)) hobTab = tabs[0][0];
    const pane = $('#df-pane-' + hobTab);
    const body = pane ? pane.innerHTML.replace(/\sid="[^"]*"/g, '') : '';
    return card('fa-guitar', 'Hobbies &amp; Interests', 'Hobbies &amp; Interests',
      `<div class="adr-hobtabs">${tabs.map(t => `<button type="button" data-hob="${t[0]}" class="${t[0] === hobTab ? 'on' : ''}">${esc(t[1])}</button>`).join('')}</div><div class="adr-hob">${body}</div>`, 'hobbies');
  }

  function render() {
    const showInfo = info.hire || info.hobbies;               // while a tile card is showing, the event notifications step aside
    let html = '';
    if (info.hire) html += hireCard();
    if (info.hobbies) html += hobCard();
    if (!showInfo) html = events.map(e => card(e.icon, 'Portfolio · ' + when(e.ts), esc(e.title), `<p>${esc(e.text)}</p>`)).join('');
    const keep = list.scrollTop;
    list.innerHTML = html || '<div class="adr-empty">No notifications</div>';
    list.scrollTop = keep;
    $('.adr-clear', shade).style.display = !showInfo && events.length ? '' : 'none';
    $('.adr-nicons', top).innerHTML = events.slice(0, 3).map(e => `<i class="fa-solid ${e.icon}"></i>`).join('');
    $$('.adr-tile', shade).forEach(t => t.classList.toggle('on', (t.dataset.tile === 'hire' && info.hire) || (t.dataset.tile === 'hobbies' && info.hobbies)));
    $('[data-tile="theme"] small', shade).textContent = themeName();
  }

  /* what feeds the notifications */
  document.addEventListener('click', e => {
    if (e.target.closest('[data-theme-choice]')) setTimeout(() => push('theme', 'fa-palette', 'Theme changed', 'Theme: ' + themeName()), 0);
    const d = e.target.closest('a[download]');
    if (d) push('resume', 'fa-download', 'Resume downloaded', (d.getAttribute('href') || '').split('/').pop() || 'resume.pdf');
  }, true);
  const seen = new WeakSet();
  const watchToasts = () => $$('.copy-toast .toast-body span').forEach(s => {
    if (seen.has(s)) return; seen.add(s);
    new MutationObserver(() => {
      const t = txt(s);
      if (/copied/i.test(t) && !/could not/i.test(t)) push(/phone/i.test(t) ? 'phone' : 'email', /phone/i.test(t) ? 'fa-phone' : 'fa-envelope', /phone/i.test(t) ? 'Phone number copied' : 'Email copied', t);
    }).observe(s, { childList: true, characterData: true, subtree: true });
  });

  /* ───────── shade: swipe DOWN from the status bar to open, swipe UP inside the shade to close ───────── */
  function setShade(open) {
    shadeOpen = open; shade.classList.remove('drag'); shade.style.transform = '';
    shade.classList.toggle('open', open); shade.inert = !open;
    if (open) { heads.classList.remove('show'); render(); }
    else { info.hire = info.hobbies = false; render(); }   // tile cards go away with the shade; events are kept
  }

  /* open: pointer drag that starts on the status bar (the very top of the screen). A plain tap does nothing. */
  const status = $('#adr-status', top);
  let drag = null;
  status.addEventListener('pointerdown', ev => {
    drag = { y: ev.clientY, h: shade.offsetHeight || innerHeight, dy: 0, wasOpen: shadeOpen };
    status.setPointerCapture(ev.pointerId); shade.classList.add('drag');
  });
  status.addEventListener('pointermove', ev => {
    if (!drag) return;
    const dy = ev.clientY - drag.y; drag.dy = dy;
    const off = drag.wasOpen ? Math.min(0, dy) : Math.min(0, -drag.h + Math.max(0, dy));
    shade.style.transform = `translateY(${off}px)`;
  });
  const endStatus = () => {
    if (!drag) return;
    const { dy, wasOpen } = drag; drag = null;
    if (wasOpen) setShade(dy > -70);                       // swipe up on the bar closes
    else setShade(dy > 70);                                // swipe down opens
  };
  status.addEventListener('pointerup', endStatus);
  status.addEventListener('pointercancel', endStatus);

  /* close: swipe up anywhere inside the open shade (the notification list keeps its own scrolling first) */
  let tc = null;
  shade.addEventListener('touchstart', ev => {
    if (!shadeOpen || ev.touches.length !== 1) { tc = null; return; }
    tc = { y: ev.touches[0].clientY, live: false, dy: 0 };
  }, { passive: true });
  shade.addEventListener('touchmove', ev => {
    if (!tc) return;
    const dy = ev.touches[0].clientY - tc.y; tc.dy = dy;
    const inList = ev.target.closest && ev.target.closest('.adr-list');
    const listCanScrollDown = inList && list.scrollTop + list.clientHeight < list.scrollHeight - 2;
    if (!tc.live && dy < -10 && !listCanScrollDown) { tc.live = true; shade.classList.add('drag'); }
    if (tc.live) shade.style.transform = `translateY(${Math.min(0, dy)}px)`;
  }, { passive: true });
  const endTouch = () => {
    if (!tc) return;
    const was = tc; tc = null;
    if (was.live) setShade(was.dy > -70);
  };
  shade.addEventListener('touchend', endTouch);
  shade.addEventListener('touchcancel', endTouch);
  $('.adr-grab', shade).addEventListener('click', () => setShade(false));
  $('.adr-grab', shade).addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') setShade(false); });

  shade.addEventListener('click', ev => {
    const t = ev.target.closest('.adr-tile');
    if (t) {
      const k = t.dataset.tile;
      if (k === 'theme') { const i = THEMES.findIndex(x => x[0] === theme()); const n = $(`[data-theme-choice="${THEMES[(i + 1) % THEMES.length][0]}"]`); if (n) n.click(); }
      else if (k === 'hire') { info.hire = !info.hire; render(); }
      else if (k === 'hobbies') { info.hobbies = !info.hobbies; render(); }
      else if (k === 'restart') { setShade(false); const r = $('#panel-restart-btn'); if (r) r.click(); else location.reload(); }
      return;
    }
    if (ev.target.closest('.adr-clear')) { events.length = 0; render(); return; }
    const x = ev.target.closest('[data-dismiss]'); if (x) { info[x.dataset.dismiss] = false; render(); return; }
    const h = ev.target.closest('[data-hob]'); if (h) { hobTab = h.dataset.hob; render(); return; }
    if (ev.target.closest('[data-app]')) setShade(false);       // Resume / Projects buttons: the window opens, the shade closes
  });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && shadeOpen) setShade(false); });

  /* ───────── clock + start-up ───────── */
  const tick = () => {
    const n = new Date(), t = n.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    $('.adr-time', top).textContent = t; $('.adr-sh-time', shade).textContent = t;
    $('.adr-sh-date', shade).textContent = n.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };
  tick(); setInterval(tick, 15000);
  setInterval(() => { if (shadeOpen) render(); }, 60000);          // keep "2m" ages fresh
  const init = () => { renderHome(); watchToasts(); render(); };
  init();
  document.addEventListener('desktop:booted', init);
  window.addEventListener('load', () => setTimeout(init, 600));
})();