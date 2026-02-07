# TASKS

## current
- [ ] Await your validation that manual paste ordering no longer drifts from numeric tokens

## done
- [x] Replace manual paste parser with strict team-name appearance-order parsing
- [x] Keep validation unchanged (14 teams + MIL + NO)
- [x] Run syntax check and confirm parser no longer drifts from numeric tokens
- [x] Add manual Tankathon copy/paste override UI in the data section
- [x] Implement robust standings parser with validation and sessionStorage override
- [x] Integrate override as simulation input source with revert-to-GitHub behavior
- [x] Add source label, MIL/NO slot indicator, and highlight MIL/NO in list

## notes
- [ ] Worker simulation logic unchanged; fix is parser-only in `app.js`
- [ ] New parser uses team name `indexOf` ordering from raw pasted content and ignores numeric tokens/structure
- [ ] Ran syntax check: `node --check app.js`
