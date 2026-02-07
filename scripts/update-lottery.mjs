import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function extractTop14Abbrevs(html) {
    const $ = load(html);


    const rows =
        $("table.draft-board tr.pick-row.pick-row-lottery").toArray().length
            ? $("table.draft-board tr.pick-row.pick-row-lottery").toArray()
            : $("table.draft-board tr.pick-row-lottery").toArray();

    if (rows.length < 14) {
        throw new Error(`Could not find 14 lottery rows. Found ${rows.length}.`);
    }

    return rows.slice(0, 14).map((row) => {
        const abbr = $(row).find("td.name .team-link .mobile").first().text().trim();
        if (!abbr) throw new Error("Failed to extract team abbreviation from a row.");
        return abbr;
    });
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

    const top14 = extractTop14Abbrevs(html);

    const out = {
        source: sourceUrl,
        fetched_at_utc: new Date().toISOString(),
        lottery_top14: top14,
    };

    const toolRoot = path.resolve(__dirname, "..");
    const outDir = path.join(toolRoot, "data");
    const outPath = path.join(outDir, "lottery.json");

    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");

    console.log(`Wrote ${outPath}`);
    console.log(`Top14: ${top14.join(", ")}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
