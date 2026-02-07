# TASKS

## current
- [ ] Await user validation in-browser for controls UX and chart readability

## done
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
- [ ] Kept GitHub Pages paths as `./data/lottery.json` and `./worker.js`
- [ ] Recommended default is `200000`; warning shown for runs above `1000000`
- [ ] Seed help uses accessible `<details>` so it works on click/tap (mobile) and desktop
- [ ] Auto-scroll triggers only after successful run and only when results were previously hidden
- [ ] Chart now uses padded max scale, y-axis labels, optional value labels (>1%), and top-4 visual highlighting
- [ ] Ran syntax check: `node --check app.js`
