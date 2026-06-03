#!/usr/bin/env node
const path = require('path');
const { runUIAgent } = require('./agents/ui-agent');
const { runContentAgent } = require('./agents/content-agent');
const { runResponsiveAgent } = require('./agents/responsive-agent');
const { runImageAgent } = require('./agents/image-agent');
const { mergeReports } = require('./merge-reports');

const PROJECT_ROOT = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '../');

console.log(`\n🔍 Supreme Controls — QA System`);
console.log(`   Project: ${PROJECT_ROOT}`);
console.log(`   Running 4 agents in parallel...\n`);

async function main() {
  const start = Date.now();

  // Inject project root into each agent via process.argv simulation
  // Agents are imported as functions so we pass root directly via module-level override
  process.argv[2] = PROJECT_ROOT;

  let results;
  try {
    results = await Promise.all([
      runUIAgent(),
      runContentAgent(),
      runResponsiveAgent(),
      runImageAgent(),
    ]);
  } catch (err) {
    console.error('\n❌ Agent error:', err.message);
    process.exit(1);
  }

  const [ui, content, responsive, image] = results;

  console.log('\n' + '─'.repeat(56));

  function summary(label, data) {
    const bugs = data.bugs || [];
    const h = bugs.filter(b => b.severity === 'high').length;
    const m = bugs.filter(b => b.severity === 'medium').length;
    const l = bugs.filter(b => b.severity === 'low').length;
    const i = bugs.filter(b => b.severity === 'info').length;
    const counts = [h && `${h} high`, m && `${m} medium`, l && `${l} low`, i && `${i} info`]
      .filter(Boolean).join(', ') || 'none';
    return `${label.padEnd(18)} — ${bugs.length} bugs found (${counts})`;
  }

  console.log(`  ${summary('UI Agent', ui)}`);
  console.log(`  ${summary('Content Agent', content)}`);
  console.log(`  ${summary('Responsive', responsive)}`);
  console.log(`  ${summary('Image Agent', image)}`);
  console.log('─'.repeat(56));

  const report = mergeReports();
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log(`\n  Total: ${report.summary.totalBugs} bugs — ${report.summary.high} high, ${report.summary.medium} medium, ${report.summary.low} low, ${report.summary.info} info`);
  console.log(`  Full report saved → qa/qa-report.json`);
  console.log(`  Completed in ${elapsed}s\n`);

  // Exit with non-zero code if high severity bugs found
  if (report.summary.high > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
