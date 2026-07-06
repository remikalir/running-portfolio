#!/usr/bin/env python3
"""
build_data.py — Generate src/data.js from the Garmin export.

Run:  python3 tools/build_data.py
Emits: src/data.js  (AUTO-GENERATED numeric data — do not hand-edit)

Authored content (race narratives, home-base notes, photos, the About essay)
lives in src/content.js and is NEVER touched by this script. That separation is
deliberate: numbers regenerate every quarter; Remi's words do not.

Definition of a run and unit conversions: see parse_garmin.py.
Location resolution: see locations.py.
"""
import sys, os, json
from datetime import datetime, timezone
from collections import defaultdict

sys.path.insert(0, os.path.dirname(__file__))
from parse_garmin import load_runs, local_dt, miles, hours, pace_min_per_mi
from locations import resolve_place, ASSIGN_KM

OUT = os.path.join(os.path.dirname(__file__), "..", "src", "data.js")

US_STATE_SET = {
    "Colorado", "North Carolina", "Massachusetts", "California", "Delaware",
    "New York", "Maryland", "Illinois", "Michigan", "Missouri", "Rhode Island",
    "Pennsylvania", "Tennessee", "Kentucky", "Virginia", "Texas", "New Mexico",
}

# Locked personal records (official race times for marathon/half; training PRs for 5K/mile)
PRS = {"pr5k": "16:53", "prHalf": "1:18:55", "prMarathon": "2:59:27", "prMile": "5:20"}
CURRENT_VO2 = 64

# Home-base chapters: (display name, date label, resolved-city key, start, end)
HOME_BASES = [
    ("Denver, CO", "2016–2024", "Denver", datetime(2016, 12, 1, tzinfo=timezone.utc), datetime(2024, 7, 9, tzinfo=timezone.utc)),
    ("Cambridge, MA", "Aug 2022–Jun 2023", "Cambridge", datetime(2022, 8, 1, tzinfo=timezone.utc), datetime(2023, 6, 30, tzinfo=timezone.utc)),
    ("Winston-Salem, NC", "Jul 2024–present", "Winston-Salem", datetime(2024, 7, 10, tzinfo=timezone.utc), datetime(2100, 1, 1, tzinfo=timezone.utc)),
]

N_LOCATION_ROWS = 15  # city rows shown before the "+N more" line


def pace_str(min_per_mi):
    m = int(min_per_mi)
    return f"{m}:{int(round((min_per_mi - m) * 60)):02d}"


def main():
    runs = load_runs()

    # ---- resolve geography once ----
    for a in runs:
        a["_place"] = resolve_place(a.get("startLatitude"), a.get("startLongitude"), a.get("locationName"))

    # ---- summary ----
    tot_runs = len(runs)
    tot_miles = sum(miles(a) for a in runs)
    tot_hours = sum(hours(a) for a in runs)
    d0, d1 = local_dt(runs[0]), local_dt(runs[-1])
    weeks = (d1 - d0).days / 7.0
    avg_week = round(tot_runs / weeks, 1)

    # ---- geography aggregates ----
    city = defaultdict(lambda: [0, 0.0])
    state = defaultdict(lambda: [0, 0.0])
    state_cities = defaultdict(lambda: defaultdict(int))
    country = defaultdict(lambda: [0, 0.0, set()])
    for a in runs:
        p = a["_place"]
        if not p or p[3] > ASSIGN_KM:
            continue
        c, st, co, _ = p
        city[(c, st, co)][0] += 1; city[(c, st, co)][1] += miles(a)
        state[st][0] += 1; state[st][1] += miles(a)
        state_cities[st][c] += 1
        country[co][0] += 1; country[co][1] += miles(a); country[co][2].add(c)

    us_cities = sum(1 for (c, st, co) in city if co == "United States")
    total_cities = len(city)
    us_states = sorted([s for s in state if s in US_STATE_SET],
                       key=lambda s: -state[s][1])

    # usStatesMap (choropleth) + usStates rows
    us_states_map = {s: {"runs": state[s][0], "mi": round(state[s][1])} for s in us_states}
    us_states_rows = []
    for s in us_states:
        cities_sorted = sorted(state_cities[s].items(), key=lambda x: (-x[1], -city[(x[0], s, 'United States')][1]))
        top = ", ".join(c for c, _ in cities_sorted[:5])
        us_states_rows.append({"name": s, "runs": state[s][0], "mi": round(state[s][1]), "cities": top})

    # locations (city rows, by runs)
    loc_sorted = sorted(city.items(), key=lambda x: -x[1][0])
    locations = [{"name": c, "runs": v[0], "mi": round(v[1])} for (c, st, co), v in loc_sorted[:N_LOCATION_ROWS]]
    more_cities = total_cities - N_LOCATION_ROWS

    # countries (fixed display order, city detail)
    order = ["United States", "Canada", "Ireland", "China"]
    countries = []
    for co in order:
        v = country[co]
        if co == "United States":
            detail = f"{len(us_states)} states, {us_cities} cities"
        else:
            # order foreign cities by miles desc
            cs = sorted(v[2], key=lambda c: -city[(c, [k[1] for k in city if k[0] == c][0], co)][1])
            detail = ", ".join(cs)
        countries.append({"name": co, "runs": v[0], "mi": round(v[1]), "detail": detail})

    # ---- yearly ----
    yr = defaultdict(lambda: [0, 0.0, 0.0])
    for a in runs:
        y = local_dt(a).year
        yr[y][0] += 1; yr[y][1] += miles(a); yr[y][2] += a.get("duration", 0) / 60000.0
    yearly = []
    for y in sorted(yr):
        r, mi, tmin = yr[y]
        pn = tmin / mi if mi else 0
        yearly.append({"year": y, "runs": r, "miles": round(mi), "pace": pace_str(pn), "paceN": round(pn, 2)})

    # ---- monthly ----
    mo = defaultdict(float)
    for a in runs:
        dt = local_dt(a)
        mo[f"{dt.year}-{dt.month:02d}"] += miles(a)
    monthly = [{"m": k, "mi": round(v)} for k, v in sorted(mo.items())]

    # ---- pace distribution (all runs; label = [label, label+0:30) ) ----
    labels = ["5:00", "5:30", "6:00", "6:30", "7:00", "7:30", "8:00", "8:30", "9:00", "9:30", "10:00+"]
    edges = [5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0]
    counts = defaultdict(int)
    for a in runs:
        p = pace_min_per_mi(a)
        if p is None:
            continue
        idx = 0
        while idx < len(edges) and p >= edges[idx]:
            idx += 1
        counts[labels[idx]] += 1
    paces = [{"p": l, "c": counts[l]} for l in labels]

    # ---- weekday ----
    names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    wd = defaultdict(lambda: [0, 0.0])
    for a in runs:
        wd[local_dt(a).weekday()][0] += 1
        wd[local_dt(a).weekday()][1] += miles(a)
    weekday = [{"d": names[i], "r": wd[i][0], "mi": round(wd[i][1])} for i in range(7)]

    # ---- VO2 quarterly (last reading each quarter), last 12 ----
    vo = sorted((local_dt(a), a["vO2MaxValue"]) for a in runs if a.get("vO2MaxValue"))
    q = {}
    for dt, v in vo:
        q[f"{dt.year}-{((dt.month - 1) // 3) * 3 + 1:02d}"] = v
    vo2 = [{"d": k, "v": round(v, 1)} for k, v in sorted(q.items())][-12:]

    # ---- biomechanics per year ----
    bio_agg = defaultdict(lambda: [0, 0.0, 0.0])
    for a in runs:
        c, s = a.get("avgRunCadence"), a.get("avgStrideLength")
        if c and s:
            y = local_dt(a).year
            bio_agg[y][0] += 1; bio_agg[y][1] += c; bio_agg[y][2] += s
    bio = [{"y": y, "c": round(v[1] / v[0], 1), "s": round(v[2] / v[0] / 100, 2)} for y, v in sorted(bio_agg.items())]

    # ---- home bases (city-based within residence period) ----
    homes = []
    for name, dates, key, start, end in HOME_BASES:
        sel = [a for a in runs if start <= local_dt(a) <= end and a["_place"] and a["_place"][0] == key]
        r = len(sel); mi = sum(miles(a) for a in sel)
        tmin = sum(a.get("duration", 0) / 60000.0 for a in sel)
        homes.append({"name": name, "dates": dates, "runs": r, "miles": round(mi), "pace": pace_str(tmin / mi) if mi else "-"})

    # ---- records ----
    def clean_name(a):
        nm = (a.get("name") or "").strip()
        if nm.endswith("Running") or nm.endswith("Track Running"):
            return "Long run"
        nm = nm.replace("2026 ", "").replace("2025 ", "")
        return nm
    longest = []
    for a in sorted(runs, key=lambda x: -miles(x))[:6]:
        longest.append({"date": local_dt(a).date().isoformat(), "name": clean_name(a),
                        "mi": round(miles(a), 1), "pace": pace_str(pace_min_per_mi(a))})
    # fastest sustained efforts >= 4 mi (match prototype's short-effort intent)
    elig = [a for a in runs if miles(a) >= 3.1]  # 5K+ (label says '5K+ distance')
    fastest = []
    for a in sorted(elig, key=lambda x: pace_min_per_mi(x))[:6]:
        fastest.append({"date": local_dt(a).date().isoformat(),
                        "mi": round(miles(a), 1), "pace": pace_str(pace_min_per_mi(a))})

    summary = {
        "totalRuns": tot_runs, "totalMiles": round(tot_miles), "totalHours": round(tot_hours),
        **PRS, "vo2": CURRENT_VO2, "avgPerWeek": avg_week,
        "countries": len(country), "usStates": len(us_states), "cities": total_cities,
    }

    DATA = {
        "summary": summary, "yearly": yearly, "monthly": monthly, "paces": paces,
        "weekday": weekday, "vo2": vo2, "bio": bio, "homes": homes, "locations": locations,
        "moreCities": more_cities, "usStatesMap": us_states_map, "usStates": us_states_rows,
        "longest": longest, "fastest": fastest, "countries": countries,
        "span": {"start": d0.date().isoformat(), "end": d1.date().isoformat()},
    }

    body = json.dumps(DATA, indent=2)
    header = ("// AUTO-GENERATED by tools/build_data.py — do not hand-edit.\n"
              "// Regenerate after a new Garmin export: python3 tools/build_data.py\n"
              f"// Generated {datetime.now().date().isoformat()} from export through {d1.date().isoformat()}.\n\n"
              "export const DATA = ")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        f.write(header + body + ";\n")
    print(f"Wrote {OUT}")
    print(f"  {tot_runs} runs, {round(tot_miles)} mi, {round(tot_hours)} hrs, {d0.date()}..{d1.date()}")
    print(f"  {len(us_states)} US states, {us_cities} US cities, {total_cities} total cities, {len(country)} countries")


if __name__ == "__main__":
    main()
