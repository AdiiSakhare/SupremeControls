# Supreme Controls Website — QA Findings Report
**Generated:** 2026-06-03  
**Total Issues Found:** 232 (48 High · 5 Medium · 136 Low · 43 Info)

---

## How to Read This Report

Each issue includes:
- **What is happening** — the actual problem in plain English
- **Why it matters** — the real-world impact
- **How to fix it** — what needs to change

---

---

# PART 1 — HIGH PRIORITY ISSUES
*These must be fixed before the website goes live.*

---

## Issue H-1: Keyboard Navigation is Broken on the Hero and Navbar
**Files:** `css/hero.css`, `css/navbar.css`

**What is happening:**  
When a user tries to navigate the website using only a keyboard (Tab key), there is no visible indicator showing which element is currently focused. The buttons, links, and navigation items all look the same whether they are selected or not. This happens because the CSS files for the hero section and navbar are missing `:focus-visible` styles entirely.

**Why it matters:**  
This is an accessibility requirement. Users who cannot use a mouse — including people with motor disabilities, power users who prefer keyboards, and screen reader users — cannot effectively use the website. It also fails basic accessibility audits (WCAG 2.1 AA), which can be a legal concern depending on the client's industry. Additionally, search engines factor in accessibility when ranking websites.

**How to fix it:**  
Add the following CSS to both `css/hero.css` and `css/navbar.css`:
```css
a:focus-visible,
button:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 3px;
  border-radius: 4px;
}
```

---

## Issue H-2: Images Will Break the Layout on Mobile Screens
**File:** `css/responsive.css`

**What is happening:**  
The `responsive.css` file — which is supposed to handle mobile layouts — is missing a fundamental rule: `img { max-width: 100% }`. Without this, images will display at their full original size regardless of screen width. A large product image (e.g. 1200px wide) will overflow its container and cause the page to scroll horizontally on phones.

**Why it matters:**  
A large percentage of visitors will be viewing this website on mobile devices. If images overflow the screen, the layout breaks completely and the site looks unprofessional. This is one of the most basic responsive design requirements.

**How to fix it:**  
Add this rule to `css/responsive.css`:
```css
img {
  max-width: 100%;
  height: auto;
}
```

---

## Issue H-3: The Website Has No Protection Against Horizontal Scrolling on Mobile
**File:** `css/responsive.css`

**What is happening:**  
There is no rule preventing content from overflowing horizontally on small screens. This means that if any element — a wide table, a flex row that doesn't wrap, a fixed-width div — is wider than the phone screen, users will see unexpected horizontal scrolling across the entire page.

**Why it matters:**  
Horizontal scrolling on mobile is a broken experience. Users expect to scroll vertically only. When horizontal scroll appears unexpectedly, it usually means a layout element is overflowing — and it's disorienting and looks broken.

**How to fix it:**  
Add to `css/responsive.css`:
```css
body {
  overflow-x: hidden;
}
```

---

## Issue H-4: 45 Images Are Loaded from Unsplash's Servers — Not Your Own
**Files:** Across nearly every page of the website (full list below)

**What is happening:**  
Almost every page on this website uses images hosted on Unsplash's CDN (images.unsplash.com). These images are embedded using their public API URLs. This means every time a visitor loads a page, their browser is making requests to Unsplash's servers to download those images — not your servers.

**Why it matters — there are three serious problems here:**

1. **Reliability:** If Unsplash's CDN goes down, changes its URL structure, or rate-limits your domain, every image on your website disappears instantly. You have no control over this.

2. **Licensing:** Unsplash's free license allows embedding their images, but it does not allow using them for commercial client work where the images represent the client's actual business. Using a random Unsplash photo of a generic industrial setting to represent *Supreme Controls' real projects* is misleading and potentially a licensing violation.

3. **Performance:** External CDN requests add load time. Your own optimized assets will always load faster than third-party servers.

**How to fix it:**  
Replace every Unsplash URL with real photographs of Supreme Controls' actual facilities, panels, teams, and projects. These should be:
- Shot at the client's premises
- Licensed stock images from a proper industrial photography library
- Stored in `assets/images/` on your own server

**Pages with Unsplash images that need replacement:**
- `index.html` — 6 industry/section images
- `pages/about.html` — 3 images
- `pages/contact.html` — 1 image
- `pages/industries.html` — 7 images
- `pages/industries/agriculture.html` — 1 image
- `pages/industries/automotive.html` — 1 image
- `pages/industries/commercial-facilities.html` — 1 image
- `pages/industries/infrastructure.html` — 1 image
- `pages/industries/manufacturing.html` — 1 image
- `pages/industries/process-industries.html` — 1 image
- `pages/products/custom-control-panels.html` — 5 images
- `pages/projects.html` — 10 images *(this page is entirely placeholder imagery)*
- `pages/services/automation-consultancy.html` — 1 image
- `pages/services/engineering-services.html` — 1 image
- `pages/services/industrial-automation.html` — 1 image
- `pages/services/plc-scada-solutions.html` — 1 image
- `pages/services/security-solutions.html` — 1 image
- `pages/services/smart-infrastructure.html` — 1 image
- `pages/services.html` — 1 image

**Note about `pages/projects.html`:** This page has 10 Unsplash images for project cards. All 10 appear to be generic stock photos, not actual Supreme Controls project photos. This entire page needs real project documentation before it is ready to publish.

---

---

# PART 2 — MEDIUM PRIORITY ISSUES
*Should be fixed before launch, or shortly after. Will not break the site, but affect quality.*

---

## Issue M-1: The Base Font Size is Set in a Way That Ignores User Preferences
**File:** `css/reset.css`, line 13

**What is happening:**  
The stylesheet sets `font-size: 16px` as the base font size. This is a fixed pixel value. When users set a larger default font size in their browser or operating system (a common accessibility setting for people with low vision), this hard-coded value overrides their preference and keeps text small.

**Why it matters:**  
Using `1rem` instead of `16px` respects user preferences. Both look identical in a normal browser — but `1rem` scales up when the user has increased their system font size. This is a low-effort accessibility improvement.

**How to fix it:**  
Change `font-size: 16px` to `font-size: 1rem` (or remove it entirely, as 16px is already the browser default).

---

## Issue M-2: Two Sections Have Fixed Widths That Won't Adapt to Small Screens
**Files:** `pages/contact.html` line 224, `pages/projects.html` line 59

**What is happening:**  
Two elements are given a specific pixel width using an inline style (`style="max-width: 560px"` and `style="max-width: 640px"`). These are also set as inline styles inside the HTML, rather than in the CSS file where they belong.

**Why it matters:**  
While `max-width` is generally fine, the fact that these are inline styles makes them harder to override and maintain. They should be in the CSS file with a proper class name. This is a maintainability issue more than a breakage issue.

**How to fix it:**  
Remove the inline `style=` attributes from those elements. Create named CSS classes in the appropriate stylesheet:
```css
.contact-map-wrapper {
  max-width: 560px;
}
.projects-intro {
  max-width: 640px;
}
```

---

## Issue M-3: The Navigation Bar Buttons Are Too Small to Tap on Mobile
**File:** `css/navbar.css`, line 262

**What is happening:**  
Some interactive elements in the navigation are only 36px tall. The minimum recommended tap target size for mobile is 44px. On a phone, users will struggle to accurately tap these elements — especially smaller fingers or users with motor difficulties.

**Why it matters:**  
This directly affects usability on mobile phones. Tap targets that are too small lead to missed taps, accidental clicks on neighboring elements, and user frustration. Apple's Human Interface Guidelines and Google's Material Design both specify 44px as the minimum.

**How to fix it:**  
In `css/navbar.css` around line 262, add or change the height:
```css
.nav-button {
  min-height: 44px;
  min-width: 44px;
}
```

---

---

# PART 3 — LOW PRIORITY ISSUES
*These are code quality and maintainability issues. They don't visually break the site but create technical debt.*

---

## Issue L-1: 123 Inline Styles Scattered Across Every HTML Page
**Files:** Almost every `.html` file in the project

**What is happening:**  
Throughout the HTML files, elements are styled using the `style=""` attribute directly on the HTML tag — for example, `style="margin-top: var(--space-4)"`. This is explicitly forbidden in the project's own `CLAUDE.md` rules ("Never use inline CSS").

The most common pattern is spacing adjustments like `margin-top`, which appears to have been added during page construction as quick one-off tweaks rather than being properly added to a CSS class.

**Why it matters:**  
- **Maintainability:** If you want to change the spacing pattern across all pages, you now have to edit 123 individual lines across 20+ HTML files instead of one CSS rule.
- **Consistency:** Some pages may have slightly different spacing values, causing visual inconsistency that is hard to track down.
- **Architecture:** This pattern directly contradicts the code standards defined in `CLAUDE.md` and `docs/code-guidelines.md`.

**How to fix it:**  
Add a set of spacing utility classes to `css/utilities.css`:
```css
.mt-4  { margin-top: var(--space-4); }
.mt-8  { margin-top: var(--space-8); }
.mt-10 { margin-top: var(--space-10); }
.mt-16 { margin-top: var(--space-16); }
.mt-20 { margin-top: var(--space-20); }
```
Then replace all `style="margin-top: var(--space-X)"` attributes with the corresponding class names. The contact page is the worst offender with 20 inline styles — including an entire contact info layout built inline.

---

## Issue L-2: 9 Flexbox Containers Will Cause Items to Overflow on Narrow Screens
**Files:** `css/contact.css`, `css/footer.css`, `css/navbar.css`, `css/sections.css`

**What is happening:**  
These CSS files contain `display: flex` containers without `flex-wrap: wrap`. In a flex row, items try to sit side-by-side in one line. Without `flex-wrap`, if the screen becomes too narrow to fit all items, they either overflow or get squished rather than wrapping to the next line.

**Why it matters:**  
On small screens (mobile phones under 480px wide), multi-column flex layouts will either overflow the screen or compress items to an unreadable size. This is a common source of broken mobile layouts.

**How to fix it:**  
Add `flex-wrap: wrap` to the affected flex containers in each file. The specific lines are:
- `css/contact.css` — lines 27 and 224
- `css/footer.css` — line 75
- `css/navbar.css` — lines 265 and 451
- `css/sections.css` — lines 240, 283, 511, 592, 787

---

## Issue L-3: The Same `z-index` Value Is Used Multiple Times in Two Files
**Files:** `css/footer.css` line 36, `css/sections.css` line 469

**What is happening:**  
In both files, `z-index: 1` is used for three different elements. The `z-index` property controls which element appears "on top" when elements overlap. When multiple unrelated elements all share the same z-index value, the browser has to resolve the stacking order by other means (usually source order), which can lead to unexpected visual layering bugs — especially when hover states, dropdowns, or fixed elements are involved.

**Why it matters:**  
This is a latent bug. It may not be visible right now, but as more interactive elements are added (modals, tooltips, sticky headers, dropdowns), z-index conflicts become very hard to debug.

**How to fix it:**  
Define a z-index scale in `css/variables.css` and use it consistently:
```css
:root {
  --z-base: 1;
  --z-overlay: 10;
  --z-dropdown: 20;
  --z-sticky: 30;
  --z-modal: 40;
  --z-toast: 50;
}
```

---

## Issue L-4: A Heading on the Agriculture Page Appears Twice
**File:** `pages/industries/agriculture.html`, line 104

**What is happening:**  
The heading text "MCC Panels for Pump Stations" appears twice on this page — used for two different sections or cards. Both instances are identical in text.

**Why it matters:**  
Duplicate headings confuse screen reader users (who use headings to navigate) and look like a copy-paste error to any attentive reader. They are also bad for SEO, as search engines expect unique, descriptive headings.

**How to fix it:**  
Review the two sections using this heading. If they are genuinely different, give each a unique, descriptive heading. If one is a duplicate by mistake, remove it.

---

---

# PART 4 — INFO (Optimization Suggestions)
*Not bugs. No rush. But worth doing before the final launch for performance.*

---

## Issue I-1: All Product Images Are in PNG Format — They Should Be WebP
**Files:** All product pages and `pages/products.html`

**What is happening:**  
The product panel images (`pcc-panels.png`, `mcc-panels.png`, `plc-panels.png`, `apfc-panels.png`, `vfd-panels.png`, `servo-panels.png`) are stored as `.png` files. These same images appear multiple times across different product pages — for example, `mcc-panels.png` appears on the MCC panels page, PCC panels page, APFC panels page, and `index.html`.

**Why it matters:**  
WebP is a modern image format that produces files 25–35% smaller than PNG with the same visual quality. Smaller images mean faster page loads, lower data usage for mobile users, and better scores on performance tests like Google PageSpeed Insights, which affects search rankings.

**How to fix it:**  
1. Convert all 6 product images to `.webp` using a free tool (Squoosh, cwebp, or any image editor).
2. Replace `<img src="...png">` with a `<picture>` element for browser compatibility:

```html
<picture>
  <source srcset="assets/images/products/pcc-panels.webp" type="image/webp">
  <img src="assets/images/products/pcc-panels.png" alt="PCC Control Panels" loading="lazy">
</picture>
```

This approach gives modern browsers WebP, while older browsers fall back to PNG automatically.

---

---

# Summary Table

| # | Issue | Priority | Files Affected | Effort |
|---|---|---|---|---|
| H-1 | Missing keyboard focus styles | High | 2 CSS files | 15 min |
| H-2 | Images overflow on mobile | High | responsive.css | 5 min |
| H-3 | Horizontal scroll risk | High | responsive.css | 5 min |
| H-4 | 45 Unsplash images need replacement | High | 19 HTML files | High effort — needs real photography |
| M-1 | Fixed font-size ignores user preferences | Medium | reset.css | 2 min |
| M-2 | Fixed pixel widths in inline styles | Medium | 2 HTML files | 10 min |
| M-3 | Nav tap targets too small for mobile | Medium | navbar.css | 5 min |
| L-1 | 123 inline styles across all pages | Low | All HTML files | 1–2 hours |
| L-2 | Flex containers missing flex-wrap | Low | 4 CSS files | 20 min |
| L-3 | Duplicate z-index values | Low | 2 CSS files | 30 min |
| L-4 | Duplicate heading on agriculture page | Low | 1 HTML file | 5 min |
| I-1 | PNG images should be WebP | Info | All product pages | 1 hour |

---

*Report generated by the Supreme Controls QA Agent System. Run `node qa/run-qa.js` to regenerate.*
