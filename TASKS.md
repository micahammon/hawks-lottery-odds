# TASKS

## current
- [ ] Await user validation in GitHub Pages with live data and long simulation run

## done
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
- [ ] Progress updates throttled in worker using count/time gates (`25000` steps or ~`200ms` with minimum delta)
- [ ] Worker still uses standard combo table for slots 1..14 and top-4 weighted draws without replacement
- [ ] Ran syntax checks: `node --check app.js` and `node --check worker.js`
