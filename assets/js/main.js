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
  const glightbox = GLightbox({
    selector: '.glightbox'
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
   * Dock Scrollspy
   */
  let dockLinks = document.querySelectorAll('.linux-dock a.dock-item[href]');

  function dockScrollspy() {
    dockLinks.forEach(dockLink => {
      let hash = dockLink.getAttribute('href');
      if (!hash || hash.charAt(0) !== '#') return;
      let section = document.querySelector(hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        dockLinks.forEach(link => link.classList.remove('active'));
        dockLink.classList.add('active');
      } else {
        dockLink.classList.remove('active');
      }
    });
  }
  window.addEventListener('load', dockScrollspy);
  document.addEventListener('scroll', dockScrollspy);


  /**
   * Theme Dots - circular theme switcher
   */
  const themeDots = document.querySelectorAll('.theme-dot');

  if (themeDots.length) {
    function getCurrentTheme() {
      return document.documentElement.getAttribute('data-theme') || 'everforest';
    }

    function applyTheme(theme) {
      if (theme === 'everforest') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
      localStorage.setItem('site-theme', theme);

      themeDots.forEach(dot => {
        dot.classList.toggle('active', dot.getAttribute('data-theme-choice') === theme);
      });
    }

    applyTheme(getCurrentTheme());

    themeDots.forEach(dot => {
      dot.addEventListener('click', () => {
        applyTheme(dot.getAttribute('data-theme-choice'));
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
        { type: 'entry', title: 'AuditKit', sub: 'API Capstone Project' },
        { type: 'entry', title: 'NothingTechBlob', sub: 'Technical & On-Page SEO + WordPress Development' },
        { type: 'entry', title: 'Badlands Ink', sub: 'Technical, Local & E-Commerce SEO + WordPress Development' },
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

  function openTerminal(key) {
    const overlay = document.getElementById('terminal-' + key);
    const data = terminalData[key];
    if (!overlay || !data) return;
    closeAllTerminals();
    closeAppMenu();
    activeTypingToken++;
    const token = activeTypingToken;
    const bodyEl = overlay.querySelector('.terminal-body');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    runTerminalTyping(bodyEl, data, token);
  }

  function closeAllTerminals() {
    terminalOverlays.forEach(overlay => overlay.classList.remove('open'));
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-terminal]').forEach(btn => {
    btn.addEventListener('click', () => openTerminal(btn.getAttribute('data-terminal')));
  });

  document.querySelectorAll('[data-close-terminal]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTypingToken++;
      closeAllTerminals();
    });
  });

  terminalOverlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        activeTypingToken++;
        closeAllTerminals();
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      activeTypingToken++;
      closeAllTerminals();
    }
  });


  /**
   * Project Lightbox: wire up the injected "Close" dialog button
   */
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('[data-glightbox-close]');
    if (closeBtn && typeof glightbox !== 'undefined') {
      e.preventDefault();
      glightbox.close();
    }
  });

})();