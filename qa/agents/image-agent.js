const fs = require('fs');
const path = require('path');
const { getAllFiles, readFile, relPath, ensureDir, extractTags, getAttr, hasAttr } = require('../utils');

const PROJECT_ROOT = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '../../');

const TEMP_DIR = path.join(__dirname, '../temp');
const TEMP_FILE = path.join(TEMP_DIR, 'image.json');

// External placeholder / demo image services
const PLACEHOLDER_HOSTS = [
  'picsum.photos',
  'via.placeholder.com',
  'placehold.it',
  'placeimg.com',
  'lorempixel.com',
  'dummyimage.com',
  'fakeimg.pl',
  'placeholder.com',
];

// Generic filenames that suggest placeholder assets
const GENERIC_FILENAME_PATTERN = /\/(?:image\d*|photo\d*|img\d*|test|placeholder|sample|dummy|pic\d*|screenshot\d*|untitled)\.[a-z]{2,5}(?:["'\s]|$)/i;

// Unsplash used as CDN (external dependency — should be owned/licensed assets)
const UNSPLASH_PATTERN = /images\.unsplash\.com|unsplash\.com\/photos/;

async function runImageAgent() {
  const bugs = [];

  const htmlFiles = getAllFiles(PROJECT_ROOT, ['.html']);
  const cssFiles = getAllFiles(PROJECT_ROOT, ['.css']);

  // --- HTML: <img> tag audit ---
  for (const file of htmlFiles) {
    const content = readFile(file);
    if (!content) continue;
    const rp = relPath(file, PROJECT_ROOT);
    const imgTags = extractTags(content, 'img');

    imgTags.forEach(({ fullTag, attrs, line }) => {
      const src = getAttr(attrs, 'src');
      const alt = getAttr(attrs, 'alt');

      // Missing src
      if (!hasAttr(attrs, 'src') || src === null || src.trim() === '') {
        bugs.push({
          file: rp, line, element: fullTag.substring(0, 100),
          issue: 'Missing or empty src attribute — image will not load',
          severity: 'high',
          suggestion: 'Add a valid src path or remove the broken <img> tag'
        });
        return;
      }

      // Missing alt
      if (!hasAttr(attrs, 'alt')) {
        bugs.push({
          file: rp, line, element: fullTag.substring(0, 100),
          issue: `Missing alt attribute on <img src="${src.substring(0, 60)}">`,
          severity: 'high',
          suggestion: 'Add descriptive alt text. Use alt="" only for purely decorative images',
          crossAgentNote: 'content-agent also flags empty alt for text quality review'
        });
      }

      // Placeholder image services
      const isPlaceholder = PLACEHOLDER_HOSTS.some(host => src.includes(host));
      if (isPlaceholder) {
        bugs.push({
          file: rp, line, element: fullTag.substring(0, 100),
          issue: `Placeholder image service URL: "${src.substring(0, 80)}"`,
          severity: 'high',
          suggestion: 'Replace with a real, owned, or licensed image asset'
        });
      }

      // Unsplash CDN images (external dependency for production site)
      if (UNSPLASH_PATTERN.test(src)) {
        bugs.push({
          file: rp, line, element: fullTag.substring(0, 100),
          issue: `External Unsplash CDN image: "${src.substring(0, 80)}" — creates external dependency, may have licensing implications`,
          severity: 'high',
          suggestion: 'Download and host image in assets/images/ or use a licensed stock image',
          crossAgentNote: 'content-agent: verify image relates to surrounding content (industrial/automation context)'
        });
      }

      // Generic filenames
      if (GENERIC_FILENAME_PATTERN.test(src)) {
        bugs.push({
          file: rp, line, element: fullTag.substring(0, 100),
          issue: `Generic image filename: "${src.split('/').pop()}" — suggests placeholder asset`,
          severity: 'low',
          suggestion: 'Use descriptive filenames: e.g. plc-control-panel-main.webp'
        });
      }

      // SVG as <img> instead of inline (optimization note)
      if (src.endsWith('.svg') || src.includes('.svg?')) {
        bugs.push({
          file: rp, line, element: fullTag.substring(0, 100),
          issue: `SVG loaded via <img> src="${src.substring(0, 60)}" — cannot be styled with CSS`,
          severity: 'info',
          suggestion: 'Use inline <svg> or CSS mask-image for styleable SVGs (e.g. logo color changes)'
        });
      }

      // Missing lazy loading (skip hero images — they're above-fold)
      const isHeroImg = /hero|banner|cover/i.test(src) || /hero|banner|above-fold/.test(attrs);
      if (!hasAttr(attrs, 'loading') && !isHeroImg) {
        bugs.push({
          file: rp, line, element: fullTag.substring(0, 100),
          issue: `Missing loading="lazy" on <img src="${src.substring(0, 60)}"> — impacts page load performance`,
          severity: 'medium',
          suggestion: 'Add loading="lazy" to defer off-screen image loading'
        });
      }

      // WebP recommendation for non-WebP images in assets/
      if (src.startsWith('assets/') || src.includes('/assets/')) {
        if (/\.(jpg|jpeg|png)$/i.test(src)) {
          bugs.push({
            file: rp, line, element: fullTag.substring(0, 100),
            issue: `Non-WebP image in assets: "${src.split('/').pop()}" — missing compression optimization`,
            severity: 'info',
            suggestion: 'Convert to .webp for 25–35% smaller file size: use <picture> for fallback'
          });
        }
      }
    });

    // Check for background images in inline styles (HTML)
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      const m = line.match(/style="[^"]*background(?:-image)?\s*:\s*url\(['"]?([^'")\s]+)['"]?\)/);
      if (m) {
        const url = m[1];
        const isPlaceholder = PLACEHOLDER_HOSTS.some(host => url.includes(host));
        if (isPlaceholder || UNSPLASH_PATTERN.test(url)) {
          bugs.push({
            file: rp, line: i + 1, element: line.trim().substring(0, 100),
            issue: `Placeholder background-image in inline style: url(${url.substring(0, 60)})`,
            severity: 'high',
            suggestion: 'Move to CSS file and replace with owned asset'
          });
        }
      }
    });
  }

  // --- CSS: background-image audit ---
  for (const file of cssFiles) {
    const content = readFile(file);
    if (!content) continue;
    const lines = content.split('\n');
    const rp = relPath(file, PROJECT_ROOT);

    lines.forEach((line, i) => {
      if (/^\s*(\/\/|\/\*|\*)/.test(line)) return;

      const urlMatch = line.match(/url\(['"]?([^'")\s]+)['"]?\)/);
      if (!urlMatch) return;
      const url = urlMatch[1];

      // Placeholder services in CSS background-image
      const isPlaceholder = PLACEHOLDER_HOSTS.some(host => url.includes(host));
      if (isPlaceholder) {
        bugs.push({
          file: rp, line: i + 1, element: line.trim(),
          issue: `Placeholder image service in CSS background: url(${url.substring(0, 60)})`,
          severity: 'high',
          suggestion: 'Replace with owned asset in assets/images/'
        });
      }

      if (UNSPLASH_PATTERN.test(url)) {
        bugs.push({
          file: rp, line: i + 1, element: line.trim(),
          issue: `Unsplash CDN used in CSS background: url(${url.substring(0, 60)}) — external dependency`,
          severity: 'medium',
          suggestion: 'Download and host image locally in assets/images/'
        });
      }

      // Non-WebP in CSS
      if (/\.(jpg|jpeg|png)$/i.test(url) && !url.startsWith('http')) {
        bugs.push({
          file: rp, line: i + 1, element: line.trim(),
          issue: `Non-WebP background image: "${url.split('/').pop()}"`,
          severity: 'info',
          suggestion: 'Convert to .webp to reduce load time'
        });
      }
    });
  }

  ensureDir(TEMP_DIR);
  const result = {
    status: 'done',
    checkedAt: new Date().toISOString(),
    bugs
  };
  fs.writeFileSync(TEMP_FILE, JSON.stringify(result, null, 2));

  const h = bugs.filter(b => b.severity === 'high').length;
  const m = bugs.filter(b => b.severity === 'medium').length;
  const l = bugs.filter(b => b.severity === 'low').length;
  const inf = bugs.filter(b => b.severity === 'info').length;
  console.log(`✅ Image Agent    — ${bugs.length} bugs found (${h} high, ${m} medium, ${l} low, ${inf} info)`);
  return result;
}

module.exports = { runImageAgent };
if (require.main === module) runImageAgent().catch(console.error);
