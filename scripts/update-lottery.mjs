import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_COMBOS_IN_ORDER = [140, 140, 140, 125, 105, 90, 75, 60, 45, 30, 20, 15, 10, 5];

const CANDIDATE_URLS = ["https://tankathon.com/", "https://tankathon.com/nba"];

async function fetchHtml(url) {
    const res = await fetch(url, {
        headers: {
            "user-agent":
                "Mozilla/5.0 (compatible; GH-Actions-LotteryBot/1.0; +https://github.com/)",
            accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
    return await res.text();
}

function normalizeTeamAbbrev(value) {
    const up = String(value || "").trim().toUpperCase();
    if (up === "NOP") return "NO";
    if (up === "GS") return "GSW";
    if (up === "SAS") return "SA";
    if (up === "NYK") return "NY";
    return up;
}

function extractTop14Rows(html) {
    const $ = load(html);

    const rows =
        $("table.draft-board tr.pick-row.pick-row-lottery").toArray().length
            ? $("table.draft-board tr.pick-row.pick-row-lottery").toArray()
            : $("table.draft-board tr.pick-row-lottery").toArray();

    if (rows.length < 14) {
        throw new Error(`Could not find 14 lottery rows. Found ${rows.length}.`);
    }

    return rows.slice(0, 14).map((row) => {
        const abbr = normalizeTeamAbbrev($(row).find("td.name .team-link .mobile").first().text().trim());
        if (!abbr) throw new Error("Failed to extract team abbreviation from a row.");
        const recordParts = $(row).find("td.record .number").toArray().map((node) => $(node).text().trim());
        if (recordParts.length < 2) {
            throw new Error(`Failed to extract record for ${abbr}.`);
        }

        return {
            team: abbr,
            record: `${recordParts[0]}-${recordParts[1]}`,
        };
    });
}

function buildTieAdjustedWeights(rows) {
    const weights = [];
    let start = 0;

    while (start < rows.length) {
        let end = start + 1;
        while (end < rows.length && rows[end].record === rows[start].record) {
            end += 1;
        }

        const slots = BASE_COMBOS_IN_ORDER.slice(start, end);
        const averageWeight = slots.reduce((sum, value) => sum + value, 0) / slots.length;

        for (let i = start; i < end; i += 1) {
            weights.push(averageWeight);
        }
        start = end;
    }

    return weights;
}

function hasSameLotterySnapshot(prev, next) {
    if (!prev || !next) return false;
    if (prev.source !== next.source) return false;
    if (!Array.isArray(prev.lottery_top14) || !Array.isArray(next.lottery_top14)) return false;
    if (prev.lottery_top14.length !== next.lottery_top14.length) return false;
    if (!prev.lottery_top14.every((abbr, idx) => abbr === next.lottery_top14[idx])) return false;
    if (!Array.isArray(prev.lottery_weights) || !Array.isArray(next.lottery_weights)) return false;
    if (prev.lottery_weights.length !== next.lottery_weights.length) return false;
    return prev.lottery_weights.every((weight, idx) => weight === next.lottery_weights[idx]);
}

async function main() {
    let html = null;
    let sourceUrl = null;
    let lastErr = null;

    for (const url of CANDIDATE_URLS) {
        try {
            html = await fetchHtml(url);
            sourceUrl = url;
            break;
        } catch (e) {
            lastErr = e;
        }
    }
    if (!html) throw new Error(`All fetch attempts failed. Last error: ${lastErr}`);

    const top14Rows = extractTop14Rows(html);
    const top14 = top14Rows.map((row) => row.team);
    const lotteryWeights = buildTieAdjustedWeights(top14Rows);

    const out = {
        source: sourceUrl,
        fetched_at_utc: new Date().toISOString(),
        lottery_top14: top14,
        lottery_weights: lotteryWeights,
    };

    const toolRoot = path.resolve(__dirname, "..");
    const outDir = path.join(toolRoot, "data");
    const outPath = path.join(outDir, "lottery.json");

    await fs.mkdir(outDir, { recursive: true });
    try {
        const prevRaw = await fs.readFile(outPath, "utf8");
        const prev = JSON.parse(prevRaw);
        if (hasSameLotterySnapshot(prev, out)) {
            console.log(`No changes detected. Kept existing ${outPath}`);
            console.log(`Top14: ${top14.join(", ")}`);
            console.log(`Weights: ${lotteryWeights.join(", ")}`);
            return;
        }
    } catch {
        // Continue and write file when there is no prior file or it can't be parsed.
    }

    await fs.writeFile(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");

    console.log(`Wrote ${outPath}`);
    console.log(`Top14: ${top14.join(", ")}`);
    console.log(`Weights: ${lotteryWeights.join(", ")}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
