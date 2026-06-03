const fs = require('fs');
const path = require('path');

const QA_DIR = __dirname;
const TEMP_DIR = path.join(QA_DIR, 'temp');
const OUTPUT_FILE = path.join(QA_DIR, 'qa-report.json');

const AGENT_KEYS = [
  { key: 'ui', file: 'ui.json', label: 'UI Agent' },
  { key: 'content', file: 'content.json', label: 'Content Agent' },
  { key: 'responsive', file: 'responsive.json', label: 'Responsive Agent' },
  { key: 'image', file: 'image.json', label: 'Image Agent' },
];

function mergeReports() {
  const agents = {};
  let totalBugs = 0;
  let high = 0, medium = 0, low = 0, info = 0;

  for (const { key, file, label } of AGENT_KEYS) {
    const tempPath = path.join(TEMP_DIR, file);
    if (!fs.existsSync(tempPath)) {
      console.warn(`  ⚠ ${label} temp file not found: ${tempPath}`);
      agents[key] = { status: 'missing', checkedAt: null, bugs: [] };
      continue;
    }

    try {
      const data = JSON.parse(fs.readFileSync(tempPath, 'utf-8'));
      agents[key] = data;
      const bugs = data.bugs || [];
      totalBugs += bugs.length;
      high += bugs.filter(b => b.severity === 'high').length;
      medium += bugs.filter(b => b.severity === 'medium').length;
      low += bugs.filter(b => b.severity === 'low').length;
      info += bugs.filter(b => b.severity === 'info').length;
    } catch (e) {
      console.warn(`  ⚠ Failed to parse ${label} report: ${e.message}`);
      agents[key] = { status: 'error', checkedAt: null, bugs: [] };
    }
  }

  // Detect project name from directory name
  const projectName = path.basename(path.resolve(QA_DIR, '..'));

  const report = {
    project: projectName,
    generatedAt: new Date().toISOString(),
    summary: { totalBugs, high, medium, low, info },
    agents,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));

  // Cleanup temp files
  for (const { file } of AGENT_KEYS) {
    const tempPath = path.join(TEMP_DIR, file);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }

  return report;
}

module.exports = { mergeReports };
if (require.main === module) {
  const r = mergeReports();
  console.log(`\nReport saved → qa/qa-report.json`);
  console.log(`Total: ${r.summary.totalBugs} bugs (${r.summary.high} high, ${r.summary.medium} medium, ${r.summary.low} low, ${r.summary.info} info)`);
}
