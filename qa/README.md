# Supreme Controls — QA System

Static analysis QA system. Runs 4 specialized agents in parallel against the project source files.

## Run

```bash
node qa/run-qa.js
```

Or add to `package.json`:
```json
{ "scripts": { "qa": "node qa/run-qa.js" } }
```

## Agents

| Agent | Checks |
|---|---|
| **ui-agent** | px font sizes, inline styles, missing :focus states, z-index conflicts, hardcoded colors |
| **content-agent** | lorem ipsum, TODO/TBD text, missing meta description/title, empty alt, banned phrases |
| **responsive-agent** | missing viewport meta, fixed widths, touch targets < 44px, missing flex-wrap, overflow-x |
| **image-agent** | placeholder URLs (picsum/unsplash CDN), missing alt, missing lazy loading, SVG as img, non-WebP |

## Output

`qa/qa-report.json` is generated after each run:

```json
{
  "project": "Supreme-controls-main",
  "generatedAt": "...",
  "summary": { "totalBugs": 14, "high": 3, "medium": 7, "low": 3, "info": 1 },
  "agents": {
    "ui": { "status": "done", "checkedAt": "...", "bugs": [...] },
    "content": { ... },
    "responsive": { ... },
    "image": { ... }
  }
}
```

Severity levels: `high` | `medium` | `low` | `info`

Exit code is `1` if any `high` severity bugs are found — useful for CI.

## Notes

- **Read-only** — agents never modify project files
- **Static analysis only** — checks source HTML/CSS, not rendered output
- `qa/qa-report.json` and `qa/temp/` are gitignored
- Requires Node.js (no npm install needed — zero dependencies)
