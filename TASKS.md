# TASKS

## current
- [ ] Await user validation in GitHub Pages and Actions UI

## done
- [x] Verify workflow, pages folder, and JSON fetch path wiring
- [x] Implement GitHub Pages frontend UI and worker simulation in this folder
- [x] Mirror `odds_calc.py` logic for ATL better-of MIL/NOP outcomes and metrics
- [x] Provide workflow verification checklist for Actions run/commit behavior
- [x] Add interactive CLI prompt to accept new standings paste or reuse prior values
- [x] Add CLI option to parse pasted standings text and populate teams_in_order

## notes
- [ ] Added stdin/arg parsing with alias-based team extraction in odds_calc.py
- [ ] Added interactive prompt mode for standings paste in odds_calc.py
- [ ] Prompt terminator is END instead of blank line
- [ ] Added `index.html`, `styles.css`, `app.js`, and `worker.js` for Pages-hosted ATL-only simulation UI
- [ ] Worker mirrors Python lottery logic: weighted sample without replacement for top 4, remaining picks by order, ATL=min(MIL,NOP)
- [ ] JSON fetch path is `./data/lottery.json` with no-cache refresh support and troubleshooting error messaging
- [ ] Ran syntax checks: `node --check app.js` and `node --check worker.js`
