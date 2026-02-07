/*
Parity notes vs `odds_calc.py`:
- Same combo table, weighted-sampling method, top-4 draw mechanics, and remaining-pick assignment.
- Same ATL rule: hawks_pick = min(NO pick, MIL pick).
- Same worst-case definition using standings rank + 4 capped at 14.
- Unavoidable difference: seeded RNG implementation is deterministic but not CPython's `random.Random`,
  so identical seed values are reproducible within JS but not expected to match Python draw-for-draw.
*/

const COMBOS_IN_ORDER = [140, 140, 140, 125, 105, 90, 75, 60, 45, 30, 20, 15, 10, 5];
const PROGRESS_STEP = 25000;
const PROGRESS_MS = 200;

self.addEventListener("message", (event) => {
    const { type, payload } = event.data || {};
    if (type !== "run") {
        return;
    }

    try {
        const result = runSimulation(payload);
        self.postMessage({ type: "result", payload: result });
    } catch (error) {
        self.postMessage({
            type: "error",
            payload: { message: error instanceof Error ? error.message : String(error) },
        });
    }
});

function runSimulation(payload) {
    const nSims = payload?.nSims;
    const lotteryTop14 = payload?.lotteryTop14;
    const seedInput = payload?.seed;

    if (!Number.isInteger(nSims) || nSims < 1 || nSims > 2_000_000) {
        throw new Error("Simulation count must be in [1, 2000000].");
    }
    if (!Array.isArray(lotteryTop14) || lotteryTop14.length !== 14) {
        throw new Error("Expected exactly 14 lottery teams.");
    }

    const teamNames = lotteryTop14.map((name) => String(name || "").trim());
    const milIndex = findTeamIndex(teamNames, ["MIL", "MILWAUKEE", "MILWAUKEEBUCKS"]);
    const noIndex = findTeamIndex(teamNames, ["NO", "NOP", "NEWORLEANS", "NEWORLEANSPELICANS"]);

    const seedUsed = seedInput == null ? makeRandomSeed() : seedInput >>> 0;
    const rng = createRng(seedUsed);

    const pickCounts = new Array(15).fill(0);
    let top4Count = 0;
    let pickSum = 0;

    let lastProgressTime = nowMs();
    let lastProgressCount = 0;

    for (let i = 0; i < nSims; i += 1) {
        const pickByTeam = simulateNbaLotteryOnce(teamNames, COMBOS_IN_ORDER, rng);
        const noPick = pickByTeam[noIndex];
        const milPick = pickByTeam[milIndex];
        const hawksPick = Math.min(noPick, milPick);

        pickCounts[hawksPick] += 1;
        pickSum += hawksPick;
        if (hawksPick <= 4) {
            top4Count += 1;
        }

        const completed = i + 1;
        if (shouldPostProgress(completed, nSims, lastProgressCount, lastProgressTime)) {
            self.postMessage({
                type: "progress",
                payload: {
                    completed,
                    total: nSims,
                },
            });
            lastProgressCount = completed;
            lastProgressTime = nowMs();
        }
    }

    const pickProbs = new Array(15).fill(0);
    for (let pick = 1; pick <= 14; pick += 1) {
        pickProbs[pick] = pickCounts[pick] / nSims;
    }

    return {
        nSims,
        seedUsed,
        pickCounts,
        pickProbs,
        top4Prob: top4Count / nSims,
        expectedPick: pickSum / nSims,
        worstPick: worstPossiblePickBestOfTwoFromOrder(teamNames, noIndex, milIndex),
    };
}

function shouldPostProgress(completed, total, lastCount, lastTime) {
    if (completed === total) {
        return true;
    }

    const byCount = completed - lastCount >= PROGRESS_STEP;
    const byTime = nowMs() - lastTime >= PROGRESS_MS;

    return byCount || (byTime && completed - lastCount >= 5000);
}

function simulateNbaLotteryOnce(teamsInOrder, combosInOrder, rng) {
    if (teamsInOrder.length !== 14 || combosInOrder.length !== 14) {
        throw new Error("Lottery simulation expects 14 teams and 14 combo weights.");
    }
    const comboSum = combosInOrder.reduce((sum, value) => sum + value, 0);
    if (comboSum !== 1000) {
        throw new Error("Combo counts must sum to 1000.");
    }

    const teamIndices = teamsInOrder.map((_, idx) => idx);
    const winners = weightedSampleWithoutReplacement(teamIndices, combosInOrder, 4, rng);
    const isWinner = new Array(14).fill(false);
    for (const idx of winners) {
        isWinner[idx] = true;
    }

    const pickByTeam = new Array(14).fill(0);
    for (let i = 0; i < winners.length; i += 1) {
        pickByTeam[winners[i]] = i + 1;
    }

    let nextPick = 5;
    for (let i = 0; i < 14; i += 1) {
        if (!isWinner[i]) {
            pickByTeam[i] = nextPick;
            nextPick += 1;
        }
    }

    return pickByTeam;
}

function weightedSampleWithoutReplacement(items, weights, k, rng) {
    const keys = [];
    for (let i = 0; i < items.length; i += 1) {
        const w = weights[i];
        if (w <= 0) {
            continue;
        }
        let u = rng();
        while (u === 0) {
            u = rng();
        }
        const key = Math.pow(u, 1 / w);
        keys.push({ key, item: items[i] });
    }
    keys.sort((a, b) => b.key - a.key);
    return keys.slice(0, k).map((entry) => entry.item);
}

function worstPossiblePickBestOfTwoFromOrder(teamsInOrder, teamAIdx, teamBIdx) {
    const lotteryTeams = teamsInOrder.length;
    const lotteryDraws = 4;
    const rankA = teamAIdx + 1;
    const rankB = teamBIdx + 1;

    const worstA = Math.min(lotteryTeams, rankA + lotteryDraws);
    const worstB = Math.min(lotteryTeams, rankB + lotteryDraws);
    return Math.min(worstA, worstB);
}

function findTeamIndex(teams, aliases) {
    const aliasSet = new Set(aliases.map((v) => normalize(v)));
    const idx = teams.findIndex((team) => aliasSet.has(normalize(team)));
    if (idx === -1) {
        throw new Error(`Missing required team in top-14 data: ${aliases.join("/")}`);
    }
    return idx;
}

function normalize(value) {
    return String(value || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
}

function createRng(seed) {
    let state = seed >>> 0;
    if (state === 0) {
        state = 0x9e3779b9;
    }
    return function rng() {
        state ^= state << 13;
        state >>>= 0;
        state ^= state >> 17;
        state >>>= 0;
        state ^= state << 5;
        state >>>= 0;
        return state / 4294967296;
    };
}

function makeRandomSeed() {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        const arr = new Uint32Array(1);
        crypto.getRandomValues(arr);
        return arr[0];
    }
    return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}

function nowMs() {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
        return performance.now();
    }
    return Date.now();
}
