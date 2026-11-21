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
  const THEMES = [['everforest', 'Everforest'], ['aurora', 'Aurora'], ['gruvbox', 'Gruvbox'], ['monokai', 'Monokai Pro'], ['draculapro', 'Dracula Pro Nosferatu'], ['nordfrost', 'Nord Frost'], ['miasma', 'Miasma'], ['kanagawadragon', 'Kanagawa Dragon'], ['flexoki', 'Flexoki']];
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
      <input type="text" placeholder="Ask Jampol or type help" aria-label="Ask Jampol" autocomplete="off" spellcheck="false">
      <button class="adr-send" type="submit" aria-label="Send"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i></button>
    </form>`;

  const top = document.createElement('div');
  top.id = 'adr-top'; top.className = 'adr-layer';
  top.innerHTML = `
    <div class="adr-scrim" id="adr-scrim"></div>
    <div class="adr-heads adr-glass adr-n" id="adr-heads" role="status"></div>
    <section class="adr-shade" id="adr-shade" inert aria-label="Notifications and quick settings">
      <div class="adr-tiles">
        <button class="adr-tile" data-tile="theme" type="button"><span class="ic"><i class="fa-solid fa-palette"></i></span><span class="tx"><b>Theme</b><small></small></span></button>
        <button class="adr-tile" data-tile="hire" type="button"><span class="ic"><i class="fa-solid fa-user-check"></i></span><span class="tx"><b>Why hire me</b><small>Tap to view</small></span></button>
        <button class="adr-tile" data-tile="restart" type="button"><span class="ic"><i class="fa-solid fa-rotate-right"></i></span><span class="tx"><b>Restart</b><small>Reload page</small></span></button>
        <button class="adr-tile" data-tile="hobbies" type="button" aria-label="Hobbies &amp; Interests"><span class="ic"><i class="fa-solid fa-guitar"></i></span><span class="tx"><b>Hobbies</b><small>&amp; Interests</small></span></button>
      </div>
      <div class="adr-nhead"><span class="adr-lab">Notifications</span><button class="adr-clear" type="button">CLEAR ALL</button></div>
      <div class="adr-list" role="log" aria-live="polite"></div>
      <div class="adr-grab" tabindex="0" role="button" aria-label="Close notification shade"><i></i></div>
    </section>
    <div class="adr-status" id="adr-status"><span class="adr-time"></span><span class="adr-date" aria-hidden="true"></span><span class="adr-nicons"></span>
      <span class="adr-sys"><i class="fa-solid fa-wifi"></i><i class="fa-solid fa-signal"></i><i class="fa-solid fa-battery-three-quarters"></i></span></div>`;

  document.body.append(home, top);

  const scrim = $('#adr-scrim', top), shade = $('#adr-shade'), list = $('.adr-list', shade), heads = $('#adr-heads'), scroller = $('#adr-home');

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

  /* social links live in the hero applet now. Each icon is copied from the page's own link to the same site
     (top-bar connect icons / desktop hero), so they always match; the Font Awesome class below is only the fallback. */
  const SOCIALS = {
    linkedin: ['linkedin.com', 'https://www.linkedin.com/in/jpldl/', 'LinkedIn', 'fa-brands fa-linkedin-in'],
    github: ['github.com/jpldeleon', 'https://github.com/jpldeleon', 'GitHub', 'fa-brands fa-github'],
    upwork: ['upwork.com', 'https://www.upwork.com/freelancers/~01562764cad5d47331', 'Upwork', 'fa-brands fa-upwork'],
    golance: ['golance.com', 'https://golance.com/freelancer/john.paul.leonard.de.leon', 'GoLance', 'fa-solid fa-circle-nodes']
  };
  const siteIcon = (host, fallback) => {
    const links = $$(`.panel-connect a[href*="${host}"], #hero a[href*="${host}"]`).filter(a => !a.closest('.adr-layer'));
    for (const a of links) { const i = $('i', a); if (i && /\bfa-(brands|solid|regular)\b/.test(i.className)) return i.className.replace(/\s+/g, ' ').trim(); }
    return fallback;
  };
  const social = k => { const [host, url, name, fb] = SOCIALS[k]; return `<a href="${url}" target="_blank" rel="noopener"><i class="${esc(siteIcon(host, fb))}"></i>${name}</a>`; };

  function renderHome() {
    const keep = scroller.scrollTop;
    const photo = $('#hero .photo-original');
    const items = (($('#hero .typed') || {}).dataset || {}).typedItems;
    const aboutBody = $('#about-body');
    const about = aboutBody ? aboutBody.innerHTML.replace(/\sid="[^"]*"/g, '') : '';
    scroller.innerHTML = `
      <section class="adr-hero adr-glass" aria-label="Profile">
        ${clone('#hero .sidebar-avatar')}
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
          ${social('linkedin')}
          ${social('github')}
          ${social('upwork')}
          ${social('golance')}
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
    if (ev.target.closest('.sidebar-avatar a')) { ev.preventDefault(); return; }
    const c = ev.target.closest('[data-copy]');          // reuses the page's own copy buttons, so the notification flow is unchanged
    if (c) { const b = $(`#hero .js-copy-trigger[data-copy-type="${c.dataset.copy}"]`); if (b) b.click(); return; }
    const t = ev.target.closest('[data-about-toggle]');
    if (t) {
      aboutCollapsed = !aboutCollapsed;
      t.parentElement.classList.toggle('is-collapsed', aboutCollapsed);
      t.setAttribute('aria-expanded', String(!aboutCollapsed));
    }
  });

  /* ───────── notifications ───────── */
  const events = [];                       // everything notifications.js reports
  const cards = [];                        // tile cards (hire / hobbies) in the shade, newest first; the latest tap sits on top
  let hobTab = null, shadeOpen = false, headsT = 0;
  const when = ts => { const m = Math.round((Date.now() - ts) / 60000); return m < 1 ? 'now' : m + 'm'; };

  /* heads-up pill: keeps its normal size, but starts at the top edge of the status bar (over it, like Android's
     compact heads-up) instead of dropping below it */
  function showHeads(icon, title, ms) {
    heads.innerHTML = `<i class="fa-solid ${icon}"></i><span>${esc(title)}</span>`;
    const sb = $('#adr-status', top), r = sb ? sb.getBoundingClientRect() : null;
    heads.style.top = (r ? Math.max(0, Math.round(r.top) + 4) : 4) + 'px';
    heads.style.zIndex = '60';
    heads.classList.add('show'); clearTimeout(headsT);
    headsT = setTimeout(() => heads.classList.remove('show'), ms);
  }

  function push(key, icon, title, text) {
    const i = events.findIndex(e => e.key === key); if (i > -1) events.splice(i, 1);
    const n = { key, icon, title, text, ts: Date.now() };
    events.unshift(n); render();
    if (!shadeOpen) showHeads(icon, title, 2600);           // heads-up pill in the status bar
  }
  const card = (icon, app, title, body, x, cls) => `<div class="adr-n${cls ? ' ' + cls : ''}"><div class="t"><i class="fa-solid ${icon}"></i>${app}</div><h4>${title}</h4>${body}${x ? `<button class="x" type="button" data-dismiss="${x}" aria-label="Dismiss">✕</button>` : ''}</div>`;

  function hireCard() {
    const items = $$('.wh-item').map(li => `<li><i class="${esc(($('i', li) || {}).className || 'fa-solid fa-check')}"></i><div><b>${esc(txt($('b', li)))}</b><span>${esc(txt($('span', li)))}</span></div></li>`).join('');
    return card('fa-user-check', 'Why hire me', 'Why hire me now?', `<p>${esc(txt($('.wh-sub')) || 'Early-career, research-driven, and already building.')}</p><ul class="adr-hire">${items}</ul>
      <div class="adr-acts"><button class="adr-btn p" data-app="resume" type="button">Resume</button><button class="adr-btn" data-app="portfolio" type="button">Projects</button></div>`, 'hire');
  }
  /* Font Awesome icon for a hobby, picked from keywords in its name (first match wins) */
  const HOB_ICONS = [
    [/linux|ubuntu|mint|arch\b|distro/i, 'fa-brands fa-linux'],
    [/android|lineage/i, 'fa-brands fa-android'],
    [/rom|firmware|flash|chip|embedded|arduino|raspberry/i, 'fa-solid fa-microchip'],
    [/hardware|pc build|\bpc\b|computer|troubleshoot|repair/i, 'fa-solid fa-computer'],
    [/open[- ]?source|foss|free (&|and) /i, 'fa-solid fa-code-branch'],
    [/llm|\bai\b|artificial|machine learning|model/i, 'fa-solid fa-robot'],
    [/ui\/?ux|design|ui\b|ux\b|graphic|art\b|draw|sketch/i, 'fa-solid fa-pen-ruler'],
    [/web|site|internet|browser|wordpress/i, 'fa-solid fa-globe'],
    [/cod(e|ing)|program|script|develop|learn/i, 'fa-solid fa-code'],
    [/news|emerging|trend|article|blog/i, 'fa-solid fa-newspaper'],
    [/desktop|custom|theme|rice|dotfile/i, 'fa-solid fa-desktop'],
    [/mobile|phone|smartphone|gadget/i, 'fa-solid fa-mobile-screen'],
    [/terminal|shell|cli\b|command/i, 'fa-solid fa-terminal'],
    [/server|self-?host|homelab|cloud/i, 'fa-solid fa-server'],
    [/network|wi-?fi|router/i, 'fa-solid fa-network-wired'],
    [/secur|privacy|vpn/i, 'fa-solid fa-shield-halved'],
    [/guitar/i, 'fa-solid fa-guitar'],
    [/music|song|playlist|band|listen/i, 'fa-solid fa-music'],
    [/game|gaming|esport|console/i, 'fa-solid fa-gamepad'],
    [/chess/i, 'fa-solid fa-chess'],
    [/movie|film|cinema|series|show|anime|watch/i, 'fa-solid fa-film'],
    [/book|read|novel|manga|comic/i, 'fa-solid fa-book-open'],
    [/photo|camera|video|film making|edit/i, 'fa-solid fa-camera'],
    [/travel|trip|explor|adventure|hik|road/i, 'fa-solid fa-earth-asia'],
    [/cook|food|bak|coffee|tea\b/i, 'fa-solid fa-utensils'],
    [/gym|fitness|workout|exercise|lift/i, 'fa-solid fa-dumbbell'],
    [/run|jog|cycl|bike|swim|sport|basketball|football|badminton/i, 'fa-solid fa-person-running'],
    [/3d|print|maker|diy|build/i, 'fa-solid fa-cube'],
    [/space|astronom|science|physics/i, 'fa-solid fa-rocket'],
    [/car|motor|drive/i, 'fa-solid fa-car-side'],
    [/pet|dog|cat\b/i, 'fa-solid fa-paw']
  ];
  const hobIcon = function (t) {
    for (let i = 0; i < HOB_ICONS.length; i++) if (HOB_ICONS[i][0].test(t)) return HOB_ICONS[i][1];
    return 'fa-solid fa-circle-dot';
  };

  /* Non-Font-Awesome icons: Simple Icons (real brand logos) and Material Design Icons, served by Iconify.
     The SVG is fetched once, cached, and drawn inline so it takes the badge's theme colour. If a name does not
     exist or the network fails, the Font Awesome icon above stays, so a badge is never empty. First match wins. */
  const HOB_ART = [
    [/linux/i, 'simple-icons:linux'],
    [/custom rom|rom\b|firmware/i, 'simple-icons:lineageos'],
    [/android|mobile tech/i, 'simple-icons:android'],
    [/pc hardware|hardware/i, 'mdi:expansion-card'],
    [/open[- ]?source|foss/i, 'simple-icons:opensourceinitiative'],
    [/llm|\bai\b|ai tools|ai engineer/i, 'simple-icons:ollama'],
    [/web build|web dev/i, 'mdi:web'],
    [/coding|software dev/i, 'mdi:code-braces'],
    [/tech news|emerging/i, 'mdi:newspaper-variant-outline'],
    [/ui\/?ux/i, 'simple-icons:figma'],
    [/photoshop/i, 'simple-icons:adobephotoshop'],
    [/lightroom/i, 'simple-icons:adobelightroomclassic'],
    [/davinci/i, 'simple-icons:davinciresolve'],
    [/graphic design/i, 'mdi:vector-curve'],
    [/photograph/i, 'mdi:camera-outline'],
    [/seo/i, 'simple-icons:googlesearchconsole'],
    [/web developer/i, 'mdi:web'],
    [/data scien/i, 'mdi:chart-scatter-plot'],
    [/dota/i, 'simple-icons:dota2'],
    [/counter-?strike/i, 'simple-icons:counterstrike'],
    [/call of duty/i, 'simple-icons:callofduty'],
    [/pubg/i, 'simple-icons:pubg'],
    [/nba/i, 'mdi:basketball'],
    [/need for speed/i, 'simple-icons:ea'],
    [/left 4 dead/i, 'mdi:biohazard'],
    [/red alert/i, 'mdi:radioactive'],
    [/battle realms/i, 'mdi:sword-cross'],
    [/mat online/i, 'mdi:car-sports'],
    [/linkin park|metallica|saosin|blink|chemical romance|silverstein|yellowcard|guns n|the used|green day/i, 'mdi:guitar-electric'],
    [/marvel/i, 'simple-icons:marvelstudios'],
    [/ghibli/i, 'mdi:movie-open-star-outline'],
    [/the office|big bang|how i met|brooklyn|friends|modern family|young sheldon/i, 'mdi:television-classic'],
    [/life of pi/i, 'mdi:ferry'],
    [/travel|exploring/i, 'mdi:airplane'],
    [/motorcycle|motorbike/i, 'mdi:motorbike'],
    [/dream cars|cars and driving/i, 'mdi:car-sports'],
    [/bikepacking|cycling/i, 'mdi:bicycle'],
    [/hiking|nature/i, 'mdi:hiking'],
    [/food|cuisine/i, 'mdi:silverware-fork-knife'],
    [/camping/i, 'mdi:tent'],
    [/skydiv/i, 'mdi:parachute'],
    [/snowboard/i, 'mdi:snowboard'],
    [/skiing/i, 'mdi:ski'],
    [/longboard|skate/i, 'mdi:skateboarding'],
    [/wingsuit|hang glid|paraglid/i, 'mdi:paragliding'],
    [/surf/i, 'mdi:surfing'],
    [/home by the sea|home by/i, 'mdi:home-lake'],
    [/off-grid/i, 'mdi:solar-power'],
    [/dream motorcycles/i, 'mdi:motorbike']
  ];
  const ART_URL = n => 'https://api.iconify.design/' + n.replace(':', '/') + '.svg';
  const art = new Map();                              // iconify name -> cleaned inline <svg> markup, or false when it failed
  const artName = t => { for (let i = 0; i < HOB_ART.length; i++) if (HOB_ART[i][0].test(t)) return HOB_ART[i][1]; return ''; };
  /* the SVG is drawn inline (not as a CSS mask), so it always fills the badge and follows the text colour */
  const cleanSvg = svg => {
    if (!/^\s*<svg[\s>]/i.test(svg)) return '';
    return svg.replace(/<\?xml[^>]*>/g, '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/\son\w+="[^"]*"/gi, '')
      .replace(/^\s*<svg([^>]*)>/i, (m, at) => '<svg' + at.replace(/\s(width|height|style|class)="[^"]*"/gi, '') + ' aria-hidden="true" focusable="false">');
  };
  const hobGlyph = t => {
    const n = artName(t), svg = n && art.get(n);
    if (svg) return `<span class="adr-art">${svg}</span>`;
    return `<i class="${hobIcon(t)}"${n && art.get(n) !== false ? ` data-art="${n}"` : ''}></i>`;
  };
  function hydrateArt(root) {
    $$('[data-art]', root).forEach(el => {
      const n = el.dataset.art; el.removeAttribute('data-art');
      const done = svg => {
        if (!svg || !el.isConnected) return;
        const sp = document.createElement('span'); sp.className = 'adr-art'; sp.innerHTML = svg; el.replaceWith(sp);
      };
      if (art.has(n)) { done(art.get(n)); return; }
      fetch(ART_URL(n)).then(r => r.ok ? r.text() : Promise.reject()).then(t => {
        const svg = cleanSvg(t); if (!svg) throw 0;
        art.set(n, svg); done(svg);
      }).catch(() => { art.set(n, false); });
    });
  }
  const artCss = document.createElement('style');
  artCss.textContent = '.adr-hob .lg .adr-art{display:inline-flex;align-items:center;justify-content:center;width:1em;height:1em;line-height:1}.adr-hob .lg .adr-art svg{display:block;width:100%;height:100%;fill:currentColor}';
  document.head.appendChild(artCss);

  function hobCard() {
    const tabs = $$('#dotfiles .df-file').map(b => [b.id.replace('df-tab-', ''), txt(b)]);
    if (!tabs.length) return card('fa-guitar', 'Hobbies &amp; Interests', 'Hobbies &amp; Interests', '<p>Nothing to show yet.</p>', 'hobbies', 'adr-lin');
    if (!tabs.some(t => t[0] === hobTab)) hobTab = tabs[0][0];
    const pane = $('#df-pane-' + hobTab);
    const desc = pane ? txt($('.df-desc', pane)) : '';
    const rows = pane ? $$('.df-list li', pane).map(li => txt(li)).filter(Boolean) : [];
    /* settings-style grouped list: a round badge with a Font Awesome icon, rows joined into one rounded group */
    const list = rows.length
      ? `<ul class="adr-hob">${rows.map(r => `<li><span class="lg" aria-hidden="true">${hobGlyph(r)}</span><span class="tx">${esc(r)}</span></li>`).join('')}</ul>`
      : '<p>Nothing to show yet.</p>';
    return card('fa-guitar', 'Hobbies &amp; Interests', 'Hobbies &amp; Interests',
      `<div class="adr-hobtabs" role="tablist">${tabs.map(t => `<button type="button" role="tab" aria-selected="${t[0] === hobTab}" data-hob="${t[0]}" class="${t[0] === hobTab ? 'on' : ''}">${t[0] === hobTab ? '<i class="fa-solid fa-check" aria-hidden="true"></i>' : ''}${esc(t[1])}</button>`).join('')}</div>${desc ? `<p class="adr-hobdesc">${esc(desc)}</p>` : ''}${list}`,
      'hobbies', 'adr-lin');
  }

  /* tapping a category only swaps the description + list inside the existing card: the tab strip, the notification list
     and every other card keep their scroll position (a full render() rebuilt them all and snapped them back to 0) */
  function pickHob(id) {
    const tabsEl = $('.adr-hobtabs', list);
    if (!tabsEl) { hobTab = id; render(); return; }
    hobTab = id;
    $$('button[data-hob]', tabsEl).forEach(b => {
      const on = b.dataset.hob === id, ic = $('i', b);
      b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on));
      if (on && !ic) b.insertAdjacentHTML('afterbegin', '<i class="fa-solid fa-check" aria-hidden="true"></i>');
      if (!on && ic) ic.remove();
    });
    const keepL = tabsEl.scrollLeft, keepT = list.scrollTop;
    const tmp = document.createElement('div'); tmp.innerHTML = hobCard();
    const fresh = $('.adr-hobtabs', tmp), old = tabsEl;
    /* everything under the tab strip comes from the freshly built card; the strip itself stays in the DOM */
    while (old.nextSibling) old.nextSibling.remove();
    let n = fresh.nextSibling; while (n) { const nx = n.nextSibling; old.parentNode.appendChild(n); n = nx; }
    tabsEl.scrollLeft = keepL; list.scrollTop = keepT;
    hydrateArt(list);
  }

  function render() {
    /* tile cards are ordinary notifications now: the most recently tapped one is on top, the event notifications stay below */
    let html = cards.map(k => k === 'hire' ? hireCard() : hobCard()).join('');
    html += events.map(e => card(e.icon, 'Portfolio · ' + when(e.ts), esc(e.title), e.text ? `<p>${esc(e.text)}</p>` : '')).join('');
    const keep = list.scrollTop, kt = $('.adr-hobtabs', list), ks = kt ? kt.scrollLeft : 0, kh = $('.adr-hob', list), kv = kh ? kh.scrollTop : 0;
    list.innerHTML = html || '<div class="adr-empty">No notifications</div>';
    list.scrollTop = keep;
    const nt = $('.adr-hobtabs', list), nh = $('.adr-hob', list);   // the hobbies card is rebuilt: put its scroll positions back
    if (nt) nt.scrollLeft = ks; if (nh) nh.scrollTop = kv;
    hydrateArt(list);
    $('.adr-clear', shade).style.display = events.length || cards.length ? '' : 'none';
    $('.adr-nicons', top).innerHTML = events.slice(0, 3).map(e => `<i class="fa-solid ${e.icon}"></i>`).join('');
    $('[data-tile="theme"] small', shade).textContent = themeName();
    /* quick tile state: Theme is always lit; Why hire me / Hobbies are lit while their card is open in the shade
       (tapping brings it back to the top, dismissing it or closing the shade turns the tile off); Restart stays momentary */
    $$('.adr-tile[data-tile]', shade).forEach(b => {
      const k = b.dataset.tile;
      const on = k === 'theme' || ((k === 'hire' || k === 'hobbies') && cards.includes(k));
      b.classList.toggle('on', on);
      if (k !== 'restart') b.setAttribute('aria-pressed', String(on));
    });
  }

  /* what feeds the notifications: notifications.js reports every event (theme, copy, resume, project, social and
     outbound links, restart) with "notif:added", so the phone shade shows exactly what the desktop bell does */
  const N_ICONS = {
    theme: 'fa-palette', phone: 'fa-phone', email: 'fa-envelope', resume: 'fa-download', link: 'fa-arrow-up-right-from-square',
    social: 'fa-share-nodes', project: 'fa-window-maximize', restart: 'fa-rotate-right'
  };
  let leftFor = null;                      // an outbound link opened another tab: show its notification again on return
  document.addEventListener('notif:added', e => {
    const d = e.detail || {};
    push(d.type + '|' + d.key, N_ICONS[d.type] || 'fa-bell', d.text, '');
    leftFor = (d.type === 'link' || d.type === 'social') ? { icon: N_ICONS[d.type], title: d.text, ts: Date.now() } : null;
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !leftFor) return;
    const n = leftFor; leftFor = null;
    if (Date.now() - n.ts > 10 * 60 * 1000 || shadeOpen) return;
    showHeads(n.icon, n.title, 3200);
  });

  /* ───────── shade: swipe DOWN from the status bar to open, swipe UP inside the shade to close ───────── */
  function setShade(open) {
    shadeOpen = open; shade.classList.remove('drag'); shade.style.transform = '';
    shade.classList.toggle('open', open); shade.inert = !open; scrim.classList.toggle('show', open);
    $('#adr-status', top).classList.toggle('shade-open', open);
    if (open) { heads.classList.remove('show'); render(); }
    else { cards.length = 0; render(); }   // tile cards go away with the shade; events are kept
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
  scrim.addEventListener('click', () => setShade(false));
  $('.adr-grab', shade).addEventListener('click', () => setShade(false));
  $('.adr-grab', shade).addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') setShade(false); });

  shade.addEventListener('click', ev => {
    const t = ev.target.closest('.adr-tile[data-tile]');
    if (t) {
      const k = t.dataset.tile;
      if (k === 'theme') { const i = THEMES.findIndex(x => x[0] === theme()); const n = $(`[data-theme-choice="${THEMES[(i + 1) % THEMES.length][0]}"]`); if (n) n.click(); }
      else if (k === 'hire' || k === 'hobbies') {
        const i = cards.indexOf(k), already = i === 0; if (i > -1) cards.splice(i, 1);
        cards.unshift(k);                                      // latest tapped goes to the very top (tapping again just brings it back up)
        render(); if (!already) list.scrollTop = 0;
        t.blur();                                              // the tile stays lit through render() while its card is open
      }
      else if (k === 'restart') { setShade(false); const r = $('#panel-restart-btn'); if (r) r.click(); else location.reload(); }
      return;
    }
    if (ev.target.closest('.adr-clear')) { events.length = 0; cards.length = 0; render(); return; }
    const x = ev.target.closest('[data-dismiss]'); if (x) { const i = cards.indexOf(x.dataset.dismiss); if (i > -1) cards.splice(i, 1); render(); return; }
    const h = ev.target.closest('[data-hob]'); if (h) { pickHob(h.dataset.hob); return; }
    if (ev.target.closest('[data-app]')) setShade(false);       // Resume / Projects buttons: the window opens, the shade closes
  });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && shadeOpen) setShade(false); });

  /* send button: lit up only when there is text */
  const askForm = $('.adr-search', home), askInput = $('input', askForm);
  askInput.addEventListener('input', () => askForm.classList.toggle('has-text', !!askInput.value.trim()));

  /* ───────── clock + start-up ───────── */
  const tick = () => {
    const n = new Date(), t = n.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    $('.adr-time', top).textContent = t;
    $('.adr-date', top).textContent = n.toLocaleDateString([], { month: 'short', day: 'numeric' });   // month + day only, shown while the shade is open
  };
  tick(); setInterval(tick, 15000);
  setInterval(() => { if (shadeOpen) render(); }, 60000);          // keep "2m" ages fresh
  const init = () => { renderHome(); render(); };
  init();
  document.addEventListener('desktop:booted', init);
  window.addEventListener('load', () => setTimeout(init, 600));
})();

/* ═════════════ app bubbles (Project / Certificate / Resume / Projects windows) ═════════════ */
/*!
 * android-bubbles.js: phone layout (<= 768px). Android 16 style "app bubbles" for the Project, Certificate,
 * Resume and Projects windows. It does not touch app.js: it watches #wm-layer and decorates those windows.
 *
 *   window open     -> every project/certificate has a round bubble; they sit in a row at the top, centred, with the open
 *                      one filled and a small pointer on the sheet. A "+" bubble opens the Projects list.
 *   tap open bubble -> the sheet shrinks into its bubble and the bubbles float free as chat heads (edge-snapping, stacking)
 *   tap other one   -> switch (only one sheet is open at a time)
 *   drag a bubble   -> the X target appears at the bottom; drop on it to close that window (floating stack: closes every head in it)
 *   swipe the title bar down -> same as tapping the open bubble
 * Load after app.js and android.js:  <script src="assets/js/android-bubbles.js" defer></script>
 */
(() => {
  'use strict';
  const mq = window.matchMedia('(max-width:768px)');
  const still = () => window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const KINDS = /^(?:(?:project|cert):.+|resume|portfolio)$/;
  const S = 56, M = 6, TOP = 40, BOTTOM = 130;       // floating chat head: size, edge margin, top limit, space kept for dock + search
  const R = 46, G = 10, ROWTOP = 40;                  // bubble row: size, gap, y
  const PANEL_TOP = 106, PANEL_BOTTOM = 126;          // sheet sits between the bubble row and the dock
  const XS = 60, XB = 100;                            // close target size + distance from the bottom
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const vw = () => window.innerWidth, vh = () => window.innerHeight;
  const STEP = 6, STEPY = 5, MAXSTEP = 3;            // stacked chat heads: how far each one peeks out behind the front one
  const recs = new Map();                             // window id -> record
  const stack = { side: 'r', y: 150 };                // where the stack of floating heads sits (edge + height)
  let seq = 0;                                        // collapse order: newest head is on top
  let host, xt, plus;

  const build = () => {
    host = document.createElement('div');
    host.id = 'adr-bubbles'; host.className = 'adr-layer';
    host.innerHTML = '<div class="adr-bx" aria-hidden="true"><i class="fa-solid fa-xmark"></i></div>' +
      '<button type="button" class="adr-bub adr-plus" data-app="portfolio" aria-label="All projects"><i class="fa-solid fa-plus" aria-hidden="true"></i></button>';
    document.body.appendChild(host);
    xt = host.children[0]; plus = host.children[1];
  };

  const active = () => { for (const r of recs.values()) if (!r.collapsed && r.el.isConnected) return r; return null; };

  /* ───────── layout: bubble row while a sheet is open, floating chat heads otherwise ───────── */
  const layout = () => {
    const act = mq.matches ? active() : null, list = [...recs.values()].filter(r => r.bub);
    host.classList.toggle('row', !!act);
    document.documentElement.classList.toggle('adr-sheet-chat', !!act && act.kind === 'chat');
    if (act) {
      const showPlus = !recs.has('portfolio'), n = list.length + (showPlus ? 1 : 0), x0 = Math.round((vw() - (n * R + (n - 1) * G)) / 2);
      list.forEach((r, i) => {
        r.tx = x0 + i * (R + G); r.ty = ROWTOP; r.ts = R;
        const b = r.bub;
        b.classList.add('show', 'inrow'); b.classList.toggle('active', r === act);
        b.style.zIndex = ''; b.style.filter = ''; b.style.setProperty('--sc', '1');
        b.style.left = r.tx + 'px'; b.style.top = r.ty + 'px';
      });
      plus.style.left = (x0 + list.length * (R + G)) + 'px'; plus.style.top = ROWTOP + 'px';
      plus.classList.toggle('show', showPlus); plus.classList.add('inrow');
    } else {
      plus.classList.remove('show', 'inrow');
      /* floating: every head sits on top of the others in ONE stack on a screen edge, newest in front */
      const col = list.filter(r => r.collapsed).sort((a, b) => b.seq - a.seq);
      list.forEach(r => { if (!r.collapsed) r.bub.classList.remove('show', 'inrow', 'active'); });
      const baseY = clamp(stack.y, TOP, vh() - S - BOTTOM - MAXSTEP * STEPY);
      col.forEach((r, i) => {
        const k = Math.min(i, MAXSTEP), b = r.bub;
        r.step = k; r.ts = S;
        r.tx = stack.side === 'l' ? M - k * STEP : vw() - S - M + k * STEP;   // behind heads slide toward the screen edge, not the middle
        r.ty = baseY + k * STEPY;
        b.classList.remove('inrow', 'active'); b.classList.add('show');
        b.classList.toggle('l', stack.side === 'l'); b.classList.toggle('r', stack.side === 'r');
        b.style.zIndex = String(100 - i);
        b.style.setProperty('--sc', String(1 - k * 0.05)); b.style.filter = k ? 'brightness(' + (1 - k * 0.12) + ')' : '';
        b.style.left = r.tx + 'px'; b.style.top = r.ty + 'px';
      });
    }
  };

  /* the sheet: below the bubble row, above the dock. Applied through CSS variables so app.js's own sizing can't undo it. */
  const fit = rec => {
    const el = rec.el;
    if (!mq.matches || !el.isConnected) return;
    const chat = rec.kind === 'chat', topY = PANEL_TOP;
    let avail = Math.max(240, vh() - PANEL_BOTTOM - PANEL_TOP);
    if (chat) {                                          // same left edge + width as the other sheets (read from an open window)
      const w = document.querySelector('.wm-window.adr-sheet');
      if (w && w.offsetWidth > 100) { el.style.setProperty('--adr-left', w.offsetLeft + 'px'); el.style.setProperty('--adr-w', w.offsetWidth + 'px'); }
    }
    const ae = document.activeElement;
    if (chat && ae && el.contains(ae) && /^(input|textarea)$/i.test(ae.tagName)) {   // keyboard is up: use the visible area
      const vv = window.visualViewport, bottom = vv ? vv.height + vv.offsetTop : vh();
      if (bottom < vh() - 80) avail = Math.min(avail, Math.max(160, bottom - 8 - topY));   // a real keyboard only: never taller than the normal sheet
    }
    let top = topY, h = avail;
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
    rec.collapsed = true; rec.seq = ++seq;
    layout();
    const el = rec.el, r = el.getBoundingClientRect();
    const fin = a => {
      el.classList.add('adr-bubbled'); el.classList.remove('is-focused'); el.style.transformOrigin = '';
      if (document.activeElement && el.contains(document.activeElement)) document.activeElement.blur();
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
    el.classList.remove('adr-bubbled'); rec.bub.classList.remove('unread');
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
    setTimeout(() => { if (rec.close) rec.close(); else { const c = rec.el.querySelector('.wm-close'); if (c) c.click(); } }, 180);
  };

  /* ───────── a bubble ───────── */
  const makeBubble = rec => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'adr-bub'; b.dataset.kind = rec.kind;
    b.setAttribute('aria-label', rec.title);
    b.innerHTML = (rec.iconHTML || '<i class="' + rec.icon + '" aria-hidden="true"></i>') + '<span class="tip"></span>';
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
      if (!d.row) recs.forEach(o => {                   // the heads behind follow, keeping their stacked offsets
        if (o === rec || !o.collapsed || !o.bub) return;
        o.bub.style.left = clamp(x + (o.tx - rec.tx), -24, vw() - S + 24) + 'px';
        o.bub.style.top = clamp(y + (o.ty - rec.ty), 0, vh() - S) + 'px';
      });
    });
    const up = (e, cancelled) => {
      if (!d || e.pointerId !== d.id) return;
      const dd = d; d = null;
      b.classList.remove('drag'); xt.classList.remove('show', 'near');
      if (!dd.moved) { if (!cancelled) (rec.collapsed ? expand(rec) : collapse(rec)); return; }   // tap: open, or fold the open one away
      if (dd.near && !cancelled) {
        if (dd.row) dismiss(rec); else [...recs.values()].filter(o => o.collapsed && o.bub).forEach(dismiss);
        return;
      }
      if (!dd.row) {                                    // floating: the whole stack snaps to the nearest edge
        stack.side = b.offsetLeft + S / 2 < vw() / 2 ? 'l' : 'r';
        stack.y = clamp(b.offsetTop - (rec.step || 0) * STEPY, TOP, vh() - S - BOTTOM);
      }
      layout();                                         // in the row: spring back into place
    };
    b.addEventListener('pointerup', e => up(e, false));
    b.addEventListener('pointercancel', e => up(e, true));
    b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rec.collapsed ? expand(rec) : collapse(rec); } });
  };

  /* ───────── resume sheet: one continuous scroll, chips jump to a section, name joins the summary ───────── */
  const resumeSheet = el => {
    let lock = 0;
    const views = () => [...el.querySelectorAll('.rv-view')];
    const mark = name => {
      el.querySelectorAll('.rv-item').forEach(it => {
        const on = it.dataset.view === name;
        if (it.getAttribute('aria-selected') === String(on)) return;
        it.setAttribute('aria-selected', String(on)); it.tabIndex = on ? 0 : -1;
        const tree = it.closest('.rv-tree');
        if (on && tree) tree.scrollTo({ left: tree.scrollLeft + it.getBoundingClientRect().left - tree.getBoundingClientRect().left - (tree.clientWidth - it.offsetWidth) / 2, behavior: still() ? 'auto' : 'smooth' });
      });
    };
    const go = name => {
      const sc = el.querySelector('.rv-scroll');
      const run = () => {
        const v = el.querySelector('#rv-view-' + name);
        if (!v || !sc) return;
        lock = Date.now() + 800; mark(name);
        sc.scrollTo({ top: sc.scrollTop + v.getBoundingClientRect().top - sc.getBoundingClientRect().top - 4, behavior: still() ? 'auto' : 'smooth' });
      };
      if (sc && sc.offsetParent === null) {               // PDF view is showing: switch back to the text first
        const t = el.querySelector('.rv-mode[data-mode="text"]'); if (t) t.click();
        requestAnimationFrame(run);
      } else run();
    };
    el.addEventListener('click', e => {                   // capture: the viewer's own tab switching is replaced by scrolling
      if (!mq.matches) return;
      const it = e.target.closest && e.target.closest('.rv-item');
      if (!it) return;
      e.preventDefault(); e.stopPropagation(); go(it.dataset.view);
    }, true);
    el.addEventListener('scroll', e => {                  // scroll-spy keeps the highlighted chip in step
      const sc = e.target;
      if (!mq.matches || Date.now() < lock || !sc.classList || !sc.classList.contains('rv-scroll')) return;
      const vs = views(), base = sc.getBoundingClientRect().top + 24;
      let cur = null;
      vs.forEach(v => { if (v.getBoundingClientRect().top <= base) cur = v; });
      if (sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 4) cur = vs[vs.length - 1];
      if (cur) mark(cur.id.replace('rv-view-', ''));
    }, true);

    const prep = () => {                                  // idempotent: runs until the viewer's markup is in the window
      if (!mq.matches) return false;
      const ng = el.querySelector('.btn-github'); if (ng) ng.remove();                  // no "open in new tab"
      const box = el.querySelector('.rv-profile > div');
      if (!box) return false;
      if (!box.querySelector('.rv-person') && !box.querySelector('.adr-rv-name')) {   // the viewer's own <h2 class="rv-person"> is the name
        const t = el.querySelector('.rv-title'), h = document.createElement('h2');
        h.className = 'rv-h adr-rv-name'; h.textContent = t ? t.textContent.trim() : 'John Paul De Leon';
        box.insertBefore(h, box.firstChild);
      }
      return true;
    };
    if (!prep()) {
      const mo = new MutationObserver(() => { if (prep()) mo.disconnect(); });
      mo.observe(el, { childList: true, subtree: true });
    }
  };

  /* ───────── decorate project / certificate windows ───────── */
  /* a sheet = any element that gets a bubble: a .wm-window (setup below) or a custom one such as the chat (window.adrBubbles.add) */
  const register = o => {
    const el = o.el;
    if (!o.id || !el || recs.has(o.id)) return recs.get(o.id) || null;
    const rec = {
      id: o.id, el, kind: o.kind || o.id.split(':')[0], collapsed: false, seq: 0, step: 0, bub: null, tx: 0, ty: 0, ts: R,
      icon: o.icon || 'fa-solid fa-window-maximize', iconHTML: o.iconHTML || '', title: o.title || o.id, close: o.close || null
    };
    recs.set(o.id, rec);
    el.classList.add('adr-sheet');
    makeBubble(rec);
    recs.forEach(x => { if (x !== rec && !x.collapsed && mq.matches) collapse(x); });   // opening a new one folds the old one away
    fit(rec); layout();

    if (!o.close) new MutationObserver(() => fit(rec)).observe(el, { attributes: true, attributeFilter: ['style'] });   // app.js resized it
    else {                                                                                                              // custom sheet: refit when the keyboard comes and goes
      el.addEventListener('focusin', () => fit(rec));
      el.addEventListener('focusout', () => setTimeout(() => fit(rec), 80));
    }

    /* swipe the title bar down to fold the sheet into its bubble */
    const bar = o.bar || el.querySelector('.wm-titlebar');
    if (bar) {
      let sy = null;
      const end = () => { sy = null; el.style.translate = ''; };
      bar.addEventListener('pointerdown', e => { if (mq.matches && !e.target.closest('.wm-btn,button')) sy = e.clientY; });
      bar.addEventListener('pointermove', e => {
        if (sy == null) return;
        const dy = e.clientY - sy;
        el.style.translate = dy > 0 ? '0 ' + Math.min(dy, 120) * 0.6 + 'px' : '';
        if (dy > 70) { end(); collapse(rec); }
      });
      bar.addEventListener('pointerup', end); bar.addEventListener('pointercancel', end);
    }
    return rec;
  };

  const setup = el => {
    const id = el.getAttribute('data-wm-app');
    if (!id || !KINDS.test(id) || recs.has(id)) return;
    const ic = el.querySelector('.wm-title i');
    const rec = register({ id, el, icon: ic ? ic.className : '', title: el.getAttribute('aria-label') || id });
    if (rec && rec.kind === 'resume') resumeSheet(el);
  };

  const teardown = id => {
    const rec = recs.get(id); if (!rec) return;
    clearTimeout(rec.tipT);
    if (rec.bub) rec.bub.remove();
    recs.delete(id);
    rec.el.classList.remove('adr-bubbled');
    layout();
  };

  /* ───────── wiring ───────── */
  const start = layer => {
    build();
    window.adrBubbles = {                               // used by jpt-chat.js (Ask Jampol) to become a chat head too
      add: register, remove: teardown,
      has: id => recs.has(id),
      open: id => { const r = recs.get(id); if (r) expand(r); },
      isCollapsed: id => { const r = recs.get(id); return !!(r && r.collapsed); },
      badge: (id, on) => { const r = recs.get(id); if (r && r.bub) r.bub.classList.toggle('unread', !!on); }
    };
    document.dispatchEvent(new Event('adr:bubbles'));
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
    if (window.visualViewport) window.visualViewport.addEventListener('resize', () => recs.forEach(fit));
    const sync = () => { if (!mq.matches) recs.forEach(r => expand(r, true)); layout(); };   // back on desktop: every window opens normally
    mq.addEventListener ? mq.addEventListener('change', sync) : mq.addListener(sync);
  };

  const boot = () => {
    const layer = document.getElementById('wm-layer');
    if (layer) start(layer); else setTimeout(boot, 250);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();