# TASKS

## current
- [ ] Await next request

## done
- [x] Make Current Lottery Data order drag-and-droppable in UI
- [x] Wire reordered lottery order into simulation odds calculations via session override
- [x] Update README.md for drag/drop scenario testing behavior
- [x] Run JS syntax checks for `app.js` and `worker.js`
- [x] Add cache to skip creating a new lottery.json when content is unchanged
- [x] Verify behavior and update docs if behavior/output contract changes
- [x] Verify public HTML uses frontend worker logic (not `odds_calc.py`)
- [x] Replace lottery top-4 sampling with true sequential weighted draws in `worker.js`
- [x] Keep Python parity by applying same sequential draw model in `odds_calc.py`
- [x] Run syntax/compile checks for modified files
- [x] Provide relevant Hawks-pick calculation code snippets
- [x] Locate and point to the math/code that calculates Hawks picks
- [x] Extend manual parser to accept abbreviation-only paste lists (e.g., SAC/IND/NO...)
- [x] Keep existing team-name-order parser as fallback for messy Tankathon text
- [x] Run syntax check and confirm no regression in validation flow
- [x] Remove Seed Used from results summary
- [x] DOM ID reconciliation pass and load/apply regression fix

## notes
- [ ] Public app path is `index.html` -> `app.js` -> `worker.js`
- [ ] `odds_calc.py` is standalone reference/CLI and not imported by browser runtime
- [ ] `odds_calc.py` syntax was previously validated via AST parse due local `__pycache__` permission issue
- [ ] Drag/drop reorders `#top14-list` and persists to existing session override storage
- [ ] Reordered active top-14 is sent to `worker.js` unchanged through existing `getActiveTop14()` flow
- [ ] Ran `node --check app.js` and `node --check worker.js`
