# TASKS

## current
- [ ] Await your browser validation of seed toggle behavior and run-button alignment

## done
- [x] Fix advanced seed section so it is truly collapsed by default and toggles open/closed
- [x] Align Run simulation directly under the simulations block in the left column
- [x] Validate JS syntax and confirm updated UI behavior
- [x] Rework controls into two-column layout with advanced seed disclosure UX
- [x] Enlarge and rescale chart so bars are visually readable at a glance
- [x] Improve chart axis/ticks/labels and responsive behavior for small screens
- [x] Validate JS syntax and provide focused verification checklist
- [x] Improve Simulation Controls UX with recommended default and seed help
- [x] Add post-success auto-scroll to results with reduced-motion handling
- [x] Improve bar chart readability with y-scale labels, top-4 highlighting, and mobile chart scrolling
- [x] Polish controls/status layout and keep keyboard accessibility clean
- [x] Run quick checks and provide validation checklist
- [x] Wire ATL-only better-of MIL/NO simulation behavior in `worker.js`
- [x] Add MIL/NO presence validation and disable simulation when required teams are missing
- [x] Add running-state UX with spinner/progress and clean worker lifecycle
- [x] Add best-of disclaimer/diagram and data update note in UI
- [x] Remove lottery list double-numbering by rendering team names only in `<ol>`
- [x] Add ATL pick distribution bar chart with no external library
- [x] Polish responsive card layout, sticky table header, and monospace numeric columns
- [x] Audit `worker.js` assumptions against `odds_calc.py` and document unavoidable RNG difference

## notes
- [ ] Simulation math unchanged; this pass is UI behavior/layout only
- [ ] Seed panel now respects `hidden` via `.advanced-panel[hidden] { display: none !important; }`
- [ ] Run button and status moved into the left controls column directly below simulations block
- [ ] Ran syntax check: `node --check app.js`
- [ ] Noticed unrelated modified file in worktree: `.github/workflows/update-lottery.yml` (untouched)
