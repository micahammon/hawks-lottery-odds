# TASKS

## current
- [ ] Await your browser validation of new defaults and paste CTA flow

## done
- [x] Set default simulations and recommended default to 500,000
- [x] Remove Read clipboard button and related JS wiring
- [x] Make Use standings call-to-action visually stronger after Parse
- [x] Update manual source label wording after Use standings apply
- [x] Run syntax check and confirm UI behavior
- [x] Replace manual paste parser with strict team-name appearance-order parsing
- [x] Keep validation unchanged (14 teams + MIL + NO)
- [x] Run syntax check and confirm parser no longer drifts from numeric tokens

## notes
- [ ] Worker simulation logic unchanged; this pass updated only UI defaults/messaging
- [ ] `Use standings` now gets highlighted state (`needs-action`) after successful Parse until applied/cleared
- [ ] Ran syntax check: `node --check app.js`
