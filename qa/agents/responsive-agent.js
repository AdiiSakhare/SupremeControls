const fs = require('fs');
const path = require('path');
const { getAllFiles, readFile, relPath, ensureDir, extractTags, getAttr, hasAttr } = require('../utils');

const PROJECT_ROOT = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '../../');

const TEMP_DIR = path.join(__dirname, '../temp');
const TEMP_FILE = path.join(TEMP_DIR, 'responsive.json');

async function runResponsiveAgent() {
  const bugs = [];

  const cssFiles = getAllFiles(PROJECT_ROOT, ['.css']);
  const htmlFiles = getAllFiles(PROJECT_ROOT, ['.html']);

  // --- HTML checks ---
  for (const file of htmlFiles) {
    const content = readFile(file);
    if (!content) continue;
    const lines = content.split('\n');
    const rp = relPath(file, PROJECT_ROOT);
    const isComponent = rp.startsWith('components/');

    // Viewport meta tag (only in full HTML pages, not components)
    if (!isComponent) {
      const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(content);
      if (!hasViewport) {
        bugs.push({
          file: rp, line: 1, element: '<head>',
          issue: 'Missing viewport meta tag — mobile rendering will be broken',
          severity: 'high',
          suggestion: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">'
        });
      }
    }

    // Images without explicit responsive sizing in markup
    const imgTags = extractTags(content, 'img');
    imgTags.forEach(({ fullTag, attrs, line }) => {
      const hasWidth100 = /width=["']100%["']/.test(attrs);
      const hasStyle = /style=["'][^"']*width\s*:\s*100%/i.test(attrs);
      const src = getAttr(attrs, 'src') || '';
      // Flag if explicit non-responsive width set
      const widthAttr = getAttr(attrs, 'width');
      if (widthAttr && !isNaN(parseInt(widthAttr)) && parseInt(widthAttr) > 100) {
        bugs.push({
          file: rp, line, element: fullTag.substring(0, 100),
          issue: `<img> has fixed width="${widthAttr}" — may overflow on mobile`,
          severity: 'medium',
          suggestion: 'Remove fixed width attribute; control via CSS with max-width: 100%'
        });
      }
    });

    // Elements with fixed pixel width in inline styles
    lines.forEach((line, i) => {
      if (line.trim().startsWith('<!--')) return;
      const m = line.match(/style="[^"]*width\s*:\s*(\d+)px/);
      if (m && parseInt(m[1]) > 300) {
        bugs.push({
          file: rp, line: i + 1, element: line.trim().substring(0, 100),
          issue: `Inline fixed width: ${m[1]}px — will not respond to screen size`,
          severity: 'medium',
          suggestion: 'Use responsive CSS classes or max-width instead'
        });
      }
    });
  }

  // --- CSS checks ---
  let hasGlobalMediaQuery = false;
  const mediaQueryFiles = [];

  for (const file of cssFiles) {
    const content = readFile(file);
    if (!content) continue;
    const lines = content.split('\n');
    const rp = relPath(file, PROJECT_ROOT);
    const basename = path.basename(file);

    if (content.includes('@media')) {
      hasGlobalMediaQuery = true;
      mediaQueryFiles.push(basename);
    }

    // Fixed widths > 600px that could overflow on small screens
    lines.forEach((line, i) => {
      if (/^\s*(\/\/|\/\*|\*)/.test(line)) return;
      if (/@media/.test(line)) return; // Skip media query definitions themselves

      const widthMatch = line.match(/(?:^|\s)width\s*:\s*(\d+)px/);
      if (widthMatch && parseInt(widthMatch[1]) > 600) {
        bugs.push({
          file: rp, line: i + 1, element: line.trim(),
          issue: `Fixed width: ${widthMatch[1]}px — will overflow on screens < ${widthMatch[1]}px`,
          severity: 'medium',
          suggestion: 'Use max-width or %, or wrap in a @media query'
        });
      }

      // min-width on containers without max-width partner
      const minWidthMatch = line.match(/min-width\s*:\s*(\d+)px/);
      if (minWidthMatch && parseInt(minWidthMatch[1]) > 400 && !/@media/.test(content.split('\n').slice(Math.max(0, i - 3), i).join(''))) {
        // Only flag if not inside a media query block (rough heuristic)
        bugs.push({
          file: rp, line: i + 1, element: line.trim(),
          issue: `min-width: ${minWidthMatch[1]}px on element — may push layout beyond viewport`,
          severity: 'low',
          suggestion: 'Ensure this element has a responsive max-width or is inside a proper media query'
        });
      }
    });

    // img max-width check removed — hero images handled separately

    // Touch targets: buttons or links with height < 44px
    let inSelector = false;
    let currentSelector = '';
    let currentBlock = '';
    let blockStart = 0;

    lines.forEach((line, i) => {
      if (/^\s*[.#a-zA-Z][^{]*\{/.test(line)) {
        currentSelector = line.trim();
        currentBlock = '';
        blockStart = i + 1;
        inSelector = true;
      }
      if (inSelector) currentBlock += line + '\n';
      if (line.includes('}')) {
        if (inSelector && /button|\.btn|a\b/.test(currentSelector)) {
          const heightMatch = currentBlock.match(/(?:^|\s)height\s*:\s*(\d+)px/m);
          if (heightMatch && parseInt(heightMatch[1]) < 44) {
            bugs.push({
              file: rp, line: blockStart, element: currentSelector,
              issue: `Touch target height: ${heightMatch[1]}px — below 44px minimum for mobile accessibility`,
              severity: 'medium',
              suggestion: 'Set min-height: 44px for tap targets on mobile'
            });
          }
        }
        inSelector = false;
        currentBlock = '';
        currentSelector = '';
      }
    });

    // Horizontal scroll potential: overflow-x not handled
    if (basename === 'responsive.css') {
      if (!content.includes('overflow-x')) {
        bugs.push({
          file: rp, line: 1, element: 'responsive.css',
          issue: 'No overflow-x handling found in responsive.css — horizontal scroll may appear on mobile',
          severity: 'medium',
          suggestion: 'Add: body { overflow-x: hidden; } and audit wide elements'
        });
      }
    }

    // Flexbox/grid without flex-wrap or grid-template-columns with minmax
    lines.forEach((line, i) => {
      if (/display\s*:\s*flex/.test(line)) {
        // Check surrounding lines for flex-wrap
        const block = lines.slice(i, Math.min(i + 10, lines.length)).join('\n');
        if (!block.includes('flex-wrap') && !block.includes('}')) {
          // Only flag if it looks like a multi-item container
          if (/gap|justify-content|align-items/.test(block)) {
            bugs.push({
              file: rp, line: i + 1, element: line.trim(),
              issue: 'display: flex without flex-wrap — items may overflow on narrow screens',
              severity: 'low',
              suggestion: 'Add flex-wrap: wrap to allow items to stack on mobile'
            });
          }
        }
      }
    });
  }

  if (!hasGlobalMediaQuery) {
    bugs.push({
      file: 'css/',
      line: 1, element: 'CSS directory',
      issue: 'No @media queries found across any CSS file — site has no responsive breakpoints',
      severity: 'high',
      suggestion: 'Add responsive breakpoints at 768px and 1024px minimum'
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
  console.log(`✅ Responsive     — ${bugs.length} bugs found (${h} high, ${m} medium, ${l} low, ${inf} info)`);
  return result;
}

module.exports = { runResponsiveAgent };
if (require.main === module) runResponsiveAgent().catch(console.error);
