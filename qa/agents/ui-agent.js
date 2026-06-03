const fs = require('fs');
const path = require('path');
const { getAllFiles, readFile, relPath, ensureDir } = require('../utils');

const PROJECT_ROOT = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '../../');

const TEMP_DIR = path.join(__dirname, '../temp');
const TEMP_FILE = path.join(TEMP_DIR, 'ui.json');

async function runUIAgent() {
  const bugs = [];

  const cssFiles = getAllFiles(PROJECT_ROOT, ['.css']);
  const htmlFiles = getAllFiles(PROJECT_ROOT, ['.html']);

  for (const file of cssFiles) {
    const content = readFile(file);
    if (!content) continue;
    const lines = content.split('\n');
    const rp = relPath(file, PROJECT_ROOT);
    const basename = path.basename(file);

    // font-size in px — should be rem
    lines.forEach((line, i) => {
      if (/^\s*(\/\/|\/\*|\*)/.test(line)) return;
      const m = line.match(/font-size\s*:\s*(\d+\.?\d*)px/);
      if (m && parseFloat(m[1]) > 10) {
        bugs.push({
          file: rp,
          line: i + 1,
          element: line.trim(),
          issue: `font-size: ${m[1]}px — should use rem for user scalability`,
          severity: 'medium',
          suggestion: `font-size: ${(parseFloat(m[1]) / 16).toFixed(4).replace(/\.?0+$/, '')}rem`
        });
      }
    });

    // Hardcoded hex colors outside variables.css
    if (!basename.includes('variables')) {
      const hexMatches = content.match(/#[0-9a-fA-F]{3,6}\b/g) || [];
      const filtered = [...new Set(hexMatches)].filter(
        c => !['#fff', '#000', '#ffffff', '#000000'].includes(c.toLowerCase())
      );
      if (filtered.length > 4) {
        bugs.push({
          file: rp,
          line: 1,
          element: filtered.slice(0, 4).join(', '),
          issue: `${filtered.length} hardcoded hex colors — should reference var(--color-*) from variables.css`,
          severity: 'medium',
          suggestion: 'Replace hardcoded hex values with CSS custom properties'
        });
      }
    }

    // Missing :focus/:focus-visible in interactive files
    const isInteractive = /button|navbar|hero|nav/.test(basename);
    if (isInteractive && !content.includes(':focus')) {
      bugs.push({
        file: rp,
        line: 1,
        element: basename,
        issue: 'No :focus or :focus-visible state — keyboard navigation broken',
        severity: 'high',
        suggestion: 'Add :focus-visible styles for all interactive elements (buttons, links, nav items)'
      });
    }

    // z-index duplicates
    const zMap = {};
    lines.forEach((line, i) => {
      const m = line.match(/z-index\s*:\s*(\d+)/);
      if (m) {
        const v = m[1];
        if (!zMap[v]) zMap[v] = [];
        zMap[v].push(i + 1);
      }
    });
    for (const [val, nums] of Object.entries(zMap)) {
      if (nums.length > 2 && parseInt(val) > 0) {
        bugs.push({
          file: rp,
          line: nums[0],
          element: `z-index: ${val}`,
          issue: `z-index: ${val} appears ${nums.length} times in this file — potential stacking conflict`,
          severity: 'low',
          suggestion: 'Use a documented z-index scale (e.g. 10, 20, 30) to avoid collisions'
        });
      }
    }

    // !important overuse
    const importantCount = (content.match(/!important/g) || []).length;
    if (importantCount > 5) {
      bugs.push({
        file: rp,
        line: 1,
        element: 'stylesheet',
        issue: `!important used ${importantCount} times — indicates specificity architecture problems`,
        severity: 'low',
        suggestion: 'Restructure selectors to avoid needing !important overrides'
      });
    }

    // color: or background-color: without var() — in non-variable files
    if (!basename.includes('variables') && !basename.includes('reset')) {
      let rawColorCount = 0;
      lines.forEach((line, i) => {
        if (/^\s*(\/\/|\/\*|\*)/.test(line)) return;
        if (/(color|background)\s*:\s*(#|rgb|hsl)/.test(line) && !line.includes('var(')) {
          rawColorCount++;
        }
      });
      if (rawColorCount > 6) {
        bugs.push({
          file: rp,
          line: 1,
          element: 'stylesheet',
          issue: `${rawColorCount} color/background values not using CSS variables — breaks theming consistency`,
          severity: 'medium',
          suggestion: 'Reference var(--*) tokens for all color values'
        });
      }
    }
  }

  // HTML: inline styles
  for (const file of htmlFiles) {
    const content = readFile(file);
    if (!content) continue;
    const lines = content.split('\n');
    const rp = relPath(file, PROJECT_ROOT);

    lines.forEach((line, i) => {
      if (line.trim().startsWith('<!--')) return;
      // Skip <link>, <script>, <meta> — style= is not CSS there
      if (/^\s*<(link|script|meta|svg)\b/.test(line)) return;
      const m = line.match(/style="([^"]{1,})"/);
      if (m) {
        // Skip CSS custom property assignments (e.g. style="--hero-height: 80vh")
        if (/^--[a-z]/.test(m[1].trim())) return;
        bugs.push({
          file: rp,
          line: i + 1,
          element: line.trim().substring(0, 100),
          issue: `Inline style found — violates CLAUDE.md architecture rule`,
          severity: 'low',
          suggestion: `Move to appropriate CSS file: style="${m[1].substring(0, 60)}"`
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
  console.log(`✅ UI Agent       — ${bugs.length} bugs found (${h} high, ${m} medium, ${l} low, ${inf} info)`);
  return result;
}

module.exports = { runUIAgent };
if (require.main === module) runUIAgent().catch(console.error);
