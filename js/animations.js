/**
 * SUPREME CONTROLS — GSAP ANIMATION ENGINE
 * Handles all scroll reveal animations, stagger sequences,
 * hero line reveals, and stat counters.
 *
 * Requires: GSAP + ScrollTrigger (loaded via CDN in HTML)
 * Lenis scroll is integrated via ScrollTrigger.scrollerProxy.
 */

import { prefersReducedMotion } from './utilities.js';

/**
 * Register GSAP plugins and configure defaults.
 */
function initGSAP() {
  gsap.registerPlugin(ScrollTrigger);

  gsap.defaults({
    ease: 'power3.out',
    duration: 0.8,
  });
}

/**
 * Connect Lenis smooth scroll to GSAP ScrollTrigger.
 * @param {Lenis} lenis - Lenis instance from main.js
 */
export function connectLenisToGSAP(lenis) {
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

/**
 * Animate elements with [data-reveal] attribute on scroll.
 * Supports: fade-up, fade-down, fade-left, fade-right, scale-up
 */
function initRevealAnimations() {
  const elements = document.querySelectorAll('[data-reveal]');

  elements.forEach(el => {
    const type = el.getAttribute('data-reveal') || 'fade-up';
    const delay = parseFloat(el.getAttribute('data-delay') || 0);

    const fromVars = { opacity: 0 };
    const toVars   = { opacity: 1, delay, duration: 0.8, ease: 'power3.out' };

    switch (type) {
      case 'fade-up':    fromVars.y = 32;  toVars.y = 0; break;
      case 'fade-down':  fromVars.y = -24; toVars.y = 0; break;
      case 'fade-left':  fromVars.x = 32;  toVars.x = 0; break;
      case 'fade-right': fromVars.x = -32; toVars.x = 0; break;
      case 'scale-up':   fromVars.scale = 0.94; toVars.scale = 1; break;
    }

    gsap.fromTo(el, fromVars, {
      ...toVars,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
    });
  });
}

/**
 * Stagger direct children of [data-stagger] on scroll.
 */
function initStaggerAnimations() {
  const wrappers = document.querySelectorAll('[data-stagger]');

  wrappers.forEach(wrapper => {
    const children = Array.from(wrapper.children);
    const staggerDelay = parseFloat(wrapper.getAttribute('data-stagger-delay') || 0.1);

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
 * Hero text line reveal — animates .hero-line elements inside .hero-line-wrap.
 * Called immediately on page load (not scroll-triggered).
 */
export function initHeroAnimation() {
  const lines = document.querySelectorAll('.hero-line');
  if (!lines.length) return;

  gsap.fromTo(lines,
    { y: '110%' },
    {
      y: '0%',
      duration: 1,
      stagger: 0.12,
      ease: 'power4.out',
      delay: 0.2,
    }
  );

  // Fade in hero subtext and CTAs
  const heroSub  = document.querySelector('.hero-sub');
  const heroCtas = document.querySelector('.hero-ctas');

  if (heroSub) {
    gsap.fromTo(heroSub,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.7, ease: 'power3.out' }
    );
  }

  if (heroCtas) {
    gsap.fromTo(heroCtas,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.9, ease: 'power3.out' }
    );
  }
}

/**
 * Animate stat counters when stats section enters viewport.
 * Targets elements with [data-count] attribute.
 */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  counters.forEach(el => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-count-suffix') || '';
    const duration = parseFloat(el.getAttribute('data-count-duration') || 1.8);

    const obj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = Math.round(obj.val).toLocaleString() + suffix;
          },
        });
      },
    });
  });
}

/**
 * Horizontal line/divider draw animation.
 * Targets elements with [data-draw-line].
 */
function initLineAnimations() {
  const lines = document.querySelectorAll('[data-draw-line]');

  lines.forEach(line => {
    gsap.fromTo(line,
      { scaleX: 0, transformOrigin: 'left center' },
      {
        scaleX: 1,
        duration: 1,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: line,
          start: 'top 90%',
          once: true,
        },
      }
    );
  });
}

/**
 * Master init — run all animation modules.
 * Call this after DOM is ready and Lenis is connected.
 */
export function initAnimations() {
  if (prefersReducedMotion()) return;

  initGSAP();
  initRevealAnimations();
  initStaggerAnimations();
  initCounters();
  initLineAnimations();

  // Refresh ScrollTrigger after fonts/images load
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
