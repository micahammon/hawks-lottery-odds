// 200k balances stable percentages with quick browser runtimes on most devices.
const DEFAULT_SIMS = 200_000;
const LARGE_RUN_WARNING_THRESHOLD = 1_000_000;

const refs = {
    statusText: document.getElementById("status-text"),
    statusSpinner: document.getElementById("status-spinner"),
    loadError: document.getElementById("load-error"),
    updatedAt: document.getElementById("updated-at"),
    top14List: document.getElementById("top14-list"),
    teamCheck: document.getElementById("team-check"),
    refreshBtn: document.getElementById("refresh-data-btn"),
    simsInput: document.getElementById("sims-input"),
    simsRecommend: document.getElementById("sims-recommend"),
    simsWarning: document.getElementById("sims-warning"),
    useDefaultBtn: document.getElementById("use-default-btn"),
    toggleAdvancedBtn: document.getElementById("toggle-advanced-btn"),
    advancedSeedPanel: document.getElementById("advanced-seed-panel"),
    seedInput: document.getElementById("seed-input"),
    runBtn: document.getElementById("run-btn"),
    resultsSection: document.getElementById("results"),
    summaryTop4: document.getElementById("summary-top4"),
    summaryExpected: document.getElementById("summary-expected"),
    summaryWorst: document.getElementById("summary-worst"),
    summarySeed: document.getElementById("summary-seed"),
    summarySims: document.getElementById("summary-sims"),
    distributionBody: document.getElementById("distribution-body"),
    pickChart: document.getElementById("pick-chart"),
    chartYLabels: document.getElementById("chart-y-labels"),
    chartScaleNote: document.getElementById("chart-scale-note"),
};

const state = {
    data: null,
    worker: null,
    running: false,
    teamsReady: false,
    missingTeams: [],
    shouldScrollAfterRun: false,
    advancedSeedOpen: false,
};

refs.refreshBtn.addEventListener("click", () => loadData(true));
refs.runBtn.addEventListener("click", runSimulation);
refs.useDefaultBtn.addEventListener("click", applyRecommendedDefault);
refs.simsInput.addEventListener("input", updateSimsFeedback);
refs.toggleAdvancedBtn.addEventListener("click", toggleAdvancedSeed);

initControls();
loadData(false);

function initControls() {
    refs.simsInput.value = String(DEFAULT_SIMS);
    refs.simsRecommend.textContent = `Recommended default: ${DEFAULT_SIMS.toLocaleString()}`;
    setAdvancedSeedOpen(false, false);
    updateSimsFeedback();
}

function applyRecommendedDefault() {
    refs.simsInput.value = String(DEFAULT_SIMS);
    updateSimsFeedback();
    refs.simsInput.focus();
}

function toggleAdvancedSeed() {
    setAdvancedSeedOpen(!state.advancedSeedOpen, true);
}

function setAdvancedSeedOpen(open, focusInput) {
    state.advancedSeedOpen = open;

    if (!open && refs.advancedSeedPanel.contains(document.activeElement)) {
        refs.toggleAdvancedBtn.focus();
    }

    refs.advancedSeedPanel.hidden = !open;
    refs.toggleAdvancedBtn.setAttribute("aria-expanded", String(open));
    refs.toggleAdvancedBtn.textContent = open ? "Hide" : "Show";

    if (open && focusInput) {
        refs.seedInput.focus();
    }
}

function updateSimsFeedback() {
    const value = Number.parseInt(refs.simsInput.value, 10);
    if (Number.isInteger(value) && value > LARGE_RUN_WARNING_THRESHOLD) {
        refs.simsWarning.hidden = false;
        refs.simsWarning.textContent = "Large runs may take longer in-browser. Consider the 200,000 default for faster iteration.";
    } else {
        refs.simsWarning.hidden = true;
        refs.simsWarning.textContent = "";
    }
}

async function loadData(noCache) {
    setLoadError("");
    setStatus("Loading lottery data...", true);

    const cacheBuster = noCache ? `?t=${Date.now()}` : "";
    const url = `./data/lottery.json${cacheBuster}`;

    try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} while fetching ${url}`);
        }

        const json = await response.json();
        validateLotteryData(json);
        state.data = json;

        renderLotteryData(json);
        evaluateTeamPresence(json.lottery_top14);
        if (state.teamsReady) {
            setStatus("Data ready.", false);
        } else {
            setStatus(`Data loaded, but simulation is disabled: ${state.missingTeams.join(", ")} missing.`, false);
        }
    } catch (error) {
        state.data = null;
        state.teamsReady = false;
        state.missingTeams = [];
        renderLotteryData(null);
        renderTeamCheck("", "warn", true);
        setStatus("Unable to load lottery data.", false);
        setLoadError(
            [
                `${error.message}`,
                "Troubleshooting:",
                "- Confirm GitHub Pages is serving this repo root on branch `main`.",
                "- Confirm `data/lottery.json` exists on `main`.",
                "- Confirm the workflow committed changes to `data/lottery.json`.",
            ].join("\n"),
        );
    }

    updateRunAvailability();
}

function validateLotteryData(json) {
    if (!json || typeof json !== "object") {
        throw new Error("Invalid JSON payload.");
    }
    if (!Array.isArray(json.lottery_top14) || json.lottery_top14.length !== 14) {
        throw new Error("Expected `lottery_top14` with exactly 14 teams.");
    }
    if (typeof json.fetched_at_utc !== "string" || !json.fetched_at_utc.trim()) {
        throw new Error("Missing `fetched_at_utc` timestamp.");
    }
}

function renderLotteryData(json) {
    refs.top14List.innerHTML = "";

    if (!json) {
        refs.updatedAt.textContent = "Not available";
        return;
    }

    const timestamp = new Date(json.fetched_at_utc);
    refs.updatedAt.textContent = Number.isNaN(timestamp.getTime())
        ? json.fetched_at_utc
        : timestamp.toLocaleString();

    json.lottery_top14.forEach((team) => {
        const li = document.createElement("li");
        li.textContent = team;
        refs.top14List.appendChild(li);
    });
}

function evaluateTeamPresence(top14) {
    const missing = [];
    if (!containsTeam(top14, ["MIL", "MILWAUKEE", "MILWAUKEEBUCKS"])) {
        missing.push("MIL (Milwaukee)");
    }
    if (!containsTeam(top14, ["NO", "NOP", "NEWORLEANS", "NEWORLEANSPELICANS"])) {
        missing.push("NO/NOP (New Orleans)");
    }

    state.missingTeams = missing;
    state.teamsReady = missing.length === 0;

    if (state.teamsReady) {
        renderTeamCheck("MIL and NO detected in top-14 data. Simulation ready.", "ok", false);
    } else {
        renderTeamCheck(
            `Simulation disabled: missing required team(s): ${missing.join(", ")}.`,
            "warn",
            false,
        );
    }
}

function renderTeamCheck(text, style, hidden) {
    refs.teamCheck.hidden = hidden;
    refs.teamCheck.textContent = text;
    refs.teamCheck.className = "team-check";
    if (!hidden && style) {
        refs.teamCheck.classList.add(style);
    }
}

function runSimulation() {
    if (state.running) {
        return;
    }

    if (!state.data) {
        setStatus("Load lottery data before running.", false);
        return;
    }

    if (!state.teamsReady) {
        setStatus(`Missing required team(s): ${state.missingTeams.join(", ")}.`, false);
        return;
    }

    const nSims = Number.parseInt(refs.simsInput.value, 10);
    if (!Number.isInteger(nSims) || nSims < 1 || nSims > 2_000_000) {
        setStatus("Simulation count must be an integer between 1 and 2,000,000.", false);
        return;
    }

    const seedRaw = refs.seedInput.value.trim();
    let seed = null;
    if (seedRaw) {
        seed = Number.parseInt(seedRaw, 10);
        if (!Number.isInteger(seed) || seed < 0 || seed > 4_294_967_295) {
            setStatus("Seed must be an integer in [0, 4294967295], or blank.", false);
            return;
        }
    }

    state.shouldScrollAfterRun = refs.resultsSection.hidden;
    startWorker();
    setRunning(true);
    setStatus("Running simulation...", true);

    state.worker.postMessage({
        type: "run",
        payload: {
            nSims,
            seed,
            lotteryTop14: state.data.lottery_top14,
        },
    });
}

function startWorker() {
    stopWorker();
    state.worker = new Worker("./worker.js");

    state.worker.addEventListener("message", (event) => {
        const { type, payload } = event.data || {};

        if (type === "progress") {
            setStatus(
                `Running simulation... ${payload.completed.toLocaleString()} / ${payload.total.toLocaleString()}`,
                true,
            );
            return;
        }

        if (type === "result") {
            const shouldScroll = state.shouldScrollAfterRun;
            setRunning(false);
            setStatus("Simulation complete.", false);
            renderResults(payload);
            if (shouldScroll) {
                scrollResultsIntoView();
            }
            return;
        }

        if (type === "error") {
            setRunning(false);
            setStatus(`Simulation failed: ${payload.message}`, false);
        }
    });

    state.worker.addEventListener("error", (event) => {
        setRunning(false);
        setStatus(`Simulation failed: ${event.message}`, false);
    });
}

function stopWorker() {
    if (state.worker) {
        state.worker.terminate();
        state.worker = null;
    }
}

function renderResults(result) {
    refs.resultsSection.hidden = false;
    refs.summaryTop4.textContent = toPercent(result.top4Prob);
    refs.summaryExpected.textContent = result.expectedPick.toFixed(4);
    refs.summaryWorst.textContent = `${result.worstPick}`;
    refs.summarySeed.textContent = `${result.seedUsed}`;
    refs.summarySims.textContent = result.nSims.toLocaleString();

    refs.distributionBody.innerHTML = "";
    for (let pick = 1; pick <= 14; pick += 1) {
        const row = document.createElement("tr");

        const pickCell = document.createElement("td");
        pickCell.textContent = `${pick}`;

        const countCell = document.createElement("td");
        countCell.className = "num-col";
        countCell.textContent = `${result.pickCounts[pick] ?? 0}`;

        const probCell = document.createElement("td");
        probCell.className = "num-col";
        probCell.textContent = toPercent(result.pickProbs[pick] ?? 0);

        row.appendChild(pickCell);
        row.appendChild(countCell);
        row.appendChild(probCell);
        refs.distributionBody.appendChild(row);
    }

    renderChart(result.pickProbs);
}

function renderChart(pickProbs) {
    refs.pickChart.innerHTML = "";

    const values = [];
    for (let pick = 1; pick <= 14; pick += 1) {
        values.push(pickProbs[pick] ?? 0);
    }

    const maxProb = Math.max(...values, 0);
    const scaleMax = Math.max(maxProb / 0.88, 0.02);
    refs.chartScaleNote.textContent = `Chart scale: 0% to ${(scaleMax * 100).toFixed(2)}% (tallest bar uses ~88% height).`;

    renderChartYLabels(scaleMax);

    for (let pick = 1; pick <= 14; pick += 1) {
        const prob = pickProbs[pick] ?? 0;
        const heightPct = scaleMax > 0 ? (prob / scaleMax) * 100 : 0;

        const bar = document.createElement("div");
        bar.className = pick <= 4 ? "bar top4" : "bar";

        const valueLabel = document.createElement("div");
        valueLabel.className = "bar-value";
        valueLabel.textContent = prob > 0.01 ? toPercent(prob) : "";

        const barBody = document.createElement("div");
        barBody.className = "bar-body";

        const fill = document.createElement("div");
        fill.className = "bar-fill";
        fill.style.height = `${Math.max(Math.min(heightPct, 100), 0)}%`;

        const pickLabel = document.createElement("div");
        pickLabel.className = "bar-label";
        pickLabel.textContent = `${pick}`;

        barBody.appendChild(fill);
        bar.appendChild(valueLabel);
        bar.appendChild(barBody);
        bar.appendChild(pickLabel);
        refs.pickChart.appendChild(bar);
    }
}

function renderChartYLabels(scaleMax) {
    refs.chartYLabels.innerHTML = "";
    const tickCount = 5;

    for (let i = tickCount; i >= 0; i -= 1) {
        const tick = document.createElement("div");
        const ratio = i / tickCount;
        tick.textContent = `${(scaleMax * ratio * 100).toFixed(1)}%`;
        refs.chartYLabels.appendChild(tick);
    }
}

function scrollResultsIntoView() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    refs.resultsSection.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
    });
}

function containsTeam(teams, aliases) {
    const aliasSet = new Set(aliases.map((name) => normalize(name)));
    return teams.some((team) => aliasSet.has(normalize(team)));
}

function normalize(value) {
    return String(value || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
}

function toPercent(value) {
    return `${(value * 100).toFixed(4)}%`;
}

function setStatus(text, spinning) {
    refs.statusText.textContent = text;
    refs.statusSpinner.hidden = !spinning;
}

function setLoadError(text) {
    refs.loadError.textContent = text;
    refs.loadError.hidden = !text;
}

function setRunning(running) {
    state.running = running;
    refs.simsInput.disabled = running;
    refs.seedInput.disabled = running;
    refs.refreshBtn.disabled = running;
    refs.useDefaultBtn.disabled = running;
    refs.toggleAdvancedBtn.disabled = running;

    if (!running) {
        stopWorker();
    }

    updateRunAvailability();
}

function updateRunAvailability() {
    refs.runBtn.disabled = state.running || !state.data || !state.teamsReady;
}

