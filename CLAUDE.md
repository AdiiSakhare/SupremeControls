# CLAUDE.md

## Project Vision

Build a world-class premium corporate website for Supreme Controls.

Supreme Controls specializes in industrial automation, electrical control systems, PLC solutions, industrial control panels, automation consultancy, security systems, smart infrastructure solutions, and turnkey engineering projects.

The website should position Supreme Controls as a modern engineering company trusted by industrial clients, manufacturing facilities, infrastructure projects, and automation-driven businesses.

The final experience should feel comparable to premium enterprise brands rather than traditional engineering company websites.

---

# Documentation References

- `CLAUDE.md` → Design philosophy, UX principles, visual direction, content tone, decision-making rules.
- `docs/project-overview.md` → Business goals, positioning, target audience, project objectives.
- `docs/website-strategy.md` → Sitemap, navigation, page structure, content architecture, CTA strategy.
- `docs/design-system.md` → Colors, typography, spacing, grids, components, motion, responsive behavior.
- `docs/code-guidelines.md` → Folder structure, architecture, HTML/CSS/JS standards, performance and maintainability.
- `/Inspirations/` -> for Ui inspirations (identify using image name).

Priority Order:
CLAUDE.md → project-overview.md → website-strategy.md → design-system.md → code-guidelines.md


# Core Design Philosophy

## Premium First

Every page must feel:

- premium
- spacious
- engineered
- sophisticated
- intentional

Avoid:

- cluttered layouts
- visual noise
- excessive content density
- heavy gradients
- outdated industrial website patterns
- unnecessary decorative elements

Prefer:

- whitespace
- clean grids
- strong typography
- clear hierarchy
- premium imagery
- elegant interactions

---

## Minimalism

Less elements.

More clarity.

Every component must have a purpose.

Remove anything that does not improve:

- understanding
- credibility
- communication
- usability

---

## Content First

The website should communicate:

- engineering expertise
- technical capability
- project execution strength
- reliability
- industrial experience
- long-term trust

Avoid generic marketing language.

Avoid phrases such as:

- best quality
- affordable solutions
- customer satisfaction guaranteed
- industry leading services

Use specific, capability-driven messaging instead.

---

# Brand System

## Primary Brand Color

Orange

#E9631A

Usage:

- buttons
- highlights
- active states
- links
- key statistics
- hover states
- visual accents

Do not overuse orange.

Orange should guide attention rather than dominate the interface.

---

## Background

Pure White

#FFFFFF

The website should remain light mode only.

No dark mode implementation.

---

## Neutral Palette

Use Zinc-based neutral shades.

Examples:

- zinc-50
- zinc-100
- zinc-200
- zinc-300
- zinc-500
- zinc-700
- zinc-900

Maintain strong readability and contrast.

---

# Typography

## Heading Font

Wix Madefor Display

Characteristics:

- confident
- modern
- premium
- industrial

Use large heading scales.

Allow breathing room around headings.

---

## Body Font

Wix Madefor Text

Characteristics:

- readable
- professional
- neutral
- highly legible

Prioritize readability over decoration.

---

# Visual Language

## Design References

Visual inspiration may be taken from:

- Siemens
- Schneider Electric
- ABB
- Honeywell
- Rockwell Automation
- Stripe
- Linear
- Ramp

The result should combine:

- industrial credibility
- enterprise sophistication
- modern web aesthetics

---

## Whitespace Strategy

Use generous spacing throughout the website.

Every section should breathe.

Prefer:

- large margins
- large section spacing
- controlled content width
- visual separation through spacing

Avoid:

- crowded cards
- dense content blocks
- tightly packed layouts

---

# Image Direction

## Image Selection Rules

Images must feel:

- modern
- industrial
- premium
- trustworthy
- technologically advanced

Preferred imagery:

- industrial facilities
- manufacturing environments
- control rooms
- automation systems
- electrical control panels
- industrial machinery
- engineering teams
- technicians
- project execution environments

When people appear:

Prioritize Indian professionals whenever appropriate.

Preferred:

- Indian engineers
- Indian technicians
- Indian project teams
- Indian industrial workforce

Avoid:

- unrealistic AI people
- cliché handshake photos
- outdated factories
- generic corporate stock photography
- low-resolution images

Optional:

Subtle orange accents may naturally appear in equipment, safety gear, lighting, branding elements or environmental details.

---

# Motion Design

Animation should support storytelling.

Animation exists to improve user experience.

Not to attract attention.

Preferred interactions:

- fade reveals
- staggered content appearance
- subtle image movement
- hover transitions
- smooth page scrolling
- section reveal animations
- number counters
- navigation transitions

Recommended duration:

300ms–800ms

Avoid:

- excessive parallax
- floating objects
- rotating elements
- unnecessary motion
- flashy transitions
- distracting effects

Motion should feel elegant and professional.

---

# Microinteractions

Include:

- button hover states
- navigation hover states
- image hover effects
- card hover elevation
- active navigation indicators
- subtle icon transitions

Interactions should feel responsive and polished.

---

# Architecture Rules

Follow the project's code-guidelines.md as the source of truth for architecture.

Always use modular development.

Never place the entire website inside:

- one HTML file
- one CSS file
- one JavaScript file

---

## Recommended Structure

project/

├── index.html

├── pages/

├── components/

├── css/

├── js/

├── assets/

└── data/

---

## Components

All reusable UI should exist as standalone components.

Examples:

- navbar
- footer
- service cards
- capability cards
- product cards
- testimonial cards
- CTA blocks

Each component should maintain separation of:

- structure
- styling
- behavior

Example:

components/navbar.html

css/navbar.css

js/navbar.js

---

## HTML Rules

Use semantic HTML.

Prefer:

- header
- nav
- main
- section
- article
- footer

Avoid excessive nested div structures.

Never use inline CSS.

Never use inline JavaScript.

---

## CSS Rules

Use CSS variables.

Create reusable utility classes.

Maintain scalable architecture.

Separate files by responsibility.

Avoid overly specific selectors.

---

## JavaScript Rules

Keep functionality modular.

Each script should solve a single responsibility.

Avoid global variables whenever possible.

Reuse utility functions.

Avoid unnecessary dependencies.

Prefer vanilla JavaScript whenever practical.

---

# Accessibility

Maintain:

- semantic structure
- keyboard navigation
- visible focus states
- accessible color contrast
- descriptive alt text
- logical heading hierarchy

---

# Performance

Target fast loading speeds.

Requirements:

- optimized assets
- WebP images where possible
- lazy loading
- minimal JavaScript
- optimized animation performance

Avoid unnecessary third-party libraries.

---

# Website Sections

## Home Page

1. Hero Section
2. Company Introduction
3. Core Capabilities
4. Services Overview
5. Product Categories
6. Industries Served
7. Why Supreme Controls
8. Process Overview
9. Featured Projects
10. Testimonials
11. Contact Information
12. Footer

---

# Service Pages

Individual pages for:

- Industrial Automation
- PLC Solutions
- SCADA Solutions
- Automation Consultancy
- Security Solutions
- Smart Infrastructure
- Engineering Services

---

# Product Pages

Individual pages for:

- PCC Panels
- MCC Panels
- PLC Panels
- APFC Panels
- Custom Control Panels

---

# Contact Section Rules

Do not use contact forms.

Display only:

- phone numbers
- email addresses
- office address
- business hours
- WhatsApp contact
- social profiles

Allow click-to-call and click-to-email functionality.

---

# Content Tone

Tone should feel:

- authoritative
- experienced
- technical
- premium
- trustworthy

Avoid:

- hype
- exaggerated claims
- buzzword overload

Communicate confidence through clarity.

---

# Final Benchmark

A visitor should immediately feel:

"Supreme Controls is a highly capable engineering company that delivers industrial automation and electrical control solutions with professionalism, precision and modern expertise."