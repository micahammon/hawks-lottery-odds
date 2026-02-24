# hawks-lottery-odds
Monte Carlo simulator for Atlanta Hawks draft odds when ATL receives the more favorable lottery result between Milwaukee and New Orleans. Focuses on combined probabilities (top-4 overlap, pick distribution) that can’t be solved analytically.

# hawks lottery odds (mil/nop best-of)

This tool estimates Atlanta’s draft outcomes when **ATL receives the better of Milwaukee’s (MIL) and New Orleans’ (NOP) lottery results** (i.e., the **more favorable pick** between the two).

Why this exists:
- The combined odds for **#1 overall** are easy to compute by addition (MIL #1 + NOP #1).
- But combined odds for **top-4** are **not** just a sum, because MIL and NOP outcomes overlap (both can be top-4 in the same simulation).
- So the correct top-4 probability (and full pick distribution) is estimated via **Monte Carlo simulation**.

## what it does

- Loads the current projected lottery order (top 14 teams) from `data/lottery.json`
  - This file is automatically updated by a GitHub Action that fetches Tankathon and extracts the top-14 team list.
- Lets you drag/drop the displayed top-14 order in the UI for session-only what-if scenarios
  - Reordering creates a manual session override (same as pasted standings) and changes simulation odds immediately.
- Runs `N` lottery simulations.
- For each simulation:
  - Simulates MIL’s lottery result and NOP’s lottery result (based on standard lottery odds by slot)
  - Assigns ATL the **better** (lower-numbered) of the two picks
  - Tracks ATL outcomes

## outputs (atl only)

- Probability ATL gets pick #1, #2, … (as applicable)
- Probability ATL lands in the **top 4**
- Expected (average) ATL pick position
- Worst-case pick ATL can receive under the current setup

## data refresh

- `data/lottery.json` is updated on a schedule and can also be updated manually:
  - GitHub → Actions → “Update Tankathon lottery order” → Run workflow
- The updater keeps the existing file when the fetched `lottery_top14` and `source` are unchanged, so unchanged runs do not create a new `lottery.json`.

## notes

- This is not a full league-wide lottery simulator. Tankathon already provides that.
- This is specifically for “ATL gets the better of MIL and NOP” style questions where overlap matters.
