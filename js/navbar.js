/**
 * SUPREME CONTROLS — NAVBAR BEHAVIOUR
 * Handles: sticky scroll, transparent-to-white transition,
 * mega dropdown (hover + keyboard), hamburger, mobile accordion.
 *
 * Self-initializes when navbar component is injected by component-loader.js.
 * No external dependencies.
 */

(function () {
  'use strict';

  let navbar, hamburger, mobileMenu;
  let lastScrollY   = 0;
  let scrollRafId   = null;

  /* ── Sticky / transparent / retract scroll ───────────────── */
  function onScroll() {
    // Debounce via rAF — one update per paint frame
    if (scrollRafId) return;
    scrollRafId = requestAnimationFrame(function () {
      scrollRafId = null;

      const currentY = window.scrollY;
      const scrolled  = currentY > 80;
      const delta     = currentY - lastScrollY;
      const menuOpen  = navbar.classList.contains('navbar--menu-open');

      // ── Transparent / solid state ────────────────────────
      navbar.classList.toggle('navbar--scrolled', scrolled);
      if (scrolled) {
        navbar.classList.remove('navbar--transparent');
      } else if (document.body.dataset.transparentNav) {
        navbar.classList.add('navbar--transparent');
      }

      // ── Retract logic ────────────────────────────────────
      if (currentY <= 80 || menuOpen) {
        // Always visible at top or when mobile menu is open
        navbar.classList.remove('navbar--hidden');
      } else if (delta > 5) {
        // Scrolling down past threshold → hide
        navbar.classList.add('navbar--hidden');
      } else if (delta < -5) {
        // Scrolling up past threshold → show
        navbar.classList.remove('navbar--hidden');
      }

      lastScrollY = currentY;
    });
  }

  /* ── Mobile menu ─────────────────────────────────────────── */
  function openMobileMenu() {
    navbar.classList.add('navbar--menu-open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    navbar.classList.remove('navbar--menu-open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function toggleMobileMenu() {
    const isOpen = navbar.classList.contains('navbar--menu-open');
    isOpen ? closeMobileMenu() : openMobileMenu();
  }

  /* ── Mobile accordion ────────────────────────────────────── */
  function initMobileAccordion() {
    const triggers = mobileMenu.querySelectorAll('.navbar__mobile-trigger');

    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        const sub = trigger.nextElementSibling;

        // Collapse all others
        triggers.forEach(other => {
          if (other !== trigger) {
            other.setAttribute('aria-expanded', 'false');
            const otherSub = other.nextElementSibling;
            if (otherSub) otherSub.hidden = true;
          }
        });

        // Toggle current
        trigger.setAttribute('aria-expanded', String(!expanded));
        if (sub) sub.hidden = expanded;
      });
    });
  }

  /* ── Desktop mega dropdowns ──────────────────────────────── */
  function initMegaDropdowns() {
    const items = navbar.querySelectorAll('[data-dropdown]');

    items.forEach(item => {
      const trigger = item.querySelector('[data-dropdown-trigger]');
      const panel   = item.querySelector('[data-dropdown-panel]');
      if (!trigger || !panel) return;

      let closeTimer;

      function openDropdown() {
        clearTimeout(closeTimer);
        // Close all others first
        items.forEach(other => {
          if (other !== item) {
            other.classList.remove('is-open');
            other.querySelector('[data-dropdown-trigger]')
              ?.setAttribute('aria-expanded', 'false');
          }
        });
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }

      function closeDropdown() {
        closeTimer = setTimeout(() => {
          item.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
        }, 120);
      }

      // Mouse events
      item.addEventListener('mouseenter', openDropdown);
      item.addEventListener('mouseleave', closeDropdown);
      panel.addEventListener('mouseenter', () => clearTimeout(closeTimer));
      panel.addEventListener('mouseleave', closeDropdown);

      // Keyboard: Enter/Space on trigger
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const isOpen = item.classList.contains('is-open');
          isOpen ? closeDropdown() : openDropdown();
        }
        if (e.key === 'Escape') closeDropdown();
      });

      // Close on Escape from anywhere inside panel
      panel.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeDropdown();
          trigger.focus();
        }
      });
    });

    // Close all dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        items.forEach(item => {
          item.classList.remove('is-open');
          item.querySelector('[data-dropdown-trigger]')
            ?.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  /* ── Main init ───────────────────────────────────────────── */
  function initNavbar() {
    navbar     = document.getElementById('navbar');
    hamburger  = document.getElementById('navbar-hamburger');
    mobileMenu = document.getElementById('navbar-mobile');

    if (!navbar) return;

    // Transparent nav for pages that declare it
    if (document.body.dataset.transparentNav) {
      navbar.classList.add('navbar--transparent');
    }

    // Seed lastScrollY so first delta is correct on page restore
    lastScrollY = window.scrollY;

    // Scroll listener
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Run once immediately

    // Hamburger
    if (hamburger) {
      hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Close mobile menu on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navbar.classList.contains('navbar--menu-open')) {
        closeMobileMenu();
        hamburger?.focus();
      }
    });

    // Mobile accordion
    if (mobileMenu) initMobileAccordion();

    // Desktop dropdowns
    initMegaDropdowns();
  }

  // Run when navbar component is injected
  document.addEventListener('component:loaded', (e) => {
    if (e.detail.id === 'navbar-placeholder') initNavbar();
  });

  // Fallback: if component already loaded (e.g., synchronous injection)
  if (document.getElementById('navbar')) initNavbar();

})();
