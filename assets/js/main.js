(function () {
  "use strict";

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Init typed.js
   */
  const selectTyped = document.querySelector('.typed');
  if (selectTyped && typeof Typed !== 'undefined') {
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Initiate Pure Counter
   */
  if (typeof PureCounter !== 'undefined') {
    new PureCounter();
  }

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function (direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Initiate glightbox
   */
  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox',
    draggable: false,          // Disable mouse dragging
    touchNavigation: false,    // Disable swipe/touch dragging
    dragToleranceX: 0,
    dragToleranceY: 0,
    openEffect: 'fade',
    closeEffect: 'fade',
    slideEffect: 'fade'
  });

  /* Mount the terminal chrome INSIDE each GLightbox image frame. */
  function mountLightboxTerminalChrome() {
    document.querySelectorAll('.glightbox-container .gslide').forEach((slide) => {
      const imageFrame = slide.querySelector('.gslide-image, .gslide-video');
      const description = slide.querySelector('.gslide-description.description-bottom');
      if (!imageFrame || !description) return;

      if (description.parentElement !== imageFrame) {
        imageFrame.insertBefore(description, imageFrame.firstChild);
      }
      description.classList.add('lightbox-terminal-mounted');

      /* Handle Close button explicitly inside the terminal chrome */
      const closeBtn = description.querySelector('[data-glightbox-close], .win-btn-close');
      if (closeBtn && !closeBtn.dataset.boundClose) {
        closeBtn.dataset.boundClose = '1';
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          glightbox.close();
        });
      }
    });
  }

  ['open', 'slide_before_load', 'slide_after_load', 'slide_changed'].forEach((evt) => {
    glightbox.on(evt, () => {
      requestAnimationFrame(mountLightboxTerminalChrome);
      window.setTimeout(mountLightboxTerminalChrome, 60);
      window.setTimeout(mountLightboxTerminalChrome, 220);
    });
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function (isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function () {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function (filters) {
      filters.addEventListener('click', function () {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function (e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Dock Scrollspy - keep one active section indicator in sync with the page.
   */
  const dockLinks = document.querySelectorAll('.linux-dock a.dock-item[href]');
  const dockSections = Array.from(dockLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function dockScrollspy() {
    if (!dockSections.length) return;
    const marker = window.scrollY + Math.min(220, window.innerHeight * 0.28);
    let activeSection = dockSections[0];
    dockSections.forEach(section => {
      if (section.offsetTop <= marker) activeSection = section;
    });
    dockLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + activeSection.id);
    });
  }

  window.addEventListener('load', dockScrollspy);
  document.addEventListener('scroll', dockScrollspy, { passive: true });
  window.addEventListener('resize', dockScrollspy);

  /**
   * Theme Dots + typed theme notification.
   * Uses the existing theme names and the same small type/backspace pattern
   * already used by the site's terminal typing effect.
   */
  const themeDots = document.querySelectorAll('.theme-dot');
  const themeNotice = document.querySelector('#themeNotice');
  let themeNoticeToken = 0;

  if (themeDots.length) {
    const themeLabels = {
      everforest: 'Everforest',
      aurora: 'Aurora',
      gruvbox: 'Gruvbox',
      monokai: 'Monokai Pro',
      draculapro: 'Dracula Pro'
    };

    function getCurrentTheme() {
      return document.documentElement.getAttribute('data-theme') || 'everforest';
    }

    function animateThemeNotice(theme) {
      if (!themeNotice) return;
      const token = ++themeNoticeToken;
      const text = 'Theme: ' + (themeLabels[theme] || theme);
      themeNotice.textContent = '';

      let i = 0;
      const type = () => {
        if (token !== themeNoticeToken) return;
        if (i < text.length) {
          themeNotice.textContent = text.slice(0, ++i);
          window.setTimeout(type, 45);
        } else {
          window.setTimeout(backspace, 1300);
        }
      };
      const backspace = () => {
        if (token !== themeNoticeToken) return;
        if (i > 0) {
          themeNotice.textContent = text.slice(0, --i);
          window.setTimeout(backspace, 32);
        } else {
          themeNotice.textContent = '';
        }
      };
      type();
    }

    function applyTheme(theme, announce = false) {
      if (theme === 'everforest') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
      localStorage.setItem('site-theme', theme);
      themeDots.forEach(dot => {
        dot.classList.toggle('active', dot.getAttribute('data-theme-choice') === theme);
      });
      /* Scrollbars follow the theme: take the active theme dot's colour. */
      const activeDot = Array.from(themeDots).find(d => d.getAttribute('data-theme-choice') === theme);
      const dotColor = activeDot ? getComputedStyle(activeDot).backgroundColor : '';
      if (dotColor && dotColor !== 'transparent' && dotColor !== 'rgba(0, 0, 0, 0)') {
        document.documentElement.style.setProperty('--sb-thumb', dotColor);
      } else {
        document.documentElement.style.removeProperty('--sb-thumb');
      }
      if (announce) animateThemeNotice(theme);
    }

    applyTheme(getCurrentTheme());

    themeDots.forEach(dot => {
      dot.addEventListener('click', () => {
        applyTheme(dot.getAttribute('data-theme-choice'), true);
      });
    });
  }

  const toastInstances = new Map();

  function getToastEl(triggerBtn) {
    const scope = triggerBtn.closest('.contact-block') || document;
    return scope.querySelector('.copy-toast');
  }

  function showCopyToast(toastEl, type, success) {
    if (!toastEl) return;
    const bodyEl = toastEl.querySelector('.toast-body span');
    if (!bodyEl) return;
    const label = type === 'phone' ? 'Phone number' : 'Email';
    bodyEl.textContent = success
      ? label + ' copied to clipboard!'
      : 'Could not copy ' + label.toLowerCase() + ' automatically.';

    if (window.bootstrap) {
      let instance = toastInstances.get(toastEl);
      if (!instance) {
        instance = new bootstrap.Toast(toastEl, { delay: 1500 });
        toastInstances.set(toastEl, instance);
      }
      instance.show();
    }
  }

  document.querySelectorAll('.js-copy-trigger').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const value = btn.getAttribute('data-copy-value');
      const type = btn.getAttribute('data-copy-type');
      const toastEl = getToastEl(btn);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value)
          .then(() => showCopyToast(toastEl, type, true))
          .catch(() => showCopyToast(toastEl, type, false));
      } else {
        showCopyToast(toastEl, type, false);
      }
    });
  });


  /**
   * Linux App Menu (Menu dock icon -> popup launcher)
   */
  const dockMenuBtn = document.getElementById('dock-menu-btn');
  const appMenu = document.getElementById('app-menu');

  function positionAppMenu() {
    if (!dockMenuBtn || !appMenu) return;
    const btnRect = dockMenuBtn.getBoundingClientRect();
    const gap = 12;
    const menuRect = appMenu.getBoundingClientRect();
    const margin = 14;

    let left = btnRect.left + (btnRect.width / 2) - (menuRect.width / 2);
    const maxLeft = window.innerWidth - menuRect.width - margin;
    if (left < margin) left = margin;
    if (left > maxLeft) left = Math.max(margin, maxLeft);

    appMenu.style.left = left + 'px';
    appMenu.style.bottom = (window.innerHeight - btnRect.top + gap) + 'px';
  }

  function openAppMenu() {
    if (!appMenu) return;
    appMenu.classList.add('open');
    appMenu.setAttribute('aria-hidden', 'false');
    dockMenuBtn.setAttribute('aria-expanded', 'true');
    dockMenuBtn.classList.add('active');
    positionAppMenu();
  }

  function closeAppMenu() {
    if (!appMenu) return;
    appMenu.classList.remove('open');
    appMenu.setAttribute('aria-hidden', 'true');
    dockMenuBtn.setAttribute('aria-expanded', 'false');
    dockMenuBtn.classList.remove('active');
  }

  function isAppMenuOpen() {
    return appMenu && appMenu.classList.contains('open');
  }

  if (dockMenuBtn && appMenu) {
    dockMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isAppMenuOpen() ? closeAppMenu() : openAppMenu();
    });

    document.addEventListener('click', (e) => {
      if (isAppMenuOpen() && !appMenu.contains(e.target) && e.target !== dockMenuBtn) {
        closeAppMenu();
      }
    });

    window.addEventListener('resize', () => {
      if (isAppMenuOpen()) positionAppMenu();
    });
    window.addEventListener('scroll', () => {
      if (isAppMenuOpen()) positionAppMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isAppMenuOpen()) closeAppMenu();
    });
  }



  /**
   * Window motion (Linux desktop style)
   *  - Minimize: window shrinks and flies into its dock icon (genie-like).
   *  - Maximize / restore: window grows or shrinks to its new size.
   *  - Close: plain fade.
   * Uses the Web Animations API so it never fights the older CSS overrides.
   */
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOTION_EASE = 'cubic-bezier(.4, 0, .2, 1)';
  const MOTION_POP = 'cubic-bezier(.2, .8, .2, 1)';

  function getDockTarget(kind) {
    const dock = document.querySelector('.linux-dock');
    if (!dock) return null;
    if (kind === 'projects') return dock.querySelector('.dock-projects') || dock.querySelector('.dock-item');
    return dock.querySelector('#dock-menu-btn') || dock.querySelector('.dock-item');
  }

  function bounceDockItem(el) {
    if (!el) return;
    el.classList.remove('dock-bounce');
    void el.offsetWidth;
    el.classList.add('dock-bounce');
    window.setTimeout(() => el.classList.remove('dock-bounce'), 700);
  }

  /* Shrink `win` into `dockEl`. Resolves when the motion has finished. */
  function shrinkIntoDock(win, dockEl, backdrop) {
    return new Promise(resolve => {
      if (!win || !dockEl || reduceMotion()) { resolve([]); return; }
      const prevOrigin = win.style.transformOrigin;
      win.style.transformOrigin = '50% 50%';
      const w = win.getBoundingClientRect();
      const d = dockEl.getBoundingClientRect();
      const dx = (d.left + d.width / 2) - (w.left + w.width / 2);
      const dy = (d.top + d.height / 2) - (w.top + w.height / 2);
      const duration = 440;
      const anims = [];
      const winAnim = win.animate([
        { transform: 'translate(0, 0) scale(1, 1)', opacity: 1, offset: 0 },
        { transform: `translate(${dx * 0.18}px, ${dy * 0.14}px) scale(.86, .9)`, opacity: 1, offset: 0.3 },
        { transform: `translate(${dx * 0.8}px, ${dy * 0.82}px) scale(.22, .16)`, opacity: .9, offset: 0.78 },
        { transform: `translate(${dx}px, ${dy}px) scale(.04, .04)`, opacity: 0, offset: 1 }
      ], { duration, easing: MOTION_EASE, fill: 'forwards' });
      anims.push(winAnim);
      if (backdrop) {
        anims.push(backdrop.animate([{ opacity: 1 }, { opacity: 0 }],
          { duration, easing: 'ease-in', fill: 'forwards' }));
      }
      winAnim.finished.then(() => {
        win.style.transformOrigin = prevOrigin;
        resolve(anims);
      }).catch(() => resolve(anims));
    });
  }

  /* Plain fade-out of `el` (used by every Close button). */
  function fadeOut(el, duration = 220) {
    return new Promise(resolve => {
      if (!el || reduceMotion()) { resolve([]); return; }
      const a = el.animate([{ opacity: 1 }, { opacity: 0 }],
        { duration, easing: 'ease-out', fill: 'forwards' });
      a.finished.then(() => resolve([a])).catch(() => resolve([a]));
    });
  }

  /**
   * CV Terminal Lightboxes
   */
  const terminalData = {
    certifications: {
      command: 'cat certifications.txt',
      lines: [
        { type: 'heading', text: 'CERTIFICATIONS' },
        { type: 'gap' },
        { type: 'entry', title: 'The Complete Full-Stack Web Development Bootcamp', sub: 'Udemy' },
        { type: 'entry', title: 'Technical SEO and SEO Sprint', sub: 'SEO Workout by Gab Valimento' }
      ]
    },
    experience: {
      command: 'cat experience.txt',
      lines: [
        { type: 'heading', text: 'PROFESSIONAL EXPERIENCE' },
        { type: 'gap' },
        { type: 'experience', title: 'Self-Directed Learning & Upskilling', company: '', sub: 'May 2025 - Present' },
        { type: 'experience', title: 'SEO Outreach Specialist', company: 'Awisee', sub: 'Jan 2025 - May 2025' },
        { type: 'experience', title: 'Research Analyst (SEO Link Prospecting)', company: 'Intelligent.com LLC', sub: 'Nov 2020 - Sept 2024' },
        { type: 'experience', title: 'Contact Finder (SEO Contact Research & Verification)', company: 'Intelligent.com LLC', sub: 'May 2020 - November 2020' },
        { type: 'experience', title: 'Freelance Research Consultant', company: 'Independent / Referral-based', sub: 'January 2019 - May 2020' },
        { type: 'experience', title: 'Research Analyst (Web Researcher)', company: 'Straive (formerly SPi Global)', sub: 'Sep 2013 - November 2018' }
      ]
    },
    projects: {
      command: 'cat projects.txt',
      lines: [
        { type: 'heading', text: 'PROJECTS' },
        { type: 'gap' },
        { type: 'entry', title: 'NothingTechBlob', sub: 'Technical & On-Page SEO + WordPress Development' },
        { type: 'entry', title: 'Badlands Ink', sub: 'Technical, Local & E-Commerce SEO + WordPress Development' },
        { type: 'entry', title: 'AuditKit', sub: 'API Capstone Project' },
        { type: 'entry', title: 'John Off the Wall', sub: 'HTML & CSS Capstone Project' },
        { type: 'entry', title: 'PixelLog', sub: 'Node.js, Express.js & EJS Capstone Project' },
        { type: 'entry', title: 'JamporuDEX', sub: 'Node.js, Express, PostgreSQL & EJS Capstone Project' },
        { type: 'entry', title: 'Route 196', sub: 'Node.js, Express.js & EJS Capstone Project' }
      ]
    },
    socials: {
      command: 'cat socials.txt',
      lines: [
        { type: 'heading', text: 'SOCIALS' },
        { type: 'gap' },
        { type: 'link', title: 'LinkedIn', href: 'https://www.linkedin.com/in/jpldl/' },
        { type: 'link', title: 'GitHub', href: 'https://github.com/jpldeleon' },
        { type: 'link', title: 'Upwork', href: 'https://www.upwork.com/freelancers/~01562764cad5d47331' },
        { type: 'link', title: 'GoLance', href: 'https://golance.com/freelancer/john.paul.leonard.de.leon' }
      ]
    }
  };

  const terminalOverlays = document.querySelectorAll('.terminal-overlay');
  let activeTypingToken = 0;

  function appendLine(bodyEl, prefix, text) {
    const row = document.createElement('div');
    if (prefix) {
      const strong = document.createElement('span');
      strong.className = prefix;
      strong.textContent = text;
      row.appendChild(strong);
    } else {
      row.textContent = text;
    }
    bodyEl.appendChild(row);
    return row;
  }

  function typeText(el, text, speed, token) {
    return new Promise(resolve => {
      let i = 0;
      (function step() {
        if (token !== activeTypingToken) return resolve();
        if (i <= text.length) {
          el.textContent = text.slice(0, i);
          i++;
          setTimeout(step, speed);
        } else {
          resolve();
        }
      })();
    });
  }

  async function runTerminalTyping(bodyEl, data, token) {
    bodyEl.innerHTML = '';
    const cursor = document.createElement('span');
    cursor.className = 'terminal-cursor';

    const cmdRow = document.createElement('div');
    const prompt = document.createElement('span');
    prompt.className = 't-prompt';
    prompt.textContent = '$ ';
    const cmdText = document.createElement('span');
    cmdRow.appendChild(prompt);
    cmdRow.appendChild(cmdText);
    cmdRow.appendChild(cursor);
    bodyEl.appendChild(cmdRow);

    await typeText(cmdText, data.command, 35, token);
    if (token !== activeTypingToken) return;
    cursor.remove();
    bodyEl.appendChild(document.createElement('br'));

    for (const line of data.lines) {
      if (token !== activeTypingToken) return;
      if (line.type === 'gap') {
        bodyEl.appendChild(document.createElement('br'));
        continue;
      }
      if (line.type === 'heading') {
        const row = appendLine(bodyEl, 't-heading', line.text);
        row.appendChild(document.createElement('br'));
        await new Promise(r => setTimeout(r, 120));
        continue;
      }
      if (line.type === 'entry') {
        const row = document.createElement('div');
        row.style.marginBottom = '6px';
        const marker = document.createElement('span');
        marker.className = 't-entry-title';
        marker.textContent = '> ' + line.title;
        row.appendChild(marker);
        const sub = document.createElement('div');
        sub.className = 't-dim';
        sub.textContent = '  ' + line.sub;
        row.appendChild(sub);
        bodyEl.appendChild(row);
        bodyEl.scrollTop = bodyEl.scrollHeight;
        await new Promise(r => setTimeout(r, 90));
        continue;
      }
      if (line.type === 'experience') {
        const row = document.createElement('div');
        row.style.marginBottom = '6px';
        const marker = document.createElement('span');
        marker.className = 't-entry-title';
        marker.textContent = '> ' + line.title;
        row.appendChild(marker);
        if (line.company) {
          const company = document.createElement('span');
          company.className = 't-entry-company';
          company.textContent = ' — ' + line.company;
          row.appendChild(company);
        }
        const sub = document.createElement('div');
        sub.className = 't-dim';
        sub.textContent = '  ' + line.sub;
        row.appendChild(sub);
        bodyEl.appendChild(row);
        bodyEl.scrollTop = bodyEl.scrollHeight;
        await new Promise(r => setTimeout(r, 90));
        continue;
      }
      if (line.type === 'link') {
        const row = document.createElement('div');
        row.style.marginBottom = '6px';
        const marker = document.createElement('span');
        marker.className = 't-entry-title';
        marker.textContent = '> ' + line.title;
        row.appendChild(marker);
        const sub = document.createElement('div');
        sub.className = 't-dim';
        const a = document.createElement('a');
        a.href = line.href;
        a.target = '_blank';
        a.textContent = '  ' + line.href;
        sub.appendChild(a);
        row.appendChild(sub);
        bodyEl.appendChild(row);
        bodyEl.scrollTop = bodyEl.scrollHeight;
        await new Promise(r => setTimeout(r, 90));
        continue;
      }
    }

    if (token !== activeTypingToken) return;
    const finalCursor = document.createElement('span');
    finalCursor.className = 'terminal-cursor';
    bodyEl.appendChild(finalCursor);
  }

  function closeTerminal(overlay) {
    if (!overlay) return;
    activeTypingToken++;
    overlay.classList.remove('open', 'is-maximized', 'is-minimizing');
    document.body.style.overflow = '';
  }

  function settleTerminal(overlay, anims) {
    /* Commit the closed state with every transition disabled (class-driven, so
       no inline-style / !important ordering problems), flush it, and only THEN
       drop the WAAPI fill. The closed CSS state equals the animation's end state
       (opacity 0), so nothing can pop back or fade a second time. */
    overlay.classList.add('is-hard-closed');
    closeTerminal(overlay);
    void overlay.offsetHeight;
    anims.forEach(a => a.cancel());
    void overlay.offsetHeight;
    overlay.classList.remove('is-hard-closed');
    delete overlay.dataset.animating;
  }

  /* Close = fade (window + backdrop together). */
  function fadeCloseTerminal(overlay) {
    if (!overlay || !overlay.classList.contains('open') || overlay.dataset.animating) return;
    overlay.dataset.animating = '1';
    activeTypingToken++;
    fadeOut(overlay, 220).then(anims => settleTerminal(overlay, anims));
  }

  /* Minimize = shrink into the dock menu icon. */
  function minimizeTerminal(overlay) {
    if (!overlay || !overlay.classList.contains('open') || overlay.dataset.animating) return;
    overlay.dataset.animating = '1';
    activeTypingToken++;
    const dockEl = getDockTarget('menu');
    const win = overlay.querySelector('.terminal-window');
    shrinkIntoDock(win, dockEl, overlay).then(anims => {
      settleTerminal(overlay, anims);
      bounceDockItem(dockEl);
    });
  }

  /* Maximize / restore = window grows or shrinks to the new size. */
  function toggleMaximizeTerminal(overlay) {
    if (!overlay) return;
    const win = overlay.querySelector('.terminal-window');
    if (!win || reduceMotion()) { overlay.classList.toggle('is-maximized'); return; }
    win.getAnimations().forEach(a => a.cancel());
    win.style.transition = 'none';
    const first = win.getBoundingClientRect();
    overlay.classList.toggle('is-maximized');
    const last = win.getBoundingClientRect();
    const a = win.animate([
      { width: first.width + 'px', height: first.height + 'px', maxWidth: 'none', maxHeight: 'none' },
      { width: last.width + 'px', height: last.height + 'px', maxWidth: 'none', maxHeight: 'none' }
    ], { duration: 300, easing: MOTION_POP });
    const done = () => { win.style.transition = ''; };
    a.finished.then(done).catch(done);
  }

  function openTerminal(key) {
    const overlay = document.getElementById('terminal-' + key);
    const data = terminalData[key];
    if (!overlay || !data) return;
    closeAllTerminals();
    closeAppMenu();
    activeTypingToken++;
    const token = activeTypingToken;
    const bodyEl = overlay.querySelector('.terminal-body');
    overlay.classList.remove('is-minimizing', 'is-maximized');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    runTerminalTyping(bodyEl, data, token);
  }

  function closeAllTerminals() {
    terminalOverlays.forEach(overlay => closeTerminal(overlay));
  }

  document.querySelectorAll('[data-terminal]').forEach(btn => {
    btn.addEventListener('click', () => openTerminal(btn.getAttribute('data-terminal')));
  });

  document.querySelectorAll('[data-close-terminal]').forEach(btn => {
    btn.addEventListener('click', () => fadeCloseTerminal(btn.closest('.terminal-overlay')));
  });

  document.querySelectorAll('[data-minimize-terminal]').forEach(btn => {
    btn.addEventListener('click', () => minimizeTerminal(btn.closest('.terminal-overlay')));
  });

  document.querySelectorAll('[data-maximize-terminal]').forEach(btn => {
    btn.addEventListener('click', () => toggleMaximizeTerminal(btn.closest('.terminal-overlay')));
  });

  terminalOverlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) fadeCloseTerminal(overlay);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const active = document.querySelector('.terminal-overlay.open');
      if (active) fadeCloseTerminal(active);
    }
  });

  /**
   * Portfolio thumbnail application windows.
   * Normal cards remain compact; Maximize opens an 80%-viewport terminal window.
   */
  let portfolioWindowOverlay = null;

  /**
   * The thumbnail maximize/zoom command opens the existing GLightbox instance.
   * This deliberately uses the same lightbox as the image click so there is only
   * one overlay/window system for project images and certificates.
   */
  document.addEventListener('click', (e) => {
    const maximize = e.target.closest('[data-portfolio-maximize]');
    if (!maximize) return;

    e.preventDefault();
    e.stopPropagation();

    const item = maximize.closest('.portfolio-item');
    // Projects use the transparent .portfolio-image-link; certificates
    // keep their original .glightbox anchor in .portfolio-links.
    const imageLink = item?.querySelector('.portfolio-image-link.glightbox')
      || item?.querySelector('a.glightbox')
      || item?.querySelector('.portfolio-image-link');   // project opened in a window (e.g. AuditKit)
    if (imageLink) imageLink.click();
  });

  /**
   * GLightbox window motion.
   *  - Opening from a thumbnail's Maximize/zoom: the window grows out of the card.
   *  - Minimize: shrinks into the "Projects" dock icon.
   *  - Close: fade.
   */
  let lightboxOrigin = null;
  let lightboxClosing = false;

  document.addEventListener('click', (e) => {
    const t = e.target.closest('.portfolio-image-link.glightbox, a.glightbox, [data-portfolio-maximize]');
    if (!t) return;
    const wrap = t.closest('.portfolio-wrap') || t.closest('.portfolio-item');
    lightboxOrigin = wrap ? wrap.getBoundingClientRect() : null;
  }, true);

  function growFromOrigin(slideNode) {
    const origin = lightboxOrigin;
    if (!origin || reduceMotion()) { lightboxOrigin = null; return; }
    const current = document.querySelector('.glightbox-container .gslide.current');
    if (!current || (slideNode && !current.contains(slideNode) && current !== slideNode)) return;
    const media = current.querySelector('.gslide-media');
    const frame = current.querySelector('.gslide-image, .gslide-video');
    if (!media || !frame) return;
    lightboxOrigin = null;

    mountLightboxTerminalChrome();
    media.style.transformOrigin = '50% 50%';
    const r = frame.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dx = (origin.left + origin.width / 2) - (r.left + r.width / 2);
    const dy = (origin.top + origin.height / 2) - (r.top + r.height / 2);
    const sx = Math.max(origin.width / r.width, 0.05);
    const sy = Math.max(origin.height / r.height, 0.05);
    media.animate([
      { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, opacity: 0.2 },
      { transform: 'translate(0, 0) scale(1, 1)', opacity: 1 }
    ], { duration: 340, easing: MOTION_POP });
  }

  glightbox.on('slide_after_load', (data) => {
    if (lightboxOrigin) growFromOrigin(data && data.slideNode);
  });
  glightbox.on('open', () => {
    lightboxClosing = false;
    window.setTimeout(() => { lightboxOrigin = null; }, 900);
  });

  /* Our own fade / shrink has already played, so GLightbox must not play its
     built-in close effect on top of it (that was the second fade). Swap the
     effect to 'none' for this one close() call, then restore it so Esc and
     backdrop clicks still get GLightbox's normal fade. */
  function closeLightboxNoEffect() {
    const prev = glightbox.settings.closeEffect;
    glightbox.settings.closeEffect = 'none';
    try { glightbox.close(); } finally { glightbox.settings.closeEffect = prev; }
  }

  glightbox.on('close', () => { lightboxClosing = false; });

  /* Find the lightbox Close / Minimize command for a click. Uses the real target
     first, then falls back to the click position, so it still works if something
     is layered over the button or GLightbox's own handlers swallow the click. */
  function lightboxCommandFor(e, attr) {
    const hit = e.target && e.target.closest ? e.target.closest('[' + attr + ']') : null;
    if (hit) return hit;
    if (!e.clientX && !e.clientY) return null;
    const btns = document.querySelectorAll('.glightbox-container [' + attr + ']');
    for (const b of btns) {
      const r = b.getBoundingClientRect();
      if (r.width && r.height && e.clientX >= r.left && e.clientX <= r.right &&
          e.clientY >= r.top && e.clientY <= r.bottom) return b;
    }
    return null;
  }

  /* Swipe / drag between screenshots is disabled. GLightbox's touch and drag
     listeners are cut off before they see the gesture. Arrows, keyboard and
     the title-bar buttons keep working. */
  const SWIPE_KEEP = '.gclose, .gnext, .gprev, [data-glightbox-close], [data-glightbox-minimize], .lightbox-window-controls';
  ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'mousedown', 'mousemove', 'mouseup'].forEach((type) => {
    window.addEventListener(type, (e) => {
      const t = e.target;
      if (!t || !t.closest || !t.closest('.glightbox-container')) return;
      if (t.closest(SWIPE_KEEP)) return;
      e.stopPropagation();
    }, { capture: true, passive: true });
  });

  /* Capture phase on window: runs before GLightbox / any other handler can stop it.
     Listens for pointerup as well as click, so it still fires if a click is never
     synthesised. The lightboxClosing flag stops the second event doing it twice. */
  function onLightboxCommand(e) {
    if (e.type === 'pointerup' && e.button !== 0) return;
    const container = document.querySelector('.glightbox-container');
    if (!container) return;
    const minimizeBtn = lightboxCommandFor(e, 'data-glightbox-minimize');
    const closeBtn = minimizeBtn ? null : lightboxCommandFor(e, 'data-glightbox-close');
    if (!minimizeBtn && !closeBtn) return;
    e.preventDefault();
    e.stopPropagation();
    if (lightboxClosing) return;
    lightboxClosing = true;

    /* Never leave the flag stuck, and always fall back to GLightbox's own close. */
    const finish = () => {
      try { closeLightboxNoEffect(); } catch (err) { /* fall through to fallback */ }
      window.setTimeout(() => {
        const still = document.querySelector('.glightbox-container');
        if (still) {
          const g = still.querySelector('.gclose');
          try { if (g) g.click(); else glightbox.close(); } catch (err) { /* ignore */ }
        }
        lightboxClosing = false;
      }, 450);
    };

    if (minimizeBtn) {
      const media = container.querySelector('.gslide.current .gslide-media');
      const dockEl = getDockTarget('projects');
      shrinkIntoDock(media, dockEl, container).then(() => {
        finish();
        bounceDockItem(dockEl);
      }).catch(finish);
    } else {
      fadeOut(container, 220).then(finish).catch(finish);
    }
  }
  window.addEventListener('pointerup', onLightboxCommand, true);
  window.addEventListener('click', onLightboxCommand, true);

})();