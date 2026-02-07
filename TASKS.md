# TASKS

## current
- [ ] Await your browser validation that load/apply regression is resolved

## done
- [x] DOM ID reconciliation pass between `index.html` and `app.js`
- [x] Fix null `textContent` crash path by introducing safe `byId(...)` guard + warning fallback
- [x] Restore canonical active standings flow so Use standings updates active data and validation state
- [x] Preserve and display source + MIL/NO slots from active standings
- [x] Add subtle source-box two-state styling (GitHub vs manual override)
- [x] De-emphasize metadata line + source/status presentation polish

## notes
- [ ] Worker simulation logic unchanged
- [ ] Syntax check passed: `node --check app.js`
- [ ] `source-box` now toggles classes: `source-github` / `source-manual`
