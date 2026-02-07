# TASKS

## current
- [ ] Await next request

## done
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
- [ ] `python -m py_compile odds_calc.py` failed due local `__pycache__` permission issue; validated parse via `python -c "import ast..."`
- [ ] Sequential draw now removes winner weights each pick for picks 1-4 in both JS and Python
