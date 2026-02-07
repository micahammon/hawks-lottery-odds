# TASKS

## current
- [ ] Await browser validation of advanced seed disclosure and chart readability improvements

## done
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
- [ ] Simulation math unchanged; only `index.html`, `styles.css`, and `app.js` updated for this request
- [ ] Advanced seed uses real button with `aria-expanded` + `aria-controls`; expands/collapses and focuses input on open
- [ ] Chart now uses scale `maxProb / 0.88` so tallest bar is ~88% of chart height
- [ ] Chart has explicit y-axis ticks, stronger baseline, top-4 highlighting band, and horizontal scroll support on small screens
- [ ] Ran syntax check: `node --check app.js`
