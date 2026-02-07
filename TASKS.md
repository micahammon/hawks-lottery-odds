# TASKS

## current
- [ ] Await your validation with abbreviation-only pasted standings input

## done
- [x] Extend manual parser to accept abbreviation-only paste lists (e.g., SAC/IND/NO...)
- [x] Keep existing team-name-order parser as fallback for messy Tankathon text
- [x] Run syntax check and confirm no regression in validation flow
- [x] Remove Seed Used from results summary
- [x] DOM ID reconciliation pass and load/apply regression fix

## notes
- [ ] Worker logic unchanged; parser enhancement only in `app.js`
- [ ] Parser now tries abbrev-token mode first, then falls back to full-name order parsing
- [ ] Syntax check passed: `node --check app.js`
