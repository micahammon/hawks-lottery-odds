# hawks-lottery-odds

Monte Carlo simulator for Atlanta Hawks draft odds when ATL receives the more favorable lottery result between Milwaukee and New Orleans. Focuses on combined probabilities (top-4 overlap, pick distribution) that can't be solved analytically.

# hawks lottery odds (mil/nop best-of)

This tool estimates Atlanta's draft outcomes when **ATL receives the better of Milwaukee's (MIL) and New Orleans' (NOP) lottery results**.

Why this exists:
- The combined odds for **#1 overall** are easy to compute by addition when you have the correct per-team lottery weights.
- Combined odds for **top-4** are **not** just a sum, because MIL and NO outcomes overlap.
- Tankathon tie cases change the odds by averaging the tied slots, so the updater stores **tie-adjusted per-team lottery weights** in `data/lottery.json`.
- The app reports ATL **pick #1 probability as an exact analytic value** using those per-team weights.
- The app reports ATL **top-4** as a hybrid: exact **#1** + simulated **#2/#3/#4**.

## what it does

- Loads the current projected lottery order (top 14 teams) from `data/lottery.json`
  - This file is automatically updated by a GitHub Action that fetches Tankathon, extracts the top-14 team list, and stores tie-adjusted lottery weights.
- Lets you drag/drop the displayed top-14 order in the UI for session-only what-if scenarios
  - Reordering creates a manual session override and changes simulation odds immediately.
  - Manual drag/paste overrides still use slot-based odds because the override flow does not include tied-record metadata.
- Runs `N` lottery simulations.
- For each simulation:
  - Simulates MIL's lottery result and NO's lottery result using the active per-team lottery weights
  - Assigns ATL the **better** (lower-numbered) of the two picks
  - Tracks ATL outcomes

## outputs (atl only)

- Probability ATL gets pick #1, #2, ... (as applicable)
- Probability ATL lands in the **top 4**
- Expected (average) ATL pick position
- Worst-case pick ATL can receive under the current setup

## data refresh

- `data/lottery.json` is updated on a schedule and can also be updated manually:
  - GitHub -> Actions -> "Update Tankathon lottery order" -> Run workflow
- The updater keeps the existing file when the fetched `lottery_top14`, `lottery_weights`, and `source` are unchanged.

## notes

- This is not a full league-wide lottery simulator. Tankathon already provides that.
- This is specifically for "ATL gets the better of MIL and NO" style questions where overlap matters.
