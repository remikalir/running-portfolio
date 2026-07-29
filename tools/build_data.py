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
from datetime import datetime, timezone, timedelta
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

# Official race results that OVERRIDE the device-derived split for a given
# activity. Data-integrity hierarchy: an official chip result outranks Garmin's
# own recording, so where a run has one, we stamp the official time/pace rather
# than re-deriving from the export. Keyed by Garmin activityId (str).
OFFICIAL_RESULTS = {
    "17710808922": {"time": "1:18:55", "pace": "6:01"},  # 2024 Mistletoe Run — official half PR
}

# Home-base chapters: (display name, date label, resolved-city key, start, end)
HOME_BASES = [
    ("Denver, CO", "2016–2024", "Denver", datetime(2016, 12, 1, tzinfo=timezone.utc), datetime(2024, 7, 9, tzinfo=timezone.utc)),
    ("Cambridge, MA", "Aug 2022–Jun 2023", "Cambridge", datetime(2022, 8, 1, tzinfo=timezone.utc), datetime(2023, 6, 30, tzinfo=timezone.utc)),
    ("Winston-Salem, NC", "Jul 2024–present", "Winston-Salem", datetime(2024, 7, 10, tzinfo=timezone.utc), datetime(2100, 1, 1, tzinfo=timezone.utc)),
]

N_LOCATION_ROWS = 15  # city rows shown before the "+N more" line

# Featured races: (content.js id, race date). The six-week training build for
# each is COMPUTED from real runs here — not hand-authored — so run counts and
# weekly mileage are honest. Weeks are Mon–Sun; -6..-1 are the six full weeks
# before race week.
RACES = [
    ("asheville",   datetime(2026, 3, 21, tzinfo=timezone.utc), "22249863855"),
    ("fonta-flora", datetime(2025, 10, 25, tzinfo=timezone.utc), "20795217749"),
    ("mistletoe",   datetime(2024, 12, 7, tzinfo=timezone.utc), "17710808922"),
    ("salem-lake",  datetime(2024, 9, 28, tzinfo=timezone.utc), "17152917951"),
]


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
    city_coord = defaultdict(lambda: [0.0, 0.0, 0])  # sum lat, sum lng, n (mean = representative point)
    state = defaultdict(lambda: [0, 0.0])
    state_cities = defaultdict(lambda: defaultdict(int))
    country = defaultdict(lambda: [0, 0.0, set()])
    for a in runs:
        p = a["_place"]
        if not p or p[3] > ASSIGN_KM:
            continue
        c, st, co, _ = p
        city[(c, st, co)][0] += 1; city[(c, st, co)][1] += miles(a)
        lat, lng = a.get("startLatitude"), a.get("startLongitude")
        if lat is not None and lng is not None:
            cc = city_coord[(c, st, co)]
            cc[0] += lat; cc[1] += lng; cc[2] += 1
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

    # geo — every resolved city with a representative (mean) coordinate, for the
    # anchor-and-spread atlas. Positioning is pipeline truth; content.js curates
    # which of these places the atlas features and labels.
    geo = []
    for (c, st, co), v in loc_sorted:
        cc = city_coord[(c, st, co)]
        if cc[2] == 0:
            continue
        geo.append({"name": c, "runs": v[0], "mi": round(v[1]), "country": co,
                    "lat": round(cc[0] / cc[2], 4), "lng": round(cc[1] / cc[2], 4)})

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

    # ---- pace distribution (all runs; 15-second bins, label = [label, label+0:15) ) ----
    # Finer than the original 30-second bins: resolves the dominant 6:00 cluster
    # into a 6:00 -> 6:15 -> 6:30 gradient. "10:00+" is the slow catch-all;
    # anything faster than 5:00 folds into the first bin.
    PACE_BIN = 0.25              # 15 seconds, in minutes
    PACE_LO, PACE_HI = 5.0, 10.0  # discrete bins span [5:00, 10:00); 10:00+ catches the rest
    n_bins = int(round((PACE_HI - PACE_LO) / PACE_BIN))
    labels = [pace_str(PACE_LO + i * PACE_BIN) for i in range(n_bins)] + ["10:00+"]

    def pace_bin(p):
        if p >= PACE_HI:
            return "10:00+"
        idx = int((max(p, PACE_LO) - PACE_LO) / PACE_BIN)
        return labels[min(max(idx, 0), n_bins - 1)]

    counts = defaultdict(int)
    year_counts = defaultdict(lambda: defaultdict(int))
    for a in runs:
        p = pace_min_per_mi(a)
        if p is None:
            continue
        b = pace_bin(p)
        counts[b] += 1
        year_counts[local_dt(a).year][b] += 1
    paces = [{"p": l, "c": counts[l]} for l in labels]

    # per-year pace distribution (same 15-second bins, aligned to `labels`) for the
    # Mileage small-multiples — one shape per year on a constant pace axis.
    pace_by_year = [{"year": y, "c": [year_counts[y][l] for l in labels]}
                    for y in sorted(year_counts)]

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
        coords = [(a.get("startLatitude"), a.get("startLongitude")) for a in sel
                  if a.get("startLatitude") is not None and a.get("startLongitude") is not None]
        home = {"name": name, "dates": dates, "runs": r, "miles": round(mi), "pace": pace_str(tmin / mi) if mi else "-"}
        if coords:
            home["lat"] = round(sum(c[0] for c in coords) / len(coords), 4)
            home["lng"] = round(sum(c[1] for c in coords) / len(coords), 4)
        homes.append(home)

    # ---- featured-race training builds (COMPUTED from real runs, Mon–Sun weeks) ----
    def week_monday(d):
        m = d - timedelta(days=d.weekday())
        return m.replace(hour=0, minute=0, second=0, microsecond=0)

    training = {}
    for rid, rdate, _aid in RACES:
        rmon = week_monday(rdate)
        weeks = []
        for k in range(6, 0, -1):  # -6 .. -1: the six full weeks before race week
            wstart = rmon - timedelta(weeks=k)
            wend = wstart + timedelta(days=7)
            sel = [a for a in runs if wstart <= local_dt(a) < wend]
            weeks.append({"w": f"-{k}", "r": len(sel), "mi": round(sum(miles(a) for a in sel))})
        training[rid] = weeks

    # ---- featured-race metrics (COMPUTED from each race's Garmin activity) ----
    # Every displayed measurement traces to the activity record; content.js holds
    # only the authored words + the official race header (distance/time/pace).
    def pace_floor(min_per_mi):
        return f"{int(min_per_mi)}:{int((min_per_mi - int(min_per_mi)) * 60):02d}"

    def group_hr_zones(a):
        # Garmin hrTimeInZone_0..6 (ms). Drop zone 0 (below zone 1); show zones
        # >=4% individually, group the leading small zones into "Zone n–m".
        mins = {i: (a.get(f"hrTimeInZone_{i}") or 0) / 60000.0 for i in range(1, 7)}
        mins = {i: v for i, v in mins.items() if v > 0.01}
        total = sum(mins.values())
        if total <= 0:
            return []
        out, low = [], []
        for i in range(1, 7):
            if i not in mins:
                continue
            pct = mins[i] / total * 100
            if pct < 4.0:
                low.append(i)
            else:
                if low:
                    lm = sum(mins[j] for j in low)
                    out.append({"z": f"Zone {low[0]}–{low[-1]}" if low[-1] > low[0] else f"Zone {low[0]}",
                                "min": round(lm, 1), "pct": round(lm / total * 100)})
                    low = []
                out.append({"z": f"Zone {i}", "min": round(mins[i], 1), "pct": round(pct)})
        if low:
            lm = sum(mins[j] for j in low)
            out.append({"z": f"Zone {low[0]}–{low[-1]}" if low[-1] > low[0] else f"Zone {low[0]}",
                        "min": round(lm, 1), "pct": round(lm / total * 100)})
        return out

    by_actid = {str(a.get("activityId")): a for a in runs}
    featured_metrics = {}
    for rid, rdate, aid in RACES:
        a = by_actid.get(str(aid))
        if not a:
            continue
        aer = a.get("aerobicTrainingEffect") or 0
        anaer = a.get("anaerobicTrainingEffect") or 0
        m = {
            "elevGain": round(a.get("elevationGain", 0) * 0.0328084),
            "elevLoss": round(a.get("elevationLoss", 0) * 0.0328084),
            "hr": (f"{int(a['avgHr'])} avg / {int(a['maxHr'])} max" if a.get("avgHr") is not None else None),
            "cadence": (f"{int(round(a['avgRunCadence']))} spm" if a.get("avgRunCadence") else None),
            "stride": (f"{a['avgStrideLength'] / 100:.2f} m" if a.get("avgStrideLength") else None),
            "steps": (f"{int(a['steps']):,}" if a.get("steps") else None),
            "calories": (f"{int(round(a['calories'])):,}" if a.get("calories") else None),
            "te": (f"{aer:.1f} aer / {anaer:.1f} anaer" if anaer > 1.0 else f"{aer:.1f} aerobic"),
            "vo2": (str(int(a["vO2MaxValue"])) if a.get("vO2MaxValue") else None),
            "maxPace": (pace_floor(1609.344 / (a["maxSpeed"] * 10) / 60) if a.get("maxSpeed") else None),
            "hrZones": group_hr_zones(a),
        }
        featured_metrics[rid] = m

    # ---- half-marathon PR progression (fastest 13.0–13.4 mi runs, by record time) ----
    def to_hms(sec):
        sec = round(sec)
        return f"{sec // 3600}:{(sec % 3600) // 60:02d}:{sec % 60:02d}"
    halfs = sorted((a for a in runs if 13.0 <= miles(a) <= 13.4), key=lambda a: a.get("duration", 1e18))
    half_progression = []
    for a in halfs[:5]:
        mi = miles(a)
        pmin = (a.get("duration", 0) / 60000.0) / mi if mi else 0
        official = OFFICIAL_RESULTS.get(str(a.get("activityId")))
        half_progression.append({
            "date": local_dt(a).date().isoformat(),
            "time": official["time"] if official else to_hms(a.get("duration", 0) / 1000),
            "pace": official["pace"] if official else pace_floor(pmin),
            "loc": (a["_place"][0] if a.get("_place") else ""),
            "pr": len(half_progression) == 0,
        })

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
        "paceByYear": pace_by_year,
        "weekday": weekday, "vo2": vo2, "bio": bio, "homes": homes, "locations": locations,
        "geo": geo,
        "moreCities": more_cities, "usStatesMap": us_states_map, "usStates": us_states_rows,
        "longest": longest, "fastest": fastest, "countries": countries,
        "training": training, "featuredMetrics": featured_metrics, "halfProgression": half_progression,
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
