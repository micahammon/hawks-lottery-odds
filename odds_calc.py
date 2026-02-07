import argparse
import random
import re
import sys
from collections import Counter, defaultdict

TEAM_ALIASES = {
    "Atlanta": ["Atlanta", "Atlanta Hawks"],
    "Boston": ["Boston", "Boston Celtics"],
    "Brooklyn": ["Brooklyn", "Brooklyn Nets"],
    "Charlotte": ["Charlotte", "Charlotte Hornets"],
    "Chicago": ["Chicago", "Chicago Bulls"],
    "Cleveland": ["Cleveland", "Cleveland Cavaliers"],
    "Dallas": ["Dallas", "Dallas Mavericks"],
    "Denver": ["Denver", "Denver Nuggets"],
    "Detroit": ["Detroit", "Detroit Pistons"],
    "Golden State": ["Golden State", "Golden State Warriors"],
    "Houston": ["Houston", "Houston Rockets"],
    "Indiana": ["Indiana", "Indiana Pacers"],
    "LA Clippers": ["LA Clippers", "Los Angeles Clippers", "L.A. Clippers"],
    "LA Lakers": ["LA Lakers", "Los Angeles Lakers", "L.A. Lakers"],
    "Memphis": ["Memphis", "Memphis Grizzlies"],
    "Miami": ["Miami", "Miami Heat"],
    "Milwaukee": ["Milwaukee", "Milwaukee Bucks"],
    "Minnesota": ["Minnesota", "Minnesota Timberwolves"],
    "New Orleans": ["New Orleans", "New Orleans Pelicans"],
    "New York": ["New York", "New York Knicks", "NY Knicks", "N.Y. Knicks"],
    "Oklahoma City": ["Oklahoma City", "Oklahoma City Thunder", "OKC Thunder"],
    "Orlando": ["Orlando", "Orlando Magic"],
    "Philadelphia": ["Philadelphia", "Philadelphia 76ers", "Philadelphia Sixers"],
    "Phoenix": ["Phoenix", "Phoenix Suns"],
    "Portland": ["Portland", "Portland Trail Blazers"],
    "Sacramento": ["Sacramento", "Sacramento Kings"],
    "San Antonio": ["San Antonio", "San Antonio Spurs"],
    "Toronto": ["Toronto", "Toronto Raptors"],
    "Utah": ["Utah", "Utah Jazz"],
    "Washington": ["Washington", "Washington Wizards"],
}

ALIAS_TO_CANONICAL = {
    alias.lower(): canonical
    for canonical, aliases in TEAM_ALIASES.items()
    for alias in aliases
}

TEAM_PATTERN = re.compile(
    "|".join(sorted((re.escape(a) for a in ALIAS_TO_CANONICAL), key=len, reverse=True)),
    re.IGNORECASE,
)

def parse_teams_from_paste(paste_text):
    matches = []
    seen = set()
    for match in TEAM_PATTERN.finditer(paste_text or ""):
        canonical = ALIAS_TO_CANONICAL[match.group(0).lower()]
        if canonical in seen:
            continue
        seen.add(canonical)
        matches.append(canonical)
        if len(matches) == 14:
            break
    if len(matches) != 14:
        raise ValueError(
            f"Expected 14 teams, parsed {len(matches)}. Parsed: {matches}"
        )
    return matches

def prompt_for_paste():
    print("Paste standings text (type END on its own line to finish).")
    print("Leave blank to keep existing standings.")
    first_line = sys.stdin.readline()
    if first_line == "":
        return None
    if first_line.strip() == "":
        return ""
    if first_line.strip() == "END":
        return ""
    lines = [first_line]
    while True:
        line = sys.stdin.readline()
        if line == "":
            break
        if line.strip() == "END":
            break
        lines.append(line)
    return "".join(lines)

def weighted_sample_without_replacement(items, weights, k, rng=random):
    """
    Efraimidis–Spirakis algorithm: exact weighted sampling without replacement.
    items: list of objects
    weights: list of positive numbers (e.g., NBA combo counts)
    k: number to sample
    returns: list of k sampled items
    """
    keys = []
    for item, w in zip(items, weights):
        if w <= 0:
            continue
        # draw u in (0,1], compute key = u^(1/w); keep largest keys
        u = rng.random()
        while u == 0.0:
            u = rng.random()
        key = u ** (1.0 / w)
        keys.append((key, item))
    keys.sort(reverse=True, key=lambda x: x[0])
    return [item for _, item in keys[:k]]

def simulate_nba_lottery_once(teams_in_order, combos_in_order, rng=random):
    """
    Simulate one NBA lottery.
    teams_in_order: list of 14 team names in pre-lottery order (worst -> best)
    combos_in_order: list of 14 integers, total should be 1000 (NBA standard)
    Returns: dict team -> final pick number (1..14)
    """
    assert len(teams_in_order) == 14
    assert len(combos_in_order) == 14
    assert sum(combos_in_order) == 1000, "Combo counts should sum to 1000."

    # Top 4 are lottery winners sampled w/o replacement by combo weights
    winners = weighted_sample_without_replacement(teams_in_order, combos_in_order, k=4, rng=rng)

    # Assign picks 1-4 in the order drawn
    pick_list = winners[:]  # pick 1..4

    # Remaining picks 5-14 go by pre-lottery order among non-winners
    remaining = [t for t in teams_in_order if t not in winners]
    pick_list.extend(remaining)  # now length 14, pick_list[i] is team at pick i+1

    # Build team->pick mapping
    team_to_pick = {team: i + 1 for i, team in enumerate(pick_list)}
    return team_to_pick

def run_hawks_best_of_two_sim(
    teams_in_order,
    combos_in_order,
    pelicans_name="New Orleans",
    bucks_name="Milwaukee",
    n_sims=1_000_000,
    seed=1
):
    rng = random.Random(seed)

    hawks_pick_counter = Counter()
    hawks_top4 = 0
    hawks_top3 = 0
    hawks_no1 = 0

    # Also track the "worse pick" that goes to Bucks in your description (max)
    bucks_received_counter = Counter()

    for _ in range(n_sims):
        team_to_pick = simulate_nba_lottery_once(teams_in_order, combos_in_order, rng=rng)
        P = team_to_pick[pelicans_name]
        B = team_to_pick[bucks_name]

        hawks_pick = min(P, B)   # Hawks get better
        bucks_received = max(P, B)  # Bucks get worse (per your swap framing)

        hawks_pick_counter[hawks_pick] += 1
        bucks_received_counter[bucks_received] += 1

        if hawks_pick <= 4:
            hawks_top4 += 1
        if hawks_pick <= 3:
            hawks_top3 += 1
        if hawks_pick == 1:
            hawks_no1 += 1

    # Convert to probabilities
    hawks_pick_probs = {k: v / n_sims for k, v in sorted(hawks_pick_counter.items())}
    bucks_received_probs = {k: v / n_sims for k, v in sorted(bucks_received_counter.items())}

    hawks_worst = worst_possible_pick_best_of_two_from_order(
        teams_in_order,
        team_a="New Orleans",
        team_b="Milwaukee"
    )

    results = {
        "hawks_worst_prob": hawks_worst,
        "hawks_top4_prob": hawks_top4 / n_sims,
        "hawks_top3_prob": hawks_top3 / n_sims,
        "hawks_1overall_prob": hawks_no1 / n_sims,
        "hawks_pick_distribution": hawks_pick_probs,
        "bucks_received_distribution": bucks_received_probs,
        "n_sims": n_sims,
        "seed": seed,
    }
    return results

def worst_possible_pick_best_of_two_from_order(
    teams_in_order,
    team_a,
    team_b,
    lottery_draws=4
):
    """
    teams_in_order: list of 14 teams in pre-lottery order (index 0 = worst record)
    team_a, team_b: team names (strings)
    lottery_draws: number of lottery picks drawn (NBA = 4)

    Returns: worst possible pick Hawks could get when receiving the better of the two
    """

    lottery_teams = len(teams_in_order)

    # ranks are index + 1
    rank_a = teams_in_order.index(team_a) + 1
    rank_b = teams_in_order.index(team_b) + 1

    def worst_final_pick(rank):
        return min(lottery_teams, rank + lottery_draws)

    return min(worst_final_pick(rank_a), worst_final_pick(rank_b))


# -------------------------
# HOW TO USE:
# 1) Fill teams_in_order (worst -> best among the 14 lottery teams)
# 2) Fill combos_in_order (their NBA combo counts; must sum to 1000)
# 3) Run and read results
# -------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Simulate NBA lottery odds with optional paste parsing."
    )
    parser.add_argument(
        "--teams-paste",
        help="Paste website text as a single argument to infer the 14 lottery teams.",
    )
    parser.add_argument(
        "--teams-stdin",
        action="store_true",
        help="Read pasted website text from stdin to infer the 14 lottery teams.",
    )
    parser.add_argument(
        "--teams-prompt",
        action="store_true",
        help="Prompt for pasted website text (blank keeps current standings).",
    )
    args = parser.parse_args()

    if sum([bool(args.teams_paste), bool(args.teams_stdin), bool(args.teams_prompt)]) > 1:
        parser.error("Use only one of --teams-paste, --teams-stdin, or --teams-prompt.")

    # Replace with the actual 14 lottery teams in order.
    teams_in_order = [
        "Sacramento",
        "Indiana",
        "Washington",
        "Brooklyn",
        "New Orleans",
        "Utah",
        "Memphis",
        "Milwaukee",
        "Dallas",
        "Charlotte",
        "LA Clippers",
        "Portland",
        "Chicago",
        "Atlanta",
    ]

    if args.teams_paste or args.teams_stdin or args.teams_prompt:
        if args.teams_stdin:
            if sys.stdin.isatty():
                print("Paste the standings text, then press Ctrl+Z and Enter.")
            pasted_text = sys.stdin.read()
        elif args.teams_prompt:
            pasted_text = prompt_for_paste()
        else:
            pasted_text = args.teams_paste
        if pasted_text:
            teams_in_order = parse_teams_from_paste(pasted_text)
    elif sys.stdin.isatty():
        pasted_text = prompt_for_paste()
        if pasted_text:
            teams_in_order = parse_teams_from_paste(pasted_text)


    combos_in_order = [
        # PLACEHOLDERS — replace with actual combo counts that sum to 1000.
        # NBA publishes these (e.g., worst teams often 140 combos, etc.).
        140, 140, 140, 125,
        105, 90, 75, 60,
        45, 30, 20, 15,
        10, 5
    ]

    results = run_hawks_best_of_two_sim(
        teams_in_order,
        combos_in_order,
        pelicans_name="New Orleans",
        bucks_name="Milwaukee",
        n_sims=1_000_000,
        seed=42
    )

    print("Hawks worst possible:", results["hawks_worst_prob"])
    print("Hawks top-4 probability:", results["hawks_top4_prob"])
    print("Hawks top-3 probability:", results["hawks_top3_prob"])
    print("Hawks #1 overall probability:", results["hawks_1overall_prob"])
    print("Hawks pick distribution (pick:prob):")
    for k, p in results["hawks_pick_distribution"].items():
        print(k, p)

input("\nPress Enter to close...")
