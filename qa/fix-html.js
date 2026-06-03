/**
 * fix-html.js
 * Replaces inline style attributes with utility/semantic class names.
 * Wraps product PNG images in <picture> for WebP readiness (I-1).
 * Read-only safe: only modifies HTML files, never touches CSS/JS.
 */
const fs = require('fs');
const path = require('path');
const { getAllFiles } = require('./utils');

const PROJECT_ROOT = path.resolve(__dirname, '../');

// ── Style string → CSS class mapping ──────────────────────────
const STYLE_MAP = [
  // Simple margin-top
  ['margin-top: var(--space-2);',  'mt-2'],
  ['margin-top: var(--space-4);',  'mt-4'],
  ['margin-top: var(--space-6);',  'mt-6'],
  ['margin-top: var(--space-10);', 'mt-10'],
  ['margin-top: var(--space-16);', 'mt-16'],
  ['margin-top: var(--space-20);', 'mt-20'],

  // Combined styles — must come BEFORE their single-property subsets
  ['margin-top: var(--space-4); margin-bottom: var(--space-10);', 'mt-4 mb-10'],
  ['margin-top: var(--space-5); color: var(--color-zinc-500);',   'mt-5 text-muted'],
  ['margin-top: var(--space-8); align-self: flex-start;',         'mt-8 self-start'],
  ['text-align:center; margin-top: var(--space-12);',             'text-center mt-12'],
  ['margin-top: var(--space-4); max-width: 560px;',               'mt-4 contact-map-container'],
  ['margin-top: var(--space-4); max-width: 640px;',               'mt-4 mw-640'],
  ['margin-top: var(--space-4); font-size: var(--text-xs); color: var(--color-zinc-400); line-height: var(--leading-normal);', 'contact-info-note'],

  // Flex layouts
  ['display: flex; flex-direction: column; gap: var(--space-3);',                                                   'flex-col gap-3'],
  ['display: flex; align-items: flex-start; gap: var(--space-3);',                                                  'flex items-start gap-3'],
  ['display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap: var(--space-6);',        'flex items-end justify-between flex-wrap gap-6'],

  // Contact info detail styles
  ['font-size: var(--text-sm); color: var(--color-zinc-600); line-height: var(--leading-normal);', 'contact-info-link'],
  ['width: 20px; height: 20px; background-color: var(--color-brand-subtle); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;', 'contact-info-icon'],

  // Misc
  ['color: var(--color-brand);', 'text-brand'],
  ['cursor:default;',            'cursor-default'],

  // Must come last to not conflict with combined patterns above
  ['margin-top: var(--space-5);', 'mt-5'],
  ['margin-top: var(--space-4);', 'mt-4'],
];

// Product PNGs that should be wrapped in <picture> for WebP readiness
const PRODUCT_PNGS = [
  'pcc-panels.png',
  'mcc-panels.png',
  'plc-panels.png',
  'apfc-panels.png',
  'vfd-panels.png',
  'servo-panels.png',
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyStyleMapping(content, styleStr, classes) {
  const esc = escapeRegex(styleStr);

  // Case 1: class="..." ... style="STYLE" → append to class, drop style
  content = content.replace(
    new RegExp(`(class="[^"]*")([^>\\n]*?)\\s+style="${esc}"`, 'g'),
    (match, classAttr, between) => {
      const updated = classAttr.replace(/"$/, ` ${classes}"`);
      return `${updated}${between}`;
    }
  );

  // Case 2: style="STYLE" ... class="..." → append to class, drop style
  content = content.replace(
    new RegExp(`\\s+style="${esc}"([^>\\n]*?)(class="[^"]*")`, 'g'),
    (match, between, classAttr) => {
      const updated = classAttr.replace(/"$/, ` ${classes}"`);
      return `${between}${updated}`;
    }
  );

  // Case 3: no class attr — replace style with class
  content = content.replace(
    new RegExp(`\\s+style="${esc}"`, 'g'),
    ` class="${classes}"`
  );

  return content;
}

function wrapProductImagesInPicture(content) {
  for (const png of PRODUCT_PNGS) {
    const webp = png.replace('.png', '.webp');
    // Match <img ... src="...PNG..." ...> that is NOT already inside <picture>
    const imgRegex = new RegExp(
      `(?<!<picture>[\\s\\S]{0,200})(<img\\b[^>]*src="([^"]*${escapeRegex(png)})"[^>]*>)(?![\\s\\S]{0,20}<\\/picture>)`,
      'g'
    );

    content = content.replace(imgRegex, (match, imgTag, srcValue) => {
      // Derive webp path from the actual src
      const webpSrc = srcValue.replace(escapeRegex(png), webp);
      // Add loading="lazy" if not present (and it's not a hero image)
      let finalImg = imgTag;
      if (!finalImg.includes('loading=') && !/hero/i.test(srcValue)) {
        finalImg = finalImg.replace('>', ' loading="lazy">');
      }
      return `<picture>\n              <source srcset="${webpSrc}" type="image/webp">\n              ${finalImg}\n            </picture>`;
    });
  }
  return content;
}

async function main() {
  const htmlFiles = getAllFiles(PROJECT_ROOT, ['.html']);
  let totalStylesReplaced = 0;
  let totalImagesWrapped = 0;

  for (const file of htmlFiles) {
    let content = fs.readFileSync(file, 'utf-8');
    const original = content;

    // Apply all style → class mappings
    for (const [styleStr, classes] of STYLE_MAP) {
      const before = content;
      content = applyStyleMapping(content, styleStr, classes);
      if (content !== before) {
        const count = (before.match(new RegExp(escapeRegex(styleStr), 'g')) || []).length;
        totalStylesReplaced += count;
      }
    }

    // Wrap product PNGs in <picture>
    const beforePicture = content;
    content = wrapProductImagesInPicture(content);
    if (content !== beforePicture) {
      const wrapped = (beforePicture.match(/<img\b[^>]*assets\/images\/products\/[^"]+\.png/g) || []).length;
      totalImagesWrapped += wrapped;
    }

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf-8');
      const rel = path.relative(PROJECT_ROOT, file).replace(/\\/g, '/');
      console.log(`  ✓ ${rel}`);
    }
  }

  console.log(`\nDone.`);
  console.log(`  Inline styles replaced: ${totalStylesReplaced}`);
  console.log(`  Product images wrapped in <picture>: ${totalImagesWrapped}`);
}

main().catch(console.error);
