/**
 * SUPREME CONTROLS — APPLICATION BUNDLE
 *
 * Single non-module script. GSAP scroll animations + CSS-driven premium interactions.
 * No Lenis — native smooth scroll via CSS scroll-behavior.
 * Works on file:// and GitHub Pages.
 */

/* ─── Utilities ──────────────────────────────────────────────────────── */

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ─── GSAP Animation Engine ──────────────────────────────────────────── */

function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return false;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out', duration: 0.8 });
  return true;
}

/**
 * Animate elements with [data-reveal] on scroll.
 * GSAP sets the from-state inline — no CSS pre-hiding needed.
 */
function initRevealAnimations() {
  var elements = document.querySelectorAll('[data-reveal]');

  elements.forEach(function (el) {
    var type  = el.getAttribute('data-reveal') || 'fade-up';
    var delay = parseFloat(el.getAttribute('data-delay') || 0);

    var fromVars = { opacity: 0 };
    var toVars   = { opacity: 1, delay: delay, duration: 0.8, ease: 'power3.out' };

    switch (type) {
      case 'fade-up':    fromVars.y = 32;       toVars.y = 0;     break;
      case 'fade-down':  fromVars.y = -24;      toVars.y = 0;     break;
      case 'fade-left':  fromVars.x = 32;       toVars.x = 0;     break;
      case 'fade-right': fromVars.x = -32;      toVars.x = 0;     break;
      case 'scale-up':   fromVars.scale = 0.94; toVars.scale = 1; break;
    }

    gsap.fromTo(el, fromVars, Object.assign({}, toVars, {
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
    }));
  });
}

/**
 * Stagger direct children of [data-stagger] on scroll.
 */
function initStaggerAnimations() {
  var wrappers = document.querySelectorAll('[data-stagger]');

  wrappers.forEach(function (wrapper) {
    var children     = Array.from(wrapper.children);
    var staggerDelay = parseFloat(wrapper.getAttribute('data-stagger-delay') || 0.1);

    gsap.fromTo(children,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: staggerDelay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: wrapper,
          start: 'top 85%',
          once: true,
        },
      }
    );
  });
}

/**
 * Hero text line reveal — runs on page load, not scroll.
 */
function initHeroAnimation() {
  if (typeof gsap === 'undefined') return;

  var lines = document.querySelectorAll('.hero-line');
  if (!lines.length) return;

  gsap.fromTo(lines,
    { y: '110%' },
    { y: '0%', duration: 1, stagger: 0.12, ease: 'power4.out', delay: 0.2 }
  );

  var heroSub  = document.querySelector('.hero-sub');
  var heroCtas = document.querySelector('.hero-ctas');

  if (heroSub)  gsap.fromTo(heroSub,  { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.7, ease: 'power3.out' });
  if (heroCtas) gsap.fromTo(heroCtas, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.9, ease: 'power3.out' });
}

/**
 * Stat counters.
 */
function initCounters() {
  var counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  counters.forEach(function (el) {
    var target   = parseInt(el.getAttribute('data-count'), 10);
    var suffix   = el.getAttribute('data-count-suffix') || '';
    var duration = parseFloat(el.getAttribute('data-count-duration') || 1.8);
    var obj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: function () {
        gsap.to(obj, {
          val: target,
          duration: duration,
          ease: 'power2.out',
          onUpdate: function () {
            el.textContent = Math.round(obj.val).toLocaleString() + suffix;
          },
        });
      },
    });
  });
}

/**
 * Line draw animations.
 */
function initLineAnimations() {
  var lines = document.querySelectorAll('[data-draw-line]');
  lines.forEach(function (line) {
    gsap.fromTo(line,
      { scaleX: 0, transformOrigin: 'left center' },
      {
        scaleX: 1, duration: 1, ease: 'power3.inOut',
        scrollTrigger: { trigger: line, start: 'top 90%', once: true },
      }
    );
  });
}

/**
 * Master animation init.
 */
function initAnimations() {
  if (prefersReducedMotion()) return;
  if (!initGSAP()) return; // GSAP CDN not loaded — skip silently

  initRevealAnimations();
  initStaggerAnimations();
  initCounters();
  initLineAnimations();

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
}

/* ─── Process Steps Hover ────────────────────────────────────────────── */

/**
 * Hover-based cumulative highlight for .process-step elements.
 * Hovering step N activates steps 1 through N with brand color.
 * Leaving the container clears all active states.
 */
function initProcessSteps() {
  var steps = document.querySelectorAll('.process-step');
  if (!steps.length) return;

  steps.forEach(function (step, index) {
    step.addEventListener('mouseenter', function () {
      steps.forEach(function (s, i) {
        if (i <= index) {
          s.classList.add('is-active');
        } else {
          s.classList.remove('is-active');
        }
      });
    });
  });

  var container = document.querySelector('.process__steps');
  if (container) {
    container.addEventListener('mouseleave', function () {
      steps.forEach(function (s) { s.classList.remove('is-active'); });
    });
  }
}

/* ─── Capability Card 3D Tilt ────────────────────────────────────────── */

/**
 * Subtle perspective tilt on .cap-card following cursor.
 * Purely decorative — disabled at reduced motion + touch.
 * On leave: smooth spring-like return to flat.
 */
function initCardTilt() {
  if (prefersReducedMotion()) return;

  // Touch devices: no hover, skip
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var cards = document.querySelectorAll('.cap-card');

  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect  = card.getBoundingClientRect();
      var x     = e.clientX - rect.left;
      var y     = e.clientY - rect.top;
      var cx    = rect.width  / 2;
      var cy    = rect.height / 2;
      // Max ±5deg tilt
      var rotX  = ((y - cy) / cy) * -5;
      var rotY  = ((x - cx) / cx) *  5;

      card.style.transition = 'transform 0ms, box-shadow 0ms';
      card.style.transform  =
        'perspective(900px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateY(-4px)';
      card.style.boxShadow  = 'var(--shadow-card-hover)';
    });

    card.addEventListener('mouseleave', function () {
      // Smooth spring-like return
      card.style.transition = 'transform 500ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 500ms cubic-bezier(0.23, 1, 0.32, 1)';
      card.style.transform  = '';
      card.style.boxShadow  = '';
    });
  });
}

/* ─── Boot ───────────────────────────────────────────────────────────── */

function init() {
  // Hero runs immediately — visible on load
  initHeroAnimation();

  // Scroll animations — run directly, no event dependency
  // (component-loader dispatches 'components:ready' before main.js listener
  //  could attach, so we just run directly after DOM is ready)
  initAnimations();

  // CSS-driven interactions (no library)
  initProcessSteps();
  initCardTilt();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
