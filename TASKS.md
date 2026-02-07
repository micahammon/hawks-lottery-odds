# TASKS

## current
- [ ] Await your validation of manual paste parsing and override/revert behavior in browser

## done
- [x] Add manual Tankathon copy/paste override UI in the data section
- [x] Implement robust standings parser with validation and sessionStorage override
- [x] Integrate override as simulation input source with revert-to-GitHub behavior
- [x] Add source label, MIL/NO slot indicator, and highlight MIL/NO in list
- [x] Run syntax checks and provide validation checklist
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
- [ ] Worker simulation logic unchanged; only input source selection/UI was expanded
- [ ] Active standings source order: manual override (if present) else GitHub JSON
- [ ] Manual override persisted in `sessionStorage` key `manualTop14Override`
- [ ] Ran syntax check: `node --check app.js`
