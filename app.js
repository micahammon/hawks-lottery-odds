// 200k balances stable percentages with quick browser runtimes on most devices.
const DEFAULT_SIMS = 200_000;
const LARGE_RUN_WARNING_THRESHOLD = 1_000_000;
const OVERRIDE_STORAGE_KEY = "manualTop14Override";

const TEAM_ALIAS_ENTRIES = [
    { team: "ATL", aliases: ["ATL", "ATLANTA", "HAWKS"] },
    { team: "BOS", aliases: ["BOS", "BOSTON", "CELTICS"] },
    { team: "BKN", aliases: ["BKN", "BROOKLYN", "NETS"] },
    { team: "CHA", aliases: ["CHA", "CHARLOTTE", "HORNETS"] },
    { team: "CHI", aliases: ["CHI", "CHICAGO", "BULLS"] },
    { team: "CLE", aliases: ["CLE", "CLEVELAND", "CAVALIERS"] },
    { team: "DAL", aliases: ["DAL", "DALLAS", "MAVERICKS"] },
    { team: "DEN", aliases: ["DEN", "DENVER", "NUGGETS"] },
    { team: "DET", aliases: ["DET", "DETROIT", "PISTONS"] },
    { team: "GSW", aliases: ["GSW", "GS", "GOLDEN STATE", "WARRIORS"] },
    { team: "HOU", aliases: ["HOU", "HOUSTON", "ROCKETS"] },
    { team: "IND", aliases: ["IND", "INDIANA", "PACERS"] },
    { team: "LAC", aliases: ["LAC", "CLIPPERS", "LA CLIPPERS", "LOS ANGELES CLIPPERS"] },
    { team: "LAL", aliases: ["LAL", "LAKERS", "LA LAKERS", "LOS ANGELES LAKERS"] },
    { team: "MEM", aliases: ["MEM", "MEMPHIS", "GRIZZLIES"] },
    { team: "MIA", aliases: ["MIA", "MIAMI", "HEAT"] },
    { team: "MIL", aliases: ["MIL", "MILWAUKEE", "BUCKS"] },
    { team: "MIN", aliases: ["MIN", "MINNESOTA", "TIMBERWOLVES", "T WOLVES"] },
    { team: "NO", aliases: ["NO", "NOP", "NEW ORLEANS", "PELICANS"] },
    { team: "NY", aliases: ["NY", "NYK", "NEW YORK", "KNICKS"] },
    { team: "OKC", aliases: ["OKC", "OKLAHOMA CITY", "THUNDER"] },
    { team: "ORL", aliases: ["ORL", "ORLANDO", "MAGIC"] },
    { team: "PHI", aliases: ["PHI", "PHILADELPHIA", "76ERS", "SIXERS"] },
    { team: "PHX", aliases: ["PHX", "PHO", "PHOENIX", "SUNS"] },
    { team: "POR", aliases: ["POR", "PORTLAND", "TRAIL BLAZERS", "BLAZERS"] },
    { team: "SAC", aliases: ["SAC", "SACRAMENTO", "KINGS"] },
    { team: "SA", aliases: ["SA", "SAS", "SAN ANTONIO", "SPURS"] },
    { team: "TOR", aliases: ["TOR", "TORONTO", "RAPTORS"] },
    { team: "UTA", aliases: ["UTA", "UTAH", "JAZZ"] },
    { team: "WAS", aliases: ["WAS", "WASHINGTON", "WIZARDS"] },
];

const ALIAS_MATCHERS = buildAliasMatchers(TEAM_ALIAS_ENTRIES);

const refs = {
    statusText: document.getElementById("status-text"),
    statusSpinner: document.getElementById("status-spinner"),
    loadError: document.getElementById("load-error"),
    updatedAt: document.getElementById("updated-at"),
    sourceLabel: document.getElementById("source-label"),
    slotIndicator: document.getElementById("slot-indicator"),
    top14List: document.getElementById("top14-list"),
    teamCheck: document.getElementById("team-check"),
    refreshBtn: document.getElementById("refresh-data-btn"),
    togglePasteBtn: document.getElementById("toggle-paste-btn"),
    pastePanel: document.getElementById("paste-panel"),
    pasteTextarea: document.getElementById("paste-textarea"),
    parseStandingsBtn: document.getElementById("parse-standings-btn"),
    useStandingsBtn: document.getElementById("use-standings-btn"),
    readClipboardBtn: document.getElementById("read-clipboard-btn"),
    clearPasteBtn: document.getElementById("clear-paste-btn"),
    pasteStatus: document.getElementById("paste-status"),
    revertOverrideBtn: document.getElementById("revert-override-btn"),
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
    githubData: null,
    overrideTop14: null,
    parsedCandidate: null,
    worker: null,
    running: false,
    teamsReady: false,
    missingTeams: [],
    shouldScrollAfterRun: false,
    advancedSeedOpen: false,
};

refs.refreshBtn.addEventListener("click", () => loadData(true));
refs.togglePasteBtn.addEventListener("click", togglePastePanel);
refs.parseStandingsBtn.addEventListener("click", parseManualStandings);
refs.useStandingsBtn.addEventListener("click", applyParsedStandings);
refs.clearPasteBtn.addEventListener("click", clearPastePanel);
refs.readClipboardBtn.addEventListener("click", readClipboardIntoTextarea);
refs.revertOverrideBtn.addEventListener("click", revertOverride);
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
    setPastePanelOpen(false);
    updateSimsFeedback();
}

function getActiveTop14() {
    if (Array.isArray(state.overrideTop14) && state.overrideTop14.length === 14) {
        return state.overrideTop14;
    }
    return state.githubData?.lottery_top14 ?? null;
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
        state.githubData = json;

        restoreOverrideFromSession();
        refreshSourceState();
        setStatus("Data ready.", false);
    } catch (error) {
        state.githubData = null;
        state.overrideTop14 = null;
        refreshSourceState();
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

function restoreOverrideFromSession() {
    try {
        const raw = sessionStorage.getItem(OVERRIDE_STORAGE_KEY);
        if (!raw) {
            state.overrideTop14 = null;
            return;
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length !== 14) {
            state.overrideTop14 = null;
            return;
        }
        const normalized = parsed.map((value) => normalizeTeamAbbrev(String(value)));
        const unique = new Set(normalized);
        if (unique.size !== 14) {
            state.overrideTop14 = null;
            return;
        }
        state.overrideTop14 = normalized;
    } catch {
        state.overrideTop14 = null;
    }
}

function persistOverride(top14) {
    sessionStorage.setItem(OVERRIDE_STORAGE_KEY, JSON.stringify(top14));
}

function clearOverrideStorage() {
    sessionStorage.removeItem(OVERRIDE_STORAGE_KEY);
}

function refreshSourceState() {
    const activeTop14 = getActiveTop14();

    if (state.githubData?.fetched_at_utc) {
        const timestamp = new Date(state.githubData.fetched_at_utc);
        refs.updatedAt.textContent = Number.isNaN(timestamp.getTime())
            ? state.githubData.fetched_at_utc
            : timestamp.toLocaleString();
    } else {
        refs.updatedAt.textContent = "Not available";
    }

    renderTop14(activeTop14);

    if (state.overrideTop14) {
        refs.sourceLabel.textContent = "Source: manual paste (not committed)";
        refs.revertOverrideBtn.hidden = false;
    } else {
        refs.sourceLabel.textContent = "Source: GitHub data";
        refs.revertOverrideBtn.hidden = true;
    }

    evaluateTeamPresence(activeTop14 || []);
}

function renderTop14(top14) {
    refs.top14List.innerHTML = "";

    if (!Array.isArray(top14)) {
        return;
    }

    const milSlot = top14.indexOf("MIL") + 1;
    const noSlot = top14.indexOf("NO") + 1;
    refs.slotIndicator.textContent = `MIL slot: ${milSlot || "N/A"} | NO slot: ${noSlot || "N/A"}`;

    top14.forEach((team) => {
        const li = document.createElement("li");
        li.textContent = team;
        if (team === "MIL" || team === "NO") {
            li.classList.add("mil-no");
        }
        refs.top14List.appendChild(li);
    });
}

function evaluateTeamPresence(top14) {
    const missing = [];
    if (!Array.isArray(top14) || top14.length !== 14) {
        missing.push("14 teams");
    }
    if (!top14.includes("MIL")) {
        missing.push("MIL (Milwaukee)");
    }
    if (!top14.includes("NO")) {
        missing.push("NO (New Orleans)");
    }

    state.missingTeams = missing;
    state.teamsReady = missing.length === 0;

    if (state.teamsReady) {
        renderTeamCheck("MIL and NO detected in active standings. Simulation ready.", "ok", false);
    } else {
        renderTeamCheck(
            `Simulation disabled: missing required value(s): ${missing.join(", ")}.`,
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

function togglePastePanel() {
    setPastePanelOpen(refs.pastePanel.hidden);
}

function setPastePanelOpen(open) {
    refs.pastePanel.hidden = !open;
    refs.togglePasteBtn.textContent = open ? "Hide paste" : "Paste standings";
}

function clearPastePanel() {
    refs.pasteTextarea.value = "";
    state.parsedCandidate = null;
    refs.useStandingsBtn.disabled = true;
    setPasteStatus("", "");
    setPastePanelOpen(false);
}

async function readClipboardIntoTextarea() {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
        setPasteStatus("Clipboard read is not available in this browser. Paste manually in the textarea.", "error");
        return;
    }

    try {
        const text = await navigator.clipboard.readText();
        refs.pasteTextarea.value = text;
        setPasteStatus("Clipboard text loaded. Click Parse.", "ok");
    } catch {
        setPasteStatus("Clipboard permission blocked. Paste manually in the textarea.", "error");
    }
}

function parseManualStandings() {
    const raw = refs.pasteTextarea.value;
    if (!raw.trim()) {
        setPasteStatus("Paste standings text first.", "error");
        state.parsedCandidate = null;
        refs.useStandingsBtn.disabled = true;
        return;
    }

    const parsed = extractTop14FromPaste(raw);
    if (!parsed.ok) {
        setPasteStatus(parsed.error, "error");
        state.parsedCandidate = null;
        refs.useStandingsBtn.disabled = true;
        return;
    }

    const top14 = parsed.top14;
    if (!top14.includes("MIL") || !top14.includes("NO")) {
        setPasteStatus("Parsed standings must include both MIL and NO for ATL best-of logic.", "error");
        state.parsedCandidate = null;
        refs.useStandingsBtn.disabled = true;
        return;
    }

    state.parsedCandidate = top14;
    refs.useStandingsBtn.disabled = false;
    setPasteStatus(`Parsed 14 teams: ${top14.join(", ")}`, "ok");
}

function applyParsedStandings() {
    if (!Array.isArray(state.parsedCandidate) || state.parsedCandidate.length !== 14) {
        setPasteStatus("Parse valid standings before applying.", "error");
        return;
    }

    state.overrideTop14 = [...state.parsedCandidate];
    persistOverride(state.overrideTop14);
    refreshSourceState();
    updateRunAvailability();
    setPasteStatus("Manual standings applied for this session.", "ok");
}

function revertOverride() {
    state.overrideTop14 = null;
    clearOverrideStorage();
    refreshSourceState();
    updateRunAvailability();
    setPasteStatus("Reverted to GitHub data.", "ok");
}

function setPasteStatus(text, kind) {
    refs.pasteStatus.hidden = !text;
    refs.pasteStatus.textContent = text;
    refs.pasteStatus.className = "paste-status";
    if (kind) {
        refs.pasteStatus.classList.add(kind);
    }
}

function runSimulation() {
    if (state.running) {
        return;
    }

    const activeTop14 = getActiveTop14();
    if (!Array.isArray(activeTop14) || activeTop14.length !== 14) {
        setStatus("Load or apply standings before running.", false);
        return;
    }

    if (!state.teamsReady) {
        setStatus(`Missing required value(s): ${state.missingTeams.join(", ")}.`, false);
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
            lotteryTop14: activeTop14,
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

function buildAliasMatchers(entries) {
    const out = [];
    for (const entry of entries) {
        for (const alias of entry.aliases) {
            const normalized = normalizeForMatching(alias);
            const escaped = escapeRegex(normalized).replace(/\s+/g, "\\s+");
            out.push({
                team: entry.team,
                regex: new RegExp(`\\b${escaped}\\b`, "g"),
                len: normalized.length,
            });
        }
    }
    out.sort((a, b) => b.len - a.len);
    return out;
}

function extractTop14FromPaste(rawText) {
    const text = normalizeForMatching(rawText);
    const matches = [];

    for (const matcher of ALIAS_MATCHERS) {
        matcher.regex.lastIndex = 0;
        let found;
        while ((found = matcher.regex.exec(text)) !== null) {
            matches.push({ index: found.index, team: matcher.team, len: matcher.len });
        }
    }

    matches.sort((a, b) => (a.index - b.index) || (b.len - a.len));

    const top14 = [];
    const seen = new Set();
    for (const match of matches) {
        if (seen.has(match.team)) {
            continue;
        }
        seen.add(match.team);
        top14.push(match.team);
        if (top14.length === 14) {
            break;
        }
    }

    if (top14.length !== 14) {
        return {
            ok: false,
            error: `Could not parse 14 unique teams from paste. Parsed ${top14.length}: ${top14.join(", ")}`,
        };
    }

    return { ok: true, top14 };
}

function normalizeTeamAbbrev(value) {
    const up = String(value || "").toUpperCase();
    if (up === "NOP") {
        return "NO";
    }
    if (up === "GS") {
        return "GSW";
    }
    return up;
}

function normalizeForMatching(value) {
    return String(value || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
    refs.togglePasteBtn.disabled = running;
    refs.parseStandingsBtn.disabled = running;
    refs.useStandingsBtn.disabled = running || !Array.isArray(state.parsedCandidate);
    refs.readClipboardBtn.disabled = running;
    refs.clearPasteBtn.disabled = running;
    refs.revertOverrideBtn.disabled = running;

    if (!running) {
        stopWorker();
    }

    updateRunAvailability();
}

function updateRunAvailability() {
    refs.runBtn.disabled = state.running || !state.teamsReady || !Array.isArray(getActiveTop14());
    refs.useStandingsBtn.disabled = state.running || !Array.isArray(state.parsedCandidate);
}


