const fs = require('fs');
const path = require('path');
const { getAllFiles, readFile, relPath, ensureDir, extractTags, getAttr, hasAttr } = require('../utils');

const PROJECT_ROOT = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '../../');

const TEMP_DIR = path.join(__dirname, '../temp');
const TEMP_FILE = path.join(TEMP_DIR, 'content.json');

// Generic marketing phrases banned by CLAUDE.md
const BANNED_PHRASES = [
  'best quality',
  'affordable solution',
  'customer satisfaction guaranteed',
  'industry leading',
  'industry-leading',
  'world class',
  'world-class services',
  'best in class',
  'one stop solution',
  'one-stop solution',
  'cutting edge',
  'state of the art',
  'second to none',
];

// Placeholder text markers
const PLACEHOLDER_PATTERNS = [
  /\blorem\s+ipsum\b/i,
  /\bTODO\b/,
  /\bFIXME\b/,
  /\bTBD\b/,
  /\bComing Soon\b/i,
  /\bPlaceholder\b/i,
  /\bDummy (text|content|data)\b/i,
  /\bSample (text|content)\b/i,
  /\[PLACEHOLDER\]/i,
  /\[INSERT\b/i,
  /\bXXX\b/,
];

function stripHtmlTags(str) {
  return str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getTextContent(html) {
  // Remove script and style blocks
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
}

async function runContentAgent() {
  const bugs = [];

  const htmlFiles = getAllFiles(PROJECT_ROOT, ['.html']);

  for (const file of htmlFiles) {
    const content = readFile(file);
    if (!content) continue;
    const lines = content.split('\n');
    const rp = relPath(file, PROJECT_ROOT);
    const isComponent = rp.startsWith('components/');
    const cleanContent = getTextContent(content);

    // Meta title check (skip components)
    if (!isComponent) {
      const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
      if (!titleMatch) {
        bugs.push({
          file: rp, line: 1, element: '<title>',
          issue: 'Missing <title> tag — SEO critical',
          severity: 'high',
          suggestion: 'Add a descriptive <title> tag with page-specific content'
        });
      } else if (!titleMatch[1].trim() || titleMatch[1].toLowerCase().includes('document') || titleMatch[1].toLowerCase().includes('untitled')) {
        bugs.push({
          file: rp, line: 1, element: `<title>${titleMatch[1]}</title>`,
          issue: `Generic or empty page title: "${titleMatch[1].trim()}"`,
          severity: 'high',
          suggestion: 'Use a descriptive title: "Page Name | Supreme Controls"'
        });
      }

      // Meta description check
      const metaDescMatch = content.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i)
        || content.match(/<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i);
      if (!metaDescMatch) {
        bugs.push({
          file: rp, line: 1, element: '<meta name="description">',
          issue: 'Missing meta description — SEO critical, also used in social sharing previews',
          severity: 'high',
          suggestion: 'Add <meta name="description" content="..."> with 120–160 char description'
        });
      } else if (!metaDescMatch[1].trim() || metaDescMatch[1].length < 50) {
        bugs.push({
          file: rp, line: 1, element: `meta description: "${metaDescMatch[1].substring(0, 60)}"`,
          issue: `Meta description too short (${metaDescMatch[1].length} chars) — aim for 120–160`,
          severity: 'medium',
          suggestion: 'Write a descriptive, keyword-rich meta description for this page'
        });
      }
    }

    // Placeholder text patterns — check stripped text only (avoid HTML attribute false positives)
    PLACEHOLDER_PATTERNS.forEach(pattern => {
      lines.forEach((line, i) => {
        if (line.trim().startsWith('<!--') || line.trim().startsWith('//')) return;
        const lineText = stripHtmlTags(line);
        if (lineText.trim().length < 2) return; // skip tag-only lines
        if (pattern.test(lineText)) {
          bugs.push({
            file: rp, line: i + 1, element: lineText.trim().substring(0, 80),
            issue: `Placeholder/draft text detected: "${lineText.trim().substring(0, 60)}"`,
            severity: 'high',
            suggestion: 'Replace with real production copy'
          });
        }
      });
    });

    // Banned marketing phrases (from CLAUDE.md)
    const textOnly = stripHtmlTags(cleanContent).toLowerCase();
    BANNED_PHRASES.forEach(phrase => {
      if (textOnly.includes(phrase.toLowerCase())) {
        const lineIdx = lines.findIndex(l => l.toLowerCase().includes(phrase.toLowerCase()));
        bugs.push({
          file: rp,
          line: lineIdx > -1 ? lineIdx + 1 : 1,
          element: phrase,
          issue: `Banned marketing phrase: "${phrase}" — violates CLAUDE.md content tone guidelines`,
          severity: 'medium',
          suggestion: 'Replace with specific, capability-driven messaging'
        });
      }
    });

    // Empty alt attributes on images
    const imgTags = extractTags(content, 'img');
    imgTags.forEach(({ fullTag, attrs, line }) => {
      const alt = getAttr(attrs, 'alt');
      const src = getAttr(attrs, 'src');
      if (alt !== null && alt.trim() === '') {
        // Check if it's likely decorative — if has aria-hidden or role="presentation", skip
        if (!attrs.includes('aria-hidden') && !attrs.includes('role="presentation"')) {
          bugs.push({
            file: rp, line, element: fullTag.substring(0, 100),
            issue: `Empty alt="" on image — screen readers will announce file name instead`,
            severity: 'medium',
            suggestion: `Add descriptive alt text or aria-hidden="true" if decorative. src: ${src || 'unknown'}`,
            crossAgentNote: 'image-agent should also flag this for src audit'
          });
        }
      }
      if (!hasAttr(attrs, 'alt')) {
        bugs.push({
          file: rp, line, element: fullTag.substring(0, 100),
          issue: 'Missing alt attribute on <img>',
          severity: 'high',
          suggestion: `Add alt="descriptive text" or alt="" if decorative. src: ${src || 'missing'}`
        });
      }
    });

    // Repeated text blocks — find duplicate visible text snippets (>30 chars)
    const textChunks = [];
    const headingMatches = cleanContent.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi) || [];
    headingMatches.forEach(h => {
      const text = stripHtmlTags(h).trim();
      if (text.length > 20) textChunks.push(text.toLowerCase());
    });
    const seen = new Set();
    const dupes = new Set();
    textChunks.forEach(t => {
      if (seen.has(t)) dupes.add(t);
      seen.add(t);
    });
    dupes.forEach(dupe => {
      const lineIdx = lines.findIndex(l => l.toLowerCase().includes(dupe));
      bugs.push({
        file: rp,
        line: lineIdx > -1 ? lineIdx + 1 : 1,
        element: dupe.substring(0, 80),
        issue: `Duplicate heading text: "${dupe.substring(0, 60)}"`,
        severity: 'low',
        suggestion: 'Each heading should be unique — differentiate page sections clearly'
      });
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
  console.log(`✅ Content Agent  — ${bugs.length} bugs found (${h} high, ${m} medium, ${l} low, ${inf} info)`);
  return result;
}

module.exports = { runContentAgent };
if (require.main === module) runContentAgent().catch(console.error);
