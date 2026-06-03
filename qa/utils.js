const fs = require('fs');
const path = require('path');

const SKIP_DIRS = new Set(['.git', 'node_modules', 'qa', '.claude', 'Inspirations', 'temp']);

function getAllFiles(dir, exts) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      if (item.isDirectory()) {
        if (!SKIP_DIRS.has(item.name)) {
          results.push(...getAllFiles(path.join(dir, item.name), exts));
        }
      } else if (item.isFile()) {
        if (exts.includes(path.extname(item.name).toLowerCase())) {
          results.push(path.join(dir, item.name));
        }
      }
    }
  } catch (e) {}
  return results;
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    return null;
  }
}

function relPath(filePath, root) {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function extractTags(content, tagName) {
  const tags = [];
  const regex = new RegExp(`<${tagName}\\b([\\s\\S]*?)(?:\\s*/?>)`, 'gi');
  let match;
  while ((match = regex.exec(content)) !== null) {
    const before = content.substring(0, match.index);
    const lineNum = (before.match(/\n/g) || []).length + 1;
    tags.push({ fullTag: match[0], attrs: match[1] || '', line: lineNum });
  }
  return tags;
}

function getAttr(attrs, name) {
  const m = attrs.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'));
  return m ? m[1] : null;
}

function hasAttr(attrs, name) {
  return new RegExp(`\\b${name}\\b`, 'i').test(attrs);
}

module.exports = { getAllFiles, readFile, relPath, ensureDir, extractTags, getAttr, hasAttr };
