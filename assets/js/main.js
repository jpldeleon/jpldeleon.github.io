/**
* Template Name: SnapFolio
* Template URL: https://bootstrapmade.com/snapfolio-bootstrap-portfolio-template/
* Updated: Jul 21 2025 with Bootstrap v5.3.7
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Header toggle
   */
  const headerToggleBtn = document.querySelector('.header-toggle');

  function headerToggle() {
    document.querySelector('#header').classList.toggle('header-show');
    headerToggleBtn.classList.toggle('fa-bars');
    headerToggleBtn.classList.toggle('fa-xmark');
  }
  headerToggleBtn.addEventListener('click', headerToggle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.header-show')) {
        headerToggle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

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
      handler: function(direction) {
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
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
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
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
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
  window.addEventListener('load', function(e) {
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
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

  
  const themeToggleBtn = document.querySelector('#theme-toggle');

  if (themeToggleBtn) {
    const themeIcon = themeToggleBtn.querySelector('i');

    const themeOrder = ['aurora', 'gruvbox', 'everforest', 'monokai'];
    const themeIcons = {
      aurora: 'fa-solid fa-sun',
      gruvbox: 'fa-solid fa-tree',
      everforest: 'fa-solid fa-moon',
      monokai: 'fa-solid fa-meteor'
    };
    const themeLabels = {
      aurora: 'Aurora',
      gruvbox: 'Gruvbox',
      everforest: 'Everforest',
      monokai: 'Monokai'
    };

    function getCurrentTheme() {
      return document.documentElement.getAttribute('data-theme') || 'aurora';
    }

    function applyTheme(theme) {
      if (theme === 'aurora') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
      localStorage.setItem('site-theme', theme);

      themeIcon.className = themeIcons[theme];
      const currentIndex = themeOrder.indexOf(theme);
      const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
      themeToggleBtn.title = 'Switch to ' + themeLabels[nextTheme] + ' theme';
    }

    applyTheme(getCurrentTheme());

    themeToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentIndex = themeOrder.indexOf(getCurrentTheme());
      const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
      applyTheme(nextTheme);
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

  document.querySelectorAll('.js-copy-trigger').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
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

})();