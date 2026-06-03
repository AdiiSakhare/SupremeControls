# HTML, CSS & JavaScript Website Development Guidelines

## Purpose

These guidelines ensure every website is:

- Clean and maintainable
- Modular and scalable
- Easy to update in the future
- Performance optimized
- Consistent across the entire project
- Easy for both humans and AI agents to understand and modify

---

# Core Principles

- Write code for long-term maintainability.
- Keep code simple and predictable.
- Prioritize readability over clever shortcuts.
- Follow consistent patterns throughout the project.
- Avoid unnecessary complexity.
- Every file should have a clear purpose.

---

# Project Structure

## Always Use Modular Architecture

Never place the entire website inside a single HTML file, CSS file, or JavaScript file.

Organize the project into logical folders.

Example:

```
project/
│
├── index.html
│
├── pages/
│   ├── about.html
│   ├── services.html
│   └── contact.html
│   └── other pages...
│
├── components/
│   ├── navbar.html
│   ├── footer.html
│   ├── faq.html
│   └── testimonial-card.html
│   └── other components...
│
├── css/
│   ├── main.css
│   ├── variables.css
│   ├── utilities.css
│   ├── navbar.css
│   ├── hero.css
│   ├── footer.css
│   └── responsive.css
│
├── js/
│   ├── main.js
│   ├── navbar.js
│   ├── animations.js
│   ├── forms.js
│   └── utilities.js
│
├── assets/
│   ├── images/
│   ├── icons/
│   ├── videos/
│   └── fonts/
│
└── data/
    ├── faq.json
    └── testimonials.json
```

---

# Component-Based Development

## Create Reusable Components

Common website sections should be created as standalone components.

Examples:

- Navbar
- Footer
- CTA Banner
- Testimonial Card
- FAQ Item
- Pricing Card
- Feature Card
- Modal
- Popup

Do not repeatedly write the same HTML structure.

Create reusable components and load them where needed.

Example:

```
components/
├── navbar.html
├── footer.html
├── pricing-card.html
└── testimonial-card.html
```

Then dynamically inject or load them into pages using JavaScript.

---

# Section Organization

## One Section = One Responsibility

Each major website section should have its own HTML structure, CSS file, and optional JavaScript logic.

Example:

```
Hero Section
Features Section
Benefits Section
Testimonials Section
Pricing Section
FAQ Section
Footer Section
```

Avoid building the entire website inside a single HTML file containing thousands of lines.

---

# HTML Guidelines

## Semantic HTML First

Use proper semantic elements.

Prefer:

```html
<header>
<nav>
<main>
<section>
<article>
<footer>
```

Avoid excessive use of:

```html
<div>
<div>
<div>
<div>
```

Use semantic tags whenever possible.

---

## Keep HTML Clean

HTML should contain structure only.

Avoid:

- Inline CSS
- Inline JavaScript
- Large logic blocks

Bad:

```html
<button onclick="doSomething()">
```

Good:

```html
<button class="cta-button">
```

Attach behavior through JavaScript files.

---

## Consistent Indentation

Use consistent formatting throughout the project.

Maintain readable nesting.

Avoid deeply nested structures whenever possible.

---

# CSS Guidelines

## Separate CSS by Purpose

Avoid putting all styles inside one massive stylesheet.

Preferred structure:

```
css/
├── variables.css
├── reset.css
├── utilities.css
├── navbar.css
├── hero.css
├── features.css
├── pricing.css
├── footer.css
└── responsive.css
```

---

## Use CSS Variables

Store reusable values in one place.

Example:

```css
:root {
  --primary-color: #0f172a;
  --secondary-color: #64748b;
  --border-radius: 12px;
  --container-width: 1200px;
}
```

Avoid repeating values throughout the project.

---

## Reusable Utility Classes

Create reusable utility classes.

Examples:

```css
.container
.flex
.grid
.hidden
.text-center
.mt-large
.mb-large
```

Avoid duplicating identical CSS.

---

## Mobile-First Responsive Design

Start from mobile layouts first.

Then scale upwards using media queries.

Ensure:

- Mobile
- Tablet
- Laptop
- Desktop

are properly supported.

---

## Avoid Overly Specific Selectors

Prefer:

```css
.hero-title
```

Instead of:

```css
.homepage .hero .container .content h1
```

Keep selectors simple and maintainable.

---

# JavaScript Guidelines

## Separate Logic Into Modules

Never place all JavaScript inside one file.

Example:

```
js/
├── main.js
├── navigation.js
├── forms.js
├── animations.js
├── sliders.js
├── modal.js
└── utilities.js
```

Each file should handle a specific responsibility.

---

## Component Logic Should Stay Together

If a component requires JavaScript behavior, keep its logic isolated.

Example:

```
components/
└── navbar.html

css/
└── navbar.css

js/
└── navbar.js
```

This makes future updates significantly easier.

---

## Avoid Global Variables

Minimize global scope pollution.

Use:

```javascript
const
let
functions
modules
```

Keep logic encapsulated.

---

## Reuse Functions

If logic appears multiple times, create a reusable helper function.

Bad:

Repeated code blocks everywhere.

Good:

```javascript
function toggleMenu() {
  ...
}
```

Reuse wherever needed.

---

# Loading Components

## Load Shared Components Dynamically

For repeated sections such as:

- Navbar
- Footer
- CTA sections
- Announcement bars

Store them separately.

Example:

```
components/navbar.html
components/footer.html
```

Load them into pages via JavaScript.

Benefits:

- Single source of truth
- Faster updates
- Easier maintenance
- Consistent UI

---

## Keep Main Pages Lightweight

Page files should focus on page structure.

Example:

```html
<body>

<div id="navbar"></div>

<main>
  <!-- Page Content -->
</main>

<div id="footer"></div>

</body>
```

Then load shared components through JavaScript.

Avoid duplicating navigation and footer code across every page.

---

# Asset Management

## Organize Assets Properly

Example:

```
assets/
├── images/
├── icons/
├── videos/
├── illustrations/
└── fonts/
```

Avoid dumping all assets into one folder.

---

## Optimize Media

Before deployment:

- Compress images
- Use WebP or AVIF when possible
- Resize oversized assets
- Lazy load non-critical images

---

# Performance

## Load Only What Is Needed

Avoid loading:

- Unused CSS
- Unused JavaScript
- Unused fonts
- Unused libraries

Every file should serve a purpose.

---

## Minimize Third-Party Libraries

Before adding a dependency:

Ask:

- Can this be achieved with vanilla JavaScript?
- Is the dependency worth the added size?
- Is it actively maintained?

Prefer native browser features whenever practical.

---

# Naming Conventions

## CSS Classes

Use descriptive names.

Good:

```css
.hero-title
.pricing-card
.testimonial-item
.feature-grid
```

Bad:

```css
.box1
.item2
.red-text
.temp
```

---

## JavaScript Functions

Use action-oriented names.

Good:

```javascript
toggleMenu()
openModal()
validateForm()
loadTestimonials()
```

Bad:

```javascript
run()
test()
doStuff()
handle()
```

---

# File Size Rules

## Keep Files Manageable

Preferred limits:

- HTML: Under 300–400 lines when possible
- CSS: Under 400–500 lines per file
- JavaScript: Under 300–400 lines per file

If a file becomes large:

- Extract sections
- Extract components
- Extract utilities
- Split responsibilities

---

# AI Coding Rules

When generating code:

- Always use modular architecture.
- Never place all HTML, CSS, and JavaScript in one file.
- Create reusable components for repeated UI patterns.
- Store shared components in separate files.
- Import or load components instead of duplicating code.
- Separate structure, styling, and behavior.
- Keep JavaScript modular and responsibility-focused.
- Follow semantic HTML practices.
- Use CSS variables for reusable design tokens.
- Maintain consistent naming conventions.
- Optimize for readability and future edits.
- Build code that can scale without becoming difficult to maintain.

---

# Final Rule

A future developer should be able to open the project, understand the structure within minutes, locate any section quickly, modify it safely, and extend the website without refactoring the entire codebase.

If a file becomes too large, repetitive, or difficult to navigate, split it into smaller focused modules and load them where needed.