/**
 * SUPREME CONTROLS — COMPONENT LOADER (file:// + GitHub Pages compatible)
 *
 * Embeds navbar and footer HTML directly as strings — no fetch() required.
 * Works when opened as a local file (file://) and on GitHub Pages subpaths.
 *
 * Depth detection: reads the first stylesheet href to count '../' segments,
 * then rewrites all absolute internal links (/pages/...) to relative paths.
 */

/* ─── Base path detection ─────────────────────────────────────────────── */

function getBasePath() {
  // Count the number of '../' prefixes on the first LOCAL stylesheet link.
  // Skip external URLs (Google Fonts etc.) — they have no '../' and would
  // falsely return './' for all depth-1+ pages.
  // Root pages use  css/... (0 dots) → base = './'
  // Depth-1 pages  ../css/... (1 dot) → base = '../'
  // Depth-2 pages  ../../css/... (2 dots) → base = '../../'
  const links = document.querySelectorAll('link[rel="stylesheet"]');
  for (const link of links) {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('//')) {
      const dots = (href.match(/\.\.\//g) || []).length;
      return dots === 0 ? './' : '../'.repeat(dots);
    }
  }
  return './';
}

/* ─── Path rewriter ───────────────────────────────────────────────────── */

function patchPaths(html, base) {
  // 1. Replace exact root href="/" first (home link)
  // 2. Replace all other absolute paths href="/..." and src="/..."
  return html
    .replace(/href="\/"/g, `href="${base}index.html"`)
    .replace(/href="\//g,  `href="${base}`)
    .replace(/src="\//g,   `src="${base}`);
}

/* ─── Navbar HTML ─────────────────────────────────────────────────────── */

const NAVBAR_HTML = `<header class="navbar" id="navbar" role="banner">
  <div class="container">
    <div class="navbar__inner">

      <!-- Logo -->
      <a href="/" class="navbar__logo" aria-label="Supreme Controls — Home">
        <img src="/assets/logo/primary-black.svg" class="navbar__logo-img navbar__logo-img--dark" alt="Supreme Controls" width="200" height="30">
        <img src="/assets/logo/primary-white.svg" class="navbar__logo-img navbar__logo-img--light" alt="" aria-hidden="true" width="200" height="30">
      </a>

      <!-- Desktop navigation -->
      <nav class="navbar__nav" aria-label="Main navigation">
        <ul class="navbar__list" role="list">

          <li class="navbar__item">
            <a href="/" class="navbar__link" data-nav-link>Home</a>
          </li>

          <li class="navbar__item">
            <a href="/pages/about.html" class="navbar__link" data-nav-link>About</a>
          </li>

          <!-- Services mega dropdown -->
          <li class="navbar__item navbar__item--mega" data-dropdown>
            <button class="navbar__link navbar__trigger" aria-expanded="false" aria-haspopup="true" data-dropdown-trigger>
              Services
              <i data-lucide="chevron-down" class="navbar__chevron" width="14" height="14" aria-hidden="true"></i>
            </button>

            <div class="navbar__mega" role="region" aria-label="Services" data-dropdown-panel>
              <div class="navbar__mega-inner">

                <div class="navbar__mega-heading">
                  <span class="section-label">Our Services</span>
                </div>

                <div class="navbar__mega-grid">

                  <a href="/pages/services/industrial-automation.html" class="navbar__mega-item">
                    <div class="navbar__mega-icon" aria-hidden="true">
                      <i data-lucide="settings-2" width="20" height="20"></i>
                    </div>
                    <div class="navbar__mega-body">
                      <span class="navbar__mega-title">Industrial Automation</span>
                      <span class="navbar__mega-desc">End-to-end automation for manufacturing plants</span>
                    </div>
                  </a>

                  <a href="/pages/services/plc-scada-solutions.html" class="navbar__mega-item">
                    <div class="navbar__mega-icon" aria-hidden="true">
                      <i data-lucide="cpu" width="20" height="20"></i>
                    </div>
                    <div class="navbar__mega-body">
                      <span class="navbar__mega-title">PLC &amp; SCADA Solutions</span>
                      <span class="navbar__mega-desc">Custom programming and process visibility</span>
                    </div>
                  </a>

                  <a href="/pages/services/automation-consultancy.html" class="navbar__mega-item">
                    <div class="navbar__mega-icon" aria-hidden="true">
                      <i data-lucide="lightbulb" width="20" height="20"></i>
                    </div>
                    <div class="navbar__mega-body">
                      <span class="navbar__mega-title">Automation Consultancy</span>
                      <span class="navbar__mega-desc">Expert guidance on automation strategy</span>
                    </div>
                  </a>

                  <a href="/pages/services/security-solutions.html" class="navbar__mega-item">
                    <div class="navbar__mega-icon" aria-hidden="true">
                      <i data-lucide="shield-check" width="20" height="20"></i>
                    </div>
                    <div class="navbar__mega-body">
                      <span class="navbar__mega-title">Security Solutions</span>
                      <span class="navbar__mega-desc">Surveillance, access control, perimeter protection</span>
                    </div>
                  </a>

                  <a href="/pages/services/smart-infrastructure.html" class="navbar__mega-item">
                    <div class="navbar__mega-icon" aria-hidden="true">
                      <i data-lucide="building-2" width="20" height="20"></i>
                    </div>
                    <div class="navbar__mega-body">
                      <span class="navbar__mega-title">Building Automation</span>
                      <span class="navbar__mega-desc">BMS, HVAC control, and energy management</span>
                    </div>
                  </a>

                  <a href="/pages/services/engineering-services.html" class="navbar__mega-item">
                    <div class="navbar__mega-icon" aria-hidden="true">
                      <i data-lucide="sprout" width="20" height="20"></i>
                    </div>
                    <div class="navbar__mega-body">
                      <span class="navbar__mega-title">Agriculture Automation</span>
                      <span class="navbar__mega-desc">Irrigation, pump control, and crop monitoring</span>
                    </div>
                  </a>

                </div>

                <div class="navbar__mega-footer">
                  <a href="/pages/services.html" class="navbar__mega-all">
                    View all services
                    <i data-lucide="arrow-right" width="14" height="14" aria-hidden="true"></i>
                  </a>
                </div>

              </div>
            </div>
          </li>

          <!-- Products mega dropdown -->
          <li class="navbar__item navbar__item--mega" data-dropdown>
            <button class="navbar__link navbar__trigger" aria-expanded="false" aria-haspopup="true" data-dropdown-trigger>
              Products
              <i data-lucide="chevron-down" class="navbar__chevron" width="14" height="14" aria-hidden="true"></i>
            </button>

            <div class="navbar__mega navbar__mega--products" role="region" aria-label="Products" data-dropdown-panel>
              <div class="navbar__mega-inner">

                <div class="navbar__mega-heading">
                  <span class="section-label">Our Products</span>
                </div>

                <div class="navbar__mega-grid navbar__mega-grid--products">

                  <a href="/pages/products/pcc-panels.html" class="navbar__mega-item">
                    <div class="navbar__mega-icon" aria-hidden="true">
                      <i data-lucide="zap" width="20" height="20"></i>
                    </div>
                    <div class="navbar__mega-body">
                      <span class="navbar__mega-title">PCC Panels</span>
                      <span class="navbar__mega-desc">Power Control Centres</span>
                    </div>
                  </a>

                  <a href="/pages/products/mcc-panels.html" class="navbar__mega-item">
                    <div class="navbar__mega-icon" aria-hidden="true">
                      <i data-lucide="settings" width="20" height="20"></i>
                    </div>
                    <div class="navbar__mega-body">
                      <span class="navbar__mega-title">MCC Panels</span>
                      <span class="navbar__mega-desc">Motor Control Centres</span>
                    </div>
                  </a>

                  <a href="/pages/products/apfc-panels.html" class="navbar__mega-item">
                    <div class="navbar__mega-icon" aria-hidden="true">
                      <i data-lucide="gauge" width="20" height="20"></i>
                    </div>
                    <div class="navbar__mega-body">
                      <span class="navbar__mega-title">APFC Panels</span>
                      <span class="navbar__mega-desc">Automatic Power Factor Correction</span>
                    </div>
                  </a>

                  <a href="/pages/products/plc-panels.html" class="navbar__mega-item">
                    <div class="navbar__mega-icon" aria-hidden="true">
                      <i data-lucide="circuit-board" width="20" height="20"></i>
                    </div>
                    <div class="navbar__mega-body">
                      <span class="navbar__mega-title">PLC Panels</span>
                      <span class="navbar__mega-desc">Programmable Logic Controller Panels</span>
                    </div>
                  </a>

                  <a href="/pages/products/vfd-panels.html" class="navbar__mega-item">
                    <div class="navbar__mega-icon" aria-hidden="true">
                      <i data-lucide="activity" width="20" height="20"></i>
                    </div>
                    <div class="navbar__mega-body">
                      <span class="navbar__mega-title">VFD Panels</span>
                      <span class="navbar__mega-desc">Variable speed drive enclosures</span>
                    </div>
                  </a>

                  <a href="/pages/products/servo-panels.html" class="navbar__mega-item">
                    <div class="navbar__mega-icon" aria-hidden="true">
                      <i data-lucide="crosshair" width="20" height="20"></i>
                    </div>
                    <div class="navbar__mega-body">
                      <span class="navbar__mega-title">Servo Panels</span>
                      <span class="navbar__mega-desc">Precision servo drive enclosures</span>
                    </div>
                  </a>

                  <a href="/pages/products/custom-control-panels.html" class="navbar__mega-item">
                    <div class="navbar__mega-icon" aria-hidden="true">
                      <i data-lucide="sliders-horizontal" width="20" height="20"></i>
                    </div>
                    <div class="navbar__mega-body">
                      <span class="navbar__mega-title">Custom Control Panels</span>
                      <span class="navbar__mega-desc">Bespoke panels engineered to specification</span>
                    </div>
                  </a>

                </div>

                <div class="navbar__mega-footer">
                  <a href="/pages/products.html" class="navbar__mega-all">
                    View all products
                    <i data-lucide="arrow-right" width="14" height="14" aria-hidden="true"></i>
                  </a>
                </div>

              </div>
            </div>
          </li>

          <li class="navbar__item">
            <a href="/pages/industries.html" class="navbar__link" data-nav-link>Industries</a>
          </li>

          <li class="navbar__item">
            <a href="/pages/projects.html" class="navbar__link" data-nav-link>Projects</a>
          </li>

        </ul>
      </nav>

      <!-- Actions: CTA + Hamburger -->
      <div class="navbar__actions">
        <a href="/pages/contact.html" class="btn btn-nav">Contact Us</a>
        <button
          class="navbar__hamburger"
          id="navbar-hamburger"
          aria-expanded="false"
          aria-label="Open navigation menu"
          aria-controls="navbar-mobile"
        >
          <span class="navbar__bar" aria-hidden="true"></span>
          <span class="navbar__bar" aria-hidden="true"></span>
          <span class="navbar__bar" aria-hidden="true"></span>
        </button>
      </div>

    </div>
  </div>

  <!-- Mobile menu -->
  <div class="navbar__mobile" id="navbar-mobile" aria-hidden="true">
    <div class="navbar__mobile-inner">
      <nav aria-label="Mobile navigation">
        <ul class="navbar__mobile-list" role="list">

          <li><a href="/" class="navbar__mobile-link" data-nav-link>Home</a></li>
          <li><a href="/pages/about.html" class="navbar__mobile-link" data-nav-link>About</a></li>

          <!-- Services accordion -->
          <li class="navbar__mobile-item--has-sub">
            <button class="navbar__mobile-link navbar__mobile-trigger" aria-expanded="false">
              Services
              <i data-lucide="chevron-down" class="navbar__chevron" width="14" height="14" aria-hidden="true"></i>
            </button>
            <ul class="navbar__mobile-sub" hidden>
              <li><a href="/pages/services/industrial-automation.html" class="navbar__mobile-sub-link">Industrial Automation</a></li>
              <li><a href="/pages/services/plc-scada-solutions.html" class="navbar__mobile-sub-link">PLC &amp; SCADA Solutions</a></li>
              <li><a href="/pages/services/automation-consultancy.html" class="navbar__mobile-sub-link">Automation Consultancy</a></li>
              <li><a href="/pages/services/security-solutions.html" class="navbar__mobile-sub-link">Security Solutions</a></li>
              <li><a href="/pages/services/smart-infrastructure.html" class="navbar__mobile-sub-link">Building Automation</a></li>
              <li><a href="/pages/services/engineering-services.html" class="navbar__mobile-sub-link">Agriculture Automation</a></li>
              <li><a href="/pages/services.html" class="navbar__mobile-sub-link navbar__mobile-sub-link--view-all">All Services →</a></li>
            </ul>
          </li>

          <!-- Products accordion -->
          <li class="navbar__mobile-item--has-sub">
            <button class="navbar__mobile-link navbar__mobile-trigger" aria-expanded="false">
              Products
              <i data-lucide="chevron-down" class="navbar__chevron" width="14" height="14" aria-hidden="true"></i>
            </button>
            <ul class="navbar__mobile-sub" hidden>
              <li><a href="/pages/products/pcc-panels.html" class="navbar__mobile-sub-link">PCC Panels</a></li>
              <li><a href="/pages/products/mcc-panels.html" class="navbar__mobile-sub-link">MCC Panels</a></li>
              <li><a href="/pages/products/apfc-panels.html" class="navbar__mobile-sub-link">APFC Panels</a></li>
              <li><a href="/pages/products/plc-panels.html" class="navbar__mobile-sub-link">PLC Panels</a></li>
              <li><a href="/pages/products/vfd-panels.html" class="navbar__mobile-sub-link">VFD Panels</a></li>
              <li><a href="/pages/products/servo-panels.html" class="navbar__mobile-sub-link">Servo Panels</a></li>
              <li><a href="/pages/products/custom-control-panels.html" class="navbar__mobile-sub-link">Custom Control Panels</a></li>
              <li><a href="/pages/products.html" class="navbar__mobile-sub-link navbar__mobile-sub-link--view-all">All Products →</a></li>
            </ul>
          </li>

          <li><a href="/pages/industries.html" class="navbar__mobile-link" data-nav-link>Industries</a></li>
          <li><a href="/pages/projects.html" class="navbar__mobile-link" data-nav-link>Projects</a></li>

          <li class="navbar__mobile-cta-item">
            <a href="/pages/contact.html" class="btn btn-primary w-full">Contact Us</a>
          </li>

        </ul>
      </nav>
    </div>
  </div>

</header>`;

/* ─── Footer HTML (script tag stripped — year set below) ─────────────── */

const FOOTER_HTML = `<footer class="footer" id="site-footer" role="contentinfo">
  <div class="container">

    <!-- Brand block — full width -->
    <div class="footer__brand">
      <a href="/" class="footer__logo" aria-label="Supreme Controls — Home">
        <img src="/assets/logo/primary-white.svg" class="footer__logo-img" alt="Supreme Controls" width="200" height="30">
      </a>

      <p class="footer__desc">
        Engineering reliable industrial automation and electrical control solutions with precision, expertise, and a commitment to long-term performance.
      </p>
    </div>

    <!-- Divider -->
    <div class="divider" role="separator" aria-hidden="true"></div>

    <!-- 5-column links row -->
    <div class="footer__links-row">

      <!-- Services -->
      <div class="footer__col">
        <h3 class="footer__col-title">Services</h3>
        <ul class="footer__col-list" role="list">
          <li><a href="/pages/services/industrial-automation.html" class="footer__link">Industrial Automation</a></li>
          <li><a href="/pages/services/plc-scada-solutions.html" class="footer__link">PLC &amp; SCADA Solutions</a></li>
          <li><a href="/pages/services/automation-consultancy.html" class="footer__link">Automation Consultancy</a></li>
          <li><a href="/pages/services/security-solutions.html" class="footer__link">Security Solutions</a></li>
          <li><a href="/pages/services/smart-infrastructure.html" class="footer__link">Smart Infrastructure</a></li>
          <li><a href="/pages/services/engineering-services.html" class="footer__link">Engineering Services</a></li>
        </ul>
      </div>

      <!-- Products -->
      <div class="footer__col">
        <h3 class="footer__col-title">Products</h3>
        <ul class="footer__col-list" role="list">
          <li><a href="/pages/products/pcc-panels.html" class="footer__link">PCC Panels</a></li>
          <li><a href="/pages/products/mcc-panels.html" class="footer__link">MCC Panels</a></li>
          <li><a href="/pages/products/apfc-panels.html" class="footer__link">APFC Panels</a></li>
          <li><a href="/pages/products/plc-panels.html" class="footer__link">PLC Panels</a></li>
          <li><a href="/pages/products/vfd-panels.html" class="footer__link">VFD Panels</a></li>
          <li><a href="/pages/products/servo-panels.html" class="footer__link">Servo Panels</a></li>
          <li><a href="/pages/products/custom-control-panels.html" class="footer__link">Custom Control Panels</a></li>
        </ul>
      </div>

      <!-- Company -->
      <div class="footer__col">
        <h3 class="footer__col-title">Company</h3>
        <ul class="footer__col-list" role="list">
          <li><a href="/pages/about.html" class="footer__link">About Us</a></li>
          <li><a href="/pages/industries.html" class="footer__link">Industries</a></li>
          <li><a href="/pages/projects.html" class="footer__link">Projects</a></li>
          <li><a href="/pages/contact.html" class="footer__link">Contact</a></li>
        </ul>
      </div>

      <!-- Connect -->
      <div class="footer__col">
        <h3 class="footer__col-title">Connect</h3>
        <ul class="footer__col-list" role="list">
          <li><a href="https://linkedin.com" class="footer__link" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          <li><a href="mailto:vvj.supreme@gmail.com" class="footer__link">Email Us</a></li>
          <li><a href="/pages/contact.html" class="footer__link">Get a Quote</a></li>
        </ul>
      </div>

      <!-- Contact -->
      <div class="footer__col">
        <h3 class="footer__col-title">Contact</h3>
        <ul class="footer__col-list" role="list">
          <li>
            <a href="tel:+919850766125" class="footer__link footer__link--contact">
              <i data-lucide="phone" width="14" height="14" aria-hidden="true"></i>
              V. V. Jadhav — +91 98507 66125
            </a>
          </li>
          <li>
            <a href="tel:+919850781392" class="footer__link footer__link--contact">
              <i data-lucide="phone" width="14" height="14" aria-hidden="true"></i>
              A. V. Jadhav — +91 98507 81392
            </a>
          </li>
          <li>
            <a href="mailto:vvj.supreme@gmail.com" class="footer__link footer__link--contact">
              <i data-lucide="mail" width="14" height="14" aria-hidden="true"></i>
              vvj.supreme@gmail.com
            </a>
          </li>
          <li>
            <a href="mailto:supremeenterprises1970@gmail.com" class="footer__link footer__link--contact">
              <i data-lucide="mail" width="14" height="14" aria-hidden="true"></i>
              supremeenterprises1970@gmail.com
            </a>
          </li>
          <li class="footer__link footer__link--contact" style="pointer-events:none;cursor:default;">
            <i data-lucide="map-pin" width="14" height="14" aria-hidden="true"></i>
            Bhosari, Pune 411039
          </li>
          <li class="footer__link footer__link--contact" style="pointer-events:none;cursor:default;">
            <i data-lucide="map-pin" width="14" height="14" aria-hidden="true"></i>
            MIDC, Pune 411026
          </li>
        </ul>
      </div>

    </div>

    <!-- Divider -->
    <div class="divider" role="separator" aria-hidden="true"></div>

    <!-- Bottom bar -->
    <div class="footer__bottom">
      <p class="footer__copy">
        &copy; <span id="footer-year"></span> Supreme Controls. All rights reserved.
      </p>
      <p class="footer__hours">
        Mon &ndash; Sat &nbsp;|&nbsp; 9:00 AM &ndash; 6:00 PM IST
      </p>
    </div>

  </div>
</footer>`;

/* ─── Active nav link ─────────────────────────────────────────────────── */

function setActiveNavLink() {
  const navLinks = document.querySelectorAll('[data-nav-link]');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    try {
      const resolved = new URL(href, document.baseURI).href;
      const current  = window.location.href;

      // Normalise: strip trailing slash / index.html so both resolve the same
      const norm = function (u) {
        return u.split('?')[0].split('#')[0]
          .replace(/\/index\.html$/, '/')
          .replace(/\/$/, '');
      };

      const isActive = norm(current) === norm(resolved);
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
    } catch (e) {
      // Ignore malformed hrefs
    }
  });
}

/* ─── Init ────────────────────────────────────────────────────────────── */

function initComponents() {
  const base = getBasePath();

  // Inject navbar
  const navbarEl = document.getElementById('navbar-placeholder');
  if (navbarEl) {
    navbarEl.innerHTML = patchPaths(NAVBAR_HTML, base);
    document.dispatchEvent(new CustomEvent('component:loaded', { detail: { id: 'navbar-placeholder' } }));
  }

  // Inject footer (script stripped — year set manually below)
  const footerEl = document.getElementById('footer-placeholder');
  if (footerEl) {
    footerEl.innerHTML = patchPaths(FOOTER_HTML, base);
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    document.dispatchEvent(new CustomEvent('component:loaded', { detail: { id: 'footer-placeholder' } }));
  }

  setActiveNavLink();

  // Replace all data-lucide elements with actual SVGs
  if (typeof lucide !== 'undefined') {
    lucide.createIcons({ attrs: { 'stroke-width': '1.5' } });
  }

  // Signal that all shared components are ready
  document.dispatchEvent(new CustomEvent('components:ready'));
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initComponents);
} else {
  initComponents();
}
